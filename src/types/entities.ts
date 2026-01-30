/**
 * Segment Entity Types
 *
 * Type definitions for Segment API entities including
 * Tracking API payloads and Public API resources.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  [key: string]: unknown;
  /** Number of items to return */
  count?: number;
  /** Cursor for pagination */
  cursor?: string;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];
  /** Pagination info */
  pagination?: {
    current?: string;
    next?: string;
    previous?: string;
    totalEntries?: number;
  };
}

// =============================================================================
// Tracking API Types
// =============================================================================

/** Common context object for all tracking calls */
export interface SegmentContext {
  active?: boolean;
  app?: {
    name?: string;
    version?: string;
    build?: string;
  };
  campaign?: {
    name?: string;
    source?: string;
    medium?: string;
    term?: string;
    content?: string;
  };
  device?: {
    id?: string;
    advertisingId?: string;
    manufacturer?: string;
    model?: string;
    name?: string;
    type?: string;
  };
  ip?: string;
  library?: {
    name?: string;
    version?: string;
  };
  locale?: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    region?: string;
    speed?: number;
  };
  network?: {
    bluetooth?: boolean;
    carrier?: string;
    cellular?: boolean;
    wifi?: boolean;
  };
  os?: {
    name?: string;
    version?: string;
  };
  page?: {
    path?: string;
    referrer?: string;
    search?: string;
    title?: string;
    url?: string;
  };
  screen?: {
    width?: number;
    height?: number;
    density?: number;
  };
  timezone?: string;
  userAgent?: string;
  userAgentData?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Base tracking payload */
export interface BaseTrackingPayload {
  userId?: string;
  anonymousId?: string;
  context?: SegmentContext;
  integrations?: Record<string, boolean | Record<string, unknown>>;
  messageId?: string;
  timestamp?: string;
}

/** Identify call payload */
export interface IdentifyPayload extends BaseTrackingPayload {
  type: 'identify';
  traits?: Record<string, unknown>;
}

/** Track call payload */
export interface TrackPayload extends BaseTrackingPayload {
  type: 'track';
  event: string;
  properties?: Record<string, unknown>;
}

/** Page call payload */
export interface PagePayload extends BaseTrackingPayload {
  type: 'page';
  name?: string;
  category?: string;
  properties?: Record<string, unknown>;
}

/** Screen call payload */
export interface ScreenPayload extends BaseTrackingPayload {
  type: 'screen';
  name?: string;
  category?: string;
  properties?: Record<string, unknown>;
}

/** Group call payload */
export interface GroupPayload extends BaseTrackingPayload {
  type: 'group';
  groupId: string;
  traits?: Record<string, unknown>;
}

/** Alias call payload */
export interface AliasPayload extends BaseTrackingPayload {
  type: 'alias';
  previousId: string;
}

/** Batch call payload */
export interface BatchPayload {
  batch: Array<IdentifyPayload | TrackPayload | PagePayload | ScreenPayload | GroupPayload | AliasPayload>;
  context?: SegmentContext;
  integrations?: Record<string, boolean | Record<string, unknown>>;
}

/** Tracking API response */
export interface TrackingResponse {
  success: boolean;
}

// =============================================================================
// Public API Types - Sources
// =============================================================================

export interface Source {
  id: string;
  slug: string;
  name: string;
  workspaceId: string;
  enabled: boolean;
  writeKeys: string[];
  metadata: SourceMetadata;
  settings?: Record<string, unknown>;
  labels?: Label[];
  schemaSettings?: SchemaSettings;
}

export interface SourceMetadata {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logos?: {
    default?: string;
    mark?: string;
    alt?: string;
  };
  categories?: string[];
  isCloudEventSource?: boolean;
}

export interface SchemaSettings {
  track?: TrackSettings;
  identify?: IdentifySettings;
  group?: GroupSettings;
  forwardingBlockedEventsTo?: string;
  forwardingViolationsTo?: string;
}

