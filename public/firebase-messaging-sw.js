importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCS9AXx0PL6liU5OkSjekInjSosLZtDZfQ",
    authDomain: "easy-booking-52608.firebaseapp.com",
    projectId: "easy-booking-52608",
    storageBucket: "easy-booking-52608.firebasestorage.app",
    messagingSenderId: "317305194326",
    appId: "1:317305194326:web:440f0482eb6890212438f7"
});

const messaging = firebase.messaging();

//personalizzazione notifiche in backgroung
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});