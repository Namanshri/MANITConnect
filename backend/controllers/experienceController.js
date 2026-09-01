const pool = require("../config/db");

/*
   CREATE EXPERIENCE ("My Journey" — preparation strategy, skills, etc.)
   mentor_id is looked up from the authenticated user (req.user.user_id),
   NEVER accepted from req.body. A mentor cannot write another mentor's
   experience just by changing an id.
*/
const createExperience = async (req, res) => {

    try {

        const {

    preparation_strategy,

    core_skills,

    resources,

    interview_timeline,

    mistakes,

    interview_rounds,

    preparation_video_url

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
    preparation_strategy,
    core_skills,
    resources,
    interview_timeline,
    mistakes,
    interview_rounds,
    preparation_video_url
)

           VALUES
(
    $1,$2,$3,$4,$5,$6,$7,$8
)

            RETURNING *`,

            [

    mentor_id,

    preparation_strategy,

    core_skills,

    resources,

    interview_timeline,

    mistakes,

    interview_rounds,

    preparation_video_url

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
