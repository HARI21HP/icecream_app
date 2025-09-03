// screens/product.js
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function Details({ route, navigation }) {
  const insets = useSafeAreaInsets();

  // Fallback item if no params are passed
  const item = route?.params?.item || {
    name: "Unknown Item",
    price: 0,
    desc: "No details available.",
    image: require("../../assets/icecream.png"),
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: "#0e0f13" },
      ]}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      )}

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{`₹${item.price}`}</Text>
      <Text style={styles.desc}>
        {item.desc || `A delicious ${item.name} ice cream. Smooth, creamy and perfect for any day.`}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  image: { width: width * 0.6, height: width * 0.6, borderRadius: 10 },
  name: { fontSize: 22, fontWeight: "bold", marginVertical: 10, color: "#fff" },
  price: { fontSize: 18, marginBottom: 12, color: "#ccc" },
  desc: { fontSize: 14, color: "#aaa", textAlign: "center", paddingHorizontal: 16, marginBottom: 20 },
  button: { backgroundColor: "tomato", padding: 10, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
