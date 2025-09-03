import React, { createContext, useMemo, useState, useCallback } from 'react';

export const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([
    { id: '1', name: 'Vanilla Ice Cream', price: 120, inStock: true },
    { id: '2', name: 'Chocolate Ice Cream', price: 150, inStock: true },
    { id: '3', name: 'Strawberry Ice Cream', price: 140, inStock: true },
    { id: '4', name: 'Mint Choco Chip', price: 160, inStock: true },
    { id: '5', name: 'Butter Pecan', price: 170, inStock: true },
    { id: '6', name: 'Cookies & Cream', price: 155, inStock: true },
    { id: '7', name: 'Mango Sorbet', price: 130, inStock: true },
    { id: '8', name: 'Pistachio Ice Cream', price: 165, inStock: true },
    { id: '9', name: 'Coffee Ice Cream', price: 150, inStock: false }
  ]
  );

  const updateProductPrice = useCallback((productId, newPrice) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, price: newPrice } : p))
    );
  }, []);

  const setProductStock = useCallback((productId, inStock) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, inStock } : p))
    );
  }, []);

  const updateProductFields = useCallback((productId, fields) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, ...fields } : p))
    );
  }, []);

  const addProduct = useCallback((product) => {
    const newProduct = { id: Date.now().toString(), ...product };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const removeProduct = useCallback((productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const value = useMemo(
    () => ({
      products,
      updateProductPrice,
      setProductStock,
      updateProductFields,
      addProduct,
      removeProduct,
    }),
    [products, updateProductPrice, setProductStock, updateProductFields, addProduct, removeProduct]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}
