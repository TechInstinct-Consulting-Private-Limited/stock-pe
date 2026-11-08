const MockAadhaarKycProvider = require("./providers/mock.provider");
const SandboxCoInAadhaarKycProvider = require("./providers/sandbox-coin.provider");
const SandboxDigiLockerProvider = require("./providers/sandbox-digilocker.provider");

function createAadhaarKycProvider({
    providerName = process.env.AADHAAR_KYC_PROVIDER,
    env = process.env,
} = {}) {
    if (!providerName) {
        throw new Error("AADHAAR_KYC_PROVIDER must be configured");
    }

    switch (providerName.toLowerCase()) {
        case "mock":
            return new MockAadhaarKycProvider({ env });
        case "sandbox_coin":
        case "sandbox":
            return new SandboxCoInAadhaarKycProvider({ env });
        case "sandbox_digilocker":
        case "digilocker":
            return new SandboxDigiLockerProvider({ env });
        default:
            throw new Error(`Unsupported Aadhaar KYC provider: ${providerName}`);
    }
}

module.exports = {
    createAadhaarKycProvider,
};
