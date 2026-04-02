import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Share,
  Alert
}from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { resetBooking } from '../store/bookingSlice';

/* ═══════════════════════════════════ */
/*              SCREEN                 */
/* ═══════════════════════════════════ */
const SuccessScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { booking, court, selectedSlot, selectedSlots, selectedDate } = route.params || {};

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const courtName = court?.name || 'Unknown Court';
  const basePrice = court?.price_base || 0;
  const total = `Rs. ${basePrice.toLocaleString()}`;

  const slots = selectedSlots || (selectedSlot ? [selectedSlot] : []);
  const slotLabel = slots.length > 0
    ? `${formatTime(slots[0]?.start_time)} – ${formatTime(slots[slots.length-1]?.end_time)}`
    : 'N/A';

  const bookingId = booking?.id
    ? `#TT-${booking.id.slice(0, 8).toUpperCase()}`
    : '#TT-000000';

  const whatsappMessage = 
    `🏟 *Court Booking Confirmed!*\n\n` +
    `📍 *Venue:* ${courtName}\n` +
    `📅 *Date:* ${selectedDate || 'N/A'}\n` +
    `🕐 *Time:* ${slotLabel}\n` +
    `💰 *Total:* ${total}\n` +
    `🎫 *Booking ID:* ${bookingId}\n\n` +
    `_Booked via TurfTap_ 🎾`;

  const handleShareWhatsApp = async () => {
    const encoded = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `whatsapp://send?text=${encoded}`;
    const webUrl      = `https://wa.me/?text=${encoded}`;

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (e) {
      await Share.share({ message: whatsappMessage });
    }
  };

  const handleClose = () => {
    dispatch(resetBooking());
    nav.reset({
      index: 0,
      routes: [{ name: 'PlayerMain' }],
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ═══ TOP BAR ═══ */}
      <View style={s.topBar}>
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={8}
          style={s.closeBtn}
        >
          <Text style={s.closeTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={s.topLabel}>SUCCESS</Text>
        <View style={s.closeBtn} />
      </View>

      {/* ═══ SUCCESS ICON ═══ */}
      <View style={s.iconCircle}>
        <Text style={s.checkmark}>✓</Text>
      </View>

      {/* ═══ HEADLINE ═══ */}
      <Text style={s.headlineDark}>BOOKING</Text>
      <Text style={s.headlineBlue}>CONFIRMED!</Text>
      <Text style={s.subText}>Your court is locked in. Time to dominate.</Text>

      {/* ═══ DETAIL CARD ═══ */}
      <View style={s.detailCard}>
        <View style={s.courtRow}>
          <Image
            source={{
              uri: court?.images?.[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&q=70',
            }}
            style={s.courtThumb}
          />
          <View style={s.courtInfo}>
            <Text style={s.courtName}>{courtName}</Text>
            <Text style={s.courtSub}>{court?.area || 'Premium Arena'}</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <Text style={s.label}>BOOKING ID</Text>
          <Text style={s.value}>{bookingId}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>DATE</Text>
          <Text style={s.value}>{selectedDate}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>TIME</Text>
          <Text style={s.value}>{slotLabel}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalVal}>{total}</Text>
        </View>
      </View>

      {/* ═══ ACTION BUTTONS ═══ */}
      <View style={s.actions}>
        {/* WhatsApp share */}
        <TouchableOpacity style={s.whatsappBtn} onPress={handleShareWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
          <Text style={s.whatsappBtnText}>SHARE TO WHATSAPP</Text>
        </TouchableOpacity>

        {/* Calendar */}
        <TouchableOpacity 
          style={s.calendarBtn} 
          onPress={async () => {
            Alert.alert('Coming Soon', 'Calendar integration will be available soon.')
          }}
        >
          <Ionicons name="calendar-outline" size={18} color="#1A1A2E" />
          <Text style={s.calendarBtnText}>ADD TO CALENDAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/* ═══════════════════════════════════ */
/*              STYLES                 */
/* ═══════════════════════════════════ */
const s = StyleSheet.create({
  safe: {
    flex: 1, backgroundColor: '#FFFFFF',
    alignItems: 'center', paddingHorizontal: 20,
  },

  /* top bar */
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', width: '100%',
    height: 48,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 20, color: '#1A1A2E', fontWeight: '300' },
  topLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1.2 },

  /* icon */
  iconCircle: {
    width: 72, height: 72, borderRadius: 999,
    backgroundColor: '#84CC16',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 48,
  },
  checkmark: { fontSize: 34, color: '#FFFFFF', fontWeight: '700' },

  /* headline */
  headlineDark: {
    fontSize: 36, fontWeight: '900', color: '#1A1A2E',
    marginTop: 24, letterSpacing: 1,
  },
  headlineBlue: {
    fontSize: 36, fontWeight: '900', color: '#2563EB',
    letterSpacing: 1,
  },
  subText: {
    fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center',
  },

  /* detail card */
  detailCard: {
    backgroundColor: '#F9FAFB', borderRadius: 16,
    padding: 16, width: '100%', marginTop: 24,
  },
  courtRow: { flexDirection: 'row', alignItems: 'center' },
  courtThumb: { width: 48, height: 48, borderRadius: 8 },
  courtInfo: { marginLeft: 12, flex: 1 },
  courtName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  courtSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB', marginVertical: 14,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  label: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.6 },
  value: { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  totalLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  totalVal: { fontSize: 18, fontWeight: '800', color: '#2563EB' },

  /* action buttons */
  actions: { width: '100%', marginTop: 24 },
  whatsappBtn: {
    backgroundColor:  '#25D366',
    borderRadius:     12,
    paddingVertical:  16,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              8,
    marginTop:        16,
  },
  whatsappBtnText: {
    color:      '#FFFFFF',
    fontWeight: '700',
    fontSize:   15,
  },
  calendarBtn: {
    borderWidth:      1,
    borderColor:      '#E5E7EB',
    borderRadius:     12,
    paddingVertical:  14,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              8,
    marginTop:        10,
  },
  calendarBtnText: {
    color:      '#1A1A2E',
    fontWeight: '600',
    fontSize:   14,
  },
});

export default SuccessScreen;
