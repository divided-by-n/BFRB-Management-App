import 'react-native-gesture-handler';
import React from 'react';
import WelcomeScreen from './WelcomeScreen';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Unknown event handler property']);


export default function App() {
    return (
        // <Slot>
            <WelcomeScreen />
        // </Slot>
    );
}
