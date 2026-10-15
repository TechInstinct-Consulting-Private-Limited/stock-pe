const crypto = require("crypto");
const pool = require("../config/database");
const { createDigitalAssetProvider } = require("./digital-asset-providers");
const { assertBalancedEntries, toAtomicUsdt } = require("./wallet-ledger.service");

const NETWORK = "TRC20";
const ASSET = "USDT";
const REQUIRED_CONFIRMATIONS = 1;

function publicError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function requireMockProvider() {
    const provider = createDigitalAssetProvider();
    if (!provider.isMock || provider.key !== "mock-trc20") {
        throw publicError(503, "Mock payment testing is not enabled");
    }
    return provider;
}

function amountToDatabaseValue(amount) {
    const atomic = toAtomicUsdt(amount);
    const value = atomic.toString().padStart(7, "0");
    return `${value.slice(0, -6)}.${value.slice(-6)}`;
}

async function withTransaction(work) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function ensureLedgerAccount(client, { userId = null, accountType }) {
    const result = await client.query(
        `INSERT INTO wallet_ledger_accounts (user_id, account_type, asset_symbol, network)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [userId, accountType, ASSET, NETWORK]
    );

    if (result.rowCount > 0) return result.rows[0].id;

    const existing = await client.query(
        `SELECT id FROM wallet_ledger_accounts
         WHERE user_id IS NOT DISTINCT FROM $1
           AND account_type = $2 AND asset_symbol = $3 AND network = $4`,
        [userId, accountType, ASSET, NETWORK]
    );
    return existing.rows[0].id;
}

async function getAvailableBalance(client, userId) {
    const result = await client.query(
        `SELECT COALESCE(SUM(CASE direction
            WHEN 'CREDIT' THEN amount_usdt
            WHEN 'DEBIT' THEN -amount_usdt
            ELSE 0 END), 0)::TEXT AS available_usdt
         FROM wallet_ledger_entries entry
         JOIN wallet_ledger_accounts account ON account.id = entry.ledger_account_id
         JOIN wallet_ledger_transactions transaction
           ON transaction.id = entry.ledger_transaction_id
         WHERE account.user_id = $1
           AND account.account_type = 'USER_AVAILABLE'
           AND transaction.status = 'POSTED'`,
        [userId]
    );
    return result.rows[0].available_usdt;
}

async function postLedgerTransaction(client, {
    referenceType,
    referenceId,
    idempotencyKey,
    entries,
}) {
    assertBalancedEntries(entries);
    const transaction = await client.query(
        `INSERT INTO wallet_ledger_transactions
            (reference_type, reference_id, idempotency_key)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [referenceType, referenceId, idempotencyKey]
    );
    const ledgerTransactionId = transaction.rows[0].id;

    for (const entry of entries) {
        await client.query(
            `INSERT INTO wallet_ledger_entries
                (ledger_transaction_id, ledger_account_id, direction, amount_usdt)
             VALUES ($1, $2, $3, $4)`,
            [ledgerTransactionId, entry.ledgerAccountId, entry.direction, amountToDatabaseValue(entry.amountUsdt)]
        );
    }
    return ledgerTransactionId;
}

