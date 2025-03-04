import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Ionicons from '@expo/vector-icons/Ionicons';

// Complaint status enum
const ComplaintStatus = {
  OPEN: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  CANCELLED: 3
};

const ManagementScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(1); // Varsayılan bina ID'si
  const [summaryData, setSummaryData] = useState({
    meetings: {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0
    },
    users: {
      total: 0,
      admins: 0,
      tenants: 0,
      active: 0
    },
    apartments: {
      total: 0,
      occupied: 0,
      vacant: 0,
      withComplaints: 0
    },
    complaints: {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0
    },
    surveys: {
      total: 0,
      active: 0,
      ended: 0,
      participation: 0
    }
  });

  const fetchSummaryData = async () => {
    try {
      console.log('Fetching data for buildingId:', selectedBuildingId);
      console.log('API Endpoints being called:');
      console.log('Meetings:', API_ENDPOINTS.MEETING.BY_BUILDING(selectedBuildingId));
      console.log('Users:', API_ENDPOINTS.USER.GET_ALL);
      console.log('Apartments:', API_ENDPOINTS.APARTMENT.BY_BUILDING(selectedBuildingId));
      console.log('Complaints:', API_ENDPOINTS.COMPLAINT.BY_BUILDING(selectedBuildingId));
      console.log('Surveys:', API_ENDPOINTS.SURVEY.BY_BUILDING(selectedBuildingId));

      // Make API calls one by one to identify which one fails
      let meetingsResponse, usersResponse, apartmentsResponse, complaintsResponse, surveysResponse;

      try {
        meetingsResponse = await axios.get(API_ENDPOINTS.MEETING.BY_BUILDING(selectedBuildingId));
        console.log('Meetings API Response:', JSON.stringify(meetingsResponse.data, null, 2));
      } catch (error) {
        console.error('Meetings API call failed:', error.response?.status, error.response?.data);
        throw new Error('Meetings API failed');
      }

      try {
        usersResponse = await axios.get(API_ENDPOINTS.USER.GET_ALL);
        console.log('Users API Response:', JSON.stringify(usersResponse.data, null, 2));
      } catch (error) {
        console.error('Users API call failed:', error.response?.status, error.response?.data);
        throw new Error('Users API failed');
      }

      try {
        apartmentsResponse = await axios.get(API_ENDPOINTS.APARTMENT.BY_BUILDING(selectedBuildingId));
        console.log('Apartments API Response:', JSON.stringify(apartmentsResponse.data, null, 2));
      } catch (error) {
        console.error('Apartments API call failed:', error.response?.status, error.response?.data);
        throw new Error('Apartments API failed');
      }

      try {
        complaintsResponse = await axios.get(API_ENDPOINTS.COMPLAINT.BY_BUILDING(selectedBuildingId));
        console.log('Complaints API Response:', JSON.stringify(complaintsResponse.data, null, 2));
      } catch (error) {
        console.error('Complaints API call failed:', error.response?.status, error.response?.data);
        throw new Error('Complaints API failed');
      }

      try {
        surveysResponse = await axios.get(API_ENDPOINTS.SURVEY.BY_BUILDING(selectedBuildingId));
        console.log('Surveys API Response:', JSON.stringify(surveysResponse.data, null, 2));
      } catch (error) {
        console.error('Surveys API call failed:', error.response?.status, error.response?.data);
        throw new Error('Surveys API failed');
      }

      // Process responses and log processed data
      const meetings = meetingsResponse?.data?.data || [];
      console.log('Processed Meetings:', meetings);
      const meetingsStats = {
        total: meetings.length,
        upcoming: meetings.filter(m => m?.isUpcoming === true).length,
        completed: meetings.filter(m => m?.status === 'Tamamlandı').length,
        cancelled: meetings.filter(m => m?.status === 'İptal Edildi').length
      };
      console.log('Meetings Stats:', meetingsStats);

      const users = usersResponse?.data?.data || [];
      console.log('Processed Users:', users);
      const usersStats = {
        total: users.length,
        admins: users.filter(u => u?.role === 'admin').length,
        tenants: users.filter(u => u?.role === 'tenant').length,
        active: users.filter(u => u?.isActive === true).length
      };
      console.log('Users Stats:', usersStats);

      const apartments = apartmentsResponse?.data?.data || [];
      console.log('Processed Apartments:', apartments);
      const apartmentsStats = {
        total: apartments.length,
        occupied: apartments.filter(a => a?.isOccupied === true).length,
        vacant: apartments.filter(a => a?.isOccupied === false).length,
        withComplaints: apartments.filter(a => a?.hasActiveComplaints === true).length
      };
      console.log('Apartments Stats:', apartmentsStats);

      const complaints = complaintsResponse?.data?.data || [];
      console.log('Processed Complaints:', complaints);
      console.log('Complaints Status Values:', complaints.map(c => c.status));
      const complaintsStats = {
        total: complaints.length,
        open: complaints.filter(c => c.status === 0 || c.status === null).length,
        inProgress: complaints.filter(c => c.status === 1).length,
        resolved: complaints.filter(c => c.status === 2).length
      };
      console.log('Complaints Stats:', complaintsStats);

      const surveys = surveysResponse?.data?.data || [];
      console.log('Processed Surveys:', surveys);
      const surveysStats = {
        total: surveys.length,
        active: surveys.filter(s => s?.isActive === true).length,
        ended: surveys.filter(s => s?.isActive === false).length,
        participation: surveys.length > 0 
          ? Math.round((surveys.reduce((acc, s) => acc + (s?.totalResponses || 0), 0) / 
             (surveys.length * 100)) * 100)
          : 0
      };
      console.log('Surveys Stats:', surveysStats);

      setSummaryData({
        meetings: meetingsStats,
        users: usersStats,
        apartments: apartmentsStats,
        complaints: complaintsStats,
        surveys: surveysStats
      });

    } catch (error) {
      console.error('Özet bilgiler yüklenirken hata:', error);
      Alert.alert(
        'Hata',
        `Veriler yüklenirken bir hata oluştu: ${error.message}`,
        [{ text: 'Tamam' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, [selectedBuildingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummaryData();
  };

  const renderSummarySection = (title, data, icon, color, route) => (
    <TouchableOpacity 
      style={[styles.summaryCard, { borderLeftColor: color }]}
      onPress={() => navigation.navigate(route)}
    >
      <View style={styles.summaryHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      <View style={styles.summaryStats}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.statItem}>
            <Text style={[styles.statValue, key === 'participation' ? { fontSize: 16 } : {}]}>
              {key === 'participation' ? `%${value}` : value}
            </Text>
            <Text style={styles.statLabel}>
              {key === 'total' ? 'Toplam' :
               key === 'upcoming' ? 'Yaklaşan' :
               key === 'completed' ? 'Tamamlanan' :
               key === 'cancelled' ? 'İptal' :
               key === 'admins' ? 'Yönetici' :
               key === 'tenants' ? 'Kiracı' :
               key === 'active' ? 'Aktif' :
               key === 'occupied' ? 'Dolu' :
               key === 'vacant' ? 'Boş' :
               key === 'withComplaints' ? 'Şikayetli' :
               key === 'open' ? 'Açık' :
               key === 'inProgress' ? 'İşlemde' :
               key === 'resolved' ? 'Çözüldü' :
               key === 'ended' ? 'Biten' :
               key === 'participation' ? 'Katılım' : key}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
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
      <View style={styles.header}>
        <Text style={styles.headerText}>Yönetim Paneli</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateMeeting')}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Toplantı Oluştur</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#34C759' }]}
            onPress={() => navigation.navigate('Users', { action: 'add' })}
          >
            <Ionicons name="person-add" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Kullanıcı Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#5856D6' }]}
            onPress={() => navigation.navigate('Surveys', { action: 'create' })}
          >
            <Ionicons name="create" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Anket Oluştur</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
            onPress={() => navigation.navigate('Apartments', { action: 'add' })}
          >
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Daire Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Genel Durum</Text>
        {renderSummarySection('Toplantılar', summaryData.meetings, 'calendar', '#007AFF', 'Meetings')}
        {renderSummarySection('Kullanıcılar', summaryData.users, 'people', '#34C759', 'Users')}
        {renderSummarySection('Daireler', summaryData.apartments, 'home', '#FF9500', 'Apartments')}
        {renderSummarySection('Şikayetler', summaryData.complaints, 'warning', '#FF3B30', 'Complaints')}
        {renderSummarySection('Anketler', summaryData.surveys, 'document-text', '#5856D6', 'Surveys')}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickActions: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ManagementScreen; 