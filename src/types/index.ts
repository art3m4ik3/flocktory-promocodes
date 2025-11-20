export interface CookieJar {
  "landing-id"?: string;
  "__flocktory-web_session2"?: string;
  "flocktory-uuid"?: string;
  [key: string]: string | undefined;
}

export interface FlockData {
  landingId: string;
  exchangeSessionId: string;
}

export interface SiteInfo {
  id?: number;
  title?: string;
  url?: string;
  imageUrl?: string;
  campaigns?: Campaign[];
  data?: SiteInfoData | unknown[];
}

export interface SiteInfoData {
  id?: string;
  title?: string;
  domain?: string;
  images?: Record<string, string>;
  [key: string]: unknown;
}

export interface Campaign {
  id: number;
  popupUrl: string;
  title: string;
  description: string;
  value?: string;
  imageUrl?: string;
  landingId?: string;
}

export interface UserInfo {
  data?: Record<string, unknown>;
  maskedData?: Record<string, unknown>;
  exchangeSessionId?: string;
  jwtToken?: string;
  landingId?: string;
}

export interface FlockInitialState {
  jwtToken?: string;
  exchangeSessionId?: string;
  landingId?: string;
  urlQueryParams?: {
    lid?: string;
  };
  siteInfo?: SiteInfo;
  userInfo?: UserInfo;
  app?: {
    sites?: SiteInfo[];
    urlToken?: string;
    jwtToken?: string;
    welcomePopupCountdownTime?: number;
  };
  offers?: Offer[] | { list?: unknown[] };
  welcomePopupList?: unknown[];
}

export interface AcceptCampaignPayload {
  "login-data": string;
  email: string;
  "campaign-id": string;
  "campaign-site-id": string;
  "site-id": string;
  consents: Consent[];
  actions: Action[];
  [key: string]: unknown;
}

export interface Consent {
  type: string;
  value: string;
}

export interface Action {
  key: string;
  value: string;
}

export interface AcceptCampaignResponse {
  url: string;
}

export interface CouponData {
  promocode?: string;
  coupon?: string;
  "expires-at"?: string;
  description?: string | null;
  "reward-value"?: string;
  "motivation-id"?: string;
  url?: string;
  [key: string]: unknown;
}

export interface PromoCode {
  code: string;
  service: string;
  serviceUrl: string;
  description?: string;
}

export interface Offer {
  id: number;
  service: string;
  title: string;
  description: string;
  value?: string;
  imageUrl?: string;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
  followRedirects?: boolean;
}

export interface HttpResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  data: T;
  cookies: string[];
  finalUrl?: string;
}
