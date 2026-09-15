/*
   BOOKMARK BUTTON — reusable toggle for insights, experiences, and
   individual guidance answers. Requires session.js loaded first.

   Usage: renderBookmarkButton(containerElement, "insight", insightId)
   Call it once per bookmarkable item on the page. It fetches the
   current bookmark state itself.
*/

const BOOKMARK_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

async function renderBookmarkButton(containerEl, itemType, itemId) {

    if (!containerEl || !itemId) return;

    const btn = document.createElement("button");
    btn.className = "bookmark-btn";
    btn.style.cssText = `
        background: none; border: 1px solid #ddd; border-radius: 20px;
        padding: 6px 12px; font-size: 13px; cursor: pointer; color: #666;
    `;
    btn.textContent = "🔖 Save";

    containerEl.appendChild(btn);

    // Check current state (silently — if not logged in, just leave it
    // as an unsaved-looking button; clicking will prompt login).
    try {

        const idsResponse = await fetch(`${BOOKMARK_BASE_URL}/api/bookmarks/mine/${itemType}`, {
            credentials: "include"
        });

        if (idsResponse.ok) {

            const ids = await idsResponse.json();

            if (ids.includes(Number(itemId))) {

                btn.textContent = "✓ Saved";
                btn.style.background = "#f1e3ff";
                btn.style.color = "#8a00ff";
                btn.style.borderColor = "#8a00ff";

            }

        }

    }

    catch (err) {

        // not logged in or network issue — button just stays default

    }

    btn.addEventListener("click", async (e) => {

        e.preventDefault();
        e.stopPropagation();

        const user = await getCurrentUser();

        if (!user) {

            alert("Please log in to save items to your library.");
            window.location.href = "../auth/login.html";
            return;

        }

        try {

            const response = await fetch(`${BOOKMARK_BASE_URL}/api/bookmarks/toggle`, {

                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ item_type: itemType, item_id: itemId })

            });

            const data = await response.json();

            if (data.bookmarked) {

                btn.textContent = "✓ Saved";
                btn.style.background = "#f1e3ff";
                btn.style.color = "#8a00ff";
                btn.style.borderColor = "#8a00ff";

            } else {

                btn.textContent = "🔖 Save";
                btn.style.background = "none";
                btn.style.color = "#666";
                btn.style.borderColor = "#ddd";

            }

        }

        catch (err) {

            console.error(err);
            alert("Unable to save right now.");

        }

    });

}
