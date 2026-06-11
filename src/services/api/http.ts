/**
 * Base HTTP client for API requests with token management
 */

import { buildQueryString, parseResponse } from '../../utils/http';
import { getStorageItem, setStorageItem } from '../../utils/storage';

export interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit;
}

export interface ApiClientConfig {
  baseUrl: string;
  tokenKey: string;
}

export class ApiClient {
  private baseUrl: string;
  private tokenKey: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.tokenKey = config.tokenKey;
  }

  /**
   * Get stored token
   */
  private getToken(): string | null {
    return getStorageItem<string>(this.tokenKey);
  }

  /**
   * Save token
   */
  private saveToken(token: string | null): void {
    setStorageItem(this.tokenKey, token);
  }

  /**
   * Extract and save new token from response headers
   */
  private handleResponseToken(response: Response): void {
    const newToken = response.headers.get(this.tokenKey);
    if (newToken) {
      this.saveToken(newToken);
    }
  }

  /**
   * Make authenticated request
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const token = this.getToken();
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { [this.tokenKey]: token } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });

    this.handleResponseToken(response);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Make GET request
   */
  get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Make POST request
   */
  post<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Build query string
   */
  buildUrl(endpoint: string, params: Record<string, any>): string {
    const query = buildQueryString(params);
    return query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
  }
}
