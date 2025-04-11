import { initializeApp } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmYMTRcLb1fM-S2D3tFJhfAJSHdsx2x6I",
  authDomain: "ramkrishna-vidyamandir.firebaseapp.com",
  projectId: "ramkrishna-vidyamandir",
  storageBucket: "ramkrishna-vidyamandir.firebasestorage.app",
  messagingSenderId: "103989415186",
  appId: "1:103989415186:web:25083d5433d2ca4bf0f7cb",
  measurementId: "G-X4CP4Z3WZL",
  databaseURL: "https://ramkrishna-vidyamandir-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

// Database references
const noticesRef = ref(database, 'notices');
const studentsRef = ref(database, 'students');
const galleryRef = ref(database, 'gallery');

export { noticesRef, studentsRef, galleryRef };
