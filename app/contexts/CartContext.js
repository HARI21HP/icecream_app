import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item, quantity = 1) => {
    if (!item?.id) {
      console.warn("CartContext: Tried to add item without an ID", item);
      return;
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
  };

  const decrementQuantity = (id, step = 1) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - step } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const updateQuantity = (id, quantity) => {
    const nextQty = Math.max(0, Number(quantity) || 0);
    setCartItems((prev) => {
      if (nextQty === 0) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, quantity: nextQty } : i));
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decrementQuantity,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    > 
      {children}
    </CartContext.Provider>
  );
};
