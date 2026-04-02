import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { supabase } from '../services/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, login } from '../store/userSlice';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import VenueIdentitySection from '../components/owner/VenueIdentitySection';
import PricingEngineSection from '../components/owner/PricingEngineSection';
import LocationSection from '../components/owner/LocationSection';
import MediaSection from '../components/owner/MediaSection';

const SPORT_OPTIONS = ['Padel', 'Cricket', 'Futsal']

const OwnerSetupScreen = ({ route, navigation }) => {
  const { phoneNumber, role } = route.params || {};

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const profileDetails = useSelector((state) => state.user.profileDetails);
  const existingProfileDetails = profileDetails || {};

  const [firstName,       setFirstName]       = useState('');
  const [lastName,        setLastName]        = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [courtName, setCourtName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');

  const [selectedSports, setSelectedSports] = useState(['Padel']);
  const [baseRate, setBaseRate] = useState('');
  const [weekdayMorning, setWeekdayMorning] = useState('');
  const [weekdayEvening, setWeekdayEvening] = useState('');
  const [weekendMorning, setWeekendMorning] = useState('');
  const [weekendEvening, setWeekendEvening] = useState('');
  const [features, setFeatures] = useState(['']);
  const [imageAssets, setImageAssets] = useState([]);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [pinAddress, setPinAddress] = useState('');

  const handleAddFeature = () => {
    setFeatures((prev) => [...prev, '']);
  };

  const handleChangeFeature = (value, index) => {
    setFeatures((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const uploadImages = async (assets, courtId) => {
    const urls = []
    for (const asset of assets) {
      // Skip already uploaded URLs
      if (typeof asset === 'string' && asset.startsWith('http')) {
        urls.push(asset)
        continue
      }
      try {
        const base64 = asset.base64
        const uri    = asset.uri
        if (!base64) continue

        const fileName = `courts/${courtId}/${Date.now()}.jpg`
        const decoded  = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

        const { error } = await supabase.storage
          .from('court-images')
          .upload(fileName, decoded, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (!error) {
          const { data: urlData } = supabase.storage
            .from('court-images')
            .getPublicUrl(fileName)
          urls.push(urlData.publicUrl)
        }
      } catch (e) {
        // error handled in storage logic
      }
    }
    return urls
  }

  const handleCompleteSetup = async () => {

    // Validation
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!firstName.trim()) {
      Alert.alert('Required', 'Please enter your first name.'); return
    }
    if (!lastName.trim()) {
      Alert.alert('Required', 'Please enter your last name.'); return
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.'); return
    }
    if (!courtName.trim()) {
      Alert.alert('Required', 'Please enter court name.'); return
    }
    if (!email.trim() || !emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.'); return
    }
    if (!selectedArea) {
      Alert.alert('Required', 'Please select your area.'); return
    }
    if (!specificAddress.trim()) {
      Alert.alert('Required', 'Please enter specific address.'); return
    }
    if (!baseRate.trim() || isNaN(Number(baseRate.replace(/,/g, '')))) {
      Alert.alert('Invalid Rate', 'Please enter a valid base rate.'); return
    }

    setLoading(true)

    try {
      // Get current auth user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        Alert.alert('Session Error', 'Please log in again.')
        setLoading(false)
        return
      }

    // Step 1: Save profile to Supabase FIRST
    const profilePayload = {
      role:       'Owner',
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      venue_name: courtName.trim(),
      email:      email.trim().toLowerCase(),
      phone:      user.phone || null,
      area:       selectedArea,
      address:    specificAddress.trim(),
      lat:        lat || null,
      lng:        lng || null,
      pricing: {
        baseRate,
        weekdayMorning,
        weekdayEvening,
        weekendMorning,
        weekendEvening,
      },
    }

    const result = await dispatch(updateProfile(profilePayload))

    if (!updateProfile.fulfilled.match(result)) {
      Alert.alert('Error', result.payload || 'Could not save profile.')
      setLoading(false)
      return
    }

    // Step 2: Insert court
    const { data: courtData, error: courtError } = await supabase
      .from('courts')
      .insert({
        owner_id:   user.id,
        name:       courtName.trim(),
        area:       selectedArea,
        address:    specificAddress.trim(),
        lat:        lat || null,
        lng:        lng || null,
        sport: selectedSports,           // array of selected sports e.g. ['Padel', 'Futsal']
        primary_sport: selectedSports[0] || 'Padel',
        price_base: parseInt(baseRate.replace(/,/g, '')) || 0,
        pricing: {
          baseRate,
          weekdayMorning,
          weekdayEvening,
          weekendMorning,
          weekendEvening,
        },
        amenities:  features.filter(f => f.trim()),
        is_active:  true,
      })
      .select()
      .single()


    // Step 3: DISPATCH LOGIN IMMEDIATELY — navigate to Owner dashboard NOW
    // Do this BEFORE image upload and auth update so user doesn't wait
    dispatch(login({
      role: 'Owner',
      profileDetails: {
        ...result.payload,
        venueName:  courtName.trim(),
        venue_name: courtName.trim(),
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        pricing:    profilePayload.pricing,
        features,
        courtId:    courtData?.id || null,
      },
    }))

    // Step 4: Upload images in background AFTER navigation
    // User is already on dashboard while this happens
    if (courtData?.id && imageAssets.length > 0) {
      uploadImages(imageAssets, courtData.id)
        .then(async (imageUrls) => {
          if (imageUrls.length > 0) {
            await supabase
              .from('courts')
              .update({ images: imageUrls })
              .eq('id', courtData.id)
          }
        })
    }

    // Step 5: Update password in background AFTER navigation
    if (password) {
      supabase.auth.updateUser({
        password: password.trim(),
      })
      .then(({ error }) => {
        if (error) {
          // background error
        }
      })
    }

    // Navigation already handled by dispatch(login()) above
    // AppNavigator sees role='Owner' + venue_name → routes to OwnerTabNavigator

  } catch (e) {
    Alert.alert('Error', 'Something went wrong: ' + e.message)
    setLoading(false)
  }

  setLoading(false)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerBrand}>TurfTap</Text>
          </View>
          <Text style={styles.headerTitle}>Register Your Venue</Text>

          <VenueIdentitySection
            courtName={courtName}         setCourtName={setCourtName}
            email={email}                 setEmail={setEmail}
            firstName={firstName}         setFirstName={setFirstName}
            lastName={lastName}           setLastName={setLastName}
            password={password}           setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
          />

          <LocationSection
            selectedArea={selectedArea}       setSelectedArea={setSelectedArea}
            specificAddress={specificAddress} setSpecificAddress={setSpecificAddress}
            lat={lat}   setLat={setLat}
            lng={lng}   setLng={setLng}
            pinAddress={pinAddress}           setPinAddress={setPinAddress}
          />

          <PricingEngineSection
            baseRate={baseRate}               setBaseRate={setBaseRate}
            weekdayMorning={weekdayMorning}   setWeekdayMorning={setWeekdayMorning}
            weekdayEvening={weekdayEvening}   setWeekdayEvening={setWeekdayEvening}
            weekendMorning={weekendMorning}   setWeekendMorning={setWeekendMorning}
            weekendEvening={weekendEvening}   setWeekendEvening={setWeekendEvening}
            selectedSports={selectedSports}   setSelectedSports={setSelectedSports}
          />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionIcon}>⭐</Text>
            <Text style={styles.sectionTitle}>Additional Features</Text>
          </View>
          <View style={styles.sectionBody}>
            <Text style={styles.mutedLabel}>Feature 1:</Text>
            {features.map((feat, index) => (
              <View
                key={index}
                style={index > 0 ? styles.featureSpacing : undefined}
              >
                <InputField
                  placeholder="e.g. Cafeteria"
                  value={feat}
                  onChangeText={(value) => handleChangeFeature(value, index)}
                />
              </View>
            ))}
            <TouchableOpacity
              style={styles.addMoreButton}
              activeOpacity={0.8}
              onPress={handleAddFeature}
            >
              <Text style={styles.addMoreText}>Add More</Text>
              <Text style={styles.addMorePlus}>+</Text>
            </TouchableOpacity>
          </View>

          <MediaSection
            imageAssets={imageAssets}
            setImageAssets={setImageAssets}
          />

        </ScrollView>

        <View style={styles.bottomBar}>
          <PrimaryButton
            title={loading ? 'Setting up...' : 'Complete Setup'}
            onPress={handleCompleteSetup}
            disabled={loading}
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
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#1A1A2E',
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  sectionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionBody: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  requiredLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginBottom: 2,
  },
  requiredMark: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
  },
  areaPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  areaPickerText: {
    fontSize: 14,
    color: '#1A1A2E',
  },
  areaPickerPlaceholder: {
    color: '#6B7280',
  },
  areaChevron: {
    fontSize: 12,
    color: '#6B7280',
  },
  areaDropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  areaOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  areaOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  areaOptionText: {
    fontSize: 14,
    color: '#1A1A2E',
  },
  areaOptionTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  mapButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 8,
  },
  mapButtonIcon: {
    fontSize: 16,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  sportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  sportChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  sportChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sportChipText:       { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  sportChipTextActive: { color: '#FFFFFF' },

  subSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 12,
    marginBottom: 4,
  },
  rowGap: {
    flexDirection: 'row',
    columnGap: 12,
  },
  flexItem: {
    flex: 1,
  },
  mutedLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  addMoreButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    columnGap: 6,
  },
  addMoreText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  addMorePlus: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
  },
  mediaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  mediaCountText: {
    fontSize: 11,
    color: '#6B7280',
  },
  mediaRow: {
    flexDirection: 'row',
    marginTop: 8,
    columnGap: 12,
  },
  mediaBoxMain: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaMainIcon: {
    fontSize: 18,
    color: '#2563EB',
    marginBottom: 4,
  },
  mediaMainLabel: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
  mediaBoxSecondary: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaAddIcon: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  mediaAddLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  mediaHintText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  featureSpacing: {
    marginTop: 12,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export default OwnerSetupScreen;

