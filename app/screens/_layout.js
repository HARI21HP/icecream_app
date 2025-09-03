import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './navigation'; 
import { CartProvider } from './contexts/CartContext';
import { ProductsProvider } from './contexts/ProductsContext';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProductsProvider>
          <CartProvider>
            <RootNavigation />
          </CartProvider>
        </ProductsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
