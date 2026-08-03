'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { BotChallenge } from '@/components/customer/bot-challenge';
import { hashPassword, validatePassword } from '@/lib/auth-security';
import { OtpModal } from '@/components/customer/otp-modal';
import { PhoneOtpModal } from '@/components/auth/phone-otp-modal';
import { User, Lock, Phone, Mail, ArrowRight, ShieldCheck, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';
import FacebookButton from '@/components/auth/facebook-button';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isBotVerified, setIsBotVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);

  const passwordValidation = validatePassword(form.password);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.customerAccount.passwordMismatch);
      return;
    }

    if (!isBotVerified) {
      setError(t.customerAccount.rateLimitWarning);
      return;
    }

    setLoading(true);
    const hashedPassword = await hashPassword(form.password);

    setTimeout(() => {
      const customerSession = {
        id: `cust-${Date.now()}`,
        name: form.fullName,
        email: form.email || `${form.phone.replace(/[^0-9]/g, '')}@fbsbakeryworld.com`,
        phone: form.phone,
        customerType: 'RETAIL' as const,
        provider: 'FORM' as const,
        hashedPassword: hashedPassword,
        address: 'Chukai, Terengganu',
        city: 'Chukai',
        state: 'Terengganu',
        postcode: '24000',
        createdAt: new Date().toISOString(),
        loginAt: new Date().toISOString(),
      };

      localStorage.setItem('fbs_customer_session', JSON.stringify(customerSession));

      const existingCustomers = db.getCustomers();
      if (!existingCustomers.some(c => c.phone.replace(/[^0-9]/g, '') === form.phone.replace(/[^0-9]/g, ''))) {
        existingCustomers.unshift({
          id: customerSession.id,
          name: customerSession.name,
          email: customerSession.email,
          phone: customerSession.phone,
          customerType: 'RETAIL',
          address: customerSession.address,
          city: customerSession.city,
          state: customerSession.state,
          postcode: customerSession.postcode,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('fbs_customers', JSON.stringify(existingCustomers));
      }

      setLoading(false);
      router.push('/account');
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col justify-center">
        
        <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-xl space-y-6">
          
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-[#800020] uppercase tracking-widest block mb-1">
              {language === 'EN' ? 'NEW CUSTOMER REGISTRATION' : language === 'MS' ? 'PENDAFTARAN PELANGGAN BAHARU' : 'PENDAFTARAN PELANGGAN BARU'}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B]">
              {t.customerAccount.registerTitle}
            </h1>
            <p className="text-stone-600 text-xs mt-1">
              {t.customerAccount.registerSubtitle}
            </p>
          </div>
          {/* Social Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E0D8' }} />
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>{t.customerAccount.orContinueWith}</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E0D8' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <GoogleButton />
              <FacebookButton />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                {t.customerAccount.fullName} <span className="text-red-600">*</span>
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
                {t.customerAccount.emailAddress}
              </label>
              <div className="relative">
                <input 
                  type="email"
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
                {t.customerAccount.phoneNumber} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="tel"
                  required
                  placeholder="e.g. +60123456789"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                {t.customerAccount.password} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-[#800020] transition-colors"
                  title={showPassword ? t.customerAccount.hidePassword : t.customerAccount.showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {form.password.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <span className={`text-[10px] font-bold block ${
                    passwordValidation.valid ? 'text-emerald-600' : 'text-stone-500'
                  }`}>
                    {passwordValidation.valid ? (language === 'EN' ? '✓ Password meets security requirements (8-12+ characters)' : language === 'MS' ? '✓ Kata laluan memenuhi syarat keselamatan (8-12+ aksara)' : '✓ Password memenuhi syarat keamanan (8-12+ karakter)') : (language === 'EN' ? 'Password Criteria:' : language === 'MS' ? 'Kriteria Kata Laluan:' : 'Kriteria password:')}
                  </span>
                  {!passwordValidation.valid && (
                    <p className="text-[10px] text-stone-500">
                      {language === 'EN' ? 'Minimum 8-12 characters (uppercase & numbers recommended).' : language === 'MS' ? 'Sekurang-kurangnya 8-12 aksara (disyorkan huruf besar & nombor).' : 'Minimal 8-12 karakter (disarankan huruf besar & angka).'}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                {t.customerAccount.confirmPassword} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-[#800020] transition-colors"
                  title={showConfirmPassword ? t.customerAccount.hidePassword : t.customerAccount.showPassword}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <BotChallenge onVerified={setIsBotVerified} />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                isBotVerified ? 'bg-[#800020] hover:bg-[#6F1D1B]' : 'bg-stone-400 cursor-not-allowed'
              }`}
            >
              {loading ? t.customerAccount.registering : t.customerAccount.registerBtn} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-200 text-center space-y-3 text-xs">
            <p className="text-stone-600">
              {t.customerAccount.hasAccount}{' '}
              <Link href="/account/login" className="text-[#800020] font-bold hover:underline">
                {t.customerAccount.loginBtn}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
