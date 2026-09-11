/*
   Lightweight "Coming Soon" modal, used for nav items that don't have
   a real page yet (AI Advisor, Community, etc). Replaces native
   alert('Coming Soon') — a native alert always shows a browser-chrome
   prefix like "yoursite.com says", which this avoids.

   Usage in any page:
   <script src="../shared/comingSoon.js"></script>
   ...
   <a href="#" onclick="showComingSoon(); return false;">AI Advisor</a>
*/

function showComingSoon(message = "This feature is coming soon!") {

    let overlay = document.getElementById("comingSoonOverlay");

    if (!overlay) {

        overlay = document.createElement("div");
        overlay.id = "comingSoonOverlay";
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999;
        `;

        overlay.innerHTML = `
            <div style="
                background: #fff; padding: 28px 32px; border-radius: 12px;
                max-width: 320px; text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                font-family: 'Inter', Arial, sans-serif;
            ">
                <div style="font-size: 32px; margin-bottom: 8px;">🚧</div>
                <p id="comingSoonMessage" style="margin: 0 0 18px; color: #333; font-size: 15px;"></p>
                <button id="comingSoonCloseBtn" style="
                    background: #6C63FF; color: #fff; border: none;
                    padding: 10px 24px; border-radius: 8px; cursor: pointer;
                    font-weight: 600; font-size: 14px;
                ">Got it</button>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.style.display = "none";
        });

        document.getElementById("comingSoonCloseBtn").addEventListener("click", () => {
            overlay.style.display = "none";
        });

    }

    document.getElementById("comingSoonMessage").textContent = message;
    overlay.style.display = "flex";

}
