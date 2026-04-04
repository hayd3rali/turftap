import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, shallowEqual } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import SetupNavigator from './SetupNavigator';
import PlayerTabNavigator from './PlayerTabNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';

const RootStack = createNativeStackNavigator();

// Splash screen shown while profile is being fetched after OTP verification
const AuthLoadingScreen = () => (
  <View style={splashStyles.container}>
    <View style={splashStyles.logoCircle}>
      <Text style={splashStyles.logoText}>T</Text>
    </View>
    <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 24 }} />
    <Text style={splashStyles.loadingText}>Loading your profile...</Text>
  </View>
);

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});

const AppNavigator = () => {
  const authState = useSelector(state => ({
    isAuthenticated: state.user.isAuthenticated,
    role: state.user.role,
    status: state.user.status,
    user: state.user.user,
    firstName: state.user.profileDetails?.first_name || state.user.profile?.first_name,
    venueName: state.user.profileDetails?.venue_name ||
      state.user.profileDetails?.venueName ||
      state.user.profile?.venue_name,
  }), shallowEqual)

  const { isAuthenticated, role, status, user, firstName, venueName } = authState

  // If authenticated (OTP verified) but role is not yet set,
  // it means fetchProfile is still in-flight. Show a loading screen
  // instead of flashing the Setup/RoleSelection navigator.
  const isProfileLoading = isAuthenticated && !role && (status === 'loading' || status === 'succeeded')
  // Also check: user exists (from verifyOTP) but profile hasn't been dispatched via login() yet
  const isWaitingForProfile = isAuthenticated && !!user && !role

  const isOwnerComplete = role === 'Owner' && !!venueName
  const isPlayerComplete = role === 'Player' && !!firstName
  const isProfileComplete = isAuthenticated && role && (
    isOwnerComplete || isPlayerComplete
  )

  // Show a branded loading screen while profile is being fetched
  // This prevents the brief RoleSelection flash after OTP verification
  if (isWaitingForProfile) {
    return <AuthLoadingScreen />
  }

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : !isProfileComplete ? (
        <RootStack.Screen name="Setup" component={SetupNavigator} />
      ) : role === 'Owner' ? (
        <RootStack.Screen name="OwnerMain" component={OwnerTabNavigator} />
      ) : (
        <RootStack.Screen name="PlayerMain" component={PlayerTabNavigator} />
      )}
    </RootStack.Navigator>
  )
};

export default AppNavigator;
