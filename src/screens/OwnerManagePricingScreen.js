import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

import PrimaryButton from '../components/PrimaryButton';

const OwnerManagePricingScreen = ({ navigation }) => {
  const [courtId, setCourtId] = useState(null);
  const [baseRate, setBaseRate] = useState('');
  const [weekdayMorning, setWeekdayMorning] = useState('');
  const [weekdayEvening, setWeekdayEvening] = useState('');
  const [weekendMorning, setWeekendMorning] = useState('');
  const [weekendEvening, setWeekendEvening] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch directly from Supabase on mount
  useEffect(() => {
    const fetchPricing = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('courts')
        .select('id, price_base, pricing')
        .eq('owner_id', user.id)
        .single();
      if (data) {
        setCourtId(data.id);
        setBaseRate(data.price_base?.toString() || '0');
        setWeekdayMorning(data.pricing?.weekdayMorning || '0');
        setWeekdayEvening(data.pricing?.weekdayEvening || '0');
        setWeekendMorning(data.pricing?.weekendMorning || '0');
        setWeekendEvening(data.pricing?.weekendEvening || '0');
      }
    };
    fetchPricing();
  }, []);

  const handleSaveChanges = async () => {
    if (!courtId) return;
    setLoading(true);
    const { error } = await supabase
      .from('courts')
      .update({
        price_base: parseInt(baseRate) || 0,
        pricing: { weekdayMorning, weekdayEvening, weekendMorning, weekendEvening },
      })
      .eq('id', courtId);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Saved ✓', 'Pricing updated successfully.');
    }
  };

  const renderPricingRow = (id, title, subtitle, value, setter) => {
    const isEditing = editingField === id;

    return (
      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabel}>{title}</Text>
          <Text style={styles.priceSub}>{subtitle}</Text>
        </View>
        <View style={styles.priceCenter}>
          {isEditing ? (
            <TextInput
              style={styles.priceInput}
              value={value}
              onChangeText={setter}
              keyboardType="numeric"
              autoFocus
              onBlur={() => setEditingField(null)}
            />
          ) : (
            <Text style={styles.priceValue}>PKR {value}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setEditingField(id)}
          activeOpacity={0.7}
          style={styles.editIconWrap}
        >
          <Ionicons name="create-outline" size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>
    );
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
          <Text style={styles.headerTitle}>MANAGE PRICING</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Base rate card */}
        <View style={styles.baseCard}>
          <Text style={styles.baseLabel}>BASE HOURLY RATE (PKR)</Text>
          <View style={styles.baseRow}>
            <Text style={styles.baseRs}>Rs.</Text>
            {editingField === 'baseRate' ? (
              <TextInput
                style={[styles.priceInput, { fontSize: 32, color: '#2563EB', marginLeft: 4, height: 42 }]}
                value={baseRate}
                onChangeText={setBaseRate}
                keyboardType="numeric"
                autoFocus
                onBlur={() => setEditingField(null)}
              />
            ) : (
              <TouchableOpacity onPress={() => setEditingField('baseRate')}>
                <Text style={styles.baseAmount}>
                  {parseInt(baseRate).toLocaleString() || '0'}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.baseUnit}>/hour</Text>
          </View>
        </View>

        {/* Weekdays card */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingHeaderRow}>
            <Ionicons name="calendar-outline" size={18} color="#2563EB" />
            <Text style={styles.pricingHeaderText}>WEEKDAYS</Text>
          </View>

          {renderPricingRow(
            'weekdayMorning',
            'MORNING (OFF-PEAK)',
            '6AM – 4PM',
            weekdayMorning,
            setWeekdayMorning
          )}
          {renderPricingRow(
            'weekdayEvening',
            'EVENING (PEAK)',
            '4PM – 12AM',
            weekdayEvening,
            setWeekdayEvening
          )}
        </View>

        {/* Weekends card */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingHeaderRow}>
            <Ionicons name="sunny-outline" size={18} color="#2563EB" />
            <Text style={styles.pricingHeaderText}>WEEKENDS</Text>
          </View>

          {renderPricingRow(
            'weekendMorning',
            'MORNING (OFF-PEAK)',
            '6AM – 3PM',
            weekendMorning,
            setWeekendMorning
          )}
          {renderPricingRow(
            'weekendEvening',
            'EVENING (PEAK)',
            '3PM – 12AM',
            weekendEvening,
            setWeekendEvening
          )}
        </View>
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
  baseCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  baseLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#9CA3AF',
  },
  baseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  baseRs: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  baseAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2563EB',
    marginLeft: 4,
  },
  baseUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  pricingCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pricingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingHeaderText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#9CA3AF',
  },
  priceSub: {
    marginTop: 2,
    fontSize: 11,
    color: '#9CA3AF',
  },
  priceCenter: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  priceInput: {
    minWidth: 80,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderColor: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    paddingVertical: 2,
  },
  editIconWrap: {
    paddingLeft: 4,
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
});

export default OwnerManagePricingScreen;

