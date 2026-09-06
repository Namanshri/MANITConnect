/*
   Switched from nodemailer/SMTP to Resend's HTTP API.
   Render's free tier blocks/throttles outbound SMTP entirely (both
   port 465 and 587 timed out trying to reach smtp.gmail.com over
   IPv6, even with IPv4 forced) — this is a known limitation on their
   free/shared infrastructure, not something fixable via SMTP config.
   Resend sends over a normal HTTPS POST, same as any other API call
   this backend already makes (e.g. Cloudinary), so it isn't affected
   by that restriction.

   Function signature is UNCHANGED — sendEmail(to, subject, html) —
   so authController.js needs no changes at all.
*/

const RESEND_API_URL = "https://api.resend.com/emails";

// Resend's own onboarding@resend.dev sender works immediately, sending
// to ANY recipient, with no domain verification required. Once you
// verify your own domain in the Resend dashboard, set FROM_EMAIL to
// something like "MANITConnect <noreply@yourdomain.com>" instead —
// until then, leave FROM_EMAIL unset and this default is used.
const DEFAULT_FROM = "MANITConnect <onboarding@resend.dev>";

const sendEmail = async (to, subject, html) => {

    const response = await fetch(RESEND_API_URL, {

        method: "POST",

        headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            from: process.env.FROM_EMAIL || DEFAULT_FROM,
            to,
            subject,
            html

        })

    });

    if (!response.ok) {

        const errorBody = await response.json().catch(() => ({}));

        throw new Error(

            `Resend API error (${response.status}): ${errorBody.message || "Failed to send email."}`

        );

    }

    return response.json();

};

module.exports = sendEmail;
