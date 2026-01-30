/**
 * Segment Functions Tools
 *
 * Tools for managing Segment functions (custom code) via the Public API.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Functions tools
 */
export function registerFunctionsTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // List Functions
  // ===========================================================================
  server.tool(
    'segment_list_functions',
    `List all functions in the workspace.

Functions are custom JavaScript code that can transform or filter data.

Args:
  - count: Number of functions to return (default: 20)
  - cursor: Pagination cursor from previous response
  - resourceType: Filter by type (DESTINATION, INSERT_DESTINATION, SOURCE)
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of functions.`,
    {
      count: z.number().int().min(1).max(100).default(20).describe('Number to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      resourceType: z.enum(['DESTINATION', 'INSERT_DESTINATION', 'SOURCE']).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, resourceType, format }) => {
      try {
        const result = await client.listFunctions({ count, cursor, resourceType });
        return formatResponse(result, format, 'functions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Function
  // ===========================================================================
  server.tool(
    'segment_get_function',
    `Get details for a specific function.

Args:
  - functionId: The function ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Function details including code, settings, and deployment status.`,
    {
      functionId: z.string().describe('Function ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ functionId, format }) => {
      try {
        const fn = await client.getFunction(functionId);
        return formatResponse(fn, format, 'function');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Function
  // ===========================================================================
  server.tool(
    'segment_create_function',
    `Create a new function.

Args:
  - displayName: The function display name (required)
  - code: JavaScript code for the function (required)
  - resourceType: Type of function (DESTINATION, INSERT_DESTINATION, SOURCE)
  - description: Description of the function
  - settings: Array of setting definitions

Returns:
  The created function.`,
    {
      displayName: z.string().describe('Function display name'),
      code: z.string().describe('JavaScript code'),
      resourceType: z.enum(['DESTINATION', 'INSERT_DESTINATION', 'SOURCE']).describe('Function type'),
      description: z.string().optional().describe('Description'),
      settings: z.array(z.object({
        name: z.string(),
        label: z.string(),
        type: z.enum(['ARRAY', 'BOOLEAN', 'STRING', 'TEXT_MAP']),
        description: z.string().optional(),
        required: z.boolean().optional(),
        sensitive: z.boolean().optional(),
      })).optional().describe('Setting definitions'),
    },
    async ({ displayName, code, resourceType, description, settings }) => {
      try {
        const fn = await client.createFunction(displayName, code, resourceType, description, settings);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Function created', function: fn }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Function
  // ===========================================================================
  server.tool(
    'segment_update_function',
    `Update an existing function.

Args:
  - functionId: The function ID (required)
  - displayName: New display name
  - code: New JavaScript code
  - description: New description
  - settings: Updated setting definitions

Returns:
  The updated function.`,
    {
      functionId: z.string().describe('Function ID'),
      displayName: z.string().optional(),
      code: z.string().optional(),
      description: z.string().optional(),
      settings: z.array(z.object({
        name: z.string(),
        label: z.string(),
        type: z.enum(['ARRAY', 'BOOLEAN', 'STRING', 'TEXT_MAP']),
        description: z.string().optional(),
        required: z.boolean().optional(),
        sensitive: z.boolean().optional(),
      })).optional(),
    },
    async ({ functionId, displayName, code, description, settings }) => {
      try {
        const fn = await client.updateFunction(functionId, displayName, code, description, settings);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Function updated', function: fn }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Function
  // ===========================================================================
  server.tool(
    'segment_delete_function',
    `Delete a function.

WARNING: This action is irreversible.

Args:
  - functionId: The function ID (required)

Returns:
  Confirmation of deletion.`,
    {
      functionId: z.string().describe('Function ID'),
    },
    async ({ functionId }) => {
      try {
        await client.deleteFunction(functionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Function ${functionId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Deploy Function
  // ===========================================================================
  server.tool(
    'segment_deploy_function',
    `Deploy a function to make it available for use.

Args:
  - functionId: The function ID (required)

Returns:
  The deployed function.`,
    {
      functionId: z.string().describe('Function ID'),
    },
    async ({ functionId }) => {
      try {
        const fn = await client.deployFunction(functionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Function deployed', function: fn }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
