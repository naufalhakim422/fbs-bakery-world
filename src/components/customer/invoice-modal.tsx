'use client';

import React from 'react';
import { Order } from '@/types';
import { useLanguage } from '@/lib/language-context';
import { formatMYR } from '@/lib/currency';
import { Printer, X, ShieldCheck, ShoppingBag, CheckCircle } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const { t, language } = useLanguage();
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderNumber.replace(/[^0-9A-Za-z]/g, '')}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#EADBC8] overflow-hidden print:shadow-none print:border-none print:rounded-none print:max-w-none">
        
        {/* Action Header Bar (Hidden during Print) */}
        <div className="bg-[#800020] text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-base">
              {language === 'EN' ? 'Official Invoice Copy' : language === 'MS' ? 'Salinan Invois Rasmi' : 'Salinan Invoice Resmi'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#D4AF37] hover:bg-amber-400 text-[#800020] font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4" /> {language === 'EN' ? 'Print / Save PDF' : language === 'MS' ? 'Cetak / Simpan PDF' : 'Cetak / Simpan PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label={language === 'EN' ? 'Close Invoice Modal' : 'Tutup Modal Invoice'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 sm:p-10 space-y-8 print:p-6 print:space-y-6 text-stone-800">
          
          {/* Top Header: Brand Logo & Invoice Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-stone-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-2xl text-[#800020] tracking-tight">FBS BAKERY WORLD</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> OFFICIAL RECEIPT
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'EN' ? 'Trusted Bakery Ingredients & Cake Decor Supplies Malaysia' : language === 'MS' ? 'Pembekal Bahan & Hiasan Kek Terpercaya Malaysia' : 'Pemasok Bahan & Hiasan Kue Terpercaya Malaysia'}
              </p>
              <p className="text-[11px] text-stone-500">Chukai, Terengganu | {language === 'EN' ? 'Contact:' : language === 'MS' ? 'Hubungi:' : 'Hubungi:'} +60 18-394 2147</p>
            </div>

            <div className="text-left sm:text-right bg-stone-50 p-4 rounded-2xl border border-stone-200 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-[#800020] uppercase tracking-wider block">INVOICE NO.</span>
              <span className="font-mono text-lg font-bold text-stone-900 block">{invoiceNumber}</span>
              <span className="text-xs text-stone-500 block mt-1">{language === 'EN' ? 'Date:' : language === 'MS' ? 'Tarikh:' : 'Tanggal:'} {orderDate}</span>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#800020]/10 text-[#800020] uppercase">
                Status: {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50/80 p-5 rounded-2xl border border-stone-200 text-xs">
            <div>
              <span className="font-bold text-[#800020] uppercase tracking-wider block mb-1.5">{language === 'EN' ? 'Customer Information' : language === 'MS' ? 'Maklumat Pelanggan' : 'Informasi Pelanggan'}</span>
              <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
              <p className="text-stone-600 mt-0.5">{language === 'EN' ? 'Phone:' : language === 'MS' ? 'Telefon:' : 'Telepon:'} {order.customerPhone}</p>
            </div>

            <div>
              <span className="font-bold text-[#800020] uppercase tracking-wider block mb-1.5">{language === 'EN' ? 'Delivery Address' : language === 'MS' ? 'Alamat Penghantaran' : 'Alamat Pengiriman'}</span>
              <p className="text-stone-700 leading-relaxed font-medium">{order.address}</p>
              <p className="text-stone-700 font-medium">{order.city}, {order.postcode}, {order.state}</p>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#800020] text-white font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">No.</th>
                  <th className="py-3 px-4">{language === 'EN' ? 'Item & Variant' : language === 'MS' ? 'Item & Varian' : 'Barang & Varian'}</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">{language === 'EN' ? 'Unit Price' : language === 'MS' ? 'Harga Unit' : 'Harga Satuan'}</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">{language === 'EN' ? 'Total' : language === 'MS' ? 'Jumlah' : 'Jumlah'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-bold text-stone-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900 block text-sm">{item.productName}</span>
                      <span className="text-stone-500 text-[11px]">{language === 'EN' ? 'Variant:' : 'Varian:'} {item.variantName}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-stone-800">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-stone-600">{formatMYR(item.price)}</td>
                    <td className="py-3 px-4 text-right font-bold text-stone-900">{formatMYR(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total & Summary Footer */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="text-xs text-stone-500 space-y-1">
              <p className="font-bold text-stone-700">{language === 'EN' ? 'Thank you for shopping at FBS Bakery World!' : language === 'MS' ? 'Terima kasih kerana berbelanja di FBS Bakery World!' : 'Terima kasih telah berbelanja di FBS Bakery World!'}</p>
              <p>{language === 'EN' ? 'This official receipt is generated automatically by FBS Bakery World e-commerce system.' : language === 'MS' ? 'Resit rasmi ini digenerasikan secara automatik oleh sistem e-dagang FBS Bakery World.' : 'Kuitansi resmi ini dibuat secara otomatis oleh sistem e-commerce FBS Bakery World.'}</p>
            </div>

            <div className="w-full sm:w-64 bg-[#800020]/5 p-4 rounded-2xl border border-[#800020]/20 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 font-medium">
                <span>{language === 'EN' ? 'Product Subtotal:' : language === 'MS' ? 'Subjumlah Produk:' : 'Subtotal Produk:'}</span>
                <span>{formatMYR(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-stone-600 font-medium">
                <span>{language === 'EN' ? 'Tax / Duty:' : language === 'MS' ? 'Cukai / Duti:' : 'Pajak / Bea:'}</span>
                <span>RM 0.00</span>
              </div>
              <div className="flex justify-between text-[#800020] font-black text-base pt-2 border-t border-[#800020]/20">
                <span>{language === 'EN' ? 'GRAND TOTAL:' : language === 'MS' ? 'JUMLAH KESELURUHAN:' : 'TOTAL KESELURUHAN:'}</span>
                <span>{formatMYR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
