const MSG91_VERIFY_ACCESS_TOKEN_URL = "https://control.msg91.com/api/v5/widget/verifyAccessToken";
const DEFAULT_TIMEOUT_MS = 10_000;

function operationalError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function normalizeIndianMobile(value) {
    return String(value || "").replace(/\D/g, "").slice(-10);
}

function readConfiguration(env) {
    const authKey = String(env.MSG91_AUTH_KEY || env.MSG91_AUTHKEY || env.MSG91_TOKEN_AUTH || "").trim();
    if (!authKey) {
        throw operationalError(503, "Mobile verification is not configured. Please try again later.");
    }

    const timeoutMs = Number(env.MSG91_VERIFY_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
    return { authKey, timeoutMs };
}

async function readJson(response) {
    const text = await response.text();
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch (_error) {
        return {};
    }
}

class Msg91AccessTokenService {
    constructor({ env = process.env, fetchImpl = global.fetch } = {}) {
        if (typeof fetchImpl !== "function") {
            throw new Error("A fetch implementation is required for MSG91 access-token verification");
        }

        this.config = readConfiguration(env);
        this.fetch = fetchImpl;
    }

    async verify({ accessToken, expectedMobile }) {
        if (typeof accessToken !== "string" || !accessToken.trim()) {
            throw operationalError(401, "Mobile verification could not be confirmed. Please request a new OTP.");
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

        let response;
        try {
            response = await this.fetch(MSG91_VERIFY_ACCESS_TOKEN_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    authkey: this.config.authKey,
                    "access-token": accessToken,
                }),
                signal: controller.signal,
            });
        } catch (error) {
            if (error?.name === "AbortError") {
                throw operationalError(503, "Mobile verification timed out. Please try again.");
            }
            throw operationalError(503, "Mobile verification service is unavailable. Please try again later.");
        } finally {
            clearTimeout(timeout);
        }

        const body = await readJson(response);
        const verifiedMobile = normalizeIndianMobile(body?.message);

        if (!response.ok || body?.type !== "success" || !verifiedMobile) {
            throw operationalError(401, "Mobile verification could not be confirmed. Please request a new OTP.");
        }

        if (verifiedMobile !== normalizeIndianMobile(expectedMobile)) {
            throw operationalError(401, "The verified mobile number does not match this account.");
        }

        return { verifiedMobile };
    }
}

module.exports = {
    MSG91_VERIFY_ACCESS_TOKEN_URL,
    Msg91AccessTokenService,
    normalizeIndianMobile,
};
