'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Banner, Product } from '@/types';
import { Plus, Image as ImageIcon, Sparkles, Trash2, Edit, CheckCircle2, X, Eye, EyeOff, Upload, ArrowRight, Link as LinkIcon, Save, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSavedAll, setIsSavedAll] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  useEffect(() => {
    let currentBanners = db.getBanners();
    
    // Ensure at least 4 default slots exist
    if (currentBanners.length < 4) {
      const defaultSlots: Banner[] = [
        {
          id: 'ban-1',
          title: 'Semolina & Italian Flour Special Promo',
          subtitle: 'Best Semolina Flour & Specialty Baking Powder for Soft Fluffy Pastries.',
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
          buttonText: 'SHOP PRODUCT NOW',
          buttonLink: '/products/semolina-flour-premium-grade',
          status: true,
        },
        {
          id: 'ban-2',
          title: 'Kyoto Uji Matcha Grade A Diskon 15%',
          subtitle: 'Authentic Emerald Green Uji Matcha Powder for Artisan Matcha Lava Tarts.',
          imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=1200&auto=format&fit=crop',
          buttonText: 'LIHAT PRODUK PROMO',
          buttonLink: '/products/uji-matcha-powder-grade-a',
          status: true,
        },
        {
          id: 'ban-3',
          title: 'Belgian Dark Couverture Chocolate 70%',
          subtitle: 'Rich Creamy Dutch Processed Chocolate Chips for Bakery & Cafe Desserts.',
          imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200&auto=format&fit=crop',
          buttonText: 'PESAN PRODUK DISKON',
          buttonLink: '/products/belgian-dark-couverture-chocolate-70',
          status: true,
        },
        {
          id: 'ban-4',
          title: 'Commercial Stand Mixer 10L New Arrival',
          subtitle: 'Heavy-duty stainless steel mixer with multi-speed gear drive for commercial bakeries.',
          imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=1200&auto=format&fit=crop',
          buttonText: 'CEK BARANG BARU',
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

  const handleSlotFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          handleUpdateSlotField(id, 'imageUrl', reader.result as string);
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
    if (confirm('Apakah Anda yakin ingin menghapus slot banner ini?')) {
      const updated = banners.filter(b => b.id !== id);
      setBanners(updated);
      db.deleteBanner(id);
    }
  };

  const handleSaveAllBanners = (e: React.FormEvent) => {
    e.preventDefault();
    banners.forEach(b => {
      db.saveBanner(b);
    });
    setIsSavedAll(true);
    setTimeout(() => setIsSavedAll(false), 2500);
  };

  const activeBanners = banners.filter(b => b.status);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#800020]" /> Pengaturan 4 Banner Carousel Slide Beranda
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload file gambar banner promo (minimal 4 slide), hubungkan langsung ke produk sasaran, dan simpan dalam sekali klik!
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
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> SEMUA 4 BANNER TERSIMPAN!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#D4AF37]" /> SIMPAN SEMUA BANNER PROMO
            </>
          )}
        </button>
      </div>

      {/* LIVE CAROUSEL PREVIEW IN ADMIN */}
      <div className="bg-stone-900 p-6 rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl text-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest block flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" /> LIVE PREVIEW ROTASI BANNER SLIDER BERANDA ( {activeBanners.length} SLIDE AKTIF )
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

        {activeBanners.length > 0 && activeBanners[activePreviewIndex] ? (
          <div className="relative aspect-21/9 rounded-2xl overflow-hidden border border-white/20 shadow-inner group">
            <img 
              src={activeBanners[activePreviewIndex].imageUrl} 
              alt={activeBanners[activePreviewIndex].title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-3 left-3 bg-[#800020] text-[#D4AF37] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow">
              Slide {activePreviewIndex + 1}: {activeBanners[activePreviewIndex].title}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-[#F7E7CE] px-3 py-1.5 rounded-xl text-[11px] font-mono border border-white/20">
              🔗 Linked To: <strong>{activeBanners[activePreviewIndex].buttonLink}</strong>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-stone-400">Tidak ada slide banner yang aktif saat ini.</div>
        )}
      </div>

      {/* 4 DEDICATED SLIDE BANNER EDITORS */}
      <form onSubmit={handleSaveAllBanners} className="space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <div 
              key={banner.id} 
              className={`p-6 rounded-3xl border transition-all space-y-4 ${
                banner.status 
                  ? 'bg-white border-stone-200 shadow-md' 
                  : 'bg-stone-100/70 border-stone-300 opacity-75'
              }`}
            >
              
              {/* Slot Header Bar */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#800020] text-[#F7E7CE] font-serif font-black text-xs flex items-center justify-center border border-[#D4AF37]/50 shadow">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      SLOT BANNER SLIDE #{index + 1}
                    </h3>
                    <span className="text-[10px] text-stone-500 font-mono">ID: {banner.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Switch */}
                  <button
                    type="button"
                    onClick={() => handleUpdateSlotField(banner.id, 'status', !banner.status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      banner.status 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-stone-200 text-stone-600 border border-stone-300'
                    }`}
                  >
                    {banner.status ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{banner.status ? 'Aktif' : 'Disabled'}</span>
                  </button>

                  {/* Delete Slot Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(banner.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Hapus Slot Banner Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* QUICK PRODUCT PICKER DROPDOWN FOR THIS SLOT */}
              <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 space-y-1">
                <label className="block font-bold text-amber-900 uppercase text-[10px] flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-[#800020]" /> Hubungkan Ke Produk Dari Katalog (Otomatis Mengisi Link & Gambar):
                </label>
                <select
                  onChange={(e) => handleSlotProductSelect(banner.id, e.target.value)}
                  defaultValue=""
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-xs text-stone-800 focus:outline-none focus:border-[#800020]"
                >
                  <option value="">-- Hubungkan Ke Barang Dari Katalog Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.slug}>
                      📦 {p.productName} ({p.brand})
                    </option>
                  ))}
                </select>
              </div>

              {/* FILE UPLOAD & PREVIEW */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-700 uppercase text-[11px]">
                  Gambar Banner Slide #{index + 1}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-7 relative h-32 rounded-2xl overflow-hidden border border-stone-300 bg-stone-900 shadow-inner flex-shrink-0">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 text-white text-[9px] rounded font-bold">
                      Gambar Slide Saat Ini
                    </span>
                  </div>

                  <div className="sm:col-span-5 border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-3 text-center bg-stone-50 transition-colors relative flex flex-col items-center justify-center min-h-[128px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSlotFileUpload(banner.id, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-[#800020] mb-1" />
                    <span className="font-bold text-stone-800 text-[11px] block">Upload Gambar File</span>
                    <span className="text-[9px] text-stone-500">Klik / Geser Foto Laptop</span>
                  </div>
                </div>
              </div>

              {/* SLIDE TITLE & TARGET LINK */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Judul Banner / Nama Promo</label>
                  <input 
                    type="text"
                    required
                    value={banner.title}
                    onChange={(e) => handleUpdateSlotField(banner.id, 'title', e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Target Link Produk (URL)</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: /products/semolina-flour-premium-grade"
                    value={banner.buttonLink}
                    onChange={(e) => handleUpdateSlotField(banner.id, 'buttonLink', e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900 font-mono text-[11px] bg-white"
                  />
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* BOTTOM SAVE & ADD EXTRA SLOT ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={handleAddNewSlot}
            className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl transition-all border border-stone-300 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#800020]" /> TAMBAH SLOT BANNER KE-{banners.length + 1}
          </button>

          <button
            type="submit"
            className={`w-full sm:w-auto px-8 py-3.5 text-[#D4AF37] font-serif font-bold text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/40 ${
              isSavedAll ? 'bg-emerald-700 text-white border-emerald-500' : 'bg-[#800020] hover:bg-[#6F1D1B]'
            }`}
          >
            {isSavedAll ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> SEMUA {banners.length} BANNER TERSIMPAN KETAT!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#D4AF37]" /> SIMPAN SEMUA {banners.length} BANNER PROMO
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
