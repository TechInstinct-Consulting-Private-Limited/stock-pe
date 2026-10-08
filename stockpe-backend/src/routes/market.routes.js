const express = require("express");
const marketController = require("../controllers/market.controller");

const router = express.Router();

router.get("/indices", marketController.getIndices);
router.get("/search", marketController.searchContestInstruments);

module.exports = router;
