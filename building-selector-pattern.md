# Bina Seçimi ve Veri Yönetimi Yapısı

## 1. State Yönetimi

```javascript
const [selectedBuilding, setSelectedBuilding] = useState(null);
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
```

- `selectedBuilding`: Seçili binanın ID'sini tutar
- `data`: API'den gelen tüm verileri tutar
- `loading`: Veri yükleme durumunu kontrol eder

## 2. Bina Seçici Komponenti

```javascript
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
      <View style={styles.buildingsHeader}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Binalar</Text>
        {selectedBuilding && (
          <TouchableOpacity 
            onPress={() => {
              setSelectedBuilding(null);
              fetchFinanceData();
            }}
            style={styles.clearFilterButton}
          >
            <MaterialCommunityIcons name="close" size={16} color={Colors.text} />
            <Text style={styles.clearFilterText}>Tümü</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={buildingFinances}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedBuilding(item.buildingId);
              fetchFinanceData(item.buildingId);
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
                <Text style={styles.buildingCardTitle}>{item.buildingName}</Text>
                <View style={styles.buildingCardStats}>
                  <Text style={styles.buildingCardAmount}>
                    {item.monthlyCollectedAmount.toLocaleString('tr-TR')}₺
                  </Text>
                  <Badge style={styles.buildingCardBadge}>
                    {`${item.collectionRate}%`}
                  </Badge>
                </View>
                <Text style={styles.buildingCardSubtitle}>
                  {`${item.paidApartments}/${item.totalApartments} Daire`}
                </Text>
              </LinearGradient>
            </Animatable.View>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </Animatable.View>
  );
};
```

## 3. Veri Fetching Mekanizması

```javascript
const fetchFinanceData = async (buildingId = null) => {
  try {
    setLoading(true);
    let endpoint = `${API_ENDPOINTS.FINANCE.DASHBOARD}`;
    
    // Query parametrelerini oluştur
    const params = new URLSearchParams();
    
    // Bina ID'si varsa ekle
    if (buildingId) {
      params.append('buildingId', buildingId);
    }
    
    // Diğer filtreleri ekle
    if (filters.startDate) {
      params.append('startDate', filters.startDate.toISOString().split('T')[0]);
    }
    // ... diğer filtreler
    
    // Endpoint'i oluştur
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    // API çağrısı yap
    const response = await axios.get(endpoint);
    if (response.data.success) {
      setData(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching finance data:', error);
  } finally {
    setLoading(false);
  }
};
```

## 4. Veri Yenileme Mekanizması

```javascript
useEffect(() => {
  fetchFinanceData(selectedBuilding);
}, [selectedBuilding]);
```

## 5. Alt Komponentlere Veri Aktarımı

```javascript
// Veriyi parçalara ayır
const summary = data?.dashboard?.summary;
const buildingFinances = data?.dashboard?.buildingFinances || [];
const statistics = data?.dashboard?.statistics;
const overduePayments = data?.dashboard?.overduePayments || [];

// Alt komponentlere aktar
return (
  <ScrollView>
    {renderSummaryCard()} // summary verisini kullanır
    {renderStatisticsCards()} // statistics verisini kullanır
    {renderBuildingsList()} // buildingFinances verisini kullanır
    {renderPaymentDistribution()} // statistics.paymentTypeDistribution verisini kullanır
    {renderOverduePayments()} // overduePayments verisini kullanır
  </ScrollView>
);
```

## 6. Önemli Noktalar

1. **Bina Seçimi**:
   - Bina seçildiğinde sadece o binaya ait veriler yüklenir
   - "Tümü" seçeneği ile tüm binaların verileri görüntülenebilir
   - Seçili bina görsel olarak vurgulanır (beyaz border)

2. **Veri Yönetimi**:
   - Merkezi bir state yönetimi (`data` state'i)
   - Alt komponentler kendi ihtiyacı olan veriyi alır
   - Veri yükleme durumu kontrol edilir

3. **UI/UX**:
   - Yatay kaydırılabilir bina listesi
   - Animasyonlar ile smooth geçişler
   - Loading state yönetimi
   - Gradient renkler ile görsel zenginlik

4. **Performans**:
   - FlatList kullanımı ile efektif liste renderlama
   - Gereksiz render'ları önlemek için state yapısı
   - Data null check'leri ile hata önleme

## 7. Kullanım Örneği

Bu pattern'i başka bir ekranda kullanmak için:

1. State'leri oluştur
2. Veri çekme fonksiyonunu adapte et
3. BuildingSelector komponentini implement et
4. Alt komponentlere veri akışını sağla

```javascript
// Yeni ekranda:
const [selectedBuilding, setSelectedBuilding] = useState(null);
const [data, setData] = useState(null);

const fetchData = async (buildingId = null) => {
  // API çağrısı yap
  // Gelen veriyi state'e kaydet
};

useEffect(() => {
  fetchData(selectedBuilding);
}, [selectedBuilding]);

return (
  <>
    <BuildingSelector
      buildings={data?.buildings}
      selectedBuilding={selectedBuilding}
      onSelectBuilding={(id) => {
        setSelectedBuilding(id);
        fetchData(id);
      }}
    />
    {/* Alt komponentler */}
  </>
);
``` 