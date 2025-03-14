import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, FlatList, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { 
  Card, 
  Text, 
  Avatar, 
  ProgressBar, 
  Surface, 
  ActivityIndicator, 
  useTheme, 
  Chip, 
  Divider,
  Searchbar,
  List,
  Button,
  IconButton
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
    const gradientColors = isSelected ? ['#EA90E2', '#357ABD'] : ['#A5A5F5', '#C0E0E0'];
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
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buildingCardGradient}
        >
          <Icon 
            name="office-building" 
            size={32} 
            color={iconColor}
          />
          <Text style={[
            styles.buildingCardName,
            { color: textColor }
          ]}>
            {item?.name || 'Bina'}
          </Text>
          <View style={styles.buildingCardStats}>
            <Text style={[
              styles.buildingCardStatsText,
              { color: textColor }
            ]}>
              {item?.totalApartments || 0} Daire • {item?.occupancyRate || 0}% Dolu
            </Text>
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
        !safeBuildings.length && styles.emptyBuildingSelectorContainer
      ]}
      snapToInterval={width * 0.95 + 16}
      decelerationRate="fast"
      snapToAlignment="center"
      ListEmptyComponent={renderEmptyComponent}
    />
  );
};

// BuildingOverviewCard Component (Updated)
const BuildingOverviewCard = ({ building }) => {
  const theme = useTheme();
  
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const getOccupancyRate = () => {
    const rate = building?.occupancyRate || 0;
    return Math.min(Math.max(0, rate), 100) / 100;
  };

  return (
    <Card style={styles.buildingOverviewCard}>
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buildingOverviewHeader}
      >
        <View style={styles.buildingOverviewContent}>
          <View style={styles.buildingOverviewLeft}>
            <View style={styles.iconContainer}>
              <Icon name="office-building" size={40} color={Colors.warning} />
            </View>
            <View style={styles.buildingInfo}>
              <Text style={styles.buildingName}>{building?.name || 'Bina'}</Text>
              <Text style={styles.buildingDetails}>
                {building?.floorCount || 0} Kat • {building?.totalApartments || 0} Daire
              </Text>
            </View>
          </View>
          
          <View style={styles.occupancyContainer}>
            <Text style={styles.occupancyLabel}>Doluluk Oranı</Text>
            <Text style={styles.occupancyRate}>{building?.occupancyRate || 0}%</Text>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={getOccupancyRate()}
                color={Colors.surface}
                style={styles.progressBar}
              />
            </View>
          </View>
        </View>

        <View style={styles.maintenanceContainer}>
          <Icon name="wrench" size={20} color={Colors.surface} />
          <Text style={styles.maintenanceText}>
            Son Bakım: {building?.lastMaintenanceDate ? formatDate(building.lastMaintenanceDate) : 'Belirtilmemiş'}
          </Text>
        </View>
      </LinearGradient>
    </Card>
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
const ApartmentsList = ({ apartments, navigation }) => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const filteredApartments = apartments?.filter(apt => {
    if (filter === 'empty') return apt.status === 'Boş';
    if (filter === 'occupied') return apt.status === 'Dolu';
    return true;
  });

  const paginatedApartments = filteredApartments?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil((filteredApartments?.length || 0) / itemsPerPage);

  const handleViewDetails = (apartmentId) => {
    navigation.navigate('ApartmentDetails', { apartmentId });
  };

  const renderApartmentItem = ({ item }) => {
    const isOccupied = item.status === 'Dolu';
    return (
      <Surface style={styles.apartmentItemNew} >
        <View style={styles.apartmentItemContentNew}>
          <View style={styles.apartmentHeaderNew}>
            <View style={[styles.apartmentStatusIndicator, { backgroundColor: isOccupied ? Colors.success : Colors.warning }]} />
            <Text style={styles.apartmentNumberNew}>Daire {item.unitNumber}</Text>
            <CustomBadge
              style={{ backgroundColor: isOccupied ? Colors.successLight : Colors.warningLight }}
              textStyle={{ color: isOccupied ? Colors.success : Colors.warning }}
            >
              {item.status}
            </CustomBadge>
          </View>
          <View style={styles.apartmentDetailsNew}>
            <View style={styles.apartmentDetailItemNew}>
              <Icon name="floor-plan" size={18} color={Colors.success} />
              <Text style={styles.apartmentDetailTextNew}>{item.floor}. Kat</Text>
            </View>
            <View style={styles.apartmentDetailItemNew}>
              <Icon name="home-variant" size={18} color={Colors.primary} />
              <Text style={styles.apartmentDetailTextNew}>{item.apartmentType || '1+1'}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.apartmentActionButtonNew}
            onPress={() => handleViewDetails(item.id)}
          >
            <Text style={styles.apartmentActionTextNew}>Detayları Görüntüle</Text>
            <Icon name="chevron-right" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </Surface>
    );
  };

  return (
    <Card style={styles.sectionCardNew} >
      <Card.Title 
        title="Daireler" 
        titleStyle={styles.sectionTitleNew}
        subtitle={`Toplam: ${filteredApartments?.length || 0}`}
        subtitleStyle={styles.sectionSubtitleNew}
        left={(props) => (
          <View style={styles.sectionIconContainerNew}>
            <Icon {...props} name="door" size={24} color={Colors.primary} />
          </View>
        )}
      />
      <Card.Content>
        <View style={styles.filterContainerNew}>
          <TouchableOpacity
            style={[styles.filterButtonNew, filter === 'all' && styles.filterButtonSelectedNew]}
            onPress={() => setFilter('all')}
          >
            <Icon name="view-grid" size={20} color={filter === 'all' ? Colors.success : Colors.textSecondary} />
            <Text style={[styles.filterTextNew, filter === 'all' && styles.filterTextSelectedNew]}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButtonNew, filter === 'empty' && styles.filterButtonSelectedNew]}
            onPress={() => setFilter('empty')}
          >
            <Icon name="home-outline" size={20} color={filter === 'empty' ? Colors.success : Colors.textSecondary} />
            <Text style={[styles.filterTextNew, filter === 'empty' && styles.filterTextSelectedNew]}>Boş</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButtonNew, filter === 'occupied' && styles.filterButtonSelectedNew]}
            onPress={() => setFilter('occupied')}
          >
            <Icon name="home" size={20} color={filter === 'occupied' ? Colors.success : Colors.textSecondary} />
            <Text style={[styles.filterTextNew, filter === 'occupied' && styles.filterTextSelectedNew]}>Dolu</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={paginatedApartments}
          renderItem={renderApartmentItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separatorNew} />}
          contentContainerStyle={styles.listContainerNew}
        />
        {totalPages > 1 && (
          <View style={styles.paginationContainerNew}>
            <TouchableOpacity 
              onPress={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={[styles.pageButtonNew, page === 1 && styles.pageButtonDisabledNew]}
            >
              <Icon name="chevron-left" size={20} color={page === 1 ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.pageTextNew}>{page} / {totalPages}</Text>
            <TouchableOpacity 
              onPress={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={[styles.pageButtonNew, page === totalPages && styles.pageButtonDisabledNew]}
            >
              <Icon name="chevron-right" size={20} color={page === totalPages ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

// TenantsList Component
const TenantsList = ({ tenants }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

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
    <Surface style={styles.tenantItemNew} elevation={2}>
      <View style={styles.tenantItemContentNew}>
        <View style={styles.tenantHeaderNew}>
          <View style={styles.tenantAvatarContainerNew}>
            <Avatar.Text 
              size={50} 
              label={item.fullName.split(' ').map(n => n[0]).join('')}
              style={styles.tenantAvatarNew}
              labelStyle={styles.tenantAvatarLabelNew}
            />
            <View style={styles.tenantStatusIndicatorNew} />
          </View>
          <View style={styles.tenantMainInfoNew}>
            <Text style={styles.tenantNameNew}>{item.fullName}</Text>
            <View style={styles.tenantBadgeContainerNew}>
              <CustomBadge style={styles.tenantBadgeNew}>
                <Text style={styles.tenantBadgeTextNew}>Kiracı</Text>
              </CustomBadge>
              <Text style={styles.tenantDateNew}>Giriş: {item.moveInDate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.tenantDetailsGridNew}>
          <View style={styles.tenantDetailItemNew}>
            <Icon name="home" size={20} color={Colors.primary} />
            <Text style={styles.tenantDetailTextNew}>{item.apartmentNumber}</Text>
          </View>
          <View style={styles.tenantDetailItemNew}>
            <Icon name="phone" size={20} color={Colors.primary} />
            <Text style={styles.tenantDetailTextNew}>{item.phoneNumber}</Text>
          </View>
          <View style={styles.tenantDetailItemNew}>
            <Icon name="email" size={20} color={Colors.primary} />
            <Text style={styles.tenantDetailTextNew}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.tenantActionsNew}>
          <TouchableOpacity style={styles.tenantActionButtonNew}>
            <Icon name="message" size={20} color={Colors.primary} />
            <Text style={styles.tenantActionTextNew}>Mesaj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tenantActionButtonNew}>
            <Icon name="file-document" size={20} color={Colors.primary} />
            <Text style={styles.tenantActionTextNew}>Sözleşme</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tenantActionButtonNew}>
            <Icon name="information" size={20} color={Colors.primary} />
            <Text style={styles.tenantActionTextNew}>Detaylar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  );

  return (
    <Card style={styles.sectionCardNew} elevation={2}>
      <Card.Title 
        title="Kiracılar" 
        titleStyle={styles.sectionTitleNew}
        subtitle={`Toplam: ${filteredTenants?.length || 0}`}
        subtitleStyle={styles.sectionSubtitleNew}
        left={(props) => (
          <View style={styles.sectionIconContainerNew}>
            <Icon {...props} name="account-group" size={24} color={Colors.primary} />
          </View>
        )}
      />
      <Card.Content>
        <View style={styles.searchBarContainerNew}>
          <Icon name="magnify" size={20} color={Colors.primary} style={styles.searchIconNew} />
          <TextInput
            placeholder="Kiracı veya daire ara..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchInputNew}
            placeholderTextColor={Colors.textSecondary}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchNew}>
              <Icon name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <FlatList
          data={paginatedTenants}
          renderItem={renderTenantItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separatorNew} />}
          contentContainerStyle={styles.listContainerNew}
        />
        
        {totalPages > 1 && (
          <View style={styles.paginationContainerNew}>
            <TouchableOpacity 
              onPress={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={[styles.pageButtonNew, page === 1 && styles.pageButtonDisabledNew]}
            >
              <Icon name="chevron-left" size={20} color={page === 1 ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.pageTextNew}>{page} / {totalPages}</Text>
            <TouchableOpacity 
              onPress={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={[styles.pageButtonNew, page === totalPages && styles.pageButtonDisabledNew]}
            >
              <Icon name="chevron-right" size={20} color={page === totalPages ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

// Main ManagementScreen Component
const ManagementScreen = ({ navigation }) => {
  const [buildingData, setBuildingData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBuildingData = async (buildingId) => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(
        API_ENDPOINTS.ADMIN.MANAGEMENT.BY_BUILDING(adminId, buildingId)
      );
      setBuildingData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching building data:', err);
      setError('Bina verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (buildingData?.buildings && !selectedBuilding) {
      setSelectedBuilding(buildingData.buildings[0]);
    }
  }, [buildingData]);

  useEffect(() => {
    fetchBuildingData(2); // Default building ID
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
    <ScrollView style={styles.container}>
      <BuildingSelector
        buildings={buildingData.buildings}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(building) => {
          setSelectedBuilding(building);
          fetchBuildingData(building.id);
        }}
      />
      
      <BuildingOverviewCard building={selectedBuilding} />
      
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

      <ApartmentsList apartments={buildingData.apartments} navigation={navigation} />
      <TenantsList tenants={buildingData.tenants} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  buildingSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buildingCard: {
    width: width * 0.85,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  buildingCardGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  selectedBuildingCard: {
    transform: [{ scale: 1.02 }],
  },
  buildingCardName: {
    fontSize: 20,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginTop: 8,
  },
  buildingCardStats: {
    marginTop: 4,
  },
  buildingCardStatsText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  selectedBuildingCardText: {
    color: Colors.surface,
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
  sectionCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionCardGradient: {
    borderRadius: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.urbanist.bold,
    fontSize: 20,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: Colors.textVariant,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.urbanist.medium,
  },
  filterChipTextSelected: {
    color: Colors.primary,
  },
  apartmentItem: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  apartmentItemGradient: {
    borderRadius: 12,
  },
  apartmentItemContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apartmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  apartmentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  apartmentInfo: {
    flex: 1,
  },
  apartmentNumber: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
  },
  apartmentFloor: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: Fonts.urbanist.semiBold,
    fontSize: 12,
  },
  tenantItem: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  tenantItemGradient: {
    borderRadius: 12,
  },
  tenantItemContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantAvatar: {
    backgroundColor: Colors.primaryLight,
  },
  tenantAvatarLabel: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.primary,
  },
  tenantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  tenantDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  tenantDetails: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenantContact: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: Colors.textVariant,
    elevation: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  searchInput: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
  },
  listContainer: {
    paddingTop: 8,
  },
  separator: {
    height: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.textVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 16,
    color: Colors.text,
  },
  // New Apartment List Styles
  sectionCardNew: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  sectionTitleNew: {
    fontFamily: Fonts.urbanist.bold,
    fontSize: 22,
    color: Colors.text,
  },
  sectionSubtitleNew: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionIconContainerNew: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainerNew: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  filterButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    gap: 8,
  },
  filterButtonSelectedNew: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  filterTextNew: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterTextSelectedNew: {
    color: Colors.text,
    fontFamily: Fonts.urbanist.bold,
    fontSize: 16,
    
  },
  apartmentItemNew: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  apartmentItemContentNew: {
    padding: 16,
  },
  apartmentHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  apartmentStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  apartmentNumberNew: {
    flex: 1,
    fontSize: 18,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
  },
  statusBadgeNew: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusTextNew: {
    fontFamily: Fonts.urbanist.semiBold,
    fontSize: 12,
  },
  apartmentDetailsNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceVariant,
  },
  apartmentDetailItemNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apartmentDetailTextNew: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
  },
  apartmentActionButtonNew: {
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  apartmentActionTextNew: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },

  // New Tenant List Styles
  tenantItemNew: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  tenantItemContentNew: {
    padding: 16,
  },
  tenantHeaderNew: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tenantAvatarContainerNew: {
    position: 'relative',
    marginRight: 16,
  },
  tenantAvatarNew: {
    backgroundColor: Colors.primaryLight,
  },
  tenantAvatarLabelNew: {
    fontSize: 18,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.primary,
  },
  tenantStatusIndicatorNew: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  tenantMainInfoNew: {
    flex: 1,
    justifyContent: 'center',
  },
  tenantNameNew: {
    fontSize: 18,
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
    paddingVertical: 4,
  },
  tenantBadgeTextNew: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.primary,
  },
  tenantDateNew: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  tenantDetailsGridNew: {
    flexDirection: 'column',
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceVariant,
    marginBottom: 16,
  },
  tenantDetailItemNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tenantDetailTextNew: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
  },
  tenantActionsNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tenantActionButtonNew: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  tenantActionTextNew: {
    fontSize: 13,
    fontFamily: Fonts.urbanist.semiBold,
    color: Colors.primary,
  },
  searchBarContainerNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  searchIconNew: {
    marginRight: 12,
  },
  searchInputNew: {
    flex: 1,
    height: 48,
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.text,
  },
  clearSearchNew: {
    padding: 4,
  },
  separatorNew: {
    height: 12,
  },
  listContainerNew: {
    paddingTop: 4,
  },
  paginationContainerNew: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  pageButtonNew: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButtonDisabledNew: {
    backgroundColor: Colors.surfaceVariant,
  },
  pageTextNew: {
    fontFamily: Fonts.urbanist.semiBold,
    fontSize: 14,
    color: Colors.text,
  },
  customBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  customBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.semiBold,
    textAlign: 'center',
  },
});

export default ManagementScreen;
