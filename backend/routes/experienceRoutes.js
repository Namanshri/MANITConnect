const express = require("express");

const router = express.Router();

const experienceController = require("../controllers/experienceController");

const authenticateUser = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/authorizeRoles");

router.post(

    "/",

    authenticateUser,

    authorizeRoles("mentor"),

    experienceController.createExperience

);

module.exports = router;
