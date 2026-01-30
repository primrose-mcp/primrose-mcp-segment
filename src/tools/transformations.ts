/**
 * Segment Transformations Tools
 *
 * Tools for managing Segment transformations via the Public API.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Transformations tools
 */
export function registerTransformationsTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // List Transformations
  // ===========================================================================
  server.tool(
    'segment_list_transformations',
    `List all transformations in the workspace.

Transformations modify events as they flow through Segment.

Args:
  - count: Number of transformations to return (default: 20)
  - cursor: Pagination cursor from previous response
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of transformations.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listTransformations({ count, cursor });
        return formatResponse(result, format, 'transformations');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Transformation
  // ===========================================================================
  server.tool(
    'segment_get_transformation',
    `Get details for a specific transformation.

Args:
  - transformationId: The transformation ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Transformation details including rules and configuration.`,
    {
      transformationId: z.string().describe('Transformation ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ transformationId, format }) => {
      try {
        const transformation = await client.getTransformation(transformationId);
        return formatResponse(transformation, format, 'transformation');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Transformation
  // ===========================================================================
  server.tool(
    'segment_create_transformation',
    `Create a new transformation.

Args:
  - sourceId: The source ID (required)
  - name: Transformation name (required)
  - ifClause: FQL condition for when to apply (required)
  - newEventName: New event name to use
  - enabled: Whether enabled (default: true)
  - destinationMetadataId: Apply to specific destination
  - propertyRenames: Array of {oldName, newName} for renaming properties
  - fqlDefinedProperties: Array of {fql, propertyName} for computed properties

Returns:
  The created transformation.`,
    {
      sourceId: z.string().describe('Source ID'),
      name: z.string().describe('Transformation name'),
      ifClause: z.string().describe('FQL condition'),
      newEventName: z.string().optional().describe('New event name'),
      enabled: z.boolean().default(true),
      destinationMetadataId: z.string().optional(),
      propertyRenames: z.array(z.object({
        oldName: z.string(),
        newName: z.string(),
      })).optional(),
      fqlDefinedProperties: z.array(z.object({
        fql: z.string(),
        propertyName: z.string(),
      })).optional(),
    },
    async ({ sourceId, name, ifClause, newEventName, enabled, destinationMetadataId, propertyRenames, fqlDefinedProperties }) => {
      try {
        const transformation = await client.createTransformation(
          sourceId,
          name,
          ifClause,
          newEventName,
          enabled,
          destinationMetadataId,
          propertyRenames,
          fqlDefinedProperties
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Transformation created', transformation }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Transformation
  // ===========================================================================
  server.tool(
    'segment_update_transformation',
    `Update an existing transformation.

Args:
  - transformationId: The transformation ID (required)
  - name: New name
  - ifClause: New FQL condition
  - newEventName: New event name
  - enabled: Enable or disable
  - propertyRenames: Updated property renames
  - fqlDefinedProperties: Updated computed properties

Returns:
  The updated transformation.`,
    {
      transformationId: z.string().describe('Transformation ID'),
      name: z.string().optional(),
      ifClause: z.string().optional(),
      newEventName: z.string().optional(),
      enabled: z.boolean().optional(),
      propertyRenames: z.array(z.object({
        oldName: z.string(),
        newName: z.string(),
      })).optional(),
      fqlDefinedProperties: z.array(z.object({
        fql: z.string(),
        propertyName: z.string(),
      })).optional(),
    },
    async ({ transformationId, name, ifClause, newEventName, enabled, propertyRenames, fqlDefinedProperties }) => {
      try {
        const transformation = await client.updateTransformation(
          transformationId,
          name,
          ifClause,
          newEventName,
          enabled,
          propertyRenames,
          fqlDefinedProperties
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Transformation updated', transformation }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Transformation
  // ===========================================================================
  server.tool(
    'segment_delete_transformation',
    `Delete a transformation.

WARNING: This action is irreversible.

Args:
  - transformationId: The transformation ID (required)

Returns:
  Confirmation of deletion.`,
    {
      transformationId: z.string().describe('Transformation ID'),
    },
    async ({ transformationId }) => {
      try {
        await client.deleteTransformation(transformationId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Transformation ${transformationId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
