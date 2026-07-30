'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { formatMYR } from '@/lib/currency';
import { useCart } from '@/lib/cart-context';
import { User, Package, Heart, RefreshCw, MapPin, Phone, Mail, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Award, HelpCircle, Gift, Truck, Tag, Info, Copy, LogOut, X, Video, Image as ImageIcon, Star } from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'benefits' | 'wishlist' | 'profile'>('orders');
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string>('');

  // Verified Buyer Review Modal State
  const [reviewModalItem, setReviewModalItem] = useState<{ productId: string; productName: string; customerName: string } | null>(null);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState('');
  const [modalVideoUrl, setModalVideoUrl] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalVideoPreview, setModalVideoPreview] = useState('');
  const [modalImagePreview, setModalImagePreview] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);

  const { wishlist, addToCart } = useCart();

  useEffect(() => {
    try {
      const session = localStorage.getItem('fbs_customer_session');
      if (!session) {
        router.push('/account/login');
        return;
      }

      const sessObj = JSON.parse(session);
      const customers = db.getCustomers();
      const found = customers.find(c => c.phone.replace(/[^0-9]/g, '').includes(sessObj.phone?.replace(/[^0-9]/g, '')) || c.id === sessObj.id);
      
      if (found) {
        setCustomer(found);
      } else {
        setCustomer({
          id: sessObj.id || `cust-${Date.now()}`,
          name: sessObj.name || 'Pelanggan Baru',
          email: sessObj.email || '',
          phone: sessObj.phone || '',
          customerType: sessObj.customerType || 'RETAIL',
          address: sessObj.address || 'Shah Alam, Selangor',
          city: sessObj.city || 'Shah Alam',
          state: sessObj.state || 'Selangor',
          postcode: sessObj.postcode || '40000',
        });
      }

      const allOrders = db.getOrders();
      setOrders(allOrders);

      const allVouchers = db.getVouchers().filter(v => v.status);
      setVouchers(allVouchers);

    } catch (e) {
      console.error(e);
      router.push('/account/login');
    }
  }, [router]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleCustomerLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun ini?')) {
      localStorage.removeItem('fbs_customer_session');
      router.push('/account/login');
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#800020] animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-600">Loading your customer account session...</p>
        </div>
      </div>
    );
  }

  const wishlistProducts = wishlist
    .map(id => db.getProductBySlug(id))
    .filter(Boolean) as any[];

  // Eligible Vouchers for Customer Member Tier
  const eligibleVouchers = vouchers.filter(v => 
    v.targetTier === 'ALL' || v.targetTier === customer.customerType
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Customer Profile & Member Badge Banner */}
        <div className="bg-gradient-to-r from-[#800020] via-[#6F1D1B] to-[#5A0015] text-[#FFF8F0] p-6 sm:p-8 rounded-3xl mb-8 shadow-xl border-2 border-[#D4AF37]/40 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center md:text-left flex-col sm:flex-row">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-500 text-[#800020] font-serif font-black text-2xl flex items-center justify-center border-2 border-white shadow-lg flex-shrink-0">
                {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="font-serif text-2xl font-bold text-white">{customer.name}</h1>
                  <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase flex items-center gap-1 shadow ${
                    customer.customerType === 'VIP'
                      ? 'bg-[#D4AF37] text-[#800020]'
                      : customer.customerType === 'WHOLESALE'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/20 text-white'
                  }`}>
                    <Sparkles className="w-3 h-3" /> {customer.customerType} MEMBER
                  </span>
                </div>
                <p className="text-stone-300 text-xs mt-1">{customer.phone} • {customer.email || 'Registered Customer'}</p>
              </div>
            </div>

            {/* Quick Benefits & Logout Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('benefits')}
                className="bg-[#D4AF37] hover:bg-amber-400 text-[#800020] px-5 py-3 rounded-2xl font-serif font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <Award className="w-4 h-4" /> VOUCHER & KEUNTUNGAN MEMBER <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleCustomerLogout}
                className="bg-white/10 hover:bg-red-900/80 text-white border border-white/30 px-4 py-3 rounded-2xl font-bold text-xs shadow transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-red-300" /> LOG OUT AKUN
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#EADBC8] mb-8 gap-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders' ? 'border-[#800020] text-[#800020]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" /> Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('benefits')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'benefits' ? 'border-[#800020] text-[#800020]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Award className="w-4 h-4 text-[#D4AF37]" /> Klaim Voucher & Perks Member ⭐
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'wishlist' ? 'border-[#800020] text-[#800020]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" /> Saved Wishlist ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile' ? 'border-[#800020] text-[#800020]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" /> Saved Profile & Address
          </button>
        </div>

        {/* TAB: MEMBER BENEFITS & VOUCHER CLAIMS */}
        {activeTab === 'benefits' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* SECTION 1: AVAILABLE VOUCHERS TO CLAIM FOR THIS MEMBER */}
            <div className="bg-gradient-to-br from-[#800020] to-[#5A0015] text-[#FFF8F0] p-6 sm:p-8 rounded-3xl border-2 border-[#D4AF37]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div>
                  <span className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-widest block">
                    EXCLUSIVE MEMBER PROMO VOUCHERS
                  </span>
                  <h2 className="font-serif text-2xl font-extrabold text-white flex items-center gap-2">
                    <Tag className="w-6 h-6 text-[#D4AF37]" /> Voucher Diskon Khusus Member {customer.customerType}
                  </h2>
                </div>
                <span className="px-3 py-1 bg-[#D4AF37] text-[#800020] text-xs font-black rounded-full uppercase">
                  {eligibleVouchers.length} Vouchers Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {eligibleVouchers.map(v => (
                  <div key={v.id} className="bg-white text-stone-900 p-5 rounded-2xl border-2 border-[#D4AF37] shadow-lg flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-[#800020] text-[#D4AF37] rounded uppercase">
                          {v.targetTier === 'ALL' ? 'ALL MEMBERS' : `${v.targetTier} ONLY`}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          Min Spend: RM {v.minSpend}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#2B1B1B]">{v.title}</h3>
                      
                      <div className="font-mono text-lg font-black text-[#800020] tracking-wider my-2 bg-stone-100 p-2 rounded-xl border border-dashed border-[#800020]/40 text-center">
                        {v.code}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCode(v.code)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 ${
                        copiedCode === v.code
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37]'
                      }`}
                    >
                      {copiedCode === v.code ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> KODE VOUCHER TERSIMPAN!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> KLAIM & SALIN KODE
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: MEMBER TIER PERKS COMPARISON */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8] shadow-sm">
              <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
                FBS BAKERY WORLD LOYALTY PROGRAM
              </span>
              <h2 className="font-serif text-2xl font-extrabold text-[#2B1B1B]">
                Panduan & Keuntungan Tingkat Keanggotaan
              </h2>
              <p className="text-stone-600 text-xs mt-1">
                Keanggotaan di FBS Bakery World adalah <strong>100% GRATIS</strong>. Tingkatan member Anda akan meningkat secara otomatis seiring dengan frekuensi pembelian Anda.
              </p>

              {/* 3 Tier Perk Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                
                {/* TIER 1: RETAIL */}
                <div className={`p-6 rounded-3xl border-2 transition-all relative flex flex-col justify-between ${
                  customer.customerType === 'RETAIL' ? 'border-[#800020] bg-white shadow-xl' : 'border-stone-200 bg-stone-50/60'
                }`}>
                  {customer.customerType === 'RETAIL' && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-[#800020] text-[#D4AF37] text-[10px] font-black rounded-full uppercase">
                      TINGKATAN ANDA SAAT INI
                    </span>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif font-bold text-xl text-[#2B1B1B]">RETAIL MEMBER</h3>
                      <span className="px-2.5 py-1 bg-stone-200 text-stone-800 text-[10px] font-black rounded-md">GRATIS</span>
                    </div>
                    <p className="text-stone-600 text-xs mb-4">Didapatkan otomatis saat pertama kali mendaftar atau berbelanja.</p>

                    <ul className="space-y-2.5 text-xs text-stone-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Express WA Checkout:</strong> Alamat tersimpan otomatis tanpa perlu ketik ulang.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Pelacakan Resi Real-Time:</strong> Lacak status kurir (J&T, Pos Laju, Ninja Van) kapan saja.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Voucher Welcome:</strong> Klaim voucher RM10 OFF pada order pertama.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-stone-200 mt-6 text-[11px] text-stone-500">
                    💡 <i>Syarat: Cukup daftar akun atau beli 1 produk.</i>
                  </div>
                </div>

                {/* TIER 2: VIP */}
                <div className={`p-6 rounded-3xl border-2 transition-all relative flex flex-col justify-between ${
                  customer.customerType === 'VIP' ? 'border-[#800020] bg-white shadow-xl ring-2 ring-[#D4AF37]' : 'border-[#D4AF37]/50 bg-amber-50/30'
                }`}>
                  {customer.customerType === 'VIP' && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-[#800020] text-[#D4AF37] text-[10px] font-black rounded-full uppercase flex items-center gap-1 shadow">
                      <Sparkles className="w-3 h-3" /> TINGKATAN ANDA SAAT INI
                    </span>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif font-bold text-xl text-[#800020] flex items-center gap-1.5">
                        VIP MEMBER ⭐
                      </h3>
                      <span className="px-2.5 py-1 bg-[#D4AF37] text-[#800020] text-[10px] font-black rounded-md">SPECIAL PERKS</span>
                    </div>
                    <p className="text-stone-600 text-xs mb-4">Diberikan untuk pelanggan setia yang sering berbelanja bahan baking.</p>

                    <ul className="space-y-2.5 text-xs text-stone-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                        <span><strong>Voucher VIP 20% OFF:</strong> Akses klaim voucher diskon 20% khusus VIP Member.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                        <span><strong>Prioritas Pemrosesan Order:</strong> Order VIP langsung dipack & dikirim paling awal.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                        <span><strong>Free Bonus Sampel Baking:</strong> Sampel gratis Uji Matcha / Belgian Chocolate pada tiap order.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-amber-200 mt-6 text-[11px] text-[#800020] font-medium">
                    ⭐ <i>Diberikan otomatis oleh sistem seiring peningkatan order Anda.</i>
                  </div>
                </div>

                {/* TIER 3: WHOLESALE B2B */}
                <div className={`p-6 rounded-3xl border-2 transition-all relative flex flex-col justify-between ${
                  customer.customerType === 'WHOLESALE' ? 'border-blue-600 bg-white shadow-xl' : 'border-blue-200 bg-blue-50/30'
                }`}>
                  {customer.customerType === 'WHOLESALE' && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-blue-700 text-white text-[10px] font-black rounded-full uppercase">
                      TINGKATAN ANDA SAAT INI
                    </span>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif font-bold text-xl text-blue-900">WHOLESALE B2B</h3>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md">BUSINESS</span>
                    </div>
                    <p className="text-stone-600 text-xs mb-4">Khusus pemilik toko roti, cafe, restoran, dan dessert designer commercial.</p>

                    <ul className="space-y-2.5 text-xs text-stone-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Voucher RM50 OFF Grosir:</strong> Potongan harga khusus pembelian sak 5kg & 25kg.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Logistik Pengiriman Pallet:</strong> Pengiriman kurir kargo untuk bahan tonase besar.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Faktur & Invoicing Resmi Usaha:</strong> Penerbitan invoice resmi untuk pembukuan bisnis.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-blue-200 mt-6 text-[11px] text-blue-800 font-medium">
                    🏭 <i>Dapat diajukan melalui WhatsApp Admin dengan melampirkan nama usaha.</i>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBC8]">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <h3 className="font-serif text-lg font-bold text-[#800020]">No order history found</h3>
                <p className="text-xs text-stone-500 mt-1">Place your first baking supply order via WhatsApp checkout.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-3 gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#800020] block">{order.orderNumber}</span>
                      <span className="text-[11px] text-stone-400">Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase">
                        {order.orderStatus}
                      </span>
                      <span className="font-serif font-extrabold text-base text-[#800020]">
                        {formatMYR(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Item Preview */}
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-stone-700 bg-stone-50 p-3 rounded-xl gap-2 border border-stone-200">
                        <div>
                          <span className="font-bold text-stone-900 block">{item.productName}</span>
                          <span className="text-[11px] text-stone-500">Variant: {item.variantName} x {item.quantity}</span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                          <span className="font-bold text-[#800020]">{formatMYR(item.subtotal)}</span>

                          {/* DELIVERED ORDER VERIFIED REVIEW TRIGGER */}
                          {order.orderStatus === 'DELIVERED' && (
                            <button
                              onClick={() => setReviewModalItem({
                                productId: item.productId,
                                productName: item.productName,
                                customerName: order.customerName,
                              })}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-xl shadow flex items-center gap-1 transition-transform active:scale-95 flex-shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Beri Ulasan & Video
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions: Repeat Order & Tracking */}
                  <div className="flex flex-wrap gap-2 pt-2 justify-end">
                    {order.orderStatus === 'DELIVERED' && (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pesanan Telah Sampai (Verified Delivered)
                      </span>
                    )}
                    <Link
                      href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone)}`}
                      className="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" /> Track Status & Courier Resi
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBC8]">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <h3 className="font-serif text-lg font-bold text-[#800020]">No items in wishlist</h3>
                <p className="text-xs text-stone-500 mt-1">Click the heart icon on any baking product to save for later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl border border-[#EADBC8] shadow-sm flex flex-col justify-between">
                    <div>
                      <img src={p.mainImage} alt={p.productName} className="w-full h-40 object-cover rounded-xl mb-3" />
                      <h4 className="font-serif font-bold text-sm text-[#2B1B1B]">{p.productName}</h4>
                      <span className="text-xs font-bold text-[#800020] block mt-1">{formatMYR(p.variants[0]?.price || 0)}</span>
                    </div>
                    <button
                      onClick={() => addToCart(p, p.variants[0], 1)}
                      className="mt-4 w-full py-2 bg-[#800020] text-white text-xs font-bold rounded-xl"
                    >
                      Add To Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED PROFILE & ADDRESS CMS */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8] shadow-sm max-w-2xl mx-auto space-y-6 text-xs text-stone-700 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#800020] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#800020]" /> Pengaturan Profil & Alamat Pengiriman
                </h3>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Simpan alamat utama Anda agar otomatis terisi secara instan saat melakukan checkout pemesanan.
                </p>
              </div>
              <button
                onClick={handleCustomerLogout}
                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>

            {/* Address Edit Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // Save updated session to localStorage
                const updatedCust = {
                  ...customer,
                  name: (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value,
                  phone: (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value,
                  email: (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value,
                  address: (e.currentTarget.elements.namedItem('address') as HTMLTextAreaElement).value,
                  city: (e.currentTarget.elements.namedItem('city') as HTMLInputElement).value,
                  postcode: (e.currentTarget.elements.namedItem('postcode') as HTMLInputElement).value,
                  state: (e.currentTarget.elements.namedItem('state') as HTMLSelectElement).value,
                };

                setCustomer(updatedCust);
                localStorage.setItem('fbs_customer_session', JSON.stringify(updatedCust));
                
                alert('✅ Alamat pengiriman utama Anda berhasil disimpan! Saat checkout nanti, alamat ini akan otomatis terisi.');
              }} 
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Nama Lengkap Pelanggan
                  </label>
                  <input 
                    type="text"
                    name="name"
                    required
                    defaultValue={customer.name}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    required
                    defaultValue={customer.phone}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Alamat Email (Opsional)
                </label>
                <input 
                  type="email"
                  name="email"
                  defaultValue={customer.email || ''}
                  placeholder="baker@example.com"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Alamat Jalan / Rumah / Bangunan / unit <span className="text-red-600">*</span>
                </label>
                <textarea 
                  name="address"
                  required
                  rows={2}
                  defaultValue={customer.address}
                  placeholder="Contoh: No 45, Jalan Bunga Raya 7/2, Section 7"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Kota / Bandar <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text"
                    name="city"
                    required
                    defaultValue={customer.city || 'Shah Alam'}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Poskod <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text"
                    name="postcode"
                    required
                    defaultValue={customer.postcode || '40000'}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Negeri (Malaysia) <span className="text-red-600">*</span>
                  </label>
                  <select 
                    name="state"
                    defaultValue={customer.state || 'Selangor'}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                  >
                    {[
                      'Selangor', 'Kuala Lumpur', 'Johor', 'Penang', 'Perak', 'Melaka', 'Kedah', 
                      'Pahang', 'Terengganu', 'Kelantan', 'Negeri Sembilan', 'Sabah', 'Sarawak', 
                      'Putrajaya', 'Labuan', 'Perlis'
                    ].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs">Otomatisasi Checkout Aktif:</strong>
                  <p className="text-[11px] text-emerald-800">
                    Alamat ini tersimpan aman di peramban Anda. Setiap kali Anda melakukan checkout di FBS Bakery World, semua data nama, nomor HP, dan alamat pengiriman ini akan otomatis terisi secara instan tanpa perlu ketik ulang!
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> SIMPAN ALAMAT PENGIRIMAN UTAMA
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={handleCustomerLogout}
                className="w-full py-3 bg-red-900 hover:bg-red-950 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <LogOut className="w-4 h-4" /> KELUAR DARI AKUN CUSTOMER (LOG OUT)
              </button>
            </div>
          </div>
        )}

      </main>

      {/* VERIFIED BUYER REVIEW POPUP MODAL */}
      {reviewModalItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37]/50 shadow-2xl space-y-4 text-xs relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => {
                setReviewModalItem(null);
                setModalSubmitted(false);
                setModalVideoPreview('');
                setModalImagePreview('');
              }}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase inline-block mb-1">
                ✓ VERIFIED PURCHASED ORDER
              </span>
              <h2 className="font-serif text-xl font-bold text-[#800020]">
                Beri Ulasan & Video Review
              </h2>
              <p className="text-stone-500 text-xs font-semibold mt-0.5">
                Produk: <span className="text-stone-900 font-bold">{reviewModalItem.productName}</span>
              </p>
            </div>

            {modalSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-emerald-900">Ulasan & Video Berhasil Dipublikasikan!</h3>
                <p className="text-stone-600 text-xs">
                  Terima kasih atas ulasan jujur Anda. Ulasan dan video demo produk Anda kini sudah tampil secara resmi dengan badge Verified Buyer di halaman katalog produk.
                </p>
                <button
                  onClick={() => {
                    setReviewModalItem(null);
                    setModalSubmitted(false);
                  }}
                  className="px-5 py-2.5 bg-[#800020] text-white rounded-xl font-bold text-xs shadow"
                >
                  Tutup Halaman Ini
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!modalComment) return;
                  setModalSubmitting(true);

                  setTimeout(() => {
                    db.addReview({
                      productId: reviewModalItem.productId,
                      customerName: reviewModalItem.customerName || customer.name,
                      rating: modalRating,
                      comment: modalComment,
                      images: modalImagePreview ? [modalImagePreview] : [],
                      videoUrl: modalVideoPreview || undefined,
                      verifiedPurchase: true,
                    });

                    setModalSubmitting(false);
                    setModalSubmitted(true);
                  }, 600);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Berikan Rating Bintang</label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setModalRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Sparkles className={`w-7 h-7 ${star <= modalRating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-stone-900 text-sm">{modalRating} / 5 Bintang</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Pengalaman Penggunaan Bahan & Hasil Roti</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Ceritakan tekstur kue, aroma, tingkat kelembutan, atau daya kembang kue hasil olahan Anda..."
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>

                {/* UPLOAD FOTO & UPLOAD VIDEO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase text-[10px] mb-1">Upload Foto Kue</label>
                    {modalImagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-stone-300 h-24">
                        <img src={modalImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setModalImagePreview('')}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-xl p-2 text-center flex flex-col items-center justify-center bg-stone-50 cursor-pointer h-24">
                        <ImageIcon className="w-5 h-5 text-stone-400 mb-1" />
                        <span className="text-[10px] font-bold text-stone-600">Pilih Foto Lokal</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const r = new FileReader();
                              r.onloadend = () => setModalImagePreview(r.result as string);
                              r.readAsDataURL(f);
                            }
                          }} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase text-[10px] mb-1">Upload Video Demo (MP4/WebM)</label>
                    {modalVideoPreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-stone-300 h-24 bg-black">
                        <video src={modalVideoPreview} controls className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setModalVideoPreview('')}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-xl p-2 text-center flex flex-col items-center justify-center bg-stone-50 cursor-pointer h-24">
                        <Video className="w-5 h-5 text-[#800020] mb-1" />
                        <span className="text-[10px] font-bold text-[#800020]">Pilih Video MP4/WebM</span>
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const r = new FileReader();
                              r.onloadend = () => setModalVideoPreview(r.result as string);
                              r.readAsDataURL(f);
                            }
                          }} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> {modalSubmitting ? 'Mempublikasikan Ulasan...' : 'Publikasikan Ulasan & Video Feedback'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
