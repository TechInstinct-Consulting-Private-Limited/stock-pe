const ConsoleOtpProvider = require("./providers/console.provider");
const ExotelOtpProvider = require("./providers/exotel.provider");

function createOtpDeliveryProvider({
    providerName = process.env.OTP_PROVIDER || "exotel",
    env = process.env,
    fetchImpl = global.fetch,
} = {}) {
    switch (providerName.toLowerCase()) {
        case "exotel":
            return new ExotelOtpProvider({ env, fetchImpl });
        case "console":
            return new ConsoleOtpProvider({ env });
        default:
            throw new Error(`Unsupported OTP provider: ${providerName}`);
    }
}

module.exports = {
    createOtpDeliveryProvider,
};
