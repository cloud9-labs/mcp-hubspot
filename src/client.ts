const BASE_URL = "https://api.hubapi.com";

/**
 * HubSpot CRM API v3 Client
 *
 * Reads access token from the HUBSPOT_ACCESS_TOKEN environment variable
 * and makes requests to HubSpot CRM v3 API endpoints.
 *
 * Rate limiting: handles 100 requests/10 seconds (retries on 429 responses)
 */
export class HubSpotClient {
  private readonly accessToken: string;
  private requestTimestamps: number[] = [];

  constructor() {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        "HUBSPOT_ACCESS_TOKEN environment variable is not set. " +
          "Get your access token from HubSpot developer account and set it as an environment variable. " +
          "See: https://developers.hubspot.com/docs/api/private-apps"
      );
    }
    this.accessToken = token;
  }

  // ----------------------------------------------------------
  // Rate Limiting
  // ----------------------------------------------------------

  /**
   * Throttle requests to respect HubSpot API rate limits (100 req/10s)
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const windowMs = 10_000;
    const maxRequests = 100;

    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < windowMs
    );

    if (this.requestTimestamps.length >= maxRequests) {
      const oldestInWindow = this.requestTimestamps[0];
      const waitMs = windowMs - (now - oldestInWindow) + 50;
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }

    this.requestTimestamps.push(Date.now());
  }

  // ----------------------------------------------------------
  // Internal HTTP Helper
  // ----------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    queryParams?: Record<string, string | undefined>
  ): Promise<T> {
    await this.throttle();

    let url = `${BASE_URL}${path}`;

    if (queryParams) {
      const filtered = Object.entries(queryParams).filter(
        ([, v]) => v !== undefined
      ) as [string, string][];
      if (filtered.length > 0) {
        const qs = new URLSearchParams(filtered).toString();
        url += `?${qs}`;
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined && (method === "POST" || method === "PATCH" || method === "PUT")) {
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOptions);

    // Rate limit: 429
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const waitSec = retryAfter ? Number(retryAfter) : 10;
      await new Promise((resolve) =>
        setTimeout(resolve, waitSec * 1000)
      );
      const retryRes = await fetch(url, fetchOptions);
      if (!retryRes.ok) {
        const errorBody = await retryRes.text().catch(() => "");
        throw new Error(
          `HubSpot API error (${retryRes.status} ${retryRes.statusText}): ${errorBody}`
        );
      }
      if (retryRes.status === 204) {
        return {} as T;
      }
      return (await retryRes.json()) as T;
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      throw new Error(
        `HubSpot API error (${res.status} ${res.statusText}): ${errorBody}`
      );
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  private get<T>(
    path: string,
    queryParams?: Record<string, string | undefined>
  ): Promise<T> {
    return this.request<T>("GET", path, undefined, queryParams);
  }

  private post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  private put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  // ----------------------------------------------------------
  // Contact Management
  // ----------------------------------------------------------

  async createContact(properties: Record<string, string>): Promise<HubSpotObject> {
    return this.post<HubSpotObject>("/crm/v3/objects/contacts", {
      properties,
    });
  }

  async getContactById(contactId: string): Promise<HubSpotObject> {
    return this.get<HubSpotObject>(`/crm/v3/objects/contacts/${contactId}`, {
      properties:
        "email,firstname,lastname,phone,company,lifecyclestage,hs_lead_status,createdate,lastmodifieddate",
    });
  }

  async getContactByEmail(email: string): Promise<HubSpotObject> {
    return this.get<HubSpotObject>(`/crm/v3/objects/contacts/${encodeURIComponent(email)}`, {
      idProperty: "email",
      properties:
        "email,firstname,lastname,phone,company,lifecyclestage,hs_lead_status,createdate,lastmodifieddate",
    });
  }

  async updateContact(
    contactId: string,
    properties: Record<string, string>
  ): Promise<HubSpotObject> {
    return this.patch<HubSpotObject>(`/crm/v3/objects/contacts/${contactId}`, {
      properties,
    });
  }

  async searchContacts(
    query: string,
    filters?: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }>
  ): Promise<HubSpotSearchResult> {
    const searchBody: HubSpotSearchRequest = {
      query,
      properties: [
        "email",
        "firstname",
        "lastname",
        "phone",
        "company",
        "lifecyclestage",
        "hs_lead_status",
      ],
      limit: 20,
    };

    if (filters && filters.length > 0) {
      searchBody.filterGroups = [
        {
          filters: filters.map((f) => ({
            propertyName: f.propertyName,
            operator: f.operator,
            value: f.value,
          })),
        },
      ];
    }

    return this.post<HubSpotSearchResult>(
      "/crm/v3/objects/contacts/search",
      searchBody
    );
  }

  async listContacts(
    limit?: number,
    after?: string
  ): Promise<HubSpotListResult> {
    return this.get<HubSpotListResult>("/crm/v3/objects/contacts", {
      limit: String(limit ?? 10),
      after,
      properties:
        "email,firstname,lastname,phone,company,lifecyclestage,hs_lead_status",
    });
  }

  // ----------------------------------------------------------
  // Company Management
  // ----------------------------------------------------------

  async createCompany(properties: Record<string, string>): Promise<HubSpotObject> {
    return this.post<HubSpotObject>("/crm/v3/objects/companies", {
      properties,
    });
  }

  async getCompany(companyId: string): Promise<HubSpotObject> {
    return this.get<HubSpotObject>(`/crm/v3/objects/companies/${companyId}`, {
      properties:
        "name,domain,industry,phone,city,state,country,numberofemployees,annualrevenue,createdate,lastmodifieddate",
    });
  }

  async searchCompanies(query: string): Promise<HubSpotSearchResult> {
    return this.post<HubSpotSearchResult>(
      "/crm/v3/objects/companies/search",
      {
        query,
        properties: [
          "name",
          "domain",
          "industry",
          "phone",
          "city",
          "state",
          "country",
          "numberofemployees",
          "annualrevenue",
        ],
        limit: 20,
      }
    );
  }

  // ----------------------------------------------------------
  // Deal Management
  // ----------------------------------------------------------

  async createDeal(properties: Record<string, string>): Promise<HubSpotObject> {
    return this.post<HubSpotObject>("/crm/v3/objects/deals", {
      properties,
    });
  }

  async getDeal(dealId: string): Promise<HubSpotObject> {
    return this.get<HubSpotObject>(`/crm/v3/objects/deals/${dealId}`, {
      properties:
        "dealname,pipeline,dealstage,amount,closedate,hubspot_owner_id,createdate,lastmodifieddate",
    });
  }

  async updateDeal(
    dealId: string,
    properties: Record<string, string>
  ): Promise<HubSpotObject> {
    return this.patch<HubSpotObject>(`/crm/v3/objects/deals/${dealId}`, {
      properties,
    });
  }

  async listDeals(limit?: number, after?: string): Promise<HubSpotListResult> {
    return this.get<HubSpotListResult>("/crm/v3/objects/deals", {
      limit: String(limit ?? 10),
      after,
      properties:
        "dealname,pipeline,dealstage,amount,closedate,hubspot_owner_id",
    });
  }

  // ----------------------------------------------------------
  // Pipelines
  // ----------------------------------------------------------

  async getPipelines(): Promise<HubSpotPipelinesResult> {
    return this.get<HubSpotPipelinesResult>(
      "/crm/v3/pipelines/deals"
    );
  }

  // ----------------------------------------------------------
  // Associations
  // ----------------------------------------------------------

  async createAssociation(
    fromType: string,
    fromId: string,
    toType: string,
    toId: string,
    associationType: string
  ): Promise<HubSpotAssociationResult> {
    return this.put<HubSpotAssociationResult>(
      `/crm/v3/objects/${fromType}/${fromId}/associations/${toType}/${toId}/${associationType}`,
      undefined
    );
  }
}

// ============================================================
// Response Types
// ============================================================

export interface HubSpotObject {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotSearchRequest {
  query: string;
  properties: string[];
  limit: number;
  filterGroups?: Array<{
    filters: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }>;
  }>;
  after?: string;
}

export interface HubSpotSearchResult {
  total: number;
  results: HubSpotObject[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

export interface HubSpotListResult {
  results: HubSpotObject[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

export interface HubSpotPipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotPipeline {
  id: string;
  label: string;
  displayOrder: number;
  stages: HubSpotPipelineStage[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotPipelinesResult {
  results: HubSpotPipeline[];
}

export interface HubSpotAssociationResult {
  fromObjectTypeId: string;
  fromObjectId: number;
  toObjectTypeId: string;
  toObjectId: number;
  labels: string[];
}
