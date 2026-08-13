'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { User, Calendar, ArrowLeft, BookOpen, Video as VideoIcon, PlayCircle, Sparkles } from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t, language } = useLanguage();
  const blog = db.getBlogBySlug(slug);

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
        <AnnouncementBar />
        <HeaderNav />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#800020]">
            {language === 'EN' ? 'Article Not Found' : language === 'MS' ? 'Artikel Tidak Ditemui' : 'Artikel Tidak Ditemukan'}
          </h2>
          <Link href="/blog" className="mt-4 px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] text-xs font-bold rounded-xl shadow-xs uppercase tracking-wider transition-all cursor-pointer">
            {language === 'EN' ? 'Back to Blog List' : language === 'MS' ? 'Kembali ke Senarai Blog' : 'Kembali ke Daftar Blog'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] hover:underline mb-6 uppercase tracking-wider cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> {language === 'EN' ? 'Back to Blog List' : language === 'MS' ? 'Kembali ke Senarai Blog' : 'Kembali ke Daftar Blog'}
        </Link>

        {/* Editorial Article Main Card */}
        <article className="bg-white rounded-2xl p-6 sm:p-10 border border-stone-200 shadow-xs space-y-6 text-stone-900">
          
          {/* Article Header Metadata */}
          <div className="flex items-center gap-3 text-xs text-stone-500 font-medium border-b border-stone-100 pb-3">
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#800020]" /> {blog.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#800020]" /> {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
          </div>

          {/* Article Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
            {blog.title}
          </h1>

          {/* Article Excerpt Quote */}
          {blog.excerpt && (
            <p className="text-stone-600 text-xs sm:text-sm font-medium italic border-l-3 border-[#800020] pl-4 py-2 bg-stone-50 rounded-r-xl leading-relaxed">
              "{blog.excerpt}"
            </p>
          )}

          {/* Video Demo Tutorial Embed or Hero Image */}
          {blog.videoUrl ? (
            <div className="rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-stone-900">
              <div className="p-2.5 bg-stone-900 text-[#FFF8F0] text-[11px] font-bold flex items-center gap-2 border-b border-stone-800 uppercase tracking-wider">
                <VideoIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'EN' ? 'VIDEO DEMO TUTORIAL & BAKING GUIDE' : language === 'MS' ? 'TUTORIAL DEMO VIDEO & PANDUAN BAKERI' : 'VIDEO DEMO TUTORIAL & PANDUAN BAKING'}</span>
              </div>
              <video 
                src={blog.videoUrl} 
                controls 
                poster={blog.image} 
                className="w-full max-h-[440px] object-contain bg-black" 
              />
            </div>
          ) : (
            <div className="aspect-16/9 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Article Body Content */}
          <div className="prose max-w-none text-stone-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line pt-2 border-b border-stone-200 pb-8 font-medium">
            {blog.content}
          </div>

          {/* Official Social Media Engagement Box */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-stone-900 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#800020] uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#800020]" /> {language === 'EN' ? 'OFFICIAL SOCIAL MEDIA CHANNELS' : language === 'MS' ? 'SALURAN MEDIA SOSIAL RASMI' : 'SALURAN MEDIA SOSIAL RESMI'}
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {language === 'EN' ? 'Get Latest Tips, Video Recipes & Promos!' : language === 'MS' ? 'Dapatkan Petua, Video Resipi & Promo Terkini!' : 'Dapatkan Tips, Video Resep & Promo Terbaru!'}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <a 
                  href="https://www.instagram.com/fbsbakery_world?igsh=NGRkaTYzcXg3MDF3" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg> Instagram
                </a>

                <a 
                  href="https://www.facebook.com/share/1dT9teNY9t/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3.5 py-2 bg-[#1877F2] hover:bg-[#165ec9] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg> Facebook
                </a>

                <a 
                  href="https://www.tiktok.com/@fbsbakeryworld?_r=1&_t=ZS-98RKKo3aipw" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-[#00f2fe]" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.82.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46V13a8.28 8.28 0 0 0 5.73 2.25V11.8a4.83 4.83 0 0 1-3.77-1.34V6.69z"/>
                  </svg> TikTok
                </a>
              </div>
            </div>
          </div>

        </article>

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
