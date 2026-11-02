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

export interface Offer {
  id: number;
  service: string;
  title: string;
  description: string;
  imageUrl?: string;
  serviceUrl?: string;
  promoCode?: string;
  fields: string[];
}

export interface PromoCode {
  code: string;
  service: string;
  serviceUrl: string;
  description?: string;
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
