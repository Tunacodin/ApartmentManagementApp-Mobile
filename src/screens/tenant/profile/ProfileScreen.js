import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Text, Card, useTheme, Button, Divider, TextInput, Avatar, Switch } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { Fonts, Colors, Gradients } from '../../../constants';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found in AsyncStorage');
          return;
        }

        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.error('Auth token not found');
          return;
        }
        
        const response = await axios.get(API_ENDPOINTS.TENANT.GET_DETAILS(userId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.success) {
          const profileData = response.data.data;
          setProfile(profileData);
          setFormData({
            fullName: profileData.fullName || '',
            email: profileData.email || '',
            phoneNumber: profileData.phoneNumber || '',
            notificationPreferences: profileData.accountSettings?.notificationPreferences || {
              email: true,
              sms: false,
              push: true
            }
          });
        } else {
          console.warn('Profile data not in expected format:', response.data);
        }
      } catch (error) {
        // Sadece gerçek API hatalarını logla
        if (error.response && error.response.data && typeof error.response.data === 'object') {
          console.error('Error fetching profile:', error.response.data);
        } else {
          console.warn('Non-critical error while fetching profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.put(API_ENDPOINTS.TENANT.UPDATE(userId), formData);
      if (response.data.success) {
        setProfile(response.data.data);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userId');
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });
            } catch (error) {
              console.error('Çıkış yapılırken hata oluştu:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  const renderProfileSection = () => (
    <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      />
      <Card.Content style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          {profile.profileImageUrl ? (
            <Avatar.Image
              size={100}
              source={{ uri: profile.profileImageUrl }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon
              size={100}
              icon="account"
              style={styles.avatar}
            />
          )}
          <Button
            mode="outlined"
            onPress={() => {/* TODO: Implement image upload */}}
            style={styles.changePhotoButton}
          >
            Fotoğraf Değiştir
          </Button>
        </View>

        <View style={styles.infoContainer}>
          {editing ? (
            <>
              <TextInput
                label="Ad Soyad"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="E-posta"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
              />
              <TextInput
                label="Telefon"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
            </>
          ) : (
            <>
              <Text style={[styles.name, { color: theme.colors.text }]}>
                {profile.fullName}
              </Text>
              <View style={styles.infoRow}>
                <Icon name="email" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {profile.email}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {profile.phoneNumber}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {editing ? (
            <>
              <Button
                mode="outlined"
                onPress={() => setEditing(false)}
                style={styles.button}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.button}
              >
                Kaydet
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={() => setEditing(true)}
              style={styles.button}
            >
              Düzenle
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderApartmentSection = () => {
    if (!profile?.apartmentInfo) return null;
    
    return (
      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Daire Bilgileri
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Icon name="home" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {profile.apartmentInfo.unitNumber || 'Belirtilmemiş'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="floor-plan" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {profile.apartmentInfo.floor ? `${profile.apartmentInfo.floor}. Kat` : 'Belirtilmemiş'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="sofa" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {profile.apartmentInfo.type || 'Belirtilmemiş'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderBuildingSection = () => {
    if (!profile?.buildingInfo) return null;
    
    return (
      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Bina Bilgileri
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Icon name="office-building" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {profile.buildingInfo.name || 'Belirtilmemiş'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {profile.buildingInfo.address || 'Belirtilmemiş'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderContractSection = () => {
    if (!profile?.contractInfo) return null;
    
    return (
      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sözleşme Bilgileri
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.contractInfo}>
            <Text style={[styles.contractLabel, { color: theme.colors.textSecondary }]}>
              Başlangıç Tarihi
            </Text>
            <Text style={[styles.contractValue, { color: theme.colors.text }]}>
              {profile.contractInfo.startDate ? new Date(profile.contractInfo.startDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
            </Text>
          </View>
          <View style={styles.contractInfo}>
            <Text style={[styles.contractLabel, { color: theme.colors.textSecondary }]}>
              Bitiş Tarihi
            </Text>
            <Text style={[styles.contractValue, { color: theme.colors.text }]}>
              {profile.contractInfo.endDate ? new Date(profile.contractInfo.endDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
            </Text>
          </View>
          <View style={styles.contractInfo}>
            <Text style={[styles.contractLabel, { color: theme.colors.textSecondary }]}>
              Aylık Kira
            </Text>
            <Text style={[styles.contractValue, { color: theme.colors.text }]}>
              {profile.contractInfo.monthlyRent ? `${profile.contractInfo.monthlyRent.toLocaleString('tr-TR')} ₺` : 'Belirtilmemiş'}
            </Text>
          </View>
          <View style={styles.contractInfo}>
            <Text style={[styles.contractLabel, { color: theme.colors.textSecondary }]}>
              Aylık Aidat
            </Text>
            <Text style={[styles.contractValue, { color: theme.colors.text }]}>
              {profile.contractInfo.monthlyDues ? `${profile.contractInfo.monthlyDues.toLocaleString('tr-TR')} ₺` : 'Belirtilmemiş'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderContactSection = () => {
    if (!profile?.contactInfo) return null;
    
    return (
      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            İletişim Bilgileri
          </Text>
          <Divider style={styles.divider} />
          
          {profile.contactInfo.admin && (
            <>
              <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
                Yönetici
              </Text>
              <View style={styles.infoRow}>
                <Icon name="account-tie" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {profile.contactInfo.admin.name || 'Belirtilmemiş'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {profile.contactInfo.admin.phone || 'Belirtilmemiş'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="email" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {profile.contactInfo.admin.email || 'Belirtilmemiş'}
                </Text>
              </View>
            </>
          )}

          {profile.contactInfo.owner && (
            <>
              <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
                Ev Sahibi
              </Text>
              <View style={styles.infoRow}>
                <Icon name="account" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {profile.contactInfo.owner.name || 'Belirtilmemiş'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {profile.contactInfo.owner.phone || 'Belirtilmemiş'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="email" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {profile.contactInfo.owner.email || 'Belirtilmemiş'}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderSettingsSection = () => {
    if (!profile?.accountSettings) return null;
    
    return (
      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Bildirim Ayarları
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Icon name="email" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                E-posta Bildirimleri
              </Text>
            </View>
            <Switch
              value={formData.notificationPreferences.email}
              onValueChange={(value) => setFormData({
                ...formData,
                notificationPreferences: {
                  ...formData.notificationPreferences,
                  email: value
                }
              })}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Icon name="message" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                SMS Bildirimleri
              </Text>
            </View>
            <Switch
              value={formData.notificationPreferences.sms}
              onValueChange={(value) => setFormData({
                ...formData,
                notificationPreferences: {
                  ...formData.notificationPreferences,
                  sms: value
                }
              })}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Icon name="bell" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Push Bildirimleri
              </Text>
            </View>
            <Switch
              value={formData.notificationPreferences.push}
              onValueChange={(value) => setFormData({
                ...formData,
                notificationPreferences: {
                  ...formData.notificationPreferences,
                  push: value
                }
              })}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderProfileSection()}
      {renderApartmentSection()}
      {renderBuildingSection()}
      {renderContractSection()}
      {renderContactSection()}
      {renderSettingsSection()}
      
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={[styles.logoutButton, { borderColor: theme.colors.error }]}
        textColor={theme.colors.error}
        icon="logout"
      >
        Çıkış Yap
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  profileContent: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  changePhotoButton: {
    marginTop: 8,
  },
  infoContainer: {
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontFamily: Fonts.lato.bold,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    marginLeft: 12,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  button: {
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lato.bold,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    marginTop: 16,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  contractInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contractLabel: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
  },
  contractValue: {
    fontSize: 14,
    fontFamily: Fonts.lato.bold,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    marginLeft: 12,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
});

export default ProfileScreen; 