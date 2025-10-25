// screens/screen.js
import React, { useContext, useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  FlatList,
  Dimensions,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartContext } from "../contexts/CartContext";
import { AuthContext } from "../contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BrandHeader from "../components/BrandHeader";
import { ProductsContext } from "../contexts/ProductsContext";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout,
  SlideInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get("window");

// Banner data for carousel
const BANNERS = [
  {
    id: 1,
    title: "🍨 Premium Ice Creams",
    subtitle: "Handcrafted with love",
    colors: ['#FFE5E5', '#FFD1DC'],
  },
  {
    id: 2,
    title: "🎉 Special Offers",
    subtitle: "Up to 25% off on combos",
    colors: ['#FFF5E1', '#FFE4B5'],
  },
  {
    id: 3,
    title: "🌟 New Flavors",
    subtitle: "Taste the difference",
    colors: ['#E8F5E9', '#C8E6C9'],
  },
];

const Screen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { addToCart, cartItems } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const window = useWindowDimensions();
  
  // Debug: Log cart items whenever they change
  useEffect(() => {
    console.log('📦 Cart items updated:', cartItems);
    console.log('📦 Total items in cart:', cartItems.length);
  }, [cartItems]);
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
    ({ item, index }) => {
      const currentQty = quantities[item.id] ?? 1;
      const increase = () =>
        setQuantities((prev) => ({ ...prev, [item.id]: currentQty + 1 }));
      const decrease = () =>
        setQuantities((prev) => ({
          ...prev,
          [item.id]: Math.max(1, currentQty - 1),
        }));

      return (
        <Animated.View 
          entering={FadeInDown.delay(index * 50).springify()}
          layout={Layout.springify()}
          style={styles.card}
        >
          {item.category && (
            <Animated.View 
              entering={ZoomIn.delay(index * 50 + 100)}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>{item.category}</Text>
            </Animated.View>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate("Product", { item })}
            activeOpacity={0.7}
            style={styles.imageContainer}
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
                borderRadius: BORDER_RADIUS.lg,
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
          
          {/* Star Rating */}
          {item.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesome
                    key={star}
                    name={star <= Math.floor(item.rating) ? "star" : star - 0.5 <= item.rating ? "star-half-o" : "star-o"}
                    size={12}
                    color={COLORS.accent}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {item.rating.toFixed(1)} ({item.reviews || 0})
              </Text>
            </View>
          )}
          
          <Text
            style={[
              styles.price,
              { fontSize: Math.max(12, Math.min(14, window.width / 28)) },
            ]}
          >
            ₹{item.price ?? 0}
          </Text>

          <View style={styles.qtyRow}>
            <TouchableOpacity 
              style={styles.qtyButton} 
              onPress={decrease}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{currentQty}</Text>
            <TouchableOpacity 
              style={styles.qtyButton} 
              onPress={increase}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Pressable
            onPress={() => {
              if (!item.inStock) return;
              
              console.log('🔘 Add to Cart button pressed for:', item.name);
              console.log('Item details:', { id: item.id, name: item.name, price: item.price });
              console.log('Quantity:', currentQty);
              
              // Add to cart directly (no login required)
              try {
                const success = addToCart(item, currentQty);
                
                if (success === false) {
                  console.error('❌ AddToCart returned false');
                  Alert.alert("Error", "Failed to add item to cart. Item may be missing an ID.");
                  return;
                }
                
                console.log('✓ Item added successfully');
                
                // Success feedback
                Alert.alert(
                  "✓ Added to Cart", 
                  `${item.name} (Qty: ${currentQty}) has been added to your cart!`,
                  [
                    { 
                      text: "Continue Shopping", 
                      style: "cancel" 
                    },
                    { 
                      text: "View Cart", 
                      onPress: () => navigation.navigate("Cart") 
                    }
                  ]
                );
              } catch (error) {
                console.error('❌ Error adding to cart:', error);
                Alert.alert("Error", "Failed to add item to cart. Please try again.");
              }
            }}
            disabled={!item.inStock}
            style={({ pressed }) => [
              styles.addButton,
              !item.inStock && styles.addButtonDisabled,
              pressed && styles.addButtonPressed,
            ]}
          >
            {({ pressed }) => (
              <>
                <FontAwesome 
                  name={pressed ? "check" : "shopping-cart"} 
                  color="#fff" 
                  size={14} 
                />
                <Text style={styles.addButtonText}>
                  {!item.inStock ? "Out of Stock" : pressed ? "Adding..." : "Add to Cart"}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      );
    },
    [columns, quantities, window.width, user, addToCart, navigation]
  );

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle={"dark-content"} />

      {/* Top section with integrated search */}
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={styles.header}
      >
        <BrandHeader 
          showSearch={true}
          showCart={true}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </Animated.View>

      {/* Banner Carousel */}
      <Animated.View 
        entering={ZoomIn.delay(200).springify()}
        style={styles.carouselContainer}
      >
        <Carousel
          loop
          width={width - SPACING.lg * 2}
          height={140}
          autoPlay={true}
          autoPlayInterval={3000}
          data={BANNERS}
          scrollAnimationDuration={800}
          renderItem={({ item, index }) => (
            <LinearGradient
              colors={item.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              </View>
            </LinearGradient>
          )}
        />
      </Animated.View>

      {/* Categories */}
      <Animated.View 
        entering={SlideInRight.delay(300).springify()}
        style={styles.categoryContainer}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
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
      </Animated.View>

      {/* Filters */}
      <Animated.View 
        entering={FadeInUp.delay(400)}
        style={styles.filtersRow}
      >
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => setSortAsc((s) => !s)}
          activeOpacity={0.7}
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
          activeOpacity={0.7}
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
      </Animated.View>
      
      {/* Featured Products Header */}
      <View style={styles.featuredHeader}>
        <Text style={styles.featuredTitle}>
          {selectedCategory === "All" ? "🌟 All Products" : `${selectedCategory}`}
        </Text>
        <Text style={styles.countText}>{filteredIceCreams.length} items</Text>
      </View>

      {/* Grid */}
      <FlatList
        data={filteredIceCreams}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        numColumns={columns}
        key={columns}
        columnWrapperStyle={columns > 1 ? styles.rowSpacing : undefined}
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? `No results for "${searchQuery}"` 
                : "Try adjusting your filters"}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Screen;

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: { 
    padding: SPACING.md, 
    backgroundColor: COLORS.surface 
  },
  carouselContainer: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: 140,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  bannerContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  bannerSubtitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  input: { 
    flex: 1, 
    color: COLORS.text, 
    padding: SPACING.sm + 2, 
    fontSize: TYPOGRAPHY.md 
  },
  icon: { marginRight: SPACING.sm },
  categoryContainer: { 
    paddingVertical: SPACING.md, 
    paddingHorizontal: SPACING.sm, 
    backgroundColor: COLORS.surface 
  },
  categoryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.sm,
  },
  categoryButtonActive: { 
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryText: { 
    color: COLORS.textLight, 
    fontSize: TYPOGRAPHY.sm, 
    fontWeight: TYPOGRAPHY.semibold 
  },
  categoryTextActive: { color: COLORS.textInverse },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
    ...SHADOWS.sm,
  },
  filterPillActive: { 
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  filterPillText: { 
    marginLeft: SPACING.xs, 
    color: COLORS.text, 
    fontSize: TYPOGRAPHY.xs, 
    fontWeight: TYPOGRAPHY.medium 
  },
  filterPillTextActive: { color: COLORS.textInverse },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  featuredTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  countText: { 
    color: COLORS.textLight, 
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
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
  rowSpacing: { justifyContent: "space-between" },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    margin: SPACING.xs + 2,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  badge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: { 
    color: COLORS.textInverse, 
    fontSize: TYPOGRAPHY.xs, 
    fontWeight: TYPOGRAPHY.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: { 
    color: COLORS.text, 
    fontWeight: TYPOGRAPHY.bold, 
    textAlign: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  price: { 
    color: COLORS.primary, 
    marginVertical: SPACING.xs,
    fontWeight: TYPOGRAPHY.extrabold,
    fontSize: TYPOGRAPHY.lg,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
  },
  qtyButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyButtonText: { 
    color: COLORS.primary, 
    fontSize: TYPOGRAPHY.lg, 
    fontWeight: TYPOGRAPHY.bold 
  },
  qtyValue: { 
    color: COLORS.text, 
    marginHorizontal: SPACING.md + 2,
    fontWeight: TYPOGRAPHY.extrabold,
    fontSize: TYPOGRAPHY.lg,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonPressed: {
    backgroundColor: COLORS.accent,
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: { 
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: { 
    color: '#ffffff', 
    marginLeft: SPACING.sm, 
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    letterSpacing: 0.5,
  },
});
