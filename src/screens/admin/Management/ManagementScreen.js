import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, FlatList, TouchableOpacity, Dimensions, TextInput, Linking, Animated, Modal, Clipboard } from 'react-native';
import { 
  Card, 
  Text, 
  Avatar, 
  ProgressBar, 
  Surface, 
  ActivityIndicator, 

  Chip, 

} from 'react-native-paper';
import { Colors, Gradients } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import Theme from '../../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';

const { width } = Dimensions.get('window');

const CustomBadge = ({ children, style, textStyle }) => (
  <View style={[styles.customBadge, style]}>
    <Text style={[styles.customBadgeText, textStyle]}>{children}</Text>
  </View>
);

// BuildingSelector Component (Updated to FlatList)
const BuildingSelector = ({ buildings = [], selectedBuilding, onSelectBuilding }) => {
  const renderBuildingItem = ({ item }) => {
    if (!item) return null;

    const isSelected = selectedBuilding?.id === item.id;
    const gradientColors = isSelected ? ['#2C3E50', '#3498DB'] : ['#A8FAFC', '#ABF5FB'];
    const textColor = isSelected ? Colors.text : Colors.primary;
    const iconColor = isSelected ? Colors.text : Colors.primary;
    

    return (
      <TouchableOpacity
        onPress={() => onSelectBuilding(item)}
        style={[
          styles.buildingCard,
          isSelected && styles.selectedBuildingCard
        ]}
      >
        <LinearGradient
          colors={isSelected ? ['#2C3E50', '#3498DB'] : ['#B8CFAC', '#ABF5FB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buildingCardGradient}
        >
          <View style={styles.buildingCardHeader}>
            <View style={[
              styles.buildingIconContainer,
              { backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : Colors.primaryLight }
            ]}>
              <Icon 
                name="office-building" 
                size={24} 
                color={isSelected ? '#FFFFFF' : Colors.primary}
              />
            </View>
            <CustomBadge
              style={[
                styles.occupancyBadge,
                { backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : Colors.successLight }
              ]}
              textStyle={{ color: isSelected ? '#FFFFFF' : Colors.success }}
            >
              {item?.occupancyRate || 0}% Dolu
            </CustomBadge>
          </View>
          
          <Text style={[
            styles.buildingCardName,
            { color: isSelected ? '#FFFFFF' : Colors.text }
          ]}>
            {item?.name || 'Bina'}
          </Text>
          
          <View style={styles.buildingCardFooter}>
            <View style={styles.buildingStatItem}>
              <Icon 
                name="door" 
                size={16} 
                color={isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary}
              />
              <Text style={[
                styles.buildingStatText,
                { color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary }
              ]}>
                {item?.totalApartments || 0} Daire
              </Text>
            </View>
            <View style={styles.buildingStatItem}>
              <Icon 
                name="account-group" 
                size={16} 
                color={isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary}
              />
              <Text style={[
                styles.buildingStatText,
                { color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary }
              ]}>
                {item?.totalResidentsCount || 0} Sakin
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyBuildingContainer}>
      <Icon name="office-building-outline" size={32} color={Colors.textSecondary} />
      <Text style={styles.emptyBuildingText}>Bina bulunamadı</Text>
    </View>
  );

  // buildings prop'u undefined veya null ise boş dizi kullan
  const safeBuildings = buildings || [];

  return (
    <FlatList
      horizontal
      data={safeBuildings}
      renderItem={renderBuildingItem}
      keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.buildingSelectorContainer,
        !safeBuildings.length && styles.emptyBuildingSelectorContainer,
        { paddingHorizontal: width * 0.075 }
      ]}
      snapToInterval={width * 0.85 + 16}
      decelerationRate={0.2}
      snapToAlignment="center"
      ListEmptyComponent={renderEmptyComponent}
      getItemLayout={(data, index) => ({
        length: width * 0.85 + 16,
        offset: (width * 0.85 + 16) * index,
        index,
      })}
    />
  );
};

// QuickStatCard Component (Updated)
const QuickStatCard = ({ title, value, icon, gradient = Gradients.primary }) => {
  return (
    <Surface style={styles.quickStatCard} elevation={2}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickStatGradient}
      >
        <View style={styles.quickStatIconContainer}>
          <Icon name={icon} size={24} color={Colors.surface} />
        </View>
        <Text style={styles.quickStatValue}>{value}</Text>
        <Text style={styles.quickStatTitle}>{title}</Text>
      </LinearGradient>
    </Surface>
  );
};

