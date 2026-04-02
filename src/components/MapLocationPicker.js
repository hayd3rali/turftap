import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, Modal, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'

const MapLocationPicker = ({ visible, onConfirm, onClose, initialLat, initialLng }) => {
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [markerCoord, setMarkerCoord] = useState({
    latitude:  initialLat || 24.8607,
    longitude: initialLng || 67.0011,
  })
  const [address, setAddress]     = useState('')
  const [searching, setSearching] = useState(false)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    if (visible) getUserLocation()
  }, [visible])

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLoading(false)
        return
      }
      const loc = await Location.getCurrentPositionAsync({})
      const coord = {
        latitude:  loc.coords.latitude,
        longitude: loc.coords.longitude,
      }
      setMarkerCoord(coord)
      reverseGeocode(coord)
    } catch (e) {
      setLoading(false)
    }
  }

  const reverseGeocode = async (coord) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord.latitude}&lon=${coord.longitude}&zoom=18&addressdetails=1`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'TurfTap/1.0' }
      })
      const data = await res.json()
      setAddress(data.display_name || 'Location selected')
    } catch (e) {
      setAddress('Location selected')
    } finally {
      setLoading(false)
    }
  }

  const searchLocation = async () => {
    if (!searchText.trim()) return
    setSearching(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText + ', Karachi, Pakistan')}&limit=1&addressdetails=1`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'TurfTap/1.0' }
      })
      const results = await res.json()
      if (results.length > 0) {
        const coord = {
          latitude:  parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon),
        }
        setMarkerCoord(coord)
        setAddress(results[0].display_name)
        mapRef.current?.animateToRegion({
          ...coord,
          latitudeDelta:  0.005,
          longitudeDelta: 0.005,
        }, 1000)
      } else {
        Alert.alert('Not Found', 'Could not find that location in Karachi.')
      }
    } catch (e) {
      Alert.alert('Error', 'Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleMapPress = (e) => {
    const coord = e.nativeEvent.coordinate
    setMarkerCoord(coord)
    reverseGeocode(coord)
  }

  const handleConfirm = () => {
    onConfirm({
      lat: markerCoord.latitude,
      lng: markerCoord.longitude,
      address: address,
    })
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pin Your Court Location</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search e.g. Gulshan Arena, DHA..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={searchLocation}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={searchLocation}
            disabled={searching}
          >
            {searching
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.searchBtnText}>Search</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Map */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#2563EB" size="large" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            mapType="standard"
            initialRegion={{
              latitude:       markerCoord.latitude,
              longitude:      markerCoord.longitude,
              latitudeDelta:  0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={markerCoord}
              title="Court Location"
              description={address}
              draggable
              onDragEnd={(e) => {
                const coord = e.nativeEvent.coordinate
                setMarkerCoord(coord)
                reverseGeocode(coord)
              }}
            />
          </MapView>
        )}

        {/* Selected Address */}
        <View style={styles.addressBar}>
          <Text style={styles.addressIcon}>📍</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {address || 'Tap on the map to select location'}
          </Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmBtnText}>Confirm Location</Text>
        </TouchableOpacity>

      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56,
    paddingBottom: 16, borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  closeText:    { fontSize: 14, color: '#1A1A2E', fontWeight: '600' },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  searchRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    paddingVertical: 12, gap: 8,
  },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 13,
    color: '#1A1A2E', backgroundColor: '#F9FAFB',
  },
  searchBtn: {
    backgroundColor: '#2563EB', borderRadius: 10,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  searchBtnText:    { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:      { marginTop: 12, fontSize: 14, color: '#6B7280' },
  map:              { flex: 1 },
  addressBar: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  addressIcon: { fontSize: 16, marginRight: 8, marginTop: 2 },
  addressText: { flex: 1, fontSize: 13, color: '#1A1A2E', lineHeight: 20 },
  confirmBtn: {
    backgroundColor: '#2563EB', marginHorizontal: 20,
    marginBottom: 32, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
})

export default MapLocationPicker
