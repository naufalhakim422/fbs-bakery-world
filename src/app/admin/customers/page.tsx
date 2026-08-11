'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Customer } from '@/types';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { Users, Phone, Search, Award, ShieldCheck, ArrowUpRight, Sparkles, Trash2, Ban, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AdminCustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const loadCustomers = () => {
    setCustomers(db.getCustomers());
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.customers)) {
          setCustomers(data.customers);
          localStorage.setItem('fbs_customers', JSON.stringify(data.customers));
        }
      })
      .catch(err => console.warn('Customer live sync error:', err));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleUpdateTier = (id: string, newType: 'RETAIL' | 'WHOLESALE' | 'VIP') => {
    const list = db.getCustomers();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx].customerType = newType;
      localStorage.setItem('fbs_customers', JSON.stringify(list));
      setCustomers([...list]);
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, customerType: newType, isAdminUpdate: true }),
      }).catch(err => console.warn('Sync tier error:', err));
    }
  };

  const handleUpdateStatus = (id: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    db.updateCustomerStatus(id, newStatus);
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, accountStatus: newStatus, isActive: newStatus === 'ACTIVE' } : c));
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, accountStatus: newStatus, isAdminUpdate: true }),
    }).catch(err => console.warn('Sync status error:', err));
  };

  const confirmDeleteCustomer = () => {
    if (!deleteTarget) return;
    db.deleteCustomer(deleteTarget.id);
    setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const filtered = customers.filter(c => {
    const matchType = selectedType === 'ALL' || c.customerType === selectedType;
    const matchSearch = 
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      ((c.email || '').toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const retailCount = customers.filter(c => c.customerType === 'RETAIL').length;
  const wholesaleCount = customers.filter(c => c.customerType === 'WHOLESALE').length;
  const vipCount = customers.filter(c => c.customerType === 'VIP').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">{t.adminCustomers.title}</h1>
          <p className="text-xs text-stone-500 mt-0.5">{t.adminCustomers.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-[#800020] text-[#D4AF37] font-bold text-xs rounded-full">
            Total Database: {customers.length}
          </span>
        </div>
      </div>

      {/* Member Tier Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div 
          onClick={() => setSelectedType('RETAIL')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedType === 'RETAIL' ? 'bg-[#800020] text-white border-[#800020] shadow-md' : 'bg-white text-stone-800 border-stone-200 hover:border-[#800020]'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider">{t.adminCustomers.filterRetail} Members</span>
            <Users className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="font-serif text-2xl font-bold mt-1">{retailCount}</h3>
        </div>

        <div 
          onClick={() => setSelectedType('VIP')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedType === 'VIP' ? 'bg-[#800020] text-white border-[#800020] shadow-md' : 'bg-white text-stone-800 border-stone-200 hover:border-[#800020]'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-[#D4AF37]">
              <Sparkles className="w-4 h-4" /> VIP Members
            </span>
            <Award className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h3 className="font-serif text-2xl font-bold mt-1">{vipCount}</h3>
        </div>

        <div 
          onClick={() => setSelectedType('WHOLESALE')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedType === 'WHOLESALE' ? 'bg-[#800020] text-white border-[#800020] shadow-md' : 'bg-white text-stone-800 border-stone-200 hover:border-[#800020]'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider">{t.adminCustomers.filterWholesale} B2B</span>
            <ShieldCheck className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="font-serif text-2xl font-bold mt-1">{wholesaleCount}</h3>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'ALL' ? 'bg-[#800020] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            Semua ({customers.length})
          </button>
          <button
            onClick={() => setSelectedType('RETAIL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'RETAIL' ? 'bg-[#800020] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            {t.adminCustomers.filterRetail} ({retailCount})
          </button>
          <button
            onClick={() => setSelectedType('VIP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'VIP' ? 'bg-[#800020] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            VIP ({vipCount})
          </button>
          <button
            onClick={() => setSelectedType('WHOLESALE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'WHOLESALE' ? 'bg-[#800020] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            {t.adminCustomers.filterWholesale} B2B ({wholesaleCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input 
            type="text"
            placeholder={t.adminCustomers.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customer Database Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase tracking-wider font-bold text-[11px]">
                <th className="p-4">{t.adminCustomers.thName}</th>
                <th className="p-4">STATUS AKUN</th>
                <th className="p-4">{t.adminCustomers.thPhone} & {t.adminCustomers.thEmail}</th>
                <th className="p-4">MEMBER TIER</th>
                <th className="p-4">{t.checkout.deliveryAddress}</th>
                <th className="p-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    {t.adminCustomers.noCustomers}
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const status = c.accountStatus || (c.isActive === false ? 'SUSPENDED' : 'ACTIVE');

                  return (
                    <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                      
                      {/* NAMA */}
                      <td className="p-4 font-bold text-stone-900">
                        <span className="block text-sm font-extrabold">{c.name}</span>
                        <span className="text-[10px] text-stone-400 font-normal">ID: {c.id}</span>
                      </td>

                      {/* STATUS BADGE */}
                      <td className="p-4">
                        {status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AKTIF
                          </span>
                        )}
                        {status === 'SUSPENDED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg text-[11px] font-bold border border-amber-300">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> SUSPENDED
                          </span>
                        )}
                        {status === 'BANNED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-900 rounded-lg text-[11px] font-bold border border-red-300">
                            <Ban className="w-3.5 h-3.5 text-red-600" /> BANNED
                          </span>
                        )}
                      </td>

                      {/* KONTAK */}
                      <td className="p-4">
                        <span className="font-mono text-stone-900 font-bold block">{c.phone || '-'}</span>
                        <span className="text-stone-500 font-mono text-[11px] block">{c.email || '-'}</span>
                      </td>

                      {/* TIER */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase ${
                          c.customerType === 'VIP' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                          c.customerType === 'WHOLESALE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {c.customerType}
                        </span>
                      </td>

                      {/* ALAMAT */}
                      <td className="p-4 text-stone-600 text-[11px]">
                        {c.address ? `${c.address}, ${c.city}` : <span className="text-stone-400 italic">-</span>}
                      </td>

                      {/* AKSI CONTROLS */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* STATUS CONTROL SELECTOR */}
                          <select
                            value={status}
                            onChange={(e) => handleUpdateStatus(c.id, e.target.value as any)}
                            className={`px-2 py-1 border rounded-xl text-xs font-bold focus:outline-none ${
                              status === 'BANNED' ? 'bg-red-50 text-red-800 border-red-300' :
                              status === 'SUSPENDED' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                              'bg-white text-stone-800 border-stone-300'
                            }`}
                          >
                            <option value="ACTIVE">🟢 Aktif</option>
                            <option value="SUSPENDED">🟡 Suspended</option>
                            <option value="BANNED">🔴 Banned</option>
                          </select>

                          {/* TIER CONTROL SELECTOR */}
                          <select
                            value={c.customerType}
                            onChange={(e) => handleUpdateTier(c.id, e.target.value as any)}
                            className="px-2 py-1 border border-stone-300 rounded-xl text-xs bg-white text-stone-800 font-bold focus:outline-none focus:border-[#800020]"
                          >
                            <option value="RETAIL">Tier: RETAIL</option>
                            <option value="VIP">Tier: VIP</option>
                            <option value="WHOLESALE">Tier: WHOLESALE B2B</option>
                          </select>

                          {/* HAPUS PELANGGAN BUTTON */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            title="Hapus Pelanggan dari Database"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Customer Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteCustomer}
        title="Hapus Pelanggan dari Database"
        message={`Apakah Anda yakin ingin menghapus pelanggan "${deleteTarget?.name}" (${deleteTarget?.email || deleteTarget?.phone}) dari database? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus Permanen"
        type="danger"
      />

    </div>
  );
}
