import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, axiosConfig, setCurrentAdminId } from '../../config/apiConfig';
import axios from 'axios';

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const role = route.params?.role || 'admin';

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    const loginData = {
      email: email.trim(),
      password: password
    };

    try {
      console.log('Login isteği gönderiliyor:', {
        endpoint: API_ENDPOINTS.AUTH.LOGIN,
        data: { ...loginData, password: '********' }
      });

      const response = await axios({
        method: 'POST',
        url: API_ENDPOINTS.AUTH.LOGIN,
        data: loginData,
        ...axiosConfig
      });

      console.log('Sunucu yanıtı:', response.data);

      const { message, userId, email, role, adminId } = response.data;

      if (message === "Login successful") {
        if (role === 'admin') {
          setCurrentAdminId(adminId);
        }

        await AsyncStorage.multiSet([
          ['userId', userId.toString()],
          ['userEmail', email],
          ['userRole', role],
          ...(role === 'admin' ? [['adminId', adminId.toString()]] : [])
        ]);

        if (role === 'admin') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminNavigator' }],
          });
        } else {
          Alert.alert('Hata', 'Yetkisiz giriş denemesi');
        }
      } else {
        Alert.alert('Hata', 'Geçersiz e-posta veya şifre');
      }
    } catch (error) {
      console.error('Login hatası:', {
        message: error.message,
        endpoint: API_ENDPOINTS.AUTH.LOGIN
      });

      if (error.message.includes('Network Error')) {
        Alert.alert(
          'Bağlantı Hatası',
          'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        );
      } else {
        Alert.alert(
          'Hata',
          'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#E0EAFC', '#CFDEF3']}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.background}
      >
        <BlurView
          intensity={60}
          tint="light"
          style={[styles.blurContainer, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}
        >
          <View style={styles.container}>
            <View style={styles.iconWrapper}>
              <Icon name="user-shield" size={80} color={colors.darkGray} />
            </View>

            <Text style={styles.title}>
              {role === 'admin' ? 'Yönetici Girişi' : 'Kiracı Girişi'}
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color={colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.darkGray}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color={colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={colors.darkGray}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color={colors.darkGray} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <TouchableOpacity
                style={styles.link}
                onPress={() => {
                  if (role === 'admin') {
                    navigation.navigate('AdminCreate', { screen: 'AdminInfo' });
                  } else if (role === 'tenant') {
                    navigation.navigate('TenantNavigator');
                  }
                }}
              >
                <Text style={styles.linkText}>
                  {role === 'admin' ? 'Yönetici Kaydı' : 'Kiracı Kaydı'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.link}
                onPress={() => navigation.navigate('ForgotPassword', { role })}
              >
                <Text style={styles.linkText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  container: {
    padding: 30,
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.black,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;
