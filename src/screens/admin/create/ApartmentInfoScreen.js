import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import axios from "axios";
import colors from "../../../styles/colors";
import { TextInput as PaperInput, Button as PaperButton } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, axiosConfig } from '../../../config/apiConfig';
import { supabase } from '../../../config/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import LottieView from 'lottie-react-native';
import animate from "../../../assets/json/animApartment.json";  


// API URL'lerini güncelle
const buildingApi = axios.create({
  baseURL: 'http://your-api-url/api', // API URL'nizi buraya ekleyin
  ...axiosConfig
});

const apartmentApi = axios.create({
  baseURL: API_ENDPOINTS.APARTMENT,
  ...axiosConfig
});

// Isıtma sistemi seçenekleri
const heatingOptions = [
  { label: 'Merkezi', value: 'central', icon: 'apartment' },
  { label: 'Kombi', value: 'combi', icon: 'local-fire-department' },
  { label: 'Yerden', value: 'floor', icon: 'waves' }
];

// API istekleri için hata yönetimi
const logApiError = (error, context) => {
  console.log(`\n=================== ${context} HATA DETAYI ===================`);
  console.error("❌ Hata Türü:", error.name);
  console.error("❌ Hata Mesajı:", error.message);
  
  if (error.response) {
    // Sunucudan gelen hata
    console.error(" Sunucu Yanıtı:", {
      data: error.response.data,
      status: error.response.status,
      headers: error.response.headers
    });
  } else if (error.request) {
    // İstek yapıldı ama yanıt alınamadı
    console.error("📡 İstek Yapıldı Ama Yanıt Yok:", error.request);
  } else {
    // İstek oluşturulurken hata oluştu
    console.error("📡 İstek Hatası:", error.message);
  }

  if (error.config) {
    console.error("📝 İstek Detayları:", {
      url: error.config.url,
      method: error.config.method,
      headers: error.config.headers,
      data: error.config.data
    });
  }

  console.log("=======================================================\n");
};

