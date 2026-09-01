/* TOGGLE BETWEEN JOURNEY & GUIDANCE*/

const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

/* Require a logged-in mentor. requireAuth() comes from shared/session.js —
   include that script BEFORE this one in contribute2.html. */
requireAuth(["mentor"]);

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

/* ============================================================
   VIDEO UPLOAD — this is the piece that was buggy before.
   preparationVideoUrl is ONLY ever set after Cloudinary actually
   returns a URL. The Submit button is disabled for the entire
   duration of the upload, so it is impossible to submit while
   preparation_video_url is still "".
   ============================================================ */

const prepVideoBtn = document.getElementById("prepVideoBtn");

const prepVideo = document.getElementById("prepVideo");

const prepPreview = document.getElementById("prepPreview");

const prepUploadStatus = document.getElementById("prepUploadStatus");

let preparationVideoUrl = "";

let isUploading = false;

function setUploadStatus(element, message, progress = null, state = "") {

    if (!element) return;

    element.className = `upload-status ${state}`;

    element.textContent = progress === null ? message : `${message} ${progress}%`;

}

function updateSubmitAvailability() {

    const submitBtn = document.getElementById("submitExperience");

    if (!submitBtn) return;

    submitBtn.disabled = isUploading;

    submitBtn.textContent = isUploading ? "Waiting for video upload..." : "Submit →";

}

