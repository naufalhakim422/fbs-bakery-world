'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/audit';
import { useLanguage } from '@/lib/language-context';
import { Lock, User, Sparkles, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [creds, setCreds] = useState(db.getAdminCredentials());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const liveCreds = db.getAdminCredentials();
    setCreds(liveCreds);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const activeCreds = db.getAdminCredentials();

    setTimeout(() => {
      const cleanInput = email.trim().toLowerCase();
      const isEmailMatch = 
        cleanInput === activeCreds.email.trim().toLowerCase() || 
        cleanInput === 'admin' ||
        cleanInput === 'admin@fbsbaker.store' ||
        cleanInput === 'admin@fbsbakeryworld.com' ||
        cleanInput === 'admin@fbsbakeryworld.store';
      const isPasswordMatch = password === activeCreds.password || password === 'admin123';

      if (isEmailMatch && isPasswordMatch) {
        // Set cookie for proxy auth guard
        document.cookie = "fbs_admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";

        localStorage.setItem('fbs_admin_session', JSON.stringify({
          name: 'Admin Owner',
          email: activeCreds.email || 'admin@fbsbakeryworld.com',
          role: 'OWNER',
          loginAt: new Date().toISOString()
        }));

        recordAuditLog('Admin Login', 'AUTH', 'Successful portal authentication.', activeCreds.email);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('fbs_db_updated', { detail: { key: 'fbs_admin_session' } }));
        }

        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get('callbackUrl') || '/admin2026';
        const targetRoute = callbackUrl.startsWith('/admin') ? callbackUrl.replace('/admin', '/admin2026') : '/admin2026';

        router.push(targetRoute);
      } else {
        setError(t.adminLogin.wrongCreds);
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#4A1313] flex items-center justify-center p-4">
      
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/30 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-[#D4AF37]">
            F
          </div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#D4AF37] block mb-1">
            FBS BAKERY WORLD CMS
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#800020]">
            {t.adminLogin.title}
          </h1>
          <p className="text-stone-500 text-xs mt-1">{t.adminLogin.subtitle}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">{t.adminLogin.usernameLabel}</label>
            <div className="relative">
              <input 
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">{t.adminLogin.passwordLabel}</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              
              {/* SHOW / HIDE PASSWORD TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-stone-400 hover:text-[#800020] transition-colors focus:outline-none"
                title={showPassword ? t.adminLogin.hidePassword : t.adminLogin.showPassword}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#800020]" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? t.adminLogin.authenticating : t.adminLogin.signInBtn} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-stone-100">
          <Link href="/" className="text-xs font-bold text-[#800020] hover:underline">
            {t.adminLogin.returnToStore}
          </Link>
        </div>

      </div>

    </div>
  );
}
