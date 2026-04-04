import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import PrimaryButton from '../components/PrimaryButton';
import { verifyOTP, fetchProfile, clearError, login } from '../store/userSlice';

const OTPScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { status, error, phone } = useSelector(state => state.user);
  const phoneNumber = route.params?.phoneNumber || phone;

  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const inputsRef = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const handleChange = (index, value) => {
    const digit = value.slice(-1);
    const nextCodes = [...codes];
    nextCodes[index] = digit;
    setCodes(nextCodes);

    if (digit && index < inputsRef.length - 1) {
      inputsRef[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (index, event) => {
    if (event.nativeEvent.key === 'Backspace' && !codes[index] && index > 0) {
      inputsRef[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = codes.join('');
    if (otp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit OTP.');
      return;
    }
    // Step 1: verify OTP with Supabase
    const result = await dispatch(verifyOTP({ phone: phoneNumber, token: otp }));
    if (verifyOTP.fulfilled.match(result)) {
      const profileResult = await dispatch(fetchProfile(result.payload.id))
      if (fetchProfile.fulfilled.match(profileResult)) {
        const p = profileResult.payload
        const ownerComplete  = p.role === 'Owner' && !!(p.venue_name || p.venueName)
        const playerComplete = p.role === 'Player' && !!p.first_name

        if (ownerComplete || playerComplete) {
          dispatch(login({
            role: p.role,
            profileDetails: {
              ...p,
              venue_name: p.venue_name || p.venueName || '',
              venueName:  p.venue_name || p.venueName || '',
              first_name: p.first_name || '',
              last_name:  p.last_name  || '',
            },
          }))
        } else {
          navigation.navigate('RoleSelection', { phoneNumber })
        }
      } else {
        navigation.navigate('RoleSelection', { phoneNumber })
      }
    } else {
      Alert.alert('Invalid OTP', result.payload || 'The code you entered is incorrect.');
    }
  };

  const formatPhone = (num) => {
    if (!num) return '+92 XXX XXXXXXX';
    return `+92 ${num}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentContainer}>
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>T</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}{formatPhone(phoneNumber)}
        </Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {codes.map((code, index) => (
            <TextInput
              key={index}
              ref={inputsRef[index]}
              style={[
                styles.otpInput,
                focusedIdx === index && styles.otpInputFocused,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={code}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={(event) => handleKeyPress(index, event)}
              onFocus={() => setFocusedIdx(index)}
            />
          ))}
        </View>

        {/* Resend */}
        <Text style={styles.resendText}>
          Didn't receive code?{' '}
          <Text style={styles.resendLink}>Resend it here</Text>
        </Text>

        {/* Button */}
        <View style={styles.buttonWrapper}>
          <PrimaryButton
            title={status === 'loading' ? 'Verifying...' : 'Verify & Continue'}
            onPress={handleVerify}
            disabled={status === 'loading'}
          />
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  backText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  logoCircle: {
    width: 48,
    height: 48,
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
    fontSize: 22,
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    columnGap: 12,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  otpInputFocused: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  resendText: {
    marginTop: 20,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  resendLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
  buttonWrapper: {
    marginTop: 'auto',
    marginBottom: 32,
  },
});

export default OTPScreen;
