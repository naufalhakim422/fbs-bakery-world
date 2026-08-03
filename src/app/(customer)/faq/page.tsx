'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const { t, language } = useLanguage();

  const faqs = [
    {
      q: language === 'EN' ? 'How does ordering work on FBS Bakery World?' : language === 'MS' ? 'Bagaimanakah pesanan berfungsi di FBS Bakery World?' : 'Bagaimana cara pemesanan di FBS Bakery World?',
      a: language === 'EN' ? 'Browse our catalog, select your desired packaging size (e.g. 500g, 1kg, 5kg, 25kg), add items to cart, and click "Checkout via WhatsApp". The website automatically generates your Order ID and formatted WhatsApp order summary for instant confirmation with our admin team.' : language === 'MS' ? 'Terokai katalog kami, pilih saiz pembungkusan (cth: 500g, 1kg, 5kg, 25kg), tambah ke troli, dan klik "Checkout via WhatsApp". Laman web menjana Nombor Pesanan dan ringkasan WhatsApp secara automatik.' : 'Jelajahi katalog kami, pilih ukuran kemasan (misal 500g, 1kg, 5kg, 25kg), tambahkan ke keranjang, dan klik "Checkout via WhatsApp". Website otomatis membuat ID Pesanan dan ringkasan WhatsApp.'
    },
    {
      q: language === 'EN' ? 'Are all baking ingredients Halal certified?' : language === 'MS' ? 'Adakah semua bahan bakeri disahkan Halal?' : 'Apakah semua bahan baking tersertifikasi Halal?',
      a: language === 'EN' ? 'Yes! We prioritize 100% Halal certified products. Every flour, chocolate, butter, yeast, and food color is verified with official Halal certification.' : language === 'MS' ? 'Ya! Kami mengutamakan produk 100% disahkan Halal. Setiap tepung, coklat, mentega, dan pewarna disahkan dengan sijil Halal rasmi.' : 'Ya! Kami memprioritaskan 100% produk tersertifikasi Halal. Setiap tepung, cokelat, mentega, dan pewarna telah diverifikasi.'
    },
    {
      q: language === 'EN' ? 'How do I pay for my order?' : language === 'MS' ? 'Bagaimanakah saya membayar pesanan saya?' : 'Bagaimana cara membayar pesanan saya?',
      a: language === 'EN' ? 'After reviewing your order on WhatsApp, our admin team will confirm final stock availability, delivery fees, and provide manual payment details (Instant Bank Transfer / QR Pay).' : language === 'MS' ? 'Semasa menyemak pesanan di WhatsApp, pasukan admin kami akan mengesahkan stok, caj penghantaran, dan memberikan butiran pembayaran (Pindahan Bank / QR Pay).' : 'Setelah memeriksa pesanan di WhatsApp, tim admin akan mengonfirmasi stok, ongkir, dan memberikan detail pembayaran bank / QR Pay.'
    },
    {
      q: language === 'EN' ? 'How do I track my delivery status?' : language === 'MS' ? 'Bagaimanakah cara menjejak status penghantaran saya?' : 'Bagaimana cara melacak status pengiriman saya?',
      a: language === 'EN' ? 'Go to the "Track Order" page on our website, enter your Order ID (e.g. #FBS-20260728-101) and WhatsApp phone number to view live status updates and your courier resi tracking number (J&T Express, Ninja Van, Pos Laju).' : language === 'MS' ? 'Pergi ke halaman "Jejak Pesanan", masukkan Nombor Pesanan dan nombor telefon WhatsApp anda untuk melihat kemas kini status dan nombor resi kurier.' : 'Buka halaman "Lacak Pesanan", masukkan ID Pesanan dan nomor WhatsApp Anda untuk melihat pembaruan status dan nomor resi kurir.'
    },
    {
      q: language === 'EN' ? 'Do you offer bulk wholesale prices for cafes and bakeries?' : language === 'MS' ? 'Adakah anda menawarkan harga borong pukal untuk kafe dan kedai roti?' : 'Apakah ada harga grosir untuk kafe dan bakery?',
      a: language === 'EN' ? 'Yes, we supply commercial 5kg and 25kg bulk packaging for bakery businesses, cafes, and restaurants. Contact our admin via WhatsApp for custom wholesale rates.' : language === 'MS' ? 'Ya, kami membekalkan pembungkusan pukal 5kg dan 25kg komersial untuk perniagaan bakeri, kafe, dan restoran. Hubungi admin kami melalui WhatsApp.' : 'Ya, kami menyediakan kemasan komersial 5kg dan 25kg untuk bisnis bakery, kafe, dan restoran. Hubungi admin kami via WhatsApp.'
    }
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        
        <div className="text-center max-w-xl mx-auto">
          <HelpCircle className="w-12 h-12 text-[#800020] mx-auto mb-2" />
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2B1B1B]">
            {t.faq.title}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-2">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#EADBC8] shadow-sm space-y-2">
              <h3 className="font-serif font-bold text-base text-[#800020]">{faq.q}</h3>
              <p className="text-stone-700 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
