'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { formatWhatsAppNumber } from '@/lib/whatsapp';
import { 
  MessageCircle, 
  ExternalLink, 
  QrCode, 
  Send, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Zap, 
  Smartphone, 
  Info 
} from 'lucide-react';

export default function AdminWhatsAppChatPage() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<any>(db.getStoreSettings());
  const [targetPhone, setTargetPhone] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'QUICK_SEND' | 'TEMPLATES'>('CONSOLE');

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(db.getStoreSettings());
    };
    handleUpdate();

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const s = data.settings || data;
        if (s && s.whatsappNumber) {
          setSettings(s);
          db.updateStoreSettings(s);
        }
      })
      .catch(err => console.warn('[WhatsApp Console] Settings fetch error:', err));

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fbs_db_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fbs_db_updated', handleUpdate);
    };
  }, []);

  const storePhone = formatWhatsAppNumber(settings.whatsappNumber || '60103574196');
  const storePhone2 = settings.whatsappNumber2 ? formatWhatsAppNumber(settings.whatsappNumber2) : '';

  const openWhatsAppWeb = (phone?: string, text?: string) => {
    const cleanNum = phone ? formatWhatsAppNumber(phone) : storePhone;
    const msg = text ? encodeURIComponent(text) : '';
    const url = cleanNum ? `https://wa.me/${cleanNum}?text=${msg}` : `https://web.whatsapp.com/`;
    window.open(url, '_blank');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickTemplates = [
    {
      title: 'Konfirmasi Pesanan Baru',
      desc: 'Kirim rincian pesanan & status pembayaran kepada pelanggan',
      text: `Halo Kak, terima kasih telah berbelanja di *FBS Bakery World*! 🥖✨\nPesanan Anda telah kami terima dan sedang diproses oleh tim kami. Jika ada pertanyaan, Anda dapat membalas pesan ini.`
    },
    {
      title: 'Pengiriman & No. Resi Courier',
      desc: 'Informasikan nomor resi kurir pengiriman pesanan',
      text: `Halo Kak, pesanan *FBS Bakery World* Anda telah dikirim! 🚚💨\nNo. Resi Pengiriman: *[MASUKKAN_RESI]*\nAnda dapat mengacak pesanan di halaman Track Order website kami.`
    },
    {
      title: 'Konsultasi Stok & Bahan Bakeri',
      desc: 'Bantu pelanggan mengenai ketersediaan bahan kue',
      text: `Halo Kak, terima kasih telah menghubungi *FBS Bakery World*. Ada bahan kue atau peralatan bakeri apa yang ingin Anda konsultasikan hari ini? 😊`
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-[#4A0010] to-[#800020] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#D4AF37]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-widest bg-[#D4AF37]/20 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                LIVE WHATSAPP CONSOLE
              </span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#F7E7CE]">
              Konsol Chat WhatsApp Admin
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Kelola chat pelanggan, kirim konfirmasi pesanan, dan beri dukungan langsung dari dalam panel Admin CMS FBS Bakery World.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openWhatsAppWeb()}
              className="px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka WhatsApp Web Tab Baru</span>
            </button>
          </div>
        </div>

        {/* Store Active Numbers Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-stone-400 font-medium">Nomor Toko Aktif:</span>
            <div className="flex items-center gap-2 font-mono font-bold text-[#F7E7CE] bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Phone className="w-3.5 h-3.5 text-[#25D366]" />
              <span>+{storePhone}</span>
            </div>
            {storePhone2 && (
              <div className="flex items-center gap-2 font-mono font-bold text-[#F7E7CE] bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>+{storePhone2}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Terhubung Langsung ke API Store Settings</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CONSOLE')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CONSOLE'
              ? 'bg-[#800020] text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Jendela WhatsApp Web Console</span>
        </button>

        <button
          onClick={() => setActiveTab('QUICK_SEND')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'QUICK_SEND'
              ? 'bg-[#800020] text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Kirim Pesan Cepat Tanpa Simpan Kontak</span>
        </button>

        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'TEMPLATES'
              ? 'bg-[#800020] text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Copy className="w-4 h-4" />
          <span>Template Pesan Otomatis</span>
        </button>
      </div>

      {/* TAB 1: EMBEDDED CONSOLE */}
      {activeTab === 'CONSOLE' && (
        <div className="space-y-4">
          
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Petunjuk Penggunaan WhatsApp Web di Admin CMS:</h4>
                <p className="text-[11px] text-stone-600">
                  Pindai (Scan) Kode QR WhatsApp sekali saja dari HP toko Anda. Sesi akan tersimpan aman di browser Admin CMS.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => openWhatsAppWeb()}
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Layar Penuh</span>
            </button>
          </div>

          {/* Embedded Web Console Box */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
            <div className="bg-stone-100 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-stone-600 ml-2">web.whatsapp.com (Embedded Console)</span>
              </div>
              
              <button 
                onClick={() => {
                  const iframe = document.getElementById('wa-iframe') as HTMLIFrameElement;
                  if (iframe) iframe.src = iframe.src;
                }}
                className="text-stone-500 hover:text-stone-800 text-xs font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Frame</span>
              </button>
            </div>

            <div className="flex-1 relative bg-stone-900 min-h-[550px]">
              <iframe
                id="wa-iframe"
                src="https://web.whatsapp.com/"
                className="w-full h-full min-h-[550px] border-0"
                title="WhatsApp Web Console"
                allow="clipboard-read; clipboard-write; camera; microphone"
              />
              
              {/* Fallback Overlay Notification for Browser Security Limits */}
              <div className="p-6 bg-stone-900 text-white text-center space-y-4 max-w-md mx-auto my-12 rounded-3xl border border-stone-700 shadow-2xl">
                <MessageCircle className="w-12 h-12 text-[#25D366] mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-[#F7E7CE]">Konsol WhatsApp Web Siap Digunakan</h3>
                  <p className="text-xs text-stone-400">
                    Jika browser Anda memblokir tampilan iframe WhatsApp karena keamanan *CSP*, klik tombol di bawah untuk langsung membuka WhatsApp Web resmi dalam 1 detik.
                  </p>
                </div>
                <button
                  onClick={() => openWhatsAppWeb()}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>BUKA KONSOL WHATSAPP WEB RESMI</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: QUICK SEND */}
      {activeTab === 'QUICK_SEND' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xl max-w-2xl space-y-6">
          <div className="space-y-1 border-b border-stone-100 pb-4">
            <h3 className="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Kirim Pesan Langsung Tanpa Perlu Menyimpan Nomor Kontak</span>
            </h3>
            <p className="text-xs text-stone-500">
              Masukkan nomor telepon pelanggan untuk langsung membuka sesi percakapan WhatsApp baru secara instan.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Nomor Telepon Pelanggan / WhatsApp
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Contoh: 60123456789 atau 081234567890"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-2xl text-sm font-mono text-stone-900 focus:outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20"
                />
                <Phone className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Pesan Draf (Opsional)
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan draf pesan yang ingin dikirimkan..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3.5 border border-stone-300 rounded-2xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20"
              />
            </div>

            <button
              onClick={() => openWhatsAppWeb(targetPhone, customMessage)}
              disabled={!targetPhone.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Buka Percakapan WhatsApp Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickTemplates.map((tpl, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-md flex flex-col justify-between space-y-4 hover:border-[#800020]/40 transition-all">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#800020] bg-stone-100 px-2.5 py-1 rounded-full">
                  Template #{i + 1}
                </span>
                <h4 className="font-bold text-sm text-stone-900">{tpl.title}</h4>
                <p className="text-[11px] text-stone-500">{tpl.desc}</p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs font-mono text-stone-700 whitespace-pre-wrap leading-relaxed">
                  {tpl.text}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => handleCopy(tpl.text)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
                </button>
                <button
                  onClick={() => openWhatsAppWeb('', tpl.text)}
                  className="py-2 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center"
                  title="Kirim via WhatsApp Web"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
