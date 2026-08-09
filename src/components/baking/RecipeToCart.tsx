'use client';

import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface RecipeIngredientItem {
  id: string;
  name: string;
  quantity: string;
  product?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    weight: string;
  } | null;
}

interface RecipeToCartProps {
  recipeTitle: string;
  ingredients: RecipeIngredientItem[];
}

export default function RecipeToCart({ recipeTitle, ingredients }: RecipeToCartProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    ingredients.map((item) => item.id)
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    return ingredients
      .filter((item) => selectedIds.includes(item.id) && item.product)
      .reduce((sum, item) => sum + (item.product?.price || 0), 0);
  };

  const handleAddAllToCart = () => {
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-[#EAE3D2] rounded-3xl p-6 shadow-soft space-y-6">
      <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#C86D51]">
            Fitur Cerdas FBS Bakery
          </span>
          <h3 className="font-heading font-extrabold text-xl text-[#1E293B]">
            Recipe-to-Cart 1-Klik
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5 font-light">
            Pilih bahan yang anda perlukan untuk resep <strong>{recipeTitle}</strong> dan masukkan terus ke keranjang.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#FDFBF7] px-3 py-1.5 rounded-full border border-[#EAE3D2]">
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          <span className="text-xs font-bold text-[#1E293B]">Padanan Bahan Otomatis</span>
        </div>
      </div>

      <div className="space-y-3">
        {ingredients.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const hasProduct = Boolean(item.product);

          return (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isSelected
                  ? 'border-[#C86D51] bg-[#FDFBF7] shadow-sm'
                  : 'border-[#EAE3D2] bg-white opacity-70'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-[#C86D51] focus:ring-[#C86D51]"
                />
                <div>
                  <h4 className="font-bold text-xs text-[#1E293B]">{item.name}</h4>
                  <span className="text-[11px] text-[#64748B]">Kuantiti resep: {item.quantity}</span>
                </div>
              </div>

              {hasProduct ? (
                <div className="text-right">
                  <span className="text-xs font-bold text-[#1E293B] block">
                    RM {item.product?.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Tersedia di Toko ({item.product?.weight})
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Gunakan Stok Rumah
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#F5EFE6] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#64748B]">Anggaran Jumlah Bahan Terpilih:</span>
          <h4 className="font-heading font-black text-2xl text-[#1E293B]">
            RM {calculateTotal().toFixed(2)}
          </h4>
        </div>

        <button
          onClick={handleAddAllToCart}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 rounded-2xl text-xs shadow-md transition-all ${
            addedSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-[#C86D51] hover:bg-[#B55C41] text-white shadow-lg'
          }`}
        >
          {addedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Semua Bahan Berjaya Ditambah!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Tambah Semua Bahan Terpilih Ke Keranjang</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
