'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatMYR } from '@/lib/currency';
import { formatWhatsAppNumber, cleanPhoneNumber } from '@/lib/whatsapp';
import { normalizeToFrontendStatus } from '@/types';
import {
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  Trash2,
  ArrowRight,
  MessageCircle,
  X,
  Send,
  Search,
} from 'lucide-react';

interface OrderItemData {
  id: string;
  productName: string;
  variantName?: string | null;
  mainImage?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface SerializedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  totalAmount: number;
  orderStatus: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  items: OrderItemData[];
  createdAt: string;
}

const getNextStatus = (currentStatus: string): { nextStatus: string; label: string; icon: any } | null => {
  const s = normalizeToFrontendStatus(currentStatus).toUpperCase();
  if (s === 'PENDING' || s === 'PENDING_PAYMENT' || s === 'NEW') {
    return { nextStatus: 'Paid', label: 'Konfirmasi Pembayaran', icon: CreditCard };
  }
  if (s === 'PAID' || s === 'CONFIRMED' || s === 'PAYMENT_VERIFIED') {
    return { nextStatus: 'Packing', label: 'Mulai Pengemasan', icon: Package };
  }
  if (s === 'PACKING' || s === 'PROCESSING' || s === 'READY_TO_SHIP') {
    return { nextStatus: 'Shipped', label: 'Kirim Pesanan (Resi)', icon: Truck };
  }
  if (s === 'SHIPPED' || s === 'SHIPPING') {
    return { nextStatus: 'Completed', label: 'Selesaikan Pesanan', icon: CheckCircle2 };
  }
  return null;
};

import { db } from '@/lib/db';

