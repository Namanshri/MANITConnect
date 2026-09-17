/*
 * Firebase web configuration is public by design. Replace every value below
 * with the Web app configuration from Firebase Console -> Project settings.
 * Do not put the Firebase service-account JSON in this file.
 */
window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyDqXUwp8QEasz1lcDNKQcHCln705k5gvBw",
    authDomain: "manitconnect-feba2.firebaseapp.com",
    projectId: "manitconnect-feba2",
    storageBucket: "manitconnect-feba2.firebasestorage.app",
    messagingSenderId: "128582949736",
    appId: "1:128582949736:web:eaaad2df60426836b314dd"
};

if (window.FIREBASE_CONFIG.apiKey.startsWith("REPLACE_")) {
    console.error("Firebase is not configured. See FIREBASE_SETUP.md.");
} else {
    firebase.initializeApp(window.FIREBASE_CONFIG);
}
