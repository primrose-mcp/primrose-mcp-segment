/**
 * Segment API Client
 *
 * This file handles all HTTP communication with Segment APIs:
 * - Tracking API (api.segment.io/v1): identify, track, page, screen, group, alias, batch
 * - Public API (api.segmentapis.com): sources, destinations, warehouses, tracking plans, etc.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials.
 */

import type {
  AliasPayload,
  Audience,
  AuditEvent,
  BatchPayload,
  CatalogItem,
  ComputedTrait,
  Destination,
  DestinationFilter,
  DestinationSubscription,
  Function,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
  PaginatedResponse,
  PaginationParams,
  Regulation,
  ReverseETLModel,
  ScreenPayload,
  Source,
  Space,
  TrackingPlan,
  TrackingPlanRule,
  TrackingResponse,
  TrackPayload,
  Transformation,
  User,
  UserGroup,
  Warehouse,
  Workspace,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import {
  AuthenticationError,
  MissingCredentialsError,
  RateLimitError,
  SegmentApiError,
} from './utils/errors.js';

// =============================================================================
// API Base URLs
// =============================================================================

const TRACKING_API_BASE_URL = 'https://api.segment.io/v1';
const PUBLIC_API_BASE_URL = 'https://api.segmentapis.com';

// =============================================================================
// Segment Client Interface
// =============================================================================

export interface SegmentClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // =========================================================================
  // Tracking API Methods
  // =========================================================================
  identify(
    userId: string,
    traits?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse>;

  track(
    userId: string,
    event: string,
    properties?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse>;

  page(
    userId: string,
    name?: string,
    category?: string,
    properties?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse>;

  screen(
    userId: string,
    name?: string,
    category?: string,
    properties?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse>;

  group(
    userId: string,
    groupId: string,
    traits?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse>;

  alias(userId: string, previousId: string, context?: Record<string, unknown>): Promise<TrackingResponse>;

  batch(batch: BatchPayload): Promise<TrackingResponse>;

  // =========================================================================
  // Public API - Sources
  // =========================================================================
  listSources(params?: PaginationParams): Promise<PaginatedResponse<Source>>;
  getSource(sourceId: string): Promise<Source>;
  createSource(slug: string, name: string, catalogId: string): Promise<Source>;
  updateSource(sourceId: string, name?: string, enabled?: boolean): Promise<Source>;
  deleteSource(sourceId: string): Promise<void>;
  getSourceSchemaSettings(sourceId: string): Promise<Record<string, unknown>>;
  updateSourceSchemaSettings(sourceId: string, settings: Record<string, unknown>): Promise<Record<string, unknown>>;
  addLabelsToSource(sourceId: string, labels: Array<{ key: string; value: string }>): Promise<Source>;
  listConnectedDestinationsFromSource(sourceId: string): Promise<PaginatedResponse<Destination>>;
  listConnectedWarehousesFromSource(sourceId: string): Promise<PaginatedResponse<Warehouse>>;
  createWriteKeyForSource(sourceId: string): Promise<{ writeKey: string }>;
  removeWriteKeyFromSource(sourceId: string, writeKey: string): Promise<void>;

  // =========================================================================
  // Public API - Destinations
  // =========================================================================
  listDestinations(params?: PaginationParams): Promise<PaginatedResponse<Destination>>;
  getDestination(destinationId: string): Promise<Destination>;
  createDestination(
    sourceId: string,
    metadataId: string,
    name: string,
    settings?: Record<string, unknown>,
    enabled?: boolean
  ): Promise<Destination>;
  updateDestination(destinationId: string, name?: string, enabled?: boolean, settings?: Record<string, unknown>): Promise<Destination>;
  deleteDestination(destinationId: string): Promise<void>;

  // Destination Subscriptions
  listDestinationSubscriptions(destinationId: string): Promise<PaginatedResponse<DestinationSubscription>>;
  getDestinationSubscription(destinationId: string, subscriptionId: string): Promise<DestinationSubscription>;
  createDestinationSubscription(
    destinationId: string,
    name: string,
    actionId: string,
    trigger: string,
    enabled?: boolean,
    settings?: Record<string, unknown>
  ): Promise<DestinationSubscription>;
  updateDestinationSubscription(
    destinationId: string,
    subscriptionId: string,
    name?: string,
    enabled?: boolean,
    trigger?: string,
    settings?: Record<string, unknown>
  ): Promise<DestinationSubscription>;
  deleteDestinationSubscription(destinationId: string, subscriptionId: string): Promise<void>;

  // Destination Filters
  listDestinationFilters(destinationId: string): Promise<PaginatedResponse<DestinationFilter>>;
  getDestinationFilter(destinationId: string, filterId: string): Promise<DestinationFilter>;
  createDestinationFilter(
    sourceId: string,
    destinationId: string,
    title: string,
    ifClause: string,
    actions: Array<{ type: string; fields?: Record<string, unknown>; percent?: number }>,
    enabled?: boolean,
    description?: string
  ): Promise<DestinationFilter>;
  updateDestinationFilter(
    destinationId: string,
    filterId: string,
    title?: string,
    ifClause?: string,
    actions?: Array<{ type: string; fields?: Record<string, unknown>; percent?: number }>,
    enabled?: boolean,
    description?: string
  ): Promise<DestinationFilter>;
  deleteDestinationFilter(destinationId: string, filterId: string): Promise<void>;

  // =========================================================================
  // Public API - Warehouses
  // =========================================================================
  listWarehouses(params?: PaginationParams): Promise<PaginatedResponse<Warehouse>>;
  getWarehouse(warehouseId: string): Promise<Warehouse>;
  createWarehouse(metadataId: string, settings: Record<string, unknown>, name?: string, enabled?: boolean): Promise<Warehouse>;
  updateWarehouse(warehouseId: string, name?: string, enabled?: boolean, settings?: Record<string, unknown>): Promise<Warehouse>;
  deleteWarehouse(warehouseId: string): Promise<void>;
  addConnectionFromSourceToWarehouse(warehouseId: string, sourceId: string): Promise<void>;
  removeSourceConnectionFromWarehouse(warehouseId: string, sourceId: string): Promise<void>;
  listConnectedSourcesFromWarehouse(warehouseId: string): Promise<PaginatedResponse<Source>>;

  // =========================================================================
  // Public API - Tracking Plans
  // =========================================================================
  listTrackingPlans(params?: PaginationParams): Promise<PaginatedResponse<TrackingPlan>>;
  getTrackingPlan(trackingPlanId: string): Promise<TrackingPlan>;
  createTrackingPlan(name: string, type?: string, description?: string): Promise<TrackingPlan>;
  updateTrackingPlan(trackingPlanId: string, name?: string, description?: string): Promise<TrackingPlan>;
  deleteTrackingPlan(trackingPlanId: string): Promise<void>;
  listTrackingPlanRules(trackingPlanId: string): Promise<PaginatedResponse<TrackingPlanRule>>;
  updateTrackingPlanRules(trackingPlanId: string, rules: TrackingPlanRule[]): Promise<void>;
  addSourceToTrackingPlan(trackingPlanId: string, sourceId: string): Promise<void>;
  removeSourceFromTrackingPlan(trackingPlanId: string, sourceId: string): Promise<void>;
  listSourcesFromTrackingPlan(trackingPlanId: string): Promise<PaginatedResponse<Source>>;

  // =========================================================================
  // Public API - Functions
  // =========================================================================
  listFunctions(params?: PaginationParams & { resourceType?: string }): Promise<PaginatedResponse<Function>>;
  getFunction(functionId: string): Promise<Function>;
  createFunction(
    displayName: string,
    code: string,
    resourceType: 'DESTINATION' | 'INSERT_DESTINATION' | 'SOURCE',
    description?: string,
    settings?: Array<{ name: string; label: string; type: string; description?: string; required?: boolean; sensitive?: boolean }>
  ): Promise<Function>;
  updateFunction(
    functionId: string,
    displayName?: string,
    code?: string,
    description?: string,
    settings?: Array<{ name: string; label: string; type: string; description?: string; required?: boolean; sensitive?: boolean }>
  ): Promise<Function>;
  deleteFunction(functionId: string): Promise<void>;
  deployFunction(functionId: string): Promise<Function>;

  // =========================================================================
  // Public API - Transformations
  // =========================================================================
  listTransformations(params?: PaginationParams): Promise<PaginatedResponse<Transformation>>;
  getTransformation(transformationId: string): Promise<Transformation>;
  createTransformation(
    sourceId: string,
    name: string,
    ifClause: string,
    newEventName?: string,
    enabled?: boolean,
    destinationMetadataId?: string,
    propertyRenames?: Array<{ oldName: string; newName: string }>,
    fqlDefinedProperties?: Array<{ fql: string; propertyName: string }>
  ): Promise<Transformation>;
  updateTransformation(
    transformationId: string,
    name?: string,
    ifClause?: string,
    newEventName?: string,
    enabled?: boolean,
    propertyRenames?: Array<{ oldName: string; newName: string }>,
    fqlDefinedProperties?: Array<{ fql: string; propertyName: string }>
  ): Promise<Transformation>;
  deleteTransformation(transformationId: string): Promise<void>;

  // =========================================================================
  // Public API - Audiences (Engage)
  // =========================================================================
  listAudiences(spaceId: string, params?: PaginationParams): Promise<PaginatedResponse<Audience>>;
  getAudience(spaceId: string, audienceId: string): Promise<Audience>;
  createAudience(spaceId: string, name: string, definition: { query: string; type?: string }, description?: string, enabled?: boolean): Promise<Audience>;
  updateAudience(spaceId: string, audienceId: string, name?: string, definition?: { query: string; type?: string }, description?: string, enabled?: boolean): Promise<Audience>;
  deleteAudience(spaceId: string, audienceId: string): Promise<void>;

  // =========================================================================
  // Public API - Computed Traits (Engage)
  // =========================================================================
  listComputedTraits(spaceId: string, params?: PaginationParams): Promise<PaginatedResponse<ComputedTrait>>;
  getComputedTrait(spaceId: string, traitId: string): Promise<ComputedTrait>;
  createComputedTrait(spaceId: string, name: string, definition: { query: string; type?: string }, description?: string, enabled?: boolean): Promise<ComputedTrait>;
  updateComputedTrait(spaceId: string, traitId: string, name?: string, definition?: { query: string; type?: string }, description?: string, enabled?: boolean): Promise<ComputedTrait>;
  deleteComputedTrait(spaceId: string, traitId: string): Promise<void>;

  // =========================================================================
  // Public API - Spaces (Engage)
  // =========================================================================
  listSpaces(params?: PaginationParams): Promise<PaginatedResponse<Space>>;
  getSpace(spaceId: string): Promise<Space>;

  // =========================================================================
  // Public API - Reverse ETL
  // =========================================================================
  listReverseETLModels(params?: PaginationParams): Promise<PaginatedResponse<ReverseETLModel>>;
  getReverseETLModel(modelId: string): Promise<ReverseETLModel>;
  createReverseETLModel(
    sourceId: string,
    name: string,
    query: string,
    queryIdentifierColumn: string,
    description?: string,
    enabled?: boolean,
    scheduleStrategy?: string,
    scheduleConfig?: Record<string, unknown>
  ): Promise<ReverseETLModel>;
  updateReverseETLModel(
    modelId: string,
    name?: string,
    query?: string,
    description?: string,
    enabled?: boolean,
    scheduleStrategy?: string,
    scheduleConfig?: Record<string, unknown>
  ): Promise<ReverseETLModel>;
  deleteReverseETLModel(modelId: string): Promise<void>;
  triggerReverseETLSync(modelId: string, subscriptionId: string): Promise<void>;

  // =========================================================================
  // Public API - Users/IAM
  // =========================================================================
  listUsers(params?: PaginationParams): Promise<PaginatedResponse<User>>;
  getUser(userId: string): Promise<User>;
  deleteUsers(userIds: string[]): Promise<void>;
  listUserGroups(params?: PaginationParams): Promise<PaginatedResponse<UserGroup>>;
  getUserGroup(groupId: string): Promise<UserGroup>;
  createUserGroup(name: string): Promise<UserGroup>;
  updateUserGroup(groupId: string, name: string): Promise<UserGroup>;
  deleteUserGroup(groupId: string): Promise<void>;
  addUsersToUserGroup(groupId: string, emails: string[]): Promise<void>;
  removeUsersFromUserGroup(groupId: string, emails: string[]): Promise<void>;
  listInvites(params?: PaginationParams): Promise<PaginatedResponse<{ email: string }>>;
  createInvites(emails: string[]): Promise<void>;
  deleteInvites(emails: string[]): Promise<void>;

  // =========================================================================
  // Public API - Regulations (Deletion/Suppression)
  // =========================================================================
  listRegulationsFromSource(sourceId: string, params?: PaginationParams): Promise<PaginatedResponse<Regulation>>;
  createSourceRegulation(sourceId: string, regulationType: string, subjectType: string, subjectIds: string[]): Promise<Regulation>;
  getRegulation(regulationId: string): Promise<Regulation>;
  deleteRegulation(regulationId: string): Promise<void>;

  // =========================================================================
  // Public API - Catalog
  // =========================================================================
  getSourcesCatalog(params?: PaginationParams): Promise<PaginatedResponse<CatalogItem>>;
  getSourceMetadata(sourceMetadataId: string): Promise<CatalogItem>;
  getDestinationsCatalog(params?: PaginationParams): Promise<PaginatedResponse<CatalogItem>>;
  getDestinationMetadata(destinationMetadataId: string): Promise<CatalogItem>;
  getWarehousesCatalog(params?: PaginationParams): Promise<PaginatedResponse<CatalogItem>>;
  getWarehouseMetadata(warehouseMetadataId: string): Promise<CatalogItem>;

  // =========================================================================
  // Public API - Labels
  // =========================================================================
  listLabels(params?: PaginationParams): Promise<PaginatedResponse<{ key: string; value: string; description?: string }>>;
  createLabel(key: string, value: string, description?: string): Promise<{ key: string; value: string; description?: string }>;
  deleteLabel(key: string, value: string): Promise<void>;

  // =========================================================================
  // Public API - Audit Trail
  // =========================================================================
  listAuditEvents(params?: PaginationParams & { resourceId?: string; resourceType?: string }): Promise<PaginatedResponse<AuditEvent>>;

  // =========================================================================
  // Public API - Workspace
  // =========================================================================
  getWorkspace(): Promise<Workspace>;
}

// =============================================================================
// Segment Client Implementation
// =============================================================================

class SegmentClientImpl implements SegmentClient {
  private credentials: TenantCredentials;
  private trackingBaseUrl: string;
  private publicApiBaseUrl: string;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
    this.trackingBaseUrl = credentials.trackingBaseUrl || TRACKING_API_BASE_URL;
    this.publicApiBaseUrl = credentials.publicApiBaseUrl || PUBLIC_API_BASE_URL;
  }

  // ===========================================================================
  // HTTP Request Helpers
  // ===========================================================================

  private getTrackingHeaders(): Record<string, string> {
    if (!this.credentials.writeKey) {
      throw new MissingCredentialsError('X-Segment-Write-Key');
    }
    const credentials = btoa(`${this.credentials.writeKey}:`);
    return {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  private getPublicApiHeaders(): Record<string, string> {
    if (!this.credentials.accessToken) {
      throw new MissingCredentialsError('X-Segment-Access-Token');
    }
    return {
      Authorization: `Bearer ${this.credentials.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async trackingRequest<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${this.trackingBaseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getTrackingHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your write key.');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Tracking API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.message || errorJson.error || message;
      } catch {
        // Use default message
      }
      throw new SegmentApiError(message, response.status);
    }

    return response.json() as Promise<T>;
  }

  private async publicApiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.publicApiBaseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getPublicApiHeaders(),
        ...(options.headers || {}),
      },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your access token.');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Public API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.errors?.[0]?.message || errorJson.message || errorJson.error || message;
      } catch {
        // Use default message
      }
      throw new SegmentApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private buildQueryString(params?: Record<string, unknown>): string {
    if (!params) return '';
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.set(key, String(value));
      }
    }
    const qs = queryParams.toString();
    return qs ? `?${qs}` : '';
  }

  // ===========================================================================
  // Connection Test
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      // Try Public API first if we have an access token
      if (this.credentials.accessToken) {
        await this.getWorkspace();
        return { connected: true, message: 'Successfully connected to Segment Public API' };
      }

      // Try Tracking API if we have a write key
      if (this.credentials.writeKey) {
        // Send a simple identify call with minimal data
        await this.identify('segment-mcp-test', { test: true });
        return { connected: true, message: 'Successfully connected to Segment Tracking API' };
      }

      return { connected: false, message: 'No credentials provided' };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Tracking API Methods
  // ===========================================================================

  async identify(
    userId: string,
    traits?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse> {
    const payload: IdentifyPayload = {
      type: 'identify',
      userId,
      traits,
      context,
      anonymousId,
    };
    return this.trackingRequest('/identify', payload);
  }

  async track(
    userId: string,
    event: string,
    properties?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse> {
    const payload: TrackPayload = {
      type: 'track',
      userId,
      event,
      properties,
      context,
      anonymousId,
    };
    return this.trackingRequest('/track', payload);
  }

  async page(
    userId: string,
    name?: string,
    category?: string,
    properties?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse> {
    const payload: PagePayload = {
      type: 'page',
      userId,
      name,
      category,
      properties,
      context,
      anonymousId,
    };
    return this.trackingRequest('/page', payload);
  }

  async screen(
    userId: string,
    name?: string,
    category?: string,
    properties?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse> {
    const payload: ScreenPayload = {
      type: 'screen',
      userId,
      name,
      category,
      properties,
      context,
      anonymousId,
    };
    return this.trackingRequest('/screen', payload);
  }

  async group(
    userId: string,
    groupId: string,
    traits?: Record<string, unknown>,
    context?: Record<string, unknown>,
    anonymousId?: string
  ): Promise<TrackingResponse> {
    const payload: GroupPayload = {
      type: 'group',
      userId,
      groupId,
      traits,
      context,
      anonymousId,
    };
    return this.trackingRequest('/group', payload);
  }

  async alias(
    userId: string,
    previousId: string,
    context?: Record<string, unknown>
  ): Promise<TrackingResponse> {
    const payload: AliasPayload = {
      type: 'alias',
      userId,
      previousId,
      context,
    };
    return this.trackingRequest('/alias', payload);
  }

  async batch(batchPayload: BatchPayload): Promise<TrackingResponse> {
    return this.trackingRequest('/batch', batchPayload);
  }

  // ===========================================================================
  // Public API - Sources
  // ===========================================================================

  async listSources(params?: PaginationParams): Promise<PaginatedResponse<Source>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/sources${qs}`);
  }

  async getSource(sourceId: string): Promise<Source> {
    const response = await this.publicApiRequest<{ data: { source: Source } }>(`/sources/${sourceId}`);
    return response.data.source;
  }

  async createSource(slug: string, name: string, catalogId: string): Promise<Source> {
    const response = await this.publicApiRequest<{ data: { source: Source } }>('/sources', {
      method: 'POST',
      body: JSON.stringify({ slug, name, metadataId: catalogId }),
    });
    return response.data.source;
  }

  async updateSource(sourceId: string, name?: string, enabled?: boolean): Promise<Source> {
    const response = await this.publicApiRequest<{ data: { source: Source } }>(`/sources/${sourceId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, enabled }),
    });
    return response.data.source;
  }

  async deleteSource(sourceId: string): Promise<void> {
    await this.publicApiRequest(`/sources/${sourceId}`, { method: 'DELETE' });
  }

  async getSourceSchemaSettings(sourceId: string): Promise<Record<string, unknown>> {
    const response = await this.publicApiRequest<{ data: { settings: Record<string, unknown> } }>(
      `/sources/${sourceId}/settings`
    );
    return response.data.settings;
  }

  async updateSourceSchemaSettings(sourceId: string, settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await this.publicApiRequest<{ data: { settings: Record<string, unknown> } }>(
      `/sources/${sourceId}/settings`,
      {
        method: 'PATCH',
        body: JSON.stringify(settings),
      }
    );
    return response.data.settings;
  }

  async addLabelsToSource(sourceId: string, labels: Array<{ key: string; value: string }>): Promise<Source> {
    const response = await this.publicApiRequest<{ data: { source: Source } }>(
      `/sources/${sourceId}/labels`,
      {
        method: 'POST',
        body: JSON.stringify({ labels }),
      }
    );
    return response.data.source;
  }

  async listConnectedDestinationsFromSource(sourceId: string): Promise<PaginatedResponse<Destination>> {
    return this.publicApiRequest(`/sources/${sourceId}/connected-destinations`);
  }

  async listConnectedWarehousesFromSource(sourceId: string): Promise<PaginatedResponse<Warehouse>> {
    return this.publicApiRequest(`/sources/${sourceId}/connected-warehouses`);
  }

  async createWriteKeyForSource(sourceId: string): Promise<{ writeKey: string }> {
    const response = await this.publicApiRequest<{ data: { writeKey: string } }>(
      `/sources/${sourceId}/write-key`,
      { method: 'POST' }
    );
    return response.data;
  }

  async removeWriteKeyFromSource(sourceId: string, writeKey: string): Promise<void> {
    await this.publicApiRequest(`/sources/${sourceId}/write-key/${writeKey}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Public API - Destinations
  // ===========================================================================

  async listDestinations(params?: PaginationParams): Promise<PaginatedResponse<Destination>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/destinations${qs}`);
  }

  async getDestination(destinationId: string): Promise<Destination> {
    const response = await this.publicApiRequest<{ data: { destination: Destination } }>(`/destinations/${destinationId}`);
    return response.data.destination;
  }

  async createDestination(
    sourceId: string,
    metadataId: string,
    name: string,
    settings?: Record<string, unknown>,
    enabled = true
  ): Promise<Destination> {
    const response = await this.publicApiRequest<{ data: { destination: Destination } }>('/destinations', {
      method: 'POST',
      body: JSON.stringify({ sourceId, metadataId, name, settings, enabled }),
    });
    return response.data.destination;
  }

  async updateDestination(
    destinationId: string,
    name?: string,
    enabled?: boolean,
    settings?: Record<string, unknown>
  ): Promise<Destination> {
    const response = await this.publicApiRequest<{ data: { destination: Destination } }>(`/destinations/${destinationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, enabled, settings }),
    });
    return response.data.destination;
  }

  async deleteDestination(destinationId: string): Promise<void> {
    await this.publicApiRequest(`/destinations/${destinationId}`, { method: 'DELETE' });
  }

  // Destination Subscriptions
  async listDestinationSubscriptions(destinationId: string): Promise<PaginatedResponse<DestinationSubscription>> {
    return this.publicApiRequest(`/destinations/${destinationId}/subscriptions`);
  }

  async getDestinationSubscription(destinationId: string, subscriptionId: string): Promise<DestinationSubscription> {
    const response = await this.publicApiRequest<{ data: { subscription: DestinationSubscription } }>(
      `/destinations/${destinationId}/subscriptions/${subscriptionId}`
    );
    return response.data.subscription;
  }

  async createDestinationSubscription(
    destinationId: string,
    name: string,
    actionId: string,
    trigger: string,
    enabled = true,
    settings?: Record<string, unknown>
  ): Promise<DestinationSubscription> {
    const response = await this.publicApiRequest<{ data: { subscription: DestinationSubscription } }>(
      `/destinations/${destinationId}/subscriptions`,
      {
        method: 'POST',
        body: JSON.stringify({ name, actionId, trigger, enabled, settings }),
      }
    );
    return response.data.subscription;
  }

  async updateDestinationSubscription(
    destinationId: string,
    subscriptionId: string,
    name?: string,
    enabled?: boolean,
    trigger?: string,
    settings?: Record<string, unknown>
  ): Promise<DestinationSubscription> {
    const response = await this.publicApiRequest<{ data: { subscription: DestinationSubscription } }>(
      `/destinations/${destinationId}/subscriptions/${subscriptionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name, enabled, trigger, settings }),
      }
    );
    return response.data.subscription;
  }

  async deleteDestinationSubscription(destinationId: string, subscriptionId: string): Promise<void> {
    await this.publicApiRequest(`/destinations/${destinationId}/subscriptions/${subscriptionId}`, { method: 'DELETE' });
  }

  // Destination Filters
  async listDestinationFilters(destinationId: string): Promise<PaginatedResponse<DestinationFilter>> {
    return this.publicApiRequest(`/destinations/${destinationId}/filters`);
  }

  async getDestinationFilter(destinationId: string, filterId: string): Promise<DestinationFilter> {
    const response = await this.publicApiRequest<{ data: { filter: DestinationFilter } }>(
      `/destinations/${destinationId}/filters/${filterId}`
    );
    return response.data.filter;
  }

  async createDestinationFilter(
    sourceId: string,
    destinationId: string,
    title: string,
    ifClause: string,
    actions: Array<{ type: string; fields?: Record<string, unknown>; percent?: number }>,
    enabled = true,
    description?: string
  ): Promise<DestinationFilter> {
    const response = await this.publicApiRequest<{ data: { filter: DestinationFilter } }>(
      `/destinations/${destinationId}/filters`,
      {
        method: 'POST',
        body: JSON.stringify({ sourceId, title, if: ifClause, actions, enabled, description }),
      }
    );
    return response.data.filter;
  }

  async updateDestinationFilter(
    destinationId: string,
    filterId: string,
    title?: string,
    ifClause?: string,
    actions?: Array<{ type: string; fields?: Record<string, unknown>; percent?: number }>,
    enabled?: boolean,
    description?: string
  ): Promise<DestinationFilter> {
    const body: Record<string, unknown> = {};
    if (title !== undefined) body.title = title;
    if (ifClause !== undefined) body.if = ifClause;
    if (actions !== undefined) body.actions = actions;
    if (enabled !== undefined) body.enabled = enabled;
    if (description !== undefined) body.description = description;

    const response = await this.publicApiRequest<{ data: { filter: DestinationFilter } }>(
      `/destinations/${destinationId}/filters/${filterId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
    return response.data.filter;
  }

  async deleteDestinationFilter(destinationId: string, filterId: string): Promise<void> {
    await this.publicApiRequest(`/destinations/${destinationId}/filters/${filterId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Public API - Warehouses
  // ===========================================================================

  async listWarehouses(params?: PaginationParams): Promise<PaginatedResponse<Warehouse>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/warehouses${qs}`);
  }

  async getWarehouse(warehouseId: string): Promise<Warehouse> {
    const response = await this.publicApiRequest<{ data: { warehouse: Warehouse } }>(`/warehouses/${warehouseId}`);
    return response.data.warehouse;
  }

  async createWarehouse(
    metadataId: string,
    settings: Record<string, unknown>,
    name?: string,
    enabled = true
  ): Promise<Warehouse> {
    const response = await this.publicApiRequest<{ data: { warehouse: Warehouse } }>('/warehouses', {
      method: 'POST',
      body: JSON.stringify({ metadataId, settings, name, enabled }),
    });
    return response.data.warehouse;
  }

  async updateWarehouse(
    warehouseId: string,
    name?: string,
    enabled?: boolean,
    settings?: Record<string, unknown>
  ): Promise<Warehouse> {
    const response = await this.publicApiRequest<{ data: { warehouse: Warehouse } }>(`/warehouses/${warehouseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, enabled, settings }),
    });
    return response.data.warehouse;
  }

  async deleteWarehouse(warehouseId: string): Promise<void> {
    await this.publicApiRequest(`/warehouses/${warehouseId}`, { method: 'DELETE' });
  }

  async addConnectionFromSourceToWarehouse(warehouseId: string, sourceId: string): Promise<void> {
    await this.publicApiRequest(`/warehouses/${warehouseId}/connected-sources`, {
      method: 'POST',
      body: JSON.stringify({ sourceId }),
    });
  }

  async removeSourceConnectionFromWarehouse(warehouseId: string, sourceId: string): Promise<void> {
    await this.publicApiRequest(`/warehouses/${warehouseId}/connected-sources/${sourceId}`, { method: 'DELETE' });
  }

  async listConnectedSourcesFromWarehouse(warehouseId: string): Promise<PaginatedResponse<Source>> {
    return this.publicApiRequest(`/warehouses/${warehouseId}/connected-sources`);
  }

  // ===========================================================================
  // Public API - Tracking Plans
  // ===========================================================================

  async listTrackingPlans(params?: PaginationParams): Promise<PaginatedResponse<TrackingPlan>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/tracking-plans${qs}`);
  }

  async getTrackingPlan(trackingPlanId: string): Promise<TrackingPlan> {
    const response = await this.publicApiRequest<{ data: { trackingPlan: TrackingPlan } }>(`/tracking-plans/${trackingPlanId}`);
    return response.data.trackingPlan;
  }

  async createTrackingPlan(name: string, type = 'LIVE', description?: string): Promise<TrackingPlan> {
    const response = await this.publicApiRequest<{ data: { trackingPlan: TrackingPlan } }>('/tracking-plans', {
      method: 'POST',
      body: JSON.stringify({ name, type, description }),
    });
    return response.data.trackingPlan;
  }

  async updateTrackingPlan(trackingPlanId: string, name?: string, description?: string): Promise<TrackingPlan> {
    const response = await this.publicApiRequest<{ data: { trackingPlan: TrackingPlan } }>(`/tracking-plans/${trackingPlanId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, description }),
    });
    return response.data.trackingPlan;
  }

  async deleteTrackingPlan(trackingPlanId: string): Promise<void> {
    await this.publicApiRequest(`/tracking-plans/${trackingPlanId}`, { method: 'DELETE' });
  }

  async listTrackingPlanRules(trackingPlanId: string): Promise<PaginatedResponse<TrackingPlanRule>> {
    return this.publicApiRequest(`/tracking-plans/${trackingPlanId}/rules`);
  }

  async updateTrackingPlanRules(trackingPlanId: string, rules: TrackingPlanRule[]): Promise<void> {
    await this.publicApiRequest(`/tracking-plans/${trackingPlanId}/rules`, {
      method: 'PATCH',
      body: JSON.stringify({ rules }),
    });
  }

  async addSourceToTrackingPlan(trackingPlanId: string, sourceId: string): Promise<void> {
    await this.publicApiRequest(`/tracking-plans/${trackingPlanId}/sources`, {
      method: 'POST',
      body: JSON.stringify({ sourceId }),
    });
  }

  async removeSourceFromTrackingPlan(trackingPlanId: string, sourceId: string): Promise<void> {
    await this.publicApiRequest(`/tracking-plans/${trackingPlanId}/sources/${sourceId}`, { method: 'DELETE' });
  }

  async listSourcesFromTrackingPlan(trackingPlanId: string): Promise<PaginatedResponse<Source>> {
    return this.publicApiRequest(`/tracking-plans/${trackingPlanId}/sources`);
  }

  // ===========================================================================
  // Public API - Functions
  // ===========================================================================

  async listFunctions(params?: PaginationParams & { resourceType?: string }): Promise<PaginatedResponse<Function>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/functions${qs}`);
  }

  async getFunction(functionId: string): Promise<Function> {
    const response = await this.publicApiRequest<{ data: { function: Function } }>(`/functions/${functionId}`);
    return response.data.function;
  }

  async createFunction(
    displayName: string,
    code: string,
    resourceType: 'DESTINATION' | 'INSERT_DESTINATION' | 'SOURCE',
    description?: string,
    settings?: Array<{ name: string; label: string; type: string; description?: string; required?: boolean; sensitive?: boolean }>
  ): Promise<Function> {
    const response = await this.publicApiRequest<{ data: { function: Function } }>('/functions', {
      method: 'POST',
      body: JSON.stringify({ displayName, code, resourceType, description, settings }),
    });
    return response.data.function;
  }

  async updateFunction(
    functionId: string,
    displayName?: string,
    code?: string,
    description?: string,
    settings?: Array<{ name: string; label: string; type: string; description?: string; required?: boolean; sensitive?: boolean }>
  ): Promise<Function> {
    const response = await this.publicApiRequest<{ data: { function: Function } }>(`/functions/${functionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName, code, description, settings }),
    });
    return response.data.function;
  }

  async deleteFunction(functionId: string): Promise<void> {
    await this.publicApiRequest(`/functions/${functionId}`, { method: 'DELETE' });
  }

  async deployFunction(functionId: string): Promise<Function> {
    const response = await this.publicApiRequest<{ data: { function: Function } }>(`/functions/${functionId}/deploy`, {
      method: 'POST',
    });
    return response.data.function;
  }

  // ===========================================================================
  // Public API - Transformations
  // ===========================================================================

  async listTransformations(params?: PaginationParams): Promise<PaginatedResponse<Transformation>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/transformations${qs}`);
  }

  async getTransformation(transformationId: string): Promise<Transformation> {
    const response = await this.publicApiRequest<{ data: { transformation: Transformation } }>(`/transformations/${transformationId}`);
    return response.data.transformation;
  }

  async createTransformation(
    sourceId: string,
    name: string,
    ifClause: string,
    newEventName?: string,
    enabled = true,
    destinationMetadataId?: string,
    propertyRenames?: Array<{ oldName: string; newName: string }>,
    fqlDefinedProperties?: Array<{ fql: string; propertyName: string }>
  ): Promise<Transformation> {
    const response = await this.publicApiRequest<{ data: { transformation: Transformation } }>('/transformations', {
      method: 'POST',
      body: JSON.stringify({
        sourceId,
        name,
        if: ifClause,
        newEventName,
        enabled,
        destinationMetadataId,
        propertyRenames,
        fqlDefinedProperties,
      }),
    });
    return response.data.transformation;
  }

  async updateTransformation(
    transformationId: string,
    name?: string,
    ifClause?: string,
    newEventName?: string,
    enabled?: boolean,
    propertyRenames?: Array<{ oldName: string; newName: string }>,
    fqlDefinedProperties?: Array<{ fql: string; propertyName: string }>
  ): Promise<Transformation> {
    const body: Record<string, unknown> = {};
    if (name !== undefined) body.name = name;
    if (ifClause !== undefined) body.if = ifClause;
    if (newEventName !== undefined) body.newEventName = newEventName;
    if (enabled !== undefined) body.enabled = enabled;
    if (propertyRenames !== undefined) body.propertyRenames = propertyRenames;
    if (fqlDefinedProperties !== undefined) body.fqlDefinedProperties = fqlDefinedProperties;

    const response = await this.publicApiRequest<{ data: { transformation: Transformation } }>(`/transformations/${transformationId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data.transformation;
  }

  async deleteTransformation(transformationId: string): Promise<void> {
    await this.publicApiRequest(`/transformations/${transformationId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Public API - Audiences (Engage)
  // ===========================================================================

  async listAudiences(spaceId: string, params?: PaginationParams): Promise<PaginatedResponse<Audience>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/spaces/${spaceId}/audiences${qs}`);
  }

  async getAudience(spaceId: string, audienceId: string): Promise<Audience> {
    const response = await this.publicApiRequest<{ data: { audience: Audience } }>(`/spaces/${spaceId}/audiences/${audienceId}`);
    return response.data.audience;
  }

  async createAudience(
    spaceId: string,
    name: string,
    definition: { query: string; type?: string },
    description?: string,
    enabled = true
  ): Promise<Audience> {
    const response = await this.publicApiRequest<{ data: { audience: Audience } }>(`/spaces/${spaceId}/audiences`, {
      method: 'POST',
      body: JSON.stringify({ name, definition, description, enabled }),
    });
    return response.data.audience;
  }

  async updateAudience(
    spaceId: string,
    audienceId: string,
    name?: string,
    definition?: { query: string; type?: string },
    description?: string,
    enabled?: boolean
  ): Promise<Audience> {
    const response = await this.publicApiRequest<{ data: { audience: Audience } }>(`/spaces/${spaceId}/audiences/${audienceId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, definition, description, enabled }),
    });
    return response.data.audience;
  }

  async deleteAudience(spaceId: string, audienceId: string): Promise<void> {
    await this.publicApiRequest(`/spaces/${spaceId}/audiences/${audienceId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Public API - Computed Traits (Engage)
  // ===========================================================================

  async listComputedTraits(spaceId: string, params?: PaginationParams): Promise<PaginatedResponse<ComputedTrait>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/spaces/${spaceId}/computed-traits${qs}`);
  }

  async getComputedTrait(spaceId: string, traitId: string): Promise<ComputedTrait> {
    const response = await this.publicApiRequest<{ data: { computedTrait: ComputedTrait } }>(`/spaces/${spaceId}/computed-traits/${traitId}`);
    return response.data.computedTrait;
  }

  async createComputedTrait(
    spaceId: string,
    name: string,
    definition: { query: string; type?: string },
    description?: string,
    enabled = true
  ): Promise<ComputedTrait> {
    const response = await this.publicApiRequest<{ data: { computedTrait: ComputedTrait } }>(`/spaces/${spaceId}/computed-traits`, {
      method: 'POST',
      body: JSON.stringify({ name, definition, description, enabled }),
    });
    return response.data.computedTrait;
  }

  async updateComputedTrait(
    spaceId: string,
    traitId: string,
    name?: string,
    definition?: { query: string; type?: string },
    description?: string,
    enabled?: boolean
  ): Promise<ComputedTrait> {
    const response = await this.publicApiRequest<{ data: { computedTrait: ComputedTrait } }>(`/spaces/${spaceId}/computed-traits/${traitId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, definition, description, enabled }),
    });
    return response.data.computedTrait;
  }

  async deleteComputedTrait(spaceId: string, traitId: string): Promise<void> {
    await this.publicApiRequest(`/spaces/${spaceId}/computed-traits/${traitId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Public API - Spaces (Engage)
  // ===========================================================================

  async listSpaces(params?: PaginationParams): Promise<PaginatedResponse<Space>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/spaces${qs}`);
  }

  async getSpace(spaceId: string): Promise<Space> {
    const response = await this.publicApiRequest<{ data: { space: Space } }>(`/spaces/${spaceId}`);
    return response.data.space;
  }

  // ===========================================================================
  // Public API - Reverse ETL
  // ===========================================================================

  async listReverseETLModels(params?: PaginationParams): Promise<PaginatedResponse<ReverseETLModel>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/reverse-etl-models${qs}`);
  }

  async getReverseETLModel(modelId: string): Promise<ReverseETLModel> {
    const response = await this.publicApiRequest<{ data: { reverseEtlModel: ReverseETLModel } }>(`/reverse-etl-models/${modelId}`);
    return response.data.reverseEtlModel;
  }

  async createReverseETLModel(
    sourceId: string,
    name: string,
    query: string,
    queryIdentifierColumn: string,
    description?: string,
    enabled = true,
    scheduleStrategy?: string,
    scheduleConfig?: Record<string, unknown>
  ): Promise<ReverseETLModel> {
    const response = await this.publicApiRequest<{ data: { reverseEtlModel: ReverseETLModel } }>('/reverse-etl-models', {
      method: 'POST',
      body: JSON.stringify({
        sourceId,
        name,
        query,
        queryIdentifierColumn,
        description,
        enabled,
        scheduleStrategy,
        scheduleConfig,
      }),
    });
    return response.data.reverseEtlModel;
  }

  async updateReverseETLModel(
    modelId: string,
    name?: string,
    query?: string,
    description?: string,
    enabled?: boolean,
    scheduleStrategy?: string,
    scheduleConfig?: Record<string, unknown>
  ): Promise<ReverseETLModel> {
    const response = await this.publicApiRequest<{ data: { reverseEtlModel: ReverseETLModel } }>(`/reverse-etl-models/${modelId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, query, description, enabled, scheduleStrategy, scheduleConfig }),
    });
    return response.data.reverseEtlModel;
  }

  async deleteReverseETLModel(modelId: string): Promise<void> {
    await this.publicApiRequest(`/reverse-etl-models/${modelId}`, { method: 'DELETE' });
  }

  async triggerReverseETLSync(modelId: string, subscriptionId: string): Promise<void> {
    await this.publicApiRequest(`/reverse-etl-models/${modelId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ subscriptionId }),
    });
  }

  // ===========================================================================
  // Public API - Users/IAM
  // ===========================================================================

  async listUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/users${qs}`);
  }

  async getUser(userId: string): Promise<User> {
    const response = await this.publicApiRequest<{ data: { user: User } }>(`/users/${userId}`);
    return response.data.user;
  }

  async deleteUsers(userIds: string[]): Promise<void> {
    await this.publicApiRequest('/users', {
      method: 'DELETE',
      body: JSON.stringify({ userIds }),
    });
  }

  async listUserGroups(params?: PaginationParams): Promise<PaginatedResponse<UserGroup>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/groups${qs}`);
  }

  async getUserGroup(groupId: string): Promise<UserGroup> {
    const response = await this.publicApiRequest<{ data: { userGroup: UserGroup } }>(`/groups/${groupId}`);
    return response.data.userGroup;
  }

  async createUserGroup(name: string): Promise<UserGroup> {
    const response = await this.publicApiRequest<{ data: { userGroup: UserGroup } }>('/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return response.data.userGroup;
  }

  async updateUserGroup(groupId: string, name: string): Promise<UserGroup> {
    const response = await this.publicApiRequest<{ data: { userGroup: UserGroup } }>(`/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    return response.data.userGroup;
  }

  async deleteUserGroup(groupId: string): Promise<void> {
    await this.publicApiRequest(`/groups/${groupId}`, { method: 'DELETE' });
  }

  async addUsersToUserGroup(groupId: string, emails: string[]): Promise<void> {
    await this.publicApiRequest(`/groups/${groupId}/users`, {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  }

  async removeUsersFromUserGroup(groupId: string, emails: string[]): Promise<void> {
    await this.publicApiRequest(`/groups/${groupId}/users`, {
      method: 'DELETE',
      body: JSON.stringify({ emails }),
    });
  }

  async listInvites(params?: PaginationParams): Promise<PaginatedResponse<{ email: string }>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/invites${qs}`);
  }

  async createInvites(emails: string[]): Promise<void> {
    await this.publicApiRequest('/invites', {
      method: 'POST',
      body: JSON.stringify({ invites: emails.map((email) => ({ email })) }),
    });
  }

  async deleteInvites(emails: string[]): Promise<void> {
    await this.publicApiRequest('/invites', {
      method: 'DELETE',
      body: JSON.stringify({ emails }),
    });
  }

  // ===========================================================================
  // Public API - Regulations (Deletion/Suppression)
  // ===========================================================================

  async listRegulationsFromSource(sourceId: string, params?: PaginationParams): Promise<PaginatedResponse<Regulation>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/sources/${sourceId}/regulations${qs}`);
  }

  async createSourceRegulation(
    sourceId: string,
    regulationType: string,
    subjectType: string,
    subjectIds: string[]
  ): Promise<Regulation> {
    const response = await this.publicApiRequest<{ data: { regulation: Regulation } }>(`/sources/${sourceId}/regulations`, {
      method: 'POST',
      body: JSON.stringify({ regulationType, subjectType, subjectIds }),
    });
    return response.data.regulation;
  }

  async getRegulation(regulationId: string): Promise<Regulation> {
    const response = await this.publicApiRequest<{ data: { regulation: Regulation } }>(`/regulations/${regulationId}`);
    return response.data.regulation;
  }

  async deleteRegulation(regulationId: string): Promise<void> {
    await this.publicApiRequest(`/regulations/${regulationId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Public API - Catalog
  // ===========================================================================

  async getSourcesCatalog(params?: PaginationParams): Promise<PaginatedResponse<CatalogItem>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/catalog/sources${qs}`);
  }

  async getSourceMetadata(sourceMetadataId: string): Promise<CatalogItem> {
    const response = await this.publicApiRequest<{ data: { sourceMetadata: CatalogItem } }>(`/catalog/sources/${sourceMetadataId}`);
    return response.data.sourceMetadata;
  }

  async getDestinationsCatalog(params?: PaginationParams): Promise<PaginatedResponse<CatalogItem>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/catalog/destinations${qs}`);
  }

  async getDestinationMetadata(destinationMetadataId: string): Promise<CatalogItem> {
    const response = await this.publicApiRequest<{ data: { destinationMetadata: CatalogItem } }>(`/catalog/destinations/${destinationMetadataId}`);
    return response.data.destinationMetadata;
  }

  async getWarehousesCatalog(params?: PaginationParams): Promise<PaginatedResponse<CatalogItem>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/catalog/warehouses${qs}`);
  }

  async getWarehouseMetadata(warehouseMetadataId: string): Promise<CatalogItem> {
    const response = await this.publicApiRequest<{ data: { warehouseMetadata: CatalogItem } }>(`/catalog/warehouses/${warehouseMetadataId}`);
    return response.data.warehouseMetadata;
  }

  // ===========================================================================
  // Public API - Labels
  // ===========================================================================

  async listLabels(params?: PaginationParams): Promise<PaginatedResponse<{ key: string; value: string; description?: string }>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/labels${qs}`);
  }

  async createLabel(key: string, value: string, description?: string): Promise<{ key: string; value: string; description?: string }> {
    const response = await this.publicApiRequest<{ data: { label: { key: string; value: string; description?: string } } }>('/labels', {
      method: 'POST',
      body: JSON.stringify({ key, value, description }),
    });
    return response.data.label;
  }

  async deleteLabel(key: string, value: string): Promise<void> {
    await this.publicApiRequest(`/labels/${key}:${value}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Public API - Audit Trail
  // ===========================================================================

  async listAuditEvents(params?: PaginationParams & { resourceId?: string; resourceType?: string }): Promise<PaginatedResponse<AuditEvent>> {
    const qs = this.buildQueryString(params);
    return this.publicApiRequest(`/audit-events${qs}`);
  }

  // ===========================================================================
  // Public API - Workspace
  // ===========================================================================

  async getWorkspace(): Promise<Workspace> {
    const response = await this.publicApiRequest<{ data: { workspace: Workspace } }>('/');
    return response.data.workspace;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Segment client instance with tenant-specific credentials.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createSegmentClient(credentials: TenantCredentials): SegmentClient {
  return new SegmentClientImpl(credentials);
}
