const express = require("express");

const router = express.Router();

const {

    createPost,
    getAllPosts,
    getPostById,
    createComment

} = require("../controllers/postController");

const authenticateUser = require("../middleware/authMiddleware");

router.get("/", getAllPosts);

router.get("/:id", getPostById);

router.post("/", authenticateUser, createPost);

router.post("/:id/comments", authenticateUser, createComment);

module.exports = router;
