import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import InputField from '../InputField';
import AreaPickerModal from '../AreaPickerModal';
import MapLocationPicker from '../MapLocationPicker';

const LocationSection = ({
  selectedArea,
  setSelectedArea,
  specificAddress,
  setSpecificAddress,
  lat,
  setLat,
  lng,
  setLng,
  pinAddress,
  setPinAddress,
}) => {
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionIcon}>📍</Text>
        <Text style={styles.sectionTitle}>Location</Text>
      </View>
      <View style={styles.sectionBody}>
        <View style={styles.requiredLabelRow}>
          <Text style={styles.fieldLabel}>Area</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
        <TouchableOpacity
          style={styles.areaPicker}
          activeOpacity={0.8}
          onPress={() => setAreaModalVisible(true)}
        >
          <Text
            style={[
              styles.areaPickerText,
              !selectedArea && styles.areaPickerPlaceholder,
            ]}
          >
            {selectedArea || 'Select your area'}
          </Text>
          <Text style={styles.areaChevron}>▼</Text>
        </TouchableOpacity>

        <AreaPickerModal
          visible={areaModalVisible}
          onClose={() => setAreaModalVisible(false)}
          onSelect={(area) => setSelectedArea(area)}
          selectedArea={selectedArea}
        />

        <View style={styles.requiredLabelRow}>
          <Text style={styles.fieldLabel}>Specific Address</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
        <InputField
          placeholder="e.g. Block 4, near Maskan"
          value={specificAddress}
          onChangeText={setSpecificAddress}
        />

        <TouchableOpacity
          style={styles.mapButton}
          activeOpacity={0.8}
          onPress={() => setMapVisible(true)}
        >
          <Text style={styles.mapButtonIcon}>🗺</Text>
          <Text style={styles.mapButtonText}>Choose on Map</Text>
        </TouchableOpacity>
        {pinAddress ? (
          <Text style={{ fontSize: 12, color: '#2563EB', marginTop: 6 }}>
            📍 {pinAddress}
          </Text>
        ) : null}

        <MapLocationPicker
          visible={mapVisible}
          onClose={() => setMapVisible(false)}
          onConfirm={({ lat: l, lng: g, address: a }) => {
            setLat(l);
            setLng(g);
            setPinAddress(a);
            setMapVisible(false);
          }}
        />
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
  areaPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  areaPickerText: {
    fontSize: 14,
    color: '#1A1A2E',
  },
  areaPickerPlaceholder: {
    color: '#6B7280',
  },
  areaChevron: {
    fontSize: 12,
    color: '#6B7280',
  },
  mapButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 8,
  },
  mapButtonIcon: {
    fontSize: 16,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});

export default LocationSection;
