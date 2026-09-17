# Firebase email verification setup

This project now uses Firebase Authentication only to prove that an applicant
controls their email address. MANITConnect still stores profiles in Neon and
creates its own HttpOnly session cookie on Render.

1. Create a Firebase project and enable **Authentication -> Sign-in method -> Email/Password**.
2. Add a Web app. Copy its configuration into `frontend/shared/firebase-config.js`.
3. In Firebase Authentication -> Settings -> Authorized domains, add your Vercel hostname (for example, `your-app.vercel.app`) and `localhost` for local testing.
4. In Firebase Console -> Project settings -> Service accounts, generate a new private key. In Render, add an environment variable named `FIREBASE_SERVICE_ACCOUNT` whose value is the entire downloaded JSON file on one line. Keep it secret; never put it in Vercel or Git.
5. In Neon, run [the one-time migration](backend/database/firebase-auth-migration.sql). Then add the same Vercel URL to Render's `FRONTEND_URL`, deploy Render, and deploy Vercel.

New registrations receive Firebase's verification email. The account remains
blocked until the recipient uses its verification link and then logs in.

Firebase email templates can be edited in Authentication -> Templates. The
Firebase sending address does not require you to own a domain.
