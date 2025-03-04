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
import axios from 'axios';

const CreateNotificationScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateNotification = async () => {
    if (!title || !message || !userId) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('api/Admin/notifications', {
        userId: parseInt(userId),
        title,
        message,
        isRead: false
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Bildirim başarıyla oluşturuldu.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Hata', 'Bildirim oluşturulurken bir hata oluştu.');
      console.error('Bildirim oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Bildirim Oluştur</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Kullanıcı ID</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="Kullanıcı ID'sini girin"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Bildirim Başlığı</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Bildirim başlığını girin"
        />

        <Text style={styles.label}>Mesaj</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Bildirim mesajını girin"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={[
            styles.button,
            loading && styles.disabledButton
          ]}
          onPress={handleCreateNotification}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Oluşturuluyor...' : 'Bildirim Gönder'}
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

export default CreateNotificationScreen;
