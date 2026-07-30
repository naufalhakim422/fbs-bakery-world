'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogListPage() {
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState(db.getBlogs());

  useEffect(() => {
    const loadLiveData = () => {
      setBlogs(db.getBlogs());
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
          <BookOpen className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
            FBS BAKING EDUCATION & TIPS
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Baking Knowledge & Guides
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
            Professional baking tips, ingredient comparisons, oven techniques, and bakery business advice from master pastry chefs.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="relative aspect-16/9 overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#800020]" /> {blog.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#800020]" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="font-serif font-bold text-2xl text-[#2B1B1B] group-hover:text-[#800020] transition-colors mb-2">
                    {blog.title}
                  </h2>
                  <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] hover:underline"
                  >
                    Read Full Article <ArrowRight className="w-3.5 h-3.5" />
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
