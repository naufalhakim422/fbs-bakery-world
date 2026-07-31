'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { formatWhatsAppNumber, extractMapsEmbedUrl, extractMapsAppUrl } from '@/lib/whatsapp';
import { ChefHat, Phone, Mail, MapPin, ShieldCheck, Heart, ArrowUpRight, Search, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState(db.getStoreSettings());
  const { t } = useLanguage();

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(db.getStoreSettings());
    };
    handleUpdate();

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fbs_db_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fbs_db_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  return (
    <footer className="bg-[#181113] text-[#FFF8F0] pt-16 pb-10 border-t border-[#F7E7CE]/20 relative overflow-hidden">
      
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-[#800020]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 4-Column Minimalist Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          
          {/* Col 1: Brand Info & Modern Social Media Buttons */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.jpg" 
                alt="FBS Bakery World Logo" 
                className="w-11 h-11 rounded-full object-cover border border-[#F7E7CE]/40 shadow-md group-hover:scale-105 transition-transform bg-white" 
              />
              <span className="font-sans font-black text-base tracking-[0.2em] text-[#F7E7CE] uppercase">
                FBS BAKERY WORLD
              </span>
            </Link>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Mitra utama suplai bahan baku kue & pastry Halal bersertifikat. Menyediakan produk impor berkualitas untuk baker rumahan, kafe, hingga industri toko kue di seluruh Malaysia & Indonesia.
            </p>

            {/* MODERN SOCIAL MEDIA CONNECT SECTION */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> OFFICIAL SOCIAL MEDIA
              </span>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* INSTAGRAM */}
                <a 
                  href="https://www.instagram.com/fbsbakery_world?igsh=NGRkaTYzcXg3MDF3" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-[11px] font-bold shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-1.5 border border-white/20"
                  title="Follow FBS Bakery World on Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* FACEBOOK */}
                <a 
                  href="https://www.facebook.com/share/1dT9teNY9t/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#165ec9] text-white text-[11px] font-bold shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-1.5 border border-white/20"
                  title="Visit FBS Bakery World on Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* TIKTOK */}
                <a 
                  href="https://www.tiktok.com/@fbsbakeryworld?_r=1&_t=ZS-98RKKo3aipw" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 hover:border-[#00f2fe] text-white text-[11px] font-bold shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-1.5"
                  title="Watch FBS Bakery World on TikTok"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-[#00f2fe]" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.82.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46V13a8.28 8.28 0 0 0 5.73 2.25V11.8a4.83 4.83 0 0 1-3.77-1.34V6.69z"/>
                  </svg>
                  <span>TikTok</span>
                  <ArrowUpRight className="w-3 h-3 text-[#ff0050] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>

          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-xs uppercase tracking-[0.15em] text-[#F7E7CE]">
              NAVIGASI UTAMA
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/" className="hover:text-[#F7E7CE] transition-colors flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Beranda Utama</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#F7E7CE] transition-colors flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Semua Katalog Produk</span>
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#F7E7CE] transition-colors flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Kategori Bahan & Alat</span>
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="hover:text-[#F7E7CE] transition-colors flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Resep & Video Baking</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#F7E7CE] transition-colors flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Blog & Panduan Baker</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#F7E7CE] transition-colors flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Tentang FBS Bakery</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Order Tracking */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-xs uppercase tracking-[0.15em] text-[#F7E7CE]">
              LAYANAN PELANGGAN
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link 
                  href="/track-order" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#800020]/50 hover:bg-[#800020] border border-[#F7E7CE]/30 text-[#F7E7CE] font-bold rounded-xl transition-all shadow-sm group"
                >
                  <Search className="w-3.5 h-3.5" /> Lacak Resi Pengiriman <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F7E7CE] transition-colors">
                  Hubungi Support WhatsApp
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#F7E7CE] transition-colors">
                  Pertanyaan Umum (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#F7E7CE] transition-colors">
                  Akun & Voucher Diskon
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Warehouse Contact */}
          <div className="space-y-4" suppressHydrationWarning>
            <h4 className="font-sans font-bold text-xs uppercase tracking-[0.15em] text-[#F7E7CE]">
              KAPASITAS & LOKASI
            </h4>
            <div className="space-y-3.5 text-xs text-stone-400" suppressHydrationWarning>
              <div className="flex items-start gap-2.5" suppressHydrationWarning>
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-stone-300 font-sans" suppressHydrationWarning>{settings.address}</span>
              </div>

              {/* WHATSAPP SUPPORT NUMBER 1 */}
              <div className="flex items-center gap-2.5" suppressHydrationWarning>
                <Phone className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">WhatsApp CS 1 (Ritel & Layanan):</span>
                  <a 
                    href={`https://wa.me/${formatWhatsAppNumber(settings.whatsappNumber)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#F7E7CE] font-mono text-stone-200 font-bold transition-colors" 
                    suppressHydrationWarning
                  >
                    +{formatWhatsAppNumber(settings.whatsappNumber)}
                  </a>
                </div>
              </div>

              {/* WHATSAPP SUPPORT NUMBER 2 (SEKUNDER / GROSIR) */}
              <div className="flex items-center gap-2.5" suppressHydrationWarning>
                <Phone className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">WhatsApp CS 2 (Grosir & Komersial):</span>
                  <a 
                    href={`https://wa.me/${formatWhatsAppNumber(settings.whatsappNumber2 || settings.whatsappNumber)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#F7E7CE] font-mono text-stone-200 font-bold transition-colors" 
                    suppressHydrationWarning
                  >
                    +{formatWhatsAppNumber(settings.whatsappNumber2 || settings.whatsappNumber)}
                  </a>
                </div>
              </div>

              {/* EMAIL SUPPORT */}
              <div className="flex items-center gap-2.5" suppressHydrationWarning>
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Email Bantuan & Kerjasama:</span>
                  <span className="text-stone-300 font-mono" suppressHydrationWarning>{settings.supportEmail}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="px-3 py-2 rounded-xl bg-stone-900/90 border border-[#D4AF37]/30 text-[11px] text-[#F7E7CE] font-semibold flex items-center gap-2 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 100% Halal Guaranteed Ingredients
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Minimalist Bottom Copyright Bar */}
        <div className="pt-8 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans tracking-wide">
            © 2026 <strong className="text-stone-300 font-bold">FBS BAKERY WORLD</strong>. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <p className="flex items-center gap-1.5 text-stone-400">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-[#800020] fill-[#800020]" /> untuk Komunitas Baker & Pastry Chef Indonesia & Malaysia.
          </p>
        </div>

      </div>
    </footer>
  );
};
