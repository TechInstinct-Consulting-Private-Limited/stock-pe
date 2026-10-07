const pool = require("../config/database");

async function listContests(req, res, next) {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        public_id,
        title,
        question,
        instrument_code,
        entry_credits,
        prize_pool_credits,
        player_capacity,
        player_count,
        status,
        opens_at,
        closes_at,
        settlement_source,
        closing_value,
        settlement_notes,
        created_at
      FROM contests
    `;
    const values = [];

    if (status && status !== "ALL") {
      query += " WHERE status = $1";
      values.push(status);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);
    return res.status(200).json({
      success: true,
      contests: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

async function createContest(req, res, next) {
  try {
    const {
      publicId,
      title,
      question,
      instrumentCode,
      entryCredits,
      prizePoolCredits,
      playerCapacity,
      opensAt,
      closesAt,
      settlementSource,
      status = "DRAFT",
    } = req.body;

    if (!title || !question || !instrumentCode) {
      return res.status(400).json({
        success: false,
        message: "Title, question, and instrument code are required.",
      });
    }

    const genPublicId = publicId || `${instrumentCode.toLowerCase()}-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO contests (
        public_id, title, question, instrument_code,
        entry_credits, prize_pool_credits, player_capacity,
        opens_at, closes_at, settlement_source, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        genPublicId,
        title,
        question,
        instrumentCode,
        entryCredits || 0,
        prizePoolCredits || 0,
        playerCapacity || 100,
        opensAt || new Date(),
        closesAt || new Date(Date.now() + 6 * 3600000),
        settlementSource || "Market Reference",
        status,
      ]
    );

    return res.status(201).json({
      success: true,
      contest: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateContestStatus(req, res, next) {
  try {
    const { publicId } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE contests 
       SET status = $1, updated_at = NOW() 
       WHERE public_id = $2
       RETURNING *`,
      [status, publicId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    return res.status(200).json({
      success: true,
      contest: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function settleContest(req, res, next) {
  try {
    const { publicId } = req.params;
    const { closingValue, settlementNotes } = req.body;

    const result = await pool.query(
      `UPDATE contests 
       SET status = 'SETTLED', closing_value = $1, settlement_notes = $2, updated_at = NOW() 
       WHERE public_id = $3
       RETURNING *`,
      [closingValue, settlementNotes, publicId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    return res.status(200).json({
      success: true,
      contest: {
        ...result.rows[0],
        winnerCount: 1, // Demo winner count
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listContests,
  createContest,
  updateContestStatus,
  settleContest,
};
