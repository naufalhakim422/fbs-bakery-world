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
import { ProductBadges } from '@/components/customer/product-badges';
import { ShareModal } from '@/components/customer/share-modal';
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
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  Clock,
  Share2,
  Scale
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawParamSlug = params?.slug;
  const slug = Array.isArray(rawParamSlug) ? rawParamSlug[0] : (rawParamSlug ? String(rawParamSlug) : '');
  const { t, language } = useLanguage();
  const { addToCart, isInWishlist, toggleWishlist, toggleCompare, isInCompare } = useCart();

  const [product, setProduct] = useState<Product | null>(() => {
    if (!slug) return null;
    return db.getProductBySlug(slug) || null;
  });
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    if (!slug) return null;
    const found = db.getProductBySlug(slug);
    return found?.variants?.[0] || null;
  });
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>(() => {
    if (!slug) return '';
    const found = db.getProductBySlug(slug);
    return found?.mainImage || '';
  });
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

  // Image Gallery & Zoom State
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const touchStateRef = React.useRef({
    lastTap: 0,
    initialPinchDist: 0,
    initialScale: 1,
  });

  const allImages = useMemo(() => {
    if (!product) return [];
    const list = [product.mainImage, ...(product.galleryImages || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  const openZoom = (imageUrl?: string) => {
    const imgToFind = imageUrl || activeImage || product?.mainImage || '';
    const idx = allImages.indexOf(imgToFind);
    setZoomIndex(idx >= 0 ? idx : 0);
    setZoomScale(1);
    setZoomPos({ x: 0, y: 0 });
    setIsZoomOpen(true);
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
    setZoomScale(1);
    setZoomPos({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  };

  const zoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setZoomPos({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = () => {
    setZoomScale(1);
    setZoomPos({ x: 0, y: 0 });
  };

  const toggleDoubleTapZoom = () => {
    if (zoomScale > 1) {
      resetZoom();
    } else {
      setZoomScale(2.5);
    }
  };

  const nextZoomImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allImages.length === 0) return;
    setZoomIndex((prev) => (prev + 1) % allImages.length);
    resetZoom();
  };

  const prevZoomImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allImages.length === 0) return;
    setZoomIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    resetZoom();
  };

  // Keyboard shortcut listener for Zoom Viewer
  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeZoom();
      } else if (e.key === 'ArrowRight') {
        nextZoomImage();
      } else if (e.key === 'ArrowLeft') {
        prevZoomImage();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, allImages.length]);

  // Drag handlers for mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - zoomPos.x, y: e.clientY - zoomPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setZoomPos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for pinch-to-zoom, pan, and double-tap
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current.initialPinchDist = dist;
      touchStateRef.current.initialScale = zoomScale;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - touchStateRef.current.lastTap < 300) {
        toggleDoubleTapZoom();
      }
      touchStateRef.current.lastTap = now;

      if (zoomScale > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - zoomPos.x,
          y: e.touches[0].clientY - zoomPos.y,
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStateRef.current.initialPinchDist > 0) {
        const scaleFactor = dist / touchStateRef.current.initialPinchDist;
        const newScale = Math.min(Math.max(touchStateRef.current.initialScale * scaleFactor, 1), 4);
        setZoomScale(newScale);
        if (newScale === 1) setZoomPos({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && zoomScale > 1) {
      setZoomPos({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStateRef.current.initialPinchDist = 0;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  useEffect(() => {
    const addedMetaTags: HTMLMetaElement[] = [];
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

        // Update Recently Viewed Products in localStorage (Sprint 2: max 10, no duplicates, latest first)
        try {
          if (foundProd && foundProd.id && typeof window !== 'undefined') {
            const saved = localStorage.getItem('fbs_recently_viewed');
            let ids: string[] = [];
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                  ids = parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
                }
              } catch (e) {
                ids = [];
              }
            }

            // Ensure no duplicate, latest viewed always first, max 10
            const updatedIds = [foundProd.id, ...ids.filter(id => id !== foundProd.id)].slice(0, 10);
            
            // Sprint 4 Optimization: Remove products that no longer exist in catalog
            const allProds = db.getProducts();
            const validIds = updatedIds.filter(id => allProds.some(p => p.id === id && p.status !== false));
            
            // If any deleted product ID was removed, sync cleaned IDs back to localStorage immediately
            if (validIds.length !== updatedIds.length) {
              localStorage.setItem('fbs_recently_viewed', JSON.stringify(validIds));
            } else {
              localStorage.setItem('fbs_recently_viewed', JSON.stringify(updatedIds));
            }

            // Populate Product list excluding current product being viewed
            const list = validIds
              .filter(id => id !== foundProd.id)
              .map(id => allProds.find(p => p.id === id))
              .filter((p): p is Product => Boolean(p && p.id));

            setRecentlyViewedProducts(list);
          }
        } catch (e) {
          console.warn('Failed to update recently viewed products in localStorage:', e);
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

        // Dynamic Open Graph & Page Metadata
        let addedMetaTags: HTMLMetaElement[] = [];
        if (typeof document !== 'undefined') {
          document.title = `${foundProd.productName} | FBS Bakery World`;
          const updateMetaTag = (propName: string, propVal: string, useNameAttr = false) => {
            const attr = useNameAttr ? 'name' : 'property';
            let meta = document.querySelector(`meta[${attr}="${propName}"]`);
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute(attr, propName);
              document.head.appendChild(meta);
              addedMetaTags.push(meta as HTMLMetaElement);
            }
            meta.setAttribute('content', propVal);
          };

          const curUrl = typeof window !== 'undefined' ? window.location.href : `https://fbsbaker.store/products/${foundProd.slug}`;
          updateMetaTag('og:title', `${foundProd.productName} - FBS Bakery World`);
          updateMetaTag('og:description', foundProd.shortDescription || 'Bahan & Perlengkapan Bakeri Premium');
          updateMetaTag('og:image', foundProd.mainImage);
          updateMetaTag('og:url', curUrl);
          updateMetaTag('og:type', 'product');
          updateMetaTag('twitter:card', 'summary_large_image', true);
          updateMetaTag('twitter:title', `${foundProd.productName} - FBS Bakery World`, true);
          updateMetaTag('twitter:description', foundProd.shortDescription || 'Bahan & Perlengkapan Bakeri Premium', true);
          updateMetaTag('twitter:image', foundProd.mainImage, true);
        }
      } else {
        setProduct(null);
      }
    }

    return () => {
      addedMetaTags.forEach(meta => {
        if (meta && meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      });
    };
  }, [slug]);

  const productJsonLd = useMemo(() => {
    if (!product) return null;
    const activeVar = selectedVariant || product.variants?.[0];
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.productName,
      image: [product.mainImage, ...(product.galleryImages || [])].filter(Boolean),
      description: product.description || product.shortDescription,
      sku: activeVar?.sku || product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'FBS Bakery World',
      },
      offers: {
        '@type': 'Offer',
        url: `https://fbsbaker.store/products/${product.slug}`,
        priceCurrency: 'MYR',
        price: activeVar ? activeVar.price.toFixed(2) : '0.00',
        availability: (activeVar?.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'FBS Bakery World',
        },
      },
    };
  }, [product, selectedVariant]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return db.getProducts({ category: product.categoryId }).filter(p => p.id !== product.id).slice(0, 4);
  }, [product]);

  const frequentlyBoughtTogether = useMemo(() => {
    if (!product) return [];
    const allProds = db.getProducts();
    return allProds
      .filter(p => p.id !== product.id && (p.categoryId === product.categoryId || p.brand === product.brand || p.isBestSeller))
      .slice(0, 4);
  }, [product]);

  const [selectedBundleItemIds, setSelectedBundleItemIds] = useState<string[]>([]);
  const [isBundleAdded, setIsBundleAdded] = useState(false);

  useEffect(() => {
    if (frequentlyBoughtTogether.length > 0) {
      setSelectedBundleItemIds(frequentlyBoughtTogether.map(p => p.id));
    }
  }, [frequentlyBoughtTogether]);

  const bundleSubtotal = useMemo(() => {
    if (!product || !selectedVariant) return 0;
    const mainTotal = selectedVariant.price * quantity;
    const recommendedTotal = frequentlyBoughtTogether
      .filter(p => selectedBundleItemIds.includes(p.id))
      .reduce((sum, p) => {
        const v = p.variants?.[0];
        return sum + (v ? v.price : 0);
      }, 0);
    return mainTotal + recommendedTotal;
  }, [product, selectedVariant, quantity, frequentlyBoughtTogether, selectedBundleItemIds]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
        {productJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
          />
        )}
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

  const toggleBundleItem = (id: string) => {
    setSelectedBundleItemIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddBundleToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    frequentlyBoughtTogether.forEach(p => {
      if (selectedBundleItemIds.includes(p.id) && p.variants?.[0]) {
        addToCart(p, p.variants[0], 1);
      }
    });
    setIsBundleAdded(true);
    setTimeout(() => setIsBundleAdded(false), 2000);
  };

  const handleWhatsAppBundle = () => {
    if (!product || !selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    frequentlyBoughtTogether.forEach(p => {
      if (selectedBundleItemIds.includes(p.id) && p.variants?.[0]) {
        addToCart(p, p.variants[0], 1);
      }
    });
    router.push('/checkout');
  };

  const handleOpenShare = () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator && product) {
      navigator.share({
        title: `${product.productName} - FBS Bakery World`,
        text: `Cek bahan kue "${product.productName}" di FBS Bakery World!`,
        url: window.location.href,
      }).then(() => {
        db.recordProductShare(product.id, product.productName, 'NATIVE_SHARE');
      }).catch((err) => {
        console.warn('Native share error/cancel, fallback to modal:', err);
        setIsShareModalOpen(true);
      });
    } else {
      setIsShareModalOpen(true);
    }
  };

  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      addToCart(product, selectedVariant, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleDirectWhatsApp = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    router.push('/checkout');
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://fbsbaker.store',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://fbsbaker.store/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product?.productName || '',
        item: `https://fbsbaker.store/products/${product?.slug || ''}`,
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
            <div 
              onClick={() => openZoom(activeImage || product.mainImage)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 cursor-zoom-in group shadow-sm transition-all hover:shadow-md"
              title={language === 'EN' ? 'Click to zoom product image' : 'Klik untuk memperbesar gambar produk'}
            >
              <img 
                src={activeImage || product.mainImage} 
                alt={product.productName} 
                fetchPriority="high"
                loading="eager"
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover Zoom Badge / Overlay Indicator */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="bg-black/75 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <ZoomIn className="w-4 h-4 text-[#D4AF37]" />
                  <span>{language === 'EN' ? 'Click to Zoom' : 'Klik untuk Perbesar'}</span>
                </div>
              </div>

              {/* Product Badges Overlay */}
              <ProductBadges product={product} size="md" className="absolute top-4 left-4 z-10" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-lg transition-transform active:scale-95 z-10 ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-700 hover:text-red-500'
                }`}
                title={t.customerAccount.wishlistTitle}
                aria-label={t.customerAccount.wishlistTitle}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Gallery List */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((imgUrl, idx) => {
                  const isActive = (activeImage || product.mainImage) === imgUrl;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all relative ${
                        isActive 
                          ? 'border-[#800020] scale-95 shadow-md ring-2 ring-[#800020]/30' 
                          : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-[#800020]'
                      }`}
                      aria-label={`View Product Image ${idx + 1}`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${product.productName} Thumbnail ${idx + 1}`} 
                        loading="lazy" 
                        decoding="async" 
                        className="w-full h-full object-cover" 
                      />
                      {isActive && (
                        <div className="absolute inset-0 border-2 border-[#800020] rounded-xl pointer-events-none" />
                      )}
                    </button>
                  );
                })}
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

              <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleOpenShare}
                  className="py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-bold transition-all border border-stone-300 flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  title="Bagikan Produk ini"
                >
                  <Share2 className="w-4 h-4 text-[#800020]" />
                  <span>{language === 'EN' ? 'Share' : language === 'MS' ? 'Kongsi' : 'Bagikan'}</span>
                </button>

                <button
                  onClick={() => product && toggleCompare(product.id)}
                  className={`py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border flex items-center justify-center gap-2 active:scale-95 shadow-sm ${
                    product && isInCompare(product.id)
                      ? 'bg-[#800020] text-white border-[#800020]'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                  title="Bandingkan Produk"
                >
                  <Scale className={`w-4 h-4 ${product && isInCompare(product.id) ? 'text-white' : 'text-[#800020]'}`} />
                  <span>{product && isInCompare(product.id) ? 'Dibandingkan' : 'Bandingkan'}</span>
                </button>
              </div>
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

        {/* Frequently Bought Together Bundle Builder (Sprint 1-5 Complete) */}
        {frequentlyBoughtTogether.length > 0 && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8] shadow-sm mb-12 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200 pb-4 gap-4 mb-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#800020] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#800020]" />
                  <span>{language === 'EN' ? 'Frequently Bought Together' : language === 'MS' ? 'Kerap Dibeli Bersama' : 'Sering Dibeli Bersama'}</span>
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  {language === 'EN' ? 'Combine complementary baking items and add all selected items to cart with 1-click.' : 'Kombinasikan bahan baking pelengkap ini dan tambahkan semua item terpilih ke keranjang.'}
                </p>
              </div>
            </div>

            {/* Bundle Items List with Checkboxes & Stock Status */}
            <div className="space-y-4 mb-8">
              {/* Main Product Row */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="w-5 h-5 accent-[#800020] rounded cursor-not-allowed"
                />
                <img
                  src={product.mainImage}
                  alt={product.productName}
                  className="w-16 h-16 object-cover rounded-xl border border-stone-300"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#800020] uppercase">This Item (Main)</span>
                  <h4 className="font-serif font-bold text-stone-900 text-sm truncate">{product.productName}</h4>
                  <span className="text-xs font-bold text-[#800020]">{formatMYR(selectedVariant ? selectedVariant.price * quantity : 0)} ({selectedVariant?.variantName})</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300">
                  {language === 'EN' ? 'In Stock' : 'Stok Tersedia'}
                </span>
              </div>

              {/* Recommended Complementary Products */}
              {frequentlyBoughtTogether.map((p) => {
                const isSelected = selectedBundleItemIds.includes(p.id);
                const v = p.variants?.[0];
                const price = v ? v.price : 0;
                const inStock = v ? v.stock > 0 : true;

                return (
                  <div 
                    key={`bundle-${p.id}`}
                    onClick={() => toggleBundleItem(p.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected ? 'bg-[#800020]/5 border-[#800020]/30 shadow-sm' : 'bg-white border-stone-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBundleItem(p.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 accent-[#800020] rounded cursor-pointer"
                    />
                    <Link href={`/products/${p.slug}`} onClick={(e) => e.stopPropagation()}>
                      <img
                        src={p.mainImage}
                        alt={p.productName}
                        className="w-16 h-16 object-cover rounded-xl border border-stone-300 hover:scale-105 transition-transform"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${p.slug}`} onClick={(e) => e.stopPropagation()} className="hover:text-[#800020]">
                        <h4 className="font-serif font-bold text-stone-900 text-sm truncate">{p.productName}</h4>
                      </Link>
                      <span className="text-xs font-bold text-[#800020]">{formatMYR(price)} {v ? `(${v.variantName})` : ''}</span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      inStock ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {inStock ? (language === 'EN' ? 'In Stock' : 'Stok Tersedia') : (language === 'EN' ? 'Out of Stock' : 'Stok Habis')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total Subtotal & CTA Bundle Action Bar */}
            <div className="p-6 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs text-stone-400 font-medium block">
                  {language === 'EN' ? 'Total Bundle Subtotal' : 'Total Subtotal Paket'} ({1 + selectedBundleItemIds.length} {language === 'EN' ? 'items selected' : 'item terpilih'}):
                </span>
                <span className="font-serif text-2xl font-black text-[#D4AF37]">
                  {formatMYR(bundleSubtotal)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isBundleAdded ? 'bg-emerald-600 text-white' : 'bg-[#800020] hover:bg-[#6F1D1B] text-white active:scale-95'
                  }`}
                >
                  {isBundleAdded ? (
                    <>
                      <Check className="w-4 h-4" /> {language === 'EN' ? 'Bundle Added to Cart!' : 'Paket Ditambahkan!'}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> {language === 'EN' ? 'Add Selected Items to Cart' : 'Tambahkan Item Terpilih'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppBundle}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" /> WhatsApp
                </button>
              </div>
            </div>
          </section>
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
                      {rev.images.map((img: string, idx: number) => (
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
          <section className="mb-16 animate-fade-in">
            <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#800020] flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#800020]" />
                <span>{language === 'EN' ? 'Recently Viewed' : language === 'MS' ? 'Produk Baru Dilihat' : 'Produk Terakhir Dilihat'}</span>
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                {recentlyViewedProducts.length} {language === 'EN' ? 'items' : 'produk'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewedProducts.map((p) => (
                <ProductCard key={`rv-${p.id}`} product={p} viewMode="grid" />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Fullscreen Interactive Zoom Viewer Modal */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-fade-in select-none overflow-hidden"
          onClick={closeZoom}
        >
          {/* Top Header Bar */}
          <div 
            className="flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product Name & Counter */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-bold text-sm sm:text-base text-[#F7E7CE] truncate max-w-xs sm:max-w-md">
                {product.productName}
              </span>
              {allImages.length > 1 && (
                <span className="text-xs px-2.5 py-1 bg-white/10 rounded-full font-mono text-stone-300 flex-shrink-0">
                  {zoomIndex + 1} / {allImages.length}
                </span>
              )}
            </div>

            {/* Control Buttons & Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono text-stone-300">
                <span>{Math.round(zoomScale * 100)}%</span>
              </div>

              <button
                onClick={zoomOut}
                disabled={zoomScale <= 1}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>

              <button
                onClick={zoomIn}
                disabled={zoomScale >= 4}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              <button
                onClick={resetZoom}
                disabled={zoomScale === 1 && zoomPos.x === 0 && zoomPos.y === 0}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
                title="Reset Zoom"
                aria-label="Reset Zoom"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={closeZoom}
                className="p-2 sm:p-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white transition-colors ml-1 sm:ml-2 shadow-lg"
                title="Close (ESC)"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image Container with Pan / Zoom */}
          <div 
            className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={toggleDoubleTapZoom}
          >
            <div 
              className="transition-transform duration-150 ease-out max-w-full max-h-full flex items-center justify-center"
              style={{
                transform: `translate(${zoomPos.x}px, ${zoomPos.y}px) scale(${zoomScale})`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={allImages[zoomIndex] || product.mainImage}
                alt={product.productName}
                className="max-w-[92vw] max-h-[75vh] object-contain rounded-xl shadow-2xl pointer-events-none select-none"
              />
            </div>

            {/* Prev / Next Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevZoomImage}
                  className="absolute left-3 sm:left-6 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-transform active:scale-95 shadow-2xl backdrop-blur-md z-30 border border-white/10"
                  title="Previous Image (Left Arrow)"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={nextZoomImage}
                  className="absolute right-3 sm:right-6 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-transform active:scale-95 shadow-2xl backdrop-blur-md z-30 border border-white/10"
                  title="Next Image (Right Arrow)"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip & Controls */}
          <div 
            className="p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center gap-2.5 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gesture Hint */}
            <div className="text-[11px] text-stone-400 font-medium tracking-wide text-center">
              {language === 'EN' 
                ? 'Double-tap or click to zoom • Drag/pinch to move • Press ESC or click outside to close' 
                : 'Ketuk 2x atau klik untuk perbesar • Geser/cubit untuk berpindah • Tekan ESC atau klik luar untuk tutup'}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto max-w-full pb-1 px-2 scrollbar-none">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setZoomIndex(idx);
                      resetZoom();
                    }}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      zoomIndex === idx 
                        ? 'border-[#D4AF37] scale-105 ring-2 ring-[#D4AF37]/50 shadow-lg' 
                        : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {product && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          product={product}
          selectedVariant={selectedVariant || undefined}
        />
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
