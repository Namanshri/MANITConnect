const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

const mentorForm = document.getElementById("mentorForm");

/*
   Require a logged-in mentor before this page is usable at all.
   requireAuth() comes from shared/session.js — include that script
   BEFORE this one in contribute1.html.
*/
requireAuth(["mentor"]);

mentorForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();

    const branch = document.getElementById("branch").value.trim();

    const company = document.getElementById("company").value.trim();

    const role = document.getElementById("role").value.trim();

    const packageLPA = document.getElementById("package").value.trim();

    const cgpa = document.getElementById("cgpa").value.trim();

    const experienceType = document.getElementById("experienceType").value;

    const placementMode = document.querySelector(
        'input[name="placementMode"]:checked'
    ).value;

    if (
        fullName === "" ||
        company === "" ||
        role === "" ||
        packageLPA === "" ||
        cgpa === "" ||
        experienceType === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    // NOTE: this is your mentor PROFILE data (name/company/role/package/cgpa),
    // which lives on the `mentors` table — so it goes to /api/mentor, not
    // /api/experience (that endpoint is for the "My Journey" fields on
    // contribute2). The old code was posting this to /api/experience, which
    // doesn't have matching columns for any of these fields.
    const mentorProfileData = {

        full_name: fullName,

        branch,

        company,

        role,

        package_lpa: packageLPA,

        cgpa: Number(cgpa),

        experience_type: experienceType,

        placement_mode: placementMode

    };

    const submitBtn = document.getElementById("continueBtn");
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Saving...";

    try {

        const response = await fetch(
            `${BASE_URL}/api/mentor`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                // sends the HttpOnly session cookie so the backend
                // knows which mentor this is — no id sent from here
                credentials: "include",
                body: JSON.stringify(mentorProfileData)
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Failed to save mentor profile.");

        }

        alert("Basic details saved successfully!");

        window.location.href = "contribute2.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message || "Unable to connect to the server.");

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

    }

});
