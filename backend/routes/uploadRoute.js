const express = require("express");
const upload = require("../middleware/upload");
const { uploadMedia } = require("../controllers/uploadController");

const router = express.Router();

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