import React, { useState, useEffect } from 'react';
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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, api, setCurrentAdminId, setCurrentUserId, setAuthToken } from '../../config/apiConfig';

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const role = route.params?.role || 'admin';

  // Daha önce girilen e-posta adreslerini yükle
  useEffect(() => {
    loadEmailSuggestions();
  }, []);

  const loadEmailSuggestions = async () => {
    try {
      const savedEmails = await AsyncStorage.getItem('savedEmails');
      if (savedEmails) {
        setEmailSuggestions(JSON.parse(savedEmails));
      }
    } catch (error) {
      console.error('E-posta önerileri yüklenirken hata:', error);
    }
  };

  const saveEmail = async (newEmail) => {
    try {
      const savedEmails = await AsyncStorage.getItem('savedEmails');
      let emails = savedEmails ? JSON.parse(savedEmails) : [];
      
      // Eğer e-posta zaten listede yoksa ekle
      if (!emails.includes(newEmail)) {
        emails = [newEmail, ...emails].slice(0, 5); // Son 5 e-postayı sakla
        await AsyncStorage.setItem('savedEmails', JSON.stringify(emails));
        setEmailSuggestions(emails);
      }
    } catch (error) {
      console.error('E-posta kaydedilirken hata:', error);
    }
  };

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
    console.log('\n=== Giriş İşlemi Başladı ===');
    console.log('Giriş yapılmaya çalışılan email:', email.trim());
    console.log('Giriş yapılmaya çalışılan rol:', role);

    const loginData = {
      email: email.trim(),
      password: password
    };

    try {
      console.log('\n=== API İsteği Gönderiliyor ===');
      console.log('Endpoint:', API_ENDPOINTS.AUTH.LOGIN);
      console.log('Gönderilen veri:', { ...loginData, password: '********' });

      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, loginData);

      if (response.data.message === "Giriş başarılı") {
        console.log('\n=== Giriş Başarılı ===');
        const { message, userId, email, role, adminId, token } = response.data;

        // Başarılı girişte e-postayı kaydet
        await saveEmail(email);

        // Token'ı header'a ekle
        setAuthToken(token);

        // Önce userId'yi AsyncStorage'a kaydet
        await AsyncStorage.multiSet([
          ['userId', userId?.toString() || ''],
          ['userEmail', email],
          ['userRole', role],
          ['authToken', token],
          ...(role === 'admin' ? [['adminId', userId.toString()]] : [])
        ]);

        // API instance'ına userId ve adminId'yi ekle
        setCurrentUserId(userId);
        if (role === 'admin') {
          setCurrentAdminId(userId);
        }

        // Başarılı giriş sonrası yönlendirme
        if (role === 'admin') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminNavigator' }],
          });
        } else if (role === 'tenant') {
          console.log('\n=== Kiracı Paneline Yönlendiriliyor ===');
          
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'TenantNavigator',
              params: { userId: userId }
            }],
          });
        }
      } else {
        // Handle specific error using errorCode
        switch(response.data.errorCode) {
          case 'USER_NOT_FOUND':
            Alert.alert('Hata', 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.');
            break;
          case 'INVALID_PASSWORD':
            Alert.alert('Hata', 'Girdiğiniz şifre yanlış. Lütfen tekrar deneyin.');
            break;
          case 'ACCOUNT_DISABLED':
            Alert.alert('Hata', 'Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.');
            break;
          default:
            Alert.alert('Hata', response.data.message || 'Giriş yapılırken bir hata oluştu.');
        }
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        Alert.alert('Hata', error.response.data.message || 'Sunucu hatası oluştu.');
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Error:', error.message);
        Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setShowSuggestions(false);
  };

  const renderEmailSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleEmailSelect(item)}
    >
      <Icon name="history" size={16} color={colors.darkGray} style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

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
                onChangeText={(text) => {
                  setEmail(text);
                  setShowSuggestions(text.length > 0);
                }}
                onFocus={() => setShowSuggestions(email.length > 0)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.darkGray}
              />
            </View>

            {showSuggestions && emailSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={emailSuggestions.filter(email => 
                    email.toLowerCase().includes(email.toLowerCase())
                  )}
                  renderItem={renderEmailSuggestion}
                  keyExtractor={(item) => item}
                  style={styles.suggestionsList}
                />
              </View>
            )}

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
  suggestionsContainer: {
    width: '100%',
    maxHeight: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  suggestionsList: {
    padding: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    color: colors.black,
    fontSize: 16,
  },
});

export default LoginScreen;
