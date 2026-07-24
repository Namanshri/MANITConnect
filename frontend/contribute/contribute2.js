/* TOGGLE BETWEEN JOURNEY & GUIDANCE*/

 const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";  
        
const journeyBtn = document.getElementById("journeyBtn");

const guidanceBtn = document.getElementById("guidanceBtn");

const journeySection = document.getElementById("journeySection");

const guidanceSection = document.getElementById("guidanceSection");

if (journeySection && guidanceSection) {

    journeySection.style.display = "block";
    guidanceSection.style.display = "none";

}

journeyBtn.addEventListener("click", () => {

    journeyBtn.classList.add("active");

    guidanceBtn.classList.remove("active");

    journeySection.style.display = "block";

    guidanceSection.style.display = "none";

});

guidanceBtn.addEventListener("click", () => {

    guidanceBtn.classList.add("active");

    journeyBtn.classList.remove("active");

    guidanceSection.style.display = "block";

    journeySection.style.display = "none";

});


/* VIDEO PREVIEW */

// Video preview handled using event delegation below.

/* MENTOR ID */

const user_id = localStorage.getItem("user_id");


/* YEAR BUTTONS */

const yearButtons=document.querySelectorAll(".year-btn");

const guidanceContent=document.getElementById("guidanceContent");

yearButtons.forEach(button => {

    button.addEventListener("click", () => {

        yearButtons.forEach(btn => btn.classList.remove("active-year"));

        button.classList.add("active-year");

        const currentYear = Number(button.dataset.year);

        renderGuidance(currentYear);

    });

});
/* RENDER GUIDANCE */

function renderGuidance(year){

    guidanceContent.innerHTML="";

    guidanceQuestions[year].forEach((section,index)=>{

        const card=document.createElement("div");

        card.className="guidance-card";

        card.innerHTML=`

        <div class="accordion-header">

            <h2>

                ▼ ${section.title} (${section.questions.length})

            </h2>

        </div>

        <div class="accordion-body" style="display:none;">

        </div>

        `;

        const header=card.querySelector(".accordion-header");

        const body=card.querySelector(".accordion-body");

        header.addEventListener("click",()=>{

            if(body.style.display==="none"){

                body.style.display="block";

                header.querySelector("h2").innerHTML=

                `▲ ${section.title} (${section.questions.length})`;

            }

            else{

                body.style.display="none";

                header.querySelector("h2").innerHTML=

                `▼ ${section.title} (${section.questions.length})`;

            }

        });

        section.questions.forEach((question,qIndex)=>{

            const questionCard=document.createElement("div");

            questionCard.className="question-card";

            questionCard.innerHTML=`

                <p class="question">

                    ${qIndex+1}. ${question}

                </p>

                <textarea

                    class="guidance-answer"

                    data-year="${year}"

                    data-category="${section.title}"

                    data-question="${question}"

                    placeholder="Share your experience (Optional)"

                ></textarea>

                <div class="media-row">

                    <button
type="button"
class="audio-btn">

🎙️ Record Audio (Coming Soon)

</button>

                    <button

                        type="button"

                        class="video-btn"

                    >

                        📎 Add Video (Coming Soon)

                    </button>

                    <input

                        type="file"

                        class="hidden-video"

                        accept="video/*"

                    >

                </div>

                <video

                    class="video-preview"

                    controls

                    style="display:none;"

                ></video>

            `;

            body.appendChild(questionCard);

        });

        guidanceContent.appendChild(card);

    });

}

/* LOAD FIRST YEAR */

renderGuidance(1);
/*  SUBMIT EXPERIENCE*/

const submitButton = document.getElementById("submitExperience");

submitButton.addEventListener("click", async () => {

    document.getElementById("loadingOverlay").style.display = "flex";

    const experienceData = {

        user_id,

        preparation_strategy:
        document.getElementById("preparationStrategy").value,

        core_skills:
        document.getElementById("coreSkills").value,

        resources:
        document.getElementById("resourcesUsed").value,

        interview_timeline:
        document.getElementById("timeline").value,

        mistakes:
        document.getElementById("mistakes").value,

        interview_rounds:
        document.getElementById("interviewRounds").value

    };

    try{

        /*  SAVE EXPERIENCE */

       

const experienceResponse = await fetch(

    `${BASE_URL}/api/experience`,

    {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify(experienceData)

            }

        );

        if(!experienceResponse.ok){

            throw new Error("Experience not saved.");

        }

        /* SAVE GUIDANCE */

        const answers = document.querySelectorAll(".guidance-answer");

        for(const answer of answers){

            if(answer.value.trim()===""){

                continue;

            }

            const guidanceData = {

                user_id,

                year: Number(answer.dataset.year),

                category: answer.dataset.category,

                question: answer.dataset.question,

                answer: answer.value.trim()

            };

           const guidanceResponse = await fetch(
    `${BASE_URL}/api/guidance`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(guidanceData)
    }
);

if (!guidanceResponse.ok) {
    throw new Error("Failed to save guidance.");
}

        }

      document.getElementById("loadingOverlay").style.display="none";

document.getElementById("successOverlay").style.display = "flex";
    }

    catch(error){

        console.error(error);

        document.getElementById("loadingOverlay").style.display="none";

        alert("Unable to save your experience.");

    }

});
/*  SUCCESS BUTTON */

const continueSuccess =
document.getElementById("continueSuccess");

continueSuccess.addEventListener("click", () => {

    window.location.href =
    "../Dashboard/dashboard.html";

});

const shareAnother =
document.getElementById("shareAnother");

shareAnother.addEventListener("click", () => {

    sessionStorage.clear();

    window.location.href =
    "contribute1.html";

});


/*  BACK BUTTON */

const backButton =
document.getElementById("backBtn");

backButton.addEventListener("click",()=>{

    window.location.href="contribute1.html";

});


/*  VIDEO PREVIEW(For dynamically created Guidance Questions) */

document.addEventListener("click",(e)=>{

    if(!e.target.classList.contains("video-btn")){

        return;

    }

    const hiddenInput =
    e.target.nextElementSibling;

    hiddenInput.click();

});


document.addEventListener("change",(e)=>{

    if(!e.target.classList.contains("hidden-video")){

        return;

    }

    const file=e.target.files[0];

    if(!file){

        return;

    }

    const preview=

    e.target.parentElement.nextElementSibling;

    preview.src=URL.createObjectURL(file);

    preview.style.display="block";

});


/* AUDIO BUTTON (Placeholder) */

document.addEventListener("click",(e)=>{

    if(e.target.classList.contains("audio-btn")){

        alert(

            "Audio recording will be enabled in Backend Version 2."

        );

    }

});


/* CLEAR TEMP DATA AFTER SUCCESS */

window.addEventListener("beforeunload", () => {

    sessionStorage.removeItem("company");
    sessionStorage.removeItem("mentor_name");
    sessionStorage.removeItem("experienceType");

});


