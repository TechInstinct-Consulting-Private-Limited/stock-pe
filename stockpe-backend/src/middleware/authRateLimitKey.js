const { ipKeyGenerator } = require("express-rate-limit");

const MOBILE_PATTERN = /^[6-9]\d{9}$/;

function mobileOrIpKey(req) {
    const mobile = req.body?.mobile;
    return typeof mobile === "string" && MOBILE_PATTERN.test(mobile)
        ? `mobile:${mobile}`
        : `ip:${ipKeyGenerator(req.ip)}`;
}

module.exports = { mobileOrIpKey };
