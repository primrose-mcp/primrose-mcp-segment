/**
 * Response Formatting Utilities for Segment MCP Server
 */

import type {
  Audience,
  ComputedTrait,
  Destination,
  Function,
  PaginatedResponse,
  ResponseFormat,
  Source,
  TrackingPlan,
  Transformation,
  Warehouse,
} from '../types/entities.js';
import { SegmentApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof SegmentApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).data)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  const count = data.data.length;
  const total = data.pagination?.totalEntries;

  if (total !== undefined) {
    lines.push(`**Total:** ${total} | **Showing:** ${count}`);
  } else {
    lines.push(`**Showing:** ${count}`);
  }

  if (data.pagination?.next) {
    lines.push(`**More available:** Yes (cursor: \`${data.pagination.next}\`)`);
  }
  lines.push('');

  if (data.data.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  // Format items based on entity type
  switch (entityType) {
    case 'sources':
      lines.push(formatSourcesTable(data.data as Source[]));
      break;
    case 'destinations':
      lines.push(formatDestinationsTable(data.data as Destination[]));
      break;
    case 'warehouses':
      lines.push(formatWarehousesTable(data.data as Warehouse[]));
      break;
    case 'tracking-plans':
      lines.push(formatTrackingPlansTable(data.data as TrackingPlan[]));
      break;
    case 'functions':
      lines.push(formatFunctionsTable(data.data as Function[]));
      break;
    case 'audiences':
      lines.push(formatAudiencesTable(data.data as Audience[]));
      break;
    case 'computed-traits':
      lines.push(formatComputedTraitsTable(data.data as ComputedTrait[]));
      break;
    case 'transformations':
      lines.push(formatTransformationsTable(data.data as Transformation[]));
      break;
    default:
      lines.push(formatGenericTable(data.data));
  }

  return lines.join('\n');
}

/**
 * Format sources as Markdown table
 */
function formatSourcesTable(sources: Source[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Slug | Enabled |');
  lines.push('|---|---|---|---|');

  for (const source of sources) {
    lines.push(
      `| ${source.id} | ${source.name} | ${source.slug} | ${source.enabled ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format destinations as Markdown table
 */
function formatDestinationsTable(destinations: Destination[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Enabled |');
  lines.push('|---|---|---|---|');

  for (const dest of destinations) {
    lines.push(
      `| ${dest.id} | ${dest.name} | ${dest.metadata?.name || '-'} | ${dest.enabled ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format warehouses as Markdown table
 */
function formatWarehousesTable(warehouses: Warehouse[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Enabled |');
  lines.push('|---|---|---|---|');

  for (const wh of warehouses) {
    lines.push(
      `| ${wh.id} | ${wh.name || '-'} | ${wh.metadata?.name || '-'} | ${wh.enabled ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format tracking plans as Markdown table
 */
function formatTrackingPlansTable(plans: TrackingPlan[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Updated |');
  lines.push('|---|---|---|---|');

  for (const plan of plans) {
    lines.push(
      `| ${plan.id} | ${plan.name} | ${plan.type} | ${plan.updatedAt || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format functions as Markdown table
 */
function formatFunctionsTable(functions: Function[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Deployed |');
  lines.push('|---|---|---|---|');

  for (const fn of functions) {
    lines.push(
      `| ${fn.id} | ${fn.displayName} | ${fn.resourceType} | ${fn.deployedAt || 'Not deployed'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format audiences as Markdown table
 */
function formatAudiencesTable(audiences: Audience[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Key | Status | Enabled |');
  lines.push('|---|---|---|---|---|');

  for (const aud of audiences) {
    lines.push(
      `| ${aud.id} | ${aud.name} | ${aud.key} | ${aud.status || '-'} | ${aud.enabled ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format computed traits as Markdown table
 */
function formatComputedTraitsTable(traits: ComputedTrait[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Key | Status | Enabled |');
  lines.push('|---|---|---|---|---|');

  for (const trait of traits) {
    lines.push(
      `| ${trait.id} | ${trait.name} | ${trait.key} | ${trait.status || '-'} | ${trait.enabled ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format transformations as Markdown table
 */
function formatTransformationsTable(transformations: Transformation[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Source ID | Enabled |');
  lines.push('|---|---|---|---|');

  for (const t of transformations) {
    lines.push(
      `| ${t.id} | ${t.name} | ${t.sourceId} | ${t.enabled ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5);

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  return formatGenericTable(data);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
