import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { collection, addDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

export default function CheckoutScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart, getCartTotal } = useContext(CartContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;
    
    try {
      const addressesRef = collection(db, 'users', user.uid, 'addresses');
      const snapshot = await getDocs(addressesRef);
      const addressList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAddresses(addressList);
      
      // Auto-select default address
      const defaultAddr = addressList.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedAddress) {
        Alert.alert('Address Required', 'Please select a delivery address');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || null,
        })),
        total: getCartTotal(),
        address: selectedAddress,
        paymentMethod: paymentMethod,
        status: 'Order Placed',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      };

      // Create order in Firestore
      const ordersRef = collection(db, 'orders');
      const orderDoc = await addDoc(ordersRef, orderData);

      // Clear cart
      clearCart();

      Alert.alert(
        '🎉 Order Placed Successfully!',
        `Your order #${orderDoc.id.slice(-6).toUpperCase()} has been placed and will be delivered soon.`,
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('OrderHistory'),
          },
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('Shop'),
          },
        ]
      );

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Address</Text>
        </View>
        
        <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
        
        <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Summary</Text>
        </View>
        
        <View style={[styles.progressLine, currentStep >= 3 && styles.progressLineActive]} />
        
        <View style={[styles.progressStep, currentStep >= 3 && styles.progressStepActive]}>
          <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Payment</Text>
        </View>
      </View>
    </View>
  );

  const renderAddressStep = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={styles.stepTitle}>Select Delivery Address</Text>
      
      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="map-marker" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No saved addresses</Text>
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => navigation.navigate('Addresses')}
          >
            <FontAwesome name="plus" size={16} color="#fff" />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {addresses.map((address, index) => (
            <Animated.View
              key={address.id}
              entering={SlideInRight.delay(index * 100).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.addressCard,
                  selectedAddress?.id === address.id && styles.addressCardSelected
                ]}
                onPress={() => setSelectedAddress(address)}
                activeOpacity={0.7}
              >
                <View style={styles.addressHeader}>
                  <FontAwesome
                    name={selectedAddress?.id === address.id ? "dot-circle-o" : "circle-o"}
                    size={20}
                    color={selectedAddress?.id === address.id ? COLORS.primary : COLORS.textLight}
                  />
                  <Text style={styles.addressName}>{address.name}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressPhone}>📱 {address.phone}</Text>
                <Text style={styles.addressStreet}>{address.street}</Text>
                <Text style={styles.addressCity}>
                  {address.city}, {address.state} - {address.pin}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
          
          <TouchableOpacity
            style={styles.addAddressButtonSmall}
            onPress={() => navigation.navigate('Addresses')}
          >
            <FontAwesome name="plus" size={14} color={COLORS.primary} />
            <Text style={styles.addAddressTextSmall}>Add New Address</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );

  const renderOrderSummary = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={styles.stepTitle}>Order Summary</Text>
      
      {cartItems.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={SlideInRight.delay(index * 50).springify()}
          style={styles.summaryItem}
        >
          <View style={styles.summaryItemInfo}>
            <Text style={styles.summaryItemName}>{item.name}</Text>
            <Text style={styles.summaryItemQty}>Qty: {item.quantity}</Text>
          </View>
          <Text style={styles.summaryItemPrice}>₹{item.price * item.quantity}</Text>
        </Animated.View>
      ))}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>₹{getCartTotal()}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Delivery Charges</Text>
        <Text style={[styles.totalValue, { color: '#4CAF50' }]}>FREE</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Taxes</Text>
        <Text style={styles.totalValue}>₹0</Text>
      </View>

      <View style={[styles.divider, { marginVertical: SPACING.md }]} />

      <View style={styles.grandTotalRow}>
        <Text style={styles.grandTotalLabel}>Total Amount</Text>
        <Text style={styles.grandTotalValue}>₹{getCartTotal()}</Text>
      </View>

      {selectedAddress && (
        <View style={styles.deliveryAddressBox}>
          <Text style={styles.deliveryLabel}>Delivering to:</Text>
          <Text style={styles.deliveryName}>{selectedAddress.name}</Text>
          <Text style={styles.deliveryText}>
            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pin}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderPaymentStep = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={styles.stepTitle}>Select Payment Method</Text>
      
      <TouchableOpacity
        style={[
          styles.paymentCard,
          paymentMethod === 'COD' && styles.paymentCardSelected
        ]}
        onPress={() => setPaymentMethod('COD')}
        activeOpacity={0.7}
      >
        <View style={styles.paymentHeader}>
          <FontAwesome
            name={paymentMethod === 'COD' ? "dot-circle-o" : "circle-o"}
            size={20}
            color={paymentMethod === 'COD' ? COLORS.primary : COLORS.textLight}
          />
          <FontAwesome name="money" size={24} color={COLORS.accent} style={{ marginLeft: SPACING.md }} />
          <Text style={styles.paymentTitle}>Cash on Delivery</Text>
        </View>
        <Text style={styles.paymentDesc}>Pay when you receive your order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentCard,
          paymentMethod === 'RAZORPAY' && styles.paymentCardSelected
        ]}
        onPress={() => setPaymentMethod('RAZORPAY')}
        activeOpacity={0.7}
      >
        <View style={styles.paymentHeader}>
          <FontAwesome
            name={paymentMethod === 'RAZORPAY' ? "dot-circle-o" : "circle-o"}
            size={20}
            color={paymentMethod === 'RAZORPAY' ? COLORS.primary : COLORS.textLight}
          />
          <FontAwesome name="credit-card" size={24} color={COLORS.primary} style={{ marginLeft: SPACING.md }} />
          <Text style={styles.paymentTitle}>Online Payment</Text>
        </View>
        <Text style={styles.paymentDesc}>UPI, Cards, Net Banking (Coming Soon)</Text>
      </TouchableOpacity>

      <View style={styles.orderSummaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({cartItems.length})</Text>
          <Text style={styles.summaryValue}>₹{getCartTotal()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>FREE</Text>
        </View>
        <View style={[styles.divider, { marginVertical: SPACING.sm }]} />
        <View style={styles.summaryRow}>
          <Text style={styles.grandTotalLabel}>Total Payable</Text>
          <Text style={styles.grandTotalValue}>₹{getCartTotal()}</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
          } else {
            navigation.goBack();
          }
        }} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderProgressBar()}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderAddressStep()}
        {currentStep === 2 && renderOrderSummary()}
        {currentStep === 3 && renderPaymentStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep < 3 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextStep}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 1 ? 'Continue to Summary' : 'Continue to Payment'}
            </Text>
            <FontAwesome name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, styles.placeOrderButton]}
            onPress={handlePlaceOrder}
            disabled={loading || paymentMethod === 'RAZORPAY'}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="check-circle" size={18} color="#fff" />
                <Text style={styles.nextButtonText}>
                  {paymentMethod === 'RAZORPAY' ? 'Coming Soon' : 'Place Order'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  progressContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textLight,
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
    marginBottom: 24,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  addressCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  addressName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  defaultText: {
    fontSize: TYPOGRAPHY.xs,
    color: '#fff',
    fontWeight: TYPOGRAPHY.bold,
  },
  addressPhone: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  addressStreet: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  addressCity: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
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
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  addAddressText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
  addAddressButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addAddressTextSmall: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  summaryItemQty: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  summaryItemPrice: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  grandTotalLabel: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  grandTotalValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  deliveryAddressBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  deliveryLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  deliveryName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  deliveryText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  paymentCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  paymentTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  paymentDesc: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginLeft: 44,
  },
  orderSummaryBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
  },
  footer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    ...SHADOWS.lg,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
});
