'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { formatWhatsAppNumber } from '@/lib/whatsapp';
import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(db.getStoreSettings());

  useEffect(() => {
    const loadLiveData = () => {
      setSettings(db.getStoreSettings());
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
        
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#800020] uppercase tracking-widest block mb-1">
            {language === 'EN' ? 'CUSTOMER SUPPORT & HELPLINE' : language === 'MS' ? 'SOKONGAN & TALIAN BANTUAN PELANGGAN' : 'DUKUNGAN & LAYANAN PELANGGAN'}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#2B1B1B]">
            {language === 'EN' ? 'Contact FBS Bakery World' : language === 'MS' ? 'Hubungi FBS Bakery World' : 'Hubungi FBS Bakery World'}
          </h1>
          <p className="text-stone-600 text-sm mt-3">
            {language === 'EN' ? 'Have questions regarding baking supplies, bulk pricing, or order status? Our support team is ready to assist.' : language === 'MS' ? 'Ada soalan berkenaan bahan bakeri, harga pukal, atau status pesanan? Pasukan sokongan kami sedia membantu.' : 'Memiliki pertanyaan seputar bahan baking, harga grosir, atau status pesanan? Tim kami siap membantu Anda.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-[#EADBC8] shadow-md space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#800020] border-b border-stone-200 pb-3">
              {language === 'EN' ? 'Store Information' : language === 'MS' ? 'Maklumat Kedai' : 'Informasi Toko'}
            </h2>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">{language === 'EN' ? 'Warehouse Address:' : language === 'MS' ? 'Alamat Gudang:' : 'Alamat Gudang:'}</strong>
                  <span>{settings.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">{language === 'EN' ? 'WhatsApp Support Line:' : language === 'MS' ? 'Talian Sokongan WhatsApp:' : 'Layanan WhatsApp:'}</strong>
                  <span>+{settings.whatsappNumber}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">{language === 'EN' ? 'Email Inquiry:' : language === 'MS' ? 'E-mel Pertanyaan:' : 'Email Pertanyaan:'}</strong>
                  <span>{settings.supportEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">{language === 'EN' ? 'Operating Hours:' : language === 'MS' ? 'Waktu Operasi:' : 'Jam Operasional:'}</strong>
                  <span>{language === 'EN' ? 'Monday - Saturday: 8:30 AM - 6:00 PM (Closed on Sunday & Public Holidays)' : language === 'MS' ? 'Isnin - Sabtu: 8:30 PG - 6:00 PTG (Tutup pada Ahad & Cuti Umum)' : 'Senin - Sabtu: 08:30 - 18:00 (Tutup Hari Minggu & Libur Nasional)'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={`https://wa.me/${formatWhatsAppNumber(settings.whatsappNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-white" /> {language === 'EN' ? 'Direct Chat With WhatsApp Admin' : language === 'MS' ? 'Seminit Chat Dengan Admin WhatsApp' : 'Chat Langsung Dengan Admin WhatsApp'}
              </a>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#EADBC8] shadow-md space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#800020] border-b border-stone-200 pb-3">
              {language === 'EN' ? 'Send Message Inquiry' : language === 'MS' ? 'Hantar Pertanyaan Mesej' : 'Kirim Pertanyaan Mesej'}
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); alert(language === 'EN' ? 'Message sent! Our admin team will respond via WhatsApp or Email.' : language === 'MS' ? 'Mesej dihantar! Pasukan admin kami akan membalas melalui WhatsApp atau E-mel.' : 'Pesan terkirim! Tim admin kami akan merespons melalui WhatsApp atau Email.'); }} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">{language === 'EN' ? 'Your Name' : language === 'MS' ? 'Nama Anda' : 'Nama Anda'}</label>
                <input type="text" required placeholder="Ahmad Naufal" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">{language === 'EN' ? 'WhatsApp Phone Number' : language === 'MS' ? 'Nombor Telefon WhatsApp' : 'Nomor HP WhatsApp'}</label>
                <input type="tel" required placeholder="+60123456789" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">{language === 'EN' ? 'Inquiry Message' : language === 'MS' ? 'Mesej Pertanyaan' : 'Pesan Pertanyaan'}</label>
                <textarea rows={4} required placeholder={language === 'EN' ? 'Ask about commercial bulk rates, product availability...' : language === 'MS' ? 'Tanya tentang kadar pukal komersial, ketersediaan produk...' : 'Tanyakan seputar harga grosir, ketersediaan stok...'} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
              </div>

              <button type="submit" className="w-full py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold rounded-xl shadow">
                {language === 'EN' ? 'Submit Inquiry' : language === 'MS' ? 'Hantar Pertanyaan' : 'Kirim Pertanyaan'}
              </button>
            </form>
          </div>

        </div>

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
