import type {
  AcceptCampaignPayload,
  AcceptCampaignResponse,
  PromoCode,
  Offer,
  CouponData,
  FlockInitialState,
  SiteInfoData,
} from "../types";
import {
  FLOCKTORY_URLS,
  DEFAULT_EMAIL,
  CONSENT_TYPES,
  ACTION_TYPES,
  REGEX,
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
    const popupState = await this.sessionManager.loadCampaignPopup(offer.id);

    if (popupState.jwtToken) {
      this.sessionManager.setJwtToken(popupState.jwtToken);
    }

    const { siteId, campaignSiteId } = this.extractSiteIds(popupState, offer);
    const couponData = await this.acceptCampaign(
      offer.id,
      siteId,
      campaignSiteId,
    );

    return {
      code: couponData.promocode || couponData.coupon || "N/A",
      service: offer.service,
      serviceUrl: couponData.url || "",
      description: offer.description,
    };
  }

  private async acceptCampaign(
    campaignId: number,
    siteId: string,
    campaignSiteId: string,
  ): Promise<CouponData> {
    const jwtToken = this.sessionManager.getJwtToken();
    const uuid = this.sessionManager.getUuid();

    if (!jwtToken || !uuid) {
      throw new Error("Session not initialized properly");
    }

    const payload: AcceptCampaignPayload = {
      "login-data": jwtToken,
      email: DEFAULT_EMAIL,
      "campaign-id": String(campaignId),
      "campaign-site-id": campaignSiteId,
      "site-id": siteId,
      consents: [
        {
          type: CONSENT_TYPES.HOST_AD,
          value: "consent_host_ad_ru_RU_20250828.pdf",
        },
        {
          type: CONSENT_TYPES.HOST_PD,
          value: "consent_host_pd_ru_RU_20250828.pdf",
        },
        { type: CONSENT_TYPES.PREFILL_ACCEPTED, value: "true" },
      ],
      actions: [
        { key: ACTION_TYPES.UTM_CAMPAIGN, value: "exchange" },
        { key: ACTION_TYPES.UTM_SOURCE, value: "podarok.com" },
        { key: ACTION_TYPES.UTM_TERM, value: "" },
        { key: ACTION_TYPES.UTM_CONTENT, value: "" },
        { key: ACTION_TYPES.UTM_MEDIUM, value: "referral" },
        { key: ACTION_TYPES.LIGHT, value: "true" },
      ],
    };

    const url = `${FLOCKTORY_URLS.ACCEPT_CAMPAIGN}/${uuid}/red/accept-exchange-campaign`;

    const response = await this.httpClient.post<AcceptCampaignResponse>(
      url,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(`Failed to accept campaign: HTTP ${response.status}`);
    }

    if (!response.data.url) {
      throw new Error("No URL in campaign response");
    }

    return this.parsePromoCodeUrl(response.data.url);
  }

  private parsePromoCodeUrl(responseUrl: string): CouponData {
    try {
      const url = new URL(responseUrl);
      const jwtToken = url.searchParams.get("data");

      if (!jwtToken) {
        throw new Error("No data parameter in URL");
      }

      const parts = jwtToken.split(".");

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

  private extractSiteIds(
    state: FlockInitialState,
    offer: Offer,
  ): { siteId: string; campaignSiteId: string } {
    const mainSiteId = (state.siteInfo?.data as SiteInfoData)?.id;

    if (!mainSiteId) {
      throw new Error(`Cannot determine site ID for offer ${offer.id}`);
    }

    const campaignSiteId = state.siteInfo?.id
      ? String(state.siteInfo.id)
      : mainSiteId;

    return {
      siteId: mainSiteId,
      campaignSiteId: campaignSiteId,
    };
  }

  public async getMultiplePromoCodes(
    offers: Offer[],
    options: { throwOnError?: boolean; delayMs?: number } = {},
  ): Promise<PromoCode[]> {
    const { throwOnError = false, delayMs = 1000 } = options;
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
