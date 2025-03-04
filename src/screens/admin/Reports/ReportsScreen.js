import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Ionicons from '@expo/vector-icons/Ionicons';

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState({
    meetings: {
      total: 0,
      averageAttendance: 0,
      upcomingCount: 0
    },
    surveys: {
      total: 0,
      activeCount: 0,
      averageParticipation: 0
    }
  });

  const fetchReportData = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.REPORTS.MEETINGS(adminId));
      
      setReportData({
        meetings: {
          total: response.data.totalMeetings || 0,
          averageAttendance: response.data.averageAttendance || 0,
          upcomingCount: response.data.upcomingMeetings || 0
        },
        surveys: {
          total: response.data.totalSurveys || 0,
          activeCount: response.data.activeSurveys || 0,
          averageParticipation: response.data.averageParticipation || 0
        }
      });
    } catch (error) {
      console.error('Rapor verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportData();
  };

  const renderReportCard = (title, data, icon, color, route) => (
    <TouchableOpacity 
      style={[styles.reportCard, { borderLeftColor: color }]}
      onPress={() => navigation.navigate(route)}
    >
      <View style={styles.reportHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.reportTitle}>{title}</Text>
      </View>
      <View style={styles.reportStats}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.statItem}>
            <Text style={[styles.statValue, { color }]}>
              {typeof value === 'number' && key.includes('average') 
                ? `%${value.toFixed(1)}`
                : value}
            </Text>
            <Text style={styles.statLabel}>{key}</Text>
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
        <Text style={styles.headerText}>Raporlar</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MeetingAttendance')}
          >
            <Ionicons name="people" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Toplantı Katılımları</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#34C759' }]}
            onPress={() => navigation.navigate('SurveyResults')}
          >
            <Ionicons name="stats-chart" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Anket Sonuçları</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.reportsContainer}>
        <Text style={styles.sectionTitle}>Rapor Özetleri</Text>
        {renderReportCard(
          'Toplantı Katılım Raporu',
          reportData.meetings,
          'people',
          '#007AFF',
          'MeetingAttendance'
        )}
        {renderReportCard(
          'Anket Sonuç Raporu',
          reportData.surveys,
          'stats-chart',
          '#34C759',
          'SurveyResults'
        )}
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
  reportsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ReportsScreen; 