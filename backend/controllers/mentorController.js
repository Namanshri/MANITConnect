const pool = require("../config/db");

const createMentor = async (req, res) => {

    try {

        const {

            user_id,
            full_name,
            company,
            role,
            package_lpa,
            cgpa,
            experience_type,
            placement_mode

        } = req.body;

        const result = await pool.query(

            `UPDATE mentors
             SET
full_name=$1,
company=$2,
role=$3,
package_lpa=$4,
cgpa=$5,
experience_type=$6,
placement_mode=$7


WHERE user_id=$8

             RETURNING mentor_id`,

            [

                full_name,
                company,
                role,
                package_lpa,
                cgpa,
                experience_type,
                placement_mode,
                user_id

            ]

        );

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
const getAllMentors = async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT * FROM mentors ORDER BY mentor_id DESC`

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
            SELECT *
            FROM mentors
            WHERE
                full_name ILIKE $1
                OR company ILIKE $1
                OR role ILIKE $1
            ORDER BY mentor_id DESC
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

        const companies = await pool.query(

            `SELECT DISTINCT INITCAP(TRIM(company)) AS company
                FROM mentors
                WHERE company IS NOT NULL
                ORDER BY company;`

        );

        const roles = await pool.query(

            `SELECT DISTINCT INITCAP(TRIM(role)) AS role
FROM mentors
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

            `SELECT COUNT(DISTINCT company) FROM mentors
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

            `SELECT * FROM mentors
             WHERE mentor_id=$1`,

            [id]

        );

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