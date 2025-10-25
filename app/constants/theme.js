// Theme Constants - Vee One Ice Creams - Amazon-Style E-Commerce

export const COLORS = {
  // Primary Colors - Vee One Brand
  primary: '#FF6F61',        // Coral Red - Main Brand Color
  primaryLight: '#FF9B8F',   // Lighter Coral
  primaryDark: '#E5574B',    // Darker Coral
  
  // Accent Colors - Orange Highlights
  accent: '#FFB347',         // Orange - CTA & Highlights
  accentLight: '#FFCC7A',    // Light Orange
  
  // Neutrals - Clean White & Gray
  background: '#FFFFFF',     // Pure White
  backgroundSecondary: '#FFF5E1', // Cream Background
  surface: '#FAFAFA',        // Light Gray Cards
  surfaceDark: '#333333',    // Dark Headers/Footers
  
  // Text
  text: '#333333',           // Primary Text
  textSecondary: '#555555',  // Secondary Text
  textLight: '#888888',      // Light Text
  textMuted: '#AAAAAA',      // Muted/Disabled
  textInverse: '#FFFFFF',    // White on Dark
  
  // Status
  success: '#4CAF50',        // Green
  error: '#f44336',          // Red
  warning: '#FFA726',        // Orange Warning
  info: '#29B6F6',           // Blue Info
  
  // Borders
  border: '#E5E5E5',         // Light Gray Border
  borderLight: '#F0F0F0',    // Very Light Border
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',      // Standard Shadow
  shadowDark: 'rgba(0, 0, 0, 0.2)',  // Darker Shadow
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  // Font Families
  fontPrimary: 'Poppins_400Regular',
  fontPrimaryMedium: 'Poppins_500Medium',
  fontPrimarySemiBold: 'Poppins_600SemiBold',
  fontPrimaryBold: 'Poppins_700Bold',
  fontSecondary: 'Lato_400Regular',
  fontSecondaryBold: 'Lato_700Bold',
  
  // Font Sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  
  // Font Weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ANIMATIONS = {
  spring: {
    damping: 15,
    stiffness: 100,
  },
  springBouncy: {
    damping: 10,
    stiffness: 80,
  },
  timing: {
    duration: 300,
  },
};
