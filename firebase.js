// ==========================================
// SQUID TECH: Firebase Configuration
// ==========================================

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDunOb58N4jpKfcm8ldRMK2qA88XAdYpfM",
  authDomain: "squid-tech-game.firebaseapp.com",
  databaseURL: "https://squid-tech-game-default-rtdb.firebaseio.com",
  projectId: "squid-tech-game",
  storageBucket: "squid-tech-game.firebasestorage.app",
  messagingSenderId: "406147258782",
  appId: "1:406147258782:web:d02ca924b587f3a4fbde8f",
  measurementId: "G-XKVDK50ZFP"
};

// Initialize Firebase using global firebase object (loaded via CDN)
firebase.initializeApp(firebaseConfig);

const db = firebase.database();

console.log("🔥 Firebase initialized");