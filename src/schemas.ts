import { z } from "zod";

// ============================================================
// Contact Management Schemas
// ============================================================

export const CreateContactSchema = z.object({
  email: z.string().describe("Contact email address"),
  firstName: z.string().describe("First name"),
  lastName: z.string().describe("Last name"),
  phone: z.string().optional().describe("Phone number"),
  company: z.string().optional().describe("Company name"),
  properties: z
    .record(z.string())
    .optional()
    .describe("Additional properties (key: HubSpot property name, value: property value)"),
});

export const GetContactSchema = z.object({
  contactId: z
    .string()
    .optional()
    .describe("Contact ID (either contactId or email is required)"),
  email: z
    .string()
    .optional()
    .describe("Search by email address (either contactId or email is required)"),
});

export const UpdateContactSchema = z.object({
  contactId: z.string().describe("ID of the contact to update"),
  properties: z
    .record(z.string())
    .describe("Properties to update (key: HubSpot property name, value: property value)"),
});

export const SearchContactsSchema = z.object({
  query: z.string().describe("Search query (search by name, email, phone, etc.)"),
  filters: z
    .array(
      z.object({
        propertyName: z.string().describe("Property name to filter on"),
        operator: z
          .enum([
            "EQ",
            "NEQ",
            "LT",
            "LTE",
            "GT",
            "GTE",
            "BETWEEN",
            "IN",
            "NOT_IN",
            "HAS_PROPERTY",
            "NOT_HAS_PROPERTY",
            "CONTAINS_TOKEN",
            "NOT_CONTAINS_TOKEN",
          ])
          .describe("Comparison operator"),
        value: z.string().describe("Comparison value"),
      })
    )
    .optional()
    .describe("Additional filter conditions"),
});

export const ListContactsSchema = z.object({
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of results to return (1-100, default: 10)"),
  after: z
    .string()
    .optional()
    .describe("Pagination cursor (value from paging.next.after in previous response)"),
});

// ============================================================
// Company Management Schemas
// ============================================================

export const CreateCompanySchema = z.object({
  name: z.string().describe("Company name"),
  domain: z.string().optional().describe("Company domain (e.g. example.com)"),
  properties: z
    .record(z.string())
    .optional()
    .describe("Additional properties (key: HubSpot property name, value: property value)"),
});

export const GetCompanySchema = z.object({
  companyId: z.string().describe("Company ID"),
});

export const SearchCompaniesSchema = z.object({
  query: z.string().describe("Search query (search by company name or domain)"),
});

// ============================================================
// Deal Management Schemas
// ============================================================

export const CreateDealSchema = z.object({
  dealname: z.string().describe("Deal name"),
  pipeline: z
    .string()
    .optional()
    .describe("Pipeline ID (default: default)"),
  dealstage: z
    .string()
    .optional()
    .describe("Deal stage ID"),
  amount: z.string().optional().describe("Deal amount"),
  properties: z
    .record(z.string())
    .optional()
    .describe("Additional properties (key: HubSpot property name, value: property value)"),
});

export const GetDealSchema = z.object({
  dealId: z.string().describe("Deal ID"),
});

export const UpdateDealSchema = z.object({
  dealId: z.string().describe("ID of the deal to update"),
  properties: z
    .record(z.string())
    .describe("Properties to update (key: HubSpot property name, value: property value)"),
});

export const ListDealsSchema = z.object({
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of results to return (1-100, default: 10)"),
  after: z
    .string()
    .optional()
    .describe("Pagination cursor (value from paging.next.after in previous response)"),
});

// ============================================================
// Pipeline Schemas
// ============================================================

export const GetPipelinesSchema = z.object({});

// ============================================================
// Association Schemas
// ============================================================

export const CreateAssociationSchema = z.object({
  fromType: z
    .enum(["contacts", "companies", "deals"])
    .describe("Source object type"),
  fromId: z.string().describe("Source object ID"),
  toType: z
    .enum(["contacts", "companies", "deals"])
    .describe("Target object type"),
  toId: z.string().describe("Target object ID"),
  associationType: z
    .string()
    .describe(
      "Association type (e.g. contact_to_company, company_to_contact, deal_to_contact)"
    ),
});
