import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const BrownButton = ({ onPress, title }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#D6C1A1', 
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    alignSelf: 'center', 
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000',
  },
});

export default BrownButton;
