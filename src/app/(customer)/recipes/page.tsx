'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ChefHat, Clock, ArrowRight, Sparkles } from 'lucide-react';

export default function RecipeCenterPage() {
  const { t, language } = useLanguage();
  const [recipes, setRecipes] = useState(db.getRecipes());

  useEffect(() => {
    const loadLiveData = () => {
      setRecipes(db.getRecipes() || []);
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
            {language === 'EN' ? "FBS BAKER'S KITCHEN" : language === 'MS' ? 'DAPUR BAKERI FBS' : 'DAPUR BAKERY FBS'}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-black tracking-tight">
            {language === 'EN' ? 'Recipes & Baking Tutorials' : language === 'MS' ? 'Resipi & Tutorial Bakeri' : 'Resep & Tutorial Baking'}
          </h1>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium">
            {language === 'EN' ? 'Step-by-step recipe guides from master bakers. Click any recipe to view required ingredients and order directly to your kitchen!' : language === 'MS' ? 'Panduan resipi langkah demi langkah daripada pakar bakeri. Klik resipi untuk melihat bahan dan pesan terus ke dapur anda!' : 'Panduan resep langkah-demi-langkah dari master baker. Klik resep untuk melihat bahan yang dibutuhkan dan pesan langsung ke dapur Anda!'}
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="relative aspect-16/9 overflow-hidden">
                <img 
                  src={recipe.coverImage} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-[#800020] text-[#D4AF37] text-xs font-bold rounded-full shadow">
                    {recipe.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full flex items-center gap-1 shadow">
                    <Clock className="w-3.5 h-3.5" /> {recipe.cookingTime} {language === 'EN' ? 'Mins' : language === 'MS' ? 'Minit' : 'Menit'}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#2B1B1B] group-hover:text-[#800020] transition-colors mb-2">
                    {recipe.title}
                  </h2>
                  <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
                    {recipe.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {recipe.ingredients.length} {language === 'EN' ? 'Key Ingredients' : language === 'MS' ? 'Bahan Utama' : 'Bahan Utama'}
                  </span>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                  >
                    {language === 'EN' ? 'View Tutorial & Shop' : language === 'MS' ? 'Lihat Tutorial & Beli' : 'Lihat Tutorial & Belanja'} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
