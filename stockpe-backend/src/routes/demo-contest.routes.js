const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { balance, join, mine } = require("../controllers/demo-contest.controller");
router.use(requireAuth);
router.get("/balance", balance);
router.get("/mine", mine);
router.post("/:publicId/join", join);
module.exports = router;
