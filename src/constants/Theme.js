import { DefaultTheme } from 'react-native-paper';
import Colors, { Gradients } from './Colors';
import Fonts from './Fonts';

const Theme = {
  ...DefaultTheme,
  fonts: {
    regular: {
      fontFamily: Fonts.urbanist.regular,
    },
    medium: {
      fontFamily: Fonts.urbanist.medium,
    },
    light: {
      fontFamily: Fonts.urbanist.light,
    },
    thin: {
      fontFamily: Fonts.urbanist.thin,
    },
    bold: {
      fontFamily: Fonts.urbanist.bold,
    },
    extraBold: {
      fontFamily: Fonts.urbanist.extraBold,
    },
    black: {
      fontFamily: Fonts.urbanist.black,
    },
    semiBold: {
      fontFamily: Fonts.urbanist.semiBold,
    },
    italic: {
      fontFamily: Fonts.urbanist.italic,
    },
    mediumItalic: {
      fontFamily: Fonts.urbanist.mediumItalic,
    },
    lightItalic: {
      fontFamily: Fonts.urbanist.lightItalic,
    },
    thinItalic: {
      fontFamily: Fonts.urbanist.thinItalic,
    },
    boldItalic: {
      fontFamily: Fonts.urbanist.boldItalic,
    },
    extraBoldItalic: {
      fontFamily: Fonts.urbanist.extraBoldItalic,
    },
    blackItalic: {
      fontFamily: Fonts.urbanist.blackItalic,
    },
    semiBoldItalic: {
      fontFamily: Fonts.urbanist.semiBoldItalic,
    },
  },
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    background: Colors.background,
    surface: Colors.surface,
    text: Colors.text,
    textSecondary: Colors.textSecondary,
  },
  gradients: Gradients
};

export default Theme; 