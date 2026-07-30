'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { BotChallenge } from '@/components/customer/bot-challenge';
import { hashPassword, validatePassword } from '@/lib/auth-security';
import { User, Lock, Phone, Mail, ArrowRight, ShieldCheck, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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

    setLoading(true);

    const hashedPassword = await hashPassword(form.password);

    setTimeout(() => {
      const customerSession = {
        id: `cust-${Date.now()}`,
        name: form.fullName,
        email: form.email || `${form.phone.replace(/[^0-9]/g, '')}@fbsbakeryworld.com`,
        phone: form.phone,
        customerType: 'RETAIL',
        provider: 'FORM',
        hashedPassword: hashedPassword,
        address: 'Shah Alam, Selangor',
        city: 'Shah Alam',
        state: 'Selangor',
        postcode: '40000',
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
      alert('Pendaftaran Berhasil! Selamat datang di FBS Bakery World.');
      router.push('/account');
    }, 500);
  };

  const handleGoogleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      const googleUser = {
        id: `google-${Date.now()}`,
        name: 'Pelanggan Google Baru',
        email: 'user.google@gmail.com',
        phone: '',
        customerType: 'VIP',
        provider: 'GOOGLE',
        address: 'Shah Alam, Selangor',
        city: 'Shah Alam',
        state: 'Selangor',
        postcode: '40000',
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem('fbs_customer_session', JSON.stringify(googleUser));

      const existingCustomers = db.getCustomers();
      if (!existingCustomers.some(c => c.id === googleUser.id)) {
        existingCustomers.unshift({
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          phone: googleUser.phone,
          customerType: 'VIP',
          address: googleUser.address,
          city: googleUser.city,
          state: googleUser.state,
          postcode: googleUser.postcode,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('fbs_customers', JSON.stringify(existingCustomers));
      }

      alert('Pendaftaran Akun dengan Google Berhasil!');
      router.push('/account');
    }, 600);
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

          {/* Social Register Button */}
          <div>
            <button
              onClick={handleGoogleRegister}
              type="button"
              className="w-full py-3 px-4 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign Up with Google Account</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-stone-400 uppercase">Or fill details & bot check</span>
            <div className="flex-grow border-t border-stone-200"></div>
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

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
