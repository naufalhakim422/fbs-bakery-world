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
  LayoutGrid, 
  List, 
  Check, 
  ChevronRight, 
  Package, 
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
      {/* EDITORIAL CATALOG HEADER */}
      <div className="pb-6 mb-6 border-b border-[#EADBC8] flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        
        <div className="space-y-2 max-w-2xl text-left">
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

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B1B] tracking-tight">
            {language === 'EN' ? 'Baking Supplies & Ingredients' : language === 'MS' ? 'Bekalan & Bahan Bakeri' : 'Perlengkapan & Bahan Kue'}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed">
            {language === 'EN' ? 'Browse our complete selection of flours, chocolates, butter, decorations, and tools.' : language === 'MS' ? 'Semak pilihan lengkap tepung, coklat, mentega, hiasan, dan peralatan kami.' : 'Telusuri pilihan lengkap kami yang terdiri dari tepung, cokelat, mentega, hiasan, dan peralatan.'}
          </p>
        </div>

        {/* Clean Integrated Search Input Box */}
        <div className="w-full md:w-80 relative group shrink-0">
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#800020] transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 transition-colors" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 p-0.5 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* FILTER TOOLBAR & CATEGORY SELECTOR */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 space-y-4">
        
        {/* CATEGORY TABS HORIZONTAL SCROLL */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs whitespace-nowrap">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === ''
                ? 'bg-[#800020] text-[#FFF8F0]'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.common.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#800020] text-[#FFF8F0]'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* INLINE ACTIONS: TOGGLES + SORT + GRID/LIST VIEW */}
        <div className="flex flex-wrap items-center gap-2.5 justify-between pt-3 border-t border-stone-100 text-xs font-bold text-stone-700">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Halal Only Filter Button */}
            <button
              onClick={() => setHalalOnly(!halalOnly)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                halalOnly
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${halalOnly ? 'bg-white text-emerald-800' : 'border border-stone-400'}`}>
                {halalOnly && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>{t.common.halalOnly}</span>
            </button>

            {/* Ready Stock Filter Button */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                inStockOnly
                  ? 'bg-blue-800 text-white border-blue-800'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${inStockOnly ? 'bg-white text-blue-800' : 'border border-stone-400'}`}>
                {inStockOnly && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>{language === 'EN' ? 'Ready Stock' : language === 'MS' ? 'Stok Sedia Ada' : 'Stok Tersedia'}</span>
            </button>

            {/* New Arrival Filter Button */}
            <button
              onClick={() => setNewArrivalOnly(!newArrivalOnly)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                newArrivalOnly
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${newArrivalOnly ? 'bg-white text-amber-600' : 'border border-stone-400'}`}>
                {newArrivalOnly && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>{language === 'EN' ? 'New Arrival' : language === 'MS' ? 'Produk Baharu' : 'Produk Baru'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 bg-stone-50 hover:bg-white focus:outline-none focus:border-[#800020] transition-colors cursor-pointer"
            >
              <option value="featured">{language === 'EN' ? 'Featured Order' : language === 'MS' ? 'Susunan Utama' : 'Pilihan Utamakan'}</option>
              <option value="price-asc">{language === 'EN' ? 'Price: Low to High' : language === 'MS' ? 'Harga: Rendah ke Tinggi' : 'Harga Termurah'}</option>
              <option value="price-desc">{language === 'EN' ? 'Price: High to Low' : language === 'MS' ? 'Harga: Tinggi ke Rendah' : 'Harga Termahal'}</option>
              <option value="newest">{language === 'EN' ? 'Newest' : language === 'MS' ? 'Terkini' : 'Terbaru'}</option>
              <option value="bestseller">{language === 'EN' ? 'Bestseller' : language === 'MS' ? 'Terlaris' : 'Bestseller'}</option>
              <option value="name-asc">{language === 'EN' ? 'Name A-Z' : language === 'MS' ? 'Nama A-Z' : 'Nama A-Z'}</option>
            </select>

            {/* Grid / List View Buttons */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#800020] text-[#FFF8F0]'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#800020] text-[#FFF8F0]'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Reset Filter Button */}
            {(selectedCategory || searchQuery || halalOnly || inStockOnly || newArrivalOnly) && (
              <button
                onClick={handleResetFilters}
                className="p-1.5 text-stone-500 hover:text-red-600 rounded-xl border border-stone-200 hover:border-red-300 transition-colors cursor-pointer"
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
        <div className="mb-6 p-4 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-between">
          <p className="text-xs sm:text-sm text-stone-800 font-bold">
            {language === 'EN' ? 'Search results for' : language === 'MS' ? 'Hasil carian untuk' : 'Hasil pencarian untuk'} &quot;<span className="text-[#800020]">{searchQuery}</span>&quot;: <span className="font-extrabold text-[#800020]">{filteredProducts.length} {language === 'EN' ? 'products found' : language === 'MS' ? 'produk dijumpai' : 'produk ditemukan'}</span>
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
          >
            {language === 'EN' ? 'Clear Keyword' : language === 'MS' ? 'Padam Kata Kunci' : 'Hapus Kata Kunci'}
          </button>
        </div>
      )}

      {/* Product Display Grid / List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm my-6 space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#2B1B1B]">{t.common.noResults}</h3>
            <p className="text-stone-500 text-xs font-medium leading-relaxed">
              {language === 'EN' ? `No baking products match your search query "${searchQuery}".` : language === 'MS' ? `Tiada produk bakeri yang sepadan dengan carian "${searchQuery}".` : `Tidak ada produk baking yang cocok dengan pencarian "${searchQuery}".`}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-[#800020] hover:bg-[#600018] text-[#FFF8F0] font-bold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
          >
            {t.common.reset}
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <Suspense 
          fallback={
            <div className="py-12 space-y-6 animate-pulse">
              <div className="h-8 bg-stone-200 rounded-xl w-1/3"></div>
              <div className="h-12 bg-stone-200 rounded-2xl w-full"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-stone-200 rounded-2xl h-72 w-full"></div>
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
