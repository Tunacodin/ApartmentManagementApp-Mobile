import React from 'react';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';

// Font configuration
export const fonts = {
  // Urbanist Font Family
  urbanist: {
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
  },
  // Questrial Font Family
  questrial: {
    regular: 'Questrial-Regular',
  },
  // AfacadFlux Font Family
  afacadFlux: {
    regular: 'AfacadFlux-Regular',
    medium: 'AfacadFlux-Medium',
    light: 'AfacadFlux-Light',
    extraLight: 'AfacadFlux-ExtraLight',
    thin: 'AfacadFlux-Thin',
    bold: 'AfacadFlux-Bold',
    extraBold: 'AfacadFlux-ExtraBold',
    black: 'AfacadFlux-Black',
    semiBold: 'AfacadFlux-SemiBold',
  },
  // San Francisco Font Family
  sanFrancisco: {
    // Display variants
    displayRegular: 'SF-Pro-Display-Regular',
    displayMedium: 'SF-Pro-Display-Medium',
    displayLight: 'SF-Pro-Display-Light',
    displayThin: 'SF-Pro-Display-Thin',
    displayBold: 'SF-Pro-Display-Bold',
    displaySemibold: 'SF-Pro-Display-Semibold',
    displayHeavy: 'SF-Pro-Display-Heavy',
    displayBlack: 'SF-Pro-Display-Black',
    displayUltralight: 'SF-Pro-Display-Ultralight',
    // Display Italic variants
    displayRegularItalic: 'SF-Pro-Display-RegularItalic',
    displayMediumItalic: 'SF-Pro-Display-MediumItalic',
    displayLightItalic: 'SF-Pro-Display-LightItalic',
    displayThinItalic: 'SF-Pro-Display-ThinItalic',
    displayBoldItalic: 'SF-Pro-Display-BoldItalic',
    displaySemiboldItalic: 'SF-Pro-Display-SemiboldItalic',
    displayHeavyItalic: 'SF-Pro-Display-HeavyItalic',
    displayBlackItalic: 'SF-Pro-Display-BlackItalic',
    displayUltralightItalic: 'SF-Pro-Display-UltralightItalic',
    // Text variants
    textRegular: 'SF-Pro-Text-Regular',
    textMedium: 'SF-Pro-Text-Medium',
    textLight: 'SF-Pro-Text-Light',
    textThin: 'SF-Pro-Text-Thin',
    textBold: 'SF-Pro-Text-Bold',
    textSemibold: 'SF-Pro-Text-Semibold',
    textHeavy: 'SF-Pro-Text-Heavy',
    textBlack: 'SF-Pro-Text-Black',
    textUltralight: 'SF-Pro-Text-Ultralight',
    // Text Italic variants
    textRegularItalic: 'SF-Pro-Text-RegularItalic',
    textMediumItalic: 'SF-Pro-Text-MediumItalic',
    textLightItalic: 'SF-Pro-Text-LightItalic',
    textThinItalic: 'SF-Pro-Text-ThinItalic',
    textBoldItalic: 'SF-Pro-Text-BoldItalic',
    textSemiboldItalic: 'SF-Pro-Text-SemiboldItalic',
    textHeavyItalic: 'SF-Pro-Text-HeavyItalic',
    textBlackItalic: 'SF-Pro-Text-BlackItalic',
    textUltralightItalic: 'SF-Pro-Text-UltralightItalic',
    // Rounded variants
    roundedRegular: 'SF-Pro-Rounded-Regular',
    roundedMedium: 'SF-Pro-Rounded-Medium',
    roundedLight: 'SF-Pro-Rounded-Light',
    roundedThin: 'SF-Pro-Rounded-Thin',
    roundedBold: 'SF-Pro-Rounded-Bold',
    roundedSemibold: 'SF-Pro-Rounded-Semibold',
    roundedHeavy: 'SF-Pro-Rounded-Heavy',
    roundedBlack: 'SF-Pro-Rounded-Black',
    roundedUltralight: 'SF-Pro-Rounded-Ultralight',
  },
  // Prompt Font Family
  prompt: {
    regular: 'Prompt-Regular',
    medium: 'Prompt-Medium',
    light: 'Prompt-Light',
    thin: 'Prompt-Thin',
    bold: 'Prompt-Bold',
    semiBold: 'Prompt-SemiBold',
    italic: 'Prompt-Italic',
    mediumItalic: 'Prompt-MediumItalic',
    lightItalic: 'Prompt-LightItalic',
    thinItalic: 'Prompt-ThinItalic',
    boldItalic: 'Prompt-BoldItalic',
    semiBoldItalic: 'Prompt-SemiBoldItalic',
  },
  // Playwrite GB S Font Family
  playwrite: {
    regular: 'PlaywriteGBS-Variable',
    italic: 'PlaywriteGBS-Italic-Variable',
  },
  // Bodoni Moda Font Family
  bodoniModa: {
    regular: 'BodoniModa-Variable',
    italic: 'BodoniModa-Italic-Variable',
  },
  // Anton Font Family
  anton: {
    regular: 'Anton-Regular',
  },
  // Abril Fatface Font Family
  abrilFatface: {
    regular: 'AbrilFatface-Regular',
  },
  // Poppins Font Family
  poppins: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    light: 'Poppins-Light',
    thin: 'Poppins-Thin',
    bold: 'Poppins-Bold',
    semiBold: 'Poppins-SemiBold',
    extraBold: 'Poppins-ExtraBold',
    black: 'Poppins-Black',
    italic: 'Poppins-Italic',
    mediumItalic: 'Poppins-MediumItalic',
    lightItalic: 'Poppins-LightItalic',
    thinItalic: 'Poppins-ThinItalic',
    boldItalic: 'Poppins-BoldItalic',
    semiBoldItalic: 'Poppins-SemiBoldItalic',
    extraBoldItalic: 'Poppins-ExtraBoldItalic',
    blackItalic: 'Poppins-BlackItalic',
  },
  // Lato Font Family
  lato: {
    regular: 'Lato-Regular',
    light: 'Lato-Light',
    thin: 'Lato-Thin',
    bold: 'Lato-Bold',
    black: 'Lato-Black',
    italic: 'Lato-Italic',
    lightItalic: 'Lato-LightItalic',
    thinItalic: 'Lato-ThinItalic',
    boldItalic: 'Lato-BoldItalic',
    blackItalic: 'Lato-BlackItalic',
  },
};

