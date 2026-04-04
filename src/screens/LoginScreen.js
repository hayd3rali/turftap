import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { supabase } from '../services/supabase';
import { fetchProfile, login } from '../store/userSlice';

const LoginScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required', 'Please enter your email address.')
      return
    }
    if (!password.trim()) {
      Alert.alert('Required', 'Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const emailInput = identifier.trim().toLowerCase()

      // Attempt email + password login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: password.trim(),
      })

      if (error) {
        // Email login failed
        // Show helpful message with phone OTP option
        Alert.alert(
          'Login Failed',
          'Could not login with this email and password.\n\nTip: Try logging in with your Phone Number instead.',
          [
            {
              text: 'Login with Phone',
              onPress: () => navigation.navigate('AuthPhone'),
            },
            { text: 'Try Again', style: 'cancel' },
          ]
        )
        setLoading(false)
        return
      }

      if (data?.user) {
        const result = await dispatch(fetchProfile(data.user.id))
        if (fetchProfile.fulfilled.match(result)) {
          const p = result.payload
          dispatch(login({
            role: p.role || 'Player',
            profileDetails: {
              ...p,
              venue_name: p.venue_name || p.venueName || '',
              venueName:  p.venue_name || p.venueName || '',
              first_name: p.first_name || '',
              last_name:  p.last_name  || '',
            },
          }))
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!identifier.trim()) {
      Alert.alert(
        'Enter Email',
        'Please enter your email address first, then tap Forgot Password.'
      )
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        identifier.trim().toLowerCase(),
        {
          redirectTo: 'turftap://reset-password',
        }
      )
      if (error) {
        Alert.alert('Error', error.message)
      } else {
        Alert.alert(
          'Email Sent ✓',
          `A password reset link has been sent to ${identifier.trim()}. Check your inbox and tap the link to reset your password.`
        )
      }
    } catch (e) {
      Alert.alert('Error', 'Could not send reset email. Please try again.')
    }
  }

  const handleNavigateToAuthPhone = () => {
    navigation.navigate('AuthPhone');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>T</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Login to book your next elite court session.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <InputField
            placeholder="e.g. alex@example.com"
            value={identifier}
            onChangeText={setIdentifier}
          />

          <Text style={[styles.label, styles.labelSpacing]}>Password</Text>
          <InputField
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={isPasswordHidden}
          />

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordBox}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.loginButtonWrapper}>
            <PrimaryButton
              title={loading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={loading}
            />
          </View>
          {loading && <ActivityIndicator color="#2563EB" style={{ marginTop: 8 }} />}
          
        </View>

        {/* Divider */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 16,
          gap: 8,
          marginTop: 32,
        }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          <Text style={{ fontSize: 13, color: '#9CA3AF' }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
        </View>

        {/* Login with Phone OTP Button */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#2563EB',
            borderRadius: 12,
            paddingVertical: 14,
            gap: 8,
            backgroundColor: '#FFFFFF',
          }}
          onPress={() => navigation.navigate('AuthPhone')}
        >
          <Ionicons name="phone-portrait-outline" size={20} color="#2563EB" />
          <Text style={{
            color: '#2563EB',
            fontSize: 15,
            fontWeight: '700',
          }}>
            Login with Phone OTP
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={handleNavigateToAuthPhone}>
            <Text style={styles.bottomLinkText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    marginTop: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  labelSpacing: {
    marginTop: 16,
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: '#2563EB',
    fontSize: 13,
    marginTop: 8,
  },
  loginButtonWrapper: {
    marginTop: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  bottomText: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomLinkText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default LoginScreen;
