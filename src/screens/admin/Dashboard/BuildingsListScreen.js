import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, useTheme, ProgressBar, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Fonts, Colors, Gradients } from '../../../constants';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const BuildingCard = ({ building }) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const formatCurrency = (value) => {
    return value.toLocaleString('tr-TR') + ' ₺';
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('BuildingDetail', { buildingId: building.buildingId })}
      activeOpacity={0.9}
    >
      <Card style={[styles.buildingCard, { backgroundColor: theme.colors.surface }]}>
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        />
        <Card.Content>
          <View style={styles.buildingHeader}>
            <View style={styles.buildingTitleContainer}>
              <View style={[styles.buildingIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="office-building" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.buildingTitleWrapper}>
                <Text style={[styles.buildingName, { color: theme.colors.text, fontFamily: Fonts.lato.bold }]}>
                  {building.buildingName}
                </Text>
                <Text style={[styles.buildingAddress, { color: theme.colors.textSecondary }]}>
                  {building.address || 'Adres bilgisi yok'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: building.occupancyRate > 50 ? theme.colors.success : theme.colors.warning }]}>
              <Text style={styles.statusText}>
                {building.occupancyRate.toFixed(1)}% Doluluk
              </Text>
            </View>
          </View>

          <View style={styles.buildingStats}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="door" size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Toplam Daire</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{building.totalApartments}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                <Icon name="account-group" size={20} color={theme.colors.success} />
              </View>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Dolu Daire</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{building.occupiedApartments}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                <Icon name="alert-circle" size={20} color={theme.colors.warning} />
              </View>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Aktif Şikayet</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{building.activeComplaints}</Text>
            </View>
          </View>

          <View style={styles.financialInfo}>
            <View style={styles.financialItem}>
              <View style={[styles.financialIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="cash-multiple" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.financialTextContainer}>
                <Text style={[styles.financialLabel, { color: theme.colors.textSecondary }]}>Toplam Aidat</Text>
                <Text style={[styles.financialValue, { color: theme.colors.text }]}>
                  {formatCurrency(building.totalDuesAmount)}
                </Text>
              </View>
            </View>
            <View style={styles.financialItem}>
              <View style={[styles.financialIconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                <Icon name="clock-alert" size={20} color={theme.colors.warning} />
              </View>
              <View style={styles.financialTextContainer}>
                <Text style={[styles.financialLabel, { color: theme.colors.textSecondary }]}>Bekleyen Tutar</Text>
                <Text style={[styles.financialValue, { color: theme.colors.text }]}>
                  {formatCurrency(building.pendingAmount)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLabelContainer}>
                <Icon name="chart-line" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>Tahsilat Oranı</Text>
              </View>
              <Text style={[styles.progressValue, { color: theme.colors.text }]}>
                {building.collectionRate.toFixed(1)}%
              </Text>
            </View>
            <ProgressBar
              progress={building.collectionRate / 100}
              color={building.collectionRate > 50 ? theme.colors.success : theme.colors.warning}
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const BuildingsListScreen = () => {
  const theme = useTheme();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBuildings = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.BUILDINGS(adminId));
      
      if (response.data.success) {
        setBuildings(response.data.data);
      } else {
        throw new Error(response.data.message || 'Binalar alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Binalar alınırken hata:', error);
      Alert.alert('Hata', 'Binalar alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBuildings();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Binalar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Binalarınız</Text>
      </View>
      <FlatList
        data={buildings}
        renderItem={({ item }) => <BuildingCard building={item} />}
        keyExtractor={(item) => item.buildingId.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="office-building-off" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Henüz bina bulunmuyor
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'left',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.lato.bold,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  buildingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 16,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  buildingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  buildingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buildingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buildingTitleWrapper: {
    flex: 1,
  },
  buildingName: {
    fontSize: 18,
    marginBottom: 4,
  },
  buildingAddress: {
    fontSize: 12,
    fontFamily: Fonts.lato.regular,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontFamily: Fonts.lato.bold,
    fontSize: 12,
  },
  buildingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Fonts.lato.regular,
  },
  statValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  financialInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  financialItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  financialTextContainer: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Fonts.lato.regular,
  },
  financialValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: Fonts.lato.regular,
  },
  progressValue: {
    fontSize: 12,
    fontFamily: Fonts.lato.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    textAlign: 'center',
  },
});

export default BuildingsListScreen; 