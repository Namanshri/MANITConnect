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
let isAdmin = false;
let currentUser = null;
let parentCommentId = null;
const replyingTo = document.getElementById("replyingTo");

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
            ${isAdmin || currentUser?.user_id === post.user_id ? `<button class="admin-delete-post" type="button" data-post-id="${post.post_id}">Delete question</button>` : ""}
        `;

        repliesHeading.textContent = `${comments.length} ${comments.length === 1 ? "Reply" : "Replies"}`;

        if (comments.length === 0) {

            repliesList.innerHTML = `<div class="empty-state">No replies yet — be the first to answer.</div>`;

        } else {

            repliesList.innerHTML = "";

            comments.forEach((comment) => {

                const isExpert = comment.author_role === "mentor";
                const canDelete = isAdmin || currentUser?.user_id === comment.user_id;

                repliesList.innerHTML += `
                    <div class="reply-card ${isExpert ? "expert" : ""} ${comment.parent_comment_id ? "threaded" : ""}">
                        <div class="reply-meta">
                            <span>${comment.author_name}</span>
                            ${comment.author_role === "admin" ? `<span class="admin-badge">Admin</span>` : ""}
                            ${isExpert ? `<span class="expert-badge">✓ Expert Answer</span>` : ""}
                            <span>· ${timeAgo(comment.created_at)}</span>
                        </div>
                        <div class="reply-body">${comment.content}</div>
                        <div class="reply-actions"><button class="reply-to" data-comment-id="${comment.comment_id}" data-author="${comment.author_name}">Reply</button>${canDelete ? `<button class="admin-delete-comment" type="button" data-comment-id="${comment.comment_id}">Delete</button>` : ""}</div>
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

document.addEventListener("click", async (event) => {
    const replyButton = event.target.closest(".reply-to");
    if (replyButton) { parentCommentId=Number(replyButton.dataset.commentId); replyingTo.hidden=false; replyingTo.textContent=`Replying to ${replyButton.dataset.author}`; replyContent.focus(); return; }
    const commentButton = event.target.closest(".admin-delete-comment");
    const postButton = event.target.closest(".admin-delete-post");
    if (!commentButton && !postButton) return;
    if (!confirm(commentButton ? "Delete this reply?" : "Delete this question and all replies?")) return;
    const button = commentButton || postButton;
    button.disabled = true;
    const url = commentButton ? `${BASE_URL}/api/posts/comments/${button.dataset.commentId}` : `${BASE_URL}/api/posts/${button.dataset.postId}`;
    try {
        const response = await fetch(url, { method: "DELETE", credentials: "include" });
        if (!response.ok) throw new Error();
        if (postButton) window.location.href = "community.html";
        else loadPost();
    } catch (_) { button.disabled = false; alert("Unable to delete this content."); }
});

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
            body: JSON.stringify({ content, parent_comment_id: parentCommentId })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Unable to post your reply.");

        }

        replyContent.value = "";
        parentCommentId = null;
        replyingTo.hidden = true;
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

getCurrentUser().then((user) => { currentUser=user; isAdmin = user?.role === "admin"; loadPost(); });
