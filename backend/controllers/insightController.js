const pool = require("../config/db");

/*
   Company/role/package_lpa/experience_type live on `experiences` now
   (a mentor can have several journeys), not on `mentors`. This LATERAL
   join attaches a mentor's most recent journey to each insight so the
   frontend (dashboard.js, insights.js) can keep reading
   insight.company / insight.role / insight.package_lpa /
   insight.experience_type exactly as it did before.
*/
const MENTOR_JOIN = `
    JOIN mentors ON insights.mentor_id = mentors.mentor_id
    LEFT JOIN LATERAL (
        SELECT company, role, package_lpa, experience_type
        FROM experiences
        WHERE experiences.mentor_id = mentors.mentor_id
        ORDER BY experience_id DESC
        LIMIT 1
    ) latest ON true
`;

/* CREATE INSIGHT
   mentor_id is resolved from the authenticated user (req.user.user_id),
   NEVER trusted from req.body.
*/
const createInsight = async (req, res) => {

    try {

        const {

            title,

            content,

            category,

            tags

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

        const result = await pool.query(

            `INSERT INTO insights

            (

                mentor_id,

                title,

                content,

                category,

                tags

            )

            VALUES

            ($1,$2,$3,$4,$5)

            RETURNING insight_id`,

            [

                mentor_id,

                title,

                content,

                category,

                tags

            ]

        );

        res.status(201).json({

            insight_id: result.rows[0].insight_id

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Database Error"

        });

    }

};

/* GET ALL INSIGHTS */

const getAllInsights = async (req, res) => {

    try {

        const result = await pool.query(

    `SELECT

        insights.*,

        mentors.full_name,

        latest.company,

        latest.role,

        latest.package_lpa,

        latest.experience_type

     FROM insights

     ${MENTOR_JOIN}

     ORDER BY insights.created_at DESC`

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

/* GET INSIGHT BY ID */

const getInsightById = async (req, res) => {

    try {

        const id = req.params.id;

        const result = await pool.query(

           `SELECT

    insights.*,

    mentors.full_name,

    latest.company,

    latest.role,

    latest.package_lpa,

    latest.experience_type

FROM insights

${MENTOR_JOIN}

WHERE insight_id=$1`,

            [id]

        );

        res.json(result.rows[0]);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Database Error"

        });

    }

};

/* GET INSIGHTS OF A MENTOR */

const getInsightsByMentor = async (req, res) => {

    try {

        const mentorId = req.params.mentorId;

        const result = await pool.query(

           `SELECT

    insights.*,

    mentors.full_name,

    latest.company,

    latest.role,

    latest.package_lpa,

    latest.experience_type

FROM insights

${MENTOR_JOIN}

WHERE insights.mentor_id=$1

ORDER BY insights.created_at DESC`,

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
const increaseHelpfulCount = async (req,res)=>{

    try{

        const id=req.params.id;

        await pool.query(

            `UPDATE insights

             SET helpful_count = helpful_count + 1

             WHERE insight_id = $1`,

            [id]

        );

        res.json({

            message:"Helpful Added"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Database Error"

        });

    }

};

const recordView = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid insight." });
        await pool.query(`INSERT INTO content_events (user_id, item_type, item_id, event_type)
            VALUES ($1, 'insight', $2, 'view')`, [req.user?.user_id || null, id]);
        res.status(204).end();
    } catch (error) { res.status(500).json({ message: "Unable to record view." }); }
};

module.exports = {

    createInsight,

    getAllInsights,

    getInsightById,

    getInsightsByMentor,

    increaseHelpfulCount,
    recordView

};
