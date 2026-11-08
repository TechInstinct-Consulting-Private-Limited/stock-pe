const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const controller = require("../controllers/leaderboard.controller");
router.use(requireAuth);
router.get("/", controller.list);
router.get("/:userId", controller.profile);
module.exports = router;
