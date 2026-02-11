# HubSpot CRM MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with full access to HubSpot CRM. Manage contacts, companies, deals, pipelines, and associations directly from Claude, Cursor, or any MCP-compatible client.

## Features

- **Contact Management** - Create, read, update, search, and list contacts
- **Company Management** - Create, read, and search companies
- **Deal Management** - Create, read, update, and list deals with pipeline tracking
- **Pipeline Access** - Retrieve deal pipelines and stage configurations
- **Object Associations** - Link contacts to companies, deals to contacts, etc.
- **Built-in Rate Limiting** - Automatic throttling (100 req/10s) with 429 retry
- **Cursor-based Pagination** - Efficient data retrieval for large datasets

## Available Tools (14)

| Tool | Description |
|------|-------------|
| `hubspot_create_contact` | Create a new contact |
| `hubspot_get_contact` | Get contact by ID or email |
| `hubspot_update_contact` | Update contact properties |
| `hubspot_search_contacts` | Search contacts with filters |
| `hubspot_list_contacts` | List contacts with pagination |
| `hubspot_create_company` | Create a new company |
| `hubspot_get_company` | Get company by ID |
| `hubspot_search_companies` | Search companies by name/domain |
| `hubspot_create_deal` | Create a new deal |
| `hubspot_get_deal` | Get deal by ID |
| `hubspot_update_deal` | Update deal properties |
| `hubspot_list_deals` | List deals with pagination |
| `hubspot_get_pipelines` | Get all deal pipelines and stages |
| `hubspot_create_association` | Associate CRM objects together |

## Quick Start

```bash
npx @cloud9-labs/mcp-hubspot
```

## Prerequisites

- Node.js >= 20.0.0
- HubSpot account with a [Private App access token](https://developers.hubspot.com/docs/api/private-apps)

### Required HubSpot Scopes

Your Private App needs these scopes:
- `crm.objects.contacts.read` / `crm.objects.contacts.write`
- `crm.objects.companies.read` / `crm.objects.companies.write`
- `crm.objects.deals.read` / `crm.objects.deals.write`

## Installation

### Via npm (Recommended)

```bash
npm install @cloud9-labs/mcp-hubspot
```

### From Source

```bash
git clone https://github.com/cloud9-labs/mcp-hubspot.git
cd mcp-hubspot
npm install
npm run build
```

## Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hubspot": {
      "command": "npx",
      "args": ["-y", "@cloud9-labs/mcp-hubspot"],
      "env": {
        "HUBSPOT_ACCESS_TOKEN": "your-access-token-here"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "hubspot": {
      "command": "npx",
      "args": ["-y", "@cloud9-labs/mcp-hubspot"],
      "env": {
        "HUBSPOT_ACCESS_TOKEN": "your-access-token-here"
      }
    }
  }
}
```

## Usage Examples

Once connected, you can ask your AI assistant:

- "Create a contact for John Smith at john@example.com"
- "Search for all contacts at Acme Corp"
- "Create a deal called 'Enterprise License' for $50,000"
- "Show me all deal pipelines and their stages"
- "Associate contact 123 with company 456"
- "List the last 20 deals in our pipeline"

## Search Filters

The `hubspot_search_contacts` tool supports advanced filtering:

```
Operators: EQ, NEQ, LT, LTE, GT, GTE, BETWEEN, IN, NOT_IN,
           HAS_PROPERTY, NOT_HAS_PROPERTY, CONTAINS_TOKEN, NOT_CONTAINS_TOKEN
```

Example: Search contacts where lifecycle stage equals "lead":
```json
{
  "query": "",
  "filters": [
    {
      "propertyName": "lifecyclestage",
      "operator": "EQ",
      "value": "lead"
    }
  ]
}
```

## Building an AI Sales Automation System?

This MCP server is part of an open-source toolkit for AI-powered sales automation. We're building MCP servers that connect your entire sales stack — CRM, email, scheduling, lead scoring, and more.

Follow our progress and get updates:

- **X (Twitter)**: [@cloud9_ai_labs](https://x.com/cloud9_ai_labs)
- **GitHub**: [cloud9-labs](https://github.com/cloud9-labs)

## License

MIT
