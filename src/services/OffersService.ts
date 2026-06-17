import type { CampaignData, Offer } from "../types";
import { SessionManager } from "./SessionManager";

export class OffersService {
  private readonly sessionManager: SessionManager;

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
  }

  public async getAvailableOffers(): Promise<Offer[]> {
    const campaigns = await this.sessionManager.loadOffers();
    return this.deduplicateOffers(campaigns.map((c) => this.mapToOffer(c)));
  }

  private mapToOffer(data: CampaignData): Offer {
    const id = typeof data.id === "string" ? parseInt(data.id, 10) : data.id;
    const offerSiteId = data.site?.id != null ? String(data.site.id) : "";

    return {
      id,
      service: data.site?.title || data.site?.domain || "Unknown Service",
      title: data.texts?.sale || data.texts?.short || "No Title",
      description: data.texts?.conditions || data.agreement || "",
      value: data.texts?.motivationAmount,
      imageUrl: data.images?.logotypeExchange || data.images?.logoCircle,
      offerSiteId,
      serviceUrl: data.advertiserSiteUrl,
    };
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

  public async getOffersByService(serviceName: string): Promise<Offer[]> {
    const allOffers = await this.getAvailableOffers();
    const query = serviceName.toLowerCase();

    return allOffers.filter((offer) =>
      offer.service.toLowerCase().includes(query),
    );
  }

  public async getOfferById(offerId: number): Promise<Offer | null> {
    const allOffers = await this.getAvailableOffers();
    return allOffers.find((offer) => offer.id === offerId) || null;
  }
}
