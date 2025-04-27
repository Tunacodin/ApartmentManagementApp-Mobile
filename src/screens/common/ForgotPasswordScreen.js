import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Dimensions
} from 'react-native';
import { TextInput as PaperInput } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../styles/colors';
import LottieView from "lottie-react-native";
import animPassword from '../../assets/json/animPassword.json';
import { MaterialIcons } from "@expo/vector-icons";
import { Fonts, Colors, Gradients } from '../../constants';
import { api, API_ENDPOINTS, API_BASE_URL } from '../../config/apiConfig';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ route, navigation }) => {
  const { role } = route.params;
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendVerificationCode = async () => {
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Lütfen e-posta adresinizi girin.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email,
        newPassword: "" // Boş şifre gönderiyoruz çünkü henüz yeni şifre belirlenmedi
      });

      if (response.data.success) {
        Alert.alert(
          'Başarılı!',
          'Doğrulama kodu e-posta adresinize gönderildi.',
          [{ text: 'Tamam' }]
        );
      } else {
        throw new Error(response.data.message || 'Doğrulama kodu gönderilemedi.');
      }
    } catch (error) {
      console.error('Verification code error:', error);
      setErrorMessage(error.response?.data?.message || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Lütfen e-posta adresinizi girin.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('Lütfen yeni şifrenizi girin.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setIsLoading(true);
      
      const requestData = {
        email: email,
        newPassword: newPassword
      };

      console.log('\n=== API İsteği Detayları ===');
      console.log('Base URL:', API_BASE_URL);
      console.log('Endpoint:', API_ENDPOINTS.AUTH.RESET_PASSWORD);
      console.log('Tam URL:', API_BASE_URL + API_ENDPOINTS.AUTH.RESET_PASSWORD);
      console.log('Gönderilen veri:', requestData);
      
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, requestData);

      console.log('Sunucu yanıtı:', response.data);

      // Başarılı yanıt kontrolü
      if (typeof response.data === 'string' && response.data.includes('başarıyla')) {
        Alert.alert(
          'Başarılı!',
          'Şifreniz başarıyla sıfırlandı.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.navigate('LoginScreen', { role })
            }
          ]
        );
      } else if (response.data && response.data.success) {
      Alert.alert(
        'Başarılı!',
          'Şifreniz başarıyla sıfırlandı.',
        [
          {
            text: 'Tamam',
              onPress: () => navigation.navigate('LoginScreen', { role })
          }
        ]
      );
      } else {
        // Handle specific error using errorCode
        switch(response.data?.errorCode) {
          case 'USER_NOT_FOUND':
            setErrorMessage('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.');
            break;
          case 'INVALID_PASSWORD_FORMAT':
            setErrorMessage('Şifre formatı geçersiz. Lütfen en az 6 karakter kullanın.');
            break;
          case 'PASSWORD_RESET_FAILED':
            setErrorMessage('Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin.');
            break;
          default:
            setErrorMessage(response.data?.message || 'Şifre sıfırlama işlemi başarısız oldu.');
        }
      }
    } catch (error) {
      console.error('Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        setErrorMessage(error.response.data.message || 'Sunucu hatası oluştu.');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setErrorMessage('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
        setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login', { role });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.animationContainer}>
            <LottieView
              source={animPassword}
              autoPlay
              loop={true}
              style={styles.animation}
            />
          </View>
          <Text style={styles.headerTitle}>
            {role === 'admin' ? 'Yönetici Şifre Sıfırlama' : 'Kiracı Şifre Sıfırlama'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Yeni şifrenizi belirlemek için e-posta adresinizi girin
          </Text>
        </View>
      </LinearGradient>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="email"
                size={24}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <PaperInput
                mode="outlined"
                label="E-posta Adresi"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage('');
                }}
                style={styles.input}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errorMessage}
                disabled={isLoading}
                left={<PaperInput.Icon name="email" color={Colors.primary} />}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="lock"
                size={24}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <PaperInput
                mode="outlined"
                label="Yeni Şifre"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setErrorMessage('');
                }}
                style={styles.input}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                secureTextEntry
                error={!!errorMessage}
                disabled={isLoading}
                left={<PaperInput.Icon name="lock" color={Colors.primary} />}
              />
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.submitButtonText}>Gönderiliyor</Text>
                    <MaterialIcons name="hourglass-top" size={24} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.submitButtonContent}>
                    <Text style={styles.submitButtonText}>Şifremi Sıfırla</Text>
                    <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToLogin}
              disabled={isLoading}
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
              <Text style={styles.backButtonText}>Giriş Ekranına Dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  animationContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 20,
    zIndex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: Colors.error,
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    flex: 1,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  backButtonText: {
    marginLeft: 8,
    color: Colors.primary,
    fontSize: 16,
    fontFamily: Fonts.urbanist.semiBold,
  },
});

export default ForgotPasswordScreen;
