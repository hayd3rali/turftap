import React from 'react'
import {
  View, Text, Image, TouchableOpacity, StyleSheet
} from 'react-native'
import { Colors } from '../constants/colors'

const CourtCard = ({ court, onPress }) => {
  const {
    name     = 'Court',
    price    = '',
    price_base,
    rating   = 4.5,
    reviews  = 0,
    imageUrl,
    images,
    area     = '',
    sport    = [],
  } = court || {}

  // Get best available image
  const imageSource = imageUrl ||
    (Array.isArray(images) && images.length > 0 ? images[0] : null)

  // Format price
  const displayPrice = price ||
    (price_base ? `Rs. ${parseInt(price_base).toLocaleString()}/hr` : 'Rs. 0/hr')

  // Format sport tags
  const sportTags = Array.isArray(sport)
    ? sport.join(' · ')
    : sport || ''

  return (
    <View style={styles.card}>
      {/* Court Image */}
      {imageSource ? (
        <Image
          source={{ uri: imageSource }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>🏟</Text>
        </View>
      )}

      {/* Card Content */}
      <View style={styles.content}>
        {/* Court Name */}
        <Text style={styles.name} numberOfLines={1}>{name}</Text>

        {/* Area + Sport */}
        <Text style={styles.meta} numberOfLines={1}>
          📍 {area}{sportTags ? `  •  ${sportTags}` : ''}
        </Text>

        {/* Rating + Price Row */}
        <View style={styles.row}>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>
              {typeof rating === 'number' ? rating.toFixed(1) : rating}
            </Text>
            {reviews > 0 && (
              <Text style={styles.reviews}>({reviews})</Text>
            )}
          </View>
          <Text style={styles.price}>{displayPrice}</Text>
        </View>

        {/* Book Now Button */}
        <TouchableOpacity style={styles.bookBtn} onPress={onPress}>
          <Text style={styles.bookBtnText}>BOOK NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:  Colors.bgSurface,
    borderRadius:     16,
    overflow:         'hidden',
    marginBottom:     16,
    elevation:        3,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.08,
    shadowRadius:     8,
  },
  image: {
    width:  '100%',
    height: 180,
  },
  imagePlaceholder: {
    width:           '100%',
    height:          180,
    backgroundColor: Colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize:   17,
    fontWeight: '700',
    color:      Colors.textDark,
    marginBottom: 4,
  },
  meta: {
    fontSize:     12,
    color:        Colors.textMuted,
    marginBottom: 8,
  },
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  star:    { fontSize: 13 },
  rating: {
    fontSize:   13,
    fontWeight: '600',
    color:      Colors.textDark,
  },
  reviews: {
    fontSize: 12,
    color:    Colors.textLight,
  },
  price: {
    fontSize:   14,
    fontWeight: '700',
    color:      Colors.primary,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    borderRadius:    10,
    paddingVertical: 12,
    alignItems:      'center',
  },
  bookBtnText: {
    color:      Colors.bgSurface,
    fontSize:   13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})

export default CourtCard

