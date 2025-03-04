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
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Ionicons from '@expo/vector-icons/Ionicons';

const SurveysScreen = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 hafta sonrası
    questions: [{ text: '', options: ['', ''] }],
    buildingId: '',
    type: 'Regular'
  });
  const [selectedBuildingId, setSelectedBuildingId] = useState(1);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SURVEY.BY_BUILDING(selectedBuildingId));
      console.log('Surveys data:', response.data);
      setSurveys(response.data.data || []);
    } catch (error) {
      console.error('Anketler yüklenirken hata:', error);
      Alert.alert('Hata', 'Anketler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [selectedBuildingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSurveys();
  };

  const handleAddSurvey = async () => {
    if (!newSurvey.title || !newSurvey.description || !newSurvey.buildingId || newSurvey.questions.some(q => !q.text || q.options.some(opt => !opt))) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun ve en az bir soru ekleyin.');
      return;
    }

    try {
      const adminId = getCurrentAdminId();
      const response = await axios.post(API_ENDPOINTS.ADMIN.SURVEYS.CREATE, {
        ...newSurvey,
        adminId: adminId,
        buildingId: parseInt(newSurvey.buildingId)
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Anket başarıyla oluşturuldu.');
        setModalVisible(false);
        setNewSurvey({
          title: '',
          description: '',
          endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
          questions: [{ text: '', options: ['', ''] }],
          buildingId: '',
          type: 'Regular'
        });
        fetchSurveys();
      }
    } catch (error) {
      console.error('Anket oluşturma hatası:', error);
      Alert.alert('Hata', 'Anket oluşturulurken bir hata oluştu.');
    }
  };

  const handleCloseSurvey = async (surveyId) => {
    try {
      const adminId = getCurrentAdminId();
      await axios.put(API_ENDPOINTS.ADMIN.SURVEYS.CLOSE(surveyId), {
        adminId: adminId
      });

      Alert.alert('Başarılı', 'Anket kapatıldı.');
      fetchSurveys();
    } catch (error) {
      console.error('Anket kapatma hatası:', error);
      Alert.alert('Hata', 'Anket kapatılırken bir hata oluştu.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewSurvey({ ...newSurvey, endDate: selectedDate });
    }
  };

  const addQuestion = () => {
    setNewSurvey({
      ...newSurvey,
      questions: [...newSurvey.questions, { text: '', options: ['', ''] }]
    });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[questionIndex].options.push('');
    setNewSurvey({ ...newSurvey, questions: updatedQuestions });
  };

  const updateQuestion = (index, text) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[index].text = text;
    setNewSurvey({ ...newSurvey, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, text) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[questionIndex].options[optionIndex] = text;
    setNewSurvey({ ...newSurvey, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    if (newSurvey.questions.length > 1) {
      const updatedQuestions = newSurvey.questions.filter((_, i) => i !== index);
      setNewSurvey({ ...newSurvey, questions: updatedQuestions });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateParticipationRate = (totalResponses) => {
    // Assuming each survey has a target of 100 responses
    const rate = Math.min(100, Math.round((totalResponses / 100) * 100));
    return rate;
  };

  const getStatusColor = (isActive, endDate) => {
    if (!isActive) return '#8E8E93'; // Gri - Sona ermiş
    const now = new Date();
    const end = new Date(endDate);
    return now <= end ? '#34C759' : '#FF3B30'; // Yeşil - Aktif, Kırmızı - Süresi dolmuş
  };

  const getStatusText = (isActive, endDate) => {
    if (!isActive) return 'Sona Erdi';
    const now = new Date();
    const end = new Date(endDate);
    return now <= end ? 'Aktif' : 'Süresi Doldu';
  };

  const renderSurveyItem = ({ item }) => (
    <View style={styles.surveyCard}>
      <View style={styles.surveyHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.surveyTitle}>{item.title}</Text>
          <Text style={[
            styles.status,
            { color: getStatusColor(item.isActive, item.endDate) }
          ]}>
            {getStatusText(item.isActive, item.endDate)}
          </Text>
        </View>
        <Text style={styles.buildingName}>{item.buildingName}</Text>
        <Text style={styles.createdBy}>Oluşturan: {item.createdByAdminName}</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          {' '}Başlangıç: {formatDate(item.startDate)}
        </Text>
        <Text style={styles.dateText}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          {' '}Bitiş: {formatDate(item.endDate)}
        </Text>
      </View>

      <View style={styles.participationContainer}>
        <Text style={styles.participationText}>
          Katılım Oranı: %{calculateParticipationRate(item.totalResponses)}
        </Text>
        <Text style={styles.responsesText}>
          Toplam Yanıt: {item.totalResponses}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
          onPress={() => Alert.alert('Bilgi', 'Anket sonuçları görüntülenecek')}
        >
          <Text style={styles.actionButtonText}>Sonuçları Gör</Text>
        </TouchableOpacity>

        {item.isActive && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
            onPress={() => Alert.alert('Bilgi', 'Anket sonlandırılacak')}
          >
            <Text style={styles.actionButtonText}>Anketi Sonlandır</Text>
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
        <Text style={styles.headerText}>Anketler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Bilgi', 'Yeni anket oluşturma ekranı açılacak')}
        >
          <Text style={styles.addButtonText}>+ Anket Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={surveys}
        renderItem={renderSurveyItem}
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
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Anket Ekle</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Anket Başlığı"
              value={newSurvey.title}
              onChangeText={(text) => setNewSurvey({...newSurvey, title: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Anket Açıklaması"
              value={newSurvey.description}
              onChangeText={(text) => setNewSurvey({...newSurvey, description: text})}
              multiline
              numberOfLines={4}
            />

            <TextInput
              style={styles.input}
              placeholder="Bina ID"
              value={newSurvey.buildingId}
              onChangeText={(text) => setNewSurvey({...newSurvey, buildingId: text})}
              keyboardType="numeric"
            />

            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                Bitiş Tarihi: {newSurvey.endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newSurvey.endDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.sectionTitle}>Sorular</Text>
            {newSurvey.questions.map((question, questionIndex) => (
              <View key={questionIndex} style={styles.questionContainer}>
                <TextInput
                  style={[styles.input, styles.questionInput]}
                  placeholder={`${questionIndex + 1}. Soruyu girin`}
                  value={question.text}
                  onChangeText={(text) => updateQuestion(questionIndex, text)}
                />
                {newSurvey.questions.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeQuestion(questionIndex)}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity 
              style={styles.addQuestionButton}
              onPress={addQuestion}
            >
              <Text style={styles.addQuestionButtonText}>+ Soru Ekle</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewSurvey({
                    title: '',
                    description: '',
                    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                    questions: [{ text: '', options: ['', ''] }],
                    buildingId: '',
                    type: 'Regular'
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddSurvey}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
  },
  surveyCard: {
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
  surveyHeader: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  buildingName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  createdBy: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    lineHeight: 22,
  },
  dateContainer: {
    marginVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  participationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  participationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  responsesText: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  dateButtonText: {
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addQuestionButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addQuestionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SurveysScreen;
