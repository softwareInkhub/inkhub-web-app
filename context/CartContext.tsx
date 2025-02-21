'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  handle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image: {
    url: string;
    altText: string | null;
  };
  variantId: string;
  quantity: number;
  selectedOptions: { name: string; value: string }[];
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  isLoading: boolean;
}

export const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartCount: 0,
  isLoading: true
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.variantId === item.variantId);
      if (existingItem) {
        return prev.map(i => 
          i.variantId === item.variantId 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isClient]);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart: (variantId: string) => {
      setItems(prev => prev.filter(item => item.variantId !== variantId));
    },
    updateQuantity: (variantId: string, quantity: number) => {
      setItems(prev => 
        prev.map(item => 
          item.variantId === variantId ? { ...item, quantity } : item
        )
      );
    },
    clearCart: () => setItems([]),
    cartCount,
    isLoading
  };

  // Only render content after hydration
  if (!isClient) {
    return null;
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 