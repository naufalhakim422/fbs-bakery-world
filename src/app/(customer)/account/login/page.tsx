'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ShieldCheck, Sparkles, UserCheck, Lock, CheckCircle2 } from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';

export default function CustomerLoginPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full flex flex-col justify-center">
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-xl space-y-6 text-center animate-fade-in">
          
          {/* Header Badge & Icon */}
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#800020] via-[#500014] to-[#3A0612] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <span className="text-[10px] font-black text-[#800020] uppercase tracking-widest bg-[#800020]/10 px-3 py-1 rounded-full inline-block">
              {language === 'EN' ? 'INSTANT GOOGLE AUTHENTICATION' : language === 'MS' ? 'LOG MASUK PANTAS GOOGLE' : 'LOGIN INSTAN AKUN GOOGLE'}
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B] tracking-tight">
              {language === 'EN' ? 'Sign In / Register' : language === 'MS' ? 'Log Masuk / Daftar Akun' : 'Masuk / Daftar Akun'}
            </h1>
            
            <p className="text-stone-600 text-xs leading-relaxed max-w-xs mx-auto font-medium">
              {language === 'EN'
                ? 'One-click instant login or sign-up using your official Google Account.'
                : language === 'MS'
                ? 'Satu klik mudah untuk log masuk atau mendaftar menggunakan Akaun Google anda.'
                : 'Satu klik mudah untuk masuk atau mendaftar menggunakan Akun Google Anda.'}
            </p>
          </div>

          {/* Prominent Google Button Container */}
          <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] shadow-inner space-y-3">
            <span className="text-[11px] font-bold text-stone-700 block uppercase tracking-wider">
              {language === 'EN' ? 'Click below to proceed:' : 'Klik tombol di bawah untuk melanjutkan:'}
            </span>
            <div className="w-full">
              <GoogleButton />
            </div>
          </div>

          {/* Security & Convenience Benefits */}
          <div className="space-y-2 pt-2 text-left text-xs text-stone-600 border-t border-stone-100">
            <div className="flex items-center gap-2 text-[11px] text-stone-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{language === 'EN' ? 'Instant access without remembering passwords' : 'Akses instan tanpa perlu mengingat kata sandi'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-700">
              <Lock className="w-4 h-4 text-[#800020] flex-shrink-0" />
              <span>{language === 'EN' ? '100% Encrypted & Verified Google Auth' : '100% Terenkripsi & Terverifikasi Resmi oleh Google'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-700">
              <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>{language === 'EN' ? 'Guest checkout is always supported without login' : 'Checkout tamu tetap selalu didukung tanpa pendaftaran'}</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
