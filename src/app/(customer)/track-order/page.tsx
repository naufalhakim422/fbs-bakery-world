'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Order, OrderStatus, normalizeToFrontendStatus } from '@/types';
import { formatMYR } from '@/lib/currency';
import { formatWhatsAppNumber, cleanPhoneNumber, normalizePhoneDigits, getCourierTrackingUrl } from '@/lib/whatsapp';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { 
  Search, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  MessageCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

function TrackOrderContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const initialOrderNum = searchParams?.get('orderNumber') || searchParams?.get('orderNo') || '';
  const initialPhone = searchParams?.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNum);
  const [phone, setPhone] = useState(initialPhone);
  const [orderResult, setOrderResult] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [copiedResi, setCopiedResi] = useState(false);

  const handleCopyResi = (resi: string) => {
    if (!resi) return;
    try {
      navigator.clipboard.writeText(resi);
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawNum = (orderNumber || initialOrderNum).trim();
    const cleanNum = rawNum.replace(/^#/, '').toUpperCase();
    const queryPhone = (phone || initialPhone).trim();
    const normSearchPhone = normalizePhoneDigits(queryPhone);

    if (!cleanNum && !queryPhone) return;

    let found: Order | null = null;

    // 1. Try server API fetch with orderNumber & phone query params
    try {
      const qParams = new URLSearchParams();
      if (cleanNum) qParams.set('orderNumber', cleanNum);
      if (queryPhone) qParams.set('phone', queryPhone);
      qParams.set('search', cleanNum || queryPhone);
      qParams.set('t', Date.now().toString());

      const res = await fetch(`/api/orders?${qParams.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        found = data.orders.find((o: Order) => {
          const oNumClean = (o.orderNumber || '').replace(/^#/, '').toUpperCase();
          const oIdClean = (o.id || '').toUpperCase();
          const matchNum = Boolean(cleanNum && (
            oNumClean === cleanNum || 
            oNumClean.includes(cleanNum) || 
            cleanNum.includes(oNumClean) ||
            oIdClean === cleanNum ||
            oIdClean.includes(cleanNum)
          ));
          const oPhoneNorm = normalizePhoneDigits(o.customerPhone);
          const matchPh = Boolean(normSearchPhone && oPhoneNorm && (
            normSearchPhone === oPhoneNorm || 
            normSearchPhone.includes(oPhoneNorm) || 
            oPhoneNorm.includes(normSearchPhone)
          ));
          return matchNum || matchPh;
        }) || null;
      }
    } catch (err) {
      console.warn('Track server fetch error:', err);
    }

    // 2. Fallback: Try fetching all server orders
    if (!found) {
      try {
        const resAll = await fetch(`/api/orders?t=${Date.now()}`, { cache: 'no-store' });
        const dataAll = await resAll.json();
        if (dataAll.success && Array.isArray(dataAll.orders)) {
          found = dataAll.orders.find((o: Order) => {
            const oNumClean = (o.orderNumber || '').replace(/^#/, '').toUpperCase();
            const oIdClean = (o.id || '').toUpperCase();
            const matchNum = Boolean(cleanNum && (
              oNumClean === cleanNum || 
              oNumClean.includes(cleanNum) || 
              cleanNum.includes(oNumClean) ||
              oIdClean === cleanNum
            ));
            const oPhoneNorm = normalizePhoneDigits(o.customerPhone);
            const matchPh = Boolean(normSearchPhone && oPhoneNorm && (
              normSearchPhone === oPhoneNorm || 
              normSearchPhone.includes(oPhoneNorm) || 
              oPhoneNorm.includes(normSearchPhone)
            ));
            return matchNum || matchPh;
          }) || null;
        }
      } catch (err) {
        console.warn('Track fallback fetch error:', err);
      }
    }

    // 3. Fallback to local DB
    if (!found) {
      found = db.getOrderByNumberAndPhone(cleanNum, queryPhone) || 
              db.getOrderByNumberAndPhone(rawNum, queryPhone) || 
              db.getOrders().find(o => {
                const oNumClean = (o.orderNumber || '').replace(/^#/, '').toUpperCase();
                return Boolean(cleanNum && (oNumClean.includes(cleanNum) || cleanNum.includes(oNumClean)));
              }) || null;
    }

    if (found) {
      (found as any).orderStatus = normalizeToFrontendStatus((found as any).orderStatus || (found as any).status);

      // Normalize items array if returned from Prisma format
      if ((found as any).items && Array.isArray((found as any).items)) {
        (found as any).items = (found as any).items.map((i: any) => ({
          ...i,
          productName: i.productName || 'Produk Bakery',
          variantName: i.variantName || 'Standard',
          mainImage: i.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
          price: Number(i.price) || 0,
          quantity: Number(i.quantity) || 1,
          subtotal: Number(i.subtotal) || Number(i.price * i.quantity) || 0,
        }));
      }
    }

    setOrderResult(found);
    setSearched(true);
  };

  useEffect(() => {
    handleSearch();

    const onUpdate = () => handleSearch();
    window.addEventListener('storage', onUpdate);
    window.addEventListener('fbs_db_updated', onUpdate);
    return () => {
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('fbs_db_updated', onUpdate);
    };
  }, [initialOrderNum, initialPhone]);

  const timelineSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { 
      key: 'NEW', 
      label: language === 'EN' ? 'Pending (Order Received)' : language === 'MS' ? 'Menunggu (Pesanan Diterima)' : 'Pending (Pesanan Diterima)', 
      desc: language === 'EN' ? 'Order received & waiting payment confirmation' : language === 'MS' ? 'Pesanan diterima & menunggu pengesahan pembayaran' : 'Pesanan diterima & menunggu konfirmasi pembayaran' 
    },
    { 
      key: 'CONFIRMED', 
      label: language === 'EN' ? 'Processing (Confirmed)' : language === 'MS' ? 'Diproses (Disahkan)' : 'Diproses (Dikonfirmasi)', 
      desc: language === 'EN' ? 'Payment & stock verified by store admin' : language === 'MS' ? 'Pembayaran & stok disahkan oleh admin kedai' : 'Pembayaran & stok diverifikasi oleh admin toko' 
    },
    { 
      key: 'PROCESSING', 
      label: language === 'EN' ? 'Packed & Prepared' : language === 'MS' ? 'Dibungkus & Disediakan' : 'Dikemas & Disiapkan', 
      desc: language === 'EN' ? 'Bakery items packaged with care' : language === 'MS' ? 'Bahan bakeri dibungkus dengan kemas' : 'Bahan bakery dikemas dengan rapi' 
    },
    { 
      key: 'SHIPPED', 
      label: language === 'EN' ? 'Shipped (Dispatched)' : language === 'MS' ? 'Dihantar (Diserah)' : 'Dikirim (Diserahkan)', 
      desc: language === 'EN' ? 'Courier resi tracking issued' : language === 'MS' ? 'Nombor resi kurier dikeluarkan' : 'Nomor resi kurir telah diterbitkan' 
    },
    { 
      key: 'DELIVERED', 
      label: language === 'EN' ? 'Delivered' : language === 'MS' ? 'Diterima' : 'Selesai / Diterima', 
      desc: language === 'EN' ? 'Package delivered to recipient' : language === 'MS' ? 'Pakej dihantar kepada penerima' : 'Paket telah diterima pemesan' 
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const upper = (status || '').toUpperCase();
    if (upper === 'PENDING_PAYMENT' || upper === 'NEW' || upper === 'PENDING') return 0;
    if (upper === 'PAYMENT_VERIFIED' || upper === 'CONFIRMED' || upper === 'PAID') return 1;
    if (upper === 'PACKING' || upper === 'PROCESSING') return 2;
    if (upper === 'READY_TO_SHIP' || upper === 'SHIPPING' || upper === 'SHIPPED') return 3;
    if (upper === 'DELIVERED' || upper === 'COMPLETED') return 4;
    if (upper === 'CANCEL_REQUESTED') return 2;
    if (upper === 'CANCELLED' || upper === 'REFUND') return -1;
    return 0;
  };

  const getOrderStatusBadge = (statusStr?: string, lang: string = 'ID') => {
    const upper = (statusStr || '').toUpperCase().trim();
    if (upper === 'PENDING_PAYMENT' || upper === 'NEW' || upper === 'PENDING') {
      return {
        label: lang === 'EN' ? 'Pending Payment' : lang === 'MS' ? 'Menunggu Pembayaran' : 'Menunggu Pembayaran',
        className: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    if (upper === 'CONFIRMED' || upper === 'PAID' || upper === 'PAYMENT_VERIFIED') {
      return {
        label: lang === 'EN' ? 'Confirmed' : lang === 'MS' ? 'Dikonfirmasi' : 'Dikonfirmasi',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (upper === 'PROCESSING' || upper === 'PACKING') {
      return {
        label: lang === 'EN' ? 'Processing' : lang === 'MS' ? 'Diproses' : 'Sedang Diproses',
        className: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }
    if (upper === 'READY_TO_SHIP') {
      return {
        label: lang === 'EN' ? 'Ready To Ship' : lang === 'MS' ? 'Sedia Dihantar' : 'Siap Dikirim',
        className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      };
    }
    if (upper === 'SHIPPED' || upper === 'SHIPPING') {
      return {
        label: lang === 'EN' ? 'Shipped' : lang === 'MS' ? 'Dalam Pengiriman' : 'Dalam Pengiriman',
        className: 'bg-purple-50 text-purple-800 border-purple-200',
      };
    }
    if (upper === 'DELIVERED' || upper === 'COMPLETED') {
      return {
        label: lang === 'EN' ? 'Delivered' : lang === 'MS' ? 'Pesanan Selesai' : 'Pesanan Selesai',
        className: 'bg-green-50 text-green-800 border-green-200',
      };
    }
    if (upper === 'CANCELLED' || upper === 'CANCEL_REQUESTED') {
      return {
        label: lang === 'EN' ? 'Cancelled' : lang === 'MS' ? 'Dibatalkan' : 'Pesanan Dibatalkan',
        className: 'bg-red-50 text-red-800 border-red-200',
      };
    }
    return {
      label: statusStr || 'Dikonfirmasi',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  };

  return (
    <>
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-3">
          <PackageCheck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#800020]">
          {language === 'EN' ? 'Track Parcel & Order Status' : language === 'MS' ? 'Jejak Status Penghantaran & Pesanan' : 'Lacak Status Paket & Pesanan'}
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm mt-1">
          {language === 'EN' ? 'Enter your Order ID (e.g. #FBS-20260728-101) and phone number to view live delivery updates.' : language === 'MS' ? 'Masukkan Nombor Pesanan (cth #FBS-20260728-101) dan nombor telefon untuk melihat kemas kini.' : 'Masukkan ID Pesanan (misal #FBS-20260728-101) dan nomor telepon untuk melihat pembaruan.'}
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8] shadow-md mb-10 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                {t.checkout.orderStatus} ID / Number <span className="text-red-600">*</span>
              </label>
              <input 
                type="text"
                required
                placeholder="#FBS-20260728-101"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                {t.checkout.phoneNumber} <span className="text-stone-400 font-normal text-[10px] lowercase">(opsional)</span>
              </label>
              <input 
                type="text"
                placeholder="+60129876543"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> {language === 'EN' ? 'Track Order Now' : language === 'MS' ? 'Jejak Pesanan Sekarang' : 'Lacak Pesanan Sekarang'}
          </button>
        </form>
      </div>

      {/* Search Result */}
      {searched && (
        <div>
          {!orderResult ? (
            <div className="bg-white p-10 rounded-3xl border border-[#EADBC8] shadow-sm text-center max-w-xl mx-auto">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-[#800020]">{language === 'EN' ? 'Order Not Found' : language === 'MS' ? 'Pesanan Tidak Ditemui' : 'Pesanan Tidak Ditemukan'}</h3>
              <p className="text-stone-600 text-xs mt-1">
                {language === 'EN' ? 'We could not find an order matching your details. Please verify your info or contact support.' : language === 'MS' ? 'Pesanan tidak ditemui untuk maklumat tersebut. Sila semak butiran anda atau hubungi admin.' : 'Kami tidak dapat menemukan pesanan yang cocok. Silakan periksa kembali detail Anda.'}
              </p>
              <a
                href={`https://wa.me/${cleanPhoneNumber(db.getStoreSettings().whatsappNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-xl shadow"
              >
                <MessageCircle className="w-4 h-4 fill-white" /> {language === 'EN' ? 'Contact Admin Support' : language === 'MS' ? 'Hubungi Bantuan Admin' : 'Hubungi Dukungan Admin'}
              </a>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-lg space-y-8 animate-fade-in">
              
              {/* Result Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const b = getOrderStatusBadge(orderResult.orderStatus, language);
                      return (
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${b.className}`}>
                          {b.label}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(orderResult.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#2B1B1B]">
                    Order {orderResult.orderNumber}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-stone-500 block">{t.checkout.totalAmount}</span>
                  <span className="font-serif text-2xl font-extrabold text-[#800020]">
                    {formatMYR(orderResult.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Courier Resi / Self-Pickup Information Card */}
              {orderResult.courierName?.includes('Self-Pickup') || orderResult.courierName?.includes('Penghantaran Sendiri') ? (
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">🚗 {language === 'EN' ? 'Self-Pickup / Store Delivery' : language === 'MS' ? 'Penghantaran Mandiri / Ambil di Kedai' : 'Pengambilan Toko / Kurir Toko'}</span>
                      <h4 className="text-sm font-extrabold text-stone-900">
                        {orderResult.trackingNumber 
                          ? `Notes: ${orderResult.trackingNumber}` 
                          : 'FBS Bakery World Store Delivery'}
                      </h4>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow">
                    {language === 'EN' ? 'Verified Store Delivery' : language === 'MS' ? 'Penghantaran Kedai Disahkan' : 'Pengiriman Toko Terverifikasi'}
                  </span>
                </div>
              ) : orderResult.courierName && orderResult.trackingNumber ? (
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider block">Nombor Resi Kurier Disertakan</span>
                      <h4 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2 flex-wrap">
                        {orderResult.courierName}: 
                        <span className="font-mono text-emerald-900 px-2.5 py-0.5 bg-emerald-100/80 rounded-md border border-emerald-300">
                          {orderResult.trackingNumber}
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleCopyResi(orderResult.trackingNumber || '')}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow ${
                        copiedResi 
                          ? 'bg-emerald-700 text-white border-emerald-700 scale-105' 
                          : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      {copiedResi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" /> Resi Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-700" /> Salin Resi
                        </>
                      )}
                    </button>

                    <a
                      href={getCourierTrackingUrl(orderResult.courierName, orderResult.trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                    >
                      {language === 'EN' ? 'Track on Logistics Portal' : language === 'MS' ? 'Jejak di Laman Kurier' : 'Lacak di Situs Ekspedisi'} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{language === 'EN' ? 'Package is being prepared for dispatch. Tracking resi number will be updated once shipped.' : language === 'MS' ? 'Pakej sedang disediakan untuk penghantaran. Nombor resi akan dikemas kini sebaik sahaja dihantar.' : 'Paket sedang disiapkan untuk dikirim. Nomor resi akan diperbarui setelah dikirim.'}</span>
                </div>
              )}

              {/* Interactive Status Timeline */}
              <div>
                <h3 className="text-sm font-bold text-[#800020] uppercase tracking-wider mb-6">
                  {language === 'EN' ? 'Delivery Status Timeline' : language === 'MS' ? 'Garisan Masa Status Penghantaran' : 'Lini Masa Status Pengiriman'}
                </h3>

                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    {timelineSteps.map((step, idx) => {
                      const currentIdx = getStepIndex(orderResult.orderStatus);
                      const isDone = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={step.key} className="flex flex-col items-center text-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow transition-colors ${
                            isDone ? 'bg-[#800020] text-[#D4AF37]' : 'bg-stone-200 text-stone-400'
                          } ${isCurrent ? 'ring-4 ring-[#D4AF37]' : ''}`}>
                            {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <h4 className={`text-xs font-bold ${isDone ? 'text-[#800020]' : 'text-stone-400'}`}>
                            {step.label}
                          </h4>
                          <p className="text-[10px] text-stone-500 mt-0.5 max-w-[120px]">{step.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="border-t border-stone-200 pt-6">
                <h3 className="text-sm font-bold text-[#2B1B1B] mb-3">{language === 'EN' ? 'Purchased Items' : language === 'MS' ? 'Barang Dibeli' : 'Daftar Barang Dibeli'}</h3>
                <div className="space-y-3">
                  {(orderResult.items || []).map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <div className="flex items-center gap-3">
                        {item.mainImage && (
                          <img src={item.mainImage} alt={item.productName} className="w-10 h-10 object-cover rounded-lg" />
                        )}
                        <div>
                          <span className="font-bold text-stone-900 block">{item.productName}</span>
                          <span className="text-[11px] text-stone-500">{t.cart.variant}: {item.variantName} x {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#800020]">{formatMYR(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-[#800020]">Loading Tracking...</div>}>
          <TrackOrderContent />
        </Suspense>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
