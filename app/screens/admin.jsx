import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { seedProducts } from '../scripts/seedProducts';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function AdminScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeedProducts = async () => {
    Alert.alert(
      'Seed Products',
      'This will add 12 ice cream products to your Firestore database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Database',
          onPress: async () => {
            setLoading(true);
            const result = await seedProducts();
            setLoading(false);

            if (result.success) {
              setSeeded(true);
              Alert.alert(
                'Success!',
                `Successfully added ${result.count} products to Firestore.`,
                [{ text: 'OK' }]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to seed products');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <View style={styles.header}>
            <FontAwesome name="database" size={60} color={COLORS.primary} />
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>Manage your ice cream database</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.infoSection}>
              <FontAwesome name="info-circle" size={24} color={COLORS.accent} />
              <Text style={styles.infoText}>
                Seed the database with 12 delicious ice cream products
              </Text>
            </View>

            <View style={styles.features}>
              <View style={styles.feature}>
                <FontAwesome name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.featureText}>Product names & descriptions</Text>
              </View>
              <View style={styles.feature}>
                <FontAwesome name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.featureText}>Prices & ratings</Text>
              </View>
              <View style={styles.feature}>
                <FontAwesome name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.featureText}>Categories & variants</Text>
              </View>
              <View style={styles.feature}>
                <FontAwesome name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.featureText}>Stock status & images</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, seeded && styles.buttonSeeded]}
              onPress={handleSeedProducts}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textInverse} />
              ) : (
                <>
                  <FontAwesome
                    name={seeded ? "check" : "database"}
                    size={20}
                    color={COLORS.textInverse}
                  />
                  <Text style={styles.buttonText}>
                    {seeded ? 'Products Seeded ✓' : 'Seed Products to Firestore'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {seeded && (
              <View style={styles.successBanner}>
                <FontAwesome name="check-circle" size={24} color={COLORS.success} />
                <Text style={styles.successText}>
                  Database seeded successfully! Products are now available in your app.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={18} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Back to Shop</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.medium,
  },
  features: {
    marginBottom: SPACING.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  buttonSeeded: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  successText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.semibold,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    padding: SPACING.md,
  },
  backButtonText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
