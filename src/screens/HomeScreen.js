import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useGetCourtsQuery } from '../api/courtsService';
import CourtCard from '../components/CourtCard';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');
const PROMO_CARD_W = 288;
const PROMO_CARD_H = 160;

const AREAS = ['All', 'Gulshan', 'DHA', 'Johar', 'Clifton', 'North Nazimabad', 'Saddar'];

const PROMOS = [
  {
    id: '1',
    title: '30% OFF\nON JAZZCASH',
    subtitle: 'CODE: JAZZ30',
    cta: 'Book Now',
    bg: '#0F172A',
    ctaBg: '#CCFF00',
    ctaColor: '#0F172A',
  },
  {
    id: '2',
    title: 'WEEKEND\nWARRIORS',
    subtitle: 'Double Points',
    cta: 'Join Event',
    bg: '#0059FF',
    ctaBg: '#FFFFFF',
    ctaColor: '#0059FF',
  },
  {
    id: '3',
    title: 'NEW COURTS\nAVAILABLE',
    subtitle: 'DHA Phase 6',
    cta: 'Explore',
    bg: '#0F172A',
    ctaBg: '#CCFF00',
    ctaColor: '#0F172A',
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { profileDetails, profile } = useSelector((state) => state.user);

  const [activeZone, setActiveZone] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { data: courts = [], isLoading, isError, refetch } = useGetCourtsQuery(activeZone);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !courts.length) return []
    const q = searchQuery.toLowerCase()
    return courts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q) ||
      c.sport?.some(s => s.toLowerCase().includes(q))
    ).slice(0, 5)
  }, [searchQuery, courts])

  const filteredCourts = useMemo(() => {
    if (!searchQuery.trim()) return courts;
    const q = searchQuery.toLowerCase();
    return courts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q) ||
      c.sport?.some(s => s.toLowerCase().includes(q))
    )
  }, [searchQuery, courts])

  if (isLoading) return (
    <View style={s.centered}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={s.loadingText}>Finding courts near you...</Text>
    </View>
  );

  if (isError) return (
    <View style={s.centered}>
      <Text style={s.errorText}>Could not load courts.</Text>
      <TouchableOpacity onPress={refetch}>
        <Text style={s.retryText}>Tap to retry</Text>
      </TouchableOpacity>
    </View>
  );

  const firstName = profileDetails?.first_name || profileDetails?.firstName || profile?.first_name || 'there';
  const lastName = profileDetails?.last_name || profileDetails?.lastName || profile?.last_name || '';
  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName && firstName !== 'there'
      ? firstName.charAt(0).toUpperCase()
      : 'U';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* ═══ HEADER ═══ */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.greetingLine}>
              Good Evening,{'\n'}
              <Text style={s.greetingName}>{firstName}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={s.avatarOuter}>
              <View style={s.avatarCircle}>
                {profileDetails?.profileImage ? (
                  <Image source={{ uri: profileDetails.profileImage }} style={s.avatarImage} />
                ) : (
                  <Text style={s.avatarInitials}>{initials}</Text>
                )}
              </View>
              <View style={s.onlineDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ═══ SEARCH BAR ═══ */}
        <View style={s.searchWrapper}>
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={s.searchInput}
              placeholder="Search arenas or venues..."
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
                    navigation.navigate('CourtDetail', { court })
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

        {/* ═══ PROMO CARDS ═══ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.promoScroll}
          contentContainerStyle={s.promoContent}
        >
          {PROMOS.map((promo) => (
            <View
              key={promo.id}
              style={[s.promoCard, { backgroundColor: promo.bg }]}
            >
              <View style={s.promoBody}>
                <Text style={s.promoTitle}>{promo.title}</Text>
                <Text style={s.promoSubtitle}>{promo.subtitle}</Text>
              </View>
              <TouchableOpacity
                style={[s.promoCta, { backgroundColor: promo.ctaBg }]}
                activeOpacity={0.8}
              >
                <Text style={[s.promoCtaText, { color: promo.ctaColor }]}>
                  {promo.cta}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* TODO: replace AREAS with Google Places Nearby API results
            Recommended free alternative if Google Maps billing is an issue: OpenStreetMap + Nominatim API (100% free, no billing required)
            Google Maps: requires billing account but has $200/month free credit (sufficient for student projects)
        */}
        {/* ═══ POPULAR AREAS ═══ */}
        <View style={s.areasSection}>
          <Text style={s.sectionTitle}>Popular Areas</Text>
          <View style={s.areasRow}>
            {AREAS.map((area) => {
              const isActive = area === activeZone;
              return (
                <TouchableOpacity
                  key={area}
                  style={[s.areaTab, isActive && s.areaTabActive]}
                  onPress={() => setActiveZone(area)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.areaTabText,
                      isActive ? s.areaTabTextActive : s.areaTabTextInactive,
                    ]}
                  >
                    {area}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ═══ COURT LIST ═══ */}
        <View style={s.courtSection}>
          <FlatList
            data={filteredCourts}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={s.courtSep} />}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 100,
              paddingTop: 8,
            }}
            renderItem={({ item }) => (
              <CourtCard
                court={item}
                onPress={() => navigation.navigate('CourtDetail', { court: item })}
              />
            )}
            ListEmptyComponent={() => (
              <View style={s.emptyContainer}>
                <Text style={s.emptyText}>No courts available in this area yet.</Text>
                <Text style={s.emptySubtext}>Check back soon!</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ═══════════════════════════════════ */
/*              STYLES                 */
/* ═══════════════════════════════════ */
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* ── header ── */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 25,
  },
  headerLeft: {},
  greetingLine: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -0.75,
    lineHeight: 30,
  },
  greetingName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -0.75,
  },

  /* avatar */
  avatarOuter: {
    position: 'relative',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#CCFF00',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  searchWrapper:   { marginHorizontal: 16, marginTop: 12, zIndex: 100 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  searchInput:     { flex: 1, fontSize: 14, color: '#1A1A2E' },
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
  suggestionName:  { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  suggestionArea:  { fontSize: 12, color: '#6B7280', marginTop: 2 },

  /* ── promo cards ── */
  promoScroll: {
    marginTop: 23,
  },
  promoContent: {
    paddingHorizontal: 18,
    gap: 20,
  },
  promoCard: {
    width: PROMO_CARD_W,
    height: PROMO_CARD_H,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
  },
  promoBody: {
    gap: 4,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    lineHeight: 30,
  },
  promoSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  promoCta: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  promoCtaText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  /* ── areas ── */
  areasSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  areasRow: {
    flexDirection: 'row',
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  areaTab: {
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  areaTabActive: {
    borderBottomColor: '#2563EB',
  },
  areaTabText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  areaTabTextActive: {
    color: '#2563EB',
  },
  areaTabTextInactive: {
    color: '#94A3B8',
  },

  /* ── courts ── */
  courtSection: {
    paddingHorizontal: 4,
    marginTop: 16,
  },
  courtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    gap: 16,
  },
  courtImgWrap: {},
  courtImgPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courtImgEmoji: {
    fontSize: 32,
  },
  courtInfo: {
    flex: 1,
    gap: -0.5,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    lineHeight: 24,
  },
  courtLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courtLocIcon: {
    fontSize: 8,
  },
  courtLocText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
  },
  courtBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8.5,
  },
  courtPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2563EB',
  },
  ratingBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
  },
  courtSep: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6F8',
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
});

export default HomeScreen;
