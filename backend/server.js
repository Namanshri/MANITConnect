const express = require("express");

const cors = require("cors");

const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({

    origin: (origin, callback) => {

        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log(`CORS blocked request from origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));

    },

    credentials: true

}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const mentorRoutes = require("./routes/mentorRoutes");

const experienceRoutes = require("./routes/experienceRoutes");

const guidanceRoutes = require("./routes/guidanceRoutes");

const insightRoutes = require("./routes/insightRoutes");

const authRoutes = require("./routes/authRoutes");

const uploadRoute = require("./routes/uploadRoute");

const postRoutes = require("./routes/postRoutes");

const bookmarkRoutes = require("./routes/bookmarkRoutes");

app.use("/api/mentor",mentorRoutes);

app.use("/api/experience",experienceRoutes);

app.use("/api/guidance",guidanceRoutes);

app.use("/api/insight", insightRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/bookmarks", bookmarkRoutes);

app.get("/",(req,res)=>{

    res.send("MANITConnect Backend Running");

});

app.use("/api/upload", uploadRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{

    console.log(`Server running on port ${PORT}`);

});
