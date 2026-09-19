const BASE_URL = SESSION_BASE_URL;
const form = document.getElementById("advisorForm");
const input = document.getElementById("questionInput");
const messages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");
const history = [];

requireAuth();

function escapeHtml(value) { const el = document.createElement("div"); el.textContent = value; return el.innerHTML; }
function scrollToBottom() { messages.scrollTop = messages.scrollHeight; }
function addMessage(role, text, sources = []) {
    const item = document.createElement("article"); item.className = `message ${role}`;
    const sourceMarkup = sources.length ? `<div class="sources">Sources: ${sources.map((s) => {
        const label = [s.mentor, s.role && `— ${s.role}`, s.company && `at ${s.company}`].filter(Boolean).join(" ") || `${s.source_type} record`;
        const href = s.source_type === "insight" ? `../insights/insight.html?id=${s.source_id}` : `../mentor/mentor.html?id=${s.mentor_id}`;
        return `<a href="${href}" title="${escapeHtml(s.title || label)}">[${s.reference}] ${escapeHtml(label)}</a>`;
    }).join("")}</div>` : "";
    item.innerHTML = role === "assistant" ? `<div class="avatar">✦</div><div><div class="bubble">${escapeHtml(text).replace(/\n/g, "<br>")}</div>${sourceMarkup}</div>` : `<div class="bubble">${escapeHtml(text).replace(/\n/g, "<br>")}</div>`;
    messages.appendChild(item); scrollToBottom(); return item;
}
function setBusy(busy) { sendButton.disabled = busy; input.disabled = busy; sendButton.textContent = busy ? "…" : "➜"; }
input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 104)}px`; });
document.querySelectorAll(".suggestions button").forEach((button) => button.addEventListener("click", () => { input.value = button.textContent; form.requestSubmit(); }));
form.addEventListener("submit", async (event) => {
    event.preventDefault(); const question = input.value.trim(); if (!question) return;
    addMessage("user", question); input.value = ""; input.style.height = "auto"; setBusy(true);
    const typing = addMessage("assistant", "Looking through MANITConnect records…"); typing.classList.add("typing");
    try {
        const response = await fetch(`${BASE_URL}/api/advisor/ask`, { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ question, history }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to get an answer.");
        typing.remove(); addMessage("assistant", data.answer, data.sources); history.push({ role:"user", content:question }, { role:"assistant", content:data.answer });
    } catch (error) { typing.remove(); addMessage("assistant", error.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); input.focus(); }
});
