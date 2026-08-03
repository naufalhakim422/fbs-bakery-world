'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { formatMYR } from '@/lib/currency';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems, freeShippingThreshold } = useCart();
  const { t, language } = useLanguage();

  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between border-b border-[#EADBC8] pb-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#800020] flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-[#D4AF37]" /> {t.cart.title}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              {t.cart.subtitle}
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-stone-500 hover:text-red-600 underline"
            >
              {t.cart.clearCart}
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#EADBC8] shadow-sm my-8">
            <div className="w-20 h-20 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#800020]">{t.cart.emptyTitle}</h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-md mx-auto">
              {t.cart.emptySubtitle}
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-2xl shadow-lg transition-transform active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> {t.cart.continueShopping}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Cart Table List */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Free Shipping Meter */}
              <div className="bg-[#5A0015] text-[#FFF8F0] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                {amountToFreeShipping > 0 ? (
                  <p className="text-xs">{t.cart.freeShippingAdd.replace('{amount}', formatMYR(amountToFreeShipping))}</p>
                ) : (
                  <p className="text-xs text-[#D4AF37] font-semibold">{t.cart.freeShippingUnlocked}</p>
                )}
                <div className="w-full bg-black/40 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#D4AF37] to-amber-300 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              {cart.map((item) => (
                <div 
                  key={`${item.productId}-${item.variantId}`}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EADBC8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img 
                      src={item.mainImage} 
                      alt={item.productName} 
                      className="w-20 h-20 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#2B1B1B]">{item.productName}</h3>
                      <span className="inline-block px-2.5 py-0.5 bg-[#800020]/10 text-[#800020] text-xs font-bold rounded-md mt-1">
                        {t.cart.variant}: {item.variantName}
                      </span>
                      <span className="block text-xs text-stone-400 font-mono mt-1">{t.cart.sku}: {item.sku}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    {/* Quantity Controller with Direct Nominal Input */}
                    <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-1">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.variantId, -1)}
                        className="p-1.5 text-stone-600 hover:text-[#800020] transition-colors"
                        title={language === 'EN' ? 'Decrease quantity' : language === 'MS' ? 'Kurangkan kuantiti' : 'Kurangi jumlah'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input 
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            const diff = val - item.quantity;
                            updateQuantity(item.productId, item.variantId, diff);
                          }
                        }}
                        className="w-12 text-center font-bold text-xs text-[#800020] bg-white border border-stone-200 rounded-md py-0.5 mx-1 focus:outline-none focus:border-[#800020] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        title={language === 'EN' ? 'Type custom quantity' : language === 'MS' ? 'Taip kuantiti pilihan' : 'Ketik nominal jumlah'}
                      />

                      <button 
                        onClick={() => updateQuantity(item.productId, item.variantId, 1)}
                        className="p-1.5 text-stone-600 hover:text-[#800020] transition-colors"
                        title={language === 'EN' ? 'Increase quantity' : language === 'MS' ? 'Tambah kuantiti' : 'Tambah jumlah'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs text-stone-400">{t.cart.subtotal}</span>
                      <span className="font-serif text-lg font-bold text-[#800020]">
                        {formatMYR(item.price * item.quantity)}
                      </span>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                      title={t.cart.removeItem}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#800020] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> {t.cart.addMore}
                </Link>
              </div>

            </div>

            {/* Right Column: Order Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-md h-fit space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#800020] border-b border-stone-200 pb-3">
                {t.cart.orderSummary}
              </h2>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t.cart.totalItems}</span>
                  <span className="font-bold text-stone-800">{totalItems} {t.cart.items}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.cart.subtotal}</span>
                  <span className="font-bold text-stone-800">{formatMYR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.cart.deliveryFee}</span>
                  <span className="font-bold text-emerald-700">{t.cart.confirmedViaWA}</span>
                </div>
                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#2B1B1B]">{t.cart.estimatedTotal}</span>
                  <span className="font-serif text-2xl font-extrabold text-[#800020]">{formatMYR(subtotal)}</span>
                </div>
              </div>

              <div className="p-3 bg-[#FFF8F0] rounded-xl border border-[#EADBC8] text-[11px] text-stone-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
                <span>{t.cart.paymentNote}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white" /> {t.cart.proceedCheckout} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        )}

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