const ApartmentInfoScreen = ({ navigation }) => {
  // State tanımlamaları
  const [showForm, setShowForm] = useState(false);
  const [showApartmentDetails, setShowApartmentDetails] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [currentStep, setCurrentStep] = useState('type');
  const [selectedType, setSelectedType] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [unassignedUnits, setUnassignedUnits] = useState([]);
  const [apartmentUnits, setApartmentUnits] = useState([]);
  const [completionStatus, setCompletionStatus] = useState({
    type: false,
    rent: false,
    deposit: false,
    notes: false
  });
  const [isSelectingType, setIsSelectingType] = useState(false);
  const [bulkNotes, setBulkNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [constructionDate, setConstructionDate] = useState(new Date());
  const [features, setFeatures] = useState({
    elevator: false,
    parking: false,
    security: false,
    generator: false,
    pool: false,
    gym: false,
  });
  const [buildingFeatures, setBuildingFeatures] = useState({
    heating: {
      type: 'central', // Default value
      details: ''
    },
    elevator: false,
    parking: {
      exists: false,
      type: null
    },
    pool: {
      exists: false,
      type: null
    },
    gym: false,
    garden: false,
    thermalInsulation: false
  });
  const [featureAnimations] = useState({
    elevator: new Animated.Value(0),
    parking: new Animated.Value(0),
    security: new Animated.Value(0),
    generator: new Animated.Value(0),
    pool: new Animated.Value(0),
    gym: new Animated.Value(0),
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duesAmount, setDuesAmount] = useState("");
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState([]);
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [showBasementSelector, setShowBasementSelector] = useState(false);
  const [selectedBasementFloor, setSelectedBasementFloor] = useState(null);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [hasBasement, setHasBasement] = useState(false);
  const [bulkRentAmount, setBulkRentAmount] = useState('5000');
  const [bulkDepositAmount, setBulkDepositAmount] = useState('10000');
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [bulkFloor, setBulkFloor] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [tempDate, setTempDate] = useState(null);
  const [tempBasementFloor, setTempBasementFloor] = useState(null);
  const [apartmentName, setApartmentName] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState(0);
  const [totalApartments, setTotalApartments] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [includedUtilities, setIncludedUtilities] = useState({
    electric: false,
    water: false,
    gas: false,
    internet: false
  });
  const [showBuildingFeatures, setShowBuildingFeatures] = useState(false);

  const scrollViewRef = useRef(null);

  const APARTMENT_TYPES = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1"];

  const STEPS = [
    { id: 'type', title: 'Daire Tipi', icon: 'home' },
    { id: 'floor', title: 'Kat Bilgisi', icon: 'layers' },
    { id: 'balcony', title: 'Balkon', icon: 'deck' },
    { id: 'rent', title: 'Kira Bilgisi', icon: 'attach-money' },
    { id: 'deposit', title: 'Depozito', icon: 'account-balance-wallet' },
    { id: 'notes', title: 'Ek Notlar', icon: 'note' }
  ];

  const calculateBuildingAge = (constructionDate) => {
    if (!constructionDate) return '';
    const today = new Date();
    const age = today.getFullYear() - constructionDate.getFullYear();
    return age.toString();
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        // Android için onay dialogu göster
        Alert.alert(
          "Tarih Seçimi",
          `${selectedDate.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} tarihini onaylıyor musunuz?`,
          [
            {
              text: "Hayır",
              onPress: () => {
                setTempDate(null);
                setShowDatePicker(false);
              },
              style: "cancel"
            },
            {
              text: "Evet",
              onPress: () => {
                setConstructionDate(selectedDate);
                handleFeatureChange('buildingAge', calculateBuildingAge(selectedDate));
                setShowDatePicker(false);
              }
            }
          ]
        );
      }
    }
  };

  // iOS için onay butonu
  const handleConfirmDate = () => {
    if (tempDate) {
      setConstructionDate(tempDate);
      handleFeatureChange('buildingAge', calculateBuildingAge(tempDate));
    }
    setTempDate(null);
    setShowDatePicker(false);
  };

  // iOS için iptal butonu
  const handleCancelDate = () => {
    setTempDate(null);
    setShowDatePicker(false);
  };

  const handleFeatureChange = (feature, value) => {
    setBuildingFeatures(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  // Animasyon değerleri için ref'ler oluşturalım
  const parkingAnimation = useRef(new Animated.Value(0)).current;
  const poolAnimation = useRef(new Animated.Value(0)).current;

  // Switch değiştiğinde animasyonu tetikleyen fonksiyon
  const animateFeature = (animation, show) => {
    Animated.timing(animation, {
      toValue: show ? 1 : 0,
      duration: 500, // 0.5 saniye
      useNativeDriver: true,
    }).start();
  };

  // Switch değişimlerini güncelleyelim
  const handleNestedFeatureChange = (feature, subFeature, value) => {
    setBuildingFeatures(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [subFeature]: value
      }
    }));

    // Switch açıldığında/kapandığında animasyonu tetikle
    if (subFeature === 'exists') {
      if (feature === 'parking') {
        animateFeature(parkingAnimation, value);
      } else if (feature === 'pool') {
        animateFeature(poolAnimation, value);
      }
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleCityFilter = (text) => {
    setCity(text);
    console.log('Filtering cities with:', text);
    
    if (text.length > 0) {
      const filtered = cities
        .filter(city => 
          city.name.toLowerCase().includes(text.toLowerCase()))
        .map(city => city.name);
      setFilteredCities(filtered);
      setShowCityDropdown(true);
      console.log('Filtered cities:', filtered);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  };

  const handleCityChange = (selectedCity) => {
    console.log('Selected city:', selectedCity);
    setCity(selectedCity);
    setDistrict('');
    setNeighborhood('');
    
    const cityData = cities.find(c => c.name === selectedCity);
    if (cityData) {
      setDistricts(cityData.districts);
      setFilteredDistricts([]);
      setShowDistrictDropdown(false);
    
    }
    
    setShowCityDropdown(false);
  };

  const handleDistrictFilter = (text) => {
    setDistrict(text);
    console.log('Filtering districts with:', text);
    
    if (text.length > 0 && districts.length > 0) {
      const filtered = districts.filter(district => 
        district.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDistricts(filtered);
      setShowDistrictDropdown(true);
     
    } else {
      setFilteredDistricts([]);
      setShowDistrictDropdown(false);
    }
  };

  const handleNeighborhoodFilter = (text) => {
    setNeighborhood(text);
    console.log('Filtering neighborhoods with:', text);

    if (text.length > 0 && neighborhoods.length > 0) {
      const filtered = neighborhoods.filter(neighborhood =>
        neighborhood.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredNeighborhoods(filtered);
      setShowNeighborhoodDropdown(true);
      console.log('Filtered neighborhoods:', filtered);
    } else {
      setFilteredNeighborhoods([]);
      setShowNeighborhoodDropdown(false);
    }
  };

  const handleNeighborhoodChange = (selectedNeighborhood) => {
    console.log('Selected neighborhood:', selectedNeighborhood);
    setNeighborhood(selectedNeighborhood);
    setShowNeighborhoodDropdown(false);
  };

  const validateForm = () => {
    const missingFields = [];

    if (!apartmentName.trim()) missingFields.push("- Apartman Adı");
    if (!numberOfFloors) missingFields.push("- Kat Sayısı");
    if (!totalApartments) missingFields.push("- Toplam Daire Sayısı");
    if (!city.trim()) missingFields.push("- Şehir");
    if (!district.trim()) missingFields.push("- İlçe");
    if (!neighborhood.trim()) missingFields.push("- Mahalle");
    if (!street.trim()) missingFields.push("- Sokak");
    if (!buildingNumber.trim()) missingFields.push("- Bina Numarası");
    if (!postalCode.trim()) missingFields.push("- Posta Kodu");
    if (!duesAmount.trim()) missingFields.push("- Aidat Miktarı");

    if (missingFields.length > 0) {
      console.log("\n=================== FORM DOĞRULAMA ===================");
      console.log("❌ Eksik Alanlar:");
      missingFields.forEach(field => console.log(field));
      console.log("====================================================\n");

      Alert.alert(
        "Eksik Bilgiler",
        `Lütfen aşağıdaki alanları doldurun:\n\n${missingFields.join("\n")}`
      );
      return false;
    }

    console.log("\n=================== FORM DOĞRULAMA ===================");
    console.log("✅ Tüm alanlar doldurulmuş");
    console.log("====================================================\n");

    return true;
  };

  // AsyncStorage'dan veri yükleme
  useEffect(() => {
    loadSavedApartment();
  }, []);

  // Kaydedilmiş apartman bilgilerini yükle
  const loadSavedApartment = async () => {
    try {
      const savedApartment = await AsyncStorage.getItem('savedApartment');
      if (savedApartment) {
        const apartmentData = JSON.parse(savedApartment);
        
        // State'leri güncelle
        setApartmentName(apartmentData.buildingName || '');
        setNumberOfFloors(apartmentData.numberOfFloors?.toString() || '');
        setTotalApartments(apartmentData.totalApartments?.toString() || '');
        setCity(apartmentData.city || '');
        setDistrict(apartmentData.district || '');
        setNeighborhood(apartmentData.neighborhood || '');
        setStreet(apartmentData.street || '');
        setBuildingNumber(apartmentData.buildingNumber || '');
        setPostalCode(apartmentData.postalCode || '');
        setDuesAmount(apartmentData.duesAmount?.toString() || '');
        
        setIncludedUtilities({
          electric: apartmentData.includedElectric || false,
          water: apartmentData.includedWater || false,
          gas: apartmentData.includedGas || false,
          internet: apartmentData.includedInternet || false
        });

        setBuildingFeatures({
          parking: {
            exists: apartmentData.parkingType !== 'Yok',
            type: apartmentData.parkingType !== 'Yok' ? apartmentData.parkingType : null
          },
          elevator: apartmentData.hasElevator || false,
          park: apartmentData.hasPlayground || false,
          heatingSystem: apartmentData.heatingType || 'central',
          pool: {
            exists: apartmentData.poolType !== 'Yok',
            type: apartmentData.poolType !== 'Yok' ? apartmentData.poolType : null
          },
          gym: apartmentData.hasGym || false,
          buildingAge: apartmentData.buildingAge?.toString() || '',
          garden: apartmentData.hasGarden || false,
          thermalInsulation: apartmentData.hasThermalInsulation || false
        });

        console.log('Apartman bilgileri yüklendi:', apartmentData);
      }
    } catch (error) {
      console.error('Apartman bilgileri yüklenirken hata:', error);
    }
  };

  // Apartman bilgilerini kaydet
  const saveApartmentToStorage = async (apartmentData) => {
    try {
      await AsyncStorage.setItem('savedApartment', JSON.stringify(apartmentData));
      console.log('Apartman bilgileri kaydedildi');
    } catch (error) {
      console.error('Apartman bilgileri kaydedilirken hata:', error);
    }
  };

  // handleSubmit fonksiyonunu güncelle
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    console.log("\n=================== İŞLEM BAŞLADI ===================");

    try {
      const buildingData = {
        buildingName: apartmentName.trim(),
        numberOfFloors: parseInt(numberOfFloors),
        totalApartments: parseInt(totalApartments),
        occupancyRate: 0,
        city: city.trim(),
        district: district.trim(),
        neighborhood: neighborhood.trim(),
        street: street.trim(),
        buildingNumber: buildingNumber.trim(),
        postalCode: postalCode.trim(),
        duesAmount: parseFloat(duesAmount || "0"),
        includedElectric: includedUtilities.electric,
        includedWater: includedUtilities.water,
        includedGas: includedUtilities.gas,
        includedInternet: includedUtilities.internet,
        adminId: 1,
        createdAt: new Date().toISOString(),
        isActive: true,
        lastMaintenanceDate: new Date().toISOString()
      };

      // Bina özellikleri formunu göster
      console.log("Temel bilgiler kaydedildi, bina özellikleri formuna geçiliyor...");
      setShowBuildingFeatures(true);
      setShowForm(false);

    } catch (error) {
      console.log("\n=================== HATA OLUŞTU ===================");
      console.error("❌ Hata detayı:", error);
      logApiError(error, "KAYIT");
      
      Alert.alert("Hata", "Bina bilgileri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
      console.log("=================== İŞLEM TAMAMLANDI ===================\n");
    }
  };

  // Bina özelliklerinden daire bilgilerine geçiş için yeni fonksiyon
  const handleFeaturesSave = () => {
    // Bina özelliklerini kaydet ve daire bilgilerine geç
    const buildingData = {
      buildingName: apartmentName,
      numberOfFloors: parseInt(numberOfFloors),
      totalApartments: parseInt(totalApartments),
      parkingType: buildingFeatures.parking.exists ? buildingFeatures.parking.type : "Yok",
      hasElevator: buildingFeatures.elevator,
      hasPlayground: buildingFeatures.park,
      heatingType: buildingFeatures.heatingSystem,
      poolType: buildingFeatures.pool.exists ? buildingFeatures.pool.type : "Yok",
      hasGym: buildingFeatures.gym,
      buildingAge: parseInt(buildingFeatures.buildingAge) || 0,
      hasGarden: buildingFeatures.garden,
      hasThermalInsulation: buildingFeatures.thermalInsulation,
    };

    handleAddApartmentDetails(buildingData);
    setShowBuildingFeatures(false);
    setShowApartmentDetails(true);
  };

  // Form verilerini sıfırlama fonksiyonu
  const resetForm = () => {
    setApartmentName("");
    setNumberOfFloors(0);
    setTotalApartments("");
    setCity("");
    setDistrict("");
    setNeighborhood("");
    setStreet("");
    setBuildingNumber("");
    setPostalCode("");
    setDuesAmount("");
    setIncludedUtilities({
      electric: false,
      water: false,
      gas: false,
      internet: false
    });
    setBuildingFeatures({
      heating: {
        type: 'central',
        details: ''
      },
      elevator: false,
      parking: {
        exists: false,
        type: null
      },
      pool: {
        exists: false,
        type: null
      },
      gym: false,
      garden: false,
      thermalInsulation: false
    });
    setApartmentUnits([]);
    setBulkRentAmount('5000');
    setBulkDepositAmount('10000');
  };

  const handleAddApartmentDetails = (apartment) => {
    setSelectedApartment(apartment);
    const units = Array.from({ length: apartment.totalApartments }, (_, index) => ({
      unitNumber: index + 1,
      floor: undefined,
      rentAmount: '',
      depositAmount: '',
      type: '',
      hasBalcony: false,
      notes: '',
    }));
    setApartmentUnits(units);
    setUnassignedUnits(Array.from({ length: apartment.totalApartments }, (_, i) => i + 1));
    setShowApartmentDetails(true);
    setCurrentStep('type');
    setSelectedType('');
    setSelectedUnits([]);
    setSelectedFloor(0);
    setSelectedBasementFloor(null);
    setAvailableFloors([0, ...Array.from({ length: apartment.numberOfFloors - 1 }, (_, i) => i + 1)]);
  };

  const handleNext = () => {
    if (currentIndex < apartmentUnits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isFormValid = () => {
    const currentUnit = apartmentUnits[currentIndex];
    
    // Mevcut dairenin zorunlu alanlarının kontrolü
    return currentUnit && 
      currentUnit.rentAmount?.trim() && 
      currentUnit.depositAmount?.trim() && 
      currentUnit.type;  // floor zaten 0 veya daha büyük olacak
  };

  const handleSave = () => {
    // Tüm dairelerin kontrolü
    const allUnitsValid = apartmentUnits.every(unit => 
      unit.rentAmount?.trim() && 
      unit.depositAmount?.trim() && 
      unit.type
    );

    if (!allUnitsValid) {
      Alert.alert(
        "Uyarı", 
        "Lütfen tüm dairelerin kira ve depozito bilgilerini eksiksiz doldurun."
      );
      return;
    }

    // Başarılı kayıt
    console.log('Daire bilgileri kaydedildi:', apartmentUnits);
    Alert.alert(
      "Başarılı",
      "Daire bilgileri başarıyla kaydedildi.",
      [{ 
        text: "Tamam",
        onPress: () => setShowApartmentDetails(false)
      }]
    );
  };

  const fetchCities = async () => {
    try {
      console.log('Fetching cities...');
      const response = await axios.get('https://turkiyeapi.dev/api/v1/provinces');
      
      
      if (response.data.status === "OK") {
        const cityData = response.data.data.map(city => ({
          name: city.name,
          districts: city.districts.map(district => ({
            districtId: district.id,
            name: district.name
          }))
        }));
        setCities(cityData);
        
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleDistrictChange = async (selectedDistrict) => {
    console.log('Selected district:', selectedDistrict);
    setDistrict(selectedDistrict.name);
    setNeighborhood('');
    setFilteredNeighborhoods([]);
    setShowNeighborhoodDropdown(false);
    setShowDistrictDropdown(false);
    
    try {
      console.log('Fetching neighborhoods for district ID:', selectedDistrict.districtId);
      const response = await axios.get('https://turkiyeapi.dev/api/v1/neighborhoods');
     
      
      if (response.data.status === "OK") {
        const districtNeighborhoods = response.data.data
          .filter(n => n.provinceId === selectedDistrict.provinceId && 
                      n.districtId === selectedDistrict.districtId)
          .map(n => n.name);
        
        setNeighborhoods(districtNeighborhoods);
        console.log('Fetched neighborhoods:', districtNeighborhoods);
      }
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      Alert.alert('Hata', 'Mahalle bilgileri alınırken bir hata oluştu.');
    }
  };

  const handleTypeSelection = (type) => {
    if (isSelectingType && type !== selectedType) {
      // Eğer seçim yapılıyorsa ve farklı bir tipe tıklandıysa, işlemi engelle
      return;
    }
    setSelectedType(type);
    setIsSelectingType(true);
  };

  const handleUnitSelection = (unitNumber) => {
    // Sadece atanmamış daireler seçilebilir
    if (!unassignedUnits.includes(unitNumber)) return;

    if (selectedUnits.includes(unitNumber)) {
      setSelectedUnits(selectedUnits.filter(num => num !== unitNumber));
    } else {
      setSelectedUnits([...selectedUnits, unitNumber].sort((a, b) => a - b));
    }
  };

  const handleRangeSelection = (start, end) => {
    const range = Array.from(
      { length: end - start + 1 }, 
      (_, i) => start + i
    );
    setSelectedUnits(range);
  };

  const handleBulkUpdate = () => {
    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      const index = unitNumber - 1;
      updatedUnits[index] = {
        ...updatedUnits[index],
        type: selectedType,
        rentAmount: bulkRentAmount,
        depositAmount: bulkDepositAmount
      };
    });
    setApartmentUnits(updatedUnits);
    // Reset seçimleri
    setSelectedUnits([]);
    setSelectedType('');
    setBulkRentAmount('');
    setBulkDepositAmount('');
    setShowUnitSelector(false);
  };

  const renderApartmentForm = () => (
    <View style={styles.formContainer}>
      <LinearGradient
        colors={Gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.formHeaderGradient}
      >
        <View style={styles.formHeaderContent}>
          <Text style={styles.formHeaderTitle}>Bina Bilgileri</Text>
          <Text style={styles.formHeaderSubtitle}>Lütfen bina bilgilerini giriniz</Text>
        </View>
      </LinearGradient>

      <View style={styles.formContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="apartment" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="Apartman Adı"
              value={apartmentName}
              onChangeText={setApartmentName}
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="layers" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="Kat Sayısı"
              value={numberOfFloors}
              onChangeText={setNumberOfFloors}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="home" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="Toplam Daire Sayısı"
              value={totalApartments}
              onChangeText={setTotalApartments}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Adres Bilgileri</Text>
          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="location-city" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="Şehir"
              value={city}
              onChangeText={setCity}
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="location-on" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="İlçe"
              value={district}
              onChangeText={setDistrict}
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="place" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="Mahalle"
              value={neighborhood}
              onChangeText={setNeighborhood}
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="add-road" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="Sokak"
              value={street}
              onChangeText={setStreet}
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="home" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="Bina No"
              value={buildingNumber}
              onChangeText={setBuildingNumber}
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="local-post-office" size={20} color={Colors.primary} />
            </View>
            <PaperInput
              label="Posta Kodu"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor={Colors.primary}
              theme={{ colors: { background: '#F8FAFC' }}}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Kaydet ve Devam Et</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleHeatingOptionSelect = (value) => {
    setBuildingFeatures(prev => ({
      ...prev,
      heating: {
        ...prev.heating,
        type: value
      }
    }));
  };

  const renderHeatingOptions = () => (
    <View style={styles.featureSection}>
      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Isıtma Sistemi</Text>
        <View style={styles.heatingOptionsContainer}>
          {['central', 'combi', 'floor'].map((option) => {
            const heatingOption = heatingOptions.find(opt => opt.value === option);
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.heatingOptionButton,
                  buildingFeatures.heatingSystem === option && styles.heatingOptionButtonSelected
                ]}
                onPress={() => handleFeatureChange('heatingSystem', option)}
              >
                <Text style={[
                  styles.heatingOptionText,
                  buildingFeatures.heatingSystem === option && styles.heatingOptionTextSelected
                ]}>
                  {heatingOption.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderBuildingFeatures = () => (
    <View style={styles.featuresContainer}>
      <Text style={styles.sectionTitle}>Bina Özellikleri</Text>
      
      {/* Otopark */}
      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Otopark</Text>
        <View style={styles.featureControls}>
          <Animated.View style={[
            styles.radioGroupContainer,
            {
              opacity: parkingAnimation,
              transform: [{
                translateX: parkingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}>
            {buildingFeatures.parking.exists && (
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    buildingFeatures.parking.type === 'open' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleNestedFeatureChange('parking', 'type', 'open')}
                >
                  <Text style={[
                    styles.radioText,
                    buildingFeatures.parking.type === 'open' && styles.radioTextSelected
                  ]}>
                    Açık
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    buildingFeatures.parking.type === 'closed' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleNestedFeatureChange('parking', 'type', 'closed')}
                >
                  <Text style={[
                    styles.radioText,
                    buildingFeatures.parking.type === 'closed' && styles.radioTextSelected
                  ]}>
                    Kapalı
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
          <Switch
            value={buildingFeatures.parking.exists}
            onValueChange={(value) => handleNestedFeatureChange('parking', 'exists', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>
      </View>

      {/* Havuz */}
      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Havuz</Text>
        <View style={styles.featureControls}>
          <Animated.View style={[
            styles.radioGroupContainer,
            {
              opacity: poolAnimation,
              transform: [{
                translateX: poolAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}>
            {buildingFeatures.pool.exists && (
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    buildingFeatures.pool.type === 'open' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleNestedFeatureChange('pool', 'type', 'open')}
                >
                  <Text style={[
                    styles.radioText,
                    buildingFeatures.pool.type === 'open' && styles.radioTextSelected
                  ]}>
                    Açık
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    buildingFeatures.pool.type === 'closed' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleNestedFeatureChange('pool', 'type', 'closed')}
                >
                  <Text style={[
                    styles.radioText,
                    buildingFeatures.pool.type === 'closed' && styles.radioTextSelected
                  ]}>
                    Kapalı
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
          <Switch
            value={buildingFeatures.pool.exists}
            onValueChange={(value) => handleNestedFeatureChange('pool', 'exists', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>
      </View>

      {/* Isıtma Sistemi */}
      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Isıtma Sistemi</Text>
        <View style={styles.radioGroup}>
          {['central', 'combi', 'floor'].map((option) => {
            const heatingOption = heatingOptions.find(opt => opt.value === option);
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioButton,
                  buildingFeatures.heatingSystem === option && styles.radioButtonSelected
                ]}
                onPress={() => handleFeatureChange('heatingSystem', option)}
              >
                <Text style={[
                  styles.radioText,
                  buildingFeatures.heatingSystem === option && styles.radioTextSelected
                ]}>
                  {heatingOption.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Diğer özellikler için Switch'ler */}
      <View style={styles.switchGroup}>
        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Asansör</Text>
          <Switch
            value={buildingFeatures.elevator}
            onValueChange={(value) => handleFeatureChange('elevator', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Park Alanı</Text>
          <Switch
            value={buildingFeatures.park}
            onValueChange={(value) => handleFeatureChange('park', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Spor Salonu</Text>
          <Switch
            value={buildingFeatures.gym}
            onValueChange={(value) => handleFeatureChange('gym', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Bahçe</Text>
          <Switch
            value={buildingFeatures.garden}
            onValueChange={(value) => handleFeatureChange('garden', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Isı Yalıtımı</Text>
          <Switch
            value={buildingFeatures.thermalInsulation}
            onValueChange={(value) => handleFeatureChange('thermalInsulation', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveFeatureButton}
          onPress={handleFeaturesSave}
        >
          <Text style={styles.saveFeatureButtonText}>Kaydet ve Devam Et</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApartmentDetails = () => (
    <View style={styles.detailsContainer}>
      <View style={styles.stepsHeader}>
        {STEPS.map(step => (
          <View key={step.id} style={styles.stepItem}>
            <MaterialIcons
              name={step.icon}
              size={24}
              color={completionStatus[step.id] ? colors.success : colors.darkGray}
            />
            <Text style={styles.stepTitle}>{step.title}</Text>
            {completionStatus[step.id] && (
              <MaterialIcons name="check-circle" size={16} color={colors.success} />
            )}
          </View>
        ))}
      </View>

      <Text style={styles.detailsTitle}>
        {selectedApartment.apartmentName} - {STEPS.find(s => s.id === currentStep).title}
      </Text>

      {currentStep === 'type' && (
        <View style={styles.typeSelectionContainer}>
          <View style={styles.typeButtonsContainer}>
            {APARTMENT_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedType === type && styles.selectedTypeButton
                ]}
                onPress={() => handleTypeSelect(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  selectedType === type && styles.selectedTypeButtonText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.unitsGrid}>
            {Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1).map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(num) && styles.selectedUnitButton,
                  apartmentUnits[num-1].type && styles.completedUnitButton,
                  !unassignedUnits.includes(num) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(num)}
                disabled={!unassignedUnits.includes(num) || !selectedType} // Tip seçilmeden daire seçilemez
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(num) && styles.selectedUnitButtonText,
                  apartmentUnits[num-1].type && styles.completedUnitButtonText
                ]}>
                  {num}
                </Text>
                {apartmentUnits[num-1].type && (
                  <Text style={styles.unitTypeText}>
                    {apartmentUnits[num-1].type}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyType}
              style={styles.applyButton}
            >
              Seçili Dairelere Uygula
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'floor' && (
        <View style={styles.floorContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.remainingText}>
              {unassignedUnits.length} daire için kat bilgisi girilmesi gerekiyor
            </Text>
          </View>

          <View style={styles.floorSelectorContainer}>
            <TouchableOpacity
              style={styles.floorArrowButton}
              onPress={() => handleFloorChange(selectedFloor - 1)}
              disabled={selectedFloor <= 0}
            >
              <MaterialIcons 
                name="keyboard-arrow-left" 
                size={24} 
                color={selectedFloor <= 0 ? colors.lightGray : colors.primary} 
              />
            </TouchableOpacity>

            <View style={styles.currentFloorContainer}>
              <Text style={styles.currentFloorText}>
                {selectedFloor === 0 ? 'Zemin Kat' : `${selectedFloor}. Kat`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.floorArrowButton}
              onPress={() => handleFloorChange(selectedFloor + 1)}
              disabled={selectedFloor >= selectedApartment.numberOfFloors - 1}
            >
              <MaterialIcons 
                name="keyboard-arrow-right" 
                size={24} 
                color={selectedFloor >= selectedApartment.numberOfFloors - 1 ? colors.lightGray : colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.floorsGrid}>
            <View style={styles.floorUnits}>
              {apartmentUnits
                .filter(unit => unit.floor === undefined || unit.floor === selectedFloor)
                .map(unit => (
                  <TouchableOpacity
                    key={unit.unitNumber}
                    style={[
                      styles.unitButton,
                      selectedUnits.includes(unit.unitNumber) && styles.selectedUnitButton,
                      unit.floor !== undefined && styles.completedUnitButton,
                      !unassignedUnits.includes(unit.unitNumber) && styles.inactiveUnitButton
                    ]}
                    onPress={() => handleUnitSelection(unit.unitNumber)}
                    disabled={!unassignedUnits.includes(unit.unitNumber) || selectedFloor === null}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      selectedUnits.includes(unit.unitNumber) && styles.selectedUnitButtonText
                    ]}>
                      {unit.unitNumber}
                    </Text>
                    {unit.type && (
                      <Text style={styles.unitTypeText}>{unit.type}</Text>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {selectedUnits.length > 0 && selectedFloor !== null && (
            <PaperButton
              mode="contained"
              onPress={() => handleApplyFloor(selectedFloor)}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireyi {selectedFloor === 0 ? 'Zemin Kata' : `${selectedFloor}. Kata`} Yerleştir
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'balcony' && (
        <View style={styles.balconyContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Balkon Bilgisi</Text>
            <Text style={styles.remainingText}>
              Balkonu olan daireleri seçin
            </Text>
          </View>

          <View style={styles.unitsGrid}>
            {apartmentUnits.map(unit => (
              <TouchableOpacity
                key={unit.unitNumber}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(unit.unitNumber) && styles.selectedUnitButton,
                  unit.hasBalcony && styles.balconyUnitButton,
                  !unassignedUnits.includes(unit.unitNumber) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(unit.unitNumber)}
                disabled={!unassignedUnits.includes(unit.unitNumber)}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(unit.unitNumber) && styles.selectedUnitButtonText,
                  unit.hasBalcony && styles.balconyUnitText
                ]}>
                  {unit.unitNumber}
                </Text>
                <Text style={styles.unitDetailText}>
                  {unit.floor === 0 ? 'Zemin' : `${unit.floor}. Kat`}
                </Text>
                {unit.hasBalcony && (
                  <MaterialIcons name="deck" size={16} color={colors.success} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyBalcony}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireye Balkon Ekle
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'rent' && (
        <View style={styles.rentContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Kira Miktarı</Text>
            <Text style={styles.remainingText}>
              {unassignedUnits.length} daire için kira bilgisi girilmesi gerekiyor
            </Text>
          </View>

          <View style={styles.amountInputContainer}>
            <PaperInput
              mode="outlined"
              label="Kira Miktarı (₺)"
              value={bulkRentAmount}
              onChangeText={setBulkRentAmount}
              keyboardType="numeric"
              style={styles.amountInput}
              right={<PaperInput.Affix text="₺" />}
            />
          </View>

          <View style={styles.unitsGrid}>
            {Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1).map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(num) && styles.selectedUnitButton,
                  apartmentUnits[num-1].rentAmount && styles.completedUnitButton,
                  !unassignedUnits.includes(num) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(num)}
                disabled={!unassignedUnits.includes(num) || !bulkRentAmount}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(num) && styles.selectedUnitButtonText,
                  apartmentUnits[num-1].rentAmount && styles.completedUnitButtonText
                ]}>
                  {num}
                </Text>
                {apartmentUnits[num-1].rentAmount && (
                  <Text style={styles.unitAmountText}>
                    {apartmentUnits[num-1].rentAmount}₺
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyRent}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireye Uygula
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'deposit' && (
        <View style={styles.depositContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Depozito Miktarı</Text>
            <Text style={styles.remainingText}>
              {unassignedUnits.length} daire için depozito bilgisi girilmesi gerekiyor
            </Text>
          </View>

          <View style={styles.amountInputContainer}>
            <PaperInput
              mode="outlined"
              label="Depozito Miktarı (₺)"
              value={bulkDepositAmount}
              onChangeText={setBulkDepositAmount}
              keyboardType="numeric"
              style={styles.amountInput}
              right={<PaperInput.Affix text="₺" />}
            />
          </View>

          <View style={styles.unitsGrid}>
            {Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1).map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(num) && styles.selectedUnitButton,
                  apartmentUnits[num-1].depositAmount && styles.completedUnitButton,
                  !unassignedUnits.includes(num) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(num)}
                disabled={!unassignedUnits.includes(num) || !bulkDepositAmount}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(num) && styles.selectedUnitButtonText,
                  apartmentUnits[num-1].depositAmount && styles.completedUnitButtonText
                ]}>
                  {num}
                </Text>
                {apartmentUnits[num-1].depositAmount && (
                  <Text style={styles.unitAmountText}>
                    {apartmentUnits[num-1].depositAmount}₺
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyDeposit}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireye Uygula
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'notes' && (
        <View style={styles.notesContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Ek Notlar</Text>
            <Text style={styles.remainingText}>
              İsteğe bağlı olarak dairelere not ekleyebilirsiniz
            </Text>
          </View>

          <View style={styles.notesInputContainer}>
            <PaperInput
              mode="outlined"
              label="Daire Notu"
              value={bulkNotes}
              onChangeText={setBulkNotes}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </View>

          <View style={styles.unitsGrid}>
            {Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1).map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(num) && styles.selectedUnitButton,
                  apartmentUnits[num-1].notes && styles.completedUnitButton,
                  !unassignedUnits.includes(num) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(num)}
                disabled={!unassignedUnits.includes(num) || !bulkNotes}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(num) && styles.selectedUnitButtonText,
                  apartmentUnits[num-1].notes && styles.completedUnitButtonText
                ]}>
                  {num}
                </Text>
                {apartmentUnits[num-1].notes && (
                  <Text style={styles.unitAmountText}>
                    {apartmentUnits[num-1].notes}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyNotes}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireye Uygula
            </PaperButton>
          )}
        </View>
      )}

      <View style={styles.navigationButtons}>
        {currentStep !== 'type' && (
          <PaperButton
            mode="outlined"
            onPress={handlePreviousStep}
            style={styles.navButton}
          >
            Önceki
          </PaperButton>
        )}
        <PaperButton
          mode="contained"
          onPress={handleNextStep}
          style={[styles.navButton, styles.primaryButton]}
        >
          Tamamla
        </PaperButton>
      </View>
    </View>
  );

  const renderNoApartmentMessage = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Gradients.indigo[0]} />
      <LinearGradient
        colors={Gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.animationContainer}>
            <LottieView 
              source={animate} 
              autoPlay 
              loop 
              style={styles.animation}
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Bina Bilgileri</Text>
            <Text style={styles.headerSubtitle}>
              {apartments.length > 0 
                ? `${apartments.length} bina kayıtlı`
                : 'Henüz bina eklemediniz'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {apartments.length > 0 ? (
        <View style={styles.listContainer}>
          {apartments.map((apartment, index) => (
            <TouchableOpacity
              key={index}
              style={styles.apartmentCard}
              onPress={() => {
                setSelectedApartment(apartment);
                setShowApartmentDetails(true);
              }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.buildingName}>{apartment.buildingName}</Text>
                  <Text style={styles.address}>
                    {apartment.street} No:{apartment.buildingNumber}, {apartment.neighborhood}
                  </Text>
                  <Text style={styles.address}>
                    {apartment.district}/{apartment.city}
                  </Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditApartment(apartment)}
                  >
                    <MaterialIcons name="edit" size={24} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteApartment(index)}
                  >
                    <MaterialIcons name="delete" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="apartment" size={20} color={colors.darkGray} />
                  <Text style={styles.infoText}>{`${apartment.numberOfFloors} Kat`}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="home" size={20} color={colors.darkGray} />
                  <Text style={styles.infoText}>{`${apartment.totalApartments} Daire`}</Text>
                </View>
                {apartment.duesAmount && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="account-balance-wallet" size={20} color={colors.darkGray} />
                    <Text style={styles.infoText}>{`Aidat: ${apartment.duesAmount}₺`}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardFooter}>
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() => {
                    setSelectedApartment(apartment);
                    setShowApartmentDetails(true);
                  }}
                >
                  <Text style={styles.detailsButtonText}>Detayları Görüntüle</Text>
                  <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>
            Yeni bina eklemek için sağ alttaki butona tıklayın
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          console.log('Add button pressed');
          resetForm(); // Formu sıfırla
          setShowForm(true); // Formu göster
        }}
      >
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const handleApplyType = () => {
    if (!selectedType || selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        type: selectedType
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);
    setIsSelectingType(false); // Seçim modunu kapat
    
    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, type: true }));
      setSelectedType('');
    }
  };

  const handleNextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
      // Yeni adım için atanmamış daireleri ayarla
      const nextStep = STEPS[currentIndex + 1].id;
      const unassigned = Array.from(
        { length: selectedApartment.totalApartments },
        (_, i) => i + 1
      ).filter(num => {
        const unit = apartmentUnits[num - 1];
        switch (nextStep) {
          case 'type':
            return !unit.type;
          case 'floor':
            return unit.floor === undefined;
          case 'rent':
            return !unit.rentAmount;
          case 'deposit':
            return !unit.depositAmount;
          case 'notes':
            return !unit.notes && nextStep !== 'notes';
          default:
            return true;
        }
      });
      setUnassignedUnits(unassigned);
    } else {
      // Son adımdaysak, apartman listesine ekle
      handleComplete();
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 'type':
        return completionStatus.type;
      case 'floor':
        return completionStatus.floor;
      case 'rent':
        return completionStatus.rent;
      case 'deposit':
        return completionStatus.deposit;
      case 'notes':
        return true;
      default:
        return false;
    }
  };

  const isLastStep = () => {
    return currentStep === STEPS[STEPS.length - 1].id;
  };

  const handleApplyRent = () => {
    if (!bulkRentAmount || selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        rentAmount: bulkRentAmount
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);
    setBulkRentAmount('');

    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, rent: true }));
    }
  };

  const handleApplyDeposit = () => {
    if (!bulkDepositAmount || selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        depositAmount: bulkDepositAmount
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);
    setBulkDepositAmount('');

    // Tüm daireler için depozito atandıysa adımı tamamla
    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, deposit: true }));
    }
  };

  const handleApplyNotes = () => {
    if (!bulkNotes || selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        notes: bulkNotes
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);
    setBulkNotes('');

    // Tüm daireler için not atandıysa adımı tamamla
    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, notes: true }));
    }
  };

  const handleApplyFloor = (floor) => {
    if (selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        floor: floor
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);

    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, floor: true }));
    }
  };

  const handleApplyBalcony = () => {
    if (selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        hasBalcony: true
      };
    });
    setApartmentUnits(updatedUnits);
    
    setSelectedUnits([]);
    setCompletionStatus(prev => ({ ...prev, balcony: true }));
  };

  const handleComplete = () => {
    Alert.alert(
      'Başarılı',
      'Bina bilgileri başarıyla kaydedildi. Finansal bilgileri girmek için bir sonraki adıma geçebilirsiniz.',
      [
        {
          text: 'Tamam',
          onPress: () => {
            navigation.navigate('AdminCreate', {
              screen: 'FinancialInfo'
            });
          }
        }
      ]
    );
  };

  const handleFloorChange = (newFloor) => {
    if (newFloor >= 0 && newFloor < selectedApartment.numberOfFloors) {
      setSelectedFloor(newFloor);
      setSelectedUnits([]);
    }
  };

  const generateFloorList = (totalFloors, hasBasement = false) => {
    let floors = [];
    if (hasBasement) {
      floors.push(-1); // Bodrum kat
    }
    floors.push(0); // Zemin kat
    for (let i = 1; i <= totalFloors - (hasBasement ? 2 : 1); i++) {
      floors.push(i);
    }
    return floors;
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    
    // Seçilen tipi ayarla
    setSelectedType(type);
    
    // Tüm daireleri seçilebilir yap
    const availableUnits = Array.from(
      { length: selectedApartment.totalApartments },
      (_, i) => i + 1
    );
    setUnassignedUnits(availableUnits);
    
    // Seçili daireleri sıfırla
    setSelectedUnits([]);
  };

  const renderApartmentList = () => {
    return (
      <View style={styles.listContainer}>
        {apartments.map((apartment, index) => (
          <TouchableOpacity
            key={index}
            style={styles.apartmentCard}
            onPress={() => {
              setSelectedApartment(apartment);
              setShowApartmentDetails(true);
            }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.buildingName}>{apartment.buildingName}</Text>
              <Text style={styles.address}>{apartment.address}</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <MaterialIcons name="apartment" size={20} color={Colors.text.secondary} />
                <Text style={styles.infoText}>{`${apartment.totalFloors} Kat`}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="home" size={20} color={Colors.text.secondary} />
                <Text style={styles.infoText}>{`${apartment.totalUnits} Daire`}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <MaterialIcons name="chevron-right" size={24} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleEditApartment = (apartment) => {
    // Form alanlarını seçilen apartman bilgileriyle doldur
    setApartmentName(apartment.apartmentName);
    setNumberOfFloors(apartment.numberOfFloors.toString());
    setTotalApartments(apartment.totalApartments.toString());
    setCity(apartment.city);
    setDistrict(apartment.district);
    setNeighborhood(apartment.neighborhood);
    setStreet(apartment.street);
    setBuildingNumber(apartment.buildingNumber);
    setPostalCode(apartment.postalCode);
    setIncludedUtilities(apartment.includedUtilities);
    setDuesAmount(apartment.duesAmount || '');

    // Eğer daire bilgileri varsa onları da ayarla
    if (apartment.units) {
      setApartmentUnits(apartment.units);
      // Tamamlanmış adımları işaretle
      const completed = {
        type: apartment.units.every(unit => unit.type),
        floor: apartment.units.every(unit => unit.floor !== undefined),
        balcony: true, // Balkon bilgisi opsiyonel
        rent: apartment.units.every(unit => unit.rentAmount),
        deposit: apartment.units.every(unit => unit.depositAmount),
        notes: true // Notlar opsiyonel
      };
      setCompletionStatus(completed);
    }

    // Seçili apartmanı güncelle
    setSelectedApartment(apartment);
    
    // Form ekranını aç
    setShowForm(true);
    
    // Daire detayları ekranını kapat
    setShowApartmentDetails(false);
  };

  const handleDeleteApartment = (index) => {
    Alert.alert(
      "Apartmanı Sil",
      "Bu apartmanı silmek istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            setApartments(prevApartments => {
              const updatedApartments = [...prevApartments];
              updatedApartments.splice(index, 1);
              return updatedApartments;
            });
            Alert.alert("Başarılı", "Apartman başarıyla silindi.");
          }
        }
      ]
    );
  };

  // Apartman bilgilerini sıfırla
  const resetApartment = async () => {
    try {
      await AsyncStorage.removeItem('savedApartment');
      // Tüm state'leri sıfırla
      setApartmentName('');
      setNumberOfFloors('');
      setTotalApartments('');
      // ... diğer state'leri sıfırla
      Alert.alert('Başarılı', 'Apartman bilgileri sıfırlandı');
    } catch (error) {
      console.error('Apartman bilgileri sıfırlanırken hata:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Gradients.indigo[0]} />
      
      {/* Sabit Header */}
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
            <Text style={styles.headerTitle}>Bina Bilgileri</Text>
            <Text style={styles.headerSubtitle}>
              {apartments.length > 0 
                ? `${apartments.length} bina kayıtlı`
                : 'Henüz bina eklemediniz'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Kaydırılabilir İçerik */}
      <KeyboardAvoidingView 
        style={styles.contentContainer} 
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
          {showApartmentDetails ? (
            renderApartmentDetails()
          ) : showBuildingFeatures ? (
            renderBuildingFeatures()
          ) : showForm ? (
            renderApartmentForm()
          ) : (
            renderNoApartmentMessage()
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Finans ekranına geçiş butonu */}
      <TouchableOpacity
        style={styles.financeButton}
        onPress={() => {
          navigation.navigate('AdminCreate', {
            screen: 'FinancialInfo'
          });
        }}
      >
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.financeButtonGradient}
        >
          <Text style={styles.financeButtonText}>Finansal Bilgilere Geç</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: 260,
  },
  scrollViewContent: {
    paddingTop: 20,
  },
  // ... diğer stiller aynı kalacak ...
});

export default ApartmentInfoScreen;

