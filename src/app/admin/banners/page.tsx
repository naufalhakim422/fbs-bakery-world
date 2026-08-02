'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { Banner, Product } from '@/types';
import { Plus, Image as ImageIcon, Sparkles, Trash2, Edit, CheckCircle2, X, Eye, EyeOff, Upload, ArrowRight, Link as LinkIcon, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { compressImageFile } from '@/lib/image-compressor';

export default function AdminBannersPage() {
  const { t } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSavedAll, setIsSavedAll] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let currentBanners = db.getBanners();
    
    // Ensure at least 4 default slots exist
    if (currentBanners.length < 4) {
      const defaultSlots: Banner[] = [
        {
          id: 'ban-1',
          title: 'Semolina & Italian Flour Special Promo',
          subtitle: 'Best Semolina Flour & Specialty Baking Powder for Soft Fluffy Pastries and Artisan Breads.',
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
          buttonText: 'SHOP PRODUCT NOW',
          buttonLink: '/products/semolina-flour-premium-grade',
          status: true,
        },
        {
          id: 'ban-2',
          title: 'Kyoto Uji Matcha Grade A Diskon 15%',
          subtitle: 'Authentic Emerald Green Uji Matcha Powder for Artisan Matcha Lava Tarts & Beverages.',
          imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=1200&auto=format&fit=crop',
          buttonText: 'BELI MATCHA UJI',
          buttonLink: '/products/kyoto-uji-matcha-powder-grade-a',
          status: true,
        },
        {
          id: 'ban-3',
          title: 'Pasokan Cokelat Couverture Belgian 70%',
          subtitle: 'Cokelat couverture murni untuk glazing cake, praline, dan ganache mewah.',
          imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200&auto=format&fit=crop',
          buttonText: 'LIHAT COKELAT',
          buttonLink: '/products/belgian-dark-couverture-chocolate-70',
          status: true,
        },
        {
          id: 'ban-4',
          title: 'Stand Mixer Komersial Heavy Duty 10L',
          subtitle: 'Mesin mixer adonan roti 1200W dengan mangkuk stainless steel tebal.',
          imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=1200&auto=format&fit=crop',
          buttonText: 'LIHAT MIXER KOMERSIAL',
          buttonLink: '/products/commercial-stand-mixer-10l',
          status: true,
        }
      ];

      // Merge existing with defaults up to 4
      for (let i = currentBanners.length; i < 4; i++) {
        currentBanners.push(defaultSlots[i]);
      }
    }

    setBanners(currentBanners);
    setProducts(db.getProducts());
  }, []);

  const handleUpdateSlotField = (id: string, field: keyof Banner, value: any) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSlotFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        handleUpdateSlotField(id, 'imageUrl', compressed);
      } catch (err) {
        console.error('Error compressing banner image:', err);
      }
    }
  };

  const handleSlotVideoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File video banner terlalu besar (Maks 2MB). Silakan gunakan file yang lebih kecil atau URL eksternal.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          handleUpdateSlotField(id, 'videoUrl', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlotProductSelect = (id: string, productSlug: string) => {
    if (!productSlug) return;
    const selectedProd = products.find(p => p.slug === productSlug || p.id === productSlug);
    if (selectedProd) {
      setBanners(prev => prev.map(b => {
        if (b.id === id) {
          return {
            ...b,
            title: `${selectedProd.productName} Special Offer`,
            subtitle: selectedProd.shortDescription,
            imageUrl: selectedProd.mainImage,
            buttonText: `BELI ${selectedProd.productName.toUpperCase().slice(0, 20)}`,
            buttonLink: `/products/${selectedProd.slug}`,
          };
        }
        return b;
      }));
    }
  };

  const handleAddNewSlot = () => {
    const newSlot: Banner = {
      id: `ban-${Date.now()}`,
      title: `Slide Banner ${banners.length + 1}`,
      subtitle: 'Deskripsi promo atau produk baru',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
      buttonText: 'SHOP NOW',
      buttonLink: '/products',
      status: true,
    };
    const updated = [...banners, newSlot];
    setBanners(updated);
  };

  const handleDeleteSlot = (id: string) => {
    if (banners.length <= 1) {
      alert('Minimal harus ada 1 banner slide di sistem.');
      return;
    }
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const executeDeleteSlot = () => {
    if (pendingDeleteId) {
      const updated = banners.filter(b => b.id !== pendingDeleteId);
      setBanners(updated);
      db.deleteBanner(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const handleSaveAllBanners = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSaveOpen(true);
  };

  const executeSaveAllBanners = () => {
    banners.forEach(b => {
      db.saveBanner(b);
    });
    setIsSavedAll(true);
    setConfirmSaveOpen(false);
    setTimeout(() => setIsSavedAll(false), 2500);
  };

  const activeBanners = banners.filter(b => b.status);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#800020]" /> {t.adminBanners.title}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.adminBanners.subtitle}
          </p>
        </div>

        <button
          onClick={handleSaveAllBanners}
          className={`px-6 py-3.5 text-[#D4AF37] font-serif font-bold text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-[#D4AF37]/40 flex-shrink-0 ${
            isSavedAll ? 'bg-emerald-700 text-white border-emerald-500' : 'bg-[#800020] hover:bg-[#6F1D1B]'
          }`}
        >
          {isSavedAll ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> {t.common.save}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#D4AF37]" /> {t.adminBanners.saveBtn}
            </>
          )}
        </button>
      </div>

      {/* LIVE CAROUSEL PREVIEW IN ADMIN */}
      <div className="bg-stone-900 p-6 rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl text-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest block flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" /> LIVE PREVIEW ( {activeBanners.length} SLIDE )
          </span>
          {activeBanners.length > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActivePreviewIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-[#800020] text-stone-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-[#F7E7CE]">
                {activePreviewIndex + 1} / {activeBanners.length}
              </span>
              <button 
                onClick={() => setActivePreviewIndex(prev => (prev + 1) % activeBanners.length)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-[#800020] text-stone-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {activeBanners[activePreviewIndex] && (
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-inner group bg-black">
            {activeBanners[activePreviewIndex].videoUrl ? (
              <video 
                src={activeBanners[activePreviewIndex].videoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover" 
              />
            ) : (
              <img 
                src={activeBanners[activePreviewIndex].imageUrl} 
                alt={activeBanners[activePreviewIndex].title} 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 sm:p-10 flex flex-col justify-center max-w-xl space-y-2">
              <span className="px-3 py-1 bg-[#800020] text-[#D4AF37] text-[10px] font-bold rounded-full w-fit uppercase">
                PROMO BANNER SLIDE #{activePreviewIndex + 1}
              </span>
              <h2 className="font-serif text-xl sm:text-3xl font-extrabold text-[#F7E7CE] leading-tight">
                {activeBanners[activePreviewIndex].title}
              </h2>
              <p className="text-stone-300 text-xs line-clamp-2">
                {activeBanners[activePreviewIndex].subtitle}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#800020] text-white font-bold text-xs rounded-xl shadow">
                  {activeBanners[activePreviewIndex].buttonText || 'SHOP NOW'} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BANNERS FORM CARDS GRID */}
      <form onSubmit={handleSaveAllBanners} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Daftar 4 Slot Banner Slide ({banners.length} Slot)
          </h2>

          <button
            type="button"
            onClick={handleAddNewSlot}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-[#D4AF37] text-xs font-bold rounded-xl border border-[#D4AF37]/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" /> {t.adminBanners.addNew}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map((b, index) => (
            <div 
              key={b.id} 
              className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 relative transition-all ${
                b.status ? 'border-stone-200' : 'border-stone-300 bg-stone-50/50 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#800020] text-[#D4AF37] font-bold text-xs flex items-center justify-center border border-[#D4AF37]/40 shadow">
                    {index + 1}
                  </span>
                  <span className="font-serif font-bold text-sm text-[#800020]">
                    SLOT BANNER #{index + 1} {b.status ? '(AKTIF)' : '(NONAKTIF)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateSlotField(b.id, 'status', !b.status)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                      b.status 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : 'bg-stone-200 text-stone-600 border-stone-300'
                    }`}
                  >
                    {b.status ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {b.status ? t.common.publish : t.common.unpublish}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(b.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Hapus slot banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* QUICK FILL FROM PRODUCT DROPDOWN */}
              <div className="p-3 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] space-y-1">
                <label className="block text-[11px] font-bold text-[#800020] uppercase">
                  ⚡ Auto-Fill Data dari Produk Katalog:
                </label>
                <select
                  onChange={(e) => handleSlotProductSelect(b.id, e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs bg-white text-stone-900 font-medium"
                >
                  <option value="">-- Pilih Produk untuk Auto-Fill Banner --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.slug}>
                      {p.productName} ({p.categoryId})
                    </option>
                  ))}
                </select>
              </div>

              {/* IMAGE PREVIEW & UPLOADER */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  {t.adminBanners.bannerImage}
                </label>

                <div className="relative h-36 rounded-2xl overflow-hidden border border-stone-300 group bg-stone-100">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <label className="px-4 py-2 bg-white text-stone-900 font-bold text-xs rounded-xl cursor-pointer shadow-lg hover:bg-stone-100 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#800020]" /> Upload Gambar Baru
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleSlotFileUpload(b.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="URL Gambar Banner (e.g. https://...)"
                  value={b.imageUrl}
                  onChange={(e) => handleUpdateSlotField(b.id, 'imageUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono"
                />
              </div>

              {/* VIDEO ANIMATION / BACKGROUND VIDEO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 uppercase">
                    URL Video / Animasi Banner (Opsional)
                  </label>
                  {b.videoUrl && (
                    <button
                      type="button"
                      onClick={() => handleUpdateSlotField(b.id, 'videoUrl', '')}
                      className="text-[10px] text-red-600 font-extrabold hover:underline"
                    >
                      Hapus Video (Gunakan Gambar Saja)
                    </button>
                  )}
                </div>

                <div className="border border-stone-200 rounded-2xl p-3 bg-stone-50 space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 font-bold text-[11px] rounded-lg cursor-pointer hover:bg-stone-50 flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-[#800020]" /> Upload MP4 / WebM
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => handleSlotVideoUpload(b.id, e)}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {b.videoUrl ? '✓ Video Terpasang' : 'Belum ada video (menggunakan gambar)'}
                    </span>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Atau masukkan Link Video (e.g. https://...)"
                    value={b.videoUrl || ''}
                    onChange={(e) => handleUpdateSlotField(b.id, 'videoUrl', e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-[11px] font-mono"
                  />
                </div>
              </div>

              {/* TITLE & SUBTITLE */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {t.adminBanners.bannerTitle}
                  </label>
                  <input
                    type="text"
                    required
                    value={b.title}
                    onChange={(e) => handleUpdateSlotField(b.id, 'title', e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl font-serif font-bold text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {t.adminBanners.bannerSubtitle}
                  </label>
                  <textarea
                    rows={2}
                    value={b.subtitle}
                    onChange={(e) => handleUpdateSlotField(b.id, 'subtitle', e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      Teks Tombol (CTA)
                    </label>
                    <input
                      type="text"
                      value={b.buttonText}
                      onChange={(e) => handleUpdateSlotField(b.id, 'buttonText', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      {t.adminBanners.bannerLink}
                    </label>
                    <input
                      type="text"
                      value={b.buttonLink}
                      onChange={(e) => handleUpdateSlotField(b.id, 'buttonLink', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-8 py-4 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-serif font-bold text-sm rounded-2xl shadow-xl flex items-center gap-2 border border-[#D4AF37]/40 active:scale-95 transition-transform"
          >
            <Save className="w-5 h-5 text-[#D4AF37]" /> {t.adminBanners.saveBtn}
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Hapus Banner?"
        message="Banner yang dihapus tidak dapat dipulihkan. Apakah Anda yakin ingin menghapus banner ini?"
        type="danger"
        onConfirm={executeDeleteSlot}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
      />

      <ConfirmModal
        isOpen={confirmSaveOpen}
        title="Simpan Perubahan Banner Slider?"
        message="Apakah Anda yakin ingin menyimpan seluruh susunan & data banner slider beranda ini?"
        type="save"
        onConfirm={executeSaveAllBanners}
        onCancel={() => setConfirmSaveOpen(false)}
      />
    </div>
  );
}
