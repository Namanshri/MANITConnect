/* CAMPUSPATH MENTOR PROFILE */

const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

/*  GET MENTOR ID */

const params = new URLSearchParams(window.location.search);

let mentorId = params.get("id");

if (!mentorId) {

    mentorId = sessionStorage.getItem("mentor_id");

}

if (!mentorId) {

    mentorId = 1;

}
//console.log("Current Mentor ID:", mentorId);

/* DOM ELEMENTS */

const mentorName = document.getElementById("mentorName");

const mentorRole = document.getElementById("mentorRole");

const mentorCompany = document.getElementById("mentorCompany");

const mentorPackage = document.getElementById("mentorPackage");

const mentorCgpa = document.getElementById("mentorCgpa");

const mentorType = document.getElementById("mentorType");

const mentorExperienceCount =

document.getElementById("mentorExperienceCount");

const experienceChips =

document.getElementById("experienceChips");

const experienceDetails =

document.getElementById("experienceDetails");

/*  PAGE TOGGLE */

const journeyBtn =

document.getElementById("journeyBtn");

const guidanceBtn =

document.getElementById("guidanceBtn");

const journeySection =

document.getElementById("journeySection");

const guidanceSection =

document.getElementById("guidanceSection");

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

/* DATA */

let mentor = {};

let insights = [];

let placementinsights = [];

let internshipinsights = [];

let currentType = "Placement";


/*  FETCH MENTOR DATA */

async function fetchMentor() {
    

    try {

        const response = await fetch(

            `${BASE_URL}/api/mentor/${mentorId}`

        );

        if (!response.ok) {

            throw new Error("Unable to load mentor.");

        }

        const data = await response.json();
        

mentor = data.mentor;

insights = data.insights || [];

console.table(insights);



        mentorName.textContent = mentor.full_name;

        mentorRole.textContent = mentor.role;

        mentorCompany.textContent = mentor.company;

        mentorPackage.textContent =
            `💰 ${mentor.package_lpa} LPA`;

        mentorCgpa.textContent =
            `⭐ ${mentor.cgpa} CGPA`;

        mentorType.textContent =
            `🎓 ${mentor.experience_type}`;

        mentorExperienceCount.textContent =
            `🧳 ${insights.length} Experience(s) Shared`;

        placementinsights = insights.filter(

    item => item.experience_type === "Placement"

);

internshipinsights = insights.filter(

    item => item.experience_type === "Internship"

);

        renderExperienceChips();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load mentor profile.");

    }

}
/*  EXPERIENCE TOGGLE */

const placementBtn =

document.getElementById("placementBtn");

const internshipBtn =

document.getElementById("internshipBtn");

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
/* RENDER EXPERIENCE CHIPS*/

function renderExperienceChips() {

    experienceChips.innerHTML = "";

    const list =

        currentType === "Placement"

        ? placementinsights

        : internshipinsights;

    if(list.length===0){

        experienceDetails.innerHTML=`

        <div class="card">

            <h2>

                No ${currentType} Experience Found

            </h2>

            <p>

                This mentor hasn't shared any ${currentType.toLowerCase()} insights yet.

            </p>

        </div>

        `;

        return;

    }

    list.forEach((experience,index)=>{

        const chip=document.createElement("button");

        chip.className="chip";

        chip.innerText=

            experience.company ||

            `${currentType} ${index+1}`;

        if(index===0){

            chip.classList.add("active-chip");

        }

        chip.onclick=()=>{

            renderExperienceDetails(index);

        };

        experienceChips.appendChild(chip);

    });

    renderExperienceDetails(0);

}
/*  EXPERIENCE DETAILS */

