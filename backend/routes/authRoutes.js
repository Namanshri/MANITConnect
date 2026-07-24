const express = require("express");

const router = express.Router();

const {

    registerStudent,

    registerMentor,

    login,

    checkExperience,
    
    testEmail,

    verifyEmail

} = require("../controllers/authController");

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

/* CHECK EXPERIENCE */

router.get(

    "/experience/:userId",

    checkExperience

);



module.exports = router;