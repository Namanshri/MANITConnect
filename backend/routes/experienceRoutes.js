const express = require("express");

const router = express.Router();

const experienceController = require("../controllers/experienceController");

const authenticateUser = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/authorizeRoles");
const requireActiveMentor = require("../middleware/requireActiveMentor");

router.post(

    "/",

    authenticateUser,

    authorizeRoles("mentor"),

    requireActiveMentor,

    experienceController.createExperience

);

router.delete("/:id", authenticateUser, authorizeRoles("mentor", "admin"), experienceController.deleteExperience);

module.exports = router;
