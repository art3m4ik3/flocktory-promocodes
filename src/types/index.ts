export interface CookieJar {
  [key: string]: string | undefined;
}

export interface CampaignData {
  id: number;
  title?: string;
  logo?: string;
  siteId?: number;
  conditions?: string;
  redirectUrl?: string;
  fields?: string[];
  motivationBlock?: {
    title?: string;
    description?: string;
  };
}

export interface LandingConfig {
  campaigns?: CampaignData[];
}

export interface BaseOffer {
  id: number | string;
  service: string;
  title: string;
  description: string;
  imageUrl?: string;
  serviceUrl?: string;
  expiresAt?: string;
}

export interface Offer extends BaseOffer {
  id: number;
  promoCode?: string;
  fields: string[];
}

export interface PromoCode {
  code: string;
  service: string;
  serviceUrl: string;
  description?: string;
  expiresAt?: string;
}

export interface PromoProvider {
  readonly name: string;
  initialize(): Promise<void>;
  getOffersWithPromoCodes(): Promise<BaseOffer[]>;
  getOffersByService(serviceName: string): Promise<BaseOffer[]>;
  getPromoCodesByService(serviceName: string, count?: number): Promise<PromoCode[]>;
}

export type LovipodarkiOfferType = "personal" | "promo_code" | "link";

export interface LovipodarkiApiOffer {
  id: string;
  project_name?: string;
  title?: string;
  description?: string;
  logo_url?: string;
  status?: string;
  type?: string;
  shop_url?: string;
  expires_at?: string;
}

export interface LovipodarkiApiResponse<T> {
  data?: T;
  error?: unknown;
}

export interface LovipodarkiOffersPage {
  items?: LovipodarkiApiOffer[];
  offset?: number;
  limit?: number;
  count?: number;
}

export interface LovipodarkiCodeResponse {
  code?: string;
  expires_at?: string;
}

export interface LovipodarkiOffer extends BaseOffer {
  id: string;
  codeType: LovipodarkiOfferType;
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
