# Segment MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/segment)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

A Model Context Protocol (MCP) server for Segment, enabling customer data platform operations including event tracking, source management, and data routing.

## Features

- **Tracking** - Send identify, track, page, and group events
- **Sources** - Manage data sources
- **Destinations** - Configure data destinations
- **Warehouses** - Data warehouse connections
- **Tracking Plans** - Define and enforce data schemas
- **Functions** - Custom functions management
- **Transformations** - Data transformation rules
- **Engage** - Audiences and computed traits
- **Admin** - Workspace administration
- **Catalog** - Integration catalog browsing
- **Reverse ETL** - Sync data from warehouse to destinations

## Quick Start

### Recommended: Primrose SDK

The easiest way to use this MCP server is with the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const client = new PrimroseMCP({
  server: 'segment',
  credentials: {
    writeKey: 'your-segment-write-key',       // For Tracking API
    accessToken: 'your-segment-access-token'  // For Public API
  }
});
```

### Manual Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Segment-Write-Key` | Write key for Tracking API (identify, track, etc.) |
| `X-Segment-Access-Token` | Bearer token for Public API (sources, destinations, etc.) |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-Segment-Base-URL` | Override base URL (for testing) |

## Available Tools

### Tracking
- `segment_identify` - Identify a user with traits
- `segment_track` - Track an event
- `segment_page` - Track a page view
- `segment_screen` - Track a screen view
- `segment_group` - Associate user with a group
- `segment_alias` - Alias a user identity

### Sources
- `segment_list_sources` - List all sources
- `segment_get_source` - Get source details
- `segment_create_source` - Create a new source
- `segment_update_source` - Update source settings
- `segment_delete_source` - Delete a source

### Destinations
- `segment_list_destinations` - List destinations
- `segment_get_destination` - Get destination details
- `segment_create_destination` - Create destination
- `segment_update_destination` - Update destination
- `segment_delete_destination` - Delete destination

### Warehouses
- `segment_list_warehouses` - List warehouse connections
- `segment_get_warehouse` - Get warehouse details
- `segment_create_warehouse` - Create warehouse connection
- `segment_update_warehouse` - Update warehouse settings

### Tracking Plans
- `segment_list_tracking_plans` - List tracking plans
- `segment_get_tracking_plan` - Get tracking plan details
- `segment_create_tracking_plan` - Create tracking plan
- `segment_update_tracking_plan` - Update tracking plan

### Functions
- `segment_list_functions` - List custom functions
- `segment_get_function` - Get function details
- `segment_create_function` - Create function
- `segment_deploy_function` - Deploy function

### Engage
- `segment_list_audiences` - List audiences
- `segment_get_audience` - Get audience details
- `segment_create_audience` - Create audience
- `segment_list_computed_traits` - List computed traits

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Type checking
npm run typecheck

# Deploy to Cloudflare
npm run deploy
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Segment Documentation](https://segment.com/docs/)
- [Segment Public API Reference](https://docs.segmentapis.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
