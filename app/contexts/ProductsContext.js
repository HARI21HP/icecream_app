import React, { createContext, useMemo, useState, useCallback, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([
    // Default products as fallback
    { id: '1', name: 'Vanilla Ice Cream', price: 120, inStock: true, category: 'Classic', rating: 4.5 },
    { id: '2', name: 'Chocolate Ice Cream', price: 150, inStock: true, category: 'Classic', rating: 4.7 },
    { id: '3', name: 'Strawberry Ice Cream', price: 140, inStock: true, category: 'Fruit', rating: 4.4 },
    { id: '4', name: 'Mint Choco Chip', price: 160, inStock: true, category: 'Premium', rating: 4.6 },
    { id: '5', name: 'Butter Pecan', price: 170, inStock: true, category: 'Premium', rating: 4.3 },
    { id: '6', name: 'Cookies & Cream', price: 155, inStock: true, category: 'Popular', rating: 4.8 },
    { id: '7', name: 'Mango Sorbet', price: 130, inStock: true, category: 'Sorbet', rating: 4.5 },
    { id: '8', name: 'Pistachio Ice Cream', price: 165, inStock: true, category: 'Premium', rating: 4.4 },
    { id: '9', name: 'Coffee Ice Cream', price: 150, inStock: false, category: 'Classic', rating: 4.2 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products from Firestore
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 Fetching products from Firestore...');
      
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      
      if (productsSnapshot.empty) {
        console.log('⚠️ No products found in Firestore, using default products');
        setLoading(false);
        return;
      }
      
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✓ Fetched ${productsData.length} products from Firestore`);
      setProducts(productsData);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateProductPrice = useCallback(async (productId, newPrice) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { 
        price: newPrice,
        updatedAt: new Date().toISOString()
      });
      
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, price: newPrice } : p))
      );
      console.log(`✓ Updated price for product ${productId}`);
    } catch (err) {
      console.error('❌ Error updating price:', err);
    }
  }, []);

  const setProductStock = useCallback(async (productId, inStock) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { 
        inStock,
        updatedAt: new Date().toISOString()
      });
      
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, inStock } : p))
      );
      console.log(`✓ Updated stock for product ${productId}`);
    } catch (err) {
      console.error('❌ Error updating stock:', err);
    }
  }, []);

  const updateProductFields = useCallback(async (productId, fields) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { 
        ...fields,
        updatedAt: new Date().toISOString()
      });
      
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, ...fields } : p))
      );
      console.log(`✓ Updated fields for product ${productId}`);
    } catch (err) {
      console.error('❌ Error updating product:', err);
    }
  }, []);

  const addProduct = useCallback(async (product) => {
    try {
      const productsCollection = collection(db, 'products');
      const docRef = await addDoc(productsCollection, {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const newProduct = { id: docRef.id, ...product };
      setProducts(prev => [...prev, newProduct]);
      console.log(`✓ Added product ${docRef.id}`);
      return newProduct;
    } catch (err) {
      console.error('❌ Error adding product:', err);
      return null;
    }
  }, []);

  const removeProduct = useCallback(async (productId) => {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      console.log(`✓ Removed product ${productId}`);
    } catch (err) {
      console.error('❌ Error removing product:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      fetchProducts,
      updateProductPrice,
      setProductStock,
      updateProductFields,
      addProduct,
      removeProduct,
    }),
    [products, loading, error, fetchProducts, updateProductPrice, setProductStock, updateProductFields, addProduct, removeProduct]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}
