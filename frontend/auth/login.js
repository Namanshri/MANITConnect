const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const submitBtn = loginForm.querySelector("button[type='submit']");

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Logging in...";

    try {

        const response = await fetch(

            `${BASE_URL}/api/auth/login`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                credentials: "include",

                body: JSON.stringify({ email, password })

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
