'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { db } from '@/lib/db';
import { formatMYR } from '@/lib/currency';
import { generateWhatsAppOrderLink } from '@/lib/whatsapp';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { Order, Voucher } from '@/types';
import { 
  MessageCircle, 
  CheckCircle2, 
  PackageCheck, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag,
  MapPin,
  User,
  Phone,
  FileText,
  Tag,
  Sparkles
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, totalItems, clearCart } = useCart();
  const { t } = useLanguage();
  const [settings, setSettings] = useState(db.getStoreSettings());

  useEffect(() => {
    const loadLiveData = () => {
      setSettings(db.getStoreSettings());
    };
    loadLiveData();

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Shah Alam',
    state: 'Selangor',
    postcode: '40000',
    notes: '',
  });

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAutoFilled, setIsAutoFilled] = useState(false);

  useEffect(() => {
    try {
      const session = localStorage.getItem('fbs_customer_session');
      if (session) {
        const sessObj = JSON.parse(session);
        setFormData(prev => ({
          ...prev,
          name: sessObj.name || prev.name,
          phone: sessObj.phone || prev.phone,
          address: sessObj.address || prev.address,
          city: sessObj.city || prev.city,
          state: sessObj.state || prev.state,
          postcode: sessObj.postcode || prev.postcode,
        }));
        if (sessObj.address) {
          setIsAutoFilled(true);
        }
      }
    } catch (e) {}
  }, []);

  const statesMalaysia = [
    'Selangor',
    'Kuala Lumpur',
    'Johor',
    'Penang',
    'Perak',
    'Melaka',
    'Kedah',
    'Pahang',
    'Terengganu',
    'Kelantan',
    'Negeri Sembilan',
    'Sabah',
    'Sarawak',
    'Putrajaya',
    'Labuan',
    'Perlis'
  ];

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    if (!voucherCode.trim()) return;

    const vouchers = db.getVouchers();
    const found = vouchers.find(v => v.code.toUpperCase() === voucherCode.trim().toUpperCase() && v.status);

    if (!found) {
      setVoucherError(t.checkout.voucherNotFound);
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    if (subtotal < found.minSpend) {
      setVoucherError(`${t.checkout.voucherMinSpend} ${found.minSpend}.00`);
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    let calculatedDiscount = 0;
    if (found.discountType === 'PERCENT') {
      calculatedDiscount = (subtotal * found.discountValue) / 100;
    } else {
      calculatedDiscount = found.discountValue;
    }

    setAppliedVoucher(found);
    setDiscountAmount(calculatedDiscount);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      // 1. Create order record in Database
      const newOrder = db.createOrder({
        customerName: formData.name,
        customerPhone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
        notes: `${formData.notes}${appliedVoucher ? ` [Voucher Applied: ${appliedVoucher.code} (-${formatMYR(discountAmount)})]` : ''}`,
        totalAmount: finalTotal,
        orderStatus: 'NEW',
        items: cart.map(item => ({
          id: `oi-${Date.now()}-${Math.random()}`,
          orderId: '',
          productId: item.productId,
          productVariantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          mainImage: item.mainImage,
        }))
      });

      // 2. Generate WhatsApp Message Link
      const waLink = generateWhatsAppOrderLink({
        orderNumber: newOrder.orderNumber,
        customerName: formData.name,
        customerPhone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
        notes: `${formData.notes}${appliedVoucher ? ` [Voucher Promo: ${appliedVoucher.code} (Diskon ${formatMYR(discountAmount)})]` : ''}`,
        items: cart,
        subtotal: finalTotal,
        whatsappNumber: settings.whatsappNumber,
      });

      newOrder.whatsappUrl = waLink;
      setCreatedOrder(newOrder);

      // 3. Clear cart
      clearCart();

      // 4. Open WhatsApp window
      window.open(waLink, '_blank');
    } catch (err) {
      console.error(err);
      alert(t.checkout.errorCreating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {createdOrder ? (
          /* SUCCESS ORDER CONFIRMATION SCREEN */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#EADBC8] shadow-xl text-center space-y-6 animate-fade-in my-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full inline-block mb-2">
                {t.checkout.orderSuccess}
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#800020]">
                {t.checkout.orderRegistered} {createdOrder.orderNumber}
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm mt-2">
                {t.checkout.thankYou}
              </p>
            </div>

            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] text-left text-xs space-y-2 text-stone-700">
              <div className="flex justify-between font-bold text-[#800020]">
                <span>{t.checkout.orderStatus}:</span>
                <span className="uppercase">{createdOrder.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.checkout.totalAmount}:</span>
                <span className="font-bold">{formatMYR(createdOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.checkout.phone}:</span>
                <span>{createdOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.checkout.deliveryAddress}:</span>
                <span className="truncate max-w-xs">{createdOrder.address}, {createdOrder.city}, {createdOrder.state}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              {createdOrder.whatsappUrl && (
                <a
                  href={createdOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" /> {t.checkout.openWAAgain}
                </a>
              )}
              <Link
                href={`/track-order?orderNumber=${encodeURIComponent(createdOrder.orderNumber)}&phone=${encodeURIComponent(createdOrder.customerPhone)}`}
                className="flex-1 py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-4 h-4" /> {t.checkout.trackOrderStatus}
              </Link>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM SCREEN */
          <div>
            <div className="mb-8 border-b border-[#EADBC8] pb-4">
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#800020] flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-[#25D366]" /> {t.checkout.title}
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                {t.checkout.subtitle}
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBC8] shadow-sm my-8">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h2 className="font-serif text-xl font-bold text-[#800020]">{t.checkout.emptyCart}</h2>
                <p className="text-stone-500 text-xs mt-1">{t.checkout.emptyCartNote}</p>
                <Link href="/products" className="mt-4 inline-block px-6 py-2.5 bg-[#800020] text-white text-xs font-bold rounded-xl">
                  {t.checkout.browseCatalog}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Customer Form Input */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8] shadow-sm space-y-6">
                  
                  {isAutoFilled && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{t.checkout.autoFillNote}</span>
                      </div>
                      <Link href="/account" className="text-[11px] font-bold text-[#800020] underline flex-shrink-0">
                        {t.checkout.changeAddress}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center gap-2 border-b border-stone-200 pb-3 text-[#800020]">
                    <User className="w-5 h-5" />
                    <h2 className="font-serif text-lg font-bold">{t.checkout.contactHeader}</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        {t.checkout.fullName} <span className="text-red-600">*</span>
                      </label>
                      <input 
                        type="text"
                        name="name"
                        required
                        placeholder={t.checkout.namePlaceholder}
                        value={formData.name}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        {t.checkout.phoneNumber} <span className="text-red-600">*</span>
                      </label>
                      <input 
                        type="tel"
                        name="phone"
                        required
                        placeholder={t.checkout.phonePlaceholder}
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-b border-stone-200 pb-3 pt-4 text-[#800020]">
                    <MapPin className="w-5 h-5" />
                    <h2 className="font-serif text-lg font-bold">{t.checkout.addressHeader}</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        {t.checkout.streetAddress} <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        name="address"
                        required
                        rows={2}
                        placeholder={t.checkout.addressPlaceholder}
                        value={formData.address}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          {t.checkout.city} <span className="text-red-600">*</span>
                        </label>
                        <input 
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          {t.checkout.postcode} <span className="text-red-600">*</span>
                        </label>
                        <input 
                          type="text"
                          name="postcode"
                          required
                          value={formData.postcode}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          {t.checkout.state} <span className="text-red-600">*</span>
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                        >
                          {statesMalaysia.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-b border-stone-200 pb-3 pt-4 text-[#800020]">
                    <FileText className="w-5 h-5" />
                    <h2 className="font-serif text-lg font-bold">{t.checkout.notesHeader}</h2>
                  </div>

                  <div>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder={t.checkout.notesPlaceholder}
                      value={formData.notes}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                  </div>

                </div>

                {/* Right Column: Order Review & Voucher Promo Input */}
                <div className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-md h-fit space-y-6">
                  <h2 className="font-serif text-xl font-bold text-[#800020] border-b border-stone-200 pb-3">
                    {t.checkout.orderItems} ({totalItems})
                  </h2>

                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                    {cart.map(item => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex justify-between items-center text-xs text-stone-700 pb-2 border-b border-stone-100">
                        <div>
                          <span className="font-bold text-stone-900 block truncate max-w-[180px]">{item.productName}</span>
                          <span className="text-[11px] text-stone-500">{t.cart.variant}: {item.variantName} x {item.quantity}</span>
                        </div>
                        <span className="font-bold text-[#800020]">{formatMYR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* PROMO VOUCHER APPLICATION FORM */}
                  <div className="pt-2 space-y-3 border-t border-stone-200">
                    <label className="block text-xs font-bold text-stone-700 uppercase flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#800020]" /> {t.checkout.voucherLabel}
                    </label>

                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder={t.checkout.voucherPlaceholder}
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono font-bold uppercase text-[#800020]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl flex-shrink-0"
                      >
                        {t.checkout.voucherApplyBtn}
                      </button>
                    </div>

                    {voucherError && (
                      <p className="text-[11px] font-medium text-red-600">{voucherError}</p>
                    )}

                    {appliedVoucher && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t.checkout.voucherApplied}: {appliedVoucher.code}
                        </div>
                        <p className="text-[11px]">{appliedVoucher.title}</p>
                      </div>
                    )}
                  </div>

                  {/* SUBTOTAL & DISCOUNT BREAKDOWN */}
                  <div className="pt-2 space-y-2 text-xs border-t border-stone-200">
                    <div className="flex justify-between text-stone-600">
                      <span>{t.checkout.subtotalProduk}</span>
                      <span>{formatMYR(subtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>{t.checkout.discountVoucher} ({appliedVoucher?.code})</span>
                        <span>-{formatMYR(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-extrabold text-[#800020] pt-2 border-t border-stone-200">
                      <span>{t.checkout.finalTotal}</span>
                      <span>{formatMYR(finalTotal)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFF8F0] rounded-xl border border-[#EADBC8] text-[11px] text-stone-600 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                    <span>{t.checkout.formNote}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    {isSubmitting ? t.checkout.submitting : t.checkout.submitBtn}
                  </button>
                </div>

              </form>
            )}

          </div>
        )}

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
