import type {
  FlockInitialState,
  CampaignData,
  OffersListResponse,
} from "../types";
import {
  REGEX,
  FLOCKTORY_URLS,
  buildOffersListUrl,
  generateRandomEmail,
} from "../config/constants";
import { HttpClient } from "../core/HttpClient";

export class SessionManager {
  private readonly httpClient: HttpClient;
  private readonly email: string;
  private uuid: string | null;
  private jwtToken: string | null;
  private siteId: string | null;
  private referer: string;
  private cachedCampaigns: CampaignData[] | null;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.email = generateRandomEmail();
    this.uuid = null;
    this.jwtToken = null;
    this.siteId = null;
    this.referer = FLOCKTORY_URLS.LOGIN;
    this.cachedCampaigns = null;
  }

  public async initialize(): Promise<void> {
    const response = await this.httpClient.get<string>(FLOCKTORY_URLS.LOGIN);

    if (response.status !== 200) {
      throw new Error(`Failed to initialize session: HTTP ${response.status}`);
    }

    this.referer = response.finalUrl || FLOCKTORY_URLS.LOGIN;

    const state = this.parseInitialState(response.data);

    this.uuid =
      this.extractUuidFromUrl(response.finalUrl) || state.app?.urlToken || null;
    this.jwtToken = state.app?.jwtToken || null;

    const rawSiteId = state.siteInfo?.data?.id;
    this.siteId = rawSiteId != null ? String(rawSiteId) : null;

    if (!this.uuid) {
      throw new Error("Failed to get UUID from redirect URL or initial state");
    }

    if (!this.jwtToken) {
      throw new Error("Failed to get jwtToken from initial state");
    }

    if (!this.siteId) {
      throw new Error("Failed to get siteId from initial state");
    }
  }

  public async loadOffers(): Promise<CampaignData[]> {
    if (this.cachedCampaigns) {
      return this.cachedCampaigns;
    }

    if (!this.uuid || !this.jwtToken || !this.siteId) {
      throw new Error("Session not initialized. Call initialize() first");
    }

    const url = buildOffersListUrl(
      this.uuid,
      this.jwtToken,
      this.siteId,
      this.email,
    );

    const response = await this.httpClient.get<OffersListResponse>(url, {
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        Referer: this.referer,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to load offers: HTTP ${response.status}`);
    }

    const campaigns = response.data?.campaigns;

    if (!Array.isArray(campaigns)) {
      throw new Error("No campaigns in offers list response");
    }

    this.cachedCampaigns = campaigns;
    return campaigns;
  }

  private extractUuidFromUrl(url?: string): string | null {
    if (!url) return null;
    const match = url.match(REGEX.INTERCHANGE_UUID);
    return match?.[1] || null;
  }

  private parseInitialState(html: string): FlockInitialState {
    const match = html.match(REGEX.FLOCK_INITIAL_STATE);

    if (!match?.[1]) {
      throw new Error("Failed to find flockInitialState in HTML");
    }

    try {
      const jsonStr = match[1].replace(/,(\s*[}\]])/g, "$1");
      return JSON.parse(jsonStr) as FlockInitialState;
    } catch (error) {
      throw new Error(
        `Failed to parse flockInitialState: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  public getUuid(): string | null {
    return this.uuid;
  }

  public getJwtToken(): string | null {
    return this.jwtToken;
  }

  public getSiteId(): string | null {
    return this.siteId;
  }

  public getEmail(): string {
    return this.email;
  }

  public getReferer(): string {
    return this.referer;
  }
}
