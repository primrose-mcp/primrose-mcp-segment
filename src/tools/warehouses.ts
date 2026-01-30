/**
 * Segment Warehouses Tools
 *
 * Tools for managing Segment warehouses via the Public API.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Warehouses tools
 */
export function registerWarehousesTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // List Warehouses
  // ===========================================================================
  server.tool(
    'segment_list_warehouses',
    `List all warehouses in the workspace.

Returns a paginated list of data warehouses (Snowflake, BigQuery, Redshift, etc.).

Args:
  - count: Number of warehouses to return (default: 20)
  - cursor: Pagination cursor from previous response
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of warehouses with their IDs, names, types, and enabled status.`,
    {
      count: z.number().int().min(1).max(100).default(20).describe('Number of warehouses to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listWarehouses({ count, cursor });
        return formatResponse(result, format, 'warehouses');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Warehouse
  // ===========================================================================
  server.tool(
    'segment_get_warehouse',
    `Get details for a specific warehouse.

Args:
  - warehouseId: The warehouse ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Warehouse details including settings, metadata, and connection info.`,
    {
      warehouseId: z.string().describe('Warehouse ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ warehouseId, format }) => {
      try {
        const warehouse = await client.getWarehouse(warehouseId);
        return formatResponse(warehouse, format, 'warehouse');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Warehouse
  // ===========================================================================
  server.tool(
    'segment_create_warehouse',
    `Create a new warehouse.

Args:
  - metadataId: The warehouse catalog ID (use segment_get_warehouses_catalog)
  - settings: Warehouse-specific settings (credentials, database, schema, etc.)
  - name: Display name for the warehouse
  - enabled: Whether the warehouse is enabled (default: true)

Returns:
  The created warehouse object.`,
    {
      metadataId: z.string().describe('Warehouse catalog ID'),
      settings: z.record(z.string(), z.unknown()).describe('Warehouse-specific settings'),
      name: z.string().optional().describe('Display name'),
      enabled: z.boolean().default(true).describe('Whether enabled'),
    },
    async ({ metadataId, settings, name, enabled }) => {
      try {
        const warehouse = await client.createWarehouse(metadataId, settings as Record<string, unknown>, name, enabled);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Warehouse created', warehouse }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Warehouse
  // ===========================================================================
  server.tool(
    'segment_update_warehouse',
    `Update an existing warehouse.

Args:
  - warehouseId: The warehouse ID to update (required)
  - name: New display name
  - enabled: Enable or disable the warehouse
  - settings: Updated warehouse-specific settings

Returns:
  The updated warehouse object.`,
    {
      warehouseId: z.string().describe('Warehouse ID to update'),
      name: z.string().optional().describe('New display name'),
      enabled: z.boolean().optional().describe('Enable or disable'),
      settings: z.record(z.string(), z.unknown()).optional().describe('Updated settings'),
    },
    async ({ warehouseId, name, enabled, settings }) => {
      try {
        const warehouse = await client.updateWarehouse(warehouseId, name, enabled, settings as Record<string, unknown>);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Warehouse updated', warehouse }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Warehouse
  // ===========================================================================
  server.tool(
    'segment_delete_warehouse',
    `Delete a warehouse.

WARNING: This action is irreversible.

Args:
  - warehouseId: The warehouse ID to delete (required)

Returns:
  Confirmation of deletion.`,
    {
      warehouseId: z.string().describe('Warehouse ID to delete'),
    },
    async ({ warehouseId }) => {
      try {
        await client.deleteWarehouse(warehouseId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Warehouse ${warehouseId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Source Connection to Warehouse
  // ===========================================================================
  server.tool(
    'segment_add_source_connection_to_warehouse',
    `Connect a source to a warehouse.

This enables data from the source to be synced to the warehouse.

Args:
  - warehouseId: The warehouse ID (required)
  - sourceId: The source ID to connect (required)

Returns:
  Confirmation of connection.`,
    {
      warehouseId: z.string().describe('Warehouse ID'),
      sourceId: z.string().describe('Source ID to connect'),
    },
    async ({ warehouseId, sourceId }) => {
      try {
        await client.addConnectionFromSourceToWarehouse(warehouseId, sourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Source ${sourceId} connected to warehouse` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Source Connection from Warehouse
  // ===========================================================================
  server.tool(
    'segment_remove_source_connection_from_warehouse',
    `Disconnect a source from a warehouse.

Args:
  - warehouseId: The warehouse ID (required)
  - sourceId: The source ID to disconnect (required)

Returns:
  Confirmation of disconnection.`,
    {
      warehouseId: z.string().describe('Warehouse ID'),
      sourceId: z.string().describe('Source ID to disconnect'),
    },
    async ({ warehouseId, sourceId }) => {
      try {
        await client.removeSourceConnectionFromWarehouse(warehouseId, sourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Source ${sourceId} disconnected from warehouse` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Connected Sources from Warehouse
  // ===========================================================================
  server.tool(
    'segment_list_connected_sources_from_warehouse',
    `List all sources connected to a warehouse.

Args:
  - warehouseId: The warehouse ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of sources connected to the warehouse.`,
    {
      warehouseId: z.string().describe('Warehouse ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ warehouseId, format }) => {
      try {
        const result = await client.listConnectedSourcesFromWarehouse(warehouseId);
        return formatResponse(result, format, 'sources');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
