// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCn5bch3kbtD3je7rTyp3Dcp90DpGaZo44",
    authDomain: "gen-itinerary.firebaseapp.com",
    projectId: "gen-itinerary",
    storageBucket: "gen-itinerary.firebasestorage.app",
    messagingSenderId: "13799681980",
    appId: "1:13799681980:web:a26c88d639dfd559c4c5b9",
    measurementId: "G-BKFQ9DG0F9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };