import type { PromoCode, Offer } from "../types";

export class PromoService {
  public getPromoCode(offer: Offer): PromoCode {
    if (!offer.promoCode) {
      throw new Error(
        `Offer ${offer.id} (${offer.service}) has no promo code, it is a lead form`,
      );
    }

    return {
      code: offer.promoCode,
      service: offer.service,
      serviceUrl: offer.serviceUrl || "",
      description: offer.description,
    };
  }

  public getMultiplePromoCodes(
    offers: Offer[],
    options: { throwOnError?: boolean } = {},
  ): PromoCode[] {
    const promoCodes: PromoCode[] = [];

    for (const offer of offers) {
      try {
        promoCodes.push(this.getPromoCode(offer));
      } catch (error) {
        if (options.throwOnError) throw error;
      }
    }

    return promoCodes;
  }
}
