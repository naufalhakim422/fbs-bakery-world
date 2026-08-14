'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatMYR } from '@/lib/currency';
import { useLanguage } from '@/lib/language-context';
import { cleanPhoneNumber } from '@/lib/whatsapp';
import { 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Plus,
  Layers,
  ChefHat,
  BookOpen,
  Tag,
  Settings,
  Sparkles,
  Calendar,
  X,
  BarChart3,
  MessageCircle,
  Wallet,
  Filter
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

export default function AdminDashboardPage() {
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState(db.getOrders());
  const [products, setProducts] = useState(db.getProducts());
  const [customers, setCustomers] = useState(db.getCustomers());
  const [categories, setCategories] = useState(db.getCategories());
  const [recipes, setRecipes] = useState(db.getRecipes());

  // Timeframe Filter State: '7D' | '30D' | '1Y' | 'CUSTOM'
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '1Y' | 'CUSTOM'>('7D');
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [selectedModalPoint, setSelectedModalPoint] = useState<{
    label: string;
    dateStr?: string;
    omset: number;
    ordersCount: number;
    ordersList: typeof orders;
  } | null>(null);

  // Cashflow State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const loadLiveData = async () => {
      // Fetch products from PostgreSQL API first, fallback to localStorage
      try {
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        if (prodData.success && Array.isArray(prodData.products)) {
          setProducts(prodData.products);
        } else {
          setProducts(db.getProducts());
        }
      } catch (e) {
        setProducts(db.getProducts());
      }

      // Fetch customers from PostgreSQL API first, fallback to localStorage
      try {
        const custRes = await fetch('/api/customers');
        const custData = await custRes.json();
        if (custData.success && Array.isArray(custData.customers)) {
          setCustomers(custData.customers);
        } else {
          setCustomers(db.getCustomers());
        }
      } catch (e) {
        setCustomers(db.getCustomers());
      }

      setCategories(db.getCategories());
      setRecipes(db.getRecipes());

      // Fetch orders from PostgreSQL API
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders(db.getOrders());
        }
      } catch (e) {
        setOrders(db.getOrders());
      }

      // Load cashflow expenses from localStorage
      try {
        const saved = localStorage.getItem('fbs_cashflow_expenses');
        if (saved && saved !== '[]') {
          setExpenses(JSON.parse(saved));
        } else {
          setExpenses([]);
        }
      } catch (e) {
        setExpenses([]);
      }
    };
    loadLiveData();

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, []);

  const executeDeleteExpense = () => {
    if (pendingDeleteId) {
      const updated = expenses.filter(e => e.id !== pendingDeleteId);
      setExpenses(updated);
      localStorage.setItem('fbs_cashflow_expenses', JSON.stringify(updated));
      setPendingDeleteId(null);
    }
  };

  // Cashflow Totals & Dashboard Statistics
  const totalInflow = useMemo(() => orders.reduce((acc, o) => acc + o.totalAmount, 0), [orders]);
  const totalOutflow = useMemo(() => expenses.reduce((acc, e) => acc + e.amount, 0), [expenses]);
  const netCashflow = useMemo(() => totalInflow - totalOutflow, [totalInflow, totalOutflow]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const revenueToday = useMemo(() => {
    return orders
      .filter(o => o.createdAt && (typeof o.createdAt === 'string' ? o.createdAt : String(o.createdAt || '')).startsWith(todayStr))
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders, todayStr]);

  const revenueThisMonth = useMemo(() => {
    return orders
      .filter(o => o.createdAt && (typeof o.createdAt === 'string' ? o.createdAt : String(o.createdAt || '')).startsWith(currentMonthStr))
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders, currentMonthStr]);

  const bestSellingProduct = useMemo(() => {
    if (products.length === 0) return null;
    return [...products].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))[0] || null;
  }, [products]);

  const lowStockProductsList = useMemo(() => {
    return products.filter(p => p.variants && p.variants.some(v => v.stock <= 5));
  }, [products]);

  const totalSalesEstimate = totalInflow;
  const pendingOrders = useMemo(() => orders.filter(o => o.orderStatus === 'NEW' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PENDING_PAYMENT' || o.orderStatus === 'PAYMENT_VERIFIED' || (o.orderStatus || '').toUpperCase() === 'PENDING' || (o.orderStatus || '').toUpperCase() === 'WAITINGPAYMENT'), [orders]);

  // Dynamic Time-Range Chart Calculation Engine
  const getChartData = () => {
    const now = new Date();
    
    if (timeRange === '7D') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
        
        const matchingOrders = orders.filter(o => o.createdAt && (typeof o.createdAt === 'string' ? o.createdAt : String(o.createdAt || '')).startsWith(dateStr));
        const realOmset = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        days.push({
          label: dayLabel,
          dateStr,
          omset: realOmset,
          ordersCount: matchingOrders.length,
          ordersList: matchingOrders,
          active: i === 0,
        });
      }
      return days;
    }

    if (timeRange === '30D') {
      const periods = [];
      for (let i = 5; i >= 0; i--) {
        const dEnd = new Date(now);
        dEnd.setDate(now.getDate() - i * 5);
        const dStart = new Date(dEnd);
        dStart.setDate(dEnd.getDate() - 4);
        
        const periodLabel = `${dStart.getDate()} - ${dEnd.getDate()} ${dEnd.toLocaleDateString('id-ID', { month: 'short' })}`;
        
        const matchingOrders = orders.filter(o => {
          if (!o.createdAt) return false;
          const oDate = new Date(o.createdAt);
          return oDate >= dStart && oDate <= dEnd;
        });
        
        const realOmset = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        periods.push({
          label: periodLabel,
          dateStr: periodLabel,
          omset: realOmset,
          ordersCount: matchingOrders.length,
          ordersList: matchingOrders,
          active: i === 0,
        });
      }
      return periods;
    }

    if (timeRange === '1Y') {
      const months = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mLabel = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        const yearMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        const matchingOrders = orders.filter(o => o.createdAt && (typeof o.createdAt === 'string' ? o.createdAt : String(o.createdAt || '')).startsWith(yearMonthStr));
        const realOmset = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        months.push({
          label: monthNames[d.getMonth()],
          dateStr: mLabel,
          omset: realOmset,
          ordersCount: matchingOrders.length,
          ordersList: matchingOrders,
          active: i === 0,
        });
      }
      return months;
    }

    // CUSTOM Date Range
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    const diffDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 3600 * 24)));
    const step = Math.max(1, Math.floor(diffDays / 6));

    const customPoints = [];
    for (let i = 0; i < 6; i++) {
      const curStart = new Date(startD.getTime() + i * step * 24 * 3600 * 1000);
      const curEnd = new Date(curStart.getTime() + step * 24 * 3600 * 1000);
      if (curStart > endD) break;

      const pLabel = `${curStart.getDate()}/${curStart.getMonth() + 1}`;
      const matchingOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        const oDate = new Date(o.createdAt);
        return oDate >= curStart && oDate <= curEnd;
      });

      const realOmset = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      customPoints.push({
        label: pLabel,
        dateStr: `${curStart.toISOString().split('T')[0]} - ${curEnd.toISOString().split('T')[0]}`,
        omset: realOmset,
        ordersCount: matchingOrders.length,
        ordersList: matchingOrders,
        active: i === 5,
      });
    }
    return customPoints;
  };

  const chartPoints = getChartData();
  const maxOmsetVal = Math.max(...chartPoints.map(p => p.omset), 1);
  const totalOmsetFiltered = chartPoints.reduce((sum, p) => sum + p.omset, 0);
  const totalOrdersFiltered = chartPoints.reduce((sum, p) => sum + p.ordersCount, 0);

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto text-stone-900 font-sans">
      
      {/* REFINED OPERATIONAL PAGE HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#800020] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#800020] inline-block" />
            FBS BAKERY WORLD • OPERATIONAL CMS
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Dashboard Operasional
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Ringkasan transaksi real-time, performa penjualan, persediaan bahan baku, dan pesanan WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Tambah Produk
          </Link>
          <Link
            href="/admin/recipes"
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition-colors flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4 text-[#800020]" />
            Kelola Resep
          </Link>
          <Link
            href="/admin/cashflow"
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition-colors flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-emerald-700" />
            Kas & Biaya
          </Link>
        </div>
      </div>

      {/* COMPACT HIGH-DENSITY OPERATIONAL METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <Link 
          href="/admin/orders"
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-[#800020]/40 transition-all flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Pendapatan
            </span>
            <div className="p-2 rounded-xl bg-stone-100 text-[#800020] group-hover:bg-[#800020] group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-extrabold text-[#800020]">
              {formatMYR(totalSalesEstimate)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1 pt-2 border-t border-stone-100">
              <span>Hari ini: <strong className="text-stone-900">{formatMYR(revenueToday)}</strong></span>
              <span>Bulan ini: <strong className="text-stone-900">{formatMYR(revenueThisMonth)}</strong></span>
            </div>
          </div>
        </Link>

        {/* Metric 2: Total Orders */}
        <Link 
          href="/admin/orders"
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Pesanan
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-extrabold text-stone-900">
              {orders.length} <span className="text-xs font-normal text-stone-500">Transaksi</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-amber-700 font-bold mt-1 pt-2 border-t border-stone-100">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {pendingOrders.length} Pesanan Perlu Tindakan
              </span>
              <span>Lihat &rarr;</span>
            </div>
          </div>
        </Link>

        {/* Metric 3: Total Products */}
        <Link 
          href="/admin/products"
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Katalog Produk
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-extrabold text-stone-900">
              {products.length} <span className="text-xs font-normal text-stone-500">Bahan Baking</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1 pt-2 border-t border-stone-100">
              <span className="text-stone-600">{categories.length} Kategori Halal</span>
              {lowStockProductsList.length > 0 ? (
                <span className="text-rose-600 font-bold">⚠️ {lowStockProductsList.length} Stok Rendah</span>
              ) : (
                <span className="text-emerald-600 font-bold">✓ Stok Aman</span>
              )}
            </div>
          </div>
        </Link>

        {/* Metric 4: Total Customers */}
        <Link 
          href="/admin/customers"
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Pelanggan Terdaftar
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-extrabold text-stone-900">
              {customers.length} <span className="text-xs font-normal text-stone-500">Baker / Pembeli</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-blue-600 font-bold mt-1 pt-2 border-t border-stone-100">
              <span>Database CRM</span>
              <span>Kelola &rarr;</span>
            </div>
          </div>
        </Link>

      </div>

      {/* NOTIFICATION BANNERS */}
      {(() => {
        const summary = db.getInventoryAlertSummary();
        const attentionCount = summary.lowStockCount + summary.outOfStockCount;
        if (attentionCount === 0) return null;
        return (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-rose-950 uppercase tracking-wider block font-bold">
                  Pemberitahuan Stok Bahan Baking ({attentionCount} Produk Membutuhkan Perhatian)
                </strong>
                <span className="text-rose-800 text-[11px] mt-0.5 block">
                  Terdapat {summary.outOfStockCount} produk Habis dan {summary.lowStockCount} produk Stok Rendah (&le; {db.getStockThreshold()} unit).
                </span>
              </div>
            </div>
            <Link 
              href="/admin/products" 
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap"
            >
              Restock Sekarang &rarr;
            </Link>
          </div>
        );
      })()}

      {pendingOrders.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-amber-950 uppercase tracking-wider block font-bold">
                Perhatian: {pendingOrders.length} Pesanan Baru Membutuhkan Konfirmasi Resi
              </strong>
              <span className="text-amber-800 text-[11px] mt-0.5 block">
                Pesanan WhatsApp dari pelanggan perlu diverifikasi dan dimasukkan nomor resi kurir pengiriman.
              </span>
            </div>
          </div>
          <Link 
            href="/admin/orders" 
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            Proses Pesanan &rarr;
          </Link>
        </div>
      )}

      {/* DYNAMIC SALES TREND ANALYTICS & TIMEFRAME FILTER */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        
        {/* Header & Timeframe Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-stone-100 text-[#800020]">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Grafik Performa Penjualan
              </h3>
            </div>
            <p className="text-stone-500 text-xs mt-0.5">
              Tren pendapatan dan volume transaksi berdasarkan periode waktu pilihan.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTimeRange('7D')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === '7D' ? 'bg-[#800020] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30D')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === '30D' ? 'bg-[#800020] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              30 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('1Y')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === '1Y' ? 'bg-[#800020] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              1 Tahun
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('CUSTOM')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                timeRange === 'CUSTOM' ? 'bg-[#800020] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Custom
            </button>
          </div>
        </div>

        {/* CUSTOM DATE RANGE PICKER */}
        {timeRange === 'CUSTOM' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-900">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-amber-300 rounded-lg text-stone-900 bg-white font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-900">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-amber-300 rounded-lg text-stone-900 bg-white font-mono"
              />
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              Data grafik otomatis diperbarui.
            </span>
          </div>
        )}

        {/* HIGH-DENSITY SVG CHART CANVAS */}
        <div className="relative pt-4 pb-2">
          
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-dashed border-stone-400 w-full" />
            <div className="border-b border-dashed border-stone-400 w-full" />
            <div className="border-b border-dashed border-stone-400 w-full" />
          </div>

          <div className="relative h-60 w-full flex items-end justify-between px-2 pt-6">
            
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 200">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#800020" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#800020" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {(() => {
                if (chartPoints.length === 0) return null;
                const padding = 20;
                const width = 500;
                const height = 200;
                const usableW = width - padding * 2;
                const usableH = height - padding * 2;
                const points = chartPoints.map((pt, i) => {
                  const x = padding + (i / Math.max(1, chartPoints.length - 1)) * usableW;
                  const y = padding + usableH - (pt.omset / Math.max(maxOmsetVal, 1)) * usableH;
                  return { x, y };
                });
                const lineD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
                const areaD = `${lineD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
                return (
                  <>
                    <path d={areaD} fill="url(#chartGradient)" />
                    <path d={lineD} fill="none" stroke="#800020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                );
              })()}
            </svg>

            {chartPoints.map((pt, pIdx) => {
              const heightPercent = Math.max(15, Math.min(100, Math.round((pt.omset / maxOmsetVal) * 100)));
              return (
                <div 
                  key={pIdx} 
                  onClick={() => setSelectedModalPoint(pt)}
                  className="flex-1 flex flex-col items-center justify-end relative group h-full z-10 cursor-pointer"
                >
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-stone-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap z-30 flex flex-col items-center">
                    <span className="font-bold text-amber-300">{formatMYR(pt.omset)}</span>
                    <span className="text-[9px] text-stone-300">{pt.ordersCount} Transaksi</span>
                  </div>

                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow transition-transform group-hover:scale-125 mb-1 z-20 ${
                    pt.active ? 'bg-[#800020] ring-2 ring-[#800020]/30' : 'bg-amber-500 group-hover:bg-[#800020]'
                  }`} />

                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-3 sm:w-5 rounded-t-lg transition-all duration-300 ${
                      pt.active 
                        ? 'bg-[#800020]' 
                        : 'bg-stone-200 group-hover:bg-[#800020]/40'
                    }`} 
                  />

                  <span className={`text-[10px] font-bold mt-2 truncate max-w-[50px] text-center ${
                    pt.active ? 'text-[#800020]' : 'text-stone-500 group-hover:text-stone-900'
                  }`}>
                    {pt.label}
                  </span>
                </div>
              );
            })}

          </div>
        </div>

        {/* SUMMARY BAR */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-100 text-center text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 font-bold uppercase block">Total Omset Filtered</span>
            <strong className="text-[#800020] font-serif font-extrabold text-sm sm:text-base">
              {formatMYR(totalOmsetFiltered)}
            </strong>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 font-bold uppercase block">Total Transaksi</span>
            <strong className="text-emerald-700 font-serif font-extrabold text-sm sm:text-base">
              {totalOrdersFiltered} Order
            </strong>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 font-bold uppercase block">Rata-rata Transaksi</span>
            <strong className="text-amber-800 font-serif font-extrabold text-sm sm:text-base">
              {formatMYR(totalOrdersFiltered > 0 ? totalOmsetFiltered / totalOrdersFiltered : 0)}
            </strong>
          </div>
        </div>
      </div>

      {/* OPERATIONAL WORKBENCH GRID: RECENT ORDERS (60%) + INVENTORY & CATEGORY SUMMARY (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RECENT CUSTOMER ORDERS WORKBENCH TABLE (COL-SPAN-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Pesanan WhatsApp Terbaru</h3>
              <p className="text-stone-500 text-xs">Transaksi terbaru yang membutuhkan pemrosesan resi kurir.</p>
            </div>
            <Link 
              href="/admin/orders" 
              className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
            >
              Lihat Semua ({orders.length}) &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-2.5">Produk</th>
                  <th className="p-2.5">No. Order</th>
                  <th className="p-2.5">Pelanggan</th>
                  <th className="p-2.5">Total</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.slice(0, 6).map(o => {
                  const firstItem = o.items && o.items[0];
                  const itemImg = firstItem?.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop';
                  const hasMoreItems = o.items && o.items.length > 1;

                  return (
                    <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                            <img src={itemImg} alt="Thumbnail" className="w-full h-full object-cover" />
                            {hasMoreItems && (
                              <span className="absolute bottom-0 right-0 bg-[#800020] text-white text-[8px] font-bold px-1 rounded-tl">
                                +{o.items.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="max-w-[140px]">
                            <span className="font-bold text-stone-900 block truncate">
                              {firstItem ? firstItem.productName : 'Paket Baking'}
                            </span>
                            <span className="text-[10px] text-stone-400 block truncate">
                              {firstItem ? firstItem.variantName : `${o.items?.length || 1} item`}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-2.5 font-mono font-bold text-[#800020]">
                        {o.orderNumber}
                      </td>

                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <div>
                            <span className="font-bold text-stone-900 block truncate max-w-[100px]">{o.customerName}</span>
                          </div>
                          <a
                            href={`https://wa.me/${cleanPhoneNumber(o.customerPhone)}?text=Halo%20${encodeURIComponent(o.customerName)},%20mengenai%20pesanan%20${o.orderNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="p-2.5 font-serif font-extrabold text-stone-900">
                        {formatMYR(o.totalAmount)}
                      </td>

                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase inline-block ${
                          o.orderStatus === 'SHIPPED' ? 'bg-emerald-100 text-emerald-800' :
                          o.orderStatus === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>

                      <td className="p-2.5 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="px-2.5 py-1 bg-[#800020] hover:bg-[#6F1D1B] text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          Proses &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* INVENTORY ALERT & CATEGORY BREAKDOWN WIDGET (COL-SPAN-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Inventory Summary Widget */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-stone-100 text-[#800020]">
                  <Package className="w-4 h-4" />
                </span>
                <h3 className="font-serif text-base font-bold text-stone-900">Ringkasan Persediaan</h3>
              </div>
              <Link href="/admin/products" className="text-xs font-bold text-[#800020] hover:underline">
                Kelola Stok &rarr;
              </Link>
            </div>

            {(() => {
              const inv = db.getInventoryAlertSummary();
              return (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">🟢 In Stock</span>
                    <span className="font-serif font-extrabold text-lg text-emerald-700">{inv.inStockCount}</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">🟡 Low Stock</span>
                    <span className="font-serif font-extrabold text-lg text-amber-700">{inv.lowStockCount}</span>
                  </div>
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="text-[10px] text-rose-800 font-bold uppercase block">🔴 Out Of Stock</span>
                    <span className="font-serif font-extrabold text-lg text-rose-700">{inv.outOfStockCount}</span>
                  </div>
                </div>
              );
            })()}

            {/* Low Stock Product Preview List */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Item Perlu Restock Cepat:
              </span>
              {lowStockProductsList.length > 0 ? (
                lowStockProductsList.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <img src={p.mainImage} alt={p.productName} className="w-7 h-7 object-cover rounded-md border border-stone-200 flex-shrink-0" />
                      <span className="font-bold text-stone-900 truncate">{p.productName}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-mono">
                      Stok: {p.variants?.[0]?.stock || 0}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 italic p-2.5 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center">
                  ✓ Semua persediaan bahan baku berada di atas ambang batas.
                </p>
              )}
            </div>
          </div>

          {/* Category Distribution Widget */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-stone-100 text-emerald-700">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="font-serif text-base font-bold text-stone-900">Distribusi Kategori Produk</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% HALAL</span>
            </div>

            {(() => {
              const catMap: Record<string, number> = {};
              products.forEach(p => {
                const catName = (p as any).categoryName || (p as any).category || 'Lainnya';
                catMap[catName] = (catMap[catName] || 0) + 1;
              });
              const totalProducts = Math.max(1, products.length);
              const catEntries = Object.entries(catMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([label, count]) => ({
                  label,
                  count,
                  pct: Math.round((count / totalProducts) * 100),
                }));

              return (
                <div className="space-y-3 text-xs">
                  {catEntries.map((cat, cIdx) => (
                    <div key={cIdx} className="space-y-1">
                      <div className="flex justify-between font-bold text-stone-700">
                        <span>{cat.label}</span>
                        <span className="font-mono text-stone-900">{cat.count} Item ({cat.pct}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-[#800020]" style={{ width: `${cat.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

        </div>

      </div>

      {/* COMPACT QUICK SHORTCUTS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/admin/categories" className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 shadow-sm transition-colors text-center space-y-1.5 group">
          <Layers className="w-5 h-5 text-purple-700 mx-auto group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-stone-800 block">Kategori</span>
        </Link>
        <Link href="/admin/recipes" className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 shadow-sm transition-colors text-center space-y-1.5 group">
          <ChefHat className="w-5 h-5 text-[#800020] mx-auto group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-stone-800 block">Resep Baking</span>
        </Link>
        <Link href="/admin/blogs" className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 shadow-sm transition-colors text-center space-y-1.5 group">
          <BookOpen className="w-5 h-5 text-blue-700 mx-auto group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-stone-800 block">Artikel Blog</span>
        </Link>
        <Link href="/admin/vouchers" className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 shadow-sm transition-colors text-center space-y-1.5 group">
          <Tag className="w-5 h-5 text-amber-700 mx-auto group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-stone-800 block">Voucher Diskon</span>
        </Link>
        <Link href="/admin/customers" className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 shadow-sm transition-colors text-center space-y-1.5 group">
          <Users className="w-5 h-5 text-emerald-700 mx-auto group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-stone-800 block">Pelanggan</span>
        </Link>
        <Link href="/admin/settings" className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 shadow-sm transition-colors text-center space-y-1.5 group">
          <Settings className="w-5 h-5 text-stone-700 mx-auto group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-stone-800 block">Pengaturan</span>
        </Link>
      </div>

      {/* CHART POINT DETAIL MODAL POPUP */}
      {selectedModalPoint && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4 relative">
            <button
              onClick={() => setSelectedModalPoint(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="p-2.5 rounded-xl bg-[#800020]/10 text-[#800020]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  RINCIAN TRANSAKSI PERIODE
                </span>
                <h3 className="font-serif text-lg font-extrabold text-stone-900">
                  {selectedModalPoint.label} ({selectedModalPoint.dateStr})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Total Omset</span>
                <strong className="text-[#800020] font-serif font-black text-lg">
                  {formatMYR(selectedModalPoint.omset)}
                </strong>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total Order</span>
                <strong className="text-emerald-900 font-serif font-black text-lg">
                  {selectedModalPoint.ordersCount} Transaksi
                </strong>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-stone-700 block">Daftar Transaksi Terkait:</span>
              {selectedModalPoint.ordersList.length > 0 ? (
                selectedModalPoint.ordersList.map(o => (
                  <div key={o.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-[#800020] block">{o.orderNumber}</strong>
                      <span className="text-stone-500">{o.customerName}</span>
                    </div>
                    <span className="font-mono font-bold text-stone-900">{formatMYR(o.totalAmount)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 italic p-2.5 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center">
                  Tidak ada transaksi tercatat pada periode ini.
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/admin/orders"
                className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                Lihat Semua Pesanan &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Hapus Pencatatan Pengeluaran?"
        message="Pencatatan pengeluaran kas ini akan dihapus permanen. Apakah Anda yakin?"
        type="danger"
        onConfirm={executeDeleteExpense}
        onCancel={() => { setConfirmDeleteOpen(false); setPendingDeleteId(null); }}
      />
    </div>
  );
}
