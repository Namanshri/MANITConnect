const express = require("express");

const rateLimit = require("express-rate-limit");

const router = express.Router();

const {

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

} = require("../controllers/authController");

const authenticateUser = require("../middleware/authMiddleware");

// OTP endpoints get their own limiter — sending an OTP triggers an
// email + a DB write, so this is the route most worth capping.
const otpLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 5,

    message: { message: "Too many attempts. Please try again in a few minutes." }

});

router.get("/verify-email/:token", verifyEmail);

router.get("/test-email", testEmail);

/* STUDENT REGISTRATION */

router.post(

    "/register/student",

    registerStudent

);

/* MENTOR REGISTRATION */

router.post(

    "/register/mentor",

    registerMentor

);

/* LOGIN */

router.post(

    "/login",

    login

);

/* LOGOUT */

router.post(

    "/logout",

    logout

);

/* CURRENT USER */

router.get(

    "/me",

    authenticateUser,

    getMe

);

/* CHECK EXPERIENCE */

router.get(

    "/experience/:userId",

    authenticateUser,

    checkExperience

);

/* FORGOT PASSWORD FLOW */

router.post(

    "/forgot-password",

    otpLimiter,

    forgotPassword

);

router.post(

    "/verify-otp",

    otpLimiter,

    verifyOtp

);

router.post(

    "/reset-password",

    resetPassword

);

module.exports = router;
