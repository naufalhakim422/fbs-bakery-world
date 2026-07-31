'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { compressImageFile } from '@/lib/image-compressor';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { extractMapsEmbedUrl, extractMapsAppUrl } from '@/lib/whatsapp';
import { Banner, Product, WholesalePromoBanner } from '@/types';
import { Settings, Save, CheckCircle2, MessageCircle, FileText, Upload, X, Image as ImageIcon, Sparkles, Layout, Home, Key, ShieldCheck, Eye, EyeOff, Search } from 'lucide-react';

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'store' | 'about' | 'home' | 'security'>('store');

  const currentStore = db.getStoreSettings();
  const currentAbout = db.getAboutSettings();
  const currentHome = db.getHomePageSettings();
  const currentCreds = db.getAdminCredentials();

  const [storeForm, setStoreForm] = useState({
    whatsappNumber: currentStore.whatsappNumber,
    whatsappNumber2: currentStore.whatsappNumber2 || '60168765432',
    whatsappBusinessName: currentStore.whatsappBusinessName,
    storeName: currentStore.storeName,
    companyRegistrationName: currentStore.companyRegistrationName || 'FBS Bakery World (M) Sdn. Bhd. (1080422-V)',
    operatingHours: currentStore.operatingHours || 'Mon - Fri | 8.30am - 5.30pm',
    currency: currentStore.currency,
    announcement: currentStore.announcement,
    supportEmail: currentStore.supportEmail,
    address: currentStore.address,
    googleMapsEmbedUrl: currentStore.googleMapsEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15935.26798188147!2d101.686855!3d3.139003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc362807480d39%3A0x8c3a3b0487042a98!2sKuala%20Lumpur%2C%20Federal%20Territory%20of%20Kuala%20Lumpur%2C%20Malaysia!5e0!3m2!1sen!2smy!4v1700000000000!5m2!1sen!2smy',
    googleMapsAppUrl: currentStore.googleMapsAppUrl || 'https://maps.google.com/?q=FBS+Bakery+World+Malaysia',
  });

  const [aboutForm, setAboutForm] = useState({
    heroTitle: currentAbout.heroTitle,
    heroSubtitle: currentAbout.heroSubtitle,
    storyTitle: currentAbout.storyTitle,
    storyParagraph1: currentAbout.storyParagraph1,
    storyParagraph2: currentAbout.storyParagraph2,
    heroImage: currentAbout.heroImage,
    statYears: currentAbout.statYears,
    statBakers: currentAbout.statBakers,
    statProducts: currentAbout.statProducts,
    statSatisfaction: currentAbout.statSatisfaction,
    visionText: currentAbout.visionText,
    missionText: currentAbout.missionText,
  });

  const [homeForm, setHomeForm] = useState({
    heroTagline: currentHome.heroTagline,
    heroHeading: currentHome.heroHeading,
    heroSubheading: currentHome.heroSubheading,
    heroPrimaryBtnText: currentHome.heroPrimaryBtnText,
    heroPrimaryBtnLink: currentHome.heroPrimaryBtnLink,
    heroSecondaryBtnText: currentHome.heroSecondaryBtnText,
    heroSecondaryBtnLink: currentHome.heroSecondaryBtnLink,
    heroBgImage: currentHome.heroBgImage,
    featuredTitle: currentHome.featuredTitle,
    featuredSubtitle: currentHome.featuredSubtitle,
    bestsellerTitle: currentHome.bestsellerTitle,
    bestsellerSubtitle: currentHome.bestsellerSubtitle,
    promoTitle: currentHome.promoTitle,
    promoSubtitle: currentHome.promoSubtitle,
    promoImage: currentHome.promoImage,
    bannerSpeed: (currentHome as any).bannerSpeed || '60000',
  });

  const [credsForm, setCredsForm] = useState({
    email: currentCreds.email,
    password: currentCreds.password,
  });

  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [aboutImagePreview, setAboutImagePreview] = useState<string>(currentAbout.heroImage);
  const [homeHeroBgPreview, setHomeHeroBgPreview] = useState<string>(currentHome.heroBgImage);
  const [homePromoImagePreview, setHomePromoImagePreview] = useState<string>(currentHome.promoImage);

  const [isSavedStore, setIsSavedStore] = useState(false);
  const [isSavedAbout, setIsSavedAbout] = useState(false);
  const [isSavedHome, setIsSavedHome] = useState(false);
  const [isSavedCreds, setIsSavedCreds] = useState(false);

  // Confirm Modal State
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<(() => void) | null>(null);
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState('');
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState('');

  const [banners, setBanners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [wholesaleBanners, setWholesaleBanners] = useState<WholesalePromoBanner[]>([]);
  const [productSearchTerms, setProductSearchTerms] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setAboutImagePreview(currentAbout.heroImage);
    setHomeHeroBgPreview(currentHome.heroBgImage);
    setHomePromoImagePreview(currentHome.promoImage);
    setCredsForm(db.getAdminCredentials());
    setBanners(db.getBanners());
    setProducts(db.getProducts());

    const cHome = db.getHomePageSettings();
    let wBans = cHome.wholesaleBanners || [];
    if (wBans.length < 4) {
      wBans = [
        {
          id: 'wpromo-1',
          title: 'Diskon Komersial & Pasokan Grosir Baker',
          subtitle: 'Dapatkan penawaran harga spesial untuk pembelian karung 5kg & 25kg.',
          imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
          buttonText: 'MINTA KATALOG GROSIR WA',
          buttonLink: 'https://wa.me/60123456789?text=Halo%20FBS%20Bakery,%20saya%20ingin%20minta%20katalog%20grosir',
        },
        {
          id: 'wpromo-2',
          title: 'Paket Impor Semolina & Tepung Italia 25kg',
          subtitle: 'Stok karung grosir 25kg khusus toko roti & pabrik kue.',
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
          buttonText: 'LIHAT TEPUNG GROSIR',
          buttonLink: '/products/semolina-flour-premium-grade',
        },
        {
          id: 'wpromo-3',
          title: 'Grosir Kyoto Uji Matcha Grade A Bulk',
          subtitle: 'Kemasan drum aluminium 1kg & 5kg untuk cafe & artisan bakery.',
          imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
          buttonText: 'CEK UJI MATCHA GROSIR',
          buttonLink: '/products/uji-matcha-powder-grade-a',
        },
        {
        }
      ];
    }
    setWholesaleBanners(wBans);
  }, []);

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveModalTitle('Simpan Pengaturan Toko?');
    setSaveModalMessage('Apakah Anda yakin ingin menyimpan perubahan informasi toko, alamat gudang, & nomor WhatsApp ini?');
    setPendingSaveAction(() => () => {
      db.updateStoreSettings(storeForm);
      setIsSavedStore(true);
      setTimeout(() => setIsSavedStore(false), 2500);
      setConfirmSaveOpen(false);
    });
    setConfirmSaveOpen(true);
  };

  const handleAboutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveModalTitle('Simpan Halaman Tentang Kami?');
    setSaveModalMessage('Apakah Anda yakin ingin menyimpan perubahan tata letak & teks Halaman Tentang Kami?');
    setPendingSaveAction(() => () => {
      db.updateAboutSettings(aboutForm);
      setIsSavedAbout(true);
      setTimeout(() => setIsSavedAbout(false), 2500);
      setConfirmSaveOpen(false);
    });
    setConfirmSaveOpen(true);
  };

  const handleHomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveModalTitle('Simpan Tata Letak Beranda Utama?');
    setSaveModalMessage('Apakah Anda yakin ingin menyimpan perubahan tata letak Beranda & Banner promo?');
    setPendingSaveAction(() => () => {
      db.updateHomePageSettings({
        ...homeForm,
        wholesaleBanners: wholesaleBanners,
      });
      db.saveAllBanners(banners);
      setIsSavedHome(true);
      setTimeout(() => setIsSavedHome(false), 2500);
      setConfirmSaveOpen(false);
    });
    setConfirmSaveOpen(true);
  };

  const handleCredsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveModalTitle('Simpan Kredensial Login Admin?');
    setSaveModalMessage('Apakah Anda yakin ingin memperbarui Username & Password Login Portal Admin ini?');
    setPendingSaveAction(() => () => {
      db.updateAdminCredentials(credsForm);
      setIsSavedCreds(true);
      setTimeout(() => setIsSavedCreds(false), 2500);
      setConfirmSaveOpen(false);
    });
    setConfirmSaveOpen(true);
  };

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAboutImagePreview(dataUrl);
        setAboutForm(prev => ({ ...prev, heroImage: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHomeHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setHomeHeroBgPreview(dataUrl);
        setHomeForm(prev => ({ ...prev, heroBgImage: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHomePromoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setHomePromoImagePreview(dataUrl);
        setHomeForm(prev => ({ ...prev, promoImage: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Website & Store Settings CMS</h1>
          <p className="text-xs text-stone-500 mt-0.5">Configure store info, WhatsApp helpline, edit Home & About layouts, and manage Admin Login credentials.</p>
        </div>

        {/* 4-Tab Switcher */}
        <div className="flex flex-wrap bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold w-full xl:w-auto gap-1">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'store' ? 'bg-[#800020] text-[#D4AF37] shadow' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Settings className="w-4 h-4" /> Store & WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'home' ? 'bg-[#800020] text-[#D4AF37] shadow' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Home className="w-4 h-4" /> Edit Home Layout
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'about' ? 'bg-[#800020] text-[#D4AF37] shadow' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Edit About Us
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'security' ? 'bg-[#800020] text-[#D4AF37] shadow' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Key className="w-4 h-4" /> Admin Password
          </button>
        </div>
      </div>

      {/* TAB 1: STORE & WHATSAPP SETTINGS */}
      {activeTab === 'store' && (
        <form onSubmit={handleStoreSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs animate-fade-in">
          
          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#25D366]" /> WhatsApp Checkout Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Nomor WhatsApp Admin 1 (Ritel & Layanan)</label>
              <input 
                type="text"
                required
                placeholder="e.g. 60123456789"
                value={storeForm.whatsappNumber}
                onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl font-mono text-stone-900"
              />
              <span className="text-[10px] text-stone-500 block mt-1">Format: 60123456789 atau 08123456789 (tanpa tanda +)</span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Nomor WhatsApp Admin 2 (Grosir & Komersial)</label>
              <input 
                type="text"
                placeholder="e.g. 60168765432"
                value={storeForm.whatsappNumber2 || ''}
                onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber2: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl font-mono text-stone-900"
              />
              <span className="text-[10px] text-stone-500 block mt-1">Nomor opsional untuk penawaran grosir / komersial</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">Nama Bisnis WhatsApp</label>
            <input 
              type="text"
              required
              value={storeForm.whatsappBusinessName}
              onChange={(e) => setStoreForm({ ...storeForm, whatsappBusinessName: e.target.value })}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 pt-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#800020]" /> General Store Details & Announcements
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Announcement Bar Text</label>
              <input 
                type="text"
                required
                value={storeForm.announcement}
                onChange={(e) => setStoreForm({ ...storeForm, announcement: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Nama Perusahaan / Pendaftaran (Tampil Di Footer)</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. FBS Bakery World (M) Sdn. Bhd. (1080422-V)"
                  value={storeForm.companyRegistrationName}
                  onChange={(e) => setStoreForm({ ...storeForm, companyRegistrationName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Waktu Operasional Toko (Tampil Di Footer)</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Mon - Fri | 8.30am - 5.30pm"
                  value={storeForm.operatingHours}
                  onChange={(e) => setStoreForm({ ...storeForm, operatingHours: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Store Name</label>
                <input 
                  type="text"
                  required
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Support Email</label>
                <input 
                  type="email"
                  required
                  value={storeForm.supportEmail}
                  onChange={(e) => setStoreForm({ ...storeForm, supportEmail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Warehouse Address (Tampil di Footer Website)</label>
              <textarea
                rows={2}
                required
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            {/* DYNAMIC GOOGLE MAPS EMBED CONFIGURATION FOR STAFF */}
            <div className="pt-3 space-y-4 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
              <h3 className="font-serif text-sm font-bold text-[#800020] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> INFORMASIKAN LOKASI TOKO DI GOOGLE MAPS (TERDETEKSI SECARA OTOMATIS DI BAGIAN FOOTER)
              </h3>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Tautan Sematkan Google Maps (URL iFrame)</label>
                <input 
                  type="text"
                  required
                  placeholder="Paste HTML <iframe src='...'> atau URL Embed Google Maps"
                  value={storeForm.googleMapsEmbedUrl}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleaned = extractMapsEmbedUrl(raw, storeForm.address);
                    setStoreForm({ ...storeForm, googleMapsEmbedUrl: cleaned });
                  }}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl font-mono text-[11px] text-stone-900 bg-white"
                />
                <span className="text-[10px] text-stone-500 block mt-1">
                  💡 <strong>Cara mendapatkan:</strong> Buka Google Maps &gt; Cari Toko/Perusahaan &gt; Klik <strong>Bagikan (Share)</strong> &gt; Pilih tab <strong>Sematkan Peta (Embed a map)</strong> &gt; Salin & Tempel kode HTML di sini.
                </span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Tautan Aplikasi Google Maps (Bagikan Tautan Aplikasi HP / Petunjuk Arah)</label>
                <input 
                  type="text"
                  required
                  placeholder="https://maps.google.com/?q=FBS+Bakery+World"
                  value={storeForm.googleMapsAppUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, googleMapsAppUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl font-mono text-[11px] text-stone-900 bg-white"
                />
              </div>

              {/* LIVE MAP PREVIEW BOX IN ADMIN */}
              <div className="pt-2">
                <span className="block font-bold text-stone-700 uppercase mb-1.5 text-[11px]">
                  📌 Pratinjau Langsung Google Maps:
                </span>
                <div className="rounded-2xl overflow-hidden border border-stone-300 shadow-sm bg-stone-900 p-2 space-y-2">
                  <iframe
                    title="Admin Live Maps Preview"
                    src={extractMapsEmbedUrl(storeForm.googleMapsEmbedUrl, storeForm.address)}
                    width="100%"
                    height="160"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    className="rounded-xl w-full"
                  />
                  <div className="text-[10px] font-bold text-[#F7E7CE] bg-[#800020] px-3 py-1.5 rounded-xl flex items-center justify-between">
                    <span>📍 Peta Footer Terdeteksi Secara Otomatis!</span>
                    <a href={extractMapsAppUrl(storeForm.googleMapsAppUrl, storeForm.googleMapsEmbedUrl, storeForm.address)} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Coba Buka Aplikasi &rarr;</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSavedStore ? 'bg-emerald-600' : 'bg-[#800020] hover:bg-[#6F1D1B]'
            }`}
          >
            {isSavedStore ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Store Settings Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Store Settings
              </>
            )}
          </button>

        </form>
      )}

      {/* TAB 2: EDIT HOME PAGE LAYOUT & CONTENT */}
      {activeTab === 'home' && (
        <form onSubmit={handleHomeSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs animate-fade-in">
          
          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#800020]" /> Hero Section Banner & Headlines
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Hero Badge / Tagline</label>
              <input 
                type="text"
                required
                value={homeForm.heroTagline}
                onChange={(e) => setHomeForm({ ...homeForm, heroTagline: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Main Hero Heading</label>
              <input 
                type="text"
                required
                value={homeForm.heroHeading}
                onChange={(e) => setHomeForm({ ...homeForm, heroHeading: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-serif font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Hero Subheading / Description</label>
              <textarea 
                rows={3}
                required
                value={homeForm.heroSubheading}
                onChange={(e) => setHomeForm({ ...homeForm, heroSubheading: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Primary CTA Button Label</label>
                <input 
                  type="text"
                  required
                  value={homeForm.heroPrimaryBtnText}
                  onChange={(e) => setHomeForm({ ...homeForm, heroPrimaryBtnText: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Primary CTA Button Link</label>
                <input 
                  type="text"
                  required
                  value={homeForm.heroPrimaryBtnLink}
                  onChange={(e) => setHomeForm({ ...homeForm, heroPrimaryBtnLink: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-mono"
                />
              </div>
            </div>

            {/* MULTI BANNER SLIDER UPLOADER (4 BANNER SLOTS) */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-[#800020] uppercase text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" /> MULTI BANNER HERO SLIDER (MINIMAL 4 GAMBAR SLIDE)
                  </label>
                  <p className="text-stone-500 text-[11px]">
                    Upload 4 file gambar banner promo, hubungkan ke produk sasaran, dan atur tayangan slider di beranda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newSlot: Banner = {
                      id: `ban-${Date.now()}`,
                      title: `Slide Banner ${banners.length + 1}`,
                      subtitle: 'Deskripsi promo produk',
                      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
                      buttonText: 'SHOP NOW',
                      buttonLink: '/products',
                      status: true,
                    };
                    setBanners([...banners, newSlot]);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all border border-stone-300 flex items-center gap-1"
                >
                  + Tambah Slide Ke-{banners.length + 1}
                </button>
              </div>

              {/* SPEED INTERVAL SELECTOR */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                    ⏱️ DURASI JEDA SLIDE BANNER (AUTO-PLAY TIMING):
                  </label>
                  <p className="text-[11px] text-amber-800/80">
                    Atur seberapa lama gambar banner diam sebelum otomatis berganti ke slide berikutnya.
                  </p>
                </div>
                <select
                  value={(homeForm as any).bannerSpeed || '60000'}
                  onChange={(e) => setHomeForm({ ...homeForm, bannerSpeed: e.target.value } as any)}
                  className="px-3.5 py-2 bg-white border border-amber-300 rounded-xl font-bold text-xs text-[#800020] focus:outline-none shadow-sm"
                >
                  <option value="15000">15 Detik (Cepat)</option>
                  <option value="30000">30 Detik</option>
                  <option value="60000">1 Menit (Pilihan Anda / Recommended)</option>
                  <option value="120000">2 Menit</option>
                  <option value="300000">5 Menit (Sangat Lambat)</option>
                </select>
              </div>

              {/* 4 BANNER SLOTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((ban, bIdx) => (
                  <div key={ban.id} className="p-4 rounded-2xl border border-stone-300 bg-stone-50 space-y-3 relative shadow-sm">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="font-serif font-black text-xs text-[#800020] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center text-[10px]">
                          {bIdx + 1}
                        </span>
                        SLOT BANNER #{bIdx + 1}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBanners(banners.map(b => b.id === ban.id ? { ...b, status: !b.status } : b));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            ban.status ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {ban.status ? '✓ Active' : 'Off'}
                        </button>

                        <button
                          type="button"
                          title="Hapus Slot Banner Ini"
                          onClick={() => {
                            setConfirmDeleteTitle(`Hapus Slot Banner #${bIdx + 1}?`);
                            setConfirmDeleteMessage('Slot banner ini akan dihapus. Apakah Anda yakin?');
                            setPendingDeleteAction(() => () => setBanners(banners.filter(b => b.id !== ban.id)));
                            setConfirmDeleteOpen(true);
                          }}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </div>

                    {/* Image Preview & Upload Box */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase">
                        Upload Gambar Banner Slide #{bIdx + 1}
                      </label>
                      <div className="relative h-28 rounded-xl overflow-hidden border border-stone-300 bg-stone-900 group">
                        <img src={ban.imageUrl} alt={ban.title} className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                          <span>Ganti File Gambar</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressedDataUrl = await compressImageFile(file);
                                  setBanners(banners.map(b => b.id === ban.id ? { ...b, imageUrl: compressedDataUrl } : b));
                                } catch (err) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (reader.result) {
                                      setBanners(banners.map(b => b.id === ban.id ? { ...b, imageUrl: reader.result as string } : b));
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="Atau Paste URL Gambar..."
                        value={ban.imageUrl}
                        onChange={(e) => setBanners(banners.map(b => b.id === ban.id ? { ...b, imageUrl: e.target.value } : b))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-[10px] font-mono mt-1"
                      />
                      
                      {/* Searchable Product Target Picker */}
                      <div className="space-y-1 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                        <label className="block text-[10px] font-bold text-amber-900 uppercase flex items-center justify-between">
                          <span>🔍 Cari & Hubungkan Ke Produk:</span>
                          {ban.buttonLink && <span className="text-[9px] text-emerald-700 font-mono">✓ Link: {ban.buttonLink}</span>}
                        </label>

                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Ketik kata kunci... (e.g. tepung, matcha, cokelat)"
                            value={productSearchTerms[ban.id] || ''}
                            onChange={(e) => setProductSearchTerms({ ...productSearchTerms, [ban.id]: e.target.value })}
                            className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-[11px] font-bold text-stone-800 focus:outline-none focus:border-[#800020]"
                          />
                        </div>

                        <select
                          onChange={(e) => {
                            const pSlug = e.target.value;
                            if (!pSlug) return;
                            const selectedProd = products.find(p => p.slug === pSlug || p.id === pSlug);
                            if (selectedProd) {
                              setBanners(banners.map(b => b.id === ban.id ? {
                                ...b,
                                title: `${selectedProd.productName} Promo`,
                                imageUrl: selectedProd.mainImage,
                                buttonLink: `/products/${selectedProd.slug}`,
                              } : b));
                            }
                          }}
                          defaultValue=""
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-[11px] text-stone-800 focus:outline-none"
                        >
                          <option value="">
                            -- Pilih Hasil ({products.filter(p => p.productName.toLowerCase().includes((productSearchTerms[ban.id] || '').toLowerCase()) || p.brand.toLowerCase().includes((productSearchTerms[ban.id] || '').toLowerCase())).length} produk cocok) --
                          </option>
                          {products
                            .filter(p => p.productName.toLowerCase().includes((productSearchTerms[ban.id] || '').toLowerCase()) || p.brand.toLowerCase().includes((productSearchTerms[ban.id] || '').toLowerCase()))
                            .map(p => (
                              <option key={p.id} value={p.slug}>
                                📦 {p.productName} ({p.brand})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Banner Title & Target URL */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="block font-bold text-stone-600">Judul Slide</label>
                        <input
                          type="text"
                          value={ban.title}
                          onChange={(e) => setBanners(banners.map(b => b.id === ban.id ? { ...b, title: e.target.value } : b))}
                          className="w-full px-2 py-1 border border-stone-300 rounded font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-600">Target URL</label>
                        <input
                          type="text"
                          value={ban.buttonLink}
                          onChange={(e) => setBanners(banners.map(b => b.id === ban.id ? { ...b, buttonLink: e.target.value } : b))}
                          className="w-full px-2 py-1 border border-stone-300 rounded font-mono text-[9px]"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 pt-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#800020]" /> Section Titles & Promo Banner
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Featured Section Title</label>
                <input 
                  type="text"
                  required
                  value={homeForm.featuredTitle}
                  onChange={(e) => setHomeForm({ ...homeForm, featuredTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Featured Section Subtitle</label>
                <input 
                  type="text"
                  required
                  value={homeForm.featuredSubtitle}
                  onChange={(e) => setHomeForm({ ...homeForm, featuredSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Bestseller Section Title</label>
                <input 
                  type="text"
                  required
                  value={homeForm.bestsellerTitle}
                  onChange={(e) => setHomeForm({ ...homeForm, bestsellerTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Bestseller Section Subtitle</label>
                <input 
                  type="text"
                  required
                  value={homeForm.bestsellerSubtitle}
                  onChange={(e) => setHomeForm({ ...homeForm, bestsellerSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>
            </div>

            {/* 4 WHOLESALE PROMO BANNERS GRID */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-[#800020] uppercase text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" /> BANNER GROSIR & DISKON KOMERSIAL ( 4 BANNER SLOTS )
                  </label>
                  <p className="text-stone-500 text-[11px]">
                    Upload 4 file gambar promo grosir, set judul, sub-judul, dan link tujuan (WA atau produk) yang langsung muncul di beranda pelanggan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newWBan: WholesalePromoBanner = {
                      id: `wpromo-${Date.now()}`,
                      title: `Promo Grosir #${wholesaleBanners.length + 1}`,
                      subtitle: 'Deskripsi diskon grosir karung 5kg & 25kg',
                      imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
                      buttonText: 'MINTA KATALOG GROSIR WA',
                      buttonLink: 'https://wa.me/60123456789',
                    };
                    setWholesaleBanners([...wholesaleBanners, newWBan]);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 flex items-center gap-1"
                >
                  + Tambah Banner Grosir #{wholesaleBanners.length + 1}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wholesaleBanners.map((wban, wIdx) => (
                  <div key={wban.id} className="p-4 rounded-2xl border border-stone-300 bg-amber-50/50 space-y-3 shadow-sm relative">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                      <span className="font-serif font-black text-xs text-[#800020] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center text-[10px]">
                          {wIdx + 1}
                        </span>
                        BANNER PROMO GROSIR #{wIdx + 1}
                      </span>

                      <button
                        type="button"
                        title="Hapus Banner Grosir Ini"
                        onClick={() => {
                          setConfirmDeleteTitle(`Hapus Banner Promo Grosir #${wIdx + 1}?`);
                          setConfirmDeleteMessage('Banner promo grosir ini akan dihapus. Apakah Anda yakin?');
                          setPendingDeleteAction(() => () => setWholesaleBanners(wholesaleBanners.filter(wb => wb.id !== wban.id)));
                          setConfirmDeleteOpen(true);
                        }}
                        className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>

                    {/* Image Preview & Upload Box */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase">
                        Gambar Banner Grosir #{wIdx + 1}
                      </label>
                      <div className="relative h-28 rounded-xl overflow-hidden border border-stone-300 bg-stone-900 group">
                        <img src={wban.imageUrl} alt={wban.title} className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                          <span>Ganti Gambar Promo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressedDataUrl = await compressImageFile(file);
                                  setWholesaleBanners(wholesaleBanners.map(wb => wb.id === wban.id ? { ...wb, imageUrl: compressedDataUrl } : wb));
                                } catch (err) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (reader.result) {
                                      setWholesaleBanners(wholesaleBanners.map(wb => wb.id === wban.id ? { ...wb, imageUrl: reader.result as string } : wb));
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="Atau Paste URL Gambar..."
                        value={wban.imageUrl}
                        onChange={(e) => setWholesaleBanners(wholesaleBanners.map(wb => wb.id === wban.id ? { ...wb, imageUrl: e.target.value } : wb))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-[10px] font-mono mt-1 bg-white"
                      />
                      {/* Searchable Product Target Picker for Wholesale Promo */}
                      <div className="space-y-1 bg-amber-100/60 p-2 rounded-xl border border-amber-300">
                        <label className="block text-[10px] font-bold text-amber-900 uppercase flex items-center justify-between">
                          <span>🔍 Cari & Hubungkan Ke Produk:</span>
                          {wban.buttonLink && <span className="text-[9px] text-emerald-800 font-mono">✓ Link: {wban.buttonLink}</span>}
                        </label>

                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Ketik kata kunci produk... (e.g. tepung, matcha)"
                            value={productSearchTerms[wban.id] || ''}
                            onChange={(e) => setProductSearchTerms({ ...productSearchTerms, [wban.id]: e.target.value })}
                            className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-[11px] font-bold text-stone-800 focus:outline-none focus:border-[#800020]"
                          />
                        </div>

                        <select
                          onChange={(e) => {
                            const pSlug = e.target.value;
                            if (!pSlug) return;
                            const selectedProd = products.find(p => p.slug === pSlug || p.id === pSlug);
                            if (selectedProd) {
                              setWholesaleBanners(wholesaleBanners.map(wb => wb.id === wban.id ? {
                                ...wb,
                                title: `${selectedProd.productName} Bulk Offer`,
                                imageUrl: selectedProd.mainImage,
                                buttonLink: `/products/${selectedProd.slug}`,
                              } : wb));
                            }
                          }}
                          defaultValue=""
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-[11px] text-stone-800 focus:outline-none"
                        >
                          <option value="">
                            -- Pilih Hasil ({products.filter(p => p.productName.toLowerCase().includes((productSearchTerms[wban.id] || '').toLowerCase()) || p.brand.toLowerCase().includes((productSearchTerms[wban.id] || '').toLowerCase())).length} produk cocok) --
                          </option>
                          {products
                            .filter(p => p.productName.toLowerCase().includes((productSearchTerms[wban.id] || '').toLowerCase()) || p.brand.toLowerCase().includes((productSearchTerms[wban.id] || '').toLowerCase()))
                            .map(p => (
                              <option key={p.id} value={p.slug}>
                                📦 {p.productName} ({p.brand})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Titles & Target URL */}
                    <div className="space-y-2 text-[10px]">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase">Judul Banner Grosir</label>
                        <input
                          type="text"
                          value={wban.title}
                          onChange={(e) => setWholesaleBanners(wholesaleBanners.map(wb => wb.id === wban.id ? { ...wb, title: e.target.value } : wb))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase">Deskripsi / Sub-judul</label>
                        <input
                          type="text"
                          value={wban.subtitle}
                          onChange={(e) => setWholesaleBanners(wholesaleBanners.map(wb => wb.id === wban.id ? { ...wb, subtitle: e.target.value } : wb))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-stone-700 uppercase">Teks Tombol</label>
                          <input
                            type="text"
                            value={wban.buttonText}
                            onChange={(e) => setWholesaleBanners(wholesaleBanners.map(wb => wb.id === wban.id ? { ...wb, buttonText: e.target.value } : wb))}
                            className="w-full px-2 py-1 border border-stone-300 rounded-lg font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 uppercase">Target Link (URL / WA)</label>
                          <input
                            type="text"
                            value={wban.buttonLink}
                            onChange={(e) => setWholesaleBanners(wholesaleBanners.map(wb => wb.id === wban.id ? { ...wb, buttonLink: e.target.value } : wb))}
                            className="w-full px-2 py-1 border border-stone-300 rounded-lg font-mono text-[9px] bg-white"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSavedHome ? 'bg-emerald-600' : 'bg-[#800020] hover:bg-[#6F1D1B]'
            }`}
          >
            {isSavedHome ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Home Page Layout Saved Live!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Home Page Layout
              </>
            )}
          </button>

        </form>
      )}

      {/* TAB 3: ABOUT US PAGE CONTENT CMS EDITOR */}
      {activeTab === 'about' && (
        <form onSubmit={handleAboutSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs animate-fade-in">
          
          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#800020]" /> Edit About Us Page Headlines & Story
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Main Hero Title</label>
              <input 
                type="text"
                required
                value={aboutForm.heroTitle}
                onChange={(e) => setAboutForm({ ...aboutForm, heroTitle: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Hero Subtitle / Tagline</label>
              <textarea 
                rows={2}
                required
                value={aboutForm.heroSubtitle}
                onChange={(e) => setAboutForm({ ...aboutForm, heroSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Story Section Title</label>
              <input 
                type="text"
                required
                value={aboutForm.storyTitle}
                onChange={(e) => setAboutForm({ ...aboutForm, storyTitle: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Story Paragraph 1</label>
                <textarea 
                  rows={4}
                  required
                  value={aboutForm.storyParagraph1}
                  onChange={(e) => setAboutForm({ ...aboutForm, storyParagraph1: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Story Paragraph 2</label>
                <textarea 
                  rows={4}
                  required
                  value={aboutForm.storyParagraph2}
                  onChange={(e) => setAboutForm({ ...aboutForm, storyParagraph2: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>
            </div>
          </div>

          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 pt-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#800020]" /> Vision, Mission & Key Statistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Vision Statement</label>
              <textarea 
                rows={3}
                required
                value={aboutForm.visionText}
                onChange={(e) => setAboutForm({ ...aboutForm, visionText: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Mission Statement</label>
              <textarea 
                rows={3}
                required
                value={aboutForm.missionText}
                onChange={(e) => setAboutForm({ ...aboutForm, missionText: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          {/* STATS COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <label className="block font-bold text-stone-700 uppercase text-[10px] mb-1">Stat 1: Pengalaman</label>
              <input 
                type="text"
                value={aboutForm.statYears}
                onChange={(e) => setAboutForm({ ...aboutForm, statYears: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase text-[10px] mb-1">Stat 2: Pelanggan</label>
              <input 
                type="text"
                value={aboutForm.statBakers}
                onChange={(e) => setAboutForm({ ...aboutForm, statBakers: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase text-[10px] mb-1">Stat 3: Produk</label>
              <input 
                type="text"
                value={aboutForm.statProducts}
                onChange={(e) => setAboutForm({ ...aboutForm, statProducts: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase text-[10px] mb-1">Stat 4: Kepuasan</label>
              <input 
                type="text"
                value={aboutForm.statSatisfaction}
                onChange={(e) => setAboutForm({ ...aboutForm, statSatisfaction: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>
          </div>

          {/* HERO IMAGE FILE UPLOADER */}
          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Cover Image About Us <span className="text-stone-400 font-normal">(Upload File atau Paste URL)</span>
            </label>

            {aboutImagePreview ? (
              <div className="relative mb-2 rounded-2xl overflow-hidden border border-stone-200 group">
                <img src={aboutImagePreview} alt="Preview" className="w-full h-44 object-cover" />
                <button
                  type="button"
                  onClick={() => { setAboutImagePreview(''); setAboutForm({ ...aboutForm, heroImage: '' }); }}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-4 text-center space-y-2 bg-stone-50 transition-colors">
                <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                <div className="text-xs text-stone-600">
                  <label className="text-[#800020] font-bold cursor-pointer hover:underline">
                    <span>Pilih foto cover lokal</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAboutImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span> atau drag & drop file ke sini</span>
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="Atau tempel URL gambar..."
              value={aboutForm.heroImage}
              onChange={(e) => { setAboutForm({ ...aboutForm, heroImage: e.target.value }); setAboutImagePreview(e.target.value); }}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-[11px] mt-1"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSavedAbout ? 'bg-emerald-600' : 'bg-[#800020] hover:bg-[#6F1D1B]'
            }`}
          >
            {isSavedAbout ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> About Us Content Saved Live!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save About Us Content
              </>
            )}
          </button>

        </form>
      )}

      {/* TAB 4: ADMIN CREDENTIALS & PASSWORD MANAGER */}
      {activeTab === 'security' && (
        <form onSubmit={handleCredsSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs animate-fade-in">
          
          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#800020]" /> Manage Admin Login Email & Password
          </h2>

          <p className="text-stone-500 text-xs">
            Ubah username/email dan kata sandi login Admin Portal Anda. Perubahan akan berlaku seketika pada sesi login berikutnya.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Admin Username / Email Login</label>
              <input 
                type="text"
                required
                value={credsForm.email}
                onChange={(e) => setCredsForm({ ...credsForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl font-mono text-stone-900 text-sm focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Admin Password Login</label>
              <div className="relative">
                <input 
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={credsForm.password}
                  onChange={(e) => setCredsForm({ ...credsForm, password: e.target.value })}
                  className="w-full px-4 pr-10 py-3 border border-stone-300 rounded-xl text-stone-900 font-mono text-sm focus:outline-none focus:border-[#800020]"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-[#800020] transition-colors focus:outline-none"
                  title={showAdminPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4 text-[#800020]" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-700" /> Informasi Keamanan Akun Admin:
            </h4>
            <p className="text-[11px] text-amber-800">
              Pastikan Anda mencatat username & password baru setelah menekan tombol simpan agar tidak terhambat saat login kembali di <code className="font-bold">/admin/login</code>.
            </p>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSavedCreds ? 'bg-emerald-600' : 'bg-[#800020] hover:bg-[#6F1D1B]'
            }`}
          >
            {isSavedCreds ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Admin Credentials Updated & Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save New Admin Credentials
              </>
            )}
          </button>

        </form>
      )}

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title={confirmDeleteTitle}
        message={confirmDeleteMessage}
        type="danger"
        onConfirm={() => { if (pendingDeleteAction) pendingDeleteAction(); }}
        onCancel={() => { setConfirmDeleteOpen(false); setPendingDeleteAction(null); }}
      />

      <ConfirmModal
        isOpen={confirmSaveOpen}
        title={saveModalTitle}
        message={saveModalMessage}
        type="save"
        onConfirm={() => { if (pendingSaveAction) pendingSaveAction(); }}
        onCancel={() => { setConfirmSaveOpen(false); setPendingSaveAction(null); }}
      />
    </div>
  );
}
