const jwt = require("jsonwebtoken");
const { requireActiveSession } = require("../services/auth-session.service");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireAuth(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required",
        });
    }

    try {
        const auth = jwt.verify(
            authorization.slice(7),
            process.env.JWT_SECRET
        );

        if (!auth?.jti || !UUID_PATTERN.test(String(auth.sub || "")) || !(await requireActiveSession(auth.jti))) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is invalid or expired",
            });
        }

        req.auth = auth;
        return next();
    } catch (_error) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is invalid or expired",
        });
    }
}

module.exports = { requireAuth };
