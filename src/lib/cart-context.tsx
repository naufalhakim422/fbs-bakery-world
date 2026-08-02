'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductVariant } from '@/types';

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  weight: number;
  quantity: number;
  mainImage: string;
  sku: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[]; // product IDs
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
  subtotal: number;
  totalWeight: number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Free shipping threshold in MYR
  const freeShippingThreshold = 150.0;

  // Load persistent cart & wishlist
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('fbs_bakery_cart');
      const savedWishlist = localStorage.getItem('fbs_bakery_wishlist');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      }
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlist(parsed);
      }
    } catch (e) {
      console.warn('Error reading cart or wishlist from storage:', e);
      setCart([]);
      setWishlist([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('fbs_bakery_cart', JSON.stringify(cart));
      } catch (e) {
        console.warn('Failed to save cart to storage:', e);
      }
    }
  }, [cart, isLoaded]);

  // Save wishlist changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('fbs_bakery_wishlist', JSON.stringify(wishlist));
      } catch (e) {
        console.warn('Failed to save wishlist to storage:', e);
      }
    }
  }, [wishlist, isLoaded]);

  const addToCart = useCallback((product: Product, variant: ProductVariant, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id && item.variantId === variant.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          productName: product.productName,
          variantName: variant.variantName,
          price: variant.price,
          weight: variant.weight,
          quantity,
          mainImage: product.mainImage,
          sku: variant.sku,
        }
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.variantId === variantId)));
  }, []);

  const updateQuantity = useCallback((productId: string, variantId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const totalWeight = useMemo(() => cart.reduce((acc, item) => acc + item.weight * item.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        totalItems,
        subtotal,
        totalWeight,
        freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
