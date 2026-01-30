/**
 * Segment Tracking Plans Tools
 *
 * Tools for managing Segment tracking plans (Protocols) via the Public API.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Tracking Plans tools
 */
export function registerTrackingPlansTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // List Tracking Plans
  // ===========================================================================
  server.tool(
    'segment_list_tracking_plans',
    `List all tracking plans in the workspace.

Tracking plans define the expected schema for your tracking data.

Args:
  - count: Number of tracking plans to return (default: 20)
  - cursor: Pagination cursor from previous response
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of tracking plans.`,
    {
      count: z.number().int().min(1).max(100).default(20).describe('Number to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listTrackingPlans({ count, cursor });
        return formatResponse(result, format, 'tracking-plans');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Tracking Plan
  // ===========================================================================
  server.tool(
    'segment_get_tracking_plan',
    `Get details for a specific tracking plan.

Args:
  - trackingPlanId: The tracking plan ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Tracking plan details including name, description, and type.`,
    {
      trackingPlanId: z.string().describe('Tracking plan ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ trackingPlanId, format }) => {
      try {
        const trackingPlan = await client.getTrackingPlan(trackingPlanId);
        return formatResponse(trackingPlan, format, 'tracking-plan');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Tracking Plan
  // ===========================================================================
  server.tool(
    'segment_create_tracking_plan',
    `Create a new tracking plan.

Args:
  - name: The tracking plan name (required)
  - type: Type of tracking plan (default: 'LIVE')
  - description: Description of the tracking plan

Returns:
  The created tracking plan.`,
    {
      name: z.string().describe('Tracking plan name'),
      type: z.enum(['ENGAGE', 'LIVE', 'PROPERTY_LIBRARY', 'RULE_LIBRARY', 'TEMPLATE']).default('LIVE'),
      description: z.string().optional().describe('Description'),
    },
    async ({ name, type, description }) => {
      try {
        const trackingPlan = await client.createTrackingPlan(name, type, description);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Tracking plan created', trackingPlan }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Tracking Plan
  // ===========================================================================
  server.tool(
    'segment_update_tracking_plan',
    `Update an existing tracking plan.

Args:
  - trackingPlanId: The tracking plan ID (required)
  - name: New name
  - description: New description

Returns:
  The updated tracking plan.`,
    {
      trackingPlanId: z.string().describe('Tracking plan ID'),
      name: z.string().optional().describe('New name'),
      description: z.string().optional().describe('New description'),
    },
    async ({ trackingPlanId, name, description }) => {
      try {
        const trackingPlan = await client.updateTrackingPlan(trackingPlanId, name, description);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Tracking plan updated', trackingPlan }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Tracking Plan
  // ===========================================================================
  server.tool(
    'segment_delete_tracking_plan',
    `Delete a tracking plan.

WARNING: This action is irreversible.

Args:
  - trackingPlanId: The tracking plan ID (required)

Returns:
  Confirmation of deletion.`,
    {
      trackingPlanId: z.string().describe('Tracking plan ID'),
    },
    async ({ trackingPlanId }) => {
      try {
        await client.deleteTrackingPlan(trackingPlanId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Tracking plan ${trackingPlanId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Tracking Plan Rules
  // ===========================================================================
  server.tool(
    'segment_list_tracking_plan_rules',
    `List rules in a tracking plan.

Rules define the expected schema for events, traits, and properties.

Args:
  - trackingPlanId: The tracking plan ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of rules in the tracking plan.`,
    {
      trackingPlanId: z.string().describe('Tracking plan ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ trackingPlanId, format }) => {
      try {
        const result = await client.listTrackingPlanRules(trackingPlanId);
        return formatResponse(result, format, 'rules');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Tracking Plan Rules
  // ===========================================================================
  server.tool(
    'segment_update_tracking_plan_rules',
    `Update rules in a tracking plan.

Args:
  - trackingPlanId: The tracking plan ID (required)
  - rules: Array of rule objects with key, type, and jsonSchema

Returns:
  Confirmation of update.`,
    {
      trackingPlanId: z.string().describe('Tracking plan ID'),
      rules: z.array(z.object({
        key: z.string().describe('Event name or trait key'),
        type: z.enum(['COMMON', 'GROUP', 'IDENTIFY', 'PAGE', 'SCREEN', 'TRACK']),
        jsonSchema: z.record(z.string(), z.unknown()).describe('JSON Schema for validation'),
        version: z.number().optional(),
      })).describe('Rules to update'),
    },
    async ({ trackingPlanId, rules }) => {
      try {
        await client.updateTrackingPlanRules(trackingPlanId, rules as never);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Tracking plan rules updated' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Source to Tracking Plan
  // ===========================================================================
  server.tool(
    'segment_add_source_to_tracking_plan',
    `Connect a source to a tracking plan.

Once connected, events from the source will be validated against the tracking plan.

Args:
  - trackingPlanId: The tracking plan ID (required)
  - sourceId: The source ID to connect (required)

Returns:
  Confirmation of connection.`,
    {
      trackingPlanId: z.string().describe('Tracking plan ID'),
      sourceId: z.string().describe('Source ID'),
    },
    async ({ trackingPlanId, sourceId }) => {
      try {
        await client.addSourceToTrackingPlan(trackingPlanId, sourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Source ${sourceId} connected to tracking plan` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Source from Tracking Plan
  // ===========================================================================
  server.tool(
    'segment_remove_source_from_tracking_plan',
    `Disconnect a source from a tracking plan.

Args:
  - trackingPlanId: The tracking plan ID (required)
  - sourceId: The source ID to disconnect (required)

Returns:
  Confirmation of disconnection.`,
    {
      trackingPlanId: z.string().describe('Tracking plan ID'),
      sourceId: z.string().describe('Source ID'),
    },
    async ({ trackingPlanId, sourceId }) => {
      try {
        await client.removeSourceFromTrackingPlan(trackingPlanId, sourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Source ${sourceId} disconnected from tracking plan` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Sources from Tracking Plan
  // ===========================================================================
  server.tool(
    'segment_list_sources_from_tracking_plan',
    `List sources connected to a tracking plan.

Args:
  - trackingPlanId: The tracking plan ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of sources connected to the tracking plan.`,
    {
      trackingPlanId: z.string().describe('Tracking plan ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ trackingPlanId, format }) => {
      try {
        const result = await client.listSourcesFromTrackingPlan(trackingPlanId);
        return formatResponse(result, format, 'sources');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
