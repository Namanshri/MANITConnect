const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const { askAdvisor } = require("../controllers/advisorController");

const router = express.Router();
router.post("/ask", authenticateUser, askAdvisor);

module.exports = router;
