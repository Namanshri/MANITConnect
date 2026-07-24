const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

const searchInput = document.getElementById("searchInput");

const searchBtn = document.getElementById("searchBtn");

const mentorCount = document.getElementById("mentorCount");

const placementCount = document.getElementById("placementCount");

const internshipCount = document.getElementById("internshipCount");

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

        //updateStatistics();

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

async function searchMentors() {

    const query = searchInput.value.trim();

    if (!query) {

        renderRecentMentors();

        return;

    }

    try {

        const response = await fetch(

            `${BASE_URL}/api/mentor/search?q=${encodeURIComponent(query)}`

        );

        if (!response.ok) {

            throw new Error("Search failed");

        }

        const results = await response.json();

        recentMentors.innerHTML = "";

        if (results.length === 0) {
    recentMentors.innerHTML = "<p>No mentors found.</p>";
    return;
}

results.forEach(mentor => {

            recentMentors.innerHTML += `

            <div class="card">

                <div class="top">

                    <img
                    src="https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}&background=8a00ff&color=ffffff">

                    <div>

                        <h3>${mentor.full_name}</h3>

                        <p>${mentor.company}</p>

                    </div>

                </div>

                <span class="tag">

                    ${mentor.role}

                </span>

                <h2>

                    ${mentor.package_lpa} LPA

                </h2>

                <p>

                    ⭐ CGPA : ${mentor.cgpa}

                </p>

                <div class="buttons">

                    <button onclick="openProfile(${mentor.mentor_id})">

                        View Profile

                    </button>

                    <button onclick="openProfile(${mentor.mentor_id})">

                        View Journey

                    </button>

                </div>

            </div>

            `;

        });

    }

    catch (err) {

        console.error(err);

    }

}

/* STATISTICS */

function updateStatistics() {

    mentorCount.textContent = mentors.length;

    placementCount.textContent = mentors.filter(

        mentor => mentor.experience_type === "Placement"

    ).length;

    internshipCount.textContent = mentors.filter(

        mentor => mentor.experience_type === "Internship"

    ).length;

}

/* LATEST MENTORS */

function renderRecentMentors(list = mentors) {

    recentMentors.innerHTML = "";

    list

    .slice(0,6)

    .forEach(mentor=>{

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

                        ${mentor.company}

                    </p>

                </div>

            </div>

            <span class="tag">

                ${mentor.role}

            </span>

            <h2>

                ${mentor.package_lpa} LPA

            </h2>

            <p>

                ⭐ CGPA : ${mentor.cgpa}

            </p>

            <div class="buttons">

                <button

                onclick="openProfile(${mentor.mentor_id})">

                View Profile

                </button>

                <button

                onclick="openProfile(${mentor.mentor_id})">

                View Journey

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

/* insights */

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

        insights

        .slice(0,5)

        .forEach(exp=>{

            recentInsights.innerHTML += `

            <div class="experience-card">

                <h3>

                    ${exp.company || "Company"}

                </h3>

                <p>

                    ${exp.preparation_strategy || "-"}

                </p>

            </div>

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

    // Search
    const query = searchInput.value.trim().toLowerCase();

    if(query){

        filtered = filtered.filter(m=>{

            return (

                m.full_name.toLowerCase().includes(query) ||

                m.company.toLowerCase().includes(query) ||

                m.role.toLowerCase().includes(query)

            );

        });

    }

    // Company

    if (companyFilter.value !== "") {

    filtered = filtered.filter(

        m => m.company.toLowerCase() === companyFilter.value.toLowerCase()

    );

}

    // Role

    if (roleFilter.value !== "") {

    filtered = filtered.filter(

        m => m.role.toLowerCase() === roleFilter.value.toLowerCase()

    );

}

    // Package

    if(packageFilter.value==="50+"){

        filtered=filtered.filter(

            m=>parseFloat(m.package_lpa)>=50

        );

    }

    else if(packageFilter.value==="40+"){

        filtered=filtered.filter(

            m=>parseFloat(m.package_lpa)>=40

        );

    }

    else if(packageFilter.value==="30+"){

        filtered=filtered.filter(

            m=>parseFloat(m.package_lpa)>=30

        );

    }

    else if(packageFilter.value==="20+"){

        filtered=filtered.filter(

            m=>parseFloat(m.package_lpa)>=20

        );

    }

    else if(packageFilter.value==="10+"){

        filtered=filtered.filter(

            m=>parseFloat(m.package_lpa)>=10

        );

    }

    else if(packageFilter.value==="UNDER 10"){

        filtered=filtered.filter(

            m=>parseFloat(m.package_lpa)<10

        );

    }

    // CGPA

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

    else if(cgpaFilter.value==="UNDER 7"){

        filtered=filtered.filter(

            m=>parseFloat(m.cgpa)<7

        );

    }

    // Branch

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