function renderExperienceDetails(index){

    const list=

        currentType==="Placement"

        ? placementinsights

        : internshipinsights;

    const experience=list[index];

    experienceDetails.innerHTML=`

    <div class="card">

        <h2>

            Preparation Strategy

        </h2>

        <p>

            ${experience.preparation_strategy || "-"}

        </p>

    </div>

    <div class="card">

        <h2>

            Core Skills

        </h2>

        <p>

            ${experience.core_skills || "-"}

        </p>

    </div>

    <div class="card">

        <h2>

            Resources Used

        </h2>

        <p>

            ${experience.resources || "-"}

        </p>

    </div>

    <div class="card">

        <h2>

            Interview Timeline

        </h2>

        <p>

            ${experience.interview_timeline || "-"}

        </p>

    </div>

    <div class="card">

        <h2>

            Mistakes To Avoid

        </h2>

        <p>

            ${experience.mistakes || "-"}

        </p>

    </div>

    <div class="card">

        <h2>

            Interview Rounds

        </h2>

        <p>

            ${experience.interview_rounds || "-"}

        </p>

    </div>

    `;

    updateActiveChip(index);

}
/* ACTIVE CHIP */

function updateActiveChip(index){

    const chips=document.querySelectorAll(".chip");

    chips.forEach((chip,i)=>{

        chip.classList.remove("active-chip");

        if(i===index){

            chip.classList.add("active-chip");

        }

    });

}
/*  GUIDANCE */

const yearButtons =

document.querySelectorAll(".year-btn");

const guidanceContent =

document.getElementById("guidanceContent");

let guidanceData = [];

let currentYear = 1;
/* FETCH GUIDANCE */

async function fetchGuidance(){

    try{

        const response = await fetch(

            `${BASE_URL}/api/guidance/${mentorId}`

        );

        if(!response.ok){

            throw new Error("Unable to load guidance.");

        }

        guidanceData = await response.json();
        console.log("Guidance:", guidanceData);

        renderGuidance(currentYear);

    }

    catch(error){

        console.log(error);

    }

}
/* YEAR BUTTONS */

yearButtons.forEach((button)=>{

    button.onclick=()=>{

        yearButtons.forEach((btn)=>{

            btn.classList.remove("active-year");

        });

        button.classList.add("active-year");

        currentYear = Number(button.dataset.year);

        renderGuidance(currentYear);

    };

});
/* RENDER GUIDANCE */

function renderGuidance(year){

    guidanceContent.innerHTML="";

    const filtered = guidanceData.filter(

    item => Number(item.year) === Number(year)

);

    if(filtered.length===0){

        guidanceContent.innerHTML=`

        <div class="card">

            <h2>

                No Guidance Available

            </h2>

            <p>

                This mentor has not shared guidance for this year.

            </p>

        </div>

        `;

        return;

    }

    filtered.forEach((item)=>{

        guidanceContent.innerHTML += `

        <div class="accordion">

            <div class="accordion-header">

                <h3>

                    ▼ ${item.category}

                </h3>

            </div>

            <div class="question-box">

                <div class="question">

                    <p>

                        ${item.question}

                    </p>

                    <div class="answer">

                        ${item.answer}

                    </div>

                </div>

            </div>

        </div>

        `;

    });

    document

    .querySelectorAll(".accordion-header")

    .forEach((header)=>{

        header.onclick=()=>{

            const box=

            header.nextElementSibling;

            box.style.display=

            box.style.display==="block"

            ? "none"

            : "block";

        };

    });

}
/* 
   INITIALIZE PAGE
 */

async function initializePage() {

    await fetchMentor();

    await fetchGuidance();

}

initializePage();


/* 
   LOADING & ERROR UI
 */

function showLoading() {

    const loading = document.getElementById("loadingOverlay");

    if (loading) {

        loading.style.display = "flex";

    }

}

function hideLoading() {

    const loading = document.getElementById("loadingOverlay");

    if (loading) {

        loading.style.display = "none";

    }

}

function showError(message) {

    const errorBox = document.getElementById("errorBox");

    if (errorBox) {

        errorBox.style.display = "block";

        errorBox.querySelector("p").textContent = message;

    }

}
