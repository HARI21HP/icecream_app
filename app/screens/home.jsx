import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  withTiming,
  Easing 
} from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function Home() {
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    // Trigger animations on mount
    fadeAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
    scaleAnim.value = withDelay(200, withSpring(1, { damping: 12 }));
  }, [fadeAnim, slideAnim, scaleAnim]);

  const animatedBlurStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      { translateY: slideAnim.value },
      { scale: scaleAnim.value }
    ],
  }));

  return (
    <SafeAreaView style={styles.contain} edges={['left', 'right']}>
      <StatusBar style="light" />

      <ImageBackground
        source={require('../../assets/icecream.png')}
        style={styles.image}
        resizeMode="cover"
      >
        {/* Bottom Blurred Content */}
        <View style={styles.blurWrapper}>
          <Animated.View style={animatedBlurStyle}>
            <BlurView intensity={50} tint="dark" style={styles.blurContent}>
              <Text style={styles.title}>
                Your favorite{'\n'}flavors, just a tap away
              </Text>
              <Text style={styles.subtitle}>
                Welcome! Life is better with ice cream, and we're here to prove it.
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Shop')}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contain: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  blurWrapper: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  blurContent: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.xxxl,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.extrabold,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 48,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
    paddingHorizontal: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl + SPACING.md,
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.lg,
    letterSpacing: 0.3,
  },
});
