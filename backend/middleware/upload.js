console.log("Using diskStorage upload middleware"); 
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );

    }

});

const upload =multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB
    }
});


console.log("Storage engine:", storage);
module.exports = upload;