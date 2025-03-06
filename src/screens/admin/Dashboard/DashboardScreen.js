import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, TouchableOpacity, Modal, Animated } from 'react-native';
import { Surface, Text, Card, List, useTheme, Avatar, ProgressBar, Divider, Button, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts ,theme} from '../../../../App';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';

const StatCard = ({ title, value, icon, gradient }) => {
  const theme = useTheme();
  return (
    <Surface style={styles.statCard} elevation={5}>
      <View style={{ overflow: 'hidden', borderRadius: 16 }}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <Icon name={icon} size={32} color={theme.colors.text} />
          <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: fonts.lato.regular }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: theme.colors.text, fontFamily: fonts.lato.bold }]}>{title}</Text>
        </LinearGradient>
      </View>
    </Surface>
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
        <Text variant="titleMedium" style={{ color: theme.colors.text, fontFamily: fonts.lato.bold }}>{title}</Text>
        <Text variant="headlineMedium" style={[styles.financialAmount, { color: theme.colors.text, fontFamily: fonts.lato.regular }]}>
          {current.toLocaleString('tr-TR')} ₺
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.italic }}>
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
    switch (status) {
      case 'Ödendi':
      case 'Çözüldü':
        return theme.gradients.success;
      case 'Bekliyor':
        return theme.gradients.warning;
      default:
        return [theme.colors.textSecondary, theme.colors.textSecondary];
    }
  };

  return (
    <List.Item
      style={styles.activityItem}
      title={props => (
        <Text style={{ color: theme.colors.text, fontFamily: fonts.lato.bold }}>
          {activity.title}
        </Text>
      )}
      description={props => (
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
            {activity.description}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.italic }}>
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
          <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
            {new Date(activity.activityDate).toLocaleDateString('tr-TR')}
          </Text>
          {activity.amount && (
            <Text style={{ color: theme.colors.text, fontFamily: fonts.lato.bold }}>
              {activity.amount.toLocaleString('tr-TR')} ₺
            </Text>
          )}
          <View style={styles.statusContainer}>
            <Badge 
              style={{ 
                fontSize: 12,
                fontFamily: fonts.lato.bold,
                paddingHorizontal: 8,
                
                marginBottom: 4,
                backgroundColor: activity.status === 'Ödendi' || activity.status === 'Çözüldü' 
                  ? theme.colors.success 
                  : theme.colors.warning 
              }}
            >
              {activity.status}
            </Badge>
          </View>
        </View>
      )}
    />
  );
};

const PaymentItem = ({ payment }) => {
  const theme = useTheme();
  
  return (
    <List.Item
      style={styles.activityItem}
      title={props => (
        <Text style={{ color: theme.colors.text, fontFamily: fonts.lato.bold }}>
          {payment.paymentType}
        </Text>
      )}
      description={props => (
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
            {payment.amount.toLocaleString('tr-TR')} ₺
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.italic }}>
            {payment.payerName}
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
              colors={payment.isPaid ? theme.gradients.success : theme.gradients.warning}
              style={styles.activityIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="cash" size={24} color={theme.colors.text} />
            </LinearGradient>
          )}
          <Text style={styles.apartmentText}>{payment.apartmentNumber}</Text>
        </View>
      )}
      right={props => (
        <View style={styles.activityRight}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
            {new Date(payment.paymentDate).toLocaleDateString('tr-TR')}
          </Text>
          <Badge 
            style={{ 
              fontSize: 12,
              fontFamily: fonts.lato.bold,
              paddingHorizontal: 8,
              marginBottom: 4,
              backgroundColor: payment.isPaid ? theme.colors.success : theme.colors.warning 
            }}
          >
            {payment.isPaid ? 'Ödendi' : 'Bekliyor'}
          </Badge>
        </View>
      )}
    />
  );
};

const ComplaintItem = ({ complaint, onPress }) => {
  const theme = useTheme();
  
  const getStatusGradient = (status) => {
    switch (status) {
      case 'Çözüldü':
        return theme.gradients.success;
      case 'Bekliyor':
        return theme.gradients.warning;
      default:
        return [theme.colors.textSecondary, theme.colors.textSecondary];
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(complaint)}>
      <List.Item
        style={styles.activityItem}
        title={props => (
          <Text style={{ color: theme.colors.text, fontFamily: fonts.lato.bold }}>
            {complaint.subject}
          </Text>
        )}
        description={props => (
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
              {complaint.description}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.italic }}>
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
            <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
              {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
            </Text>
            <Badge 
              style={{ 
                fontSize: 12,
                fontFamily: fonts.lato.bold,
                paddingHorizontal: 8,
                marginBottom: 4,
                backgroundColor: complaint.status === 'Çözüldü' ? theme.colors.success : theme.colors.warning 
              }}
            >
              {complaint.status}
            </Badge>
          </View>
        )}
      />
    </TouchableOpacity>
  );
};

