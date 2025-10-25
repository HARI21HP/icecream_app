import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { CartContext } from '../contexts/CartContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

export default function BrandHeader({ 
  showSearch = false, 
  showCart = true,
  onSearchChange = null,
  searchValue = '',
}) {
  const navigation = useNavigation();
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);

  // Debug: Log cart count
  useEffect(() => {
    console.log('🛒 BrandHeader - Cart count:', cartCount);
    console.log('🛒 BrandHeader - Cart items:', cartItems);
  }, [cartCount, cartItems]);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
  }, [logoOpacity, logoScale]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Top bar with logo and cart */}
      <View style={styles.topBar}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <Text style={styles.logo}>Vee One</Text>
          <Text style={styles.tagline}>Ice Creams</Text>
        </Animated.View>

        {showCart && (
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.7}
          >
            <FontAwesome name="shopping-cart" size={24} color={COLORS.text} />
            {cartCount > 0 && (
              <Animated.View 
                entering={FadeInDown.springify()}
                style={styles.cartBadge}
              >
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Search bar */}
      {showSearch && (
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.searchContainer}
        >
          <FontAwesome name="search" size={18} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for ice creams..."
            placeholderTextColor={COLORS.textLight}
            value={searchValue}
            onChangeText={onSearchChange}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingTop: SPACING.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  logoContainer: {
    flexDirection: 'column',
  },
  logo: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.extrabold,
    letterSpacing: 1,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  cartButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
  },
});
