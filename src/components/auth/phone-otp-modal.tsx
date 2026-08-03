'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { auth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from '@/lib/firebase';
import { ShieldCheck, Phone, RefreshCw, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface PhoneOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userResult: any) => void;
  defaultPhone?: string;
  title?: string;
}

export function PhoneOtpModal({
  isOpen,
  onClose,
  onSuccess,
  defaultPhone = '',
  title,
}: PhoneOtpModalProps) {
  const { t, language } = useLanguage();
  const modalTitle = title || (language === 'EN' ? 'Login / Register via SMS OTP (Firebase)' : language === 'MS' ? 'Log Masuk / Daftar melalui SMS OTP (Firebase)' : 'Login / Daftar via SMS OTP (Firebase)');

  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [step, setStep] = useState<'INPUT_PHONE' | 'INPUT_OTP'>('INPUT_PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (defaultPhone) {
      setPhoneNumber(defaultPhone);
    }
  }, [defaultPhone]);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        } catch (e) {
          console.warn('Failed to clear recaptchaVerifier on unmount:', e);
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  // Step 1: Send OTP via Firebase signInWithPhoneNumber & RecaptchaVerifier
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+')) {
      setError(language === 'EN' ? 'Phone number must include country code (e.g. +628123456789 or +60123456789).' : language === 'MS' ? 'Format nombor HP mesti menggunakan kod negara (contoh: +628123456789 atau +60123456789).' : 'Format nomor HP harus menggunakan kode negara (contoh: +628123456789 atau +60123456789).');
      return;
    }

    setLoading(true);

    try {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Failed to clear recaptchaVerifier before re-init:', e);
        }
        (window as any).recaptchaVerifier = null;
      }

      // Initialize RecaptchaVerifier
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {},
        'expired-callback': () => {
          setError(language === 'EN' ? 'reCAPTCHA expired. Please reload and try again.' : language === 'MS' ? 'reCAPTCHA tamat tempoh. Sila muat semula dan cuba lagi.' : 'reCAPTCHA kedaluwarsa. Silakan muat ulang dan coba lagi.');
        },
      });

      (window as any).recaptchaVerifier = verifier;

      const confirmation = await signInWithPhoneNumber(auth, cleanPhone, verifier);
      setConfirmationResult(confirmation);
      setStep('INPUT_OTP');
      setLoading(false);
    } catch (err: any) {
      console.error('[Firebase Phone Auth Error]:', err);
      setLoading(false);
      if (err.code === 'auth/invalid-phone-number') {
        setError(language === 'EN' ? 'Invalid phone number. Ensure international format (e.g. +628xxx or +601xxx).' : language === 'MS' ? 'Nombor HP tidak sah. Pastikan format antarabangsa (contoh: +628xxx atau +601xxx).' : 'Nomor HP tidak valid. Pastikan format internasional (contoh: +628xxx atau +601xxx).');
      } else if (err.code === 'auth/too-many-requests') {
        setError(language === 'EN' ? 'Too many SMS OTP requests. Please try again later.' : language === 'MS' ? 'Terlalu banyak permintaan SMS OTP. Sila cuba seketika lagi.' : 'Terlalu banyak permintaan SMS OTP. Silakan coba beberapa saat lagi.');
      } else {
        setError(language === 'EN' ? 'Failed to send SMS OTP. Check phone number & Firebase connection.' : language === 'MS' ? 'Gagal menghantar SMS OTP. Semak nombor HP & sambungan Firebase.' : 'Gagal mengirim SMS OTP. Periksa nomor HP & koneksi Firebase.');
      }
    }
  };

  // Step 2: Input OTP & Confirm via confirmationResult.confirm(code)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
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

    if (digit && index < 5) {
      document.getElementById(`phone-otp-input-${index + 1}`)?.focus();
    }

    if (newOtp.join('').length === 6) {
      verifyCode(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      document.getElementById(`phone-otp-input-${index - 1}`)?.focus();
    }
  };

  const verifyCode = async (code: string) => {
    if (!confirmationResult) {
      setError(language === 'EN' ? 'Verification session not found. Please resend OTP.' : language === 'MS' ? 'Sesi pengesahan tidak ditemui. Sila hantar semula kod OTP.' : 'Sesi verifikasi tidak ditemukan. Silakan kirim ulang kode OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(code);
      const user = result.user;
      setLoading(false);
      onSuccess(user);
    } catch (err: any) {
      console.error('[Firebase OTP Verify Error]:', err);
      setLoading(false);
      setError(language === 'EN' ? 'Invalid 6-digit OTP code or expired. Please check again!' : language === 'MS' ? 'Kod OTP 6-digit tidak sepadan atau telah tamat tempoh. Sila semak semula!' : 'Kode OTP 6-digit tidak cocok atau telah kedaluwarsa. Silakan periksa kembali!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden text-center space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FFF8F0] border-2 border-[#D4AF37] flex items-center justify-center text-[#800020] shadow-md">
          <Phone className="w-8 h-8 text-[#800020]" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight font-serif">
            {modalTitle}
          </h2>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            {step === 'INPUT_PHONE' 
              ? (language === 'EN' ? 'Enter your international phone number to receive a 6-digit SMS OTP code.' : language === 'MS' ? 'Masukkan nombor HP antarabangsa anda untuk menerima SMS kod pengesahan 6-digit.' : 'Masukkan nomor HP internasional Anda untuk menerima SMS kode verifikasi OTP 6-digit.')
              : `${language === 'EN' ? 'A 6-digit OTP code has been sent via SMS to' : language === 'MS' ? 'Kod OTP 6-digit telah dihantar melalui SMS ke nombor' : 'Kode OTP 6-digit telah dikirimkan via SMS ke nomor'} ${phoneNumber}`}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'INPUT_PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                {language === 'EN' ? 'Phone Number (International Format)' : language === 'MS' ? 'Nombor HP (Format Antarabangsa)' : 'Nomor HP (Format Internasional)'} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="e.g. +628123456789 / +60123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-4" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">
                {language === 'EN' ? 'Example: +62 (Indonesia) or +60 (Malaysia).' : language === 'MS' ? 'Contoh: +62 (Indonesia) atau +60 (Malaysia).' : 'Contoh: +62 (Indonesia) atau +60 (Malaysia).'}
              </span>
            </div>

            {/* Recaptcha Container */}
            <div id="recaptcha-container" className="flex justify-center my-2"></div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#800020] to-[#500014] hover:from-[#600018] hover:to-[#400010] text-[#FFF8F0] font-bold rounded-2xl text-sm shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'EN' ? 'Sending SMS OTP...' : language === 'MS' ? 'Menghantar SMS OTP...' : 'Mengirim SMS OTP...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'EN' ? 'Send SMS OTP Code' : language === 'MS' ? 'Hantar Kod OTP SMS' : 'Kirim Kode OTP SMS'}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  id={`phone-otp-input-${index}`}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono text-stone-900 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-[#800020] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              type="button"
              disabled={loading || otpValues.join('').length < 6}
              onClick={() => verifyCode(otpValues.join(''))}
              className="w-full py-3.5 bg-gradient-to-r from-[#800020] to-[#500014] hover:from-[#600018] hover:to-[#400010] text-[#FFF8F0] font-bold rounded-2xl text-sm shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'EN' ? 'Verifying Firebase OTP...' : language === 'MS' ? 'Mengesahkan Firebase OTP...' : 'Memverifikasi Firebase OTP...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'EN' ? 'Verify & Login' : language === 'MS' ? 'Sahkan & Log Masuk' : 'Verifikasi & Login'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('INPUT_PHONE')}
              className="text-xs text-[#800020] font-bold hover:underline"
            >
              {language === 'EN' ? '← Change Phone Number / Resend' : language === 'MS' ? '← Tukar Nombor HP / Hantar Semula' : '← Ubah Nomor HP / Kirim Ulang'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
