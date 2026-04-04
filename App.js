import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store/store';
import { toggleTheme } from './src/store/themeSlice';
import { supabase } from './src/services/supabase';
import { fetchProfile, login, logout } from './src/store/userSlice';

import * as Linking from 'expo-linking';

// Create a navigation ref to navigate from AuthListener
const navigationRef = React.createRef();

const ThemeInitializer = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const rehydrateTheme = async () => {
      try {
        const pref = await AsyncStorage.getItem('@theme_pref');
        if (pref === 'dark') dispatch(toggleTheme());
      } catch (e) {
        // silent fail
      }
    };
    rehydrateTheme();
  }, [dispatch]);
  return null;
};

const AuthListener = () => {
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    // Handle deep links for password reset
    const handleDeepLink = async (event) => {
      const url = event.url;
      // Supabase sends type=recovery or reset-password in the URL
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        // Extract tokens from URL (they might be in the fragment # or query ?)
        const queryString = url.split('?')[1] || url.split('#')[1];
        if (!queryString) return;

        const params = new URLSearchParams(queryString);
        const accessToken  = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          // Set the session so the user is "logged in" for the password update
          const { error } = await supabase.auth.setSession({
            access_token:  accessToken,
            refresh_token: refreshToken || '',
          });

          if (!error) {
            // Navigate to our reset password screen
            // We use a small timeout to ensure navigation is ready
            setTimeout(() => {
              if (navigationRef.current) {
                navigationRef.current.navigate('ResetPassword');
              }
            }, 500);
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check if app was opened from a link (initial link)
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check existing session once on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(fetchProfile(session.user.id)).then((result) => {
          if (fetchProfile.fulfilled.match(result)) {
            const profile = result.payload
            const hasOwnerProfile = profile?.role === 'Owner' && !!(profile.venue_name || profile.venueName)
            const hasPlayerProfile = profile?.role === 'Player' && !!profile.first_name
            if (hasOwnerProfile || hasPlayerProfile) {
              dispatch(login({
                role: profile.role,
                profileDetails: {
                  ...profile,
                  venue_name: profile.venue_name || profile.venueName || '',
                  venueName:  profile.venue_name || profile.venueName || '',
                },
              }))
            }
          }
        })
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          dispatch(logout());
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);
  return null;
};

export default function App() {
  const linking = {
    prefixes: [Linking.createURL('/'), 'turftap://'],
    config: {
      screens: {
        ResetPassword: 'reset-password',
      },
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#1A1A2E" translucent={false} />
      <Provider store={store}>
        <ThemeInitializer />
        <AuthListener />
        <NavigationContainer ref={navigationRef} linking={linking}>
          <AppNavigator />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  )
}

