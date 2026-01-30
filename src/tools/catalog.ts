/**
 * Segment Catalog Tools
 *
 * Tools for browsing the Segment integrations catalog.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Catalog tools
 */
export function registerCatalogTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // Sources Catalog
  // ===========================================================================
  server.tool(
    'segment_get_sources_catalog',
    `Browse the sources catalog.

Lists all available source types that can be created.

Args:
  - count: Number of sources to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of source types.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.getSourcesCatalog({ count, cursor });
        return formatResponse(result, format, 'catalog');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_source_metadata',
    `Get metadata for a source type.

Args:
  - sourceMetadataId: The source metadata ID (required)

Returns:
  Source type metadata including description, logos, and categories.`,
    {
      sourceMetadataId: z.string().describe('Source metadata ID'),
    },
    async ({ sourceMetadataId }) => {
      try {
        const metadata = await client.getSourceMetadata(sourceMetadataId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Destinations Catalog
  // ===========================================================================
  server.tool(
    'segment_get_destinations_catalog',
    `Browse the destinations catalog.

Lists all available destination types that can be created.

Args:
  - count: Number of destinations to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of destination types.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.getDestinationsCatalog({ count, cursor });
        return formatResponse(result, format, 'catalog');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_destination_metadata',
    `Get metadata for a destination type.

Args:
  - destinationMetadataId: The destination metadata ID (required)

Returns:
  Destination type metadata including description, supported methods, and actions.`,
    {
      destinationMetadataId: z.string().describe('Destination metadata ID'),
    },
    async ({ destinationMetadataId }) => {
      try {
        const metadata = await client.getDestinationMetadata(destinationMetadataId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Warehouses Catalog
  // ===========================================================================
  server.tool(
    'segment_get_warehouses_catalog',
    `Browse the warehouses catalog.

Lists all available warehouse types (Snowflake, BigQuery, Redshift, etc.).

Args:
  - count: Number of warehouses to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of warehouse types.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.getWarehousesCatalog({ count, cursor });
        return formatResponse(result, format, 'catalog');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_warehouse_metadata',
    `Get metadata for a warehouse type.

Args:
  - warehouseMetadataId: The warehouse metadata ID (required)

Returns:
  Warehouse type metadata including description and logos.`,
    {
      warehouseMetadataId: z.string().describe('Warehouse metadata ID'),
    },
    async ({ warehouseMetadataId }) => {
      try {
        const metadata = await client.getWarehouseMetadata(warehouseMetadataId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
