const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";
const mentorContainer = document.getElementById("mentorContainer");

const searchBox = document.getElementById("searchBox");

const companyFilter = document.getElementById("companyFilter");

const experienceFilter = document.getElementById("experienceFilter");

let mentors = [];

let filteredMentors = [];

/* FETCH ALL MENTORS */

async function fetchMentors() {

    try {

        const response = await fetch(

            `${BASE_URL}/api/mentor`

        );

        if (!response.ok) {

            throw new Error("Unable to fetch mentors.");

        }

        mentors = await response.json();

        filteredMentors = mentors;

        loadCompanyFilter();

        renderMentors(filteredMentors);

    }

    catch (error) {

        console.error(error);

        mentorContainer.innerHTML = `

            <h2>Unable to load mentors.</h2>

        `;

    }

}

/* COMPANY FILTER — company now lives on latest_company (from a mentor's
   most recent journey), not directly on the mentor row, and may be null
   for a mentor who hasn't submitted a journey yet. */
function loadCompanyFilter() {

    const companies = [

        ...new Set(

            mentors

                .map(mentor => mentor.latest_company)

                .filter(Boolean)

        )

    ];

    companies.forEach(company => {

        const option = document.createElement("option");

        option.value = company;

        option.textContent = company;

        companyFilter.appendChild(option);

    });

}

/* RENDER CARDS */

function renderMentors(data) {

    mentorContainer.innerHTML = "";

    if (data.length === 0) {
    mentorContainer.innerHTML = "<h2>No mentors found.</h2>";
    return;
}

    data.forEach(mentor => {

        const hasJourney = Boolean(mentor.latest_company);

        mentorContainer.innerHTML += `


        <div class="mentor-card">
            <div class="mentor-image"></div>

            <h3>${mentor.full_name}</h3>

            <p>${mentor.latest_company || "No journey shared yet"}</p>

            <p>${mentor.latest_role || ""}</p>

            <p class="package">

                ${mentor.latest_experience_type === "Internship"
                    ? (mentor.latest_stipend_monthly != null ? `₹${mentor.latest_stipend_monthly}/month` : "—")
                    : (mentor.latest_package_lpa != null ? `${mentor.latest_package_lpa} LPA` : "—")}

            </p>

            <p>

                CGPA : ${mentor.latest_offer_cgpa ?? mentor.cgpa ?? "—"}

            </p>

            ${hasJourney ? `<span class="type">${mentor.latest_experience_type}</span>` : ""}

            ${mentor.experience_count > 1 ? `<span class="type">+${mentor.experience_count - 1} more</span>` : ""}

<button

    class="view-profile-btn"

    onclick="openProfile(${mentor.mentor_id})"

>

    View Profile

</button>

</div>

        </div>

        `;

    });

}

/* SEARCH + FILTER */

function filterMentors() {

    const search =

        searchBox.value.toLowerCase();

    const company =

        companyFilter.value;

    const experience =

        experienceFilter.value;

    filteredMentors = mentors.filter(mentor => {

        const matchesSearch =

            mentor.full_name

            .toLowerCase()

            .includes(search)

            ||

            (mentor.latest_company || "")

            .toLowerCase()

            .includes(search);

        const matchesCompany =

            company === ""

            ||

            mentor.latest_company === company;

        const matchesExperience =

            experience === ""

            ||

            mentor.latest_experience_type === experience;

        return (

            matchesSearch

            &&

            matchesCompany

            &&

            matchesExperience

        );

    });

    renderMentors(filteredMentors);

}

/* OPEN PROFILE */

function openProfile(id) {

    window.location.href =

        `mentor.html?id=${id}`;

}

searchBox.addEventListener(

    "input",

    filterMentors

);

companyFilter.addEventListener(

    "change",

    filterMentors

);

experienceFilter.addEventListener(

    "change",

    filterMentors

);

fetchMentors();
