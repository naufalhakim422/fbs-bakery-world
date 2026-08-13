'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types';
import { formatMYR, formatSoldQuantity } from '@/lib/currency';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { ShoppingBag, MessageCircle, Heart, ShieldCheck, Check, Sparkles, Star, Flame, Scale } from 'lucide-react';
import { generateWhatsAppOrderLink } from '@/lib/whatsapp';
import { db } from '@/lib/db';
import { ProductBadges } from '@/components/customer/product-badges';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, viewMode = 'grid' }) => {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useCart();
  const { t, language } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants && product.variants.length > 0 ? product.variants[0] : {
      id: 'default',
      productId: product.id,
      variantName: '1kg',
      weight: 1.0,
      price: 20.0,
      sku: product.sku,
      stock: 50,
    }
  );

  React.useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product.variants]);
  const [isAdded, setIsAdded] = useState(false);
  const ratingStats = React.useMemo(() => db.calculateProductRating(product.id), [product.id]);
  const isFavorite = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedVariant, 1);
    router.push('/checkout');
  };

  const productImage = product.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop';

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-[#EADBC8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row overflow-hidden group relative p-4 gap-4 items-center">
        
        {/* Left: Square Product Image */}
        <div className="relative w-full md:w-36 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
          <Link href={`/products/${product.slug}`}>
            <img 
              src={productImage} 
              alt={product.productName} 
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 100vw, 200px"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Wishlist & Compare Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-colors shadow ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-700 hover:text-red-500 hover:bg-white'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(product.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-colors shadow ${
                isCompared ? 'bg-[#800020] text-white' : 'bg-white/80 text-stone-700 hover:text-[#800020] hover:bg-white'
              }`}
              title={isCompared ? "Hapus dari Perbandingan" : "Bandingkan Produk"}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Badges */}
          <ProductBadges product={product} size="sm" className="absolute top-2 left-2" />
        </div>

        {/* Middle: Content Info & Variants */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[#800020] uppercase tracking-wider">
              {product.categoryName || 'Baking Supply'} • {product.brand}
            </span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-orange-600 font-extrabold flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                <Flame className="w-3 h-3 fill-orange-500 text-orange-500" /> {formatSoldQuantity(product.totalSold)}
              </span>
              <span className="flex items-center gap-0.5 text-amber-500 font-extrabold">
                <Star className={`w-3 h-3 ${ratingStats.averageRating > 0 ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} /> {ratingStats.averageRating > 0 ? ratingStats.averageRating : '0.0'}
              </span>
            </div>
          </div>

          <Link href={`/products/${product.slug}`} className="hover:text-[#800020] transition-colors block">
            <h3 className="font-serif font-bold text-base text-[#2B1B1B] leading-snug line-clamp-1">
              {product.productName}
            </h3>
          </Link>

          <p className="text-stone-500 text-xs line-clamp-1 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Variant Selector */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-stone-400 mr-1">{language === 'EN' ? 'Size:' : 'Berat:'}</span>
            {(product.variants || []).map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-2 py-0.5 text-[11px] rounded-lg font-semibold border transition-all ${
                  selectedVariant.id === variant.id
                    ? 'bg-[#800020] text-white border-[#800020] shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-[#800020]'
                }`}
              >
                {variant.variantName}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Pricing & CTA Actions */}
        <div className="w-full md:w-40 flex-shrink-0 flex flex-col justify-between p-3 bg-stone-50/80 rounded-xl border border-stone-200/80 text-center gap-2">
          <div>
            <span className="text-[9px] text-stone-500 uppercase font-bold tracking-wider block">{t.productDetail.pricePerPack}</span>
            <span className="text-xl font-extrabold text-[#800020] font-serif block">
              {formatMYR(selectedVariant.price)}
            </span>
            <span className="text-[9px] text-stone-400 font-mono block">SKU: {selectedVariant.sku}</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#800020] hover:bg-[#6F1D1B] text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3" /> {language === 'EN' ? 'Added!' : 'Ditambah!'}
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" /> {t.productDetail.addToCart}
                </>
              )}
            </button>

            <button
              onClick={handleQuickWhatsApp}
              className="w-full py-2 px-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1"
            >
              <MessageCircle className="w-3 h-3 fill-white" /> WhatsApp
            </button>
          </div>
        </div>

      </div>
    );
  }

  // STANDARD GRID VIEW LAYOUT
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-[#800020]/30 transition-all duration-300 flex flex-col h-full overflow-hidden group relative">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img 
            src={productImage} 
            alt={product.productName} 
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Wishlist & Compare Buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/85 text-stone-700 hover:text-red-500 hover:bg-white'
            }`}
            title="Simpan ke Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(product.id);
            }}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
              isCompared ? 'bg-[#800020] text-white' : 'bg-white/85 text-stone-700 hover:text-[#800020] hover:bg-white'
            }`}
            title={isCompared ? "Hapus dari Perbandingan" : "Bandingkan Produk"}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Priority Single Badge */}
        <ProductBadges product={product} size="sm" className="absolute top-2.5 left-2.5" />
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand Header (Clean Single Line Truncate) */}
          <div className="text-[10px] font-bold text-[#800020] uppercase tracking-wider truncate mb-1">
            {product.categoryName || 'Baking Supply'} • {product.brand || 'FBS'}
          </div>

          <Link href={`/products/${product.slug}`} className="hover:text-[#800020] transition-colors block">
            <h3 className="font-serif font-bold text-sm text-stone-900 leading-snug line-clamp-2 min-h-[2.5rem]">
              {product.productName}
            </h3>
          </Link>

          {/* Social Proof Row: Rating & Terjual */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-medium text-stone-500">
            {ratingStats.averageRating > 0 ? (
              <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {ratingStats.averageRating}
              </span>
            ) : null}
            {product.totalSold && product.totalSold > 0 ? (
              <span className="text-stone-400">
                • {formatSoldQuantity(product.totalSold)} {language === 'EN' ? 'sold' : 'terjual'}
              </span>
            ) : null}
          </div>
        </div>

        {/* Weight Variant Selector (Clean Scroll Row) */}
        <div className="mt-3 pt-2.5 border-t border-stone-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{language === 'EN' ? 'Size:' : 'Pilih Berat:'}</span>
            <span className={`text-[10px] font-bold ${selectedVariant.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {selectedVariant.stock > 0 
                ? (language === 'EN' ? 'In Stock' : 'Stok Tersedia')
                : (language === 'EN' ? 'Out of Stock' : 'Stok Habis')
              }
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 mb-2">
            {(product.variants || []).map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-2 py-0.5 text-[10px] rounded-md font-semibold border transition-all shrink-0 ${
                  selectedVariant.id === variant.id
                    ? 'bg-[#800020] text-white border-[#800020] shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                }`}
              >
                {variant.variantName}
              </button>
            ))}
          </div>

          {/* Dynamic Price Display */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider block">{t.productDetail.pricePerPack}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-[#800020] font-serif">
                  {formatMYR(selectedVariant.price)}
                </span>
                {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price ? (
                  <span className="text-xs text-stone-400 line-through font-serif font-bold">
                    {formatMYR(selectedVariant.originalPrice)}
                  </span>
                ) : null}
              </div>
            </div>

            {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price ? (
              <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-extrabold rounded border border-rose-200">
                -{Math.round(((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100)}%
              </span>
            ) : null}
          </div>

          {/* Action Button: Primary Add to Cart + Quick WhatsApp Icon */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#800020] hover:bg-[#600018] text-[#F7E7CE]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Ditambah!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> {t.productDetail.addToCart}
                </>
              )}
            </button>

            <button
              onClick={handleQuickWhatsApp}
              className="w-9 h-9 p-0 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0"
              title="Pesan via WhatsApp"
              aria-label="Order via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
});
