const nodemailer = require("nodemailer");

/*
   Using host/port explicitly (587, STARTTLS) instead of the
   service: "gmail" shorthand (which defaults to port 465, secure:true).
   Render's network was failing to route to Gmail's mail servers over
   IPv6 on port 465 (ENETUNREACH / ETIMEDOUT in the logs). Port 587 +
   family: 4 (force IPv4) is the standard fix for this class of
   cloud-host SMTP connectivity issue.
*/
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS, not implicit TLS
    family: 4,     // force IPv4 — avoids the IPv6 routing failure
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {

    await transporter.sendMail({
        from: `"MANITConnect" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });

};

module.exports = sendEmail;
