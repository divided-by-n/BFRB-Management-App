import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import BeigeButton from '../components/BeigeButton';

export default function WelcomeScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/images/icon.png')} style={styles.logo} />
            </View>
            <Text style={styles.title}>Manage Your</Text>
            <Text style={styles.titleBold}>Nervous Habit</Text>
            <Text style={styles.subtitle}>Control Your</Text>
            <Text style={styles.subtitleBold}>Body-Focused Repetitive Behaviours</Text>
            {isLoading ? (
                <ActivityIndicator size="large" color="#000000" style={styles.spinner} />
            ) : (
                <View style={styles.buttonContainer}>
                    <BeigeButton title="Sign Up" onPress={() => router.push('/SignupScreen')} />
                    <BeigeButton title="Log In" onPress={() => router.push('/LoginScreen')} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D6C1A1',
        padding: 20,
    },
    header: {
        marginBottom: 50,
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 20,
        fontWeight: 'normal',
        textAlign: 'left',
        width: '100%',
    },
    titleBold: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'left',
        width: '100%',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'normal',
        textAlign: 'left',
        width: '100%',
    },
    subtitleBold: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'left',
        width: '100%',
        marginBottom: 40,
    },
    spinner: {
        marginVertical: 20,
    },
    buttonContainer: {
        marginTop: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statusText: {
        fontSize: 16,
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
});
