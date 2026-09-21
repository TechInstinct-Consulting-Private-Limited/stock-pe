const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { join, mine } = require("../controllers/demo-contest.controller");
router.use(requireAuth);
router.get("/mine", mine);
router.post("/:publicId/join", join);
module.exports = router;