export interface TrackSettings {
  allowUnplannedEvents?: boolean;
  allowUnplannedEventProperties?: boolean;
  allowEventOnViolations?: boolean;
  allowPropertiesOnViolations?: boolean;
  commonEventOnViolations?: 'ALLOW' | 'BLOCK' | 'OMIT_PROPERTIES';
}

export interface IdentifySettings {
  allowUnplannedTraits?: boolean;
  allowTraitsOnViolations?: boolean;
  commonEventOnViolations?: 'ALLOW' | 'BLOCK' | 'OMIT_TRAITS';
}

export interface GroupSettings {
  allowUnplannedTraits?: boolean;
  allowTraitsOnViolations?: boolean;
  commonEventOnViolations?: 'ALLOW' | 'BLOCK' | 'OMIT_TRAITS';
}

export interface Label {
  key: string;
  value: string;
  description?: string;
}

// =============================================================================
// Public API Types - Destinations
// =============================================================================

export interface Destination {
  id: string;
  name: string;
  enabled: boolean;
  sourceId: string;
  metadata: DestinationMetadata;
  settings?: Record<string, unknown>;
}

export interface DestinationMetadata {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logos?: {
    default?: string;
    mark?: string;
    alt?: string;
  };
  categories?: string[];
  status: 'PUBLIC' | 'PRIVATE' | 'BETA';
  supportedPlatforms?: {
    browser?: boolean;
    mobile?: boolean;
    server?: boolean;
  };
  supportedMethods?: {
    identify?: boolean;
    track?: boolean;
    page?: boolean;
    screen?: boolean;
    group?: boolean;
    alias?: boolean;
  };
  actions?: DestinationAction[];
}

