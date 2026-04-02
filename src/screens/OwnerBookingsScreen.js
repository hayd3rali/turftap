// THEME NOTE: Light mode enforced globally.
// Dark mode toggle will be added via themeSlice in a future phase.
// When implementing dark mode, swap these tokens via isDarkMode from Redux.
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useGetOwnerBookingsQuery } from '../api/bookingsService';

const TIME_SLOTS = [
  '12:00 AM\n1:00 AM',
  '1:00 AM\n2:00 AM',
  '2:00 AM\n3:00 AM',
  '3:00 AM\n4:00 AM',
  '4:00 AM\n5:00 AM',
  '5:00 AM\n6:00 AM',
  '6:00 AM\n7:00 AM',
  '7:00 AM\n8:00 AM',
  '8:00 AM\n9:00 AM',
  '9:00 AM\n10:00 AM',
  '10:00 AM\n11:00 AM',
  '11:00 AM\n12:00 PM',
  '12:00 PM\n1:00 PM',
  '1:00 PM\n2:00 PM',
  '2:00 PM\n3:00 PM',
  '3:00 PM\n4:00 PM',
  '4:00 PM\n5:00 PM',
  '5:00 PM\n6:00 PM',
  '6:00 PM\n7:00 PM',
  '7:00 PM\n8:00 PM',
  '8:00 PM\n9:00 PM',
  '9:00 PM\n10:00 PM',
  '10:00 PM\n11:00 PM',
  '11:00 PM\n12:00 AM',
];

const LEGEND = [
  { color: '#2563EB', label: 'Reserved / Academy' },
  { color: '#22C55E', label: 'League Match' },
  { color: '#F59E0B', label: 'Walk-in Slot' },
  { color: '#1A1A2E', label: 'Manual Block' },
  { color: '#E2E8F0', label: 'Maintenance', border: '#D1D5DB' },
];

const formatDate = (d) => d.toISOString().split('T')[0];

const getDaysFromDate = (startDate) => {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      full: d,
    };
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

const buildScheduleFromBookings = (bookings) => {
  const schedule = {};
  bookings.forEach(b => {
    const firstName   = b.playerData?.first_name || ''
    const lastName    = b.playerData?.last_name  || ''
    const playerName  = `${firstName} ${lastName}`.trim()
    const displayName = playerName || b.playerData?.email || 'Unknown Player'
    const playerPhone = b.playerData?.phone || 'N/A'

    const date    = b.slots?.date;
    const timeKey = `${formatTime(b.slots?.start_time)}\n${formatTime(b.slots?.end_time)}`;
    if (!schedule[date]) schedule[date] = {};
    schedule[date][timeKey] = {
      type:    'booked',
      label:   'Reserved',
      player:  displayName,
      phone:   playerPhone,
      email:   b.playerData?.email || '',
      amount:  b.amount?.toString() || '0',
      field:   b.slots?.courts?.name || 'Court',
      payment: b.payment === 'Venue' ? 'Pay at Venue' : b.payment,
      id:      `#TT-${b.id?.slice(0,8).toUpperCase()}`,
      slot:    `${formatTime(b.slots?.start_time)} – ${formatTime(b.slots?.end_time)}`,
      date:    date,
    };
  });
  return schedule;
};

