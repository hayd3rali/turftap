import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { logout } from '../store/userSlice';
import { supabase } from '../services/supabase';

const ACCOUNT_MENU = [
  { icon: '👤', label: 'Personal Info', route: 'PersonalInfo' },
  { icon: '🔔', label: 'Notification Settings', route: 'NotificationSettings' },
];

const SUPPORT_MENU = [
  { icon: '❓', label: 'Help & Support', route: 'HelpSupport' },
  { icon: '🔒', label: 'Privacy Policy', route: 'PrivacyPolicy' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { profileDetails, profile } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const firstName = profileDetails?.first_name || profileDetails?.firstName || profile?.first_name || '';
  const lastName = profileDetails?.last_name || profileDetails?.lastName || profile?.last_name || '';
  const email = profileDetails?.email || profile?.email || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';
  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName
      ? firstName.charAt(0).toUpperCase()
      : 'U';

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

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.menuRow}
      activeOpacity={0.6}
      onPress={() => item.route && navigation.navigate(item.route)}
    >
      <View style={styles.menuLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <Text style={styles.menuLabel}>{item.label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              {profileDetails?.profileImage ? (
                <Image source={{ uri: profileDetails.profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={() => navigation.navigate('PersonalInfo')}
            >
              <Text style={styles.cameraBadgeIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Account Management */}
        <Text style={styles.sectionLabel}>ACCOUNT MANAGEMENT</Text>
        <View style={styles.menuContainer}>
          {ACCOUNT_MENU.map(renderMenuItem)}
        </View>

        {/* Support & More */}
        <Text style={styles.sectionLabelSecond}>SUPPORT & MORE</Text>
        <View style={styles.menuContainer}>
          {SUPPORT_MENU.map(renderMenuItem)}
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.6}>
          <Text style={styles.logoutText}>← Logout</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>App version 1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#1A1A2E',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },

  /* avatar */
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadgeIcon: {
    fontSize: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 8,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  /* section labels */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#6B7280',
    marginTop: 32,
    marginBottom: 8,
  },
  sectionLabelSecond: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#6B7280',
    marginTop: 24,
    marginBottom: 8,
  },

  /* menu */
  menuContainer: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },

  /* logout */
  logoutBtn: {
    marginTop: 32,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },

  /* version */
  versionText: {
    fontSize: 11,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProfileScreen;
