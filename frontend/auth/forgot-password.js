const sendResetButton = document.getElementById("sendOtpBtn");

// Firebase sends a time-limited reset link only to the mailbox owner.
sendResetButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    if (!email) return alert("Please enter your email.");
    if (!window.firebase || !firebase.apps.length) return alert("Password reset is not configured yet.");

    sendResetButton.disabled = true;
    const originalText = sendResetButton.textContent;
    sendResetButton.textContent = "Sending…";
    try {
        await firebase.auth().sendPasswordResetEmail(email, {
            url: `${window.location.origin}/frontend/auth/login.html`
        });
        alert("If an account exists for this address, a password-reset link has been sent.");
    } catch (error) {
        console.error(error);
        alert(error.message || "Unable to send the password-reset email.");
    } finally {
        sendResetButton.disabled = false;
        sendResetButton.textContent = originalText;
    }
});
