/* MANITCONNECT MENTOR PROFILE */

const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

const params = new URLSearchParams(window.location.search);

let mentorId = params.get("id");

if (!mentorId) {

    mentorId = sessionStorage.getItem("mentor_id");

}

if (!mentorId) {

    mentorId = 1;

}

const mentorName = document.getElementById("mentorName");
const mentorRole = document.getElementById("mentorRole");
const mentorCompany = document.getElementById("mentorCompany");
const mentorPackage = document.getElementById("mentorPackage");
const mentorCgpa = document.getElementById("mentorCgpa");
const mentorType = document.getElementById("mentorType");
const mentorExperienceCount = document.getElementById("mentorExperienceCount");
const experienceChips = document.getElementById("experienceChips");
const experienceDetails = document.getElementById("experienceDetails");

const journeyBtn = document.getElementById("journeyBtn");
const guidanceBtn = document.getElementById("guidanceBtn");
const journeySection = document.getElementById("journeySection");
const guidanceSection = document.getElementById("guidanceSection");

journeyBtn.onclick = () => {
    journeyBtn.classList.add("active");
    guidanceBtn.classList.remove("active");
    journeySection.style.display = "block";
    guidanceSection.style.display = "none";
};

guidanceBtn.onclick = () => {
    guidanceBtn.classList.add("active");
    journeyBtn.classList.remove("active");
    journeySection.style.display = "none";
    guidanceSection.style.display = "block";
};

let mentor = {};
let insights = [];
let placementinsights = [];
let internshipinsights = [];
let currentType = "Placement";

async function fetchMentor() {

    try {

        const response = await fetch(`${BASE_URL}/api/mentor/${mentorId}`);

        if (!response.ok) {

            throw new Error("Unable to load mentor.");

        }

        const data = await response.json();

        mentor = data.mentor;
        insights = data.insights || [];

        mentorName.textContent = mentor.full_name;

        const latest = insights[0];

        mentorRole.textContent = latest?.role || "No journey shared yet";
        mentorCompany.textContent = latest?.company || "";
        mentorPackage.textContent = latest?.package_lpa != null ? `💰 ${latest.package_lpa} LPA` : "💰 —";
        mentorCgpa.textContent = mentor.cgpa != null ? `⭐ ${mentor.cgpa} CGPA` : "⭐ —";
        mentorType.textContent = latest?.experience_type ? `🎓 ${latest.experience_type}` : "🎓 —";
        mentorExperienceCount.textContent = `🧳 ${insights.length} Experience(s) Shared`;

        placementinsights = insights.filter(item => item.experience_type === "Placement");
        internshipinsights = insights.filter(item => item.experience_type === "Internship");

        renderExperienceChips();

    }

    catch (error) {

        console.error(error);
        alert("Unable to load mentor profile.");

    }

}

const placementBtn = document.getElementById("placementBtn");
const internshipBtn = document.getElementById("internshipBtn");

placementBtn.onclick = () => {
    currentType = "Placement";
    placementBtn.classList.add("active-exp");
    internshipBtn.classList.remove("active-exp");
    renderExperienceChips();
};

internshipBtn.onclick = () => {
    currentType = "Internship";
    internshipBtn.classList.add("active-exp");
    placementBtn.classList.remove("active-exp");
    renderExperienceChips();
};

function renderExperienceChips() {

    experienceChips.innerHTML = "";

    const list = currentType === "Placement" ? placementinsights : internshipinsights;

    if (list.length === 0) {

        experienceDetails.innerHTML = `
        <div class="card">
            <h2>No ${currentType} Experience Found</h2>
            <p>This mentor hasn't shared any ${currentType.toLowerCase()} insights yet.</p>
        </div>
        `;
        return;

    }

    list.forEach((experience, index) => {

        const chip = document.createElement("button");
        chip.className = "chip";
        chip.innerText = experience.company || `${currentType} ${index + 1}`;

        if (index === 0) {
            chip.classList.add("active-chip");
        }

        chip.onclick = () => renderExperienceDetails(index);

        experienceChips.appendChild(chip);

    });

    renderExperienceDetails(0);

}

function renderExperienceDetails(index) {

    const list = currentType === "Placement" ? placementinsights : internshipinsights;
    const experience = list[index];

    experienceDetails.innerHTML = `

    <div class="card">
        <h2>${experience.company || "Company"} — ${experience.role || "Role"}</h2>
        <p>
            ${experience.package_lpa != null ? experience.package_lpa + " LPA" : ""}
            ${experience.placement_mode ? " · " + experience.placement_mode : ""}
        </p>
        <div class="card-actions" id="expBookmark-${experience.experience_id}"></div>
    </div>

    <div class="card"><h2>Preparation Strategy</h2><p>${experience.preparation_strategy || "-"}</p></div>
    <div class="card"><h2>Core Skills</h2><p>${experience.core_skills || "-"}</p></div>
    <div class="card"><h2>Resources Used</h2><p>${experience.resources || "-"}</p></div>
    <div class="card"><h2>Interview Timeline</h2><p>${experience.interview_timeline || "-"}</p></div>
    <div class="card"><h2>Mistakes To Avoid</h2><p>${experience.mistakes || "-"}</p></div>
    <div class="card"><h2>Interview Rounds</h2><p>${experience.interview_rounds || "-"}</p></div>

    ${experience.preparation_video_url ? `
    <div class="card">
        <h2>Preparation Video</h2>
        <video controls src="${experience.preparation_video_url}" style="width:100%;border-radius:8px;"></video>
    </div>
    ` : ""}

    `;

    // Bookmark the WHOLE experience — one button on the header card.
    renderBookmarkButton(
        document.getElementById(`expBookmark-${experience.experience_id}`),
        "experience",
        experience.experience_id
    );

    updateActiveChip(index);

}

