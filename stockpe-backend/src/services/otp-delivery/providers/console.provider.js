class ConsoleOtpProvider {
    constructor({ env = process.env } = {}) {
        if (env.NODE_ENV === "production") {
            throw new Error("The console OTP provider cannot be used in production");
        }
    }

    async sendOtp({ mobile, otp, purpose }) {
        console.log(`[DEV OTP] ${purpose} OTP for ${mobile}: ${otp}`);
    }
}

module.exports = ConsoleOtpProvider;
