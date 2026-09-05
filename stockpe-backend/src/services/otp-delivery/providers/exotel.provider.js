const DEFAULT_SUBDOMAIN = "api.in.exotel.com";
const DEFAULT_TIMEOUT_MS = 10_000;
const ALLOWED_SUBDOMAINS = new Set([
    "api.exotel.com",
    "api.in.exotel.com",
]);

const REQUIRED_SETTINGS = [
    "EXOTEL_API_KEY",
    "EXOTEL_API_TOKEN",
    "EXOTEL_ACCOUNT_SID",
    "EXOTEL_SMS_FROM",
    "EXOTEL_DLT_ENTITY_ID",
    "EXOTEL_DLT_TEMPLATE_ID",
    "EXOTEL_SMS_TEMPLATE",
];

function readConfiguration(env) {
    const missingSettings = REQUIRED_SETTINGS.filter(
        (setting) => !env[setting]?.trim()
    );

    if (missingSettings.length > 0) {
        throw new Error(
            `Missing Exotel settings: ${missingSettings.join(", ")}`
        );
    }

    const subdomain = env.EXOTEL_SUBDOMAIN || DEFAULT_SUBDOMAIN;
    if (!ALLOWED_SUBDOMAINS.has(subdomain)) {
        throw new Error(
            `EXOTEL_SUBDOMAIN must be one of: ${[...ALLOWED_SUBDOMAINS].join(", ")}`
        );
    }

    if (!env.EXOTEL_SMS_TEMPLATE.includes("{{otp}}")) {
        throw new Error("EXOTEL_SMS_TEMPLATE must contain {{otp}}");
    }

    return {
        apiKey: env.EXOTEL_API_KEY,
        apiToken: env.EXOTEL_API_TOKEN,
        accountSid: env.EXOTEL_ACCOUNT_SID,
        from: env.EXOTEL_SMS_FROM,
        dltEntityId: env.EXOTEL_DLT_ENTITY_ID,
        dltTemplateId: env.EXOTEL_DLT_TEMPLATE_ID,
        smsTemplate: env.EXOTEL_SMS_TEMPLATE,
        subdomain,
        timeoutMs: Number(env.EXOTEL_REQUEST_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    };
}

function formatIndianMobile(mobile) {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        throw new Error("Exotel OTP delivery requires a valid Indian mobile number");
    }

    return `+91${mobile}`;
}

function parseResponseBody(body) {
    if (!body) {
        return {};
    }

    try {
        return JSON.parse(body);
    } catch (_error) {
        return { rawBody: body };
    }
}

class ExotelOtpProvider {
    constructor({ env = process.env, fetchImpl = global.fetch } = {}) {
        if (typeof fetchImpl !== "function") {
            throw new Error("A fetch implementation is required for Exotel");
        }

        this.config = readConfiguration(env);
        this.fetch = fetchImpl;
    }

    async sendOtp({ mobile, otp }) {
        const body = this.config.smsTemplate.replaceAll("{{otp}}", otp);
        const params = new URLSearchParams({
            From: this.config.from,
            To: formatIndianMobile(mobile),
            Body: body,
            DltEntityId: this.config.dltEntityId,
            DltTemplateId: this.config.dltTemplateId,
            SmsType: "transactional",
            Priority: "high",
        });
        const endpoint =
            `https://${this.config.subdomain}/v1/Accounts/` +
            `${encodeURIComponent(this.config.accountSid)}/Sms/send`;
        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            this.config.timeoutMs
        );

        let response;
        try {
            response = await this.fetch(endpoint, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            `${this.config.apiKey}:${this.config.apiToken}`
                        ).toString("base64"),
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params,
                signal: controller.signal,
            });
        } catch (error) {
            const deliveryError = new Error(
                error.name === "AbortError"
                    ? "OTP delivery provider timed out"
                    : "OTP delivery provider could not be reached"
            );
            deliveryError.statusCode = 502;
            throw deliveryError;
        } finally {
            clearTimeout(timeout);
        }

        const responseBody = parseResponseBody(await response.text());
        if (!response.ok) {
            const providerMessage = responseBody.RestException?.Message;
            const deliveryError = new Error(
                providerMessage || "OTP delivery provider rejected the message"
            );
            deliveryError.statusCode = 502;
            throw deliveryError;
        }

        const message = responseBody.SMSMessage;
        if (!message?.Sid) {
            const deliveryError = new Error(
                "OTP delivery provider returned an invalid response"
            );
            deliveryError.statusCode = 502;
            throw deliveryError;
        }

        return {
            messageId: message.Sid,
            status: message.Status,
        };
    }
}

module.exports = ExotelOtpProvider;
