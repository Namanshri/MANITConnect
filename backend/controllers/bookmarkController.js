const pool = require("../config/db");

const VALID_TYPES = ["insight", "experience", "guidance"];

/* TOGGLE — if already bookmarked, remove it; if not, add it.
   Returns { bookmarked: true/false } so the frontend button knows
   which state to show without a second request. */
const toggleBookmark = async (req, res) => {

    try {

        const { item_type, item_id } = req.body;

        if (!VALID_TYPES.includes(item_type) || !item_id) {

            return res.status(400).json({ message: "Invalid bookmark request." });

        }

        const existing = await pool.query(

            `SELECT bookmark_id FROM bookmarks
             WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,

            [req.user.user_id, item_type, item_id]

        );

        if (existing.rows.length > 0) {

            await pool.query("DELETE FROM bookmarks WHERE bookmark_id = $1", [existing.rows[0].bookmark_id]);

            return res.json({ bookmarked: false });

        }

        await pool.query(

            `INSERT INTO bookmarks (user_id, item_type, item_id) VALUES ($1, $2, $3)`,

            [req.user.user_id, item_type, item_id]

        );

        res.json({ bookmarked: true });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

/* CHECK which of a given list of ids (for one item_type) are bookmarked
   by the current user — used to render the correct icon state when a
   page loads a list of insights/experiences/guidance items. */
const getBookmarkedIds = async (req, res) => {

    try {

        const { item_type } = req.params;

        if (!VALID_TYPES.includes(item_type)) {

            return res.status(400).json({ message: "Invalid item type." });

        }

        const result = await pool.query(

            `SELECT item_id FROM bookmarks WHERE user_id = $1 AND item_type = $2`,

            [req.user.user_id, item_type]

        );

        res.json(result.rows.map((row) => row.item_id));

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

/* GET ALL BOOKMARKS for "Your Library" — joined back to real content
   for each of the three types. */
const getMyLibrary = async (req, res) => {

    try {

        const userId = req.user.user_id;

        const insights = await pool.query(

            `SELECT insights.*, bookmarks.created_at AS bookmarked_at,
                    mentors.full_name AS mentor_name
             FROM bookmarks
             JOIN insights ON bookmarks.item_id = insights.insight_id
             JOIN mentors ON insights.mentor_id = mentors.mentor_id
             WHERE bookmarks.user_id = $1 AND bookmarks.item_type = 'insight'
             ORDER BY bookmarks.created_at DESC`,

            [userId]

        );

        const experiences = await pool.query(

            `SELECT experiences.*, bookmarks.created_at AS bookmarked_at,
                    mentors.full_name AS mentor_name
             FROM bookmarks
             JOIN experiences ON bookmarks.item_id = experiences.experience_id
             JOIN mentors ON experiences.mentor_id = mentors.mentor_id
             WHERE bookmarks.user_id = $1 AND bookmarks.item_type = 'experience'
             ORDER BY bookmarks.created_at DESC`,

            [userId]

        );

        const guidance = await pool.query(

            `SELECT guidance.*, bookmarks.created_at AS bookmarked_at,
                    mentors.full_name AS mentor_name
             FROM bookmarks
             JOIN guidance ON bookmarks.item_id = guidance.guidance_id
             JOIN mentors ON guidance.mentor_id = mentors.mentor_id
             WHERE bookmarks.user_id = $1 AND bookmarks.item_type = 'guidance'
             ORDER BY bookmarks.created_at DESC`,

            [userId]

        );

        res.json({

            insights: insights.rows,
            experiences: experiences.rows,
            guidance: guidance.rows

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

module.exports = {

    toggleBookmark,
    getBookmarkedIds,
    getMyLibrary

};
