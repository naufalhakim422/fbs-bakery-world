'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { useNotification } from '@/lib/notification-context';
import { recordAuditLog } from '@/lib/audit';
import { ShippingCourier, ShippingState, WeightBracket, ShippingRate } from '@/types';
import { formatMYR } from '@/lib/currency';
import { 
  Truck, 
  MapPin, 
  Scale, 
  DollarSign, 
  Settings as SettingsIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Filter, 
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown
} from 'lucide-react';

export default function AdminShippingPage() {
  const { language } = useLanguage();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'couriers' | 'states' | 'brackets' | 'rates' | 'settings'>('couriers');

  // Data states
  const [couriers, setCouriers] = useState<ShippingCourier[]>([]);
  const [states, setStates] = useState<ShippingState[]>([]);
  const [brackets, setBrackets] = useState<WeightBracket[]>([]);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Partial<ShippingCourier> | null>(null);

  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<Partial<ShippingState> | null>(null);

  const [isBracketModalOpen, setIsBracketModalOpen] = useState(false);
  const [editingBracket, setEditingBracket] = useState<Partial<WeightBracket> | null>(null);

  const [selectedRateCourierId, setSelectedRateCourierId] = useState<string>('');

  const loadData = () => {
    const loadedCouriers = db.getCouriers();
    const loadedStates = db.getShippingStates();
    const loadedBrackets = db.getWeightBrackets();
    const loadedRates = db.getShippingRates();

    setCouriers(loadedCouriers);
    setStates(loadedStates);
    setBrackets(loadedBrackets);
    setRates(loadedRates);

    if (loadedCouriers.length > 0 && !selectedRateCourierId) {
      setSelectedRateCourierId(loadedCouriers[0].id);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('fbs_db_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('fbs_db_updated', loadData);
    };
  }, []);

  // Courier Actions
  const handleSaveCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourier || !editingCourier.name) return;
    db.saveCourier(editingCourier);
    recordAuditLog('Save Courier', 'SHIPPING', `Saved courier ${editingCourier.name}`);
    showToast(language === 'ID' ? 'Kurir berhasil disimpan!' : 'Kurier berjaya disimpan!', 'success');
    setIsCourierModalOpen(false);
    setEditingCourier(null);
    loadData();
  };

  const handleToggleCourier = (id: string, name: string) => {
    db.toggleCourierStatus(id);
    recordAuditLog('Toggle Courier Status', 'SHIPPING', `Toggled status for ${name}`);
    showToast(language === 'ID' ? 'Status kurir diperbarui!' : 'Status kurier dikemas kini!', 'success');
    loadData();
  };

  const handleDeleteCourier = (id: string, name: string) => {
    if (confirm(`Hapus kurir ${name}?`)) {
      db.deleteCourier(id);
      recordAuditLog('Delete Courier', 'SHIPPING', `Deleted courier ${name}`);
      showToast(language === 'ID' ? 'Kurir berhasil dihapus!' : 'Kurier berjaya dipadam!', 'info');
      loadData();
    }
  };

  // State Actions
  const handleSaveState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingState || !editingState.name) return;
    db.saveShippingState(editingState);
    recordAuditLog('Save State', 'SHIPPING', `Saved state ${editingState.name}`);
    showToast(language === 'ID' ? 'Negeri/Provinsi disimpan!' : 'Negeri berjaya disimpan!', 'success');
    setIsStateModalOpen(false);
    setEditingState(null);
    loadData();
  };

  const handleToggleState = (id: string, name: string) => {
    db.toggleStateStatus(id);
    recordAuditLog('Toggle State Status', 'SHIPPING', `Toggled status for state ${name}`);
    showToast(language === 'ID' ? 'Status negeri diperbarui!' : 'Status negeri dikemas kini!', 'success');
    loadData();
  };

  const handleDeleteState = (id: string, name: string) => {
    if (confirm(`Hapus negeri ${name}?`)) {
      db.deleteShippingState(id);
      recordAuditLog('Delete State', 'SHIPPING', `Deleted state ${name}`);
      showToast(language === 'ID' ? 'Negeri dihapus!' : 'Negeri dipadam!', 'info');
      loadData();
    }
  };

  // Bracket Actions
  const handleSaveBracket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBracket || !editingBracket.name) return;
    db.saveWeightBracket(editingBracket);
    recordAuditLog('Save Weight Bracket', 'SHIPPING', `Saved weight bracket ${editingBracket.name}`);
    showToast(language === 'ID' ? 'Rentang berat disimpan!' : 'Julat berat berjaya disimpan!', 'success');
    setIsBracketModalOpen(false);
    setEditingBracket(null);
    loadData();
  };

  const handleDeleteBracket = (id: string, name: string) => {
    if (confirm(`Hapus rentang berat ${name}?`)) {
      db.deleteWeightBracket(id);
      recordAuditLog('Delete Weight Bracket', 'SHIPPING', `Deleted weight bracket ${name}`);
      showToast(language === 'ID' ? 'Rentang berat dihapus!' : 'Julat berat dipadam!', 'info');
      loadData();
    }
  };

  // Rate Matrix Price Change
  const handleRatePriceChange = (courierId: string, stateCode: string, weightBracketId: string, price: number) => {
    db.saveShippingRate({
      courierId,
      stateCode,
      weightBracketId,
      price: Math.max(0, price),
    });
    recordAuditLog('Update Shipping Rate', 'SHIPPING', `Updated rate for courier ${courierId}, region ${stateCode}, bracket ${weightBracketId} to RM ${price}`);
    loadData();
  };

  // Filtered lists
  const filteredCouriers = couriers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredStates = states.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
            <Truck className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest">Sistem Pengurusan Penghantaran</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold">
            {language === 'ID' ? 'Manajemen Pengiriman & Ongkir' : 'Pengurusan Penghantaran & Kadar Ongkir'}
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Kelola kurir ekspedisi, wilayah negeri, rentang berat (weight brackets), dan matriks tarif ongkos kirim.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-stone-800 p-1.5 rounded-2xl border border-stone-700 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('couriers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'couriers' ? 'bg-[#800020] text-white shadow-md' : 'text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Truck className="w-4 h-4" /> Kurir ({couriers.length})
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'states' ? 'bg-[#800020] text-white shadow-md' : 'text-stone-300 hover:bg-stone-700'
            }`}
          >
            <MapPin className="w-4 h-4" /> Wilayah Negeri ({states.length})
          </button>
          <button
            onClick={() => setActiveTab('brackets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'brackets' ? 'bg-[#800020] text-white shadow-md' : 'text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Scale className="w-4 h-4" /> Rentang Berat ({brackets.length})
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rates' ? 'bg-[#800020] text-white shadow-md' : 'text-stone-300 hover:bg-stone-700'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Matriks Ongkir
          </button>
        </div>
      </div>

      {/* SEARCH BAR (For Couriers & States) */}
      {(activeTab === 'couriers' || activeTab === 'states') && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={activeTab === 'couriers' ? 'Cari nama atau kode kurir...' : 'Cari nama atau kode negeri...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
            />
          </div>
          {activeTab === 'couriers' && (
            <button
              onClick={() => {
                setEditingCourier({ name: '', code: '', logo: '🚚', status: true, sortOrder: couriers.length + 1 });
                setIsCourierModalOpen(true);
              }}
              className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah Kurir
            </button>
          )}
          {activeTab === 'states' && (
            <button
              onClick={() => {
                setEditingState({ name: '', code: '', region: 'PENINSULAR', status: true });
                setIsStateModalOpen(true);
              }}
              className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah Negeri
            </button>
          )}
        </div>
      )}

      {/* TAB 1: COURIERS MANAGEMENT */}
      {activeTab === 'couriers' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden">
          <div className="p-5 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
            <h2 className="font-serif font-bold text-stone-800 text-lg">Daftar Kurir Ekspedeisi ({filteredCouriers.length})</h2>
            <span className="text-xs text-stone-500 font-medium">Klik status untuk Aktifkan / Nonaktifkan kurir</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-100 uppercase text-[11px] font-bold text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Kurir</th>
                  <th className="py-3.5 px-4">Kode Unique</th>
                  <th className="py-3.5 px-4">Urutan (Sort)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCouriers.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-stone-100 rounded-xl">{c.logo}</span>
                        <span className="font-bold text-stone-900 text-sm">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-600">{c.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-700">{c.sortOrder}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleCourier(c.id, c.name)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                          c.status ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {c.status ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                        {c.status ? 'ON (Aktif)' : 'OFF (Non-aktif)'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingCourier(c);
                            setIsCourierModalOpen(true);
                          }}
                          className="p-2 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Kurir"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourier(c.id, c.name)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Kurir"
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
      )}

      {/* TAB 2: STATES MANAGEMENT */}
      {activeTab === 'states' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden">
          <div className="p-5 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
            <h2 className="font-serif font-bold text-stone-800 text-lg">Daftar Wilayah Negeri Malaysia ({filteredStates.length})</h2>
            <span className="text-xs text-stone-500 font-medium">Semenanjung &amp; Malaysia Timur</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-100 uppercase text-[11px] font-bold text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Nama Negeri</th>
                  <th className="py-3.5 px-4">Kode State</th>
                  <th className="py-3.5 px-4">Wilayah (Region)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStates.map(s => (
                  <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{s.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-600">{s.code}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        s.region === 'EAST_MALAYSIA' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {s.region === 'EAST_MALAYSIA' ? 'Malaysia Timur (Borneo)' : 'Semenanjung Malaysia'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleState(s.id, s.name)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                          s.status ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {s.status ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                        {s.status ? 'ON (Aktif)' : 'OFF (Non-aktif)'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingState(s);
                            setIsStateModalOpen(true);
                          }}
                          className="p-2 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteState(s.id, s.name)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
      )}

      {/* TAB 3: WEIGHT BRACKETS MANAGEMENT */}
      {activeTab === 'brackets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div>
              <h2 className="font-serif font-bold text-stone-800 text-lg">Rentang Berat Pesanan (Weight Brackets)</h2>
              <p className="text-xs text-stone-500">Batas minimum &amp; maksimum berat paket untuk perhitungan otomatis ongkir.</p>
            </div>
            <button
              onClick={() => {
                setEditingBracket({ name: '', minWeightGrams: 0, maxWeightGrams: 1000, sortOrder: brackets.length + 1 });
                setIsBracketModalOpen(true);
              }}
              className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah Rentang Berat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brackets.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-serif font-extrabold text-[#800020] text-lg">{b.name}</span>
                  <span className="text-xs font-bold text-stone-400">Urutan #{b.sortOrder}</span>
                </div>

                <div className="text-xs space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Min Weight:</span>
                    <span className="font-mono font-bold text-stone-900">{b.minWeightGrams} g ({(b.minWeightGrams / 1000).toFixed(1)} kg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Weight:</span>
                    <span className="font-mono font-bold text-stone-900">{b.maxWeightGrams} g ({(b.maxWeightGrams / 1000).toFixed(1)} kg)</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setEditingBracket(b);
                      setIsBracketModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-[#800020] bg-stone-100 rounded-lg flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBracket(b.id, b.name)}
                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHIPPING RATES MATRIX */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">Matriks Tarif Ongkir Ekspedisi</h2>
              <p className="text-xs text-stone-500">Atur harga ongkos kirim (RM) untuk setiap kurir, wilayah/negeri, dan rentang berat paket.</p>
            </div>

            {/* Courier Selector for Rate Matrix */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700 uppercase">Pilih Kurir:</span>
              <select
                value={selectedRateCourierId}
                onChange={e => setSelectedRateCourierId(e.target.value)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-[#800020] bg-stone-50 focus:outline-none focus:border-[#800020]"
              >
                {couriers.map(c => (
                  <option key={c.id} value={c.id}>{c.logo} {c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-900 text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4 border-r border-stone-800">Wilayah / Region</th>
                  {brackets.map(b => (
                    <th key={b.id} className="py-3.5 px-4 text-center border-r border-stone-800 min-w-[110px]">
                      {b.name}
                      <span className="block text-[9px] text-stone-400 font-normal">{b.minWeightGrams}-{b.maxWeightGrams}g</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 border-b border-stone-200">

                {/* REGION 1: SEMENANJUNG MALAYSIA */}
                <tr className="bg-stone-50">
                  <td className="py-4 px-4 font-bold text-stone-900 border-r border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span>Semenanjung Malaysia (Tarif Standar)</span>
                    </div>
                  </td>
                  {brackets.map(b => {
                    const rate = rates.find(r => r.courierId === selectedRateCourierId && r.stateCode === 'PENINSULAR' && r.weightBracketId === b.id);
                    const currentPrice = rate ? rate.price : 8.00;

                    return (
                      <td key={b.id} className="py-3 px-3 text-center border-r border-stone-200">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-stone-400 font-bold text-[11px]">RM</span>
                          <input
                            type="number"
                            step="0.50"
                            min="0"
                            value={currentPrice}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                handleRatePriceChange(selectedRateCourierId, 'PENINSULAR', b.id, val);
                              }
                            }}
                            className="w-20 text-center font-serif font-extrabold text-sm text-[#800020] bg-white border border-stone-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* REGION 2: MALAYSIA TIMUR (SABAH & SARAWAK) */}
                <tr className="bg-amber-50/50">
                  <td className="py-4 px-4 font-bold text-stone-900 border-r border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                      <span>Malaysia Timur (Sabah, Sarawak, Labuan)</span>
                    </div>
                  </td>
                  {brackets.map(b => {
                    const rate = rates.find(r => r.courierId === selectedRateCourierId && r.stateCode === 'EAST_MALAYSIA' && r.weightBracketId === b.id);
                    const currentPrice = rate ? rate.price : 16.00;

                    return (
                      <td key={b.id} className="py-3 px-3 text-center border-r border-stone-200">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-stone-400 font-bold text-[11px]">RM</span>
                          <input
                            type="number"
                            step="0.50"
                            min="0"
                            value={currentPrice}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                handleRatePriceChange(selectedRateCourierId, 'EAST_MALAYSIA', b.id, val);
                              }
                            }}
                            className="w-20 text-center font-serif font-extrabold text-sm text-[#800020] bg-white border border-amber-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Perubahan tarif ongkir langsung tersimpan otomatis dan akan dipakai oleh kalkulator checkout pelanggan secara real-time.</span>
          </div>
        </div>
      )}

      {/* MODAL COURIER */}
      {isCourierModalOpen && editingCourier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingCourier.id ? 'Edit Kurir Ekspedi' : 'Tambah Kurir Baru'}
              </h3>
              <button onClick={() => setIsCourierModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-full text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourier} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Kurir</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: J&T Express"
                  value={editingCourier.name || ''}
                  onChange={e => setEditingCourier({ ...editingCourier, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Kode Unik Kurir</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: JNT"
                  value={editingCourier.code || ''}
                  onChange={e => setEditingCourier({ ...editingCourier, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Logo Emoji/Icon</label>
                  <input
                    type="text"
                    value={editingCourier.logo || '🚚'}
                    onChange={e => setEditingCourier({ ...editingCourier, logo: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-center text-lg focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Urutan Sort</label>
                  <input
                    type="number"
                    min="1"
                    value={editingCourier.sortOrder || 1}
                    onChange={e => setEditingCourier({ ...editingCourier, sortOrder: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourierModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Kurir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL STATE */}
      {isStateModalOpen && editingState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingState.id ? 'Edit Wilayah Negeri' : 'Tambah Negeri Baru'}
              </h3>
              <button onClick={() => setIsStateModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-full text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveState} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Negeri</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Selangor"
                  value={editingState.name || ''}
                  onChange={e => setEditingState({ ...editingState, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Kode State (Singkatan)</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: SGR"
                  value={editingState.code || ''}
                  onChange={e => setEditingState({ ...editingState, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Wilayah / Region</label>
                <select
                  value={editingState.region || 'PENINSULAR'}
                  onChange={e => setEditingState({ ...editingState, region: e.target.value as 'PENINSULAR' | 'EAST_MALAYSIA' })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                >
                  <option value="PENINSULAR">Semenanjung Malaysia</option>
                  <option value="EAST_MALAYSIA">Malaysia Timur (Sabah, Sarawak, Labuan)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Negeri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WEIGHT BRACKET */}
      {isBracketModalOpen && editingBracket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingBracket.id ? 'Edit Rentang Berat' : 'Tambah Rentang Berat Baru'}
              </h3>
              <button onClick={() => setIsBracketModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-full text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBracket} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Label Rentang</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 0 - 1 kg"
                  value={editingBracket.name || ''}
                  onChange={e => setEditingBracket({ ...editingBracket, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Min Berat (Gram)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingBracket.minWeightGrams ?? 0}
                    onChange={e => setEditingBracket({ ...editingBracket, minWeightGrams: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Max Berat (Gram)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingBracket.maxWeightGrams ?? 1000}
                    onChange={e => setEditingBracket({ ...editingBracket, maxWeightGrams: parseInt(e.target.value) || 1000 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Urutan (Sort Order)</label>
                <input
                  type="number"
                  min="1"
                  value={editingBracket.sortOrder || 1}
                  onChange={e => setEditingBracket({ ...editingBracket, sortOrder: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBracketModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Rentang Berat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
