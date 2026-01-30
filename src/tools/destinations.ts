/**
 * Segment Destinations Tools
 *
 * Tools for managing Segment destinations via the Public API.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Destinations tools
 */
export function registerDestinationsTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // List Destinations
  // ===========================================================================
  server.tool(
    'segment_list_destinations',
    `List all destinations in the workspace.

Returns a paginated list of destinations configured in your workspace.

Args:
  - count: Number of destinations to return (default: 20)
  - cursor: Pagination cursor from previous response
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of destinations with their IDs, names, types, and enabled status.`,
    {
      count: z.number().int().min(1).max(100).default(20).describe('Number of destinations to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listDestinations({ count, cursor });
        return formatResponse(result, format, 'destinations');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Destination
  // ===========================================================================
  server.tool(
    'segment_get_destination',
    `Get details for a specific destination.

Args:
  - destinationId: The destination ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Destination details including settings, metadata, and configuration.`,
    {
      destinationId: z.string().describe('Destination ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ destinationId, format }) => {
      try {
        const destination = await client.getDestination(destinationId);
        return formatResponse(destination, format, 'destination');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Destination
  // ===========================================================================
  server.tool(
    'segment_create_destination',
    `Create a new destination connected to a source.

Args:
  - sourceId: The source ID to connect (required)
  - metadataId: The destination catalog ID (use segment_get_destinations_catalog)
  - name: Display name for the destination (required)
  - settings: Destination-specific settings
  - enabled: Whether the destination is enabled (default: true)

Returns:
  The created destination object.`,
    {
      sourceId: z.string().describe('Source ID to connect'),
      metadataId: z.string().describe('Destination catalog ID'),
      name: z.string().describe('Display name for the destination'),
      settings: z.record(z.string(), z.unknown()).optional().describe('Destination-specific settings'),
      enabled: z.boolean().default(true).describe('Whether the destination is enabled'),
    },
    async ({ sourceId, metadataId, name, settings, enabled }) => {
      try {
        const destination = await client.createDestination(sourceId, metadataId, name, settings as Record<string, unknown>, enabled);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Destination created', destination }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Destination
  // ===========================================================================
  server.tool(
    'segment_update_destination',
    `Update an existing destination.

Args:
  - destinationId: The destination ID to update (required)
  - name: New display name
  - enabled: Enable or disable the destination
  - settings: Updated destination-specific settings

Returns:
  The updated destination object.`,
    {
      destinationId: z.string().describe('Destination ID to update'),
      name: z.string().optional().describe('New display name'),
      enabled: z.boolean().optional().describe('Enable or disable'),
      settings: z.record(z.string(), z.unknown()).optional().describe('Updated settings'),
    },
    async ({ destinationId, name, enabled, settings }) => {
      try {
        const destination = await client.updateDestination(destinationId, name, enabled, settings as Record<string, unknown>);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Destination updated', destination }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Destination
  // ===========================================================================
  server.tool(
    'segment_delete_destination',
    `Delete a destination.

WARNING: This action is irreversible.

Args:
  - destinationId: The destination ID to delete (required)

Returns:
  Confirmation of deletion.`,
    {
      destinationId: z.string().describe('Destination ID to delete'),
    },
    async ({ destinationId }) => {
      try {
        await client.deleteDestination(destinationId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Destination ${destinationId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Destination Subscriptions
  // ===========================================================================
  server.tool(
    'segment_list_destination_subscriptions',
    `List subscriptions for a destination.

Subscriptions define which events are sent to an Actions destination.

Args:
  - destinationId: The destination ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of subscriptions for the destination.`,
    {
      destinationId: z.string().describe('Destination ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ destinationId, format }) => {
      try {
        const result = await client.listDestinationSubscriptions(destinationId);
        return formatResponse(result, format, 'subscriptions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Destination Subscription
  // ===========================================================================
  server.tool(
    'segment_get_destination_subscription',
    `Get a specific subscription for a destination.

Args:
  - destinationId: The destination ID (required)
  - subscriptionId: The subscription ID (required)

Returns:
  The subscription details.`,
    {
      destinationId: z.string().describe('Destination ID'),
      subscriptionId: z.string().describe('Subscription ID'),
    },
    async ({ destinationId, subscriptionId }) => {
      try {
        const subscription = await client.getDestinationSubscription(destinationId, subscriptionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(subscription, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Destination Subscription
  // ===========================================================================
  server.tool(
    'segment_create_destination_subscription',
    `Create a subscription for a destination.

Args:
  - destinationId: The destination ID (required)
  - name: Subscription name (required)
  - actionId: The action ID (required)
  - trigger: FQL trigger expression (required)
  - enabled: Whether enabled (default: true)
  - settings: Action-specific settings

Returns:
  The created subscription.`,
    {
      destinationId: z.string().describe('Destination ID'),
      name: z.string().describe('Subscription name'),
      actionId: z.string().describe('Action ID'),
      trigger: z.string().describe('FQL trigger expression'),
      enabled: z.boolean().default(true),
      settings: z.record(z.string(), z.unknown()).optional(),
    },
    async ({ destinationId, name, actionId, trigger, enabled, settings }) => {
      try {
        const subscription = await client.createDestinationSubscription(
          destinationId,
          name,
          actionId,
          trigger,
          enabled,
          settings as Record<string, unknown>
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Subscription created', subscription }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Destination Subscription
  // ===========================================================================
  server.tool(
    'segment_update_destination_subscription',
    `Update a destination subscription.

Args:
  - destinationId: The destination ID (required)
  - subscriptionId: The subscription ID (required)
  - name: New name
  - enabled: Enable or disable
  - trigger: New FQL trigger expression
  - settings: Updated settings

Returns:
  The updated subscription.`,
    {
      destinationId: z.string().describe('Destination ID'),
      subscriptionId: z.string().describe('Subscription ID'),
      name: z.string().optional(),
      enabled: z.boolean().optional(),
      trigger: z.string().optional(),
      settings: z.record(z.string(), z.unknown()).optional(),
    },
    async ({ destinationId, subscriptionId, name, enabled, trigger, settings }) => {
      try {
        const subscription = await client.updateDestinationSubscription(
          destinationId,
          subscriptionId,
          name,
          enabled,
          trigger,
          settings as Record<string, unknown>
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Subscription updated', subscription }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Destination Subscription
  // ===========================================================================
  server.tool(
    'segment_delete_destination_subscription',
    `Delete a destination subscription.

Args:
  - destinationId: The destination ID (required)
  - subscriptionId: The subscription ID (required)

Returns:
  Confirmation of deletion.`,
    {
      destinationId: z.string().describe('Destination ID'),
      subscriptionId: z.string().describe('Subscription ID'),
    },
    async ({ destinationId, subscriptionId }) => {
      try {
        await client.deleteDestinationSubscription(destinationId, subscriptionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Subscription deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Destination Filters
  // ===========================================================================
  server.tool(
    'segment_list_destination_filters',
    `List filters for a destination.

Filters control which events are sent to a destination.

Args:
  - destinationId: The destination ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of filters for the destination.`,
    {
      destinationId: z.string().describe('Destination ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ destinationId, format }) => {
      try {
        const result = await client.listDestinationFilters(destinationId);
        return formatResponse(result, format, 'filters');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Destination Filter
  // ===========================================================================
  server.tool(
    'segment_create_destination_filter',
    `Create a filter for a destination.

Filters can drop events, sample events, or modify properties.

Args:
  - sourceId: The source ID (required)
  - destinationId: The destination ID (required)
  - title: Filter title (required)
  - ifClause: FQL condition expression (required)
  - actions: Array of filter actions (required)
  - enabled: Whether enabled (default: true)
  - description: Filter description

Returns:
  The created filter.`,
    {
      sourceId: z.string().describe('Source ID'),
      destinationId: z.string().describe('Destination ID'),
      title: z.string().describe('Filter title'),
      ifClause: z.string().describe('FQL condition'),
      actions: z.array(z.object({
        type: z.string(),
        fields: z.record(z.string(), z.unknown()).optional(),
        percent: z.number().optional(),
      })).describe('Filter actions'),
      enabled: z.boolean().default(true),
      description: z.string().optional(),
    },
    async ({ sourceId, destinationId, title, ifClause, actions, enabled, description }) => {
      try {
        const filter = await client.createDestinationFilter(
          sourceId,
          destinationId,
          title,
          ifClause,
          actions as Array<{ type: string; fields?: Record<string, unknown>; percent?: number }>,
          enabled,
          description
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Filter created', filter }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Destination Filter
  // ===========================================================================
  server.tool(
    'segment_update_destination_filter',
    `Update a destination filter.

Args:
  - destinationId: The destination ID (required)
  - filterId: The filter ID (required)
  - title: New title
  - ifClause: New FQL condition
  - actions: New filter actions
  - enabled: Enable or disable
  - description: New description

Returns:
  The updated filter.`,
    {
      destinationId: z.string().describe('Destination ID'),
      filterId: z.string().describe('Filter ID'),
      title: z.string().optional(),
      ifClause: z.string().optional(),
      actions: z.array(z.object({
        type: z.string(),
        fields: z.record(z.string(), z.unknown()).optional(),
        percent: z.number().optional(),
      })).optional(),
      enabled: z.boolean().optional(),
      description: z.string().optional(),
    },
    async ({ destinationId, filterId, title, ifClause, actions, enabled, description }) => {
      try {
        const filter = await client.updateDestinationFilter(
          destinationId,
          filterId,
          title,
          ifClause,
          actions as Array<{ type: string; fields?: Record<string, unknown>; percent?: number }>,
          enabled,
          description
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Filter updated', filter }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Destination Filter
  // ===========================================================================
  server.tool(
    'segment_delete_destination_filter',
    `Delete a destination filter.

Args:
  - destinationId: The destination ID (required)
  - filterId: The filter ID (required)

Returns:
  Confirmation of deletion.`,
    {
      destinationId: z.string().describe('Destination ID'),
      filterId: z.string().describe('Filter ID'),
    },
    async ({ destinationId, filterId }) => {
      try {
        await client.deleteDestinationFilter(destinationId, filterId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Filter deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