// ApartmentsList Component
const ApartmentsList = ({ apartments, navigation, buildingId }) => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    floor: 'all',
    type: 'all'
  });
  const [floorInput, setFloorInput] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apartmentsData, setApartmentsData] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchApartments = async () => {
      if (!buildingId) {
        console.log('=== ApartmentsList: No buildingId provided ===');
        setLoading(false);
        return;
      }
      
      try {
        console.log('=== ApartmentsList: Fetching apartments ===');
        console.log('Building ID:', buildingId);
        
        setLoading(true);
        const url = API_ENDPOINTS.BUILDING.APARTMENTS(buildingId);
        console.log('API Endpoint Configuration:', {
          endpoint: 'API_ENDPOINTS.BUILDING.APARTMENTS',
          fullUrl: url,
          buildingId: buildingId
        });
        
        const response = await axios.get(url);
        
        console.log('=== ApartmentsList: API Response ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data) {
          setApartmentsData(response.data.data);
          setError(null);
          console.log('Apartments data set successfully');
        } else {
          throw new Error('Geçersiz veri formatı');
        }
      } catch (err) {
        console.error('=== ApartmentsList: Error fetching apartments ===');
        console.error('Error Type:', err.name);
        console.error('Error Message:', err.message);
        if (err.response) {
          console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
          console.error('Error Status:', err.response.status);
        }
        setError('Daire verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, [buildingId]);

  // Benzersiz kat ve daire tiplerini bul
  const uniqueFloors = [...new Set(apartmentsData?.map(apt => apt.floor))].sort((a, b) => a - b);
  const uniqueTypes = [...new Set(apartmentsData?.map(apt => apt.type))];

  // Maksimum kat sayısını bul
  const maxFloor = Math.max(...apartmentsData?.map(apt => apt.floor) || [0]);

  const filteredApartments = apartmentsData?.filter(apt => {
    const matchesStatus = activeFilters.status === 'all' || 
      (activeFilters.status === 'empty' ? apt.status === 'Boş' : apt.status === 'Dolu');
    
    const matchesFloor = activeFilters.floor === 'all' || 
      (floorInput && apt.floor.toString() === floorInput);
    
    const matchesType = activeFilters.type === 'all' || 
      apt.type === activeFilters.type;

    const matchesSearch = searchText === '' ||
      apt.unitNumber.toString().includes(searchText) ||
      (apt.tenantName && apt.tenantName.toLowerCase().includes(searchText.toLowerCase()));

    return matchesStatus && matchesFloor && matchesType && matchesSearch;
  });

  const paginatedApartments = filteredApartments?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil((filteredApartments?.length || 0) / itemsPerPage);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1); // Filtre değiştiğinde ilk sayfaya dön
  };

  const handleViewDetails = (apartmentId) => {
    navigation.navigate('ApartmentDetails', { apartmentId });
  };

  const renderApartmentItem = ({ item }) => {
    const isOccupied = item.status === 'Dolu';
    return (
      <Surface 
        style={[
          styles.apartmentItemNew, 
          { 
            backgroundColor: '#F8FAFC',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            borderWidth: 1,
            borderColor: '#E2E8F0'
          }
        ]} 
      >
        <View style={[styles.apartmentItemContentNew]}>
          {/* Üst Kısım - Daire No ve Durum */}
          <View style={styles.apartmentHeaderNew}>
              <View style={styles.apartmentHeaderLeft}>
              <View style={{
                backgroundColor: isOccupied ? '#DCF5E8' : '#FFF0DB',
                padding: 8,
                borderRadius: 10
              }}>
                  <Icon 
                    name={isOccupied ? "home" : "home-outline"} 
                    size={24} 
                    color={isOccupied ? '#1B874B' : '#D97706'}
                  />
              </View>
              <Text style={[
                styles.apartmentNumberNew,
                { color: '#334155', marginLeft: 12 }
              ]}>
                Daire {item.unitNumber}
              </Text>
            </View>
            <CustomBadge
              style={[
                styles.statusBadgeNew,
                { 
                  backgroundColor: isOccupied ? '#DCF5E8' : '#FFF0DB',
                  borderWidth: 1,
                  borderColor: isOccupied ? '#86EFAC' : '#FCD34D'
                }
              ]}
              textStyle={{ 
                color: isOccupied ? '#1B874B' : '#D97706',
                fontFamily: Fonts.urbanist.semiBold,
                fontSize: 13
              }}
            >
              {item.status}
            </CustomBadge>
          </View>

          {/* Daire Bilgileri */}
          <View style={[
            styles.apartmentInfoRow, 
            { 
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 10,
              marginVertical: 12,
              borderWidth: 1,
              borderColor: '#E2E8F0'
            }
          ]}>
            <View style={styles.infoItem}>
              <Icon name="floor-plan" size={16} color="#475569" />
              <Text style={[styles.infoText, { color: '#475569', marginLeft: 6 }]}>
                {item.floor}. Kat
              </Text>
            </View>
            <View style={[styles.infoItemDivider, { backgroundColor: '#E2E8F0' }]} />
            <View style={styles.infoItem}>
              <Icon name="home-variant" size={16} color="#475569" />
              <Text style={[styles.infoText, { color: '#475569', marginLeft: 6 }]}>
                {item.type}
              </Text>
            </View>
            {isOccupied && (
              <>
                <View style={[styles.infoItemDivider, { backgroundColor: '#E2E8F0' }]} />
                <View style={styles.infoItem}>
                  <Icon name="account" size={16} color="#475569" />
                  <Text style={[styles.infoText, { color: '#475569', marginLeft: 6 }]}>
                    {item.tenantName}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Alt Kısım - Detay Butonu */}
          <TouchableOpacity 
            style={[
              styles.apartmentActionButtonNew,
              {
                backgroundColor: '#E0F2FE',
                borderWidth: 1,
                borderColor: '#7DD3FC',
                padding: 12,
                borderRadius: 10,
                marginTop: 4
              }
            ]}
            onPress={() => handleViewDetails(item.id)}
          >
            <Text style={[
              styles.apartmentActionTextNew,
              { color: '#0369A1', fontFamily: Fonts.urbanist.semiBold }
            ]}>
              Detayları Görüntüle
            </Text>
            <Icon name="chevron-right" size={20} color="#0369A1" />
          </TouchableOpacity>
        </View>
      </Surface>
    );
  };

  return (
    <Card style={[styles.sectionCardNew]}>
      <LinearGradient
        colors={Gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
      
        }}
      >
      <Card.Title 
        title="Daireler" 
          titleStyle={[styles.sectionTitleNew, { color: '#FFFFFF' }]}
        subtitle={`Toplam: ${filteredApartments?.length || 0}`}
          subtitleStyle={[styles.sectionSubtitleNew, { color: 'rgba(255,255,255,0.8)' }]}
        left={(props) => (
            <View key="icon" style={[styles.sectionIconContainerNew, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon {...props} name="door" size={24} color="#FFFFFF" />
            </View>
          )}
          right={(props) => (
            <View key="filters" style={styles.headerFiltersContainer}>
              <TextInput
                key="floorInput"
                style={[styles.floorFilterInput, {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                }]}
                placeholder={`1-${maxFloor} kat`}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={floorInput}
                onChangeText={(text) => {
                  const numValue = parseInt(text);
                  if (text === '' || (numValue >= 1 && numValue <= maxFloor)) {
                    setFloorInput(text);
                    handleFilterChange('floor', text === '' ? 'all' : text);
                  }
                }}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          )}
        />
        <Card.Content>
          {/* Arama Çubuğu */}
          <View style={[styles.searchBarContainerNew, {
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0'
          }]}>
            <Icon name="magnify" size={20} color="#3498DB" style={styles.searchIconNew} />
            <TextInput
              placeholder="Daire no veya kiracı ara..."
              placeholderTextColor="#94A3B8"
              style={[styles.searchInputNew, { color: '#2C3E50' }]}
              onChangeText={text => {
                setSearchText(text);
                setPage(1);
              }}
              value={searchText}
            />
            {searchText !== '' && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchText('');
                  setPage(1);
                }} 
                style={styles.clearSearchNew}
              >
                <Icon name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filtre Grupları */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
          >
            {/* Durum Filtreleri */}
            <View style={styles.filterGroupNew}>
              <Text style={[styles.filterGroupLabelNew, { color: '#FFFFFF',marginLeft: 16 }]}>Durum:</Text>
              <View style={styles.filterButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.filterButtonNew,
                    { backgroundColor: '#F8FAFC' },
                    activeFilters.status === 'all' && { 
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }
                  ]}
                  onPress={() => handleFilterChange('status', 'all')}
                >
                  <Icon 
                    name="view-grid" 
                    size={20} 
                    color={activeFilters.status === 'all' ? '#3498DB' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.filterTextNew,
                    { color: '#64748B' },
                    activeFilters.status === 'all' && { 
                      color: '#3498DB',
                      fontFamily: Fonts.urbanist.bold 
                    }
                  ]}>Tümü</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButtonNew,
                    { backgroundColor: '#F8FAFC' },
                    activeFilters.status === 'empty' && { 
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }
                  ]}
                  onPress={() => handleFilterChange('status', 'empty')}
                >
                  <Icon 
                    name="home-outline" 
                    size={20} 
                    color={activeFilters.status === 'empty' ? '#3498DB' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.filterTextNew,
                    { color: '#64748B' },
                    activeFilters.status === 'empty' && { 
                      color: '#3498DB',
                      fontFamily: Fonts.urbanist.bold 
                    }
                  ]}>Boş</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButtonNew,
                    { backgroundColor: '#F8FAFC' },
                    activeFilters.status === 'occupied' && { 
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }
                  ]}
                  onPress={() => handleFilterChange('status', 'occupied')}
                >
                  <Icon 
                    name="home" 
                    size={20} 
                    color={activeFilters.status === 'occupied' ? '#3498DB' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.filterTextNew,
                    { color: '#64748B' },
                    activeFilters.status === 'occupied' && { 
                      color: '#3498DB',
                      fontFamily: Fonts.urbanist.bold 
                    }
                  ]}>Dolu</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Daire Tipi - Dropdown ile */}
        
          </ScrollView>

          {/* Aktif Filtreler */}
          {(activeFilters.status !== 'all' || activeFilters.floor !== 'all' || activeFilters.type !== 'all' || searchText !== '') && (
            <View style={styles.activeFiltersContainer}>
              <Text style={[styles.activeFiltersLabel, { color: '#64748B' }]}>
                Aktif Filtreler:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activeFilters.status !== 'all' && (
                  <Chip 
                    mode="outlined" 
                    onClose={() => handleFilterChange('status', 'all')}
                    style={[styles.activeFilterChip, {
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }]}
                    textStyle={{ color: '#3498DB' }}
                  >
                    {activeFilters.status === 'empty' ? 'Boş Daireler' : 'Dolu Daireler'}
                  </Chip>
                )}
                {activeFilters.floor !== 'all' && (
                  <Chip 
                    mode="outlined" 
                    onClose={() => handleFilterChange('floor', 'all')}
                    style={[styles.activeFilterChip, {
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }]}
                    textStyle={{ color: '#3498DB' }}
                  >
                    {activeFilters.floor}. Kat
                  </Chip>
                )}
                {activeFilters.type !== 'all' && (
                  <Chip 
                    mode="outlined" 
                    onClose={() => handleFilterChange('type', 'all')}
                    style={[styles.activeFilterChip, {
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }]}
                    textStyle={{ color: '#3498DB' }}
                  >
                    {activeFilters.type}
                  </Chip>
                )}
                {searchText !== '' && (
                  <Chip 
                    mode="outlined" 
                    onClose={() => setSearchText('')}
                    style={[styles.activeFilterChip, {
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }]}
                    textStyle={{ color: '#3498DB' }}
                  >
                    Arama: {searchText}
                  </Chip>
                )}
              </ScrollView>
            </View>
          )}

          {/* Daire Listesi */}
          <FlatList
            data={paginatedApartments}
            renderItem={renderApartmentItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={[styles.separatorNew, { backgroundColor: '#F1F5F9' }]} />
            )}
            contentContainerStyle={styles.listContainerNew}
            ListEmptyComponent={() => (
              <View style={styles.emptyListContainer}>
                <Icon name="home-search" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyListText}>Filtrelere uygun daire bulunamadı</Text>
              </View>
            )}
          />

          {/* Sayfalama */}
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
                <Icon 
                  name="chevron-double-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : Colors.primary} 
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
                <Icon 
                  name="chevron-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : Colors.primary} 
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
                <Icon 
                  name="chevron-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : Colors.primary} 
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
                <Icon 
                  name="chevron-double-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

