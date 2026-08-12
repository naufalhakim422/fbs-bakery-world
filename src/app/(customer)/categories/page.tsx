'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Search, 
  ChevronRight, 
  X, 
  PackageCheck,
  RefreshCw
} from 'lucide-react';

export default function CategoriesPage() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState(() => db.getCategories());
  const [products, setProducts] = useState(() => db.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadLiveData = async () => {
      // 1. Fetch live categories & products from DB
      const cats = db.getCategories();
      const prods = db.getProducts();
      if (isMounted) {
        setCategories(cats || []);
        setProducts(prods || []);
        setIsLoading(false);
      }
    };
    
    loadLiveData();

    const handleStorageUpdate = () => loadLiveData();
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('fbs_db_updated', handleStorageUpdate);
    
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('fbs_db_updated', handleStorageUpdate);
    };
  }, []);

  // Filtered categories based on user search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(c => 
      (c.name || '').toLowerCase().includes(q) || 
      (c.description || '').toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        
        {/* WARM LUXURY HERITAGE CATEGORY HEADER */}
        <div className="pt-2 pb-8 mb-8 border-b border-[#EADBC8]/70 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
          
          <div className="space-y-2.5 max-w-3xl text-left">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
              <Link href="/" className="hover:text-[#800020] transition-colors focus:outline-none focus:ring-1 focus:ring-[#800020] rounded-sm">
                {language === 'EN' ? 'Home' : language === 'MS' ? 'Utama' : 'Beranda'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[#800020] font-bold">
                {language === 'EN' ? 'Product Categories' : language === 'MS' ? 'Kategori Produk' : 'Kategori Produk'}
              </span>
            </nav>

            {/* Collection Gold Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] text-[11px] font-black tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'EN' ? 'CURATED BAKERY COLLECTIONS' : language === 'MS' ? 'SELEKSI KOLEKSI UTAMA' : 'KOLEKSI BAKERY PILIHAN'}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B1B1B] tracking-tight leading-tight">
              {language === 'EN' ? 'Featured Product Categories' : language === 'MS' ? 'Kategori Produk Pilihan' : 'Kategori Produk Pilihan'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium max-w-2xl">
              {language === 'EN' ? 'Explore baking supplies and bakery tools by specialty: premium flours, couverture chocolate, imported butter, decorations, and food-grade packaging.' : language === 'MS' ? 'Terokai bahan bakeri dan peralatan mengikut kepakaran: tepung pilihan, coklat couverture, mentega import, hiasan kek, dan pembungkusan gred makanan.' : 'Telusuri bahan kue dan peralatan bakery berdasarkan spesialisasi: tepung pilihan, cokelat couverture, mentega impor, hiasan kue, hingga kemasan food-grade.'}
            </p>
          </div>

          {/* Elegant Search Input Box */}
          <div className="w-full md:w-88 relative group flex-shrink-0">
            <input 
              type="text"
              placeholder={language === 'EN' ? 'Search categories...' : language === 'MS' ? 'Cari kategori...' : 'Cari kategori...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari Kategori"
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-[#EADBC8] rounded-2xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] shadow-sm transition-all duration-300"
            />
            <Search className="w-4 h-4 text-stone-400 group-focus-within:text-[#800020] absolute left-4 top-4 transition-colors" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 p-0.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[#800020]"
                aria-label="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-stone-200/70 rounded-3xl h-96 w-full"></div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          /* EMPTY CATEGORY STATE */
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#EADBC8] shadow-sm my-8 space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] flex items-center justify-center mx-auto shadow">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-black text-[#2B1B1B]">
                {language === 'EN' ? 'No Categories Found' : language === 'MS' ? 'Tiada Kategori Dijumpai' : 'Kategori Tidak Ditemukan'}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm max-w-sm mx-auto font-medium leading-relaxed">
                {language === 'EN' ? `No bakery categories match your search query "${searchQuery}". Try searching for flour, chocolate, or butter.` : language === 'MS' ? `Tiada kategori bakeri yang sepadan dengan carian "${searchQuery}". Cuba kata kunci seperti tepung, coklat, atau mentega.` : `Tidak ada kategori baking yang cocok dengan pencarian "${searchQuery}". Coba kata kunci seperti tepung, cokelat, atau butter.`}
              </p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 bg-[#800020] hover:bg-[#600018] text-[#F7E7CE] font-bold text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.common.reset}</span>
            </button>
          </div>
        ) : (
          /* CATEGORIES GRID SHOWCASE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredCategories.map((cat) => {
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <div 
                  key={cat.id} 
                  className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8]/90 shadow-sm hover:shadow-2xl hover:border-[#800020] transition-all duration-500 flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img 
                      src={cat.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop'} 
                      alt={`Kategori ${cat.name}`} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-[#800020]/95 backdrop-blur-md text-[#F7E7CE] text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg border border-[#D4AF37]/40 flex items-center gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{count} {language === 'EN' ? 'Items' : language === 'MS' ? 'Produk' : 'Produk'}</span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <h2 className="font-serif font-bold text-2xl text-[#2B1B1B] group-hover:text-[#800020] transition-colors leading-tight">
                        {cat.name}
                      </h2>
                      <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium line-clamp-3">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" /> 
                        <span>{t.productDetail.halalCertified}</span>
                      </span>
                      <Link
                        href={`/products?category=${cat.id}`}
                        className="px-5 py-3 bg-[#800020] hover:bg-[#600018] text-[#F7E7CE] text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 uppercase tracking-wider group/btn cursor-pointer active:scale-95"
                      >
                        <span>{language === 'EN' ? 'Browse' : language === 'MS' ? 'Terokai' : 'Lihat'}</span> 
                        <ArrowRight className="w-4 h-4 text-[#F7E7CE] group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
