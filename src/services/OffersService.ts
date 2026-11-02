import type { CampaignData, Offer } from "../types";
import { PROMO_CODE_QUERY_KEYS } from "../config/constants";
import { SessionManager } from "./SessionManager";

export class OffersService {
  private readonly sessionManager: SessionManager;

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
  }

  public getAvailableOffers(): Offer[] {
    const campaigns = this.sessionManager.loadOffers();
    return this.deduplicateOffers(campaigns.map((c) => this.mapToOffer(c)));
  }

  private mapToOffer(data: CampaignData): Offer {
    const redirectUrl = this.parseUrl(data.redirectUrl);

    return {
      id: data.id,
      service: redirectUrl
        ? redirectUrl.hostname.replace(/^www\./, "")
        : "Unknown Service",
      title: data.title || "No Title",
      description: data.conditions || "",
      imageUrl: data.logo,
      serviceUrl: data.redirectUrl,
      promoCode: redirectUrl ? this.extractPromoCode(redirectUrl) : undefined,
      fields: data.fields ?? [],
    };
  }

  private parseUrl(value?: string): URL | null {
    if (!value) return null;
    try {
      return new URL(value);
    } catch {
      return null;
    }
  }

  private extractPromoCode(url: URL): string | undefined {
    const params = new Map(
      [...url.searchParams].map(([key, value]) => [key.toLowerCase(), value]),
    );

    for (const key of PROMO_CODE_QUERY_KEYS) {
      const value = params.get(key);
      if (value) return value;
    }

    return undefined;
  }

  private deduplicateOffers(offers: Offer[]): Offer[] {
    const seen = new Set<number>();
    return offers.filter((offer) => {
      if (seen.has(offer.id)) {
        return false;
      }
      seen.add(offer.id);
      return true;
    });
  }

  public getOffersByService(serviceName: string): Offer[] {
    const query = serviceName.toLowerCase();

    return this.getAvailableOffers()
      .filter(
        (offer) =>
          offer.service.toLowerCase().includes(query) ||
          offer.title.toLowerCase().includes(query),
      )
      .sort((a, b) => Number(Boolean(b.promoCode)) - Number(Boolean(a.promoCode)));
  }

  public getOfferById(offerId: number): Offer | null {
    return this.getAvailableOffers().find((offer) => offer.id === offerId) || null;
  }
}
