/**
 * HTTP utility functions and types
 */

export interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  ok: boolean;
}

/**
 * Make HTTP request with automatic error handling
 */
export async function httpFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Parse response with fallback to empty object if empty response
 */
export async function parseResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

/**
 * Build query string from parameters object
 */
export function buildQueryString(params: Record<string, any>): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(','));
      } else {
        searchParams.set(key, String(value));
      }
    }
  }

  return searchParams;
}
