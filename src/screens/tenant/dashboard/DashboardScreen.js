import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { api, API_ENDPOINTS } from '../../../config/apiConfig';
import { getCurrentUserId } from '../../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as jwt_decode from 'jwt-decode';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isComplaintModalVisible, setIsComplaintModalVisible] = useState(false);
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const fetchDashboardData = async () => {
    try {
      const userId = getCurrentUserId();
      console.warn('\n=== Dashboard Verileri Çekiliyor ===');
      console.warn('Kullanıcı ID:', userId);

      const token = await AsyncStorage.getItem('authToken');
      console.warn('Token:', token ? 'Mevcut' : 'Bulunamadı');
      
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      // Token decode işlemi
      try {
        const decoded = jwt_decode.jwtDecode(token);
        console.warn('Token içeriği:', decoded);
        console.warn('Token geçerlilik süresi:', new Date(decoded.exp * 1000));
        console.warn('Kalan süre:', (decoded.exp * 1000 - Date.now()) / 1000 / 60, 'dakika');
      } catch (decodeError) {
        console.error('Token decode hatası:', decodeError);
        throw new Error('Token geçersiz veya bozuk');
      }

      console.warn('\nAPI İsteği Yapılıyor...');
      console.warn('Endpoint:', API_ENDPOINTS.TENANT.DASHBOARD(userId));
      
      const response = await axios.get(
        API_ENDPOINTS.TENANT.DASHBOARD(userId),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.warn('\n=== API Yanıtı ===');
      console.warn('Status:', response.status);
      console.warn('Data:', response.data);

      if (response.data.success) {
        const data = response.data.data;
        console.warn('\n=== Daire Bilgileri ===');
        console.warn('Daire ID:', data.apartment?.id);
        console.warn('Bina ID:', data.building?.id);
        console.warn('Daire No:', data.apartment?.unitNumber);

        if (!data.building?.id) {
          console.error('⚠️ Bina ID bulunamadı!');
          Alert.alert(
            'Hata',
            'Daire bilgileriniz eksik. Lütfen yöneticinizle iletişime geçin.',
            [
              {
                text: 'Tamam',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'LoginScreen' }],
                  });
                },
              },
            ]
          );
          return;
        }

        setDashboardData(data);
      } else {
        throw new Error(response.data.message || 'Veriler alınamadı');
      }
    } catch (error) {
      console.error('\n=== Dashboard Veri Hatası ===');
      console.error('Hata Mesajı:', error.message);
      console.error('Hata Detayları:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      console.error('Tam Hata:', error);
      
      if (error.response?.status === 401) {
        Alert.alert(
          'Oturum Hatası',
          'Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.',
          [
            {
              text: 'Tamam',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'LoginScreen' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const renderProfileCard = () => {
    if (!dashboardData?.profile) return null;
    const { profile } = dashboardData;

    return (
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}
      >
        <BlurView intensity={20} tint="light" style={styles.profileBlur}>
          <View style={styles.profileContent}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profile.profileImageUrl }}
                style={styles.profileImage}
              />
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileImageBorder}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.fullName}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
            <View style={styles.profileStatus}>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.statusText}>Aktif</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    );
  };

  const renderContractCard = () => {
    if (!dashboardData?.contract) return null;
    const { contract } = dashboardData;

    return (
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <BlurView intensity={20} tint="light" style={styles.cardBlur}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color="#6366F1" />
            <Text style={styles.cardTitle}>Sözleşme Bilgileri</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Başlangıç</Text>
              <Text style={styles.infoValue}>{formatDate(contract.startDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bitiş</Text>
              <Text style={styles.infoValue}>{formatDate(contract.endDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aylık Kira</Text>
              <Text style={styles.infoValue}>{formatCurrency(contract.monthlyRent)}</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    );
  };

  const renderApartmentCard = () => {
    if (!dashboardData?.apartment) return null;
    const { apartment } = dashboardData;

    return (
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <BlurView intensity={20} tint="light" style={styles.cardBlur}>
          <View style={styles.cardHeader}>
            <Ionicons name="home" size={24} color="#6366F1" />
            <Text style={styles.cardTitle}>Daire Bilgileri</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Daire No</Text>
              <Text style={styles.infoValue}>{apartment.unitNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kat</Text>
              <Text style={styles.infoValue}>{apartment.floor}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tip</Text>
              <Text style={styles.infoValue}>{apartment.type}</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    );
  };

  const renderPaymentCard = () => {
    if (!dashboardData?.paymentSummary) return null;
    const { paymentSummary } = dashboardData;

    return (
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <BlurView intensity={20} tint="light" style={styles.cardBlur}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={24} color="#6366F1" />
            <Text style={styles.cardTitle}>Ödeme Özeti</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sonraki Ödeme</Text>
              <Text style={styles.infoValue}>{formatCurrency(paymentSummary.nextPaymentAmount)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tarih</Text>
              <Text style={styles.infoValue}>{formatDate(paymentSummary.nextPaymentDate)}</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    );
  };

  const renderAdminCard = () => {
    if (!dashboardData?.admin) return null;
    const { admin } = dashboardData;

    return (
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <BlurView intensity={20} tint="light" style={styles.cardBlur}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#6366F1" />
            <Text style={styles.cardTitle}>Yönetici Bilgileri</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ad Soyad</Text>
              <Text style={styles.infoValue}>{admin.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-posta</Text>
              <Text style={styles.infoValue}>{admin.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefon</Text>
              <Text style={styles.infoValue}>{admin.phoneNumber}</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    );
  };

  const data = [
    { id: 'profile', render: renderProfileCard },
    { id: 'contract', render: renderContractCard },
    { id: 'apartment', render: renderApartmentCard },
    { id: 'payment', render: renderPaymentCard },
    { id: 'admin', render: renderAdminCard },
  ];

  const handleCreateComplaint = async () => {
    if (!complaintTitle.trim() || !complaintDescription.trim()) {
      Alert.alert('Uyarı', 'Lütfen başlık ve açıklama alanlarını doldurun.');
      return;
    }

    if (!dashboardData?.profile?.buildingId) {
      console.error('\n=== Daire Bilgisi Hatası ===');
      console.error('Dashboard Data:', dashboardData);
      console.error('Profile Data:', dashboardData?.profile);
      Alert.alert(
        'Bilgi Eksik',
        'Daire bilgileriniz eksik görünüyor. Lütfen yöneticinizle iletişime geçin.\n\nYönetici Bilgileri:\nAd: ' + dashboardData?.admin?.fullName + '\nTelefon: ' + dashboardData?.admin?.phoneNumber,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setIsComplaintModalVisible(false);
            },
          },
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      console.warn('\n===========================================');
      console.warn('🔄 ŞİKAYET OLUŞTURMA İŞLEMİ BAŞLADI');
      console.warn('===========================================');
      console.warn('📝 Başlık:', complaintTitle);
      console.warn('📝 Açıklama:', complaintDescription);
      console.warn('🏢 Building ID:', dashboardData.profile.buildingId);
      console.warn('🏠 Daire ID:', dashboardData.apartment.id);
      console.warn('🏠 Daire No:', dashboardData.apartment.unitNumber);

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token bulunamadı. Lütfen tekrar giriş yapın.');
      }

      console.warn('\n📡 API İsteği Gönderiliyor...');
      console.warn('🔗 Endpoint:', API_ENDPOINTS.COMPLAINT.CREATE);
      console.warn('🔑 Token:', token.substring(0, 20) + '...');

      const response = await axios.post(
        API_ENDPOINTS.COMPLAINT.CREATE,
        {
          title: complaintTitle,
          description: complaintDescription,
          buildingId: dashboardData.profile.buildingId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.warn('\n✅ API Yanıtı Alındı');
      console.warn('📦 Yanıt:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.warn('\n🎉 Şikayet başarıyla oluşturuldu');
        Alert.alert('Başarılı', 'Şikayetiniz başarıyla oluşturuldu.');
        setComplaintTitle('');
        setComplaintDescription('');
        setIsComplaintModalVisible(false);
        // Şikayet listesini yenile
        fetchDashboardData();
      } else {
        throw new Error(response.data.message || 'Şikayet oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('\n❌ ŞİKAYET OLUŞTURMA HATASI');
      console.error('===========================================');
      console.error('Hata Mesajı:', error.message);
      console.error('Hata Detayları:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      console.error('===========================================');

      if (error.response?.status === 401) {
        Alert.alert(
          'Oturum Hatası',
          'Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.',
          [
            {
              text: 'Tamam',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'LoginScreen' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Hata',
          error.response?.data?.message || 'Şikayet oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderComplaintModal = () => (
    <Modal
      visible={isComplaintModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsComplaintModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <BlurView intensity={50} tint="light" style={styles.modalBlur}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Şikayet</Text>
              <TouchableOpacity
                onPress={() => setIsComplaintModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Başlık</Text>
              <TextInput
                style={styles.input}
                placeholder="Şikayet başlığı"
                value={complaintTitle}
                onChangeText={setComplaintTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Şikayet detayları"
                value={complaintDescription}
                onChangeText={setComplaintDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleCreateComplaint}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Gönderiliyor...' : 'Şikayet Oluştur'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.render()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsComplaintModalVisible(true)}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {renderComplaintModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
  },
  profileCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  profileBlur: {
    padding: 16,
  },
  profileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  profileImageBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 32,
    zIndex: -1,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardBlur: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 106,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default DashboardScreen;

