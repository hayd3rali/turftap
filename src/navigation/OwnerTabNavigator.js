import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import OwnerHomeScreen from '../screens/OwnerHomeScreen';
import OwnerBookingsScreen from '../screens/OwnerBookingsScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import OwnerProfileScreen from '../screens/OwnerProfileScreen';
import OwnerEditPersonalScreen from '../screens/OwnerEditPersonalScreen';
import OwnerEditVenueScreen from '../screens/OwnerEditVenueScreen';
import OwnerManagePricingScreen from '../screens/OwnerManagePricingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const OwnerTabs = () => {
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
        tabBarIcon: ({ focused, color }) => {
          let iconName
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline'
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }
          return <Ionicons name={iconName} size={22} color={color} />
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={OwnerHomeScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Schedule" component={OwnerBookingsScreen} options={{ tabBarLabel: 'Schedule' }} />
      <Tab.Screen name="Profile" component={OwnerProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const OwnerTabNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
      <Stack.Screen
        name="OwnerProfile"
        component={OwnerProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OwnerEditPersonal"
        component={OwnerEditPersonalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OwnerEditVenue"
        component={OwnerEditVenueScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OwnerManagePricing"
        component={OwnerManagePricingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default OwnerTabNavigator;