export function OrderTableInteractive({
  initialOrders,
  adminBase = '/admin2026',
}: {
  initialOrders: SerializedOrder[];
  adminBase?: string;
}) {
  const router = useRouter();
  const [ordersList, setOrdersList] = useState<SerializedOrder[]>(initialOrders || []);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    let localOrders = db.getOrders();
    const map = new Map<string, SerializedOrder>();

    (initialOrders || []).forEach(o => {
      const key = (o.orderNumber || o.id || '').toUpperCase();
      if (key) map.set(key, o);
    });

    (localOrders || []).forEach(o => {
      const key = (o.orderNumber || o.id || '').toUpperCase();
      if (key && !map.has(key)) {
        map.set(key, {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          address: o.address,
          city: o.city || 'Chukai',
          state: o.state || 'Terengganu',
          totalAmount: o.totalAmount,
          orderStatus: o.orderStatus,
          courierName: o.courierName,
          trackingNumber: o.trackingNumber,
          items: (o.items || []).map(i => ({
            id: i.id,
            productName: i.productName,
            variantName: i.variantName,
            mainImage: i.mainImage,
            price: i.price,
            quantity: i.quantity,
            subtotal: i.subtotal,
          })),
          createdAt: o.createdAt || new Date().toISOString(),
        });
      }
    });

    const combined = Array.from(map.values());
    setOrdersList(combined);
  }, [initialOrders]);

  // Shipping Tracking Modal State
  const [shippingModal, setShippingModal] = useState<{
    orderId: string;
    orderNumber: string;
    nextStatus: string;
  } | null>(null);
  const [courierName, setCourierName] = useState('J&T Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Confirmation Delete Modal State
  const [confirmModal, setConfirmModal] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (
    orderId: string,
    nextStatus: string,
    trackingInfo?: { courierName: string; trackingNumber: string }
  ) => {
    if ((nextStatus === 'Shipped' || nextStatus === 'SHIPPED' || nextStatus === 'SHIPPING') && !trackingInfo) {
      const targetOrder = ordersList.find(o => o.id === orderId);
      setShippingModal({
        orderId,
        orderNumber: targetOrder?.orderNumber || orderId,
        nextStatus,
      });
      setCourierName(targetOrder?.courierName || 'J&T Express');
      setTrackingNumberInput(targetOrder?.trackingNumber || '');
      return;
    }

    setLoadingId(orderId);
    try {
      const payload: any = {
        id: orderId,
        orderStatus: nextStatus,
        status: nextStatus,
      };

      if (trackingInfo) {
        payload.courierName = trackingInfo.courierName;
        payload.trackingNumber = trackingInfo.trackingNumber;
      }

      // Update local db state as well
      db.updateOrderStatus(orderId, nextStatus as any, trackingInfo?.courierName, trackingInfo?.trackingNumber);

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.warn('Order status patch API warning:', data);
      }

      setOrdersList(prev => prev.map(o => {
        if (o.id === orderId || o.orderNumber === orderId) {
          return {
            ...o,
            orderStatus: nextStatus,
            courierName: trackingInfo?.courierName || o.courierName,
            trackingNumber: trackingInfo?.trackingNumber || o.trackingNumber,
          };
        }
        return o;
      }));

      router.refresh();
    } catch (err: any) {
      console.warn(`Update status warning: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmShipping = async () => {
    if (!shippingModal) return;
    if (!trackingNumberInput.trim()) {
      alert('Mohon masukkan Nomor Resi / Tracking Number pengiriman!');
      return;
    }

    const { orderId, nextStatus } = shippingModal;
    const trackingInfo = {
      courierName: courierName.trim() || 'J&T Express',
      trackingNumber: trackingNumberInput.trim(),
    };

    setShippingModal(null);
    await handleUpdateStatus(orderId, nextStatus, trackingInfo);
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    setConfirmModal(null);
    setLoadingId(orderId);
    try {
      db.deleteOrder(orderId);
      if (orderNumber) db.deleteOrder(orderNumber);

      await fetch(`/api/orders?deleteId=${encodeURIComponent(orderId)}`, { method: 'DELETE' });
      if (orderNumber) {
        await fetch(`/api/orders?deleteId=${encodeURIComponent(orderNumber)}`, { method: 'DELETE' });
      }

      setOrdersList(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderNumber));
      router.refresh();
    } catch (e) {
      alert('Gagal menghapus pesanan');
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = ordersList.filter(o => {
    const s = (o.orderStatus || '').toUpperCase();
    let matchStatus = statusFilter === 'ALL';
    if (statusFilter === 'Pending') matchStatus = s === 'PENDING' || s === 'PENDING_PAYMENT' || s === 'NEW';
    else if (statusFilter === 'Paid') matchStatus = s === 'PAID' || s === 'CONFIRMED' || s === 'PAYMENT_VERIFIED';
    else if (statusFilter === 'Packing') matchStatus = s === 'PACKING' || s === 'PROCESSING' || s === 'READY_TO_SHIP';
    else if (statusFilter === 'Shipped') matchStatus = s === 'SHIPPED' || s === 'SHIPPING';
    else if (statusFilter === 'Completed') matchStatus = s === 'COMPLETED' || s === 'DELIVERED';
    else if (statusFilter === 'Cancelled') matchStatus = s === 'CANCELLED' || s === 'CANCEL_REQUESTED';

    const matchSearch =
      (o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerPhone || '').includes(search);
    return matchStatus && matchSearch;
  });

  const statusesList = ['Pending', 'Paid', 'Packing', 'Shipped', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#800020] text-white shadow'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Semua ({ordersList.length})
          </button>
          {statusesList.map(s => {
            const count = ordersList.filter(o => {
              const os = (o.orderStatus || '').toUpperCase();
              if (s === 'Pending') return os === 'PENDING' || os === 'PENDING_PAYMENT' || os === 'NEW';
              if (s === 'Paid') return os === 'PAID' || os === 'CONFIRMED' || os === 'PAYMENT_VERIFIED';
              if (s === 'Packing') return os === 'PACKING' || os === 'PROCESSING' || os === 'READY_TO_SHIP';
              if (s === 'Shipped') return os === 'SHIPPED' || os === 'SHIPPING';
              if (s === 'Completed') return os === 'COMPLETED' || os === 'DELIVERED';
              if (s === 'Cancelled') return os === 'CANCELLED' || os === 'CANCEL_REQUESTED';
              return os === s.toUpperCase();
            }).length;

            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === s
                    ? 'bg-[#800020] text-white shadow'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
            placeholder="Cari pesanan berdasarkan nama, nomor pesanan, atau telepon..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
                <th className="p-4">Foto &amp; Produk</th>
                <th className="p-4">Nomor Pesanan</th>
                <th className="p-4">Pelanggan WhatsApp</th>
                <th className="p-4">Total Pembayaran</th>
                <th className="p-4">Status &amp; Tanda Terima</th>
                <th className="p-4 text-right">Aksi &amp; Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map(o => {
                  const firstItem = o.items && o.items[0];
                  const itemImg =
                    firstItem?.mainImage ||
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop';
                  const hasMoreItems = o.items && o.items.length > 1;
                  const nextAction = getNextStatus(o.orderStatus);
                  const isUpdating = loadingId === o.id;

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
                              {firstItem
                                ? `Varian: ${firstItem.variantName || '-'}`
                                : `${(o.items?.length ?? 0)} Barang`}
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
                            <span className="text-stone-400 text-[10px] block truncate max-w-[150px]">
                              {o.address}, {o.city}
                            </span>
                          </div>
                          <a
                            href={`https://wa.me/${cleanPhoneNumber(o.customerPhone)}?text=Halo%20${encodeURIComponent(
                              o.customerName
                            )},%20mengenai%20pesanan%20${o.orderNumber}`}
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
                      <td className="p-4 font-extrabold text-[#800020] text-sm">{formatMYR(o.totalAmount)}</td>

                      {/* STATUS & RESI */}
                      <td className="p-4 space-y-1">
                        {(() => {
                          const s = (o.orderStatus || '').toUpperCase().trim();
                          let badgeText = s;
                          let badgeClass = 'bg-amber-100 text-amber-900 border-amber-200';

                          if (s === 'PENDING_PAYMENT' || s === 'NEW' || s === 'PENDING') {
                            badgeText = 'MENUNGGU PEMBAYARAN';
                            badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
                          } else if (s === 'CONFIRMED' || s === 'PAID' || s === 'PAYMENT_VERIFIED') {
                            badgeText = 'DIKONFIRMASI';
                            badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                          } else if (s === 'PROCESSING' || s === 'PACKING' || s === 'READY_TO_SHIP') {
                            badgeText = 'SEDANG DIPROSES';
                            badgeClass = 'bg-indigo-100 text-indigo-900 border-indigo-300';
                          } else if (s === 'SHIPPED' || s === 'SHIPPING') {
                            badgeText = 'DALAM PENGIRIMAN';
                            badgeClass = 'bg-purple-100 text-purple-900 border-purple-300';
                          } else if (s === 'DELIVERED' || s === 'COMPLETED') {
                            badgeText = 'PESANAN SELESAI';
                            badgeClass = 'bg-green-100 text-green-900 border-green-300';
                          } else if (s === 'CANCELLED' || s === 'CANCEL_REQUESTED') {
                            badgeText = 'DIBATALKAN';
                            badgeClass = 'bg-red-100 text-red-900 border-red-300';
                          }

                          return (
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-md uppercase inline-block border ${badgeClass}`}>
                              {badgeText}
                            </span>
                          );
                        })()}

                        {o.trackingNumber ? (
                          <span className="block text-[11px] font-mono text-emerald-700 font-bold">
                            {o.courierName || 'Kurir'}: {o.trackingNumber}
                          </span>
                        ) : (
                          o.orderStatus !== 'CANCELLED' && (
                            <span className="block text-[10px] text-amber-700 italic">Penerbitan Tertunda</span>
                          )
                        )}
                      </td>

                      {/* ACTION: ADVANCE STATUS BUTTON & ACTIONS */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {nextAction && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(o.id, nextAction.nextStatus)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                              <nextAction.icon className="w-3.5 h-3.5" />
                              {isUpdating ? 'Memproses...' : nextAction.label}
                            </button>
                          )}

                          <Link
                            href={`${adminBase}/orders/${o.id}`}
                            className="px-3 py-1.5 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          >
                            Detail <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => setConfirmModal({ orderId: o.id, orderNumber: o.orderNumber })}
                            className="p-1.5 bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-xl border border-stone-200 transition-colors cursor-pointer"
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

      {/* TRACKING NUMBER PROMPT MODAL */}
      {shippingModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShippingModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 border-4 border-emerald-50 flex items-center justify-center mx-auto">
              <Truck className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="font-serif text-xl font-extrabold text-[#800020]">
                Kirim Pesanan {shippingModal.orderNumber}
              </h3>
              <p className="text-stone-600 text-xs mt-1">
                Masukkan detail kurir dan nomor resi pengiriman untuk pelanggan.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Pilih Kurir / Ekspedisi</label>
                <select
                  value={courierName}
                  onChange={e => setCourierName(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl text-xs text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                >
                  <option value="J&T Express">J&amp;T Express</option>
                  <option value="Pos Laju">Pos Laju</option>
                  <option value="Ninja Van">Ninja Van</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="Lalamove">Lalamove</option>
                  <option value="Self Pickup">Ambil Self-Pickup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nomor Resi (Tracking Number)</label>
                <input
                  type="text"
                  placeholder="Contoh: JT6829104829MY"
                  value={trackingNumberInput}
                  onChange={e => setTrackingNumberInput(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShippingModal(null)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmShipping}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Update &amp; Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-2xl space-y-5 text-center relative">
            <button
              onClick={() => setConfirmModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 border-4 border-red-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-extrabold text-[#800020]">Hapus Pesanan Dari Database</h3>
              <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus pesanan {confirmModal.orderNumber}? Data yang dihapus dari database terpusat PostgreSQL tidak dapat dikembalikan lagi.
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
                onClick={() => handleDeleteOrder(confirmModal.orderId, confirmModal.orderNumber)}
                className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
