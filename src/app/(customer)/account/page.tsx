'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Customer, Order, OrderItem, normalizeToFrontendStatus } from '@/types';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { formatMYR } from '@/lib/currency';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, Package, Heart, RefreshCw, MapPin, Phone, Mail, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Award, HelpCircle, Gift, Truck, Tag, Info, Copy, LogOut, X, Video, Image as ImageIcon, Star, Camera, Upload, Edit2, Check, UserCheck, AlertTriangle, Building, Hash, Globe, ShoppingBag, ShoppingCart, ChevronRight, ExternalLink, Clock, FileText, Printer } from 'lucide-react';
import { InvoiceModal } from '@/components/customer/invoice-modal';

import { normalizePhoneDigits } from '@/lib/whatsapp';

const getInitialOrdersForSession = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const session = localStorage.getItem('fbs_customer_session');
    if (!session) return [];
    const sessObj = JSON.parse(session);
    const custEmailClean = (sessObj.email || '').trim().toLowerCase();
    const custPhoneNorm = normalizePhoneDigits(sessObj.phone);
    const custId = sessObj.id;

    const allOrders = db.getOrders();
    return allOrders.filter(o => {
      const matchId = Boolean(o.customerId && custId && o.customerId === custId);
      const orderEmailClean = o.customerEmail ? o.customerEmail.trim().toLowerCase() : '';
      const matchEmail = Boolean(custEmailClean && orderEmailClean && custEmailClean === orderEmailClean);
      const orderPhoneNorm = normalizePhoneDigits(o.customerPhone);
      const matchPhone = Boolean(
        custPhoneNorm.length >= 5 &&
        orderPhoneNorm.length >= 5 &&
        (custPhoneNorm === orderPhoneNorm || custPhoneNorm.includes(orderPhoneNorm) || orderPhoneNorm.includes(custPhoneNorm))
      );
      return Boolean(matchId || matchEmail || matchPhone);
    });
  } catch (e) {
    return [];
  }
};

