import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  ActivityIndicator,
  Badge,
  Chip,
  ProgressBar,
  useTheme,
  IconButton,
  Divider,
  Button,
  Menu,
  Portal,
  Modal,
  TextInput,
  Switch,
  MD3Colors
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors, { Gradients } from '../../../constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon } from '@expo/vector-icons';


const { width } = Dimensions.get('window');

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false
};

const AnimatedProgressBar = ({ progress, color }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  return (
    <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            backgroundColor: color,
            width
          }
        ]}
      />
    </View>
  );
};

const PaymentTypeCard = ({ title, amount, total, color, icon }) => {
  const percentage = total > 0 ? Math.min(Math.max((amount / total) * 100, 0), 100) : 0;
  const [widthAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <Animatable.View animation="fadeIn" duration={800} style={styles.paymentTypeCardContainer}>
      <Card style={[styles.paymentTypeCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <Card.Content>
          <View style={styles.paymentTypeHeader}>
            <View style={[styles.paymentTypeIcon, { backgroundColor: `${color}20` }]}>
              <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <Badge style={[styles.paymentTypeBadge, { backgroundColor: color }]}>
              {`${percentage.toFixed(0)}%`}
            </Badge>
          </View>
          <Text style={styles.paymentTypeAmount}>
            {amount.toLocaleString('tr-TR')}₺
          </Text>
          <Text style={styles.paymentTypeTitle}>{title}</Text>
          <View style={[styles.percentageBar, { backgroundColor: `${color}20` }]}>
            <Animated.View 
              style={[
                styles.percentageFill, 
                { 
                  backgroundColor: color,
                  width: animatedWidth
                }
              ]} 
            />
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );
};

const FilterDrawer = ({ visible, onDismiss, filters, setFilters, onApply }) => {
  const translateX = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const [localFilters, setLocalFilters] = useState(filters);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: Dimensions.get('window').width,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleApply = () => {
    setFilters(localFilters);
    onApply();
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
      buildingId: null,
      apartmentId: null,
      paymentType: null,
      paymentStatus: null,
      isOverdueOnly: false,
      sortBy: 'date',
      sortDirection: 'desc',
      pageNumber: 1,
      pageSize: 10
    };
    setLocalFilters(resetFilters);
  };

  if (!visible) return null;

  return (
    <Portal>
      <Animated.View style={[styles.drawerOverlay, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.drawerBackdrop} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.drawerContent,
            { 
              transform: [{ translateX }],
            }
          ]}
        >
          <View style={styles.drawerHeader}>
            <View style={styles.drawerHeaderContent}>
              <MaterialCommunityIcons name="filter-variant" size={24} color="#1a1a1a" />
              <Text style={styles.drawerTitle}>Filtreler</Text>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>
          
          <ScrollView style={styles.drawerBody}>
            {/* Date Range Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="calendar-range" size={22} color="#666" />
                <Text style={styles.sectionTitle}>Tarih Aralığı</Text>
              </View>
              <View style={styles.dateContainer}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDate(true)}
                >
                  <MaterialCommunityIcons name="calendar-start" size={20} color="#666" />
                  <Text style={styles.dateButtonText}>
                    {localFilters.startDate.toLocaleDateString('tr-TR')}
                  </Text>
                </TouchableOpacity>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#666" style={{ marginHorizontal: 8 }} />
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDate(true)}
                >
                  <MaterialCommunityIcons name="calendar-end" size={20} color="#666" />
                  <Text style={styles.dateButtonText}>
                    {localFilters.endDate.toLocaleDateString('tr-TR')}
                  </Text>
                </TouchableOpacity>
              </View>

              {showStartDate && (
                <DateTimePicker
                  value={localFilters.startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDate(false);
                    if (selectedDate) {
                      setLocalFilters(prev => ({
                        ...prev,
                        startDate: selectedDate
                      }));
                    }
                  }}
                  maximumDate={localFilters.endDate}
                />
              )}

              {showEndDate && (
                <DateTimePicker
                  value={localFilters.endDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndDate(false);
                    if (selectedDate) {
                      setLocalFilters(prev => ({
                        ...prev,
                        endDate: selectedDate
                      }));
                    }
                  }}
                  minimumDate={localFilters.startDate}
                />
              )}
            </View>

            <Divider style={styles.divider} />

            {/* Location Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="map-marker" size={22} color="#666" />
                <Text style={styles.sectionTitle}>Lokasyon</Text>
              </View>
              <TextInput
                mode="outlined"
                label="Daire No"
                value={localFilters.apartmentId ? String(localFilters.apartmentId) : ''}
                onChangeText={(text) => {
                  const numValue = text ? parseInt(text) : null;
                  setLocalFilters(prev => ({
                    ...prev,
                    apartmentId: numValue
                  }));
                }}
                keyboardType="numeric"
                style={styles.input}
                right={<TextInput.Icon icon="home" />}
              />
            </View>

            <Divider style={styles.divider} />

            {/* Payment Type Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="cash-multiple" size={22} color="#666" />
                <Text style={styles.sectionTitle}>Ödeme Tipi</Text>
              </View>
              <View style={styles.chipGrid}>
                {[
                  { label: 'Nakit', icon: 'cash' },
                  { label: 'Kredi Kartı', icon: 'credit-card' },
                  { label: 'Havale/EFT', icon: 'bank-transfer' },
                  { label: 'Diğer', icon: 'dots-horizontal' }
                ].map((type) => (
                  <Chip
                    key={type.label}
                    selected={localFilters.paymentType === type.label}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      paymentType: prev.paymentType === type.label ? null : type.label
                    }))}
                    style={styles.filterChip}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={type.icon}
                        size={18}
                        color={localFilters.paymentType === type.label ? '#fff' : '#666'}
                      />
                    )}
                  >
                    {type.label}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Payment Status Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="checkbox-marked-circle" size={22} color="#666" />
                <Text style={styles.sectionTitle}>Ödeme Durumu</Text>
              </View>
              <View style={styles.chipGrid}>
                {[
                  { label: 'Bekleyen', icon: 'clock', color: '#F59E0B' },
                  { label: 'Tamamlandı', icon: 'check-circle', color: '#22C55E' },
                  { label: 'İptal', icon: 'close-circle', color: '#EF4444' }
                ].map((status) => (
                  <Chip
                    key={status.label}
                    selected={localFilters.paymentStatus === status.label}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      paymentStatus: prev.paymentStatus === status.label ? null : status.label
                    }))}
                    style={[
                      styles.filterChip,
                      { borderColor: status.color }
                    ]}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={status.icon}
                        size={18}
                        color={localFilters.paymentStatus === status.label ? '#fff' : status.color}
                      />
                    )}
                  >
                    {status.label}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Overdue Switch */}
            <View style={styles.filterSection}>
              <View style={styles.switchContainer}>
                <View style={styles.switchLeft}>
                  <MaterialCommunityIcons name="alert-circle" size={22} color="#666" />
                  <Text style={styles.switchLabel}>Sadece Geciken Ödemeler</Text>
                </View>
                <Switch
                  value={localFilters.isOverdueOnly}
                  onValueChange={(value) => setLocalFilters(prev => ({
                    ...prev,
                    isOverdueOnly: value
                  }))}
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Sort Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="sort" size={22} color="#666" />
                <Text style={styles.sectionTitle}>Sıralama</Text>
              </View>
              <View style={styles.chipGrid}>
                {[
                  { label: 'Tarihe Göre', value: 'date', icon: 'calendar' },
                  { label: 'Tutara Göre', value: 'amount', icon: 'cash' },
                  { label: 'Gecikmeye Göre', value: 'delay', icon: 'clock-alert' }
                ].map((sort) => (
                  <Chip
                    key={sort.value}
                    selected={localFilters.sortBy === sort.value}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      sortBy: sort.value
                    }))}
                    style={styles.filterChip}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={sort.icon}
                        size={18}
                        color={localFilters.sortBy === sort.value ? '#fff' : '#666'}
                      />
                    )}
                  >
                    {sort.label}
                  </Chip>
                ))}
              </View>
              <View style={styles.sortDirectionContainer}>
                <Button
                  mode={localFilters.sortDirection === 'asc' ? 'contained' : 'outlined'}
                  onPress={() => setLocalFilters(prev => ({ ...prev, sortDirection: 'asc' }))}
                  icon="sort-ascending"
                  style={styles.sortButton}
                >
                  Artan
                </Button>
                <Button
                  mode={localFilters.sortDirection === 'desc' ? 'contained' : 'outlined'}
                  onPress={() => setLocalFilters(prev => ({ ...prev, sortDirection: 'desc' }))}
                  icon="sort-descending"
                  style={styles.sortButton}
                >
                  Azalan
                </Button>
              </View>
            </View>
          </ScrollView>

          <View style={styles.drawerFooter}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.footerButton}
              icon="refresh"
            >
              Sıfırla
            </Button>
            <Button
              mode="contained"
              onPress={handleApply}
              style={styles.footerButton}
              icon="check"
            >
              Uygula
            </Button>
          </View>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
};

