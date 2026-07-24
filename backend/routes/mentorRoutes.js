const express = require("express");

const router = express.Router();

const mentorController = require("../controllers/mentorController");

// Search route MUST come before /:id
router.get("/search", mentorController.searchMentors);

router.get(
    "/filter-options",
    mentorController.getFilterOptions
);

router.get("/dashboard-stats", mentorController.getDashboardStats);

router.get("/", mentorController.getAllMentors);

router.get("/:id", mentorController.getMentorById);

router.post("/", mentorController.createMentor);

module.exports = router;