import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseconfig';
import { useRouter } from 'expo-router';
import useStore from '../store/useStore';
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
    const router = useRouter();
    const user = useStore((state) => state.user);
    const setUser = useStore((state) => state.setUser);
    const alertDuration = useStore((state) => state.alertDuration);
    const setAlertDuration = useStore((state) => state.setAlertDuration);
    // const alertMethod = useStore((state) => state.alertMethod);
    const privacySettings = useStore((state) => state.privacySettings || { shareActivityData: false, allowNotifications: false });
    const setPrivacySettings = useStore((state) => state.setPrivacySettings);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        console.log('SettingsScreen useEffect:', { alertDuration, setAlertDuration });
        const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                router.push('/LogInScreen');
            }
        });

        checkNotificationPermissions();

        return unsubscribe;
    }, []);

    const handleLogout = () => {
        signOut(FIREBASE_AUTH)
            .then(() => {
                setUser(null);
                router.push('/LogInScreen');
            })
            .catch(error => {
                console.error("Sign out error", error);
            });
    };

    const handleSaveSettings = async () => {
        try {
            // await AsyncStorage.setItem('alertMethod', alertMethod);
            await AsyncStorage.setItem('alertDuration', alertDuration.toString());
            await AsyncStorage.setItem('privacySettings', JSON.stringify(privacySettings));
            Alert.alert('Success', 'Settings saved successfully');
            router.push('/MainPage');
        } catch (error) {
            console.error('Failed to save settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    const togglePrivacySetting = (setting) => {
        const updatedSettings = { ...privacySettings, [setting]: !privacySettings[setting] };
        setPrivacySettings(updatedSettings);
    };

    const checkNotificationPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            if (newStatus !== 'granted') {
                Alert.alert('Permission required', 'Please enable notifications in your settings.');
            }
            setNotificationsEnabled(newStatus === 'granted');
        } else {
            setNotificationsEnabled(true);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.push('/MainPage')}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.header}>Settings</Text>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Account Details</Text>
                <Text style={styles.text}>Email Address: {user?.email}</Text>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Privacy Settings and Alert Duration</Text>
                <View style={styles.row}>
                    <Text style={styles.text}>Share Activity Data</Text>
                    <Switch
                        value={privacySettings.shareActivityData}
                        onValueChange={() => togglePrivacySetting('shareActivityData')}
                    />
                </View>
                <View style={styles.row}>
                    <Text style={styles.text}>Allow Notifications</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={() => {
                            togglePrivacySetting('allowNotifications');
                            setNotificationsEnabled(!notificationsEnabled);
                        }}
                    />
                </View>
                <View style={styles.pickerContainer}>
                    <Text style={styles.text}>Alert Duration (minutes)</Text>
                    <Picker
                        selectedValue={alertDuration}
                        onValueChange={(itemValue) => setAlertDuration(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="1 minute" value="1" />
                        <Picker.Item label="2 minutes" value="2" />
                        <Picker.Item label="3 minutes" value="3" />
                        <Picker.Item label="4 minutes" value="4" />
                        <Picker.Item label="5 minutes" value="5" />
                    </Picker>
                </View>
            </View>
            
            <View style={styles.footerButtonsContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop:30,
        backgroundColor: '#D6C1A1',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    section: {
        marginTop:60,
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#FFF2DF',
        borderRadius: 10,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    pickerContainer: {
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#FFF2DF',
    },
    picker: {
        width: '100%',
    },
    footerButtonsContainer: {
        marginTop:80,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#FFF2DF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    saveButtonText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#FFF2DF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    logoutButtonText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
    },
});
