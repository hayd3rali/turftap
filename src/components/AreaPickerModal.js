// A reusable searchable dropdown modal for Karachi areas
// Props: visible, onSelect(area), onClose, selectedArea

import React, { useState, useMemo } from 'react'
import {
  Modal, View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, SafeAreaView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Complete Karachi areas list
const KARACHI_AREAS = [
  // Central
  'Gulshan-e-Iqbal', 'Gulshan-e-Iqbal Block 1', 'Gulshan-e-Iqbal Block 2',
  'Gulshan-e-Iqbal Block 3', 'Gulshan-e-Iqbal Block 4', 'Gulshan-e-Iqbal Block 5',
  'Gulshan-e-Iqbal Block 6', 'Gulshan-e-Iqbal Block 7', 'Gulshan-e-Iqbal Block 10A',
  'Gulshan-e-Iqbal Block 10B', 'Gulshan-e-Iqbal Block 13A', 'Gulshan-e-Iqbal Block 13B',
  'Gulshan-e-Iqbal Block 13C', 'Gulshan-e-Iqbal Block 13D',
  // DHA
  'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4',
  'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8',
  'DHA City', 'DHA Clifton',
  // Clifton
  'Clifton Block 1', 'Clifton Block 2', 'Clifton Block 3', 'Clifton Block 4',
  'Clifton Block 5', 'Clifton Block 6', 'Clifton Block 7', 'Clifton Block 8',
  'Clifton Block 9',
  // Johar
  'Gulistan-e-Johar Block 1', 'Gulistan-e-Johar Block 2', 'Gulistan-e-Johar Block 3',
  'Gulistan-e-Johar Block 4', 'Gulistan-e-Johar Block 5', 'Gulistan-e-Johar Block 6',
  'Gulistan-e-Johar Block 7', 'Gulistan-e-Johar Block 10', 'Gulistan-e-Johar Block 11',
  'Gulistan-e-Johar Block 12', 'Gulistan-e-Johar Block 13', 'Gulistan-e-Johar Block 14',
  'Gulistan-e-Johar Block 15', 'Gulistan-e-Johar Block 16', 'Gulistan-e-Johar Block 17',
  // North Nazimabad
  'North Nazimabad Block A', 'North Nazimabad Block B', 'North Nazimabad Block C',
  'North Nazimabad Block D', 'North Nazimabad Block E', 'North Nazimabad Block F',
  'North Nazimabad Block G', 'North Nazimabad Block H', 'North Nazimabad Block J',
  'North Nazimabad Block K', 'North Nazimabad Block L', 'North Nazimabad Block M',
  'North Nazimabad Block N', 'North Nazimabad Block P', 'North Nazimabad Block Q',
  'North Nazimabad Block R',
  // Saddar & Central
  'Saddar', 'Saddar Town', 'Soldier Bazaar', 'Garden', 'Ranchore Line',
  'Lyari', 'Kharadar', 'Mithadar',
  // Korangi
  'Korangi', 'Korangi Creek', 'Korangi Industrial Area',
  'Landhi', 'Shah Faisal Colony', 'Bin Qasim',
  // Malir
  'Malir', 'Malir City', 'Malir Halt', 'Malir Cantonment',
  'Model Colony', 'Scheme 33', 'Scheme 45',
  // PECHS & Bahadurabad
  'PECHS Block 2', 'PECHS Block 3', 'PECHS Block 6',
  'Bahadurabad', 'Nursery', 'Tariq Road',
  // Federal B Area
  'Federal B Area Block 1', 'Federal B Area Block 2', 'Federal B Area Block 3',
  'Federal B Area Block 4', 'Federal B Area Block 5', 'Federal B Area Block 6',
  'Federal B Area Block 7', 'Federal B Area Block 8', 'Federal B Area Block 9',
  'Federal B Area Block 10', 'Federal B Area Block 11', 'Federal B Area Block 12',
  'Federal B Area Block 13', 'Federal B Area Block 14', 'Federal B Area Block 16',
  'Federal B Area Block 17', 'Federal B Area Block 18', 'Federal B Area Block 19',
  // Nazimabad
  'Nazimabad', 'Nazimabad Block 1', 'Nazimabad Block 2', 'Nazimabad Block 3',
  'Nazimabad Block 4', 'Nazimabad Block 5',
  // Others
  'Orangi Town', 'Baldia Town', 'Site Area', 'Liaquatabad',
  'New Karachi', 'Surjani Town', 'Paposh Nagar', 'Golimar',
  'Keamari', 'Manora', 'Hawks Bay',
  'Bahria Town Karachi', 'Bahria Town Precinct 1', 'Bahria Town Precinct 10',
  'Bahria Town Precinct 19', 'Bahria Town Precinct 27',
  'Askari 3', 'Askari 4', 'Askari 5',
  'Cantt', 'Karachi Cantonment',
  'University Road', 'Abul Hassan Isphahani Road',
  'Shahra-e-Faisal', 'M.A Jinnah Road',
  'Defence View', 'KDA Scheme 1', 'KDA Scheme 24',
  'PIB Colony', 'Buffer Zone', 'Teen Hatti',
  'Gulbahar', 'Ancholi', 'Azizabad',
  'Pak Colony', 'Metroville', 'Al Falah',
].sort()  // alphabetical

const AreaPickerModal = ({ visible, onSelect, onClose, selectedArea }) => {
  const [searchText, setSearchText] = useState('')

  const filteredAreas = useMemo(() => {
    if (!searchText.trim()) return KARACHI_AREAS
    return KARACHI_AREAS.filter(area =>
      area.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [searchText])

  const handleSelect = (area) => {
    onSelect(area)
    setSearchText('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title */}
        <Text style={styles.title}>Select Your Area</Text>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Type to search e.g. Gulshan, DHA..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus={true}
            autoCapitalize="none"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Results count */}
        <Text style={styles.resultsCount}>
          {filteredAreas.length} area{filteredAreas.length !== 1 ? 's' : ''} found
        </Text>

        {/* Areas List */}
        <FlatList
          data={filteredAreas}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.areaRow,
                selectedArea === item && styles.areaRowSelected
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text style={[
                styles.areaText,
                selectedArea === item && styles.areaTextSelected
              ]}>
                {item}
              </Text>
              {selectedArea === item && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No areas found for "{searchText}"</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          )}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16,
  },
  title: {
    fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1, fontSize: 14, color: '#1A1A2E',
  },
  clearBtn: { fontSize: 14, color: '#9CA3AF', paddingLeft: 8 },
  resultsCount: {
    fontSize: 11, color: '#9CA3AF', marginBottom: 8,
  },
  areaRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 4,
  },
  areaRowSelected: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 8 },
  areaText: { fontSize: 14, color: '#1A1A2E' },
  areaTextSelected: { color: '#2563EB', fontWeight: '600' },
  checkmark: { fontSize: 16, color: '#2563EB', fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#F3F4F6' },
  emptyContainer: { alignItems: 'center', paddingTop: 32 },
  emptyText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  emptySubtext: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
})

export { KARACHI_AREAS }
export default AreaPickerModal
