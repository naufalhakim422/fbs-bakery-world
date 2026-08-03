'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';

export default function CategoriesPage() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState(db.getCategories());
  const [products, setProducts] = useState(db.getProducts());

  useEffect(() => {
    const loadLiveData = () => {
      setCategories(db.getCategories());
      setProducts(db.getProducts());
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Ultra-Minimalist Full Black Left-Aligned Header */}
        <div className="text-left pt-2 pb-6 mb-4 space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-black text-[11px] font-extrabold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            {language === 'EN' ? 'FBS BAKERY COLLECTIONS' : language === 'MS' ? 'KOLEKSI FBS BAKERY' : 'KOLEKSI FBS BAKERY'}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-black tracking-tight">
            {language === 'EN' ? 'Featured Product Categories' : language === 'MS' ? 'Kategori Produk Pilihan' : 'Kategori Produk Pilihan'}
          </h1>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium">
            {language === 'EN' ? 'Explore baking supplies and bakery tools by specialty: premium flours, couverture chocolate, imported butter, decorations, and food-grade packaging.' : language === 'MS' ? 'Terokai bahan bakeri dan peralatan mengikut kepakaran: tepung pilihan, coklat couverture, mentega import, hiasan kek, dan pembungkusan gred makanan.' : 'Telusuri bahan kue dan peralatan bakery berdasarkan spesialisasi: tepung pilihan, cokelat couverture, mentega impor, hiasan kue, hingga kemasan food-grade.'}
          </p>
        </div>

        {/* Categories Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((cat) => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            return (
              <div 
                key={cat.id} 
                className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#800020] text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full shadow border border-[#D4AF37]/40">
                    {count} {language === 'EN' ? 'Products Available' : language === 'MS' ? 'Produk Disediakan' : 'Produk Tersedia'}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h2 className="font-serif font-bold text-2xl text-[#2B1B1B] group-hover:text-[#800020] transition-colors mb-2">
                      {cat.name}
                    </h2>
                    <p className="text-stone-600 text-xs leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {t.productDetail.halalCertified}
                    </span>
                    <Link
                      href={`/products?category=${cat.id}`}
                      className="px-4 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                    >
                      {language === 'EN' ? 'Browse Category' : language === 'MS' ? 'Terokai Kategori' : 'Lihat Kategori'} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
