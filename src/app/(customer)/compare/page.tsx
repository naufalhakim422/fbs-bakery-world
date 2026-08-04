'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { formatMYR, formatSoldQuantity } from '@/lib/currency';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ProductBadges } from '@/components/customer/product-badges';
import { 
  Scale, 
  Trash2, 
  ShoppingBag, 
  ChevronRight, 
  Sparkles, 
  Check, 
  X, 
  Plus, 
  Search,
  Star,
  Flame,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, addToCart, toggleCompare } = useCart();
  const { language } = useLanguage();

  const [highlightDiff, setHighlightDiff] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const products: Product[] = compareList
    .map(id => db.getProductById(id))
    .filter(Boolean) as Product[];

  const allProducts = db.getProducts();
  const availableToAdd = allProducts.filter(p => !compareList.includes(p.id));
  const filteredAvailable = availableToAdd.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Difference detection helpers
  const brandsDiffer = products.length > 1 && new Set(products.map(p => p.brand.toLowerCase())).size > 1;
  const categoriesDiffer = products.length > 1 && new Set(products.map(p => (p.categoryName || '').toLowerCase())).size > 1;
  const pricesDiffer = products.length > 1 && new Set(products.map(p => p.variants?.[0]?.price || 0)).size > 1;
  const stocksDiffer = products.length > 1 && new Set(products.map(p => (p.variants?.[0]?.stock || 0) > 0)).size > 1;

  const handleAddToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      addToCart(product, product.variants[0], 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FDFBF7] flex flex-col font-sans text-stone-800">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-[#800020] transition-colors">Utama</Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="font-bold text-[#800020]">Perbandingan Produk</span>
        </div>

        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#800020] text-white rounded-2xl shadow-md">
                <Scale className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {language === 'EN' ? 'Product Comparison' : language === 'MS' ? 'Perbandingan Produk' : 'Perbandingan Produk Baking'}
              </h1>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm mt-1.5">
              {language === 'EN' 
                ? 'Compare prices, weight variants, brand quality, and stock availability side-by-side (Up to 4 items).' 
                : 'Bandingkan harga, varian berat, jenama, dan ketersediaan stok produk secara sebelah-menyebelah (Maksimum 4 item).'}
            </p>
          </div>

          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Highlight Differences Toggle */}
              <button
                onClick={() => setHighlightDiff(!highlightDiff)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  highlightDiff 
                    ? 'bg-[#800020] text-white border-[#800020] shadow-sm' 
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{highlightDiff ? 'Sorot Perbedaan (ON)' : 'Sorot Perbedaan (OFF)'}</span>
              </button>

              {/* Clear All */}
              <button
                onClick={clearCompare}
                className="px-4 py-2 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 rounded-xl text-xs font-bold transition-all border border-stone-200 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Kosongkan Matriks
              </button>
            </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBC8] shadow-sm max-w-xl mx-auto my-8 space-y-4">
            <div className="w-20 h-20 bg-[#FFF8F0] text-[#800020] rounded-full flex items-center justify-center mx-auto border-2 border-[#800020]/20 shadow-inner">
              <Scale className="w-10 h-10" />
            </div>
            <h2 className="font-serif font-bold text-xl text-stone-900">Belum Ada Produk Dibandingkan</h2>
            <p className="text-stone-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Klik ikon timbangan (<Scale className="w-3.5 h-3.5 inline text-[#800020]" />) pada Kartu Produk atau Halaman Detail Produk untuk mulai membandingkan spesifikasi &amp; harga.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" /> Lihat Katalog Produk
              </Link>
            </div>
          </div>
        ) : (
          /* COMPARISON MATRIX TABLE */
          <div className="bg-white rounded-3xl border border-[#EADBC8] shadow-xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                
                {/* TABLE HEADER: Product Images & Basic Info */}
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-4 w-48 text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-100/60 sticky left-0 z-10 border-r border-stone-200">
                      Spesifikasi
                    </th>
                    {products.map(p => (
                      <th key={p.id} className="p-5 min-w-[200px] max-w-[260px] align-top relative group border-r border-stone-200 last:border-r-0">
                        {/* Remove Item Button */}
                        <button
                          onClick={() => removeFromCompare(p.id)}
                          className="absolute top-3 right-3 p-1.5 bg-stone-200 hover:bg-rose-600 hover:text-white rounded-full text-stone-600 transition-colors shadow-sm"
                          title="Hapus dari Perbandingan"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-3 pt-2">
                          <div className="relative">
                            <img
                              src={p.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop'}
                              alt={p.productName}
                              className="w-28 h-28 object-cover rounded-2xl border border-stone-200 shadow-sm"
                            />
                            <ProductBadges product={p} size="sm" className="absolute top-1 left-1" />
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#800020] block">
                              {p.categoryName}
                            </span>
                            <Link href={`/products/${p.slug}`} className="font-serif font-bold text-sm text-stone-900 hover:text-[#800020] transition-colors line-clamp-2 mt-1">
                              {p.productName}
                            </Link>
                          </div>

                          {/* Price Tag */}
                          <div className="text-base font-extrabold text-[#800020]">
                            {formatMYR(p.variants?.[0]?.price || 0)}
                          </div>
                        </div>
                      </th>
                    ))}

                    {/* Placeholder Slot to Add Product (If < 4) */}
                    {products.length < 4 && (
                      <th className="p-6 min-w-[180px] align-middle text-center bg-stone-50/50">
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="w-full py-8 border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl text-stone-400 hover:text-[#800020] transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-[#800020]/10 flex items-center justify-center transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold">Tambah Produk ({products.length}/4)</span>
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* TABLE BODY: Specs Rows */}
                <tbody className="divide-y divide-stone-200 text-xs">

                  {/* ROW 1: JENAMA / BRAND */}
                  <tr className={highlightDiff && brandsDiffer ? 'bg-amber-50/70 font-semibold' : ''}>
                    <td className="p-4 font-bold text-stone-700 bg-stone-50/60 sticky left-0 z-10 border-r border-stone-200">
                      Jenama (Brand)
                    </td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 text-center font-bold text-stone-800 border-r border-stone-200 last:border-r-0">
                        {p.brand}
                      </td>
                    ))}
                    {products.length < 4 && <td className="bg-stone-50/20"></td>}
                  </tr>

                  {/* ROW 2: KATEGORI */}
                  <tr className={highlightDiff && categoriesDiffer ? 'bg-amber-50/70 font-semibold' : ''}>
                    <td className="p-4 font-bold text-stone-700 bg-stone-50/60 sticky left-0 z-10 border-r border-stone-200">
                      Kategori Produk
                    </td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 text-center text-stone-700 border-r border-stone-200 last:border-r-0">
                        {p.categoryName || '-'}
                      </td>
                    ))}
                    {products.length < 4 && <td className="bg-stone-50/20"></td>}
                  </tr>

                  {/* ROW 3: HARGA PER VARIAN */}
                  <tr className={highlightDiff && pricesDiffer ? 'bg-amber-50/70 font-semibold' : ''}>
                    <td className="p-4 font-bold text-stone-700 bg-stone-50/60 sticky left-0 z-10 border-r border-stone-200">
                      Harga Varian
                    </td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 text-center border-r border-stone-200 last:border-r-0">
                        <div className="space-y-1">
                          {p.variants.map(v => (
                            <div key={v.id} className="inline-block px-2 py-1 bg-stone-100 rounded-md text-[11px] font-mono mx-0.5">
                              {v.variantName}: <strong className="text-[#800020]">{formatMYR(v.price)}</strong>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                    {products.length < 4 && <td className="bg-stone-50/20"></td>}
                  </tr>

                  {/* ROW 4: STATUS STOK */}
                  <tr className={highlightDiff && stocksDiffer ? 'bg-amber-50/70 font-semibold' : ''}>
                    <td className="p-4 font-bold text-stone-700 bg-stone-50/60 sticky left-0 z-10 border-r border-stone-200">
                      Status Stok
                    </td>
                    {products.map(p => {
                      const inStock = (p.variants?.[0]?.stock || 0) > 0;
                      return (
                        <td key={p.id} className="p-4 text-center border-r border-stone-200 last:border-r-0">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {inStock ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {inStock ? 'Stok Tersedia' : 'Kehabisan Stok'}
                          </span>
                        </td>
                      );
                    })}
                    {products.length < 4 && <td className="bg-stone-50/20"></td>}
                  </tr>

                  {/* ROW 5: PENGIRIMAN & BERAT */}
                  <tr>
                    <td className="p-4 font-bold text-stone-700 bg-stone-50/60 sticky left-0 z-10 border-r border-stone-200">
                      Berat per Unit
                    </td>
                    {products.map(p => {
                      const weight = p.variants?.[0]?.weight || 1.0;
                      return (
                        <td key={p.id} className="p-4 text-center text-stone-700 font-mono border-r border-stone-200 last:border-r-0">
                          {weight <= 50 ? `${weight * 1000}g (${weight} kg)` : `${weight}g`}
                        </td>
                      );
                    })}
                    {products.length < 4 && <td className="bg-stone-50/20"></td>}
                  </tr>

                  {/* ROW 6: HALAL & KUALITAS */}
                  <tr>
                    <td className="p-4 font-bold text-stone-700 bg-stone-50/60 sticky left-0 z-10 border-r border-stone-200">
                      Sertifikasi Halal
                    </td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 text-center border-r border-stone-200 last:border-r-0">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" /> Certified Halal
                        </span>
                      </td>
                    ))}
                    {products.length < 4 && <td className="bg-stone-50/20"></td>}
                  </tr>

                  {/* ROW 7: PENJUALAN */}
                  <tr>
                    <td className="p-4 font-bold text-stone-700 bg-stone-50/60 sticky left-0 z-10 border-r border-stone-200">
                      Total Terjual
                    </td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 text-center text-orange-600 font-bold border-r border-stone-200 last:border-r-0">
                        <span className="inline-flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> {formatSoldQuantity(p.totalSold)}
                        </span>
                      </td>
                    ))}
                    {products.length < 4 && <td className="bg-stone-50/20"></td>}
                  </tr>

                  {/* ROW 8: ADD TO CART ACTION */}
                  <tr className="bg-stone-50/50">
                    <td className="p-4 font-bold text-stone-700 bg-stone-100/60 sticky left-0 z-10 border-r border-stone-200">
                      Aksi Pembelian
                    </td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 text-center border-r border-stone-200 last:border-r-0">
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="w-full py-2.5 px-3 bg-[#800020] hover:bg-[#6F1D1B] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <ShoppingBag className="w-4 h-4" /> Beli Produk
                        </button>
                      </td>
                    ))}
                    {products.length < 4 && <td className="bg-stone-50/20"></td>}
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL TO ADD MORE PRODUCTS TO COMPARISON */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#800020]" /> Tambah Produk ke Perbandingan
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Cari nama produk atau jenama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#800020] outline-none"
              />
            </div>

            {/* Available Products List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredAvailable.length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-500">Tidak ada produk ditemukan.</div>
              ) : (
                filteredAvailable.map(p => (
                  <div
                    key={p.id}
                    className="p-3 bg-stone-50 hover:bg-[#FFF8F0] rounded-2xl border border-stone-200 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop'}
                        alt={p.productName}
                        className="w-12 h-12 object-cover rounded-xl border border-stone-200"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-xs text-stone-900 line-clamp-1">{p.productName}</h4>
                        <span className="text-[10px] text-stone-500">{p.brand} • {formatMYR(p.variants?.[0]?.price || 0)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        toggleCompare(p.id);
                        setIsAddModalOpen(false);
                      }}
                      className="px-3 py-1.5 bg-[#800020] text-white text-xs font-bold rounded-xl shadow hover:bg-[#6F1D1B] transition-all"
                    >
                      Pilih
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
