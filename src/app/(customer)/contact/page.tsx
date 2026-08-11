'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { useNotification } from '@/lib/notification-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { formatWhatsAppNumber, cleanPhoneNumber } from '@/lib/whatsapp';
import { MapPin, Phone, Mail, MessageCircle, Clock, Loader2, Send } from 'lucide-react';

export default function ContactPage() {
  const { t, language } = useLanguage();
  const { showToast } = useNotification();
  const [settings, setSettings] = useState(db.getStoreSettings());

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadLiveData = () => {
      setSettings(db.getStoreSettings());
    };
    loadLiveData();

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          db.updateStoreSettings(data.settings);
          setSettings(data.settings);
        }
      })
      .catch(err => console.warn('Contact page settings fetch warning:', err));

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    window.addEventListener('focus', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
      window.removeEventListener('focus', loadLiveData);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.message.trim()) {
      showToast('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      if (response.ok && result.success) {
        showToast(
          'Message sent successfully',
          'Thank you for contacting FBS Baker! We will get back to you shortly.',
          'success'
        );
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        showToast(
          'Failed to Send Message',
          result.message || result.error || 'An error occurred while sending your message. Please try again.',
          'error'
        );
      }
    } catch (err: any) {
      console.error('Failed to submit contact form:', err);
      showToast(
        'Connection Error',
        'Unable to connect to the server. Please check your network and try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <span>{settings?.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">{language === 'EN' ? 'WhatsApp Support Line:' : language === 'MS' ? 'Talian Sokongan WhatsApp:' : 'Layanan WhatsApp:'}</strong>
                  <span>+{settings?.whatsappNumber}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">{language === 'EN' ? 'Email Inquiry:' : language === 'MS' ? 'E-mel Pertanyaan:' : 'Email Pertanyaan:'}</strong>
                  <span>{settings?.supportEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">{language === 'EN' ? 'Operating Hours:' : language === 'MS' ? 'Waktu Operasi:' : 'Jam Operasional:'}</strong>
                  <span>{settings?.operatingHours || (language === 'EN' ? 'Monday - Saturday: 8:30 AM - 6:00 PM (Closed on Sunday & Public Holidays)' : language === 'MS' ? 'Isnin - Sabtu: 8:30 PG - 6:00 PTG (Tutup pada Ahad & Cuti Umum)' : 'Senin - Sabtu: 08:30 - 18:00 (Tutup Hari Minggu & Libur Nasional)')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={`https://wa.me/${cleanPhoneNumber(settings?.whatsappNumber || '')}`}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {language === 'EN' ? 'Your Name' : language === 'MS' ? 'Nama Anda' : 'Nama Anda'} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ahmad Naufal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#800020] disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {language === 'EN' ? 'Email Address' : language === 'MS' ? 'Alamat E-mel' : 'Alamat Email'} <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#800020] disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {language === 'EN' ? 'WhatsApp Phone Number' : language === 'MS' ? 'Nombor Telefon WhatsApp' : 'Nomor HP WhatsApp'} <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+60123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#800020] disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {language === 'EN' ? 'Subject' : language === 'MS' ? 'Subjek Pertanyaan' : 'Subjek Pesanan'} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'EN' ? 'Bulk pricing inquiry, product availability...' : 'Pertanyaan harga grosir, bahan kue...'}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#800020] disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {language === 'EN' ? 'Inquiry Message' : language === 'MS' ? 'Mesej Pertanyaan' : 'Pesan Pertanyaan'} <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={language === 'EN' ? 'Ask about commercial bulk rates, product availability...' : language === 'MS' ? 'Tanya tentang kadar pukal komersial, ketersediaan produk...' : 'Tanyakan seputar harga grosir, ketersediaan stok...'}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#800020] disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:bg-stone-400 disabled:cursor-not-allowed active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'EN' ? 'Sending Message...' : language === 'MS' ? 'Menghantar Mesej...' : 'Mengirim Pesan...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{language === 'EN' ? 'Submit Inquiry' : language === 'MS' ? 'Hantar Pertanyaan' : 'Kirim Pertanyaan'}</span>
                  </>
                )}
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