async function writeAuditLog(client, { userId = null, actorType, eventType, entityType, entityId, metadata = {} }) {
    await client.query(
        `INSERT INTO wallet_audit_logs
            (user_id, actor_type, event_type, entity_type, entity_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, actorType, eventType, entityType, entityId, JSON.stringify(metadata)]
    );
}

async function ensureMockDepositAddress({ userId }) {
    const provider = requireMockProvider();
    const existing = await pool.query(
        `SELECT id, provider_key, provider_address_id, address, network, status
         FROM deposit_addresses
         WHERE user_id = $1 AND provider_key = $2 AND status = 'ACTIVE'
         ORDER BY created_at DESC LIMIT 1`,
        [userId, provider.key]
    );
    if (existing.rowCount > 0) return existing.rows[0];

    const generated = await provider.createDepositAddress({ userId });
    const created = await pool.query(
        `INSERT INTO deposit_addresses
            (user_id, provider_key, provider_address_id, network, address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, provider_key, provider_address_id, address, network, status`,
        [userId, provider.key, generated.providerAddressId, NETWORK, generated.address]
    );
    return created.rows[0];
}

async function simulateMockDeposit({ userId, amountUsdt }) {
    const provider = requireMockProvider();
    const amount = amountToDatabaseValue(amountUsdt);
    const depositAddress = await ensureMockDepositAddress({ userId });
    const simulated = await provider.simulateDeposit({
        address: depositAddress.address,
        amountUsdt: amount,
    });

    await withTransaction(async (client) => {
        await client.query(
            `INSERT INTO deposits
                (user_id, deposit_address_id, provider_key, provider_transaction_id,
                 tx_hash, network, asset_symbol, amount_usdt, confirmations,
                 required_confirmations, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, 'CONFIRMING')`,
            [
                userId, depositAddress.id, provider.key, simulated.providerTransactionId,
                simulated.txHash, NETWORK, ASSET, amount, REQUIRED_CONFIRMATIONS,
            ]
        );
    });

    const processed = await processMockWebhook({
        payload: simulated.event.payload,
        signature: simulated.event.signature,
    });

    return { ...processed, depositAddress };
}

async function simulateMockWithdrawal({ userId, amountUsdt, idempotencyKey }) {
    const provider = requireMockProvider();
    const amount = amountToDatabaseValue(amountUsdt);
    const safeIdempotencyKey = String(idempotencyKey || "").trim();
    if (safeIdempotencyKey.length < 16 || safeIdempotencyKey.length > 200) {
        throw publicError(400, "A unique idempotency key of 16 to 200 characters is required");
    }

    const created = await withTransaction(async (client) => {
        const prior = await client.query(
            `SELECT id, user_id, status, amount_usdt::TEXT AS amount_usdt, tx_hash
             FROM withdrawals WHERE idempotency_key = $1`,
            [safeIdempotencyKey]
        );
        if (prior.rowCount > 0) {
            if (prior.rows[0].user_id !== userId) {
                throw publicError(409, "This idempotency key has already been used");
            }
            return { withdrawal: prior.rows[0], repeated: true };
        }

        const wallet = await client.query(
            `SELECT id, address FROM usdt_wallets
             WHERE user_id = $1 AND network = $2 LIMIT 1`,
            [userId, NETWORK]
        );
        if (wallet.rowCount === 0) {
            throw publicError(409, "Link a TRC20 wallet before requesting a withdrawal");
        }

        const available = await getAvailableBalance(client, userId);
        if (toAtomicUsdt(available) < toAtomicUsdt(amount)) {
            throw publicError(409, "Insufficient available USDT balance");
        }

        const simulated = await provider.createWithdrawal({
            toAddress: wallet.rows[0].address,
            amountUsdt: amount,
            idempotencyKey: safeIdempotencyKey,
        });
        const result = await client.query(
            `INSERT INTO withdrawals
                (user_id, usdt_wallet_id, provider_key, provider_transfer_id,
                 idempotency_key, network, asset_symbol, amount_usdt, status, tx_hash)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SUBMITTED', $9)
             RETURNING id, status, amount_usdt::TEXT AS amount_usdt, tx_hash`,
            [
                userId, wallet.rows[0].id, provider.key, simulated.providerTransferId,
                safeIdempotencyKey, NETWORK, ASSET, amount, simulated.txHash,
            ]
        );
        return { withdrawal: result.rows[0], simulated, repeated: false };
    });

    if (created.repeated) return created;
    const processed = await processMockWebhook({
        payload: created.simulated.event.payload,
        signature: created.simulated.event.signature,
    });
    return { ...processed, repeated: false };
}

async function processMockWebhook({ payload, signature }) {
    const provider = requireMockProvider();
    if (!provider.verifyWebhook({ payload, signature })) {
        throw publicError(401, "Invalid mock provider webhook signature");
    }

    return withTransaction(async (client) => {
        const eventResult = await client.query(
            `INSERT INTO provider_webhook_events
                (provider_key, provider_event_id, event_type, payload, signature_valid)
             VALUES ($1, $2, $3, $4, TRUE)
             ON CONFLICT (provider_key, provider_event_id) DO NOTHING
             RETURNING id`,
            [provider.key, payload.eventId, payload.type, JSON.stringify(payload)]
        );
        if (eventResult.rowCount === 0) {
            return { alreadyProcessed: true };
        }

        let result;
        if (payload.type === "deposit.confirmed") {
            result = await confirmDeposit(client, provider, payload);
        } else if (payload.type === "withdrawal.completed") {
            result = await completeWithdrawal(client, provider, payload);
        } else {
            throw publicError(400, "Unsupported mock provider event type");
        }

        await client.query(
            `UPDATE provider_webhook_events SET processed_at = NOW()
             WHERE id = $1`,
            [eventResult.rows[0].id]
        );
        return { alreadyProcessed: false, ...result };
    });
}

async function confirmDeposit(client, provider, payload) {
    const deposit = await client.query(
        `SELECT deposit.id, deposit.user_id, deposit.amount_usdt::TEXT AS amount_usdt,
                deposit.status, address.address
         FROM deposits deposit
         JOIN deposit_addresses address ON address.id = deposit.deposit_address_id
         WHERE deposit.provider_key = $1 AND deposit.provider_transaction_id = $2
         FOR UPDATE`,
        [provider.key, payload.data.providerTransactionId]
    );
    if (deposit.rowCount === 0) throw publicError(404, "Mock deposit was not found");

    const row = deposit.rows[0];
    if (row.status === "CREDITED") return { deposit: row };
    if (
        row.address !== payload.data.address
        || toAtomicUsdt(row.amount_usdt) !== toAtomicUsdt(payload.data.amountUsdt)
        || payload.network !== NETWORK
    ) {
        throw publicError(400, "Mock deposit webhook does not match the expected transaction");
    }

    const userAvailable = await ensureLedgerAccount(client, {
        userId: row.user_id,
        accountType: "USER_AVAILABLE",
    });
    const clearing = await ensureLedgerAccount(client, {
        accountType: "PLATFORM_DEPOSIT_CLEARING",
    });
    const ledgerTransactionId = await postLedgerTransaction(client, {
        referenceType: "DEPOSIT",
        referenceId: row.id,
        idempotencyKey: `mock-deposit:${row.id}`,
        entries: [
            { ledgerAccountId: clearing, direction: "DEBIT", amountUsdt: row.amount_usdt },
            { ledgerAccountId: userAvailable, direction: "CREDIT", amountUsdt: row.amount_usdt },
        ],
    });
    const updated = await client.query(
        `UPDATE deposits
         SET status = 'CREDITED', confirmations = $1, confirmed_at = NOW(),
             credited_at = NOW(), credited_ledger_transaction_id = $2
         WHERE id = $3
         RETURNING id, status, amount_usdt::TEXT AS amount_usdt, tx_hash, confirmations`,
        [REQUIRED_CONFIRMATIONS, ledgerTransactionId, row.id]
    );
    await writeAuditLog(client, {
        userId: row.user_id,
        actorType: "PROVIDER",
        eventType: "MOCK_DEPOSIT_CREDITED",
        entityType: "deposit",
        entityId: row.id,
        metadata: { providerKey: provider.key, txHash: payload.data.txHash },
    });
    return { deposit: updated.rows[0] };
}

async function completeWithdrawal(client, provider, payload) {
    const withdrawal = await client.query(
        `SELECT id, user_id, amount_usdt::TEXT AS amount_usdt, status
         FROM withdrawals
         WHERE provider_key = $1 AND provider_transfer_id = $2
         FOR UPDATE`,
        [provider.key, payload.data.providerTransferId]
    );
    if (withdrawal.rowCount === 0) throw publicError(404, "Mock withdrawal was not found");
    const row = withdrawal.rows[0];
    if (row.status === "COMPLETED") return { withdrawal: row };
    if (toAtomicUsdt(row.amount_usdt) !== toAtomicUsdt(payload.data.amountUsdt)) {
        throw publicError(400, "Mock withdrawal webhook amount does not match");
    }

    const userAvailable = await ensureLedgerAccount(client, {
        userId: row.user_id,
        accountType: "USER_AVAILABLE",
    });
    const clearing = await ensureLedgerAccount(client, {
        accountType: "PLATFORM_WITHDRAWAL_CLEARING",
    });
    const ledgerTransactionId = await postLedgerTransaction(client, {
        referenceType: "WITHDRAWAL",
        referenceId: row.id,
        idempotencyKey: `mock-withdrawal:${row.id}`,
        entries: [
            { ledgerAccountId: userAvailable, direction: "DEBIT", amountUsdt: row.amount_usdt },
            { ledgerAccountId: clearing, direction: "CREDIT", amountUsdt: row.amount_usdt },
        ],
    });
    const updated = await client.query(
        `UPDATE withdrawals
         SET status = 'COMPLETED', completed_at = NOW(),
             completed_ledger_transaction_id = $1, tx_hash = $2
         WHERE id = $3
         RETURNING id, status, amount_usdt::TEXT AS amount_usdt, tx_hash`,
        [ledgerTransactionId, payload.data.txHash, row.id]
    );
    await writeAuditLog(client, {
        userId: row.user_id,
        actorType: "PROVIDER",
        eventType: "MOCK_WITHDRAWAL_COMPLETED",
        entityType: "withdrawal",
        entityId: row.id,
        metadata: { providerKey: provider.key, txHash: payload.data.txHash },
    });
    return { withdrawal: updated.rows[0] };
}

async function getPaymentSummary({ userId }) {
    return withTransaction(async (client) => {
        // pg clients process one query at a time. Keep this sequential so the
        // summary has a consistent transaction view without query overlap.
        const balance = await getAvailableBalance(client, userId);
        const address = await client.query(
            `SELECT address, network, status, created_at
             FROM deposit_addresses WHERE user_id = $1 AND status = 'ACTIVE'
             ORDER BY created_at DESC LIMIT 1`,
            [userId]
        );
        const deposits = await client.query(
            `SELECT id, amount_usdt::TEXT AS amount_usdt, status, tx_hash, detected_at
             FROM deposits WHERE user_id = $1 ORDER BY detected_at DESC LIMIT 10`,
            [userId]
        );
        const withdrawals = await client.query(
            `SELECT id, amount_usdt::TEXT AS amount_usdt, status, tx_hash, requested_at
             FROM withdrawals WHERE user_id = $1 ORDER BY requested_at DESC LIMIT 10`,
            [userId]
        );
        const demoPayouts = await client.query(
            `SELECT payout.id, payout.amount_usdt::TEXT AS amount_usdt, payout.status,
                    payout.simulated_tx_hash AS tx_hash, payout.created_at, payout.completed_at, contest.title
             FROM demo_contest_test_payouts payout
             JOIN demo_dashboard_contests contest ON contest.id = payout.contest_id
             WHERE payout.user_id = $1 ORDER BY payout.created_at DESC LIMIT 10`,
            [userId]
        );
        return {
            environment: "mock",
            network: NETWORK,
            asset: ASSET,
            availableBalanceUsdt: balance,
            depositAddress: address.rows[0] || null,
            deposits: deposits.rows,
            withdrawals: withdrawals.rows,
            demoPayouts: demoPayouts.rows,
        };
    });
}

module.exports = {
    ensureMockDepositAddress,
    getPaymentSummary,
    processMockWebhook,
    simulateMockDeposit,
    simulateMockWithdrawal,
};
