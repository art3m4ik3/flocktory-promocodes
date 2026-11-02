export const FLOCKTORY_URLS = {
  LOGIN: "https://share.flocktory.com/exchange/login",
} as const;

export const LOVIPODARKI_URLS = {
  ORIGIN: "https://lovipodarki.ru",
  API: "https://lovipodarki.ru/api",
} as const;

export const LOVIPODARKI_DEFAULT_PARTNER_ID = "2886886";

export const LOVIPODARKI_PAGE_SIZE = 100;

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

export const PROMO_CODE_QUERY_KEYS = [
  "promocode",
  "promo_code",
  "promo",
  "coupon",
  "code",
] as const;

export const REGEX = {
  LANDING_CONFIG: /^\s*const CONFIG = (\{"campaigns"[^\n]*\});\s*$/m,
} as const;
