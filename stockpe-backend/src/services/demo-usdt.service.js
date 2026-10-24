const pool = require('../config/database');
const { toAtomicUsdt } = require('./wallet-ledger.service');

const MAX_BIGINT = 9223372036854775807n;

function initialDemoUsdtAtomic(value = process.env.DEMO_USDT_STARTING_BALANCE || '100') {
    const atomic = toAtomicUsdt(value);
    if (atomic > MAX_BIGINT) throw new Error('Demo USDT starting balance exceeds the supported limit');
    return atomic.toString();
}

// This initializer must run within the caller's transaction. A welcome record
// is created only for a newly inserted account, including under concurrency.
async function ensureDemoUsdtAccount(client, userId) {
    const amount = initialDemoUsdtAtomic();
    const inserted = await client.query(
        `INSERT INTO demo_usdt_accounts (user_id, available_atomic)
         VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING RETURNING user_id`,
        [userId, amount]
    );
    if (inserted.rowCount) {
        await client.query(
            `INSERT INTO demo_usdt_activity (user_id, activity_type, amount_atomic)
             VALUES ($1, 'WELCOME', $2)`, [userId, amount]
        );
    }
    const result = await client.query(
        `SELECT available_atomic::text, reserved_atomic::text
         FROM demo_usdt_accounts WHERE user_id = $1`, [userId]
    );
    return result.rows[0];
}

async function getDemoUsdtAccount(userId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await ensureDemoUsdtAccount(client, userId);
        await client.query('COMMIT');
        return account;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

function atomicToDemoUsdt(value) {
    const atomic = BigInt(value);
    if (atomic < 0n) throw new Error('Invalid Demo USDT amount');
    return `${atomic / 1000000n}.${String(atomic % 1000000n).padStart(6, '0')}`;
}

async function getDemoUsdtWallet(userId) {
    const account = await getDemoUsdtAccount(userId);
    const activity = await pool.query(
        `SELECT a.id, a.activity_type, a.amount_atomic::text, a.created_at,
                c.title AS contest_title, c.public_id AS contest_public_id
         FROM demo_usdt_activity a
         LEFT JOIN demo_dashboard_contests c ON c.id=a.contest_id
         WHERE a.user_id=$1 ORDER BY a.created_at DESC, a.id DESC LIMIT 100`, [userId]
    );
    return {
        available: atomicToDemoUsdt(account.available_atomic),
        reserved: atomicToDemoUsdt(account.reserved_atomic),
        currency: 'DEMO_USDT',
        activity: activity.rows.map((row) => ({ ...row, amount: atomicToDemoUsdt(row.amount_atomic) })),
    };
}

function splitDemoUsdtPool(amountAtomic, winnerCount) {
    const poolAmount = BigInt(amountAtomic);
    if (poolAmount <= 0n || !Number.isSafeInteger(winnerCount) || winnerCount <= 0) {
        throw new Error('A positive pool and winner count are required');
    }
    const count = BigInt(winnerCount);
    const share = poolAmount / count;
    const remainder = poolAmount % count;
    return Array.from({ length: winnerCount }, (_, index) =>
        (share + (BigInt(index) < remainder ? 1n : 0n)).toString()
    );
}

// Call these functions only inside the same transaction as the contest entry
// or settlement. The account update and unique activity insert roll back together.
async function reserveDemoUsdt(client, { userId, contestId, entryId, amountAtomic }) {
    if (BigInt(amountAtomic) <= 0n) throw new Error('Demo USDT entry must be positive');
    await ensureDemoUsdtAccount(client, userId);
    const result = await client.query(
        `UPDATE demo_usdt_accounts SET available_atomic=available_atomic-$2,
         reserved_atomic=reserved_atomic+$2, updated_at=NOW()
         WHERE user_id=$1 AND available_atomic >= $2 RETURNING user_id`,
        [userId, String(amountAtomic)]
    );
    if (!result.rowCount) throw Object.assign(new Error('Insufficient Demo USDT balance'), { statusCode: 409, isOperational: true });
    await client.query(
        `INSERT INTO demo_usdt_activity (user_id, contest_id, entry_id, activity_type, amount_atomic)
         VALUES ($1,$2,$3,'ENTRY',$4)`, [userId, contestId, entryId, String(amountAtomic)]
    );
}

async function settleDemoUsdtEntry(client, { userId, contestId, entryId, entryAtomic, rewardAtomic }) {
    if (BigInt(entryAtomic) <= 0n || BigInt(rewardAtomic) < 0n) throw new Error('Invalid Demo USDT settlement amount');
    const result = await client.query(
        `UPDATE demo_usdt_accounts SET reserved_atomic=reserved_atomic-$2,
         available_atomic=available_atomic+$3, updated_at=NOW()
         WHERE user_id=$1 AND reserved_atomic >= $2 RETURNING user_id`,
        [userId, String(entryAtomic), String(rewardAtomic)]
    );
    if (!result.rowCount) throw new Error('Demo USDT reservation is missing');
    if (BigInt(rewardAtomic) > 0n) {
        await client.query(
            `INSERT INTO demo_usdt_activity (user_id, contest_id, entry_id, activity_type, amount_atomic)
             VALUES ($1,$2,$3,'REWARD',$4)`, [userId, contestId, entryId, String(rewardAtomic)]
        );
    }
}

async function refundDemoUsdtEntry(client, { userId, contestId, entryId, entryAtomic }) {
    if (BigInt(entryAtomic) <= 0n) throw new Error('Invalid Demo USDT refund amount');
    const result = await client.query(
        `UPDATE demo_usdt_accounts SET reserved_atomic=reserved_atomic-$2,
         available_atomic=available_atomic+$2, updated_at=NOW()
         WHERE user_id=$1 AND reserved_atomic >= $2 RETURNING user_id`, [userId, String(entryAtomic)]
    );
    if (!result.rowCount) throw new Error('Demo USDT reservation is missing');
    await client.query(
        `INSERT INTO demo_usdt_activity (user_id, contest_id, entry_id, activity_type, amount_atomic)
         VALUES ($1,$2,$3,'REFUND',$4)`, [userId, contestId, entryId, String(entryAtomic)]
    );
}

module.exports = { atomicToDemoUsdt, ensureDemoUsdtAccount, getDemoUsdtAccount, getDemoUsdtWallet, initialDemoUsdtAtomic, reserveDemoUsdt, settleDemoUsdtEntry, refundDemoUsdtEntry, splitDemoUsdtPool };
