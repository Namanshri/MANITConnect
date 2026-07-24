const loginForm = document.getElementById("loginForm");

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

   const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

/* SHOW / HIDE PASSWORD */

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.innerHTML =

        '<i class="fa-regular fa-eye-slash"></i>';

    }

    else {

        passwordInput.type = "password";

        togglePassword.innerHTML =

        '<i class="fa-regular fa-eye"></i>';

    }

});

/* LOGIN */

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = passwordInput.value;

    try {

        const response = await fetch(`${BASE_URL}/api/auth/login`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email,

                password

            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;

        }

        localStorage.setItem("token", data.token);

        localStorage.setItem("user_id", data.user_id);

        localStorage.setItem("role", data.role);

        if (data.role === "student") {

            window.location.href = "../dashboard/dashboard.html";

        }

        else {

            const response2 = await fetch(

                `${BASE_URL}/api/auth/experience/${data.user_id}`

            );

            const result = await response2.json();

            if (result.hasExperience) {

                window.location.href = "../dashboard/dashboard.html";

            }

            else {

                window.location.href = "../contribute/contribute1.html";

            }

        }

    }

    catch (err) {

        console.log(err);

        alert("Server Error");

    }

});