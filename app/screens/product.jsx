// screens/product.js
import React, { useEffect, useState, useContext } from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  Easing,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { FontAwesome } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { CartContext } from "../contexts/CartContext";

const { width } = Dimensions.get("window");

export default function Details({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  
  // Animation values
  const imageScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    imageScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    contentOpacity.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [imageScale, contentOpacity]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

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
        { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: COLORS.surfaceDark },
      ]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <Image source={item.image} style={styles.image} resizeMode="cover" />
          )}
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.detailsCard}
        >
          {item.category && (
            <Animated.View 
              entering={ZoomIn.delay(400)}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>{item.category}</Text>
            </Animated.View>
          )}
          
          <Text style={styles.name}>{item.name}</Text>
          
          {/* Star Rating Display */}
          {item.rating && (
            <View style={styles.ratingSection}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesome
                    key={star}
                    name={star <= Math.floor(item.rating) ? "star" : star - 0.5 <= item.rating ? "star-half-o" : "star-o"}
                    size={20}
                    color={COLORS.accent}
                    style={{ marginRight: 4 }}
                  />
                ))}
              </View>
              <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
              <Text style={styles.reviewsCount}>({item.reviews || 0} reviews)</Text>
            </View>
          )}
          
          <View style={styles.priceRow}>
            <FontAwesome name="rupee" size={24} color="#e85a71" />
            <Text style={styles.price}>{item.price}</Text>
          </View>

          {item.inStock !== undefined && (
            <View style={[styles.stockBadge, item.inStock ? styles.inStock : styles.outOfStock]}>
              <FontAwesome 
                name={item.inStock ? "check-circle" : "times-circle"} 
                size={14} 
                color={item.inStock ? "#4CAF50" : "#f44336"} 
              />
              <Text style={[styles.stockText, { color: item.inStock ? "#4CAF50" : "#f44336" }]}>
                {item.inStock ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.desc}>
            {item.desc || `A delicious ${item.name} ice cream. Smooth, creamy and perfect for any day. Enjoy this delightful treat!`}
          </Text>

          {/* Ingredients Section */}
          {item.ingredients && item.ingredients.length > 0 && (
            <>
              <Text style={styles.descLabel}>Ingredients</Text>
              <View style={styles.ingredientsContainer}>
                {item.ingredients.map((ingredient, idx) => (
                  <View key={idx} style={styles.ingredientTag}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.descLabel}>Quantity</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
              >
                <FontAwesome name="minus" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => setQuantity(quantity + 1)}
                activeOpacity={0.7}
              >
                <FontAwesome name="plus" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.addToCartButton} 
              onPress={() => {
                if (!item.inStock) return;
                addToCart(item, quantity);
                Alert.alert(
                  "✓ Added to Cart", 
                  `${item.name} (Qty: ${quantity}) added to cart!`,
                  [
                    { text: "Continue Shopping", onPress: () => navigation.goBack() },
                    { text: "View Cart", onPress: () => navigation.navigate("Cart") }
                  ]
                );
              }}
              disabled={!item.inStock}
              activeOpacity={0.8}
            >
              <FontAwesome name="shopping-cart" size={18} color="#fff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buyNowButton} 
              onPress={() => {
                if (!item.inStock) return;
                addToCart(item, quantity);
                navigation.navigate("Cart");
              }}
              disabled={!item.inStock}
              activeOpacity={0.8}
            >
              <FontAwesome name="bolt" size={18} color="#fff" />
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <FontAwesome name="arrow-left" size={16} color="#fff" />
            <Text style={styles.buttonText}>Back to Shop</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.surfaceDark 
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  imageContainer: {
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  image: { 
    width: width * 0.7, 
    height: width * 0.7, 
    borderRadius: BORDER_RADIUS.lg,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#1a1b1f",
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  badgeText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
  },
  name: { 
    fontSize: TYPOGRAPHY.xxl + 4, 
    fontWeight: TYPOGRAPHY.extrabold, 
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  ratingValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.accent,
    marginRight: SPACING.xs,
  },
  reviewsCount: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.medium,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  price: { 
    fontSize: TYPOGRAPHY.xxxl, 
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.bold,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: "flex-start",
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
  },
  inStock: {
    backgroundColor: "rgba(0, 184, 148, 0.15)",
  },
  outOfStock: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
  },
  stockText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2b2f",
    marginVertical: SPACING.md,
  },
  descLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
  },
  desc: { 
    fontSize: TYPOGRAPHY.md, 
    color: COLORS.textMuted, 
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  ingredientTag: {
    backgroundColor: 'rgba(255, 111, 97, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  ingredientText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.medium,
  },
  quantitySection: {
    marginBottom: SPACING.xl,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2024',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    backgroundColor: COLORS.surface,
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
    marginHorizontal: SPACING.xl,
    minWidth: 40,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  addToCartText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: '#fff',
  },
  buyNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  buyNowText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: '#fff',
  },
  button: { 
    backgroundColor: COLORS.primary, 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm + 2,
    ...SHADOWS.md,
  },
  buttonText: { 
    color: COLORS.textInverse, 
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.md,
  },
});
