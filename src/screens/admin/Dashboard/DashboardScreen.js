import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const adminId = getCurrentAdminId();
      const [statisticsResponse, activitiesResponse, financialResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.ADMIN.STATISTICS(adminId)),
        axios.get(API_ENDPOINTS.ADMIN.ACTIVITIES(adminId)),
        axios.get(API_ENDPOINTS.ADMIN.FINANCIAL_SUMMARIES(adminId))
      ]);

      console.log('Statistics API Response:', {
        endpoint: API_ENDPOINTS.ADMIN.STATISTICS(adminId),
        data: statisticsResponse.data
      });
      console.log('Activities API Response:', {
        endpoint: API_ENDPOINTS.ADMIN.ACTIVITIES(adminId),
        data: activitiesResponse.data
      });
      console.log('Financial API Response:', {
        endpoint: API_ENDPOINTS.ADMIN.FINANCIAL_SUMMARIES(adminId),
        data: financialResponse.data
      });

      setDashboardData({
        totalResidents: statisticsResponse.data.data.totalResidents,
        activeComplaints: statisticsResponse.data.data.activeComplaints,
        pendingPayments: statisticsResponse.data.data.pendingPayments,
        upcomingMeetings: statisticsResponse.data.data.upcomingMeetings,
        recentActivities: activitiesResponse.data.data || [],
        financialSummaries: financialResponse.data.data || []
      });
    } catch (error) {
      console.error('Dashboard veri çekme hatası:', error);
      console.error('Hata detayı:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatBox = ({ icon, number, label, color }) => (
    <View style={styles.statBox}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.statNumber, { color }]}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ActivityItem = ({ activity }) => {
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'paid':
        case 'ödendi':
          return '#34C759';
        case 'pending':
        case 'bekliyor':
          return '#FF9500';
        default:
          return '#8E8E93';
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getActivityTypeText = (type) => {
      switch (type.toLowerCase()) {
        case 'payment':
          return 'Ödeme';
        case 'complaint':
          return 'Şikayet';
        case 'meeting':
          return 'Toplantı';
        case 'announcement':
          return 'Duyuru';
        default:
          return type;
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityType}>
            {getActivityTypeText(activity.activityType)}
          </Text>
          <Text style={[styles.activityStatus, { color: getStatusColor(activity.status) }]}>
            {activity.status === 'Paid' ? 'Ödendi' : 
             activity.status === 'Pending' ? 'Bekliyor' : 
             activity.status}
          </Text>
        </View>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <View style={styles.activityFooter}>
          <Text style={styles.activityDate}>{formatDate(activity.activityDate)}</Text>
          <Text style={styles.activityUser}>{activity.relatedUserName}</Text>
        </View>
      </View>
    );
  };

  const BuildingCard = ({ building }) => (
    <TouchableOpacity 
      style={styles.buildingCard}
      onPress={() => navigation.navigate('BuildingDetail', { buildingId: building.id })}
    >
      <Text style={styles.buildingName}>{building.buildingName}</Text>
      <View style={styles.buildingStats}>
        <View style={styles.buildingStat}>
          <Text style={styles.buildingStatLabel}>Daireler</Text>
          <Text style={styles.buildingStatValue}>{building.totalApartments}</Text>
        </View>
        <View style={styles.buildingStat}>
          <Text style={styles.buildingStatLabel}>Doluluk</Text>
          <Text style={styles.buildingStatValue}>%{(building.occupancyRate * 100).toFixed(0)}</Text>
        </View>
        <View style={styles.buildingStat}>
          <Text style={styles.buildingStatLabel}>Ödemeler</Text>
          <Text style={styles.buildingStatValue}>{building.pendingPayments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FinancialSummaryCard = ({ summary }) => {
    const collectionRateColor = summary.collectionRate >= 80 ? '#34C759' : 
                               summary.collectionRate >= 50 ? '#FF9500' : '#FF3B30';
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2
      }).format(amount);
    };

    return (
      <View style={styles.financialCard}>
        <Text style={styles.buildingName}>{summary.buildingName}</Text>
        
        <View style={styles.financialRow}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Beklenen Gelir</Text>
            <Text style={styles.financialValue}>{formatCurrency(summary.expectedIncome)}</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Tahsilat Oranı</Text>
            <Text style={[styles.financialValue, { color: collectionRateColor }]}>
              %{summary.collectionRate}
            </Text>
          </View>
        </View>

        <View style={styles.financialRow}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Tahsil Edilen</Text>
            <Text style={[styles.financialValue, { color: '#34C759' }]}>
              {formatCurrency(summary.collectedAmount)}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Bekleyen</Text>
            <Text style={[styles.financialValue, { color: '#FF3B30' }]}>
              {formatCurrency(summary.pendingAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.financialRow}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Toplam Ödeme</Text>
            <Text style={styles.financialValue}>{summary.totalPayments}</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Bekleyen Ödeme</Text>
            <Text style={[styles.financialValue, { color: summary.pendingPayments > 0 ? '#FF3B30' : '#34C759' }]}>
              {summary.pendingPayments}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#007AFF', '#00C6FF']}
        style={styles.header}
      >
        <Text style={styles.headerText}>Yönetici Paneli</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <StatBox 
          icon="account-group" 
          number={dashboardData?.totalResidents || 0}
          label="Toplam Sakin"
          color="#007AFF"
        />
        <StatBox 
          icon="alert-circle" 
          number={dashboardData?.activeComplaints || 0}
          label="Aktif Şikayet"
          color="#FF3B30"
        />
        <StatBox 
          icon="cash-multiple" 
          number={dashboardData?.pendingPayments || 0}
          label="Bekleyen Ödeme"
          color="#FF9500"
        />
        <StatBox 
          icon="calendar-clock" 
          number={dashboardData?.upcomingMeetings || 0}
          label="Yaklaşan Toplantı"
          color="#34C759"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Activities')}
          >
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {Array.isArray(dashboardData?.recentActivities) ? 
          dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          )) : 
          <Text style={styles.emptyText}>Henüz aktivite kaydı bulunmuyor</Text>
        }
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yönetilen Binalar</Text>
        {Array.isArray(dashboardData?.buildingSummaries) ? 
          dashboardData.buildingSummaries.map((building, index) => (
            <BuildingCard key={index} building={building} />
          )) : 
          <Text style={styles.emptyText}>Henüz bina kaydı bulunmuyor</Text>
        }
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yaklaşan Toplantılar</Text>
        {Array.isArray(dashboardData?.upcomingMeetings) ? 
          dashboardData.upcomingMeetings.map((meeting, index) => (
            <View key={index} style={styles.meetingItem}>
              <Text style={styles.meetingTitle}>{meeting.title}</Text>
              <Text style={styles.meetingDate}>
                {new Date(meeting.date).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <Text style={styles.meetingBuilding}>{meeting.buildingName}</Text>
            </View>
          )) : 
          <Text style={styles.emptyText}>Yaklaşan toplantı bulunmuyor</Text>
        }
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Finansal Özet</Text>
        {Array.isArray(dashboardData?.financialSummaries) ? 
          dashboardData.financialSummaries.map((summary, index) => (
            <FinancialSummaryCard key={index} summary={summary} />
          )) : 
          <Text style={styles.emptyText}>Henüz finansal veri bulunmuyor</Text>
        }
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateMeeting')}
          >
            <MaterialCommunityIcons name="calendar-plus" size={24} color="white" />
            <Text style={styles.actionButtonText}>Toplantı Oluştur</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateAnnouncement')}
          >
            <MaterialCommunityIcons name="bullhorn" size={24} color="white" />
            <Text style={styles.actionButtonText}>Duyuru Oluştur</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateNotification')}
          >
            <MaterialCommunityIcons name="bell-plus" size={24} color="white" />
            <Text style={styles.actionButtonText}>Bildirim Gönder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 15,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  activityItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 14,
  },
  activityStatus: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  activityDescription: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  activityUser: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  buildingCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buildingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buildingStat: {
    alignItems: 'center',
  },
  buildingStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  buildingStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  meetingItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  meetingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  meetingBuilding: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    padding: 15,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '31%',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  financialCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  financialStats: {
    // Add appropriate styles for financialStats
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  financialStat: {
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 12,
    color: '#666',
  },
  financialValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
    marginRight: 4,
  },
});

export default DashboardScreen;
