import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useGetSlotsQuery } from '../api/slotsService';
import { format } from 'date-fns';
import { useCallback } from 'react';

import PrimaryButton from '../components/PrimaryButton';

import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_SLOTS = 4;

const AMENITY_ICONS = {
  'Cafeteria': <Ionicons name="cafe-outline" size={20} color="#2563EB" />,
  'Parking': <MaterialIcons name="local-parking" size={20} color="#2563EB" />,
  'Showers': <Ionicons name="water-outline" size={20} color="#2563EB" />,
  'WiFi': <Ionicons name="wifi-outline" size={20} color="#2563EB" />,
  'Changing Room': <Ionicons name="shirt-outline" size={20} color="#2563EB" />,
  'Pro Shop': <Ionicons name="bag-outline" size={20} color="#2563EB" />,
  'Valet Parking': <MaterialIcons name="local-parking" size={20} color="#2563EB" />,
  'Luxury Showers': <Ionicons name="water-outline" size={20} color="#2563EB" />,
  'Free High-Speed': <Ionicons name="wifi-outline" size={20} color="#2563EB" />,
}

// Generate 5 days from today for date picker
const dates = Array.from({ length: 5 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return d
})

// Slot status helper:
const getSlotStatus = (slot) => {
  if (slot.is_blocked) return 'blocked'
  if (slot.is_booked)  return 'booked'   // simple boolean check from DB function
  return 'available'
}

// Format time helper:
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 || 12
  return `${displayH}:${minutes} ${ampm}`
}



