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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api, API_ENDPOINTS } from '../../../config/apiConfig';
import { getCurrentUserId } from '../../../config/apiConfig';
import { Surface } from 'react-native-paper';

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
            {new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            }).format(amount)}
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

  const fetchActivitiesData = async () => {
    try {
      const userId = getCurrentUserId();
      const response = await api.get(API_ENDPOINTS.TENANT.ACTIVITIES(userId));
      setActivitiesData(response.data.data);
    } catch (error) {
      console.error('Error fetching activities data:', error);
    }
  };

  useEffect(() => {
    fetchActivitiesData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivitiesData().finally(() => setRefreshing(false));
  };

  if (!activitiesData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderPaymentHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ödeme Geçmişi</Text>
      {activitiesData.paymentHistory.length > 0 ? (
        activitiesData.paymentHistory.map((payment) => (
          <ActivityCard
            key={payment.id}
            title={payment.paymentType}
            description={`${payment.userFullName} tarafından yapılan ödeme`}
            date={payment.paymentDate}
            icon="cash"
            gradient={payment.isPaid ? ['#4CAF50', '#45a049'] : ['#FFC107', '#FFA000']}
            status={{
              text: payment.isPaid ? 'Ödendi' : 'Bekliyor',
              color: payment.isPaid ? '#4CAF50' : '#FFC107',
            }}
            amount={payment.amount}
          />
        ))
      ) : (
        <EmptyStateCard
          title="Henüz ödeme geçmişi bulunmuyor"
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
});

export default ActivitiesScreen; 