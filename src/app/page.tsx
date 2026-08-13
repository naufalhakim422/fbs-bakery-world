'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { VideoPost, Product } from '@/types';
import { getEmbedVideoUrl } from '@/lib/video-utils';
import { formatWhatsAppNumber, cleanPhoneNumber } from '@/lib/whatsapp';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ProductCard } from '@/components/customer/product-card';
import { 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Truck, 
  MessageCircle, 
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Clock,
  PlayCircle,
  Play,
  X
} from 'lucide-react';

export default function HomePage() {
  const [settings, setSettings] = useState<any>({ whatsappNumber: '60123456789' });
  const [homeCms, setHomeCms] = useState<any>({});
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [latestVideos, setLatestVideos] = useState<VideoPost[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const { language, t } = useLanguage();

  const loadData = useCallback(() => {
    setSettings(db.getStoreSettings());

    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const s = data.settings || data;
        if (s && s.whatsappNumber) {
          setSettings(s);
          db.updateStoreSettings(s);
        }
      })
      .catch(sErr => console.warn('[Homepage Settings Fetch Warning]', sErr));

    const cHome = db.getHomePageSettings();
    setHomeCms(cHome);
    const activeBanners = db.getBanners().filter(b => b.status);
    setBanners(activeBanners);

    fetch(`/api/banners?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.banners)) {
          const active = data.banners.filter((b: any) => b.status);
          setBanners(active);
          db.saveAllBanners(active);
        }
      })
      .catch(bErr => console.warn('[Homepage Banners Fetch Warning]', bErr));
    setCategories(db.getCategories());

    const loadProducts = async () => {
      let allProds: Product[] = [];
      try {
        const res = await fetch(`/api/products?status=active&t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          allProds = data.products;
        }
      } catch (err) {
        console.warn('[Homepage Products Fetch Warning]', err);
      }

      if (allProds.length === 0) {
        allProds = db.getProducts();
      }

      const feat = allProds.filter(p => p.isFeatured);
      const best = allProds.filter(p => p.isBestSeller);

      setFeaturedProducts(feat.length > 0 ? feat : allProds.slice(0, 4));
      setBestSellers(best.length > 0 ? best : allProds.slice(0, 4));
    };

    loadProducts();
    
    // Load Latest Articles (type ARTICLE, max 6) and Latest Videos (status PUBLISHED, max 6)
    const allBlogs = db.getBlogs();
    setLatestArticles(allBlogs.filter(b => b.type === 'ARTICLE').slice(0, 6));
    setLatestVideos(db.getVideos().filter(v => v.status === 'PUBLISHED').slice(0, 6));

    // Load Recently Viewed Products
    try {
      const saved = localStorage.getItem('fbs_recently_viewed');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        if (Array.isArray(ids) && ids.length > 0) {
          const allProds = db.getProducts();
          const list = ids.map(id => allProds.find(p => p.id === id)).filter(Boolean) as Product[];
          setRecentlyViewed(list);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadData();

    let timer: NodeJS.Timeout;
    const handleUpdate = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        loadData();
      }, 50);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fbs_db_updated', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fbs_db_updated', handleUpdate);
    };
  }, [loadData]);

  // AUTO PLAY SLIDER CAROUSEL TIMER (DEFAULT 1 MINUTE / 60,000 MS)
  useEffect(() => {
    if (banners.length <= 1) return;
    const slideDuration = homeCms?.bannerSpeed ? Number(homeCms.bannerSpeed) : 60000;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % banners.length);
    }, slideDuration);
    return () => clearInterval(interval);
  }, [banners, homeCms?.bannerSpeed]);

  const nextSlide = () => {
    if (!banners || banners.length === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    if (!banners || banners.length === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBanner = banners[currentSlideIndex] || banners[0] || {};
  const cleanWaNumber = cleanPhoneNumber(settings?.whatsappNumber || '60123456789');

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1">
        
        {/* HERO BANNER CAROUSEL SLIDER */}
        <section className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] min-h-[340px] sm:min-h-[440px] lg:min-h-[520px] overflow-hidden bg-stone-950 group">
          
          {/* SLIDE BANNER IMAGES */}
          {banners.map((banner, index) => {
            const isCurrent = index === currentSlideIndex;
            return (
              <div
                key={banner.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                <Link 
                  href={banner.buttonLink || '/products'} 
                  className="block w-full h-full relative cursor-pointer" 
                  title={`View ${banner.title || 'baking promotion'}`}
                >
                  {banner.videoUrl ? (
                    <video 
                      src={banner.videoUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover bg-stone-950"
                    />
                  ) : (
                    <img 
                      src={banner.imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920&auto=format&fit=crop'} 
                      alt={banner.title || 'FBS Bakery Banner'} 
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      sizes="100vw"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover bg-stone-950"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                </Link>
              </div>
            );
          })}

          {/* PREVIOUS / NEXT SLIDE CONTROLS */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-2xl bg-black/60 hover:bg-[#800020] text-white border border-white/20 transition-all shadow-lg cursor-pointer"
                title="Previous Slide"
                aria-label="Previous Banner Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-2xl bg-black/60 hover:bg-[#800020] text-white border border-white/20 transition-all shadow-lg cursor-pointer"
                title="Next Slide"
                aria-label="Next Banner Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* PAGINATION DOTS */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-full border border-white/20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'w-6 h-2 bg-[#F7E7CE]'
                      : 'w-2 h-2 bg-white/40 hover:bg-white'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </section>

        {/* TRUST & USP STRIP SECTION */}
        <section className="bg-white border-y border-[#EADBC8]/70 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-stone-800">
              
              <div className="flex items-center gap-3.5 sm:justify-center">
                <div className="w-10 h-10 rounded-xl bg-[#800020]/10 border border-[#800020]/20 text-[#800020] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2B1B1B]">
                    {t.trustBadges.b1Title}
                  </h4>
                  <p className="text-stone-500 text-xs font-medium">
                    {t.trustBadges.b1Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 sm:justify-center">
                <div className="w-10 h-10 rounded-xl bg-[#800020]/10 border border-[#800020]/20 text-[#800020] flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2B1B1B]">
                    {t.trustBadges.b2Title}
                  </h4>
                  <p className="text-stone-500 text-xs font-medium">
                    {t.trustBadges.b2Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 sm:justify-center">
                <div className="w-10 h-10 rounded-xl bg-[#800020]/10 border border-[#800020]/20 text-[#800020] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2B1B1B]">
                    {t.trustBadges.b3Title}
                  </h4>
                  <p className="text-stone-500 text-xs font-medium">
                    {t.trustBadges.b3Desc}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CATEGORY SHOWCASE SECTION */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-[#EADBC8]">
            <div>
              <span className="text-xs font-black text-[#800020] uppercase tracking-widest block mb-1">
                {language === 'EN' ? 'Category Discovery' : language === 'MS' ? 'Kategori Utama' : 'Kategori Utama'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#2B1B1B]">
                {t.sections.featuredTitle}
              </h2>
            </div>
            <Link 
              href="/categories" 
              className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
            >
              <span>{language === 'EN' ? 'All Categories' : 'Semua Kategori'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5" suppressHydrationWarning>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:border-[#800020] transition-all flex flex-col items-center text-center p-4 cursor-pointer"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-stone-100 border border-stone-100">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <h3 className="font-serif font-bold text-xs sm:text-sm text-[#2B1B1B] group-hover:text-[#800020] transition-colors leading-tight">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED PRODUCTS SECTION */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-[#EADBC8] pb-4">
            <div>
              <span className="text-xs font-black text-[#800020] uppercase tracking-widest block mb-1">
                {t.sections.featuredSubtitle}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#2B1B1B]">
                {t.sections.featuredTitle}
              </h2>
            </div>
            
            <Link 
              href="/products" 
              className="px-5 py-2.5 bg-[#800020] hover:bg-[#600018] text-[#F7E7CE] font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              <span>{language === 'EN' ? 'View Catalog' : language === 'MS' ? 'Lihat Katalog' : 'Lihat Katalog'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* BESTSELLERS SECTION */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-[#EADBC8] pb-4">
            <div>
              <span className="text-xs font-black text-[#800020] uppercase tracking-widest block mb-1">
                {language === 'EN' ? 'Top Rated Selection' : language === 'MS' ? 'Pilihan Teratas' : 'Pilihan Terbaik'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#2B1B1B]">
                {t.sections.bestsellerTitle}
              </h2>
            </div>

            <Link 
              href="/products?filter=bestseller" 
              className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
            >
              <span>{language === 'EN' ? 'View All Bestsellers' : 'Lihat Semua Bestseller'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* EDITORIAL CAMPAIGN SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
          <div className="rounded-3xl bg-[#800020] text-[#FFF8F0] p-8 sm:p-12 border border-[#800020] shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest block">
                {language === 'EN' ? 'Bakery Supply Partner' : 'Rakan Bekalan Bakeri'}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-black text-[#F7E7CE] leading-tight">
                {language === 'EN' ? 'Ingredients for Better Baking' : language === 'MS' ? 'Ramuan Bakeri Berkualiti Tinggi' : 'Bahan Kue berkualitas Tinggi'}
              </h2>
              <p className="text-stone-200 text-xs sm:text-sm leading-relaxed font-medium">
                {language === 'EN' ? 'Explore curated baking recipes, premium imported cocoa, specialty flour, and expert guidance tailored for passion and perfection.' : language === 'MS' ? 'Terokai koleksi panduan resipi bakeri, coklat import gred tinggi, tepung khusus, dan khidmat perundingan ramuan berkualiti.' : 'Jelajahi koleksi panduan resep bakery, cokelat impor grade tinggi, tepung khusus, dan layanan konsultasi bahan berkualitas.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <Link 
                href="/recipes"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#F7E7CE] hover:bg-white text-[#800020] font-black text-xs sm:text-sm rounded-2xl shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 cursor-pointer"
              >
                <span>{language === 'EN' ? 'EXPLORE RECIPES' : language === 'MS' ? 'TEROKAI RESIPI' : 'JELAJAHI RESEP'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://wa.me/${cleanWaNumber}?text=Halo%20FBS%20Bakery,%20saya%20ingin%20konsultasi%20bahan%20kue`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-black/30 hover:bg-black/40 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                <span>{language === 'EN' ? 'CONSULT WA' : language === 'MS' ? 'KONSULTASI WA' : 'KONSULTASI WA'}</span>
              </a>
            </div>

          </div>
        </section>

        {/* LATEST ARTICLES SECTION */}
        {latestArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-[#EADBC8] pb-4">
              <div>
                <span className="text-xs font-black text-[#800020] uppercase tracking-widest block mb-1">
                  {language === 'EN' ? 'BAKING GUIDES' : 'KUMPULAN ARTIKEL'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#2B1B1B]">
                  {language === 'EN' ? 'Educational Articles' : language === 'MS' ? 'Artikel Edukasi Terkini' : 'Artikel Edukasi Terbaru'}
                </h2>
              </div>

              <Link 
                href="/blog?tab=articles" 
                className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
              >
                <span>{language === 'EN' ? 'View All Articles' : language === 'MS' ? 'Lihat Semua Artikel' : 'Lihat Semua Artikel'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:border-[#800020] transition-all flex flex-col justify-between group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#800020]" /> {article.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#800020]" /> {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '-'}</span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#2B1B1B] group-hover:text-[#800020] transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline"
                      >
                        <span>{language === 'EN' ? 'Read Article' : language === 'MS' ? 'Baca Artikel' : 'Baca Selengkapnya'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LATEST VIDEOS SECTION */}
        {latestVideos.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-[#EADBC8] pb-4">
              <div>
                <span className="text-xs font-black text-[#800020] uppercase tracking-widest block mb-1">
                  {language === 'EN' ? 'VIDEO SHOWCASE' : 'TUTORIAL VIDEO'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#2B1B1B]">
                  {language === 'EN' ? 'Video Tutorials' : language === 'MS' ? 'Video & Tutorial' : 'Video & Tutorial'}
                </h2>
              </div>

              <Link 
                href="/blog" 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('fbs_blog_active_tab', 'videos');
                  }
                }}
                className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
              >
                <span>{language === 'EN' ? 'View All Videos' : language === 'MS' ? 'Lihat Semua Video' : 'Lihat Semua Video'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:border-[#800020] transition-all flex flex-col justify-between group">
                  <div 
                    onClick={() => setSelectedVideo(video)}
                    className="relative aspect-video overflow-hidden cursor-pointer bg-black group-hover:opacity-95 transition-opacity"
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#800020] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded-md font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D4AF37]" /> {video.duration}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#800020] uppercase tracking-wider block">
                        {video.category} • {video.platform}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#2B1B1B] line-clamp-2 group-hover:text-[#800020] transition-colors leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 font-medium">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-medium">
                      <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : '-'}</span>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="px-3 py-1 bg-[#800020] hover:bg-[#600018] text-[#F7E7CE] text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> {language === 'EN' ? 'Watch' : 'Tonton'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* POPUP/MODAL VIDEO PLAYER */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {(() => {
            const parsed = getEmbedVideoUrl(selectedVideo.embedUrl, selectedVideo.platform);
            const isVertical = parsed.aspectRatio === '9/16';
            return (
              <div className={`bg-stone-900 rounded-3xl w-full p-6 shadow-2xl border border-stone-800 relative flex flex-col gap-4 my-auto text-white ${
                isVertical ? 'max-w-md' : 'max-w-3xl'
              }`}>
                <button 
                  onClick={() => setSelectedVideo(null)} 
                  className="absolute top-4 right-4 p-2 bg-stone-800 hover:bg-[#800020] text-stone-300 hover:text-white rounded-full transition-all z-50 cursor-pointer"
                  title={t.common.close}
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="pr-8 space-y-1">
                  <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider block">
                    {selectedVideo.category} • {selectedVideo.platform}
                  </span>
                  <h2 className="font-serif text-base sm:text-xl font-bold text-white leading-snug">
                    {selectedVideo.title}
                  </h2>
                </div>

                <div className={`relative w-full mx-auto rounded-2xl overflow-hidden bg-black border border-stone-800 shadow-xl flex items-center justify-center ${
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

                <div className="bg-stone-800/80 p-3.5 rounded-xl text-xs text-stone-300 leading-relaxed max-h-28 overflow-y-auto">
                  <p className="whitespace-pre-line text-stone-200">{selectedVideo.description}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* RECENTLY VIEWED PRODUCTS SECTION */}
      {recentlyViewed.length > 0 && (
        <section className="py-12 bg-white border-t border-[#EADBC8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1B1B]">
                {language === 'EN' ? 'Recently Viewed' : language === 'MS' ? 'Baru Dilihat' : 'Terakhir Dilihat'}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewed.map((prod) => (
                <ProductCard key={`hp-rv-${prod.id}`} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