/* ───────────── screen ───────────── */
// TODO: replace with real court object from /api/v1/courts/:id
const CourtDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const court = route.params?.court || {};

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const MAX_SLOTS = 4;

  const handleSlotPress = (slot) => {
    const status = getSlotStatus(slot)
    if (status !== 'available') {
      Alert.alert(
        'Unavailable',
        status === 'booked' ? 'This slot is already booked.' : 'This slot is blocked.'
      )
      return
    }
    const isSelected = selectedSlots.find(s => s.id === slot.id)
    if (isSelected) {
      setSelectedSlots(prev => prev.filter(s => s.id !== slot.id))
    } else {
      if (selectedSlots.length >= MAX_SLOTS) {
        Alert.alert('Limit Reached', `You can select up to ${MAX_SLOTS} slots at a time.`)
        return
      }
      setSelectedSlots(prev => [...prev, slot])
    }
  }

  // Format date for Supabase query
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const {
    data: slots = [],
    isLoading: slotsLoading,
    refetch: refetchSlots,
  } = useGetSlotsQuery(
    { courtId: court?.id, date: formattedDate },
    {
      skip: !court?.id,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );

  // Refetch slots every time screen comes into focus:
  useFocusEffect(
    useCallback(() => {
      if (court?.id && formattedDate) {
        refetchSlots()
        // Also clear selected slots when returning to screen
        setSelectedSlots([])
      }
    }, [court?.id, formattedDate, refetchSlots])
  )

  const currentMonth = format(selectedDate, 'MMMM');
  const currentYear = format(selectedDate, 'yyyy');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HERO IMAGE ─── */}
        <View style={styles.heroWrapper}>
          <Image
            source={{
              uri:
                court.images?.[0] ||
                'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
            }}
            style={styles.heroImage}
          />

          {/* Back */}
          <TouchableOpacity
            style={[styles.circleBtn, styles.backBtn]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
          </TouchableOpacity>

          {/* Heart */}
          <TouchableOpacity style={[styles.circleBtn, styles.heartBtn]}>
            <Ionicons name="heart-outline" size={22} color="#1A1A2E" />
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={[styles.circleBtn, styles.shareBtn]}>
            <Ionicons name="share-outline" size={22} color="#1A1A2E" />
          </TouchableOpacity>
        </View>

        {/* ─── BODY ─── */}
        <View style={styles.body}>
          {/* Badge */}
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PREMIUM FACILITY</Text>
          </View>

          {/* Title */}
          <Text style={styles.courtTitle}>{court.name || 'Elite Padel Center'}</Text>

          {/* Info row */}
          <View style={styles.infoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.infoText}>
                {court.rating || '4.9'} ({court.reviews || '1.2k'} reviews)
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.infoLocation}>{court.address || court.area || 'Downtown Sports District'}</Text>
            </View>
          </View>

          {/* Gallery */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.galleryScroll}
            contentContainerStyle={styles.galleryContent}
          >
            {(court.images || []).length > 0 ? (
              court.images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
              ))
            ) : (
              // show placeholder if no images
              <View style={styles.galleryPlaceholder} />
            )}
          </ScrollView>

          {/* Amenities */}
          <Text style={styles.sectionHeader}>Premium Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {(court.amenities || []).map((amenity, index) => (
              <View key={index} style={styles.amenityTile}>
                <View style={styles.amenityIcon}>
                  {AMENITY_ICONS[amenity] || <Ionicons name="checkmark-circle-outline" size={20} color="#2563EB" />}
                </View>
                <Text style={styles.amenityLabel}>{amenity}</Text>
              </View>
            ))}
          </View>

          {/* Date picker */}
          <Text style={styles.sectionHeader}>Select Date & Time</Text>
          <View style={[styles.monthRow, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            <Text style={styles.monthText}>
              {currentMonth} {currentYear}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroll}
            contentContainerStyle={styles.dateContent}
          >
            {dates.map((d, i) => {
              const isSelected = format(d, 'yyyy-MM-dd') === formattedDate;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.datePill,
                    isSelected ? styles.datePillSelected : styles.datePillDefault,
                  ]}
                  onPress={() => {
                    setSelectedDate(d);
                    setSelectedSlots([]); // clear slot on date change
                  }}
                >
                  <Text
                    style={[
                      styles.dateDayText,
                      isSelected && styles.dateDayTextSelected,
                    ]}
                  >
                    {format(d, 'EEE').toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumText,
                      isSelected && styles.dateNumTextSelected,
                    ]}
                  >
                    {format(d, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time slots grid */}
          {slotsLoading ? (
            <ActivityIndicator color="#2563EB" style={{ marginTop: 16 }} />
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const status     = getSlotStatus(slot)
                const isSelected = selectedSlots.some(s => s.id === slot.id)
                const isDisabled = status === 'booked' || status === 'blocked'

                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={isDisabled}
                    activeOpacity={isDisabled ? 1 : 0.7}
                    onPress={() => {
                      if (status === 'available') handleSlotPress(slot)
                    }}
                    style={[
                      styles.slotTile,
                      isDisabled   && styles.slotDisabled,
                      isSelected   && styles.selectedChip,
                    ]}
                  >
                    <Text style={[
                      styles.slotTimeText,
                      isDisabled && { color: '#9CA3AF' },
                      isSelected && { color: '#2563EB' },
                    ]}>
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </Text>
                    <Text style={[
                      styles.slotPriceText,
                      isDisabled && { color: '#9CA3AF' },
                      isSelected && { color: '#2563EB' },
                    ]}>
                      {isDisabled
                        ? status === 'booked' ? 'Booked' : 'Blocked'
                        : `Rs. ${(court?.price_base || 0).toLocaleString()}`
                      }
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          {/* Map preview */}
          {court?.lat && court?.lng ? (
            <View style={styles.mapContainer}>
              <Text style={styles.sectionHeader}>Court Location</Text>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                mapType="standard"
                scrollEnabled={false}        // disable scroll inside detail screen
                zoomEnabled={true}
                initialRegion={{
                  latitude: court.lat,
                  longitude: court.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: court.lat,
                    longitude: court.lng,
                  }}
                  title={court.name}
                  description={court.address || court.area}
                />
              </MapView>
              <TouchableOpacity
                style={styles.directionsBtn}
                onPress={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`
                  Linking.openURL(url).catch(() =>
                    Alert.alert('Error', 'Could not open maps.')
                  )
                }}
              >
                <Ionicons name="location-outline" size={16} color="#2563EB" />
                <Text style={styles.directionsBtnText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Fallback if no location set
            <View style={styles.mapPlaceholder}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                <Text style={styles.mapPlaceholderText}>Location not set by owner</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ─── RESERVE TRAY (Figma node 1-1182, above navbar) ─── */}
      {selectedSlots.length > 0 && (
        <View style={styles.reserveTrayContainer} pointerEvents="box-none">
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
            style={styles.reserveTrayGradient}
            pointerEvents="none"
          />
          <View style={styles.reserveTray}>
            <View>
              <Text style={styles.reservePrice}>
                Rs. {((court.price_base || 0) * selectedSlots.length).toLocaleString()}
              </Text>
              <Text style={styles.reserveSlotCount}>
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </Text>
            </View>
            <TouchableOpacity
              style={styles.reserveBtn}
              onPress={() => {
                // Guard: ensure slots are selected
                if (!selectedSlots || selectedSlots.length === 0) {
                  Alert.alert('No Slot Selected', 'Please select at least one time slot.')
                  return
                }

                // Guard: ensure all slots have required data
                const validSlots = selectedSlots.filter(s => s?.id && s?.start_time && s?.end_time)
                if (validSlots.length === 0) {
                  Alert.alert('Invalid Selection', 'Selected slots are invalid. Please try again.')
                  return
                }

                navigation.navigate('Checkout', {
                  court,
                  selectedSlots: validSlots,
                  selectedSlot: validSlots[0],   // keep for backward compat
                  selectedDate: formattedDate,
                  totalAmount: (court.price_base || 0) * validSlots.length,
                })
              }}
            >
              <Text style={styles.reserveBtnText}>Reserve Now →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── BOTTOM NAVBAR (always visible) ─── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerTabs', { screen: 'Home' })}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerTabs', { screen: 'Explore' })}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerTabs', { screen: 'Bookings' })}>
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navLabel}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerTabs', { screen: 'Profile' })}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/* ─── styles ─── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },

  /* hero */
  heroWrapper: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  circleBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'start',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,

  },
  backBtn: {
    top: Platform.OS === 'android' ? 50 : 12,
    left: 20,

  },
  heartBtn: {
    top: Platform.OS === 'android' ? 40 : 12,
    right: 60,
    display: 'none'
  },

  shareBtn: {
    top: Platform.OS === 'android' ? 40 : 12,
    right: 20,
    display: 'none'
  },

  /* body */
  body: {
    paddingHorizontal: 20,
  },

  /* premium badge */
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 16,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },

  /* title */
  courtTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1A1A2E',
    marginTop: 8,
  },

  /* info */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoLocation: {
    fontSize: 13,
    color: '#6B7280',
  },

  /* gallery */
  galleryScroll: {
    marginTop: 16,
    marginHorizontal: -20, // offset body padding to allow edge-to-edge scroll
  },
  galleryContent: {
    gap: 12,
    paddingHorizontal: 20, // add padding back to content for first/last items
  },
  galleryImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  galleryPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },

  /* section header */
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 24,
    marginBottom: 12,
  },

  /* amenities */
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityTile: {
    width: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  amenityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'center',
  },

  /* date picker */
  monthRow: {
    marginBottom: 10,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  dateScroll: {
    flexGrow: 0,
  },
  dateContent: {
    gap: 10,
  },
  datePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 56,
  },
  datePillSelected: {
    backgroundColor: '#2563EB',
  },
  datePillDefault: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateDayTextSelected: {
    color: '#FFFFFF',
  },
  dateNumText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  dateNumTextSelected: {
    color: '#FFFFFF',
  },

  /* time slots */
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  slotTile: {
    width: (SCREEN_WIDTH - 48) / 2,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  slotSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  slotBooked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  slotBlocked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.4,
  },
  selectedChip: {
    backgroundColor: '#EFF6FF',
    borderColor:     '#2563EB',
    borderWidth:     2,
  },
  slotDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor:     '#E5E7EB',
    opacity:         0.55,
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  slotTimeSelected: {
    color: '#2563EB',
  },
  slotTimeBooked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  slotTimeBlocked: {
    color: '#EF4444',
  },
  slotPriceText: {
    fontSize: 12,
    color: '#6B7280',
  },
  slotPriceSelected: {
    color: '#2563EB',
  },
  slotPriceBooked: {
    color: '#9CA3AF',
  },

  /* map */
  mapContainer: {
    marginHorizontal: 8,
    marginTop: 24,
    marginBottom: 8,
  },
  map: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  directionsBtn: {
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  directionsBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 14,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  mapText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  /* reserve tray — matching image */
  reserveTrayContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 75,
    left: 0,
    right: 0,
    height: 120, // tall enough for gradient
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  reserveTrayGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  reserveTray: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#005BFF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  trayLeft: {
    justifyContent: 'center',
    gap: 2,
  },
  trayLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trayPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  trayPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A2E',
  },
  trayTax: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
  trayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  trayBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trayBtnArrow: {
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: -2,
  },

  reservePrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A2E',
  },
  reserveSlotCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reserveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reserveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  /* bottom navbar */
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  navLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default CourtDetailScreen;
