import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

export default function AddressesScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const firstInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pin: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      Alert.alert(
        'Authentication Required',
        'Please login to manage your addresses',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
      return;
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const addressesRef = collection(db, 'users', user.uid, 'addresses');
      const snapshot = await getDocs(addressesRef);
      const addressList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAddresses(addressList);
    } catch (error) {
      // Silently handle permission errors (user not logged in)
      if (error.code !== 'permission-denied') {
        console.error('Error loading addresses:', error);
        Alert.alert('Error', 'Failed to load addresses. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pin: '',
      isDefault: addresses.length === 0,
    });
    // Ensure nothing in the background retains focus (fixes web a11y warning)
    Keyboard.dismiss();
    setModalVisible(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setFormData(address);
    // Ensure nothing in the background retains focus (fixes web a11y warning)
    Keyboard.dismiss();
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Check authentication first
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please login to save addresses',
        [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
      );
      return;
    }

    // Validation
    if (!formData.name || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.pin) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^\d{6}$/.test(formData.pin)) {
      Alert.alert('Error', 'Please enter a valid 6-digit PIN code');
      return;
    }

    try {
      setLoading(true);
      const addressesRef = collection(db, 'users', user.uid, 'addresses');

      // If this is set as default, update all other addresses to not be default
      if (formData.isDefault) {
        const snapshot = await getDocs(addressesRef);
        for (const document of snapshot.docs) {
          await updateDoc(doc(db, 'users', user.uid, 'addresses', document.id), {
            isDefault: false
          });
        }
      }

      if (editingAddress) {
        // Update existing address
        const addressDoc = doc(db, 'users', user.uid, 'addresses', editingAddress.id);
        await updateDoc(addressDoc, formData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // Add new address
        await addDoc(addressesRef, {
          ...formData,
          createdAt: new Date().toISOString(),
        });
        Alert.alert('Success', 'Address added successfully');
      }

      setModalVisible(false);
      loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Better error message based on error type
      if (error.code === 'permission-denied') {
        Alert.alert(
          'Permission Denied', 
          'You do not have permission to save addresses. Please ensure you are logged in and Firestore rules are configured.'
        );
      } else if (error.code === 'unauthenticated') {
        Alert.alert(
          'Authentication Required', 
          'Please login to save addresses',
          [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
        );
      } else if (error.code === 'not-found') {
        Alert.alert('Error', 'User collection not found. Please contact support.');
      } else {
        Alert.alert(
          'Error Saving Address', 
          `${error.message || 'Failed to save address. Please try again.'}\n\nError code: ${error.code || 'unknown'}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // When modal opens on web, shift focus into the modal to avoid aria-hidden warnings
  useEffect(() => {
    if (modalVisible) {
      const t = setTimeout(() => {
        try {
          firstInputRef.current?.focus?.();
        } catch (e) {
          // no-op
        }
      }, 50);
      return () => clearTimeout(t);
    } else {
      // Blur any lingering focus from modal inputs on close
      try {
        firstInputRef.current?.blur?.();
      } catch (e) {
        // no-op
      }
    }
  }, [modalVisible]);

  const handleDelete = async (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, 'users', user.uid, 'addresses', addressId));
              Alert.alert('Success', 'Address deleted successfully');
              loadAddresses();
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      const addressesRef = collection(db, 'users', user.uid, 'addresses');
      const snapshot = await getDocs(addressesRef);
      
      // Update all addresses
      for (const document of snapshot.docs) {
        await updateDoc(doc(db, 'users', user.uid, 'addresses', document.id), {
          isDefault: document.id === addressId
        });
      }
      
      Alert.alert('Success', 'Default address updated');
      loadAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
      Alert.alert('Error', 'Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  const renderAddress = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.addressCard}
    >
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <FontAwesome name="check-circle" size={12} color="#4CAF50" />
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
      
      <Text style={styles.addressName}>{item.name}</Text>
      <Text style={styles.addressPhone}>📱 {item.phone}</Text>
      <Text style={styles.addressStreet}>{item.street}</Text>
      <Text style={styles.addressCity}>
        {item.city}, {item.state} - {item.pin}
      </Text>

      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
            activeOpacity={0.7}
          >
            <FontAwesome name="star-o" size={16} color={COLORS.accent} />
            <Text style={styles.actionText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <FontAwesome name="edit" size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
        >
          <FontAwesome name="trash" size={16} color="#f44336" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <FontAwesome name="lock" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptySubtitle}>Please login to manage addresses</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <FontAwesome name="plus" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <FontAwesome name="map-marker" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>Add your first delivery address</Text>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        accessibilityViewIsModal
        onShow={() => {
          try { firstInputRef.current?.focus?.(); } catch (e) {}
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                ref={firstInputRef}
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter full name"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.street}
                onChangeText={(text) => setFormData({ ...formData, street: text })}
                placeholder="House no., Building, Street"
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Enter city"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                placeholder="Enter state"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.label}>PIN Code *</Text>
              <TextInput
                style={styles.input}
                value={formData.pin}
                onChangeText={(text) => setFormData({ ...formData, pin: text })}
                placeholder="6-digit PIN code"
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor={COLORS.textLight}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                <FontAwesome
                  name={formData.isDefault ? "check-square" : "square-o"}
                  size={24}
                  color={formData.isDefault ? COLORS.primary : COLORS.textLight}
                />
                <Text style={styles.checkboxLabel}>Set as default address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  addButton: {
    padding: SPACING.sm,
  },
  listContent: {
    padding: SPACING.md,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.xs / 2,
  },
  defaultText: {
    fontSize: TYPOGRAPHY.xs,
    color: '#4CAF50',
    fontWeight: TYPOGRAPHY.bold,
  },
  addressName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  addressPhone: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  addressStreet: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  addressCity: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  addressActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: SPACING.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  form: {
    padding: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
});
