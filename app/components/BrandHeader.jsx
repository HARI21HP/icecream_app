import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BrandHeader({ title = 'VEE ONE', subtitle = 'Discover your flavor' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#f703b6',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(247,3,182,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  accent: {
    marginTop: 6,
    height: 4,
    width: 80,
    borderRadius: 4,
    backgroundColor: '#e85a71',
  },
});


