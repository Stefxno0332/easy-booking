/*
 Cloud Functions per Easy Booking
 Inviano notifiche push quando vengono create o cancellate prenotazioni
*/

const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");

// Inizializzazione firebase admin
initializeApp();

setGlobalOptions({ maxInstances: 3 });

// Trigger: quando si crea una nuova prenotazione
exports.inviaNotificaNuovaPrenotazione = onDocumentCreated(
    "prenotazioni/{id}",
    async (event) => {

        // Ottengo dati dalla prenotazione
        const prenotazione = event.data.data();
        const emailAdmin = prenotazione.emailAdmin;
        const email = prenotazione.email;
        const title = prenotazione.title;

        // Prendo i token dell'utente e dell'admin
        const db = getFirestore();

        // Recupero i token dell'utente e dell'admin
        const tokensSnapshotUser = await db.collection("users").doc(email).collection("tokens").get();
        const tokensSnapshotAdmin = await db.collection("users").doc(emailAdmin).collection("tokens").get();

        // Raccolgo tutti i token
        const tokens = [];
        tokensSnapshotUser.forEach(doc => tokens.push(doc.data().token));
        tokensSnapshotAdmin.forEach(doc => tokens.push(doc.data().token));

        console.log("Tokens trovati:", tokens);

        if (tokens.length === 0) {
            console.log("Nessun token trovato");
            return;
        }

        // Preparo la notifica
        const message = {
            notification: {
                title: "Nuova prenotazione nel calendario: " + emailAdmin,
                body: "email: " + email + " - title: " + title,
            },
            tokens: tokens,
        };

        // Invio la notifica
        const response = await getMessaging().sendEachForMulticast(message);
        console.log("Notifiche inviate:", response.successCount, "su", tokens.length);
    }
);

// Trigger: quando si cancella una prenotazione
exports.inviaNotificaCancellaPrenotazione = onDocumentDeleted(
    "prenotazioni/{id}",
    async (event) => {

        // Ottengo dati dalla prenotazione cancellata
        const prenotazione = event.data.data();
        const emailAdmin = prenotazione.emailAdmin;
        const email = prenotazione.email;
        const title = prenotazione.title;

        // Prendo i token dell'utente e dell'admin
        const db = getFirestore();

        // Recupero i token dell'utente e dell'admin
        const tokensSnapshotUser = await db.collection("users").doc(email).collection("tokens").get();
        const tokensSnapshotAdmin = await db.collection("users").doc(emailAdmin).collection("tokens").get();

        // Raccolgo tutti i token
        const tokens = [];
        tokensSnapshotUser.forEach(doc => tokens.push(doc.data().token));
        tokensSnapshotAdmin.forEach(doc => tokens.push(doc.data().token));

        console.log("Tokens trovati:", tokens);

        if (tokens.length === 0) {
            console.log("Nessun token trovato");
            return;
        }

        // Preparo la notifica
        const message = {
            notification: {
                title: "Prenotazione cancellata nel calendario: " + emailAdmin,
                body: "email: " + email + " - title: " + title,
            },
            tokens: tokens,
        };

        // Invio la notifica
        const response = await getMessaging().sendEachForMulticast(message);
        console.log("Notifiche inviate:", response.successCount, "su", tokens.length);
    }
);
