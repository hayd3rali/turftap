import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGetMyBookingsQuery } from '../api/bookingsService';

const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes || '00'} ${ampm}`;
};

/* ─── status config ─── */
const STATUS_CONFIG = {
  confirmed: {
    badgeBg: '#2563EB',
    badgeColor: '#FFFFFF',
    btnLabel: 'Details',
    btnBg: '#2563EB',
    btnColor: '#FFFFFF',
    btnBorder: '#2563EB',
  },
};

/* ─── animated card ─── */
const AnimatedCard = ({ children, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 400, delay: index * 90, useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0, duration: 400, delay: index * 90, useNativeDriver: true,
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
const BookingsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: bookings = [], isLoading, refetch } = useGetMyBookingsQuery();

  // Group bookings by court + date (same session = booked at same time)
  const groupBookingsBySession = (bookings) => {
    const sessions = {}
    bookings.forEach(b => {
      // Group key: court id + date
      const key = `${b.slots?.courts?.id}-${b.slots?.date}`
      if (!sessions[key]) {
        sessions[key] = {
          ...b,
          allSlots: [b.slots],
          totalAmount: b.amount,
        }
      } else {
        sessions[key].allSlots.push(b.slots)
        sessions[key].totalAmount += (b.amount || 0)
      }
    })
    return Object.values(sessions)
  }

  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const upcoming = []
    const pastAll  = []

    const groupedBookings = groupBookingsBySession(bookings)

    groupedBookings.forEach(session => {
      // Use last slot end time to determine if session is past
      const lastSlot = [...session.allSlots].sort((a, b) => 
        (a?.end_time || '').localeCompare(b?.end_time || '')
      ).pop()

      const slotDate   = lastSlot?.date
      const endTimeStr = lastSlot?.end_time
      if (!slotDate || !endTimeStr) { upcoming.push(session); return }
      
      const [h, m, s] = endTimeStr.split(':').map(Number)
      const slotEnd = new Date(slotDate)
      slotEnd.setHours(h, m, s || 0)
      
      if (slotEnd < now) pastAll.push(session)
      else upcoming.push(session)
    })

    pastAll.sort((a, b) => {
      const lastA = [...a.allSlots].sort((x, y) => (x?.end_time || '').localeCompare(y?.end_time || '')).pop()
      const lastB = [...b.allSlots].sort((x, y) => (x?.end_time || '').localeCompare(y?.end_time || '')).pop()
      const dA = new Date(`${lastA?.date}T${lastA?.end_time}`)
      const dB = new Date(`${lastB?.date}T${lastB?.end_time}`)
      return dB - dA
    })

    return { upcoming, past: pastAll.slice(0, 5) }
  }, [bookings])

  const getSessionTimeRange = (session) => {
    if (!session.allSlots || session.allSlots.length === 0) return 'N/A'
    const sorted = [...session.allSlots].sort((a, b) =>
      (a?.start_time || '').localeCompare(b?.start_time || '')
    )
    const first = sorted[0]
    const last  = sorted[sorted.length - 1]
    return `${formatTime(first?.start_time)} – ${formatTime(last?.end_time)}`
  }

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  const data = activeTab === 'upcoming' ? upcoming : past;

  /* ── render card ── */
  const renderCard = ({ item: session, index }) => {
    const status = session.status || 'confirmed';
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['confirmed'];
    
    // DB field extraction
    const courtName = session.slots?.courts?.name || 'Court';
    const timeSlot = getSessionTimeRange(session);
    const bookingDate = session.slots?.date || 'N/A';

    const imageUri = session.slots?.courts?.images?.[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=75';
    const bookingId = session.id?.slice(0, 8).toUpperCase() || 'N/A';
    const locationStr = session.slots?.courts?.area || '';

    return (
      <AnimatedCard index={index}>
        <View style={s.card}>
          <View style={s.imgWrap}>
            <Image source={{ uri: imageUri }} style={s.cardImg} />
            <View style={[s.statusBadge, { backgroundColor: cfg.badgeBg }]}>
              <Text style={[s.statusTxt, { color: cfg.badgeColor }]}>{status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={s.cardBody}>
            <View style={s.titleRow}>
              <View style={s.titleLeft}>
                <Text style={s.courtName} numberOfLines={1}>{courtName}</Text>
                <Text style={s.bookingIdText}>Booking ID: #{bookingId}</Text>
                {!!locationStr && (
                  <View style={s.locRow}>
                    <Text style={s.locIcon}>📍</Text>
                    <Text style={s.location}>{locationStr}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={s.subtext}>Rs. {session.totalAmount?.toLocaleString()}</Text>
                  <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '700' }}>
                      {session.allSlots?.length} SLOT{session.allSlots?.length > 1 ? 'S' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={s.bottomRow}>
              <View style={s.dateCol}>
                <View style={s.dateRow}>
                  <Text style={s.dateIcon}>📅</Text>
                  <Text style={s.dateTxt}>{bookingDate}</Text>
                </View>
                <Text style={s.timeTxt}>🕐 {timeSlot}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  s.actionBtn,
                  { backgroundColor: cfg.btnBg, borderColor: cfg.btnBorder },
                ]}
                onPress={() => navigation.navigate('BookingDetail', {
                  viewAs: 'player',
                  booking: {
                    courtName:  session.slots?.courts?.name  || 'Court',
                    field:      session.slots?.courts?.name  || 'Court',
                    slot:       timeSlot,
                    timeSlot:   timeSlot,
                    amount:     session.totalAmount?.toString() || '0',
                    payment:    session.payment === 'Venue' ? 'Pay at Venue' : session.payment,
                    ownerPhone: session.slots?.courts?.profiles?.phone || 'N/A',
                    id:         `#TT-${session.id.slice(0, 8).toUpperCase()}`,
                    date:       session.slots?.date || '',
                  }
                })}
              >
                <Text style={[s.actionTxt, { color: cfg.btnColor }]}>
                  {cfg.btnLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ═══ HEADER ═══ */}
      <View style={s.headerWrap}>
        <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.header}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ═══ TABS ═══ */}
      <View style={s.tabContainer}>
        <View style={s.tabRow}>
          {['upcoming', 'past'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[s.tab, isActive && s.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[s.tabTxt, isActive ? s.tabTxtOn : s.tabTxtOff]}>
                  {tab === 'upcoming'
                    ? `Upcoming${upcoming.length > 0 ? ` (${upcoming.length})` : ''}`
                    : `Past${past.length > 0 ? ` (${past.length})` : ''}`
                  }
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ═══ CARDS ═══ */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#2563EB" size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id.toString()}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderCard}
          ListEmptyComponent={() => (
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>
                {activeTab === 'upcoming'
                  ? 'No upcoming bookings yet.'
                  : 'No past bookings.'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                  <Text style={s.exploreLink}>Browse courts →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

/* ═══════════════════════════════════ */
/*              STYLES                 */
/* ═══════════════════════════════════ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  /* header */
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backIcon: { fontSize: 24, color: '#1A1A2E' },
  header: {
    fontSize: 20, fontWeight: '800', color: '#111827',
  },

  /* tabs */
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#005BFF',
  },
  tabTxt: { fontSize: 14, fontWeight: '700' },
  tabTxtOn: { color: '#111827' },
  tabTxtOff: { color: '#9CA3AF' },

  /* list */
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30, gap: 16 },

  /* card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },

  /* image */
  imgWrap: { position: 'relative' },
  cardImg: { width: '100%', height: 140 },

  /* status badge over image */
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusTxt: {
    fontWeight: '800', fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase'
  },

  /* waitlist card specific */
  cardBodyWaitlist: {
    paddingTop: 16,
  },
  waitlistBadge: {
    borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  waitlistTxt: {
    fontWeight: '800', fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase'
  },

  /* body */
  cardBody: { padding: 16 },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleLeft: {
    flex: 1,
    paddingRight: 10,
  },
  courtName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 2 },
  bookingIdText: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 6 },

  locRow: { flexDirection: 'row', alignItems: 'center' },
  locIcon: { fontSize: 12, marginRight: 4, color: '#6B7280' },
  location: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  subtext: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

  /* bottom row: date vs button */
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateCol: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateIcon: { fontSize: 14, marginRight: 6 },
  dateTxt: { fontSize: 14, fontWeight: '700', color: '#111827' },

  timeTxt: { fontSize: 13, color: '#9CA3AF', marginLeft: 20, lineHeight: 18 },

  /* action button */
  actionBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  actionTxt: { fontSize: 13, fontWeight: '700' },

  /* empty */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  exploreLink: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default BookingsScreen;
