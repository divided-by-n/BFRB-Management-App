import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabase, ref, set, push } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import useStore from '../store/useStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddBehaviourScreen() {
    const [behaviour, setBehaviour] = useState('Nail Biting');
    const [location, setLocation] = useState('Home');
    const [mood, setMood] = useState('Anxious');
    const [timestamp, setTimestamp] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [duration, setDuration] = useState('1');
    const router = useRouter();
    const setUser = useStore((state) => state.setUser);
    const user = useStore((state) => state.user);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                loadDefaultDuration(); // Load the default duration from settings
            } else {
                router.push('/LogInScreen');
            }
        });

        return unsubscribe;
    }, []);

    const loadDefaultDuration = async () => {
        try {
            const savedDuration = await AsyncStorage.getItem('alertDuration');
            if (savedDuration !== null) {
                setDuration(savedDuration);
            } else {
                setDuration('1'); // Fallback default value if none is found
            }
        } catch (error) {
            console.error('Failed to load default duration:', error);
            setDuration('1'); // Fallback default value if there's an error
        }
    };

    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const saveBehaviour = async () => {
        if (!user) {
            Alert.alert('Error', 'No user is signed in.');
            return;
        }

        try {
            const db = getDatabase();
            const userBehavioursRef = ref(db, `users/${user.uid}/behaviors`);
            const newBehaviorRef = push(userBehavioursRef); // Generate a new unique key
            await set(newBehaviorRef, {
                behaviour,
                location,
                mood,
                timestamp: timestamp.toISOString(),
                duration,
                date: `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}`,
            });
            Alert.alert('Success', 'Behaviour added successfully');
            router.push('/MainPage');
        } catch (e) {
            console.error("Error adding behaviour: ", e);
            Alert.alert('Error', 'Failed to add behaviour');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Add the Behaviour</Text>

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTimePicker}>
                <Text>{formatTime(timestamp)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={timestamp}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        const currentDate = selectedDate || timestamp;
                        setTimestamp(currentDate);
                    }}
                    style={styles.dateTimePicker}
                />
            )}

            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select the Behaviour</Text>
                <Picker
                    selectedValue={behaviour}
                    onValueChange={(itemValue) => setBehaviour(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Nail Biting" value="Nail Biting" />
                    <Picker.Item label="Hair Pulling" value="Hair Pulling" />
                    <Picker.Item label="Skin Picking (Face)" value="Skin Picking (Face)" />
                    <Picker.Item label="Other" value="Other" />
                </Picker>
            </View>

            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select the Location</Text>
                <Picker
                    selectedValue={location}
                    onValueChange={(itemValue) => setLocation(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Home" value="Home" />
                    <Picker.Item label="School" value="School" />
                    <Picker.Item label="Work" value="Work" />
                    <Picker.Item label="Out" value="Out" />
                    <Picker.Item label="Other" value="Other" />
                </Picker>
            </View>

            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select the Mood</Text>
                <Picker
                    selectedValue={mood}
                    onValueChange={(itemValue) => setMood(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Anxious" value="Anxious" />
                    <Picker.Item label="Calm" value="Calm" />
                    <Picker.Item label="Sad" value="Sad" />
                    <Picker.Item label="Happy" value="Happy" />
                </Picker>
            </View>

            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select the Duration</Text>
                <Picker
                    selectedValue={duration}
                    onValueChange={(itemValue) => setDuration(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="1 minute" value="1" />
                    <Picker.Item label="2 minutes" value="2" />
                    <Picker.Item label="3 minutes" value="3" />
                    <Picker.Item label="4 minutes" value="4" />
                    <Picker.Item label="5 minutes" value="5" />
                </Picker>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={saveBehaviour}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => router.push('/MainPage')}>
                    <Text style={styles.buttonText}>Discard</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#D6C1A1',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 30,
        textAlign: 'center',
    },
    dateTimePicker: {
        marginBottom: 20,
        width: '100%',
        padding: 10,
        backgroundColor: '#F7EEE9',
        borderRadius: 10,
        textAlign: 'center',
    },
    pickerContainer: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#F7EEE9',
        padding: 10,
    },
    pickerLabel: {
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
    picker: {
        width: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#F7EEE9',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    buttonText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
    },
});
