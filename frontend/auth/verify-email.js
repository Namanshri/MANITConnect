const statusMessage = document.getElementById("status");
const actionCode = new URLSearchParams(window.location.search).get("oobCode");

if (!window.firebase || !firebase.apps.length) {
    statusMessage.textContent = "Firebase is not configured yet. Please contact the administrator.";
} else if (!actionCode) {
    statusMessage.textContent = "This verification link is invalid or has expired.";
} else {
    firebase.auth().applyActionCode(actionCode)
        .then(() => {
            statusMessage.textContent = "Your email is verified. You can now log in.";
        })
        .catch(() => {
            statusMessage.textContent = "This verification link is invalid, expired, or has already been used.";
        });
}
