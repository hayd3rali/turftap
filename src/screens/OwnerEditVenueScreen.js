import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { supabase } from '../services/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
const SPORT_OPTIONS = ['Padel', 'Cricket', 'Futsal']

const OwnerEditVenueScreen = ({ navigation }) => {
  const { profile, profileDetails } = useSelector(state => state.user);

  const [court, setCourt] = useState(null);
  const [courtName, setCourtName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [pinAddress, setPinAddress] = useState('');
  const [selectedSports, setSelectedSports] = useState([]);
  const [imageAssets, setImageAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch court directly from Supabase on mount
  useEffect(() => {
    const fetchCourt = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      if (data) {
        setCourt(data);
        setCourtName(data.name || '');
        setEmail(profileDetails?.email || profile?.email || '');
        setSelectedArea(data.area || '');
        setImageAssets(data.images || []);
        setLat(data.lat || null);
        setLng(data.lng || null);
        setPinAddress(data.address || '');
        setSelectedSports(
          Array.isArray(data.sport) && data.sport.length > 0
            ? data.sport
            : ['Padel']
        );
      }
    };
    fetchCourt();
  }, [profile?.email]);

  // Image picker handler:
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      setImageAssets((prev) => [...prev, ...result.assets].slice(0, 6));
    }
  };

  // Upload images helper:
  const uploadImages = async (assets, courtId) => {
    const urls = [];
    for (const asset of assets) {
      // Skip already uploaded URLs
      if (typeof asset === 'string' && asset.startsWith('http')) {
        urls.push(asset);
        continue;
      }
      try {
        const base64 = asset.base64;
        const uri    = asset.uri;
        if (!base64) continue;

        const fileName = `courts/${courtId}/${Date.now()}.jpg`;
        const decoded  = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        const { error } = await supabase.storage
          .from('court-images')
          .upload(fileName, decoded, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!error) {
          const { data: urlData } = supabase.storage
            .from('court-images')
            .getPublicUrl(fileName);
          urls.push(urlData.publicUrl);
          console.log('Image uploaded:', urlData.publicUrl);
        } else {
          console.log('Upload error:', error.message);
        }
      } catch (e) {
        console.log('Upload exception:', e.message);
      }
    }
    return urls;
  };

  // Save handler:
  const handleSaveChanges = async () => {
    if (!court?.id) {
      Alert.alert('Error', 'Court not found.');
      return;
    }
    setLoading(true);
    try {
      // Upload any new images
      const imageUrls = await uploadImages(imageAssets, court.id);

      const { error } = await supabase
        .from('courts')
        .update({
          name:         courtName.trim(),
          area:         selectedArea,
          address:      pinAddress || court.address,
          lat:          lat || court.lat,
          lng:          lng || court.lng,
          images:       imageUrls,
          sport:        selectedSports,           // ← add this
          primary_sport: selectedSports[0] || 'Padel', // ← add this
        })
        .eq('id', court.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Saved ✓', 'Venue details updated successfully.');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
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
          <Text style={styles.headerTitle}>EDIT VENUE</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* General Information */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>📋</Text>
          <Text style={styles.sectionLabel}>GENERAL INFORMATION</Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="COURT NAME"
            placeholder="Legends Arena - Pitch 1"
            value={courtName}
            onChangeText={setCourtName}
          />
          <InputField
            label="CONTACT EMAIL"
            placeholder="management@legendsarena.pk"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.form}>
          <Text style={styles.dropdownLabel}>Sports Offered (select all that apply)</Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
            Select every sport your court supports
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {SPORT_OPTIONS.map(sport => {
              const isSelected = selectedSports.includes(sport)
              return (
                <TouchableOpacity
                  key={sport}
                  onPress={() => {
                    if (isSelected) {
                      // Deselect — but keep at least 1 selected
                      if (selectedSports.length > 1) {
                        setSelectedSports(prev => prev.filter(s => s !== sport))
                      }
                    } else {
                      setSelectedSports(prev => [...prev, sport])
                    }
                  }}
                  style={{
                    borderWidth: 2,
                    borderColor: isSelected ? '#2563EB' : '#E5E7EB',
                    borderRadius: 999,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: isSelected ? '#EFF6FF' : '#F9FAFB',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
                  )}
                  <Text style={{
                    color: isSelected ? '#2563EB' : '#6B7280',
                    fontWeight: isSelected ? '700' : '400',
                    fontSize: 14,
                  }}>
                    {sport}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Area / Location */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>📍</Text>
          <Text style={styles.sectionLabel}>AREA / LOCATION</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>Area / Location</Text>
            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.8}
              onPress={() => setAreaModalVisible(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedArea && styles.dropdownPlaceholder,
                ]}
              >
                {selectedArea || 'Select area'}
              </Text>
              <Text style={styles.dropdownChevron}>▼</Text>
            </TouchableOpacity>

            <AreaPickerModal
              visible={areaModalVisible}
              onClose={() => setAreaModalVisible(false)}
              onSelect={(val) => setSelectedArea(val)}
              selectedArea={selectedArea}
            />
          </View>
        </View>

        {/* Pin Location */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>📍</Text>
          <Text style={styles.sectionLabel}>PIN LOCATION</Text>
        </View>
        <View style={styles.mapContainer}>
          <TouchableOpacity
            style={styles.changeLocationButton}
            activeOpacity={0.85}
            onPress={() => setMapVisible(true)}
          >
            <View style={styles.changeLocationContent}>
              <Text style={styles.changeLocationIcon}>📍</Text>
              <Text style={styles.changeLocationText}>
                CHANGE LOCATION ON MAP
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {pinAddress ? (
          <Text style={{ fontSize: 12, color: '#2563EB', marginHorizontal: 20, marginTop: 6 }}>
            📍 {pinAddress}
          </Text>
        ) : null}

        <MapLocationPicker
          visible={mapVisible}
          onClose={() => setMapVisible(false)}
          initialLat={lat}
          initialLng={lng}
          onConfirm={({ lat: l, lng: g, address: a }) => {
            setLat(l)
            setLng(g)
            setPinAddress(a)
            setMapVisible(false)
          }}
        />

        {/* Court Photos */}
        <View style={styles.photosHeaderRow}>
          <Text style={styles.photosLabel}>COURT PHOTOS (MAX 6)</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={handlePickImage}>
            <View style={styles.addMoreRow}>
              <Text style={styles.addMoreIcon}>⊕</Text>
              <Text style={styles.addMoreText}>ADD MORE</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal style={{ marginTop: 8 }} showsHorizontalScrollIndicator={false}>
          {imageAssets.map((asset, index) => (
            <View key={index} style={{ marginRight: 8, marginTop: 8 }}>
              <Image
                source={{ uri: asset.uri || asset }}
                style={styles.photoBox}
              />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setImageAssets(prev => prev.filter((_, i) => i !== index))}
              >
                <Text style={{ color: 'white', fontSize: 10 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {imageAssets.length < 6 && (
            <TouchableOpacity
              style={styles.addPhotoBox}
              onPress={handlePickImage}
            >
              <Text style={{ fontSize: 24, color: '#9CA3AF' }}>+</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </ScrollView>

      {/* Sticky bottom */}
      <View style={styles.stickyBar}>
        <PrimaryButton 
          title={loading ? 'Saving...' : 'SAVE CHANGES'} 
          onPress={handleSaveChanges} 
          disabled={loading} 
        />
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  sectionIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#2563EB',
  },
  sectionLabel: {
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
  mapContainer: {
    marginTop: 8,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeLocationButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  changeLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeLocationIcon: {
    fontSize: 14,
    color: '#1A1A2E',
  },
  changeLocationText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  photosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  photosLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  addMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoreIcon: {
    fontSize: 14,
    color: '#2563EB',
    marginRight: 4,
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  photosScroll: {
    marginTop: 12,
  },
  photoMainBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  photoMainIcon: {
    fontSize: 24,
    color: '#2563EB',
  },
  photoSecondaryBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  photoPlus: {
    fontSize: 20,
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
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 8,
  },
});

export default OwnerEditVenueScreen;

