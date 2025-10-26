import React, { createContext, useMemo, useState, useCallback, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

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
    { id: '9', name: 'Coffee Ice Cream', price: 150, inStock: false, category: 'Classic', rating: 4.2 },
    { id: '10', name: 'Coffee Ice Cream', price: 150, inStock: false, category: 'Classic', rating: 4.2 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products from Firestore
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      
      if (productsSnapshot.empty) {

        setLoading(false);
        return;
      }
      
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

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

    } catch (err) {
      console.error('❌ Error removing product:', err);
    }
  }, []);

  // Bulk update the stock for all products
  const bulkUpdateStocks = useCallback(async (stockCount) => {
    try {
      const count = parseInt(stockCount);
      if (Number.isNaN(count) || count < 0) throw new Error('Invalid stock value');

      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) return { success: true, updated: 0 };

      const batch = writeBatch(db);
      const now = new Date().toISOString();
      let updated = 0;
      snap.forEach((d) => {
        const ref = doc(db, 'products', d.id);
        batch.update(ref, { stock: count, inStock: count > 0, updatedAt: now });
        updated += 1;
      });
      await batch.commit();

      // Update local state
      setProducts(prev => prev.map(p => ({ ...p, stock: count, inStock: count > 0 })));

      return { success: true, updated };
    } catch (err) {
      console.error('❌ Error bulk updating stocks:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      fetchProducts,
      refreshProducts: fetchProducts, // Alias for compatibility
      updateProductPrice,
      setProductStock,
      updateProductFields,
      addProduct,
      removeProduct,
      bulkUpdateStocks,
    }),
    [products, loading, error, fetchProducts, updateProductPrice, setProductStock, updateProductFields, addProduct, removeProduct, bulkUpdateStocks]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}
