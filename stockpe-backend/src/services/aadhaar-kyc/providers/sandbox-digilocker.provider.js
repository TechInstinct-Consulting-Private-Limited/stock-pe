class SandboxDigiLockerProvider {
    constructor({ env = process.env, fetchImpl = global.fetch } = {}) {
        this.name = "sandbox_digilocker";
        this.apiKey = env.SANDBOX_API_KEY;
        this.apiSecret = env.SANDBOX_API_SECRET;
        this.baseUrl = String(env.SANDBOX_BASE_URL || "").replace(/\/$/, "");
        this.requestorName = String(env.DIGILOCKER_REQUESTOR_NAME || "MarketPe").replace(/[^A-Za-z0-9_ ]/g, " ").trim() || "MarketPe";
        this.fetch = fetchImpl;
        this.cachedToken = null;
        this.tokenExpiry = 0;
    }

    validateConfiguration() {
        if (!this.apiKey || !this.apiSecret || !this.baseUrl || typeof this.fetch !== "function") {
            throw new Error("Sandbox DigiLocker provider is not configured");
        }
    }

    async request(url, options) {
        const response = await this.fetch(url, options);
        const text = await response.text();
        let body = null;
        try { body = text ? JSON.parse(text) : null; } catch { body = null; }
        return { response, body };
    }

    static responseMessage(body, fallback) {
        return body?.data?.message || body?.message || fallback;
    }

    async getAccessToken() {
        this.validateConfiguration();
        if (this.cachedToken && Date.now() < this.tokenExpiry) return this.cachedToken;

        const { response, body } = await this.request(`${this.baseUrl}/authenticate`, {
            method: "POST",
            headers: {
                "x-api-key": this.apiKey,
                "x-api-secret": this.apiSecret,
                "x-api-version": "1.0",
            },
        });
        const token = body?.data?.access_token || body?.access_token;
        if (!response.ok || body?.code !== 200 || !token) throw new Error("Sandbox DigiLocker authentication failed");

        const expiresInSeconds = Number(body?.data?.expires_in || body?.expires_in);
        this.cachedToken = token;
        this.tokenExpiry = Date.now() + (Number.isFinite(expiresInSeconds) && expiresInSeconds > 300 ? (expiresInSeconds - 300) * 1000 : 50 * 60 * 1000);
        return token;
    }

    async authorizedRequest(path, options = {}) {
        const token = await this.getAccessToken();
        return this.request(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
                "x-api-key": this.apiKey,
                "x-api-version": "1.0.0",
                ...options.headers,
            },
        });
    }

    async initiateSession({ redirectUrl }) {
        const { response, body } = await this.authorizedRequest("/kyc/digilocker/sessions/init", {
            method: "POST",
            body: JSON.stringify({
                "@entity": "in.co.sandbox.kyc.digilocker.session.request",
                flow: "signup",
                redirect_url: redirectUrl,
                doc_types: ["aadhaar"],
                purpose: "Know Your Customer",
                requestor_name: this.requestorName,
                options: { verification_method: ["aadhaar"], pinless: true, usernameless: true },
                consent_expiry: Date.now() + (2 * 60 * 60 * 1000),
            }),
        });
        const data = body?.data;
        if (!response.ok || body?.code !== 200 || !data?.session_id || !data?.authorization_url) {
            return { accepted: false, reason: SandboxDigiLockerProvider.responseMessage(body, "Could not start DigiLocker verification") };
        }
        return { accepted: true, sessionId: String(data.session_id), authorizationUrl: String(data.authorization_url), expiresInSeconds: 2 * 60 * 60 };
    }

    async getSessionStatus({ sessionId }) {
        const { response, body } = await this.authorizedRequest(`/kyc/digilocker/sessions/${encodeURIComponent(sessionId)}/status`, { method: "GET" });
        if (!response.ok || body?.code !== 200 || !body?.data?.status) {
            return { accepted: false, reason: SandboxDigiLockerProvider.responseMessage(body, "Could not check DigiLocker verification") };
        }
        return { accepted: true, status: String(body.data.status), documentsConsented: Array.isArray(body.data.documents_consented) ? body.data.documents_consented : [] };
    }

    async getUserProfile({ sessionId }) {
        const { response, body } = await this.authorizedRequest(`/kyc/digilocker/sessions/${encodeURIComponent(sessionId)}/user/profile`, { method: "GET" });
        const data = body?.data;
        if (!response.ok || body?.code !== 200 || !data?.name) {
            return { accepted: false, reason: SandboxDigiLockerProvider.responseMessage(body, "Could not retrieve DigiLocker profile") };
        }
        return { accepted: true, kycData: { fullName: data.name, dateOfBirth: data.date_of_birth || null, isMock: false } };
    }
}

module.exports = SandboxDigiLockerProvider;
