import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, shallowEqual } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import SetupNavigator from './SetupNavigator';
import PlayerTabNavigator from './PlayerTabNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';

const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const authState = useSelector(state => ({
    isAuthenticated: state.user.isAuthenticated,
    role:            state.user.role,
    firstName:       state.user.profileDetails?.first_name || state.user.profile?.first_name,
    venueName:       state.user.profileDetails?.venue_name ||
                     state.user.profileDetails?.venueName  ||
                     state.user.profile?.venue_name,
  }), shallowEqual)

  const { isAuthenticated, role, firstName, venueName } = authState

  const isOwnerComplete  = role === 'Owner'  && !!venueName
  const isPlayerComplete = role === 'Player' && !!firstName
  const isProfileComplete = isAuthenticated && role && (
    isOwnerComplete || isPlayerComplete
  )

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
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
