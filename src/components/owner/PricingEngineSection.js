import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../InputField';

const SPORT_OPTIONS = ['Padel', 'Cricket', 'Futsal'];

const PricingEngineSection = ({
  baseRate,
  setBaseRate,
  weekdayMorning,
  setWeekdayMorning,
  weekdayEvening,
  setWeekdayEvening,
  weekendMorning,
  setWeekendMorning,
  weekendEvening,
  setWeekendEvening,
  selectedSports,
  setSelectedSports,
}) => {
  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionIcon}>💰</Text>
        <Text style={styles.sectionTitle}>Pricing Engine</Text>
      </View>
      <View style={styles.sectionBody}>
        <View style={styles.requiredLabelRow}>
          <Text style={styles.fieldLabel}>Base Rate per hour (PKR)</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
        <InputField
          placeholder="e.g. 3500"
          value={baseRate}
          onChangeText={setBaseRate}
          keyboardType="numeric"
        />

        <Text style={styles.fieldLabel}>Sports Offered (select all that apply)</Text>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
          Select every sport your court supports
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {SPORT_OPTIONS.map(sport => {
            const isSelected = selectedSports.includes(sport)
            return (
              <TouchableOpacity
                key={sport}
                onPress={() => {
                  if (isSelected) {
                    // Deselect — but keep at least 1 selected
                    if (selectedSports.length > 1) {
                      setSelectedSports(prev => prev.filter(s => s !== sport))
                    }
                  } else {
                    setSelectedSports(prev => [...prev, sport])
                  }
                }}
                style={{
                  borderWidth: 2,
                  borderColor: isSelected ? '#2563EB' : '#E5E7EB',
                  borderRadius: 999,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: isSelected ? '#EFF6FF' : '#F9FAFB',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
                )}
                <Text style={{
                  color: isSelected ? '#2563EB' : '#6B7280',
                  fontWeight: isSelected ? '700' : '400',
                  fontSize: 14,
                }}>
                  {sport}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={styles.subSectionLabel}>● WEEKDAYS</Text>
        <View style={styles.rowGap}>
          <View style={styles.flexItem}>
            <View style={styles.requiredLabelRow}>
              <Text style={styles.fieldLabel}>Morning (Off-Peak)</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <InputField
              placeholder="Price"
              value={weekdayMorning}
              onChangeText={setWeekdayMorning}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.flexItem}>
            <View style={styles.requiredLabelRow}>
              <Text style={styles.fieldLabel}>Evening (Peak)</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <InputField
              placeholder="Price"
              value={weekdayEvening}
              onChangeText={setWeekdayEvening}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.subSectionLabel}>● WEEKENDS</Text>
        <View style={styles.rowGap}>
          <View style={styles.flexItem}>
            <View style={styles.requiredLabelRow}>
              <Text style={styles.fieldLabel}>Morning (Off-Peak)</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <InputField
              placeholder="Price"
              value={weekendMorning}
              onChangeText={setWeekendMorning}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.flexItem}>
            <View style={styles.requiredLabelRow}>
              <Text style={styles.fieldLabel}>Evening (Peak)</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <InputField
              placeholder="Price"
              value={weekendEvening}
              onChangeText={setWeekendEvening}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  sectionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionBody: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  requiredLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginBottom: 2,
  },
  requiredMark: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
  },
  sportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  sportChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  sportChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sportChipText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  sportChipTextActive: { color: '#FFFFFF' },
  subSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 12,
    marginBottom: 4,
  },
  rowGap: {
    flexDirection: 'row',
    columnGap: 12,
  },
  flexItem: {
    flex: 1,
  },
});

export default PricingEngineSection;
