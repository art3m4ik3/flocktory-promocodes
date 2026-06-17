import type {
  AcceptOfferPayload,
  AcceptOfferResponse,
  PromoCode,
  Offer,
  CouponData,
} from "../types";
import {
  buildAcceptOfferUrl,
  DEFAULT_CONSENTS,
  DEFAULT_CUSTOMER_ACTIONS,
  DEFAULT_PROMO_REQUEST_DELAY,
} from "../config/constants";
import { HttpClient } from "../core/HttpClient";
import { SessionManager } from "./SessionManager";

export class PromoService {
  private readonly httpClient: HttpClient;
  private readonly sessionManager: SessionManager;

  constructor(httpClient: HttpClient, sessionManager: SessionManager) {
    this.httpClient = httpClient;
    this.sessionManager = sessionManager;
  }

  public async getPromoCode(offer: Offer): Promise<PromoCode> {
    const couponData = await this.acceptOffer(offer);

    return {
      code: couponData.coupon || couponData.promocode || "N/A",
      service: offer.service,
      serviceUrl: offer.serviceUrl || "",
      description: offer.description,
      rewardValue: couponData["reward-value"],
      expiresAt: couponData["expires-at"],
    };
  }

  private async acceptOffer(offer: Offer): Promise<CouponData> {
    const jwtToken = this.sessionManager.getJwtToken();
    const uuid = this.sessionManager.getUuid();
    const siteId = this.sessionManager.getSiteId();
    const email = this.sessionManager.getEmail();

    if (!jwtToken || !uuid || !siteId) {
      throw new Error("Session not initialized properly");
    }

    if (!offer.offerSiteId) {
      throw new Error(`Cannot determine offerSiteId for offer ${offer.id}`);
    }

    const payload: AcceptOfferPayload = {
      jwtToken,
      email,
      offerId: String(offer.id),
      offerSiteId: offer.offerSiteId,
      siteId,
      consents: DEFAULT_CONSENTS,
      customerActions: DEFAULT_CUSTOMER_ACTIONS,
    };

    const response = await this.httpClient.post<AcceptOfferResponse>(
      buildAcceptOfferUrl(uuid),
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          Origin: "https://flocktory.com",
          Referer: this.sessionManager.getReferer(),
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(`Failed to accept offer: HTTP ${response.status}`);
    }

    if (!response.data.url) {
      throw new Error("No URL in accept offer response");
    }

    return this.parsePromoCodeUrl(response.data.url);
  }

  private parsePromoCodeUrl(responseUrl: string): CouponData {
    try {
      const url = new URL(responseUrl);
      const token = url.searchParams.get("data");

      if (!token) {
        throw new Error("No data parameter in URL");
      }

      const parts = token.split(".");

      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const payload = JSON.parse(
        Buffer.from(parts[1] as string, "base64").toString("utf-8"),
      ) as { coupon?: CouponData };

      if (!payload.coupon) {
        throw new Error("No coupon data in decoded JWT");
      }

      if (!payload.coupon.coupon && !payload.coupon.promocode) {
        throw new Error("No promo code in coupon data");
      }

      return payload.coupon;
    } catch (error) {
      throw new Error(
        `Failed to parse promo code URL: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  public async getMultiplePromoCodes(
    offers: Offer[],
    options: { throwOnError?: boolean; delayMs?: number } = {},
  ): Promise<PromoCode[]> {
    const { throwOnError = false, delayMs = DEFAULT_PROMO_REQUEST_DELAY } =
      options;
    const promoCodes: PromoCode[] = [];
    const errors: Array<{ offerId: number; error: Error }> = [];

    for (const offer of offers) {
      try {
        const promoCode = await this.getPromoCode(offer);
        promoCodes.push(promoCode);
        await this.delay(delayMs);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(
          `Failed to get promo code for offer ${offer.id} (${offer.service}):`,
          err.message,
        );
        errors.push({ offerId: offer.id, error: err });

        if (throwOnError) {
          throw new Error(
            `Failed to get promo code for offer ${offer.id}: ${err.message}`,
            { cause: err },
          );
        }
      }
    }

    if (errors.length > 0 && promoCodes.length === 0) {
      console.warn(`All ${offers.length} promo code requests failed`);
    }

    return promoCodes;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
