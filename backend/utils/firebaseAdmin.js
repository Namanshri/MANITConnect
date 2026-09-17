const admin = require("firebase-admin");

let initialized = false;

const getAuth = () => {
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

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        initialized = true;
    }

    return admin.auth();
};

const verifyFirebaseIdToken = (idToken) => {
    if (!idToken) {
        const error = new Error("Firebase ID token is required.");
        error.statusCode = 401;
        throw error;
    }

    return getAuth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseIdToken };
