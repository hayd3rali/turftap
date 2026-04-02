import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const MediaSection = ({ imageAssets, setImageAssets }) => {
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      setImageAssets((prev) => [...prev, ...result.assets].slice(0, 6));
    }
  };

  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionIcon}>🖼</Text>
        <Text style={styles.sectionTitle}>Media</Text>
      </View>
      <View style={styles.mediaHeaderRow}>
        <Text style={styles.mediaCountText}>Min 2 · Max 6</Text>
      </View>
      <View style={styles.mediaRow}>
        <TouchableOpacity
          style={styles.mediaBoxMain}
          activeOpacity={0.8}
          onPress={handlePickImage}
        >
          {imageAssets[0] ? (
            <Image
              source={{ uri: imageAssets[0].uri || imageAssets[0] }}
              style={styles.mediaImage}
            />
          ) : (
            <>
              <Ionicons
                name="camera"
                size={24}
                color="#9CA3AF"
                style={{ marginBottom: 4 }}
              />
              <Text style={styles.mediaMainLabel}>Main</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mediaBoxSecondary}
          activeOpacity={0.8}
          onPress={handlePickImage}
        >
          {imageAssets[1] ? (
            <Image
              source={{ uri: imageAssets[1].uri || imageAssets[1] }}
              style={styles.mediaImage}
            />
          ) : (
            <>
              <Text style={styles.mediaAddIcon}>+</Text>
              <Text style={styles.mediaAddLabel}>Add Pic</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mediaBoxSecondary}
          activeOpacity={0.8}
          onPress={handlePickImage}
        >
          {imageAssets[2] ? (
            <Image
              source={{ uri: imageAssets[2].uri || imageAssets[2] }}
              style={styles.mediaImage}
            />
          ) : (
            <>
              <Text style={styles.mediaAddIcon}>+</Text>
              <Text style={styles.mediaAddLabel}>Add Pic</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.mediaHintText}>
        First photo will be used as the main display image. The rest will appear
        in the gallery. Include high-quality photos of the place and ambiance.
      </Text>
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
  mediaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  mediaCountText: {
    fontSize: 11,
    color: '#6B7280',
  },
  mediaRow: {
    flexDirection: 'row',
    marginTop: 8,
    columnGap: 12,
  },
  mediaBoxMain: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaMainLabel: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
  mediaBoxSecondary: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaAddIcon: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  mediaAddLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  mediaHintText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MediaSection;
