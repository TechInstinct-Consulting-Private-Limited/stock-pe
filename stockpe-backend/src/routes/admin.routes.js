const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  listContests,
  createContest,
  updateContestStatus,
  settleContest,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/contests", listContests);
router.post("/contests", createContest);
router.put("/contests/:publicId/status", updateContestStatus);
router.post("/contests/:publicId/settle", settleContest);

module.exports = router;
