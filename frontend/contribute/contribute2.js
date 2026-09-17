/* TOGGLE BETWEEN JOURNEY & GUIDANCE*/

const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

requireAuth(["mentor"]);

const guidanceOnly = new URLSearchParams(window.location.search).get("mode") === "guidance";
const pendingJourney = JSON.parse(sessionStorage.getItem("pendingJourney") || "null");

if (!pendingJourney && !guidanceOnly) {

    alert("Please start from Step 1 first.");
    window.location.href = "contribute1.html";

}

const journeyBtn = document.getElementById("journeyBtn");

const guidanceBtn = document.getElementById("guidanceBtn");

const journeySection = document.getElementById("journeySection");

const guidanceSection = document.getElementById("guidanceSection");

if (guidanceOnly) {
    journeyBtn.parentElement.style.display = "none";
    journeySection.style.display = "none";
    guidanceSection.style.display = "block";
    document.getElementById("backBtn").style.display = "none";
    document.getElementById("submitExperience").textContent = "Submit Guidance";
    document.querySelector("#successOverlay h2").textContent = "Guidance Submitted!";
    document.querySelector("#successOverlay .success-subtitle").textContent = "Your guidance will help MANIT juniors prepare with confidence.";
}

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

const prepVideoBtn = document.getElementById("prepVideoBtn");

// Browser speech recognition writes the transcript into the textarea beside
// the button; the mentor can edit it before submitting.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
function attachVoiceButton(button, textarea) {
    let recognition = null;
    button.onclick = () => {
        if (!SpeechRecognition) {
            alert("Speech-to-text is not supported by this browser. Please use Chrome or type your answer.");
            return;
        }
        if (recognition) { recognition.abort(); return; }
        recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = false;
        recognition.onstart = () => { button.textContent = "Stop recording"; };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textarea.value = `${textarea.value}${textarea.value ? " " : ""}${transcript}`;
            textarea.focus();
        };
        recognition.onerror = () => alert("We could not transcribe that audio. Please try again.");
        recognition.onend = () => { recognition = null; button.textContent = "🎙️ Record Audio"; };
        recognition.start();
    };
}
document.querySelectorAll(".audio-btn").forEach((button) => attachVoiceButton(button, button.closest(".card")?.querySelector("textarea")));

const prepVideo = document.getElementById("prepVideo");

const prepPreview = document.getElementById("prepPreview");

const prepUploadStatus = document.getElementById("prepUploadStatus");

let preparationVideoUrl = "";
const sectionVideos = {};

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

    previewElement.style.display = "none";

    isUploading = true;
    updateSubmitAvailability();

    setUploadStatus(statusElement, "Uploading...", null, "uploading");

    fetch(`${BASE_URL}/api/upload/signature`, { credentials: "include" })
        .then(async (response) => {
            const signatureData = await response.json();
            if (!response.ok) throw new Error(signatureData.message || "Could not prepare upload.");

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", signatureData.api_key);
            formData.append("timestamp", signatureData.timestamp);
            formData.append("folder", signatureData.folder);
            formData.append("signature", signatureData.signature);

            const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/video/upload`,
                { method: "POST", body: formData }
            );
            const data = await cloudinaryResponse.json();
            if (!cloudinaryResponse.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed.");

            previewElement.src = data.secure_url;
            previewElement.style.display = "block";

            setUploadStatus(statusElement, "Upload complete ✓", null, "success");

            if (onComplete) onComplete(data.secure_url);

        })
        .catch((err) => {

            console.error(err);

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

        uploadVideo(file, prepUploadStatus, prepPreview, (url) => { preparationVideoUrl = url; });

    });

}

document.querySelectorAll(".video-btn").forEach((button, index) => {
    if (button.id === "prepVideoBtn") return;
    const card = button.closest(".card");
    const input = card.querySelector('input[type="file"]');
    const preview = card.querySelector(".video-preview");
    const status = document.createElement("div");
    status.className = "upload-status";
    button.onclick = () => input.click();
    input.onchange = () => uploadVideo(input.files[0], status, preview, (url) => { sectionVideos[`section_${index}`] = url; });
    button.parentElement.appendChild(status);
});

const yearButtons = document.querySelectorAll(".year-btn");

const guidanceContent = document.getElementById("guidanceContent");

let currentGuidanceYear = 1;

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

                const audioButton = document.createElement("button");
                audioButton.type = "button";
                audioButton.className = "audio-btn";
                audioButton.textContent = "🎙️ Record Audio";
                attachVoiceButton(audioButton, textarea);

                wrapper.appendChild(label);
                wrapper.appendChild(textarea);
                wrapper.appendChild(audioButton);
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

async function loadExistingGuidance() {
    const user = await getCurrentUser();
    if (!user?.mentor_id) return;
    const response = await fetch(`${BASE_URL}/api/guidance/${user.mentor_id}`);
    if (!response.ok) return;
    const answers = await response.json();
    answers.forEach((item) => {
        const textarea = [...document.querySelectorAll("#guidanceContent textarea")].find((el) =>
            Number(el.dataset.year) === Number(item.year) &&
            el.dataset.category === item.category && el.dataset.question === item.question
        );
        if (textarea) textarea.value = item.answer;
    });
}

loadExistingGuidance();

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

    if (!pendingJourney && !guidanceOnly) {

        alert("Please start from Step 1 first.");
        window.location.href = "contribute1.html";
        return;

    }

    const experienceData = pendingJourney && {

        ...pendingJourney,

        preparation_strategy: document.getElementById("preparationStrategy").value.trim(),
        core_skills: document.getElementById("coreSkills").value.trim(),
        resources: document.getElementById("resourcesUsed").value.trim(),
        interview_timeline: document.getElementById("timeline").value.trim(),
        mistakes: document.getElementById("mistakes").value.trim(),
        interview_rounds: document.getElementById("interviewRounds").value.trim(),
        preparation_video_url: preparationVideoUrl,
        section_videos: sectionVideos

    };

    const guidanceAnswers = collectGuidanceAnswers();

    loadingOverlay.style.display = "flex";
    submitBtn.disabled = true;

    try {

        if (experienceData) {
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
        }

        for (const item of guidanceAnswers) {

            const guidanceResponse = await fetch(`${BASE_URL}/api/guidance`, {

                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(item)

            });

            if (!guidanceResponse.ok) {

                console.error("Failed to save a guidance answer:", item);

            }

        }

        sessionStorage.removeItem("pendingJourney");

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

        // NOTE: folder is "Dashboard" with a capital D in this repo —
        // Vercel's hosting is case-sensitive (unlike Windows locally),
        // so this needs to match exactly or it 404s in production.
        window.location.href = "../Dashboard/dashboard.html";

    });

}

const shareAnother = document.getElementById("shareAnother");

if (shareAnother) {

    shareAnother.addEventListener("click", () => {

        window.location.href = "contribute1.html";

    });

}
