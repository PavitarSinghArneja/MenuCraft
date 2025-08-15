import { useState, useEffect } from 'react';
import { CartItem, MenuItem, OrderTotals } from '../types';
import { calculateSubtotal, calculateTax, calculateTotal } from '../utils/calculations';

const CART_STORAGE_KEY = 'restaurant-cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<OrderTotals>({ subtotal: 0, tax: 0, total: 0 });

  // Load cart from session storage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    }
  }, []);

  // Save cart to session storage and recalculate totals when items change
  useEffect(() => {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, tax);
    
    setTotals({ subtotal, tax, total });
  }, [items]);

  const addItem = (menuItem: MenuItem, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === menuItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.price }
            : item
        );
      } else {
        const newItem: CartItem = {
          ...menuItem,
          quantity,
          subtotal: menuItem.price * quantity
        };
        return [...prevItems, newItem];
      }
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    sessionStorage.removeItem(CART_STORAGE_KEY);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    items,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount
  };
}