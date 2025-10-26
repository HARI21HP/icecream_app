import React, { useContext, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { ProductsContext } from '../contexts/ProductsContext';
import { CartContext } from '../contexts/CartContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getImageSource } from '../constants/images';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.md * 2;

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { favorites, toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { products } = useContext(ProductsContext);
  const { addToCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});

  // Filter products to show only favorites
  const favoriteProducts = useMemo(() => {
    return products.filter(product => isFavorite(product.id));
  }, [products, favorites]);

  const handleQuantityChange = useCallback((id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  }, []);

  const handleAddToCart = useCallback((item) => {
    const quantity = quantities[item.id] || 1;
    const success = addToCart(item, quantity);
    
    if (success) {
      Alert.alert(
        "✓ Added to Cart",
        `${item.name} (Qty: ${quantity}) has been added to your cart!`,
        [
          { text: "Continue", style: "cancel" },
          { 
            text: "View Cart", 
            onPress: () => navigation.navigate("MainApp", { screen: "Cart" })
          }
        ]
      );
    } else {
      Alert.alert("Error", "Failed to add item to cart.");
    }
  }, [quantities, addToCart, navigation]);

  const handleRemoveFavorite = useCallback((productId, productName) => {
    Alert.alert(
      "Remove Favorite",
      `Remove ${productName} from favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => toggleFavorite(productId, productName)
        }
      ]
    );
  }, [toggleFavorite]);

  const renderFavoriteItem = useCallback(({ item, index }) => {
    const currentQty = quantities[item.id] || 1;

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()}
        style={styles.card}
      >
        {/* Product Image */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Product', { item })}
          activeOpacity={0.8}
        >
          <Image
            source={getImageSource(item.imageUrl || item.image)}
            style={styles.productImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Remove Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveFavorite(item.id, item.name)}
          activeOpacity={0.7}
        >
          <Text style={styles.favoriteIcon}>🍦</Text>
        </TouchableOpacity>

        {/* Product Details */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          
          {item.description && (
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.rating || 4.5} ({item.reviews || 0} reviews)
            </Text>
          </View>

          <Text style={styles.price}>₹{item.price}</Text>

          {/* Quantity Controls */}
          <View style={styles.quantityRow}>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={() => handleQuantityChange(item.id, -1)}
                style={styles.qtyButton}
                activeOpacity={0.7}
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyText}>{currentQty}</Text>

              <TouchableOpacity
                onPress={() => handleQuantityChange(item.id, 1)}
                style={styles.qtyButton}
                activeOpacity={0.7}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !item.inStock && styles.addToCartButtonDisabled
              ]}
              onPress={() => handleAddToCart(item)}
              disabled={!item.inStock}
              activeOpacity={0.8}
            >
              <FontAwesome 
                name="shopping-cart" 
                size={16} 
                color="#fff" 
                style={{ marginRight: 6 }}
              />
              <Text style={styles.addToCartText}>
                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }, [quantities, handleQuantityChange, handleAddToCart, handleRemoveFavorite, navigation]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💔</Text>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyText}>
        Start adding your favorite ice creams by tapping the 🍦 icon on products!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('MainApp', { screen: 'Shop' })}
        activeOpacity={0.8}
      >
        <Text style={styles.shopButtonText}>Browse Ice Creams</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>{favoriteProducts.length}</Text>
        </View>
      </View>

      {/* Favorites List */}
      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
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
    paddingVertical: SPACING.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  backButton: {
    padding: SPACING.xs,
    width: 40,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    color: '#fff',
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  listContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.border,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  productInfo: {
    padding: SPACING.md,
  },
  productName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  price: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  qtyButton: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  qtyText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  addToCartText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
  },
});
