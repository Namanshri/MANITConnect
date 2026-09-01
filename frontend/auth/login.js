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

                // credentials:"include" is what lets the browser accept
                // and later send the HttpOnly cookie the server sets here
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

        // Identity now lives in the HttpOnly cookie. We only use the
        // role from this response to decide where to redirect —
        // nothing here is stored or trusted later.
        if (data.role === "mentor") {

            window.location.href = "../mentor/mentor-dashboard.html";

        } else if (data.role === "admin") {

            window.location.href = "../admin/admin-dashboard.html";

        } else {

            window.location.href = "../dashboard/dashboard.html";

        }

    }

    catch (err) {

        console.error(err);

        alert("Server Error");

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

    }

});
