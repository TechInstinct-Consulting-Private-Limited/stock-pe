const test = require("node:test");
const assert = require("node:assert/strict");

process.env.DB_HOST = process.env.DB_HOST || "127.0.0.1";
process.env.DB_NAME = process.env.DB_NAME || "stockpe_test";
process.env.DB_USER = process.env.DB_USER || "stockpe_test";

const { calculateWinnerRewards } = require("../src/services/admin-contest.service");

test("splits the demo prize pool between closest tied predictions", () => {
    const rewards = calculateWinnerRewards([
        { id: "first", prediction_value: 100 },
        { id: "second", prediction_value: 102 },
        { id: "third", prediction_value: 110 },
    ], 101, 101);

    assert.deepEqual(rewards.map(({ entry, isWinner, rewardCredits }) => ({ id: entry.id, isWinner, rewardCredits })), [
        { id: "first", isWinner: true, rewardCredits: 51 },
        { id: "second", isWinner: true, rewardCredits: 50 },
        { id: "third", isWinner: false, rewardCredits: 0 },
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
