import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore"
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyCS9AXx0PL6liU5OkSjekInjSosLZtDZfQ",
  authDomain: "easy-booking-52608.firebaseapp.com",
  projectId: "easy-booking-52608",
  storageBucket: "easy-booking-52608.firebasestorage.app",
  messagingSenderId: "317305194326",
  appId: "1:317305194326:web:440f0482eb6890212438f7"
};

// Connessione a firebase
const app = initializeApp(firebaseConfig);

//inizializzo auth
const auth = getAuth(app)

// InitializeFirestore prevede paramtetri custom a differenza di getFirestore
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) // Cache locale per i tab
})

//inizializzo le notifiche e controllando se sono permesse nel browser
let messaging = null
if ('Notification' in window) {
  messaging = getMessaging(app)
}


export { db, auth, messaging, getToken, onMessage }