const pool = require("../config/db");
module.exports = async (req, res, next) => {
    try {
        const result = await pool.query("SELECT mentor_status FROM users WHERE user_id=$1", [req.user.user_id]);
        if (result.rows[0]?.mentor_status !== "approved") return res.status(403).json({ message: "Your mentor access is currently pending review or has been discontinued." });
        next();
    } catch (error) { next(error); }
};
