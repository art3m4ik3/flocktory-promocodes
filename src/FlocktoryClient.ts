import type { Offer, PromoCode, PromoProvider } from "./types";
import { HttpClient } from "./core/HttpClient";
import { SessionManager } from "./services/SessionManager";
import { OffersService } from "./services/OffersService";
import { PromoService } from "./services/PromoService";

export class FlocktoryClient implements PromoProvider {
  public readonly name = "flocktory";
  private readonly sessionManager: SessionManager;
  private readonly offersService: OffersService;
  private readonly promoService: PromoService;
  private isInitialized: boolean;

  constructor() {
    this.sessionManager = new SessionManager(new HttpClient());
    this.offersService = new OffersService(this.sessionManager);
    this.promoService = new PromoService();
    this.isInitialized = false;
  }

  public async initialize(): Promise<void> {
    await this.sessionManager.initialize();
    this.isInitialized = true;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error("Client not initialized. Call initialize() first");
    }
  }

  public async getAvailableOffers(): Promise<Offer[]> {
    this.ensureInitialized();
    return this.offersService.getAvailableOffers();
  }

  public async getOffersWithPromoCodes(): Promise<Offer[]> {
    const offers = await this.getAvailableOffers();
    return offers.filter((offer) => offer.promoCode);
  }

  public async getOffersByService(serviceName: string): Promise<Offer[]> {
    this.ensureInitialized();
    return this.offersService.getOffersByService(serviceName);
  }

  public async getOfferById(offerId: number): Promise<Offer | null> {
    this.ensureInitialized();
    return this.offersService.getOfferById(offerId);
  }

  public async getPromoCode(offer: Offer): Promise<PromoCode> {
    this.ensureInitialized();
    return this.promoService.getPromoCode(offer);
  }

  public async getMultiplePromoCodes(offers: Offer[]): Promise<PromoCode[]> {
    this.ensureInitialized();
    return this.promoService.getMultiplePromoCodes(offers);
  }

  public async getPromoCodesByService(
    serviceName: string,
    count: number = 1,
  ): Promise<PromoCode[]> {
    const offers = await this.getOffersByService(serviceName);

    if (offers.length === 0) {
      throw new Error(`No offers found for service: ${serviceName}`);
    }

    return this.promoService
      .getMultiplePromoCodes(offers)
      .slice(0, count);
  }
}
