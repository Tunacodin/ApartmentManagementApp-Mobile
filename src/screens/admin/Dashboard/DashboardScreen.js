import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, TouchableOpacity, Modal, Animated, FlatList, Alert, RefreshControl } from 'react-native';
import { Surface, Text, Card, List, useTheme, Avatar, ProgressBar, Divider, Button, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, Colors, Gradients, Theme as AppTheme } from '../../../constants';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const StatCard = ({ title, value, icon, gradient, onPress }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={5}>
        <View style={{ overflow: 'hidden', borderRadius: 16 }}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <Icon name={icon} size={28} color={theme.colors.text} />
            <Text style={[styles.statValue, { color: theme.colors.text, fontFamily:"Poppins-Regular" }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: theme.colors.text, fontFamily: "Lato-Bold",fontSize:"12" }]}>{title}</Text>
          </LinearGradient>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const FinancialCard = ({ title, current, target, percentage, gradient }) => {
  const theme = useTheme();
  return (
    <Card style={[styles.financialCard, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      />
      <Card.Content style={styles.financialContent}>
        <Text variant="titleMedium" style={{ color: theme.colors.text, fontFamily: Fonts.lato.bold }}>{title}</Text>
        <Text variant="headlineMedium" style={[styles.financialAmount, { color: theme.colors.text, fontFamily: Fonts.lato.regular }]}>
          {current.toLocaleString('tr-TR')} ₺
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.italic }}>
          Hedef: {target.toLocaleString('tr-TR')} ₺
        </Text>
        <ProgressBar 
          progress={percentage / 100} 
          color={gradient[0]}
          style={styles.progressBar}
        />
      </Card.Content>
    </Card>
  );
};

// Custom animated progress bar component
const AnimatedProgressBar = ({ progress, color, style, duration = 1500 }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, []);
  
  return (
    <View style={[styles.progressBarContainer, style]}>
      <Animated.View 
        style={[
          styles.progressBarFill, 
          { 
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: color,
          }
        ]}
      >
        <View style={styles.progressBarGlow} />
      </Animated.View>
    </View>
  );
};

