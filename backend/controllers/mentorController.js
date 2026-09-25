const pool = require("../config/db");

/*
   UPDATE MENTOR PROFILE (personal fields only)
   Company/role/package/experience_type/placement_mode are NOT here
   anymore — those belong to a specific experience row, created via
   POST /api/experience. user_id comes from req.user (the session
   cookie), never from req.body.
*/
const createMentor = async (req, res) => {

    try {

        const {

            full_name,
            branch,
            cgpa

        } = req.body;

        const user_id = req.user.user_id;

        const result = await pool.query(

            `UPDATE mentors
             SET
                full_name = $1,
                branch    = $2,
                cgpa      = $3
             WHERE user_id = $4
             RETURNING mentor_id`,

            [

                full_name,
                branch,
                cgpa || null,
                user_id

            ]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({

                message: "Mentor profile not found for this account."

            });

        }

        res.json({

            mentor_id: result.rows[0].mentor_id

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Database Error"

        });

    }

};

/*
   All mentor cards need SOMETHING to show for company/role/package/type
   even though those now live on experiences, not mentors. We attach the
   mentor's most recent journey as latest_* fields, plus how many
   journeys they've shared, via a LATERAL join.
*/
const LATEST_JOURNEY_JOIN = `
    LEFT JOIN LATERAL (
        SELECT company, role, package_lpa, stipend_monthly, offer_cgpa, experience_type, placement_mode
        FROM experiences
        WHERE experiences.mentor_id = mentors.mentor_id
        ORDER BY CASE WHEN experience_type = 'Placement' THEN 0 ELSE 1 END,
                 CASE WHEN experience_type = 'Placement' THEN COALESCE(package_lpa, 0)
                      ELSE COALESCE(stipend_monthly, 0) END DESC,
                 experience_id DESC
        LIMIT 1
    ) latest ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS experience_count
        FROM experiences
        WHERE experiences.mentor_id = mentors.mentor_id
    ) counts ON true
`;

const getAllMentors = async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT
                mentors.*,
                latest.company AS latest_company,
                latest.role AS latest_role,
                latest.package_lpa AS latest_package_lpa,
                latest.stipend_monthly AS latest_stipend_monthly,
                latest.offer_cgpa AS latest_offer_cgpa,
                latest.experience_type AS latest_experience_type,
                latest.placement_mode AS latest_placement_mode,
                counts.experience_count
             FROM mentors
             JOIN users ON users.user_id = mentors.user_id
             ${LATEST_JOURNEY_JOIN}
             WHERE users.mentor_status = 'approved'
             ORDER BY mentors.mentor_id DESC`

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

const searchMentors = async (req, res) => {

    try {

        const query = req.query.q;

        const result = await pool.query(

            `
            SELECT
                mentors.*,
                latest.company AS latest_company,
                latest.role AS latest_role,
                latest.package_lpa AS latest_package_lpa,
                latest.stipend_monthly AS latest_stipend_monthly,
                latest.offer_cgpa AS latest_offer_cgpa,
                latest.experience_type AS latest_experience_type,
                latest.placement_mode AS latest_placement_mode,
                counts.experience_count
            FROM mentors
            JOIN users ON users.user_id = mentors.user_id
            ${LATEST_JOURNEY_JOIN}
            WHERE
                users.mentor_status = 'approved' AND (
                mentors.full_name ILIKE $1
                OR EXISTS (
                    SELECT 1 FROM experiences
                    WHERE experiences.mentor_id = mentors.mentor_id
                      AND (experiences.company ILIKE $1 OR experiences.role ILIKE $1)
                ))
            ORDER BY mentors.mentor_id DESC
            `,

            [`%${query}%`]

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

const getFilterOptions = async (req, res) => {

    try {

        // company/role now live on experiences, not mentors
        const companies = await pool.query(

            `SELECT DISTINCT INITCAP(TRIM(company)) AS company
                FROM experiences
                WHERE company IS NOT NULL
                ORDER BY company;`

        );

        const roles = await pool.query(

            `SELECT DISTINCT INITCAP(TRIM(role)) AS role
FROM experiences
WHERE role IS NOT NULL
ORDER BY role;`
        );

        const branches = await pool.query(

            `SELECT DISTINCT branch
             FROM mentors
             WHERE branch IS NOT NULL
             ORDER BY branch`

        );

        res.json({

            companies: companies.rows,

            roles: roles.rows,

            branches: branches.rows

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Database Error"

        });

    }

};
const getDashboardStats = async (req, res) => {

    try {

        const mentors = await pool.query(

            `SELECT COUNT(*) FROM mentors`

        );

        const experiences = await pool.query(

            `SELECT COUNT(*) FROM experiences`

        );

        const companies = await pool.query(

            `SELECT COUNT(DISTINCT company) FROM experiences
             WHERE company IS NOT NULL`

        );

        const branches = await pool.query(

            `SELECT COUNT(DISTINCT branch) FROM mentors
             WHERE branch IS NOT NULL`

        );

        res.json({

            mentors: Number(mentors.rows[0].count),

            experiences: Number(experiences.rows[0].count),

            companies: Number(companies.rows[0].count),

            branches: Number(branches.rows[0].count)

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Database Error"

        });

    }

};

const getMentorById = async (req,res)=>{

    try{

        const id=req.params.id;

        const mentor=await pool.query(

            `SELECT mentors.* FROM mentors
             JOIN users ON users.user_id = mentors.user_id
             WHERE mentor_id=$1 AND users.mentor_status='approved'`,

            [id]

        );

        // Each row here now carries its OWN company/role/package_lpa/
        // experience_type/placement_mode — this is what makes the
        // Placement/Internship tab filter on the mentor profile page
        // actually work.
        const insights=await pool.query(

            `SELECT *
             FROM experiences
             WHERE mentor_id=$1
             ORDER BY experience_id DESC`,

            [id]

        );

        res.json({

            mentor:mentor.rows[0],

            insights:insights.rows

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Database Error"

        });

    }

};

module.exports = {

    createMentor,

    getAllMentors,

    getMentorById,

    searchMentors,

    getFilterOptions,

    getDashboardStats


}
