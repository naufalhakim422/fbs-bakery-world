'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { useNotification } from '@/lib/notification-context';
import { db } from '@/lib/db';
import { formatMYR } from '@/lib/currency';
import { generateWhatsAppOrderLink } from '@/lib/whatsapp';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { InvoiceModal } from '@/components/customer/invoice-modal';
import { Order } from '@/types';
import { 
  MessageCircle, 
  CheckCircle2, 
  PackageCheck, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag,
  MapPin,
  User,
  FileText,
  Printer,
  Truck,
  Scale,
  Tag,
  ChevronRight
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, totalItems, totalWeightGrams, totalWeightKg, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { showToast } = useNotification();
  const [settings, setSettings] = useState(db.getStoreSettings());

  const [activeCouriers, setActiveCouriers] = useState(db.getCouriers().filter(c => c.status));
  const [selectedCourierId, setSelectedCourierId] = useState<string>(activeCouriers[0]?.id || 'cour-jnt');

  useEffect(() => {
    const loadLiveData = () => {
      setSettings(db.getStoreSettings());
      const loadedCouriers = db.getCouriers().filter(c => c.status);
      setActiveCouriers(loadedCouriers);
      if (loadedCouriers.length > 0 && !loadedCouriers.some(c => c.id === selectedCourierId)) {
        setSelectedCourierId(loadedCouriers[0].id);
      }
    };
    loadLiveData();

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, [selectedCourierId]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Shah Alam',
    state: 'Selangor',
    postcode: '40000',
    notes: '',
  });

  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

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
    } catch (e) {
      console.warn('Failed to parse customer session in checkout:', e);
    }
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectedCourier = activeCouriers.find(c => c.id === selectedCourierId) || activeCouriers[0] || {
    id: 'cour-jnt',
    name: 'J&T Express',
    code: 'JNT',
    logo: '🚚',
    status: true,
    sortOrder: 1
  };

  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null);
  const [voucherMsg, setVoucherMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const shippingFee = 0;
  const grandTotal = Math.max(0, subtotal - discount);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cart.length === 0) return;

    setIsSubmitting(true);

    try {
      let custId = '';
      let custEmail = '';
      try {
        const session = localStorage.getItem('fbs_customer_session');
        if (session) {
          const sessObj = JSON.parse(session);
          custId = sessObj.id || '';
          custEmail = sessObj.email || '';
        }
      } catch (e) {}

      // Pre-check customer status from DB
      const allCust = db.getCustomers();
      const matchCust = allCust.find(c => 
        (custEmail && c.email && c.email.toLowerCase() === custEmail.toLowerCase()) ||
        (formData.phone && c.phone && c.phone.replace(/[^0-9]/g, '') === formData.phone.replace(/[^0-9]/g, ''))
      );
      if (matchCust) {
        const status = matchCust.accountStatus || (matchCust.isActive === false ? 'SUSPENDED' : 'ACTIVE');
        if (status === 'SUSPENDED') {
          alert('⚠️ Akun Anda sedang ditangguhkan (Suspended). Silakan hubungi Admin WhatsApp.');
          setIsSubmitting(false);
          return;
        }
        if (status === 'BANNED') {
          alert('🚫 Akses Ditolak: Email/Akun ini telah diblokir permanen (Banned) oleh Admin.');
          setIsSubmitting(false);
          return;
        }
      }

      // 1. Create order record in Database
      const newOrder = db.createOrder({
        customerId: custId,
        customerEmail: custEmail,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
        notes: formData.notes,
        courierName: 'WhatsApp Admin',
        totalAmount: grandTotal,
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

      // 1.5 Sync to Railway PostgreSQL Database via API Endpoint
      const syncPayload = {
        orderNumber: newOrder.orderNumber,
        customerId: custId,
        customerEmail: custEmail,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
        notes: formData.notes,
        courierName: 'WhatsApp Admin',
        totalAmount: grandTotal,
        orderStatus: 'PENDING_PAYMENT',
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          mainImage: item.mainImage,
        }))
      };

      let syncSuccess = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncPayload),
          });
          if (res.ok) {
            syncSuccess = true;
            break;
          }
        } catch (apiErr) {
          console.warn(`[Checkout API Sync Attempt ${attempt}] Failed:`, apiErr);
        }
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!syncSuccess) {
        console.warn('[Checkout API Sync Warning] All 3 attempts failed, saving to pending sync queue');
        try {
          const pendingOrdersStr = localStorage.getItem('fbs_pending_orders_sync');
          const pendingOrders = pendingOrdersStr ? JSON.parse(pendingOrdersStr) : [];
          pendingOrders.push(syncPayload);
          localStorage.setItem('fbs_pending_orders_sync', JSON.stringify(pendingOrders));
        } catch (e) {
          console.error('Failed to save to pending queue', e);
        }
      }

      // 2. Generate WhatsApp Message Link
      const waLink = generateWhatsAppOrderLink({
        orderNumber: newOrder.orderNumber,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
        notes: `${formData.notes} [Berat Total: ${totalWeightKg} kg]`,
        items: cart,
        subtotal: subtotal,
        discount: discount,
        courier: 'WhatsApp Admin',
        shippingFee: 0,
        total: grandTotal,
        grandTotal: grandTotal,
        whatsappNumber: settings?.whatsappNumber || '60183972147',
      });

      newOrder.whatsappUrl = waLink;
      setCreatedOrder(newOrder);
      showToast(language === 'EN' ? 'Order Placed!' : language === 'MS' ? 'Pesanan Berjaya!' : 'Pesanan Berhasil!', `${newOrder.orderNumber}`, 'success');

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
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {createdOrder ? (
          /* SUCCESS ORDER CONFIRMATION SCREEN */
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 sm:p-10 border border-stone-200 shadow-xs text-center space-y-5 my-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md inline-block">
                {t.checkout.orderSuccess}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1B1B]">
                {t.checkout.orderRegistered} {createdOrder.orderNumber}
              </h1>
              <p className="text-stone-500 text-xs sm:text-sm font-medium">
                {t.checkout.thankYou}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-2 text-stone-700 font-medium">
              <div className="flex justify-between font-bold text-[#800020]">
                <span>{t.checkout.orderStatus}:</span>
                <span className="uppercase">{createdOrder.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.checkout.totalAmount}:</span>
                <span className="font-bold text-stone-900">{formatMYR(createdOrder.totalAmount)}</span>
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

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {createdOrder.whatsappUrl && (
                <a
                  href={createdOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" /> {t.checkout.openWAAgain}
                </a>
              )}
              <button
                onClick={() => setIsInvoiceOpen(true)}
                className="flex-1 py-3 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> {language === 'EN' ? 'Print PDF Invoice' : language === 'MS' ? 'Cetak Invois PDF' : 'Cetak Invoice PDF'}
              </button>
              <Link
                href={`/track-order?orderNumber=${encodeURIComponent(createdOrder.orderNumber)}&phone=${encodeURIComponent(createdOrder.customerPhone)}`}
                className="flex-1 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" /> {t.checkout.trackOrderStatus}
              </Link>
            </div>

            <InvoiceModal
              order={createdOrder}
              isOpen={isInvoiceOpen}
              onClose={() => setIsInvoiceOpen(false)}
            />
          </div>
        ) : (
          /* CHECKOUT FORM SCREEN */
          <div>
            {/* EDITORIAL CHECKOUT HEADER */}
            <div className="pb-6 mb-6 border-b border-[#EADBC8] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                {/* Breadcrumb Navigation */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
                  <Link href="/" className="hover:text-[#800020] transition-colors">{t.nav.home}</Link>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  <Link href="/cart" className="hover:text-[#800020] transition-colors">{t.cart.title}</Link>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-[#800020] font-bold">{t.checkout.title}</span>
                </nav>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B1B] tracking-tight">
                  {t.checkout.title}
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm font-medium">
                  {t.checkout.subtitle}
                </p>
              </div>
            </div>

            {cart.length === 0 ? (
              /* EMPTY CART CHECKOUT STATE */
              <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 shadow-xs my-6 space-y-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-serif text-lg font-bold text-[#2B1B1B]">{t.checkout.emptyCart}</h2>
                  <p className="text-stone-500 text-xs font-medium leading-relaxed">{t.checkout.emptyCartNote}</p>
                </div>
                <Link 
                  href="/products" 
                  className="mt-4 inline-block px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  {t.checkout.browseCatalog}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Customer Form Input */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                  
                  {isAutoFilled && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-medium">{t.checkout.autoFillNote}</span>
                      </div>
                      <Link href="/account" className="text-[11px] font-bold text-[#800020] underline shrink-0">
                        {t.checkout.changeAddress}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center gap-2 border-b border-stone-200 pb-3 text-[#800020]">
                    <User className="w-4 h-4" />
                    <h2 className="font-serif text-base font-bold">{t.checkout.contactHeader}</h2>
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
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#800020] transition-all"
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
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#800020] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-b border-stone-200 pb-3 pt-3 text-[#800020]">
                    <MapPin className="w-4 h-4" />
                    <h2 className="font-serif text-base font-bold">{t.checkout.addressHeader}</h2>
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
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#800020] transition-all"
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
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#800020] transition-all"
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
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#800020] transition-all"
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
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#800020] transition-all bg-white"
                        >
                          {statesMalaysia.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                  <div className="flex items-center gap-2 border-b border-stone-200 pb-3 pt-3 text-[#800020]">
                    <FileText className="w-4 h-4" />
                    <h2 className="font-serif text-base font-bold">{t.checkout.notesHeader}</h2>
                  </div>

                  <div>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder={t.checkout.notesPlaceholder}
                      value={formData.notes}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#800020] transition-all"
                    />
                  </div>

                </div>

                {/* Right Column: Order Review */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs h-fit space-y-5">
                  <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-200 pb-3">
                    {t.checkout.orderItems} ({totalItems})
                  </h2>

                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                    {cart.map(item => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex items-center justify-between gap-3 text-xs text-stone-700 pb-2.5 border-b border-stone-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={item.mainImage} 
                            alt={item.productName} 
                            className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-stone-900 block truncate">{item.productName}</span>
                            <span className="text-[11px] text-stone-500">{t.cart.variant}: {item.variantName} x {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-[#800020] shrink-0">{formatMYR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* PROMO VOUCHER CODE FORM */}
                  <div className="pt-3 border-t border-stone-200 space-y-2">
                    <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#800020]" /> Kode Voucher Diskon / Promo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: FBSDISCOUNT10, BAKERY20"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const clean = voucherCode.trim();
                          if (!clean) return;
                          if (clean === 'FBSDISCOUNT10' || clean === 'BAKERY10' || clean === 'FBS10') {
                            const disc = Math.round(subtotal * 0.10 * 100) / 100;
                            setAppliedVoucher({ code: clean, discountAmount: disc });
                            setVoucherMsg({ type: 'success', text: `Voucher ${clean} Berhasil! (Diskon 10%)` });
                          } else if (clean === 'BAKERY20' || clean === 'FBS20') {
                            const disc = Math.round(subtotal * 0.20 * 100) / 100;
                            setAppliedVoucher({ code: clean, discountAmount: disc });
                            setVoucherMsg({ type: 'success', text: `Voucher ${clean} Berhasil! (Diskon 20%)` });
                          } else if (clean === 'FREEPOST' || clean === 'ONGKIRFREE') {
                            setAppliedVoucher({ code: clean, discountAmount: shippingFee });
                            setVoucherMsg({ type: 'success', text: `Voucher ${clean} Berhasil! Gratis Ongkos Kirim!` });
                          } else {
                            setVoucherMsg({ type: 'error', text: 'Kode voucher tidak valid atau sudah kadaluarsa.' });
                          }
                        }}
                        className="px-3.5 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Gunakan
                      </button>
                    </div>
                    {voucherMsg && (
                      <p className={`text-[11px] font-bold ${voucherMsg.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {voucherMsg.text}
                      </p>
                    )}
                  </div>

                  {/* SUBTOTAL & SHIPPING BREAKDOWN */}
                  <div className="pt-2 space-y-2.5 text-xs border-t border-stone-200 font-medium">
                    <div className="flex justify-between text-stone-600">
                      <span>{t.checkout.subtotalProduk}</span>
                      <span>{formatMYR(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Diskon Voucher Promo ({appliedVoucher?.code}):</span>
                        <span>-{formatMYR(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600">
                      <span className="flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-stone-500" />
                        <span>Total Berat Pesanan</span>
                      </span>
                      <span className="font-mono font-bold text-stone-800">{totalWeightKg} kg</span>
                    </div>

                    <div className="flex justify-between items-center text-stone-700 font-medium">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#800020]" />
                        <span>Ongkos Kirim</span>
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">Dikonfirmasi Admin via WA</span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-[#800020] pt-2.5 border-t border-stone-200">
                      <span>{t.checkout.finalTotal}</span>
                      <span>{formatMYR(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{t.checkout.formNote}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
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