const FinancialOverviewCard = ({ data }) => {
  const theme = useTheme();
  
  // Format currency
  const formatCurrency = (value) => {
    return value.toLocaleString('tr-TR') + ' ₺';
  };
  
  // Calculate percentage difference
  const calculateDifference = () => {
    const difference = data.monthlyCollectedAmount - data.monthlyExpectedIncome;
    const percentDiff = (difference / data.monthlyExpectedIncome) * 100;
    return {
      value: Math.abs(difference),
      percent: Math.abs(percentDiff).toFixed(1),
      isPositive: difference >= 0
    };
  };
  
  const difference = calculateDifference();
  
  return (
    <Card style={[styles.financialOverviewCard, { backgroundColor: "transparent"}]}>
      <Card.Content>
        <View style={styles.financialOverviewContent}>
          {/* Monthly Income Card */}
          <View style={styles.monthlyIncomeContainer}>
            <LinearGradient
              colors={theme.gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.monthlyIncomeGradient}
            >
              <View style={styles.monthlyIncomeContent}>
                <View style={styles.monthlyIncomeRow}>
                  <View style={styles.monthlyIncomeLeft}>
                    <View style={styles.monthlyIncomeHeader}>
                      <Icon name="chart-line" size={24} color="#fff" />
                      <Text style={styles.monthlyIncomeTitle}>Aylık Gelir</Text>
                    </View>
                    
                    <Text style={styles.monthlyIncomeValue}>
                      {formatCurrency(data.monthlyCollectedAmount)}
                    </Text>
                  </View>
                  
                  <View style={styles.monthlyIncomeRight}>
                    <View style={styles.monthlyIncomeHeader}>
                      <Icon name="cash-multiple" size={24} color="#fff" />
                      <Text style={styles.monthlyIncomeTitle}>Toplam Gelir</Text>
                    </View>
                    
                    <Text style={styles.monthlyIncomeValue}>
                      {formatCurrency(data.monthlyTotalIncome)}
                    </Text>
                  </View>
                </View>
                
                {/* Difference */}
                <View style={styles.monthlyIncomeDifference}>
                  <Text style={styles.monthlyIncomeDifferenceLabel}>
                    {difference.isPositive ? 'Fazla:' : 'Eksik:'}
                  </Text>
                  <Text style={styles.monthlyIncomeDifferenceValue}>
                    {formatCurrency(difference.value)} ({difference.percent}%)
                  </Text>
                </View>
                
                {/* Collection Rate */}
                <View style={styles.monthlyIncomeRateContainer}>
                  <View style={styles.monthlyIncomeRateHeader}>
                    <Text style={styles.monthlyIncomeRateLabel}>Tahsilat Oranı</Text>
                    <Text style={styles.monthlyIncomeRateValue}>
                      {data.collectionRate.toFixed(1)}%
                    </Text>
                  </View>
                  <AnimatedProgressBar 
                    progress={data.collectionRate / 100} 
                    color="#fff"
                    style={styles.monthlyIncomeProgress}
                    duration={2000}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const ActivityItem = ({ activity }) => {
  const theme = useTheme();
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'Payment':
        return 'cash';
      case 'Complaint':
        return 'alert-circle';
      default:
        return 'information';
    }
  };

  const getStatusGradient = (status) => {
    if (activity.activityType === 'Payment') {
      return status === 'Ödendi' ? theme.gradients.success : theme.gradients.warning;
    } else if (activity.activityType === 'Complaint') {
      switch (status) {
        case 'Çözüldü':
          return theme.gradients.success;
        case 'Reddedildi':
          return theme.gradients.danger;
        case 'İşlemde':
        case 'Açık':
        case 'Bekliyor':
          return theme.gradients.warning;
        default:
          return [theme.colors.textSecondary, theme.colors.textSecondary];
      }
    }
    return [theme.colors.textSecondary, theme.colors.textSecondary];
  };

  const getStatusText = (status) => {
    if (activity.activityType === 'Payment') {
      return status;
    } else if (activity.activityType === 'Complaint') {
      switch (status) {
        case 'Çözüldü':
          return 'Çözüldü';
        case 'Reddedildi':
          return 'Reddedildi';
        case 'İşlemde':
          return 'İşlemde';
        case 'Açık':
        case 'Bekliyor':
          return 'Bekliyor';
        default:
          return status;
      }
    }
    return status;
  };

  const getStatusColor = (status) => {
    if (activity.activityType === 'Payment') {
      return status === 'Ödendi' ? theme.colors.success : theme.colors.warning;
    } else if (activity.activityType === 'Complaint') {
      switch (status) {
        case 'Çözüldü':
          return theme.colors.success;
        case 'Reddedildi':
          return theme.colors.error;
        case 'İşlemde':
        case 'Açık':
        case 'Bekliyor':
          return theme.colors.warning;
        default:
          return theme.colors.textSecondary;
      }
    }
    return theme.colors.textSecondary;
  };

  return (
    <List.Item
      style={styles.activityItem}
      title={props => (
        <Text style={{ color: theme.colors.text, fontFamily: Fonts.lato.bold }}>
          {activity.title}
        </Text>
      )}
      description={props => (
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
            {activity.description}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.italic }}>
            {activity.userFullName}
          </Text>
        </View>
      )}
      left={props => (
        <View style={styles.activityIconContainer}>
          {activity.profileImageUrl ? (
            <>
              <Avatar.Image 
                size={48} 
                source={{ uri: activity.profileImageUrl }} 
                style={styles.profileAvatar}
              />
              <Text style={[styles.apartmentText, { color: theme.colors.text }]}>
                {activity.relatedEntity}
              </Text>
            </>
          ) : (
            <>
              <LinearGradient
                colors={getStatusGradient(activity.status)}
                style={styles.activityIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name={getActivityIcon(activity.activityType)} size={24} color={theme.colors.text} />
              </LinearGradient>
              <Text style={[styles.apartmentText, { color: theme.colors.text }]}>
                {activity.relatedEntity}
              </Text>
            </>
          )}
        </View>
      )}
      right={props => (
        <View style={styles.activityRight}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
            {new Date(activity.activityDate).toLocaleDateString('tr-TR')}
          </Text>
          {activity.amount && (
            <Text style={{ color: theme.colors.text, fontFamily: Fonts.lato.bold }}>
              {activity.amount.toLocaleString('tr-TR')} ₺
            </Text>
          )}
          <View style={styles.statusContainer}>
            <Badge 
              style={{ 
                fontSize: 12,
                fontFamily: Fonts.lato.bold,
                paddingHorizontal: 8,
                marginBottom: 4,
                backgroundColor: getStatusColor(activity.status)
              }}
            >
              {getStatusText(activity.status)}
            </Badge>
          </View>
        </View>
      )}
    />
  );
};

