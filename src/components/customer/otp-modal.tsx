'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { ShieldCheck, Mail, AlertCircle, RefreshCw, CheckCircle2, X, Clock } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDestination: string; // email or phone
  onVerifySuccess: () => void;
  title?: string;
  initialOtpCode?: string;
}

export function OtpModal({
  isOpen,
  onClose,
  targetDestination,
  onVerifySuccess,
  title,
  initialOtpCode,
}: OtpModalProps) {
  const { language } = useLanguage();
  const modalTitle = title || (language === 'EN' ? '2-Step Verification (OTP)' : language === 'MS' ? 'Pengesahan 2-Langkah (OTP)' : 'Verifikasi 2 Langkah (OTP)');

  const [generatedCode, setGeneratedCode] = useState(initialOtpCode || '');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [totalTimer, setTotalTimer] = useState(600); // 10 Minutes = 600 seconds
  const [resendCooldown, setResendCooldown] = useState(60); // 60 Seconds cooldown for Resend button
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [sendStatusMessage, setSendStatusMessage] = useState('');

  // Generate 6-digit OTP code and send via SendGrid API
  const generateNewOtp = async () => {
    const code = initialOtpCode || Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setOtpValues(['', '', '', '', '', '']);
    setTotalTimer(600); // Reset 10-minute countdown
    setResendCooldown(60); // Reset 60s resend cooldown
    setCanResend(false);
    setError('');
    setSendStatusMessage('Mengirimkan email OTP 6-digit via SendGrid...');

    // Save OTP to customer DB in localStorage
    if (targetDestination) {
      const customers = JSON.parse(localStorage.getItem('fbs_customers') || '[]');
      const cleanTarget = targetDestination.trim().toLowerCase();
      const idx = customers.findIndex((c: any) => 
        (c.email && c.email.toLowerCase() === cleanTarget) ||
        (c.phone && c.phone.replace(/[^0-9]/g, '') === cleanTarget.replace(/[^0-9]/g, ''))
      );

      if (idx !== -1) {
        customers[idx] = {
          ...customers[idx],
          otpCode: code,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min expiry
        };
        localStorage.setItem('fbs_customers', JSON.stringify(customers));
      }
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetDestination.includes('@') ? targetDestination : '',
          otp: code,
          name: targetDestination.split('@')[0],
          type: 'EMAIL_VERIFICATION',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendStatusMessage(`Email OTP 6-digit terkirim via SendGrid ke ${targetDestination}!`);
      } else {
        setSendStatusMessage(`Kode OTP 6-digit sedia untuk ${targetDestination}`);
      }
    } catch (e) {
      console.log('[Send OTP SendGrid API Fetch Error]:', e);
      setSendStatusMessage(`Kode OTP 6-digit sedia untuk ${targetDestination}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateNewOtp();
    }
  }, [isOpen]);

  // Total 5-Minute Expiry Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && totalTimer > 0) {
      timer = setInterval(() => {
        setTotalTimer((prev) => prev - 1);
      }, 1000);
    } else if (totalTimer === 0) {
      setError('Kode verifikasi (OTP) telah kadaluarsa (5 menit). Silakan klik Kirim Ulang Kode.');
    }
    return () => clearInterval(timer);
  }, [isOpen, totalTimer]);

  // Resend Button 60-Second Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else if (resendCooldown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  if (!isOpen) return null;

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const digits = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newOtp = [...otpValues];
      digits.forEach((d, idx) => {
        newOtp[idx] = d;
      });
      setOtpValues(newOtp);
      if (digits.length === 6) {
        verifyCode(digits.join(''));
      }
      return;
    }

    const digit = value.replace(/[^0-9]/g, '');
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);
    setError('');

    // Move to next input box
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-modal-input-${index + 1}`);
      nextInput?.focus();
    }

    // Auto verify if all 6 digits entered
    const currentCode = newOtp.join('');
    if (currentCode.length === 6) {
      verifyCode(currentCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-modal-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyCode = (enteredCode: string) => {
    if (totalTimer <= 0) {
      setError('Kode verifikasi (OTP) telah kadaluarsa. Silakan klik Kirim Ulang Kode.');
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      // Check against stored OTP in customer DB
      const customers = JSON.parse(localStorage.getItem('fbs_customers') || '[]');
      const cleanTarget = targetDestination.trim().toLowerCase();
      const customer = customers.find((c: any) => 
        (c.email && c.email.toLowerCase() === cleanTarget) ||
        (c.phone && c.phone.replace(/[^0-9]/g, '') === cleanTarget.replace(/[^0-9]/g, ''))
      );

      const dbOtp = customer?.otpCode || generatedCode;

      if (enteredCode === dbOtp || enteredCode === generatedCode) {
        // Mark customer as verified in DB
        if (customer) {
          const updated = customers.map((c: any) => {
            if (c.id === customer.id) {
              return {
                ...c,
                isEmailVerified: true,
                isActive: true,
                otpCode: undefined,
                otpExpiresAt: undefined,
              };
            }
            return c;
          });
          localStorage.setItem('fbs_customers', JSON.stringify(updated));
        }

        setIsVerifying(false);
        onVerifySuccess();
      } else {
        setIsVerifying(false);
        setError(language === 'EN' ? 'Invalid 6-digit OTP code. Please check again!' : 'Kode verifikasi 6-digit salah. Silakan periksa inbox email Anda!');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden text-center space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#800020] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight font-serif">
            {modalTitle}
          </h2>
          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
            Kode verifikasi OTP 6-digit telah dikirimkan via SendGrid ke:
            <br />
            <span className="font-mono font-bold text-[#800020] bg-[#FFF8F0] px-3 py-1 rounded-xl border border-[#EADBC8] text-sm mt-1 inline-block shadow-inner">
              {targetDestination || 'email Anda'}
            </span>
          </p>
        </div>

        {/* Real-time Email Dispatch Notification */}
        {sendStatusMessage && (
          <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl text-emerald-800 text-[11px] font-medium flex items-center justify-center gap-1.5 shadow-sm">
            <Mail className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{sendStatusMessage}</span>
          </div>
        )}

        {/* 5-Minute Expiry Timer Header */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full w-fit mx-auto border border-stone-200">
          <Clock className="w-3.5 h-3.5 text-[#800020]" />
          <span>Waktu Berlaku OTP:</span>
          <span className={`font-mono text-sm font-black ${totalTimer < 60 ? 'text-red-600 animate-pulse' : 'text-[#800020]'}`}>
            {formatTime(totalTimer)}
          </span>
        </div>

        {/* 6-Digit OTP Inputs */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
            Masukkan Kode OTP 6-Digit dari Inbox Email:
          </label>
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {otpValues.map((digit, index) => (
              <input
                key={index}
                id={`otp-modal-input-${index}`}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-black font-mono text-stone-900 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-[#800020] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all shadow-inner"
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button & Resend Timer */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            disabled={isVerifying || otpValues.join('').length < 6 || totalTimer <= 0}
            onClick={() => verifyCode(otpValues.join(''))}
            className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold rounded-2xl text-xs shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Kode...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>VERIFIKASI KODE (✓)</span>
              </>
            )}
          </button>

          {/* Resend Code Button with 60-Second Cooldown */}
          <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-100">
            <span className="text-[11px] text-stone-500 font-medium">
              {canResend ? (
                <span className="text-emerald-700 font-bold">✓ Anda dapat meminta kode baru</span>
              ) : (
                <span>Kirim ulang aktif dalam: <strong className="font-mono text-stone-800">{resendCooldown}s</strong></span>
              )}
            </span>

            <button
              type="button"
              disabled={!canResend}
              onClick={generateNewOtp}
              className="text-[#800020] font-bold hover:underline disabled:text-stone-400 disabled:no-underline flex items-center gap-1 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kirim Ulang Kode</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
