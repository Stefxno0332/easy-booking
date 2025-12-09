importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCS9AXx0PL6liU5OkSjekInjSosLZtDZfQ",
    authDomain: "easy-booking-52608.firebaseapp.com",
    projectId: "easy-booking-52608",
    storageBucket: "easy-booking-52608.firebasestorage.app",
    messagingSenderId: "317305194326",
    appId: "1:317305194326:web:440f0482eb6890212438f7"
});

const messaging = firebase.messaging();
// Firebase gestisce automaticamente le notifiche in background con i dati standard