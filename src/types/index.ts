export interface CookieJar {
  "landing-id"?: string;
  "__flocktory-web_session2"?: string;
  "flocktory-uuid"?: string;
  [key: string]: string | undefined;
}

export interface SiteInfoData {
  id?: string | number;
  title?: string;
  domain?: string;
  images?: Record<string, string>;
  [key: string]: unknown;
}

export interface SiteInfo {
  id?: number;
  title?: string;
  data?: SiteInfoData;
}

export interface FlockInitialState {
  siteInfo?: SiteInfo;
  app?: {
    urlToken?: string;
    jwtToken?: string;
    urlQueryParams?: {
      lid?: string;
    };
  };
}

export interface CampaignSite {
  id?: string | number;
  title?: string;
  domain?: string;
  category?: string;
}

export interface CampaignTexts {
  sale?: string;
  short?: string;
  conditions?: string;
  motivationAmount?: string;
  motivationType?: string;
}

export interface CampaignImages {
  logotypeExchange?: string;
  logoCircle?: string;
  backgroundImage?: string;
  [key: string]: string | undefined;
}

export interface CampaignData {
  id: number | string;
  site?: CampaignSite;
  texts?: CampaignTexts;
  images?: CampaignImages;
  agreement?: string;
  advertiserSiteUrl?: string;
}

export interface OffersListResponse {
  testVariation?: string;
  campaigns?: CampaignData[];
}

export interface Consent {
  type: string;
  value: string;
}

export interface CustomerAction {
  key: string;
  value: string;
}

export interface AcceptOfferPayload {
  jwtToken: string;
  email: string;
  offerId: string;
  offerSiteId: string;
  siteId: string;
  consents: Consent[];
  customerActions: CustomerAction[];
  [key: string]: unknown;
}

export interface AcceptOfferResponse {
  url?: string;
}

export interface CouponData {
  coupon?: string;
  promocode?: string;
  "expires-at"?: string;
  description?: string | null;
  "reward-value"?: string;
  "motivation-id"?: string;
  [key: string]: unknown;
}

export interface Offer {
  id: number;
  service: string;
  title: string;
  description: string;
  value?: string;
  imageUrl?: string;
  offerSiteId: string;
  serviceUrl?: string;
}

export interface PromoCode {
  code: string;
  service: string;
  serviceUrl: string;
  description?: string;
  rewardValue?: string;
  expiresAt?: string;
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
