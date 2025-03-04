import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Button from '../../../components/ui/Button';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfileData = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.DETAIL(adminId));
      
      if (response.data.success) {
        setProfileData(response.data.data);
        setEmail(response.data.data.email);
        setPhoneNumber(response.data.data.phoneNumber);
        setDescription(response.data.data.description || '');
      }
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.put(
        API_ENDPOINTS.ADMIN.PROFILE.UPDATE(adminId),
        {
          description,
          profileImageUrl: profileData.profileImageUrl
        }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'Profil bilgileri güncellendi');
        setIsEditingDescription(false);
        fetchProfileData();
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
    }
  };

  const handleUpdateContact = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.put(
        API_ENDPOINTS.ADMIN.PROFILE.UPDATE_CONTACT(adminId),
        { email, phoneNumber }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'İletişim bilgileri güncellendi');
        setIsEditingContact(false);
        fetchProfileData();
      }
    } catch (error) {
      Alert.alert('Hata', 'İletişim bilgileri güncellenirken bir hata oluştu');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      const adminId = getCurrentAdminId();
      const response = await axios.put(
        API_ENDPOINTS.ADMIN.PROFILE.UPDATE_PASSWORD(adminId),
        {
          currentPassword,
          newPassword
        }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'Şifreniz güncellendi');
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      Alert.alert('Hata', 'Şifre güncellenirken bir hata oluştu');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const adminId = getCurrentAdminId();
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile-image.jpg',
        });

        const response = await axios.put(
          API_ENDPOINTS.ADMIN.PROFILE.UPDATE(adminId),
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          setProfileData({ ...profileData, profileImageUrl: response.data.data.profileImageUrl });
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profil Başlığı */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickImage}>
            {profileData?.profileImageUrl ? (
              <Image
                source={{ uri: profileData.profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.noImage]}>
                <Text style={styles.initials}>
                  {profileData?.fullName?.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            )}
            <View style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profileData?.fullName}</Text>
        <Text style={styles.email}>{profileData?.email}</Text>
      </View>

      {/* Yönetim Bilgileri */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileData?.managedBuildingsCount}</Text>
          <Text style={styles.statLabel}>Yönetilen Bina</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Date(profileData?.lastLoginDate).toLocaleDateString()}
          </Text>
          <Text style={styles.statLabel}>Son Giriş</Text>
        </View>
      </View>

      {/* Profil Bilgileri */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          <TouchableOpacity onPress={() => setIsEditingDescription(!isEditingDescription)}>
            <Ionicons name={isEditingDescription ? "close" : "create-outline"} size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {isEditingDescription ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Profil açıklaması"
              multiline
            />
            <Button
              title="Kaydet"
              onPress={handleUpdateProfile}
              variant="primary"
            />
          </View>
        ) : (
          <Text style={styles.descriptionText}>
            {profileData?.description || 'Henüz bir açıklama eklenmemiş.'}
          </Text>
        )}
      </View>

      {/* İletişim Bilgileri */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
          <TouchableOpacity onPress={() => setIsEditingContact(!isEditingContact)}>
            <Ionicons name={isEditingContact ? "close" : "create-outline"} size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {isEditingContact ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Telefon"
              keyboardType="phone-pad"
            />
            <Button
              title="Kaydet"
              onPress={handleUpdateContact}
              variant="primary"
            />
          </View>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{profileData?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{profileData?.phoneNumber}</Text>
            </View>
          </>
        )}
      </View>

      {/* Şifre Değiştirme */}
      <View style={styles.section}>
        <Button
          title="Şifre Değiştir"
          onPress={() => setIsChangingPassword(true)}
          variant="outline"
          icon={<Ionicons name="lock-closed-outline" size={20} color="#007AFF" />}
        />
      </View>

      {/* Şifre Değiştirme Modal */}
      <Modal
        visible={isChangingPassword}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şifre Değiştir</Text>
              <TouchableOpacity onPress={() => setIsChangingPassword(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mevcut Şifre"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni Şifre"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Yeni Şifre (Tekrar)"
              secureTextEntry
            />
            <Button
              title="Şifreyi Güncelle"
              onPress={handleChangePassword}
              variant="primary"
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  noImage: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editContainer: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
