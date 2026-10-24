// Opt-in local-only integration test. All fixtures live in a single rolled-back
// transaction; never point this test at a remote or production database.
const test = require('node:test');
const assert = require('node:assert/strict');

test('Demo USDT contest join and automatic settlement are atomic', { skip: process.env.RUN_LOCAL_DEMO_INTEGRATION !== 'true' }, async () => {
    require('dotenv').config({ quiet: true });
    if (!['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST) || process.env.NODE_ENV === 'production') {
        throw new Error('Integration test requires a non-production local database');
    }
    const pool = require('../src/config/database');
    const { createContest, changeContestStatus, autoSettleScheduledContests } = require('../src/services/admin-contest.service');
    const { joinDemoContest } = require('../src/services/demo-contest.service');
    const client = await pool.connect();
    const originalConnect = pool.connect.bind(pool);
    const originalQuery = pool.query.bind(pool);
    const publicId = `integration-${Date.now()}`;
    let counter = 0;
    let currentSavepoint;
    const wrapped = {
        async query(sql, params) {
            if (sql === 'BEGIN') { currentSavepoint = `demo_test_${++counter}`; return client.query(`SAVEPOINT ${currentSavepoint}`); }
            if (sql === 'COMMIT') return client.query(`RELEASE SAVEPOINT ${currentSavepoint}`);
            if (sql === 'ROLLBACK') return client.query(`ROLLBACK TO SAVEPOINT ${currentSavepoint}`);
            return client.query(sql, params);
        },
        release() {},
    };
    try {
        await client.query('BEGIN');
        pool.connect = async () => wrapped;
        pool.query = (sql, params) => {
            if (sql.includes("WHERE lifecycle_mode='SCHEDULED' AND status='CLOSED'")) {
                return client.query("SELECT public_id FROM demo_dashboard_contests WHERE public_id=$1 AND status='CLOSED'", [publicId]);
            }
            return client.query(sql, params);
        };
        const users = [];
        for (let i = 0; i < 4; i++) {
            const mobile = `1${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`;
            const row = await client.query("INSERT INTO users(mobile,password_hash,mobile_verified) VALUES($1,'integration-only',true) RETURNING id", [mobile]);
            users.push(row.rows[0].id);
        }
        const now = Date.now();
        await createContest({ adminUserId: users[0], input: {
            publicId, title: 'Isolated Demo USDT integration', question: 'Test only', instrumentCode: 'NIFTY50',
            entryCredits: 5, prizePoolCredits: 100, playerCapacity: 3, lifecycleMode: 'SCHEDULED', currency: 'DEMO_USDT',
            opensAt: new Date(now - 120000).toISOString(), liveAt: new Date(now + 60000).toISOString(), closesAt: new Date(now + 120000).toISOString(),
        } });
        await client.query("UPDATE demo_dashboard_contests SET status='OPEN' WHERE public_id=$1", [publicId]);
        await joinDemoContest({ userId: users[0], publicId, predictionValue: 99 });
        await assert.rejects(joinDemoContest({ userId: users[0], publicId, predictionValue: 99 }), /already joined/);
        await joinDemoContest({ userId: users[1], publicId, predictionValue: 101 });
        await joinDemoContest({ userId: users[2], publicId, predictionValue: 110 });
        await assert.rejects(joinDemoContest({ userId: users[3], publicId, predictionValue: 100 }), /full/);
        const before = await client.query('SELECT available_atomic::text,reserved_atomic::text FROM demo_usdt_accounts WHERE user_id=$1', [users[0]]);
        assert.deepEqual(before.rows[0], { available_atomic: '95000000', reserved_atomic: '5000000' });
        const contest = await client.query("UPDATE demo_dashboard_contests SET status='CLOSED', live_at=NOW()-interval '10 seconds', closes_at=NOW() WHERE public_id=$1 RETURNING id,instrument_id", [publicId]);
        await client.query("INSERT INTO market_price_snapshots(instrument_id,value,change_percent,observed_at,provider_key) VALUES($1,100,0,NOW()+interval '1 second','integration-test')", [contest.rows[0].instrument_id]);
        const result = await autoSettleScheduledContests();
        assert.equal(result.settlements[0].winnerCount, 2);
        for (const user of users.slice(0, 2)) {
            const balance = await client.query('SELECT available_atomic::text,reserved_atomic::text FROM demo_usdt_accounts WHERE user_id=$1', [user]);
            assert.deepEqual(balance.rows[0], { available_atomic: '145000000', reserved_atomic: '0' });
        }
        const repeat = await autoSettleScheduledContests();
        assert.equal(repeat.settlements.length, 0);
        const rewards = await client.query("SELECT count(*)::int AS count FROM demo_usdt_activity WHERE contest_id=$1 AND activity_type='REWARD'", [contest.rows[0].id]);
        assert.equal(rewards.rows[0].count, 2);
        const refundId = `${publicId}-refund`;
        await createContest({ adminUserId: users[0], input: {
            publicId: refundId, title: 'Isolated refund test', question: 'Test only', instrumentCode: 'NIFTY50',
            entryCredits: 5, prizePoolCredits: 10, playerCapacity: 4, lifecycleMode: 'MANUAL', currency: 'DEMO_USDT',
            opensAt: new Date(now - 120000).toISOString(), closesAt: new Date(now + 120000).toISOString(),
        } });
        await client.query("UPDATE demo_dashboard_contests SET status='OPEN' WHERE public_id=$1", [refundId]);
        await joinDemoContest({ userId: users[3], publicId: refundId, predictionValue: 100 });
        await changeContestStatus({ adminUserId: users[0], publicId: refundId, status: 'CANCELLED', reason: 'integration test' });
        const refunded = await client.query('SELECT available_atomic::text,reserved_atomic::text FROM demo_usdt_accounts WHERE user_id=$1', [users[3]]);
        assert.deepEqual(refunded.rows[0], { available_atomic: '100000000', reserved_atomic: '0' });
        const expensiveId = `${publicId}-expensive`;
        await createContest({ adminUserId: users[0], input: {
            publicId: expensiveId, title: 'Isolated insufficient balance test', question: 'Test only', instrumentCode: 'NIFTY50',
            entryCredits: 101, prizePoolCredits: 200, playerCapacity: 4, lifecycleMode: 'MANUAL', currency: 'DEMO_USDT',
            opensAt: new Date(now - 120000).toISOString(), closesAt: new Date(now + 120000).toISOString(),
        } });
        await client.query("UPDATE demo_dashboard_contests SET status='OPEN' WHERE public_id=$1", [expensiveId]);
        await assert.rejects(joinDemoContest({ userId: users[3], publicId: expensiveId, predictionValue: 100 }), /Insufficient Demo USDT/);
    } finally {
        pool.connect = originalConnect;
        pool.query = originalQuery;
        await client.query('ROLLBACK');
        client.release();
        await pool.end();
    }
});
