/**
 * Segment Engage Tools
 *
 * Tools for managing Segment Engage features (Audiences, Computed Traits, Spaces).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Engage tools
 */
export function registerEngageTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // Spaces
  // ===========================================================================
  server.tool(
    'segment_list_spaces',
    `List all Engage spaces in the workspace.

Spaces are Engage workspaces that contain audiences and computed traits.

Args:
  - count: Number of spaces to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of spaces.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listSpaces({ count, cursor });
        return formatResponse(result, format, 'spaces');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_space',
    `Get details for a specific Engage space.

Args:
  - spaceId: The space ID (required)

Returns:
  Space details.`,
    {
      spaceId: z.string().describe('Space ID'),
    },
    async ({ spaceId }) => {
      try {
        const space = await client.getSpace(spaceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(space, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Audiences
  // ===========================================================================
  server.tool(
    'segment_list_audiences',
    `List all audiences in an Engage space.

Audiences are dynamic groups of users based on conditions.

Args:
  - spaceId: The space ID (required)
  - count: Number of audiences to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of audiences.`,
    {
      spaceId: z.string().describe('Space ID'),
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ spaceId, count, cursor, format }) => {
      try {
        const result = await client.listAudiences(spaceId, { count, cursor });
        return formatResponse(result, format, 'audiences');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_audience',
    `Get details for a specific audience.

Args:
  - spaceId: The space ID (required)
  - audienceId: The audience ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Audience details including definition and status.`,
    {
      spaceId: z.string().describe('Space ID'),
      audienceId: z.string().describe('Audience ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ spaceId, audienceId, format }) => {
      try {
        const audience = await client.getAudience(spaceId, audienceId);
        return formatResponse(audience, format, 'audience');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_create_audience',
    `Create a new audience in an Engage space.

Args:
  - spaceId: The space ID (required)
  - name: Audience name (required)
  - definition: Audience definition with query and type
  - description: Description
  - enabled: Whether enabled (default: true)

Returns:
  The created audience.`,
    {
      spaceId: z.string().describe('Space ID'),
      name: z.string().describe('Audience name'),
      definition: z.object({
        query: z.string().describe('Audience query'),
        type: z.enum(['USERS', 'ACCOUNTS']).optional().default('USERS'),
      }).describe('Audience definition'),
      description: z.string().optional(),
      enabled: z.boolean().default(true),
    },
    async ({ spaceId, name, definition, description, enabled }) => {
      try {
        const audience = await client.createAudience(spaceId, name, definition, description, enabled);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Audience created', audience }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_update_audience',
    `Update an existing audience.

Args:
  - spaceId: The space ID (required)
  - audienceId: The audience ID (required)
  - name: New name
  - definition: New definition
  - description: New description
  - enabled: Enable or disable

Returns:
  The updated audience.`,
    {
      spaceId: z.string().describe('Space ID'),
      audienceId: z.string().describe('Audience ID'),
      name: z.string().optional(),
      definition: z.object({
        query: z.string(),
        type: z.enum(['USERS', 'ACCOUNTS']).optional(),
      }).optional(),
      description: z.string().optional(),
      enabled: z.boolean().optional(),
    },
    async ({ spaceId, audienceId, name, definition, description, enabled }) => {
      try {
        const audience = await client.updateAudience(spaceId, audienceId, name, definition, description, enabled);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Audience updated', audience }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_delete_audience',
    `Delete an audience.

WARNING: This action is irreversible.

Args:
  - spaceId: The space ID (required)
  - audienceId: The audience ID (required)

Returns:
  Confirmation of deletion.`,
    {
      spaceId: z.string().describe('Space ID'),
      audienceId: z.string().describe('Audience ID'),
    },
    async ({ spaceId, audienceId }) => {
      try {
        await client.deleteAudience(spaceId, audienceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Audience ${audienceId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Computed Traits
  // ===========================================================================
  server.tool(
    'segment_list_computed_traits',
    `List all computed traits in an Engage space.

Computed traits are dynamically calculated user properties.

Args:
  - spaceId: The space ID (required)
  - count: Number of traits to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of computed traits.`,
    {
      spaceId: z.string().describe('Space ID'),
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ spaceId, count, cursor, format }) => {
      try {
        const result = await client.listComputedTraits(spaceId, { count, cursor });
        return formatResponse(result, format, 'computed-traits');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_computed_trait',
    `Get details for a specific computed trait.

Args:
  - spaceId: The space ID (required)
  - traitId: The computed trait ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Computed trait details.`,
    {
      spaceId: z.string().describe('Space ID'),
      traitId: z.string().describe('Computed trait ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ spaceId, traitId, format }) => {
      try {
        const trait = await client.getComputedTrait(spaceId, traitId);
        return formatResponse(trait, format, 'computed-trait');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_create_computed_trait',
    `Create a new computed trait.

Args:
  - spaceId: The space ID (required)
  - name: Trait name (required)
  - definition: Trait definition with query and type
  - description: Description
  - enabled: Whether enabled (default: true)

Returns:
  The created computed trait.`,
    {
      spaceId: z.string().describe('Space ID'),
      name: z.string().describe('Trait name'),
      definition: z.object({
        query: z.string().describe('Trait query'),
        type: z.enum(['USERS', 'ACCOUNTS']).optional().default('USERS'),
      }).describe('Trait definition'),
      description: z.string().optional(),
      enabled: z.boolean().default(true),
    },
    async ({ spaceId, name, definition, description, enabled }) => {
      try {
        const trait = await client.createComputedTrait(spaceId, name, definition, description, enabled);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Computed trait created', computedTrait: trait }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_update_computed_trait',
    `Update an existing computed trait.

Args:
  - spaceId: The space ID (required)
  - traitId: The computed trait ID (required)
  - name: New name
  - definition: New definition
  - description: New description
  - enabled: Enable or disable

Returns:
  The updated computed trait.`,
    {
      spaceId: z.string().describe('Space ID'),
      traitId: z.string().describe('Computed trait ID'),
      name: z.string().optional(),
      definition: z.object({
        query: z.string(),
        type: z.enum(['USERS', 'ACCOUNTS']).optional(),
      }).optional(),
      description: z.string().optional(),
      enabled: z.boolean().optional(),
    },
    async ({ spaceId, traitId, name, definition, description, enabled }) => {
      try {
        const trait = await client.updateComputedTrait(spaceId, traitId, name, definition, description, enabled);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Computed trait updated', computedTrait: trait }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_delete_computed_trait',
    `Delete a computed trait.

WARNING: This action is irreversible.

Args:
  - spaceId: The space ID (required)
  - traitId: The computed trait ID (required)

Returns:
  Confirmation of deletion.`,
    {
      spaceId: z.string().describe('Space ID'),
      traitId: z.string().describe('Computed trait ID'),
    },
    async ({ spaceId, traitId }) => {
      try {
        await client.deleteComputedTrait(spaceId, traitId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Computed trait ${traitId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
