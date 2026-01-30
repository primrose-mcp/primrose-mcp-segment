/**
 * Segment Admin Tools
 *
 * Tools for managing users, groups, invites, labels, regulations, and audit events.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SegmentClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Admin tools
 */
export function registerAdminTools(server: McpServer, client: SegmentClient): void {
  // ===========================================================================
  // Users
  // ===========================================================================
  server.tool(
    'segment_list_users',
    `List all users in the workspace.

Args:
  - count: Number of users to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of users.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listUsers({ count, cursor });
        return formatResponse(result, format, 'users');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_user',
    `Get details for a specific user.

Args:
  - userId: The user ID (required)

Returns:
  User details.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        const user = await client.getUser(userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(user, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_delete_users',
    `Delete users from the workspace.

WARNING: This action is irreversible.

Args:
  - userIds: Array of user IDs to delete (required)

Returns:
  Confirmation of deletion.`,
    {
      userIds: z.array(z.string()).describe('User IDs to delete'),
    },
    async ({ userIds }) => {
      try {
        await client.deleteUsers(userIds);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `${userIds.length} users deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // User Groups
  // ===========================================================================
  server.tool(
    'segment_list_user_groups',
    `List all user groups in the workspace.

Args:
  - count: Number of groups to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of user groups.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listUserGroups({ count, cursor });
        return formatResponse(result, format, 'user-groups');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_user_group',
    `Get details for a specific user group.

Args:
  - groupId: The group ID (required)

Returns:
  User group details.`,
    {
      groupId: z.string().describe('Group ID'),
    },
    async ({ groupId }) => {
      try {
        const group = await client.getUserGroup(groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(group, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_create_user_group',
    `Create a new user group.

Args:
  - name: Group name (required)

Returns:
  The created user group.`,
    {
      name: z.string().describe('Group name'),
    },
    async ({ name }) => {
      try {
        const group = await client.createUserGroup(name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User group created', group }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_update_user_group',
    `Update a user group.

Args:
  - groupId: The group ID (required)
  - name: New group name (required)

Returns:
  The updated user group.`,
    {
      groupId: z.string().describe('Group ID'),
      name: z.string().describe('New group name'),
    },
    async ({ groupId, name }) => {
      try {
        const group = await client.updateUserGroup(groupId, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User group updated', group }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_delete_user_group',
    `Delete a user group.

WARNING: This action is irreversible.

Args:
  - groupId: The group ID (required)

Returns:
  Confirmation of deletion.`,
    {
      groupId: z.string().describe('Group ID'),
    },
    async ({ groupId }) => {
      try {
        await client.deleteUserGroup(groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User group ${groupId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_add_users_to_user_group',
    `Add users to a user group.

Args:
  - groupId: The group ID (required)
  - emails: Array of user emails to add (required)

Returns:
  Confirmation of addition.`,
    {
      groupId: z.string().describe('Group ID'),
      emails: z.array(z.string().email()).describe('User emails to add'),
    },
    async ({ groupId, emails }) => {
      try {
        await client.addUsersToUserGroup(groupId, emails);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `${emails.length} users added to group` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_remove_users_from_user_group',
    `Remove users from a user group.

Args:
  - groupId: The group ID (required)
  - emails: Array of user emails to remove (required)

Returns:
  Confirmation of removal.`,
    {
      groupId: z.string().describe('Group ID'),
      emails: z.array(z.string().email()).describe('User emails to remove'),
    },
    async ({ groupId, emails }) => {
      try {
        await client.removeUsersFromUserGroup(groupId, emails);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `${emails.length} users removed from group` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Invites
  // ===========================================================================
  server.tool(
    'segment_list_invites',
    `List all pending invites.

Args:
  - count: Number of invites to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of invites.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listInvites({ count, cursor });
        return formatResponse(result, format, 'invites');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_create_invites',
    `Send invites to new users.

Args:
  - emails: Array of email addresses to invite (required)

Returns:
  Confirmation of invites sent.`,
    {
      emails: z.array(z.string().email()).describe('Email addresses to invite'),
    },
    async ({ emails }) => {
      try {
        await client.createInvites(emails);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `${emails.length} invites sent` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_delete_invites',
    `Cancel pending invites.

Args:
  - emails: Array of email addresses to cancel (required)

Returns:
  Confirmation of invites cancelled.`,
    {
      emails: z.array(z.string().email()).describe('Email addresses to cancel'),
    },
    async ({ emails }) => {
      try {
        await client.deleteInvites(emails);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `${emails.length} invites cancelled` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Labels
  // ===========================================================================
  server.tool(
    'segment_list_labels',
    `List all labels in the workspace.

Labels are used to organize and filter resources.

Args:
  - count: Number of labels to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of labels.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, format }) => {
      try {
        const result = await client.listLabels({ count, cursor });
        return formatResponse(result, format, 'labels');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_create_label',
    `Create a new label.

Args:
  - key: Label key (required)
  - value: Label value (required)
  - description: Label description

Returns:
  The created label.`,
    {
      key: z.string().describe('Label key'),
      value: z.string().describe('Label value'),
      description: z.string().optional().describe('Label description'),
    },
    async ({ key, value, description }) => {
      try {
        const label = await client.createLabel(key, value, description);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Label created', label }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_delete_label',
    `Delete a label.

WARNING: This action is irreversible.

Args:
  - key: Label key (required)
  - value: Label value (required)

Returns:
  Confirmation of deletion.`,
    {
      key: z.string().describe('Label key'),
      value: z.string().describe('Label value'),
    },
    async ({ key, value }) => {
      try {
        await client.deleteLabel(key, value);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Label ${key}:${value} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Regulations (GDPR/CCPA deletion/suppression)
  // ===========================================================================
  server.tool(
    'segment_list_regulations_from_source',
    `List regulations (deletion/suppression requests) for a source.

Args:
  - sourceId: The source ID (required)
  - count: Number to return (default: 20)
  - cursor: Pagination cursor
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of regulations.`,
    {
      sourceId: z.string().describe('Source ID'),
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ sourceId, count, cursor, format }) => {
      try {
        const result = await client.listRegulationsFromSource(sourceId, { count, cursor });
        return formatResponse(result, format, 'regulations');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_create_source_regulation',
    `Create a regulation (deletion/suppression request) for a source.

Use this for GDPR/CCPA compliance to delete or suppress user data.

Args:
  - sourceId: The source ID (required)
  - regulationType: Type of regulation (DELETE, SUPPRESS, etc.)
  - subjectType: Type of subject (USER_ID, etc.)
  - subjectIds: Array of subject IDs to regulate

Returns:
  The created regulation.`,
    {
      sourceId: z.string().describe('Source ID'),
      regulationType: z.string().describe('Regulation type (DELETE, SUPPRESS, etc.)'),
      subjectType: z.string().describe('Subject type (USER_ID, etc.)'),
      subjectIds: z.array(z.string()).describe('Subject IDs to regulate'),
    },
    async ({ sourceId, regulationType, subjectType, subjectIds }) => {
      try {
        const regulation = await client.createSourceRegulation(sourceId, regulationType, subjectType, subjectIds);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Regulation created', regulation }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_get_regulation',
    `Get details for a regulation.

Args:
  - regulationId: The regulation ID (required)

Returns:
  Regulation details including status.`,
    {
      regulationId: z.string().describe('Regulation ID'),
    },
    async ({ regulationId }) => {
      try {
        const regulation = await client.getRegulation(regulationId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(regulation, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'segment_delete_regulation',
    `Delete a regulation request.

Args:
  - regulationId: The regulation ID (required)

Returns:
  Confirmation of deletion.`,
    {
      regulationId: z.string().describe('Regulation ID'),
    },
    async ({ regulationId }) => {
      try {
        await client.deleteRegulation(regulationId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Regulation ${regulationId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Audit Events
  // ===========================================================================
  server.tool(
    'segment_list_audit_events',
    `List audit events for the workspace.

Audit events track changes made to workspace resources.

Args:
  - count: Number to return (default: 20)
  - cursor: Pagination cursor
  - resourceId: Filter by resource ID
  - resourceType: Filter by resource type
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of audit events.`,
    {
      count: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      resourceId: z.string().optional(),
      resourceType: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ count, cursor, resourceId, resourceType, format }) => {
      try {
        const result = await client.listAuditEvents({ count, cursor, resourceId, resourceType });
        return formatResponse(result, format, 'audit-events');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Workspace
  // ===========================================================================
  server.tool(
    'segment_get_workspace',
    `Get details for the current workspace.

Returns:
  Workspace details including ID, name, and slug.`,
    {},
    async () => {
      try {
        const workspace = await client.getWorkspace();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workspace, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
