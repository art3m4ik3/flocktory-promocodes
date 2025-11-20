import type { Offer, PromoCode } from "./types";
import { HttpClient } from "./core/HttpClient";
import { SessionManager } from "./services/SessionManager";
import { OffersService } from "./services/OffersService";
import { PromoService } from "./services/PromoService";

export class FlocktoryClient {
  private readonly httpClient: HttpClient;
  private readonly sessionManager: SessionManager;
  private readonly offersService: OffersService;
  private readonly promoService: PromoService;
  private isInitialized: boolean;

  constructor() {
    this.httpClient = new HttpClient();
    this.sessionManager = new SessionManager(this.httpClient);
    this.offersService = new OffersService(this.sessionManager);
    this.promoService = new PromoService(this.httpClient, this.sessionManager);
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
    this.ensureInitialized();

    const offers = await this.getOffersByService(serviceName);

    if (offers.length === 0) {
      throw new Error(`No offers found for service: ${serviceName}`);
    }

    const selectedOffers = offers.slice(0, count);
    return this.getMultiplePromoCodes(selectedOffers);
  }
}
