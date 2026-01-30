/**
 * Segment Tracking API Tools
 *
 * Tools for sending tracking events: identify, track, page, screen, group, alias, batch
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register all Tracking API tools
 */
export function registerTrackingTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // Identify
  // ===========================================================================
  server.tool(
    'segment_identify',
    `Identify a user and record their traits.

The Identify call lets you tie a user to their actions and record traits about them.
It includes a unique User ID and any optional traits you know about them.

Args:
  - userId: The unique ID for the user (required)
  - traits: Object of user traits (email, name, plan, etc.)
  - anonymousId: Anonymous ID if userId is not available
  - context: Additional context (ip, userAgent, etc.)

Returns:
  Confirmation that the identify call was sent.`,
    {
      userId: z.string().describe('Unique user identifier'),
      traits: z.record(z.string(), z.unknown()).optional().describe('User traits (email, name, plan, etc.)'),
      anonymousId: z.string().optional().describe('Anonymous ID if userId is not available'),
      context: z.record(z.string(), z.unknown()).optional().describe('Additional context (ip, userAgent, etc.)'),
    },
    async ({ userId, traits, anonymousId, context }) => {
      try {
        const result = await client.identify(userId, traits as Record<string, unknown>, context as Record<string, unknown>, anonymousId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Identify call sent', result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Track
  // ===========================================================================
  server.tool(
    'segment_track',
    `Track an event that a user has performed.

The Track call records actions your users perform. Every action triggers an "event",
which can have associated properties.

Args:
  - userId: The unique ID for the user (required)
  - event: The name of the event (required)
  - properties: Object of event properties
  - anonymousId: Anonymous ID if userId is not available
  - context: Additional context (ip, userAgent, etc.)

Returns:
  Confirmation that the track call was sent.`,
    {
      userId: z.string().describe('Unique user identifier'),
      event: z.string().describe('Name of the event being tracked'),
      properties: z.record(z.string(), z.unknown()).optional().describe('Event properties'),
      anonymousId: z.string().optional().describe('Anonymous ID if userId is not available'),
      context: z.record(z.string(), z.unknown()).optional().describe('Additional context'),
    },
    async ({ userId, event, properties, anonymousId, context }) => {
      try {
        const result = await client.track(userId, event, properties as Record<string, unknown>, context as Record<string, unknown>, anonymousId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Event "${event}" tracked`, result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Page
  // ===========================================================================
  server.tool(
    'segment_page',
    `Track a page view on a website.

The Page call lets you record page views on your website, along with
optional information about the page being viewed.

Args:
  - userId: The unique ID for the user (required)
  - name: Name of the page
  - category: Category of the page
  - properties: Additional page properties (url, referrer, etc.)
  - anonymousId: Anonymous ID if userId is not available
  - context: Additional context

Returns:
  Confirmation that the page call was sent.`,
    {
      userId: z.string().describe('Unique user identifier'),
      name: z.string().optional().describe('Name of the page'),
      category: z.string().optional().describe('Category of the page'),
      properties: z.record(z.string(), z.unknown()).optional().describe('Page properties (url, referrer, title, etc.)'),
      anonymousId: z.string().optional().describe('Anonymous ID if userId is not available'),
      context: z.record(z.string(), z.unknown()).optional().describe('Additional context'),
    },
    async ({ userId, name, category, properties, anonymousId, context }) => {
      try {
        const result = await client.page(userId, name, category, properties as Record<string, unknown>, context as Record<string, unknown>, anonymousId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Page view tracked', result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Screen
  // ===========================================================================
  server.tool(
    'segment_screen',
    `Track a screen view in a mobile app.

The Screen call lets you record whenever a user sees a screen of your mobile app.

Args:
  - userId: The unique ID for the user (required)
  - name: Name of the screen
  - category: Category of the screen
  - properties: Additional screen properties
  - anonymousId: Anonymous ID if userId is not available
  - context: Additional context

Returns:
  Confirmation that the screen call was sent.`,
    {
      userId: z.string().describe('Unique user identifier'),
      name: z.string().optional().describe('Name of the screen'),
      category: z.string().optional().describe('Category of the screen'),
      properties: z.record(z.string(), z.unknown()).optional().describe('Screen properties'),
      anonymousId: z.string().optional().describe('Anonymous ID if userId is not available'),
      context: z.record(z.string(), z.unknown()).optional().describe('Additional context'),
    },
    async ({ userId, name, category, properties, anonymousId, context }) => {
      try {
        const result = await client.screen(userId, name, category, properties as Record<string, unknown>, context as Record<string, unknown>, anonymousId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Screen view tracked', result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Group
  // ===========================================================================
  server.tool(
    'segment_group',
    `Associate a user with a group (company, organization, account, etc.).

The Group call lets you associate an identified user with a group. A group could be
a company, organization, account, project, or team.

Args:
  - userId: The unique ID for the user (required)
  - groupId: The unique ID for the group (required)
  - traits: Group traits (name, industry, employees, etc.)
  - anonymousId: Anonymous ID if userId is not available
  - context: Additional context

Returns:
  Confirmation that the group call was sent.`,
    {
      userId: z.string().describe('Unique user identifier'),
      groupId: z.string().describe('Unique group identifier'),
      traits: z.record(z.string(), z.unknown()).optional().describe('Group traits (name, industry, employees, plan, etc.)'),
      anonymousId: z.string().optional().describe('Anonymous ID if userId is not available'),
      context: z.record(z.string(), z.unknown()).optional().describe('Additional context'),
    },
    async ({ userId, groupId, traits, anonymousId, context }) => {
      try {
        const result = await client.group(userId, groupId, traits as Record<string, unknown>, context as Record<string, unknown>, anonymousId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User associated with group "${groupId}"`, result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Alias
  // ===========================================================================
  server.tool(
    'segment_alias',
    `Create an alias between two user identities.

The Alias call lets you merge two user identities. This is useful when a user
signs up and you want to merge their anonymous browsing history with their new identity.

Args:
  - userId: The new user ID (required)
  - previousId: The previous user ID or anonymous ID (required)
  - context: Additional context

Returns:
  Confirmation that the alias call was sent.`,
    {
      userId: z.string().describe('The new user ID'),
      previousId: z.string().describe('The previous user ID or anonymous ID'),
      context: z.record(z.string(), z.unknown()).optional().describe('Additional context'),
    },
    async ({ userId, previousId, context }) => {
      try {
        const result = await client.alias(userId, previousId, context as Record<string, unknown>);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Alias created: ${previousId} -> ${userId}`, result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Batch
  // ===========================================================================
  server.tool(
    'segment_batch',
    `Send a batch of tracking events.

The Batch call lets you send multiple identify, track, page, screen, group,
and alias events in a single request for higher performance.

Args:
  - batch: Array of event objects, each with a "type" field
  - context: Shared context for all events
  - integrations: Control which integrations receive the events

Returns:
  Confirmation that the batch was sent.`,
    {
      batch: z.array(z.record(z.string(), z.unknown())).describe('Array of event objects'),
      context: z.record(z.string(), z.unknown()).optional().describe('Shared context for all events'),
      integrations: z.record(z.string(), z.union([z.boolean(), z.record(z.string(), z.unknown())])).optional().describe('Integration settings'),
    },
    async ({ batch, context, integrations }) => {
      try {
        const result = await client.batch({ batch: batch as never[], context: context as Record<string, unknown>, integrations: integrations as Record<string, boolean | Record<string, unknown>> });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Batch of ${batch.length} events sent`, result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
