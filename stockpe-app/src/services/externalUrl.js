export function requireSecureExternalUrl(value, label = "Link") {
    let url;

    try {
        url = new URL(String(value || ""));
    } catch (_error) {
        throw new Error(`${label} is unavailable. Please try again later.`);
    }

    if (url.protocol !== "https:") {
        throw new Error(`${label} must use a secure HTTPS connection.`);
    }

    return url.toString();
}
