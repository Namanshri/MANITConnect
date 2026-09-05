const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

/* Require a logged-in mentor. requireAuth() comes from shared/session.js —
   include that script BEFORE this one in writeInsight.html:
   <script src="../shared/session.js"></script> */
requireAuth(["mentor"]);

const insightForm = document.getElementById("insightForm");

const tagInput = document.getElementById("tagInput");

const selectedTags = document.getElementById("selectedTags");

let tags = [];

insightForm.addEventListener("submit", publishInsight);

/* TAGS */

tagInput.addEventListener("keydown", (event) => {

    if (event.key !== "Enter") {

        return;

    }

    event.preventDefault();

    const value = tagInput.value.trim();

    if (value === "") {

        return;

    }

    if (tags.includes(value)) {

        tagInput.value = "";

        return;

    }

    tags.push(value);

    renderTags();

    tagInput.value = "";

});

function renderTags() {

    selectedTags.innerHTML = "";

    tags.forEach((tag, index) => {

        const chip = document.createElement("div");

        chip.className = "selected-tag";

        chip.innerHTML = `

            ${tag}

            <span onclick="removeTag(${index})">

                ×

            </span>

        `;

        selectedTags.appendChild(chip);

    });

}

function removeTag(index) {

    tags.splice(index, 1);

    renderTags();

}

async function publishInsight(event) {

    event.preventDefault();

    // NOTE: no mentor_id sent here at all — the backend derives it from
    // the login cookie via authMiddleware. Sending one from the client
    // would be exactly the "trust the frontend" bug we've been fixing
    // everywhere else.
    const insight = {

        title: document.getElementById("title").value,

        category: document.getElementById("category").value,

        // was reading a non-existent #tags input before — this is the
        // tags array your chip UI (tagInput/selectedTags) actually builds
        tags: tags.join(","),

        content: document.getElementById("content").value

    };

    const submitBtn = insightForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Publishing...";

    try {

        const response = await fetch(

            `${BASE_URL}/api/insight`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                credentials: "include",

                body: JSON.stringify(insight)

            }

        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {

            throw new Error(data.message || "Unable to publish insight.");

        }

        alert("Insight published successfully!");

        window.location.href = "insights.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message || "Something went wrong.");

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

    }

}
