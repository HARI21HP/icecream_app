// App.js
import React, { useContext, useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

import Screen from "./screens/screen";
import Home from "./screens/home";
import Cart from "./screens/cart";
import Product from "./screens/product";
import LoginScreen from "./screens/login";
import RegisterScreen from "./screens/register";
import ProfileScreen from "./screens/profile";
import AdminScreen from "./screens/admin";
import AddressesScreen from "./screens/addresses";
import CheckoutScreen from "./screens/checkout";
import OrderHistoryScreen from "./screens/orderHistory";
import OrderTrackingScreen from "./screens/orderTracking";
import FavoritesScreen from "./screens/favorites";

import { CartProvider } from "./contexts/CartContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { COLORS, SPACING, TYPOGRAPHY } from './constants/theme';

// ---- Theme ----
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Shop"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { 
          backgroundColor: COLORS.surface, 
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: SPACING.sm,
          paddingTop: SPACING.sm,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.xs,
          fontWeight: TYPOGRAPHY.semibold,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = "circle";
          if (route.name === "Shop") iconName = "list";
          else if (route.name === "Cart") iconName = "shopping-cart";
          else if (route.name === "Profile") iconName = "user";
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Shop" component={Screen} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack for login/register - No longer used as separate stack
// Auth screens are now modals in the main navigation

// Main navigation with conditional rendering based on auth state
function Navigation() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator 
        initialRouteName="MainApp"
        screenOptions={{ 
          headerShown: false,
          animation: "slide_from_right",
          presentation: "card",
        }}
      >
        {/* Main App - Always accessible, now the initial route */}
        <Stack.Screen name="MainApp" component={MainTabs} />
        <Stack.Screen name="Shop" component={Screen} />
        <Stack.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{ 
            headerShown: true, 
            title: "Admin Panel",
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.textInverse,
            headerTitleStyle: {
              fontWeight: TYPOGRAPHY.bold,
              fontSize: TYPOGRAPHY.lg,
            },
          }}
        />
        <Stack.Screen
          name="Product"
          component={Product}
          options={{ 
            headerShown: true, 
            title: "Product Details",
            headerStyle: {
              backgroundColor: COLORS.surfaceDark,
            },
            headerTintColor: COLORS.textInverse,
            headerTitleStyle: {
              fontWeight: TYPOGRAPHY.bold,
              fontSize: TYPOGRAPHY.lg,
            },
            animation: "slide_from_bottom",
          }}
        />
        
        <Stack.Screen
          name="Addresses"
          component={AddressesScreen}
          options={{ 
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ 
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistoryScreen}
          options={{ 
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        
        <Stack.Screen
          name="OrderTracking"
          component={OrderTrackingScreen}
          options={{ 
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ 
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        
        {/* Auth screens - shown when needed */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Return nothing while fonts are loading
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ProductsProvider>
            <FavoritesProvider>
              <CartProvider>
                <Navigation />
              </CartProvider>
            </FavoritesProvider>
          </ProductsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
