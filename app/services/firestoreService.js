// Firestore Service - Centralized database operations
import { db } from "../config/firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  Timestamp,
} from "firebase/firestore";

// ==================== PRODUCTS ====================

/**
 * Fetch all products from Firestore
 * @returns {Promise<Array>} Array of product objects with IDs
 */
export const fetchProducts = async () => {
  try {
    console.log("📦 Fetching products from Firestore...");
    const querySnapshot = await getDocs(collection(db, "products"));
    
    if (querySnapshot.empty) {
      console.log("⚠️ No products found in Firestore");
      return [];
    }
    
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log(`✅ Fetched ${products.length} products`);
    return products;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
};

/**
 * Fetch a single product by ID
 * @param {string} productId - Product document ID
 * @returns {Promise<Object|null>} Product object or null if not found
 */
export const fetchProductById = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() };
    } else {
      console.log(`⚠️ Product ${productId} not found`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching product ${productId}:`, error);
    throw error;
  }
};

/**
 * Add a new product to Firestore
 * @param {Object} product - Product data
 * @returns {Promise<Object>} Created product with ID
 */
export const addProduct = async (product) => {
  try {
    const productsRef = collection(db, "products");
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`✅ Added product ${docRef.id}`);
    return { id: docRef.id, ...product };
  } catch (error) {
    console.error("❌ Error adding product:", error);
    throw error;
  }
};

/**
 * Update product fields
 * @param {string} productId - Product document ID
 * @param {Object} fields - Fields to update
 * @returns {Promise<void>}
 */
export const updateProduct = async (productId, fields) => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      ...fields,
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`✅ Updated product ${productId}`);
  } catch (error) {
    console.error(`❌ Error updating product ${productId}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 * @param {string} productId - Product document ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    console.log(`✅ Deleted product ${productId}`);
  } catch (error) {
    console.error(`❌ Error deleting product ${productId}:`, error);
    throw error;
  }
};

// ==================== USERS ====================

/**
 * Create or update user profile
 * @param {string} userId - User UID
 * @param {Object} userData - User profile data
 * @returns {Promise<void>}
 */
export const createOrUpdateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, userData, { merge: true });
    console.log(`✅ User ${userId} profile updated`);
  } catch (error) {
    console.error(`❌ Error updating user ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetch user profile
 * @param {string} userId - User UID
 * @returns {Promise<Object|null>} User data or null
 */
export const fetchUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      console.log(`⚠️ User ${userId} not found`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching user ${userId}:`, error);
    throw error;
  }
};

// ==================== ADDRESSES ====================

/**
 * Fetch all addresses for a user
 * @param {string} userId - User UID
 * @returns {Promise<Array>} Array of address objects
 */
export const fetchUserAddresses = async (userId) => {
  try {
    const addressesRef = collection(db, "users", userId, "addresses");
    const snapshot = await getDocs(addressesRef);
    
    const addresses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log(`✅ Fetched ${addresses.length} addresses for user ${userId}`);
    return addresses;
  } catch (error) {
    console.error(`❌ Error fetching addresses for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Add a new address for a user
 * @param {string} userId - User UID
 * @param {Object} addressData - Address data
 * @returns {Promise<Object>} Created address with ID
 */
export const addUserAddress = async (userId, addressData) => {
  try {
    const addressesRef = collection(db, "users", userId, "addresses");
    const docRef = await addDoc(addressesRef, {
      ...addressData,
      createdAt: new Date().toISOString(),
    });
    
    console.log(`✅ Added address ${docRef.id} for user ${userId}`);
    return { id: docRef.id, ...addressData };
  } catch (error) {
    console.error(`❌ Error adding address for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update an address
 * @param {string} userId - User UID
 * @param {string} addressId - Address document ID
 * @param {Object} fields - Fields to update
 * @returns {Promise<void>}
 */
export const updateUserAddress = async (userId, addressId, fields) => {
  try {
    const addressRef = doc(db, "users", userId, "addresses", addressId);
    await updateDoc(addressRef, fields);
    console.log(`✅ Updated address ${addressId} for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error updating address ${addressId}:`, error);
    throw error;
  }
};

/**
 * Delete an address
 * @param {string} userId - User UID
 * @param {string} addressId - Address document ID
 * @returns {Promise<void>}
 */
export const deleteUserAddress = async (userId, addressId) => {
  try {
    const addressRef = doc(db, "users", userId, "addresses", addressId);
    await deleteDoc(addressRef);
    console.log(`✅ Deleted address ${addressId} for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error deleting address ${addressId}:`, error);
    throw error;
  }
};

// ==================== ORDERS ====================

/**
 * Create a new order
 * @param {Object} orderData - Order data including userId, items, total, etc.
 * @returns {Promise<Object>} Created order with ID
 */
export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      status: orderData.status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`✅ Created order ${docRef.id} for user ${orderData.userId}`);
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
};

/**
 * Fetch all orders for a user
 * @param {string} userId - User UID
 * @returns {Promise<Array>} Array of order objects
 */
export const fetchUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log(`✅ Fetched ${orders.length} orders for user ${userId}`);
    return orders;
  } catch (error) {
    console.error(`❌ Error fetching orders for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetch a single order by ID
 * @param {string} orderId - Order document ID
 * @returns {Promise<Object|null>} Order object or null
 */
export const fetchOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() };
    } else {
      console.log(`⚠️ Order ${orderId} not found`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Update order status
 * @param {string} orderId - Order document ID
 * @param {string} status - New status (e.g., 'pending', 'confirmed', 'shipped', 'delivered')
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
    console.log(`✅ Updated order ${orderId} status to ${status}`);
  } catch (error) {
    console.error(`❌ Error updating order ${orderId} status:`, error);
    throw error;
  }
};

// ==================== CART (User-based) ====================
// Note: Your app currently uses React Context for cart (CartContext).
// These functions are provided if you want to persist cart to Firestore instead.

/**
 * Add product to user's cart in Firestore
 * @param {string} userId - User UID
 * @param {string} productId - Product ID to add
 * @returns {Promise<void>}
 */
export const addToCart = async (userId, productId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      cart: arrayUnion(productId),
    });
    console.log(`✅ Added product ${productId} to cart for user ${userId}`);
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    throw error;
  }
};

/**
 * Remove product from user's cart in Firestore
 * @param {string} userId - User UID
 * @param {string} productId - Product ID to remove
 * @returns {Promise<void>}
 */
export const removeFromCart = async (userId, productId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      cart: arrayRemove(productId),
    });
    console.log(`✅ Removed product ${productId} from cart for user ${userId}`);
  } catch (error) {
    console.error("❌ Error removing from cart:", error);
    throw error;
  }
};

/**
 * Clear user's cart in Firestore
 * @param {string} userId - User UID
 * @returns {Promise<void>}
 */
export const clearCart = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      cart: [],
    });
    console.log(`✅ Cleared cart for user ${userId}`);
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    throw error;
  }
};

/**
 * Fetch user's cart from Firestore
 * @param {string} userId - User UID
 * @returns {Promise<Array>} Array of product IDs
 */
export const fetchUserCart = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().cart || [];
    }
    return [];
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    throw error;
  }
};

// ==================== BULK OPERATIONS ====================

/**
 * Seed products (for initial setup or testing)
 * @param {Array} products - Array of product objects
 * @returns {Promise<Array>} Array of created product IDs
 */
export const seedProducts = async (products) => {
  try {
    const productsRef = collection(db, "products");
    const createdIds = [];
    
    for (const product of products) {
      const docRef = await addDoc(productsRef, {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      createdIds.push(docRef.id);
    }
    
    console.log(`✅ Seeded ${createdIds.length} products`);
    return createdIds;
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  }
};

export default {
  // Products
  fetchProducts,
  fetchProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  
  // Users
  createOrUpdateUser,
  fetchUserProfile,
  
  // Addresses
  fetchUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  
  // Orders
  createOrder,
  fetchUserOrders,
  fetchOrderById,
  updateOrderStatus,
  
  // Cart (Firestore-based, optional)
  addToCart,
  removeFromCart,
  clearCart,
  fetchUserCart,
  
  // Bulk operations
  seedProducts,
};
