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

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
