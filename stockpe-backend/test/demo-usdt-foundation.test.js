const test = require('node:test');
const assert = require('node:assert/strict');
process.env.DB_HOST ||= '127.0.0.1';
process.env.DB_NAME ||= 'stockpe_test';
process.env.DB_USER ||= 'stockpe_test';
const { atomicToDemoUsdt, initialDemoUsdtAtomic, ensureDemoUsdtAccount, splitDemoUsdtPool } = require('../src/services/demo-usdt.service');

test('demo starting amount uses exact six-decimal atomic units', () => {
    assert.equal(initialDemoUsdtAtomic('100'), '100000000');
    assert.equal(initialDemoUsdtAtomic('0.000001'), '1');
    assert.throws(() => initialDemoUsdtAtomic('0'));
    assert.throws(() => initialDemoUsdtAtomic('1.0000001'));
    assert.throws(() => initialDemoUsdtAtomic('9223372036855'));
});

test('demo prize split preserves every atomic unit', () => {
    assert.deepEqual(splitDemoUsdtPool('100000001', 3), ['33333334', '33333334', '33333333']);
    assert.throws(() => splitDemoUsdtPool('100', 0));
});

test('demo wallet amounts are formatted without floating point rounding', () => {
    assert.equal(atomicToDemoUsdt('100000001'), '100.000001');
    assert.equal(atomicToDemoUsdt('0'), '0.000000');
    assert.throws(() => atomicToDemoUsdt('-1'));
});

test('welcome activity is recorded once when an account is created', async () => {
    let created = false;
    let welcomes = 0;
    const client = { async query(sql) {
        if (sql.includes('INSERT INTO demo_usdt_accounts')) {
            if (created) return { rowCount: 0, rows: [] };
            created = true;
            return { rowCount: 1, rows: [{ user_id: 'user' }] };
        }
        if (sql.includes('INSERT INTO demo_usdt_activity')) { welcomes++; return { rowCount: 1 }; }
        return { rows: [{ available_atomic: '100000000', reserved_atomic: '0' }] };
    } };
    await ensureDemoUsdtAccount(client, 'user');
    await ensureDemoUsdtAccount(client, 'user');
    assert.equal(welcomes, 1);
});
