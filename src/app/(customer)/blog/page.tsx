'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { VideoPost } from '@/types';
import { BookOpen, Calendar, User, ArrowRight, Film, Play, X, Clock, PlayCircle } from 'lucide-react';

export default function BlogListPage() {
  const { language, t } = useLanguage();
  const [blogs, setBlogs] = useState(db.getBlogs());
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [activeTab, setActiveTab] = useState<'articles' | 'videos'>('articles');
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);

  useEffect(() => {
    const loadLiveData = () => {
      setBlogs(db.getBlogs());
      setVideos(db.getVideos().filter(v => v.status === 'PUBLISHED'));
    };
    loadLiveData();

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      const savedTab = localStorage.getItem('fbs_blog_active_tab');
      if (tabParam === 'videos' || tabParam === 'articles') {
        setActiveTab(tabParam);
      } else if (savedTab === 'videos' || savedTab === 'articles') {
        setActiveTab(savedTab);
        localStorage.removeItem('fbs_blog_active_tab');
      }
    }

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, []);

  // Multi-language UI texts
  const langTexts = {
    title: language === 'ID' 
      ? 'Pusat Pengetahuan Baking' 
      : language === 'MS' 
      ? 'Pusat Pengetahuan Baking' 
      : 'Baking Knowledge Center',
    subtitle: language === 'ID' 
      ? 'Tips baking profesional, perbandingan bahan, teknik oven, dan panduan video dari chef pastri kami.' 
      : language === 'MS' 
      ? 'Petua baking profesional, perbandingan bahan, teknik ketuhar, dan panduan video daripada chef pastri kami.' 
      : 'Professional baking tips, ingredient comparisons, oven techniques, and video guides from our pastry chefs.',
    tabArticles: language === 'ID' ? 'Artikel Edukasi' : language === 'MS' ? 'Artikel Edukasi' : 'Educational Articles',
    tabVideos: language === 'ID' ? 'Video & Tutorial' : language === 'MS' ? 'Video & Tutorial' : 'Videos & Tutorials',
    watchNow: language === 'ID' ? 'Tonton Sekarang' : language === 'MS' ? 'Tonton Sekarang' : 'Watch Now',
    readArticle: language === 'ID' ? 'Baca Selengkapnya' : language === 'MS' ? 'Baca Selengkapnya' : 'Read Full Article',
    noVideos: language === 'ID' ? 'Belum ada video tutorial.' : language === 'MS' ? 'Belum ada video tutorial.' : 'No video tutorials available yet.',
    noArticles: language === 'ID' ? 'Belum ada artikel edukasi.' : language === 'MS' ? 'Belum ada artikel edukasi.' : 'No articles available yet.',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Modern Minimalist Banner Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl mb-8 shadow-sm border border-stone-200/80 text-center relative overflow-hidden">
          <BookOpen className="w-10 h-10 text-[#800020] mx-auto mb-2" />
          <span className="text-[11px] font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
            FBS BAKING EDUCATION & VIDEOS
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
            {langTexts.title}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-2xl mx-auto leading-relaxed font-medium">
            {langTexts.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-6 py-3 rounded-2xl font-serif text-sm font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'articles'
                ? 'bg-[#800020] text-[#D4AF37] border-[#D4AF37]/40 shadow-md scale-105'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{langTexts.tabArticles}</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 rounded-2xl font-serif text-sm font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'videos'
                ? 'bg-[#800020] text-[#D4AF37] border-[#D4AF37]/40 shadow-md scale-105'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{langTexts.tabVideos}</span>
          </button>
        </div>

        {/* ARTICLES CONTENT TAB */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {blogs.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-stone-200">
                <p className="text-stone-500 font-bold">{langTexts.noArticles}</p>
              </div>
            ) : (
              blogs.map((blog) => (
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
                      <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-2">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#800020]" /> {blog.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#800020]" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#2B1B1B] group-hover:text-[#800020] transition-colors mb-2 line-clamp-2">
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
                        {langTexts.readArticle} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIDEOS CONTENT TAB */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {videos.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-stone-200">
                <p className="text-stone-500 font-bold">{langTexts.noVideos}</p>
              </div>
            ) : (
              videos.map((video) => (
                <div key={video.id} className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  
                  {/* Thumbnail / Video play trigger */}
                  <div 
                    onClick={() => setSelectedVideo(video)}
                    className="relative aspect-video overflow-hidden cursor-pointer bg-black group-hover:opacity-95 transition-opacity"
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#800020]/90 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/50 shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-[#D4AF37] ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/85 text-white text-[10px] font-mono rounded font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D4AF37]" /> {video.duration}
                    </span>
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-stone-900/90 text-[#D4AF37] text-[9px] font-extrabold rounded border border-[#D4AF37]/30 uppercase">
                      {video.platform}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#800020] uppercase tracking-wider block mb-1">
                        {video.category}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#2B1B1B] line-clamp-2 group-hover:text-[#800020] transition-colors leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mt-1">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-semibold">
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] text-xs font-bold rounded-xl border border-[#D4AF37]/30 flex items-center gap-1.5 shadow"
                      >
                        <PlayCircle className="w-4 h-4" /> {langTexts.watchNow}
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* POPUP/MODAL VIDEO PLAYER */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181113] rounded-3xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-[#D4AF37]/30 animate-scale-up relative">
            
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="absolute -top-3 -right-3 sm:top-4 sm:right-4 p-2 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] rounded-full border border-[#D4AF37]/40 shadow-lg transition-colors z-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Header */}
            <div>
              <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-widest block mb-0.5">
                {selectedVideo.category} • {selectedVideo.platform} VIDEO
              </span>
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-white leading-snug">
                {selectedVideo.title}
              </h2>
            </div>

            {/* Video Frame */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-stone-800 shadow-inner">
              {selectedVideo.platform === 'FBS' ? (
                <video 
                  src={selectedVideo.embedUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={selectedVideo.embedUrl.includes('youtube.com') && !selectedVideo.embedUrl.includes('embed/')
                    ? selectedVideo.embedUrl.replace('watch?v=', 'embed/')
                    : selectedVideo.embedUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Description */}
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-h-24 overflow-y-auto pr-2">
              {selectedVideo.description}
            </p>
          </div>
        </div>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
