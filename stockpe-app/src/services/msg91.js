/**
 * MSG91 SendOTP REST API client and configuration.
 *
 * Uses direct HTTP requests to MSG91 SendOTP Widget API without opening any external SDK modal/UI:
 *   - sendOtp:   https://api.msg91.com/api/v5/widget/sendOtp
 *   - verifyOtp: https://api.msg91.com/api/v5/widget/verifyOtp
 *   - retryOtp:  https://api.msg91.com/api/v5/widget/retryOtp
 */

export const MSG91_WIDGET_ID = process.env.EXPO_PUBLIC_MSG91_WIDGET_ID ?? "366b6564656a323734333537";

export const MSG91_TOKEN_AUTH = process.env.EXPO_PUBLIC_MSG91_TOKEN_AUTH ?? "587477TIEvgOCzMA6aec04cbP1";

const MSG91_API_BASE = "https://api.msg91.com/api/v5/widget";

export function isMsg91Configured() {
    return Boolean(MSG91_WIDGET_ID) && Boolean(MSG91_TOKEN_AUTH);
}

export const Msg91WidgetClient = {
    async initializeWidget(_widgetId, _tokenAuth) {
        // No-op for direct REST API, kept for interface compatibility
        return true;
    },

    async sendOTP({ identifier }) {
        const response = await fetch(`${MSG91_API_BASE}/sendOtp`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                widgetId: MSG91_WIDGET_ID,
                tokenAuth: MSG91_TOKEN_AUTH,
                identifier: String(identifier),
            }),
        });

        const data = await response.json();
        return data;
    },

    async verifyOTP({ reqId, otp }) {
        const response = await fetch(`${MSG91_API_BASE}/verifyOtp`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                widgetId: MSG91_WIDGET_ID,
                tokenAuth: MSG91_TOKEN_AUTH,
                reqId: String(reqId),
                otp: String(otp),
            }),
        });

        const data = await response.json();
        return data;
    },

    async retryOTP({ reqId, retryChannel = 11 }) {
        const response = await fetch(`${MSG91_API_BASE}/retryOtp`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                widgetId: MSG91_WIDGET_ID,
                tokenAuth: MSG91_TOKEN_AUTH,
                reqId: String(reqId),
                retryChannel: Number(retryChannel),
            }),
        });

        const data = await response.json();
        return data;
    },
};
