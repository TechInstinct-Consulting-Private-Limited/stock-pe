class SandboxCoInAadhaarKycProvider {
    constructor({ env = process.env, fetchImpl = global.fetch } = {}) {
        this.name = "sandbox_coin";
        this.apiKey = env.SANDBOX_API_KEY;
        this.apiSecret = env.SANDBOX_API_SECRET;
        this.baseUrl = String(env.SANDBOX_BASE_URL || "").replace(/\/$/, "");
        this.fetch = fetchImpl;
        this.cachedToken = null;
        this.tokenExpiry = 0;
    }

    validateConfiguration() {
        if (!this.apiKey || !this.apiSecret || !this.baseUrl || typeof this.fetch !== "function") {
            throw new Error("Sandbox Aadhaar KYC provider is not configured");
        }
    }

    async request(url, options) {
        const response = await this.fetch(url, options);
        const text = await response.text();
        let body = null;

        try {
            body = text ? JSON.parse(text) : null;
        } catch {
            body = null;
        }

        return { response, body };
    }

    static responseMessage(body, fallback) {
        return body?.data?.message || body?.message || fallback;
    }

    async getAccessToken() {
        this.validateConfiguration();

        if (this.cachedToken && Date.now() < this.tokenExpiry) {
            return this.cachedToken;
        }

        const { response, body } = await this.request(`${this.baseUrl}/authenticate`, {
            method: "POST",
            headers: {
                "x-api-key": this.apiKey,
                "x-api-secret": this.apiSecret,
                "x-api-version": "1.0",
            },
        });

        const token = body?.data?.access_token || body?.access_token;
        if (!response.ok || body?.code !== 200 || !token) {
            throw new Error("Sandbox.co.in authentication failed");
        }

        const expiresInSeconds = Number(body?.data?.expires_in || body?.expires_in);
        const safeTtlMs = Number.isFinite(expiresInSeconds) && expiresInSeconds > 300
            ? (expiresInSeconds - 300) * 1000
            : 50 * 60 * 1000;

        this.cachedToken = token;
        this.tokenExpiry = Date.now() + safeTtlMs;
        return token;
    }

    async requestOtp({ aadhaarNumber }) {
        const token = await this.getAccessToken();
        const { response, body } = await this.request(`${this.baseUrl}/kyc/aadhaar/okyc/otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
                "x-api-key": this.apiKey,
                "x-api-version": "1.0.0",
            },
            body: JSON.stringify({
                "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
                aadhaar_number: String(aadhaarNumber).trim(),
                consent: "Y",
                reason: "For KYC verification",
            }),
        });

        const referenceId = body?.data?.reference_id;
        if (!response.ok || body?.code !== 200 || !referenceId) {
            return {
                accepted: false,
                reason: SandboxCoInAadhaarKycProvider.responseMessage(body, "Failed to generate Aadhaar OTP"),
            };
        }

        return {
            accepted: true,
            transactionId: String(referenceId),
            expiresInSeconds: 10 * 60,
        };
    }

    async verifyOtp({ transactionId, otp }) {
        const token = await this.getAccessToken();
        const { response, body } = await this.request(`${this.baseUrl}/kyc/aadhaar/okyc/otp/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
                "x-api-key": this.apiKey,
                "x-api-version": "1.0.0",
            },
            body: JSON.stringify({
                "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
                reference_id: String(transactionId),
                otp: String(otp).trim(),
            }),
        });

        const data = body?.data;
        if (!response.ok || body?.code !== 200 || data?.status !== "VALID") {
            return {
                verified: false,
                reason: SandboxCoInAadhaarKycProvider.responseMessage(body, "Invalid Aadhaar OTP"),
            };
        }

        return {
            verified: true,
            kycData: {
                fullName: data.name || null,
                dateOfBirth: data.date_of_birth || null,
                isMock: false,
            },
        };
    }
}

module.exports = SandboxCoInAadhaarKycProvider;
