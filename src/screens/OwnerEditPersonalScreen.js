import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { setUser } from '../store/userSlice';

const SPORTS = ['Padel', 'Cricket', 'Futsal', 'All'];

const OwnerEditPersonalScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { profileDetails, profile } = useSelector((state) => state.user);

  const [firstName, setFirstName] = useState(
    profileDetails?.first_name || profile?.first_name || ''
  );
  const [lastName, setLastName] = useState(
    profileDetails?.last_name || profile?.last_name || ''
  );
  const [email, setEmail] = useState(
    profileDetails?.email || profile?.email || ''
  );
  const [phone, setPhone] = useState(
    profileDetails?.phone || profile?.phone || ''
  );
  const [primarySport, setPrimarySport] = useState('All');
  const [showSportPicker, setShowSportPicker] = useState(false);

  const handleSave = () => {
    dispatch(
      setUser({ firstName, lastName, email, phone, primarySport })
    );
    Alert.alert('Saved ✓', 'Your details have been updated.');
  };

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

        {/* Avatar + change photo */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {(firstName || 'O').charAt(0).toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changePhotoButton}
            activeOpacity={0.8}
          >
            <Text style={styles.changePhotoText}>CHANGE PHOTO</Text>
          </TouchableOpacity>
          <Text style={styles.tierText}>GOLD TIER COURT OWNER</Text>
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            label="FIRST NAME"
            placeholder="Enter first name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <InputField
            label="LAST NAME"
            placeholder="Enter last name"
            value={lastName}
            onChangeText={setLastName}
          />
          <InputField
            label="EMAIL ADDRESS"
            placeholder="example@domain.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            label="PHONE NUMBER"
            placeholder="+92 300 0000000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>PRIMARY SPORT</Text>
            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.8}
              onPress={() => setShowSportPicker((prev) => !prev)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !primarySport && styles.dropdownPlaceholder,
                ]}
              >
                {primarySport || 'Select primary sport'}
              </Text>
              <Text style={styles.dropdownChevron}>▼</Text>
            </TouchableOpacity>
            {showSportPicker && (
              <View style={styles.dropdownList}>
                {SPORTS.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setPrimarySport(sport);
                      setShowSportPicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{sport}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Venue management shortcuts */}
        <Text style={styles.sectionLabel}>VENUE MANAGEMENT</Text>
        <View style={styles.menuList}>
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
      </ScrollView>

      {/* Sticky bottom */}
      <View style={styles.stickyBar}>
        <PrimaryButton title="SAVE CHANGES" onPress={handleSave} />
      </View>
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
    paddingBottom: 100,
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
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563EB',
  },
  changePhotoButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  tierText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  sectionLabel: {
    marginTop: 28,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#9CA3AF',
  },
  form: {
    marginTop: 12,
    gap: 12,
  },
  dropdownWrapper: {
    marginTop: 4,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 14,
    color: '#1A1A2E',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownChevron: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1A1A2E',
  },
  menuList: {
    marginTop: 12,
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
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export default OwnerEditPersonalScreen;

