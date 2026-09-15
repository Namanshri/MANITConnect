const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

renderProfileMenu("profileMenuContainer");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContent = document.getElementById("tabContent");

let library = { insights: [], experiences: [], guidance: [] };
let currentTab = "insights";

async function loadLibrary() {

    const user = await getCurrentUser();

    if (!user) {

        tabContent.innerHTML = `<div class="empty-state">Please log in to view your library.</div>`;
        return;

    }

    try {

        const response = await fetch(`${BASE_URL}/api/bookmarks/library`, { credentials: "include" });

        if (!response.ok) {

            throw new Error("Unable to load your library.");

        }

        library = await response.json();

        renderTab(currentTab);

    }

    catch (error) {

        console.error(error);
        tabContent.innerHTML = `<div class="empty-state">Unable to load your library right now.</div>`;

    }

}

function renderTab(tab) {

    currentTab = tab;

    tabButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    const items = library[tab] || [];

    if (items.length === 0) {

        tabContent.innerHTML = `<div class="empty-state">Nothing saved here yet.</div>`;
        return;

    }

    tabContent.innerHTML = "";

    if (tab === "insights") {

        items.forEach((insight) => {

            const preview = (insight.content || "").length > 140
                ? insight.content.substring(0, 140) + "…"
                : (insight.content || "");

            tabContent.innerHTML += `
                <a class="library-card" href="../insights/insight.html?id=${insight.insight_id}">
                    <h3>${insight.title}</h3>
                    <div class="meta">By ${insight.mentor_name}${insight.category ? " · " + insight.category : ""}</div>
                    <div class="preview">${preview}</div>
                </a>
            `;

        });

    }

    else if (tab === "experiences") {

        items.forEach((exp) => {

            tabContent.innerHTML += `
                <a class="library-card" href="../mentor/mentor.html?id=${exp.mentor_id}">
                    <h3>${exp.company || "Company"} — ${exp.role || "Role"}</h3>
                    <div class="meta">By ${exp.mentor_name}${exp.experience_type ? " · " + exp.experience_type : ""}</div>
                    <div class="preview">${(exp.preparation_strategy || "").substring(0, 140)}</div>
                </a>
            `;

        });

    }

    else if (tab === "guidance") {

        items.forEach((g) => {

            tabContent.innerHTML += `
                <a class="library-card" href="../mentor/mentor.html?id=${g.mentor_id}">
                    <h3>${g.question}</h3>
                    <div class="meta">By ${g.mentor_name} · Year ${g.year}${g.category ? " · " + g.category : ""}</div>
                    <div class="preview">${(g.answer || "").substring(0, 140)}</div>
                </a>
            `;

        });

    }

}

tabButtons.forEach((btn) => {

    btn.addEventListener("click", () => {
        renderTab(btn.dataset.tab);
    });

});

loadLibrary();
