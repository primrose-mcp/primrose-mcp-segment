/**
 * Segment MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It provides tools for interacting with Segment APIs:
 * - Tracking API: identify, track, page, screen, group, alias, batch
 * - Public API: sources, destinations, warehouses, tracking plans, functions, etc.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers (at least one):
 * - X-Segment-Write-Key: Write key for Tracking API
 * - X-Segment-Access-Token: Bearer token for Public API
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createSegmentClient } from './client.js';
import {
  registerAdminTools,
  registerCatalogTools,
  registerDestinationsTools,
  registerEngageTools,
  registerFunctionsTools,
  registerReverseETLTools,
  registerSourcesTools,
  registerTrackingPlansTools,
  registerTrackingTools,
  registerTransformationsTools,
  registerWarehousesTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-segment';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 * For multi-tenant deployments, use the stateless mode instead.
 */
export class SegmentMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Segment-Write-Key or X-Segment-Access-Token header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createSegmentClient(credentials);

  // Register all tools
  registerTrackingTools(server, client);
  registerSourcesTools(server, client);
  registerDestinationsTools(server, client);
  registerWarehousesTools(server, client);
  registerTrackingPlansTools(server, client);
  registerFunctionsTools(server, client);
  registerTransformationsTools(server, client);
  registerEngageTools(server, client);
  registerAdminTools(server, client);
  registerCatalogTools(server, client);
  registerReverseETLTools(server, client);

  // Test connection tool
  server.tool(
    'segment_test_connection',
    'Test the connection to Segment APIs',
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stateless MCP endpoint
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Segment-Write-Key or X-Segment-Access-Token'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response with API documentation
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Segment MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          tracking_api: {
            header: 'X-Segment-Write-Key',
            description: 'Write key for Tracking API (identify, track, page, etc.)',
          },
          public_api: {
            header: 'X-Segment-Access-Token',
            description: 'Bearer token for Public API (sources, destinations, etc.)',
          },
        },
        tools: {
          tracking: [
            'segment_identify',
            'segment_track',
            'segment_page',
            'segment_screen',
            'segment_group',
            'segment_alias',
            'segment_batch',
          ],
          sources: [
            'segment_list_sources',
            'segment_get_source',
            'segment_create_source',
            'segment_update_source',
            'segment_delete_source',
          ],
          destinations: [
            'segment_list_destinations',
            'segment_get_destination',
            'segment_create_destination',
            'segment_update_destination',
            'segment_delete_destination',
          ],
          warehouses: [
            'segment_list_warehouses',
            'segment_get_warehouse',
            'segment_create_warehouse',
            'segment_update_warehouse',
            'segment_delete_warehouse',
          ],
          tracking_plans: [
            'segment_list_tracking_plans',
            'segment_get_tracking_plan',
            'segment_create_tracking_plan',
          ],
          functions: [
            'segment_list_functions',
            'segment_get_function',
            'segment_create_function',
            'segment_deploy_function',
          ],
          engage: [
            'segment_list_audiences',
            'segment_list_computed_traits',
            'segment_list_spaces',
          ],
          admin: [
            'segment_list_users',
            'segment_list_labels',
            'segment_list_audit_events',
            'segment_get_workspace',
          ],
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
