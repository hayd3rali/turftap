import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import AreaPickerModal from '../components/AreaPickerModal';
import { updateProfile, login } from '../store/userSlice';
import { supabase } from '../services/supabase';

const SetupProfileScreen = ({ route, navigation }) => {
  const { phoneNumber, role, fromGoogle, googleUser } = route.params || {};
  const [firstName, setFirstName] = useState(
    fromGoogle && googleUser?.name ? googleUser.name : ''
  );
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(
    fromGoogle && googleUser?.email ? googleUser.email : ''
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [area, setArea] = useState('');
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handlePickImage = async () => {
    // Request permission (optional but recommended)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType?.Images ?? 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const { user } = useSelector(state => state.user);

  const handleCompleteSetup = async () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!firstName.trim()) {
      Alert.alert('Required', 'Please enter your first name.'); return;
    }
    if (!lastName.trim()) {
      Alert.alert('Required', 'Please enter your last name.'); return;
    }
    if (!email.trim() || !emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.'); return;
    }
    if (!area) {
      Alert.alert('Required', 'Please select your area.'); return;
    }

    setLoading(true);

    try {
      // Get current session user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Session Error', 'Please log in again.');
        setLoading(false);
        return;
      }

    // Step 1: Save profile
    const result = await dispatch(updateProfile({
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      email:      email.trim().toLowerCase(),
      phone:      user?.phone || null,
      area:       area, // Use the correct local variabe
      role:       route.params?.role || 'Player',
    }))

    if (!updateProfile.fulfilled.match(result)) {
      Alert.alert('Error', result.payload || 'Could not save profile.')
      setLoading(false)
      return
    }

    // Step 2: Navigate immediately
    dispatch(login({
      role: route.params?.role || 'Player',
      profileDetails: result.payload,
    }))

    // Step 3: Sync email to auth.users bypassing confirmation, and set password
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser && email.trim()) {
      supabase.rpc('sync_profile_email_to_auth', {
        user_id: currentUser.id,
        user_email: email.trim().toLowerCase(),
      }).then(({ error }) => {
        if (error) console.log('Email sync error:', error.message)
      })
    }

    if (password) {
      supabase.auth.updateUser({
        password: password.trim(),
      }).then(({ error }) => {
        if (error) console.log('Password update error:', error.message)
      })
    }

  } catch (e) {
    Alert.alert('Error', e.message)
  }
  setLoading(false)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Join the elite community of sports enthusiasts.
          </Text>

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} activeOpacity={0.8}>
            <View style={styles.avatarCircle}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="camera" size={32} color="#9CA3AF" />
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <InputField
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />
            <InputField
              label="Email Address"
              placeholder="example@domain.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Set Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <InputField
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Area dropdown */}
            <View>
              <Text style={styles.fieldLabel}>Area / Zone</Text>
              <TouchableOpacity
                style={styles.areaSelector}
                onPress={() => setAreaModalVisible(true)}
              >
                <Text style={[
                  styles.areaSelectorText,
                  !area && { color: '#9CA3AF' }
                ]}>
                  {area || 'Select your area'}
                </Text>
                <Text style={styles.areaChevron}>▼</Text>
              </TouchableOpacity>

              <AreaPickerModal
                visible={areaModalVisible}
                onClose={() => setAreaModalVisible(false)}
                onSelect={(selectedArea) => setArea(selectedArea)}
                selectedArea={area}
              />
            </View>
          </View>
        </ScrollView>

        {/* Sticky bottom button */}
        <View style={styles.bottomBar}>
          <PrimaryButton
            title={loading ? 'Setting up...' : 'Get Started →'}
            onPress={handleCompleteSetup}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  backText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 24,
    position: 'relative',
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    //
  },
  cameraBadge: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    position: 'absolute',
    right: -2,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadgeIcon: {
    //
  },
  form: {
    marginTop: 24,
    rowGap: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  areaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  areaSelectorText: {
    fontSize: 14,
    color: '#1A1A2E',
    flex: 1,
  },
  areaChevron: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export default SetupProfileScreen;
