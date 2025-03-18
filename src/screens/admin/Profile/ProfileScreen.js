import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { Colors } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '../../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Surface, 
  Text, 
  TextInput, 
  Button, 
  Chip, 
  Avatar, 
  Card, 
  Title, 
  Paragraph,
  IconButton,
  useTheme
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');

  const scrollViewRef = React.useRef(null);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USER_PROFILE.DETAIL(4));
      
      if (response.data.success) {
        const profileData = response.data.data;
        console.log('Profil Verisi:', JSON.stringify(profileData, null, 2));
        
        setProfileData(profileData);
        setEmail(profileData.email || '');
        setPhoneNumber(profileData.phoneNumber || '');
        setDescription(profileData.description || '');
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
      const response = await axios.put(
        API_ENDPOINTS.USER_PROFILE.UPDATE_DESCRIPTION(4),
        { description }
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
      const response = await axios.put(
        API_ENDPOINTS.USER_PROFILE.UPDATE(4),
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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile-image.jpg',
        });

        console.log('Gönderilen Resim:', formData);

        const response = await axios.put(
          API_ENDPOINTS.USER_PROFILE.UPDATE_IMAGE(4),
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          console.log('Resim Yükleme Cevabı:', response.data);
          setProfileData(prevData => ({
            ...prevData,
            imageUrl: response.data.data.imageUrl
          }));
        }
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu');
    }
  };

  const handleDescriptionEdit = () => {
    setIsEditingDescription(true);
    // Kısa bir gecikme ile scroll yapıyoruz çünkü TextInput'un render olması için zaman gerekiyor
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userId',
                'userEmail',
                'userRole',
                'adminId'
              ]);
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });
            } catch (error) {
              console.error('Çıkış yapma hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        enabled
      >
        <Surface style={styles.sectionCardNew} elevation={1}>
          <LinearGradient
            colors={Gradients.indigo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.profileImageContainer}>
              <TouchableOpacity onPress={pickImage}>
                {profileData?.imageUrl ? (
                  <Avatar.Image
                    size={120}
                    source={{ uri: profileData.imageUrl }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Avatar.Text
                    size={120}
                    label={profileData?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    style={styles.profileImage}
                  />
                )}
                <IconButton
                  icon="camera"
                  size={20}
                  iconColor="#fff"
                  style={styles.editImageButton}
                  onPress={pickImage}
                />
              </TouchableOpacity>
            </View>
            <Text variant="headlineMedium" style={styles.name}>{profileData?.fullName}</Text>
            <Chip 
              icon="shield-account"
              style={[styles.roleBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              textStyle={{ color: '#FFFFFF' }}
            >
              {profileData?.role === 'admin' ? 'Yönetici' : 'Kiracı'}
            </Chip>
          </LinearGradient>
        </Surface>

        <Card style={styles.mainCard}>
          <LinearGradient
            colors={['#334155', '#1E293B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContent}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.compactSection}>
                {/* Durum ve Son Güncelleme */}
                <View style={styles.statusRow}>
                  <View style={styles.statusItem}>
                    <MaterialCommunityIcons name="account-check" size={24} color="#6366F1" />
                    <View style={styles.statusTextContainer}>
                      <Text style={styles.statusLabel}>Durum</Text>
                      <Text style={[styles.statusValue, { color: Colors.success }]}>
                        {profileData?.isActive ? 'Aktif' : 'Pasif'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusItem, styles.borderLeft]}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#6366F1" />
                    <View style={styles.statusTextContainer}>
                      <Text style={styles.statusLabel}>Son Güncelleme</Text>
                      <Text style={styles.statusValue}>
                        {profileData?.profileUpdatedAt ? 
                          new Date(profileData.profileUpdatedAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          '-'
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.separator} />

                {/* İletişim Bilgileri */}
                {isEditingContact ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      mode="outlined"
                      label="E-posta"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      style={styles.input}
                      outlineColor="#EC4899"
                      activeOutlineColor="#EC4899"
                      textColor="#F8FAFC"
                    />
                    <TextInput
                      mode="outlined"
                      label="Telefon"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      style={styles.input}
                      outlineColor="#EC4899"
                      activeOutlineColor="#EC4899"
                      textColor="#F8FAFC"
                    />
                    <Button
                      mode="contained"
                      onPress={handleUpdateContact}
                      style={[styles.button, { backgroundColor: '#EC4899' }]}
                    >
                      Kaydet
                    </Button>
                  </View>
                ) : (
                  <View style={styles.contactContainer}>
                    <View style={styles.contactItem}>
                      <MaterialCommunityIcons name="email-outline" size={24} color="#EC4899" />
                      <View style={styles.contactTextContainer}>
                        <Text style={styles.contactLabel}>E-posta</Text>
                        <Text style={styles.contactValue}>{profileData?.email}</Text>
                      </View>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => setIsEditingContact(true)}
                        style={[styles.editIconButton, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}
                        iconColor="#EC4899"
                      />
                    </View>
                    <View style={[styles.contactItem, { marginTop: 16 }]}>
                      <MaterialCommunityIcons name="phone-outline" size={24} color="#EC4899" />
                      <View style={styles.contactTextContainer}>
                        <Text style={styles.contactLabel}>Telefon</Text>
                        <Text style={styles.contactValue}>{profileData?.phoneNumber}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.separator} />

                {/* Profil Açıklaması */}
                {isEditingDescription ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      mode="outlined"
                      label="Profil Açıklaması"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={4}
                      style={[styles.input, styles.textArea]}
                      outlineColor="#22C55E"
                      activeOutlineColor="#22C55E"
                      textColor="#F8FAFC"
                    />
                    <Button
                      mode="contained"
                      onPress={handleUpdateProfile}
                      style={[styles.button, { backgroundColor: '#22C55E' }]}
                    >
                      Kaydet
                    </Button>
                  </View>
                ) : (
                  <View style={styles.descriptionContainer}>
                    <View style={styles.descriptionHeader}>
                      <MaterialCommunityIcons name="text-box" size={24} color="#22C55E" />
                      <Text style={styles.descriptionTitle}>Profil Açıklaması</Text>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={handleDescriptionEdit}
                        style={[styles.editIconButton, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}
                        iconColor="#22C55E"
                      />
                    </View>
                    <Paragraph style={styles.descriptionText}>
                      {profileData?.description || 'Henüz bir açıklama eklenmemiş.'}
                    </Paragraph>
                  </View>
                )}

                <View style={styles.separator} />

                {/* Çıkış Yap Butonu */}
                <View style={styles.logoutContainer}>
                  <Button
                    mode="contained"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    contentStyle={styles.logoutButtonContent}
                    icon="logout"
                  >
                    Çıkış Yap
                  </Button>
                </View>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  sectionCardNew: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  mainCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  section: {
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editImageButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    backgroundColor: Colors.primary,
  },
  name: {
    fontFamily: Fonts.urbanist.bold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.urbanist.bold,
    color: '#1F2937',
  },
  editButton: {
    borderRadius: 12,
  },
  apartmentInfo: {
    gap: 12,
  },
  infoRow: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#6B7280',
    flex: 1,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#1F2937',
    flex: 2,
  },
  editContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  textArea: {
    height: 100,
  },
  descriptionContainer: {
    gap: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#F1F5F9',
    fontFamily: Fonts.urbanist.regular,
    lineHeight: 22,
    marginLeft: 36,
  },
  gradientContent: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  compactSection: {
    gap: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusTextContainer: {
    marginLeft: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.urbanist.medium,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    color: '#F1F5F9',
    fontFamily: Fonts.urbanist.semiBold,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactContainer: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.urbanist.medium,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#F1F5F9',
    fontFamily: Fonts.urbanist.semiBold,
  },
  editIconButton: {
    margin: 0,
    width: 32,
    height: 32,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.urbanist.medium,
    flex: 1,
    marginLeft: 12,
  },
  logoutContainer: {
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
  },
  logoutButtonContent: {
    height: 48,
  },
});

export default ProfileScreen;
