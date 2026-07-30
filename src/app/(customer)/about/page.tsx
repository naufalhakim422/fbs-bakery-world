'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { AboutSetting } from '@/types';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ShieldCheck, Award, Heart, Truck, Sparkles, Users, Calendar, PackageCheck, Target } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();
  const [about, setAbout] = useState<AboutSetting>(db.getAboutSettings());

  useEffect(() => {
    const loadLiveData = () => {
      setAbout(db.getAboutSettings());
    };
    loadLiveData();

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        
        {/* Header Hero Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#800020] uppercase tracking-widest block">
            BRAND STORY & VISION
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#2B1B1B]">
            {about.heroTitle}
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed max-w-2xl mx-auto">
            {about.heroSubtitle}
          </p>
        </div>

        {/* Hero Cover Image & Key Heritage Stats */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#EADBC8] shadow-md space-y-6">
          <div className="aspect-21/9 rounded-2xl overflow-hidden shadow-inner border border-stone-200">
            <img src={about.heroImage} alt="FBS Bakery World Story" className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] text-center">
              <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#800020] block">{about.statYears}</span>
              <span className="text-[11px] font-bold text-stone-600 uppercase">Pengalaman Baking</span>
            </div>
            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] text-center">
              <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#800020] block">{about.statBakers}</span>
              <span className="text-[11px] font-bold text-stone-600 uppercase">Baker & Kafe Mitra</span>
            </div>
            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] text-center">
              <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#800020] block">{about.statProducts}</span>
              <span className="text-[11px] font-bold text-stone-600 uppercase">Produk Halal Ready</span>
            </div>
            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] text-center">
              <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#800020] block">{about.statSatisfaction}</span>
              <span className="text-[11px] font-bold text-stone-600 uppercase">Kepuasan Pelanggan</span>
            </div>
          </div>
        </div>

        {/* Brand Story & Vision / Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-sm space-y-4 text-stone-700 text-sm leading-relaxed">
            <h2 className="font-serif text-2xl font-bold text-[#800020] border-b border-stone-100 pb-3">
              {about.storyTitle}
            </h2>
            <p className="whitespace-pre-line">{about.storyParagraph1}</p>
            <p className="whitespace-pre-line">{about.storyParagraph2}</p>
          </div>

          <div className="space-y-6">
            <div className="bg-[#800020] text-[#FFF8F0] p-6 rounded-3xl shadow-md border border-[#D4AF37]/30 space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37] font-serif font-bold text-lg">
                <Target className="w-5 h-5" /> Visi Kami
              </div>
              <p className="text-xs text-stone-200 leading-relaxed">{about.visionText}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#800020] font-serif font-bold text-lg">
                <Sparkles className="w-5 h-5" /> Misi Utama
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{about.missionText}</p>
            </div>
          </div>

        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="text-center p-6 bg-white rounded-3xl border border-[#EADBC8] shadow-sm space-y-2">
            <ShieldCheck className="w-8 h-8 text-[#800020] mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#800020]">100% Guaranteed Halal</h3>
            <p className="text-xs text-stone-500">Semua produk bersertifikat Halal dan diproses secara higienis.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-3xl border border-[#EADBC8] shadow-sm space-y-2">
            <Award className="w-8 h-8 text-[#800020] mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#800020]">Quality Assurance</h3>
            <p className="text-xs text-stone-500">Diimpor langsung dari brand terkemuka seperti Callebaut, Anchor, & Valrhona.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-3xl border border-[#EADBC8] shadow-sm space-y-2">
            <Truck className="w-8 h-8 text-[#800020] mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#800020]">Fast Regional Shipping</h3>
            <p className="text-xs text-stone-500">Pengiriman cepat dilengkapi nomor resi lacak otomatis via WhatsApp.</p>
          </div>
        </div>

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
