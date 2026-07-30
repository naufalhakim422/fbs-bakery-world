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
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState(db.getRecipes());

  useEffect(() => {
    const loadLiveData = () => {
      setRecipes(db.getRecipes());
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
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800020] to-[#5A0015] text-[#FFF8F0] p-8 sm:p-12 rounded-3xl mb-12 shadow-xl border border-[#D4AF37]/30 text-center">
          <ChefHat className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
            FBS BAKER'S KITCHEN
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Baking Recipe Center & Tutorials
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
            Step-by-step baking recipes tested by master bakers. Click any recipe to view required ingredients and instantly shop them for your kitchen!
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
                    <Clock className="w-3.5 h-3.5" /> {recipe.cookingTime} Mins
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
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {recipe.ingredients.length} Key Ingredients
                  </span>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                  >
                    View Tutorial & Shop <ArrowRight className="w-3.5 h-3.5" />
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