const PaymentItem = ({ payment }) => {
  const theme = useTheme();
  
  const getStatusGradient = (isPaid) => {
    return isPaid ? theme.gradients.success : theme.gradients.warning;
  };

  const getStatusColor = (isPaid) => {
    return isPaid ? theme.colors.success : theme.colors.warning;
  };

  const getStatusText = (isPaid) => {
    return isPaid ? 'Ödendi' : 'Bekliyor';
  };

  return (
    <List.Item
      style={styles.activityItem}
      title={props => (
        <Text style={{ color: theme.colors.text, fontFamily: Fonts.lato.bold }}>
          {payment.paymentType}
        </Text>
      )}
      description={props => (
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
            {payment.description}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.italic }}>
            {payment.userFullName}
          </Text>
        </View>
      )}
      left={props => (
        <View style={styles.activityIconContainer}>
          {payment.profileImageUrl ? (
            <Avatar.Image 
              size={48} 
              source={{ uri: payment.profileImageUrl }} 
              style={styles.profileAvatar}
            />
          ) : (
            <LinearGradient
              colors={getStatusGradient(payment.isPaid)}
              style={styles.activityIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="cash" size={24} color={theme.colors.text} />
            </LinearGradient>
          )}
          <Text style={styles.apartmentText}>Daire {payment.apartmentId}</Text>
        </View>
      )}
      right={props => (
        <View style={styles.activityRight}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
            {new Date(payment.paymentDate).toLocaleDateString('tr-TR')}
          </Text>
          <Text style={{ color: theme.colors.text, fontFamily: Fonts.lato.bold }}>
            {payment.totalAmount.toLocaleString('tr-TR')} ₺
          </Text>
          {payment.delayedDays > 0 && (
            <Text style={{ 
              color: theme.colors.error, 
              fontFamily: Fonts.lato.regular,
              fontSize: 12,
              marginBottom: 4
            }}>
              {payment.delayedDays} gün gecikme
            </Text>
          )}
          <Badge 
            style={{ 
              fontSize: 12,
              fontFamily: Fonts.lato.bold,
              paddingHorizontal: 8,
              marginBottom: 4,
              backgroundColor: getStatusColor(payment.isPaid)
            }}
          >
            {getStatusText(payment.isPaid)}
          </Badge>
        </View>
      )}
    />
  );
};

