import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.DETAIL(adminId));
      const profileData = response.data.data;
      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error('Profil bilgileri çekilemedi:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!editedProfile.fullName || !editedProfile.email) {
      Alert.alert('Hata', 'Ad Soyad ve E-posta alanları zorunludur.');
      return;
    }

    try {
      const adminId = getCurrentAdminId();
      const response = await axios.put(API_ENDPOINTS.ADMIN.UPDATE_PROFILE(adminId), editedProfile);
      if (response.data.success) {
        Alert.alert('Başarılı', 'Profil başarıyla güncellendi.');
        setProfile(editedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    }
  };

  const handleChangePassword = async () => {
    Alert.alert(
      'Şifre Değiştir',
      'Şifrenizi değiştirmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değiştir',
          onPress: () => {
            // Şifre değiştirme modalı veya sayfası açılabilir
            Alert.alert('Bilgi', 'Şifre değiştirme özelliği eklenecek');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text>Profil bilgileri bulunamadı.</Text>
      </View>
    );
  }

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profil</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          {profile.profileImage ? (
            <Image
              source={{ uri: profile.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>
                {getInitials(profile.fullName)}
              </Text>
            </View>
          )}
        </View>

        {!isEditing ? (
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Ad Soyad</Text>
            <Text style={styles.value}>{profile.fullName || 'Belirtilmemiş'}</Text>

            <Text style={styles.label}>E-posta</Text>
            <Text style={styles.value}>{profile.email || 'Belirtilmemiş'}</Text>

            <Text style={styles.label}>Telefon</Text>
            <Text style={styles.value}>{profile.phoneNumber || 'Belirtilmemiş'}</Text>

            <Text style={styles.label}>Açıklama</Text>
            <Text style={styles.value}>{profile.description || 'Belirtilmemiş'}</Text>

            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Profili Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.passwordButton}
              onPress={() => Alert.alert(
                'Şifre Değiştir',
                'Şifre değiştirme özelliği yakında eklenecektir.'
              )}
            >
              <Text style={styles.passwordButtonText}>Şifre Değiştir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editContainer}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={editedProfile?.fullName || ''}
              onChangeText={(text) => setEditedProfile({...editedProfile, fullName: text})}
              placeholder="Ad Soyad"
            />

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={editedProfile?.email || ''}
              onChangeText={(text) => setEditedProfile({...editedProfile, email: text})}
              placeholder="E-posta"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={editedProfile?.phoneNumber || ''}
              onChangeText={(text) => setEditedProfile({...editedProfile, phoneNumber: text})}
              placeholder="Telefon"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedProfile?.description || ''}
              onChangeText={(text) => setEditedProfile({...editedProfile, description: text})}
              placeholder="Açıklama"
              multiline
              numberOfLines={4}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setEditedProfile(profile);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
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
  profileContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  initialsContainer: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  initialsText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  passwordButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  passwordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  editContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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

export default ProfileScreen;