const OwnerBookingsScreen = () => {
  const navigation = useNavigation();
  const { profileDetails } = useSelector((state) => state.user);

  const { data: bookings = [], isLoading, refetch } = useGetOwnerBookingsQuery();
  const realSchedule = buildScheduleFromBookings(bookings);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('walkin'); // 'walkin' | 'block'
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinField, setWalkinField] = useState('');
  const [walkinPaymentMethod, setWalkinPaymentMethod] = useState('cash');
  const [manualSchedule, setManualSchedule] = useState({});

  const [weekStart, setWeekStart] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const days = getDaysFromDate(weekStart);
  const weekLabel = `${days[0].month} ${days[0].date} – ${days[4].month} ${days[4].date}, ${days[0].year}`;

  const goBack = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 5);
    setWeekStart(prev);
    setSelectedDayIndex(0);
  };

  const goForward = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 5);
    setWeekStart(next);
    setSelectedDayIndex(0);
  };

  const selectedDay = days[selectedDayIndex];
  const dateKey = selectedDay ? formatDate(selectedDay.full) : null;
  const baseSchedule = dateKey ? realSchedule[dateKey] || {} : {};
  const manualForDay = dateKey ? manualSchedule[dateKey] || {} : {};
  const daySchedule = {
    ...baseSchedule,
    ...manualForDay,
  };

  const handleConfirmSlot = () => {
    if (!selectedSlots.length) {
      Alert.alert('Select slot(s)', 'Please select at least one time slot.');
      return;
    }
    if (modalType === 'walkin' && !walkinName.trim()) {
      Alert.alert('Missing info', 'Please enter the player name.');
      return;
    }
    if (modalType === 'walkin') {
      const cleaned = walkinPhone.replace(/\D/g, '');
      if (cleaned.length < 10 || cleaned.length > 11) {
        Alert.alert('Invalid Number', 'Please enter a valid phone number.');
        return;
      }
      if (!walkinField.trim()) {
        Alert.alert('Required', 'Please enter the field/court name.');
        return;
      }
    }

    const activeDay = days[selectedDayIndex];
    if (!activeDay) {
      return;
    }
    const key = formatDate(activeDay.full);

    setManualSchedule((prev) => {
      const existingForDay = prev[key] || {};
      const updatedForDay = { ...existingForDay };

      selectedSlots.forEach((slot) => {
        updatedForDay[slot] =
          modalType === 'walkin'
            ? {
                type: 'booked',
                label: 'Reserved',
                player: walkinName.trim(),
                phone: walkinPhone.trim(),
                field: walkinField.trim(),
                payment:
                  walkinPaymentMethod === 'cash'
                    ? 'Walk-in (Cash)'
                    : walkinPaymentMethod === 'jazzcash'
                    ? 'Paid via JazzCash'
                    : 'Paid via Card',
                amount: '0',
                id: `#TT-WALKIN-${Date.now()}`,
              }
            : {
                type: 'blocked',
                label: 'MAINTENANCE',
              };
      });

      return {
        ...prev,
        [key]: updatedForDay,
      };
    });

    setModalVisible(false);
    setSelectedSlots([]);
    setWalkinName('');
    setWalkinPhone('');
    setWalkinField('');

    Alert.alert(
      'Done ✓',
      modalType === 'walkin' ? 'Walk-in booking added.' : 'Slot blocked.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header (fixed) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.courtName}>
              {profileDetails?.venueName || 'My Court'}
            </Text>
            <Text style={styles.courtAddress}>
              {profileDetails?.address
                ? `${profileDetails.address}${
                    profileDetails.area ? ' · ' + profileDetails.area : ''
                  }`
                : 'Address not set'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>JD</Text>
          </View>
        </View>
      </View>

      {/* Tab row (fixed) */}
      <View style={styles.tabRow}>
        <Text style={styles.activeTabText}>Weekly Calendar</Text>
      </View>

      {/* Scrollable content: week navigator + grid + legend */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Week navigator */}
        <View style={styles.weekNavRow}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.6}>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          <TouchableOpacity onPress={goForward} activeOpacity={0.6}>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={styles.gridContainer}>
          {/* Header row */}
          <View style={styles.gridHeaderRow}>
            <View style={styles.timeHeaderWrap}>
              <Text style={styles.timeHeaderText}>TIME</Text>
            </View>
            {days.map((d, index) => (
              <TouchableOpacity
                key={`${d.day}-${d.date}-${d.month}`}
                style={[
                  styles.dayCol,
                  selectedDayIndex === index && styles.activeDayCol,
                ]}
                onPress={() => setSelectedDayIndex(index)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDayIndex === index && styles.activeDayText,
                  ]}
                >
                  {d.day}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    selectedDayIndex === index && styles.activeDateText,
                  ]}
                >
                  {d.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time rows in inner scrollable grid */}
          <View style={styles.gridBody}>
            <ScrollView
              style={styles.gridScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {TIME_SLOTS.map((slot, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  <View style={styles.timeLabelWrap}>
                    <Text style={styles.timeLabel}>{slot}</Text>
                  </View>

                  {[0, 1, 2, 3, 4].map((dayIndex) => {
                    const cellData =
                      dayIndex === selectedDayIndex ? daySchedule[slot] : null;

                    if (!cellData) {
                      return (
                        <View
                          key={`${dayIndex}-${slot}`}
                          style={styles.dayCell}
                        >
                          <View style={styles.emptyCell} />
                        </View>
                      );
                    }

                    if (cellData.type === 'booked') {
                      return (
                        <View
                          key={`${dayIndex}-${slot}`}
                          style={styles.dayCell}
                        >
                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.bookedPill}
                            onPress={() => navigation.navigate('BookingDetail', {
                              viewAs: 'owner',
                              booking: {
                                player:  cellData.player,
                                phone:   cellData.phone,
                                email:   cellData.email,
                                amount:  cellData.amount,
                                slot:    cellData.slot,
                                field:   cellData.field,
                                payment: cellData.payment,
                                id:      cellData.id,
                                date:    cellData.date,
                              }
                            })}
                          >
                            <Text style={styles.bookedText}>Reserved</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }

                    if (cellData.type === 'blocked') {
                      return (
                        <View
                          key={`${dayIndex}-${slot}`}
                          style={styles.dayCell}
                        >
                          <View style={styles.maintenancePill}>
                            <Text style={styles.maintenanceText}>
                              MAINTENANCE
                            </Text>
                          </View>
                        </View>
                      );
                    }

                    return (
                      <View
                        key={`${dayIndex}-${slot}`}
                        style={styles.dayCell}
                      >
                        <View style={styles.emptyCell} />
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {LEGEND.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: item.color },
                  item.border && { borderWidth: 1, borderColor: item.border },
                ]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Block Slot / Walk-in Button - Fixed at bottom */}
      <View style={{
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
      }}>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#2563EB',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            backgroundColor: '#FFFFFF',
          }}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
          <Text style={{
            color: '#2563EB',
            fontWeight: '700',
            fontSize: 15,
          }}>
            Block Slot / Walk-in
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slot / Walk-in Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />

        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>Add Slot</Text>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                modalType === 'walkin' && styles.toggleActive,
              ]}
              onPress={() => setModalType('walkin')}
            >
              <Text
                style={[
                  styles.toggleText,
                  modalType === 'walkin' && styles.toggleTextActive,
                ]}
              >
                Walk-in Booking
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                modalType === 'block' && styles.toggleActive,
              ]}
              onPress={() => setModalType('block')}
            >
              <Text
                style={[
                  styles.toggleText,
                  modalType === 'block' && styles.toggleTextActive,
                ]}
              >
                Block Slot
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Select Time Slot</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {TIME_SLOTS.map((slot, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.slotChip,
                  selectedSlots.includes(slot) && styles.slotChipActive,
                ]}
                onPress={() =>
                  setSelectedSlots((prev) => {
                    const isSelected = prev.includes(slot);
                    if (isSelected) {
                      return prev.filter((s) => s !== slot);
                    }
                    if (prev.length >= 4) {
                      Alert.alert(
                        'Limit reached',
                        'You can select up to 4 slots for a single customer.'
                      );
                      return prev;
                    }
                    return [...prev, slot];
                  })
                }
              >
                <Text
                  style={[
                    styles.slotChipText,
                    selectedSlots.includes(slot) &&
                      styles.slotChipTextActive,
                  ]}
                >
                  {slot.replace('\n', ' – ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {modalType === 'walkin' && (
            <>
              <Text style={styles.fieldLabel}>Player Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Zain Ahmed"
                placeholderTextColor="#9CA3AF"
                value={walkinName}
                onChangeText={setWalkinName}
              />

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="+92 300 0000000"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={walkinPhone}
                onChangeText={setWalkinPhone}
              />

              <Text style={styles.fieldLabel}>Field / Court</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Main Arena (7×7)"
                placeholderTextColor="#9CA3AF"
                value={walkinField}
                onChangeText={setWalkinField}
              />

              <Text style={styles.fieldLabel}>Payment Method</Text>
              <View style={styles.paymentRow}>
                <TouchableOpacity
                  style={[
                    styles.paymentChip,
                    walkinPaymentMethod === 'cash' && styles.paymentChipActive,
                  ]}
                  onPress={() => setWalkinPaymentMethod('cash')}
                >
                  <Text
                    style={[
                      styles.paymentChipText,
                      walkinPaymentMethod === 'cash' &&
                        styles.paymentChipTextActive,
                    ]}
                  >
                    Cash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentChip,
                    walkinPaymentMethod === 'jazzcash' &&
                      styles.paymentChipActive,
                  ]}
                  onPress={() => setWalkinPaymentMethod('jazzcash')}
                >
                  <Text
                    style={[
                      styles.paymentChipText,
                      walkinPaymentMethod === 'jazzcash' &&
                        styles.paymentChipTextActive,
                    ]}
                  >
                    JazzCash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentChip,
                    walkinPaymentMethod === 'card' &&
                      styles.paymentChipActive,
                  ]}
                  onPress={() => setWalkinPaymentMethod('card')}
                >
                  <Text
                    style={[
                      styles.paymentChipText,
                      walkinPaymentMethod === 'card' &&
                        styles.paymentChipTextActive,
                    ]}
                  >
                    Card
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {modalType === 'block' && (
            <>
              <Text style={styles.fieldLabel}>Reason</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Maintenance, Staff Only"
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.85}
            onPress={handleConfirmSlot}
          >
            <Text style={styles.confirmButtonText}>
              {modalType === 'walkin' ? 'Confirm Walk-in' : 'Block Slot'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingBottom: 160,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  courtName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  courtAddress: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  headerIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  tabRow: {
    paddingHorizontal: 20,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    alignSelf: 'flex-start',
  },
  weekNavRow: {
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: '#1A1A2E',
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  gridContainer: {
    marginTop: 12,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeHeaderWrap: {
    width: 64,
    paddingRight: 4,
  },
  timeHeaderText: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeDayCol: {
    backgroundColor: '#2563EB',
  },
  dayText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  activeDayText: {
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  activeDateText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeDayChip: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDayText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  activeDayDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dayLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    minHeight: 56,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  timeLabelWrap: {
    width: 64,
    paddingRight: 4,
  },
  timeLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    lineHeight: 14,
  },
  dayCell: {
    flex: 1,
    paddingHorizontal: 2,
  },
  emptyCell: {
    flex: 1,
  },
  maintenancePill: {
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  maintenanceText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  legendRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  blockSlotButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockSlotText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#2563EB',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 12,
  },
  slotChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  slotChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  slotChipText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  slotChipTextActive: {
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  paymentChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  paymentChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  paymentChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  paymentChipTextActive: {
    color: '#FFFFFF',
  },
});

export default OwnerBookingsScreen;

