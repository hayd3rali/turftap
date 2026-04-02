import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity }from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../components/PrimaryButton';

const RoleSelectionScreen = ({ route, navigation }) => {
  const { phoneNumber } = route.params || {};
  const [selectedRole, setSelectedRole] = useState('Player');

  const handleContinue = () => {
    if (selectedRole === 'Owner') {
      navigation.navigate('OwnerSetup', { phoneNumber, role: 'Owner' });
    } else {
      navigation.navigate('SetupProfile', { phoneNumber, role: 'Player' });
    }
  };

  const isPlayer = selectedRole === 'Player';
  const isOwner = selectedRole === 'Owner';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentContainer}>
        {/* Progress bar */}
        <View style={styles.progressBarTrack}>
          <View style={styles.progressBarFill} />
        </View>

        {/* Title */}
        <Text style={styles.title}>How will you use</Text>
        <Text style={styles.titleHighlight}>TurfTap?</Text>
        <Text style={styles.subtitle}>
          Choose the account type that best fits your needs.
        </Text>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1 - Book Courts */}
          <TouchableOpacity
            style={[
              styles.card,
              isPlayer && styles.cardSelected,
            ]}
            onPress={() => setSelectedRole('Player')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🏟</Text>
              </View>
              {isPlayer && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTitle}>Book Courts</Text>
            <Text style={styles.cardSubtitle}>
              I'm an athlete looking for the best local sports facilities and hassle-free booking.
            </Text>
            <Text style={styles.cardLink}>Find venues →</Text>
          </TouchableOpacity>

          {/* Card 2 - Manage My Venue */}
          <TouchableOpacity
            style={[
              styles.card,
              isOwner && styles.cardSelected,
            ]}
            onPress={() => setSelectedRole('Owner')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>📋</Text>
                </View>
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>OWNER</Text>
                </View>
              </View>
              {isOwner && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTitle}>Manage My Venue</Text>
            <Text style={styles.cardSubtitle}>
              I want to list my facility, manage bookings, and grow my sports community.
            </Text>
            <Text style={styles.cardLink}>Start hosting →</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Continue button */}
        <PrimaryButton title="Continue" onPress={handleContinue} variant="blue" />
        <Text style={styles.footerText}>
          You can switch account types later in settings.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    marginBottom: 24,
  },
  progressBarFill: {
    height: 3,
    width: '60%',
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  titleHighlight: {
    fontSize: 26,
    fontWeight: '700',
    color: '#00C37A',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  cardsContainer: {
    marginTop: 24,
    rowGap: 16,
  },
  card: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ownerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
  ownerBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default RoleSelectionScreen;
