import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCreateBookingMutation } from '../api/bookingsService';

/* ─── payment methods ─── */
const PAYMENT_METHODS = [
  { id: 'Venue', label: 'Pay at Venue', icon: '🏢', active: true },
  { id: 'JazzCash', label: 'JazzCash', icon: '💚', active: false },
  { id: 'Card', label: 'Credit/Debit Card', icon: '💳', active: false },
];

/* ═══════════════════════════════════ */
/*              SCREEN                 */
/* ═══════════════════════════════════ */
const CheckoutScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  
  const {
    court,
    selectedSlots,
    selectedSlot,
    selectedDate,
    totalAmount,
  } = route.params

  const [createBooking, { isLoading: bookingLoading }] = useCreateBookingMutation();
  const [selectedPayment, setSelectedPayment] = useState('Venue');
  const [promo, setPromo] = useState('');

  const courtName = court.name || 'Gulshan Arena';

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  // Always use array — sort by start_time so they're in order
  const slots = [...(selectedSlots || (selectedSlot ? [selectedSlot] : []))]
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

  // Calculate correct values from ALL slots:
  const firstSlot    = slots[0]
  const lastSlot     = slots[slots.length - 1]
  const displayAmount = totalAmount || (court?.price_base * slots.length) || 0

  // Time range spans from FIRST slot start to LAST slot end:
  const timeRange = slots.length > 0
    ? `${formatTime(firstSlot?.start_time)} – ${formatTime(lastSlot?.end_time)}`
    : 'N/A'

  const slotLabel = slots.length > 1
    ? `${slots.length} slots (${formatTime(firstSlot?.start_time)} – ${formatTime(lastSlot?.end_time)})`
    : timeRange

  const serviceFee = 0;
  const totalPrice = displayAmount + serviceFee;

  const handleConfirmBooking = async () => {
    if (!slots || slots.length === 0) {
      Alert.alert('Error', 'No slots selected.')
      return
    }

    try {
      // Pass ALL slot IDs as array
      const result = await createBooking({
        slotIds:  slots.map(s => s.id),
        courtId:  court.id,
        date:     selectedDate,
        amount:   displayAmount,
        payment:  selectedPayment,
      })

      if (result.error) {
        Alert.alert('Booking Failed', result.error)
        return
      }

      // Pass ALL slots to success screen
      nav.navigate('Success', {
        booking:       result.data,
        court,
        selectedSlots: slots,
        selectedSlot:  firstSlot,
        selectedDate,
        totalAmount:   displayAmount,
      })

    } catch (e) {
      Alert.alert('Error', 'Could not complete booking. Please try again.')
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ═══ HEADER ═══ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Checkout</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Map Background for visual flair per Figma */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80' }}
          style={s.mapHeader}
        />

        <View style={s.contentOverMap}>
          {/* ═══ BOOKING SUMMARY ═══ */}
          <View style={s.summaryCard}>
            <View style={s.courtRow}>
              <Image
                source={{
                  uri: court.images?.[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&q=70',
                }}
                style={s.courtThumb}
              />
              <View style={s.courtInfo}>
                <Text style={s.courtName}>{courtName}</Text>
                <Text style={s.courtSub}>{court.area || 'Premium Arena'}</Text>
              </View>
            </View>

            {/* Dashed line via dot-styled View or simple borderStyle */}
            <View style={s.dividerDashed} />

            <View style={s.detailRow}>
              <View style={s.detailLabelRow}>
                <Text style={s.detailIcon}>📅</Text>
                <Text style={s.detailLabel}>Date</Text>
              </View>
              <Text style={s.detailValue}>{selectedDate}</Text>
            </View>

            <View style={s.detailRow}>
              <View style={s.detailLabelRow}>
                <Text style={s.detailIcon}>🕐</Text>
                <Text style={s.detailLabel}>Time Slot</Text>
              </View>
              <Text style={s.detailValue}>{timeRange}</Text>
            </View>

            <View style={s.detailRow}>
              <View style={s.detailLabelRow}>
                <Text style={s.detailIcon}>⏳</Text>
                <Text style={s.detailLabel}>Duration</Text>
              </View>
              <Text style={s.detailValue}>
                {slots.length} hour{slots.length > 1 ? 's' : ''}
                {slots.length > 1 ? ` (${slots.length} slots)` : ''}
              </Text>
            </View>
          </View>

          {/* ═══ REVIEW & PAY ═══ */}
          <Text style={s.sectionTitle}>Review & Pay</Text>
          <View style={s.summaryCard}>
            <View style={s.detailRow}>
              <Text style={s.feeLabel}>Court Fee</Text>
              <Text style={s.feeValue}>Rs. {displayAmount.toLocaleString()}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.feeLabel}>Service Fee</Text>
              <Text style={s.feeValue}>Rs. {serviceFee.toLocaleString()}</Text>
            </View>
            <View style={s.dividerDashed} />
            <View style={[s.detailRow, { marginBottom: 0 }]}>
              <Text style={s.totalLabel}>Total Amount</Text>
              <Text style={s.totalValueBlue}>Rs. {totalPrice.toLocaleString()}</Text>
            </View>
          </View>

          {/* ═══ PAYMENT METHOD ═══ */}
          <Text style={s.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => {
            const on = selectedPayment === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.85}
                style={[
                  s.methodRow,
                  on && s.methodOn,
                  !method.active && s.methodRowDisabled,
                ]}
                onPress={() => method.active && setSelectedPayment(method.id)}
                disabled={!method.active}
              >
                <View style={[s.iconBg, on ? s.iconBgOn : s.iconBgOff, !method.active && { backgroundColor: '#F1F5F9' }]}>
                  <Text style={[s.methodIcon, !method.active && { opacity: 0.5 }]}>{method.icon}</Text>
                </View>
                <Text style={[
                  s.methodLabel,
                  on && s.methodLabelOn,
                  !method.active && { color: '#9CA3AF' }
                ]}>
                  {method.label}
                </Text>
                {!method.active && (
                  <View style={s.comingSoonBadge}>
                    <Text style={s.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
                {method.active && on && (
                  <View style={[s.checkCircle, s.checkCircleOn]}>
                    <Text style={s.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* ═══ PROMO CODE ═══ */}
          <View style={s.promoRow}>
            <TextInput
              style={s.promoInput}
              placeholder="Promo Code"
              placeholderTextColor="#9CA3AF"
              value={promo}
              onChangeText={setPromo}
            />
            <TouchableOpacity style={s.applyBtn} activeOpacity={0.8}>
              <Text style={s.applyTxt}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* ═══ FINE PRINT ═══ */}
          <Text style={s.finePrint}>
            By confirming you agree to our <Text style={s.finePrintLink}>Terms of Service</Text> and{' '}
            <Text style={s.finePrintLink}>Cancellation Policy</Text>
          </Text>
        </View>
      </ScrollView>

      {/* ─── STICKY BOTTOM TRAY (Matching exact Figma spec) ─── */}
      <View style={s.reserveTrayContainer} pointerEvents="box-none">
        <LinearGradient
          colors={['rgba(248,250,252,0)', 'rgba(248,250,252,0.9)', 'rgba(248,250,252,1)']}
          style={s.reserveTrayGradient}
          pointerEvents="none"
        />
        <View style={s.reserveTray}>
          {/* Left: price info */}
          <View style={s.trayLeft}>
            <Text style={s.trayLabel}>TOTAL TO PAY</Text>
            <View style={s.trayPriceRow}>
              <Text style={s.trayPrice}>Rs. {totalPrice.toLocaleString()}</Text>
            </View>
          </View>
          {/* Right: Reserve button (Green for Checkout) */}
          <TouchableOpacity
            style={[s.trayBtn, bookingLoading && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleConfirmBooking}
            disabled={bookingLoading}
          >
            <Text style={s.trayBtnTxt}>{bookingLoading ? 'Confirming...' : 'Confirm Booking'}</Text>
            {!bookingLoading && <Text style={s.trayBtnArrow}>›</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ═══════════════════════════════════ */
/*              STYLES                 */
/* ═══════════════════════════════════ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: '#1E293B', fontWeight: '400' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', letterSpacing: -0.5 },

  /* content */
  scrollContent: {
    paddingBottom: 160,
  },
  mapHeader: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  contentOverMap: {
    marginTop: -50,
    paddingHorizontal: 20,
  },

  /* cards */
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  courtRow: { flexDirection: 'row', alignItems: 'center' },
  courtThumb: { width: 48, height: 48, borderRadius: 12 },
  courtInfo: { marginLeft: 16, flex: 1 },
  courtName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  courtSub: { fontSize: 13, fontWeight: '500', color: '#64748B', marginTop: 4 },

  dividerDashed: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 18,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailIcon: { fontSize: 16 },
  detailLabel: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

  /* review & pay */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 28,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  feeLabel: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  feeValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  totalValueBlue: { fontSize: 20, fontWeight: '800', color: '#2563EB' },

  /* payment methods */
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  methodOn: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  methodOff: { borderColor: '#E2E8F0' },

  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBgOn: { backgroundColor: '#DBEAFE' },
  iconBgOff: { backgroundColor: '#F1F5F9' },
  methodIcon: { fontSize: 18 },

  methodLabel: { fontSize: 15, fontWeight: '600', color: '#1E293B', flex: 1 },
  methodLabelOn: { color: '#2563EB' },

  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleOn: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* promo code */
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  applyTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  /* fine print */
  finePrint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  finePrintLink: { color: '#2563EB', fontWeight: '600' },

  /* reserve tray matching Figma config */
  reserveTrayContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 10,
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
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
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
    marginLeft: 4,
  },
  trayLabel: {
    fontSize: 10,
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
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A2E',
  },
  trayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trayBtnArrow: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: -2,
  },
  methodRowDisabled: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  comingSoonBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
});

export default CheckoutScreen;
