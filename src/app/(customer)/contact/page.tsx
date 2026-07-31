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
  const { t } = useLanguage();
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
            CUSTOMER SUPPORT & HELPLINE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#2B1B1B]">
            Contact FBS Bakery World
          </h1>
          <p className="text-stone-600 text-sm mt-3">
            Have questions regarding baking supplies, bulk pricing, or order status? Our support team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-[#EADBC8] shadow-md space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#800020] border-b border-stone-200 pb-3">
              Store Information
            </h2>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">Warehouse Address:</strong>
                  <span>{settings.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">WhatsApp Support Line:</strong>
                  <span>+{settings.whatsappNumber}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">Email Inquiry:</strong>
                  <span>{settings.supportEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">Operating Hours:</strong>
                  <span>Monday - Saturday: 8:30 AM - 6:00 PM (Closed on Sunday & Public Holidays)</span>
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
                <MessageCircle className="w-5 h-5 fill-white" /> Direct Chat With WhatsApp Admin
              </a>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#EADBC8] shadow-md space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#800020] border-b border-stone-200 pb-3">
              Send Message Inquiry
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our admin team will respond via WhatsApp or Email.'); }} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Your Name</label>
                <input type="text" required placeholder="Ahmad Naufal" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">WhatsApp Phone Number</label>
                <input type="tel" required placeholder="+60123456789" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Inquiry Message</label>
                <textarea rows={4} required placeholder="Ask about commercial bulk rates, product availability..." className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
              </div>

              <button type="submit" className="w-full py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold rounded-xl shadow">
                Submit Inquiry
              </button>
            </form>
          </div>

        </div>

        {/* POLICY & HELP CENTER ACCORDION / CARDS FOR FOOTER LINKS */}
        <div className="space-y-8 pt-6 border-t border-[#EADBC8]">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1B1B]">
              Panduan, Kebijakan & Bantuan Pelanggan
            </h2>
            <p className="text-xs text-stone-500">
              Jawaban lengkap atas pertanyaan pengiriman, pembayaran, serta syarat garansi bahan baku kue FBS Bakery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700">
            
            {/* HOW TO ORDER */}
            <div id="faq" className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#800020] uppercase tracking-wider flex items-center gap-2">
                🛍️ 1. How To Order (Cara Pemesanan)
              </h3>
              <p className="leading-relaxed text-stone-600">
                Pilih produk kue/bahan baku yang Anda inginkan ➔ Masukkan ke Keranjang ➔ Klik <strong>Checkout WhatsApp</strong>. Sistem akan otomatis menyusun rincian pesanan Anda dan mengarahkan langsung ke WhatsApp Admin untuk konfirmasi pembayaran & alamat.
              </p>
            </div>

            {/* SHIPPING TERMS */}
            <div id="shipping" className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#800020] uppercase tracking-wider flex items-center gap-2">
                🚚 2. Shipping Terms (Syarat Pengiriman)
              </h3>
              <p className="leading-relaxed text-stone-600">
                Pengiriman mencakup seluruh wilayah Malaysia (Semenanjung, Sabah, Sarawak) & Indonesia. Bahan segar (mentega/cokelat) dikemas dengan pelindung pendingin insulated thermal wrap. Gratis ongkir untuk pembelian di atas RM150.
              </p>
            </div>

            {/* PAYMENT METHOD */}
            <div id="payment" className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#800020] uppercase tracking-wider flex items-center gap-2">
                💳 3. Payment Method (Metode Pembayaran)
              </h3>
              <p className="leading-relaxed text-stone-600">
                Kami menerima Transfer Bank Langsung (FPX / DuitNow Malaysia / Transfer Bank Indonesia), E-Wallet (Touch n Go, GrabPay), serta Faktur Pembayaran Grosir untuk mitra toko kue terdaftar.
              </p>
            </div>

            {/* RETURN & REFUND POLICY */}
            <div id="refund" className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#800020] uppercase tracking-wider flex items-center gap-2">
                🔄 4. Return & Refund Policy (Kebijakan Pengembalian)
              </h3>
              <p className="leading-relaxed text-stone-600">
                Garansi 100% penggantian jika produk yang diterima rusak, segel terbuka, atau tidak sesuai pesanan. Cukup foto kemasan & kirimkan bukti video unboxing ke WhatsApp Admin dalam waktu 24 jam setelah paket diterima.
              </p>
            </div>

            {/* PRIVACY POLICY */}
            <div id="privacy" className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#800020] uppercase tracking-wider flex items-center gap-2">
                🔒 5. Privacy Policy (Kebijakan Privasi)
              </h3>
              <p className="leading-relaxed text-stone-600">
                Data pribadi (nama, nomor telepon, dan alamat pengiriman) hanya digunakan untuk memproses pesanan dan pengiriman barang. Kami menjamin data Anda aman dan tidak pernah dijual atau dibagikan ke pihak ketiga.
              </p>
            </div>

            {/* TERMS & CONDITIONS */}
            <div id="terms" className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#800020] uppercase tracking-wider flex items-center gap-2">
                📜 6. Terms & Conditions (Syarat & Ketentuan)
              </h3>
              <p className="leading-relaxed text-stone-600">
                Semua bahan kue yang dijual dijamin 100% Halal dan asli. Harga grosir berlaku untuk kuantitas minimum per karung/karton. Penawaran harga spesial dapat berubah sewaktu-waktu sesuai harga pasar bahan mentah dunia.
              </p>
            </div>

          </div>
        </div>

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
