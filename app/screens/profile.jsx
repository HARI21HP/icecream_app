import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AuthContext } from '../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Admin email - must match the one in admin.jsx
const ADMIN_EMAIL = 'hariprakashpc@gmail.com';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfilePicture } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkIfAdmin();
  }, [user]);

  const checkIfAdmin = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      // Check if user email matches admin email (case-insensitive)
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
        return;
      }

      // Also check Firestore for admin role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const pickImage = async () => {
    try {
      // Show action sheet to choose between camera and gallery
      Alert.alert(
        'Update Profile Picture',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission Denied', 'Camera permission is required to take photos');
                  return;
                }
                await launchCamera();
              } catch (error) {
                console.error('Error in Take Photo:', error);
                Alert.alert('Error', error.message);
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission Denied', 'Gallery permission is required to choose photos');
                  return;
                }
                await launchGallery();
              } catch (error) {
                console.error('Error in Choose from Gallery:', error);
                Alert.alert('Error', error.message);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error in pickImage:', error);
      Alert.alert('Error', error.message);
    }
  };

  const launchCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error in launchCamera:', error);
      Alert.alert('Error', error.message);
    }
  };

  const launchGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error in launchGallery:', error);
      Alert.alert('Error', error.message);
    }
  };

  const uploadProfileImage = async (imageUri) => {
    setUploading(true);
    try {
      const updateResult = await updateProfilePicture(imageUri);

      if (updateResult.success) {
        Alert.alert('✓ Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', updateResult.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View 
          entering={ZoomIn.duration(600).springify()}
          style={styles.emptyContainer}
        >
          <FontAwesome name="user-circle" size={80} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Not logged in</Text>
          <Text style={styles.emptySubtext}>Create an account to access your profile</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={ZoomIn.duration(600).springify()}
          style={styles.profileHeader}
        >
          <TouchableOpacity
            style={styles.profilePicContainer}
            onPress={pickImage}
            disabled={uploading}
            activeOpacity={0.8}
          >
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profilePic} />
            ) : (
              <View style={styles.profilePicPlaceholder}>
                <FontAwesome name="user" size={50} color={COLORS.textMuted} />
              </View>
            )}
            <View
              style={styles.cameraBadge}
              pointerEvents="none"
            >
              {uploading ? (
                <ActivityIndicator size="small" color={COLORS.textInverse} />
              ) : (
                <FontAwesome name="camera" size={16} color={COLORS.textInverse} />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.infoCard}
        >
          <View style={styles.infoRow}>
            <FontAwesome name="envelope" size={20} color={COLORS.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <FontAwesome name="user" size={20} color={COLORS.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Display Name</Text>
              <Text style={styles.infoValue}>{user.displayName || 'Not set'}</Text>
            </View>
          </View>

          {user.createdAt && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <FontAwesome name="calendar" size={20} color={COLORS.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.actionsCard}
        >
          {isAdmin && (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => navigation.navigate('Admin')}
                activeOpacity={0.7}
              >
                <FontAwesome name="database" size={20} color={COLORS.accent} />
                <Text style={styles.actionText}>Admin Panel</Text>
                <FontAwesome name="chevron-right" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              <View style={styles.divider} />
            </>
          )}

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Addresses')}
            activeOpacity={0.7}
          >
            <FontAwesome name="map-marker" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>My Addresses</Text>
            <FontAwesome name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderHistory')}
            activeOpacity={0.7}
          >
            <FontAwesome name="shopping-bag" size={20} color={COLORS.accent} />
            <Text style={styles.actionText}>Order History</Text>
            <FontAwesome name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Favorites')}
            activeOpacity={0.7}
          >
            <FontAwesome name="heart" size={20} color="#FF6B6B" />
            <Text style={styles.actionText}>My Favorites</Text>
            <FontAwesome name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <FontAwesome name="cog" size={20} color={COLORS.text} />
            <Text style={styles.actionText}>Settings</Text>
            <FontAwesome name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <FontAwesome name="sign-out" size={20} color={COLORS.textInverse} />
            <Text style={styles.logoutButtonText}>Logout</Text>
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
  scrollContent: {
    padding: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.xl,
    color: COLORS.textLight,
    marginTop: SPACING.md,
    fontWeight: TYPOGRAPHY.semibold,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  profilePicContainer: {
    marginBottom: SPACING.md,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
  profilePicPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.background,
    ...SHADOWS.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.medium,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.medium,
    marginBottom: SPACING.xs / 2,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.semibold,
  },
  actionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  actionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.semibold,
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  logoutButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  loginButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
  adminButtonGuest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  adminButtonGuestText: {
    color: COLORS.accent,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
});
