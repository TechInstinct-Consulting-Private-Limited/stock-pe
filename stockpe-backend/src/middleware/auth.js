const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required",
        });
    }

    try {
        req.auth = jwt.verify(
            authorization.slice(7),
            process.env.JWT_SECRET
        );
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is invalid or expired",
        });
    }
}

module.exports = { requireAuth };
