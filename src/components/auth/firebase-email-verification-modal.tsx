'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Mail, ShieldAlert, CheckCircle2, RefreshCw, ArrowRight, X, Sparkles, ExternalLink, AlertTriangle } from 'lucide-react';

interface FirebaseEmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail: string;
  customerData?: any;
  onVerificationConfirmed?: () => void;
}

export function FirebaseEmailVerificationModal({
  isOpen,
  onClose,
  targetEmail,
  customerData,
  onVerificationConfirmed,
}: FirebaseEmailVerificationModalProps) {
  const router = useRouter();
  const { language } = useLanguage();

  const [checkingStatus, setCheckingStatus] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (isOpen) {
      setNoticeMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle re-checking verification status from Firebase Auth currentUser
  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    setNoticeMessage(null);

    try {
      const user = auth.currentUser;
      if (user) {
        // Reload user profile from Firebase to fetch updated emailVerified boolean
        await user.reload();

        if (user.emailVerified) {
          setNoticeType('success');
          setNoticeMessage(
            language === 'EN'
              ? '✓ Email successfully verified! Redirecting to dashboard...'
              : language === 'MS'
              ? '✓ E-mel berjaya disahkan! Mengalih ke papan pemuka...'
              : '✓ Email berhasil diverifikasi! Mengalihkan ke dashboard...'
          );

          // Update local DB
          const customers = db.getCustomers();
          const cleanEmail = targetEmail.trim().toLowerCase();
          const found = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail);

          const verifiedCustomer = {
            ...(found || customerData || {}),
            id: user.uid || found?.id || `cust-${Date.now()}`,
            email: cleanEmail,
            name: user.displayName || found?.name || targetEmail.split('@')[0],
            isEmailVerified: true,
            isActive: true,
            loginAt: new Date().toISOString(),
          };

          db.saveCustomer(verifiedCustomer);
          localStorage.setItem('fbs_customer_session', JSON.stringify(verifiedCustomer));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('fbs_db_updated'));

          setTimeout(() => {
            setCheckingStatus(false);
            if (onVerificationConfirmed) {
              onVerificationConfirmed();
            } else {
              onClose();
              router.push('/account');
            }
          }, 1200);
          return;
        }
      }

      // Check local DB as fallback
      const customers = db.getCustomers();
      const cleanEmail = targetEmail.trim().toLowerCase();
      const found = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail);

      if (found && (found.isEmailVerified || found.isActive)) {
        setNoticeType('success');
        setNoticeMessage(
          language === 'EN'
            ? '✓ Account verified! Redirecting to dashboard...'
            : '✓ Akun telah terverifikasi! Mengalihkan ke dashboard...'
        );

        localStorage.setItem('fbs_customer_session', JSON.stringify(found));
        window.dispatchEvent(new Event('storage'));

        setTimeout(() => {
          setCheckingStatus(false);
          onClose();
          router.push('/account');
        }, 1200);
        return;
      }

      // Still unverified
      setNoticeType('error');
      setNoticeMessage(
        language === 'EN'
          ? 'Email is not verified yet. Please click the verification link in your inbox or spam folder.'
          : language === 'MS'
          ? 'E-mel belum disahkan. Sila klik pautan pengesahan dalam peti masuk atau folder spam anda.'
          : 'Email belum diverifikasi. Silakan periksa inbox/folder spam dan klik tautan konfirmasi.'
      );
    } catch (err: any) {
      console.error('Check email status error:', err);
      setNoticeType('error');
      setNoticeMessage(err?.message || 'Gagal memeriksa status verifikasi email.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Resend Firebase Email Verification link
  const handleResendEmail = async () => {
    setResendingEmail(true);
    setNoticeMessage(null);

    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setNoticeType('success');
        setNoticeMessage(
          language === 'EN'
            ? `New confirmation link sent to ${targetEmail}! Please check inbox/spam.`
            : language === 'MS'
            ? `Pautan pengesahan baharu telah dihantar ke ${targetEmail}! Sila semak peti masuk/spam.`
            : `Email konfirmasi baru telah dikirimkan ke ${targetEmail}! Silakan periksa inbox/spam.`
        );
      } else {
        // Send fallback Resend email if Firebase user not active in current state
        await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: targetEmail,
            otp: 'VERIFY',
            name: targetEmail.split('@')[0],
            type: 'EMAIL_VERIFICATION',
          }),
        });

        setNoticeType('success');
        setNoticeMessage(
          language === 'EN'
            ? `Verification message sent to ${targetEmail}!`
            : `Pesan verifikasi telah dikirim ulang ke ${targetEmail}!`
        );
      }
    } catch (err: any) {
      console.error('Resend verification email error:', err);
      if (err.code === 'auth/too-many-requests') {
        setNoticeType('error');
        setNoticeMessage(
          language === 'EN'
            ? 'Too many resend attempts. Please wait a few minutes before trying again.'
            : 'Terlalu banyak permintaan kirim ulang. Silakan tunggu beberapa menit.'
        );
      } else {
        setNoticeType('error');
        setNoticeMessage(err?.message || 'Gagal mengirim ulang email konfirmasi.');
      }
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden text-center space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Mail Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#800020] to-[#500014] border-2 border-[#D4AF37] flex items-center justify-center text-[#FFF8F0] shadow-xl relative">
          <Mail className="w-8 h-8 animate-bounce" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-[#800020] rounded-full flex items-center justify-center text-[10px] font-black shadow">
            !
          </span>
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-300">
            {language === 'EN' ? '🔥 EMAIL VERIFICATION REQUIRED' : language === 'MS' ? '🔥 PENGESAHAN E-MEL DIPERLUKAN' : '🔥 VERIFIKASI EMAIL DIPERLUKAN'}
          </span>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight font-serif pt-1">
            {language === 'EN' ? 'Check Your Email Inbox' : language === 'MS' ? 'Semak Peti Masuk E-mel Anda' : 'Periksa Kotak Masuk Email Anda'}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
            {language === 'EN'
              ? 'An automatic confirmation link has been sent to your email address:'
              : language === 'MS'
              ? 'Pautan pengesahan automatik telah dihantar ke alamat e-mel anda:'
              : 'Tautan konfirmasi verifikasi otomatis telah dikirimkan ke alamat email Anda:'}
          </p>
          
          <div className="pt-1">
            <span className="font-mono font-bold text-sm text-[#800020] bg-[#FFF8F0] px-3.5 py-1.5 rounded-xl border border-[#EADBC8] inline-block shadow-inner break-all">
              {targetEmail}
            </span>
          </div>
        </div>

        {/* Warning Alert Box */}
        <div className="p-4 bg-amber-50 border-2 border-amber-300/80 rounded-2xl text-left text-xs text-amber-950 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>{language === 'EN' ? 'Important Instructions:' : language === 'MS' ? 'Arahan Penting:' : 'Instruksi Penting:'}</span>
          </div>
          <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed text-amber-900">
            <li>
              {language === 'EN' 
                ? 'Open your email client and look for email from FBS Bakery / Firebase.' 
                : 'Buka aplikasi e-mel anda dan cari e-mel dari FBS Bakery / Firebase.'}
            </li>
            <li>
              <strong>
                {language === 'EN'
                  ? 'Check your SPAM / JUNK / PROMOTIONS folder if not in inbox.'
                  : 'Semak folder SPAM / JUNK / PROMOSI jika tiada di peti masuk.'}
              </strong>
            </li>
            <li>
              {language === 'EN'
                ? 'Click the "Verify Email Address" link inside the email.'
                : 'Klik pautan "Verifikasi Email" di dalam email tersebut.'}
            </li>
            <li>
              {language === 'EN'
                ? 'After clicking the link, return here and click "Check Verification Status" below.'
                : 'Setelah mengklik tautan, kembali ke sini lalu klik "Cek Status Verifikasi" di bawah.'}
            </li>
          </ol>
        </div>

        {/* Notice Message Toast */}
        {noticeMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 border text-left shadow-sm ${
              noticeType === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : noticeType === 'error'
                ? 'bg-red-50 text-red-800 border-red-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            {noticeType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Check Verification Status Button */}
          <button
            type="button"
            disabled={checkingStatus}
            onClick={handleCheckStatus}
            className="w-full py-3.5 bg-gradient-to-r from-[#800020] to-[#500014] hover:from-[#600018] hover:to-[#400010] text-[#FFF8F0] font-bold rounded-2xl text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            {checkingStatus ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'EN' ? 'Checking Verification Status...' : 'Memeriksa Status Verifikasi...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'EN' ? 'Check Verification Status' : language === 'MS' ? 'Semak Status Pengesahan' : 'Cek Status Verifikasi Email'}</span>
              </>
            )}
          </button>

          {/* Resend Email Button & Back to Login */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              disabled={resendingEmail}
              onClick={handleResendEmail}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-1.5"
            >
              {resendingEmail ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5 text-[#800020]" />
              )}
              <span>{language === 'EN' ? 'Resend Email' : language === 'MS' ? 'Hantar Semula E-mel' : 'Kirim Ulang Email'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/account/login');
              }}
              className="py-2.5 px-3 bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{language === 'EN' ? 'Go to Login' : 'Ke Log Masuk'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
