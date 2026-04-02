// THEME NOTE: Light mode enforced globally.
// Dark mode toggle will be added via themeSlice in a future phase.
// When implementing dark mode, swap these tokens via isDarkMode from Redux.
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

const BookingDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { booking, viewAs } = route.params || {};

  const { profileDetails } = useSelector(state => state.user);

  const isOwnerView = viewAs === 'owner';

  const displayName = isOwnerView
    ? (booking?.player || 'Unknown Player')
    : (booking?.courtName || booking?.field || 'Court');

  const displayPhone = isOwnerView
    ? (booking?.phone || 'N/A')
    : (booking?.ownerPhone || 'N/A');

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : isOwnerView ? 'P' : 'C';

  const callLabel = isOwnerView ? '📞 Call Player' : '📞 Call Owner';
  const callPhone = isOwnerView ? booking?.phone : booking?.ownerPhone;

  const handleCall = async (phone) => {
    if (!phone || phone === 'N/A') {
      Alert.alert('No Number', 'Phone number is not available.');
      return;
    }

    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    const formatted = cleaned.startsWith('+')
      ? cleaned
      : cleaned.startsWith('92')
        ? `+${cleaned}`
        : `+92${cleaned}`;

    const url = `tel:${formatted}`;
    console.log('Calling:', url);

    try {
      await Linking.openURL(url)
    } catch (e) {
      console.log('Call error:', e)
      Alert.alert('Error', 'Could not place call. Please dial manually: ' + formatted)
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Schedule preview card */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Today&apos;s Schedule</Text>
          <View style={styles.scheduleBarWide} />
          <View style={styles.scheduleBarNarrow} />
        </View>

        {/* Player card */}
        <View style={styles.playerCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {initials}
              </Text>
            </View>
          </View>

          <Text style={styles.playerName}>{displayName}</Text>
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color="#6B7280" />
            <Text style={styles.phoneText}>{displayPhone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <View style={styles.colLeft}>
              <View style={styles.statusRow}>
                <Text style={styles.statusIcon}>✅</Text>
                <Text style={styles.statusLabel}>Payment Status</Text>
              </View>
              <Text style={styles.statusValue}>{booking?.payment}</Text>
            </View>
            <View style={styles.colRight}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>
                Rs. {booking?.amount}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <View style={styles.colLeft}>
              <Text style={styles.metaLabel}>Time Slot</Text>
              <Text style={styles.metaValue}>
                {booking?.slot || booking?.timeSlot || 'N/A'}
              </Text>
            </View>
            <View style={styles.colRight}>
              <Text style={styles.metaLabel}>
                {isOwnerView ? 'Field' : 'Court'}
              </Text>
              <Text style={styles.metaValue}>
                {booking?.field || booking?.courtName || 'N/A'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            activeOpacity={0.85}
            onPress={() => handleCall(displayPhone)}
          >
            <Text style={styles.callButtonText}>{callLabel}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.bookingIdText}>
          Booking ID: {booking?.id}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  scheduleCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    height: 100,
    justifyContent: 'center',
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  scheduleBarWide: {
    marginTop: 8,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    width: '80%',
  },
  scheduleBarNarrow: {
    marginTop: 8,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    width: '60%',
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -32,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  playerName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneIcon: {
    fontSize: 14,
    color: '#6B7280',
  },
  phoneText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  colLeft: {
    flex: 1,
  },
  colRight: {
    alignItems: 'flex-end',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 12,
    color: '#22C55E',
    marginRight: 4,
  },
  statusLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  statusValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  amountLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  amountValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '900',
    color: '#2563EB',
  },
  metaLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  metaValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  callButton: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookingIdText: {
    marginTop: 16,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default BookingDetailScreen;
