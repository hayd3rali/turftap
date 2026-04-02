import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/userSlice';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

const PersonalInfoScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();

    const { profileDetails, profile } = useSelector((state) => state.user);

    // Default values or values from Redux
    const [firstName, setFirstName] = useState(
        profileDetails?.first_name || profile?.first_name || ''
    );
    const [lastName, setLastName] = useState(
        profileDetails?.last_name || profile?.last_name || ''
    );
    const [email, setEmail] = useState(
        profileDetails?.email || profile?.email || ''
    );
    const [phone, setPhone] = useState(
        profileDetails?.phone || profile?.phone || ''
    );
    const [area, setArea] = useState(
        profileDetails?.area || profile?.area || ''
    );
    const [profileImage, setProfileImage] = useState(profileDetails?.profileImage || null);

    const [activeField, setActiveField] = useState(null);

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("You've refused to allow this app to access your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType?.Images ?? 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        const result = await dispatch(updateProfile({
            first_name: firstName.trim(),
            last_name:  lastName.trim(),
            email:      email.trim().toLowerCase(),
            area,
        }))
        if (updateProfile.fulfilled.match(result)) {
            Alert.alert('Saved \u2713', 'Your details have been updated.')
        } else {
            Alert.alert('Error', 'Could not save changes.')
        }
    };

    // Helper to render an input that mimics the screenshot's style on focus
    const renderInput = (label, value, onChange, fieldName, props = {}) => {
        const isFocused = activeField === fieldName;
        return (
            <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, isFocused && styles.inputLabelFocused]}>
                    {label.toUpperCase()}
                </Text>
                <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
                    <InputField
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setActiveField(fieldName)}
                        onBlur={() => setActiveField(null)}
                        style={styles.overrideInput}
                        {...props}
                    />
                    {/* E.g. Checkmark for email when focused based on screenshot */}
                    {isFocused && fieldName === 'email' && (
                        <Text style={styles.checkIcon}>☑️</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
            <View style={[styles.container, { paddingTop: insets.top }]}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Personal Info</Text>
                    <View style={styles.backBtn} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Avatar */}
                    <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} activeOpacity={0.8}>
                        <View style={styles.avatarCircle}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarPlaceholder}>📷</Text>
                            )}
                        </View>
                        <View style={styles.cameraBadge}>
                            <Text style={styles.cameraBadgeIcon}>📸</Text>
                        </View>
                    </TouchableOpacity>

                    {renderInput('First Name', firstName, setFirstName, 'firstName')}
                    {renderInput('Last Name', lastName, setLastName, 'lastName')}
                    {renderInput('Email Address', email, setEmail, 'email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
                    {renderInput('Phone Number', phone, setPhone, 'phone', { keyboardType: 'phone-pad' })}

                </ScrollView>

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
                    <PrimaryButton
                        title="UPDATE PROFILE"
                        onPress={handleUpdate}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#FFFFFF' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: { width: 32, justifyContent: 'center' },
    backArrow: { fontSize: 24, color: '#000000', fontWeight: '300' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#000000' },

    scrollContent: {
        padding: 24,
    },

    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
        alignSelf: 'center',
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#005BFF',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarPlaceholder: {
        fontSize: 32,
    },
    cameraBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#005BFF',
        position: 'absolute',
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cameraBadgeIcon: {
        fontSize: 14,
    },

    inputWrap: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    inputLabelFocused: {
        color: '#005BFF',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        paddingRight: 12,
    },
    inputContainerFocused: {
        borderColor: '#005BFF',
        borderWidth: 2,
    },
    overrideInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: '#0F172A',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    checkIcon: {
        fontSize: 16,
        color: '#005BFF',
    },

    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
});

export default PersonalInfoScreen;
