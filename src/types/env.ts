/**
 * Environment Bindings for Segment MCP Server
 *
 * MULTI-TENANT ARCHITECTURE:
 * This server supports multiple tenants. Tenant-specific credentials are
 * passed via request headers, NOT stored in wrangler secrets.
 *
 * Request Headers:
 * - X-Segment-Write-Key: Write key for Tracking API (identify, track, etc.)
 * - X-Segment-Access-Token: Bearer token for Public API (sources, destinations, etc.)
 */

// =============================================================================
// Tenant Credentials (parsed from request headers)
// =============================================================================

export interface TenantCredentials {
  /** Write Key for Tracking API (from X-Segment-Write-Key header) */
  writeKey?: string;

  /** Access Token for Public API (from X-Segment-Access-Token header) */
  accessToken?: string;

  /** Override Tracking API base URL (from X-Segment-Tracking-URL header) */
  trackingBaseUrl?: string;

  /** Override Public API base URL (from X-Segment-API-URL header) */
  publicApiBaseUrl?: string;
}

/**
 * Parse tenant credentials from request headers
 */
export function parseTenantCredentials(request: Request): TenantCredentials {
  const headers = request.headers;

  return {
    writeKey: headers.get('X-Segment-Write-Key') || undefined,
    accessToken: headers.get('X-Segment-Access-Token') || undefined,
    trackingBaseUrl: headers.get('X-Segment-Tracking-URL') || undefined,
    publicApiBaseUrl: headers.get('X-Segment-API-URL') || undefined,
  };
}

/**
 * Validate that required credentials are present
 */
export function validateCredentials(credentials: TenantCredentials): void {
  if (!credentials.writeKey && !credentials.accessToken) {
    throw new Error(
      'Missing credentials. Provide X-Segment-Write-Key for Tracking API or X-Segment-Access-Token for Public API.'
    );
  }
}

// =============================================================================
// Environment Configuration (from wrangler.jsonc vars and bindings)
// =============================================================================

export interface Env {
  // ===========================================================================
  // Environment Variables (from wrangler.jsonc vars)
  // ===========================================================================

  /** Maximum character limit for responses */
  CHARACTER_LIMIT: string;

  /** Default page size for list operations */
  DEFAULT_PAGE_SIZE: string;

  /** Maximum page size allowed */
  MAX_PAGE_SIZE: string;

  // ===========================================================================
  // Bindings
  // ===========================================================================

  /** KV namespace for OAuth token storage */
  OAUTH_KV?: KVNamespace;

  /** Durable Object namespace for MCP sessions */
  MCP_SESSIONS?: DurableObjectNamespace;

  /** Cloudflare AI binding (optional) */
  AI?: Ai;
}

// ===========================================================================
// Helper Functions
// ===========================================================================

/**
 * Get a numeric environment value with a default
 */
export function getEnvNumber(env: Env, key: keyof Env, defaultValue: number): number {
  const value = env[key];
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Get the character limit from environment
 */
export function getCharacterLimit(env: Env): number {
  return getEnvNumber(env, 'CHARACTER_LIMIT', 50000);
}

/**
 * Get the default page size from environment
 */
export function getDefaultPageSize(env: Env): number {
  return getEnvNumber(env, 'DEFAULT_PAGE_SIZE', 20);
}

/**
 * Get the maximum page size from environment
 */
export function getMaxPageSize(env: Env): number {
  return getEnvNumber(env, 'MAX_PAGE_SIZE', 100);
}