function getOrderStatusBadge(statusStr?: string, language: string = 'ID') {
  const upper = (normalizeToFrontendStatus(statusStr) as string).toUpperCase();
  if (upper === 'PENDING_PAYMENT' || upper === 'NEW' || upper === 'PENDING') {
    return {
      label: language === 'EN' ? 'Pending Payment' : language === 'MS' ? 'Menunggu Pembayaran' : 'Menunggu Pembayaran',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }
  if (upper === 'CONFIRMED' || upper === 'PAID' || upper === 'PAYMENT_VERIFIED') {
    return {
      label: language === 'EN' ? 'Confirmed' : language === 'MS' ? 'Dikonfirmasi' : 'Dikonfirmasi',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
  if (upper === 'PROCESSING' || upper === 'PACKING') {
    return {
      label: language === 'EN' ? 'Processing' : language === 'MS' ? 'Diproses' : 'Sedang Diproses',
      className: 'bg-blue-50 text-blue-800 border-blue-200',
    };
  }
  if (upper === 'READY_TO_SHIP') {
    return {
      label: language === 'EN' ? 'Ready To Ship' : language === 'MS' ? 'Sedia Dihantar' : 'Siap Dikirim',
      className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    };
  }
  if (upper === 'SHIPPED' || upper === 'SHIPPING') {
    return {
      label: language === 'EN' ? 'Shipped' : language === 'MS' ? 'Dalam Pengiriman' : 'Dalam Pengiriman',
      className: 'bg-purple-50 text-purple-800 border-purple-200',
    };
  }
  if (upper === 'DELIVERED' || upper === 'COMPLETED') {
    return {
      label: language === 'EN' ? 'Delivered' : language === 'MS' ? 'Pesanan Selesai' : 'Pesanan Selesai',
      className: 'bg-green-50 text-green-800 border-green-200',
    };
  }
  if (upper === 'CANCELLED' || upper === 'CANCEL_REQUESTED') {
    return {
      label: language === 'EN' ? 'Cancelled' : language === 'MS' ? 'Dibatalkan' : 'Pesanan Dibatalkan',
      className: 'bg-red-50 text-red-800 border-red-200',
    };
  }
  return {
    label: statusStr || 'Dikonfirmasi',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<any[]>(() => getInitialOrdersForSession());

  // Shopee/Tokopedia Order Filter & Tracking Modal State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'UNPAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);
  const [copiedResi, setCopiedResi] = useState<boolean>(false);

  // Profile Save Confirmation Modal State
  const [confirmSaveProfileModal, setConfirmSaveProfileModal] = useState<boolean>(false);
  const [pendingSaveData, setPendingSaveData] = useState<any | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Avatar & Cover State & Refs
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarNotice, setAvatarNotice] = useState<string>('');
  const [showPresetAvatars, setShowPresetAvatars] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState<{ id: string; orderNumber: string } | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Ingin merubah rincian pesanan');

  const defaultCoverPhoto = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1600&auto=format&fit=crop';

  // Preset Avatars for quick selection
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
  ];

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
    const syncCustomerData = async () => {
      try {
        const session = localStorage.getItem('fbs_customer_session');
        if (!session) {
          router.push('/account/login');
          return;
        }

        const sessObj = JSON.parse(session);
        let found: any = null;

        // 1. Synchronize with server database API so Desktop, Mobile & Tablet have 100% identical data
        if (sessObj.email) {
          try {
            const res = await fetch(`/api/customers?email=${encodeURIComponent(sessObj.email)}`);
            const data = await res.json();
            if (data.success && data.customer) {
              found = data.customer;
              db.saveCustomer(found);
              localStorage.setItem('fbs_customer_session', JSON.stringify(found));
            }
          } catch (serverErr) {
            console.warn('Server customer fetch warning:', serverErr);
          }
        }

        // 2. Fallback to local DB if server fetch returned null
        if (!found) {
          const customers = db.getCustomers();
          found = customers.find(c => 
            c.id === sessObj.id || 
            (sessObj.email && c.email && c.email.toLowerCase() === sessObj.email.toLowerCase()) ||
            (sessObj.phone && c.phone && c.phone.replace(/[^0-9]/g, '') === sessObj.phone.replace(/[^0-9]/g, ''))
          );
        }

        if (found) {
          const status = found.accountStatus || (found.isActive === false ? 'SUSPENDED' : 'ACTIVE');
          if (status === 'SUSPENDED') {
            alert('⚠️ Akun Anda sedang ditangguhkan (Suspended). Silakan hubungi Admin WhatsApp.');
            localStorage.removeItem('fbs_customer_session');
            router.push('/account/login');
            return;
          }
          if (status === 'BANNED') {
            alert('🚫 Akses Ditolak: Email/Akun ini telah diblokir permanen (Banned) oleh Admin.');
            localStorage.removeItem('fbs_customer_session');
            router.push('/account/login');
            return;
          }

          // SECURITY GUARD: Reject unverified/inactive accounts
          const isSocialAuth = found.provider === 'GOOGLE' || found.provider === 'FACEBOOK' || found.provider === 'PHONE';
          if (!isSocialAuth && found.isEmailVerified === false) {
            localStorage.removeItem('fbs_customer_session');
            router.push('/account/login');
            return;
          }

          const merged = { 
            ...sessObj,
            ...found, 
            name: found.name || sessObj.name, 
            email: found.email || sessObj.email, 
            phone: found.phone || sessObj.phone,
            photo: found.photo || sessObj.photo || '', 
            coverPhoto: found.coverPhoto || sessObj.coverPhoto || '',
            address: found.address || sessObj.address || '',
            city: found.city || sessObj.city || '',
            postcode: found.postcode || sessObj.postcode || '',
            state: found.state || sessObj.state || '',
          };

          setCustomer(merged);
          localStorage.setItem('fbs_customer_session', JSON.stringify(merged));
          // Auto-sync back to server database if server had incomplete data
          if (sessObj.email) {
            fetch('/api/customers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(merged),
            }).catch(() => {});
          }
        } else {
          localStorage.removeItem('fbs_customer_session');
          router.push('/account/login');
          return;
        }

        const currentCust = found || { id: sessObj.id, phone: sessObj.phone, email: sessObj.email };
        const custPhoneClean = (currentCust.phone || '').replace(/[^0-9]/g, '');
        const custId = currentCust.id;
        const custEmailClean = (currentCust.email || '').trim().toLowerCase();

        let allOrders = db.getOrders();

        // Synchronize orders from server database API
        if (custEmailClean || custPhoneClean || custId) {
          try {
            const queryParams = new URLSearchParams();
            if (custEmailClean) queryParams.set('email', custEmailClean);
            if (custPhoneClean) queryParams.set('phone', custPhoneClean);
            if (custId) queryParams.set('customerId', custId);

            queryParams.set('t', Date.now().toString());

            const resOrders = await fetch(`/api/orders?${queryParams.toString()}`, { cache: 'no-store' });
            const dataOrders = await resOrders.json();
            if (dataOrders.success && Array.isArray(dataOrders.orders) && dataOrders.orders.length > 0) {
              const serverList = dataOrders.orders;
              const mergedMap = new Map<string, any>();

              // Add local orders first
              allOrders.forEach((o: any) => {
                const key = (o.orderNumber || o.id || '').toUpperCase();
                if (key) mergedMap.set(key, o);
              });

              // Server orders overwrite/enrich local orders
              serverList.forEach((o: any) => {
                const key = (o.orderNumber || o.id || '').toUpperCase();
                if (key) mergedMap.set(key, o);
              });

              allOrders = Array.from(mergedMap.values());
              localStorage.setItem('fbs_orders', JSON.stringify(allOrders));
            }
          } catch (serverOrderErr) {
            console.warn('Server orders fetch warning:', serverOrderErr);
          }
        }

        const custPhoneNormalized = normalizePhoneDigits(currentCust.phone);

        let deletedIds: string[] = [];
        try { deletedIds = JSON.parse(localStorage.getItem('fbs_deleted_order_ids') || '[]'); } catch (e) {}

        const myOrders = allOrders.map(o => {
          o.orderStatus = normalizeToFrontendStatus((o as any).orderStatus || (o as any).status);
          return o;
        }).filter(o => {
          if (deletedIds.includes(o.id) || deletedIds.includes(o.orderNumber)) return false;

          const matchId = Boolean(o.customerId && custId && o.customerId === custId);
          const orderEmailClean = o.customerEmail ? o.customerEmail.trim().toLowerCase() : '';
          const matchEmail = Boolean(custEmailClean && orderEmailClean && custEmailClean === orderEmailClean);
          
          const orderPhoneNormalized = normalizePhoneDigits(o.customerPhone);
          const matchPhone = Boolean(
            custPhoneNormalized.length >= 5 && 
            orderPhoneNormalized.length >= 5 && 
            (custPhoneNormalized === orderPhoneNormalized || custPhoneNormalized.includes(orderPhoneNormalized) || orderPhoneNormalized.includes(custPhoneNormalized))
          );
          return Boolean(matchId || matchEmail || matchPhone);
        });

        setOrders(myOrders);

      } catch (e) {
        console.error(e);
        router.push('/account/login');
      }
    };

    syncCustomerData();

    window.addEventListener('storage', syncCustomerData);
    window.addEventListener('fbs_db_updated', syncCustomerData);
    return () => {
      window.removeEventListener('storage', syncCustomerData);
      window.removeEventListener('fbs_db_updated', syncCustomerData);
    };
  }, [router]);

  const handleCustomerLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase signOut error:', err);
    }
    localStorage.removeItem('fbs_customer_session');
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('fbs_db_updated'));
    setCustomer(null);
    setShowLogoutModal(false);
    router.push('/account/login');
  };

  const updateCustomerPhoto = async (photoUrl: string) => {
    if (!customer) return;
    const updated = { ...customer, photo: photoUrl };
    setCustomer(updated);
    setAvatarNotice('Foto profil berhasil diperbarui!');
    setTimeout(() => setAvatarNotice(''), 3500);

    try {
      localStorage.setItem('fbs_customer_session', JSON.stringify(updated));
      db.saveCustomer(updated);
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error updating avatar photo:', err);
    }
  };

  const updateCustomerCover = async (coverUrl: string) => {
    if (!customer) return;
    const updated = { ...customer, coverPhoto: coverUrl };
    setCustomer(updated);
    setAvatarNotice('Foto sampul banner profil berhasil diperbarui!');
    setTimeout(() => setAvatarNotice(''), 3500);

    try {
      localStorage.setItem('fbs_customer_session', JSON.stringify(updated));
      db.saveCustomer(updated);
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error updating cover photo:', err);
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar. Silakan pilih foto di bawah 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        updateCustomerPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran foto sampul terlalu besar. Silakan pilih foto di bawah 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        updateCustomerCover(dataUrl);
      }
    };
    reader.readAsDataURL(file);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Hidden File Inputs for Avatar & Cover Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarFileUpload}
          className="hidden"
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverFileUpload}
          className="hidden"
        />

        {/* Toast Notice */}
        {avatarNotice && (
          <div className="mb-4 p-3 bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{avatarNotice}</span>
            </div>
            <button onClick={() => setAvatarNotice('')} className="p-1 hover:bg-emerald-800 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* LUXURY BAKERY COVER PHOTO & MODERN MINIMALIST PROFILE HEADER */}
        <div className="mb-8 shadow-xl rounded-3xl overflow-hidden border border-[#EADBC8] bg-white">
          
          {/* Cover Photo Header */}
          <div className="relative h-48 sm:h-64 w-full bg-stone-900 overflow-hidden group">
            <img 
              src={customer.coverPhoto || defaultCoverPhoto} 
              alt="Profile Cover Background" 
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            {/* Elegant Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/30 to-black/20" />

            {/* Change Cover Photo Button */}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 px-3.5 py-2 bg-black/60 hover:bg-black/80 text-[#D4AF37] border border-white/30 rounded-2xl font-bold text-xs shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              title="Ganti Foto Sampul Profil"
            >
              <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Ubah Sampul</span>
            </button>
          </div>

          {/* Overlapping Profile Info Card */}
          <div className="p-6 sm:p-8 bg-white relative pt-0">
            
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
              
              {/* Avatar + Name Details */}
              <div className="flex flex-col sm:flex-row items-center md:items-end gap-5 text-center sm:text-left">
                
                {/* Avatar Ring */}
                <div className="relative group flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#D4AF37] via-amber-400 to-amber-600 text-[#800020] font-serif font-black text-3xl sm:text-4xl flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden relative transition-transform group-hover:scale-105">
                    {customer.photo ? (
                      <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover" />
                    ) : (
                      <img src="/logo.jpg" alt={customer.name || 'FBS Bakery World'} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Avatar Upload Button Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-[#800020] text-[#D4AF37] hover:bg-[#6F1D1B] border-2 border-white rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95"
                    title="Upload Foto Profil"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
                    <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">{customer.name}</h1>
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase flex items-center gap-1 shadow-sm tracking-wider ${
                      customer.customerType === 'VIP'
                        ? 'bg-[#D4AF37] text-[#800020]'
                        : customer.customerType === 'WHOLESALE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-800 text-[#D4AF37]'
                    }`}>
                      <Sparkles className="w-3 h-3" /> {customer.customerType} MEMBER
                    </span>
                  </div>
                  <p className="text-stone-500 text-xs flex items-center justify-center sm:justify-start gap-2 flex-wrap font-medium">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#800020]" /> {customer.phone}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#800020]" /> {customer.email || 'Member Terdaftar'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 border border-stone-200"
                >
                  <Edit2 className="w-4 h-4 text-[#800020]" /> Ubah Profil & Alamat
                </button>

                <button
                  onClick={handleCustomerLogout}
                  className="px-3.5 py-2.5 bg-stone-50 hover:bg-red-50 text-red-600 font-bold text-xs rounded-2xl border border-stone-200 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> Log Out
                </button>
              </div>
            </div>

            {/* Modern Minimalist Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-stone-100 text-xs">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  {language === 'EN' ? 'TOTAL ORDERS' : language === 'MS' ? 'JUMLAH PESANAN' : 'TOTAL PESANAN'}
                </span>
                <span className="font-serif font-extrabold text-xl text-stone-900">
                  {orders.length} {language === 'EN' ? (orders.length === 1 ? 'Order' : 'Orders') : 'Pesanan'}
                </span>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  {language === 'EN' ? 'SAVED WISHLIST' : language === 'MS' ? 'WISHLIST TERSIMPAN' : 'WISHLIST TERSIMPAN'}
                </span>
                <span className="font-serif font-extrabold text-xl text-[#800020]">
                  {wishlist.length} {language === 'EN' ? (wishlist.length === 1 ? 'Product' : 'Products') : 'Produk'}
                </span>
              </div>
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
            <Package className="w-4 h-4" /> {language === 'EN' ? 'Order History' : language === 'MS' ? 'Riwayat Pesanan' : 'Riwayat Pesanan'} ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'wishlist' ? 'border-[#800020] text-[#800020]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" /> {language === 'EN' ? 'Saved Wishlist' : language === 'MS' ? 'Wishlist Tersimpan' : 'Wishlist Tersimpan'} ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile' ? 'border-[#800020] text-[#800020]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" /> {language === 'EN' ? 'Saved Profile & Address' : language === 'MS' ? 'Profil & Alamat Tersimpan' : 'Profil & Alamat Tersimpan'}
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY (SHOPEE / TOKOPEDIA STYLE) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Shopee-style Status Navigation Filter Tabs */}
            {(() => {
              const unpaidCount = orders.filter(o => ['PENDING_PAYMENT', 'NEW', 'PENDING'].includes(normalizeToFrontendStatus(o.orderStatus))).length;
              const procCount = orders.filter(o => ['CONFIRMED', 'PROCESSING', 'PACKING', 'READY_TO_SHIP'].includes(normalizeToFrontendStatus(o.orderStatus))).length;
              const shipCount = orders.filter(o => ['SHIPPED', 'SHIPPING'].includes(normalizeToFrontendStatus(o.orderStatus))).length;
              const delivCount = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(normalizeToFrontendStatus(o.orderStatus))).length;
              const cancelCount = orders.filter(o => ['CANCELLED', 'CANCEL_REQUESTED', 'REFUND'].includes(normalizeToFrontendStatus(o.orderStatus))).length;

              const filterTabs = [
                { key: 'ALL', label: 'Semua', count: orders.length },
                { key: 'UNPAID', label: 'Belum Bayar', count: unpaidCount },
                { key: 'PROCESSING', label: 'Diproses', count: procCount },
                { key: 'SHIPPED', label: 'Dikirim', count: shipCount },
                { key: 'DELIVERED', label: 'Selesai', count: delivCount },
                { key: 'CANCELLED', label: 'Dibatalkan', count: cancelCount },
              ];

              return (
                <div className="flex bg-white rounded-2xl p-1.5 border border-[#EADBC8] shadow-sm gap-1 overflow-x-auto scrollbar-none">
                  {filterTabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setOrderStatusFilter(tab.key as any)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        orderStatusFilter === tab.key
                          ? 'bg-[#800020] text-[#D4AF37] shadow-md'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          orderStatusFilter === tab.key ? 'bg-[#D4AF37] text-[#800020]' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Filtered Orders List */}
            {(() => {
              const displayOrders = orders.filter(o => {
                const norm = normalizeToFrontendStatus(o.orderStatus);
                if (orderStatusFilter === 'UNPAID') return ['PENDING_PAYMENT', 'NEW', 'PENDING'].includes(norm);
                if (orderStatusFilter === 'PROCESSING') return ['CONFIRMED', 'PROCESSING', 'PACKING', 'READY_TO_SHIP'].includes(norm);
                if (orderStatusFilter === 'SHIPPED') return ['SHIPPED', 'SHIPPING'].includes(norm);
                if (orderStatusFilter === 'DELIVERED') return ['DELIVERED', 'COMPLETED'].includes(norm);
                if (orderStatusFilter === 'CANCELLED') return ['CANCELLED', 'CANCEL_REQUESTED', 'REFUND'].includes(norm);
                return true;
              });

              if (displayOrders.length === 0) {
                return (
                  <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBC8] space-y-3 shadow-sm">
                    <Package className="w-14 h-14 text-stone-300 mx-auto" />
                    <h3 className="font-serif text-xl font-bold text-[#800020]">Tidak Ada Pesanan di Kategori Ini</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Belum ada transaksi dengan status ini. Silakan belanja bahan kue pilihan Anda di FBS Bakery World.
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#800020] text-[#D4AF37] font-bold text-xs rounded-xl shadow hover:bg-[#6F1D1B] transition-transform active:scale-95 mt-2"
                    >
                      Mulai Belanja Bahan Kue <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              }

              return (
                <div className="space-y-5">
                  {displayOrders.map(order => {
                    const normStatus = normalizeToFrontendStatus(order.orderStatus);
                    const badge = getOrderStatusBadge(order.orderStatus, language);

                    return (
                      <div key={order.id} className="bg-white rounded-3xl border border-[#EADBC8] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        
                        {/* Shopee Style Store Header */}
                        <div className="p-4 sm:p-5 bg-stone-50/70 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-black text-xs flex items-center justify-center border border-[#D4AF37] flex-shrink-0">
                              FBS
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-stone-900">FBS Bakery World Official Store</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#800020] text-[#D4AF37] rounded-md uppercase">Official</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                                <span className="font-mono font-bold text-[#800020]">{order.orderNumber}</span>
                                <span>•</span>
                                <span>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className={`px-3 py-1 text-xs font-extrabold rounded-full border uppercase shadow-2xs ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>

                        {/* Order Item Rows */}
                        <div className="p-4 sm:p-5 divide-y divide-stone-100">
                          {(order.items || []).map((item: OrderItem) => (
                            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-stone-200 overflow-hidden bg-stone-100 flex-shrink-0">
                                  <img 
                                    src={item.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop'} 
                                    alt={item.productName} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">{item.productName}</h4>
                                  <div className="flex items-center gap-2 text-[11px] text-stone-500 flex-wrap">
                                    <span className="px-2 py-0.5 bg-stone-100 rounded-md font-semibold text-stone-700">Varian: {item.variantName}</span>
                                    <span>x{item.quantity}</span>
                                  </div>
                                  <div className="text-xs font-extrabold text-[#800020]">
                                    {formatMYR(item.price)} <span className="text-[10px] text-stone-400 font-normal">/ unit</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 gap-2">
                                <span className="text-xs text-stone-500 sm:hidden">Subtotal Produk:</span>
                                <span className="font-extrabold text-sm text-[#800020]">{formatMYR(item.subtotal)}</span>

                                {/* Review Trigger Button */}
                                {(normStatus === 'DELIVERED' || normStatus === 'COMPLETED') && (
                                  <button
                                    type="button"
                                    onClick={() => setReviewModalItem({
                                      productId: item.productId,
                                      productName: item.productName,
                                      customerName: order.customerName,
                                    })}
                                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-xl shadow flex items-center gap-1 transition-transform active:scale-95"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Ulas Produk
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary & Shopee Action Footer */}
                        <div className="p-4 sm:p-5 bg-stone-50/90 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          
                          {/* Shipping / Resi Info */}
                          <div className="text-xs space-y-1 text-stone-600">
                            {order.courierName && (
                              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                                <Truck className="w-4 h-4 text-[#800020]" />
                                <span>Kurir: {order.courierName}</span>
                                {order.trackingNumber && (
                                  <span className="font-mono bg-stone-200 text-stone-800 px-2 py-0.5 rounded text-[11px] font-bold">
                                    {order.trackingNumber}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span className="text-stone-500">Total Pesanan ({order.items?.length || 1} Produk):</span>
                              <span className="font-serif font-extrabold text-base text-[#800020]">{formatMYR(order.totalAmount)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                            
                            {/* 1. Shopee Tracking Modal Button */}
                            <button
                              type="button"
                              onClick={() => setTrackingModalOrder(order)}
                              className="px-4 py-2 bg-stone-800 hover:bg-black text-[#D4AF37] text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" /> Lacak Pengiriman
                            </button>

                            {/* 1.5 Official Invoice PDF Button */}
                            <button
                              type="button"
                              onClick={() => setInvoiceModalOrder(order)}
                              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-stone-300 shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#800020]" /> Cetak Nota PDF
                            </button>

                            {/* 2. WhatsApp Pay Button for Unpaid Orders */}
                            {(normStatus === 'PENDING_PAYMENT' || normStatus === 'NEW') && (
                              <a
                                href={order.whatsappUrl || `https://wa.me/60183972147?text=Halo%20FBS%20Bakery,%20saya%20ingin%20bayar%20order%20${encodeURIComponent(order.orderNumber)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5"
                              >
                                <Phone className="w-3.5 h-3.5" /> Bayar via WhatsApp
                              </a>
                            )}

                            {/* 3. Reorder Button for Delivered/Completed Orders */}
                            {(normStatus === 'DELIVERED' || normStatus === 'COMPLETED') && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!order.items || order.items.length === 0) return;
                                  order.items.forEach((item: any) => {
                                    const p = db.getProductBySlug(item.productId) || { id: item.productId, productName: item.productName, mainImage: item.mainImage };
                                    const variant = { id: item.productVariantId || 'var-default', variantName: item.variantName, price: item.price, weight: 1, sku: '', productId: item.productId, stock: 100 };
                                    addToCart(p as any, variant as any, item.quantity || 1);
                                  });
                                  router.push('/checkout');
                                }}
                                className="px-4 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" /> Beli Lagi
                              </button>
                            )}

                            {/* 4. Cancel Request Button */}
                            {(normStatus === 'PENDING_PAYMENT' || normStatus === 'NEW' || normStatus === 'CONFIRMED') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelModalOrder({ id: order.id, orderNumber: order.orderNumber });
                                  setCancelReason('Ingin merubah rincian pesanan');
                                }}
                                className="px-3.5 py-2 bg-stone-100 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-stone-200 transition-colors flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5 text-red-500" /> Batalkan
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              );
            })()}

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
                      <span className="text-xs font-bold text-[#800020] block mt-1">{formatMYR((p.variants || [])[0]?.price || 0)}</span>
                    </div>
                    <button
                      onClick={() => { if (p.variants && p.variants[0]) addToCart(p, p.variants[0], 1); }}
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

        {/* TAB 4: SAVED PROFILE & ADDRESS CMS WITH AVATAR UPLOADER */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            
            {/* CARD 1: AVATAR & FOTO PROFIL MANAGEMENT */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8] shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#800020] flex items-center gap-2">
                    <Camera className="w-5 h-5 text-[#800020]" /> Kelola Foto Profil Akun Pelanggan
                  </h3>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Unggah foto diri atau pilih avatar favorit untuk menampilkan identitas member Anda di FBS Bakery World.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPresetAvatars(!showPresetAvatars)}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {showPresetAvatars ? 'Sembunyikan Preset' : 'Pilih Avatar Preset'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Live Avatar Preview */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-600 text-[#800020] font-serif font-black text-4xl flex items-center justify-center border-4 border-[#800020] shadow-xl overflow-hidden flex-shrink-0 relative">
                  {customer.photo ? (
                    <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>

                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Unggah Foto Dari Perangkat (JPG/PNG)
                    </button>

                    {customer.photo && (
                      <button
                        type="button"
                        onClick={() => updateCustomerPhoto('')}
                        className="px-4 py-2.5 bg-stone-100 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-stone-200 transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Hapus Foto Profil
                      </button>
                    )}
                  </div>

                  <p className="text-stone-500 text-[11px]">
                    Format gambar yang didukung: JPG, PNG, GIF. Maksimal ukuran file 5MB.
                  </p>
                </div>
              </div>

              {/* Preset Avatar Selection Grid */}
              {showPresetAvatars && (
                <div className="pt-4 border-t border-stone-100 animate-fade-in space-y-3">
                  <span className="text-xs font-bold text-stone-700 block">Atau Pilih Avatar Favorit:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {presetAvatars.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => updateCustomerPhoto(url)}
                        className={`w-16 h-16 rounded-full border-2 overflow-hidden shadow transition-transform hover:scale-110 relative ${
                          customer.photo === url ? 'border-[#800020] ring-4 ring-[#D4AF37]' : 'border-stone-200'
                        }`}
                      >
                        <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        {customer.photo === url && (
                          <div className="absolute inset-0 bg-[#800020]/40 flex items-center justify-center text-[#D4AF37]">
                            <Check className="w-6 h-6 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: SAVED ADDRESS & PROFILE FORM */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8] shadow-md space-y-6 text-xs text-stone-700">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#800020] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#800020]" /> Pengaturan Data Diri & Alamat Utama
                  </h3>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Data alamat ini tersimpan aman dan otomatis terisi secara instan saat Anda checkout order.
                  </p>
                </div>
              </div>

              {/* Address Edit Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formEl = e.currentTarget;
                  const updatedCust = {
                    ...customer,
                    name: (formEl.elements.namedItem('name') as HTMLInputElement).value,
                    phone: (formEl.elements.namedItem('phone') as HTMLInputElement).value,
                    email: (formEl.elements.namedItem('email') as HTMLInputElement).value,
                    address: (formEl.elements.namedItem('address') as HTMLTextAreaElement).value,
                    city: (formEl.elements.namedItem('city') as HTMLInputElement).value,
                    postcode: (formEl.elements.namedItem('postcode') as HTMLInputElement).value,
                    state: (formEl.elements.namedItem('state') as HTMLSelectElement).value,
                  };

                  setPendingSaveData(updatedCust);
                  setConfirmSaveProfileModal(true);
                }} 
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Nama Lengkap Pelanggan <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        name="name"
                        required
                        defaultValue={customer.name}
                        className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                      />
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Nomor WhatsApp / HP <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="tel"
                        name="phone"
                        required
                        defaultValue={customer.phone}
                        className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                      />
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      name="email"
                      defaultValue={customer.email || ''}
                      placeholder="baker@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Alamat Jalan / Rumah / Bangunan / Unit <span className="text-red-600">*</span>
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
                  <CheckCircle2 className="w-4 h-4" /> SIMPAN PERUBAHAN PROFIL & ALAMAT
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
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!modalComment) return;
                  setModalSubmitting(true);

                  try {
                    db.addReview({
                      productId: reviewModalItem.productId,
                      customerName: reviewModalItem.customerName || customer.name,
                      rating: modalRating,
                      comment: modalComment,
                      images: modalImagePreview ? [modalImagePreview] : [],
                      videoUrl: modalVideoPreview || undefined,
                      verifiedPurchase: true,
                    });

                    await fetch('/api/reviews', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        productId: reviewModalItem.productId,
                        productName: reviewModalItem.productName,
                        customerName: reviewModalItem.customerName || customer.name,
                        customerEmail: customer.email,
                        rating: modalRating,
                        comment: modalComment,
                        imageUrl: modalImagePreview || '',
                        videoUrl: modalVideoPreview || '',
                      }),
                    }).catch(err => console.warn('Review API sync warning:', err));

                    setModalSubmitted(true);
                  } catch (err) {
                    console.error('Error submitting review:', err);
                  } finally {
                    setModalSubmitting(false);
                  }
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
      {/* LOGOUT CONFIRMATION MODAL DIALOG */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border-2 border-red-100 shadow-2xl space-y-5 text-center relative animate-fade-in">
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto border-4 border-red-50">
              <LogOut className="w-8 h-8 ml-1" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-extrabold text-[#800020]">
                Apakah Anda Yakin Ingin Keluar?
              </h3>
              <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                Anda akan keluar dari akun <strong>{customer?.name}</strong>. Anda perlu masuk kembali untuk melihat riwayat pesanan dan menggunakan voucher diskon member.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-colors"
              >
                Batal (Tetap Masuk)
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                className="py-3 px-4 bg-[#800020] hover:bg-red-900 text-[#D4AF37] rounded-2xl font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Ya, Keluar Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ORDER CANCELLATION REQUEST MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-2xl space-y-5 text-center relative animate-fade-in">
            <button 
              onClick={() => setCancelModalOrder(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-extrabold text-[#800020]">
                Permohonan Pembatalan
              </h3>
              <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                Silakan masukkan alasan pembatalan untuk pesanan <strong>{cancelModalOrder.orderNumber}</strong>:
              </p>
            </div>

            <div>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Berikan alasan pembatalan..."
                className="w-full px-4 py-3 border border-stone-300 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!cancelModalOrder) return;
                  const updated = db.updateOrderStatusAndTracking(cancelModalOrder.id, 'CANCEL_REQUESTED');
                  if (updated) {
                    setOrders(prev => prev.map(o => o.id === cancelModalOrder.id ? { ...o, orderStatus: 'CANCEL_REQUESTED' } : o));
                    setCancelModalOrder(null);
                  }
                }}
                className="py-3 px-4 bg-[#800020] hover:bg-red-900 text-[#D4AF37] rounded-2xl font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" /> Kirim Permohonan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPEE-STYLE LIVE TRACKING MODAL */}
      {trackingModalOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#800020] to-[#6F1D1B] text-white rounded-t-3xl flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg font-bold text-white">Status Lacak Pengiriman</h3>
                </div>
                <p className="text-xs text-stone-200 font-mono">
                  Nomor Pesanan: <span className="text-[#D4AF37] font-bold">{trackingModalOrder.orderNumber}</span>
                </p>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="p-2 hover:bg-white/20 rounded-full text-white transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courier & Resi Info Card */}
            <div className="p-6 space-y-6 flex-1">
              
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-500 block">Ekspedisi / Kurir:</span>
                  <span className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#800020]" /> {trackingModalOrder.courierName || 'J&T Express'}
                  </span>
                  {trackingModalOrder.trackingNumber ? (
                    <span className="text-xs font-mono font-bold text-[#800020] block">
                      No. Resi: {trackingModalOrder.trackingNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-500 italic block">Nomor resi sedang disiapkan kurir</span>
                  )}
                </div>

                {trackingModalOrder.trackingNumber && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(trackingModalOrder.trackingNumber);
                      setCopiedResi(true);
                      setTimeout(() => setCopiedResi(false), 2500);
                    }}
                    className="px-3.5 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95 flex-shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedResi ? 'Tercopy!' : 'Salin Resi'}</span>
                  </button>
                )}
              </div>

              {/* Vertical Timeline Progress Bar */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#800020]" /> Timeline Tracking Pengiriman
                </h4>

                {(() => {
                  const norm = normalizeToFrontendStatus(trackingModalOrder.orderStatus);
                  const steps = [
                    { status: 'PENDING_PAYMENT', title: 'Pesanan Berhasil Dibuat', desc: 'Pesanan diterima sistem dan menunggu konfirmasi' },
                    { status: 'CONFIRMED', title: 'Pembayaran Diverifikasi', desc: 'Pembayaran telah dikonfirmasi oleh admin store' },
                    { status: 'PROCESSING', title: 'Pesanan Sedang Diproses', desc: 'Tim FBS Bakery World sedang mengemas produk kue Anda' },
                    { status: 'SHIPPED', title: 'Paket Diserahkan ke Kurir', desc: 'Paket dalam perjalanan ekspedisi ke alamat tujuan' },
                    { status: 'DELIVERED', title: 'Pesanan Selesai / Diterima', desc: 'Paket telah berhasil diterima oleh pelanggan' },
                  ];

                  function getStepIndex(st: string): number {
                    if (st === 'PENDING_PAYMENT' || st === 'NEW') return 0;
                    if (st === 'CONFIRMED' || st === 'PAYMENT_VERIFIED') return 1;
                    if (st === 'PROCESSING' || st === 'PACKING' || st === 'READY_TO_SHIP') return 2;
                    if (st === 'SHIPPED' || st === 'SHIPPING') return 3;
                    if (st === 'DELIVERED' || st === 'COMPLETED') return 4;
                    return 0;
                  }

                  const currentIdx = getStepIndex(norm);

                  return (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                      {steps.map((step, idx) => {
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={idx} className="relative flex items-start gap-3">
                            {/* Step Dot */}
                            <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCurrent
                                ? 'bg-[#800020] border-[#D4AF37] text-white ring-4 ring-[#800020]/20'
                                : isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-stone-100 border-stone-300 text-stone-400'
                            }`}>
                              {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                            </div>

                            <div className="space-y-0.5">
                              <span className={`text-xs font-extrabold block ${isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                                {step.title}
                              </span>
                              <p className="text-[11px] text-stone-500">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Link
                  href={`/track-order?orderNumber=${encodeURIComponent(trackingModalOrder.orderNumber)}&phone=${encodeURIComponent(trackingModalOrder.customerPhone)}`}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#800020]" /> Halaman Tracking Detail Selengkapnya
                </Link>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* PROFILE & ADDRESS SAVE CONFIRMATION MODAL */}
      {confirmSaveProfileModal && pendingSaveData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 text-center relative overflow-hidden">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-4 border-emerald-50">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-extrabold text-[#800020]">
                Konfirmasi Simpan Profil & Alamat Utama
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Apakah Anda yakin ingin menyimpan perubahan nama & alamat utama ini secara permanen ke akun Anda?
              </p>
            </div>

            {/* Summary Preview Card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2 text-stone-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#800020] flex-shrink-0" />
                <span className="font-bold text-stone-900">{pendingSaveData.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#800020] flex-shrink-0" />
                <span>{pendingSaveData.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                <span className="text-stone-800 font-medium">
                  {pendingSaveData.address}, {pendingSaveData.city}, {pendingSaveData.postcode}, {pendingSaveData.state}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSavingProfile}
                onClick={() => setConfirmSaveProfileModal(false)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isSavingProfile}
                onClick={async () => {
                  setIsSavingProfile(true);
                  try {
                    const finalData = { ...pendingSaveData };
                    setCustomer(finalData);
                    localStorage.setItem('fbs_customer_session', JSON.stringify(finalData));
                    db.saveCustomer(finalData);

                    window.dispatchEvent(new Event('storage'));
                    window.dispatchEvent(new CustomEvent('fbs_db_updated'));

                    await fetch('/api/customers', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(finalData),
                    }).catch(() => {});

                    setAvatarNotice('✅ PERMANEN DITERAPKAN: Profil & Alamat Utama Anda berhasil disimpan!');
                    setTimeout(() => setAvatarNotice(''), 5000);
                  } catch (err) {
                    console.error('Error saving profile:', err);
                  } finally {
                    setIsSavingProfile(false);
                    setConfirmSaveProfileModal(false);
                  }
                }}
                className="py-3 px-4 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] rounded-2xl font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isSavingProfile ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Ya, Simpan Permanen
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OFFICIAL PDF INVOICE MODAL */}
      {invoiceModalOrder && (
        <InvoiceModal
          order={invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
        />
      )}

    </div>
  );
}
