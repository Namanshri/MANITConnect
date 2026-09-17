const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

let initialized = false;

const getFirebaseAuth = () => {
    if (!initialized) {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            throw new Error("Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT on the server.");
        }

        let serviceAccount;
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch {
            throw new Error("FIREBASE_SERVICE_ACCOUNT must be valid JSON.");
        }

        if (!getApps().length) {
            initializeApp({ credential: cert(serviceAccount) });
        }
        initialized = true;
    }

    return getAuth();
};

const verifyFirebaseIdToken = (idToken) => {
    if (!idToken) {
        const error = new Error("Firebase ID token is required.");
        error.statusCode = 401;
        throw error;
    }

    return getFirebaseAuth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseIdToken };
