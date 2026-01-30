/**
 * Segment Sources Tools
 *
 * Tools for managing Segment sources via the Public API.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Sources tools
 */
export function registerSourcesTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // List Sources
  // ===========================================================================
  server.tool(
    'segment_list_sources',
    `List all sources in the workspace.

Returns a paginated list of sources. Use the cursor from the response to fetch the next page.

Args:
  - count: Number of sources to return (default: 20)
  - cursor: Pagination cursor from previous response
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of sources with their IDs, names, slugs, and enabled status.`,
    {
      count: z.number().int().min(1).max(100).default(20).describe('Number of sources to return'),
      cursor: z.string().optional().describe('Pagination cursor from previous response'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listSources({ count, cursor });
        return formatResponse(result, format, 'sources');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Source
  // ===========================================================================
  server.tool(
    'segment_get_source',
    `Get details for a specific source.

Args:
  - sourceId: The source ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Source details including ID, name, slug, write keys, metadata, and settings.`,
    {
      sourceId: z.string().describe('Source ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ sourceId, format }) => {
      try {
        const source = await client.getSource(sourceId);
        return formatResponse(source, format, 'source');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Source
  // ===========================================================================
  server.tool(
    'segment_create_source',
    `Create a new source in the workspace.

Args:
  - slug: Unique slug for the source (required)
  - name: Display name for the source (required)
  - catalogId: The source catalog ID (use segment_get_sources_catalog to find IDs)

Returns:
  The created source object.`,
    {
      slug: z.string().describe('Unique slug for the source'),
      name: z.string().describe('Display name for the source'),
      catalogId: z.string().describe('Source catalog ID (e.g., catalog/sources/javascript)'),
    },
    async ({ slug, name, catalogId }) => {
      try {
        const source = await client.createSource(slug, name, catalogId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Source created', source }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Source
  // ===========================================================================
  server.tool(
    'segment_update_source',
    `Update an existing source.

Args:
  - sourceId: The source ID to update (required)
  - name: New display name
  - enabled: Enable or disable the source

Returns:
  The updated source object.`,
    {
      sourceId: z.string().describe('Source ID to update'),
      name: z.string().optional().describe('New display name'),
      enabled: z.boolean().optional().describe('Enable or disable the source'),
    },
    async ({ sourceId, name, enabled }) => {
      try {
        const source = await client.updateSource(sourceId, name, enabled);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Source updated', source }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Source
  // ===========================================================================
  server.tool(
    'segment_delete_source',
    `Delete a source from the workspace.

WARNING: This action is irreversible. All data associated with the source will be deleted.

Args:
  - sourceId: The source ID to delete (required)

Returns:
  Confirmation of deletion.`,
    {
      sourceId: z.string().describe('Source ID to delete'),
    },
    async ({ sourceId }) => {
      try {
        await client.deleteSource(sourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Source ${sourceId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Source Schema Settings
  // ===========================================================================
  server.tool(
    'segment_get_source_schema_settings',
    `Get schema settings for a source.

Schema settings control how Segment validates tracking data.

Args:
  - sourceId: The source ID (required)

Returns:
  Schema settings including track, identify, and group settings.`,
    {
      sourceId: z.string().describe('Source ID'),
    },
    async ({ sourceId }) => {
      try {
        const settings = await client.getSourceSchemaSettings(sourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(settings, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Source Schema Settings
  // ===========================================================================
  server.tool(
    'segment_update_source_schema_settings',
    `Update schema settings for a source.

Args:
  - sourceId: The source ID (required)
  - settings: Schema settings object

Returns:
  Updated schema settings.`,
    {
      sourceId: z.string().describe('Source ID'),
      settings: z.record(z.string(), z.unknown()).describe('Schema settings to update'),
    },
    async ({ sourceId, settings }) => {
      try {
        const result = await client.updateSourceSchemaSettings(sourceId, settings as Record<string, unknown>);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Schema settings updated', settings: result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Labels to Source
  // ===========================================================================
  server.tool(
    'segment_add_labels_to_source',
    `Add labels to a source for organization and filtering.

Args:
  - sourceId: The source ID (required)
  - labels: Array of {key, value} label objects

Returns:
  The updated source object.`,
    {
      sourceId: z.string().describe('Source ID'),
      labels: z.array(z.object({
        key: z.string(),
        value: z.string(),
      })).describe('Labels to add'),
    },
    async ({ sourceId, labels }) => {
      try {
        const source = await client.addLabelsToSource(sourceId, labels);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Labels added', source }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Connected Destinations from Source
  // ===========================================================================
  server.tool(
    'segment_list_connected_destinations_from_source',
    `List all destinations connected to a source.

Args:
  - sourceId: The source ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of destinations connected to the source.`,
    {
      sourceId: z.string().describe('Source ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ sourceId, format }) => {
      try {
        const result = await client.listConnectedDestinationsFromSource(sourceId);
        return formatResponse(result, format, 'destinations');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Connected Warehouses from Source
  // ===========================================================================
  server.tool(
    'segment_list_connected_warehouses_from_source',
    `List all warehouses connected to a source.

Args:
  - sourceId: The source ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of warehouses connected to the source.`,
    {
      sourceId: z.string().describe('Source ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ sourceId, format }) => {
      try {
        const result = await client.listConnectedWarehousesFromSource(sourceId);
        return formatResponse(result, format, 'warehouses');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Write Key for Source
  // ===========================================================================
  server.tool(
    'segment_create_write_key_for_source',
    `Create a new write key for a source.

Write keys are used to authenticate tracking API requests.

Args:
  - sourceId: The source ID (required)

Returns:
  The new write key.`,
    {
      sourceId: z.string().describe('Source ID'),
    },
    async ({ sourceId }) => {
      try {
        const result = await client.createWriteKeyForSource(sourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Write key created', writeKey: result.writeKey }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Write Key from Source
  // ===========================================================================
  server.tool(
    'segment_remove_write_key_from_source',
    `Remove a write key from a source.

WARNING: This will invalidate the write key and any systems using it will stop working.

Args:
  - sourceId: The source ID (required)
  - writeKey: The write key to remove (required)

Returns:
  Confirmation of removal.`,
    {
      sourceId: z.string().describe('Source ID'),
      writeKey: z.string().describe('Write key to remove'),
    },
    async ({ sourceId, writeKey }) => {
      try {
        await client.removeWriteKeyFromSource(sourceId, writeKey);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Write key removed' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
