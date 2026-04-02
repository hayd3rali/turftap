import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
            <View style={[styles.container, { paddingTop: insets.top }]}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                    <View style={styles.backBtn} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Text style={styles.lastUpdated}>Last Updated: October 24, 2023</Text>

                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.paragraph}>
                        Welcome to TurfTap. We respect your privacy and are committed to protecting it through this Privacy Policy. This policy describes the types of information we may collect from you or that you may provide when you visit the TurfTap mobile app and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                    <Text style={styles.paragraph}>
                        We collect several types of information from and about users of our app, including information by which you may be personally identified, such as name, postal address, e-mail address, telephone number, or any other identifier by which you may be contacted online or offline ("personal information").
                    </Text>

                    <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        We use information that we collect about you or that you provide to us, including any personal information:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• To present our app and its contents to you.</Text>
                        <Text style={styles.bulletItem}>• To provide you with information, products, or services that you request from us.</Text>
                        <Text style={styles.bulletItem}>• To fulfill any other purpose for which you provide it, such as processing bookings.</Text>
                        <Text style={styles.bulletItem}>• To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</Text>
                    </View>

                    <Text style={styles.sectionTitle}>4. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All payment transactions are encrypted using SSL technology.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Contact Information</Text>
                    <Text style={styles.paragraph}>
                        To ask questions or comment about this privacy policy and our privacy practices, contact us via the Help & Support interface inside the app or email us at admin@turftap.com.
                    </Text>

                </ScrollView>
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: { width: 32, justifyContent: 'center' },
    backArrow: { fontSize: 24, color: '#0F172A', fontWeight: '300' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },

    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },

    lastUpdated: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 24,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
        marginTop: 24,
    },
    paragraph: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 24,
    },
    bulletList: {
        marginTop: 8,
        paddingLeft: 8,
    },
    bulletItem: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 24,
        marginBottom: 4,
    },
});

export default PrivacyPolicyScreen;
