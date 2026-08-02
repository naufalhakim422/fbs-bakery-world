'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/audit';
import { Order, OrderStatus } from '@/types';
import { formatMYR } from '@/lib/currency';
import { formatWhatsAppNumber } from '@/lib/whatsapp';
import { ArrowLeft, Save, Truck, Package, MessageCircle, CheckCircle2, MapPin, User, Calendar } from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('NEW');
  const [courierName, setCourierName] = useState('J&T Express');
  const [customCourier, setCustomCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSaved, setIsSaved] = useState(false);

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
    'NEW',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ];

  useEffect(() => {
    if (id) {
      const found = db.getOrders().find(o => o.id === id || o.orderNumber === id);
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
    }
  }, [id]);

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
        <h2 className="font-serif text-xl font-bold text-[#800020]">Order Not Found</h2>
        <Link href="/admin/orders" className="mt-4 inline-block px-5 py-2.5 bg-[#800020] text-white text-xs font-bold rounded-xl">
          Back to Order List
        </Link>
      </div>
    );
  }

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCourier = courierName === 'OTHER_CUSTOM' ? (customCourier || 'Other Expedition') : courierName;
    const updated = db.updateOrderStatusAndTracking(order.id, orderStatus, finalCourier, trackingNumber);
    if (updated) {
      setOrder({ ...updated });
      recordAuditLog('Update Status Order', 'ORDER', `Order ${order.orderNumber} status updated to ${orderStatus} (${finalCourier} - Resi: ${trackingNumber || 'N/A'}).`);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const finalCourier = courierName === 'OTHER_CUSTOM' ? customCourier : courierName;

  const waCustomerUrl = `https://wa.me/${formatWhatsAppNumber(order.customerPhone)}?text=${encodeURIComponent(
    `Hello ${order.customerName},\n\nUpdate regarding your order ${order.orderNumber} from FBS Bakery World:\n\nStatus: ${orderStatus}\n${
      trackingNumber ? `Courier Expedition: ${finalCourier}\nTracking Resi Number: ${trackingNumber}\n\nYou can track your parcel on our website: https://www.fbsbakeryworld.com/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone)}` : ''
    }\n\nThank you!`
  )}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Orders List
        </Link>

        <a
          href={waCustomerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4 fill-white" /> Send Tracking Info via WhatsApp
        </a>
      </div>

      {/* Order Info & Status Update Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Order Items & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs text-stone-500 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Order Placed: {new Date(order.createdAt).toLocaleString()}
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
                  <strong className="block text-stone-900">Customer Name & Phone:</strong>
                  <span>{order.customerName} ({order.customerPhone})</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Delivery Address:</strong>
                  <span>{order.address}, {order.city}, {order.postcode}, {order.state}</span>
                </div>
              </div>

              {order.notes && (
                <div className="p-3 bg-[#FFF8F0] rounded-xl border border-[#EADBC8] text-stone-700">
                  <strong className="block text-[#800020]">Customer Note:</strong>
                  <span>{order.notes}</span>
                </div>
              )}
            </div>

            {/* Items Purchased List */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900">Items Ordered</h3>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-3">
                      {item.mainImage && (
                        <img src={item.mainImage} alt={item.productName} className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block">{item.productName}</span>
                        <span className="text-[11px] text-stone-500">Variant: {item.variantName} x {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#800020]">{formatMYR(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <span className="text-xs text-stone-500 block">Total Order Amount</span>
                <span className="font-serif text-2xl font-extrabold text-[#800020]">{formatMYR(order.totalAmount)}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Resi Input & Status Management */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md h-fit space-y-4 text-xs">
          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#800020]" /> Dispatch & Courier Resi Input
          </h2>

          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Update Order Status</label>
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
              <label className="block font-bold text-stone-700 uppercase mb-1">Shipping Courier Expedition</label>
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
                  <CheckCircle2 className="w-4 h-4" /> Status & Resi Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Status & Resi Number
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
