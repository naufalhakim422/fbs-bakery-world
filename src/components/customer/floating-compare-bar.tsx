'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { db } from '@/lib/db';
import { Scale, ArrowRight, X, Trash2 } from 'lucide-react';

export const FloatingCompareBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, totalCompare } = useCart();

  if (totalCompare === 0) return null;

  const compareProducts = compareList
    .map(id => db.getProductById(id))
    .filter(Boolean);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-full bg-stone-900/95 text-white backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-stone-700 shadow-2xl animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-3">
      
      {/* Left: Info & Thumbnails */}
      <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto scrollbar-none">
        <div className="flex items-center gap-2 pr-2 border-r border-stone-700 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#800020] text-white flex items-center justify-center font-bold text-xs shadow-md">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs block text-stone-100">Bandingkan</span>
            <span className="text-[10px] text-stone-400 font-mono">{totalCompare} / 4 Produk</span>
          </div>
        </div>

        {/* Product Thumbnails */}
        <div className="flex items-center gap-2">
          {compareProducts.map(product => (
            <div key={product!.id} className="relative group flex-shrink-0">
              <img
                src={product!.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=150&auto=format&fit=crop'}
                alt={product!.productName}
                className="w-10 h-10 rounded-xl object-cover border border-stone-600 bg-stone-800"
              />
              <button
                onClick={() => removeFromCompare(product!.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md"
                title="Hapus dari perbandingan"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={clearCompare}
          className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-xl text-xs transition-colors"
          title="Kosongkan Semua"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <Link
          href="/compare"
          className="px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
        >
          <span>Bandingkan Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