const ComplaintItem = ({ complaint }) => {
  const theme = useTheme();
  
  const getStatusGradient = (status) => {
    switch (status) {
      case 2: // Çözüldü
        return theme.gradients.success;
      case 3: // Reddedildi
        return theme.gradients.danger;
      case 1: // İşlemde
        return theme.gradients.warning;
      case 0: // Bekliyor
        return theme.gradients.warning;
      default:
        return [theme.colors.textSecondary, theme.colors.textSecondary];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 2:
        return 'Çözüldü';
      case 3:
        return 'Reddedildi';
      case 1:
        return 'İşlemde';
      case 0:
        return 'Bekliyor';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 2:
        return theme.colors.success;
      case 3:
        return theme.colors.error;
      case 1:
        return theme.colors.warning;
      case 0:
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <List.Item
      style={styles.activityItem}
      title={props => (
        <Text style={{ color: theme.colors.text, fontFamily: Fonts.lato.bold }}>
          {complaint.subject}
        </Text>
      )}
      description={props => (
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
            {complaint.description}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.italic }}>
            {complaint.complainerName}
          </Text>
        </View>
      )}
      left={props => (
        <View style={styles.activityIconContainer}>
          {complaint.profileImageUrl ? (
            <Avatar.Image 
              size={48} 
              source={{ uri: complaint.profileImageUrl }} 
              style={styles.profileAvatar}
            />
          ) : (
            <LinearGradient
              colors={getStatusGradient(complaint.status)}
              style={styles.activityIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="alert-circle" size={24} color={theme.colors.text} />
            </LinearGradient>
          )}
          <Text style={styles.apartmentText}>{complaint.apartmentNumber}</Text>
        </View>
      )}
      right={props => (
        <View style={styles.activityRight}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
            {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
          </Text>
          <Badge 
            style={{ 
              fontSize: 12,
              fontFamily: Fonts.lato.bold,
              paddingHorizontal: 8,
              marginBottom: 4,
              backgroundColor: getStatusColor(complaint.status)
            }}
          >
            {getStatusText(complaint.status)}
          </Badge>
        </View>
      )}
    />
  );
};

const DashboardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth - 32;

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.ENHANCED_DASHBOARD(getCurrentAdminId()));
      console.log('Dashboard Data:', response.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Dashboard verisi alınırken hata oluştu:', error);
      Alert.alert('Hata', 'Dashboard verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleEndReached = () => {
    if (!refreshing) {
      fetchDashboardData();
    }
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / (screenWidth - 32) + 0.5);
    if (activeTab !== index) {
      setActiveTab(index);
    }
  };

  const handleScrolling = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / (screenWidth - 32) + 0.5);
    if (index >= 0 && index <= 2) {
      setActiveTab(index);
    }
  };

  const TabHeader = () => (
    <View style={styles.tabHeader}>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 0 && styles.activeTabButton
        ]}
        onPress={() => handleTabChange(0)}
      >
        <Text style={[
          styles.tabText,
          activeTab === 0 && styles.activeTabText,
          { fontFamily: Fonts.lato.bold }
        ]}>
          Son Aktiviteler
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 1 && styles.activeTabButton
        ]}
        onPress={() => handleTabChange(1)}
      >
        <Text style={[
          styles.tabText,
          activeTab === 1 && styles.activeTabText,
          { fontFamily: Fonts.lato.bold }
        ]}>
          Şikayetler
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 2 && styles.activeTabButton
        ]}
        onPress={() => handleTabChange(2)}
      >
        <Text style={[
          styles.tabText,
          activeTab === 2 && styles.activeTabText,
          { fontFamily: Fonts.lato.bold }
        ]}>
          Ödemeler
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ActivitiesTab = () => {
    const theme = useTheme();
    
    return (
      <View style={[styles.tabContent, { width: screenWidth - 32 }]}>
        <FlatList
          data={dashboardData.recentActivities.slice(0, 5)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <React.Fragment>
              <ActivityItem activity={item} />
              {index < dashboardData.recentActivities.length - 1 && (
                <Divider style={[styles.itemDivider, { backgroundColor: theme.colors.textSecondary }]} />
              )}
            </React.Fragment>
          )}
          ListEmptyComponent={() => (
            <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
              Aktivite bulunamadı
            </Text>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const ComplaintsTab = () => {
    const theme = useTheme();
    
    return (
      <View style={[styles.tabContent, { width: screenWidth - 32 }]}>
        <FlatList
          data={dashboardData.recentComplaints}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <React.Fragment>
              <ComplaintItem complaint={item} />
              {index < dashboardData.recentComplaints.length - 1 && (
                <Divider style={[styles.itemDivider, { backgroundColor: theme.colors.textSecondary }]} />
              )}
            </React.Fragment>
          )}
          ListEmptyComponent={() => (
            <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
              Şikayet bulunamadı
            </Text>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const PaymentsTab = () => {
    const theme = useTheme();
    
    return (
      <View style={[styles.tabContent, { width: screenWidth - 32 }]}>
        <FlatList
          data={dashboardData.recentPayments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <React.Fragment>
              <PaymentItem payment={item} />
              {index < dashboardData.recentPayments.length - 1 && (
                <Divider style={[styles.itemDivider, { backgroundColor: theme.colors.textSecondary }]} />
              )}
            </React.Fragment>
          )}
          ListEmptyComponent={() => (
            <Text style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.regular }}>
              Ödeme bulunamadı
            </Text>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderTabContent = ({ item, index }) => {
    switch (index) {
      case 0:
        return <ActivitiesTab />;
      case 1:
        return <ComplaintsTab />;
      case 2:
        return <PaymentsTab />;
      default:
        return null;
    }
  };
   
  if (loading || !dashboardData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{ color: theme.colors.text, fontFamily: Fonts.lato.regular }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      nestedScrollEnabled={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 20;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
          handleEndReached();
        }
      }}
      scrollEventThrottle={400}
    >
      <View style={styles.statsContainer}>
        <View style={styles.cardRow}>
          <StatCard
            title="Toplam Bina"
            value={dashboardData.summary.totalBuildings}
            icon="office-building"
            gradient={Gradients.primary}
            onPress={() => navigation.navigate('BuildingsList')}
          />
          <StatCard
            title="Toplam Kiracı"
            value={dashboardData.summary.totalTenants}
            icon="account-group"
            gradient={Gradients.greenBlue}
          />
        </View>
        <View style={styles.cardRow}>
          <StatCard
            title="Aktif Şikayet"
            value={dashboardData.summary.totalComplaints}
            icon="alert-circle"
            gradient={Gradients.warning}
          />
          <StatCard
            title="Bekleyen Ödeme"
            value={dashboardData.summary.pendingPayments}
            icon="cash-multiple"
            gradient={Gradients.danger}
          />
        </View>
      </View>

      <FinancialOverviewCard data={dashboardData.financialOverview} />

      <Card style={[styles.activitiesCard, { backgroundColor: theme.colors.surface }]}>
        <TabHeader />
        <FlatList
          ref={flatListRef}
          data={[0, 1, 2]}
          renderItem={renderTabContent}
          keyExtractor={(item) => item.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScrolling}
          scrollEventThrottle={16}
          initialScrollIndex={0}
          getItemLayout={(data, index) => ({
            length: itemWidth,
            offset: itemWidth * index,
            index,
          })}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
          decelerationRate="fast"
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'column',
    fontFamily: "Poppins-Regular",
    marginVertical: 0,
    marginBottom: -12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  statCard: {
    width: 185,
    marginBottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradientCard: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    marginTop: 4,
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  financialContainer: {
  
  },
  financialCard: {
   
    borderRadius: 16,
    overflow: 'hidden',
  },
  financialContent: {
    padding: 16,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  financialAmount: {
    marginVertical: 8,
    fontSize: 32,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  activitiesCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 80,
  },
  activityItem: {
    paddingVertical: 12,
  },
  activityIconContainer: {
    marginRight: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "white"
  },
  tabText: {
    fontSize: 16,
    color: "white",
  },
  activeTabText: {
    color: "white",
  },
  profileAvatar: {
    marginBottom: 4,
  },
  apartmentText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  modalContent: {
    width: '80%',
    height: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
  },
  complaintDetails: {
    flex: 1,
  },
  complaintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complaintHeaderText: {
    marginLeft: 16,
    flex: 1,
  },
  statusChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemDivider: {
    height: 1,
    opacity: 0.2,
  },
  flatList: {
    height: 550,
    marginBottom: 80,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  tabContent: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  financialOverviewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    width: 425,
    alignSelf: 'center',
   
  },
  financialOverviewContent: {
    padding: 8,
  },
  monthlyIncomeContainer: {
    marginTop: 0,
    borderRadius: 16,
    width: "100%",
  },
  monthlyIncomeGradient: {
    borderRadius: 16,
    width: "100%",
  },
  monthlyIncomeContent: {
    padding: 16,
    width: "100%",
  },
  monthlyIncomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  monthlyIncomeLeft: {
    flex: 1,
    marginRight: 16,
  },
  monthlyIncomeRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  monthlyIncomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthlyIncomeTitle: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#fff',
    marginLeft: 8,
  },
  monthlyIncomeValue: {
    fontSize: 28,
    fontFamily: Fonts.lato.bold,
    color: '#fff',
  },
  monthlyIncomeTotalLabel: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  monthlyIncomeTotalValue: {
    fontSize: 24,
    fontFamily: Fonts.lato.bold,
    color: '#fff',
  },
  monthlyIncomeDifference: {
    marginTop: 8,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  monthlyIncomeDifferenceLabel: {
    fontSize: 14,
    fontFamily: Fonts.lato.bold,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  monthlyIncomeDifferenceValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#fff',
  },
  monthlyIncomeRateContainer: {
    marginTop: 8,
  },
  monthlyIncomeRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthlyIncomeRateLabel: {
    fontSize: 14,
    fontFamily: Fonts.lato.bold,
    color: '#fff',
  },
  monthlyIncomeRateValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#fff',
  },
  monthlyIncomeProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    position: 'relative',
  },
  progressBarGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 15,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
  },
});

export default DashboardScreen;