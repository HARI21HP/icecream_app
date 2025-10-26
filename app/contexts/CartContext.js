import React, { createContext, useState, useCallback, useMemo } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((item, quantity = 1) => {
    if (!item?.id) {
      return false;
    }
    
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + Math.max(1, quantity) }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.max(1, quantity) }];
    });
    
    return true;
  }, []);

  const decrementQuantity = useCallback((id, step = 1) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - step } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    const nextQty = Math.max(0, Number(quantity) || 0);
    setCartItems((prev) => {
      if (nextQty === 0) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, quantity: nextQty } : i));
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }, [cartItems]);

  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    decrementQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  }), [cartItems, addToCart, decrementQuantity, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemsCount]);

  return (
    <CartContext.Provider value={contextValue}> 
      {children}
    </CartContext.Provider>
  );
};
