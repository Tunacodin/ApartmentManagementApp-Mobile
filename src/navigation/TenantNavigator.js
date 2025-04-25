// src/navigation/TenantNavigator.js
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text, Animated, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../constants/Theme';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import screens
import DashboardScreen from '../screens/tenant/dashboard/DashboardScreen';
import ActivitiesScreen from '../screens/tenant/activities/ActivitiesScreen';
import ProfileScreen from '../screens/tenant/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

// Modern color palette
const colors = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: 'rgba(255, 255, 255, 0.9)',
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1E293B',
  textSecondary: '#64748B',
  active: 'rgba(255, 255, 255, 0.95)',
  inactive: '#94A3B8',
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
  fabActive: '#EC4899',
  fabInactive: '#94A3B8',
  fabBackground: 'rgba(255, 255, 255, 0.95)',
  menuBackground: 'rgba(255, 255, 255, 0.98)',
  navActive: 'rgba(255, 255, 255, 0.95)',
  navInactive: '#94A3B8',
};

// Common header options with EVIN title
const screenOptions = {
  headerShown: true,
  headerTitle: () => (
    <Text style={styles.headerTitle}>EVIN</Text>
  ),
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: 'transparent',
    height: 60,
  },
  headerShadowVisible: false,
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={50} tint="light" style={styles.blurView}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              let iconName;
              switch (route.name) {
                case 'Dashboard':
                  iconName = isFocused ? 'home' : 'home-outline';
                  break;
                case 'Activities':
                  iconName = isFocused ? 'time' : 'time-outline';
                  break;
                case 'Profile':
                  iconName = isFocused ? 'person' : 'person-outline';
                  break;
                default:
                  iconName = 'ellipse';
              }

              return (
                <Pressable
                  key={index}
                  onPress={onPress}
                  style={[
                    styles.tabButton,
                    isFocused && styles.tabButtonActive
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={28}
                    color={isFocused ? colors.active : colors.inactive}
                    style={styles.tabIcon}
                  />
                  <Text 
                    numberOfLines={1} 
                    style={[
                      styles.tabLabelText,
                      { color: isFocused ? colors.active : colors.inactive }
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const TenantNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={screenOptions}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'AnaSayfa',
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: 'Aktiviteler',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  blurView: {
    width: '92%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 3,
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabelText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.menuBackground,
    letterSpacing: 2,
    fontFamily: "Lato-Bold",
    marginTop: -40,
  },
});

export default TenantNavigator;
