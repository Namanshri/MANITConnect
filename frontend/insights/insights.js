const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

const params = new URLSearchParams(window.location.search);

const selectedTag = params.get("tag");

const insightContainer = document.getElementById("insightContainer");

const searchBox = document.getElementById("searchBox");

const companyFilter = document.getElementById("companyFilter");

const categoryFilter = document.getElementById("categoryFilter");

const yearFilter = document.getElementById("yearFilter");

const tagContainer = document.getElementById("tagContainer");

const writeInsightBtn = document.getElementById("writeInsightBtn");

let insights = [];

let filteredInsights = [];


async function fetchInsights() {

    try {

        const response = await fetch(`${BASE_URL}/api/insight`);

        if (!response.ok) {

            throw new Error("Unable to fetch insights.");

        }

        insights = await response.json();

        filteredInsights = insights;

        loadCompanyFilter();
        loadYearFilter();
        loadTags();
        renderInsights(filteredInsights);

    }

    catch (error) {

        console.error(error);

        insightContainer.innerHTML = `<h2>Unable to load insights.</h2>`;

    }

}

function loadCompanyFilter() {

    const companies = [...new Set(insights.map(insight => insight.company))];

    companies.forEach(company => {

        if (!company) return;

        const option = document.createElement("option");
        option.value = company;
        option.textContent = company;
        companyFilter.appendChild(option);

    });

}

function loadYearFilter() {

    const years = [
        ...new Set(
            insights
                .filter(insight => insight.created_at)
                .map(insight => new Date(insight.created_at).getFullYear())
        )
    ].sort((a, b) => b - a);

    years.forEach(year => {

        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);

    });

}

function loadTags() {

    const tagSet = new Set();

    insights.forEach(insight => {

        if (!insight.tags) return;

        insight.tags.split(",").forEach(tag => tagSet.add(tag.trim()));

    });

    tagSet.forEach(tag => {

        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        span.onclick = () => filterByTag(tag);
        tagContainer.appendChild(span);

    });

}

function renderInsights(data) {

    insightContainer.innerHTML = "";

    if (data.length === 0) {

        insightContainer.innerHTML = `<h2>No Insights Found.</h2>`;
        return;

    }

    data.forEach(insight => {

        const card = document.createElement("div");
        card.className = "insight-card";

        card.innerHTML = `
            <span class="category">${insight.category || "-"}</span>
            <h3>${insight.title}</h3>
            <div class="meta">By ${insight.full_name || "Mentor"}</div>
            <p class="preview">${insight.content.substring(0,180)}...</p>
            <div class="tags">${createTags(insight.tags)}</div>
            <div style="display:flex;gap:10px;align-items:center;margin-top:10px;">
                <button class="read-btn" onclick="openInsight(${insight.insight_id})">Read More</button>
                <div id="insightCardBookmark-${insight.insight_id}"></div>
            </div>
        `;

        insightContainer.appendChild(card);

        if (typeof renderBookmarkButton === "function") {

            renderBookmarkButton(
                document.getElementById(`insightCardBookmark-${insight.insight_id}`),
                "insight",
                insight.insight_id
            );

        }

    });

}

function createTags(tags) {

    if (!tags) return "";

    return tags
        .split(",")
        .map(tag => `<span class="blog-tag">${tag.trim()}</span>`)
        .join("");

}

function filterInsights() {

    const search = searchBox.value.toLowerCase();
    const company = companyFilter.value;
    const category = categoryFilter.value;
    const year = yearFilter.value;

    filteredInsights = insights.filter(insight => {

        const titleMatch = insight.title.toLowerCase().includes(search);
        const companyMatch = company === "" || insight.company === company;
        const categoryMatch = category === "" || insight.category === category;
        const yearMatch = year === "" || (insight.created_at && new Date(insight.created_at).getFullYear() === Number(year));

        return titleMatch && companyMatch && categoryMatch && yearMatch;

    });

    if (selectedTag) {

        filterByTag(selectedTag);

    } else {

        renderInsights(filteredInsights);

    }

}

function filterByTag(tag) {

    filteredInsights = insights.filter(insight => insight.tags && insight.tags.includes(tag));
    renderInsights(filteredInsights);

}

function openInsight(id) {

    window.location.href = `insight.html?id=${id}`;

}

searchBox.addEventListener("input", filterInsights);
companyFilter.addEventListener("change", filterInsights);
categoryFilter.addEventListener("change", filterInsights);
yearFilter.addEventListener("change", filterInsights);

fetchInsights();

getCurrentUser().then((user) => {
    if (!user || !["mentor", "admin"].includes(user.role)) writeInsightBtn.style.display = "none";
});