// ContractModal Component
const ContractModal = ({ visible, onClose, contractFile }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sözleşme</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            {contractFile ? (
              <View style={styles.contractContainer}>
                <Icon name="file-document" size={48} color="#3498DB" />
                <Text style={styles.contractText}>Sözleşme görüntülenemiyor.</Text>
              </View>
            ) : (
              <View style={styles.contractContainer}>
                <Icon name="file-alert" size={48} color="#EF4444" />
                <Text style={styles.contractText}>Sözleşme bilgisi bulunamadı.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// TenantsList Component
const TenantsList = ({ navigation, buildingId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchTenants = async () => {
      if (!buildingId) return;
      
      try {
        setLoading(true);
        const url = API_ENDPOINTS.BUILDING.APARTMENTS(buildingId);
        console.log('=== TenantsList: API Request ===');
        console.log('API Endpoint Configuration:', {
          endpoint: 'API_ENDPOINTS.BUILDING.APARTMENTS',
          fullUrl: url,
          buildingId: buildingId
        });
        
        const response = await axios.get(url);
        
        if (response.data && response.data.data) {
          // Sadece kiracısı olan daireleri filtrele
          const tenantsData = response.data.data
            .filter(apt => apt.tenantName)
            .map(apt => ({
              id: apt.id,
              fullName: apt.tenantName,
              apartmentNumber: apt.unitNumber.toString(),
              phoneNumber: apt.tenantPhone || '',
              email: apt.tenantEmail || '',
              contractFile: apt.contractFile
            }));
          setTenants(tenantsData);
          setError(null);
        } else {
          throw new Error('Geçersiz veri formatı');
        }
      } catch (err) {
        console.error('Error fetching tenants:', err);
        setError('Kiracı verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [buildingId]);

  const handleCall = async (phoneNumber) => {
    try {
      await Clipboard.setString(phoneNumber);
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.error('Error making phone call:', error);
    }
  };

  const handleEmail = async (email) => {
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  const handleContract = (contractFile) => {
    setSelectedContract(contractFile);
    setModalVisible(true);
  };

  const filteredTenants = tenants?.filter(tenant =>
    tenant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.apartmentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTenants = filteredTenants?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil((filteredTenants?.length || 0) / itemsPerPage);

  const renderTenantItem = ({ item }) => (
    <Surface 
      style={[styles.tenantItemNew, { 
        backgroundColor: '#F8FAFC',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 170
      }]} 
    >
      <View style={[styles.tenantItemContentNew, { padding: 12, height: '100%', flexDirection: 'column', justifyContent: 'space-between' }]}>
        {/* Üst Kısım - İki Sütunlu Layout */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {/* Sol Sütun - Profil Resmi */}
          <View style={{
            backgroundColor: '#EBF5FB',
            padding: 8,
            borderRadius: 10,
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
            width: 80
          }}>
            {item.profileImage ? (
              <Avatar.Image 
                size={60} 
                source={{ uri: item.profileImage }}
                style={{ backgroundColor: 'transparent' }}
              />
            ) : (
              <Avatar.Text 
                size={60} 
                label={item.fullName.split(' ').map(n => n[0]).join('')}
                style={{ backgroundColor: 'transparent' }}
                labelStyle={{ color: Colors.primary, fontFamily: Fonts.urbanist.bold }}
              />
            )}
          </View>

        {/* Orta Kısım - Bilgiler */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[styles.tenantNameNew, { 
            fontSize: 16, 
            marginBottom: 4,
            color: '#334155'
          }]}>{item.fullName}</Text>

            <View >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  backgroundColor: '#EBF5FB',
                  padding: 6,
                  borderRadius: 8
                }}>
                  <Icon name="home" size={16} color={Colors.primary} />
                </View>
                <Text style={{
                  fontSize: 14,
                  fontFamily: Fonts.urbanist.medium,
                  color: '#475569'
                }}>{item.apartmentNumber} </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  backgroundColor: '#EBF5FB',
                  padding: 6,
                  borderRadius: 8
                }}>
                  <Icon name="phone" size={16} color={Colors.primary} />
                </View>
                <Text style={{
                  fontSize: 14,
                  fontFamily: Fonts.urbanist.medium,
                  color: '#475569'
                }}>{item.phoneNumber}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  backgroundColor: '#EBF5FB',
                  padding: 6,
                  borderRadius: 8
                }}>
                  <Icon name="email" size={16} color={Colors.primary} />
                </View>
                <Text style={{
                  fontSize: 14,
                  fontFamily: Fonts.urbanist.medium,
                  color: '#475569'
                }}>{item.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alt Kısım - Aksiyon Butonları */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity 
            style={[
              styles.apartmentActionButtonNew,
              {
                backgroundColor: '#E0F2FE',
                borderWidth: 1,
                borderColor: '#7DD3FC',
                padding: 8,
                borderRadius: 8,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }
            ]}
            onPress={() => handleCall(item.phoneNumber)}
          >
            <Icon name="phone" size={16} color="#0369A1" />
            <Text style={[
              styles.apartmentActionTextNew,
              { color: '#0369A1', fontFamily: Fonts.urbanist.semiBold, fontSize: 12 }
            ]}>Ara</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.apartmentActionButtonNew,
              {
                backgroundColor: '#E0F2FE',
                borderWidth: 1,
                borderColor: '#7DD3FC',
                padding: 8,
                borderRadius: 8,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }
            ]}
            onPress={() => handleEmail(item.email)}
          >
            <Icon name="email" size={16} color="#0369A1" />
            <Text style={[
              styles.apartmentActionTextNew,
              { color: '#0369A1', fontFamily: Fonts.urbanist.semiBold, fontSize: 12 }
            ]}>E-posta</Text>
          </TouchableOpacity>

          {item.contractFile && (
            <TouchableOpacity 
              style={[
                styles.apartmentActionButtonNew,
                {
                  backgroundColor: '#E0F2FE',
                  borderWidth: 1,
                  borderColor: '#7DD3FC',
                  padding: 8,
                  borderRadius: 8,
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }
              ]}
              onPress={() => handleContract(item.contractFile)}
            >
              <Icon name="file-document" size={16} color="#0369A1" />
              <Text style={[
                styles.apartmentActionTextNew,
                { color: '#0369A1', fontFamily: Fonts.urbanist.semiBold, fontSize: 12 }
              ]}>Sözleşme</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <Card style={[styles.sectionCardNew]} elevation={2}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.sectionCardNew]} elevation={2}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.sectionCardNew]} elevation={2}>
      <ContractModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        contractFile={selectedContract}
      />
      
      <LinearGradient
        colors={Gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
        }}
      >
        <Card.Title 
          title="Kiracılar" 
          titleStyle={[styles.sectionTitleNew, { color: '#FFFFFF' }]}
          subtitle={`Toplam: ${filteredTenants?.length || 0}`}
          subtitleStyle={[styles.sectionSubtitleNew, { color: 'rgba(255,255,255,0.8)' }]}
          left={(props) => (
            <View style={[styles.sectionIconContainerNew, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon {...props} name="account-group" size={24} color="#FFFFFF" />
            </View>
          )}
        />
        <Card.Content>
          <View style={[styles.searchBarContainerNew, {
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0'
          }]}>
            <Icon name="magnify" size={20} color="#3498DB" style={styles.searchIconNew} />
            <TextInput
              placeholder="Kiracı veya daire ara..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchInputNew}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchNew}>
                <Icon name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={paginatedTenants}
            renderItem={renderTenantItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={[styles.separatorNew, { backgroundColor: '#F1F5F9' }]} />}
            contentContainerStyle={styles.listContainerNew}
            ListEmptyComponent={() => (
              <View style={styles.emptyListContainer}>
                <Icon name="account-search" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyListText}>Kiracı bulunamadı</Text>
              </View>
            )}
          />

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
                <Icon 
                  name="chevron-double-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : Colors.primary} 
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
                <Icon 
                  name="chevron-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : Colors.primary} 
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
                <Icon 
                  name="chevron-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : Colors.primary} 
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
                <Icon 
                  name="chevron-double-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

// Main ManagementScreen Component
const ManagementScreen = ({ navigation }) => {
  const [buildingData, setBuildingData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const fetchBuildingData = async () => {
    try {
      const adminId = getCurrentAdminId();
      const url = `${API_ENDPOINTS.ADMIN.BASE}/management/${adminId}`;
      
      console.log('=== Management Screen API Request ===');
      console.log('Request URL:', url);
      console.log('Admin ID:', adminId);
      
      const response = await axios.get(url);
      
      console.log('=== Management Screen API Response ===');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        setBuildingData(response.data.data);
        // Eğer selectedBuilding yoksa ve binalar varsa ilk binayı seç
        if (!selectedBuilding && response.data.data.buildings.length > 0) {
          console.log('=== Setting Initial Building ===');
          console.log('First Building:', JSON.stringify(response.data.data.buildings[0], null, 2));
          setSelectedBuilding(response.data.data.buildings[0]);
        }
        setError(null);

        // Veri yüklendikten sonra animasyonu başlat
        setTimeout(() => {
          Animated.sequence([
            Animated.timing(scrollX, {
              toValue: -50,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scrollX, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            })
          ]).start();
        }, 500);
      } else {
        throw new Error(response.data.message || 'Veri alınamadı');
      }
    } catch (err) {
      console.error('=== Management Screen API Error ===');
      console.error('Error Type:', err.name);
      console.error('Error Message:', err.message);
      if (err.response) {
        console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
        console.error('Error Status:', err.response.status);
      }
      setError('Bina verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== Management Screen Initial Load ===');
    console.log('Loading initial building data');
    fetchBuildingData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!buildingData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bina verisi bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <BuildingSelector
        buildings={buildingData.buildings}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(building) => {
          setSelectedBuilding(building);
        }}
      />
      
      <View style={styles.statsGrid}>
        <QuickStatCard
          title="Boş Daireler"
          value={selectedBuilding?.emptyApartmentsCount || 0}
          icon="home-outline"
          gradient={Gradients.primary}
        />
        <QuickStatCard
          title="Toplam Sakin"
          value={selectedBuilding?.totalResidentsCount || 0}
          icon="account-group"
          gradient={Gradients.greenBlue}
        />
        <QuickStatCard
          title="Aktif Şikayet"
          value={selectedBuilding?.activeComplaintsCount || 0}
          icon="alert-circle"
          gradient={Gradients.warning}
        />
        <QuickStatCard
          title="Bekleyen Ödeme"
          value={selectedBuilding?.pendingPaymentsCount || 0}
          icon="cash-multiple"
          gradient={Gradients.danger}
        />
      </View>

      <Animated.FlatList
        ref={flatListRef}
        horizontal
        data={[
          { key: 'apartments', component: <ApartmentsList navigation={navigation} buildingId={selectedBuilding?.id} /> },
          { key: 'tenants', component: <TenantsList navigation={navigation} buildingId={selectedBuilding?.id} /> }
        ]}
        renderItem={({ item }) => (
          <View style={[
            styles.horizontalCardWrapper,
            { marginLeft: item.key === 'apartments' ? 16 : 0 }
          ]}>
            {item.component}
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width - 32}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.horizontalListContainer}
        style={{ transform: [{ translateX: scrollX }] }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  horizontalCardWrapper: {
    width: width - 32,
    marginRight: 16,
  },
  horizontalListContainer: {
    paddingRight: width * 0.15,
  },
  buildingSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buildingCard: {
    width: width * 0.85,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  selectedBuildingCard: {
    transform: [{ scale: 1.02 }],
  },
  buildingCardGradient: {
    padding: 20,
    height: 160,
  },
  buildingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buildingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupancyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buildingCardName: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    marginBottom: 20,
  },
  buildingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  buildingStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buildingStatText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
  },
  buildingOverviewCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  buildingOverviewHeader: {
    padding: 20,
  },
  buildingOverviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  buildingOverviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,

    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  buildingDetails: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.regular,
    color: Colors.text,
    opacity: 0.9,
  },
  occupancyContainer: {
    alignItems: 'flex-end',
  },
  occupancyLabel: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
    opacity: 0.9,
    marginBottom: 4,
  },
  occupancyRate: {
    fontSize: 28,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: 100,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  maintenanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  maintenanceText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dataCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dataCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dataCardTitle: {
    fontFamily: Fonts.urbanist.bold,
    fontSize: 18,
    color: Colors.text,
    marginLeft: 12,
  },
  dataCardContent: {
    padding: 16,
  },
  quickStatCard: {
    width: '48%', // Takes up roughly half the width with margins
    marginHorizontal: '1%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickStatGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  quickStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickStatValue: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  quickStatTitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
    opacity: 0.9,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    fontFamily: Fonts.urbanist.medium,
  },
  sectionCardNew: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitleNew: {
    fontFamily: Fonts.urbanist.bold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  sectionSubtitleNew: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionIconContainerNew: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterScrollView: {
    marginBottom: 16,
  },
  filterGroupNew: {
    marginRight: 8,
    marginBottom: 6,
    
  },
  filterGroupLabelNew: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
    marginBottom: 8,
    
  },
  filterButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFiltersContainer: {
    marginBottom: 16,
    
  },
  activeFiltersLabel: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
    marginBottom: 8,
  },
  activeFilterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  emptyListContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyListText: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  filterButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  filterTextNew: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: '#64748B',
  },
  searchBarContainerNew: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIconNew: {
    marginRight: 8,
  },
  searchInputNew: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
  },
  clearSearchNew: {
    padding: 8,
  },
  apartmentItemNew: {
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginHorizontal: 2,
    marginVertical: 4,
    overflow: 'hidden',
    height: 170,
  },
  apartmentItemContentNew: {
    padding: 12,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  apartmentHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
   
  },
  apartmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  apartmentNumberNew: {
    fontSize: 15,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
  },
  statusBadgeNew: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  apartmentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  infoItem: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
  },
  infoItemDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.surfaceVariant,
  
  },
  infoText: {
    fontSize: 13,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
    marginLeft: 4,
  },
  apartmentActionButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
 
  },
  apartmentActionTextNew: {
    fontSize: 13,
    fontFamily: Fonts.urbanist.semiBold,
    color: Colors.primary,
    textAlign: 'center',
  },
  customBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  customBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.semiBold,
    textAlign: 'center',
  },
  floorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: 12,
    height: 40,
  },
  floorInput: {
    flex: 1,
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.text,
    padding: 0,
  },
  clearFloorInput: {
    padding: 4,
  },
  typeDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  typeDropdownButtonText: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.text,
  },
  typeDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginTop: 4,
    zIndex: 1000,
    elevation: 3,
    maxHeight: 200,
  },
  typeDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  typeDropdownItemText: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  typeDropdownItemTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.urbanist.bold,
  },
  headerFiltersContainer: {
    marginRight: 16,
    position: 'relative',
  },
  filterInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floorFilterInput: {
    width: 80,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    backgroundColor: Colors.surface,
    textAlign: 'center',
  },
  typeDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.surface,
    minWidth: 120,
    maxWidth: 150,
    justifyContent: 'space-between',
  },
  typeDropdownTriggerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  typeDropdownContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    width: 160,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 3,
  },
  typeDropdownItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  typeDropdownItemText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  typeDropdownItemTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.urbanist.bold,
  },
  paginationContainerNew: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageButtonNew: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageButtonDisabledNew: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  pageButtonActiveNew: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pageTextNew: {
    fontFamily: Fonts.urbanist.semiBold,
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 8,
  },
  pageTextActiveNew: {
    color: '#FFFFFF',
  },
  paginationInfoText: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: '#64748B',
    marginHorizontal: 12,
  },
  paginationSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  tenantItemNew: {
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginHorizontal: 2,
    marginVertical: 4,
    overflow: 'hidden',
    height: 170,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tenantItemContentNew: {
    padding: 12,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tenantHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantAvatarContainerNew: {
    position: 'relative',
    marginRight: 12,
  },
  tenantAvatarNew: {
    backgroundColor: Colors.primaryLight,
  },
  tenantAvatarLabelNew: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.primary,
  },
  tenantMainInfoNew: {
    flex: 1,
  },
  tenantNameNew: {
    fontSize: 15,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  tenantBadgeContainerNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tenantBadgeNew: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tenantBadgeTextNew: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.semiBold,
    color: Colors.primary,
  },
  tenantDateNew: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  tenantActionsNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tenantActionButtonNew: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  tenantContactNew: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.urbanist.bold,
    color: '#334155',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  contractContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  contractText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
    color: '#475569',
    textAlign: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ManagementScreen;
