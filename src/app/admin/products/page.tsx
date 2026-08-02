'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatMYR } from '@/lib/currency';
import { useLanguage } from '@/lib/language-context';
import { Product } from '@/types';
import { exportProductsToCSV, parseCSVProductData, ImportReport } from '@/lib/excel';
import { Plus, Search, Edit, Trash2, ShieldCheck, Sparkles, Star, Download, Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

export default function AdminProductsPage() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const { importedProducts, report } = parseCSVProductData(text);

      importedProducts.forEach(p => {
        db.saveProduct(p);
      });

      setProducts(db.getProducts());
      setImportReport(report);
      e.target.value = '';
    };

    reader.readAsText(file);
  };

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
    setDeleteId(id);
  };

  const executeDelete = () => {
    if (deleteId) {
      db.deleteProduct(deleteId);
      setProducts(db.getProducts());
      setDeleteId(null);
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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportProductsToCSV(products)}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
            title="Export Products to Excel / CSV"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          
          <label className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-all">
            <Upload className="w-4 h-4" /> Import Excel
            <input 
              type="file" 
              accept=".csv, .xlsx, text/csv"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
        </div>
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

      <ConfirmModal
        isOpen={deleteId !== null}
        title={language === 'ID' ? 'Konfirmasi Hapus Produk' : language === 'MS' ? 'Sahkan Padam Produk' : 'Confirm Delete Product'}
        message={language === 'ID' ? 'Apakah Anda yakin ingin menghapus produk ini dari katalog? Tindakan ini tidak dapat dibatalkan.' : language === 'MS' ? 'Adakah anda pasti mahu memadam produk ini dari katalog? Tindakan ini tidak boleh dibatalkan.' : 'Are you sure you want to delete this product? This action cannot be undone.'}
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Import Report Result Modal */}
      {importReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#800020]" />
                <h3 className="font-serif font-bold text-lg text-stone-900">Laporan Hasil Import Excel</h3>
              </div>
              <button onClick={() => setImportReport(null)} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Baris</span>
                <span className="font-serif font-bold text-lg text-stone-900">{importReport.totalProcessed}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Berjaya</span>
                <span className="font-serif font-bold text-lg text-emerald-700">{importReport.importedCount}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="text-[10px] text-rose-800 font-bold uppercase block">Diabaikan</span>
                <span className="font-serif font-bold text-lg text-rose-700">{importReport.skippedCount}</span>
              </div>
            </div>

            {importReport.errors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 block">Catatan Validasi Data:</span>
                <div className="max-h-36 overflow-y-auto p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-[11px] text-rose-800 font-medium">
                  {importReport.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setImportReport(null)}
              className="w-full py-3 bg-[#800020] text-white font-bold text-xs rounded-xl shadow hover:bg-[#6F1D1B] transition-colors"
            >
              Tutup & Lihat Katalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
