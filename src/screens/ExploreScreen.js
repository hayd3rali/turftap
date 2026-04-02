import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AreaPickerModal from '../components/AreaPickerModal';
import { useGetCourtsQuery } from '../api/courtsService';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');
const IMAGE_H = 267;

/* ─────── SPORT CHIPS ─────── */
const SPORTS = ['All', 'Padel', 'Cricket', 'Futsal'];


/* ─── animated card ─── */
const AnimatedCard = ({ children, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 420, delay: index * 90, useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0, duration: 420, delay: index * 90, useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

/* ═══════════════════════════════════ */
/*              SCREEN                 */
/* ═══════════════════════════════════ */
const ExploreScreen = () => {
  const nav = useNavigation();
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedArea, setSelectedArea] = useState('');
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { data: allCourts = [], isLoading, isError, refetch } = useGetCourtsQuery('');

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !allCourts.length) return []
    const q = searchQuery.toLowerCase()
    return allCourts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q) ||
      c.sport?.some(s => s.toLowerCase().includes(q))
    ).slice(0, 5)
  }, [searchQuery, allCourts])

  const filtered = useMemo(() => {
    return allCourts.filter(court => {
      // Sport filter
      const sportMatch =
        selectedSport === 'All' ||
        (Array.isArray(court.sport) && court.sport.some(s => s.toLowerCase() === selectedSport.toLowerCase()))

      // Area filter
      const areaMatch =
        !selectedArea ||
        court.area?.toLowerCase().includes(selectedArea.toLowerCase())

      // Search filter
      const searchMatch =
        !searchQuery.trim() ||
        court.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(court.sport) && court.sport.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))

      return sportMatch && areaMatch && searchMatch
    })
  }, [allCourts, selectedSport, selectedArea, searchQuery])

  const goDetail = (court) =>
    nav.navigate('CourtDetail', {
      court: {
        ...court,
        lat: court.lat || null,
        lng: court.lng || null,
        address: court.address || court.area || '',
      },
    });

  /* ── render card ── */
  const renderCard = ({ item, index }) => {
    const priceStr = `Rs. ${item.price_base?.toLocaleString() || '0'}/hr`;
    const imageUri = item.images?.[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80';
    const tagStr = (item.sport || []).join(' • ').toUpperCase() || 'SPORTS';
    const amens = (item.amenities || []).slice(0, 4);

    return (
      <AnimatedCard index={index}>
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.95}
          onPress={() => goDetail(item)}
        >
          {/* ═══ TOP: IMAGE AREA ═══ */}
          <View style={s.imageArea}>
            <Image source={{ uri: imageUri }} style={s.image} />

            {/* Top-left badge */}
            <View style={s.topBadge}>
              <Text style={s.topBadgeText}>INSTANT BOOKING</Text>
            </View>

            {/* Top-right price */}
            <View style={s.priceTag}>
              <Text style={s.priceTagText}>{priceStr}</Text>
            </View>

            {/* Glass overlay at bottom of image */}
            <View style={s.glassOverlay}>
              <View style={s.glassLeft}>
                <Text style={s.courtName}>{item.name}</Text>
                <View style={s.ratingTags}>
                  <View style={s.ratingPill}>
                    <Text style={s.starIcon}>⭐</Text>
                    <Text style={s.ratingNum}>{item.rating || 4.5}</Text>
                  </View>
                  <Text style={s.tagsText}>{tagStr}</Text>
                </View>
              </View>
              <TouchableOpacity style={s.heartBtn} activeOpacity={0.8}>
                <Text style={s.heartIcon}>♡</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ═══ BOTTOM: INFO & BOOKING ═══ */}
          <View style={s.bottomSection}>
            {/* Facilities row */}
            <View style={s.facilitiesRow}>
              {amens.map((a, i) => (
                <View key={i} style={s.facilityItem}>
                  <Text style={s.facilityIcon}>✓</Text>
                  <Text style={s.facilityLabel}>{a}</Text>
                </View>
              ))}
            </View>

            {/* Availability + Book Now */}
            <View style={s.actionRow}>
              <View>
                <Text style={s.availLabel}>AVAILABILITY</Text>
                <Text style={s.availTime}>
                  Available
                  <Text style={s.availToday}> Today</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={s.bookBtn}
                activeOpacity={0.85}
                onPress={() => goDetail(item)}
              >
                <Text style={s.bookBtnText}>BOOK NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ═══ HEADER ═══ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.hdrCircle}>
          <Text style={s.hdrArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.hdrTitle}>Court Search</Text>
        <TouchableOpacity style={s.hdrCircle}>
          <Text style={s.hdrSearch}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* ═══ SEARCH BAR ═══ */}
      <View style={s.searchWrapper}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            placeholder="Search courts, areas, sports..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('')
              setSearchSuggestions([])
            }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete dropdown */}
        {searchFocused && searchSuggestions.length > 0 && (
          <View style={s.suggestionsBox}>
            {searchSuggestions.map(court => (
              <TouchableOpacity
                key={court.id}
                style={s.suggestionRow}
                onPress={() => {
                  nav.navigate('CourtDetail', { court })
                  setSearchQuery('')
                  setSearchFocused(false)
                }}
              >
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={s.suggestionName}>{court.name}</Text>
                  <Text style={s.suggestionArea}>{court.area}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ═══ FILTER CHIPS ═══ */}
      <View style={s.chipsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsContent}
        >
          {SPORTS.map((sport) => {
            const isActive = sport === selectedSport;
            return (
              <TouchableOpacity
                key={sport}
                activeOpacity={0.85}
                onPress={() => setSelectedSport(sport)}
                style={[s.chip, isActive ? s.chipActive : s.chipInactive]}
              >
                <Text style={[s.chipText, isActive ? s.chipTextActive : s.chipTextInactive]}>
                  {sport}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ═══ AREA FILTER ═══ */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          style={s.areaFilterBtn}
          onPress={() => setAreaModalVisible(true)}
        >
          <Text style={s.areaFilterIcon}>📍</Text>
          <Text style={s.areaFilterText}>
            {selectedArea || 'All Areas'}
          </Text>
          <Text style={s.areaChevron}>▼</Text>
          {selectedArea ? (
            <TouchableOpacity onPress={() => setSelectedArea('')}>
              <Text style={s.clearArea}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </View>

      <AreaPickerModal
        visible={areaModalVisible}
        onClose={() => setAreaModalVisible(false)}
        onSelect={(area) => setSelectedArea(area)}
        selectedArea={selectedArea}
      />

      {/* ═══ STATES ═══ */}
      {isLoading && (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={s.loadingText}>Finding courts...</Text>
        </View>
      )}

      {isError && (
        <View style={s.centered}>
          <Text style={s.errorText}>Could not load courts.</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={s.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ═══ CARD LIST ═══ */}
      {!isLoading && !isError && (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderCard}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>No courts found matching criteria.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

/* ═══════════════════════════════════ */
/*              STYLES                 */
/* ═══════════════════════════════════ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F6F8' },

  /* ── header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  hdrCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hdrArrow: { fontSize: 25, color: '#1A1A2E' },
  hdrTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.45,
    textAlign: 'center',
  },
  hdrSearch: { fontSize: 18 },

  /* ── chips ── */
  chipsBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 12,
  },
  chipActive: {
    backgroundColor: '#2563EB',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 91, 255, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  chipInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipEmoji: { fontSize: 15 },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: { color: '#FFFFFF' },
  chipTextInactive: { color: '#334155' },

  /* ── card list ── */
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
    gap: 24,
  },

  /* ── card ── */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },

  /* ── image area ── */
  imageArea: {
    position: 'relative',
    height: IMAGE_H,
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  /* top-left badge */
  topBadge: {
    position: 'absolute',
    top: 11,
    left: 16,
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  topBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  /* top-right price */
  priceTag: {
    position: 'absolute',
    top: 11,
    right: 16,
    backgroundColor: '#CCFF00',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(204, 255, 0, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  priceTagText: {
    color: '#1A1A2E',
    fontWeight: '900',
    fontSize: 14,
  },

  /* glass overlay */
  glassOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    // Note: backdropFilter blur not supported natively in RN views
    // Using solid rgba overlay as closest approximation
  },
  glassLeft: {
    flex: 1,
    gap: 4,
  },
  courtName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  ratingTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 0,
  },
  starIcon: {
    fontSize: 10,
  },
  ratingNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CCFF00',
    marginLeft: 2,
  },
  tagsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heartBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: { fontSize: 20, color: '#FFFFFF' },

  /* ── bottom section ── */
  bottomSection: {
    padding: 20,
    gap: 20,
    backgroundColor: '#FFFFFF',
  },

  /* facilities */
  facilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  facilityItem: {
    alignItems: 'center',
    gap: 4,
  },
  facilityIcon: { fontSize: 16 },
  facilityLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: -0.45,
    textTransform: 'uppercase',
  },

  /* action row */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  availTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  availToday: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  bookBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 91, 255, 0.3)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },

  /* empty */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },

  /* ── area filter ── */
  areaFilterBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#F9FAFB', alignSelf: 'flex-start',
  },
  areaFilterIcon: { fontSize: 14, marginRight: 6 },
  areaFilterText: { fontSize: 13, color: '#1A1A2E', fontWeight: '600' },
  areaChevron: { fontSize: 10, color: '#9CA3AF', marginLeft: 6 },
  clearArea: { fontSize: 12, color: '#EF4444', marginLeft: 8 },

  searchWrapper: { marginHorizontal: 16, marginTop: 12, zIndex: 100 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A2E' },
  suggestionsBox: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    marginTop: 4, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  suggestionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  suggestionName: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  suggestionArea: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});

export default ExploreScreen;
