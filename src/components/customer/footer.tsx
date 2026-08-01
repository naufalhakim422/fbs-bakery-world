'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { formatWhatsAppNumber, extractMapsEmbedUrl } from '@/lib/whatsapp';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState(db.getStoreSettings());
  const { language } = useLanguage();

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

  const companyName = settings.companyRegistrationName || 'FBS Bakery World (M) Sdn. Bhd. (1080422-V)';
  const operatingHours = settings.operatingHours || 'Mon - Fri | 8.30am - 5.30pm';

  return (
    <footer className="bg-[#1E0F14] text-[#FFF8F0] pt-12 pb-8 border-t border-[#F7E7CE]/20 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 3-Column Corporate Layout matching Reference Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10 border-b border-[#F7E7CE]/15">
          
          {/* Column 1 (Left): Interactive Google Maps iFrame */}
          <div className="lg:col-span-5 w-full space-y-2">
            <div className="rounded-2xl overflow-hidden border border-[#F7E7CE]/30 shadow-2xl bg-[#2B1B1B] h-[240px] sm:h-[260px] relative group" suppressHydrationWarning>
              <iframe
                title="FBS Bakery World Google Maps Location"
                src={extractMapsEmbedUrl(settings.googleMapsEmbedUrl, settings.address)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full filter brightness-95 contrast-105"
              />
            </div>
          </div>

          {/* Column 2 (Middle): FIND US ON / CARI KAMI */}
          <div className="lg:col-span-4 space-y-5" suppressHydrationWarning>
            <h3 className="font-sans font-extrabold text-sm sm:text-base uppercase tracking-widest text-[#F7E7CE] border-b-2 border-[#D4AF37]/40 pb-1.5 inline-block">
              {language === 'ID' || language === 'MS' ? 'CARI KAMI DI' : 'FIND US ON'}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-[#E8D5C0]">
              
              {/* ADDRESS & REGISTRATION NAME */}
              <div className="flex items-start gap-3" suppressHydrationWarning>
                <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-[#F7E7CE] leading-snug">{companyName}</p>
                  <p className="text-[#C4A882] text-xs leading-relaxed">{settings.address}</p>
                </div>
              </div>

              {/* PHONE NUMBERS */}
              <div className="flex items-center gap-3" suppressHydrationWarning>
                <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div className="flex items-center gap-2 font-mono font-bold text-[#F7E7CE] text-xs sm:text-sm flex-wrap">
                  <a 
                    href={`https://wa.me/${formatWhatsAppNumber(settings.whatsappNumber)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    +{formatWhatsAppNumber(settings.whatsappNumber)}
                  </a>
                  {settings.whatsappNumber2 && (
                    <>
                      <span className="text-[#800020]">|</span>
                      <a 
                        href={`https://wa.me/${formatWhatsAppNumber(settings.whatsappNumber2)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-[#D4AF37] transition-colors"
                      >
                        +{formatWhatsAppNumber(settings.whatsappNumber2)}
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex items-center gap-3" suppressHydrationWarning>
                <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <a 
                  href={`mailto:${settings.supportEmail}`} 
                  className="text-[#E8D5C0] font-mono hover:text-[#D4AF37] text-xs sm:text-sm transition-colors"
                >
                  {settings.supportEmail}
                </a>
              </div>

              {/* OPERATING HOURS */}
              <div className="flex items-center gap-3" suppressHydrationWarning>
                <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span className="text-[#F7E7CE] font-medium text-xs sm:text-sm">
                  {operatingHours}
                </span>
              </div>

            </div>
          </div>

          {/* Column 3 (Right): HELP & SUPPORT / BANTUAN & DUKUNGAN */}
          <div className="lg:col-span-3 space-y-5">
            <h3 className="font-sans font-extrabold text-sm sm:text-base uppercase tracking-widest text-[#F7E7CE] border-b-2 border-[#D4AF37]/40 pb-1.5 inline-block">
              {language === 'ID' || language === 'MS' ? 'BANTUAN & DUKUNGAN' : 'HELP & SUPPORT'}
            </h3>

            <ul className="space-y-2 text-xs sm:text-sm text-[#C4A882] font-medium">
              <li>
                <Link href="/contact#faq" className="hover:text-[#F7E7CE] transition-colors block py-0.5 flex items-center gap-1.5">
                  <span className="text-[#D4AF37]">›</span> {language === 'ID' || language === 'MS' ? 'Cara Memesan' : 'How To Order'}
                </Link>
              </li>
              <li>
                <Link href="/contact#shipping" className="hover:text-[#F7E7CE] transition-colors block py-0.5 flex items-center gap-1.5">
                  <span className="text-[#D4AF37]">›</span> {language === 'ID' || language === 'MS' ? 'Ketentuan Pengiriman' : 'Shipping Terms'}
                </Link>
              </li>
              <li>
                <Link href="/contact#payment" className="hover:text-[#F7E7CE] transition-colors block py-0.5 flex items-center gap-1.5">
                  <span className="text-[#D4AF37]">›</span> {language === 'ID' || language === 'MS' ? 'Metode Pembayaran' : 'Payment Method'}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#F7E7CE] transition-colors block py-0.5 flex items-center gap-1.5">
                  <span className="text-[#D4AF37]">›</span> {language === 'ID' || language === 'MS' ? 'Lacak Pesanan (Tracking)' : 'Track Order Status'}
                </Link>
              </li>
              <li>
                <Link href="/contact#refund" className="hover:text-[#F7E7CE] transition-colors block py-0.5 flex items-center gap-1.5">
                  <span className="text-[#D4AF37]">›</span> {language === 'ID' || language === 'MS' ? 'Kebijakan Pengembalian' : 'Return & Refund Policy'}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#F7E7CE] transition-colors block py-0.5 flex items-center gap-1.5">
                  <span className="text-[#D4AF37]">›</span> {language === 'ID' || language === 'MS' ? 'Pertanyaan Umum (FAQ)' : 'Frequently Asked Questions'}
                </Link>
              </li>
            </ul>

            {/* ROUND WHITE SOCIAL MEDIA BUTTONS: FACEBOOK, INSTAGRAM, TIKTOK */}
            <div className="pt-2 flex items-center gap-3">
              {/* FACEBOOK */}
              <a
                href="https://www.facebook.com/share/1dT9teNY9t/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#F7E7CE] hover:bg-[#D4AF37] text-[#2B1B1B] flex items-center justify-center transition-all transform hover:scale-110 shadow-md"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* INSTAGRAM */}
              <a
                href="https://www.instagram.com/fbsbakery_world?igsh=NGRkaTYzcXg3MDF3"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#F7E7CE] hover:bg-[#D4AF37] text-[#2B1B1B] flex items-center justify-center transition-all transform hover:scale-110 shadow-md"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TIKTOK */}
              <a
                href="https://www.tiktok.com/@fbsbakeryworld"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#F7E7CE] hover:bg-[#D4AF37] text-[#2B1B1B] flex items-center justify-center transition-all transform hover:scale-110 shadow-md"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.55-1.36 1.48-1.41 2.47-.04.9.36 1.81 1.05 2.37.74.62 1.77.83 2.7.59 1.05-.24 1.94-.98 2.32-1.97.16-.48.23-.99.23-1.5V.02z"/>
                </svg>
              </a>
            </div>

          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8B6F5C] gap-3">
          <p>© 2026 <strong className="text-[#F7E7CE]">FBS BAKERY WORLD</strong>. All rights reserved.</p>
          <p className="text-[11px] text-[#A0876F]">
            Certified Halal Baking Supply Partner Malaysia & Indonesia
          </p>
        </div>

      </div>
    </footer>
  );
};
