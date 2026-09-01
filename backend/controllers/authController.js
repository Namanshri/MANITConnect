const crypto = require("crypto");

const sendEmail = require("../utils/sendEmail");

const pool = require("../config/db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

/**
 * Cookie options — sameSite/secure flip based on environment so cross-site
 * cookies (Vercel frontend -> Render backend) work in production while
 * plain http://localhost still works in dev (Secure cookies are dropped
 * over http).
 */
const getCookieOptions = () => {

    const isProduction = process.env.NODE_ENV === "production";

    return {

        httpOnly: true,

        secure: isProduction,

        sameSite: isProduction ? "none" : "lax",

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days

        path: "/"

    };

};

/*  STUDENT REGISTRATION */

const registerStudent = async (req, res) => {

    try {

        const {

            full_name,

            email,

            password

        } = req.body;

        const existingUser = await pool.query(

            "SELECT * FROM users WHERE email=$1",

            [email]

        );

        if (existingUser.rows.length > 0) {

            return res.status(400).json({

                message: "Email already registered."

            });

        }

        const hashedPassword = await bcrypt.hash(

            password,

            10

        );

        const verificationToken = crypto.randomBytes(32).toString("hex");

        await pool.query(

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

        res.status(201).json({

    message: "Registration successful. Please check your email to verify your account."

});

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Database Error"

        });

    }

};



/*  MENTOR REGISTRATION*/

const registerMentor = async (req,res)=>{

    try{

        const {

    full_name,

    email,

    company,

    role,


    branch,

    password

} = req.body;

        const existingUser=await pool.query(

            "SELECT * FROM users WHERE email=$1",

            [email]

        );

        if(existingUser.rows.length){

            return res.status(400).json({

                message:"Email already exists."

            });

        }

        const hashedPassword=await bcrypt.hash(

            password,

            10

        );

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await pool.query(

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
        await pool.query(

`

INSERT INTO mentors
(
    user_id,
    full_name,
    company,
    role,
    branch
)

VALUES
(
    $1,
    $2,
    $3,
    $4,
    $5
)

`,

[
    user.rows[0].user_id,
    full_name,
    company,
    role,
    branch
]

);
const verificationLink =
`${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

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
       res.status(201).json({

    message:
    "Registration successful. Please check your email to verify your account."

});

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Database Error"

        });

    }

};

/*  LOGIN — sets the JWT as an HttpOnly cookie, never returns it in JSON  */

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

        // NOTE: token is intentionally NOT included in the JSON body.
        // The frontend gets identity from GET /api/auth/me, not from
        // anything it stores itself.
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

/* LOGOUT — clears the cookie */

const logout = async (req, res) => {

    res.clearCookie("token", { ...getCookieOptions(), maxAge: undefined });

    res.status(200).json({

        message: "Logged out successfully."

    });

};

/* GET CURRENT USER — the ONLY trusted source of "who am I" for the frontend */

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

        // If this user is a mentor, also hand back their mentor_id so the
        // frontend never has to guess/store it — it can fetch it fresh each time.
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
            "SELECT * FROM experiences WHERE mentor_id=$1",
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

module.exports = {

    registerStudent,

    registerMentor,

    login,

    logout,

    getMe,

    checkExperience,

    testEmail,

    verifyEmail

};
