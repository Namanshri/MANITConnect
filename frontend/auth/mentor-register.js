const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const strengthText = document.getElementById("strengthText");

const studentForm = document.getElementById("studentForm");



/* SHOW / HIDE PASSWORD */

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "👁️⃠";

    }

    else {

        passwordInput.type = "password";

        togglePassword.textContent = "👁";

    }

});

/* PASSWORD STRENGTH */

passwordInput.addEventListener("input", () => {

    const password = passwordInput.value;

    let strength = "Weak";
    let color = "#e74c3c";

    if (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password)
    ) {

        strength = "Strong";
        color = "#27ae60";

    }

    else if (password.length >= 6) {

        strength = "Medium";
        color = "#f39c12";

    }

    strengthText.textContent = `Password Strength: ${strength}`;

    strengthText.style.color = color;

});

/* FORM SUBMIT */

const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

studentForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const full_name = document.getElementById("fullName").value.trim();

    const email = document.getElementById("email").value.trim();

    const company = document.getElementById("company").value.trim();

    const role = document.getElementById("role").value.trim();

    const password = passwordInput.value;

    const branch = document.getElementById("branch").value.trim();

    try {

        const response = await fetch(

            `${BASE_URL}/api/auth/register/mentor`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    full_name,

                    email,

                    company,

                    role,

                    branch,

                    password

                })

            }

        );

        const data = await response.json();

        if (response.ok) {

            alert(data.message);

            window.location.href = "login.html";

        }

        else {

            alert(data.message);

        }

    }

    catch (err) {

        console.error(err);

        alert(err.message || "Server Error");

    }

});

