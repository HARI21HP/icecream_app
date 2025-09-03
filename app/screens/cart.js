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
import { FontAwesome } from "@expo/vector-icons";

export default function CartScreen({ navigation }) {
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
    const subject = encodeURIComponent("New Ice Cream Order");
    const body = encodeURIComponent(buildOrderText());
    const to = "owner@example.com"; // Change to your email
    const url = `mailto:${to}?subject=${subject}&body=${body}`;
    const can = await Linking.canOpenURL(url);

    if (can) {
      await Linking.openURL(url);
      clearCart();
      navigation.navigate("MainTabs", { screen: "Home" });
    } else {
      Alert.alert("Error", "No email app available");
    }
  };

  const handleWhatsApp = async () => {
    const phone = "917418090583"; // Change to your WhatsApp number with country code
    const text = encodeURIComponent(buildOrderText());
    const url = `https://wa.me/${phone}?text=${text}`;
    const can = await Linking.canOpenURL(url);

    if (can) {
      await Linking.openURL(url);
      clearCart();
      navigation.navigate("MainTabs", { screen: "Home" });
    } else {
      Alert.alert("Error", "Unable to open WhatsApp");
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
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
                  >
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => addToCart(item, 1)}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <FontAwesome name="trash" size={20} color="#d11a2a" />
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.summaryCard}>
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
                  style={[styles.summaryValue, { fontWeight: "bold" }]}
                >
                  ₹{getTotalPrice()}
                </Text>
              </View>
              <View style={[styles.actionsRow, { marginTop: 12 }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#e85a71" }]}
                  onPress={handleEmail}
                >
                  <Text style={styles.actionText}>Email Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#25D366" }]}
                  onPress={handleWhatsApp}
                >
                  <Text style={styles.actionText}>WhatsApp Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fdfdfd",
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  image: { width: 64, height: 64, borderRadius: 8, resizeMode: "cover" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: { fontWeight: "bold", color: "#333" },
  qtyValue: {
    marginHorizontal: 10,
    minWidth: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, color: "#555" },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  summaryLabel: { color: "#555" },
  summaryValue: { color: "#111" },
  actionsRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "bold" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 18, color: "#777" },
});
