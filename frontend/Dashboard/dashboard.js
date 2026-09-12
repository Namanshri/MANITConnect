const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

const searchInput = document.getElementById("searchInput");

const mentorCount = document.getElementById("mentorCount");

const recentMentors = document.getElementById("recentMentors");

const companyFilter = document.getElementById("companyFilter");

const roleFilter = document.getElementById("roleFilter");

const packageFilter = document.getElementById("packageFilter");

const cgpaFilter = document.getElementById("cgpaFilter");

const branchFilter = document.getElementById("branchFilter");

const experienceCount = document.getElementById("experienceCount");

const companyCount = document.getElementById("companyCount");

const branchCount = document.getElementById("branchCount");

companyFilter.addEventListener("change", applyFilters);

roleFilter.addEventListener("change", applyFilters);

packageFilter.addEventListener("change", applyFilters);

cgpaFilter.addEventListener("change", applyFilters);

branchFilter.addEventListener("change", applyFilters);

const recentInsights =
document.getElementById("recentInsights");

let mentors = [];

/* FETCH DASHBOARD DATA */

async function loadDashboard() {

    try {

        const response = await fetch(

            `${BASE_URL}/api/mentor`

        );

        if (!response.ok) {

            throw new Error("Unable to fetch mentors.");

        }

        mentors = await response.json();

        renderRecentMentors();
        loadFilterOptions();
        loadRecentInsights();

    }

    catch (error) {

        console.error(error);

    }

}

async function loadFilterOptions() {

    try {

        const response = await fetch(

            `${BASE_URL}/api/mentor/filter-options`

        );

        if (!response.ok) {

            return;

        }

        const data = await response.json();

        populateDropdown(companyFilter, data.companies, "company", "Company");

        populateDropdown(roleFilter, data.roles, "role", "Role");

        populateDropdown(branchFilter, data.branches, "branch", "Branch");

        applyFilters();

    }

    catch (err) {

        console.error(err);

    }

}

function populateDropdown(dropdown, items, key, defaultText) {

    dropdown.innerHTML = "";

    dropdown.innerHTML += `<option value="">${defaultText}</option>`;

    items.forEach(item => {

        dropdown.innerHTML +=

        `<option value="${item[key]}">${item[key]}</option>`;

    });

}

/* LATEST MENTORS
   company/role/package_lpa come from each mentor's most recent
   journey (latest_company/latest_role/latest_package_lpa).
   NOTE: only ONE action button now — "View Profile" and "View Journey"
   both called the same openProfile() function, so the second was just
   a confusing duplicate. */
function renderRecentMentors(list = mentors) {

    recentMentors.innerHTML = "";

    if (list.length === 0) {

        recentMentors.innerHTML = "<p>No mentors found.</p>";
        return;

    }

    list

    .slice(0,6)

    .forEach(mentor=>{

        const company = mentor.latest_company || "No journey shared yet";

        const role = mentor.latest_role || "";

        const packageLine = mentor.latest_package_lpa != null ? `${mentor.latest_package_lpa} LPA` : "—";

        const cgpaLine = mentor.cgpa != null ? mentor.cgpa : "—";

        recentMentors.innerHTML += `

        <div class="card">

            <div class="top">

                <img

                src="https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}&background=8a00ff&color=ffffff"

                >

                <div>

                    <h3>

                        ${mentor.full_name}

                    </h3>

                    <p>

                        ${company}

                    </p>

                </div>

            </div>

            <span class="tag">

                ${role}

            </span>

            <h2>

                ${packageLine}

            </h2>

            <p>

                ⭐ CGPA : ${cgpaLine}

            </p>

            <div class="buttons">

                <button

                onclick="openProfile(${mentor.mentor_id})">

                View Profile

                </button>

            </div>

        </div>

        `;

    });

}

/* OPEN PROFILE */

function openProfile(id){

    window.location.href =

    `../mentor/mentor.html?id=${id}`;

}

/* INSIGHTS */

