'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Order, OrderStatus } from '@/types';
import { formatMYR } from '@/lib/currency';
import { formatWhatsAppNumber } from '@/lib/whatsapp';
import { ShoppingBag, Search, Truck, Clock, CheckCircle2, XCircle, ArrowRight, MessageCircle, Trash2, Check, X, AlertTriangle } from 'lucide-react';

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>(db.getOrders());

  useEffect(() => {
    const loadLiveData = async () => {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('fbs_deleted_order_ids') || '[]');
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const cleanOrders = data.orders.filter((o: any) => !deletedIds.includes(o.id) && !deletedIds.includes(o.orderNumber));
          setOrders(cleanOrders);
          localStorage.setItem('fbs_orders', JSON.stringify(cleanOrders));
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch server orders in AdminOrdersPage:', e);
      }
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
    const deletedIds: string[] = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('fbs_deleted_order_ids') || '[]') : [];
    if (deletedIds.includes(o.id) || deletedIds.includes(o.orderNumber)) return false;

    const matchStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchSearch = 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    return matchStatus && matchSearch;
  });

  const statuses: OrderStatus[] = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCEL_REQUESTED', 'CANCELLED'];

  const [confirmModal, setConfirmModal] = useState<{
    type: string;
    title: string;
    message: string;
    confirmBtnText: string;
    confirmBtnClass: string;
    action: () => void;
  } | null>(null);

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    setConfirmModal({
      type: 'DELETE',
      title: 'Hapus Pesanan Dari Database',
      message: `Apakah Anda yakin ingin menghapus pesanan ${orderNumber}? Data yang dihapus dari database terpusat tidak dapat dikembalikan lagi.`,
      confirmBtnText: 'Ya, Hapus Permanen',
      confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
      action: async () => {
        db.deleteOrder(orderId);
        if (orderNumber) db.deleteOrder(orderNumber);

        setOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId && o.id !== orderNumber && o.orderNumber !== orderNumber));

        try {
          await fetch(`/api/orders?deleteId=${encodeURIComponent(orderId)}`, { method: 'DELETE' });
          if (orderNumber) {
            await fetch(`/api/orders?deleteId=${encodeURIComponent(orderNumber)}`, { method: 'DELETE' });
          }
        } catch (e) {}

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('fbs_db_updated'));
        }
      }
    });
  };

  const handleApproveCancel = (orderId: string, orderNumber: string) => {
    setConfirmModal({
      type: 'APPROVE',
      title: 'Setujui Pembatalan Pelanggan',
      message: `Setujui permohonan pembatalan pesanan ${orderNumber}? Stok produk akan otomatis dikembalikan ke inventaris toko.`,
      confirmBtnText: '✅ Setujui Pembatalan',
      confirmBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      action: () => {
        const updated = db.updateOrderStatusAndTracking(orderId, 'CANCELLED');
        if (updated) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'CANCELLED' } : o));
        }
      }
    });
  };

  const handleRejectCancel = (orderId: string, orderNumber: string) => {
    setConfirmModal({
      type: 'REJECT',
      title: 'Tolak Pembatalan Pelanggan',
      message: `Tolak permohonan pembatalan pesanan ${orderNumber}? Pesanan akan tetap diproses secara normal.`,
      confirmBtnText: '❌ Tolak Pembatalan',
      confirmBtnClass: 'bg-[#800020] hover:bg-red-900 text-white',
      action: () => {
        const updated = db.updateOrderStatusAndTracking(orderId, 'CONFIRMED');
        if (updated) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'CONFIRMED' } : o));
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">{t.adminExtra.ordersTitle}</h1>
          <p className="text-xs text-stone-500 mt-0.5">{t.adminExtra.ordersSubtitle}</p>
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
            {t.common.all} ({orders.length})
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
            placeholder={t.adminOrders.searchPlaceholder}
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
                <th className="p-4">{t.adminExtra.ordersThPhoto}</th>
                <th className="p-4">{t.adminExtra.ordersThOrderNo}</th>
                <th className="p-4">{t.adminExtra.ordersThCustomer}</th>
                <th className="p-4">{t.adminExtra.ordersThTotal}</th>
                <th className="p-4">{t.adminExtra.ordersThStatus}</th>
                <th className="p-4 text-right">{t.adminExtra.ordersThAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    {t.adminExtra.ordersNoOrders}
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
                              {firstItem ? firstItem.productName : t.adminExtra.bakingPackage}
                            </span>
                            <span className="text-[11px] text-stone-500 block truncate">
                              {firstItem ? `${t.adminExtra.variant}: ${firstItem.variantName}` : `${o.items?.length || 1} ${t.adminExtra.item}`}
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
                          o.orderStatus === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 
                          o.orderStatus === 'CANCEL_REQUESTED' ? 'bg-amber-500 text-stone-950 font-black animate-pulse' :
                          o.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.orderStatus === 'CANCEL_REQUESTED' ? '⚠️ MINTA BATAL' : o.orderStatus}
                        </span>
                        {o.orderStatus === 'CANCEL_REQUESTED' && (
                          <span className="block text-[10px] font-bold text-amber-700">Pelanggan Minta Batal</span>
                        )}
                        {o.trackingNumber ? (
                          <span className="block text-[11px] font-mono text-emerald-700 font-bold">
                            {o.courierName}: {o.trackingNumber}
                          </span>
                        ) : (
                          o.orderStatus !== 'CANCEL_REQUESTED' && o.orderStatus !== 'CANCELLED' && (
                            <span className="block text-[10px] text-amber-700 italic">{t.adminExtra.ordersResiPending}</span>
                          )
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {o.orderStatus === 'CANCEL_REQUESTED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveCancel(o.id, o.orderNumber)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow flex items-center gap-1"
                                title="Setujui Pembatalan & Kembalikan Stok"
                              >
                                <Check className="w-3.5 h-3.5" /> Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectCancel(o.id, o.orderNumber)}
                                className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold rounded-lg shadow flex items-center gap-1"
                                title="Tolak Pembatalan & Lanjutkan Proses"
                              >
                                <X className="w-3.5 h-3.5" /> Tolak
                              </button>
                            </>
                          )}

                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="px-3 py-1.5 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-1 transition-all active:scale-95"
                          >
                            {t.adminExtra.processOrder} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                            className="p-1.5 bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-xl border border-stone-200 transition-colors"
                            title="Hapus Order Dari Database"
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

      {/* CUSTOM ADMIN CONFIRMATION MODAL DIALOG */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-2xl space-y-5 text-center relative animate-fade-in">
            <button 
              onClick={() => setConfirmModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border-4 ${
              confirmModal.type === 'DELETE' 
                ? 'bg-red-100 text-red-600 border-red-50' 
                : 'bg-amber-100 text-amber-600 border-amber-50'
            }`}>
              {confirmModal.type === 'DELETE' ? (
                <Trash2 className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              )}
            </div>

            <div>
              <h3 className="font-serif text-2xl font-extrabold text-[#800020]">
                {confirmModal.title}
              </h3>
              <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-colors"
              >
                Batal (Tutup)
              </button>

              <button
                type="button"
                onClick={() => {
                  const act = confirmModal.action;
                  setConfirmModal(null);
                  act();
                }}
                className={`py-3 px-4 rounded-2xl font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 ${confirmModal.confirmBtnClass}`}
              >
                {confirmModal.confirmBtnText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
