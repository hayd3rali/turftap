import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import AuthPhoneScreen from '../screens/AuthPhoneScreen';
import OTPScreen from '../screens/OTPScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import OwnerSetupScreen from '../screens/OwnerSetupScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AuthPhone" component={AuthPhoneScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
      <Stack.Screen name="OwnerSetup" component={OwnerSetupScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

