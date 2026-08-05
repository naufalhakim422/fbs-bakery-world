'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { UserPlus, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';
import { OtpModal } from '@/components/customer/otp-modal';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<any>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Ensure session is strictly cleared until OTP is verified
    localStorage.removeItem('fbs_customer_session');
    window.dispatchEvent(new Event('storage'));

    if (!form.fullName.trim() || !form.email.trim()) {
      setError(language === 'EN' ? 'All required fields must be filled.' : 'Semua bidang wajib diisi.');
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPhone = form.phone.trim().replace(/[^0-9]/g, '');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(language === 'EN' ? 'Please enter a valid email address.' : 'Sila masukkan alamat e-mel yang sah.');
      return;
    }

    const customers = db.getCustomers();
    const existingVerifiedEmail = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail && c.isEmailVerified);
    if (existingVerifiedEmail) {
      setError(language === 'EN' ? 'This email address is already registered. Please sign in.' : 'Alamat e-mel ini telah terdaftar. Sila log masuk.');
      return;
    }

    if (cleanPhone) {
      const existingVerifiedPhone = customers.find(c => c.phone && c.phone.replace(/[^0-9]/g, '') === cleanPhone && c.isEmailVerified);
      if (existingVerifiedPhone) {
        setError(language === 'EN' ? 'This phone number is already registered.' : 'Nombor telefon ini telah terdaftar.');
        return;
      }
    }

    setLoading(true);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    let existing = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail);

    const newCustomer = {
      id: existing?.id || `cust-${Date.now()}`,
      name: form.fullName.trim(),
      email: cleanEmail,
      phone: form.phone.trim(),
      customerType: 'RETAIL' as const,
      provider: 'FORM' as const,
      isEmailVerified: false,
      isActive: false,
      otpCode: otpCode,
      otpExpiresAt: otpExpiresAt,
      address: 'Chukai, Terengganu',
      city: 'Chukai',
      state: 'Terengganu',
      postcode: '24000',
      createdAt: existing?.createdAt || new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    db.saveCustomer(newCustomer);
    setActiveCustomer(newCustomer);

    // Send SendGrid OTP Email via /api/auth/send-otp
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: otpCode,
          name: form.fullName.trim(),
          type: 'EMAIL_VERIFICATION',
        }),
      });
    } catch (err) {
      console.error('Failed to send SendGrid OTP:', err);
    }

    setLoading(false);
    setShowOtpModal(true);
  };

  const handleOtpVerifySuccess = () => {
    if (!activeCustomer) return;

    const verifiedCustomer = {
      ...activeCustomer,
      isEmailVerified: true,
      isActive: true,
      otpCode: undefined,
      otpExpiresAt: undefined,
      loginAt: new Date().toISOString(),
    };

    db.saveCustomer(verifiedCustomer);
    localStorage.setItem('fbs_customer_session', JSON.stringify(verifiedCustomer));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('fbs_db_updated'));

    setShowOtpModal(false);
    router.push('/account');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col justify-center">
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-xl space-y-6 animate-fade-in">
          
          {/* Header Badge & Icon */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#800020] via-[#500014] to-[#3A0612] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-lg">
              <UserPlus className="w-8 h-8" />
            </div>
            
            <span className="text-[10px] font-black text-[#800020] uppercase tracking-widest bg-[#800020]/10 px-3 py-1 rounded-full inline-block">
              {language === 'EN' ? 'NEW CUSTOMER REGISTRATION' : 'PENDAFTARAN PELANGGAN BAHARU'}
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B] tracking-tight pt-1">
              Daftar Akun Baru
            </h1>
            
            <p className="text-stone-600 text-xs leading-relaxed max-w-xs mx-auto">
              Lengkapi formulir untuk menerima **Kode OTP SendGrid 6-Digit** verifikasi pendaftaran.
            </p>
          </div>

          {/* 1-Click Google Sign-In */}
          <div className="space-y-2">
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-stone-200" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Daftar Instan via Google</span>
              <div className="flex-1 h-[1px] bg-stone-200" />
            </div>
            <GoogleButton />
          </div>

          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-stone-200" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Atau Daftar Formulir & OTP</span>
            <div className="flex-1 h-[1px] bg-stone-200" />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Register */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ahmad Naufal"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Alamat Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  placeholder="e.g. naufal@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <input 
                  type="tel"
                  placeholder="e.g. +60123456789"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {loading ? (
                <span>Mengirim Kode OTP...</span>
              ) : (
                <>
                  <span>DAFTAR & KIRIM KODE OTP</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="pt-2 text-center text-xs text-stone-600 border-t border-stone-100">
            <p>
              Sudah memiliki akun?{' '}
              <Link href="/account/login" className="text-[#800020] font-bold hover:underline">
                Log Masuk Sekarang
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />

      {/* SendGrid 6-Digit OTP Verification Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        targetDestination={form.email}
        onVerifySuccess={handleOtpVerifySuccess}
        title="Verifikasi Pendaftaran OTP SendGrid"
        initialOtpCode={activeCustomer?.otpCode}
      />
    </div>
  );
}
