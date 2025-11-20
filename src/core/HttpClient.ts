import type { CookieJar, HttpResponse, RequestOptions } from "../types";
import { DEFAULT_HEADERS, DEFAULT_TIMEOUT } from "../config/constants";

export class HttpClient {
  private readonly cookieJar: CookieJar;

  constructor() {
    this.cookieJar = {};
  }

  public getCookies(): CookieJar {
    return { ...this.cookieJar };
  }

  public setCookies(cookies: CookieJar): void {
    Object.assign(this.cookieJar, cookies);
  }

  private parseCookies(setCookieHeaders: string[]): void {
    for (const cookieHeader of setCookieHeaders) {
      const [cookiePair] = cookieHeader.split(";");
      if (!cookiePair) continue;

      const [name, value] = cookiePair.split("=").map((s) => s.trim());
      if (name && value) {
        this.cookieJar[name] = value;
      }
    }
  }

  private getCookieHeader(): string {
    return Object.entries(this.cookieJar)
      .filter(([_, value]) => value !== undefined)
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  public async request<T = string>(
    url: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      followRedirects = true,
    } = options;

    const cookieHeader = this.getCookieHeader();
    const requestHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...headers,
    };

    if (cookieHeader) {
      requestHeaders["Cookie"] = cookieHeader;
    }

    if (body && typeof body === "object") {
      requestHeaders["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body:
          typeof body === "string"
            ? body
            : body
            ? JSON.stringify(body)
            : undefined,
        redirect: followRedirects ? "follow" : "manual",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const setCookieHeaders = response.headers.getSetCookie();
      if (setCookieHeaders.length > 0) {
        this.parseCookies(setCookieHeaders);
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const contentType = response.headers.get("content-type") || "";
      let data: T;

      if (contentType.includes("application/json")) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as T;
      }

      return {
        status: response.status,
        headers: responseHeaders,
        data,
        cookies: setCookieHeaders,
        finalUrl: response.url,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${DEFAULT_TIMEOUT}ms`);
        }
        throw new Error(`HTTP request failed: ${error.message}`);
      }

      throw error;
    }
  }

  public async get<T = string>(
    url: string,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  public async post<T = string>(
    url: string,
    body?: string | Record<string, unknown>,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: "POST", body });
  }
}
