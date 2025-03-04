import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Ionicons from '@expo/vector-icons/Ionicons';

// Şikayet durumları için enum
const ComplaintStatus = {
  OPEN: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  CANCELLED: 3
};

const ComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState(1);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COMPLAINT.BY_BUILDING(selectedBuildingId));
      console.log('Complaints data:', response.data);
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Şikayetler yüklenirken hata:', error);
      Alert.alert('Hata', 'Şikayetler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedBuildingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const handleRespond = async () => {
    if (!response.trim()) {
      Alert.alert('Hata', 'Lütfen bir yanıt girin.');
      return;
    }

    try {
      await axios.post(API_ENDPOINTS.COMPLAINT.ADD_COMMENT(selectedComplaint.id), {
        comment: response,
        adminId: getCurrentAdminId()
      });

      // Şikayet durumunu güncelle
      await handleStatusChange(selectedComplaint.id, ComplaintStatus.IN_PROGRESS);
      
      setModalVisible(false);
      setResponse('');
      setSelectedComplaint(null);
      fetchComplaints();
      Alert.alert('Başarılı', 'Yanıtınız kaydedildi.');
    } catch (error) {
      console.error('Yanıt gönderilirken hata:', error);
      Alert.alert('Hata', 'Yanıt gönderilirken bir hata oluştu.');
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      if (newStatus === ComplaintStatus.RESOLVED) {
        await axios.post(API_ENDPOINTS.COMPLAINT.RESOLVE(complaintId));
      } else {
        await axios.put(API_ENDPOINTS.COMPLAINT.UPDATE(complaintId), {
          status: newStatus
        });
      }
      fetchComplaints();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      Alert.alert('Hata', 'Durum güncellenirken bir hata oluştu.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ComplaintStatus.OPEN:
      case null:
        return '#FF3B30'; // Kırmızı
      case ComplaintStatus.IN_PROGRESS:
        return '#FF9500'; // Turuncu
      case ComplaintStatus.RESOLVED:
        return '#34C759'; // Yeşil
      case ComplaintStatus.CANCELLED:
        return '#8E8E93'; // Gri
      default:
        return '#FF3B30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ComplaintStatus.OPEN:
      case null:
        return 'Açık';
      case ComplaintStatus.IN_PROGRESS:
        return 'İşlemde';
      case ComplaintStatus.RESOLVED:
        return 'Çözüldü';
      case ComplaintStatus.CANCELLED:
        return 'İptal Edildi';
      default:
        return 'Açık';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComplaintItem = ({ item }) => (
    <View style={styles.complaintCard}>
      <View style={styles.complaintHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.createdBy}>Oluşturan: {item.createdByName}</Text>
        <Text style={styles.date}>Tarih: {formatDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.actionButtons}>
        {(item.status === ComplaintStatus.OPEN || item.status === null) && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => {
              setSelectedComplaint(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.actionButtonText}>Yanıtla</Text>
          </TouchableOpacity>
        )}

        {item.status === ComplaintStatus.IN_PROGRESS && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#34C759' }]}
            onPress={() => handleStatusChange(item.id, ComplaintStatus.RESOLVED)}
          >
            <Text style={styles.actionButtonText}>Çözüldü Olarak İşaretle</Text>
          </TouchableOpacity>
        )}

        {(item.status === ComplaintStatus.OPEN || item.status === null) && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8E8E93' }]}
            onPress={() => handleStatusChange(item.id, ComplaintStatus.CANCELLED)}
          >
            <Text style={styles.actionButtonText}>İptal Et</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Şikayetler</Text>
      </View>

      <FlatList
        data={complaints}
        renderItem={renderComplaintItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şikayeti Yanıtla</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Yanıtınızı yazın..."
              value={response}
              onChangeText={setResponse}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FF3B30' }]}
                onPress={() => {
                  setModalVisible(false);
                  setResponse('');
                  setSelectedComplaint(null);
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#34C759' }]}
                onPress={handleRespond}
              >
                <Text style={styles.modalButtonText}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  listContainer: {
    padding: 15,
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  complaintHeader: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  createdBy: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ComplaintsScreen;
