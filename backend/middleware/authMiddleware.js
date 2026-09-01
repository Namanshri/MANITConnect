const jwt = require("jsonwebtoken");

/**
 * authenticateUser
 * Reads the JWT from the HttpOnly "token" cookie set by /api/auth/login.
 * Never trusts a user_id/mentor_id sent in the request body.
 * Attaches { user_id, role } to req.user for downstream controllers.
 */
const authenticateUser = (req, res, next) => {

    const token = req.cookies?.token;

    if (!token) {

        return res.status(401).json({

            success: false,

            message: "Please log in to continue."

        });

    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {

            user_id: decoded.user_id,

            role: decoded.role

        };

        next();

    }

    catch (err) {

        return res.status(401).json({

            success: false,

            message: "Session expired. Please log in again."

        });

    }

};

module.exports = authenticateUser;
