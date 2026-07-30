'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatMYR } from '@/lib/currency';
import { useLanguage } from '@/lib/language-context';
import { Product } from '@/types';
import { Plus, Search, Edit, Trash2, ShieldCheck, Sparkles, Star } from 'lucide-react';

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadLiveData = () => {
      setProducts(db.getProducts());
    };
    loadLiveData();

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, []);

  const filtered = products.filter(p => 
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      db.deleteProduct(id);
      setProducts(db.getProducts());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Product Management</h1>
          <p className="text-xs text-stone-500 mt-0.5">Manage baking supplies, weight variants, prices, and inventory stock.</p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <input 
            type="text"
            placeholder="Search by product name, SKU, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase tracking-wider font-bold">
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Variants & Pricing</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.mainImage} alt={p.productName} className="w-12 h-12 object-cover rounded-xl border border-stone-200" />
                      <div>
                        <span className="font-serif font-bold text-sm text-stone-900 block">{p.productName}</span>
                        <span className="text-[11px] text-stone-400">Brand: {p.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#800020]">{p.sku}</td>
                  <td className="p-4 text-stone-700">{p.categoryName}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {p.variants.map(v => (
                        <div key={v.id} className="text-[11px] text-stone-700">
                          <span className="font-semibold">{v.variantName}:</span> <strong className="text-[#800020]">{formatMYR(v.price)}</strong> (Stock: {v.stock})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      {p.isHalal && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> HALAL
                        </span>
                      )}
                      {p.isBestSeller && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> BEST SELLER
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/new?edit=${p.id}`}
                        className="p-2 text-stone-600 hover:text-[#800020] rounded-lg hover:bg-stone-100"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
