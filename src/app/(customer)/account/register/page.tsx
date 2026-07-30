'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { BotChallenge } from '@/components/customer/bot-challenge';
import { hashPassword, validatePassword } from '@/lib/auth-security';
import { OtpModal } from '@/components/customer/otp-modal';
import { User, Lock, Phone, Mail, ArrowRight, ShieldCheck, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';

export default function CustomerRegisterPage() {
  const router = useRouter();
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

  const passwordValidation = validatePassword(form.password);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!isBotVerified) {
      setError('Silakan centang dan selesaikan verifikasi "Saya Bukan Robot" di bawah.');
      return;
    }

    // Trigger 2-Step Verification Modal
    setShowOtpModal(true);
  };

  const handleOtpVerifySuccess = async () => {
    setShowOtpModal(false);
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
        address: 'Shah Alam, Selangor',
        city: 'Shah Alam',
        state: 'Selangor',
        postcode: '40000',
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
      alert('Pendaftaran & Verifikasi 2 Langkah Berhasil! Selamat datang di FBS Bakery World.');
      router.push('/account');
    }, 500);
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
              NEW CUSTOMER REGISTRATION
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B]">
              Create Baker Account
            </h1>
            <p className="text-stone-600 text-xs mt-1">
              Wajib minimal 8-12 karakter & 1 karakter khusus (@#$%^&*!_-?).
            </p>
          </div>
<GoogleButton />


          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ahmad Naufal"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                WhatsApp Phone Number <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="tel"
                  required
                  placeholder="e.g. +60129876543"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <input 
                  type="email"
                  placeholder="e.g. naufal@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="e.g. Baker@2026"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  
                  {/* SHOW/HIDE PASSWORD TOGGLE BUTTON */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-[#800020] transition-colors"
                    title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  
                  {/* SHOW/HIDE CONFIRM PASSWORD TOGGLE BUTTON */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-[#800020] transition-colors"
                    title={showConfirmPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE PASSWORD REQUIREMENTS INDICATORS */}
            {form.password.length > 0 && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passwordValidation.hasMinLength ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
                  {passwordValidation.hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 text-center">○</span>}
                  <span>Minimal 8-12+ karakter ({form.password.length} karakter)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordValidation.hasSpecialChar ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
                  {passwordValidation.hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 text-center">○</span>}
                  <span>Mengandung karakter khusus (@, #, $, %, !, *, _, -)</span>
                </div>
              </div>
            )}

            {/* ANTI-BOT SAYA BUKAN ROBOT CHALLENGE */}
            <BotChallenge onVerified={setIsBotVerified} />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                isBotVerified ? 'bg-[#800020] hover:bg-[#6F1D1B]' : 'bg-stone-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-200 text-center text-xs">
            <p className="text-stone-600">
              Already have an account?{' '}
              <Link href="/account/login" className="text-[#800020] font-bold hover:underline">
                Sign In Here
              </Link>
            </p>
          </div>

        </div>

      </main>

      {/* 2-STEP OTP VERIFICATION MODAL */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        targetDestination={form.email || form.phone}
        onVerifySuccess={handleOtpVerifySuccess}
        title="Verifikasi 2 Langkah Pendaftaran (OTP)"
      />

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
