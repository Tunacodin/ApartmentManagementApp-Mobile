// src/navigation/AppNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RoleScreen from "../screens/auth/RoleScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import AdminNavigator from "./AdminNavigator"; // Admin kayıt işlemleri
import OwnerNavigator from "./OwnerNavigator";
import WorkerNavigator from "./WorkerNavigator";
import SecurityNavigator from "./SecurityNavigator";
import TenantNavigator from "./TenantNavigator";
import DashboardScreen from "../screens/admin/Dashboard/DashboardScreen"; // Admin Dashboard
import Splash from "../screens/auth/Splash";
import HelloScreen from "../screens/auth/HelloScreen";
import ForgotPasswordScreen from "../screens/common/ForgotPasswordScreen";
import AdminInfoScreen from "../screens/admin/create/AdminInfoScreen"; // Yönetici kayıt ekranı

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return ( 
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: '#1A202C',
        },
        animation: 'slide_from_right',
      }}
    >
      {/* İlk açılış ekranları */}
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="HelloScreen" component={HelloScreen} />

      {/* Rol seçim ve giriş ekranları */}
      <Stack.Screen name="RoleScreen" component={RoleScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="AdminInfo" component={AdminInfoScreen} />

      {/*Şifremi Unuttum */}
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      
      {/* Kayıt işlemleri için navigatörler */}
      <Stack.Screen name="AdminNavigator" component={AdminNavigator} />
      <Stack.Screen name="OwnerNavigator" component={OwnerNavigator} />
      <Stack.Screen name="WorkerNavigator" component={WorkerNavigator} />
      <Stack.Screen name="SecurityNavigator" component={SecurityNavigator} />
      <Stack.Screen name="TenantNavigator" component={TenantNavigator} />
    </Stack.Navigator>
  );
}
