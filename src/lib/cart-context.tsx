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
  compareList: string[]; // product IDs (max 4)
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  totalWishlist: number;
  totalCompare: number;
  totalItems: number;
  subtotal: number;
  totalWeight: number;
  totalWeightGrams: number;
  totalWeightKg: number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Free shipping threshold in MYR
  const freeShippingThreshold = 150.0;

  // Load persistent cart & wishlist
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('fbs_bakery_cart');
      const savedWishlist = localStorage.getItem('fbs_bakery_wishlist');
      const savedCompare = localStorage.getItem('fbs_bakery_compare');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      }
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlist(parsed);
      }
      if (savedCompare) {
        const parsed = JSON.parse(savedCompare);
        if (Array.isArray(parsed)) setCompareList(parsed);
      }
    } catch (e) {
      console.warn('Error reading data from storage:', e);
      setCart([]);
      setWishlist([]);
      setCompareList([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('fbs_bakery_cart', JSON.stringify(cart));
        localStorage.setItem('fbs_bakery_wishlist', JSON.stringify(wishlist));
        localStorage.setItem('fbs_bakery_compare', JSON.stringify(compareList));
      } catch (e) {
        console.warn('Failed to save to storage:', e);
      }
    }
  }, [cart, wishlist, compareList, isLoaded]);

  const addToCart = useCallback((product: Product, variant: ProductVariant, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id && item.variantId === variant.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + quantity };
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

  const toggleCompare = useCallback((productId: string): boolean => {
    let added = false;
    setCompareList(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      added = true;
      return [...prev, productId];
    });
    return added;
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList(prev => prev.filter(id => id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback((productId: string) => compareList.includes(productId), [compareList]);

  const totalWishlist = useMemo(() => wishlist.length, [wishlist]);
  const totalCompare = useMemo(() => compareList.length, [compareList]);
  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const totalWeightGrams = useMemo(() => cart.reduce((acc, item) => {
    // If item.weight is less than 30, it represents Kilograms (e.g. 0.1kg, 0.5kg, 1kg, 25kg) -> multiply by 1000 to convert to grams.
    // If item.weight is 30 or greater (e.g. 100, 250, 500), it is ALREADY in Grams -> do not multiply by 1000.
    const rawWeight = item.weight || 0.5;
    const itemGrams = rawWeight < 30 ? Math.round(rawWeight * 1000) : Math.round(rawWeight);
    return acc + (itemGrams * item.quantity);
  }, 0), [cart]);
  const totalWeightKg = useMemo(() => parseFloat((totalWeightGrams / 1000).toFixed(2)), [totalWeightGrams]);
  const totalWeight = totalWeightKg;

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        compareList,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        totalWishlist,
        totalCompare,
        totalItems,
        subtotal,
        totalWeight,
        totalWeightGrams,
        totalWeightKg,
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
