const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { balance, join, mine } = require("../controllers/demo-contest.controller");
router.use(requireAuth);
router.get("/balance", balance);
router.get("/demo-usdt-wallet", async (req, res, next) => {
    try {
        const { getDemoUsdtWallet } = require('../services/demo-usdt.service');
        res.set('Cache-Control', 'no-store');
        res.json({ success: true, ...(await getDemoUsdtWallet(req.auth.sub)) });
    } catch (error) { next(error); }
});
router.get("/mine", mine);
router.post("/:publicId/join", join);
module.exports = router;