const ComplaintModal = ({ visible, complaint, onClose, onResolve, isResolving }) => {
  const theme = useTheme();
  const [slideAnim] = useState(new Animated.Value(Dimensions.get('window').width));

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!complaint) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent, 
            { backgroundColor: theme.colors.surface, transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, fontFamily: fonts.lato.bold }]}>
              Şikayet Detayı
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.complaintDetails}>
            <View style={styles.complaintHeader}>
              {complaint.profileImageUrl ? (
                <Avatar.Image 
                  size={64} 
                  source={{ uri: complaint.profileImageUrl }} 
                />
              ) : (
                <Avatar.Icon 
                  size={64} 
                  icon="account" 
                  color={theme.colors.text}
                  style={{ backgroundColor: theme.colors.primary }}
                />
              )}
              <View style={styles.complaintHeaderText}>
                <Text style={{ fontSize: 18, fontFamily: fonts.lato.bold, color: theme.colors.text }}>
                  {complaint.complainerName}
                </Text>
                <Text style={{ fontFamily: fonts.lato.regular, color: theme.colors.textSecondary }}>
                  {complaint.apartmentNumber}, {complaint.buildingName}
                </Text>
                <View style={styles.statusChip}>
                  <Text style={{ 
                    color: complaint.status === 'Çözüldü' ? theme.colors.success : theme.colors.warning,
                    fontFamily: fonts.lato.bold 
                  }}>
                    {complaint.status}
                  </Text>
                </View>
              </View>
            </View>
            
            <Divider style={{ marginVertical: 16 }} />
            
            <Text style={{ fontSize: 18, fontFamily: fonts.lato.bold, color: theme.colors.text, marginBottom: 8 }}>
              {complaint.subject}
            </Text>
            
            <Text style={{ fontFamily: fonts.lato.regular, color: theme.colors.text, marginBottom: 16 }}>
              {complaint.description}
            </Text>
            
            <Text style={{ fontFamily: fonts.lato.italic, color: theme.colors.textSecondary, marginBottom: 24 }}>
              Tarih: {new Date(complaint.createdAt).toLocaleString('tr-TR')}
            </Text>
            
            {complaint.status !== 'Çözüldü' && (
              <Button 
                mode="contained" 
                onPress={() => onResolve(complaint.id)}
                loading={isResolving}
                disabled={isResolving}
                style={{ backgroundColor: theme.colors.primary }}
              >
                İşleme Al
              </Button>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const DashboardScreen = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.ADMIN.ENHANCED_DASHBOARD(getCurrentAdminId()));
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Dashboard verisi alınırken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleComplaintPress = (complaint) => {
    setSelectedComplaint(complaint);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedComplaint(null), 300); // Animation süresinden sonra state'i temizle
  };

  const handleResolveComplaint = async (complaintId) => {
    setIsResolving(true);
    try {
      const adminId = getCurrentAdminId();
      await axios.post(API_ENDPOINTS.COMPLAINT.RESOLVE(complaintId), {
        adminId: adminId,
        message: `${selectedComplaint.subject} şikayetiniz işleme alındı`
      });
      
      // Başarılı olduğunda dashboard verilerini güncelle
      const response = await axios.get(API_ENDPOINTS.ADMIN.ENHANCED_DASHBOARD(adminId));
      setDashboardData(response.data.data);
      
      // Modalı kapat
      handleCloseModal();
    } catch (error) {
      console.error('Şikayet işleme alınırken hata oluştu:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const TabHeader = () => (
    <View style={styles.tabHeader}>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 'activities' && styles.activeTabButton
        ]}
        onPress={() => setActiveTab('activities')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'activities' && styles.activeTabText,
          { fontFamily: fonts.lato.bold }
        ]}>
          Son Aktiviteler
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 'complaints' && styles.activeTabButton
        ]}
        onPress={() => setActiveTab('complaints')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'complaints' && styles.activeTabText,
          { fontFamily: fonts.lato.bold }
        ]}>
          Şikayetler
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 'payments' && styles.activeTabButton
        ]}
        onPress={() => setActiveTab('payments')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'payments' && styles.activeTabText,
          { fontFamily: fonts.lato.bold }
        ]}>
          Ödemeler
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  if (loading || !dashboardData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text, fontFamily: fonts.lato.regular }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.text, fontFamily: fonts.lato.regular }]}>
        Site Yönetim Paneli
      </Text>
      
      <View style={styles.statsContainer}>
        <StatCard
          title="Toplam Bina"
          value={dashboardData.summary.totalBuildings}
          icon="office-building"
          gradient={theme.gradients.primary}
        />
        <StatCard
          title="Toplam Kiracı"
          value={dashboardData.summary.totalTenants}
          icon="account-group"
          gradient={theme.gradients.success}
        />
        <StatCard
          title="Aktif Şikayet"
          value={dashboardData.summary.totalComplaints}
          icon="alert-circle"
          gradient={theme.gradients.warning}
        />
        <StatCard
          title="Bekleyen Ödeme"
          value={dashboardData.summary.pendingPayments}
          icon="cash-multiple"
          gradient={theme.gradients.danger}
        />
      </View>

      <View style={styles.financialContainer}>
        <FinancialCard
          title="Aylık Gelir"
          current={dashboardData.financialOverview.monthlyCollectedAmount}
          target={dashboardData.financialOverview.monthlyExpectedIncome}
          percentage={dashboardData.financialOverview.collectionRate}
          gradient={theme.gradients.success}
        />
      </View>

      <Card style={[styles.activitiesCard, { backgroundColor: theme.colors.surface }]}>
        <TabHeader />
        <Card.Content>
          {activeTab === 'activities' ? (
            dashboardData.recentActivities.length === 0 ? (
              <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
                Aktivite bulunamadı
              </Text>
            ) : (
              <>
                {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ActivityItem activity={activity} />
                    {index < 4 && (
                      <Divider style={[styles.itemDivider, { backgroundColor: theme.colors.textSecondary }]} />
                    )}
                  </React.Fragment>
                ))}
              </>
            )
          ) : activeTab === 'complaints' ? (
            dashboardData.recentComplaints.length === 0 ? (
              <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
                Şikayet bulunamadı
              </Text>
            ) : (
              <>
                {dashboardData.recentComplaints.map((complaint, index) => (
                  <React.Fragment key={complaint.id}>
                    <ComplaintItem 
                      complaint={complaint} 
                      onPress={handleComplaintPress}
                    />
                    {index < dashboardData.recentComplaints.length - 1 && (
                      <Divider style={[styles.itemDivider, { backgroundColor: theme.colors.textSecondary }]} />
                    )}
                  </React.Fragment>
                ))}
              </>
            )
          ) : (
            dashboardData.recentPayments.length === 0 ? (
              <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular }}>
                Ödeme bulunamadı
              </Text>
            ) : (
              <>
                {dashboardData.recentPayments.map((payment, index) => (
                  <React.Fragment key={payment.id}>
                    <PaymentItem payment={payment} />
                    {index < dashboardData.recentPayments.length - 1 && (
                      <Divider style={[styles.itemDivider, { backgroundColor: theme.colors.textSecondary }]} />
                    )}
                  </React.Fragment>
                ))}
              </>
            )
          )}
        </Card.Content>
      </Card>

      <Card style={[styles.activitiesCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Title 
          title="En Çok Şikayet Alan Bina" 
          titleStyle={{ color: theme.colors.text, fontFamily: fonts.lato.bold }}
        />
        <Card.Content>
          <Text style={{ color: theme.colors.text, fontFamily: fonts.lato.bold, fontSize: 18 }}>
            {dashboardData.mostComplainedBuilding.buildingName}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.regular, marginTop: 4 }}>
            Şikayet Sayısı: {dashboardData.mostComplainedBuilding.complaintCount}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.lato.italic, marginTop: 8 }}>
            Yaygın Şikayetler:
          </Text>
          {dashboardData.mostComplainedBuilding.commonComplaints.map((complaint, index) => (
            <Text key={index} style={{ color: theme.colors.text, fontFamily: fonts.lato.regular, marginLeft: 8, marginTop: 4 }}>
              • {complaint}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <ComplaintModal 
        visible={modalVisible}
        complaint={selectedComplaint}
        onClose={handleCloseModal}
        onResolve={handleResolveComplaint}
        isResolving={isResolving}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    fontSize: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  gradientCard: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
  },
  statValue: {
    fontSize: 28,
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  financialContainer: {
    marginBottom: 24,
  },
  financialCard: {
    marginBottom: 16,
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
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.text,
  },
  profileAvatar: {
    marginBottom: 4,
  },
  apartmentText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
    color: theme.colors.text,
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
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  itemDivider: {
    height: 1,
    opacity: 0.2,

  },
});

export default DashboardScreen;
