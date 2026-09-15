/*
   PROFILE MENU — avatar + dropdown, for the top-right of any navbar.
   Requires session.js AND comingSoon.js loaded first:
   <script src="../shared/session.js"></script>
   <script src="../shared/comingSoon.js"></script>
   <script src="../shared/profileMenu.js"></script>

   Usage: put an empty container in your navbar —
   <div id="profileMenuContainer"></div>
   — then call renderProfileMenu("profileMenuContainer") after the page loads.
*/

async function renderProfileMenu(containerId) {

    const container = document.getElementById(containerId);

    if (!container) return;

    const user = await getCurrentUser();

    if (!user) {

        container.innerHTML = `<a href="../auth/login.html" style="font-weight:600;color:#8a00ff;text-decoration:none;">Login</a>`;
        return;

    }

    const initial = (user.full_name || "?").trim().charAt(0).toUpperCase();

    container.style.position = "relative";

    container.innerHTML = `
        <button id="profileMenuBtn" style="
            width: 40px; height: 40px; border-radius: 50%;
            background: #8a00ff; color: #fff; border: none;
            font-weight: 700; font-size: 16px; cursor: pointer;
        ">${initial}</button>

        <div id="profileMenuDropdown" style="
            display: none; position: absolute; right: 0; top: 48px;
            background: #fff; border-radius: 10px; min-width: 180px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15); overflow: hidden;
            z-index: 1000; font-family: 'Inter', Arial, sans-serif;
        ">
            <div style="padding: 12px 16px; border-bottom: 1px solid #eee;">
                <div style="font-weight:600; font-size:14px; color:#222;">${user.full_name}</div>
                <div style="font-size:12px; color:#999; text-transform:capitalize;">${user.role}</div>
            </div>
            <a id="profileMenuLibrary" href="../library/library.html" style="
                display:block; padding:12px 16px; color:#333; text-decoration:none; font-size:14px;
            ">📚 Your Library</a>
            <a id="profileMenuLogout" href="#" style="
                display:block; padding:12px 16px; color:#e74c3c; text-decoration:none; font-size:14px;
                border-top: 1px solid #eee;
            ">🚪 Logout</a>
        </div>
    `;

    const btn = document.getElementById("profileMenuBtn");
    const dropdown = document.getElementById("profileMenuDropdown");

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
        dropdown.style.display = "none";
    });

    document.getElementById("profileMenuLogout").addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();
    });

}
