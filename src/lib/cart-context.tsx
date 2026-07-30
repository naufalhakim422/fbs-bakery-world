'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error('Error loading cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fbs_bakery_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Save wishlist changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fbs_bakery_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
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
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.variantId === variantId)));
  };

  const updateQuantity = (productId: string, variantId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalWeight = cart.reduce((acc, item) => acc + item.weight * item.quantity, 0);

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