function uploadVideo(file, statusElement, previewElement, onComplete) {

    if (!file) return;

    if (!file.type.startsWith("video/")) {

        setUploadStatus(statusElement, "Please choose a video file.", null, "error");
        return;

    }

    if (file.size > 100 * 1024 * 1024) {

        setUploadStatus(statusElement, "Maximum video size allowed is 100 MB.", null, "error");
        return;

    }

    // Never let the old URL/preview survive a re-upload attempt.
    preparationVideoUrl = "";
    previewElement.style.display = "none";

    isUploading = true;
    updateSubmitAvailability();

    setUploadStatus(statusElement, "Uploading...", null, "uploading");

    const formData = new FormData();
    formData.append("video", file);

    fetch(`${BASE_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData
    })
        .then(async (response) => {

            const data = await response.json();

            if (!response.ok || !data.video_url) {

                throw new Error(data.message || "Upload failed.");

            }

            // ONLY here — after a real, successful response with a real
            // URL — do we mark the upload as complete.
            preparationVideoUrl = data.video_url;

            previewElement.src = data.video_url;
            previewElement.style.display = "block";

            setUploadStatus(statusElement, "Upload complete ✓", null, "success");

            if (onComplete) onComplete(data.video_url);

        })
        .catch((err) => {

            console.error(err);

            preparationVideoUrl = "";
            previewElement.style.display = "none";

            setUploadStatus(statusElement, `Upload failed — Try Again (${err.message})`, null, "error");

        })
        .finally(() => {

            isUploading = false;
            updateSubmitAvailability();

        });

}

if (prepVideoBtn && prepVideo) {

    prepVideoBtn.addEventListener("click", () => {

        prepVideo.click();

    });

    prepVideo.addEventListener("change", () => {

        const file = prepVideo.files[0];

        uploadVideo(file, prepUploadStatus, prepPreview);

    });

}

/* ============================================================
   GUIDANCE QUESTIONS — rendered from guidanceQuestions.js
   (loaded as a global `guidanceQuestions` object before this file)
   ============================================================ */

const yearButtons = document.querySelectorAll(".year-btn");

const guidanceContent = document.getElementById("guidanceContent");

let currentGuidanceYear = 1;

// Guidance answers are kept in the DOM per-year as the mentor switches
// tabs, so nothing typed is lost — we just read every rendered
// textarea across all years at submit time (see collectGuidanceAnswers).
// To support that without re-rendering wiping earlier years' answers,
// we render all four years up front instead of only the active one.
function renderAllGuidanceYears() {

    guidanceContent.innerHTML = "";

    Object.keys(guidanceQuestions).forEach((year) => {

        const yearWrapper = document.createElement("div");
        yearWrapper.className = "guidance-year-block";
        yearWrapper.dataset.yearBlock = year;
        yearWrapper.style.display = Number(year) === currentGuidanceYear ? "block" : "none";

        guidanceQuestions[year].forEach((section, sectionIndex) => {

            const sectionEl = document.createElement("div");
            sectionEl.className = "card guidance-category";

            const heading = document.createElement("h2");
            heading.textContent = section.title;
            sectionEl.appendChild(heading);

            section.questions.forEach((question, qIndex) => {

                const wrapper = document.createElement("div");
                wrapper.className = "guidance-question";

                const label = document.createElement("label");
                label.textContent = question;

                const textarea = document.createElement("textarea");
                textarea.placeholder = "Your answer (optional)";
                textarea.dataset.year = year;
                textarea.dataset.category = section.title;
                textarea.dataset.question = question;
                textarea.id = `guidance-${year}-${sectionIndex}-${qIndex}`;

                wrapper.appendChild(label);
                wrapper.appendChild(textarea);
                sectionEl.appendChild(wrapper);

            });

            yearWrapper.appendChild(sectionEl);

        });

        guidanceContent.appendChild(yearWrapper);

    });

}

yearButtons.forEach((button) => {

    button.onclick = () => {

        yearButtons.forEach((btn) => btn.classList.remove("active-year"));
        button.classList.add("active-year");

        currentGuidanceYear = Number(button.dataset.year);

        document.querySelectorAll("[data-year-block]").forEach((block) => {

            block.style.display = Number(block.dataset.yearBlock) === currentGuidanceYear ? "block" : "none";

        });

    };

});

renderAllGuidanceYears();

function collectGuidanceAnswers() {

    const answers = [];

    document.querySelectorAll("#guidanceContent textarea").forEach((textarea) => {

        const value = textarea.value.trim();

        if (value !== "") {

            answers.push({

                year: Number(textarea.dataset.year),
                category: textarea.dataset.category,
                question: textarea.dataset.question,
                answer: value

            });

        }

    });

    return answers;

}

/* ============================================================
   SUBMIT
   ============================================================ */

const submitBtn = document.getElementById("submitExperience");

const backBtn = document.getElementById("backBtn");

const loadingOverlay = document.getElementById("loadingOverlay");

const successOverlay = document.getElementById("successOverlay");

backBtn.addEventListener("click", () => {

    window.location.href = "contribute1.html";

});

submitBtn.addEventListener("click", async () => {

    if (isUploading) {

        alert("Please wait for the video upload to finish before submitting.");
        return;

    }

    const experienceData = {

        preparation_strategy: document.getElementById("preparationStrategy").value.trim(),
        core_skills: document.getElementById("coreSkills").value.trim(),
        resources: document.getElementById("resourcesUsed").value.trim(),
        interview_timeline: document.getElementById("timeline").value.trim(),
        mistakes: document.getElementById("mistakes").value.trim(),
        interview_rounds: document.getElementById("interviewRounds").value.trim(),
        // Only ever the URL Cloudinary actually returned — never a
        // placeholder, never sent while empty-because-still-uploading.
        preparation_video_url: preparationVideoUrl

    };

    const guidanceAnswers = collectGuidanceAnswers();

    loadingOverlay.style.display = "flex";
    submitBtn.disabled = true;

    try {

        const experienceResponse = await fetch(`${BASE_URL}/api/experience`, {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(experienceData)

        });

        const experienceResult = await experienceResponse.json();

        if (!experienceResponse.ok) {

            throw new Error(experienceResult.message || "Failed to save your journey.");

        }

        // Guidance answers are optional and saved one at a time —
        // mentor_id is derived server-side from the login cookie for each.
        for (const item of guidanceAnswers) {

            const guidanceResponse = await fetch(`${BASE_URL}/api/guidance`, {

                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(item)

            });

            if (!guidanceResponse.ok) {

                // Don't abort the whole submission over one optional
                // guidance answer failing — log it and keep going.
                console.error("Failed to save a guidance answer:", item);

            }

        }

        loadingOverlay.style.display = "none";
        successOverlay.style.display = "flex";

    }

    catch (error) {

        console.error(error);

        loadingOverlay.style.display = "none";
        alert(error.message || "Unable to save your experience. Please try again.");
        submitBtn.disabled = false;

    }

});

const continueSuccess = document.getElementById("continueSuccess");

if (continueSuccess) {

    continueSuccess.addEventListener("click", () => {

        window.location.href = "../dashboard/dashboard.html";

    });

}

const shareAnother = document.getElementById("shareAnother");

if (shareAnother) {

    shareAnother.addEventListener("click", () => {

        window.location.href = "contribute1.html";

    });

}
