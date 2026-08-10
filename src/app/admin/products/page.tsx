'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, saveToStorage } from '@/lib/db';
import { formatMYR } from '@/lib/currency';
import { useLanguage } from '@/lib/language-context';
import { Product } from '@/types';
import { exportProductsToCSV, parseCSVProductData, ImportReport } from '@/lib/excel';
import { recordAuditLog } from '@/lib/audit';
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

      recordAuditLog('Import Produk Excel', 'PRODUCT', `Imported ${report.importedCount} products via CSV/Excel.`);

      setProducts(db.getProducts());
      setImportReport(report);
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    let isMounted = true;

    const loadLiveData = async () => {
      setProducts(db.getProducts());

      try {
        const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          saveToStorage('fbs_products', data.products);
        }
      } catch (err) {
        console.warn('[Admin Products Fetch Warning]', err);
      }
    };

    loadLiveData();

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, []);

  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  const filtered = products.filter(p => {
    const matchesSearch = (p.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === 'ALL') return true;
    const statusInfo = db.getProductStockStatus(p);
    return statusInfo.status === stockFilter;
  });

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (deleteId) {
      const target = products.find(p => p.id === deleteId || p.slug === deleteId);
      const targetId = target?.id || deleteId;
      const targetSlug = target?.slug || deleteId;

      db.deleteProduct(targetId);

      try {
        await fetch(`/api/products?id=${encodeURIComponent(targetId)}&slug=${encodeURIComponent(targetSlug)}`, {
          method: 'DELETE',
        });
      } catch (apiErr) {
        console.warn('[Admin Delete Product API Warning]', apiErr);
      }

      recordAuditLog('Hapus Produk', 'PRODUCT', `Product ${target?.productName || deleteId} (${target?.sku || ''}) was deleted.`);
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
              accept=".csv, text/csv"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* SHARE ANALYTICS STATS CARD */}
      {(() => {
        const shareStats = db.getShareAnalytics();
        return (
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-[#800020] text-white p-5 rounded-3xl shadow-md border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4AF37] border border-white/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base">Product Share Analytics</h3>
                <p className="text-xs text-stone-300">Total Pembagian Link &amp; QR Code Produk oleh Pelanggan</p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-stone-400 block font-bold">TOTAL SHARE</span>
                <span className="font-serif font-extrabold text-base text-[#D4AF37]">{shareStats.total}</span>
              </div>
              <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] text-emerald-300 block font-bold">WHATSAPP</span>
                <span className="font-serif font-extrabold text-base text-emerald-400">{shareStats.whatsapp}</span>
              </div>
              <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30">
                <span className="text-[10px] text-blue-300 block font-bold">FACEBOOK</span>
                <span className="font-serif font-extrabold text-base text-blue-400">{shareStats.facebook}</span>
              </div>
              <div className="bg-sky-500/20 p-2.5 rounded-xl border border-sky-500/30">
                <span className="text-[10px] text-sky-300 block font-bold">TELEGRAM</span>
                <span className="font-serif font-extrabold text-base text-sky-400">{shareStats.telegram}</span>
              </div>
              <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30">
                <span className="text-[10px] text-amber-300 block font-bold">COPY LINK</span>
                <span className="font-serif font-extrabold text-base text-amber-400">{shareStats.copyLink}</span>
              </div>
              <div className="bg-purple-500/20 p-2.5 rounded-xl border border-purple-500/30">
                <span className="text-[10px] text-purple-300 block font-bold">QR CODE</span>
                <span className="font-serif font-extrabold text-base text-purple-400">{shareStats.qrCode}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Search & Inventory Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
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

        {/* Inventory Stock Status Filters */}
        {(() => {
          const invSummary = db.getInventoryAlertSummary();
          return (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold self-start md:self-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setStockFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  stockFilter === 'ALL' ? 'bg-[#800020] text-white shadow' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({invSummary.totalProducts})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('IN_STOCK')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  stockFilter === 'IN_STOCK' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> In Stock ({invSummary.inStockCount})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('LOW_STOCK')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  stockFilter === 'LOW_STOCK' ? 'bg-amber-500 text-stone-950 shadow' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Low Stock ({invSummary.lowStockCount})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('OUT_OF_STOCK')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  stockFilter === 'OUT_OF_STOCK' ? 'bg-red-600 text-white shadow' : 'text-red-700 hover:bg-red-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" /> Out Of Stock ({invSummary.outOfStockCount})
              </button>
            </div>
          );
        })()}
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
                <th className="p-4">Variants &amp; Pricing</th>
                <th className="p-4">Status &amp; Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(p => {
                const stockStatus = db.getProductStockStatus(p);
                return (
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
                        {(p.variants || []).map(v => (
                          <div key={v.id} className="text-[11px] text-stone-700">
                            <span className="font-semibold">{v.variantName}:</span> <strong className="text-[#800020]">{formatMYR(v.price)}</strong> (Stock: {v.stock})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        {/* Colored Inventory Status Badge */}
                        <span className={`px-2.5 py-0.5 ${stockStatus.badgeBg} ${stockStatus.badgeText} text-[10px] font-black rounded-md shadow-sm uppercase flex items-center gap-1`}>
                          {stockStatus.status === 'IN_STOCK' && '🟢 IN STOCK'}
                          {stockStatus.status === 'LOW_STOCK' && '🟡 LOW STOCK'}
                          {stockStatus.status === 'OUT_OF_STOCK' && '🔴 OUT OF STOCK'}
                          <span className="font-mono text-[9px]">({stockStatus.totalStock} units)</span>
                        </span>

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
                );
              })}
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