function updateActiveChip(index) {

    const chips = document.querySelectorAll(".chip");

    chips.forEach((chip, i) => {
        chip.classList.remove("active-chip");
        if (i === index) chip.classList.add("active-chip");
    });

}

const yearButtons = document.querySelectorAll(".year-btn");
const guidanceContent = document.getElementById("guidanceContent");

let guidanceData = [];
let currentYear = 1;

async function fetchGuidance() {

    try {

        const response = await fetch(`${BASE_URL}/api/guidance/${mentorId}`);

        if (!response.ok) {

            throw new Error("Unable to load guidance.");

        }

        guidanceData = await response.json();

        renderGuidance(currentYear);

    }

    catch (error) {

        console.log(error);

    }

}

yearButtons.forEach((button) => {

    button.onclick = () => {

        yearButtons.forEach((btn) => btn.classList.remove("active-year"));
        button.classList.add("active-year");

        currentYear = Number(button.dataset.year);
        renderGuidance(currentYear);

    };

});

function renderGuidance(year) {

    guidanceContent.innerHTML = "";

    const filtered = guidanceData.filter(item => Number(item.year) === Number(year));

    if (filtered.length === 0) {

        guidanceContent.innerHTML = `
        <div class="card">
            <h2>No Guidance Available</h2>
            <p>This mentor has not shared guidance for this year.</p>
        </div>
        `;
        return;

    }

    filtered.forEach((item) => {

        guidanceContent.innerHTML += `
        <div class="accordion">
            <div class="accordion-header">
                <h3>▼ ${item.category}</h3>
            </div>
            <div class="question-box">
                <div class="question">
                    <p>${item.question}</p>
                    <div class="answer">${item.answer}</div>
                    <div class="card-actions guidance-answer-row" id="guidanceBookmark-${item.guidance_id}"></div>
                </div>
            </div>
        </div>
        `;

    });

    document.querySelectorAll(".accordion-header").forEach((header) => {

        header.onclick = () => {

            const box = header.nextElementSibling;
            box.style.display = box.style.display === "block" ? "none" : "block";

        };

    });

    // Bookmark EACH guidance answer individually.
    filtered.forEach((item) => {

        renderBookmarkButton(
            document.getElementById(`guidanceBookmark-${item.guidance_id}`),
            "guidance",
            item.guidance_id
        );

    });

}

const mentorInsightsList = document.getElementById("mentorInsightsList");

async function fetchMentorInsights() {

    try {

        const response = await fetch(`${BASE_URL}/api/insight/mentor/${mentorId}`);

        if (!response.ok) {

            throw new Error("Unable to load insights.");

        }

        const mentorInsights = await response.json();

        if (mentorInsights.length === 0) {

            mentorInsightsList.innerHTML = `<p class="empty-note">This mentor hasn't published any insights yet.</p>`;
            return;

        }

        mentorInsightsList.innerHTML = "";

        mentorInsights.forEach((insight) => {

            const preview = (insight.content || "").length > 110
                ? insight.content.substring(0, 110) + "…"
                : (insight.content || "");

            const postedDate = insight.created_at
                ? new Date(insight.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short" })
                : "";

            const row = document.createElement("div");
            row.className = "insight-row";
            row.innerHTML = `
                <a href="../insights/insight.html?id=${insight.insight_id}" style="text-decoration:none;color:inherit;">
                    <h4>${insight.title}</h4>
                    <div class="insight-byline">${insight.category || "Insight"}${postedDate ? " · " + postedDate : ""}</div>
                    <div class="insight-preview">${preview}</div>
                </a>
                <div class="card-actions" id="insightBookmark-${insight.insight_id}"></div>
            `;

            mentorInsightsList.appendChild(row);

            renderBookmarkButton(
                row.querySelector(`#insightBookmark-${insight.insight_id}`),
                "insight",
                insight.insight_id
            );

        });

    }

    catch (error) {

        console.error(error);
        mentorInsightsList.innerHTML = `<p class="empty-note">Unable to load insights right now.</p>`;

    }

}

async function initializePage() {

    await fetchMentor();
    await fetchGuidance();
    await fetchMentorInsights();

}

initializePage();
