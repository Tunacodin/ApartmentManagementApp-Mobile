import React from 'react';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';

// Font configuration
export const fonts = {
  regular: 'Urbanist-Regular',
  medium: 'Urbanist-Medium',
  light: 'Urbanist-Light',
  extraLight: 'Urbanist-ExtraLight',
  thin: 'Urbanist-Thin',
  bold: 'Urbanist-Bold',
  extraBold: 'Urbanist-ExtraBold',
  black: 'Urbanist-Black',
  semiBold: 'Urbanist-SemiBold',
  italic: 'Urbanist-Italic',
  mediumItalic: 'Urbanist-MediumItalic',
  lightItalic: 'Urbanist-LightItalic',
  extraLightItalic: 'Urbanist-ExtraLightItalic',
  thinItalic: 'Urbanist-ThinItalic',
  boldItalic: 'Urbanist-BoldItalic',
  extraBoldItalic: 'Urbanist-ExtraBoldItalic',
  blackItalic: 'Urbanist-BlackItalic',
  semiBoldItalic: 'Urbanist-SemiBoldItalic',
};

export const theme = {
  ...DefaultTheme,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: fonts.regular,
    },
    medium: {
      fontFamily: fonts.medium,
    },
    light: {
      fontFamily: fonts.light,
    },
    thin: {
      fontFamily: fonts.thin,
    },
    bold: {
      fontFamily: fonts.bold,
    },
    extraBold: {
      fontFamily: fonts.extraBold,
    },
    black: {
      fontFamily: fonts.black,
    },
    semiBold: {
      fontFamily: fonts.semiBold,
    },
    italic: {
      fontFamily: fonts.italic,
    },
    mediumItalic: {
      fontFamily: fonts.mediumItalic,
    },
    lightItalic: {
      fontFamily: fonts.lightItalic,
    },
    extraLightItalic: {
      fontFamily: fonts.extraLightItalic,
    },
    thinItalic: {
      fontFamily: fonts.thinItalic,
    },
    boldItalic: {
      fontFamily: fonts.boldItalic,
    },
    extraBoldItalic: {
      fontFamily: fonts.extraBoldItalic,
    },
    blackItalic: {
      fontFamily: fonts.blackItalic,
    },
    semiBoldItalic: {
      fontFamily: fonts.semiBoldItalic,
    },
  },
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C72CB',
    secondary: '#CB69C1',
    success: '#4FD1C5',
    warning: '#F6AD55',
    error: '#FC8181',
    background: '#1A202C',
    surface: '#2D3748',
    text: '#FFFFFF',
    textSecondary: '#A0AEC0',
  },
  gradients: {
    primary: ['#6C72CB', '#CB69C1'],
    success: ['#4FD1C5', '#68D391'],
    warning: ['#F6AD55', '#F6E05E'],
    danger: ['#FC8181', '#FEB2B2'],
  }
};

const App = () => {
  const [fontsLoaded] = useFonts({
    [fonts.regular]: require('./src/assets/fonts/Urbanist/Urbanist-Regular.ttf'),
    [fonts.medium]: require('./src/assets/fonts/Urbanist/Urbanist-Medium.ttf'),
    [fonts.light]: require('./src/assets/fonts/Urbanist/Urbanist-Light.ttf'),
    [fonts.extraLight]: require('./src/assets/fonts/Urbanist/Urbanist-ExtraLight.ttf'),
    [fonts.thin]: require('./src/assets/fonts/Urbanist/Urbanist-Thin.ttf'),
    [fonts.bold]: require('./src/assets/fonts/Urbanist/Urbanist-Bold.ttf'),
    [fonts.extraBold]: require('./src/assets/fonts/Urbanist/Urbanist-ExtraBold.ttf'),
    [fonts.black]: require('./src/assets/fonts/Urbanist/Urbanist-Black.ttf'),
    [fonts.semiBold]: require('./src/assets/fonts/Urbanist/Urbanist-SemiBold.ttf'),
    [fonts.italic]: require('./src/assets/fonts/Urbanist/Urbanist-Italic.ttf'),
    [fonts.mediumItalic]: require('./src/assets/fonts/Urbanist/Urbanist-MediumItalic.ttf'),
    [fonts.lightItalic]: require('./src/assets/fonts/Urbanist/Urbanist-LightItalic.ttf'),
    [fonts.extraLightItalic]: require('./src/assets/fonts/Urbanist/Urbanist-ExtraLightItalic.ttf'),
    [fonts.thinItalic]: require('./src/assets/fonts/Urbanist/Urbanist-ThinItalic.ttf'),
    [fonts.boldItalic]: require('./src/assets/fonts/Urbanist/Urbanist-BoldItalic.ttf'),
    [fonts.extraBoldItalic]: require('./src/assets/fonts/Urbanist/Urbanist-ExtraBoldItalic.ttf'),
    [fonts.blackItalic]: require('./src/assets/fonts/Urbanist/Urbanist-BlackItalic.ttf'),
    [fonts.semiBoldItalic]: require('./src/assets/fonts/Urbanist/Urbanist-SemiBoldItalic.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <NavigationContainer theme={{
          dark: true,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.surface,
            notification: theme.colors.secondary,
          }
        }}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;
