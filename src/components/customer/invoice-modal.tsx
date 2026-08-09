'use client';

import React from 'react';
import { X, Printer, CheckCircle2, Package, Truck, ShieldCheck, Building } from 'lucide-react';
import { formatMYR } from '@/lib/currency';
import { normalizeToFrontendStatus } from '@/types';

interface InvoiceModalProps {
  order: any;
  isOpen?: boolean;
  onClose: () => void;
}

export function InvoiceModal({ order, isOpen = true, onClose }: InvoiceModalProps) {
  if (!order || isOpen === false) return null;

  const handlePrint = () => {
    window.print();
  };

  const normStatus = normalizeToFrontendStatus(order.orderStatus);
  const isPaid = normStatus !== 'PENDING_PAYMENT' && normStatus !== 'NEW' && normStatus !== 'CANCELLED';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col print:shadow-none print:border-none print:max-h-none print:w-full print:max-w-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-stone-900 text-white rounded-t-3xl flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-serif font-bold text-sm text-[#D4AF37]">Faktur Pembelian Resmi / Official Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 space-y-6 text-stone-800 font-sans print:p-6" id="printable-invoice">
          
          {/* Header Copy / Store Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-stone-900 pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-black text-sm flex items-center justify-center border border-[#D4AF37]">
                  FBS
                </div>
                <h1 className="font-serif text-2xl font-extrabold text-[#800020] tracking-tight">FBS Bakery World</h1>
              </div>
              <p className="text-xs text-stone-500 max-w-xs">
                Chukai, Terengganu, Malaysia<br />
                Hotline / WhatsApp: +60 18-397 2147<br />
                Email: support@fbsbaker.store | Website: fbsbaker.store
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">FAKTUR / INVOICE</span>
              <span className="font-mono text-lg font-extrabold text-[#800020] block">{order.orderNumber}</span>
              <span className="text-xs text-stone-500 block">
                Tanggal Order: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              
              {/* Payment Stamp */}
              <div className="pt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-lg border uppercase tracking-wider ${
                  isPaid ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-amber-100 text-amber-900 border-amber-400'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isPaid ? 'LUNAS / PAID' : 'PENDING PAYMENT'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">DITERBITKAN UNTUK (PELANGGAN):</span>
              <strong className="text-stone-900 text-sm block font-bold">{order.customerName}</strong>
              <p className="text-stone-600">Telepon: {order.customerPhone}</p>
              <p className="text-stone-600">Email: {order.customerEmail || 'Member Terdaftar'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">ALAMAT PENGIRIMAN & EKSPEDISI:</span>
              <p className="text-stone-800 font-medium">{order.address}</p>
              <p className="text-stone-800">{order.city}, {order.postcode}, {order.state}</p>
              {order.courierName && (
                <p className="text-[#800020] font-bold mt-1">
                  Kurir: {order.courierName} {order.trackingNumber ? `(Resi: ${order.trackingNumber})` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-800 text-stone-900 uppercase font-bold text-[11px] bg-stone-100">
                  <th className="py-2.5 px-3">Produk & Varian</th>
                  <th className="py-2.5 px-3 text-center">Harga Unit</th>
                  <th className="py-2.5 px-3 text-center">Jumlah</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {(order.items || []).map((item: any) => (
                  <tr key={item.id || item.productId}>
                    <td className="py-3 px-3">
                      <strong className="text-stone-900 block font-bold">{item.productName}</strong>
                      <span className="text-stone-500 text-[11px]">Varian: {item.variantName || 'Standard'}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-stone-700">{formatMYR(item.price)}</td>
                    <td className="py-3 px-3 text-center font-bold text-stone-900">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-[#800020]">{formatMYR(item.subtotal || item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-t-2 border-stone-900 pt-4 gap-4">
            <div className="text-xs text-stone-500 space-y-1 max-w-xs">
              <p className="flex items-center gap-1 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Transaksi Terverifikasi Resmi
              </p>
              <p className="text-[11px]">
                Dokumen ini merupakan bukti pembayaran sah dari toko online FBS Bakery World. Terima kasih atas kepercayaan Anda!
              </p>
            </div>

            <div className="w-full sm:w-64 text-xs space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Produk:</span>
                <span className="font-bold">{formatMYR(order.subtotal || (order.totalAmount - (order.shippingFee || 10) + (order.discount || 0)))}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Biaya Pengiriman:</span>
                <span className="font-bold">{formatMYR(order.shippingFee || 10.0)}</span>
              </div>
              {Boolean(order.discount) && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon Tambahan:</span>
                  <span className="font-bold">-{formatMYR(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-stone-300 pt-2 flex justify-between text-sm font-extrabold text-[#800020]">
                <span>TOTAL BAYAR:</span>
                <span className="font-serif text-base">{formatMYR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
