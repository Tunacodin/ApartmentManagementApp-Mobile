import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { TextInput as PaperInput, Surface } from "react-native-paper";
import { Colors, Gradients } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import animate from "../../../assets/json/animInformation.json";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import { API_ENDPOINTS, axiosConfig, getAdminCreateFormat, validateAdminData, handleApiError } from '../../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_ENDPOINTS.ADMIN,
  ...axiosConfig
});

// Axios interceptors ekle
api.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
}, error => {
  console.log('Request Error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    if (error.response) {
      // Sunucudan yanıt geldi ama başarısız
      console.log('Error Response:', error.response.data);
      console.log('Error Status:', error.response.status);
    } else if (error.request) {
      // İstek yapıldı ama yanıt gelmedi
      console.log('Error Request:', error.request);
    } else {
      // İstek oluşturulurken hata oluştu
      console.log('Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

const AdminInfoScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [password, setPassword] = useState("");
  const scrollViewRef = useRef(null);
  const { height: screenHeight } = Dimensions.get('window');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Ad kontrolü
    if (!firstName.trim()) {
      newErrors.firstName = 'Ad alanı zorunludur';
    } else if (firstName.length < 2) {
      newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
    }

    // Soyad kontrolü
    if (!lastName.trim()) {
      newErrors.lastName = 'Soyad alanı zorunludur';
    } else if (lastName.length < 2) {
      newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }

    // E-posta kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    // Telefon kontrolü
    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Telefon numarası zorunludur';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    // Şifre kontrolü
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d_!@#$%^&*(),.?":{}|<>]{6,}$/;
    if (!password) {
      newErrors.password = 'Şifre alanı zorunludur';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Şifre en az 6 karakter uzunluğunda olmalı ve en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      // Form validasyonu
      if (!validateForm()) {
        Alert.alert(
          'Validasyon Hatası',
          'Lütfen tüm alanları doğru şekilde doldurunuz.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Form verilerini hazırla
      const adminData = {
        fullName: `${firstName} ${lastName}`,
        email,
        phoneNumber: phone,
        password,
      };

      // Test aşamasında veritabanına kaydetme
      Alert.alert(
        'Başarılı',
        'Yönetici bilgileri doğrulandı. Test aşamasında veritabanına kaydedilmedi.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('ApartmentInfo')
          }
        ]
      );

      // Gerçek API entegrasyonu için hazır kod (şu an yorum satırı olarak bırakıldı)
      /*
      const response = await axios.post(API_ENDPOINTS.ADMIN.CREATE, formattedData, axiosConfig);
      if (response.data) {
        await AsyncStorage.setItem('currentAdminId', response.data.id.toString());
        Alert.alert(
          'Başarılı',
          'Yönetici bilgileri başarıyla kaydedildi.',
          [{ text: 'Tamam', onPress: () => navigation.navigate('ApartmentInfo') }]
        );
      }
      */
    } catch (error) {
      const errorResponse = handleApiError(error);
      Alert.alert('Hata', errorResponse.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = firstName && lastName && email && phone && password;

  const handleInputFocus = (inputPosition) => {
    const scrollPosition = inputPosition * 60; // Her input için yaklaşık yükseklik
    scrollViewRef.current?.scrollTo({
      y: scrollPosition,
      animated: true
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Gradients.indigo[0]} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <LinearGradient
            colors={Gradients.indigo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={[styles.animationContainer, { height: 120, width: 120 }]}>
                <LottieView 
                  source={animate} 
                  autoPlay 
                  loop 
                  style={styles.animation}
                />
              </View>
              <View style={styles.headerTextContainer}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="admin-panel-settings" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.headerTitle}>Yönetici Bilgileri</Text>
                <Text style={styles.headerSubtitle}>Yeni yönetici hesabı oluştur</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.formContent}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="person" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Ad"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    setErrors(prev => ({ ...prev, firstName: undefined }));
                  }}
                  style={styles.input}
                  outlineColor={errors.firstName ? Colors.error : "#E2E8F0"}
                  activeOutlineColor={errors.firstName ? Colors.error : Colors.primary}
                  error={!!errors.firstName}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  onFocus={() => handleInputFocus(0)}
                />
              </View>
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="person-outline" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Soyad"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    setErrors(prev => ({ ...prev, lastName: undefined }));
                  }}
                  style={styles.input}
                  outlineColor={errors.lastName ? Colors.error : "#E2E8F0"}
                  activeOutlineColor={errors.lastName ? Colors.error : Colors.primary}
                  error={!!errors.lastName}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  onFocus={() => handleInputFocus(1)}
                />
              </View>
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="email" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="E-posta"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  style={styles.input}
                  outlineColor={errors.email ? Colors.error : "#E2E8F0"}
                  activeOutlineColor={errors.email ? Colors.error : Colors.primary}
                  error={!!errors.email}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => handleInputFocus(2)}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="phone" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Telefon Numarası"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  style={styles.input}
                  outlineColor={errors.phone ? Colors.error : "#E2E8F0"}
                  activeOutlineColor={errors.phone ? Colors.error : Colors.primary}
                  error={!!errors.phone}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  keyboardType="phone-pad"
                  onFocus={() => handleInputFocus(3)}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="lock" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Şifre"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry
                  style={styles.input}
                  outlineColor={errors.password ? Colors.error : "#E2E8F0"}
                  activeOutlineColor={errors.password ? Colors.error : Colors.primary}
                  error={!!errors.password}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  onFocus={() => handleInputFocus(4)}
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSaving || !isFormValid}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>
                      Kaydet ve Devam Et
                    </Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { marginTop: 10, backgroundColor: '#4F46E5' }]}
                onPress={() => navigation.navigate('FinancialInfo')}
              >
                <Text style={styles.submitButtonText}>
                  Finansal Bilgilere Geç
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  animationContainer: {
    width: 140,
    height: 140,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 70,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 100,
    height: 100,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContent: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: Fonts.urbanist.regular,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 52,
  },
});

export default AdminInfoScreen;
