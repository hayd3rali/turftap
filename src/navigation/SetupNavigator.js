import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import OwnerSetupScreen from '../screens/OwnerSetupScreen';

const Stack = createNativeStackNavigator();

const SetupNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="RoleSelection" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
      <Stack.Screen name="OwnerSetup" component={OwnerSetupScreen} />
    </Stack.Navigator>
  );
};

export default SetupNavigator;
