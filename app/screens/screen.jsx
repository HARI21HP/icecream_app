// screens/screen.js
import React, { useContext, useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartContext } from "../contexts/CartContext";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BrandHeader from "../components/BrandHeader";
import { ProductsContext } from "../contexts/ProductsContext";

const { width } = Dimensions.get("window");

const Screen = () => {
  const navigation = useNavigation();
  const { addToCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const window = useWindowDimensions();
  const columns = window.width > 520 ? 3 : window.width < 340 ? 1 : 2;

  const { products } = useContext(ProductsContext);
  const iceCreams = products || [];

  const categories = useMemo(() => {
    const unique = Array.from(new Set(iceCreams.map((p) => p.category).filter(Boolean)));
    return ["All", ...unique];
  }, [iceCreams]);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredIceCreams = useMemo(() => {
    let list =
      selectedCategory === "All"
        ? iceCreams
        : iceCreams.filter((p) => p.category === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }
    if (hideOutOfStock) {
      list = list.filter((p) => p.inStock);
    }
    return [...list].sort((a, b) =>
      sortAsc ? a.price - b.price : b.price - a.price
    );
  }, [iceCreams, selectedCategory, searchQuery, sortAsc, hideOutOfStock]);

  const renderItem = useCallback(
    ({ item }) => {
      const currentQty = quantities[item.id] ?? 1;
      const increase = () =>
        setQuantities((prev) => ({ ...prev, [item.id]: currentQty + 1 }));
      const decrease = () =>
        setQuantities((prev) => ({
          ...prev,
          [item.id]: Math.max(1, currentQty - 1),
        }));

      return (
        <View style={styles.card}>
          {item.category && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate("Product", { item })}
          >
            <Image
              source={
                item.imageUrl
                  ? { uri: item.imageUrl }
                  : item.image
                  ? item.image
                  : require("../../assets/icecream.png")
              }
              style={{
                width:
                  columns === 3 ? window.width * 0.22 : window.width * 0.3,
                height:
                  columns === 3 ? window.width * 0.22 : window.width * 0.3,
                resizeMode: item.imageUrl ? "cover" : "contain",
                borderRadius: 10,
              }}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.name,
              {
                fontSize: Math.max(
                  14,
                  Math.min(16, window.width / 26)
                ),
              },
            ]}
          >
            {item.name || "Unnamed"}
          </Text>
          <Text
            style={[
              styles.price,
              { fontSize: Math.max(12, Math.min(14, window.width / 28)) },
            ]}
          >
            ₹{item.price ?? 0}
          </Text>

          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyButton} onPress={decrease}>
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{currentQty}</Text>
            <TouchableOpacity style={styles.qtyButton} onPress={increase}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              !item.inStock && styles.addButtonDisabled,
            ]}
            disabled={!item.inStock}
            onPress={() => {
              if (!item.inStock) return;
              addToCart(item, currentQty);
              Alert.alert("Success", "Added to your cart successfully");
            }}
          >
            <FontAwesome name="plus" color="#fff" size={14} />
            <Text style={styles.addButtonText}>
              {item.inStock ? "Add to Cart" : "Out of stock"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    },
    [columns, quantities, window.width]
  );

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle={"dark-content"} />

      {/* Top section */}
      <View style={[styles.header, styles.headerSafeTop]}>
        <BrandHeader subtitle="Discover your flavor" />

        <View style={styles.searchBox}>
          <FontAwesome
            name="search"
            size={20}
            color="#888"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search ice cream"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => setSortAsc((s) => !s)}
        >
          <FontAwesome
            name={sortAsc ? "sort-amount-asc" : "sort-amount-desc"}
            size={14}
            color="#333"
          />
          <Text style={styles.filterPillText}>
            {sortAsc ? "Price: Low to High" : "Price: High to Low"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, hideOutOfStock && styles.filterPillActive]}
          onPress={() => setHideOutOfStock((v) => !v)}
        >
          <FontAwesome
            name={hideOutOfStock ? "eye-slash" : "eye"}
            size={14}
            color={hideOutOfStock ? "#fff" : "#333"}
          />
          <Text
            style={[
              styles.filterPillText,
              hideOutOfStock && styles.filterPillTextActive,
            ]}
          >
            {hideOutOfStock ? "Hidden Out of Stock" : "Hide Out of Stock"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.countText}>{filteredIceCreams.length} items</Text>

      {/* Grid */}
      <FlatList
        data={filteredIceCreams}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.rowSpacing : undefined}
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default Screen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  header: { padding: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  input: { flex: 1, color: "#111", padding: 8 },
  icon: { marginRight: 8 },
  categoryContainer: { paddingVertical: 10, paddingHorizontal: 5 },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f3f3f3",
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryButtonActive: { backgroundColor: "#e85a71" },
  categoryText: { color: "#666", fontSize: 14 },
  categoryTextActive: { color: "#fff" },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginRight: 5,
  },
  filterPillActive: { backgroundColor: "#e85a71" },
  filterPillText: { marginLeft: 4, color: "#333", fontSize: 12 },
  filterPillTextActive: { color: "#fff" },
  countText: { color: "#666", paddingHorizontal: 10, marginBottom: 5 },
  rowSpacing: { justifyContent: "space-between" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 8,
    margin: 5,
    alignItems: "center",
    flex: 1,
  },
  badge: {
    backgroundColor: "#e85a71",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 5,
  },
  badgeText: { color: "#fff", fontSize: 10 },
  name: { color: "#111", fontWeight: "bold", textAlign: "center" },
  price: { color: "#666", marginVertical: 2 },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  qtyButton: {
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  qtyButtonText: { color: "#111", fontSize: 16 },
  qtyValue: { color: "#111", marginHorizontal: 10 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e85a71",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  addButtonDisabled: { backgroundColor: "#ccc" },
  addButtonText: { color: "#fff", marginLeft: 5, fontSize: 12 },
});
