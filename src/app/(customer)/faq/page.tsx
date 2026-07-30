'use client';

import React from 'react';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How does ordering work on FBS Bakery World?',
      a: 'Browse our catalog, select your desired packaging size (e.g. 500g, 1kg, 5kg, 25kg), add items to cart, and click "Checkout via WhatsApp". The website automatically generates your Order ID and formatted WhatsApp order summary for instant confirmation with our admin team.'
    },
    {
      q: 'Are all baking ingredients Halal certified?',
      a: 'Yes! We prioritize 100% Halal certified products. Every flour, chocolate, butter, yeast, and food color is verified with official Halal certification.'
    },
    {
      q: 'How do I pay for my order?',
      a: 'After reviewing your order on WhatsApp, our admin team will confirm final stock availability, delivery fees, and provide manual payment details (Instant Bank Transfer / QR Pay).'
    },
    {
      q: 'How do I track my delivery status?',
      a: 'Go to the "Track Order" page on our website, enter your Order ID (e.g. #FBS-20260728-101) and WhatsApp phone number to view live status updates and your courier resi tracking number (J&T Express, Ninja Van, Pos Laju).'
    },
    {
      q: 'Do you offer bulk wholesale prices for cafes and bakeries?',
      a: 'Yes, we supply commercial 5kg and 25kg bulk packaging for bakery businesses, cafes, and restaurants. Contact our admin via WhatsApp for custom wholesale rates.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        
        <div className="text-center max-w-xl mx-auto">
          <HelpCircle className="w-12 h-12 text-[#800020] mx-auto mb-2" />
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2B1B1B]">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-2">
            Common questions regarding ordering, payment, shipping, and wholesale bakery supplies.
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
