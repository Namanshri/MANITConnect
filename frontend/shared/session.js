/*
   SESSION HELPER
   Identity comes ONLY from GET /api/auth/me, which is backed by the
   HttpOnly cookie the server set at login. Never read a user_id or
   mentor_id back out of localStorage for anything security-related —
   the backend already refuses to trust that anyway.

   Include this script BEFORE your page's own .js file:
   <script src="../shared/session.js"></script>
*/

const SESSION_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://manitconnnect-2.onrender.com";

async function getCurrentUser() {

    try {

        const response = await fetch(

            `${SESSION_BASE_URL}/api/auth/me`,

            { credentials: "include" }

        );

        if (!response.ok) {

            return null;

        }

        return await response.json();

    }

    catch (err) {

        console.error(err);

        return null;

    }

}

/*
   Call at the top of any page that requires login.
   allowedRoles, if given, restricts the page to those roles.
   Returns the user object, or null after redirecting.
*/
async function requireAuth(allowedRoles = null) {

    const user = await getCurrentUser();

    if (!user) {

        window.location.href = "../auth/login.html";

        return null;

    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {

        alert("You do not have permission to view this page.");

        // NOTE: folder is "Dashboard" with a capital D in this repo —
        // Vercel's hosting is case-sensitive (unlike Windows locally),
        // so this needs to match exactly or it 404s in production.
        window.location.href = "../Dashboard/dashboard.html";

        return null;

    }

    return user;

}

async function logoutUser() {

    await fetch(

        `${SESSION_BASE_URL}/api/auth/logout`,

        { method: "POST", credentials: "include" }

    );

    window.location.href = "../auth/login.html";

}
