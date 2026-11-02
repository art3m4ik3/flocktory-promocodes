import type { CampaignData, LandingConfig } from "../types";
import { REGEX, FLOCKTORY_URLS } from "../config/constants";
import { HttpClient } from "../core/HttpClient";

export class SessionManager {
  private readonly httpClient: HttpClient;
  private campaigns: CampaignData[] | null;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.campaigns = null;
  }

  public async initialize(): Promise<void> {
    const response = await this.httpClient.get<string>(FLOCKTORY_URLS.LOGIN);

    if (response.status !== 200) {
      throw new Error(`Failed to initialize session: HTTP ${response.status}`);
    }

    const campaigns = this.parseLandingConfig(response.data).campaigns;

    if (!Array.isArray(campaigns)) {
      throw new Error("No campaigns in landing config");
    }

    this.campaigns = campaigns;
  }

  public loadOffers(): CampaignData[] {
    if (!this.campaigns) {
      throw new Error("Session not initialized. Call initialize() first");
    }

    return this.campaigns;
  }

  private parseLandingConfig(html: string): LandingConfig {
    const match = html.match(REGEX.LANDING_CONFIG);

    if (!match?.[1]) {
      throw new Error("Failed to find landing CONFIG in HTML");
    }

    try {
      return JSON.parse(match[1]) as LandingConfig;
    } catch (error) {
      throw new Error(
        `Failed to parse landing CONFIG: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
