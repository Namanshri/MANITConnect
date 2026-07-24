const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";
        
const mentorForm = document.getElementById("mentorForm");

mentorForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();

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

    const user_id = localStorage.getItem("user_id");
    const branch = document.getElementById("branch").value.trim();

const experienceData = {

    user_id,

    full_name: fullName,

    company,

    role,

    package_lpa: packageLPA,

    cgpa: Number(cgpa),

    experience_type: experienceType,

    placement_mode: placementMode,

    branch

};

    try {

     

const response = await fetch(
    `${BASE_URL}/api/experience`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(experienceData)
    }
);

        if (!response.ok) {

            throw new Error("Failed to save mentor.");

        }

        const data = await response.json();

       

        alert(data.message || "Basic details saved successfully!");

        window.location.href = "contribute2.html";

    }

    catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");

    }

});
