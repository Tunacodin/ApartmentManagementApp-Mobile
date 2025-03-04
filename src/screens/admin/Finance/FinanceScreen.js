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

const FinanceScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryData, setSummaryData] = useState({
    dues: {
      total: 0,
      collected: 0,
      pending: 0
    },
    expenses: {
      total: 0,
      monthly: 0,
      pending: 0
    },
    income: {
      total: 0,
      monthly: 0,
      expected: 0
    },
    balance: {
      current: 0,
      projected: 0,
      reserve: 0
    }
  });

  const fetchSummaryData = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.FINANCIAL_SUMMARIES(adminId));
      
      setSummaryData({
        dues: {
          total: response.data.totalDues || 0,
          collected: response.data.collectedDues || 0,
          pending: response.data.pendingDues || 0
        },
        expenses: {
          total: response.data.totalExpenses || 0,
          monthly: response.data.monthlyExpenses || 0,
          pending: response.data.pendingExpenses || 0
        },
        income: {
          total: response.data.totalIncome || 0,
          monthly: response.data.monthlyIncome || 0,
          expected: response.data.expectedIncome || 0
        },
        balance: {
          current: response.data.currentBalance || 0,
          projected: response.data.projectedBalance || 0,
          reserve: response.data.reserveFunds || 0
        }
      });
    } catch (error) {
      console.error('Finansal özet bilgileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

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
            <Text style={styles.statValue}>{value.toLocaleString('tr-TR')}₺</Text>
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
        <Text style={styles.headerText}>Finans Yönetimi</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Dues', { action: 'collect' })}
          >
            <Ionicons name="cash" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Aidat Tahsil Et</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#34C759' }]}
            onPress={() => navigation.navigate('Income', { action: 'add' })}
          >
            <Ionicons name="trending-up" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Gelir Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
            onPress={() => navigation.navigate('Expenses', { action: 'add' })}
          >
            <Ionicons name="trending-down" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Gider Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#5856D6' }]}
            onPress={() => navigation.navigate('FinancialReports')}
          >
            <Ionicons name="document-text" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Rapor Oluştur</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Finansal Durum</Text>
        {renderSummarySection('Aidatlar', summaryData.dues, 'cash', '#007AFF', 'Dues')}
        {renderSummarySection('Giderler', summaryData.expenses, 'trending-down', '#FF3B30', 'Expenses')}
        {renderSummarySection('Gelirler', summaryData.income, 'trending-up', '#34C759', 'Income')}
        {renderSummarySection('Bakiye', summaryData.balance, 'wallet', '#5856D6', 'FinancialReports')}
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

export default FinanceScreen; 