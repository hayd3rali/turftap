import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const HelpSupportScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const handleEmailUs = () => {
        Linking.openURL('mailto:admin@turftap.com');
    };

    const handleCallUs = () => {
        Linking.openURL('tel:+1234567890');
    };

    return (
        <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
            <View style={[styles.container, { paddingTop: insets.top }]}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={styles.backBtn} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>How can we help you?</Text>
                    <Text style={styles.description}>
                        If you have any questions or are experiencing issues with the TurfTap app, feel free to reach out to our admin team directly. We are here to assist you!
                    </Text>

                    {/* Contact Cards */}
                    <View style={styles.contactCard}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconTxt}>✉️</Text>
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Email Us</Text>
                            <Text style={styles.contactValue}>admin@turftap.com</Text>
                        </View>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleEmailUs}>
                            <Text style={styles.actionBtnTxt}>Email</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contactCard}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconTxt}>📞</Text>
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Call Us</Text>
                            <Text style={styles.contactValue}>+1 (234) 567-890</Text>
                        </View>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleCallUs}>
                            <Text style={styles.actionBtnTxt}>Call</Text>
                        </TouchableOpacity>
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
        padding: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 22,
        marginBottom: 32,
    },

    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconTxt: {
        fontSize: 20,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    actionBtn: {
        backgroundColor: '#0F172A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionBtnTxt: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default HelpSupportScreen;
