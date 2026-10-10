class SandboxCoInAadhaarKycProvider {
    constructor({ env = process.env } = {}) {
        this.name = "sandbox_coin";
        this.apiKey = env.SANDBOX_API_KEY ;
        this.apiSecret = env.SANDBOX_API_SECRET ;
        this.baseUrl = env.SANDBOX_BASE_URL ;
        
        this.cachedToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        // Return cached token if valid for at least another 5 minutes
        if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 5 * 60 * 1000) {
            return this.cachedToken;
        }

        const res = await fetch(`${this.baseUrl}/authenticate`, {
            method: "POST",
            headers: {
                "x-api-key": this.apiKey,
                "x-api-secret": this.apiSecret,
                "x-api-version": "1.0",
            },
        });

        const data = await res.json();
        if (!res.ok || data.code !== 200) {
            throw new Error(`Sandbox.co.in authentication failed: ${data.message || JSON.stringify(data)}`);
        }

        const token = data.data?.access_token || data.access_token;
        this.cachedToken = token;
        // Valid for 24 hours
        this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
        return token;
    }

    async requestOtp({ aadhaarNumber }) {
        const token = await this.getAccessToken();

        const res = await fetch(`${this.baseUrl}/kyc/aadhaar/okyc/otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token, // Note: no "Bearer " prefix
                "x-api-key": this.apiKey,
                "x-api-version": "1.0.0",
            },
            body: JSON.stringify({
                "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
                "aadhaar_number": String(aadhaarNumber).trim(),
                "consent": "y",
                "reason": "For KYC verification",
            }),
        });

        const body = await res.json();
        console.log(`[Sandbox.co.in OTP Response] Status: ${res.status}`, JSON.stringify(body));

        if (!res.ok || body.code !== 200 || !body.data?.reference_id) {
            const errorMsg =
                body.data?.message ||
                body.message ||
                "Failed to generate Aadhaar OTP";
            return {
                accepted: false,
                reason: errorMsg,
            };
        }

        return {
            accepted: true,
            transactionId: String(body.data.reference_id),
            expiresInSeconds: 10 * 60, // 10 minutes
        };
    }

    async verifyOtp({ transactionId, otp }) {
        const token = await this.getAccessToken();

        const res = await fetch(`${this.baseUrl}/kyc/aadhaar/okyc/otp/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
                "x-api-key": this.apiKey,
                "x-api-version": "1.0.0",
            },
            body: JSON.stringify({
                "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
                "reference_id": String(transactionId),
                "otp": String(otp).trim(),
            }),
        });

        const body = await res.json();
        console.log(`[Sandbox.co.in OTP Verify Response] Status: ${res.status}`, JSON.stringify(body));

        if (!res.ok || body.code !== 200 || !body.data || body.data.status !== "VALID") {
            return {
                verified: false,
                reason: body.data?.message || body.message || "Invalid OTP",
            };
        }

        const data = body.data;
        return {
            verified: true,
            kycData: {
                fullName: data.name,
                dateOfBirth: data.date_of_birth,
                gender: data.gender,
                careOf: data.care_of,
                fullAddress: data.full_address,
                address: data.address,
                photo: data.photo,
                isMock: false,
            },
        };
    }
}

module.exports = SandboxCoInAadhaarKycProvider;
