const crypto = require("crypto");

class NowPaymentsService {
    constructor() {
        this.apiKey = process.env.NOWPAYMENTS_API_KEY;
        this.baseUrl = (process.env.NOWPAYMENTS_BASE_URL || "https://api-sandbox.nowpayments.io/v1").replace(/\/$/, "");
        this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || "";
        this.isSandbox = process.env.NOWPAYMENTS_ENV === "sandbox" || this.baseUrl.includes("sandbox");
    }

    async _request(method, endpoint, body = null) {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                "x-api-key": this.apiKey,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || `NOWPayments error: ${res.status}`);
        }
        return data;
    }

    /**
     * Create a direct deposit payment
     */
    async createPayment({ amount, currency = "usdttrc20", orderId }) {
        const payload = {
            price_amount: Number(amount),
            price_currency: "usd",
            pay_currency: currency.toLowerCase(),
            order_id: String(orderId),
            order_description: `Deposit Order ${orderId}`,
        };

        if (this.isSandbox) {
            payload.case = "success"; // Auto-simulation in sandbox mode
        }

        return this._request("POST", "/payment", payload);
    }

    /**
     * Retrieve live payment status by payment ID
     */
    async getPaymentStatus(paymentId) {
        return this._request("GET", `/payment/${paymentId}`);
    }

    /**
     * Verify NOWPayments IPN callback signature (HMAC-SHA512 with sorted keys & constant-time compare)
     */
    verifyIpnSignature(body, receivedSig) {
        if (!this.ipnSecret) {
            console.warn("[NOWPayments IPN] Warning: NOWPAYMENTS_IPN_SECRET not set. Skipping HMAC validation in sandbox.");
            return true;
        }

        if (!receivedSig) return false;

        const sortObj = (obj) =>
            Object.keys(obj).sort().reduce((result, key) => {
                result[key] = (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key]))
                    ? sortObj(obj[key])
                    : obj[key];
                return result;
            }, {});

        const sortedJson = JSON.stringify(sortObj(body));
        const expected = crypto.createHmac("sha512", this.ipnSecret).update(sortedJson).digest("hex");

        const expBuf = Buffer.from(expected, "utf8");
        const recBuf = Buffer.from(receivedSig, "utf8");
        return expBuf.length === recBuf.length && crypto.timingSafeEqual(expBuf, recBuf);
    }
}

module.exports = new NowPaymentsService();
