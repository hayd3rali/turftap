import React, { useState } from 'react'
import {
  View, Text, StyleSheet, Alert,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import InputField from '../components/InputField'
import PrimaryButton from '../components/PrimaryButton'
import { supabase } from '../services/supabase'

const ResetPasswordScreen = ({ navigation }) => {
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading,         setLoading]         = useState(false)

  const handleResetPassword = async () => {
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      })

      if (error) {
        Alert.alert('Error', error.message)
      } else {
        Alert.alert(
          'Password Updated ✓',
          'Your password has been reset successfully. You can now login.',
          [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
        )
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
      </TouchableOpacity>

      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Your new password must be at least 6 characters.
      </Text>

      <View style={styles.form}>
        <InputField
          label="New Password"
          placeholder="Enter new password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <InputField
          label="Confirm Password"
          placeholder="Confirm new password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <PrimaryButton
          title={loading ? 'Updating...' : 'Update Password'}
          onPress={handleResetPassword}
          disabled={loading}
        />
        {loading && (
          <ActivityIndicator
            color="#2563EB"
            style={{ marginTop: 8 }}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  backBtn: {
    marginTop: 16,
    marginBottom: 32,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
  },
  form: { gap: 16 },
})

export default ResetPasswordScreen
