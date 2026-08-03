'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Product, ProductVariant, ProductReview } from '@/types';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ProductCard } from '@/components/customer/product-card';
import { formatMYR, formatSoldQuantity } from '@/lib/currency';
import { useCart } from '@/lib/cart-context';
import { generateWhatsAppOrderLink } from '@/lib/whatsapp';
import { 
  ShoppingBag, 
  MessageCircle, 
  Heart, 
  ShieldCheck, 
  Check, 
  ChevronRight, 
  Truck, 
  Award, 
  Minus, 
  Plus,
  ChefHat,
  Info,
  Star,
  Video,
  Flame,
  Upload,
  X,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { t, language } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);

  // Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [ratingStats, setRatingStats] = useState({ averageRating: 5.0, reviewCount: 0 });

  // Review Form State
  const [newReviewForm, setNewReviewForm] = useState({
    name: '',
    rating: 5,
    comment: '',
    videoUrl: '',
    imageUrl: '',
  });

  const [reviewImagePreview, setReviewImagePreview] = useState<string>('');
  const [reviewVideoPreview, setReviewVideoPreview] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    if (slug) {
      const foundProd = db.getProductBySlug(slug);
      if (foundProd) {
        setProduct(foundProd);
        if (foundProd.variants && foundProd.variants.length > 0) {
          setSelectedVariant(foundProd.variants[0]);
        }
        setActiveImage(foundProd.mainImage);

        // Load reviews
        const loaded = db.getProductReviews(foundProd.id);
        setReviews(loaded);
        setRatingStats(db.calculateProductRating(foundProd.id));

        // Update Recently Viewed Products in localStorage (max 10, no duplicates)
        try {
          const saved = localStorage.getItem('fbs_recently_viewed');
          let ids: string[] = saved ? JSON.parse(saved) : [];
          if (!Array.isArray(ids)) ids = [];
          ids = [foundProd.id, ...ids.filter(id => id !== foundProd.id)].slice(0, 10);
          localStorage.setItem('fbs_recently_viewed', JSON.stringify(ids));

          const allProds = db.getProducts();
          const list = ids
            .filter(id => id !== foundProd.id)
            .map(id => allProds.find(p => p.id === id))
            .filter(Boolean) as Product[];
          setRecentlyViewedProducts(list);
        } catch (e) {
          console.warn('Failed to update recently viewed:', e);
        }

        // Try load customer session
        try {
          const session = localStorage.getItem('fbs_customer_session');
          if (session) {
            const sessObj = JSON.parse(session);
            setNewReviewForm(prev => ({
              ...prev,
              name: sessObj.name || '',
            }));
          }
        } catch (e) {
          console.warn('Failed to parse customer session for review form:', e);
        }
      }
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
        <AnnouncementBar />
        <HeaderNav />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <h2 className="font-serif text-3xl font-bold text-[#800020]">{language === 'EN' ? 'Product Not Found' : language === 'MS' ? 'Produk Tidak Dijumpai' : 'Produk Tidak Ditemukan'}</h2>
          <p className="text-stone-600 text-sm mt-2">{language === 'EN' ? 'The requested baking supply item does not exist or has been archived.' : language === 'MS' ? 'Item bekalan bakeri yang dicari tidak wujud atau telah diarkibkan.' : 'Item perlengkapan kue yang diminta tidak ada atau telah diarsipkan.'}</p>
          <Link href="/products" className="mt-6 px-6 py-3 bg-[#800020] text-white font-bold text-xs rounded-xl shadow">
            {language === 'EN' ? 'Back to Catalog' : language === 'MS' ? 'Kembali ke Katalog' : 'Kembali ke Katalog'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return db.getProducts({ category: product.categoryId }).filter(p => p.id !== product.id).slice(0, 4);
  }, [product]);

  const frequentlyBoughtTogether = useMemo(() => {
    if (!product) return [];
    const allProds = db.getProducts();
    return allProds
      .filter(p => p.id !== product.id && (p.categoryId === product.categoryId || p.brand === product.brand || p.isBestSeller))
      .slice(0, 2);
  }, [product]);

  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product, selectedVariant, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleDirectWhatsApp = () => {
    if (!selectedVariant) return;
    const settings = db.getStoreSettings();
    const link = generateWhatsAppOrderLink({
      orderNumber: `#DIRECT-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Direct Customer',
      customerPhone: '',
      address: '',
      city: '',
      state: '',
      postcode: '',
      notes: `Direct order inquiry for ${product.productName} (${selectedVariant.variantName})`,
      items: [{
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.productName,
        variantName: selectedVariant.variantName,
        price: selectedVariant.price,
        weight: selectedVariant.weight,
        quantity: quantity,
        mainImage: product.mainImage,
        sku: selectedVariant.sku
      }],
      subtotal: selectedVariant.price * quantity,
      whatsappNumber: settings.whatsappNumber,
    });
    window.open(link, '_blank');
  };

  // Review Video File Upload
  const handleReviewVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setReviewVideoPreview(dataUrl);
        setNewReviewForm(prev => ({ ...prev, videoUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Review Image File Upload
  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setReviewImagePreview(dataUrl);
        setNewReviewForm(prev => ({ ...prev, imageUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Review Submission Submit
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.name || !newReviewForm.comment) return;

    setIsSubmittingReview(true);

    setTimeout(() => {
      const added = db.addReview({
        productId: product.id,
        customerName: newReviewForm.name,
        rating: newReviewForm.rating,
        comment: newReviewForm.comment,
        images: newReviewForm.imageUrl ? [newReviewForm.imageUrl] : [],
        videoUrl: newReviewForm.videoUrl || undefined,
        verifiedPurchase: true,
      });

      setReviews(prev => [added, ...prev]);
      setRatingStats(db.calculateProductRating(product.id));
      setIsSubmittingReview(false);
      setReviewSuccess(true);
      
      setNewReviewForm({
        name: '',
        rating: 5,
        comment: '',
        videoUrl: '',
        imageUrl: '',
      });
      setReviewImagePreview('');
      setReviewVideoPreview('');

      setTimeout(() => setReviewSuccess(false), 3000);
    }, 600);
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.productName,
    image: product.mainImage,
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'FBS Bakery World',
    },
    offers: {
      '@type': 'Offer',
      url: `https://fbsbakeryworld.com/products/${product.slug}`,
      priceCurrency: 'MYR',
      price: selectedVariant ? selectedVariant.price : 20.0,
      availability: product.status ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: ratingStats.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: ratingStats.averageRating,
      reviewCount: ratingStats.reviewCount,
    } : undefined,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://fbsbakeryworld.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://fbsbakeryworld.com/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.productName,
        item: `https://fbsbakeryworld.com/products/${product.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8 font-medium">
          <Link href="/" className="hover:text-[#800020]">{t.nav.home}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/products" className="hover:text-[#800020]">{t.nav.products}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#800020] font-bold truncate max-w-xs">{product.productName}</span>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-sm mb-12">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img 
                src={activeImage || product.mainImage} 
                alt={product.productName} 
                fetchPriority="high"
                loading="eager"
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-lg transition-transform active:scale-95 ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-700 hover:text-red-500'
                }`}
                title={t.customerAccount.wishlistTitle}
                aria-label={t.customerAccount.wishlistTitle}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Gallery List */}
            {product.galleryImages && product.galleryImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === imgUrl ? 'border-[#800020] scale-95 shadow-md' : 'border-stone-200 hover:border-[#800020]'
                    }`}
                    aria-label={`View Product Image ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`${product.productName} Thumbnail ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Purchase Selector */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-[#800020]/10 text-[#800020] text-xs font-bold rounded-md uppercase">
                  {product.categoryName || 'Baking Supply'}
                </span>
                <span className="text-xs font-bold text-stone-500">Brand: {product.brand}</span>
                {product.isHalal && (
                  <span className="px-2.5 py-0.5 bg-emerald-700 text-white text-xs font-extrabold rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t.productDetail.halalCertified}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2B1B1B] leading-tight">
                {product.productName}
              </h1>

              {/* RATING, REVIEWS & TOTAL SOLD COUNTER */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="px-3 py-1 bg-orange-100 border border-orange-300 text-orange-800 text-xs font-black rounded-full flex items-center gap-1.5 shadow-sm">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500" /> {formatSoldQuantity(product.totalSold)}
                </span>

                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(ratingStats.averageRating) ? 'fill-current' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-900">{ratingStats.averageRating}</span>
                  <span className="text-xs text-stone-500">({ratingStats.reviewCount} {language === 'EN' ? 'Reviews' : language === 'MS' ? 'Ulasan' : 'Ulasan'})</span>
                </div>
              </div>

              <p className="text-stone-600 text-sm mt-3 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Price Display */}
              <div className="mt-6 p-4 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">{t.productDetail.pricePerPack}</span>
                  <span className="font-serif text-3xl font-extrabold text-[#800020]">
                    {selectedVariant ? formatMYR(selectedVariant.price * quantity) : formatMYR(0)}
                  </span>
                </div>
                <span className="text-xs font-mono text-stone-500">SKU: {selectedVariant?.sku}</span>
              </div>

              {/* Weight Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-6">
                  <label className="block text-xs font-bold text-[#2B1B1B] uppercase tracking-wider mb-2">
                    {t.productDetail.selectVariant}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedVariant?.id === v.id
                            ? 'bg-[#800020] text-white border-[#800020] shadow-md ring-2 ring-[#800020]/20'
                            : 'bg-white text-stone-800 border-stone-300 hover:border-[#800020]'
                        }`}
                      >
                        <span className="block text-sm font-bold">{v.variantName}</span>
                        <span className={`text-xs block mt-0.5 ${selectedVariant?.id === v.id ? 'text-[#D4AF37]' : 'text-[#800020] font-bold'}`}>
                          {formatMYR(v.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Controller with Direct Nominal Input */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-bold text-[#2B1B1B] uppercase tracking-wider">{t.productDetail.quantity}:</span>
                <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-stone-600 hover:text-[#800020] transition-colors"
                    title="Kurangi jumlah"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input 
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        setQuantity(val);
                      } else if (e.target.value === '') {
                        setQuantity(1);
                      }
                    }}
                    className="w-16 text-center font-bold text-sm text-[#800020] bg-white border border-stone-200 rounded-lg py-1 mx-1 focus:outline-none focus:border-[#800020] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    title="Ketik nominal jumlah yang diinginkan"
                  />

                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-stone-600 hover:text-[#800020] transition-colors"
                    title="Tambah jumlah"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Action Buttons: Add to Cart & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-stone-100">
              <button
                onClick={handleAddToCart}
                className={`py-3.5 px-6 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#800020] hover:bg-[#6F1D1B] text-white active:scale-95'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" /> {language === 'EN' ? 'Added to Shopping Cart!' : language === 'MS' ? 'Ditambah ke Troli!' : 'Ditambahkan ke Keranjang!'}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> {t.productDetail.addToCart}
                  </>
                )}
              </button>

              <button
                onClick={handleDirectWhatsApp}
                className="py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white" /> {t.productDetail.orderWhatsApp}
              </button>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-stone-600">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#800020]" /> {t.productDetail.fastDelivery}
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#800020]" /> {language === 'EN' ? 'Commercial Bulk Rates Available' : language === 'MS' ? 'Kadar Pukal Komersial Disediakan' : 'Harga Grosir Komersial Tersedia'}
              </div>
            </div>

          </div>

        </div>

        {/* Frequently Bought Together Recommendation Section */}
        {frequentlyBoughtTogether.length > 0 && (
          <div className="bg-[#800020]/5 p-6 sm:p-8 rounded-3xl border border-[#800020]/20 shadow-sm mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#800020]" />
              <h3 className="font-serif text-xl font-bold text-[#800020]">{language === 'EN' ? 'Frequently Bought Together' : language === 'MS' ? 'Kerap Dibeli Bersama' : 'Sering Dibeli Bersama'}</h3>
            </div>
            <p className="text-stone-600 text-xs mb-6">{language === 'EN' ? 'Baking professionals and customers often order these complementary ingredients together for optimal results.' : language === 'MS' ? 'Pakar bakeri dan pelanggan sering memesan bahan tambahan ini bersama untuk hasil terbaik.' : 'Profesional baking dan pelanggan sering memesan bahan pelengkap ini bersama untuk hasil terbaik.'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {frequentlyBoughtTogether.map((p: Product) => (
                <ProductCard key={`fbt-${p.id}`} product={p} viewMode="list" />
              ))}
            </div>
          </div>
        )}

        {/* Full Detailed Description Section */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-sm mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#800020] mb-4 border-b border-stone-200 pb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-[#800020]" /> {t.productDetail.descriptionTitle}
          </h2>
          <div className="prose max-w-none text-stone-700 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* CUSTOMER RATINGS, REVIEWS & VIDEO FEEDBACK CMS SECTION */}
        <section className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-sm mb-16 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200 pb-4 gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#800020] flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> {language === 'EN' ? 'Customer Ratings, Reviews & Video Demos' : language === 'MS' ? 'Penilaian, Ulasan & Video Pelanggan' : 'Penilaian, Ulasan & Video Review Pelanggan'}
              </h2>
              <p className="text-stone-500 text-xs mt-0.5">
                {language === 'EN' ? 'Honest customer feedback and video product demos by FBS Bakery World bakers.' : language === 'MS' ? 'Ulasan jujur dan demo video produk oleh para baker & pelanggan FBS Bakery World.' : 'Ulasan jujur dan demo video penggunaan produk oleh para baker & pelanggan setia FBS Bakery World.'}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
              <div className="font-serif text-3xl font-black text-[#800020]">{ratingStats.averageRating}</div>
              <div className="text-xs">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(ratingStats.averageRating) ? 'fill-current' : 'text-stone-300'}`} />
                  ))}
                </div>
                <span className="text-stone-600 font-bold block mt-0.5">{ratingStats.reviewCount} Total Ulasan</span>
              </div>
            </div>
          </div>

          {/* VERIFIED BUYER REVIEW REQUIREMENT NOTICE */}
          <div className="bg-[#FFF8F0] p-6 rounded-2xl border border-[#EADBC8] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#800020]">
                {language === 'EN' ? '🔒 Review Form Reserved for Verified Buyers' : language === 'MS' ? '🔒 Borang Ulasan Khas Pembeli Terbukti' : '🔒 Form Ulasan Khusus Pembeli Terverifikasi'}
              </h3>
              <p className="text-stone-600 text-xs mt-1 max-w-lg mx-auto">
                {language === 'EN' ? 'To ensure review authenticity, review submissions are available after your order status is DELIVERED.' : language === 'MS' ? 'Untuk memastikan ketulenan ulasan, borang ulasan aktif selepas pesanan anda BERJAYA DIHANTAR (DELIVERED).' : 'Demi menjaga kualitas & kejujuran ulasan produk, fitur ulasan hanya aktif setelah pesanan Sampai (DELIVERED).'}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/account"
                className="px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] text-xs font-bold rounded-xl shadow inline-flex items-center gap-2"
              >
                <Star className="w-4 h-4 fill-[#D4AF37]" /> {language === 'EN' ? 'Open My Order History to Write a Review' : language === 'MS' ? 'Buka Sejarah Pesanan Saya Untuk Beri Ulasan' : 'Buka Riwayat Pesanan Saya Untuk Beri Ulasan'}
              </Link>
            </div>
          </div>

          {/* LIST ULASAN & VIDEO FEEDBACK PELANGGAN */}
          <div className="space-y-4 pt-4">
            <h3 className="font-serif text-lg font-bold text-[#2B1B1B] border-b border-stone-100 pb-2">
              {language === 'EN' ? 'Customer Reviews & Video Demonstrations' : language === 'MS' ? 'Senarai Ulasan & Video Pelanggan' : 'Daftar Ulasan & Pembuktian Video'} ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-500 font-bold">{language === 'EN' ? 'No reviews yet for this product. Be the first to review!' : language === 'MS' ? 'Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!' : 'Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!'}</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-black flex items-center justify-center text-sm shadow">
                        {rev.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-xs">{rev.customerName}</h4>
                          {rev.verifiedPurchase && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-stone-300'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    &quot;{rev.comment}&quot;
                  </p>

                  {/* ATTACHED PHOTOS */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pt-1">
                      {rev.images.map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt="Review Attachment" 
                          className="w-24 h-24 object-cover rounded-xl border border-stone-300 shadow-sm" 
                        />
                      ))}
                    </div>
                  )}

                  {/* ATTACHED INTERACTIVE VIDEO PLAYER */}
                  {rev.videoUrl && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-[#800020] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                        <Video className="w-3.5 h-3.5 text-[#800020]" /> VIDEO DEMO PELANGGAN ATTACHED
                      </span>
                      <div className="rounded-2xl overflow-hidden border-2 border-[#800020]/30 shadow-lg bg-black max-w-md">
                        <video src={rev.videoUrl} controls className="w-full h-56 object-cover" />
                      </div>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="font-serif text-2xl font-bold text-[#2B1B1B] mb-6">
              {t.productDetail.relatedTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Products */}
        {recentlyViewedProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="font-serif text-2xl font-bold text-[#2B1B1B] mb-6 flex items-center gap-2">
              <span>{language === 'EN' ? 'Recently Viewed Products' : language === 'MS' ? 'Produk Baru Dilihat' : 'Produk Terakhir Dilihat'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewedProducts.map((p) => (
                <ProductCard key={`rv-${p.id}`} product={p} />
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
