const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword?.addEventListener("click", () => {
    const visible = passwordInput.type === "text";
    passwordInput.type = visible ? "password" : "text";
    togglePassword.querySelector("i")?.classList.toggle("fa-eye-slash", !visible);
    togglePassword.querySelector("i")?.classList.toggle("fa-eye", visible);
});

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const submitBtn = loginForm.querySelector("button[type='submit']");

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Logging in...";

    try {

        if (!window.firebase || !firebase.apps.length) {
            throw new Error("Email authentication is not configured yet.");
        }

        let loginPayload;
        try {
            const credential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const firebase_id_token = await credential.user.getIdToken(true);
            loginPayload = { firebase_id_token };
        } catch (error) {
            // Accounts created before this Firebase migration do not have a
            // Firebase user. The API only accepts this legacy path for rows
            // without a Firebase UID, so it cannot bypass email verification.
            // Firebase deliberately returns auth/invalid-credential for both
            // a missing user and an incorrect password, to prevent account
            // enumeration. Try the legacy API in either case; it only permits
            // pre-migration rows with no firebase_uid.
            if (!["auth/user-not-found", "auth/invalid-credential"].includes(error.code)) throw error;
            loginPayload = { email, password };
        }

        const response = await fetch(

            `${BASE_URL}/api/auth/login`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                credentials: "include",

                body: JSON.stringify(loginPayload)

            }

        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.message || "Login failed.");

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            return;

        }

        // There is no separate mentor-dashboard.html or admin-dashboard.html
        // anywhere in the repo (checked against the actual frontend folder
        // tree) — only one real Dashboard/dashboard.html exists, shared by
        // everyone for now. Folder is "Dashboard" with a capital D — Vercel's
        // hosting is case-sensitive (unlike Windows locally), so this needs
        // to match exactly or it 404s in production, same bug as before.
        window.location.href = "../Dashboard/dashboard.html";

    }

    catch (err) {

        console.error(err);

        alert("Server Error");

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

    }

});
