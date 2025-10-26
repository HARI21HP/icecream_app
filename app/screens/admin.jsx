import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { seedProducts } from '../scripts/seedProducts';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { AuthContext } from '../contexts/AuthContext';
import { ProductsContext } from '../contexts/ProductsContext';
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { uploadProductImage, uploadFileWithProgress } from '../services/storageService';
import { getImageSource } from '../constants/images';

// Admin email - Replace with your shop owner email
const ADMIN_EMAIL = 'hariprakashpc@gmail.com';

export default function AdminScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { products, refreshProducts, bulkUpdateStocks } = useContext(ProductsContext);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localImageUri, setLocalImageUri] = useState('');
  const [bulkStock, setBulkStock] = useState('50');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    imageUrl: '',
    rating: '4.5',
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      refreshProducts();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please login as admin to access this panel',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    try {
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
        setChecking(false);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
      } else {
        Alert.alert(
          'Access Denied',
          'You do not have admin privileges.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      Alert.alert('Error', 'Failed to verify admin access', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Verifying admin access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pickImage = async () => {
    const { status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permission');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      // Defer upload until save so we can upload to products/{productId}/image.jpg
      setLocalImageUri(result.assets[0].uri);
      setFormData({ ...formData, imageUrl: '' });
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      description: '',
      imageUrl: '',
      rating: '4.5',
    });
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '0',
      category: product.category || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      rating: product.rating?.toString() || '4.5',
    });
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Price, Category)');
      return;
    }

    try {
      setLoading(true);
      setUploading(false);
      setUploadProgress(0);
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        category: formData.category,
        description: formData.description,
        imageUrl: '',
        rating: parseFloat(formData.rating) || 4.5,
        inStock: parseInt(formData.stock) > 0,
        updatedAt: new Date().toISOString(),
      };

      if (editingProduct) {
        // Update main fields first
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        // If a new local image selected, upload to products/{id}/image.jpg, update doc
        if (localImageUri) {
          setUploading(true);
          const path = `products/${editingProduct.id}/image.jpg`;
          const url = await uploadFileWithProgress(localImageUri, path, setUploadProgress, { contentType: 'image/jpeg' });
          await updateDoc(doc(db, 'products', editingProduct.id), { imageUrl: url, updatedAt: new Date().toISOString() });
          setFormData((prev) => ({ ...prev, imageUrl: url }));
          setLocalImageUri('');
        }
        Alert.alert('Success', 'Product updated successfully');
      } else {
        // Create product first to get productId
        productData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'products'), productData);
        // Upload image if selected
        if (localImageUri) {
          setUploading(true);
          const path = `products/${docRef.id}/image.jpg`;
          const url = await uploadFileWithProgress(localImageUri, path, setUploadProgress, { contentType: 'image/jpeg' });
          await updateDoc(doc(db, 'products', docRef.id), { imageUrl: url, updatedAt: new Date().toISOString() });
          setFormData((prev) => ({ ...prev, imageUrl: url }));
          setLocalImageUri('');
        }
        Alert.alert('Success', 'Product added successfully');
      }

      setModalVisible(false);
      refreshProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, 'products', product.id));
              Alert.alert('Success', 'Product deleted');
              refreshProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSeedProducts = async () => {
  const handleBulkStockUpdate = async () => {
    const count = parseInt(bulkStock);
    if (Number.isNaN(count) || count < 0) {
      Alert.alert('Invalid value', 'Please enter a non-negative number');
      return;
    }
    try {
      setLoading(true);
      const res = await bulkUpdateStocks(count);
      if (res?.success) {
        Alert.alert('Success', `Updated stock to ${count} for ${res.updated} products`);
        refreshProducts();
      } else {
        Alert.alert('Error', res?.error || 'Failed to update stock');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };
    Alert.alert(
      'Seed Products',
      'This will add 12 ice cream products to your database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Database',
          onPress: async () => {
            setLoading(true);
            const result = await seedProducts();
            setLoading(false);

            if (result.success) {
              Alert.alert('Success!', `Added ${result.count} products`);
              refreshProducts();
            } else {
              Alert.alert('Error', result.error || 'Failed to seed products');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <FontAwesome name="list" size={18} color={activeTab === 'products' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
            Products ({products.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.tabActive]}
          onPress={() => setActiveTab('add')}
        >
          <FontAwesome name="plus-circle" size={18} color={activeTab === 'add' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>
            Quick Actions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products List Tab */}
      {activeTab === 'products' && (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.headerTitle}>Manage Products</Text>
              <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                <FontAwesome name="plus" size={16} color={COLORS.textInverse} />
                <Text style={styles.addButtonText}>Add New</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <Animated.View entering={FadeInDown} style={styles.productCard}>
              <Image
                source={getImageSource(item.imageUrl)}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  <View style={[styles.stockBadge, item.stock === 0 && styles.stockBadgeOut]}>
                    <Text style={[styles.stockText, item.stock === 0 && styles.stockTextOut]}>
                      {item.stock === 0 ? 'STOCK OVER' : `Stock: ${item.stock}`}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(item)}
                >
                  <FontAwesome name="edit" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteProduct(item)}
                >
                  <FontAwesome name="trash" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome name="inbox" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No products yet</Text>
              <TouchableOpacity style={styles.seedButton} onPress={handleSeedProducts}>
                <Text style={styles.seedButtonText}>Seed Sample Products</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Quick Actions Tab */}
      {activeTab === 'add' && (
        <ScrollView contentContainerStyle={styles.actionsContent}>
          <Animated.View entering={ZoomIn} style={styles.actionCard}>
            <FontAwesome name="database" size={48} color={COLORS.primary} />
            <Text style={styles.actionTitle}>Seed Products</Text>
            <Text style={styles.actionDesc}>
              Add 12 sample ice cream products to get started
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSeedProducts}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textInverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Seed Database</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={ZoomIn.delay(100)} style={styles.actionCard}>
            <FontAwesome name="plus-circle" size={48} color={COLORS.success} />
            <Text style={styles.actionTitle}>Add Product</Text>
            <Text style={styles.actionDesc}>
              Create a new ice cream product manually
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: COLORS.success }]}
              onPress={openAddModal}
            >
              <Text style={styles.primaryButtonText}>Add New Product</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={ZoomIn.delay(200)} style={styles.actionCard}>
            <FontAwesome name="cubes" size={48} color={COLORS.primary} />
            <Text style={styles.actionTitle}>Bulk Update Stock</Text>
            <Text style={styles.actionDesc}>Set the same stock quantity for all products</Text>
            <TextInput
              style={[styles.input, { marginTop: SPACING.md, textAlign: 'center', maxWidth: 160 }]}
              value={bulkStock}
              onChangeText={setBulkStock}
              placeholder="e.g., 50"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: SPACING.md }]}
              onPress={handleBulkStockUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textInverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Apply to All</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <FontAwesome name="times" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Vanilla Ice Cream"
            />

            <Text style={styles.label}>Price (₹) *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="120"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Stock Quantity *</Text>
            <TextInput
              style={styles.input}
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              placeholder="50"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder="Classic, Premium, Seasonal"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Delicious ice cream..."
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Rating (1-5)</Text>
            <TextInput
              style={styles.input}
              value={formData.rating}
              onChangeText={(text) => setFormData({ ...formData, rating: text })}
              placeholder="4.5"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Product Image</Text>
            {localImageUri ? (
              <Image source={{ uri: localImageUri }} style={styles.previewImage} />
            ) : formData.imageUrl ? (
              <Image source={getImageSource(formData.imageUrl)} style={styles.previewImage} />
            ) : null}
            <TouchableOpacity
              style={styles.imageButton}
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? (
                <View style={{ alignItems: 'center' }}>
                  <ActivityIndicator color={COLORS.primary} />
                  <Text style={{ marginTop: 6, color: COLORS.textSecondary }}>{Math.round(uploadProgress * 100)}%</Text>
                </View>
              ) : (
                <>
                  <FontAwesome name="image" size={20} color={COLORS.primary} />
                  <Text style={styles.imageButtonText}>
                    {localImageUri || formData.imageUrl ? 'Change Image' : 'Select Image'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProduct}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textInverse} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingProduct ? 'Update' : 'Add'} Product
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.bold,
  },
  listContent: {
    padding: SPACING.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  addButtonText: {
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.semibold,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  productName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productCategory: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  stockBadge: {
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  stockBadgeOut: {
    backgroundColor: `${COLORS.error}15`,
  },
  stockText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.success,
  },
  stockTextOut: {
    color: COLORS.error,
  },
  productActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  seedButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  seedButtonText: {
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.bold,
  },
  actionsContent: {
    padding: SPACING.lg,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  actionDesc: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    alignSelf: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  imageButtonText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.semibold,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.bold,
  },
});
