export const COOKIE_CONSENT_KEY = "gogame_cookie_consent";

export type CookieConsentStatus = "accepted" | "rejected";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function isCookieConsentStatus(
  value: string | null | undefined,
): value is CookieConsentStatus {
  return value === "accepted" || value === "rejected";
}

export function getCookieConsentCookieString(status: CookieConsentStatus) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  return `${COOKIE_CONSENT_KEY}=${status}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax${secure}`;
}
