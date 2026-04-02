import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CourtDetailScreen from '../screens/CourtDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SuccessScreen from '../screens/SuccessScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const PlayerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 4,
          paddingTop: 6,
          height: 76,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline'
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }
          return <Ionicons name={iconName} size={22} color={color} />
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: 'Explore' }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ tabBarLabel: 'Bookings' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const PlayerTabNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayerTabs" component={PlayerTabs} />
      <Stack.Screen name="CourtDetail" component={CourtDetailScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
    </Stack.Navigator>
  );
};

export default PlayerTabNavigator;
