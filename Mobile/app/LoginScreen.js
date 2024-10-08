import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BeigeButton from '../components/BeigeButton';
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from '../firebaseconfig'; 

export default function LogInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // sign in with email and password
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      // Navigate to the main page upon successful login
      router.push('/MainPage');
    } catch (error) {
      alert("Login failed: " + error.message);
      console.error("Login error: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"  
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry  
      />
      <BeigeButton
        title="Log In"
        onPress={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D6C1A1', 
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '80%', 
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#F7EEE9',
    padding: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  button: {
    marginTop: 50,
  },
});

