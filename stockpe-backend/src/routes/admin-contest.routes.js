const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/adminAuth");
const controller = require("../controllers/admin-contest.controller");

router.use(requireAuth, requireAdmin());
router.get("/users", controller.listUsers);
router.get("/contests", controller.list);
router.get("/contests/:publicId/details", controller.details);
router.post("/contests", controller.create);
router.put("/contests/:publicId", controller.update);
router.put("/contests/:publicId/status", controller.changeStatus);
router.post("/contests/:publicId/settle", controller.settle);
router.get("/contests/:publicId/entries", controller.entries);
router.get("/demo-payouts", controller.listPayouts);
router.post("/contests/:publicId/demo-payouts", controller.createPayout);
router.post("/demo-payouts/:payoutId/approve", controller.approvePayout);
router.post("/demo-payouts/:payoutId/complete", controller.completePayout);
router.post("/demo-payouts/:payoutId/reject", controller.rejectPayout);

module.exports = router;
