'use client';

import React, { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/audit';
import { Order, OrderStatus } from '@/types';
import { formatMYR } from '@/lib/currency';
import { formatWhatsAppNumber, cleanPhoneNumber } from '@/lib/whatsapp';
import { ArrowLeft, Save, Truck, Package, MessageCircle, CheckCircle2, MapPin, User, Calendar, Trash2, X, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const adminBase = pathname?.startsWith('/admin2026') ? '/admin2026' : '/admin';
  const { t, language } = useLanguage();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('NEW');
  const [courierName, setCourierName] = useState('J&T Express');
  const [customCourier, setCustomCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    message: string;
    confirmBtnText: string;
    confirmBtnClass: string;
    action: () => void;
  } | null>(null);

  const presetCouriers = [
    'J&T Express',
    'Ninja Van',
    'Pos Malaysia / Pos Laju',
    'DHL Express',
    'City-Link Express',
    'Flash Express',
    'GDEX',
    'Lalamove / GrabExpress',
    'Shopee Xpress',
    'Line Clear Express',
    'Self-Pickup / Penghantaran Sendiri',
    'OTHER_CUSTOM'
  ];

  const statusOptions: OrderStatus[] = [
    'PENDING_PAYMENT',
    'PAYMENT_VERIFIED',
    'CONFIRMED',
    'PACKING',
    'READY_TO_SHIP',
    'SHIPPING',
    'DELIVERED',
    'COMPLETED',
    'CANCEL_REQUESTED',
    'CANCELLED',
    'REFUND'
  ];

  useEffect(() => {
    if (id) {
      const loadOrderData = async () => {
        let found: Order | null = null;
        try {
          const res = await fetch('/api/orders');
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            found = data.orders.find((o: Order) => o.id === id || o.orderNumber === id) || null;
          }
        } catch (err) {
          console.warn('API fetch warning:', err);
        }

        if (!found) {
          found = db.getOrders().find(o => o.id === id || o.orderNumber === id) || null;
        }

        if (found) {
          setOrder(found);
          setOrderStatus(found.orderStatus);
          
          if (presetCouriers.includes(found.courierName || '')) {
            setCourierName(found.courierName || 'J&T Express');
          } else if (found.courierName) {
            setCourierName('OTHER_CUSTOM');
            setCustomCourier(found.courierName);
          }
          
          setTrackingNumber(found.trackingNumber || '');
        }
      };

      loadOrderData();
    }
  }, [id]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl border border-stone-200 shadow-xl space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-red-50 text-[#800020] rounded-full flex items-center justify-center mx-auto border-4 border-red-100">
          <Trash2 className="w-8 h-8 text-[#800020]" />
        </div>
        <h2 className="font-serif text-xl font-extrabold text-[#800020]">Pesanan Tidak Ditemukan atau Telah Dihapus</h2>
        <p className="text-stone-600 text-xs leading-relaxed">
          Pesanan ini tidak tersedia atau telah dihapus secara permanen dari database terpusat.
        </p>
        <Link href={`${adminBase}/orders`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white text-xs font-bold rounded-xl shadow transition-all">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  const executeSaveStatus = async () => {
    const finalCourier = courierName === 'OTHER_CUSTOM' ? (customCourier || 'Other Expedition') : courierName;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatus,
          courierName: finalCourier,
          trackingNumber,
          updatedBy: 'Admin Store',
        }),
      });
      
      if (res.ok) {
        const updated = db.updateOrderStatusAndTracking(order.id, orderStatus, finalCourier, trackingNumber);
        if (updated) {
          setOrder({ ...updated });
          recordAuditLog('Update Status Order', 'ORDER', `Order ${order.orderNumber} status updated to ${orderStatus} (${finalCourier} - Resi: ${trackingNumber || 'N/A'}).`);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
        }
      } else {
        alert('Gagal memperbarui pesanan di server');
      }
    } catch (err) {
      console.warn('API PATCH Sync Warning:', err);
      alert('Gagal memperbarui pesanan di server');
    }
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (order.orderStatus === 'CANCELLED') {
      alert('Pesanan yang telah dibatalkan tidak dapat diubah status pengirimannya.');
      return;
    }
    if ((orderStatus === 'SHIPPING' || orderStatus === 'SHIPPED') && courierName !== 'Self-Pickup / Penghantaran Sendiri' && !trackingNumber.trim()) {
      alert('⚠️ Nomor Resi (Tracking Number) WAJIB diisi sebelum mengubah status pesanan menjadi SHIPPED / Dalam Pengiriman!');
      return;
    }
    if (orderStatus === 'CANCELLED') {
      setConfirmAction({
        type: 'CANCEL_ORDER',
        title: 'Konfirmasi Pembatalan Pesanan',
        message: `Apakah Anda yakin ingin membatalkan pesanan ${order.orderNumber}? Status akan diubah menjadi CANCELLED dan stok produk akan otomatis dikembalikan ke inventaris toko.`,
        confirmBtnText: 'Ya, Batalkan Pesanan',
        confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
        action: () => executeSaveStatus()
      });
    } else {
      setConfirmAction({
        type: 'SAVE_STATUS',
        title: 'Konfirmasi Perubahan Status',
        message: `Simpan perubahan status pesanan ${order.orderNumber} menjadi [${orderStatus}]?`,
        confirmBtnText: 'Ya, Simpan Status',
        confirmBtnClass: 'bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37]',
        action: () => executeSaveStatus()
      });
    }
  };

  const finalCourier = courierName === 'OTHER_CUSTOM' ? customCourier : courierName;

  const waCustomerUrl = `https://wa.me/${cleanPhoneNumber(order.customerPhone)}?text=${encodeURIComponent(
    `Hello ${order.customerName},\n\nUpdate regarding your order ${order.orderNumber} from FBS Bakery World:\n\nStatus: ${orderStatus}\n${
      trackingNumber ? `Courier Expedition: ${finalCourier}\nTracking Resi Number: ${trackingNumber}\n\nYou can track your parcel on our website: https://www.fbsbaker.store/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone)}` : ''
    }\n\nThank you!`
  )}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href={`${adminBase}/orders`} className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline">
          <ArrowLeft className="w-4 h-4" /> {t.adminExtra.orderBackToList}
        </Link>

        <a
          href={waCustomerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4 fill-white" /> {t.adminExtra.orderChatCustomer}
        </a>
      </div>

      {order.orderStatus === 'CANCEL_REQUESTED' && (
        <div className="p-5 bg-amber-500 text-stone-950 rounded-2xl shadow-lg border border-amber-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-sm uppercase flex items-center gap-1.5">
              ⚠️ Permohonan Pembatalan Dari Pelanggan
            </h3>
            <p className="text-xs text-stone-900 mt-0.5">
              Pelanggan mengajukan pembatalan untuk pesanan {order.orderNumber}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmAction({
                  type: 'APPROVE_CANCEL',
                  title: 'Setujui Pembatalan Pelanggan',
                  message: `Setujui permohonan pembatalan pesanan ${order.orderNumber}? Stok produk akan otomatis dikembalikan ke inventaris toko.`,
                  confirmBtnText: '✅ Setujui Pembatalan',
                  confirmBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                  action: async () => {
                    const updated = db.updateOrderStatusAndTracking(order.id, 'CANCELLED');
                    if (updated) {
                      setOrder({ ...updated });
                      setOrderStatus('CANCELLED');
                      await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, orderNumber: order.orderNumber, orderStatus: 'CANCELLED', updatedBy: 'Admin Store' }) });
                    }
                  }
                });
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow"
            >
              ✅ Setujui Pembatalan
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmAction({
                  type: 'REJECT_CANCEL',
                  title: 'Tolak Pembatalan Pelanggan',
                  message: `Tolak permohonan pembatalan pesanan ${order.orderNumber}? Pesanan akan tetap diproses secara normal.`,
                  confirmBtnText: '❌ Tolak Pembatalan',
                  confirmBtnClass: 'bg-[#800020] hover:bg-red-900 text-white',
                  action: async () => {
                    const updated = db.updateOrderStatusAndTracking(order.id, 'CONFIRMED');
                    if (updated) {
                      setOrder({ ...updated });
                      setOrderStatus('CONFIRMED');
                      await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, orderNumber: order.orderNumber, orderStatus: 'CONFIRMED', updatedBy: 'Admin Store' }) });
                    }
                  }
                });
              }}
              className="px-4 py-2 bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs rounded-xl shadow"
            >
              ❌ Tolak Pembatalan
            </button>
          </div>
        </div>
      )}

      {/* Order Info & Status Update Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Order Items & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs text-stone-500 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {language === 'EN' ? 'Order Placed' : language === 'MS' ? 'Pesanan Dibuat' : 'Pesanan Dibuat'}: {new Date(order.createdAt).toLocaleString()}
                </span>
                <h1 className="font-serif text-2xl font-bold text-[#800020]">{order.orderNumber}</h1>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold rounded-full uppercase">
                {order.orderStatus}
              </span>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">{t.adminExtra.orderCustomerName}</strong>
                  <span>{order.customerName} ({order.customerPhone})</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">{t.adminExtra.orderDeliveryAddress}</strong>
                  <span>{order.address}, {order.city}, {order.postcode}, {order.state}</span>
                </div>
              </div>

              {order.notes && (
                <div className="p-3 bg-[#FFF8F0] rounded-xl border border-[#EADBC8] text-stone-700">
                  <strong className="block text-[#800020]">{t.adminExtra.orderCustomerNote}</strong>
                  <span>{order.notes}</span>
                </div>
              )}
            </div>

            {/* Items Purchased List */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900">{t.adminExtra.orderItemsOrdered}</h3>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-3">
                      {item.mainImage && (
                        <img src={item.mainImage} alt={item.productName} className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block">{item.productName}</span>
                        <span className="text-[11px] text-stone-500">{t.adminExtra.variant}: {item.variantName} x {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#800020]">{formatMYR(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <span className="text-xs text-stone-500 block">{t.adminExtra.orderTotal}</span>
                <span className="font-serif text-2xl font-extrabold text-[#800020]">{formatMYR(order.totalAmount)}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Resi Input & Status Management */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md h-fit space-y-4 text-xs">
          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#800020]" /> {language === 'EN' ? 'Dispatch & Courier Tracking Input' : language === 'MS' ? 'Penghantaran & Input Resi Kurier' : 'Dispatch & Input Resi Kurir'}
          </h2>

          <form onSubmit={handleSaveStatus} className="space-y-4">
            {/* Quick Manual Payment Verification Actions for Phase 9 */}
            {(orderStatus === 'NEW' || orderStatus === 'PENDING_PAYMENT' || order?.orderStatus === 'PENDING_PAYMENT') && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" /> Verifikasi Pembayaran Manual WhatsApp
                  </span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full">
                    Action Required
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Pelanggan telah melakukan transfer manual & mengirimkan bukti resi via WhatsApp. Pilih tindakan untuk mengubah status secara aman di PostgreSQL:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setOrderStatus('PAYMENT_VERIFIED');
                      const updated = db.updateOrderStatusAndTracking(order.id, 'PAYMENT_VERIFIED', courierName, trackingNumber);
                      if (updated) {
                        setOrder({ ...updated });
                        recordAuditLog('Verifikasi Pembayaran', 'ORDER', `Payment verified manually for order ${order.orderNumber}.`);
                        await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, orderNumber: order.orderNumber, orderStatus: 'PAYMENT_VERIFIED', updatedBy: 'Admin Store' }) });
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                      }
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify Payment
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setOrderStatus('CANCELLED');
                      const updated = db.updateOrderStatusAndTracking(order.id, 'CANCELLED', courierName, trackingNumber);
                      if (updated) {
                        setOrder({ ...updated });
                        recordAuditLog('Tolak Pembayaran', 'ORDER', `Payment rejected for order ${order.orderNumber}.`);
                        await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, orderNumber: order.orderNumber, orderStatus: 'CANCELLED', updatedBy: 'Admin Store' }) });
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                      }
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Reject Payment
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">{t.adminExtra.orderUpdateStatus}</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 font-bold"
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">{language === 'EN' ? 'Shipping Courier' : language === 'MS' ? 'Kurier Penghantaran' : 'Ekspedisi Pengiriman'}</label>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 font-medium"
              >
                {presetCouriers.map(c => (
                  <option key={c} value={c}>
                    {c === 'OTHER_CUSTOM' ? '+ Input Ekspedisi Lainnya (Custom)...' : c}
                  </option>
                ))}
              </select>
            </div>

            {courierName === 'OTHER_CUSTOM' && (
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Nama Ekspedisi Custom</label>
                <input 
                  type="text"
                  placeholder="misal: Lalamove, GrabExpress, Kargo Sendiri, dll"
                  value={customCourier}
                  onChange={(e) => setCustomCourier(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-900"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Courier Tracking Resi Number {courierName === 'Self-Pickup / Penghantaran Sendiri' && <span className="text-emerald-700 font-normal text-[10px] lowercase">(tidak wajib / opsional)</span>}
              </label>
              <input 
                type="text"
                placeholder={
                  courierName === 'Self-Pickup / Penghantaran Sendiri'
                    ? "Boleh dikosongkan atau isi catatan (misal: Diantar Kurir Toko Ahmad)"
                    : "e.g. JT882910293MY, NV992019"
                }
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 font-mono font-bold"
              />
              <span className="text-[10px] text-stone-500 block mt-1">
                {courierName === 'Self-Pickup / Penghantaran Sendiri' ? (
                  <span className="text-emerald-700 font-semibold">
                    💡 <strong>Penghantaran Sendiri / Self-Pickup:</strong> Nomor resi TIDAK wajib diisi. Anda dapat mengosongkannya dan sistem pelacakan pelanggan akan menampilkan konfirmasi pengiriman toko.
                  </span>
                ) : (
                  'Sistem pelacakan akan menampilkan nama ekspedisi dan resi ini secara live untuk customer.'
                )}
              </span>
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                isSaved ? 'bg-emerald-600' : 'bg-[#800020] hover:bg-[#6F1D1B]'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> {language === 'EN' ? 'Status & Tracking Saved!' : language === 'MS' ? 'Status & Resi Disimpan!' : 'Status & Resi Tersimpan!'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {t.adminExtra.orderSaveTracking}
                </>
              )}
            </button>

            {order.orderStatus !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => {
                  setConfirmAction({
                    type: 'CANCEL_ORDER',
                    title: 'Konfirmasi Pembatalan Pesanan',
                    message: `Apakah Anda yakin ingin membatalkan pesanan ${order.orderNumber}? Status akan diubah menjadi CANCELLED dan stok produk akan otomatis dikembalikan ke inventaris toko.`,
                    confirmBtnText: 'Ya, Batalkan Pesanan',
                    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
                    action: async () => {
                      const updated = db.updateOrderStatusAndTracking(order.id, 'CANCELLED');
                      if (updated) {
                        setOrder({ ...updated });
                        setOrderStatus('CANCELLED');
                        await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, orderNumber: order.orderNumber, orderStatus: 'CANCELLED', updatedBy: 'Admin Store' }) });
                      }
                    }
                  });
                }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <X className="w-4 h-4 text-red-600" /> Batalkan Pesanan Ini (Cancel Order)
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setConfirmAction({
                  type: 'DELETE_ORDER',
                  title: 'Hapus Pesanan Dari Database',
                  message: `Apakah Anda yakin ingin menghapus pesanan ${order.orderNumber}? Data yang dihapus dari database terpusat tidak dapat dikembalikan lagi.`,
                  confirmBtnText: 'Ya, Hapus Permanen',
                  confirmBtnClass: 'bg-red-700 hover:bg-red-800 text-white',
                  action: async () => {
                    await fetch('/api/orders?deleteId=' + encodeURIComponent(order.id), { method: 'DELETE' });
                    db.deleteOrder(order.id);
                    window.location.href = `${adminBase}/orders`;
                  }
                });
              }}
              className="w-full py-2.5 bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-600 font-bold text-xs rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <Trash2 className="w-4 h-4" /> Hapus Pesanan Dari Database
            </button>
          </form>
        </div>

      </div>

      {/* CUSTOM ADMIN CONFIRMATION MODAL DIALOG */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-2xl space-y-5 text-center relative animate-fade-in">
            <button 
              onClick={() => setConfirmAction(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border-4 ${
              confirmAction.type === 'DELETE_ORDER' || confirmAction.type === 'CANCEL_ORDER' 
                ? 'bg-red-100 text-red-600 border-red-50' 
                : 'bg-amber-100 text-amber-600 border-amber-50'
            }`}>
              {confirmAction.type === 'DELETE_ORDER' ? (
                <Trash2 className="w-8 h-8" />
              ) : confirmAction.type === 'CANCEL_ORDER' ? (
                <X className="w-8 h-8" />
              ) : (
                <Truck className="w-8 h-8 text-[#800020]" />
              )}
            </div>

            <div>
              <h3 className="font-serif text-2xl font-extrabold text-[#800020]">
                {confirmAction.title}
              </h3>
              <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                {confirmAction.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-colors"
              >
                Batal (Tutup)
              </button>

              <button
                type="button"
                onClick={() => {
                  const act = confirmAction.action;
                  setConfirmAction(null);
                  act();
                }}
                className={`py-3 px-4 rounded-2xl font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 ${confirmAction.confirmBtnClass}`}
              >
                {confirmAction.confirmBtnText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
