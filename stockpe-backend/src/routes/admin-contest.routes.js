const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/adminAuth");
const controller = require("../controllers/admin-contest.controller");

router.use(requireAuth, requireAdmin());
router.get("/contests", controller.list);
router.post("/contests", controller.create);
router.put("/contests/:publicId", controller.update);
router.put("/contests/:publicId/status", controller.changeStatus);
router.post("/contests/:publicId/settle", controller.settle);
router.get("/contests/:publicId/entries", controller.entries);

module.exports = router;
