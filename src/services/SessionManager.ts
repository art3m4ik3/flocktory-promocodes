import type { FlockInitialState, FlockData } from "../types";
import { REGEX, FLOCKTORY_URLS } from "../config/constants";
import { HttpClient } from "../core/HttpClient";

export class SessionManager {
  private readonly httpClient: HttpClient;
  private uuid: string | null;
  private jwtToken: string | null;
  private landingId: string | null;
  private exchangeSessionId: string | null;
  private cachedInitialState: FlockInitialState | null;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.uuid = null;
    this.jwtToken = null;
    this.landingId = null;
    this.exchangeSessionId = null;
    this.cachedInitialState = null;
  }

  public async initialize(): Promise<void> {
    const response = await this.httpClient.get<string>(FLOCKTORY_URLS.LOGIN);

    if (response.status !== 200) {
      throw new Error(`Failed to initialize session: HTTP ${response.status}`);
    }

    this.uuid = this.extractUuidFromUrl(response.finalUrl);
    this.cachedInitialState = this.parseInitialState(response.data);

    if (!this.uuid) {
      this.uuid = this.cachedInitialState.app?.urlToken || null;
    }

    if (!this.uuid) {
      throw new Error("Failed to get UUID from redirect URL or initial state");
    }

    this.extractSessionData(this.cachedInitialState);

    const cookies = this.httpClient.getCookies();
    if (cookies["landing-id"] && !this.landingId) {
      this.landingId = cookies["landing-id"];
    }
  }

  private extractUuidFromUrl(url?: string): string | null {
    if (!url) return null;

    const uuidMatch = url.match(/\/interchange\/([a-f0-9-]+)/i);
    return uuidMatch?.[1] || null;
  }

  private extractSessionData(state: FlockInitialState): void {
    this.jwtToken =
      state.jwtToken ||
      state.app?.jwtToken ||
      state.userInfo?.jwtToken ||
      this.jwtToken;

    this.exchangeSessionId =
      state.exchangeSessionId ||
      state.userInfo?.exchangeSessionId ||
      this.exchangeSessionId;

    this.landingId =
      state.landingId || state.userInfo?.landingId || this.landingId;
  }

  public async loadInterchangePage(): Promise<FlockInitialState> {
    if (this.cachedInitialState) {
      return this.cachedInitialState;
    }

    throw new Error("Session not initialized. Call initialize() first");
  }

  public async loadCampaignPopup(
    campaignId: number,
  ): Promise<FlockInitialState> {
    if (!this.uuid || !this.landingId) {
      throw new Error("Session not initialized properly");
    }

    const url = `${FLOCKTORY_URLS.INTERCHANGE_POPUP}/${this.uuid}/${campaignId}?lid=${this.landingId}`;
    const response = await this.httpClient.get<string>(url, {
      headers: {
        Referer: FLOCKTORY_URLS.LOGIN,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to load campaign popup: HTTP ${response.status}`);
    }

    return this.parseInitialState(response.data);
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

  public getLandingId(): string | null {
    return this.landingId;
  }

  public getExchangeSessionId(): string | null {
    return this.exchangeSessionId;
  }

  public setJwtToken(token: string): void {
    this.jwtToken = token;
  }
}
