const {
    createUidaiSecureQrProvider,
} = require("../aadhaar-kyc/providers/uidai-secure-qr.provider");

function createAadhaarSecureQrProvider({ providerName = "uidai" } = {}) {
    if (providerName.toLowerCase() === "uidai") {
        return createUidaiSecureQrProvider();
    }

    throw new Error(`Unsupported Aadhaar Secure QR provider: ${providerName}`);
}

module.exports = { createAadhaarSecureQrProvider };
