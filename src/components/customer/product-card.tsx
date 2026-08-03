'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ProductVariant } from '@/types';
import { formatMYR, formatSoldQuantity } from '@/lib/currency';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { ShoppingBag, MessageCircle, Heart, ShieldCheck, Check, Sparkles, Star, Flame } from 'lucide-react';
import { generateWhatsAppOrderLink } from '@/lib/whatsapp';
import { db } from '@/lib/db';
import { ProductBadges } from '@/components/customer/product-badges';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, viewMode = 'grid' }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
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
  const [isAdded, setIsAdded] = useState(false);
  const ratingStats = React.useMemo(() => db.calculateProductRating(product.id), [product.id]);

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
    const settings = db.getStoreSettings();
    const link = generateWhatsAppOrderLink({
      orderNumber: `#QUICK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Quick Inquiry',
      customerPhone: '',
      address: '',
      city: '',
      state: '',
      postcode: '',
      notes: `Quick order inquiry for ${product.productName} (${selectedVariant.variantName})`,
      items: [{
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.productName,
        variantName: selectedVariant.variantName,
        price: selectedVariant.price,
        weight: selectedVariant.weight,
        quantity: 1,
        mainImage: product.mainImage,
        sku: selectedVariant.sku
      }],
      subtotal: selectedVariant.price,
      whatsappNumber: settings.whatsappNumber,
    });
    window.open(link, '_blank');
  };

  const isFavorite = isInWishlist(product.id);
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

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors shadow ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-700 hover:text-red-500 hover:bg-white'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

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
            {product.variants.map((variant) => (
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
    <div className="bg-white rounded-2xl border border-[#EADBC8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden group relative">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <Link href={`/products/${product.slug}`}>
          <img 
            src={productImage} 
            alt={product.productName} 
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors shadow-md ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-700 hover:text-red-500 hover:bg-white'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Badges */}
        <ProductBadges product={product} size="md" className="absolute top-3 left-3" />
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold text-[#800020] uppercase tracking-wider block">
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
          <Link href={`/products/${product.slug}`} className="hover:text-[#800020] transition-colors">
            <h3 className="font-serif font-bold text-base text-[#2B1B1B] leading-snug line-clamp-2">
              {product.productName}
            </h3>
          </Link>
          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Weight Variant Selector */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-stone-500">{language === 'EN' ? 'Select Weight / Size:' : language === 'MS' ? 'Pilih Berat / Saiz:' : 'Pilih Berat / Ukuran:'}</span>
            <span className={`text-xs font-bold ${selectedVariant.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {selectedVariant.stock > 0 
                ? (language === 'EN' ? 'In Stock' : language === 'MS' ? 'Ada Stok' : 'Stok Tersedia')
                : (language === 'EN' ? 'Out of Stock' : language === 'MS' ? 'Kehabisan Stok' : 'Stok Habis')
              }
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all ${
                  selectedVariant.id === variant.id
                    ? 'bg-[#800020] text-white border-[#800020] shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-[#800020]'
                }`}
              >
                {variant.variantName}
              </button>
            ))}
          </div>

          {/* Dynamic Price Display */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-stone-500 block text-[10px] uppercase font-bold tracking-wider">{t.productDetail.pricePerPack}</span>
              <span className="text-xl font-extrabold text-[#800020] font-serif">
                {formatMYR(selectedVariant.price)}
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">SKU: {selectedVariant.sku}</span>
          </div>

          {/* Buttons: Add to Cart & WhatsApp */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#800020] hover:bg-[#6F1D1B] text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> {t.productDetail.addToCart}
                </>
              )}
            </button>

            <button
              onClick={handleQuickWhatsApp}
              className="py-2 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1"
              title="Order directly via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" /> WhatsApp
            </button>
          </div>

        </div>

      </div>
    </div>
  );
});
