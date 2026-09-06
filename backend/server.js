const express = require("express");

const cors = require("cors");

const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

// Required on Render (or any host behind a reverse proxy) so secure cookies work
app.set("trust proxy", 1);

// FRONTEND_URL can now be ONE origin or a COMMA-SEPARATED LIST of
// origins, e.g.:
//   FRONTEND_URL=https://manit-connect.vercel.app,http://127.0.0.1:5500
// This lets you test from Live Server locally AND from your deployed
// Vercel URL against the same hosted backend, and makes it easy to
// add a Vercel preview URL later without breaking the main one.
const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({

    origin: (origin, callback) => {

        // requests with no Origin header (curl, Postman, server-to-server)
        // are allowed through — they can't carry cookies anyway
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

app.use("/api/mentor",mentorRoutes);

app.use("/api/experience",experienceRoutes);

app.use("/api/guidance",guidanceRoutes);

app.use("/api/insight", insightRoutes);

app.use("/api/auth", authRoutes);

app.get("/",(req,res)=>{

    res.send("MANITConnect Backend Running");

});

app.use("/api/upload", uploadRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{

    console.log(`Server running on port ${PORT}`);

});