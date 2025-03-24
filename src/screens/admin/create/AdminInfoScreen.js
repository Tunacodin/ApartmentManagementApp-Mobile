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
} from "react-native";
import LottieView from "lottie-react-native";
import { TextInput as PaperInput, Surface } from "react-native-paper";
import { Colors, Gradients } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import animate from "../../../assets/json/animInformation.json";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import { API_ENDPOINTS, axiosConfig } from '../../../config/apiConfig';

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

  const handleSubmit = () => {
    // Doğrudan ApartmentInfo ekranına yönlendir
    navigation.navigate('ApartmentInfo');
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
                  onChangeText={setFirstName}
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  onFocus={() => handleInputFocus(0)}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="person-outline" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Soyad"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  onFocus={() => handleInputFocus(1)}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="email" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="E-posta"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => handleInputFocus(2)}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="phone" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Telefon Numarası"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  keyboardType="phone-pad"
                  onFocus={() => handleInputFocus(3)}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="lock" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Şifre"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  onFocus={() => handleInputFocus(4)}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  Apartman Bilgilerine Geç
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
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
});

export default AdminInfoScreen;
