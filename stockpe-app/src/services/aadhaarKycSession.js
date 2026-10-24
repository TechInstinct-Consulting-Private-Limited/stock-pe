let pendingAadhaarNumber = "";

function normaliseAadhaarNumber(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 12);
}

// Keep the number only while this app session is active. It is intentionally not
// added to route parameters, AsyncStorage, logs, or the OTP screen UI.
export function setPendingAadhaarNumber(value) {
    const aadhaarNumber = normaliseAadhaarNumber(value);
    pendingAadhaarNumber = aadhaarNumber.length === 12 ? aadhaarNumber : "";
}

export function getPendingAadhaarNumber() {
    return pendingAadhaarNumber;
}

export function clearPendingAadhaarNumber() {
    pendingAadhaarNumber = "";
}
