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

const experienceTypeInput = document.getElementById("experienceType");
const compensationLabel = document.getElementById("compensationLabel");
const packageInput = document.getElementById("package");

experienceTypeInput.addEventListener("change", () => {
    const internship = experienceTypeInput.value === "Internship";
    compensationLabel.textContent = internship ? "Monthly Stipend (₹)" : "Annual Package (LPA)";
    packageInput.placeholder = internship ? "e.g. 50000" : "e.g. 12";
});

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

    // PERSONAL fields (don't change per journey) -> mentor profile.
    const mentorProfileData = {

        full_name: fullName,

        branch,

        cgpa: Number(cgpa)

    };

    // JOURNEY-SPECIFIC fields -> held here until contribute2's submit,
    // where they're combined with the "My Journey" content into ONE
    // experience row. This avoids creating a half-empty experience row
    // if the mentor abandons the flow partway through contribute2.
    const pendingJourney = {

        company,

        role,

        package_lpa: experienceType === "Placement" ? Number(packageLPA) : null,

        stipend_monthly: experienceType === "Internship" ? Number(packageLPA) : null,

        offer_cgpa: Number(cgpa),

        experience_type: experienceType,

        placement_mode: placementMode

    };

    sessionStorage.setItem("pendingJourney", JSON.stringify(pendingJourney));

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

        window.location.href = "contribute2.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message || "Unable to connect to the server.");

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

    }

});
