export const FLOCKTORY_URLS = {
  LOGIN: "https://share.flocktory.com/exchange/login",
  INTERCHANGE_BASE: "https://flocktory.com/interchange",
  INTERCHANGE_POPUP: "https://flocktory.com/interchange",
  DONUMS: "https://flocktory.com/donums",
  ACCEPT_CAMPAIGN: "https://flocktory.com/interchange",
} as const;

export const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
} as const;

export const DEFAULT_TIMEOUT = 30000;

export const DEFAULT_EMAIL = "test@example.com";

export const DEFAULT_PROMO_REQUEST_DELAY = 1000;

export const CONSENT_TYPES = {
  HOST_AD: "consent_host_ad",
  HOST_PD: "consent_host_pd",
  PREFILL_ACCEPTED: "prefill_customer_data_accepted",
} as const;

export const ACTION_TYPES = {
  UTM_CAMPAIGN: "utm_campaign",
  UTM_SOURCE: "utm_source",
  UTM_TERM: "utm_term",
  UTM_CONTENT: "utm_content",
  UTM_MEDIUM: "utm_medium",
  LIGHT: "light",
} as const;

export const REGEX = {
  FLOCK_DATA: /window\.flockData\s*=\s*({[^}]+})/,
  FLOCK_INITIAL_STATE:
    /window\.flockInitialState\s*=\s*({[\s\S]+});[\s\n]*<\/script>/,
  JWT_TOKEN: /"jwtToken"\s*:\s*"([^"]+)"/,
  LANDING_ID: /"landingId"\s*:\s*"([^"]+)"/,
  EXCHANGE_SESSION_ID: /"exchangeSessionId"\s*:\s*"([^"]+)"/,
  PROMOCODE_URL: /url\s*=\s*'([^']+)'/,
  PROMOCODE_PARAM: /[?&]promocode=([^&]+)/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export function isValidEmail(email: string): boolean {
  return REGEX.EMAIL.test(email);
}
