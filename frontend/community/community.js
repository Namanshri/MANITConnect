const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

renderProfileMenu("profileMenuContainer");

const postsFeed = document.getElementById("postsFeed");
const searchBox = document.getElementById("searchBox");
const postTitle = document.getElementById("postTitle");
const postContent = document.getElementById("postContent");
const postCategory = document.getElementById("postCategory");
const postSubmitBtn = document.getElementById("postSubmitBtn");

function timeAgo(dateString) {

    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;

}

async function fetchPosts(searchTerm = "") {

    try {

        const url = searchTerm
            ? `${BASE_URL}/api/posts?search=${encodeURIComponent(searchTerm)}`
            : `${BASE_URL}/api/posts`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error("Unable to load posts.");

        }

        const posts = await response.json();

        renderPosts(posts);

    }

    catch (error) {

        console.error(error);

        postsFeed.innerHTML = `<div class="empty-state">Unable to load the community feed.</div>`;

    }

}

function renderPosts(posts) {

    postsFeed.innerHTML = "";

    if (posts.length === 0) {

        postsFeed.innerHTML = `<div class="empty-state">No questions found. Be the first to ask!</div>`;
        return;

    }

    posts.forEach((post) => {

        const preview = (post.content || "").length > 160
            ? post.content.substring(0, 160) + "…"
            : (post.content || "");

        postsFeed.innerHTML += `
            <a class="post-card" href="community-post.html?id=${post.post_id}">

                <div class="post-meta">
                    ${post.category ? `<span class="post-category">${post.category}</span>` : ""}
                    <span>${post.author_name}${post.author_role === "mentor" ? " (Mentor)" : ""}</span>
                    <span>· ${timeAgo(post.created_at)}</span>
                </div>

                <h3>${post.title}</h3>

                <p class="post-preview">${preview}</p>

                <div class="post-footer">
                    <span>💬 ${post.reply_count} ${Number(post.reply_count) === 1 ? "reply" : "replies"}</span>
                    ${post.has_expert_answer ? `<span class="expert-badge">✓ Expert Answer</span>` : ""}
                </div>

            </a>
        `;

    });

}

let searchTimeout = null;

searchBox.addEventListener("input", () => {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

        fetchPosts(searchBox.value.trim());

    }, 300);

});

postSubmitBtn.addEventListener("click", async () => {

    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    const category = postCategory.value;

    if (!title || !content) {

        alert("Please add both a title and your question.");
        return;

    }

    const user = await getCurrentUser();

    if (!user) {

        alert("Please log in to post a question.");
        window.location.href = "../auth/login.html";
        return;

    }

    postSubmitBtn.disabled = true;
    postSubmitBtn.textContent = "Posting...";

    try {

        const response = await fetch(`${BASE_URL}/api/posts`, {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title, content, category })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Unable to post your question.");

        }

        postTitle.value = "";
        postContent.value = "";
        postCategory.value = "";

        fetchPosts(searchBox.value.trim());

    }

    catch (error) {

        console.error(error);
        alert(error.message || "Something went wrong.");

    }

    finally {

        postSubmitBtn.disabled = false;
        postSubmitBtn.textContent = "Post";

    }

});

fetchPosts();
