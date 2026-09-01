const express = require("express");

const cors = require("cors");

const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

// Required on Render (or any host behind a reverse proxy) so secure cookies work
app.set("trust proxy", 1);

app.use(cors({

    origin: process.env.FRONTEND_URL,

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
