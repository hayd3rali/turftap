import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const NotificationSettingsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [promoEnabled, setPromoEnabled] = useState(false);

    const toggleSwitch = (setter) => (value) => setter(value);

    return (
        <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
            <View style={[styles.container, { paddingTop: insets.top }]}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notification Settings</Text>
                    <View style={styles.backBtn} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionHeader}>BOOKING ALERTS</Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingTextCol}>
                            <Text style={styles.settingTitle}>Push Notifications</Text>
                            <Text style={styles.settingDesc}>Get instant alerts on your device for booking confirmations and reminders.</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: '#005BFF' }}
                            thumbColor={'#FFFFFF'}
                            onValueChange={toggleSwitch(setPushEnabled)}
                            value={pushEnabled}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingTextCol}>
                            <Text style={styles.settingTitle}>SMS Notifications</Text>
                            <Text style={styles.settingDesc}>Receive text messages for waitlist updates and urgent booking changes.</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: '#005BFF' }}
                            thumbColor={'#FFFFFF'}
                            onValueChange={toggleSwitch(setSmsEnabled)}
                            value={smsEnabled}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingTextCol}>
                            <Text style={styles.settingTitle}>Email Receipts</Text>
                            <Text style={styles.settingDesc}>Automatically email booking receipts and invoices to your registered email.</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: '#005BFF' }}
                            thumbColor={'#FFFFFF'}
                            onValueChange={toggleSwitch(setEmailEnabled)}
                            value={emailEnabled}
                        />
                    </View>

                    <Text style={[styles.sectionHeader, { marginTop: 24 }]}>MARKETING & PROMOTIONS</Text>

                    <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.settingTextCol}>
                            <Text style={styles.settingTitle}>Special Offers</Text>
                            <Text style={styles.settingDesc}>Get notified about special discounts, new turf locations, and events.</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: '#005BFF' }}
                            thumbColor={'#FFFFFF'}
                            onValueChange={toggleSwitch(setPromoEnabled)}
                            value={promoEnabled}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: { width: 32, justifyContent: 'center' },
    backArrow: { fontSize: 24, color: '#0F172A', fontWeight: '300' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },

    content: {
        paddingTop: 24,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginBottom: 8,
    },

    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    settingTextCol: {
        flex: 1,
        paddingRight: 24,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    settingDesc: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
});

export default NotificationSettingsScreen;
