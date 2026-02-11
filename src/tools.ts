import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { HubSpotClient } from "./client.js";
import {
  CreateContactSchema,
  GetContactSchema,
  UpdateContactSchema,
  SearchContactsSchema,
  ListContactsSchema,
  CreateCompanySchema,
  GetCompanySchema,
  SearchCompaniesSchema,
  CreateDealSchema,
  GetDealSchema,
  UpdateDealSchema,
  ListDealsSchema,
  GetPipelinesSchema,
  CreateAssociationSchema,
} from "./schemas.js";

/**
 * Register all tools on the MCP server
 */
export function registerTools(server: McpServer): void {
  let _client: HubSpotClient | null = null;
  const getClient = () => {
    if (!_client) _client = new HubSpotClient();
    return _client;
  };

  // ============================================================
  // Contact Management
  // ============================================================

  server.tool(
    "hubspot_create_contact",
    "Create a new contact in HubSpot CRM",
    CreateContactSchema.shape,
    async ({ email, firstName, lastName, phone, company, properties }) => {
      try {
        const props: Record<string, string> = {
          email,
          firstname: firstName,
          lastname: lastName,
          ...(phone ? { phone } : {}),
          ...(company ? { company } : {}),
          ...(properties ?? {}),
        };
        const result = await getClient().createContact(props);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  contactId: result.id,
                  properties: result.properties,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_get_contact",
    "Get a contact from HubSpot CRM by ID or email address",
    GetContactSchema.shape,
    async ({ contactId, email }) => {
      try {
        if (!contactId && !email) {
          throw new Error(
            "Either contactId or email must be provided."
          );
        }

        const result = contactId
          ? await getClient().getContactById(contactId)
          : await getClient().getContactByEmail(email!);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_update_contact",
    "Update contact properties in HubSpot CRM",
    UpdateContactSchema.shape,
    async ({ contactId, properties }) => {
      try {
        const result = await getClient().updateContact(contactId, properties);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  contactId: result.id,
                  properties: result.properties,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_search_contacts",
    "Search contacts in HubSpot CRM by name, email, phone, or custom filters",
    SearchContactsSchema.shape,
    async ({ query, filters }) => {
      try {
        const result = await getClient().searchContacts(query, filters);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  total: result.total,
                  results: result.results,
                  paging: result.paging,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_list_contacts",
    "List contacts in HubSpot CRM with pagination",
    ListContactsSchema.shape,
    async ({ limit, after }) => {
      try {
        const result = await getClient().listContacts(limit, after);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  results: result.results,
                  paging: result.paging,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ============================================================
  // Company Management
  // ============================================================

  server.tool(
    "hubspot_create_company",
    "Create a new company in HubSpot CRM",
    CreateCompanySchema.shape,
    async ({ name, domain, properties }) => {
      try {
        const props: Record<string, string> = {
          name,
          ...(domain ? { domain } : {}),
          ...(properties ?? {}),
        };
        const result = await getClient().createCompany(props);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  companyId: result.id,
                  properties: result.properties,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_get_company",
    "Get company details from HubSpot CRM by ID",
    GetCompanySchema.shape,
    async ({ companyId }) => {
      try {
        const result = await getClient().getCompany(companyId);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_search_companies",
    "Search companies in HubSpot CRM by name or domain",
    SearchCompaniesSchema.shape,
    async ({ query }) => {
      try {
        const result = await getClient().searchCompanies(query);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  total: result.total,
                  results: result.results,
                  paging: result.paging,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ============================================================
  // Deal Management
  // ============================================================

  server.tool(
    "hubspot_create_deal",
    "Create a new deal in HubSpot CRM",
    CreateDealSchema.shape,
    async ({ dealname, pipeline, dealstage, amount, properties }) => {
      try {
        const props: Record<string, string> = {
          dealname,
          ...(pipeline ? { pipeline } : {}),
          ...(dealstage ? { dealstage } : {}),
          ...(amount ? { amount } : {}),
          ...(properties ?? {}),
        };
        const result = await getClient().createDeal(props);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  dealId: result.id,
                  properties: result.properties,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_get_deal",
    "Get deal details from HubSpot CRM by ID",
    GetDealSchema.shape,
    async ({ dealId }) => {
      try {
        const result = await getClient().getDeal(dealId);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_update_deal",
    "Update deal properties in HubSpot CRM",
    UpdateDealSchema.shape,
    async ({ dealId, properties }) => {
      try {
        const result = await getClient().updateDeal(dealId, properties);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  dealId: result.id,
                  properties: result.properties,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "hubspot_list_deals",
    "List deals in HubSpot CRM with pagination",
    ListDealsSchema.shape,
    async ({ limit, after }) => {
      try {
        const result = await getClient().listDeals(limit, after);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  results: result.results,
                  paging: result.paging,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ============================================================
  // Pipelines
  // ============================================================

  server.tool(
    "hubspot_get_pipelines",
    "Get all deal pipelines and their stages from HubSpot CRM",
    GetPipelinesSchema.shape,
    async () => {
      try {
        const result = await getClient().getPipelines();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ============================================================
  // Associations
  // ============================================================

  server.tool(
    "hubspot_create_association",
    "Create an association between HubSpot CRM objects (e.g. contact-company, deal-contact)",
    CreateAssociationSchema.shape,
    async ({ fromType, fromId, toType, toId, associationType }) => {
      try {
        const result = await getClient().createAssociation(
          fromType,
          fromId,
          toType,
          toId,
          associationType
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  association: result,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

// ============================================================
// Helpers
// ============================================================

function errorResult(error: unknown) {
  const message =
    error instanceof Error ? error.message : "An unknown error occurred";
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`,
      },
    ],
    isError: true,
  };
}
