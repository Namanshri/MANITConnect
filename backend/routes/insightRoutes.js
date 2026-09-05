const express = require("express");

const router = express.Router();

const {

    createInsight,

    getAllInsights,

    getInsightById,

    getInsightsByMentor,

    increaseHelpfulCount


} = require("../controllers/insightController");

const authenticateUser = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/authorizeRoles");

/* CREATE INSIGHT — mentor only, mentor_id derived from the session */

router.post(

    "/",

    authenticateUser,

    authorizeRoles("mentor"),

    createInsight

);

/* GET ALL INSIGHTS */

router.get(

    "/",

    getAllInsights

);


/* GET ALL INSIGHTS OF A MENTOR */

router.get(

    "/mentor/:mentorId",

    getInsightsByMentor

);

router.post(

    "/:id/helpful",

    increaseHelpfulCount

);
/* GET INSIGHT BY ID */

router.get(

    "/:id",

    getInsightById

);


module.exports = router;
