'use client';

import React from 'react';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { formatMYR } from '@/lib/currency';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems, freeShippingThreshold } = useCart();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const amountToFreeShipping = React.useMemo(() => Math.max(0, freeShippingThreshold - subtotal), [freeShippingThreshold, subtotal]);
  const progressPercent = React.useMemo(() => Math.min(100, (subtotal / freeShippingThreshold) * 100), [subtotal, freeShippingThreshold]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFF8F0] shadow-2xl flex flex-col border-l border-[#D4AF37]/30">
          
          {/* Drawer Header */}
          <div className="p-5 bg-[#800020] text-[#FFF8F0] flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold font-serif tracking-wide">{t.cart.title} ({totalItems})</h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label={t.common.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#5A0015] px-5 py-3 text-xs text-[#FFF8F0] border-b border-[#D4AF37]/20">
            {amountToFreeShipping > 0 ? (
              <p>{t.cart.freeShippingAdd.replace('{amount}', formatMYR(amountToFreeShipping))}</p>
            ) : (
              <p className="text-[#D4AF37] font-semibold flex items-center gap-1">
                🎉 {t.cart.freeShippingUnlocked}
              </p>
            )}
            <div className="w-full bg-black/30 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#D4AF37] to-amber-300 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#2B1B1B]/70 py-12">
                <div className="w-20 h-20 rounded-full bg-[#800020]/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-[#800020]" />
                </div>
                <h3 className="text-lg font-bold font-serif text-[#800020]">{t.cart.emptyTitle}</h3>
                <p className="text-sm mt-1 max-w-xs text-stone-600">{t.cart.emptySubtitle}</p>
                <button 
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 bg-[#800020] text-white rounded-xl text-sm font-semibold hover:bg-[#6F1D1B] transition-colors shadow-md"
                >
                  {t.cart.continueShopping}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="bg-white p-3.5 rounded-2xl border border-[#EADBC8] shadow-sm flex gap-3.5 items-center">
                  <img 
                    src={item.mainImage} 
                    alt={item.productName} 
                    className="w-16 h-16 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#2B1B1B] truncate">{item.productName}</h4>
                    <span className="inline-block px-2 py-0.5 bg-[#800020]/10 text-[#800020] text-[11px] font-semibold rounded-md mt-0.5">
                      {t.cart.variant}: {item.variantName}
                    </span>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.variantId, -1)}
                          className="p-1 text-stone-600 hover:text-[#800020]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.variantId, 1)}
                          className="p-1 text-stone-600 hover:text-[#800020]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#800020]">{formatMYR(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="text-stone-400 hover:text-red-600 p-1 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-[#EADBC8] shadow-lg space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">{t.cart.subtotal}</span>
                <span className="text-lg font-bold text-[#800020]">{formatMYR(subtotal)}</span>
              </div>
              <p className="text-[11px] text-stone-500">{t.cart.paymentNote}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full text-center py-3 border-2 border-[#800020] text-[#800020] rounded-xl text-xs font-bold hover:bg-[#800020]/5 transition-colors flex items-center justify-center gap-1.5"
                >
                  {t.cart.orderSummary}
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full text-center py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.cart.proceedCheckout}
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
