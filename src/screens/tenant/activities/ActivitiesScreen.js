import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api, API_ENDPOINTS } from '../../../config/apiConfig';
import { getCurrentUserId } from '../../../config/apiConfig';
import { Surface } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

const ActivityCard = ({ title, description, date, icon, gradient, status, amount }) => (
  <Surface style={[styles.card, { backgroundColor: "transparent" }]} elevation={5}>
    <View style={{ overflow: 'hidden', borderRadius: 16 }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            {status && (
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Text style={styles.statusText}>{status.text}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.cardDescription}>{description}</Text>
        {amount && (
          <Text style={styles.cardAmount}>
            {formatCurrency(amount)}
          </Text>
        )}
        <View style={styles.cardFooter}>
          <Ionicons name="time" size={16} color="#fff" />
          <Text style={styles.cardDate}>
            {new Date(date).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </LinearGradient>
    </View>
  </Surface>
);

const EmptyStateCard = ({ title, icon, gradient }) => (
  <Surface style={[styles.card, { backgroundColor: "transparent" }]} elevation={5}>
    <View style={{ overflow: 'hidden', borderRadius: 16 }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      />
      <View style={styles.emptyCardContent}>
        <View style={styles.emptyCardIconContainer}>
          <Ionicons name={icon} size={32} color="#666" />
        </View>
        <Text style={styles.emptyCardText}>{title}</Text>
      </View>
    </View>
  </Surface>
);

const ActivitiesScreen = () => {
  const [activitiesData, setActivitiesData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'bank',
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivitiesData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      console.log('Fetching activities for user:', userId);
      const response = await api.get(API_ENDPOINTS.TENANT.ACTIVITIES(userId));
      
      console.log('Activities response:', response.data);
      
      if (response.data.success) {
        setActivitiesData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activities data:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      if (error.response?.status === 400) {
        Alert.alert(
          'Veri Hatası',
          'Aktivite bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      }
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      console.log('Fetching payment history for user:', userId);
      const response = await api.get(API_ENDPOINTS.TENANT.NEXT_PAYMENTS(userId));
      
      console.log('Payment history response:', response.data);
      
      if (response.data.success) {
        const unpaidPayments = response.data.data.filter(payment => !payment.isPaid);
        setPaymentHistory(unpaidPayments);
      }
    } catch (error) {
      console.error('Error fetching payment history:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      if (error.response?.status === 400) {
        Alert.alert(
          'Veri Hatası',
          'Ödeme bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      }
    }
  };

  const handlePayment = async (payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPayment) return;

    // Form validasyonu
    if (!paymentForm.cardNumber || !paymentForm.cardHolderName || !paymentForm.expiryDate || !paymentForm.cvv) {
      Alert.alert('Hata', 'Lütfen tüm kart bilgilerini doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı. Lütfen tekrar giriş yapın.');
      }

      console.log('=== Ödeme İsteği Detayları ===');
      console.log('User ID from AsyncStorage:', userId);
      console.log('Selected Payment:', selectedPayment);
      
      const paymentUrl = API_ENDPOINTS.TENANT.MAKE_PAYMENT(userId, selectedPayment.id);
      console.log('Payment URL:', paymentUrl);

      const response = await api.post(
        paymentUrl,
        paymentForm,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'Ödeme işlemi başarıyla tamamlandı.');
        setIsPaymentModalVisible(false);
        fetchPaymentHistory();
      }
    } catch (error) {
      console.error('Ödeme işlemi sırasında hata:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
        url: error.config?.url
      });
      
      if (error.message.includes('Kullanıcı ID bulunamadı')) {
        Alert.alert(
          'Oturum Hatası',
          'Oturumunuz sona ermiş olabilir. Lütfen tekrar giriş yapın.',
          [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert(
          'Ödeme Hatası',
          'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesData();
    fetchPaymentHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchActivitiesData(), fetchPaymentHistory()])
      .finally(() => setRefreshing(false));
  };

  if (!activitiesData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderPaymentModal = () => (
    <Modal
      visible={isPaymentModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsPaymentModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ödeme Yap</Text>
              <TouchableOpacity
                onPress={() => setIsPaymentModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kart Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber}
                onChangeText={(text) => setPaymentForm({...paymentForm, cardNumber: text.replace(/\D/g, '')})}
                keyboardType="numeric"
                maxLength={16}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kart Sahibi</Text>
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                value={paymentForm.cardHolderName}
                onChangeText={(text) => setPaymentForm({...paymentForm, cardHolderName: text})}
              />
            </View>

            <View style={styles.rowInputContainer}>
              <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
                <Text style={styles.inputLabel}>Son Kullanma Tarihi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY"
                  value={paymentForm.expiryDate}
                  onChangeText={(text) => setPaymentForm({...paymentForm, expiryDate: text.replace(/\D/g, '')})}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <View style={[styles.inputContainer, {flex: 1}]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChangeText={(text) => setPaymentForm({...paymentForm, cvv: text.replace(/\D/g, '')})}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handlePaymentSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Ödeniyor...' : `${formatCurrency(selectedPayment?.totalAmount)} Öde`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderPaymentHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ödenmemiş Ödemeler</Text>
      {paymentHistory.length > 0 ? (
        paymentHistory.map((payment) => (
          <TouchableOpacity
            key={payment.id}
            onPress={() => handlePayment(payment)}
          >
            <ActivityCard
              title={payment.description}
              description={`${payment.paymentType} - ${payment.isPaid ? 'Ödendi' : 'Bekliyor'}`}
              date={payment.paymentDate}
              icon="cash"
              gradient={payment.isPaid ? ['#4CAF50', '#45a049'] : ['#FFC107', '#FFA000']}
              status={{
                text: payment.isPaid ? 'Ödendi' : 'Öde',
                color: payment.isPaid ? '#4CAF50' : '#FFC107',
              }}
              amount={payment.totalAmount}
            />
          </TouchableOpacity>
        ))
      ) : (
        <EmptyStateCard
          title="Ödenmemiş ödeme bulunmuyor"
          icon="cash-outline"
          gradient={['#4CAF50', '#45a049']}
        />
      )}
    </View>
  );

  const renderMeetingHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Toplantı Geçmişi</Text>
      {activitiesData.meetingHistory.length > 0 ? (
        activitiesData.meetingHistory.map((meeting) => (
          <ActivityCard
            key={meeting.id}
            title={meeting.title}
            description={meeting.description}
            date={meeting.meetingDate}
            icon="calendar"
            gradient={['#2196F3', '#1976D2']}
          />
        ))
      ) : (
        <EmptyStateCard
          title="Henüz toplantı geçmişi bulunmuyor"
          icon="calendar-outline"
          gradient={['#2196F3', '#1976D2']}
        />
      )}
    </View>
  );

  const renderSurveyHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Anket Geçmişi</Text>
      {activitiesData.surveyHistory.length > 0 ? (
        activitiesData.surveyHistory.map((survey) => (
          <ActivityCard
            key={survey.id}
            title={survey.title}
            description={survey.description}
            date={survey.startDate}
            icon="clipboard"
            gradient={survey.isActive ? ['#9C27B0', '#7B1FA2'] : ['#757575', '#616161']}
            status={
              survey.isActive
                ? { text: 'Aktif', color: '#4CAF50' }
                : { text: 'Tamamlandı', color: '#757575' }
            }
          />
        ))
      ) : (
        <EmptyStateCard
          title="Henüz anket geçmişi bulunmuyor"
          icon="clipboard-outline"
          gradient={['#9C27B0', '#7B1FA2']}
        />
      )}
    </View>
  );

  const renderComplaintHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Şikayet Geçmişi</Text>
      {activitiesData.complaintHistory.length > 0 ? (
        activitiesData.complaintHistory.map((complaint) => (
          <ActivityCard
            key={complaint.id}
            title={complaint.title}
            description={complaint.description}
            date={complaint.createdDate}
            icon="alert-circle"
            gradient={
              complaint.isResolved
                ? ['#4CAF50', '#45a049']
                : complaint.isInProgress
                ? ['#FFC107', '#FFA000']
                : ['#FF5722', '#F4511E']
            }
            status={{
              text: complaint.isResolved
                ? 'Çözüldü'
                : complaint.isInProgress
                ? 'İşlemde'
                : 'Bekliyor',
              color: complaint.isResolved
                ? '#4CAF50'
                : complaint.isInProgress
                ? '#FFC107'
                : '#FF5722',
            }}
          />
        ))
      ) : (
        <EmptyStateCard
          title="Henüz şikayet geçmişi bulunmuyor"
          icon="alert-circle-outline"
          gradient={['#FF5722', '#F4511E']}
        />
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderPaymentHistory()}
      {renderMeetingHistory()}
      {renderSurveyHistory()}
      {renderComplaintHistory()}
      {renderPaymentModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    fontFamily: 'Lato-Bold',
  },
  card: {
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Lato-Bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Lato-Bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
    fontFamily: 'Lato-Regular',
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    fontFamily: 'Lato-Bold',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  cardDate: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginLeft: 5,
    fontFamily: 'Lato-Regular',
  },
  gradientBorder: {
    height: 2,
    width: '100%',
  },
  emptyCardContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyCardText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  rowInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default ActivitiesScreen; 