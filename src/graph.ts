// Centralized Microsoft Graph API utility
import { Providers } from "@microsoft/mgt-element";

/**
 * Configuration for Microsoft Graph API base URL and version.
 * You can override these via environment variables if needed.
 */
export const GRAPH_API_CONFIG = {
  baseUrl: "https://graph.microsoft.com",
  version: "beta", // Change to 'v1.0' for production if needed
};

/**
 * Options for making a Microsoft Graph API call.
 * @property method - HTTP method (GET, POST, etc.)
 * @property headers - Additional headers
 * @property body - Request body (for POST, PATCH, etc.)
 * @property signal - Optional AbortSignal for cancellation
 */
export interface GraphApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

/**
 * Makes a call to the Microsoft Graph API using the global provider.
 * Handles authentication, error handling, and configuration.
 *
 * @param endpoint - The Graph API endpoint (e.g., '/users')
 * @param options - Optional fetch options (method, headers, body, etc.)
 * @returns The parsed JSON response from the Graph API
 * @throws Error if authentication fails or the API returns an error
 */
export async function callGraphApi<T = any>(
  endpoint: string,
  options: GraphApiOptions = {}
): Promise<T> {
  const provider = Providers.globalProvider;
  if (!provider) throw new Error("No global provider found");
  const accessToken = await provider.getAccessToken();
  const url = `${GRAPH_API_CONFIG.baseUrl}/${GRAPH_API_CONFIG.version}${endpoint}`;
  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  };
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    let errorMsg = `Graph API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMsg += errorData.error?.message
        ? ` - ${errorData.error.message}`
        : "";
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}
