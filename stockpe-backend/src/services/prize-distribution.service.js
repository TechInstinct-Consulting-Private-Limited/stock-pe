const TOTAL_BASIS_POINTS = 10_000;

// This is the approved Figma payout schedule. Percentages for grouped ranks
// are totals for the full range, not for each individual player.
const DEFAULT_PRIZE_DISTRIBUTION = Object.freeze([
    { label: "1st Place", startRank: 1, endRank: 1, percent: 40 },
    { label: "2nd Place", startRank: 2, endRank: 2, percent: 20 },
    { label: "3rd Place", startRank: 3, endRank: 3, percent: 15 },
    { label: "Rank 4–5", startRank: 4, endRank: 5, percent: 10 },
    { label: "Rank 6–10", startRank: 6, endRank: 10, percent: 8 },
    { label: "Rank 11–50", startRank: 11, endRank: 50, percent: 5 },
    { label: "Rank 51+", startRank: 51, endRank: 100, percent: 2 },
]);

function operationalError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    error.isOperational = true;
    return error;
}

function cloneDefaultPrizeDistribution() {
    return DEFAULT_PRIZE_DISTRIBUTION.map((tier) => ({ ...tier }));
}

function normalizePrizeDistribution(value) {
    const source = value === undefined || value === null ? cloneDefaultPrizeDistribution() : value;
    if (!Array.isArray(source) || source.length === 0) throw operationalError("prizeDistribution must contain at least one tier");
    const normalized = source.map((tier) => {
        const label = String(tier?.label || "").trim();
        const startRank = Number(tier?.startRank);
        const endRank = Number(tier?.endRank);
        const percent = Number(tier?.percent);
        if (!label || !Number.isInteger(startRank) || !Number.isInteger(endRank) || startRank < 1 || endRank < startRank
            || !Number.isFinite(percent) || percent <= 0 || Math.round(percent * 100) !== percent * 100) {
            throw operationalError("Each prizeDistribution tier requires a label, valid rank range, and positive percentage");
        }
        return { label, startRank, endRank, percent };
    }).sort((left, right) => left.startRank - right.startRank);

    let previousEnd = 0;
    let totalBasisPoints = 0;
    normalized.forEach((tier) => {
        if (tier.startRank <= previousEnd) throw operationalError("prizeDistribution rank ranges must not overlap");
        previousEnd = tier.endRank;
        totalBasisPoints += Math.round(tier.percent * 100);
    });
    if (totalBasisPoints !== TOTAL_BASIS_POINTS) throw operationalError("prizeDistribution percentages must total 100%");
    return normalized;
}

function createPositionAllocations(poolAmount, distribution) {
    const pool = BigInt(poolAmount);
    const tierAllocations = distribution.map((tier, index) => {
        const basisPoints = BigInt(Math.round(tier.percent * 100));
        const numerator = pool * basisPoints;
        return { ...tier, index, amount: numerator / BigInt(TOTAL_BASIS_POINTS), remainder: numerator % BigInt(TOTAL_BASIS_POINTS) };
    });
    let assigned = tierAllocations.reduce((sum, tier) => sum + tier.amount, 0n);
    let remainder = pool - assigned;
    tierAllocations.sort((left, right) => right.remainder > left.remainder ? 1 : right.remainder < left.remainder ? -1 : left.index - right.index);
    for (let index = 0; remainder > 0n; index = (index + 1) % tierAllocations.length) {
        tierAllocations[index].amount += 1n;
        remainder -= 1n;
    }

    const byRank = new Map();
    tierAllocations.forEach((tier) => {
        const slotCount = BigInt(tier.endRank - tier.startRank + 1);
        const each = tier.amount / slotCount;
        let tierRemainder = tier.amount % slotCount;
        for (let rank = tier.startRank; rank <= tier.endRank; rank += 1) {
            byRank.set(rank, each + (tierRemainder-- > 0n ? 1n : 0n));
        }
    });
    return byRank;
}

function splitAmount(amount, count) {
    if (!count) return [];
    const size = BigInt(count);
    const base = amount / size;
    let remainder = amount % size;
    return Array.from({ length: count }, () => base + (remainder-- > 0n ? 1n : 0n));
}

// Equal predictions share every rank slot they occupy. For example, a tie for
// first consumes rank 1 and rank 2 allocations, then divides that combined
// amount between the tied players. This is deterministic and does not mint
// extra prize money.
function calculateRankRewards(entries, finalValue, prizePoolAmount, distribution) {
    const final = Number(finalValue);
    if (!Number.isFinite(final) || final <= 0) throw operationalError("A positive settlement value is required");
    const rules = normalizePrizeDistribution(distribution);
    const positionAllocations = createPositionAllocations(prizePoolAmount, rules);
    const eligible = entries
        .filter((entry) => entry.prediction_value !== null && entry.prediction_value !== undefined && Number.isFinite(Number(entry.prediction_value)))
        .map((entry) => ({ entry, distance: Math.abs(Number(entry.prediction_value) - final) }))
        .sort((left, right) => left.distance - right.distance || new Date(left.entry.joined_at || 0) - new Date(right.entry.joined_at || 0));

    const rewards = new Map(entries.map((entry) => [entry.id, { entry, rank: null, reward: 0n }]));
    let index = 0;
    while (index < eligible.length) {
        const groupStart = index;
        const distance = eligible[index].distance;
        while (index < eligible.length && eligible[index].distance === distance) index += 1;
        const group = eligible.slice(groupStart, index);
        const rank = groupStart + 1;
        const groupAmount = group.reduce((sum, _item, offset) => sum + (positionAllocations.get(rank + offset) || 0n), 0n);
        const shares = splitAmount(groupAmount, group.length);
        group.forEach((item, shareIndex) => rewards.set(item.entry.id, { entry: item.entry, rank, reward: shares[shareIndex] }));
    }

    return entries.map((entry) => {
        const result = rewards.get(entry.id);
        return { entry, rank: result.rank, reward: result.reward, isWinner: result.reward > 0n };
    });
}

module.exports = { DEFAULT_PRIZE_DISTRIBUTION, calculateRankRewards, cloneDefaultPrizeDistribution, normalizePrizeDistribution };
