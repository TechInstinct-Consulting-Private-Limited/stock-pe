const test = require("node:test");
const assert = require("node:assert/strict");

process.env.DB_HOST = process.env.DB_HOST || "127.0.0.1";
process.env.DB_NAME = process.env.DB_NAME || "stockpe_test";
process.env.DB_USER = process.env.DB_USER || "stockpe_test";

const { calculateWinnerRewards } = require("../src/services/admin-contest.service");

test("splits occupied rank allocations between predictions tied for first", () => {
    const rewards = calculateWinnerRewards([
        { id: "first", prediction_value: 100, joined_at: "2026-01-01T00:00:00Z" },
        { id: "second", prediction_value: 102, joined_at: "2026-01-01T00:01:00Z" },
        { id: "third", prediction_value: 110, joined_at: "2026-01-01T00:02:00Z" },
    ], 101, 101);

    assert.deepEqual(rewards.map(({ entry, isWinner, rewardCredits }) => ({ id: entry.id, isWinner, rewardCredits })), [
        { id: "first", isWinner: true, rewardCredits: 31 },
        { id: "second", isWinner: true, rewardCredits: 30 },
        { id: "third", isWinner: true, rewardCredits: 15 },
    ]);
});

test("uses the Figma rank schedule for distinct final ranks", () => {
    const rewards = calculateWinnerRewards([
        { id: "one", prediction_value: 100, joined_at: "2026-01-01T00:00:00Z" },
        { id: "two", prediction_value: 102, joined_at: "2026-01-01T00:01:00Z" },
        { id: "three", prediction_value: 104, joined_at: "2026-01-01T00:02:00Z" },
        { id: "four", prediction_value: 106, joined_at: "2026-01-01T00:03:00Z" },
        { id: "five", prediction_value: 108, joined_at: "2026-01-01T00:04:00Z" },
    ], 100, 1000);

    assert.deepEqual(rewards.map(({ entry, rank, rewardCredits }) => ({ id: entry.id, rank, rewardCredits })), [
        { id: "one", rank: 1, rewardCredits: 400 },
        { id: "two", rank: 2, rewardCredits: 200 },
        { id: "three", rank: 3, rewardCredits: 150 },
        { id: "four", rank: 4, rewardCredits: 50 },
        { id: "five", rank: 5, rewardCredits: 50 },
    ]);
});

test("does not issue a reward when no active entry contains a prediction", () => {
    const rewards = calculateWinnerRewards([
        { id: "first", prediction_value: null },
        { id: "second", prediction_value: null },
    ], 101, 1000);

    assert.deepEqual(rewards.map(({ isWinner, rewardCredits }) => ({ isWinner, rewardCredits })), [
        { isWinner: false, rewardCredits: 0 },
        { isWinner: false, rewardCredits: 0 },
    ]);
});
