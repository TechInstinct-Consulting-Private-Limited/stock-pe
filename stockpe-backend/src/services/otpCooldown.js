const OTP_RESEND_COOLDOWN_SECONDS = 60;

function remainingOtpCooldownSeconds(createdAt, now = Date.now()) {
    const elapsedMilliseconds = now - new Date(createdAt).getTime();
    const remainingMilliseconds =
        OTP_RESEND_COOLDOWN_SECONDS * 1000 - elapsedMilliseconds;

    return Math.min(
        OTP_RESEND_COOLDOWN_SECONDS,
        Math.max(1, Math.ceil(remainingMilliseconds / 1000))
    );
}

module.exports = {
    OTP_RESEND_COOLDOWN_SECONDS,
    remainingOtpCooldownSeconds,
};
