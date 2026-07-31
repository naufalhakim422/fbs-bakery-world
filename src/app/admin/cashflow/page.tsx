'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { formatMYR } from '@/lib/currency';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  PlusCircle, 
  Receipt, 
  Trash2, 
  X,
  TrendingUp,
  Filter,
  BarChart3,
  PieChart,
  Target,
  Percent,
  Calendar,
  CheckCircle2
} from 'lucide-react';

// ─── Helper: generate daily data points between two dates ───────────────────
function generateDailyData(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: { label: string; inVal: number; outVal: number }[] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.round(diffMs / 86400000));

  if (diffDays <= 14) {
    // Daily granularity
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseIn = isWeekend ? 1800 + Math.round(Math.random() * 600) : 1000 + Math.round(Math.random() * 700);
      const baseOut = Math.round(baseIn * (0.3 + Math.random() * 0.2));
      days.push({
        label: dayNames[dayOfWeek] + ' ' + d.getDate(),
        inVal: baseIn,
        outVal: baseOut,
      });
    }
  } else if (diffDays <= 90) {
    // Weekly granularity
    let weekNum = 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      const baseIn = 7000 + Math.round(Math.random() * 4000);
      days.push({
        label: 'Minggu ' + weekNum++,
        inVal: baseIn,
        outVal: Math.round(baseIn * (0.30 + Math.random() * 0.15)),
      });
    }
  } else {
    // Monthly granularity
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= endMonth) {
      const baseIn = 28000 + Math.round(Math.random() * 22000);
      days.push({
        label: monthNames[cur.getMonth()] + ' ' + String(cur.getFullYear()).slice(2),
        inVal: baseIn,
        outVal: Math.round(baseIn * (0.28 + Math.random() * 0.18)),
      });
      cur.setMonth(cur.getMonth() + 1);
    }
  }

  return days;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminCashflowPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState(db.getOrders());
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [activeMetricCard, setActiveMetricCard] = useState<'INFLOW' | 'OUTFLOW' | 'NET' | 'MARGIN'>('INFLOW');

  // Time Range State
  const [timePeriod, setTimePeriod] = useState<'7D' | '30D' | '1Y' | 'CUSTOM'>('7D');
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(() => new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);

  // New Expense Form State
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpCategory, setNewExpCategory] = useState('Pembelian Stok (HPP)');
  const [newExpDate, setNewExpDate] = useState(today);

  const defaultExpenses = [
    { id: 'exp-1', date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], type: 'OUTFLOW', category: 'Pembelian Stok (HPP)', title: 'Restok Tepung Semolina Durum 25kg (10 Sak)', amount: 1800 },
    { id: 'exp-2', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], type: 'OUTFLOW', category: 'Pembelian Stok (HPP)', title: 'Impor Kyoto Uji Matcha Powder Grade A (5kg)', amount: 950 },
    { id: 'exp-3', date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], type: 'OUTFLOW', category: 'Biaya Packaging', title: 'Beli Kraft Bakery Box Window 8x8 (200 Pcs)', amount: 260 },
    { id: 'exp-4', date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], type: 'OUTFLOW', category: 'Operasional Gudang', title: 'Listrik & Pendingin Gudang Shah Alam', amount: 320 },
  ];

  useEffect(() => {
    const loadData = () => {
      setOrders(db.getOrders());
      try {
        const saved = localStorage.getItem('fbs_cashflow_expenses');
        if (saved) {
          setExpenses(JSON.parse(saved));
        } else {
          setExpenses(defaultExpenses);
          localStorage.setItem('fbs_cashflow_expenses', JSON.stringify(defaultExpenses));
        }
      } catch {
        setExpenses(defaultExpenses);
      }
    };
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('fbs_db_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('fbs_db_updated', loadData);
    };
  }, []);

  // ─── Apply preset period buttons ───────────────────────────────────────────
  const applyPreset = (period: '7D' | '30D' | '1Y') => {
    const daysMap = { '7D': 7, '30D': 30, '1Y': 365 };
    const newStart = new Date(Date.now() - daysMap[period] * 86400000).toISOString().split('T')[0];
    setTimePeriod(period);
    setStartDate(newStart);
    setEndDate(today);
  };

  // ─── Dynamically generated chart TREND data (visual only) ─────────────────
  const chartData = useMemo(() => generateDailyData(startDate, endDate), [startDate, endDate]);
  const maxInValue = Math.max(...chartData.map(d => d.inVal), 1);

  // ─── Period label string ───────────────────────────────────────────────────
  const periodLabel = timePeriod === '7D' ? '7 Hari Lalu' 
    : timePeriod === '30D' ? '30 Hari (1 Bulan)' 
    : timePeriod === '1Y' ? '1 Tahun (12 Bulan)' 
    : `${startDate} → ${endDate}`;

  // ─── REAL Financial totals from ACTUAL expenses & orders filtered by date ──
  // Filter expenses by selected date range
  const expensesInRange = useMemo(() => expenses.filter(exp => {
    return exp.date >= startDate && exp.date <= endDate;
  }), [expenses, startDate, endDate]);

  // Filter orders by selected date range  
  const ordersInRange = useMemo(() => orders.filter(ord => {
    const ordDate = (ord.createdAt || '').split('T')[0];
    return ordDate >= startDate && ordDate <= endDate;
  }), [orders, startDate, endDate]);

  // totalOutflow = SUM of all real expense entries within date range
  const totalOutflow = useMemo(() => 
    expensesInRange.reduce((sum, e) => sum + e.amount, 0),
    [expensesInRange]
  );

  // totalInflow = SUM of real orders + base sales estimate within date range
  const realOrderInflow = useMemo(() =>
    ordersInRange.reduce((sum, o) => sum + o.totalAmount, 0),
    [ordersInRange]
  );
  // Base inflow estimate (simulates daily sales per day count in range)
  const dayCount = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  }, [startDate, endDate]);
  const baseDailySales = 1280; // baseline daily sales MYR
  const totalInflow = realOrderInflow + (baseDailySales * dayCount);

  const netCashflow = totalInflow - totalOutflow;
  const profitMarginPct = totalInflow > 0 ? Math.round((netCashflow / totalInflow) * 100) : 0;

  const filteredExpenses = filterCategory === 'ALL' ? expenses : expenses.filter(e => e.category === filterCategory);

  // ─── Category breakdown for outflow chart (from real data) ────────────────
  const categoryTotals = useMemo(() => {
    return expensesInRange.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});
  }, [expensesInRange]);

  const totalOutflowAmt = totalOutflow || 1;
  const outflowCategories = [
    { cat: 'Pembelian Stok (HPP)', color: 'bg-rose-600', amt: categoryTotals['Pembelian Stok (HPP)'] || 0 },
    { cat: 'Operasional Gudang & Listrik', color: 'bg-amber-500', amt: categoryTotals['Operasional Gudang'] || 0 },
    { cat: 'Biaya Packaging & Kardus', color: 'bg-purple-600', amt: categoryTotals['Biaya Packaging'] || 0 },
    { cat: 'Biaya Kurir & Logistik', color: 'bg-blue-500', amt: categoryTotals['Biaya Kurir & Logistik'] || 0 },
    { cat: 'Pengeluaran Lainnya', color: 'bg-stone-500', amt: categoryTotals['Pengeluaran Lainnya'] || 0 },
  ].filter(c => c.amt > 0);


  // ─── Add expense ───────────────────────────────────────────────────────────
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExpAmount);
    if (!newExpTitle || isNaN(amt) || amt <= 0) {
      alert('Masukkan deskripsi dan jumlah pengeluaran kas yang valid.');
      return;
    }
    const newItem = { id: `exp-${Date.now()}`, date: newExpDate, type: 'OUTFLOW', category: newExpCategory, title: newExpTitle, amount: amt };
    const updated = [newItem, ...expenses];
    setExpenses(updated);
    localStorage.setItem('fbs_cashflow_expenses', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setShowExpenseModal(false);
    setNewExpTitle('');
    setNewExpAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Hapus pencatatan pengeluaran kas ini?')) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      localStorage.setItem('fbs_cashflow_expenses', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // ─── Bar Chart Renderer (shared) ──────────────────────────────────────────
  const renderBarChart = (showBothBars: boolean) => (
    <div className="h-56 flex items-end justify-start gap-1.5 pt-6 px-2 border-b border-stone-200 overflow-x-auto pb-1 min-h-[14rem]">
      {chartData.map((item, idx) => {
        const inPct = Math.round((item.inVal / maxInValue) * 100);
        const outPct = Math.round((item.outVal / maxInValue) * 100);
        return (
          <div key={idx} className="flex-shrink-0 flex flex-col items-center group relative" style={{ minWidth: showBothBars ? 32 : 24, maxWidth: showBothBars ? 56 : 40 }}>
            <div className="flex items-end gap-0.5 w-full" style={{ height: '168px' }}>
              {/* Inflow bar */}
              <div
                className="flex-1 bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-400 rounded-t-lg group-hover:brightness-110 transition-all shadow-md relative"
                style={{ height: `${inPct}%`, minHeight: 4 }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900 text-[#D4AF37] text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap z-20 shadow">
                  +{formatMYR(item.inVal)}
                </div>
              </div>
              {/* Outflow bar (only for NET chart) */}
              {showBothBars && (
                <div
                  className="flex-1 bg-gradient-to-t from-rose-700 via-rose-500 to-rose-400 rounded-t-lg group-hover:brightness-110 transition-all shadow-md relative"
                  style={{ height: `${outPct}%`, minHeight: 4 }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-rose-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap z-20 shadow">
                    -{formatMYR(item.outVal)}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-stone-500 mt-1.5 text-center leading-tight">{item.label}</span>
          </div>
        );
      })}
    </div>
  );

  // ─── Shared Chart Header ──────────────────────────────────────────────────
  const ChartHeader = ({ icon, title, badge }: { icon: React.ReactNode; title: string; badge: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-serif text-lg sm:text-xl font-extrabold text-stone-900">{title}</h2>
        </div>
        <p className="text-stone-500 text-xs mt-1">
          Periode: <span className="font-bold text-[#800020]">{startDate}</span> s/d <span className="font-bold text-[#800020]">{endDate}</span>
        </p>
      </div>
      {badge}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-100 text-emerald-800"><Wallet className="w-6 h-6" /></span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">{t.adminCashflow.title}</h1>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-2xl">{t.adminCashflow.subtitle}</p>
        </div>
        <button type="button" onClick={() => setShowExpenseModal(true)}
          className="px-5 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" /> {t.adminCashflow.addExpenseBtn}
        </button>
      </div>

      {/* 4 INTERACTIVE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'INFLOW' as const, label: t.adminCashflow.card1Label, sub: t.adminCashflow.card1Sub, value: formatMYR(totalInflow), color: 'emerald', icon: <ArrowUpRight className="w-5 h-5" /> },
          { key: 'OUTFLOW' as const, label: t.adminCashflow.card2Label, sub: t.adminCashflow.card2Sub, value: formatMYR(totalOutflow), color: 'rose', icon: <ArrowDownRight className="w-5 h-5" /> },
          { key: 'NET' as const, label: t.adminCashflow.card3Label, sub: t.adminCashflow.card3Sub, value: formatMYR(netCashflow), color: 'amber', icon: <DollarSign className="w-5 h-5" /> },
          { key: 'MARGIN' as const, label: t.adminCashflow.card4Label, sub: t.adminCashflow.card4Sub, value: `+${profitMarginPct}%`, color: 'blue', icon: <span className="font-bold text-sm">%</span> },
        ].map(card => {
          const isActive = activeMetricCard === card.key;
          const colorMap: Record<string, string> = {
            emerald: 'emerald', rose: 'rose', amber: 'amber', blue: 'blue'
          };
          const c = colorMap[card.color];
          return (
            <div key={card.key} onClick={() => setActiveMetricCard(card.key)}
              className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 space-y-3 relative border ${
                isActive
                  ? `bg-${c}-50/90 border-${c}-500 shadow-xl scale-[1.02] ring-4 ring-${c}-500/20`
                  : `bg-white border-stone-200 hover:border-${c}-300 hover:shadow-md`
              }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-extrabold uppercase tracking-wider text-${c}-800`}>{card.label}</span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow transition-transform bg-${c}-${isActive ? '700' : '500'} text-white ${isActive ? 'scale-110' : ''}`}>
                  {card.icon}
                </div>
              </div>
              <h3 className={`font-serif text-3xl font-black text-${c}-950`}>{card.value}</h3>
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs text-${c}-700 font-medium`}>{card.sub}</span>
                {isActive && <span className={`text-[10px] font-extrabold bg-${c}-700 text-white px-2 py-0.5 rounded-full uppercase`}>Active</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* CHART AREA with TIME RANGE FILTER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">

        {/* ── UNIFIED TIME RANGE & CALENDAR PICKER ────────────────────────── */}
        <div className="bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-stone-700 uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-[#800020]" />
            <span>Filter Rentang Waktu Grafik</span>
            <span className="ml-auto text-[10px] font-bold text-[#800020] bg-[#800020]/10 px-2 py-0.5 rounded-full">{periodLabel}</span>
          </div>

          {/* Preset Buttons Row */}
          <div className="flex flex-wrap gap-2">
            {([['7D', '7 Hari Lalu'], ['30D', '1 Bulan (30 Hari)'], ['1Y', '1 Tahun Lalu']] as const).map(([key, lbl]) => (
              <button key={key}
                onClick={() => applyPreset(key as '7D' | '30D' | '1Y')}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  timePeriod === key
                    ? 'bg-[#800020] text-[#D4AF37] border-[#D4AF37]/50 shadow-md'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50 hover:border-[#800020]/40'
                }`}>
                {lbl}
              </button>
            ))}
            <button
              onClick={() => setTimePeriod('CUSTOM')}
              className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                timePeriod === 'CUSTOM'
                  ? 'bg-[#800020] text-[#D4AF37] border-[#D4AF37]/50 shadow-md'
                  : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50 hover:border-[#800020]/40'
              }`}>
              <Calendar className="w-3.5 h-3.5" /> Kalender Custom
            </button>
          </div>

          {/* Custom Calendar Date Inputs */}
          {timePeriod === 'CUSTOM' && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 shadow-inner flex-1 min-w-[200px]">
                <Calendar className="w-3.5 h-3.5 text-[#800020] flex-shrink-0" />
                <span className="text-stone-400">Dari:</span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="flex-1 bg-transparent font-mono font-bold text-[#800020] focus:outline-none"
                />
              </div>
              <span className="text-stone-400 font-bold text-xs">→</span>
              <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 shadow-inner flex-1 min-w-[200px]">
                <Calendar className="w-3.5 h-3.5 text-[#800020] flex-shrink-0" />
                <span className="text-stone-400">Sampai:</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={e => setEndDate(e.target.value)}
                  className="flex-1 bg-transparent font-mono font-bold text-[#800020] focus:outline-none"
                />
              </div>
              <div className="text-[10px] text-stone-500 font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                <span className="font-bold text-stone-700">{chartData.length}</span> titik data · Total inflow <span className="font-bold text-emerald-700">{formatMYR(totalInflow)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── CHART 1: INFLOW SALES TREND ───────────────────────────────── */}
        {activeMetricCard === 'INFLOW' && (
          <div className="space-y-5">
            <ChartHeader
              icon={<span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800"><TrendingUp className="w-5 h-5" /></span>}
              title={`${t.adminCashflow.card1Label} • Grafik Penjualan`}
              badge={
                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Total: {formatMYR(totalInflow)}
                </span>
              }
            />
            {renderBarChart(false)}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Rata-Rata Per Periode</span>
                <strong className="text-emerald-950 text-sm font-serif font-black">{formatMYR(Math.round(totalInflow / Math.max(1, chartData.length)))} / titik</strong>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Puncak Tertinggi</span>
                <strong className="text-emerald-950 text-sm font-serif font-black">
                  {chartData.reduce((p, c) => c.inVal > p.inVal ? c : p, chartData[0])?.label} ({formatMYR(maxInValue)})
                </strong>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Status Performa</span>
                <strong className="text-emerald-700 text-sm font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Kas Masuk Sehat
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* ── CHART 2: OUTFLOW BREAKDOWN ────────────────────────────────── */}
        {activeMetricCard === 'OUTFLOW' && (
          <div className="space-y-5">
            <ChartHeader
              icon={<span className="p-1.5 rounded-lg bg-rose-100 text-rose-800"><PieChart className="w-5 h-5" /></span>}
              title={`${t.adminCashflow.card2Label} • Breakdown Kategori`}
              badge={
                <span className="px-3.5 py-1.5 bg-rose-50 text-rose-800 rounded-full text-xs font-bold border border-rose-200 flex items-center gap-1.5 self-start sm:self-auto">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" /> Total: {formatMYR(totalOutflow)}
                </span>
              }
            />
            <div className="space-y-3">
              {outflowCategories.length === 0 ? (
                <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-stone-200">
                  Belum ada pengeluaran yang dicatat dalam periode ini.
                </div>
              ) : outflowCategories.map((item, idx) => {
                const pct = Math.round((item.amt / totalOutflowAmt) * 100);
                return (
                  <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-stone-800 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`} />{item.cat}
                      </span>
                      <strong className="font-mono text-stone-900 font-extrabold text-sm">
                        {formatMYR(item.amt)} ({pct}%)
                      </strong>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                      <div className={`${item.color} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CHART 3: NET INFLOW VS OUTFLOW ────────────────────────────── */}
        {activeMetricCard === 'NET' && (
          <div className="space-y-5">
            <ChartHeader
              icon={<span className="p-1.5 rounded-lg bg-[#800020]/10 text-[#800020]"><BarChart3 className="w-5 h-5" /></span>}
              title={`${t.adminCashflow.card3Label} • Inflow vs Outflow`}
              badge={
                <span className="px-3.5 py-1.5 bg-amber-50 text-[#800020] rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1.5 self-start sm:self-auto">
                  <DollarSign className="w-4 h-4" /> Net Profit: {formatMYR(netCashflow)}
                </span>
              }
            />
            {renderBarChart(true)}
            <div className="flex items-center justify-center gap-6 text-xs font-bold">
              <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 bg-emerald-500 rounded-md" /> Kas Masuk</span>
              <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 bg-rose-500 rounded-md" /> Kas Keluar</span>
            </div>
          </div>
        )}

        {/* ── CHART 4: PROFIT MARGIN GAUGE ──────────────────────────────── */}
        {activeMetricCard === 'MARGIN' && (
          <div className="space-y-5">
            <ChartHeader
              icon={<span className="p-1.5 rounded-lg bg-blue-100 text-blue-800"><Target className="w-5 h-5" /></span>}
              title={`${t.adminCashflow.card4Label} • Target & Efisiensi`}
              badge={
                <span className="px-3.5 py-1.5 bg-blue-50 text-blue-900 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1.5 self-start sm:self-auto">
                  <Percent className="w-4 h-4 text-blue-700" /> Margin: +{profitMarginPct}%
                </span>
              }
            />
            <div className="p-6 bg-gradient-to-r from-stone-900 to-blue-950 text-white rounded-3xl space-y-4 shadow-xl border border-blue-400/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#D4AF37]" /> PROFIT MARGIN PERIODE {periodLabel.toUpperCase()}
                </span>
                <span className="font-mono font-black text-emerald-400 text-base">+{profitMarginPct}%</span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-stone-800 rounded-full h-6 p-1 border border-stone-700">
                  <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-[#D4AF37] h-4 rounded-full transition-all duration-1000 shadow"
                    style={{ width: `${Math.min(100, Math.max(5, profitMarginPct))}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-stone-400">
                  <span>0% (Rugi)</span>
                  <span className="text-amber-300">25%–40% (Ideal)</span>
                  <span className="text-emerald-400">60%+ (Maksimal)</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
                <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700">
                  <span className="block text-stone-400 text-[10px] uppercase font-bold">Total Inflow</span>
                  <strong className="text-emerald-400 font-mono">{formatMYR(totalInflow)}</strong>
                </div>
                <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700">
                  <span className="block text-stone-400 text-[10px] uppercase font-bold">Total Outflow</span>
                  <strong className="text-rose-400 font-mono">{formatMYR(totalOutflow)}</strong>
                </div>
                <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700">
                  <span className="block text-stone-400 text-[10px] uppercase font-bold">Net Profit</span>
                  <strong className="text-[#D4AF37] font-mono">{formatMYR(netCashflow)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CASHFLOW LEDGER TABLE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#800020]" />
            <h2 className="font-serif font-extrabold text-lg text-stone-900">{t.adminCashflow.journalTitle}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Filter className="w-4 h-4 text-stone-500" />
            <span className="text-stone-600">{t.adminCashflow.filterLabel}</span>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-stone-300 rounded-xl bg-stone-50 text-stone-900 focus:outline-none focus:border-[#800020]">
              <option value="ALL">{t.adminCashflow.filterAll}</option>
              <option value="Pembelian Stok (HPP)">Pembelian Stok (HPP)</option>
              <option value="Biaya Packaging">Biaya Packaging</option>
              <option value="Biaya Kurir & Logistik">Biaya Kurir & Logistik</option>
              <option value="Operasional Gudang">Operasional Gudang</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">{t.adminCashflow.thDate}</th>
                <th className="py-3.5 px-4">{t.adminCashflow.thType}</th>
                <th className="py-3.5 px-4">{t.adminCashflow.thCategory}</th>
                <th className="py-3.5 px-4">{t.adminCashflow.thDesc}</th>
                <th className="py-3.5 px-4 text-right">{t.adminCashflow.thAmount}</th>
                <th className="py-3.5 px-4 text-center">{t.adminCashflow.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-stone-500">{exp.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full uppercase flex items-center gap-1 w-fit">
                      <ArrowDownRight className="w-3 h-3" /> {t.adminCashflow.outflowTag}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-700">{exp.category}</td>
                  <td className="py-3.5 px-4 font-medium text-stone-900">{exp.title}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">- {formatMYR(exp.amount)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.map(ord => (
                <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-stone-500">{ord.createdAt?.split('T')[0] || today}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase flex items-center gap-1 w-fit">
                      <ArrowUpRight className="w-3 h-3" /> {t.adminCashflow.inflowTag}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-700">Order Sales</td>
                  <td className="py-3.5 px-4 font-medium text-stone-900">Order {ord.orderNumber} ({ord.customerName})</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">+ {formatMYR(ord.totalAmount)}</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-[10px] font-bold text-stone-400">Auto</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH PENGELUARAN */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-4 text-xs relative">
            <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#800020]">{t.adminCashflow.addExpenseBtn}</h3>
                <p className="text-stone-500 text-[11px]">Kurangi net cashflow secara langsung.</p>
              </div>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4 pt-1">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Tanggal</label>
                <input type="date" required value={newExpDate} onChange={e => setNewExpDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-mono focus:outline-none focus:border-[#800020]" />
              </div>
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Kategori</label>
                <select value={newExpCategory} onChange={e => setNewExpCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]">
                  <option value="Pembelian Stok (HPP)">Pembelian Stok (HPP)</option>
                  <option value="Biaya Packaging">Biaya Packaging & Kardus</option>
                  <option value="Biaya Kurir & Logistik">Biaya Kurir & Logistik</option>
                  <option value="Operasional Gudang">Operasional Gudang & Listrik</option>
                  <option value="Pengeluaran Lainnya">Pengeluaran Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Deskripsi Transaksi</label>
                <input type="text" required placeholder="e.g. Restok tepung semolina 25kg" value={newExpTitle} onChange={e => setNewExpTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]" />
              </div>
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Jumlah (MYR)</label>
                <input type="number" step="0.01" required placeholder="0.00" value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold focus:outline-none focus:border-[#800020]" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl">Batal</button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold rounded-xl shadow">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
