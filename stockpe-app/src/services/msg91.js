/**
 * MSG91 SendOTP configuration.
 *
 * Get these two values from your MSG91 panel:
 *   - Widget ID  (widgetId)
 *   - Auth Token (tokenAuth)
 *
 * IMPORTANT: enable "Mobile Integration" on the widget in the MSG91 panel,
 * otherwise the React Native SDK won't work.
 *
 * You can hardcode them below for a quick test, or set them as public env vars
 * (EXPO_PUBLIC_*) so they aren't committed. For a throwaway test, hardcoding is
 * fine since these identify the widget, not a server secret.
 */

export const MSG91_WIDGET_ID = process.env.EXPO_PUBLIC_MSG91_WIDGET_ID ?? "";

export const MSG91_TOKEN_AUTH = process.env.EXPO_PUBLIC_MSG91_TOKEN_AUTH ?? "";

export function isMsg91Configured() {
    return Boolean(MSG91_WIDGET_ID) && Boolean(MSG91_TOKEN_AUTH);
}
