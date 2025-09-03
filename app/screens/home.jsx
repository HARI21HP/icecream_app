import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();

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
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contain: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  blurWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  blurContent: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    color: '#f703b6',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e85a71',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
});
