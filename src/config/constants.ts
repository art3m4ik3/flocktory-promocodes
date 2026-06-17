import type { Consent, CustomerAction } from "../types";

export const FLOCKTORY_URLS = {
  LOGIN: "https://share.flocktory.com/exchange/login",
  INTERCHANGE_BASE: "https://flocktory.com/interchange",
} as const;

export function buildOffersListUrl(
  uuid: string,
  jwtToken: string,
  siteId: string,
  email: string,
): string {
  const params = new URLSearchParams({
    jwtToken,
    siteId,
    email,
  });
  return `${FLOCKTORY_URLS.INTERCHANGE_BASE}/${uuid}/api/offers/list?${params.toString()}`;
}

export function buildAcceptOfferUrl(uuid: string): string {
  return `${FLOCKTORY_URLS.INTERCHANGE_BASE}/${uuid}/api/offers/accept`;
}

export const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
} as const;

export const DEFAULT_TIMEOUT = 30000;

export const DEFAULT_PROMO_REQUEST_DELAY = 1000;

export const DEFAULT_CONSENTS: Consent[] = [
  { type: "consent_host_ad", value: "consent_host_ad_ru_RU_20250828.pdf" },
  { type: "consent_host_pd", value: "consent_host_pd_ru_RU_20250828.pdf" },
  {
    type: "consent_partner_ad",
    value: "consent_partner_ad_ru_RU_20250828.docx",
  },
  {
    type: "consent_partner_pd",
    value: "consent_partner_pd_ru_RU_20250828.docx",
  },
  { type: "prefill_customer_data_accepted", value: "true" },
];

export const DEFAULT_CUSTOMER_ACTIONS: CustomerAction[] = [
  { key: "utm_campaign", value: "exchange" },
  { key: "utm_source", value: "podarok.com" },
  { key: "utm_term", value: "" },
  { key: "utm_content", value: "" },
  { key: "utm_medium", value: "referral" },
  { key: "light", value: "true" },
];

export const REGEX = {
  FLOCK_INITIAL_STATE:
    /window\.flockInitialState\s*=\s*({[\s\S]+?});\s*<\/script>/,
  INTERCHANGE_UUID: /\/interchange\/([a-f0-9-]+)/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export function isValidEmail(email: string): boolean {
  return REGEX.EMAIL.test(email);
}

function randomString(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

export function generateRandomEmail(): string {
  const local = randomString(12 + Math.floor(Math.random() * 8));
  const domain = randomString(6 + Math.floor(Math.random() * 6));
  return `${local}@${domain}.com`;
}
