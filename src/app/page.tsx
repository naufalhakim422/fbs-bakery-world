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
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Truck, 
  MessageCircle, 
  ChefHat, 
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Calendar,
  User,
  Film,
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
    const slideDuration = homeCms?.bannerSpeed ? Number(homeCms.bannerSpeed) : 60000; // 1 min default
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
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1">
        
        {/* ULTRA-PREMIUM HERO BANNER CAROUSEL SLIDER */}
        <section className="relative w-full min-h-[380px] sm:min-h-[480px] lg:min-h-[580px] aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] overflow-hidden bg-[#180A0E] group shadow-2xl">
          
          {/* SLIDE BANNER IMAGES */}
          {banners.map((banner, index) => {
            const isCurrent = index === currentSlideIndex;
            return (
              <div
                key={banner.id || index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                  isCurrent ? 'opacity-100 z-10 scale-100' : 'opacity-0 pointer-events-none z-0 scale-105'
                }`}
              >
                {/* Clickable Image Slide Direct To Target Product */}
                <Link 
                  href={banner.buttonLink || '/products'} 
                  className="block w-full h-full relative cursor-pointer group/slide" 
                  title={`Klik untuk melihat ${banner.title || 'produk promo'}`}
                >
                  {banner.videoUrl ? (
                    <video 
                      src={banner.videoUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover bg-[#180A0E] group-hover/slide:scale-103 transition-transform duration-1000 ease-out"
                    />
                  ) : (
                    <img 
                      src={banner.imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920&auto=format&fit=crop'} 
                      alt={banner.title || 'FBS Banner Promo'} 
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      sizes="100vw"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover bg-[#180A0E] group-hover/slide:scale-103 transition-transform duration-1000 ease-out"
                    />
                  )}

                  {/* Dark Vignette Overlay for Contrast & Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                </Link>
              </div>
            );
          })}

          {/* PREVIOUS / NEXT SLIDE CONTROLS */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-4 rounded-full bg-stone-950/60 hover:bg-[#800020] text-white border border-white/20 backdrop-blur-md transition-all shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
                title="Previous Slide"
                aria-label="Previous Banner Slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-4 rounded-full bg-stone-950/60 hover:bg-[#800020] text-white border border-white/20 backdrop-blur-md transition-all shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
                title="Next Slide"
                aria-label="Next Banner Slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* ELEGANT PAGINATION PROGRESS DOTS */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-stone-950/70 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'w-8 h-2 bg-gradient-to-r from-[#D4AF37] to-[#F7E7CE] shadow-[0_0_12px_rgba(212,175,55,0.8)]'
                      : 'w-2 h-2 bg-white/40 hover:bg-white'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </section>

        {/* LUXURY HERITAGE TRUST STRIP SECTION */}
        <section className="bg-gradient-to-b from-[#FFF8F0] via-white to-[#FFF8F0] border-y border-[#EADBC8]/70 py-12 sm:py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Badge 1: 100% Halal Certified */}
              <div className="bg-white p-6 rounded-3xl border border-[#EADBC8]/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#800020] transition-all duration-500 group flex items-start gap-4 text-left">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/40 group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-extrabold text-base text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                    {t.trustBadges.b1Title}
                  </h4>
                  <p className="text-stone-600 text-xs leading-relaxed font-medium">
                    {t.trustBadges.b1Desc}
                  </p>
                </div>
              </div>

              {/* Badge 2: Premium Import Grade */}
              <div className="bg-white p-6 rounded-3xl border border-[#EADBC8]/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#800020] transition-all duration-500 group flex items-start gap-4 text-left">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/40 group-hover:scale-105 transition-transform duration-300">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-extrabold text-base text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                    {t.trustBadges.b2Title}
                  </h4>
                  <p className="text-stone-600 text-xs leading-relaxed font-medium">
                    {t.trustBadges.b2Desc}
                  </p>
                </div>
              </div>

              {/* Badge 3: Express Fast Shipping */}
              <div className="bg-white p-6 rounded-3xl border border-[#EADBC8]/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#800020] transition-all duration-500 group flex items-start gap-4 text-left">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/40 group-hover:scale-105 transition-transform duration-300">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-extrabold text-base text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                    {t.trustBadges.b3Title}
                  </h4>
                  <p className="text-stone-600 text-xs leading-relaxed font-medium">
                    {t.trustBadges.b3Desc}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ARTISANAL CATEGORY SHOWCASE SECTION */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#800020]/10 border border-[#800020]/20 rounded-full text-[#800020] text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              {language === 'EN' ? 'Curated Collections' : language === 'MS' ? 'Koleksi Terpilih' : 'Koleksi Pilihan'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#2B1B1B] tracking-tight">
              {t.sections.featuredTitle}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#800020] via-[#D4AF37] to-[#800020] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6" suppressHydrationWarning>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group bg-white rounded-3xl p-5 border border-[#EADBC8]/80 shadow-sm hover:shadow-2xl hover:border-[#800020] transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-4 border-2 border-[#D4AF37]/50 p-1 group-hover:scale-108 transition-transform duration-500 shadow-md">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#2B1B1B] group-hover:text-[#800020] transition-colors leading-tight">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* DYNAMIC FEATURED PRODUCTS SECTION */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-b from-[#FFF8F0] via-white to-[#FFF8F0] p-6 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-sm">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 border-b border-[#EADBC8]/60 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-black text-[#800020] uppercase tracking-widest block">
                  {t.sections.featuredSubtitle}
                </span>
                <h2 className="font-serif text-3xl font-black text-[#2B1B1B] tracking-tight">
                  {t.sections.featuredTitle}
                </h2>
              </div>
              
              <Link 
                href="/products" 
                className="group px-6 py-3.5 bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap active:scale-98 cursor-pointer"
              >
                <span>{language === 'EN' ? 'View Full Catalog' : language === 'MS' ? 'Lihat Semua Katalog' : 'Lihat Semua Katalog'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

          </div>
        </section>

        {/* BESTSELLERS BANNER SECTION */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full text-[#800020] text-xs font-black uppercase tracking-widest mb-3">
              <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
              {language === 'EN' ? 'Top Rated Selection' : language === 'MS' ? 'Pilihan Teratas' : 'Pilihan Terbaik'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#2B1B1B] tracking-tight">
              {t.sections.bestsellerTitle}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-2 font-medium">
              {t.sections.bestsellerSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* LUXURY BAKING ARTISTRY SHOWCASE BANNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 sm:mb-28">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1E0F14] via-[#40040F] to-[#70001B] border-2 border-[#D4AF37]/40 shadow-2xl p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Ambient Gold Glow Background Elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#800020]/40 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 max-w-xl text-center md:text-left relative z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-black rounded-full uppercase tracking-widest shadow">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                {language === 'EN' ? 'EXCLUSIVE BAKERY SHOWCASE' : language === 'MS' ? 'SERVIS EKSKLUSIF BAKERI' : 'LAYANAN EKSKLUSIF BAKERY'}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-black text-[#F7E7CE] tracking-tight leading-tight">
                {language === 'EN' ? 'Mastering Bakery Artistry with Premium Supplies' : language === 'MS' ? 'Seni Bakeri Profesional Dengan Ramuan Gred Tinggi' : 'Seni Bakery Profesional Dengan Bahan Grade Tinggi'}
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-medium">
                {language === 'EN' ? 'Explore curated baking recipes, premium imported cocoa, specialty flour, and expert guidance tailored for passion and perfection.' : language === 'MS' ? 'Terokai koleksi panduan resipi bakeri, coklat import gred tinggi, tepung khusus, dan khidmat perundingan ramuan berkualiti.' : 'Jelajahi koleksi panduan resep bakery, cokelat impor grade tinggi, tepung khusus, dan layanan konsultasi bahan berkualitas.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto flex-shrink-0 relative z-10">
              <Link 
                href="/recipes"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37] hover:brightness-110 text-[#4A0010] font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 cursor-pointer"
              >
                <span>{language === 'EN' ? 'EXPLORE RECIPES' : language === 'MS' ? 'TEROKAI RESIPI' : 'JELAJAHI RESEP'}</span>
                <ArrowRight className="w-4 h-4 text-[#4A0010]" />
              </Link>
              <a
                href={`https://wa.me/${cleanWaNumber}?text=Halo%20FBS%20Bakery,%20saya%20ingin%20konsultasi%20bahan%20kue`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                <span>{language === 'EN' ? 'CONSULT WHATSAPP' : language === 'MS' ? 'KONSULTASI WA' : 'KONSULTASI WA'}</span>
              </a>
            </div>

          </div>
        </section>

        {/* LATEST ARTICLES SECTION */}
        {latestArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6 border-b border-[#EADBC8]/60 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-black text-[#800020] uppercase tracking-widest block">
                  {language === 'EN' ? 'BAKING GUIDES' : 'KUMPULAN ARTIKEL'}
                </span>
                <h2 className="font-serif text-3xl font-black text-[#2B1B1B] tracking-tight">
                  {language === 'EN' ? 'Latest Educational Articles' : language === 'MS' ? 'Artikel Edukasi Terkini' : 'Artikel Edukasi Terbaru'}
                </h2>
              </div>

              <Link 
                href="/blog?tab=articles" 
                className="group px-6 py-3.5 bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap active:scale-98 cursor-pointer"
              >
                <span>{language === 'EN' ? 'View All Articles' : language === 'MS' ? 'Lihat Semua Artikel' : 'Lihat Semua Artikel'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8]/80 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[11px] text-stone-400 font-medium">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#800020]" /> {article.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#800020]" /> {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '-'}</span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2B1B1B] group-hover:text-[#800020] transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-[#800020] hover:underline"
                      >
                        <span>{language === 'EN' ? 'Read Full Article' : language === 'MS' ? 'Baca Artikel Penuh' : 'Baca Selengkapnya'}</span>
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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6 border-b border-[#EADBC8]/60 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-black text-[#800020] uppercase tracking-widest block">
                  {language === 'EN' ? 'VIDEO SHOWCASE' : 'TUTORIAL VIDEO'}
                </span>
                <h2 className="font-serif text-3xl font-black text-[#2B1B1B] tracking-tight">
                  {language === 'EN' ? 'Latest Videos & Tutorials' : language === 'MS' ? 'Video & Tutorial Terkini' : 'Video & Tutorial Terbaru'}
                </h2>
              </div>

              <Link 
                href="/blog" 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('fbs_blog_active_tab', 'videos');
                  }
                }}
                className="group px-6 py-3.5 bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap active:scale-98 cursor-pointer"
              >
                <span>{language === 'EN' ? 'View All Videos' : language === 'MS' ? 'Lihat Semua Video' : 'Lihat Semua Video'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8]/80 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group">
                  <div 
                    onClick={() => setSelectedVideo(video)}
                    className="relative aspect-video overflow-hidden cursor-pointer bg-black group-hover:opacity-95 transition-opacity"
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#800020]/90 text-[#D4AF37] flex items-center justify-center border-2 border-[#D4AF37]/60 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 fill-[#D4AF37] ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/85 text-white text-[11px] font-mono rounded-lg font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {video.duration}
                    </span>
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-950/90 text-[#D4AF37] text-[10px] font-black rounded-lg border border-[#D4AF37]/40 uppercase tracking-wider">
                      {video.platform}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-black text-[#800020] uppercase tracking-wider block">
                        {video.category}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#2B1B1B] line-clamp-2 group-hover:text-[#800020] transition-colors leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-medium">
                      <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : '-'}</span>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#600018] text-[#D4AF37] text-xs font-bold rounded-xl border border-[#D4AF37]/40 flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" /> {language === 'EN' ? 'Watch' : 'Tonton'}
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          {(() => {
            const parsed = getEmbedVideoUrl(selectedVideo.embedUrl, selectedVideo.platform);
            const isVertical = parsed.aspectRatio === '9/16';
            return (
              <div className={`bg-[#120C0E]/95 rounded-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/40 relative flex flex-col gap-5 my-auto ${
                isVertical ? 'max-w-md' : 'max-w-4xl'
              }`}>
                {/* Minimalist Close Button */}
                <button 
                  onClick={() => setSelectedVideo(null)} 
                  className="absolute top-4 right-4 p-2.5 bg-stone-900/90 hover:bg-[#800020] text-stone-300 hover:text-[#D4AF37] rounded-full border border-stone-800 hover:border-[#D4AF37]/50 shadow-2xl transition-all z-50 group cursor-pointer"
                  title={t.common.close}
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Header Badge & Title */}
                <div className="pr-8 space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-black tracking-widest uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {selectedVideo.category} • {selectedVideo.platform}
                  </div>
                  <h2 className="font-serif text-lg sm:text-2xl font-black text-white leading-snug tracking-tight break-words">
                    {selectedVideo.title}
                  </h2>
                </div>

                {/* Premium Video Frame Container */}
                <div className={`relative w-full mx-auto rounded-2xl overflow-hidden bg-black border border-stone-800 shadow-2xl flex items-center justify-center ${
                  isVertical ? 'max-w-[340px] aspect-[9/16] h-[520px]' : 'aspect-video'
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

                {/* Direct Link Banner if Video requires permissions or external viewing */}
                {(selectedVideo.embedUrl || '').startsWith('http') && !parsed.isDirectVideo && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#800020]/30 border border-[#D4AF37]/30 text-stone-200 text-xs">
                    <span>{language === 'EN' ? `Video cannot play? Watch directly on ${selectedVideo.platform}:` : language === 'MS' ? `Video tidak boleh dimainkan? Tonton di ${selectedVideo.platform}:` : `Video tidak bisa diputar? Tonton langsung di ${selectedVideo.platform}:`}</span>
                    <a
                      href={selectedVideo.embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-[#D4AF37] text-[#800020] font-black rounded-lg hover:brightness-110 transition-all text-xs flex items-center gap-1 shrink-0"
                    >
                      {language === 'EN' ? 'Open Video ↗' : 'Buka Video ↗'}
                    </a>
                  </div>
                )}

                {/* Description Card */}
                <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800 text-xs sm:text-sm text-stone-300 leading-relaxed max-h-32 overflow-y-auto space-y-1">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">{language === 'EN' ? 'Description' : language === 'MS' ? 'Keterangan' : 'Deskripsi'}</span>
                  <p className="whitespace-pre-line text-stone-200">{selectedVideo.description}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Recently Viewed Products Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-[#FFF8F0] to-white border-t border-[#EADBC8]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <span className="text-xs font-black text-[#800020] uppercase tracking-widest block">{language === 'EN' ? 'Personalized For You' : language === 'MS' ? 'Khas Untuk Anda' : 'Khusus Untuk Anda'}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#2B1B1B]">{language === 'EN' ? 'Recently Viewed' : language === 'MS' ? 'Baru Dilihat' : 'Terakhir Dilihat'}</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
