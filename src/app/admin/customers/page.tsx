'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { Users, Phone, Search, Award, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    setCustomers(db.getCustomers());
  }, []);

  const handleUpdateTier = (id: string, newType: 'RETAIL' | 'WHOLESALE' | 'VIP') => {
    const list = db.getCustomers();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx].customerType = newType;
      localStorage.setItem('fbs_customers', JSON.stringify(list));
      setCustomers([...list]);
      alert(`Customer tier updated to ${newType}!`);
    }
  };

  const filtered = customers.filter(c => {
    const matchType = selectedType === 'ALL' || c.customerType === selectedType;
    const matchSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
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
          <h1 className="font-serif text-2xl font-bold text-stone-900">CRM & Customer Member Tiers</h1>
          <p className="text-xs text-stone-500 mt-0.5">Manage customer database, frequent buyer tiers (RETAIL, VIP, WHOLESALE), and member upgrades.</p>
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
            <span className="text-xs font-bold uppercase tracking-wider">Retail Members</span>
            <Users className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="font-serif text-2xl font-bold mt-1">{retailCount}</h3>
          <p className="text-[11px] opacity-80 mt-0.5">Default tier for new registered & guest buyers.</p>
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
          <p className="text-[11px] opacity-80 mt-0.5">Frequent buyers with high order volume.</p>
        </div>

        <div 
          onClick={() => setSelectedType('WHOLESALE')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedType === 'WHOLESALE' ? 'bg-[#800020] text-white border-[#800020] shadow-md' : 'bg-white text-stone-800 border-stone-200 hover:border-[#800020]'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider">Wholesale B2B</span>
            <ShieldCheck className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="font-serif text-2xl font-bold mt-1">{wholesaleCount}</h3>
          <p className="text-[11px] opacity-80 mt-0.5">Bakery, Cafe & Restaurant business accounts.</p>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'ALL' ? 'bg-[#800020] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            All Tiers ({customers.length})
          </button>
          <button
            onClick={() => setSelectedType('RETAIL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'RETAIL' ? 'bg-[#800020] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            Retail ({retailCount})
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
            Wholesale B2B ({wholesaleCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input 
            type="text"
            placeholder="Search name, phone, email..."
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
                <th className="p-4">NAMA PELANGGAN</th>
                <th className="p-4">METODE LOGIN (PROVIDER)</th>
                <th className="p-4">KONTAK & EMAIL</th>
                <th className="p-4">MEMBER TIER</th>
                <th className="p-4">ALAMAT PENGIRIMAN</th>
                <th className="p-4 text-right">AKSI ADMIN (TIER)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    No customers found in this member tier.
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const provider = (c as any).provider || (c.email?.includes('gmail') ? 'GOOGLE' : c.email?.includes('fb') ? 'FACEBOOK' : 'FORM');

                  return (
                    <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                      
                      {/* NAMA */}
                      <td className="p-4 font-bold text-stone-900">
                        <span className="block text-sm font-extrabold">{c.name}</span>
                        <span className="text-[10px] text-stone-400 font-normal">ID: {c.id}</span>
                      </td>

                      {/* PROVIDER BADGE */}
                      <td className="p-4">
                        {provider === 'GOOGLE' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-200">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            Google Account
                          </span>
                        )}
                        {provider === 'FACEBOOK' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1877F2]/10 text-[#1877F2] rounded-lg text-[11px] font-bold border border-[#1877F2]/20">
                            <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook Account
                          </span>
                        )}
                        {(provider === 'EMAIL' || provider === 'FORM') && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200">
                            ✉️ Email Form
                          </span>
                        )}
                        {provider === 'PHONE' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200">
                            📱 WhatsApp Phone
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
                        {c.address ? `${c.address}, ${c.city}` : <span className="text-stone-400 italic">Belum Diisi</span>}
                      </td>

                      {/* AKSI */}
                      <td className="p-4 text-right">
                        <select
                          value={c.customerType}
                          onChange={(e) => handleUpdateTier(c.id, e.target.value as any)}
                          className="px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs bg-white text-stone-800 font-bold focus:outline-none focus:border-[#800020]"
                        >
                          <option value="RETAIL">Tier: RETAIL</option>
                          <option value="VIP">Tier: VIP</option>
                          <option value="WHOLESALE">Tier: WHOLESALE B2B</option>
                        </select>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
