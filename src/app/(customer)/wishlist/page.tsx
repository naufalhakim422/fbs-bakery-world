'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ProductCard } from '@/components/customer/product-card';
import { Heart, ChevronRight, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useCart();
  const { language } = useLanguage();
  const [products, setProducts] = useState(() => db.getProducts());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadLiveData = async () => {
      const prods = db.getProducts();
      if (isMounted) {
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

  // Filter products that are in the user's wishlist
  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {/* EDITORIAL WISHLIST HEADER */}
        <div className="pb-6 mb-6 border-b border-[#EADBC8] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
              <Link href="/" className="hover:text-[#800020] transition-colors">
                {language === 'EN' ? 'Home' : language === 'MS' ? 'Utama' : 'Beranda'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[#800020] font-bold">
                {language === 'EN' ? 'Saved Wishlist' : language === 'MS' ? 'Senarai Hajat' : 'Wishlist Tersimpan'}
              </span>
            </nav>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B1B] tracking-tight">
              {language === 'EN' ? 'Saved Wishlist' : language === 'MS' ? 'Senarai Hajat' : 'Wishlist Tersimpan'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm font-medium">
              {language === 'EN' 
                ? `Save your favorite baking supplies for your next order (${wishlistProducts.length} items).`
                : language === 'MS' 
                ? `Simpan bahan bakeri kegemaran anda untuk pesanan seterusnya (${wishlistProducts.length} produk).`
                : `Simpan bahan kue favorit Anda untuk pesanan berikutnya (${wishlistProducts.length} produk).`}
            </p>
          </div>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-stone-200 rounded-2xl h-80 w-full"></div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          /* EMPTY WISHLIST STATE */
          <div className="bg-white rounded-2xl p-10 sm:p-14 text-center border border-stone-200 shadow-xs my-6 space-y-3 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-[#2B1B1B]">
                {language === 'EN' ? 'Your Wishlist is Empty' : language === 'MS' ? 'Senarai Hajat Anda Kosong' : 'Wishlist Anda Kosong'}
              </h2>
              <p className="text-stone-500 text-xs font-medium leading-relaxed max-w-xs mx-auto">
                {language === 'EN' 
                  ? 'Explore our premium baking supplies and click the heart icon on any product to save it here.' 
                  : language === 'MS' 
                  ? 'Terokai bahan bakeri premium kami dan tekan ikon hati untuk menyimpannya di sini.' 
                  : 'Telusuri bahan kue premium kami dan tekan ikon hati untuk menyimpannya di sini.'}
              </p>
            </div>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 
              <span>{language === 'EN' ? 'Browse Products' : language === 'MS' ? 'Terokai Produk' : 'Lihat Produk'}</span>
            </Link>
          </div>
        ) : (
          /* WISHLIST PRODUCT GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