export const theme = {
  ...DefaultTheme,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: fonts.urbanist.regular,
    },
    medium: {
      fontFamily: fonts.urbanist.medium,
    },
    light: {
      fontFamily: fonts.urbanist.light,
    },
    thin: {
      fontFamily: fonts.urbanist.thin,
    },
    bold: {
      fontFamily: fonts.urbanist.bold,
    },
    extraBold: {
      fontFamily: fonts.urbanist.extraBold,
    },
    black: {
      fontFamily: fonts.urbanist.black,
    },
    semiBold: {
      fontFamily: fonts.urbanist.semiBold,
    },
    italic: {
      fontFamily: fonts.urbanist.italic,
    },
    mediumItalic: {
      fontFamily: fonts.urbanist.mediumItalic,
    },
    lightItalic: {
      fontFamily: fonts.urbanist.lightItalic,
    },
    extraLightItalic: {
      fontFamily: fonts.urbanist.extraLightItalic,
    },
    thinItalic: {
      fontFamily: fonts.urbanist.thinItalic,
    },
    boldItalic: {
      fontFamily: fonts.urbanist.boldItalic,
    },
    extraBoldItalic: {
      fontFamily: fonts.urbanist.extraBoldItalic,
    },
    blackItalic: {
      fontFamily: fonts.urbanist.blackItalic,
    },
    semiBoldItalic: {
      fontFamily: fonts.urbanist.semiBoldItalic,
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
    // Urbanist Font Family
    [fonts.urbanist.regular]: require('./src/assets/fonts/Urbanist/Urbanist-Regular.ttf'),
    [fonts.urbanist.medium]: require('./src/assets/fonts/Urbanist/Urbanist-Medium.ttf'),
    [fonts.urbanist.light]: require('./src/assets/fonts/Urbanist/Urbanist-Light.ttf'),
    [fonts.urbanist.extraLight]: require('./src/assets/fonts/Urbanist/Urbanist-ExtraLight.ttf'),
    [fonts.urbanist.thin]: require('./src/assets/fonts/Urbanist/Urbanist-Thin.ttf'),
    [fonts.urbanist.bold]: require('./src/assets/fonts/Urbanist/Urbanist-Bold.ttf'),
    [fonts.urbanist.extraBold]: require('./src/assets/fonts/Urbanist/Urbanist-ExtraBold.ttf'),
    [fonts.urbanist.black]: require('./src/assets/fonts/Urbanist/Urbanist-Black.ttf'),
    [fonts.urbanist.semiBold]: require('./src/assets/fonts/Urbanist/Urbanist-SemiBold.ttf'),
    [fonts.urbanist.italic]: require('./src/assets/fonts/Urbanist/Urbanist-Italic.ttf'),
    [fonts.urbanist.mediumItalic]: require('./src/assets/fonts/Urbanist/Urbanist-MediumItalic.ttf'),
    [fonts.urbanist.lightItalic]: require('./src/assets/fonts/Urbanist/Urbanist-LightItalic.ttf'),
    [fonts.urbanist.extraLightItalic]: require('./src/assets/fonts/Urbanist/Urbanist-ExtraLightItalic.ttf'),
    [fonts.urbanist.thinItalic]: require('./src/assets/fonts/Urbanist/Urbanist-ThinItalic.ttf'),
    [fonts.urbanist.boldItalic]: require('./src/assets/fonts/Urbanist/Urbanist-BoldItalic.ttf'),
    [fonts.urbanist.extraBoldItalic]: require('./src/assets/fonts/Urbanist/Urbanist-ExtraBoldItalic.ttf'),
    [fonts.urbanist.blackItalic]: require('./src/assets/fonts/Urbanist/Urbanist-BlackItalic.ttf'),
    [fonts.urbanist.semiBoldItalic]: require('./src/assets/fonts/Urbanist/Urbanist-SemiBoldItalic.ttf'),
    
    // Questrial Font Family
    [fonts.questrial.regular]: require('./src/assets/fonts/Questrial/Questrial-Regular.ttf'),
    
    // AfacadFlux Font Family
    [fonts.afacadFlux.regular]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-Regular.ttf'),
    [fonts.afacadFlux.medium]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-Medium.ttf'),
    [fonts.afacadFlux.light]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-Light.ttf'),
    [fonts.afacadFlux.extraLight]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-ExtraLight.ttf'),
    [fonts.afacadFlux.thin]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-Thin.ttf'),
    [fonts.afacadFlux.bold]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-Bold.ttf'),
    [fonts.afacadFlux.extraBold]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-ExtraBold.ttf'),
    [fonts.afacadFlux.black]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-Black.ttf'),
    [fonts.afacadFlux.semiBold]: require('./src/assets/fonts/AfacadFlux/AfacadFlux-SemiBold.ttf'),
    
    // San Francisco Font Family - Display variants
    [fonts.sanFrancisco.displayRegular]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Regular.otf'),
    [fonts.sanFrancisco.displayMedium]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Medium.otf'),
    [fonts.sanFrancisco.displayLight]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Light.otf'),
    [fonts.sanFrancisco.displayThin]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Thin.otf'),
    [fonts.sanFrancisco.displayBold]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Bold.otf'),
    [fonts.sanFrancisco.displaySemibold]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Semibold.otf'),
    [fonts.sanFrancisco.displayHeavy]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Heavy.otf'),
    [fonts.sanFrancisco.displayBlack]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Black.otf'),
    [fonts.sanFrancisco.displayUltralight]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-Ultralight.otf'),
    // Display Italic variants
    [fonts.sanFrancisco.displayRegularItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-RegularItalic.otf'),
    [fonts.sanFrancisco.displayMediumItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-MediumItalic.otf'),
    [fonts.sanFrancisco.displayLightItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-LightItalic.otf'),
    [fonts.sanFrancisco.displayThinItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-ThinItalic.otf'),
    [fonts.sanFrancisco.displayBoldItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-BoldItalic.otf'),
    [fonts.sanFrancisco.displaySemiboldItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-SemiboldItalic.otf'),
    [fonts.sanFrancisco.displayHeavyItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-HeavyItalic.otf'),
    [fonts.sanFrancisco.displayBlackItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-BlackItalic.otf'),
    [fonts.sanFrancisco.displayUltralightItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Display-UltralightItalic.otf'),
    // Text variants
    [fonts.sanFrancisco.textRegular]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Regular.otf'),
    [fonts.sanFrancisco.textMedium]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Medium.otf'),
    [fonts.sanFrancisco.textLight]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Light.otf'),
    [fonts.sanFrancisco.textThin]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Thin.otf'),
    [fonts.sanFrancisco.textBold]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Bold.otf'),
    [fonts.sanFrancisco.textSemibold]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Semibold.otf'),
    [fonts.sanFrancisco.textHeavy]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Heavy.otf'),
    [fonts.sanFrancisco.textBlack]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Black.otf'),
    [fonts.sanFrancisco.textUltralight]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-Ultralight.otf'),
    // Text Italic variants
    [fonts.sanFrancisco.textRegularItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-RegularItalic.otf'),
    [fonts.sanFrancisco.textMediumItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-MediumItalic.otf'),
    [fonts.sanFrancisco.textLightItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-LightItalic.otf'),
    [fonts.sanFrancisco.textThinItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-ThinItalic.otf'),
    [fonts.sanFrancisco.textBoldItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-BoldItalic.otf'),
    [fonts.sanFrancisco.textSemiboldItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-SemiboldItalic.otf'),
    [fonts.sanFrancisco.textHeavyItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-HeavyItalic.otf'),
    [fonts.sanFrancisco.textBlackItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-BlackItalic.otf'),
    [fonts.sanFrancisco.textUltralightItalic]: require('./src/assets/fonts/San-Francisco/SF-Pro-Text-UltralightItalic.otf'),
    // Rounded variants
    [fonts.sanFrancisco.roundedRegular]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Regular.otf'),
    [fonts.sanFrancisco.roundedMedium]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Medium.otf'),
    [fonts.sanFrancisco.roundedLight]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Light.otf'),
    [fonts.sanFrancisco.roundedThin]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Thin.otf'),
    [fonts.sanFrancisco.roundedBold]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Bold.otf'),
    [fonts.sanFrancisco.roundedSemibold]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Semibold.otf'),
    [fonts.sanFrancisco.roundedHeavy]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Heavy.otf'),
    [fonts.sanFrancisco.roundedBlack]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Black.otf'),
    [fonts.sanFrancisco.roundedUltralight]: require('./src/assets/fonts/San-Francisco/SF-Pro-Rounded-Ultralight.otf'),
    
    // Prompt Font Family
    [fonts.prompt.regular]: require('./src/assets/fonts/Prompt/Prompt-Regular.ttf'),
    [fonts.prompt.medium]: require('./src/assets/fonts/Prompt/Prompt-Medium.ttf'),
    [fonts.prompt.light]: require('./src/assets/fonts/Prompt/Prompt-Light.ttf'),
    [fonts.prompt.thin]: require('./src/assets/fonts/Prompt/Prompt-Thin.ttf'),
    [fonts.prompt.bold]: require('./src/assets/fonts/Prompt/Prompt-Bold.ttf'),
    [fonts.prompt.semiBold]: require('./src/assets/fonts/Prompt/Prompt-SemiBold.ttf'),
    [fonts.prompt.italic]: require('./src/assets/fonts/Prompt/Prompt-Italic.ttf'),
    [fonts.prompt.mediumItalic]: require('./src/assets/fonts/Prompt/Prompt-MediumItalic.ttf'),
    [fonts.prompt.lightItalic]: require('./src/assets/fonts/Prompt/Prompt-LightItalic.ttf'),
    [fonts.prompt.thinItalic]: require('./src/assets/fonts/Prompt/Prompt-ThinItalic.ttf'),
    [fonts.prompt.boldItalic]: require('./src/assets/fonts/Prompt/Prompt-BoldItalic.ttf'),
    [fonts.prompt.semiBoldItalic]: require('./src/assets/fonts/Prompt/Prompt-SemiBoldItalic.ttf'),
    
    // Playwrite GB S Font Family
    [fonts.playwrite.regular]: require('./src/assets/fonts/Playwrite_GB_S/PlaywriteGBS-VariableFont_wght.ttf'),
    [fonts.playwrite.italic]: require('./src/assets/fonts/Playwrite_GB_S/PlaywriteGBS-Italic-VariableFont_wght.ttf'),
    
    // Bodoni Moda Font Family
    [fonts.bodoniModa.regular]: require('./src/assets/fonts/Bodoni_Moda/BodoniModa-VariableFont_opsz,wght.ttf'),
    [fonts.bodoniModa.italic]: require('./src/assets/fonts/Bodoni_Moda/BodoniModa-Italic-VariableFont_opsz,wght.ttf'),
    
    // Anton Font Family
    [fonts.anton.regular]: require('./src/assets/fonts/Anton/Anton-Regular.ttf'),
    
    // Abril Fatface Font Family
    [fonts.abrilFatface.regular]: require('./src/assets/fonts/Abril_Fatface/AbrilFatface-Regular.ttf'),
    
    // Poppins Font Family
    [fonts.poppins.regular]: require('./src/assets/fonts/Poppins/Poppins-Regular.ttf'),
    [fonts.poppins.medium]: require('./src/assets/fonts/Poppins/Poppins-Medium.ttf'),
    [fonts.poppins.light]: require('./src/assets/fonts/Poppins/Poppins-Light.ttf'),
    [fonts.poppins.thin]: require('./src/assets/fonts/Poppins/Poppins-Thin.ttf'),
    [fonts.poppins.bold]: require('./src/assets/fonts/Poppins/Poppins-Bold.ttf'),
    [fonts.poppins.semiBold]: require('./src/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    [fonts.poppins.extraBold]: require('./src/assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
    [fonts.poppins.black]: require('./src/assets/fonts/Poppins/Poppins-Black.ttf'),
    [fonts.poppins.italic]: require('./src/assets/fonts/Poppins/Poppins-Italic.ttf'),
    [fonts.poppins.mediumItalic]: require('./src/assets/fonts/Poppins/Poppins-MediumItalic.ttf'),
    [fonts.poppins.lightItalic]: require('./src/assets/fonts/Poppins/Poppins-LightItalic.ttf'),
    [fonts.poppins.thinItalic]: require('./src/assets/fonts/Poppins/Poppins-ThinItalic.ttf'),
    [fonts.poppins.boldItalic]: require('./src/assets/fonts/Poppins/Poppins-BoldItalic.ttf'),
    [fonts.poppins.semiBoldItalic]: require('./src/assets/fonts/Poppins/Poppins-SemiBoldItalic.ttf'),
    [fonts.poppins.extraBoldItalic]: require('./src/assets/fonts/Poppins/Poppins-ExtraBoldItalic.ttf'),
    [fonts.poppins.blackItalic]: require('./src/assets/fonts/Poppins/Poppins-BlackItalic.ttf'),
    // Lato Font Family
    [fonts.lato.regular]: require('./src/assets/fonts/Lato/Lato-Regular.ttf'),
    [fonts.lato.light]: require('./src/assets/fonts/Lato/Lato-Light.ttf'),
    [fonts.lato.thin]: require('./src/assets/fonts/Lato/Lato-Thin.ttf'),
    [fonts.lato.bold]: require('./src/assets/fonts/Lato/Lato-Bold.ttf'),
    [fonts.lato.black]: require('./src/assets/fonts/Lato/Lato-Black.ttf'),
    [fonts.lato.italic]: require('./src/assets/fonts/Lato/Lato-Italic.ttf'),
    [fonts.lato.lightItalic]: require('./src/assets/fonts/Lato/Lato-LightItalic.ttf'),
    [fonts.lato.thinItalic]: require('./src/assets/fonts/Lato/Lato-ThinItalic.ttf'),
    [fonts.lato.boldItalic]: require('./src/assets/fonts/Lato/Lato-BoldItalic.ttf'),
    [fonts.lato.blackItalic]: require('./src/assets/fonts/Lato/Lato-BlackItalic.ttf'),
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