export interface DestinationAction {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface DestinationSubscription {
  id: string;
  name: string;
  enabled: boolean;
  destinationId: string;
  actionId: string;
  actionSlug: string;
  trigger: string;
  settings?: Record<string, unknown>;
  modelId?: string;
}

export interface DestinationFilter {
  id: string;
  sourceId: string;
  destinationId: string;
  title: string;
  description?: string;
  if: string;
  actions: DestinationFilterAction[];
  enabled: boolean;
}

export interface DestinationFilterAction {
  type: 'drop_event' | 'sample_event' | 'allow_properties' | 'drop_properties';
  fields?: Record<string, unknown>;
  percent?: number;
}

// =============================================================================
// Public API Types - Warehouses
// =============================================================================

export interface Warehouse {
  id: string;
  name?: string;
  workspaceId: string;
  enabled: boolean;
  metadata: WarehouseMetadata;
  settings?: Record<string, unknown>;
}

export interface WarehouseMetadata {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logos?: {
    default?: string;
    mark?: string;
    alt?: string;
  };
}

// =============================================================================
// Public API Types - Tracking Plans
// =============================================================================

export interface TrackingPlan {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  type: 'ENGAGE' | 'LIVE' | 'PROPERTY_LIBRARY' | 'RULE_LIBRARY' | 'TEMPLATE';
  createdAt: string;
  updatedAt: string;
}

export interface TrackingPlanRule {
  key: string;
  type: 'COMMON' | 'GROUP' | 'IDENTIFY' | 'PAGE' | 'SCREEN' | 'TRACK';
  jsonSchema: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Public API Types - Functions
// =============================================================================

export interface Function {
  id: string;
  workspaceId: string;
  displayName: string;
  description?: string;
  resourceType: 'DESTINATION' | 'INSERT_DESTINATION' | 'SOURCE';
  code: string;
  deployedAt?: string;
  settings?: FunctionSetting[];
  buildpack?: string;
  catalogId?: string;
  logoUrl?: string;
  isLatestVersion?: boolean;
}

export interface FunctionSetting {
  name: string;
  label: string;
  type: 'ARRAY' | 'BOOLEAN' | 'STRING' | 'TEXT_MAP';
  description?: string;
  required?: boolean;
  sensitive?: boolean;
}

// =============================================================================
// Public API Types - Audiences (Engage)
// =============================================================================

export interface Audience {
  id: string;
  spaceId: string;
  name: string;
  description?: string;
  key: string;
  definition: AudienceDefinition;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  modifiedBy?: string;
  status?: 'disabled' | 'enabled' | 'stale';
}

export interface AudienceDefinition {
  query: string;
  type: 'USERS' | 'ACCOUNTS';
}

// =============================================================================
// Public API Types - Computed Traits (Engage)
// =============================================================================

export interface ComputedTrait {
  id: string;
  spaceId: string;
  name: string;
  description?: string;
  key: string;
  definition: ComputedTraitDefinition;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  status?: 'disabled' | 'enabled' | 'stale';
}

export interface ComputedTraitDefinition {
  query: string;
  type: 'USERS' | 'ACCOUNTS';
}

// =============================================================================
// Public API Types - Spaces (Engage)
// =============================================================================

export interface Space {
  id: string;
  slug: string;
  name: string;
}

// =============================================================================
// Public API Types - Transformations
// =============================================================================

export interface Transformation {
  id: string;
  name: string;
  sourceId: string;
  destinationMetadataId?: string;
  enabled: boolean;
  if: string;
  newEventName?: string;
  propertyRenames?: PropertyRename[];
  fqlDefinedProperties?: FQLDefinedProperty[];
  hashPropertiesConfiguration?: HashPropertyConfiguration;
}

export interface PropertyRename {
  oldName: string;
  newName: string;
}

export interface FQLDefinedProperty {
  fql: string;
  propertyName: string;
}

export interface HashPropertyConfiguration {
  algorithm: 'MD5' | 'SHA1' | 'SHA256' | 'SHA384' | 'SHA512';
  encoding: 'BASE64' | 'HEX';
  key?: string;
  properties: string[];
}

// =============================================================================
// Public API Types - Reverse ETL
// =============================================================================

export interface ReverseETLModel {
  id: string;
  sourceId: string;
  name: string;
  description?: string;
  enabled: boolean;
  scheduleStrategy: string;
  scheduleConfig?: Record<string, unknown>;
  query: string;
  queryIdentifierColumn: string;
}

// =============================================================================
// Public API Types - Users/IAM
// =============================================================================

export interface User {
  id: string;
  name?: string;
  email: string;
}

export interface UserGroup {
  id: string;
  name: string;
  memberCount?: number;
}

export interface Invite {
  email: string;
  permissions?: Permission[];
}

export interface Permission {
  roleId: string;
  resources?: PermissionResource[];
}

export interface PermissionResource {
  id: string;
  type: string;
  labels?: Label[];
}

// =============================================================================
// Public API Types - Workspace
// =============================================================================

export interface Workspace {
  id: string;
  slug: string;
  name: string;
}

// =============================================================================
// Public API Types - Regulations (Deletion/Suppression)
// =============================================================================

export interface Regulation {
  id: string;
  workspaceId: string;
  overallStatus: 'FAILED' | 'FINISHED' | 'INITIALIZED' | 'INVALID' | 'NOT_SUPPORTED' | 'PARTIAL_SUCCESS' | 'RUNNING';
  createdAt: string;
  finishedAt?: string;
  streamStatus?: RegulationStreamStatus[];
}

export interface RegulationStreamStatus {
  destinationStatus: DestinationRegulationStatus[];
}

export interface DestinationRegulationStatus {
  id: string;
  name: string;
  status: string;
  errString?: string;
  errDetail?: string;
  finishedAt?: string;
}

// =============================================================================
// Public API Types - Catalog
// =============================================================================

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logos?: {
    default?: string;
    mark?: string;
    alt?: string;
  };
  categories?: string[];
}

// =============================================================================
// Public API Types - Audit Trail
// =============================================================================

export interface AuditEvent {
  id: string;
  workspaceId: string;
  type: string;
  actor: {
    id: string;
    email?: string;
    type: 'API_TOKEN' | 'USER';
  };
  timestamp: string;
  resourceId?: string;
  resourceType?: string;
  resourceName?: string;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';
