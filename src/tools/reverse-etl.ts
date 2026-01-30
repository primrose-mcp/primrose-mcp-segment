/**
 * Segment Reverse ETL Tools
 *
 * Tools for managing Segment Reverse ETL models.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Reverse ETL tools
 */
export function registerReverseETLTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // List Reverse ETL Models
  // ===========================================================================
  server.tool(
    'segment_list_reverse_etl_models',
    `List all Reverse ETL models.

Reverse ETL models sync data from warehouses back to destinations.

Args:
  - count: Number of models to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of Reverse ETL models.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listReverseETLModels({ count, cursor });
        return formatResponse(result, format, 'reverse-etl-models');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Reverse ETL Model
  // ===========================================================================
  server.tool(
    'segment_get_reverse_etl_model',
    `Get details for a specific Reverse ETL model.

Args:
  - modelId: The model ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Reverse ETL model details including query and schedule.`,
    {
      modelId: z.string().describe('Model ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ modelId, format }) => {
      try {
        const model = await client.getReverseETLModel(modelId);
        return formatResponse(model, format, 'reverse-etl-model');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Reverse ETL Model
  // ===========================================================================
  server.tool(
    'segment_create_reverse_etl_model',
    `Create a new Reverse ETL model.

Args:
  - sourceId: The warehouse source ID (required)
  - name: Model name (required)
  - query: SQL query to extract data (required)
  - queryIdentifierColumn: Column to use as unique identifier (required)
  - description: Model description
  - enabled: Whether enabled (default: true)
  - scheduleStrategy: Schedule strategy (e.g., 'PERIODIC')
  - scheduleConfig: Schedule configuration (e.g., { intervalMinutes: 60 })

Returns:
  The created Reverse ETL model.`,
    {
      sourceId: z.string().describe('Warehouse source ID'),
      name: z.string().describe('Model name'),
      query: z.string().describe('SQL query'),
      queryIdentifierColumn: z.string().describe('Unique identifier column'),
      description: z.string().optional(),
      enabled: z.boolean().default(true),
      scheduleStrategy: z.string().optional(),
      scheduleConfig: z.record(z.string(), z.unknown()).optional(),
    },
    async ({ sourceId, name, query, queryIdentifierColumn, description, enabled, scheduleStrategy, scheduleConfig }) => {
      try {
        const model = await client.createReverseETLModel(
          sourceId,
          name,
          query,
          queryIdentifierColumn,
          description,
          enabled,
          scheduleStrategy,
          scheduleConfig as Record<string, unknown>
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Reverse ETL model created', model }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Reverse ETL Model
  // ===========================================================================
  server.tool(
    'segment_update_reverse_etl_model',
    `Update a Reverse ETL model.

Args:
  - modelId: The model ID (required)
  - name: New name
  - query: New SQL query
  - description: New description
  - enabled: Enable or disable
  - scheduleStrategy: New schedule strategy
  - scheduleConfig: New schedule configuration

Returns:
  The updated Reverse ETL model.`,
    {
      modelId: z.string().describe('Model ID'),
      name: z.string().optional(),
      query: z.string().optional(),
      description: z.string().optional(),
      enabled: z.boolean().optional(),
      scheduleStrategy: z.string().optional(),
      scheduleConfig: z.record(z.string(), z.unknown()).optional(),
    },
    async ({ modelId, name, query, description, enabled, scheduleStrategy, scheduleConfig }) => {
      try {
        const model = await client.updateReverseETLModel(
          modelId,
          name,
          query,
          description,
          enabled,
          scheduleStrategy,
          scheduleConfig as Record<string, unknown>
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Reverse ETL model updated', model }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Reverse ETL Model
  // ===========================================================================
  server.tool(
    'segment_delete_reverse_etl_model',
    `Delete a Reverse ETL model.

WARNING: This action is irreversible.

Args:
  - modelId: The model ID (required)

Returns:
  Confirmation of deletion.`,
    {
      modelId: z.string().describe('Model ID'),
    },
    async ({ modelId }) => {
      try {
        await client.deleteReverseETLModel(modelId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Reverse ETL model ${modelId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Trigger Reverse ETL Sync
  // ===========================================================================
  server.tool(
    'segment_trigger_reverse_etl_sync',
    `Manually trigger a Reverse ETL sync.

Args:
  - modelId: The model ID (required)
  - subscriptionId: The subscription ID (required)

Returns:
  Confirmation that sync was triggered.`,
    {
      modelId: z.string().describe('Model ID'),
      subscriptionId: z.string().describe('Subscription ID'),
    },
    async ({ modelId, subscriptionId }) => {
      try {
        await client.triggerReverseETLSync(modelId, subscriptionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Reverse ETL sync triggered' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
