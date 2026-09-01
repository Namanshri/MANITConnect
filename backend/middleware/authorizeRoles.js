/**
 * authorizeRoles(...roles)
 * Must run AFTER authMiddleware (needs req.user).
 * Usage: router.post("/", authenticateUser, authorizeRoles("mentor"), controllerFn)
 */
const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Please log in to continue."

            });

        }

        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({

                success: false,

                message: "You do not have permission to perform this action."

            });

        }

        next();

    };

};

module.exports = authorizeRoles;
