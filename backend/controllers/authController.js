const crypto = require("crypto");

const sendEmail = require("../utils/sendEmail");

const pool = require("../config/db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const getCookieOptions = () => {

    const isProduction = process.env.NODE_ENV === "production";

    return {

        httpOnly: true,

        secure: isProduction,

        sameSite: isProduction ? "none" : "lax",

        maxAge: 7 * 24 * 60 * 60 * 1000,

        path: "/"

    };

};

/*  STUDENT REGISTRATION
    Wrapped in a transaction now: the user row is only committed if the
    verification email actually sends. If sendEmail throws (e.g. an SMTP
    timeout), everything rolls back — no orphaned unverifiable account,
    and the person can just try registering again cleanly.
*/
const registerStudent = async (req, res) => {

    const client = await pool.connect();

    try {

        const {

            full_name,

            email,

            password

        } = req.body;

        const existingUser = await client.query(

            "SELECT * FROM users WHERE email=$1",

            [email]

        );

        if (existingUser.rows.length > 0) {

            client.release();

            return res.status(400).json({

                message: "Email already registered."

            });

        }

        const hashedPassword = await bcrypt.hash(

            password,

            10

        );

        const verificationToken = crypto.randomBytes(32).toString("hex");

        await client.query("BEGIN");

        await client.query(

    `

    INSERT INTO users
    (
        full_name,
        email,
        password,
        role,
        is_verified,
        verification_token
    )

    VALUES
    (
        $1,
        $2,
        $3,
        'student',
        false,
        $4
    )

    `,

    [
        full_name,
        email,
        hashedPassword,
        verificationToken
    ]

);

const verificationLink =
`${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

// If this throws, we're still inside the transaction — the catch
// block below rolls back the INSERT above, so nothing is left stuck.
await sendEmail(

    email,

    "Verify your MANITConnect account",

    `
        <h2>Welcome to MANITConnect!</h2>

        <p>Please verify your email by clicking the button below.</p>

        <a href="${verificationLink}"
           style="
                background:#6C63FF;
                color:white;
                padding:12px 20px;
                text-decoration:none;
                border-radius:6px;
           ">
            Verify Email
        </a>

        <p>If the button doesn't work, copy this link:</p>

        <p>${verificationLink}</p>
    `
);

        await client.query("COMMIT");

        res.status(201).json({

    message: "Registration successful. Please check your email to verify your account."

});

    }

    catch(err){

        await client.query("ROLLBACK");

        console.log(err);

        res.status(500).json({

            message: "We couldn't complete registration — the verification email failed to send. Please try again in a moment."

        });

    }
    finally {

        client.release();

    }

};



/*  MENTOR REGISTRATION
    Same fix — sendEmail now happens BEFORE the commit, not after.
    Previously the transaction committed first, so a failed email left
    a fully-created, permanently-unverifiable mentor account.
*/
const registerMentor = async (req,res)=>{

    const client = await pool.connect();

    try{

        const {

    full_name,

    email,

    branch,

    password

} = req.body;

        const existingUser=await client.query(

            "SELECT * FROM users WHERE email=$1",

            [email]

        );

        if(existingUser.rows.length){

            client.release();

            return res.status(400).json({

                message:"Email already exists."

            });

        }

        const hashedPassword=await bcrypt.hash(

            password,

            10

        );

        const verificationToken = crypto.randomBytes(32).toString("hex");

        await client.query("BEGIN");

        const user = await client.query(

    `

    INSERT INTO users
(
    full_name,
    email,
    password,
    role,
    is_verified,
    verification_token
)

VALUES
(
    $1,
    $2,
    $3,
    'mentor',
    false,
    $4
)

RETURNING user_id

    `,

    [

        full_name,

        email,

        hashedPassword,

        verificationToken


    ]

);
        await client.query(

`

INSERT INTO mentors
(
    user_id,
    full_name,
    branch
)

VALUES
(
    $1,
    $2,
    $3
)

`,

[
    user.rows[0].user_id,
    full_name,
    branch
]

);

const verificationLink =
`${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

// Moved BEFORE the commit — if this throws, the catch block rolls
// back both INSERTs above instead of leaving a stuck mentor account.
await sendEmail(

    email,

    "Verify your MANITConnect account",

    `
    <h2>Welcome to MANITConnect!</h2>

    <p>Please verify your email by clicking below.</p>

    <a href="${verificationLink}"
       style="
            background:#6C63FF;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
       ">
        Verify Email
    </a>

    <br><br>

    <p>${verificationLink}</p>

    `
);

        await client.query("COMMIT");

       res.status(201).json({

    message:
    "Registration successful. Please check your email to verify your account."

});

    }

    catch(err){

        await client.query("ROLLBACK");

        console.log(err);

        res.status(500).json({

            message:"We couldn't complete registration — the verification email failed to send. Please try again in a moment."

        });

    }
    finally {

        client.release();

    }

};

const login = async (req, res) => {

    try {

        const {

            email,

            password

        } = req.body;

        const result = await pool.query(

            `

            SELECT *

            FROM users

            WHERE email = $1

            `,

            [email]

        );

        if (result.rows.length === 0) {

            return res.status(401).json({

                message: "Invalid email or password."

            });

        }

        const user = result.rows[0];

        if (!user.is_verified) {

    return res.status(403).json({

        message: "Please verify your email before logging in."

    });

}

        const isMatch = await bcrypt.compare(

            password,

            user.password

        );

        if (!isMatch) {

            return res.status(401).json({

                message: "Invalid email or password."

            });

        }

        const token = jwt.sign(

            {

                user_id: user.user_id,

                role: user.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

        res.cookie("token", token, getCookieOptions());

        res.status(200).json({

            message: "Login successful.",

            user_id: user.user_id,

            full_name: user.full_name,

            role: user.role

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Database Error"

        });

    }

};

const logout = async (req, res) => {

    res.clearCookie("token", { ...getCookieOptions(), maxAge: undefined });

    res.status(200).json({

        message: "Logged out successfully."

    });

};

const getMe = async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT user_id, full_name, email, role, is_verified

             FROM users WHERE user_id=$1`,

            [req.user.user_id]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({ message: "User not found." });

        }

        let mentor_id = null;

        if (result.rows[0].role === "mentor") {

            const mentor = await pool.query(

                "SELECT mentor_id FROM mentors WHERE user_id=$1",

                [req.user.user_id]

            );

            mentor_id = mentor.rows[0]?.mentor_id || null;

        }

        res.status(200).json({

            ...result.rows[0],

            mentor_id

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

const checkExperience = async (req, res) => {

    try {

        const { userId } = req.params;

        const mentor = await pool.query(
            "SELECT mentor_id FROM mentors WHERE user_id=$1",
            [userId]
        );

        if (mentor.rows.length === 0) {

            return res.json({
                hasExperience: false
            });

        }

        const mentorId = mentor.rows[0].mentor_id;

        const experience = await pool.query(
            "SELECT experience_id FROM experiences WHERE mentor_id=$1",
            [mentorId]
        );

        res.json({

            hasExperience: experience.rows.length > 0

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Database Error"

        });

    }

};


const testEmail = async (req, res) => {

    try {

        await sendEmail(

            process.env.EMAIL_USER,

            "MANITConnect Email Test",

            `
            <h2>Email is working! 🎉</h2>

            <p>If you received this email, Nodemailer is configured correctly.</p>
            `
        );

        res.json({

            message: "Test email sent successfully."

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Failed to send email."

        });

    }

};

const verifyEmail = async (req, res) => {

    try {

        const { token } = req.params;

        const result = await pool.query(

            `

            SELECT *

            FROM users

            WHERE verification_token = $1

            `,

            [token]

        );

        if (result.rows.length === 0) {

            return res.status(400).send("Invalid verification link.");

        }

        await pool.query(

            `

            UPDATE users

            SET

                is_verified = true,

                verification_token = NULL

            WHERE verification_token = $1

            `,

            [token]

        );

        res.redirect(
    `${process.env.FRONTEND_URL}/frontend/auth/login.html`
);

    }

    catch (err) {

        console.log(err);

        res.status(500).send("Server Error");

    }

};

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({ message: "Email is required." });

        }

        const result = await pool.query(

            "SELECT user_id, full_name FROM users WHERE email=$1",

            [email]

        );

        const genericResponse = {

            message: "If that email is registered, an OTP has been sent to it."

        };

        if (result.rows.length === 0) {

            return res.status(200).json(genericResponse);

        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await pool.query(

            `UPDATE users
             SET reset_otp = $1, reset_otp_expires_at = $2, reset_token = NULL, reset_token_expires_at = NULL
             WHERE email = $3`,

            [otp, expiresAt, email]

        );

        await sendEmail(

            email,

            "Your MANITConnect password reset code",

            `
            <h2>Password Reset</h2>
            <p>Hi ${result.rows[0].full_name},</p>
            <p>Your one-time code is:</p>
            <h1 style="letter-spacing:6px;">${otp}</h1>
            <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>
            `

        );

        res.status(200).json(genericResponse);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

const verifyOtp = async (req, res) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {

            return res.status(400).json({ message: "Email and OTP are required." });

        }

        const result = await pool.query(

            "SELECT user_id, reset_otp, reset_otp_expires_at FROM users WHERE email=$1",

            [email]

        );

        if (result.rows.length === 0) {

            return res.status(400).json({ message: "Invalid OTP." });

        }

        const user = result.rows[0];

        const isExpired =
            !user.reset_otp_expires_at || new Date(user.reset_otp_expires_at) < new Date();

        if (!user.reset_otp || user.reset_otp !== otp || isExpired) {

            return res.status(400).json({ message: "Invalid or expired OTP." });

        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

        await pool.query(

            `UPDATE users
             SET reset_token = $1, reset_token_expires_at = $2, reset_otp = NULL, reset_otp_expires_at = NULL
             WHERE email = $3`,

            [resetToken, resetTokenExpiresAt, email]

        );

        res.status(200).json({

            message: "OTP verified.",

            reset_token: resetToken

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

const resetPassword = async (req, res) => {

    try {

        const { email, reset_token, new_password } = req.body;

        if (!email || !reset_token || !new_password) {

            return res.status(400).json({ message: "Email, reset token and new password are required." });

        }

        if (new_password.length < 8) {

            return res.status(400).json({ message: "Password must be at least 8 characters long." });

        }

        const result = await pool.query(

            "SELECT user_id, reset_token, reset_token_expires_at FROM users WHERE email=$1",

            [email]

        );

        if (result.rows.length === 0) {

            return res.status(400).json({ message: "Invalid or expired request." });

        }

        const user = result.rows[0];

        const isExpired =
            !user.reset_token_expires_at || new Date(user.reset_token_expires_at) < new Date();

        if (!user.reset_token || user.reset_token !== reset_token || isExpired) {

            return res.status(400).json({ message: "Invalid or expired request. Please start over." });

        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await pool.query(

            `UPDATE users
             SET password = $1, reset_token = NULL, reset_token_expires_at = NULL
             WHERE email = $2`,

            [hashedPassword, email]

        );

        res.status(200).json({ message: "Password reset successfully. You can now log in." });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

module.exports = {

    registerStudent,

    registerMentor,

    login,

    logout,

    getMe,

    checkExperience,

    testEmail,

    verifyEmail,

    forgotPassword,

    verifyOtp,

    resetPassword

};
