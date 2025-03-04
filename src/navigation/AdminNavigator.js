import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Dashboard Screens
import DashboardScreen from '../screens/admin/Dashboard/DashboardScreen';
import CreateMeetingScreen from '../screens/admin/Dashboard/CreateMeetingScreen';
import CreateAnnouncementScreen from '../screens/admin/Dashboard/CreateAnnouncementScreen';
import CreateNotificationScreen from '../screens/admin/Dashboard/CreateNotificationScreen';
import ActivitiesScreen from '../screens/admin/Dashboard/ActivitiesScreen';

// Management Screens
import ManagementScreen from '../screens/admin/Management/ManagementScreen';
import ApartmentsScreen from '../screens/admin/Management/ApartmentsScreen';
import UsersScreen from '../screens/admin/Management/UsersScreen';
import MeetingsScreen from '../screens/admin/Management/MeetingsScreen';
import SurveysScreen from '../screens/admin/Management/SurveysScreen';
import ComplaintsScreen from '../screens/admin/Management/ComplaintsScreen';

// Finance Screens
import FinanceScreen from '../screens/admin/Finance/FinanceScreen';
import DuesScreen from '../screens/admin/Finance/DuesScreen';
import ExpensesScreen from '../screens/admin/Finance/ExpensesScreen';
import IncomeScreen from '../screens/admin/Finance/IncomeScreen';
import FinancialReportsScreen from '../screens/admin/Finance/FinancialReportsScreen';

// Reports Screens
import ReportsScreen from '../screens/admin/Reports/ReportsScreen';
import MeetingAttendanceScreen from '../screens/admin/Reports/MeetingAttendanceScreen';
import SurveyResultsScreen from '../screens/admin/Reports/SurveyResultsScreen';

// Profile Screens
import ProfileScreen from '../screens/admin/Profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Dashboard Stack Navigator
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="Activities" component={ActivitiesScreen} />
    <Stack.Screen name="CreateMeeting" component={CreateMeetingScreen} />
    <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
    <Stack.Screen name="CreateNotification" component={CreateNotificationScreen} />
  </Stack.Navigator>
);

// Management Stack Navigator
const ManagementStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ManagementMain" component={ManagementScreen} />
    <Stack.Screen name="Apartments" component={ApartmentsScreen} />
    <Stack.Screen name="Users" component={UsersScreen} />
    <Stack.Screen name="Meetings" component={MeetingsScreen} />
    <Stack.Screen name="Surveys" component={SurveysScreen} />
    <Stack.Screen name="Complaints" component={ComplaintsScreen} />
    <Stack.Screen name="CreateMeeting" component={CreateMeetingScreen} />
    <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
  </Stack.Navigator>
);

// Finance Stack Navigator
const FinanceStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FinanceMain" component={FinanceScreen} />
    <Stack.Screen name="Dues" component={DuesScreen} />
    <Stack.Screen name="Expenses" component={ExpensesScreen} />
    <Stack.Screen name="Income" component={IncomeScreen} />
    <Stack.Screen name="FinancialReports" component={FinancialReportsScreen} />
  </Stack.Navigator>
);

// Reports Stack Navigator
const ReportsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ReportsMain" component={ReportsScreen} />
    <Stack.Screen name="MeetingAttendance" component={MeetingAttendanceScreen} />
    <Stack.Screen name="SurveyResults" component={SurveyResultsScreen} />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Management':
            iconName = focused ? 'business' : 'business-outline';
            break;
          case 'Finance':
            iconName = focused ? 'wallet' : 'wallet-outline';
            break;
          case 'Reports':
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'ellipse';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        height: 60,
        paddingBottom: 10,
        paddingTop: 10,
      },
      tabBarLabelStyle: {
        fontSize: 12,
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardStack}
      options={{
        title: 'Ana Sayfa',
      }}
    />
    <Tab.Screen 
      name="Management" 
      component={ManagementStack}
      options={{
        title: 'Yönetim',
      }}
    />
    <Tab.Screen 
      name="Finance" 
      component={FinanceStack}
      options={{
        title: 'Finans',
      }}
    />
    <Tab.Screen 
      name="Reports" 
      component={ReportsStack}
      options={{
        title: 'Raporlar',
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack}
      options={{
        title: 'Profil',
      }}
    />
  </Tab.Navigator>
);

// Main Admin Navigator
const AdminNavigator = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      contentStyle: {
        backgroundColor: '#fff',
      },
    }}
  >
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
  </Stack.Navigator>
);

export default AdminNavigator;
