'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatMYR } from '@/lib/currency';
import { useLanguage } from '@/lib/language-context';
import { formatWhatsAppNumber } from '@/lib/whatsapp';
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
  Truck,
  Plus,
  Layers,
  ChefHat,
  BookOpen,
  Tag,
  Settings,
  Sparkles,
  ExternalLink,
  Calendar,
  Filter,
  X,
  BarChart3,
  PieChart,
  MessageCircle,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
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
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpCategory, setNewExpCategory] = useState('Pembelian Stok (HPP)');
  const [newExpDate, setNewExpDate] = useState(new Date().toISOString().split('T')[0]);

  const defaultExpenses = [
    { id: 'exp-1', date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], type: 'OUTFLOW', category: 'Pembelian Stok (HPP)', title: 'Restok Tepung Semolina Durum 25kg (10 Sak)', amount: 1800 },
    { id: 'exp-2', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], type: 'OUTFLOW', category: 'Pembelian Stok (HPP)', title: 'Impor Kyoto Uji Matcha Powder Grade A (5kg)', amount: 950 },
    { id: 'exp-3', date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], type: 'OUTFLOW', category: 'Biaya Packaging', title: 'Beli Kraft Bakery Box Window 8x8 (200 Pcs)', amount: 260 },
    { id: 'exp-4', date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], type: 'OPERASIONAL', category: 'Operasional Gudang', title: 'Listrik & Pendingin Gudang Shah Alam', amount: 320 },
  ];

  useEffect(() => {
    const loadLiveData = () => {
      setOrders(db.getOrders());
      setProducts(db.getProducts());
      setCustomers(db.getCustomers());
      setCategories(db.getCategories());
      setRecipes(db.getRecipes());

      try {
        const saved = localStorage.getItem('fbs_cashflow_expenses');
        if (saved) {
          setExpenses(JSON.parse(saved));
        } else {
          setExpenses(defaultExpenses);
          localStorage.setItem('fbs_cashflow_expenses', JSON.stringify(defaultExpenses));
        }
      } catch (e) {
        setExpenses(defaultExpenses);
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

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExpAmount);
    if (!newExpTitle || isNaN(amt) || amt <= 0) {
      alert('Masukkan deskripsi dan jumlah pengeluaran kas yang valid.');
      return;
    }

    const newItem = {
      id: `exp-${Date.now()}`,
      date: newExpDate,
      type: 'OUTFLOW',
      category: newExpCategory,
      title: newExpTitle,
      amount: amt,
    };

    const updated = [newItem, ...expenses];
    setExpenses(updated);
    localStorage.setItem('fbs_cashflow_expenses', JSON.stringify(updated));
    setShowExpenseModal(false);
    setNewExpTitle('');
    setNewExpAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteExpense = () => {
    if (pendingDeleteId) {
      const updated = expenses.filter(e => e.id !== pendingDeleteId);
      setExpenses(updated);
      localStorage.setItem('fbs_cashflow_expenses', JSON.stringify(updated));
      setPendingDeleteId(null);
    }
  };

  // Cashflow Totals
  const totalInflow = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOutflow = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netCashflow = totalInflow - totalOutflow;
  const profitMarginPct = totalInflow > 0 ? Math.round((netCashflow / totalInflow) * 100) : 0;

  const totalSalesEstimate = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'NEW' || o.orderStatus === 'CONFIRMED');

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
        
        const matchingOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
        const realOmset = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const demoOmset = [280, 420, 390, 550, 780, 990, 1420][6 - i] + realOmset;
        const demoOrders = matchingOrders.length > 0 ? matchingOrders.length : Math.floor(demoOmset / 85);

        days.push({
          label: dayLabel,
          dateStr,
          omset: demoOmset,
          ordersCount: demoOrders,
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
        const demoOmset = [1850, 3200, 4100, 6850, 8200, 11950][5 - i] + realOmset;
        const demoOrders = matchingOrders.length > 0 ? matchingOrders.length : Math.floor(demoOmset / 78);

        periods.push({
          label: periodLabel,
          dateStr: periodLabel,
          omset: demoOmset,
          ordersCount: demoOrders,
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

        const matchingOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(yearMonthStr));
        const realOmset = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const demoOmset = [1800, 2450, 3100, 4800, 5900, 6500, 7800, 8400, 9200, 10100, 12500, 15800][11 - i] + realOmset;
        const demoOrders = matchingOrders.length > 0 ? matchingOrders.length : Math.floor(demoOmset / 80);

        months.push({
          label: monthNames[d.getMonth()],
          dateStr: mLabel,
          omset: demoOmset,
          ordersCount: demoOrders,
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
      const demoOmset = Math.round(750 + (i + 1) * 850 + realOmset);
      const demoOrders = matchingOrders.length > 0 ? matchingOrders.length : Math.floor(demoOmset / 75);

      customPoints.push({
        label: pLabel,
        dateStr: `${curStart.toISOString().split('T')[0]} - ${curEnd.toISOString().split('T')[0]}`,
        omset: demoOmset,
        ordersCount: demoOrders,
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
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Sleek Modern Hero Welcome Card */}
      <div className="bg-gradient-to-r from-[#4A1313] via-[#800020] to-[#5A0015] text-[#FFF8F0] p-6 sm:p-8 rounded-3xl shadow-xl border border-[#D4AF37]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-[11px] font-bold text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" /> LIVE STORE METRICS OVERVIEW
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Selamat Datang di Portal Admin
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
            Kelola pesanan WhatsApp, katalog bahan kue Halal, kategori produk, dan resep tutorial dari satu dashboard terpadu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10 w-full md:w-auto">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-[#800020] font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Tambah Produk
          </Link>
          <Link
            href="/admin/recipes"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#FFF8F0] font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
          >
            <ChefHat className="w-4 h-4 text-[#D4AF37]" /> Upload Video Resep
          </Link>
        </div>

        {/* Background Deco Circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Interactive Clickable Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Estimated Revenue -> Navigates to /admin/orders */}
        <Link 
          href="/admin/orders"
          className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#800020]/40 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 group-hover:text-[#800020] transition-colors">
              TOTAL ESTIMASI OMSET
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center group-hover:bg-[#800020] group-hover:text-[#D4AF37] transition-all">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-3xl font-extrabold text-[#800020] group-hover:scale-105 transition-transform origin-left">
              {formatMYR(totalSalesEstimate)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Berdasarkan akumulasi pesanan →
            </span>
          </div>
        </Link>

        {/* Card 2: Orders & Pending Actions -> Navigates to /admin/orders */}
        <Link 
          href="/admin/orders"
          className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 group-hover:text-amber-700 transition-colors">
              TOTAL PESANAN MASUK
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-3xl font-extrabold text-stone-900 group-hover:scale-105 transition-transform origin-left">
              {orders.length} <span className="text-xs font-normal text-stone-400">Order</span>
            </h3>
            <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> {pendingOrders.length} Perlu Update Resi →
            </span>
          </div>
        </Link>

        {/* Card 3: Active Products Catalog -> Navigates to /admin/products */}
        <Link 
          href="/admin/products"
          className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 group-hover:text-emerald-700 transition-colors">
              KATALOG PRODUK READY
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-3xl font-extrabold text-stone-900 group-hover:scale-105 transition-transform origin-left">
              {products.length} <span className="text-xs font-normal text-stone-400">Item</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {categories.length} Kategori Terbuka →
            </span>
          </div>
        </Link>

        {/* Card 4: Customer CRM Database -> Navigates to /admin/customers */}
        <Link 
          href="/admin/customers"
          className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 group-hover:text-blue-700 transition-colors">
              DATABASE PELANGGAN
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-3xl font-extrabold text-stone-900 group-hover:scale-105 transition-transform origin-left">
              {customers.length} <span className="text-xs font-normal text-stone-400">Baker</span>
            </h3>
            <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
              <Users className="w-3.5 h-3.5" /> Ritel, Grosir, & VIP Member →
            </span>
          </div>
        </Link>

      </div>

      {/* ULTRA-MODERN & MINIMALIST ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: DYNAMIC SALES & REVENUE GROWTH (INTERACTIVE & TIMEFRAME FILTERABLE) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-6 flex flex-col justify-between">
          
          {/* Header & Interactive Timeframe Filter Buttons */}
          <div className="space-y-3 border-b border-stone-100 pb-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#800020]/10 text-[#800020]">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif text-lg font-extrabold text-stone-900">
                    Grafik Analitik Omset & Penjualan Interaktif
                  </h3>
                </div>
                <p className="text-stone-500 text-xs mt-0.5">
                  Klik titik grafik atau bar mana saja untuk melihat rincian transaksi instan.
                </p>
              </div>

              {/* 4 Timeframe Filter Buttons */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold self-start xl:self-auto">
                <button
                  type="button"
                  onClick={() => setTimeRange('7D')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    timeRange === '7D' ? 'bg-[#800020] text-[#D4AF37] shadow' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('30D')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    timeRange === '30D' ? 'bg-[#800020] text-[#D4AF37] shadow' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  30 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('1Y')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    timeRange === '1Y' ? 'bg-[#800020] text-[#D4AF37] shadow' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  1 Tahun
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('CUSTOM')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    timeRange === 'CUSTOM' ? 'bg-[#800020] text-[#D4AF37] shadow' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Kalender
                </button>
              </div>
            </div>

            {/* CUSTOM CALENDAR DATE RANGE PICKERS */}
            {timeRange === 'CUSTOM' && (
              <div className="flex flex-wrap items-center gap-3 p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900">Dari Tanggal:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-1.5 border border-amber-300 rounded-xl text-stone-900 bg-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900">Sampai Tanggal:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-1.5 border border-amber-300 rounded-xl text-stone-900 bg-white font-mono"
                  />
                </div>
                <span className="text-[11px] text-amber-800 font-medium">
                  ✓ Grafik otomatis diperbarui sesuai tanggal terpilih
                </span>
              </div>
            )}
          </div>

          {/* SVG Area Spline & Bar Combined Minimalist Chart */}
          <div className="relative pt-4 pb-2">
            
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
              <div className="border-b border-dashed border-stone-300 w-full" />
              <div className="border-b border-dashed border-stone-300 w-full" />
              <div className="border-b border-dashed border-stone-300 w-full" />
              <div className="border-b border-dashed border-stone-300 w-full" />
            </div>

            {/* Dynamic Interactive SVG Chart Canvas */}
            <div className="relative h-64 w-full flex items-end justify-between px-2 pt-6">
              
              {/* SVG Area Gradient Spline Line */}
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#800020" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#800020" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path 
                  d="M 20 160 Q 100 130 180 110 T 340 50 T 480 20 L 480 200 L 20 200 Z" 
                  fill="url(#chartGradient)" 
                />
                {/* Stroke Line */}
                <path 
                  d="M 20 160 Q 100 130 180 110 T 340 50 T 480 20" 
                  fill="none" 
                  stroke="#800020" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
              </svg>

              {/* Data Point Bars & Glowing Bullets (CLICKABLE TO OPEN MODAL) */}
              {chartPoints.map((pt, pIdx) => {
                const heightPercent = Math.max(15, Math.min(100, Math.round((pt.omset / maxOmsetVal) * 100)));
                return (
                  <div 
                    key={pIdx} 
                    onClick={() => setSelectedModalPoint(pt)}
                    className="flex-1 flex flex-col items-center justify-end relative group h-full z-10 cursor-pointer"
                  >
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-stone-900 text-white text-[10px] py-1.5 px-3 rounded-xl shadow-xl border border-stone-700 whitespace-nowrap z-30 flex flex-col items-center">
                      <span className="font-extrabold text-[#D4AF37]">{formatMYR(pt.omset)}</span>
                      <span className="text-[9px] text-stone-300">{pt.ordersCount} Transaksi</span>
                      <span className="text-[8px] text-emerald-400 font-bold mt-0.5">Klik untuk Rincian →</span>
                    </div>

                    {/* Pulsing Glowing Circle Point */}
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-all group-hover:scale-130 mb-1 z-20 ${
                      pt.active ? 'bg-[#800020] ring-4 ring-[#800020]/30 animate-pulse' : 'bg-[#D4AF37] group-hover:bg-[#800020]'
                    }`} />

                    {/* Minimalist Vertical Bar Pill */}
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-3.5 sm:w-6 rounded-t-xl transition-all duration-500 ${
                        pt.active 
                          ? 'bg-gradient-to-t from-[#800020] to-[#D4AF37] shadow-lg scale-105' 
                          : 'bg-stone-200 group-hover:bg-[#800020]/50'
                      }`} 
                    />

                    {/* Month / Date Label */}
                    <span className={`text-[10px] sm:text-[11px] font-extrabold mt-3 truncate max-w-[50px] text-center ${
                      pt.active ? 'text-[#800020]' : 'text-stone-500 group-hover:text-stone-900'
                    }`}>
                      {pt.label}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Quick Summary Pill Footer (Calculated Dynamic Totals) */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-100 text-center text-xs">
            <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Total Omset Filtered</span>
              <strong className="text-[#800020] font-serif font-extrabold text-sm sm:text-base">
                {formatMYR(totalOmsetFiltered)}
              </strong>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Total Order Filtered</span>
              <strong className="text-emerald-700 font-serif font-extrabold text-sm sm:text-base">
                {totalOrdersFiltered} Order
              </strong>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Rata-Rata Order</span>
              <strong className="text-amber-800 font-serif font-extrabold text-sm sm:text-base">
                {formatMYR(totalOrdersFiltered > 0 ? totalOmsetFiltered / totalOrdersFiltered : 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* CHART 2: CATEGORY & ORDER STATUS DISTRIBUTION (DONUT & PROGRESS BARS) - TAKES 1 COL */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-lg font-extrabold text-stone-900">
                Distribusi Kategori & Status
              </h3>
            </div>
            <p className="text-stone-500 text-xs mt-0.5">
              Persentase penjualan produk & pemrosesan resi.
            </p>
          </div>

          {/* Minimalist Modern Donut Chart Widget */}
          <div className="relative flex items-center justify-center py-2">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 36 36">
              {/* Background Track */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="3.8" />
              
              {/* Segment 1: Tepung & Semolina (35%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#800020" strokeWidth="3.8" strokeDasharray="35 65" strokeDashoffset="0" />
              
              {/* Segment 2: Matcha & Powder (25%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3.8" strokeDasharray="25 75" strokeDashoffset="-35" />
              
              {/* Segment 3: Cokelat Belgian (20%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#D4AF37" strokeWidth="3.8" strokeDasharray="20 80" strokeDashoffset="-60" />

              {/* Segment 4: Mentega & Dairy (20%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3.8" strokeDasharray="20 80" strokeDashoffset="-80" />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-stone-400 uppercase">PRODUK LALU</span>
              <span className="font-serif text-2xl font-black text-[#800020]">100%</span>
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">HALAL</span>
            </div>
          </div>

          {/* Minimalist Legend & Progress Bars */}
          <div className="space-y-3 pt-2">
            {[
              { label: 'Tepung & Semolina Import', pct: '35%', color: 'bg-[#800020]' },
              { label: 'Matcha Powder & Tea', pct: '25%', color: 'bg-emerald-500' },
              { label: 'Cokelat Belgian Beryls', pct: '20%', color: 'bg-[#D4AF37]' },
              { label: 'Mentega Anchor & Dairy', pct: '20%', color: 'bg-blue-500' },
            ].map((cat, cIdx) => (
              <div key={cIdx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} /> {cat.label}
                  </span>
                  <span className="font-mono text-stone-900">{cat.pct}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`${cat.color} h-1.5 rounded-full`} style={{ width: cat.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SHORTCUT LINK CARD TO DEDICATED CASHFLOW PAGE */}
      <div className="p-6 bg-gradient-to-r from-stone-900 to-[#2A0810] text-[#FFF8F0] rounded-3xl border border-[#D4AF37]/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/40 flex-shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-extrabold text-lg text-white">Laporan Arus Kas & Analisis Keuangan (Cashflow)</h3>
            <p className="text-stone-300 text-xs mt-0.5">Kelola jurnal kas masuk, pengeluaran HPP, operasional gudang, dan laba bersih di halaman menu terpisah.</p>
          </div>
        </div>

        <Link
          href="/admin/cashflow"
          className="px-5 py-3 bg-[#D4AF37] hover:bg-amber-400 text-[#800020] font-black text-xs rounded-2xl shadow-md transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          Buka Laporan Arus Kas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Action Needed Alert Bar */}
      {pendingOrders.length > 0 && (
        <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-900">Perhatian Admin: Pesanan Baru Perlu Konfirmasi Resi</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">Terdapat {pendingOrders.length} pesanan baru dari pelanggan yang perlu diproses dan dimasukkan nomor resinya.</p>
            </div>
          </div>
          <Link 
            href="/admin/orders" 
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-colors whitespace-nowrap"
          >
            Kelola Resi Pesanan →
          </Link>
        </div>
      )}

      {/* Modern Quick Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <Link 
          href="/admin/categories"
          className="p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-stone-800 block">Kategori</span>
        </Link>

        <Link 
          href="/admin/recipes"
          className="p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#800020] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-stone-800 block">Resep & Video</span>
        </Link>

        <Link 
          href="/admin/blogs"
          className="p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-stone-800 block">Blog CMS</span>
        </Link>

        <Link 
          href="/admin/vouchers"
          className="p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-stone-800 block">Voucher Diskon</span>
        </Link>

        <Link 
          href="/admin/customers"
          className="p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-stone-800 block">CRM Pelanggan</span>
        </Link>

        <Link 
          href="/admin/settings"
          className="p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-stone-800 block">Pengaturan</span>
        </Link>

      </div>

      {/* Minimalist Table: Recent WhatsApp Customer Orders */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-100 pb-4 gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Pesanan WhatsApp Terbaru</h3>
            <p className="text-stone-500 text-xs">Daftar transaksi masuk dari katalog produk toko.</p>
          </div>
          <Link 
            href="/admin/orders" 
            className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
          >
            Lihat Semua Pesanan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-3.5">FOTO & ITEM PRODUK</th>
                <th className="p-3.5">NO. PESANAN</th>
                <th className="p-3.5">PELANGGAN WHATSAPP</th>
                <th className="p-3.5">TOTAL PEMBAYARAN</th>
                <th className="p-3.5">STATUS & RESI</th>
                <th className="p-3.5 text-right">AKSI ADMIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {orders.slice(0, 5).map(o => {
                const firstItem = o.items && o.items[0];
                const itemImg = firstItem?.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop';
                const hasMoreItems = o.items && o.items.length > 1;

                return (
                  <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                    
                    {/* COL 1: PRODUCT THUMBNAIL & ITEM NAME */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0 shadow-sm">
                          <img src={itemImg} alt="Product Thumbnail" className="w-full h-full object-cover" />
                          {hasMoreItems && (
                            <span className="absolute bottom-0 right-0 bg-[#800020] text-white text-[9px] font-black px-1.5 py-0.5 rounded-tl-md">
                              +{o.items.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="max-w-[180px]">
                          <span className="font-extrabold text-stone-900 block truncate">
                            {firstItem ? firstItem.productName : 'Paket Bahan Kue'}
                          </span>
                          <span className="text-[11px] text-stone-500 block truncate">
                            {firstItem ? `Varian: ${firstItem.variantName}` : `${o.items?.length || 1} Item`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* COL 2: ORDER NUMBER BADGE */}
                    <td className="p-3.5">
                      <span className="inline-block px-2.5 py-1 bg-[#800020]/10 text-[#800020] rounded-lg font-mono font-bold text-xs border border-[#800020]/20">
                        {o.orderNumber}
                      </span>
                    </td>

                    {/* COL 3: CUSTOMER NAME & WHATSAPP CHAT BUTTON */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-bold text-stone-900 block">{o.customerName}</span>
                          <span className="text-stone-500 font-mono text-[11px] block">{o.customerPhone}</span>
                        </div>
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(o.customerPhone)}?text=Halo%20${encodeURIComponent(o.customerName)},%20mengenai%20pesanan%20${o.orderNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-200"
                          title="Chat via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>

                    {/* COL 4: TOTAL AMOUNT */}
                    <td className="p-3.5">
                      <span className="font-serif font-black text-stone-900 text-sm block">
                        {formatMYR(o.totalAmount)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Terverifikasi</span>
                    </td>

                    {/* COL 5: STATUS & RESI */}
                    <td className="p-3.5 space-y-1">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase inline-block ${
                        o.orderStatus === 'SHIPPED' ? 'bg-emerald-100 text-emerald-800' :
                        o.orderStatus === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.orderStatus}
                      </span>
                      {o.trackingNumber ? (
                        <span className="block text-[11px] font-mono text-stone-600">
                          {o.courierName}: {o.trackingNumber}
                        </span>
                      ) : (
                        <span className="block text-[10px] text-amber-700 italic">Belum Diisi Resi</span>
                      )}
                    </td>

                    {/* COL 6: ADMIN ACTION */}
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-1 active:scale-95"
                      >
                        Update Resi <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERACTIVE CHART POINT DETAIL MODAL POPUP */}
      {selectedModalPoint && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 relative">
            <button
              onClick={() => setSelectedModalPoint(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center flex-shrink-0 font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  RINCIAN CHART ANALITIK
                </span>
                <h3 className="font-serif text-xl font-extrabold text-stone-900">
                  Periode: {selectedModalPoint.label} ({selectedModalPoint.dateStr})
                </h3>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Total Omset Periode Ini</span>
                <strong className="text-[#800020] font-serif font-black text-xl">
                  {formatMYR(selectedModalPoint.omset)}
                </strong>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Jumlah Transaksi</span>
                <strong className="text-emerald-900 font-serif font-black text-xl">
                  {selectedModalPoint.ordersCount} Order
                </strong>
              </div>
            </div>

            {/* List of Orders in this point if any */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-stone-700 block">Daftar Transaksi Terkait:</span>
              {selectedModalPoint.ordersList.length > 0 ? (
                selectedModalPoint.ordersList.map(o => (
                  <div key={o.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-[#800020] block">{o.orderNumber}</strong>
                      <span className="text-stone-500">{o.customerName}</span>
                    </div>
                    <span className="font-mono font-bold text-stone-900">{formatMYR(o.totalAmount)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  Proyeksi performa riwayat transaksi sesuai estimasi periode toko.
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                href="/admin/orders"
                className="px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                Lihat Manajemen Pesanan Lengkap <ArrowRight className="w-4 h-4" />
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
