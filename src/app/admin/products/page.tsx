'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db, saveToStorage } from '@/lib/db';
import { formatMYR } from '@/lib/currency';
import { useLanguage } from '@/lib/language-context';
import { Product } from '@/types';
import { exportProductsToCSV, parseCSVProductData, ImportReport } from '@/lib/excel';
import { recordAuditLog } from '@/lib/audit';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Package,
  Layers,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Eye
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

export default function AdminProductsPage() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_HIGH' | 'PRICE_LOW' | 'STOCK_LOW' | 'NAME_AZ'>('NEWEST');

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

      const updated = db.getProducts();
      setProducts(updated);
      setImportReport(report);
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    let isMounted = true;

    const loadLiveData = async () => {
      const localProds = db.getProducts();
      setProducts(localProds);
      setIsLoading(false);

      try {
        const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          saveToStorage('fbs_products', data.products);
        }
      } catch (err) {
        console.warn('[Admin Products Fetch Warning]', err);
      } finally {
        if (isMounted) setIsLoading(false);
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

  // Filter & Sort Engine
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.categoryName) cats.add(p.categoryName);
    });
    return Array.from(cats);
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = (p.productName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter !== 'ALL' && p.categoryName !== categoryFilter) {
        return false;
      }

      if (stockFilter === 'ALL') return true;
      const statusInfo = db.getProductStockStatus(p);
      return statusInfo.status === stockFilter;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'PRICE_HIGH') {
        const priceA = a.variants?.[0]?.price || 0;
        const priceB = b.variants?.[0]?.price || 0;
        return priceB - priceA;
      }
      if (sortBy === 'PRICE_LOW') {
        const priceA = a.variants?.[0]?.price || 0;
        const priceB = b.variants?.[0]?.price || 0;
        return priceA - priceB;
      }
      if (sortBy === 'STOCK_LOW') {
        const stockA = db.getProductStockStatus(a).totalStock;
        const stockB = db.getProductStockStatus(b).totalStock;
        return stockA - stockB;
      }
      if (sortBy === 'NAME_AZ') {
        return (a.productName || '').localeCompare(b.productName || '');
      }
      return 0;
    });
  }, [products, search, stockFilter, categoryFilter, sortBy]);

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

  const invSummary = useMemo(() => db.getInventoryAlertSummary(), [products]);
  const shareStats = useMemo(() => db.getShareAnalytics(), [products]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-stone-900 font-sans pb-12">
      
      {/* REFINED OPERATIONAL PAGE HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#800020] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#800020] inline-block" />
            FBS BAKERY WORLD • CATALOG OPERATIONS
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Manajemen Produk
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Kelola katalog bahan baking, varian berat, penetapan harga, dan status persediaan stok.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportProductsToCSV(products)}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition-colors flex items-center gap-1.5"
            title="Export Produk ke Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Export Excel
          </button>
          
          <label className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-amber-700" />
            Import Excel
            <input 
              type="file" 
              accept=".csv, text/csv"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Tambah Produk
          </Link>
        </div>
      </div>

      {/* SHARE ANALYTICS STRIP (COMPACT HIGH-DENSITY BANNER) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-xs font-bold text-stone-900 block">
              Analitik Pembagian Produk Pelanggan
            </strong>
            <span className="text-[11px] text-stone-500 block">
              Total pembagian link katalog &amp; QR Code produk oleh pelanggan.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
            <span className="text-[9px] text-stone-500 font-bold block uppercase">TOTAL SHARE</span>
            <strong className="font-mono text-sm text-[#800020]">{shareStats.total}</strong>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            <span className="text-[9px] text-emerald-800 font-bold block uppercase">WHATSAPP</span>
            <strong className="font-mono text-sm text-emerald-700">{shareStats.whatsapp}</strong>
          </div>
          <div className="bg-blue-50 p-2 rounded-xl border border-blue-200">
            <span className="text-[9px] text-blue-800 font-bold block uppercase">FACEBOOK</span>
            <strong className="font-mono text-sm text-blue-700">{shareStats.facebook}</strong>
          </div>
          <div className="bg-sky-50 p-2 rounded-xl border border-sky-200">
            <span className="text-[9px] text-sky-800 font-bold block uppercase">TELEGRAM</span>
            <strong className="font-mono text-sm text-sky-700">{shareStats.telegram}</strong>
          </div>
          <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
            <span className="text-[9px] text-amber-800 font-bold block uppercase">COPY LINK</span>
            <strong className="font-mono text-sm text-amber-700">{shareStats.copyLink}</strong>
          </div>
          <div className="bg-purple-50 p-2 rounded-xl border border-purple-200">
            <span className="text-[9px] text-purple-800 font-bold block uppercase">QR CODE</span>
            <strong className="font-mono text-sm text-purple-700">{shareStats.qrCode}</strong>
          </div>
        </div>
      </div>

      {/* CONTROL TOOLBAR: SEARCH, CATEGORY, STOCK FILTER & SORTING */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="Cari berdasarkan nama produk, SKU, atau brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 bg-white font-medium focus:outline-none focus:border-[#800020]"
            >
              <option value="ALL">Semua Kategori</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 bg-white font-medium focus:outline-none focus:border-[#800020]"
            >
              <option value="NEWEST">Terbaru</option>
              <option value="PRICE_HIGH">Harga: Tertinggi</option>
              <option value="PRICE_LOW">Harga: Terendah</option>
              <option value="STOCK_LOW">Stok: Terendah</option>
              <option value="NAME_AZ">Nama: A - Z</option>
            </select>
          </div>
        </div>

        {/* Stock Status Filter Bar */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setStockFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              stockFilter === 'ALL' ? 'bg-[#800020] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua Produk ({invSummary.totalProducts})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('IN_STOCK')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              stockFilter === 'IN_STOCK' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            In Stock ({invSummary.inStockCount})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              stockFilter === 'LOW_STOCK' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Low Stock ({invSummary.lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              stockFilter === 'OUT_OF_STOCK' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Out Of Stock ({invSummary.outOfStockCount})
          </button>
        </div>

      </div>

      {/* PRODUCT OPERATIONS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Counter Bar */}
        <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span className="font-medium">
            Menampilkan <strong className="text-stone-900">{filteredAndSortedProducts.length}</strong> dari <strong className="text-stone-900">{products.length}</strong> produk
          </span>
          {(search || stockFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setStockFilter('ALL'); setCategoryFilter('ALL'); }}
              className="text-[#800020] font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Memuat Katalog Produk...</p>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-800">Produk Tidak Ditemukan</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Tidak ada produk yang cocok dengan pencarian kata kunci atau filter status saat ini.
            </p>
            <button
              onClick={() => { setSearch(''); setStockFilter('ALL'); setCategoryFilter('ALL'); }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl border border-stone-300 transition-colors"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-3.5">Produk</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Varian &amp; Harga</th>
                  <th className="p-3.5">Status &amp; Persediaan</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredAndSortedProducts.map(p => {
                  const stockStatus = db.getProductStockStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      
                      {/* Product Thumbnail & Title */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.mainImage} 
                            alt={p.productName} 
                            className="w-11 h-11 object-cover rounded-lg border border-stone-200 flex-shrink-0 bg-stone-50" 
                          />
                          <div className="max-w-[200px]">
                            <span className="font-bold text-stone-900 text-xs block truncate" title={p.productName}>
                              {p.productName}
                            </span>
                            <span className="text-[10px] text-stone-400 block truncate">
                              Brand: {p.brand || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-3.5 font-mono font-bold text-[#800020]">
                        {p.sku || '-'}
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md text-[11px] font-medium border border-stone-200">
                          {p.categoryName || '-'}
                        </span>
                      </td>

                      {/* Variants & Pricing */}
                      <td className="p-3.5">
                        <div className="space-y-1 max-w-[220px]">
                          {(p.variants || []).map(v => (
                            <div key={v.id} className="text-[11px] flex items-center justify-between gap-2 border-b border-dashed border-stone-100 pb-0.5 last:border-none">
                              <span className="font-medium text-stone-700 truncate max-w-[100px]">{v.variantName}:</span>
                              <div className="text-right whitespace-nowrap">
                                <strong className="text-[#800020] font-mono">{formatMYR(v.price)}</strong>
                                <span className="text-[10px] text-stone-400 ml-1.5">(Stok: {v.stock})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Status & Badges */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2.5 py-0.5 ${stockStatus.badgeBg} ${stockStatus.badgeText} text-[10px] font-bold rounded uppercase flex items-center gap-1`}>
                            {stockStatus.status === 'IN_STOCK' && '🟢 IN STOCK'}
                            {stockStatus.status === 'LOW_STOCK' && '🟡 LOW STOCK'}
                            {stockStatus.status === 'OUT_OF_STOCK' && '🔴 OUT OF STOCK'}
                            <span className="font-mono text-[9px]">({stockStatus.totalStock} unit)</span>
                          </span>

                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {p.isHalal && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> HALAL
                              </span>
                            )}
                            {p.isBestSeller && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-bold rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-600" /> BEST SELLER
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Lihat Tampilan Customer"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/new?edit=${p.id}`}
                            className="p-1.5 text-stone-700 hover:text-[#800020] hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Produk"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Produk"
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
        )}
      </div>

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title={language === 'ID' ? 'Konfirmasi Hapus Produk' : language === 'MS' ? 'Sahkan Padam Produk' : 'Confirm Delete Product'}
        message={language === 'ID' ? 'Apakah Anda yakin ingin menghapus produk ini dari katalog? Tindakan ini tidak dapat dibatalkan.' : language === 'MS' ? 'Adakah anda pasti mahu memadam produk ini dari katalog? Tindakan ini tidak boleh dibatalkan.' : 'Are you sure you want to delete this product? This action cannot be undone.'}
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Import Report Result Modal */}
      {importReport && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#800020]" />
                <h3 className="font-serif font-bold text-base text-stone-900">Laporan hasil Import Excel</h3>
              </div>
              <button onClick={() => setImportReport(null)} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Total Baris</span>
                <span className="font-serif font-bold text-base text-stone-900">{importReport.totalProcessed}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Berjaya</span>
                <span className="font-serif font-bold text-base text-emerald-700">{importReport.importedCount}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] text-rose-800 font-bold uppercase block">Diabaikan</span>
                <span className="font-serif font-bold text-base text-rose-700">{importReport.skippedCount}</span>
              </div>
            </div>

            {importReport.errors.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-stone-700 block">Catatan Validasi Data:</span>
                <div className="max-h-32 overflow-y-auto p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-[11px] text-rose-800 font-medium">
                  {importReport.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setImportReport(null)}
              className="w-full py-2.5 bg-[#800020] text-white font-bold text-xs rounded-xl shadow hover:bg-[#6F1D1B] transition-colors"
            >
              Tutup &amp; Lihat Katalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
