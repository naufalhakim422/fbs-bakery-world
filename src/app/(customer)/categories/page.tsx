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
  const { t } = useLanguage();
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
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#800020] to-[#5A0015] text-[#FFF8F0] p-8 sm:p-12 rounded-3xl mb-12 shadow-xl border border-[#D4AF37]/30 text-center">
          <Layers className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
            FBS BAKERY COLLECTIONS
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Product Categories Showcase
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
            Browse baking supplies organized by specialty: premium flours, couverture chocolates, New Zealand dairy butter, cake decorations, commercial tools, and packaging.
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#800020] text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full shadow border border-[#D4AF37]/40">
                    {count} Products Available
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
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Halal Certified
                    </span>
                    <Link
                      href={`/products?category=${cat.id}`}
                      className="px-4 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                    >
                      Browse Category <ArrowRight className="w-4 h-4" />
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
