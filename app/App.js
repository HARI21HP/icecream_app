// App.js
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome } from "@expo/vector-icons";

import Screen from "./screens/screen";
import Home from "./screens/home";
import Cart from "./screens/cart";
import Product from "./screens/product";

import { CartProvider } from "./contexts/CartContext";
import { ProductsProvider } from "./contexts/ProductsContext";

// ---- Theme ----
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",
    card: "#ffffff",
    text: "#111111",
    border: "#eeeeee",
    primary: "#e85a71",
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#e85a71",
        tabBarInactiveTintColor: "#999999",
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "#eeeeee" },
        tabBarIcon: ({ color, size }) => {
          let iconName = "circle";
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Shop") iconName = "list";
          else if (route.name === "Cart") iconName = "shopping-cart";
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarStyle: { display: 'none' } }}
      />
      <Tab.Screen name="Shop" component={Screen} />
      <Tab.Screen name="Cart" component={Cart} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProductsProvider>
          <CartProvider>
            <NavigationContainer theme={AppTheme}>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="Shop" component={Screen} />
                <Stack.Screen
                  name="Product"
                  component={Product}
                  options={{ headerShown: true, title: "Details" }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </CartProvider>
        </ProductsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
