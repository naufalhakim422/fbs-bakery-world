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
import { getEmbedVideoUrl } from '@/lib/video-utils';
import { BookOpen, Calendar, User, ArrowRight, Film, Play, X, Clock, PlayCircle, Sparkles, ExternalLink } from 'lucide-react';

export default function BlogListPage() {
  const { language, t } = useLanguage();
  const [blogs, setBlogs] = useState(db.getBlogs());
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [activeTab, setActiveTab] = useState<'articles' | 'videos'>('articles');
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);

  useEffect(() => {
    const loadLiveData = () => {
      setBlogs(db.getBlogs() || []);
      setVideos((db.getVideos() || []).filter(v => v && v.status === 'PUBLISHED'));
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
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {/* Editorial Header */}
        <div className="text-left pb-6 mb-6 space-y-2 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-800 text-[10px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#800020]"></span>
            {language === 'EN' ? 'FBS BAKING EDUCATION & VIDEOS' : language === 'MS' ? 'PENDIDIKAN & VIDEO FBS BAKERY' : 'EDUKASI & VIDEO FBS BAKERY'}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            {langTexts.title}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium max-w-2xl">
            {langTexts.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 mb-8 gap-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('articles')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer uppercase tracking-wider ${
              activeTab === 'articles' ? 'border-[#800020] text-[#800020]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{langTexts.tabArticles} ({blogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer uppercase tracking-wider ${
              activeTab === 'videos' ? 'border-[#800020] text-[#800020]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{langTexts.tabVideos} ({videos.length})</span>
          </button>
        </div>

        {/* ARTICLES CONTENT TAB */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {blogs.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-stone-200 shadow-xs">
                <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 text-xs font-medium">{langTexts.noArticles}</p>
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between group">
                  <div className="relative aspect-16/9 overflow-hidden bg-stone-100 border-b border-stone-200">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium mb-2">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#800020]" /> {blog.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#800020]" /> {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                      </div>
                      <h2 className="font-serif font-bold text-xl text-stone-900 group-hover:text-[#800020] transition-colors mb-2 line-clamp-2 leading-snug">
                        {blog.title}
                      </h2>
                      <p className="text-stone-600 text-xs leading-relaxed line-clamp-3 font-medium">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] hover:underline uppercase tracking-wider cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {videos.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-stone-200 shadow-xs">
                <Film className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 text-xs font-medium">{langTexts.noVideos}</p>
              </div>
            ) : (
              videos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between group">
                  
                  {/* Thumbnail / Video play trigger */}
                  <div 
                    onClick={() => setSelectedVideo(video)}
                    className="relative aspect-video overflow-hidden cursor-pointer bg-stone-900 group-hover:opacity-95 transition-opacity border-b border-stone-200"
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#800020] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/75 text-[#FFF8F0] text-[9px] font-bold rounded uppercase tracking-wider">
                      {video.platform}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3 font-medium">
                    <div>
                      <span className="text-[10px] font-bold text-[#800020] uppercase tracking-wider block mb-1">
                        {video.category}
                      </span>
                      <h3 className="font-serif font-bold text-base text-stone-900 line-clamp-2 group-hover:text-[#800020] transition-colors leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mt-1">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 uppercase tracking-wider cursor-pointer transition-all"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> {langTexts.watchNow}
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          {(() => {
            const parsed = getEmbedVideoUrl(selectedVideo.embedUrl, selectedVideo.platform);
            const isVertical = parsed.aspectRatio === '9/16';
            return (
              <div className={`bg-white rounded-2xl w-full p-6 shadow-xl border border-stone-200 relative flex flex-col gap-4 my-auto text-stone-900 ${
                isVertical ? 'max-w-md' : 'max-w-4xl'
              }`}>
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedVideo(null)} 
                  className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer transition-colors z-50"
                  title="Tutup Video"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header Badge & Title */}
                <div className="pr-8 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-800 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#800020]" />
                    {selectedVideo.category} • {selectedVideo.platform}
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug tracking-tight break-words">
                    {selectedVideo.title}
                  </h2>
                </div>

                {/* Video Frame Container */}
                <div className={`relative w-full mx-auto rounded-xl overflow-hidden bg-black border border-stone-200 shadow-xs flex items-center justify-center ${
                  isVertical ? 'max-w-[320px] aspect-[9/16] h-[480px]' : 'aspect-video'
                }`}>
                  {parsed.isDirectVideo ? (
                    <video 
                      src={parsed.embedUrl} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <iframe
                      src={parsed.embedUrl}
                      title={selectedVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>

                {/* Direct Link Banner */}
                {(selectedVideo.embedUrl || '').startsWith('http') && !parsed.isDirectVideo && (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium">
                    <span>{language === 'EN' ? `Video cannot play? Watch directly on ${selectedVideo.platform}:` : language === 'MS' ? `Video tidak boleh dimainkan? Tonton secara langsung di ${selectedVideo.platform}:` : `Video tidak bisa diputar? Tonton langsung di ${selectedVideo.platform}:`}</span>
                    <a
                      href={selectedVideo.embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#800020] text-[#FFF8F0] font-bold text-[11px] rounded-lg hover:bg-[#6F1D1B] transition-all flex items-center gap-1 shrink-0 uppercase tracking-wider"
                    >
                      Buka Video <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Description Card */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed max-h-32 overflow-y-auto space-y-1 font-medium">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{language === 'EN' ? 'Description' : language === 'MS' ? 'Penerangan' : 'Deskripsi'}</span>
                  <p className="whitespace-pre-line text-stone-800">{selectedVideo.description}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
