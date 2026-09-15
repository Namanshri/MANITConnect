const express = require("express");

const router = express.Router();

const {

    toggleBookmark,
    getBookmarkedIds,
    getMyLibrary

} = require("../controllers/bookmarkController");

const authenticateUser = require("../middleware/authMiddleware");

router.use(authenticateUser);

router.post("/toggle", toggleBookmark);

router.get("/mine/:item_type", getBookmarkedIds);

router.get("/library", getMyLibrary);

module.exports = router;
