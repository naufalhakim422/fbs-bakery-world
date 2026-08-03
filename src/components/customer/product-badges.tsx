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
  const isNew = Boolean(product.isNew || (product.createdAt && (Date.now() - new Date(product.createdAt).getTime() < 90 * 24 * 60 * 60 * 1000)));
  const isSale = Boolean(product.isFeatured);
  const isBestSeller = Boolean(product.isBestSeller);
  const isHalal = Boolean(product.isHalal);

  const textSize = size === 'sm' ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] px-2 py-0.5';
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <div className={`flex flex-col gap-1 items-start select-none z-10 ${className}`}>
      {/* 1. OUT OF STOCK BADGE */}
      {isOutOfStock && (
        <span className={`${textSize} bg-slate-800 text-white font-extrabold rounded-md shadow-md flex items-center gap-1 uppercase tracking-wider`}>
          <AlertCircle className={iconSize} /> OUT OF STOCK
        </span>
      )}

      {/* 2. BEST SELLER BADGE */}
      {isBestSeller && !isOutOfStock && (
        <span className={`${textSize} bg-[#D4AF37] text-[#800020] font-black rounded-md shadow-md flex items-center gap-1 uppercase tracking-wider`}>
          <Flame className={`${iconSize} fill-[#800020] text-[#800020]`} /> BEST SELLER
        </span>
      )}

      {/* 3. NEW ARRIVAL BADGE */}
      {isNew && !isOutOfStock && (
        <span className={`${textSize} bg-teal-600 text-white font-extrabold rounded-md shadow-md flex items-center gap-1 uppercase tracking-wider`}>
          <Sparkles className={iconSize} /> NEW
        </span>
      )}

      {/* 4. SALE BADGE */}
      {isSale && !isOutOfStock && (
        <span className={`${textSize} bg-red-600 text-white font-black rounded-md shadow-md flex items-center gap-1 uppercase tracking-wider`}>
          <Tag className={iconSize} /> SALE
        </span>
      )}

      {/* 5. HALAL BADGE */}
      {isHalal && (
        <span className={`${textSize} bg-emerald-800 text-white font-extrabold rounded-md shadow-md flex items-center gap-1 uppercase tracking-wider`}>
          <ShieldCheck className={iconSize} /> 100% HALAL
        </span>
      )}
    </div>
  );
};
