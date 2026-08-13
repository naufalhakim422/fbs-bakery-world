'use client';

import React from 'react';
import { Product } from '@/types';
import { ShieldCheck, Sparkles, Flame, Tag, AlertCircle } from 'lucide-react';

interface ProductBadgesProps {
  product: Product;
  size?: 'sm' | 'md';
  className?: string;
}

export const ProductBadges: React.FC<ProductBadgesProps> = ({ product, size = 'md', className = '' }) => {
  const isOutOfStock = Boolean(product.variants && product.variants.length > 0 && product.variants.every(v => (v.stock ?? 0) <= 0));
  const isNew = Boolean(product.isNew || (product.createdAt && (Date.now() - new Date(product.createdAt).getTime() < 60 * 24 * 60 * 60 * 1000)));
  const isSale = Boolean(product.isFeatured || (product.variants && product.variants.some(v => v.originalPrice && v.originalPrice > v.price)));
  const isBestSeller = Boolean(product.isBestSeller);
  const isHalal = Boolean(product.isHalal);

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]';
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  // Render ONLY 1 single highest-priority badge to keep cards clean and clutter-free
  if (isOutOfStock) {
    return (
      <div className={`select-none z-10 ${className}`}>
        <span className={`${padding} bg-stone-900/90 text-stone-200 font-bold rounded-full backdrop-blur-md shadow-xs border border-stone-700 flex items-center gap-1 uppercase tracking-wider`}>
          <AlertCircle className={iconSize} /> Habis
        </span>
      </div>
    );
  }

  if (isBestSeller) {
    return (
      <div className={`select-none z-10 ${className}`}>
        <span className={`${padding} bg-[#800020] text-amber-200 font-bold rounded-full backdrop-blur-md shadow-xs border border-[#800020] flex items-center gap-1 uppercase tracking-wider`}>
          <Flame className={`${iconSize} fill-amber-300 text-amber-300`} /> Best Seller
        </span>
      </div>
    );
  }

  if (isSale) {
    return (
      <div className={`select-none z-10 ${className}`}>
        <span className={`${padding} bg-rose-700 text-white font-bold rounded-full backdrop-blur-md shadow-xs border border-rose-600 flex items-center gap-1 uppercase tracking-wider`}>
          <Tag className={iconSize} /> Promo
        </span>
      </div>
    );
  }

  if (isNew) {
    return (
      <div className={`select-none z-10 ${className}`}>
        <span className={`${padding} bg-emerald-800 text-white font-bold rounded-full backdrop-blur-md shadow-xs border border-emerald-700 flex items-center gap-1 uppercase tracking-wider`}>
          <Sparkles className={iconSize} /> Baru
        </span>
      </div>
    );
  }

  if (isHalal) {
    return (
      <div className={`select-none z-10 ${className}`}>
        <span className={`${padding} bg-emerald-900/90 text-emerald-100 font-bold rounded-full backdrop-blur-md shadow-xs border border-emerald-700 flex items-center gap-1 uppercase tracking-wider`}>
          <ShieldCheck className={iconSize} /> 100% Halal
        </span>
      </div>
    );
  }

  return null;
};
