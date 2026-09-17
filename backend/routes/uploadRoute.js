const express = require("express");
const upload = require("../middleware/upload");
const { uploadMedia, createUploadSignature } = require("../controllers/uploadController");
const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.get("/signature", authenticateUser, authorizeRoles("mentor"), createUploadSignature);

router.post(
    "/",
    (req, res, next) => {

        upload.fields([
            { name: "video", maxCount: 1 },
            { name: "audio", maxCount: 1 }
        ])(req, res, (err) => {

            if (err) {

                if (err.code === "LIMIT_FILE_SIZE") {

                    return res.status(400).json({
                        message: "Maximum video size allowed is 100 MB."
                    });

                }

                return res.status(500).json({
                    message: err.message
                });

            }

            next();

        });

    },
    uploadMedia
);

module.exports = router;
