import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [statistics, setStatistics] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const adminId = getCurrentAdminId();
      const [statisticsResponse, financialResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.ADMIN.STATISTICS(adminId)),
        axios.get(API_ENDPOINTS.ADMIN.FINANCIAL_SUMMARIES(adminId))
      ]);

      setStatistics(statisticsResponse.data.data);
      setFinancialData(financialResponse.data.data);
    } catch (error) {
      console.error('Dashboard veri çekme hatası:', error);
      console.error('Hata detayı:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Finansal verileri toplama fonksiyonu
  const calculateTotalFinancials = () => {
    if (!financialData || financialData.length === 0) return {
      totalIncome: 0,
      totalExpectedIncome: 0,
      totalPendingAmount: 0,
      totalPendingPayments: 0
    };

    return financialData.reduce((acc, building) => ({
      totalIncome: acc.totalIncome + building.collectedAmount,
      totalExpectedIncome: acc.totalExpectedIncome + building.expectedIncome,
      totalPendingAmount: acc.totalPendingAmount + building.pendingAmount,
      totalPendingPayments: acc.totalPendingPayments + building.pendingPayments
    }), {
      totalIncome: 0,
      totalExpectedIncome: 0,
      totalPendingAmount: 0,
      totalPendingPayments: 0
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const QuickActionButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  const totals = calculateTotalFinancials();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Yönetici Paneli</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{statistics?.totalResidents || 0}</Text>
          <Text style={styles.statLabel}>Toplam Sakin</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{statistics?.upcomingMeetings || 0}</Text>
          <Text style={styles.statLabel}>Yaklaşan Toplantı</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{statistics?.activeComplaints || 0}</Text>
          <Text style={styles.statLabel}>Aktif Şikayet</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{statistics?.pendingPayments || 0}</Text>
          <Text style={styles.statLabel}>Bekleyen Ödeme</Text>
        </View>
      </View>

      <View style={styles.financialSummary}>
        <Text style={styles.sectionTitle}>Finansal Özet</Text>
        <View style={styles.financialGrid}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Toplam Tahsilat</Text>
            <Text style={styles.financialValue}>{totals.totalIncome.toLocaleString()}₺</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Beklenen Gelir</Text>
            <Text style={styles.financialValue}>{totals.totalExpectedIncome.toLocaleString()}₺</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Bekleyen Tutar</Text>
            <Text style={[
              styles.financialValue,
              { color: totals.totalPendingAmount >= 0 ? '#28a745' : '#dc3545' }
            ]}>{totals.totalPendingAmount.toLocaleString()}₺</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Bekleyen Ödeme</Text>
            <Text style={styles.financialValue}>{totals.totalPendingPayments.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buildingSummary}>
        <Text style={styles.sectionTitle}>Bina Özetleri</Text>
        {financialData.map((building, index) => (
          <View key={index} style={styles.buildingItem}>
            <Text style={styles.buildingName}>{building.buildingName}</Text>
            <View style={styles.buildingDetails}>
              <Text style={styles.buildingText}>Tahsilat: {building.collectedAmount.toLocaleString()}₺</Text>
              <Text style={styles.buildingText}>Beklenen: {building.expectedIncome.toLocaleString()}₺</Text>
              <Text style={styles.buildingText}>Tahsilat Oranı: %{building.collectionRate.toFixed(1)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.actionGrid}>
          <QuickActionButton 
            title="Toplantı Oluştur" 
            onPress={() => navigation.navigate('CreateMeeting')} 
          />
          <QuickActionButton 
            title="Duyuru Oluştur" 
            onPress={() => navigation.navigate('CreateAnnouncement')} 
          />
          <QuickActionButton 
            title="Bildirim Gönder" 
            onPress={() => navigation.navigate('CreateNotification')} 
          />
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#fff',
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
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  financialSummary: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  financialItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  quickActions: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buildingSummary: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  buildingItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buildingDetails: {
    gap: 4,
  },
  buildingText: {
    fontSize: 14,
    color: '#666',
  }
});

export default DashboardScreen;
