const express = require("express");

const router = express.Router();

const {

    registerStudent,

    registerMentor,

    login,

    logout,

    getMe,

    checkExperience,

    testEmail,

    verifyEmail

} = require("../controllers/authController");

const authenticateUser = require("../middleware/authMiddleware");

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

/* CURRENT USER — trusted identity source for the frontend */

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



module.exports = router;
