import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InputField from '../InputField';

const VenueIdentitySection = ({
  courtName,
  setCourtName,
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionIcon}>📋</Text>
        <Text style={styles.sectionTitle}>Venue Identity</Text>
      </View>
      <View style={styles.sectionBody}>
        <View style={styles.requiredLabelRow}>
          <Text style={styles.fieldLabel}>Court Name</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
        <InputField
          placeholder="e.g. Dream Arena Futsal"
          value={courtName}
          onChangeText={setCourtName}
        />

        <View style={styles.requiredLabelRow}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
        <InputField
          placeholder="manager@venue.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <InputField
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <InputField
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
        />
        <InputField
          label="Password"
          placeholder="Create a password (min 6 characters)"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <InputField
          label="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
});

export default VenueIdentitySection;
