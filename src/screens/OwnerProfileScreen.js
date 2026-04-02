import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

import { signOut, logout } from '../store/userSlice';

const OwnerProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { profileDetails, profile } = useSelector((state) => state.user);

  const firstName = profileDetails?.first_name || profileDetails?.firstName || profile?.first_name || '';
  const lastName = profileDetails?.last_name || profileDetails?.lastName || profile?.last_name || '';
  const venueName = profileDetails?.venue_name || profile?.venue_name || profileDetails?.venueName || 'My Venue';
  const fullName = `${firstName} ${lastName}`.trim() || 'Owner';
  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName
      ? firstName.charAt(0).toUpperCase()
      : 'O';

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => performLogout(),
        },
      ],
      { cancelable: true }
    )
  }

  const performLogout = async () => {
    // Step 1: Immediately clear Redux state
    // This triggers AppNavigator to show Auth screen RIGHT NOW
    // without waiting for Supabase to respond
    dispatch(logout())

    // Step 2: Clear local storage
    try {
      await AsyncStorage.removeItem('@theme_pref')
    } catch (e) {
      console.log('AsyncStorage clear error:', e)
    }

    // Step 3: Sign out from Supabase in background
    // We don't await this — it can complete on its own time
    supabase.auth.signOut()
      .then(() => console.log('Supabase signOut complete'))
      .catch(e => console.log('Supabase signOut error:', e.message))
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={10}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PROFILE DETAILS</Text>
          <Ionicons name="shield-checkmark-outline" size={20} color="#2563EB" />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </View>
          <Text style={styles.ownerName}>{fullName}</Text>
          <Text style={styles.venueName}>{venueName}</Text>
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>PROFILE MANAGEMENT</Text>

        {/* Menu rows */}
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OwnerEditPersonal')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="create-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>Edit Personal Details</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OwnerEditVenue')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="business-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>Edit Venue Details</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OwnerManagePricing')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="cash-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>Manage Pricing</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>← Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  backArrow: {
    fontSize: 20,
    color: '#1A1A2E',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#1A1A2E',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563EB',
  },
  cameraBadge: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    right: -2,
  },
  cameraIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  ownerName: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A2E',
  },
  venueName: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  sectionLabel: {
    marginTop: 36,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#9CA3AF',
  },
  menuList: {
    gap: 8,
  },
  menuRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  logoutButton: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
});

export default OwnerProfileScreen;

