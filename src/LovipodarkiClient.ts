import type {
  LovipodarkiApiOffer,
  LovipodarkiApiResponse,
  LovipodarkiCodeResponse,
  LovipodarkiOffer,
  LovipodarkiOfferType,
  LovipodarkiOffersPage,
  PromoCode,
  PromoProvider,
} from "./types";
import {
  LOVIPODARKI_DEFAULT_PARTNER_ID,
  LOVIPODARKI_PAGE_SIZE,
  LOVIPODARKI_URLS,
} from "./config/constants";
import { HttpClient } from "./core/HttpClient";

const API_HEADERS = {
  Accept: "application/json",
  Origin: LOVIPODARKI_URLS.ORIGIN,
  Referer: `${LOVIPODARKI_URLS.ORIGIN}/`,
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

const CODE_TYPES: readonly LovipodarkiOfferType[] = ["personal", "promo_code"];

export class LovipodarkiClient implements PromoProvider {
  public readonly name = "lovipodarki";
  private readonly httpClient: HttpClient;
  private readonly partnerId: string;
  private offers: LovipodarkiOffer[] | null;

  constructor(options: { partnerId?: string } = {}) {
    this.httpClient = new HttpClient();
    this.partnerId = options.partnerId ?? LOVIPODARKI_DEFAULT_PARTNER_ID;
    this.offers = null;
  }

  public async initialize(): Promise<void> {
    const rawOffers: LovipodarkiApiOffer[] = [];
    let total = Infinity;

    while (rawOffers.length < total) {
      const page = await this.fetchOffersPage(rawOffers.length);
      const items = page.items ?? [];
      rawOffers.push(...items);
      total = page.count ?? rawOffers.length;
      if (items.length === 0) break;
    }

    this.offers = rawOffers
      .filter((offer) => offer.status !== "inactive")
      .map((offer) => this.mapToOffer(offer));
  }

  public async getAvailableOffers(): Promise<LovipodarkiOffer[]> {
    if (!this.offers) {
      throw new Error("Client not initialized. Call initialize() first");
    }
    return this.offers;
  }

  public async getOffersWithPromoCodes(): Promise<LovipodarkiOffer[]> {
    const offers = await this.getAvailableOffers();
    return this.sortByCodePriority(offers.filter((offer) => this.isRedeemable(offer)));
  }

  public async getOffersByService(serviceName: string): Promise<LovipodarkiOffer[]> {
    const query = serviceName.toLowerCase();
    const offers = await this.getAvailableOffers();

    return this.sortByCodePriority(
      offers.filter((offer) =>
        [offer.service, offer.title, this.hostnameOf(offer.serviceUrl)].some((value) =>
          value.toLowerCase().includes(query),
        ),
      ),
    );
  }

  public async getOfferById(offerId: string): Promise<LovipodarkiOffer | null> {
    const offers = await this.getAvailableOffers();
    return offers.find((offer) => offer.id === offerId) ?? null;
  }

  public async getPromoCode(offer: LovipodarkiOffer): Promise<PromoCode> {
    const response =
      offer.codeType === "personal"
        ? await this.requestPersonalCode(offer.id)
        : offer.codeType === "promo_code"
          ? await this.requestSharedCode(offer.id)
          : null;

    if (!response?.code) {
      throw new Error(`Offer ${offer.id} (${offer.service}) has no promo code, it is a link`);
    }

    return {
      code: response.code,
      service: offer.service,
      serviceUrl: offer.serviceUrl ?? "",
      description: offer.description,
      expiresAt: response.expires_at ?? offer.expiresAt,
    };
  }

  public async getPromoCodesByService(
    serviceName: string,
    count: number = 1,
  ): Promise<PromoCode[]> {
    const offers = (await this.getOffersByService(serviceName)).filter((offer) =>
      this.isRedeemable(offer),
    );

    if (offers.length === 0) {
      throw new Error(`No offers with promo codes found for service: ${serviceName}`);
    }

    const promoCodes: PromoCode[] = [];

    for (const offer of offers) {
      if (promoCodes.length >= count) break;
      await this.collectCode(offer, promoCodes);
    }

    const personalOffers = offers.filter((offer) => offer.codeType === "personal");

    while (promoCodes.length < count && personalOffers.length > 0) {
      const before = promoCodes.length;
      for (const offer of personalOffers) {
        if (promoCodes.length >= count) break;
        await this.collectCode(offer, promoCodes);
      }
      if (promoCodes.length === before) break;
    }

    return promoCodes;
  }

  private async collectCode(offer: LovipodarkiOffer, target: PromoCode[]): Promise<void> {
    try {
      target.push(await this.getPromoCode(offer));
    } catch (error) {
      console.error(
        `Failed to get promo code for ${offer.service}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async fetchOffersPage(offset: number): Promise<LovipodarkiOffersPage> {
    const params = new URLSearchParams({
      s: this.partnerId,
      limit: String(LOVIPODARKI_PAGE_SIZE),
      offset: String(offset),
    });

    const page = await this.unwrap<LovipodarkiOffersPage>(
      await this.httpClient.get<LovipodarkiApiResponse<LovipodarkiOffersPage>>(
        `${LOVIPODARKI_URLS.API}/offers?${params.toString()}`,
        { headers: API_HEADERS },
      ),
      "load offers",
    );

    return page;
  }

  private async requestPersonalCode(offerId: string): Promise<LovipodarkiCodeResponse> {
    return this.unwrap<LovipodarkiCodeResponse>(
      await this.httpClient.post<LovipodarkiApiResponse<LovipodarkiCodeResponse>>(
        `${LOVIPODARKI_URLS.API}/offers/personal-code`,
        { offer_id: offerId, uuid: crypto.randomUUID() },
        { headers: API_HEADERS },
      ),
      "request personal code",
    );
  }

  private async requestSharedCode(offerId: string): Promise<LovipodarkiCodeResponse> {
    return this.unwrap<LovipodarkiCodeResponse>(
      await this.httpClient.get<LovipodarkiApiResponse<LovipodarkiCodeResponse>>(
        `${LOVIPODARKI_URLS.API}/offers/${encodeURIComponent(offerId)}/code`,
        { headers: API_HEADERS },
      ),
      "load promo code",
    );
  }

  private unwrap<T>(
    response: { status: number; data: LovipodarkiApiResponse<T> | string },
    action: string,
  ): T {
    const body = typeof response.data === "object" ? response.data : null;

    if (response.status !== 200 || !body?.data) {
      const details = body?.error ? `: ${JSON.stringify(body.error)}` : "";
      throw new Error(`Failed to ${action}: HTTP ${response.status}${details}`);
    }

    return body.data;
  }

  private mapToOffer(data: LovipodarkiApiOffer): LovipodarkiOffer {
    return {
      id: data.id,
      service: (data.project_name ?? "Unknown Service").trim(),
      title: data.title ?? "No Title",
      description: data.description ?? "",
      imageUrl: data.logo_url,
      serviceUrl: data.shop_url,
      expiresAt: data.expires_at,
      codeType: this.toCodeType(data.type),
    };
  }

  private toCodeType(type?: string): LovipodarkiOfferType {
    return CODE_TYPES.find((codeType) => codeType === type) ?? "link";
  }

  private isRedeemable(offer: LovipodarkiOffer): boolean {
    if (offer.codeType === "link") return false;
    if (!offer.expiresAt) return true;
    return new Date(offer.expiresAt).getTime() > Date.now();
  }

  private sortByCodePriority(offers: LovipodarkiOffer[]): LovipodarkiOffer[] {
    const priority: Record<LovipodarkiOfferType, number> = {
      personal: 0,
      promo_code: 1,
      link: 2,
    };
    return [...offers].sort((a, b) => priority[a.codeType] - priority[b.codeType]);
  }

  private hostnameOf(url?: string): string {
    if (!url) return "";
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }
}
