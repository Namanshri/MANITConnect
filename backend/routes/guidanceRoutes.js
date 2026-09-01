const express = require("express");

const router = express.Router();

const guidanceController = require("../controllers/guidanceController");

const authenticateUser = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/authorizeRoles");

router.get("/:id", guidanceController.getGuidanceByMentor);

router.post(

    "/",

    authenticateUser,

    authorizeRoles("mentor"),

    guidanceController.createGuidance

);

module.exports = router;
