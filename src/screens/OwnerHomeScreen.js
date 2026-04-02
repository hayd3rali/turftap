// THEME NOTE: Light mode enforced globally.
// Dark mode toggle will be added via themeSlice in a future phase.
// When implementing dark mode, swap these tokens via isDarkMode from Redux.
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useGetOwnerBookingsQuery } from '../api/bookingsService';
import { useGetOwnerCourtsQuery } from '../api/courtsService';

const OwnerHomeScreen = () => {
  const navigation = useNavigation();
  const { profileDetails, profile } = useSelector((state) => state.user);
  const ownerId = profile?.id || profileDetails?.id;

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    refetch,
  } = useGetOwnerBookingsQuery();

  const { data: courts = [] } = useGetOwnerCourtsQuery(ownerId, {
    skip: !ownerId
  });

  // Calculate today's stats:
  const todayStr = new Date().toISOString().split('T')[0]

  // Filter bookings where slot date matches today:
  const todayBookings = bookings.filter(b => {
    const slotDate = b.slots?.date
    return slotDate === todayStr
  })

  const todayRevenue = todayBookings.reduce((sum, b) => {
    return sum + (parseInt(b.amount) || 0)
  }, 0)

  const totalSlots = bookings.length

  const revenueLabel = todayRevenue > 0 ? `${todayBookings.length} booking(s) today` : 'No bookings today'

  // Format time helper:
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  const scheduleItems = bookings.map(b => {
    // Use playerData (our manually merged field)
    const playerData  = b.playerData
    const firstName   = playerData?.first_name || ''
    const lastName    = playerData?.last_name  || ''
    const playerName  = `${firstName} ${lastName}`.trim()
    const displayName = playerName.length > 0 ? playerName : 'Unknown Player'
    const playerPhone = playerData?.phone || 'N/A'


    return {
      id:       b.id,
      time:     formatTime(b.slots?.start_time),
      date:     b.slots?.date || '',
      type:     'booked',
      player:   displayName,
      phone:    playerPhone,
      court:    b.slots?.courts?.name || 'Court',
      duration: '60 min',
      booking:  b,
    }
  })
  const firstName = profileDetails?.first_name || profileDetails?.firstName || profile?.first_name || '';
  const lastName = profileDetails?.last_name || profileDetails?.lastName || profile?.last_name || '';
  const venueName = profileDetails?.venue_name || profile?.venue_name || profileDetails?.venueName || 'My Court';
  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName
      ? firstName.charAt(0).toUpperCase()
      : 'O';

  const handleBookedPress = (slot) => {
    navigation.navigate('BookingDetail', { booking: slot });
  };

  const renderSlotContent = (slot) => {
    if (slot.type === 'booked') {
      return (
        <TouchableOpacity
          style={styles.bookedCard}
          activeOpacity={0.85}
          onPress={() => handleBookedPress(slot)}
        >
          <View style={styles.bookedHeaderRow}>
            <Text style={styles.bookedTitle}>
              {slot.player} — {slot.court}
            </Text>
            <Text style={styles.menuIcon}>⋮</Text>
          </View>
          <Text style={styles.bookedMeta}>
            Confirmed • {slot.duration}
          </Text>
        </TouchableOpacity>
      );
    }

    if (slot.type === 'blocked') {
      return (
        <View style={styles.blockedCard}>
          <View style={styles.blockedHeaderRow}>
            <Text style={styles.blockedIcon}>🔒</Text>
            <Text style={styles.blockedTitle}>Manual Block</Text>
          </View>
          <Text style={styles.blockedMeta}>
            {slot.reason || 'Maintenance • Staff Only'}
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.availableCard}
        activeOpacity={0.8}
        onPress={() => {
          // TODO: add walk-in booking
        }}
      >
        <Text style={styles.availableText}>+ Available</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={bookingsLoading} onRefresh={refetch} />}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>T</Text>
            </View>
            <Text style={styles.logoLabel}>TurfTap</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('OwnerProfile')}
          >
            <Text style={styles.avatarInitials}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLight}>Today&apos;s</Text>
          <Text style={styles.heroBold}>Overview</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>{
              new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })
            }</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TODAY&apos;S REVENUE</Text>
            <Text style={styles.statValueGreen}>Rs. {todayRevenue.toLocaleString()}</Text>
            <Text style={styles.statDelta}>{revenueLabel}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>BOOKINGS</Text>
            <Text style={styles.statValueWhite}>{totalSlots} Slots</Text>
          </View>
        </View>

        {/* Court schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleTitle}>Court Schedule</Text>

          <View style={styles.timeline}>
            {bookingsLoading ? (
              <ActivityIndicator color="#2563EB" style={{ marginTop: 16 }} />
            ) : scheduleItems.length === 0 ? (
              <View style={styles.emptySchedule}>
                <Text style={styles.emptyScheduleText}>No bookings today</Text>
              </View>
            ) : (
              scheduleItems.map((item) => (
                <View key={item.id} style={styles.timelineRow}>
                  <Text style={styles.timeLabel}>{item.time}</Text>
                  <View style={styles.slotArea}>
                    <TouchableOpacity
                      style={styles.bookedCard}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('BookingDetail', {
                        viewAs: 'owner',
                        booking: {
                          player:  item.player,
                          phone:   item.phone,
                          email:   item.booking.playerData?.email || '',
                          amount:  item.booking.amount?.toString() || '0',
                          slot:    `${formatTime(item.booking.slots?.start_time)} – ${formatTime(item.booking.slots?.end_time)}`,
                          field:   item.booking.slots?.courts?.name || 'Court',
                          payment: item.booking.payment === 'Venue' ? 'Pay at Venue' : item.booking.payment,
                          id:      `#TT-${item.id.slice(0, 8).toUpperCase()}`,
                          date:    item.date,
                        }
                      })}
                    >
                      <View style={styles.bookedHeaderRow}>
                        <Text style={styles.bookedTitle}>
                          {item.player} — {item.court}
                        </Text>
                        <Text style={styles.menuIcon}>⋮</Text>
                      </View>
                      <Text style={styles.bookedMeta}>
                        {item.date} • {item.time} • {item.duration}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  logoLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  heroSection: {
    marginTop: 20,
  },
  heroLight: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1A1A2E',
  },
  heroBold: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A2E',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateIcon: {
    fontSize: 13,
    marginRight: 6,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    columnGap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  statValueGreen: {
    fontSize: 24,
    fontWeight: '900',
    color: '#16A34A',
    marginTop: 4,
  },
  statValueWhite: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A2E',
    marginTop: 4,
  },
  statDelta: {
    fontSize: 12,
    color: '#16A34A',
    marginTop: 2,
  },
  scheduleSection: {
    marginTop: 28,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  timeline: {
    marginTop: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  timeLabel: {
    width: 48,
    fontSize: 11,
    color: '#9CA3AF',
  },
  slotArea: {
    flex: 1,
    marginLeft: 8,
  },
  bookedCard: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  bookedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  bookedMeta: {
    marginTop: 4,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  availableCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  availableText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  blockedCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  blockedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  blockedIcon: {
    fontSize: 13,
    color: '#6B7280',
  },
  blockedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  blockedMeta: {
    marginTop: 4,
    fontSize: 11,
    color: '#6B7280',
  },
  emptySchedule: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyScheduleText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default OwnerHomeScreen;

