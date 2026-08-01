'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { VideoPost } from '@/types';
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
  const { language, t } = useLanguage();

  const loadData = () => {
    setSettings(db.getStoreSettings());
    const cHome = db.getHomePageSettings();
    setHomeCms(cHome);
    const activeBanners = db.getBanners().filter(b => b.status);
    setBanners(activeBanners.length > 0 ? activeBanners : [
      {
        id: 'ban-1',
        title: 'Semolina & Italian Flour Special Promo',
        subtitle: 'Best Semolina Flour & Specialty Baking Powder for Soft Fluffy Pastries.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
        buttonText: 'SHOP NOW',
        buttonLink: '/products/semolina-flour-premium-grade',
        status: true,
      }
    ]);
    setCategories(db.getCategories());
    setRecipes(db.getRecipes());
    setFeaturedProducts(db.getProducts({ featured: true }));
    setBestSellers(db.getProducts({ bestSeller: true }));
    
    // Load Latest Articles (type ARTICLE, max 6) and Latest Videos (status PUBLISHED, max 6)
    const allBlogs = db.getBlogs();
    setLatestArticles(allBlogs.filter(b => b.type === 'ARTICLE').slice(0, 6));
    setLatestVideos(db.getVideos().filter(v => v.status === 'PUBLISHED').slice(0, 6));
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fbs_db_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fbs_db_updated', handleUpdate);
    };
  }, []);

  // AUTO PLAY SLIDER CAROUSEL TIMER (DEFAULT 1 MINUTE / 60,000 MS)
  useEffect(() => {
    if (banners.length <= 1) return;
    const slideDuration = homeCms.bannerSpeed ? Number(homeCms.bannerSpeed) : 60000; // 1 min default
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % banners.length);
    }, slideDuration);
    return () => clearInterval(interval);
  }, [banners, homeCms.bannerSpeed]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBanner = banners[currentSlideIndex] || banners[0] || {};
  const cleanWaNumber = formatWhatsAppNumber(settings.whatsappNumber);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1">
        
        {/* ULTRA-MODERN FULL-BLEED IMAGE-FIRST BANNER CAROUSEL SLIDER */}
        <section className="relative w-full aspect-21/9 sm:aspect-21/9 min-h-[380px] sm:min-h-[520px] lg:min-h-[620px] overflow-hidden bg-[#180A0E] group shadow-2xl">
          
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
                      className="w-full h-full object-cover group-hover/slide:scale-102 transition-transform duration-700"
                    />
                  ) : (
                    <img 
                      src={banner.imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920&auto=format&fit=crop'} 
                      alt={banner.title || 'FBS Banner Promo'} 
                      className="w-full h-full object-cover group-hover/slide:scale-102 transition-transform duration-700"
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-[#800020] text-white/90 border border-white/20 backdrop-blur-md transition-all shadow-2xl hover:scale-110"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-[#800020] text-white/90 border border-white/20 backdrop-blur-md transition-all shadow-2xl hover:scale-110"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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

        {/* ULTRA-MODERN & LUXURY TRUST BADGES SECTION */}
        <section className="bg-gradient-to-b from-[#FFF8F0] via-white to-[#FFF8F0] border-y border-[#EADBC8]/80 py-10 sm:py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Badge 1: 100% Halal Certified */}
              <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-[#EADBC8] shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#800020] transition-all duration-300 group flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-lg flex items-center justify-center mb-4 border border-[#D4AF37]/30 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="font-serif font-extrabold text-base text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                  {t.trustBadges.b1Title}
                </h4>
                <p className="text-stone-500 text-xs mt-1.5 leading-relaxed font-medium">
                  {t.trustBadges.b1Desc}
                </p>
              </div>

              {/* Badge 2: Premium Import Grade */}
              <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-[#EADBC8] shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#800020] transition-all duration-300 group flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-lg flex items-center justify-center mb-4 border border-[#D4AF37]/30 group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7" />
                </div>
                <h4 className="font-serif font-extrabold text-base text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                  {t.trustBadges.b2Title}
                </h4>
                <p className="text-stone-500 text-xs mt-1.5 leading-relaxed font-medium">
                  {t.trustBadges.b2Desc}
                </p>
              </div>

              {/* Badge 3: Express Fast Shipping */}
              <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-[#EADBC8] shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#800020] transition-all duration-300 group flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#800020] via-[#5A0015] to-[#3A0612] text-[#D4AF37] shadow-lg flex items-center justify-center mb-4 border border-[#D4AF37]/30 group-hover:scale-110 transition-transform">
                  <Truck className="w-7 h-7" />
                </div>
                <h4 className="font-serif font-extrabold text-base text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                  {t.trustBadges.b3Title}
                </h4>
                <p className="text-stone-500 text-xs mt-1.5 leading-relaxed font-medium">
                  {t.trustBadges.b3Desc}
                </p>
              </div>

              {/* Badge 4: Wholesale Baker Discount */}
              <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-[#EADBC8] shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#800020] transition-all duration-300 group flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#25D366] to-emerald-700 text-white shadow-lg flex items-center justify-center mb-4 border border-white/40 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 fill-white" />
                </div>
                <h4 className="font-serif font-extrabold text-base text-stone-900 tracking-tight group-hover:text-[#800020] transition-colors">
                  {t.trustBadges.b4Title}
                </h4>
                <p className="text-stone-500 text-xs mt-1.5 leading-relaxed font-medium">
                  {t.trustBadges.b4Desc}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CATEGORY SHOWCASE SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
              Curated Collections
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
              Lihat Semua Katalog <ArrowRight className="w-4 h-4" />
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
              Top Rated Selection
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
              COMMERCIAL BULK DEALS
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#2B1B1B]">
              {homeCms.promoTitle || 'Pasokan Grosir & Diskon Komersial Baker'}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              {homeCms.promoSubtitle || 'Dapatkan penawaran harga spesial untuk pembelian karung 5kg & 25kg.'}
            </p>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded-full" />
          </div>

          {(() => {
            const list = homeCms.wholesaleBanners && homeCms.wholesaleBanners.length > 0 ? homeCms.wholesaleBanners : [
              {
                id: 'wpromo-1',
                title: homeCms.promoTitle || 'Diskon Komersial & Pasokan Grosir Baker',
                subtitle: homeCms.promoSubtitle || 'Dapatkan penawaran harga spesial untuk pembelian karung 5kg & 25kg.',
                imageUrl: homeCms.promoImage || 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
                buttonText: 'MINTA KATALOG GROSIR WA',
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
                        PROMO GROSIR
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
                        <span>{promo.buttonText || 'LIHAT PROMO'}</span>
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
                  {language === 'ID' ? 'KUMPULAN ARTIKEL' : language === 'MS' ? 'KUMPULAN ARTIKEL' : 'BAKING GUIDES'}
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#2B1B1B]">
                  {language === 'ID' ? 'Artikel Edukasi Terbaru' : language === 'MS' ? 'Artikel Edukasi Terbaru' : 'Latest Educational Articles'}
                </h2>
              </div>
              <Link 
                href="/blog?tab=articles" 
                className="px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
              >
                {language === 'ID' ? 'Lihat Semua Artikel' : language === 'MS' ? 'Lihat Semua Artikel' : 'View All Articles'} <ArrowRight className="w-4 h-4" />
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
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#800020]" /> {new Date(article.createdAt).toLocaleDateString()}</span>
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
                        {language === 'ID' ? 'Baca Selengkapnya' : language === 'MS' ? 'Baca Selengkapnya' : 'Read Full Article'} <ArrowRight className="w-3.5 h-3.5" />
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
                  {language === 'ID' ? 'TUTORIAL VIDEO' : language === 'MS' ? 'TUTORIAL VIDEO' : 'VIDEO SHOWCASE'}
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#2B1B1B]">
                  {language === 'ID' ? 'Video & Tutorial Terbaru' : language === 'MS' ? 'Video & Tutorial Terbaru' : 'Latest Videos & Tutorials'}
                </h2>
              </div>
              <Link 
                href="/blog" 
                onClick={() => {
                  // Switch tab programmatically if needed by custom query or state
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('fbs_blog_active_tab', 'videos');
                  }
                }}
                className="px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
              >
                {language === 'ID' ? 'Lihat Semua Video' : language === 'MS' ? 'Lihat Semua Video' : 'View All Videos'} <ArrowRight className="w-4 h-4" />
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
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="px-3 py-1 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] text-[10px] font-bold rounded-lg border border-[#D4AF37]/30 flex items-center gap-1 shadow"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> {language === 'ID' ? 'Tonton' : language === 'MS' ? 'Tonton' : 'Watch'}
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
                  title="Close Video"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Header Badge & Title */}
                <div className="pr-8 space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-extrabold tracking-widest uppercase">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    {selectedVideo.category} • {selectedVideo.platform}
                  </div>
                  <h2 className="font-serif text-lg sm:text-2xl font-bold text-white leading-snug tracking-tight">
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

                {/* Minimalist Luxury Description Card */}
                <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800/80 text-xs sm:text-sm text-stone-300 leading-relaxed max-h-32 overflow-y-auto space-y-1 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Description</span>
                  <p className="whitespace-pre-line text-stone-200">{selectedVideo.description}</p>
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
