# ManagementScreen Bina Seçimi İmplementasyonu

## 1. Komponent Yapısı

ManagementScreen'de şu alt komponentler bulunuyor:
- BuildingSelector
- ApartmentsList
- TenantsList
- ComplaintsModal

## 2. State ve Props Yapısı

```javascript
// ManagementScreen ana state'leri
const [selectedBuilding, setSelectedBuilding] = useState(null);
const [buildingData, setBuildingData] = useState(null);
const [loading, setLoading] = useState(true);

// Alt komponentlere prop geçişi
<BuildingSelector
  buildings={buildingData?.buildings}
  selectedBuilding={selectedBuilding}
  onSelectBuilding={handleBuildingSelect}
/>

<ApartmentsList
  apartments={buildingData?.apartments}
  buildingId={selectedBuilding}
  navigation={navigation}
/>

<TenantsList
  tenants={buildingData?.tenants}
  buildingId={selectedBuilding}
  navigation={navigation}
/>
```

## 3. Veri Fetching İşlemleri

```javascript
const fetchBuildingData = async (buildingId = null) => {
  try {
    setLoading(true);
    let endpoint = `${API_ENDPOINTS.MANAGEMENT.DASHBOARD}`;
    
    if (buildingId) {
      endpoint += `?buildingId=${buildingId}`;
    }
    
    const response = await axios.get(endpoint);
    if (response.data.success) {
      setBuildingData(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching building data:', error);
  } finally {
    setLoading(false);
  }
};

// Bina seçimi handler'ı
const handleBuildingSelect = (buildingId) => {
  setSelectedBuilding(buildingId);
  fetchBuildingData(buildingId);
};

// İlk yükleme ve bina değişiminde veri çekme
useEffect(() => {
  fetchBuildingData(selectedBuilding);
}, [selectedBuilding]);
```

## 4. BuildingSelector Komponenti (Güncellenmiş)

```javascript
const BuildingSelector = ({ buildings, selectedBuilding, onSelectBuilding }) => {
  const gradients = [
    Gradients.blueIndigo,
    Gradients.purple,
    Gradients.teal,
    Gradients.indigo,
    Gradients.greenBlue
  ];

  return (
    <Animatable.View animation="fadeInUp" delay={200} style={styles.buildingSelectorContainer}>
      <View style={styles.buildingsHeader}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Binalar</Text>
        {selectedBuilding && (
          <TouchableOpacity 
            onPress={() => {
              onSelectBuilding(null);
              fetchBuildingData();
            }}
            style={styles.clearFilterButton}
          >
            <MaterialCommunityIcons name="close" size={16} color={Colors.text} />
            <Text style={styles.clearFilterText}>Tümü</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={buildings}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              onSelectBuilding(item.buildingId);
              fetchBuildingData(item.buildingId);
            }}
            style={{ marginRight: 12 }}
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
                  selectedBuilding === item.buildingId && { borderWidth: 2, borderColor: '#FFFFFF' }
                ]}
              >
                <Text style={styles.buildingName}>{item.buildingName}</Text>
                <View style={styles.buildingStats}>
                  <Text style={styles.buildingCardAmount}>
                    {item.totalApartments} Daire
                  </Text>
                  <Badge style={[styles.buildingCardBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    {`${item.occupancyRate}%`}
                  </Badge>
                </View>
                <Text style={styles.buildingCardSubtitle}>
                  {`${item.occupiedApartments}/${item.totalApartments} Dolu`}
                </Text>
              </LinearGradient>
            </Animatable.View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </Animatable.View>
  );
};
```

## 5. Güncellenmiş Stiller

```javascript
const styles = StyleSheet.create({
  buildingSelectorContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  buildingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
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
  buildingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  buildingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buildingCardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buildingCardBadge: {
    color: '#FFFFFF',
  },
  buildingCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearFilterText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 4,
  },
});
```

## 6. Önemli Değişiklikler

1. **Bina Kartları**:
   - Tüm bina kartları her zaman görünür kalır
   - Seçili bina beyaz border ile vurgulanır
   - Her kart için fade-in animasyonu eklendi

2. **Veri Yönetimi**:
   - Bina seçildiğinde sadece ilgili veriler güncellenir
   - Diğer binalar ekranda kalır
   - "Tümü" seçeneği ile tüm verilere dönülebilir

3. **UI İyileştirmeleri**:
   - Gradient renkler ile görsel zenginlik
   - Animasyonlar ile smooth geçişler
   - Daha detaylı bina bilgileri (doluluk oranı, daire sayısı)

4. **Performans**:
   - FlatList kullanımı
   - Animatable.View ile optimize edilmiş animasyonlar
   - Gereksiz render'ların önlenmesi

## 7. Alt Komponentlerin Güncellenmesi

### ApartmentsList:
```javascript
const ApartmentsList = ({ apartments, buildingId, navigation }) => {
  const [filteredApartments, setFilteredApartments] = useState([]);
  
  useEffect(() => {
    if (buildingId) {
      setFilteredApartments(apartments?.filter(apt => apt.buildingId === buildingId));
    } else {
      setFilteredApartments(apartments || []);
    }
  }, [apartments, buildingId]);

  return (
    <FlatList
      data={filteredApartments}
      renderItem={renderApartmentItem}
      keyExtractor={item => item.apartmentId.toString()}
    />
  );
};
```

### TenantsList:
```javascript
const TenantsList = ({ tenants, buildingId, navigation }) => {
  const [filteredTenants, setFilteredTenants] = useState([]);
  
  useEffect(() => {
    if (buildingId) {
      setFilteredTenants(tenants?.filter(tenant => tenant.buildingId === buildingId));
    } else {
      setFilteredTenants(tenants || []);
    }
  }, [tenants, buildingId]);

  return (
    <FlatList
      data={filteredTenants}
      renderItem={renderTenantItem}
      keyExtractor={item => item.tenantId.toString()}
    />
  );
};
```

## 8. Kullanım Adımları

1. ManagementScreen'de state'leri tanımla
2. BuildingSelector komponentini oluştur
3. Veri fetching mekanizmasını implement et
4. Alt komponentlere (ApartmentsList, TenantsList) buildingId prop'unu geçir
5. Alt komponentlerde filtreleme mantığını implement et
6. Stil tanımlamalarını yap

## 9. Önemli Noktalar

1. **Veri Yönetimi**:
   - Tüm veriler merkezi buildingData state'inde tutulur
   - Alt komponentler kendi ihtiyaçları olan verileri props olarak alır
   - Filtreleme işlemleri alt komponentlerde yapılır

2. **Performans**:
   - FlatList kullanımı
   - Gereksiz render'ları önlemek için useEffect kullanımı
   - Filtreleme işlemlerinin optimize edilmesi

3. **UI/UX**:
   - Smooth geçişler için animasyonlar
   - Seçili binanın belirgin gösterimi
   - Loading state yönetimi 