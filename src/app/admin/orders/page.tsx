'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Order, OrderStatus } from '@/types';
import { formatMYR } from '@/lib/currency';
import { formatWhatsAppNumber } from '@/lib/whatsapp';
import { ShoppingBag, Search, Truck, Clock, CheckCircle2, XCircle, ArrowRight, MessageCircle } from 'lucide-react';

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>(db.getOrders());

  useEffect(() => {
    const loadLiveData = () => {
      setOrders(db.getOrders());
    };
    loadLiveData();

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchSearch = 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    return matchStatus && matchSearch;
  });

  const statuses: OrderStatus[] = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Order Management</h1>
          <p className="text-xs text-stone-500 mt-0.5">Manage customer WhatsApp orders, verify payments, and issue courier resi tracking numbers.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL' ? 'bg-[#800020] text-white shadow' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {statuses.map(s => {
            const count = orders.filter(o => o.orderStatus === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === s ? 'bg-[#800020] text-white shadow' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder="Search by Order Number (#FBS-...), Customer Name, or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase tracking-wider font-bold text-[11px]">
                <th className="p-4">FOTO & PRODUK DIBELI</th>
                <th className="p-4">NO. PESANAN</th>
                <th className="p-4">PELANGGAN WHATSAPP</th>
                <th className="p-4">TOTAL BAYAR</th>
                <th className="p-4">STATUS & RESI</th>
                <th className="p-4 text-right">AKSI ADMIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(o => {
                  const firstItem = o.items && o.items[0];
                  const itemImg = firstItem?.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop';
                  const hasMoreItems = o.items && o.items.length > 1;

                  return (
                    <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                      
                      {/* PRODUCT THUMBNAIL & TITLE */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0 shadow-sm">
                            <img src={itemImg} alt="Product Thumbnail" className="w-full h-full object-cover" />
                            {hasMoreItems && (
                              <span className="absolute bottom-0 right-0 bg-[#800020] text-white text-[9px] font-black px-1.5 py-0.5 rounded-tl-md">
                                +{o.items.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="max-w-[200px]">
                            <span className="font-extrabold text-stone-900 block truncate">
                              {firstItem ? firstItem.productName : 'Paket Bahan Kue'}
                            </span>
                            <span className="text-[11px] text-stone-500 block truncate">
                              {firstItem ? `Varian: ${firstItem.variantName}` : `${o.items?.length || 1} Item`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ORDER NUMBER */}
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 bg-[#800020]/10 text-[#800020] rounded-lg font-mono font-bold text-xs border border-[#800020]/20">
                          {o.orderNumber}
                        </span>
                      </td>

                      {/* CUSTOMER DETAILS & DIRECT WA CHAT */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold text-stone-900 block">{o.customerName}</span>
                            <span className="text-stone-500 text-[11px] font-mono block">{o.customerPhone}</span>
                            <span className="text-stone-400 text-[10px] block truncate max-w-[150px]">{o.address}, {o.city}</span>
                          </div>
                          <a
                            href={`https://wa.me/${formatWhatsAppNumber(o.customerPhone)}?text=Halo%20${encodeURIComponent(o.customerName)},%20mengenai%20pesanan%20${o.orderNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-200 flex-shrink-0"
                            title="Chat via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>

                      {/* TOTAL AMOUNT */}
                      <td className="p-4 font-extrabold text-[#800020] text-sm">
                        {formatMYR(o.totalAmount)}
                      </td>

                      {/* STATUS & RESI */}
                      <td className="p-4 space-y-1">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase inline-block ${
                          o.orderStatus === 'SHIPPED' ? 'bg-emerald-100 text-emerald-800' :
                          o.orderStatus === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.orderStatus}
                        </span>
                        {o.trackingNumber ? (
                          <span className="block text-[11px] font-mono text-emerald-700 font-bold">
                            {o.courierName}: {o.trackingNumber}
                          </span>
                        ) : (
                          <span className="block text-[10px] text-amber-700 italic">Resi Pending</span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="px-3.5 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-1 transition-all active:scale-95"
                        >
                          Kelola Resi <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
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
