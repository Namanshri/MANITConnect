const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const createUploadSignature = (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "manitconnect/videos";
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET
    );

    res.json({
        timestamp,
        folder,
        signature,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY
    });
};

const uploadMedia = async (req, res) => {

    try {

        let videoUrl = null;
        let audioUrl = null;

        const uploadedFiles = req.files || {};

        if (!uploadedFiles.video?.[0] && !uploadedFiles.audio?.[0]) {
            return res.status(400).json({
                message: "Please select a video or audio file to upload."
            });
        }

        if (uploadedFiles.video?.[0]) {

            console.time("Total Upload");

console.log("Uploading to Cloudinary...");

console.time("Cloudinary");

const result = await cloudinary.uploader.upload(
    uploadedFiles.video[0].path,
    {
        resource_type: "video",
        folder: "manitconnect/videos",
        timeout: 600000
    }
);
console.timeEnd("Cloudinary");

console.timeEnd("Total Upload");

console.log("Cloudinary upload successful!");

console.log(result);

            videoUrl = result.secure_url;

            fs.unlinkSync(uploadedFiles.video[0].path);

        }

        if (uploadedFiles.audio?.[0]) {

            const result = await cloudinary.uploader.upload(

                uploadedFiles.audio[0].path,

                {
                    resource_type: "video",
                    folder: "manitconnect/audio"
                }

            );

            audioUrl = result.secure_url;

            fs.unlinkSync(uploadedFiles.audio[0].path);

        }

        res.json({

            video_url: videoUrl,
            audio_url: audioUrl

        });

    }

    catch (error) {

        console.error("Cloudinary Error:");
console.dir(error, { depth: null });

        res.status(500).json({

            message: "Upload failed"

        });

    }

};

module.exports = { uploadMedia, createUploadSignature };
