import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const Delivery = () => {
  return (
    <Animated.View 
      entering={FadeInDown.duration(600)}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <FontAwesome name="truck" size={32} color="#e85a71" />
      </View>
      <Text style={styles.title}>Fast Delivery</Text>
      <Text style={styles.description}>
        We deliver fresh ice cream right to your doorstep
      </Text>
    </Animated.View>
  );
};

export default Delivery;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    margin: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef2f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});