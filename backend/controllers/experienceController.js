const pool = require("../config/db");

/*
   CREATE EXPERIENCE (one journey — placement or internship)
   mentor_id is looked up from the authenticated user (req.user.user_id),
   NEVER accepted from req.body.
*/
const createExperience = async (req, res) => {

    try {

        const {

    company,

    role,

    package_lpa,

    stipend_monthly,

    offer_cgpa,

    experience_type,

    placement_mode,

    preparation_strategy,

    core_skills,

    resources,

    interview_timeline,

    mistakes,

    interview_rounds,

    preparation_video_url

    ,section_videos

} = req.body;

        const mentor = await pool.query(

    "SELECT mentor_id FROM mentors WHERE user_id=$1",

    [req.user.user_id]

);

        if (mentor.rows.length === 0) {

            return res.status(404).json({

                message: "No mentor profile found for this account. Complete your mentor profile first."

            });

        }

const mentor_id = mentor.rows[0].mentor_id;

        const result = await pool.query(

            `INSERT INTO experiences
(
    mentor_id,
    company,
    role,
    package_lpa,
    stipend_monthly,
    offer_cgpa,
    experience_type,
    placement_mode,
    preparation_strategy,
    core_skills,
    resources,
    interview_timeline,
    mistakes,
    interview_rounds,
    preparation_video_url
    ,section_videos
)

           VALUES
(
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
)

            RETURNING *`,

            [

    mentor_id,

    company,

    role,

    package_lpa || null,

    stipend_monthly || null,

    offer_cgpa || null,

    experience_type,

    placement_mode,

    preparation_strategy,

    core_skills,

    resources,

    interview_timeline,

    mistakes,

    interview_rounds,

    preparation_video_url

    ,section_videos || {}

]

        );

        res.status(201).json(result.rows[0]);

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Database Error"

        });

    }

};

module.exports={

    createExperience

};
