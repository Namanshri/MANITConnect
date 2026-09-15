const BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

renderProfileMenu("profileMenuContainer");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const postDetail = document.getElementById("postDetail");
const repliesHeading = document.getElementById("repliesHeading");
const repliesList = document.getElementById("repliesList");
const replyContent = document.getElementById("replyContent");
const replySubmitBtn = document.getElementById("replySubmitBtn");

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

async function loadPost() {

    if (!postId) {

        postDetail.innerHTML = `<p>No question specified.</p>`;
        return;

    }

    try {

        const response = await fetch(`${BASE_URL}/api/posts/${postId}`);

        if (!response.ok) {

            throw new Error("Unable to load this question.");

        }

        const data = await response.json();

        const { post, comments } = data;

        postDetail.innerHTML = `
            <div class="post-meta">
                ${post.category ? `<span class="post-category">${post.category}</span>` : ""}
                <span>${post.author_name}${post.author_role === "mentor" ? " (Mentor)" : ""}</span>
                <span>· ${timeAgo(post.created_at)}</span>
            </div>
            <h2>${post.title}</h2>
            <div class="post-body">${post.content}</div>
        `;

        repliesHeading.textContent = `${comments.length} ${comments.length === 1 ? "Reply" : "Replies"}`;

        if (comments.length === 0) {

            repliesList.innerHTML = `<div class="empty-state">No replies yet — be the first to answer.</div>`;

        } else {

            repliesList.innerHTML = "";

            comments.forEach((comment) => {

                const isExpert = comment.author_role === "mentor";

                repliesList.innerHTML += `
                    <div class="reply-card ${isExpert ? "expert" : ""}">
                        <div class="reply-meta">
                            <span>${comment.author_name}</span>
                            ${isExpert ? `<span class="expert-badge">✓ Expert Answer</span>` : ""}
                            <span>· ${timeAgo(comment.created_at)}</span>
                        </div>
                        <div class="reply-body">${comment.content}</div>
                    </div>
                `;

            });

        }

    }

    catch (error) {

        console.error(error);
        postDetail.innerHTML = `<p>Unable to load this question.</p>`;

    }

}

replySubmitBtn.addEventListener("click", async () => {

    const content = replyContent.value.trim();

    if (!content) {

        alert("Please write a reply before submitting.");
        return;

    }

    const user = await getCurrentUser();

    if (!user) {

        alert("Please log in to reply.");
        window.location.href = "../auth/login.html";
        return;

    }

    replySubmitBtn.disabled = true;
    replySubmitBtn.textContent = "Posting...";

    try {

        const response = await fetch(`${BASE_URL}/api/posts/${postId}/comments`, {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ content })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Unable to post your reply.");

        }

        replyContent.value = "";
        loadPost();

    }

    catch (error) {

        console.error(error);
        alert(error.message || "Something went wrong.");

    }

    finally {

        replySubmitBtn.disabled = false;
        replySubmitBtn.textContent = "Reply";

    }

});

loadPost();
