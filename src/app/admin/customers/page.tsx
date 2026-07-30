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
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase tracking-wider font-bold">
                <th className="p-4">Customer Name</th>
                <th className="p-4">WhatsApp Phone</th>
                <th className="p-4">Current Member Tier</th>
                <th className="p-4">Delivery Address</th>
                <th className="p-4 text-right">Upgrade / Change Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    No customers found in this member tier.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="p-4 font-bold text-stone-900">{c.name}</td>
                    <td className="p-4 font-mono text-stone-700">{c.phone}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-md uppercase ${
                        c.customerType === 'VIP' 
                          ? 'bg-[#800020] text-[#D4AF37]' 
                          : c.customerType === 'WHOLESALE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-100 text-stone-800'
                      }`}>
                        {c.customerType} MEMBER
                      </span>
                    </td>
                    <td className="p-4 text-stone-600 max-w-xs truncate">{c.address}, {c.city}, {c.state}</td>
                    <td className="p-4 text-right">
                      <select
                        value={c.customerType}
                        onChange={(e) => handleUpdateTier(c.id, e.target.value as any)}
                        className="px-2.5 py-1 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 bg-white"
                      >
                        <option value="RETAIL">Set as RETAIL</option>
                        <option value="VIP">Upgrade to VIP ⭐</option>
                        <option value="WHOLESALE">Set as WHOLESALE B2B</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
