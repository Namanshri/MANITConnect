const BASE_URL = "https://manitconnnect-2.onrender.com";

const params = new URLSearchParams(window.location.search);

const insightId = params.get("id");

const title = document.getElementById("title");

const category = document.getElementById("category");

const mentorName = document.getElementById("mentorName");

const company = document.getElementById("company");

const role = document.getElementById("role");

const content = document.getElementById("content");

const tagContainer = document.getElementById("tagContainer");

const authorName = document.getElementById("authorName");

const authorCompany = document.getElementById("authorCompany");

const mentorProfileBtn = document.getElementById("mentorProfileBtn");

const relatedInsights = document.getElementById("relatedInsights");

const backBtn = document.getElementById("backBtn");


const helpfulBtn =
document.getElementById("helpfulBtn");

const helpfulCount =
document.getElementById("helpfulCount");

let currentInsight;

/* LOAD INSIGHT */

async function fetchInsight() {

    try {

        const response = await fetch(

            `${BASE_URL}/api/insight/${insightId}`

        );

        if (!response.ok) {

            throw new Error("Unable to load insight.");

        }

        currentInsight = await response.json();

        fetch(`${BASE_URL}/api/insight/${insightId}/view`, { method: "POST", credentials: "include" }).catch(() => {});

        renderInsight();

        fetchRelatedInsights();

    }

    catch(error){

        console.error(error);

        title.textContent="Unable to load insight.";

    }

}

/* RENDER */

function renderInsight(){

    title.textContent = currentInsight.title;

    category.textContent = currentInsight.category;

    mentorName.textContent = currentInsight.full_name;

    company.textContent = currentInsight.company;

    role.textContent = currentInsight.role;

    content.textContent = currentInsight.content;

    authorName.textContent = currentInsight.full_name;

    authorCompany.textContent =

        `${currentInsight.company} • ${currentInsight.role}`;

    helpfulCount.textContent =

`${currentInsight.helpful_count || 0} people found this helpful`;

    renderTags();

}

/* TAGS */

function renderTags(){

    tagContainer.innerHTML="";

    if(!currentInsight.tags){

        return;

    }

    currentInsight.tags

    .split(",")

    .forEach(tag=>{

        const chip=document.createElement("span");

        chip.className="blog-tag";

        chip.textContent=tag.trim();

        chip.onclick=()=>{

            window.location.href=

            `insights.html?tag=${tag.trim()}`;

        };

        tagContainer.appendChild(chip);

    });

}

/* RELATED INSIGHTS */

async function fetchRelatedInsights(){

    try{

        const response=await fetch(

            `${BASE_URL}/api/insight`

        );

        const insights=await response.json();

        relatedInsights.innerHTML="";

        insights

        .filter(

            item=>

            item.insight_id!=insightId

        )

        .slice(0,3)

        .forEach(item=>{

            relatedInsights.innerHTML+=`

            <div

                class="related-card"

                onclick="openInsight(${item.insight_id})"

            >

                <h3>

                    ${item.title}

                </h3>

                <p>

                    ${item.company}

                </p>

            </div>

            `;

        });

    }

    catch(error){

        console.log(error);

    }

}

/* OPEN */

function openInsight(id){

    window.location.href=

    `insight.html?id=${id}`;

}

/* PROFILE */

mentorProfileBtn.onclick=()=>{

    window.location.href=

    `../mentor/mentor.html?id=${currentInsight.mentor_id}`;

};

/* BACK */

backBtn.onclick=()=>{

    window.location.href="insights.html";

};

helpfulBtn.onclick = async()=>{

    await fetch(

        `${BASE_URL}/api/insight/${insightId}/helpful`,

        {

            method:"POST"

        }

    );

    currentInsight.helpful_count++;

    helpfulCount.textContent =

    `${currentInsight.helpful_count} people found this helpful`;

};

/* START */

fetchInsight();
