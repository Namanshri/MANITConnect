const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

const step1 = document.getElementById("step1");

const step2 = document.getElementById("step2");

const step3 = document.getElementById("step3");

const steps = document.querySelectorAll(".step");

const sendOtpBtn = document.getElementById("sendOtpBtn");

const verifyOtpBtn = document.getElementById("verifyOtpBtn");

const resetBtn = document.getElementById("resetBtn");

// Carried between steps — the backend needs the email on every step,
// and the reset_token (proof the OTP was verified) on step 3.
let resetEmail = "";

let resetToken = "";

function setButtonLoading(button, loadingText) {

    button.disabled = true;

    button.dataset.originalText = button.textContent;

    button.textContent = loadingText;

}

function resetButton(button) {

    button.disabled = false;

    button.textContent = button.dataset.originalText || button.textContent;

}

/* STEP 1 — request OTP */

sendOtpBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();

    if (email === "") {

        alert("Please enter your email.");
        return;

    }

    setButtonLoading(sendOtpBtn, "Sending...");

    try {

        const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Unable to send OTP.");

        }

        resetEmail = email;

        alert(data.message);

        step1.style.display = "none";
        step2.style.display = "block";

        steps[0].classList.remove("active");
        steps[1].classList.add("active");

    }

    catch (err) {

        console.error(err);
        alert(err.message || "Something went wrong.");

    }

    finally {

        resetButton(sendOtpBtn);

    }

});

/* STEP 2 — verify OTP */

verifyOtpBtn.addEventListener("click", async () => {

    const otp = document.getElementById("otp").value.trim();

    if (otp === "") {

        alert("Please enter the OTP.");
        return;

    }

    setButtonLoading(verifyOtpBtn, "Verifying...");

    try {

        const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: resetEmail, otp })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Invalid OTP.");

        }

        // This token proves the OTP was verified — step 3 can't run
        // without it, so nobody can jump straight to resetting a
        // password just by knowing an email address.
        resetToken = data.reset_token;

        step2.style.display = "none";
        step3.style.display = "block";

        steps[1].classList.remove("active");
        steps[2].classList.add("active");

    }

    catch (err) {

        console.error(err);
        alert(err.message || "Something went wrong.");

    }

    finally {

        resetButton(verifyOtpBtn);

    }

});

/* STEP 3 — set new password */

resetBtn.addEventListener("click", async () => {

    const password = document.getElementById("newPassword").value;

    if (password.length < 8) {

        alert("Password must be at least 8 characters.");
        return;

    }

    setButtonLoading(resetBtn, "Resetting...");

    try {

        const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({

                email: resetEmail,
                reset_token: resetToken,
                new_password: password

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Unable to reset password.");

        }

        alert(data.message);

        window.location.href = "login.html";

    }

    catch (err) {

        console.error(err);
        alert(err.message || "Something went wrong.");

        resetButton(resetBtn);

    }

});
