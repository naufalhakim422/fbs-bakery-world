'use client';

import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Product } from '@/types';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ProductCard } from '@/components/customer/product-card';
import { Search, RefreshCw, Layers, LayoutGrid, List, SlidersHorizontal, Check } from 'lucide-react';

function CatalogContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const selectedCatParam = searchParams.get('category') || '';
  const initialSearchParam = searchParams.get('search') || '';

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
    const qParam = searchParams.get('search') || '';
    const catParam = searchParams.get('category') || '';
    setSearchQuery(qParam);
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  const [allProducts, setAllProducts] = useState<Product[]>(() => db.getProducts());
  const categories = useMemo(() => db.getCategories(), []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const loadLiveData = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setAllProducts(db.getProducts());
      }, 50);
    };
    setAllProducts(db.getProducts());

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
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
        p.productName.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.variants.some(v => v.variantName.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q))
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
      list.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    } else if (sortBy === 'bestseller') {
      list.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => a.productName.localeCompare(b.productName));
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
      {/* ULTRA-MINIMALIST FULL BLACK LEFT-ALIGNED HEADER */}
      <div className="pt-2 pb-6 mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
        <div className="space-y-1.5 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-black text-[11px] font-extrabold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            KATALOG TOKO ROTI FBS
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
            Perlengkapan & Bahan Kue
          </h1>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium">
            Telusuri pilihan lengkap kami yang terdiri dari tepung, cokelat, mentega, hiasan, dan peralatan dengan berbagai pilihan berat.
          </p>
        </div>

        {/* Minimalist Search Input Bar */}
        <div className="w-full md:w-80 relative group">
          <input 
            type="text"
            placeholder="Cari produk, merek, atau bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-black/20 rounded-2xl text-xs text-black placeholder-stone-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/20 shadow-sm transition-all duration-300"
          />
          <Search className="w-4 h-4 text-stone-400 group-focus-within:text-black absolute left-4 top-3.5 transition-colors" />
        </div>
      </div>

      {/* ULTRA-MODERN & MINIMALIST INTEGRATED TOOLBAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EADBC8] shadow-sm mb-6 flex flex-col gap-3">
        
        {/* TOP ROW: CATEGORIES HORIZONTAL SCROLL + RIGHT ACTIONS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Horizontal Smooth Scroll Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none w-full lg:w-auto text-xs whitespace-nowrap">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex-shrink-0 ${
                selectedCategory === ''
                  ? 'bg-[#800020] text-[#F7E7CE] shadow-sm border border-[#D4AF37]/40'
                  : 'bg-stone-100/80 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#800020] text-[#F7E7CE] shadow-sm border border-[#D4AF37]/40'
                    : 'bg-stone-100/80 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* RIGHT SIDE INLINE ACTIONS: HALAL TOGGLE + SORT + GRID/LIST VIEW TOGGLE */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-stone-100">
            
            {/* Halal Only Switch Pill */}
            <button
              onClick={() => setHalalOnly(!halalOnly)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                halalOnly
                  ? 'bg-emerald-800 text-white border-emerald-600 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${halalOnly ? 'bg-white text-emerald-800' : 'border border-stone-400'}`}>
                {halalOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Halal Only</span>
            </button>

            {/* Ready Stock Filter Pill */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                inStockOnly
                  ? 'bg-blue-800 text-white border-blue-600 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${inStockOnly ? 'bg-white text-blue-800' : 'border border-stone-400'}`}>
                {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Ready Stock</span>
            </button>

            {/* New Arrival Filter Pill */}
            <button
              onClick={() => setNewArrivalOnly(!newArrivalOnly)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                newArrivalOnly
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${newArrivalOnly ? 'bg-white text-amber-600' : 'border border-stone-400'}`}>
                {newArrivalOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>New Arrival</span>
            </button>

            {/* Sort Select Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 bg-stone-50 hover:bg-white focus:outline-none focus:border-[#800020] transition-colors"
            >
              <option value="featured">Featured Order</option>
              <option value="price-asc">Harga Termurah</option>
              <option value="price-desc">Harga Termahal</option>
              <option value="newest">Terbaru</option>
              <option value="bestseller">Bestseller</option>
              <option value="name-asc">Nama A-Z</option>
            </select>

            {/* INTEGRATED MODERN GRID / LIST VIEW TOGGLE BUTTONS */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
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
                className={`p-1.5 rounded-lg transition-all ${
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
            {(selectedCategory || searchQuery || halalOnly) && (
              <button
                onClick={handleResetFilters}
                className="p-1.5 text-stone-500 hover:text-red-600 rounded-xl border border-stone-200 hover:border-red-300 transition-colors"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Query Status Banner if Searching */}
      {searchQuery.trim() && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <p className="text-xs text-amber-900 font-bold">
            Hasil pencarian untuk &quot;<span className="text-[#800020]">{searchQuery}</span>&quot;: <span className="font-extrabold">{filteredProducts.length} produk ditemukan</span>
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Hapus Kata Kunci
          </button>
        </div>
      )}

      {/* Product Grid / List Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#EADBC8] shadow-sm my-8">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#800020]">Produk tidak ditemukan</h3>
          <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
            Tidak ada produk baking yang cocok dengan pencarian &quot;{searchQuery}&quot;. Coba kata kunci lain seperti &quot;flour&quot;, &quot;matcha&quot;, &quot;butter&quot;, atau &quot;chocolate&quot;.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-5 py-2.5 bg-[#800020] text-white text-xs font-bold rounded-xl shadow"
          >
            Reset Pencarian
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
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-[#800020]">Loading Catalog...</div>}>
          <CatalogContent />
        </Suspense>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