const OverduePaymentsList = ({ navigation, overduePayments = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const filteredPayments = overduePayments.filter(payment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      payment.tenantName.toLowerCase().includes(searchLower) ||
      payment.buildingName.toLowerCase().includes(searchLower) ||
      payment.apartmentNumber.toString().includes(searchLower)
    );
  });

  const paginatedPayments = filteredPayments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const renderPaymentItem = ({ item }) => (
    <Surface 
      style={[styles.overduePaymentItem, { 
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        width: '100%',
        marginHorizontal: 0
      }]} 
    >
      <View style={styles.overduePaymentContent}>
        {/* Header - Tenant Info & Status */}
        <View style={styles.overduePaymentHeader}>
          <View style={styles.tenantInfoContainer}>
            <View style={[styles.statusIconContainer, {
              backgroundColor: '#F1F5F9',
              padding: 8,
              borderRadius: 10
            }]}>
              <MaterialCommunityIcons name="clock-alert" size={24} color="#1BA74B" />
            </View>
            <View style={styles.tenantDetails}>
              <Text style={[styles.tenantName, { 
                fontSize: 16,
                color: '#0F172A',
                fontWeight: 'bold'
              }]}>{item.tenantName}</Text>
              <Text style={[styles.apartmentInfo, { 
                fontSize: 13,
                color: '#64748B'
              }]}>{`${item.buildingName} - Daire ${item.apartmentNumber}`}</Text>
            </View>
          </View>
          <View style={[styles.delayBadge, {
            backgroundColor: '#FEF2F2',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#FEE2E2'
          }]}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#EF4444'
            }}>{`${item.delayedDays} Gün Gecikme`}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={[styles.paymentDetailsContainer, {
          backgroundColor: '#F8FAFC',
          padding: 10,
          borderRadius: 12,
          marginVertical: 6,
          borderWidth: 1,
          borderColor: '#E2E8F0'
        }]}>
          <View style={styles.paymentDetail}>
            <MaterialCommunityIcons name="cash" size={14} color="#64748B" />
            <Text style={[styles.paymentLabel, { color: '#64748B', fontSize: 13 }]}>Toplam Tutar:</Text>
            <Text style={[styles.paymentAmount, { color: '#0F172A', fontWeight: 'bold', fontSize: 13 }]}>
              {item.totalAmount.toLocaleString('tr-TR')}₺
            </Text>
          </View>
          
          <View style={styles.paymentDetail}>
            <MaterialCommunityIcons name="alert-circle" size={14} color="#EF4444" />
            <Text style={[styles.paymentLabel, { color: '#64748B', fontSize: 13 }]}>Ceza Tutarı:</Text>
            <Text style={[styles.paymentAmount, { color: '#EF4444', fontWeight: 'bold', fontSize: 13 }]}>
              +{item.penaltyAmount.toLocaleString('tr-TR')}₺
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, {
              backgroundColor: '#DCF5E8',
              borderWidth: 1,
              borderColor: '#DCF5E8',
              padding: 8,
              borderRadius: 8,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 6
            }]}
          >
            <MaterialCommunityIcons name="phone" size={14} color="#1B874B" />
            <Text style={[styles.actionButtonText, { color: '#1B874B', marginLeft: 4, fontSize: 11 }]}>Ara</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, {
              backgroundColor: '#DCF5E8',
              borderWidth: 1,
              borderColor: '#DCF5E8',
              padding: 8,
              borderRadius: 8,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 6
            }]}
          >
            <MaterialCommunityIcons name="email" size={14} color="#1B874B" />
            <Text style={[styles.actionButtonText, { color: '#1B874B', marginLeft: 4, fontSize: 11 }]}>E-posta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, {
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FEE2E2',
              padding: 8,
              borderRadius: 8,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }]}
          >
            <MaterialCommunityIcons name="bell" size={14} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444', marginLeft: 4, fontSize: 11 }]}>Hatırlat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  );

  return (
    <Card style={[styles.sectionCardNew]} elevation={2}>
      <LinearGradient
        colors={Gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
        }}
      >
        <Card.Title 
          title="Geciken Ödemeler" 
          titleStyle={[styles.sectionTitleNew, { color: '#FFFFFF' }]}
          subtitle={`Toplam: ${filteredPayments.length}`}
          subtitleStyle={[styles.sectionSubtitleNew, { color: 'rgba(255,255,255,0.8)' }]}
          left={(props) => (
            <View style={[styles.sectionIconContainerNew, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <MaterialCommunityIcons {...props} name="clock-alert" size={24} color="#FFFFFF" />
            </View>
          )}
        />
        <Card.Content style={{ padding: 0 }}>
          {/* Payments List */}
          <FlatList
            data={paginatedPayments}
            renderItem={renderPaymentItem}
            keyExtractor={(item) => item.paymentId.toString()}
            scrollEnabled={false}
            contentContainerStyle={[styles.listContainerNew, { paddingHorizontal: 0 }]}
            ListEmptyComponent={() => (
              <View style={styles.emptyListContainer}>
                <MaterialCommunityIcons name="check-circle" size={48} color="#22C55E" />
                <Text style={styles.emptyListText}>Geciken ödeme bulunmuyor</Text>
              </View>
            )}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.paginationContainerNew}>
              <TouchableOpacity 
                onPress={() => setPage(1)}
                disabled={page === 1}
                style={[
                  styles.pageButtonNew,
                  page === 1 && styles.pageButtonDisabledNew
                ]}
              >
                <MaterialCommunityIcons 
                  name="chevron-double-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : '#EF4444'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={[
                  styles.pageButtonNew,
                  page === 1 && styles.pageButtonDisabledNew
                ]}
              >
                <MaterialCommunityIcons 
                  name="chevron-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : '#EF4444'} 
                />
              </TouchableOpacity>

              <View style={styles.paginationSeparator} />
              
              <Text style={styles.paginationInfoText}>
                Sayfa {page} / {totalPages}
              </Text>

              <View style={styles.paginationSeparator} />

              <TouchableOpacity 
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={[
                  styles.pageButtonNew,
                  page === totalPages && styles.pageButtonDisabledNew
                ]}
              >
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : '#EF4444'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setPage(totalPages)}
                disabled={page === totalPages}
                style={[
                  styles.pageButtonNew,
                  page === totalPages && styles.pageButtonDisabledNew
                ]}
              >
                <MaterialCommunityIcons 
                  name="chevron-double-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : '#EF4444'} 
                />
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

const FinanceScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  
  // Filter States
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    buildingId: null,
    apartmentId: null,
    paymentType: null,
    paymentStatus: null,
    isOverdueOnly: false,
    sortBy: 'date',
    sortDirection: 'desc',
    pageNumber: 1,
    pageSize: 10
  });

  // Date picker states
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  // Date picker handlers
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDate(false);
    if (selectedDate) {
      setFilters(prev => ({
        ...prev,
        startDate: selectedDate
      }));
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDate(false);
    if (selectedDate) {
      setFilters(prev => ({
        ...prev,
        endDate: selectedDate
      }));
    }
  };

  const handleFilterApply = async () => {
    setFilterModalVisible(false);
    setSelectedBuilding(filters.buildingId);
    await fetchFinanceData();
  };

  const handleFilterReset = () => {
    setFilters({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
      buildingId: null,
      apartmentId: null,
      paymentType: null,
      paymentStatus: null,
      isOverdueOnly: false,
      sortBy: 'date',
      sortDirection: 'desc',
      pageNumber: 1,
      pageSize: 10
    });
  };

  const fetchFinanceData = async (buildingId = null) => {
    try {
      setLoading(true);
      let endpoint = `${API_ENDPOINTS.FINANCE.DASHBOARD}`;
      
      // Construct query parameters
      const params = new URLSearchParams();
      
      // Date filters
      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString().split('T')[0]);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString().split('T')[0]);
      }

      // Location filters
      if (buildingId || filters.buildingId) {
        params.append('buildingId', buildingId || filters.buildingId);
      }
      if (filters.apartmentId) {
        params.append('apartmentId', filters.apartmentId);
      }

      // Payment filters
      if (filters.paymentType) {
        params.append('paymentType', filters.paymentType);
      }
      if (filters.paymentStatus) {
        params.append('paymentStatus', filters.paymentStatus);
      }
      if (filters.isOverdueOnly) {
        params.append('isOverdueOnly', true);
      }
      
      // Sorting and pagination
      params.append('sortBy', filters.sortBy);
      params.append('sortDirection', filters.sortDirection);
      params.append('pageNumber', filters.pageNumber);
      params.append('pageSize', filters.pageSize);

      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
      
      const response = await axios.get(endpoint);
      if (response.data.success) {
        setData(response.data.data);
        console.log('Finance data fetched:', response.data.data);
      } else {
        console.error('Error in API response:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData(selectedBuilding);
  }, [selectedBuilding]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const summary = data?.dashboard?.summary;
  const buildingFinances = data?.dashboard?.buildingFinances || [];
  const statistics = data?.dashboard?.statistics;
  const overduePayments = data?.dashboard?.overduePayments || [];

  const renderSummaryCard = () => (
    <Animatable.View animation="fadeInUp" duration={1000} style={styles.summaryCard}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.buildingName}>{summary?.buildingName || 'Tüm Binalar'}</Text>
            <Text style={styles.periodText}>
              {`${summary?.month || ''} ${summary?.year || ''}`}
            </Text>
          </View>
          <Badge style={styles.collectionBadge}>
            {`${summary?.collectionRate || 0}% Tahsilat`}
          </Badge>
        </View>

        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Beklenen Gelir</Text>
            <Text style={styles.summaryValue}>
              {summary?.expectedIncome?.toLocaleString('tr-TR')}₺
            </Text>
            <Text style={styles.summarySubtext}>
              {`${summary?.totalPayments || 0} Ödeme`}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tahsil Edilen</Text>
            <Text style={styles.summaryValue}>
              {summary?.collectedAmount?.toLocaleString('tr-TR')}₺
            </Text>
            <Text style={styles.summarySubtext}>
              {`${summary?.completedPaymentCount || 0} Tamamlanan`}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Bekleyen</Text>
            <Text style={styles.summaryValue}>
              {summary?.pendingAmount?.toLocaleString('tr-TR')}₺
            </Text>
            <Text style={styles.summarySubtext}>
              {`${summary?.pendingPaymentCount || 0} Bekleyen`}
            </Text>
          </View>
        </View>

        <AnimatedProgressBar
          progress={summary?.collectionRate / 100 || 0}
          color="#fff"
        />
      </LinearGradient>
    </Animatable.View>
  );

  const renderStatisticsCards = () => (
    <Animatable.View animation="fadeInUp" delay={300} style={styles.statisticsContainer}>
      <Text style={[styles.sectionTitle, { color: Colors.text }]}>Genel İstatistikler</Text>
      <View style={styles.statisticsGrid}>
        <Card style={[styles.statisticsCard, { overflow: 'hidden', backgroundColor: 'transparent', width: (width - 40) / 2 }]}>
          <LinearGradient
            colors={['#60A5FA', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 12, borderRadius: 12 }}
          >
            <Text style={[styles.statisticsLabel, { color: '#fff' }]}>Toplam Gelir</Text>
            <Text style={[styles.statisticsValue, { color: '#fff' }]}>
              {statistics?.totalRevenue?.toLocaleString('tr-TR')}₺
            </Text>
          </LinearGradient>
        </Card>
        <Card style={[styles.statisticsCard, { overflow: 'hidden', backgroundColor: 'transparent', width: (width - 40) / 2 }]}>
          <LinearGradient
            colors={['#F87171', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 12, borderRadius: 12 }}
          >
            <Text style={[styles.statisticsLabel, { color: '#fff' }]}>Toplam Ceza</Text>
            <Text style={[styles.statisticsValue, { color: '#fff' }]}>
              {statistics?.totalPenaltyAmount?.toLocaleString('tr-TR')}₺
            </Text>
          </LinearGradient>
        </Card>
        <Card style={[styles.statisticsCard, { overflow: 'hidden', backgroundColor: 'transparent', width: (width - 40) / 2 }]}>
          <LinearGradient
            colors={['#4ADE80', '#22C55E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 12, borderRadius: 12 }}
          >
            <Text style={[styles.statisticsLabel, { color: '#fff' }]}>Ortalama Ödeme</Text>
            <Text style={[styles.statisticsValue, { color: '#fff' }]}>
              {statistics?.averagePaymentAmount?.toLocaleString('tr-TR')}₺
            </Text>
          </LinearGradient>
        </Card>
        <Card style={[styles.statisticsCard, { overflow: 'hidden', backgroundColor: 'transparent', width: (width - 40) / 2 }]}>
          <LinearGradient
            colors={['#A78BFA', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 12, borderRadius: 12 }}
          >
            <Text style={[styles.statisticsLabel, { color: '#fff' }]}>Ort. Gecikme</Text>
            <Text style={[styles.statisticsValue, { color: '#fff' }]}>
              {`${statistics?.averageDelayDays || 0} Gün`}
            </Text>
          </LinearGradient>
        </Card>
      </View>
    </Animatable.View>
  );

  const renderBuildingsList = () => {
    const gradients = [
      Gradients.blueIndigo,
      Gradients.purple,
      Gradients.teal,
      Gradients.indigo,
      Gradients.greenBlue
    ];

    return (
      <Animatable.View animation="fadeInUp" delay={200} style={styles.buildingsContainer}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Binalar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {buildingFinances.map((building, index) => (
            <TouchableOpacity
              key={building.buildingId}
              onPress={() => setSelectedBuilding(building.buildingId)}
            >
              <Animatable.View
                animation="fadeIn"
                delay={index * 100}
                style={styles.buildingCardContainer}
              >
                <LinearGradient
                  colors={gradients[index % gradients.length]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.buildingCard,
                    selectedBuilding === building.buildingId && styles.selectedBuildingCard
                  ]}
                >
                  <Text style={styles.buildingCardTitle}>{building.buildingName}</Text>
                  <View style={styles.buildingCardStats}>
                    <Text style={styles.buildingCardAmount}>
                      {building.monthlyCollectedAmount.toLocaleString('tr-TR')}₺
                    </Text>
                    <Badge style={[styles.buildingCardBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                      {`${building.collectionRate}%`}
                    </Badge>
                  </View>
                  <Text style={styles.buildingCardSubtitle}>
                    {`${building.paidApartments}/${building.totalApartments} Daire`}
                  </Text>
                </LinearGradient>
              </Animatable.View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animatable.View>
    );
  };

  const renderPaymentDistribution = () => {
    // API yanıtını kontrol etmek için log
    console.log('Payment Distribution Data:', statistics?.paymentTypeDistribution);

    // Veri yapısını kontrol et ve dönüştür
    let paymentData = [];
    if (statistics?.paymentTypeDistribution) {
      if (Array.isArray(statistics.paymentTypeDistribution)) {
        // Eğer bir array ise direkt kullan
        paymentData = statistics.paymentTypeDistribution;
      } else if (typeof statistics.paymentTypeDistribution === 'object') {
        // Eğer bir obje ise array'e çevir
        paymentData = Object.entries(statistics.paymentTypeDistribution).map(([type, amount]) => ({
          type,
          amount: Number(amount)
        }));
      }
    }

    if (!paymentData.length) {
      return (
        <Animatable.View animation="fadeInUp" delay={400} style={styles.paymentDistributionContainer}>
          <Text style={styles.sectionTitle}>Ödeme Dağılımı</Text>
          <Text style={styles.noDataText}>Henüz ödeme verisi bulunmuyor.</Text>
        </Animatable.View>
      );
    }

    const total = paymentData.reduce((sum, item) => sum + (item.amount || 0), 0);

    const paymentTypeColors = {
      'Nakit': '#22C55E',
      'Kredi Kartı': '#6366F1',
      'Havale/EFT': '#8B5CF6',
      'Diğer': '#F59E0B'
    };

    const paymentTypeIcons = {
      'Nakit': 'cash',
      'Kredi Kartı': 'card',
      'Havale/EFT': 'swap-horizontal',
      'Diğer': 'wallet'
    };

    return (
      <Animatable.View animation="fadeInUp" delay={400} style={styles.paymentDistributionContainer}>
        <Text style={styles.sectionTitle}>Ödeme Dağılımı</Text>
        <View style={styles.paymentTypesGrid}>
          {paymentData.map((item) => (
            <PaymentTypeCard
              key={item.type}
              title={item.type}
              amount={item.amount}
              total={total}
              color={paymentTypeColors[item.type] || '#6366F1'}
              icon={paymentTypeIcons[item.type] || 'wallet'}
            />
          ))}
        </View>
      </Animatable.View>
    );
  };

  const renderOverduePayments = () => (
    <OverduePaymentsList 
      navigation={navigation} 
      overduePayments={overduePayments} 
    />
  );

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.header}>
          <IconButton
            icon="filter-variant"
            size={24}
            onPress={() => setFilterModalVisible(true)}
          />
        </View>
        {renderSummaryCard()}
        {renderStatisticsCards()}
        {renderBuildingsList()}
        {renderPaymentDistribution()}
        {renderOverduePayments()}
      </ScrollView>
      <FilterDrawer
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => {
          setFilterModalVisible(false);
          fetchFinanceData();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  buildingName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  collectionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  buildingsContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  buildingCardContainer: {
    marginRight: 12,
  },
  buildingCard: {
    width: 220,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  selectedBuildingCard: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  buildingCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  buildingCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buildingCardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buildingCardBadge: {
    color: '#fff',
  },
  buildingCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  paymentDistributionContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  paymentTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  paymentTypeCardContainer: {
    width: (width - 48) / 2,
    marginBottom: 12,
  },
  paymentTypeCard: {
    elevation: 2,
    borderRadius: 12,
  },
  paymentTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTypeBadge: {
    fontSize: 12,
  },
  paymentTypeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  paymentTypeTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  percentageBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 2,
  },
  overdueContainer: {
    margin: 16,
  },
  overdueCard: {
   
    elevation: 2,
  },
  overdueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  
  },
  overdueTenant: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  overdueApartment: {
    fontSize: 12,
    color: '#666',
  },
  overdueBadge: {
    backgroundColor: '#EF4444',
  },
  overdueDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  overdueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
    marginRight: 8,
  },
  overduePenalty: {
    fontSize: 12,
    color: '#EF4444',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  periodText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  statisticsContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  statisticsCard: {
    marginBottom: 8,
    elevation: 2,
  },
  statisticsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statisticsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    zIndex: 1000,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContent: {
    width: '85%',
    backgroundColor: 'white',
    height: '100%',
    position: 'absolute',
    right: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    elevation: 2,
  },
  drawerHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#1a1a1a',
  },
  drawerBody: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
 
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateButtonText: {
    marginLeft: 8,
    color: '#1a1a1a',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterChip: {
    margin: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1a1a1a',
  },
  sortDirectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  sortButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  drawerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    elevation: 2,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  overduePaymentItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    width: '100%',
    marginHorizontal: 0
  },
  overduePaymentContent: {
    gap: 8,
    width:"100%"
  },
  overduePaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tenantInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIconContainer: {
    borderRadius: 8,
  },
  tenantDetails: {
    gap: 2,
  },
  paymentDetailsContainer: {
    gap: 3,
    marginVertical: 6,
  },
  paymentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  paymentAmount: {
    fontSize: 13,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionCardNew: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitleNew: {
    fontSize: 18,
    fontWeight: 'bold',
    
    color: '#AAA',
  },
  sectionSubtitleNew: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionIconContainerNew: {
    padding: 8,
    borderRadius: 10,
  },
  separatorNew: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  listContainerNew: {
    padding: 16,
    width: '100%'
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  paginationContainerNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pageButtonNew: {
    padding: 8,
    borderRadius: 8,
  },
  pageButtonDisabledNew: {
    backgroundColor: '#E2E8F0',
  },
  paginationSeparator: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  paginationInfoText: {
    fontSize: 14,
    color: '#666',
  },
});

export default FinanceScreen; 