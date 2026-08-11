'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { VideoPost, Product } from '@/types';
import { getEmbedVideoUrl } from '@/lib/video-utils';
import { formatWhatsAppNumber } from '@/lib/whatsapp';
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
  const cleanWaNumber = formatWhatsAppNumber(settings?.whatsappNumber || '60123456789');

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1">
        
        {/* ULTRA-MODERN FULL-BLEED IMAGE-FIRST BANNER CAROUSEL SLIDER */}
        <section className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-[#180A0E] group shadow-2xl">
          
          {/* SLIDE BANNER IMAGES (FULL GRAPHIC PRESENTATION) */}
          {banners.map((banner, index) => {
            const isCurrent = index === currentSlideIndex;
            return (
              <div
                key={banner.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                {/* Clickable Image Slide Direct To Target Product */}
                <Link href={banner.buttonLink || '/products'} className="block w-full h-full relative cursor-pointer group/slide" title={`Klik untuk melihat ${banner.title || 'produk promo'}`}>
                  {banner.videoUrl ? (
                    <video 
                      src={banner.videoUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-contain sm:object-cover bg-[#180A0E] group-hover/slide:scale-102 transition-transform duration-700"
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
                      className="w-full h-full object-contain sm:object-cover bg-[#180A0E] group-hover/slide:scale-102 transition-transform duration-700"
                    />
                  )}
                </Link>
              </div>
            );
          })}

          {/* PREVIOUS / NEXT ARROW BUTTONS */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3.5 rounded-full bg-black/50 hover:bg-[#800020] text-white/90 border border-white/20 backdrop-blur-md transition-all shadow-2xl hover:scale-110"
                title="Previous Slide"
                aria-label="Previous Banner Slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3.5 rounded-full bg-black/50 hover:bg-[#800020] text-white/90 border border-white/20 backdrop-blur-md transition-all shadow-2xl hover:scale-110"
                title="Next Slide"
                aria-label="Next Banner Slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* PAGINATION DOTS INDICATORS */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/50 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`transition-all rounded-full ${
                    idx === currentSlideIndex
                      ? 'w-6 h-2 bg-[#D4AF37] shadow-glow'
                      : 'w-2 h-2 bg-white/40 hover:bg-white'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </section>

        {/* MINIMALIST & MODERN 3-COLUMN TRUST BADGES SECTION */}
        <section className="bg-gradient-to-b from-[#FFF8F0] via-white to-[#FFF8F0] border-y border-[#EADBC8]/80 py-8 sm:py-10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Badge 1: 100% Halal Certified */}
              <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-[#EADBC8] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#800020] transition-all duration-300 group flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-md flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-sm text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                    {t.trustBadges.b1Title}
                  </h4>
                  <p className="text-stone-500 text-xs mt-0.5 leading-relaxed font-medium">
                    {t.trustBadges.b1Desc}
                  </p>
                </div>
              </div>

              {/* Badge 2: Premium Import Grade */}
              <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-[#EADBC8] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#800020] transition-all duration-300 group flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-md flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:scale-105 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-sm text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                    {t.trustBadges.b2Title}
                  </h4>
                  <p className="text-stone-500 text-xs mt-0.5 leading-relaxed font-medium">
                    {t.trustBadges.b2Desc}
                  </p>
                </div>
              </div>

              {/* Badge 3: Express Fast Shipping */}
              <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-[#EADBC8] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#800020] transition-all duration-300 group flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-md flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-sm text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                    {t.trustBadges.b3Title}
                  </h4>
                  <p className="text-stone-500 text-xs mt-0.5 leading-relaxed font-medium">
                    {t.trustBadges.b3Desc}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CATEGORY SHOWCASE SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
              {language === 'EN' ? 'Curated Collections' : language === 'MS' ? 'Koleksi Terpilih' : 'Koleksi Pilihan'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B1B]">
              {t.sections.featuredTitle}
            </h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6" suppressHydrationWarning>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group bg-white rounded-2xl p-4 border border-[#EADBC8] shadow-sm hover:shadow-xl hover:border-[#800020] transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-[#D4AF37]/40 group-hover:scale-110 transition-transform">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#2B1B1B] group-hover:text-[#800020] transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* DYNAMIC FEATURED PRODUCTS SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-stone-100/50 rounded-3xl border border-[#EADBC8] mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
                {t.sections.featuredSubtitle}
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#2B1B1B]">
                {t.sections.featuredTitle}
              </h2>
            </div>
            <Link 
              href="/products" 
              className="px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
            >
              {language === 'EN' ? 'View Full Catalog' : language === 'MS' ? 'Lihat Semua Katalog' : 'Lihat Semua Katalog'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* BESTSELLERS BANNER SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#D4AF37] font-serif font-bold text-sm block mb-1 uppercase tracking-widest">
              {language === 'EN' ? 'Top Rated Selection' : language === 'MS' ? 'Pilihan Teratas' : 'Pilihan Terbaik'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B1B]">
              {t.sections.bestsellerTitle}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-2">
              {t.sections.bestsellerSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* WHOLESALE PROMO BANNERS GRID (4 PROMO BANNERS) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
              {language === 'EN' ? 'COMMERCIAL BULK DEALS' : language === 'MS' ? 'PAKEJ PUKAL KOMERSIAL' : 'PAKET GROSIR KOMERSIAL'}
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#2B1B1B]">
              {homeCms.promoTitle || (language === 'EN' ? 'Baker Wholesale Supply & Bulk Discounts' : language === 'MS' ? 'Bekalan Pukal & Diskaun Komersial Baker' : 'Pasokan Grosir & Diskon Komersial Baker')}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              {homeCms.promoSubtitle || (language === 'EN' ? 'Get special discounted pricing for 5kg & 25kg sacks.' : language === 'MS' ? 'Dapatkan tawaran harga khas untuk pembelian guni 5kg & 25kg.' : 'Dapatkan penawaran harga spesial untuk pembelian karung 5kg & 25kg.')}
            </p>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded-full" />
          </div>

          {(() => {
            const list = homeCms?.wholesaleBanners && homeCms.wholesaleBanners.length > 0 ? homeCms.wholesaleBanners : [
              {
                id: 'wpromo-1',
                title: homeCms.promoTitle || (language === 'EN' ? 'Baker Wholesale Supply & Bulk Discounts' : language === 'MS' ? 'Bekalan Pukal & Diskaun Komersial Baker' : 'Pasokan Grosir & Diskon Komersial Baker'),
                subtitle: homeCms.promoSubtitle || (language === 'EN' ? 'Get special discounted pricing for 5kg & 25kg sacks.' : language === 'MS' ? 'Dapatkan tawaran harga khas untuk pembelian guni 5kg & 25kg.' : 'Dapatkan penawaran harga spesial untuk pembelian karung 5kg & 25kg.'),
                imageUrl: homeCms.promoImage || 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
                buttonText: language === 'EN' ? 'REQUEST WHOLESALE CATALOG' : language === 'MS' ? 'MINTA KATALOG PUKAL WA' : 'MINTA KATALOG GROSIR WA',
                buttonLink: `https://wa.me/${cleanWaNumber}?text=Halo%20FBS%20Bakery,%20saya%20ingin%20minta%20katalog%20grosir`,
              }
            ];
            const colClass = list.length === 1 
              ? 'grid-cols-1 max-w-xl mx-auto' 
              : list.length === 2 
              ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto' 
              : list.length === 3 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

            return (
              <div className={`grid ${colClass} gap-6`}>
                {list.map((promo: any) => (
                  <div 
                    key={promo.id} 
                    className="group bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#2B1B1B] rounded-3xl overflow-hidden shadow-xl border border-[#D4AF37]/30 flex flex-col text-white hover:scale-102 transition-all duration-300"
                  >
                    <div className="relative aspect-16/10 overflow-hidden border-b border-[#D4AF37]/30">
                      <img 
                        src={promo.imageUrl || 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop'} 
                        alt={promo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#D4AF37] text-[#800020] text-[9px] font-black rounded-lg uppercase tracking-wider shadow">
                        {language === 'EN' ? 'BULK PROMO' : language === 'MS' ? 'PROMO PUKAL' : 'PROMO GROSIR'}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#F7E7CE] line-clamp-2 leading-tight">
                          {promo.title}
                        </h3>
                        <p className="text-stone-300 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                          {promo.subtitle}
                        </p>
                      </div>

                      <a
                        href={promo.buttonLink || `https://wa.me/${cleanWaNumber}`}
                        target={promo.buttonLink?.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37] hover:brightness-110 text-[#4A0010] font-serif font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide group/btn text-center"
                      >
                        <span>{promo.buttonText || (language === 'EN' ? 'VIEW PROMO' : 'LIHAT PROMO')}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* LATEST ARTICLES SECTION */}
        {latestArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
                  {language === 'EN' ? 'BAKING GUIDES' : 'KUMPULAN ARTIKEL'}
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#2B1B1B]">
                  {language === 'EN' ? 'Latest Educational Articles' : language === 'MS' ? 'Artikel Edukasi Terkini' : 'Artikel Edukasi Terbaru'}
                </h2>
              </div>
              <Link 
                href="/blog?tab=articles" 
                className="px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
              >
                {language === 'EN' ? 'View All Articles' : language === 'MS' ? 'Lihat Semua Artikel' : 'Lihat Semua Artikel'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div className="relative aspect-16/10 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 mb-1">
                        <span className="flex items-center gap-1"><User className="w-3 h-3 text-[#800020]" /> {article.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#800020]" /> {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '-'}</span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2B1B1B] group-hover:text-[#800020] transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] hover:underline"
                      >
                        {language === 'EN' ? 'Read Full Article' : language === 'MS' ? 'Baca Artikel Penuh' : 'Baca Selengkapnya'} <ArrowRight className="w-3.5 h-3.5" />
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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
                  {language === 'EN' ? 'VIDEO SHOWCASE' : 'TUTORIAL VIDEO'}
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#2B1B1B]">
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
                className="px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
              >
                {language === 'EN' ? 'View All Videos' : language === 'MS' ? 'Lihat Semua Video' : 'Lihat Semua Video'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-3xl overflow-hidden border border-[#EADBC8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
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
                      <div className="w-12 h-12 rounded-full bg-[#800020]/90 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/50 shadow-2xl group-hover:scale-110 transition-transform animate-fade-in">
                        <Play className="w-4 h-4 fill-[#D4AF37] ml-0.5" />
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
                      <span className="text-[10px] font-extrabold text-[#800020] uppercase tracking-wider block mb-0.5">
                        {video.category}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#2B1B1B] line-clamp-2 group-hover:text-[#800020] transition-colors leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-semibold">
                      <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : '-'}</span>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="px-3 py-1 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] text-[10px] font-bold rounded-lg border border-[#D4AF37]/30 flex items-center gap-1 shadow"
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {(() => {
            const parsed = getEmbedVideoUrl(selectedVideo.embedUrl, selectedVideo.platform);
            const isVertical = parsed.aspectRatio === '9/16';
            return (
              <div className={`bg-[#120C0E]/95 rounded-3xl w-full p-5 sm:p-7 shadow-2xl border border-[#D4AF37]/35 animate-scale-up relative flex flex-col gap-4 my-auto ${
                isVertical ? 'max-w-md' : 'max-w-4xl'
              }`}>
                {/* Minimalist Close Button */}
                <button 
                  onClick={() => setSelectedVideo(null)} 
                  className="absolute top-4 right-4 p-2 bg-stone-900/90 hover:bg-[#800020] text-stone-300 hover:text-[#D4AF37] rounded-full border border-stone-800 hover:border-[#D4AF37]/50 shadow-xl transition-all z-50 group"
                  title={t.common.close}
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Header Badge & Title */}
                <div className="pr-8 space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-extrabold tracking-widest uppercase">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    {selectedVideo.category} • {selectedVideo.platform}
                  </div>
                  <h2 className="font-serif text-lg sm:text-2xl font-bold text-white leading-snug tracking-tight break-words">
                    {selectedVideo.title}
                  </h2>
                </div>

                {/* Premium Video Frame Container */}
                <div className={`relative w-full mx-auto rounded-2xl overflow-hidden bg-black border border-stone-800/80 shadow-2xl flex items-center justify-center ${
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
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#800020]/30 border border-[#D4AF37]/30 text-stone-200 text-xs">
                    <span>{language === 'EN' ? `Video cannot play? Watch directly on ${selectedVideo.platform}:` : language === 'MS' ? `Video tidak boleh dimainkan? Tonton di ${selectedVideo.platform}:` : `Video tidak bisa diputar? Tonton langsung di ${selectedVideo.platform}:`}</span>
                    <a
                      href={selectedVideo.embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#D4AF37] text-[#800020] font-bold rounded-lg hover:brightness-110 transition-all text-[11px] flex items-center gap-1 shrink-0"
                    >
                      {language === 'EN' ? 'Open Video ↗' : 'Buka Video ↗'}
                    </a>
                  </div>
                )}

                {/* Minimalist Luxury Description Card */}
                <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800/80 text-xs sm:text-sm text-stone-300 leading-relaxed max-h-32 overflow-y-auto space-y-1 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">{language === 'EN' ? 'Description' : language === 'MS' ? 'Keterangan' : 'Deskripsi'}</span>
                  <p className="whitespace-pre-line text-stone-200">{selectedVideo.description}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Recently Viewed Products Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-[#FFF8F0] to-white border-t border-[#EADBC8]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-[#800020] uppercase tracking-widest block mb-1">{language === 'EN' ? 'Personalized For You' : language === 'MS' ? 'Khas Untuk Anda' : 'Khusus Untuk Anda'}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1B1B]">{language === 'EN' ? 'Recently Viewed' : language === 'MS' ? 'Baru Dilihat' : 'Terakhir Dilihat'}</h2>
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
