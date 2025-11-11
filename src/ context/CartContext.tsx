import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Define the Cart Item type
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// 2. Define the Context structure (what will be shared)
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { id: number; name: string; price: number }) => void;
  updateQuantity: (id: number, delta: 1 | -1) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

// 3. Create the Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 4. Create the Provider Component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: { id: number; name: string; price: number }) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // If item exists, increase quantity
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If new item, add it with quantity 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: number, delta: 1 | -1) => {
    setCartItems((prevItems) => {
      return prevItems
        .map(item =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        // Filter out items where quantity drops to 0 or less
        .filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// 5. Custom hook for easy access
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

