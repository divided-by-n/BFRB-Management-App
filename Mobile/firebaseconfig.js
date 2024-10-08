import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAVgvwdBskGSpmKWRZ9DT9cxlP7mhhB8ek",
  authDomain: "bfrb-d7777.firebaseapp.com",
  databaseURL: "https://bfrb-d7777-default-rtdb.firebaseio.com",
  projectId: "bfrb-d7777",
  storageBucket: "bfrb-d7777.appspot.com",
  messagingSenderId: "470408026531",
  appId: "1:470408026531:web:f6539d8060ad65f747a216"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);
const FIREBASE_DATABASE = getDatabase(FIREBASE_APP);

export { FIREBASE_APP, FIREBASE_AUTH,   FIREBASE_DATABASE };
