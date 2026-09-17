const pool = require("../config/db");

/*
   CREATE GUIDANCE ANSWER
   mentor_id is looked up from the authenticated user, NEVER trusted
   from req.body — a mentor can only write guidance under their own profile.
*/
const createGuidance = async (req, res) => {

    try {

        const {
            year,
            category,
            question,
            answer
        } = req.body;

        const mentor = await pool.query(

            "SELECT mentor_id FROM mentors WHERE user_id=$1",

            [req.user.user_id]

        );

        if (mentor.rows.length === 0) {

            return res.status(404).json({

                message: "No mentor profile found for this account."

            });

        }

        const mentor_id = mentor.rows[0].mentor_id;

        const existing = await pool.query(
            `SELECT guidance_id FROM guidance
             WHERE mentor_id=$1 AND year=$2 AND category=$3 AND question=$4`,
            [mentor_id, year, category, question]
        );

        const result = existing.rows.length
            ? await pool.query(
                `UPDATE guidance SET answer=$1 WHERE guidance_id=$2 RETURNING *`,
                [answer, existing.rows[0].guidance_id]
            )
            : await pool.query(

            `INSERT INTO guidance
            (
                mentor_id,
                year,
                category,
                question,
                answer
            )

            VALUES
            (
                $1,$2,$3,$4,$5
            )

            RETURNING *`,

            [
                mentor_id,
                year,
                category,
                question,
                answer
            ]

        );

        res.status(201).json(result.rows[0]);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Database Error"

        });

    }

};
const getGuidanceByMentor = async (req, res) => {

    try {

        const mentorId = req.params.id;

        const result = await pool.query(

            `SELECT *
             FROM guidance
             WHERE mentor_id = $1
             ORDER BY year ASC`,

            [mentorId]

        );

        res.json(result.rows);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Database Error"

        });

    }

};

module.exports = {

    createGuidance,

    getGuidanceByMentor

};
