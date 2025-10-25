import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function GetStartedScreen({ navigation }) {
  // Animation values
  const scaleAnim = useSharedValue(0.8);
  const rotateAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    // Ice cream cone bouncing animation
    scaleAnim.value = withRepeat(
      withSequence(
        withSpring(1, { damping: 8 }),
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 8 })
      ),
      -1,
      true
    );

    // Subtle rotation
    rotateAnim.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Fade in animation
    fadeAnim.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnim.value },
      { rotate: `${rotateAnim.value}deg` }
    ],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.backgroundSecondary, COLORS.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Animated Ice Cream Icon */}
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
              <FontAwesome name="spoon" size={120} color={COLORS.accent} />
            </Animated.View>
            
            {/* Decorative circles */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>

          {/* Content */}
          <Animated.View style={[styles.content, animatedContentStyle]}>
            <Text style={styles.appName}>Vee One</Text>
            <Text style={styles.tagline}>Ice Creams</Text>
            <Text style={styles.description}>
              Premium ice creams delivered to your doorstep{'\n'}
              Browse, shop, and enjoy sweet moments
            </Text>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <FontAwesome name="star" size={20} color={COLORS.accent} />
                <Text style={styles.featureText}>Premium Quality</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome name="bolt" size={20} color={COLORS.accent} />
                <Text style={styles.featureText}>Fast Delivery</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome name="heart" size={20} color={COLORS.accent} />
                <Text style={styles.featureText}>100+ Flavors</Text>
              </View>
            </View>

            {/* Get Started Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('MainApp')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.primary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Get Started</Text>
                <FontAwesome name="arrow-right" size={20} color={COLORS.textInverse} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('MainApp')}>
              <Text style={styles.loginLink}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxl,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapper: {
    zIndex: 10,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: '30%',
    left: '10%',
  },
  circle2: {
    width: 150,
    height: 150,
    top: '15%',
    right: '15%',
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: '20%',
    right: '20%',
  },
  content: {
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  appName: {
    fontSize: TYPOGRAPHY.xxxl + 8,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 105, 180, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  featureItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featureText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.medium,
  },
  button: {
    width: '100%',
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  loginLinkBold: {
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.bold,
  },
});
