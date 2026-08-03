'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ProductCard } from '@/components/customer/product-card';
import { useCart } from '@/lib/cart-context';
import { ChefHat, Clock, Check, ShoppingBag, ArrowLeft, Sparkles, CheckCircle2, PlayCircle, Video as VideoIcon } from 'lucide-react';

export default function RecipeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t, language } = useLanguage();
  const recipe = db.getRecipeBySlug(slug);

  const { addToCart } = useCart();
  const [addedAll, setAddedAll] = useState(false);

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
        <AnnouncementBar />
        <HeaderNav />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <h2 className="font-serif text-3xl font-bold text-[#800020]">
            {language === 'EN' ? 'Recipe Not Found' : language === 'MS' ? 'Resipi Tidak Ditemui' : 'Resep Tidak Ditemukan'}
          </h2>
          <Link href="/recipes" className="mt-4 px-6 py-2.5 bg-[#800020] text-white text-xs font-bold rounded-xl">
            {language === 'EN' ? 'Back to Recipes' : language === 'MS' ? 'Kembali ke Resipi' : 'Kembali ke Resep'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Get related products for this recipe
  const relatedProducts = recipe.relatedProductIds
    .map(id => db.getProductBySlug(id))
    .filter(Boolean) as any[];

  const handleAddAllIngredients = () => {
    relatedProducts.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        addToCart(p, p.variants[0], 1);
      }
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2500);
  };

  const recipeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.coverImage,
    description: recipe.description,
    prepTime: `PT${recipe.cookingTime}M`,
    cookTime: `PT${recipe.cookingTime}M`,
    totalTime: `PT${recipe.cookingTime}M`,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((step, idx) => ({
      '@type': 'HowToStep',
      name: `Step ${idx + 1}`,
      text: step,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        <Link href="/recipes" className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> {language === 'EN' ? 'Back to Recipe Center' : language === 'MS' ? 'Kembali ke Pusat Resipi' : 'Kembali ke Pusat Resep'}
        </Link>

        {/* Recipe Title & Meta Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EADBC8] shadow-md mb-10">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 bg-[#800020] text-[#D4AF37] text-xs font-bold rounded-full">
              {recipe.difficulty}
            </span>
            <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#800020]" /> {recipe.cookingTime} {language === 'EN' ? 'Minutes' : language === 'MS' ? 'Minit' : 'Menit'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2B1B1B] mb-3">
            {recipe.title}
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">{recipe.description}</p>

          {/* VIDEO TUTORIAL PLAYER (IF AVAILABLE) */}
          {recipe.videoUrl ? (
            <div className="mt-6 rounded-3xl overflow-hidden shadow-xl border-2 border-[#800020] bg-black">
              <div className="p-3 bg-[#800020] text-[#D4AF37] text-xs font-bold flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'EN' ? 'BAKING VIDEO TUTORIAL & STEP-BY-STEP DEMO' : language === 'MS' ? 'TUTORIAL VIDEO BAKERI & DEMO LANGKAH DEMI LANGKAH' : 'VIDEO TUTORIAL BAKING & DEMO LANGKAH DEMI LANGKAH'}</span>
              </div>
              <video 
                src={recipe.videoUrl} 
                controls 
                poster={recipe.coverImage} 
                className="w-full max-h-[440px] object-contain bg-black" 
              />
            </div>
          ) : (
            <div className="mt-6 aspect-21/9 rounded-2xl overflow-hidden shadow-inner border border-stone-200">
              <img src={recipe.coverImage} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Left Column: Ingredients Checklist */}
          <div className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="font-serif text-xl font-bold text-[#800020] flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#800020]" /> {language === 'EN' ? 'Ingredients List' : language === 'MS' ? 'Senarai Bahan' : 'Daftar Bahan'}
              </h2>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-700">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#FFF8F0] p-2.5 rounded-xl border border-[#EADBC8]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>

            {relatedProducts.length > 0 && (
              <button
                onClick={handleAddAllIngredients}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                  addedAll ? 'bg-emerald-600 text-white' : 'bg-[#800020] hover:bg-[#6F1D1B] text-white'
                }`}
              >
                {addedAll ? (
                  <>
                    <Check className="w-4 h-4" /> {language === 'EN' ? 'Added Ingredients to Cart!' : language === 'MS' ? 'Bahan Ditambah ke Troli!' : 'Bahan Ditambahkan ke Keranjang!'}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> {language === 'EN' ? 'Add All Recipe Products to Cart' : language === 'MS' ? 'Tambah Semua Bahan Resipi ke Troli' : 'Tambah Semua Produk Resep ke Keranjang'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column: Step-by-Step Instructions */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8] shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#800020] border-b border-stone-200 pb-3">
              {language === 'EN' ? 'Step-by-Step Baking Tutorial' : language === 'MS' ? 'Tutorial Bakeri Langkah demi Langkah' : 'Tutorial Baking Langkah demi Langkah'}
            </h2>

            <div className="space-y-6">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-bold text-sm flex items-center justify-center flex-shrink-0 shadow">
                    {idx + 1}
                  </div>
                  <div className="flex-1 pt-1 text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* OFFICIAL SOCIAL MEDIA ENGAGEMENT BANNER */}
        <div className="bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#2B1B1B] text-[#FFF8F0] p-6 sm:p-8 rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl mb-12 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-700/80 pb-4">
            <div>
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest block mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {language === 'EN' ? 'FOLLOW & TAG YOUR BAKING CREATIONS' : language === 'MS' ? 'IKUTI & TAG HASIL BAKERI ANDA' : 'IKUTI & TAG HASIL BAKING ANDA'}
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                {language === 'EN' ? 'Share Your Recipe Creations On Our Official Social Media!' : language === 'MS' ? 'Kongsi Hasil Resipi Ini di Media Sosial Rasmi Kami!' : 'Bagikan Hasil Olahan Resep Ini Di Media Sosial Resmi Kami!'}
              </h3>
              <p className="text-stone-300 text-xs mt-1 max-w-xl">
                {language === 'EN' ? 'Tried this baking recipe at home or cafe? Record a quick video or take photos, then tag Instagram & TikTok @fbsbakeryworld to get officially reposted by FBS Chef!' : language === 'MS' ? 'Mencuba resipi kek ini di rumah atau kafe? Rakam video atau ambil foto kek anda, kemudian tag Instagram & TikTok @fbsbakeryworld untuk di-repost rasmi oleh Chef FBS!' : 'Mencoba resep kue ini di rumah atau kafe Anda? Rekam video singkat atau ambil foto kue terbaik Anda, lalu tag akun Instagram & TikTok @fbsbakeryworld untuk di-repost resmi oleh Chef FBS!'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {/* INSTAGRAM */}
              <a 
                href="https://www.instagram.com/fbsbakery_world?igsh=NGRkaTYzcXg3MDF3" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:scale-105 text-white text-xs font-bold rounded-xl shadow transition-transform flex items-center gap-2 border border-white/20"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg> Instagram
              </a>

              {/* FACEBOOK */}
              <a 
                href="https://www.facebook.com/share/1dT9teNY9t/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-[#1877F2] hover:bg-[#165ec9] hover:scale-105 text-white text-xs font-bold rounded-xl shadow transition-transform flex items-center gap-2 border border-white/20"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg> Facebook
              </a>

              {/* TIKTOK */}
              <a 
                href="https://www.tiktok.com/@fbsbakeryworld?_r=1&_t=ZS-98RKKo3aipw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-stone-900 border border-stone-700 hover:border-[#00f2fe] hover:scale-105 text-white text-xs font-bold rounded-xl shadow transition-transform flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current text-[#00f2fe]" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.82.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46V13a8.28 8.28 0 0 0 5.73 2.25V11.8a4.83 4.83 0 0 1-3.77-1.34V6.69z"/>
                </svg> TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Linked Recipe Products Showcase */}
        {relatedProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
                  Required Ingredients
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#2B1B1B]">
                  Shop Products Used in This Recipe
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
