import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const CreateMeetingScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [buildingId, setBuildingId] = useState('1'); // Varsayılan bina ID'si
  const [loading, setLoading] = useState(false);

  const handleCreateMeeting = async () => {
    if (!title || !description || !location) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('api/Admin/meetings', {
        buildingId: parseInt(buildingId),
        title,
        description,
        meetingDate: meetingDate.toISOString(),
        location
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Toplantı başarıyla oluşturuldu.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Hata', 'Toplantı oluşturulurken bir hata oluştu.');
      console.error('Toplantı oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setMeetingDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Toplantı Oluştur</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Toplantı Başlığı</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Toplantı başlığını girin"
        />

        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Toplantı açıklamasını girin"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Konum</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Toplantı konumunu girin"
        />

        <Text style={styles.label}>Tarih ve Saat</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{meetingDate.toLocaleString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={meetingDate}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity 
          style={[
            styles.button,
            loading && styles.disabledButton
          ]}
          onPress={handleCreateMeeting}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Oluşturuluyor...' : 'Toplantı Oluştur'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateMeetingScreen;