async function loadRecentInsights(){

    try{

        const response = await fetch(

        `${BASE_URL}/api/insight`
        );

        if(!response.ok){

            return;

        }

        const insights = await response.json();

        recentInsights.innerHTML = "";

        if (insights.length === 0) {

            recentInsights.innerHTML = "<p>No insights shared yet.</p>";
            return;

        }

        insights

        .slice(0,5)

        .forEach(insight=>{

            const preview = (insight.content || "").length > 140
                ? insight.content.substring(0, 140) + "…"
                : (insight.content || "-");

            const byline = [insight.full_name, insight.company]
                .filter(Boolean)
                .join(" · ");

            recentInsights.innerHTML += `

            <a class="experience-card" href="../insights/insight.html?id=${insight.insight_id}" style="text-decoration:none;color:inherit;display:block;cursor:pointer;">

                <h3>

                    ${insight.title || "Insight"}

                </h3>

                ${byline ? `<p style="font-size:12px;color:#888;margin:2px 0 6px;">${byline}</p>` : ""}

                <p>

                    ${preview}

                </p>

            </a>

            `;

        });

    }

    catch(error){

        console.error(error);

    }

}


searchInput.addEventListener(

    "input",

    applyFilters

);


function applyFilters(){

    let filtered = [...mentors];

    const query = searchInput.value.trim().toLowerCase();

    if(query){

        filtered = filtered.filter(m=>{

            return (

                m.full_name.toLowerCase().includes(query) ||

                (m.latest_company || "").toLowerCase().includes(query) ||

                (m.latest_role || "").toLowerCase().includes(query)

            );

        });

    }

    if (companyFilter.value !== "") {

    filtered = filtered.filter(

        m => (m.latest_company || "").toLowerCase() === companyFilter.value.toLowerCase()

    );

}

    if (roleFilter.value !== "") {

    filtered = filtered.filter(

        m => (m.latest_role || "").toLowerCase() === roleFilter.value.toLowerCase()

    );

}

    if(packageFilter.value==="50+"){

        filtered=filtered.filter(

            m=>parseFloat(m.latest_package_lpa)>=50

        );

    }

    else if(packageFilter.value==="40+"){

        filtered=filtered.filter(

            m=>parseFloat(m.latest_package_lpa)>=40

        );

    }

    else if(packageFilter.value==="30+"){

        filtered=filtered.filter(

            m=>parseFloat(m.latest_package_lpa)>=30

        );

    }

    else if(packageFilter.value==="20+"){

        filtered=filtered.filter(

            m=>parseFloat(m.latest_package_lpa)>=20

        );

    }

    else if(packageFilter.value==="10+"){

        filtered=filtered.filter(

            m=>parseFloat(m.latest_package_lpa)>=10

        );

    }

    else if(packageFilter.value==="Under 10 LPA"){

        filtered=filtered.filter(

            m=>parseFloat(m.latest_package_lpa)<10

        );

    }

    if(cgpaFilter.value==="9+"){

        filtered=filtered.filter(

            m=>parseFloat(m.cgpa)>=9

        );

    }

    else if(cgpaFilter.value==="8+"){

        filtered=filtered.filter(

            m=>parseFloat(m.cgpa)>=8

        );

    }

    else if(cgpaFilter.value==="7+"){

        filtered=filtered.filter(

            m=>parseFloat(m.cgpa)>=7

        );

    }

    else if(cgpaFilter.value==="Below 7 CGPA"){

        filtered=filtered.filter(

            m=>parseFloat(m.cgpa)<7

        );

    }

    if (branchFilter.value !== "") {

    filtered = filtered.filter(

        m => m.branch === branchFilter.value

    );

}

    renderRecentMentors(filtered);

}

async function loadDashboardStats() {

    try {

        const response = await fetch(

            `${BASE_URL}/api/mentor/dashboard-stats`

        );

        if (!response.ok) {

            return;

        }

        const data = await response.json();

        mentorCount.textContent = data.mentors;

        experienceCount.textContent = data.experiences;

        companyCount.textContent = data.companies;

        branchCount.textContent = data.branches;

    }

    catch (err) {

        console.error(err);

    }

}
loadDashboard();

loadDashboardStats();
