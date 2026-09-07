const MockAadhaarKycProvider = require("./providers/mock.provider");

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
        default:
            throw new Error(`Unsupported Aadhaar KYC provider: ${providerName}`);
    }
}

module.exports = {
    createAadhaarKycProvider,
};
