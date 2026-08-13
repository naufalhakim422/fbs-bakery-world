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
  ArrowRight, 
  Search, 
  ChevronRight, 
  X, 
  PackageCheck,
  RefreshCw,
  ShieldCheck
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {/* EDITORIAL CATEGORY HEADER */}
        <div className="pb-6 mb-6 border-b border-[#EADBC8] flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
          
          <div className="space-y-2 max-w-2xl text-left">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
              <Link href="/" className="hover:text-[#800020] transition-colors focus:outline-none">
                {language === 'EN' ? 'Home' : language === 'MS' ? 'Utama' : 'Beranda'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[#800020] font-bold">
                {language === 'EN' ? 'Product Categories' : language === 'MS' ? 'Kategori Produk' : 'Kategori Produk'}
              </span>
            </nav>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B1B] tracking-tight">
              {language === 'EN' ? 'Featured Product Categories' : language === 'MS' ? 'Kategori Produk Pilihan' : 'Kategori Produk Pilihan'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed">
              {language === 'EN' ? 'Explore baking supplies and bakery tools by specialty: premium flours, couverture chocolate, imported butter, and packaging.' : language === 'MS' ? 'Terokai bahan bakeri dan peralatan mengikut kepakaran: tepung pilihan, coklat couverture, mentega import, dan pembungkusan.' : 'Telusuri bahan kue dan peralatan bakery berdasarkan spesialisasi: tepung pilihan, cokelat couverture, mentega impor, hingga kemasan food-grade.'}
            </p>
          </div>

          {/* Clean Integrated Search Input Box */}
          <div className="w-full md:w-80 relative group shrink-0">
            <input 
              type="text"
              placeholder={language === 'EN' ? 'Search categories...' : language === 'MS' ? 'Cari kategori...' : 'Cari kategori...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari Kategori"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#800020] transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 transition-colors" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 p-0.5 rounded-full cursor-pointer"
                aria-label="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-stone-200 rounded-2xl h-80 w-full"></div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          /* EMPTY CATEGORY STATE */
          <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 shadow-xs my-6 space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#2B1B1B]">
                {language === 'EN' ? 'No Categories Found' : language === 'MS' ? 'Tiada Kategori Dijumpai' : 'Kategori Tidak Ditemukan'}
              </h3>
              <p className="text-stone-500 text-xs font-medium leading-relaxed">
                {language === 'EN' ? `No bakery categories match your search query "${searchQuery}".` : language === 'MS' ? `Tiada kategori bakeri yang sepadan dengan carian "${searchQuery}".` : `Tidak ada kategori baking yang cocok dengan pencarian "${searchQuery}".`}
              </p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2.5 bg-[#800020] hover:bg-[#600018] text-[#FFF8F0] font-bold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.common.reset}</span>
            </button>
          </div>
        ) : (
          /* CATEGORIES GRID SHOWCASE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCategories.map((cat) => {
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <div 
                  key={cat.id} 
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md hover:border-[#800020] transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img 
                      src={cat.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop'} 
                      alt={`Kategori ${cat.name}`} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-[#800020] text-[#FFF8F0] text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <PackageCheck className="w-3.5 h-3.5 text-[#FFF8F0]" />
                      <span>{count} {language === 'EN' ? 'Items' : 'Produk'}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h2 className="font-serif font-bold text-xl text-[#2B1B1B] group-hover:text-[#800020] transition-colors leading-snug">
                        {cat.name}
                      </h2>
                      <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" /> 
                        <span>{t.productDetail.halalCertified}</span>
                      </span>
                      <Link
                        href={`/products?category=${cat.id}`}
                        className="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-[#FFF8F0] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 uppercase tracking-wider group/btn cursor-pointer active:scale-95"
                      >
                        <span>{language === 'EN' ? 'Browse' : language === 'MS' ? 'Terokai' : 'Lihat'}</span> 
                        <ArrowRight className="w-3.5 h-3.5 text-[#FFF8F0] group-hover/btn:translate-x-1 transition-transform" />
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
