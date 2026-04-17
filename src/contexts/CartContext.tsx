"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart(prevCart => {
      const cartItemId = `${product.id}-${size || ''}-${color || ''}`;
      const existingItemIndex = prevCart.findIndex(item => 
        `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}` === cartItemId
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        toast.success(`Quantité mise à jour`);
        return newCart;
      }

      toast.success(`${product.name} ajouté au panier`);
      return [...prevCart, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => 
      `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}` !== cartItemId
    ));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => 
        `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}` === cartItemId 
        ? { ...item, quantity } 
        : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};