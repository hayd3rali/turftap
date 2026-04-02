import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import PrimaryButton from '../components/PrimaryButton';
import { sendOTP, clearError } from '../store/userSlice';

const AuthPhoneScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const dispatch = useDispatch();
  const { status, error } = useSelector(state => state.user);

  const handleSendOtp = async () => {
    // Remove any non-digit characters from the input (keeps only numbers)
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If the user entered a leading '0' (e.g., 03001234567), remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // In Pakistan, a valid mobile number after removing leading '0' is exactly 10 digits
    if (cleaned.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // Format for Supabase/Twilio strictly as E.164: +923001234567
    const formatted = `+92${cleaned}`;
    
    const result = await dispatch(sendOTP(formatted));
    if (sendOTP.fulfilled.match(result)) {
      navigation.navigate('OTP', { phoneNumber: formatted });
    } else {
      Alert.alert('Error', result.payload || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>T</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to TurfTap</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to receive{'\n'}a verification code
        </Text>

        {/* Phone input */}
        <View style={styles.form}>
          <Text style={styles.label}>PHONE NUMBER</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>+92</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="300 1234567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
          <View style={styles.sendButtonWrapper}>
            <PrimaryButton
              title={status === 'loading' ? 'Sending...' : 'Send OTP →'}
              onPress={handleSendOtp}
              disabled={status === 'loading'}
            />
          </View>
          {status === 'loading' && <ActivityIndicator color="#2563EB" style={{ marginTop: 8 }} />}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          By confirming, you agree to our Terms of Service{'\n'}and Privacy Policy
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    marginTop: 32,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#6B7280',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  countryCodeContainer: {
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryCodeText: {
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1D1D1F',
  },
  sendButtonWrapper: {
    marginTop: 24,
  },
  footerText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
});

export default AuthPhoneScreen;
