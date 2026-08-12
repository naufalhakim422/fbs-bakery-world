'use client';

import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Product } from '@/types';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ProductCard } from '@/components/customer/product-card';
import { 
  Search, 
  RefreshCw, 
  Layers, 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Package, 
  ShieldCheck,
  X
} from 'lucide-react';

function CatalogContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const selectedCatParam = searchParams?.get('category') || '';
  const initialSearchParam = searchParams?.get('search') || '';

  const [searchQuery, setSearchQuery] = useState<string>(initialSearchParam);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(initialSearchParam);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [selectedCategory, setSelectedCategory] = useState<string>(selectedCatParam);
  const [halalOnly, setHalalOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [newArrivalOnly, setNewArrivalOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestseller' | 'name-asc'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync state when URL query params change
  useEffect(() => {
    const qParam = searchParams?.get('search') || '';
    const catParam = searchParams?.get('category') || '';
    setSearchQuery(qParam);
    setSelectedCategory(catParam);
  }, [searchParams]);

  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const prods = db.getProducts();
    return prods && prods.length > 0 ? prods : [];
  });
  const categories = useMemo(() => db.getCategories(), []);

  useEffect(() => {
    let isMounted = true;

    const loadLiveData = async () => {
      // 1. Fetch live products from PostgreSQL API first
      try {
        const res = await fetch(`/api/products?status=active&t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
          return;
        }
      } catch (apiErr) {
        console.warn('[Products API Fetch Warning]', apiErr);
      }

      // 2. Fallback to local DB if API fetch returned empty/error
      const fetched = db.getProducts();
      if (isMounted && fetched && fetched.length > 0) {
        setAllProducts(fetched);
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

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Filter by Category
    if (selectedCategory) {
      const matchedCat = categories.find(c => c.id === selectedCategory || c.slug === selectedCategory);
      const targetId = matchedCat ? matchedCat.id : selectedCategory;
      list = list.filter(p => p.categoryId === targetId || p.categoryName?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Deep Filter by Search Query (Debounced)
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase().trim();
      list = list.filter(p => 
        (p.productName || '').toLowerCase().includes(q) || 
        (p.brand || '').toLowerCase().includes(q) || 
        (p.sku || '').toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        (p.variants || []).some(v => (v.variantName || '').toLowerCase().includes(q) || (v.sku || '').toLowerCase().includes(q))
      );
    }

    // Filter by Halal Status
    if (halalOnly) {
      list = list.filter(p => p.isHalal);
    }

    // Filter by In-Stock Only
    if (inStockOnly) {
      list = list.filter(p => p.variants && p.variants.some(v => v.stock > 0));
    }

    // Filter by New Arrival Only
    if (newArrivalOnly) {
      list = list.filter(p => p.isNew);
    }

    // Advanced Sort Order
    if (sortBy === 'price-asc') {
      list.sort((a, b) => ((a.variants || [])[0]?.price || 0) - ((b.variants || [])[0]?.price || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => ((b.variants || [])[0]?.price || 0) - ((a.variants || [])[0]?.price || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    } else if (sortBy === 'bestseller') {
      list.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
    }

    return list;
  }, [allProducts, categories, selectedCategory, debouncedSearchQuery, halalOnly, inStockOnly, newArrivalOnly, sortBy]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('');
    setHalalOnly(false);
    setInStockOnly(false);
    setNewArrivalOnly(false);
    setSortBy('featured');
  }, []);

  return (
    <>
      {/* WARM LUXURY HERITAGE CATALOG HEADER */}
      <div className="pt-2 pb-8 mb-8 border-b border-[#EADBC8]/70 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-x-hidden">
        
        <div className="space-y-2.5 max-w-3xl text-left">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
            <Link href="/" className="hover:text-[#800020] transition-colors">
              {language === 'EN' ? 'Home' : language === 'MS' ? 'Utama' : 'Beranda'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[#800020] font-bold">
              {language === 'EN' ? 'Product Catalog' : language === 'MS' ? 'Katalog Produk' : 'Katalog Produk'}
            </span>
          </nav>

          {/* Collection Gold Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] text-[11px] font-black tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{language === 'EN' ? 'PREMIUM INGREDIENTS & TOOLS' : language === 'MS' ? 'RAMUAN & PERALATAN MEWAH' : 'BAHAN & PERALATAN PASTIKAN MEWAH'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B1B1B] tracking-tight leading-tight">
            {language === 'EN' ? 'Baking Supplies & Ingredients' : language === 'MS' ? 'Bekalan & Bahan Bakeri' : 'Perlengkapan & Bahan Kue'}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium max-w-2xl">
            {language === 'EN' ? 'Browse our complete selection of flours, chocolates, butter, decorations, and tools with various weight options.' : language === 'MS' ? 'Semak pilihan lengkap tepung, coklat, mentega, hiasan, dan peralatan kami dengan pelbagai pilihan berat.' : 'Telusuri pilihan lengkap kami yang terdiri dari tepung, cokelat, mentega, hiasan, dan peralatan dengan berbagai pilihan berat.'}
          </p>
        </div>

        {/* Elegant Search Input Box */}
        <div className="w-full md:w-88 relative group flex-shrink-0">
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#EADBC8] rounded-2xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] shadow-sm transition-all duration-300"
          />
          <Search className="w-4 h-4 text-stone-400 group-focus-within:text-[#800020] absolute left-4 top-4 transition-colors" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* INTEGRATED MODERN TOOLBAR & CATEGORY SELECTOR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EADBC8] shadow-sm mb-8 flex flex-col gap-4">
        
        {/* TOP ROW: CATEGORIES HORIZONTAL SMOOTH SCROLL */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Horizontal Smooth Scroll Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none w-full lg:w-auto text-xs whitespace-nowrap">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-2xl font-bold transition-all flex-shrink-0 cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-[#800020] text-[#F7E7CE] shadow-md border border-[#D4AF37]/50 scale-102'
                  : 'bg-stone-100/90 text-stone-700 hover:bg-stone-200/90 hover:text-stone-900'
              }`}
            >
              {t.common.allCategories}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl font-bold transition-all flex-shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#800020] text-[#F7E7CE] shadow-md border border-[#D4AF37]/50 scale-102'
                    : 'bg-stone-100/90 text-stone-700 hover:bg-stone-200/90 hover:text-stone-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* RIGHT SIDE INLINE ACTIONS: TOGGLES + SORT + GRID/LIST VIEW */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-shrink-0 justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100">
            
            {/* Halal Only Switch Pill */}
            <button
              onClick={() => setHalalOnly(!halalOnly)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                halalOnly
                  ? 'bg-emerald-800 text-white border-emerald-600 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${halalOnly ? 'bg-white text-emerald-800' : 'border border-stone-400'}`}>
                {halalOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>{t.common.halalOnly}</span>
            </button>

            {/* Ready Stock Filter Pill */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                inStockOnly
                  ? 'bg-blue-800 text-white border-blue-600 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${inStockOnly ? 'bg-white text-blue-800' : 'border border-stone-400'}`}>
                {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>{language === 'EN' ? 'Ready Stock' : language === 'MS' ? 'Stok Sedia Ada' : 'Stok Tersedia'}</span>
            </button>

            {/* New Arrival Filter Pill */}
            <button
              onClick={() => setNewArrivalOnly(!newArrivalOnly)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                newArrivalOnly
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${newArrivalOnly ? 'bg-white text-amber-600' : 'border border-stone-400'}`}>
                {newArrivalOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>{language === 'EN' ? 'New Arrival' : language === 'MS' ? 'Produk Baharu' : 'Produk Baru'}</span>
            </button>

            {/* Sort Select Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 bg-stone-50 hover:bg-white focus:outline-none focus:border-[#800020] transition-colors cursor-pointer"
            >
              <option value="featured">{language === 'EN' ? 'Featured Order' : language === 'MS' ? 'Susunan Utama' : 'Pilihan Utamakan'}</option>
              <option value="price-asc">{language === 'EN' ? 'Price: Low to High' : language === 'MS' ? 'Harga: Rendah ke Tinggi' : 'Harga Termurah'}</option>
              <option value="price-desc">{language === 'EN' ? 'Price: High to Low' : language === 'MS' ? 'Harga: Tinggi ke Rendah' : 'Harga Termahal'}</option>
              <option value="newest">{language === 'EN' ? 'Newest' : language === 'MS' ? 'Terkini' : 'Terbaru'}</option>
              <option value="bestseller">{language === 'EN' ? 'Bestseller' : language === 'MS' ? 'Terlaris' : 'Bestseller'}</option>
              <option value="name-asc">{language === 'EN' ? 'Name A-Z' : language === 'MS' ? 'Nama A-Z' : 'Nama A-Z'}</option>
            </select>

            {/* INTEGRATED MODERN GRID / LIST VIEW TOGGLE BUTTONS */}
            <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#800020] text-[#F7E7CE] shadow-md scale-105'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#800020] text-[#F7E7CE] shadow-md scale-105'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Reset Filter Icon */}
            {(selectedCategory || searchQuery || halalOnly || inStockOnly || newArrivalOnly) && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-stone-500 hover:text-red-600 rounded-2xl border border-stone-200 hover:border-red-300 transition-colors cursor-pointer"
                title={t.common.reset}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Query Status Banner if Searching */}
      {searchQuery.trim() && (
        <div className="mb-8 p-4 sm:p-5 bg-amber-50/80 border border-amber-200/90 rounded-3xl flex items-center justify-between shadow-sm">
          <p className="text-xs sm:text-sm text-amber-950 font-bold">
            {language === 'EN' ? 'Search results for' : language === 'MS' ? 'Hasil carian untuk' : 'Hasil pencarian untuk'} &quot;<span className="text-[#800020]">{searchQuery}</span>&quot;: <span className="font-extrabold text-[#800020]">{filteredProducts.length} {language === 'EN' ? 'products found' : language === 'MS' ? 'produk dijumpai' : 'produk ditemukan'}</span>
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-black text-red-600 hover:underline cursor-pointer"
          >
            {language === 'EN' ? 'Clear Keyword' : language === 'MS' ? 'Padam Kata Kunci' : 'Hapus Kata Kunci'}
          </button>
        </div>
      )}

      {/* Product Grid / List Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#EADBC8] shadow-sm my-8 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] flex items-center justify-center mx-auto shadow">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-black text-[#2B1B1B]">{t.common.noResults}</h3>
            <p className="text-stone-600 text-xs sm:text-sm max-w-sm mx-auto font-medium leading-relaxed">
              {language === 'EN' ? `No baking products match your search query "${searchQuery}". Try searching for flour, matcha, butter, or chocolate.` : language === 'MS' ? `Tiada produk bakeri yang sepadan dengan carian "${searchQuery}". Cuba kata kunci seperti tepung, matcha, mentega, atau coklat.` : `Tidak ada produk baking yang cocok dengan pencarian "${searchQuery}". Coba kata kunci seperti tepung, matcha, butter, atau chocolate.`}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-3 bg-[#800020] hover:bg-[#600018] text-[#F7E7CE] font-bold text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider cursor-pointer"
          >
            {t.common.reset}
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-hidden' : 'space-y-4 overflow-x-hidden'}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} viewMode={viewMode} />
          ))}
        </div>
      )}
    </>
  );
}

export default function ProductCatalogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <Suspense 
          fallback={
            <div className="py-16 space-y-8 animate-pulse">
              <div className="h-10 bg-stone-200/70 rounded-2xl w-2/3"></div>
              <div className="h-14 bg-stone-200/70 rounded-3xl w-full"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-stone-200/60 rounded-3xl h-80 w-full"></div>
                ))}
              </div>
            </div>
          }
        >
          <CatalogContent />
        </Suspense>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
