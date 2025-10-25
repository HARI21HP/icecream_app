import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Linking,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartContext } from "../contexts/CartContext";
import { AuthContext } from "../contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { 
  FadeInDown, 
  FadeInUp,
  Layout,
  SlideInLeft,
  ZoomIn,
} from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function CartScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const {
    cartItems,
    removeFromCart,
    clearCart,
    addToCart,
    decrementQuantity,
  } = useContext(CartContext);

  const getTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const buildOrderText = () => {
    const lines = cartItems.map(
      (i) => `${i.name} x ${i.quantity} = ₹${i.price * i.quantity}`
    );
    return `New Order\n\n${lines.join("\n")}\n\nTotal: ₹${getTotalPrice()}`;
  };

  const handleEmail = async () => {
    // Check if user is logged in before checkout
    if (!user) {
      Alert.alert(
        "🔒 Login to Checkout",
        "Please login or create an account to complete your purchase and track your orders.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Login", 
            onPress: () => navigation.navigate("Login"),
            style: "default"
          },
          { 
            text: "Sign Up", 
            onPress: () => navigation.navigate("Register")
          }
        ]
      );
      return;
    }

    const subject = encodeURIComponent("New Ice Cream Order");
    const body = encodeURIComponent(buildOrderText());
    const to = "owner@example.com"; // Change to your email
    const url = `mailto:${to}?subject=${subject}&body=${body}`;
    const can = await Linking.canOpenURL(url);

    if (can) {
      await Linking.openURL(url);
      clearCart();
      navigation.navigate("MainApp", { screen: "Home" });
    } else {
      Alert.alert("Error", "No email app available");
    }
  };

  const handleWhatsApp = async () => {
    // Check if user is logged in before checkout
    if (!user) {
      Alert.alert(
        "🔒 Login to Checkout",
        "Please login or create an account to complete your purchase and track your orders.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Login", 
            onPress: () => navigation.navigate("Login"),
            style: "default"
          },
          { 
            text: "Sign Up", 
            onPress: () => navigation.navigate("Register")
          }
        ]
      );
      return;
    }

    const phone = "917418090583"; // Change to your WhatsApp number with country code
    const text = encodeURIComponent(buildOrderText());
    const url = `https://wa.me/${phone}?text=${text}`;
    const can = await Linking.canOpenURL(url);

    if (can) {
      await Linking.openURL(url);
      clearCart();
      navigation.navigate("MainApp", { screen: "Home" });
    } else {
      Alert.alert("Error", "Unable to open WhatsApp");
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <Animated.View 
          entering={ZoomIn.duration(600).springify()}
          style={styles.emptyContainer}
        >
          <FontAwesome name="shopping-cart" size={80} color={COLORS.borderLight} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some delicious ice cream!</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.container}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Animated.View 
              entering={FadeInDown.delay(index * 100).springify()}
              layout={Layout.springify()}
              style={styles.card}
            >
              <Image
                source={
                  item.imageUrl
                    ? { uri: item.imageUrl }
                    : item.image
                }
                style={styles.image}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => decrementQuantity(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => addToCart(item, 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => removeFromCart(item.id)}
                activeOpacity={0.7}
              >
                <FontAwesome name="trash" size={20} color="#d11a2a" />
              </TouchableOpacity>
            </Animated.View>
          )}
          ListFooterComponent={
            <Animated.View 
              entering={FadeInUp.delay(300).springify()}
              style={styles.summaryCard}
            >
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{getTotalPrice()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>₹0</Text>
              </View>
              <View
                style={[
                  styles.summaryRow,
                  {
                    borderTopWidth: 1,
                    borderColor: "#eee",
                    paddingTop: 8,
                    marginTop: 4,
                  },
                ]}
              >
                <Text
                  style={[styles.summaryLabel, { fontWeight: "bold" }]}
                >
                  Total
                </Text>
                <Text
                  style={[styles.summaryValue, { fontWeight: "bold", fontSize: 18 }]}
                >
                  ₹{getTotalPrice()}
                </Text>
              </View>
              
              {/* Primary Checkout Button */}
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => {
                  if (!user) {
                    Alert.alert(
                      "🔒 Login to Checkout",
                      "Please login or create an account to complete your purchase and track your orders.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Login", 
                          onPress: () => navigation.navigate("Login"),
                          style: "default"
                        },
                        { 
                          text: "Sign Up", 
                          onPress: () => navigation.navigate("Register")
                        }
                      ]
                    );
                    return;
                  }
                  navigation.navigate("Checkout");
                }}
                activeOpacity={0.8}
              >
                <FontAwesome name="lock" size={18} color="#fff" />
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                <FontAwesome name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>
              
              <Text style={styles.orText}>OR</Text>
              
              <View style={[styles.actionsRow, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#e85a71" }]}
                  onPress={handleEmail}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="envelope" size={16} color="#fff" />
                  <Text style={styles.actionText}>Email Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#25D366" }]}
                  onPress={handleWhatsApp}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="whatsapp" size={16} color="#fff" />
                  <Text style={styles.actionText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: SPACING.md, 
    backgroundColor: COLORS.background 
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  image: { 
    width: 70, 
    height: 70, 
    borderRadius: BORDER_RADIUS.md, 
    resizeMode: "cover",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: { 
    fontWeight: TYPOGRAPHY.bold, 
    color: COLORS.text, 
    fontSize: TYPOGRAPHY.md 
  },
  qtyValue: {
    marginHorizontal: SPACING.md,
    minWidth: 28,
    textAlign: "center",
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.md,
  },
  name: { 
    fontSize: TYPOGRAPHY.md, 
    fontWeight: TYPOGRAPHY.bold, 
    color: COLORS.text 
  },
  price: { 
    fontSize: TYPOGRAPHY.md, 
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: SPACING.xs + 2,
  },
  summaryLabel: { 
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.md,
  },
  summaryValue: { 
    color: COLORS.text,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
  orText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.sm,
    marginTop: SPACING.md,
    fontWeight: TYPOGRAPHY.medium,
  },
  actionsRow: { 
    flexDirection: "row", 
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionText: { 
    color: COLORS.textInverse, 
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  emptyText: { 
    fontSize: TYPOGRAPHY.xl, 
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.bold,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
});
