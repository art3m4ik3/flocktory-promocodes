import type { FlockInitialState, Offer } from "../types";
import { SessionManager } from "./SessionManager";

interface OfferData {
  id: number | string;
  texts?: {
    title?: string;
    "short-description"?: string;
    description?: string;
    value?: string;
    sale?: string;
    motivationAmount?: string;
  };
  site?: {
    title?: string;
  };
  images?: {
    image?: string;
    logo?: string;
    logotypeExchange?: string;
  };
  agreement?: string;
}

interface OffersObject {
  list?: unknown[];
}

export class OffersService {
  private readonly sessionManager: SessionManager;

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
  }

  public async getAvailableOffers(): Promise<Offer[]> {
    const initialState = await this.sessionManager.loadInterchangePage();

    return this.extractOffers(initialState);
  }

  private extractOffers(state: FlockInitialState): Offer[] {
    const offers: Offer[] = [];

    if (
      state.offers &&
      typeof state.offers === "object" &&
      !Array.isArray(state.offers)
    ) {
      const offersObj = state.offers as OffersObject;
      const offersList = offersObj?.list;

      if (Array.isArray(offersList)) {
        for (const offerData of offersList) {
          if (this.isValidOfferData(offerData)) {
            offers.push(this.mapToOffer(offerData));
          }
        }
      }
    }

    if (this.hasWelcomePopupList(state)) {
      for (const offerData of state.welcomePopupList) {
        if (this.isValidOfferData(offerData)) {
          offers.push(this.mapToOffer(offerData));
        }
      }
    }

    if (Array.isArray(state.offers)) {
      for (const offer of state.offers) {
        offers.push(offer);
      }
    }

    if (state.siteInfo?.campaigns) {
      for (const campaign of state.siteInfo.campaigns) {
        offers.push({
          id: campaign.id,
          service: state.siteInfo.title || "Unknown",
          title: campaign.title,
          description: campaign.description,
          value: campaign.value,
          imageUrl: campaign.imageUrl,
        });
      }
    }

    if (state.app?.sites) {
      for (const site of state.app.sites) {
        if (site.campaigns) {
          for (const campaign of site.campaigns) {
            offers.push({
              id: campaign.id,
              service: site.title || "Unknown",
              title: campaign.title,
              description: campaign.description,
              value: campaign.value,
              imageUrl: campaign.imageUrl,
            });
          }
        }
      }
    }

    return this.deduplicateOffers(offers);
  }

  private hasOffersObject(
    state: FlockInitialState,
  ): state is FlockInitialState & { offers: OffersObject } {
    return (
      typeof state === "object" &&
      state !== null &&
      "offers" in state &&
      typeof state.offers === "object" &&
      state.offers !== null &&
      !Array.isArray(state.offers)
    );
  }

  private hasWelcomePopupList(
    state: FlockInitialState,
  ): state is FlockInitialState & { welcomePopupList: unknown[] } {
    return (
      "welcomePopupList" in state &&
      Array.isArray((state as { welcomePopupList?: unknown }).welcomePopupList)
    );
  }

  private isValidOfferData(obj: unknown): obj is OfferData {
    if (typeof obj !== "object" || obj === null || !("id" in obj)) {
      return false;
    }

    const id = (obj as { id: unknown }).id;
    return typeof id === "number" || typeof id === "string";
  }

  private mapToOffer(data: OfferData): Offer {
    const id = typeof data.id === "string" ? parseInt(data.id, 10) : data.id;

    return {
      id,
      service: data.site?.title || "Unknown Service",
      title:
        data.texts?.sale ||
        data.texts?.title ||
        data.texts?.["short-description"] ||
        "No Title",
      description: data.texts?.description || data.agreement || "",
      value: data.texts?.value || data.texts?.motivationAmount,
      imageUrl:
        data.images?.image ||
        data.images?.logo ||
        data.images?.logotypeExchange,
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

    return allOffers.filter((offer) =>
      offer.service.toLowerCase().includes(serviceName.toLowerCase()),
    );
  }

  public async getOfferById(offerId: number): Promise<Offer | null> {
    const allOffers = await this.getAvailableOffers();

    return allOffers.find((offer) => offer.id === offerId) || null;
  }
}
