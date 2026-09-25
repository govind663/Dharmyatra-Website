const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type PanditProfile = {
  id: number;
  userId: number;
  slug: string;
  displayName: string;
  title: string | null;
  photo: string | null;
  experienceYears: number;
  location: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  languages: string[];
  specializations: string[];
  pujaTypes: string[];
  associatedWith: string | null;
  about: string | null;
  availability: string | null;
  serviceAreas: string[];
  profileStatus: string;
  verificationStatus: string;
  identityVerified: boolean;
  profileVerified: boolean;
  authorizedContact: boolean;
  featured: boolean;
  listingActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PanditService = {
  id: number;
  panditId: number;
  name: string;
  description: string | null;
  priceAmount: number | null;
  currency: string;
  durationMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PanditStats = {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
};

export type PanditDashboardResponse = {
  success: boolean;
  profile: PanditProfile;
  services: PanditService[];
  stats: PanditStats;
};

export type PanditProfileInput = {
  name?: string;
  phone?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  displayName?: string;
  title?: string;
  photo?: string;
  experienceYears?: number;
  location?: string;
  languages?: string[];
  specializations?: string[];
  pujaTypes?: string[];
  associatedWith?: string;
  about?: string;
  availability?: string;
  serviceAreas?: string[];
};

export type PanditServiceInput = {
  name: string;
  description?: string;
  priceAmount?: number | null;
  currency?: string;
  durationMinutes?: number | null;
  isActive?: boolean;
};

export type PanditServiceUpdateInput =
  Partial<PanditServiceInput>;

export type PanditApiResult<T = unknown> = T & {
  success?: boolean;
  message?: string;
  error?: string;
  code?: string;
};

export class PanditApiError extends Error {
  status: number;
  code?: string;
  payload?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    payload?: unknown,
  ) {
    super(message);

    this.name = "PanditApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

/*
|--------------------------------------------------------------------------
| Internal Helpers
|--------------------------------------------------------------------------
*/

const REQUEST_TIMEOUT = 15000;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getErrorMessage(
  payload: unknown,
  status: number,
): string {
  if (isRecord(payload)) {
    if (typeof payload.error === "string") {
      return payload.error;
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }
  }

  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Your session has expired. Please login again.";
    case 403:
      return "You are not authorized to perform this action.";
    case 404:
      return "Requested Pandit resource was not found.";
    case 409:
      return "This action conflicts with the current Pandit profile state.";
    case 422:
      return "The submitted data is invalid.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "The DivyaDhara server encountered an error.";
    default:
      return `Request failed with status ${status}.`;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<PanditApiResult<T>> {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const headers = new Headers(
      init.headers ?? {},
    );

    if (!headers.has("Accept")) {
      headers.set(
        "Accept",
        "application/json",
      );
    }

    if (
      init.body &&
      !(init.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set(
        "Content-Type",
        "application/json",
      );
    }

    const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...init,
        credentials: "include",
        headers,
        signal: controller.signal,
      },
    );

    const raw = await response.text();

    let data: unknown = {};

    if (raw.trim()) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = {
          error: raw.trim(),
        };
      }
    }

    if (!response.ok) {
      const payload = isRecord(data)
        ? data
        : undefined;

      const message = getErrorMessage(
        payload,
        response.status,
      );

      const code =
        payload &&
        typeof payload.code === "string"
          ? payload.code
          : undefined;

      throw new PanditApiError(
        message,
        response.status,
        code,
        data,
      );
    }

    return data as PanditApiResult<T>;
  } catch (error) {
    if (error instanceof PanditApiError) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new PanditApiError(
        "Request timed out. Please make sure the DivyaDhara API server is running.",
        408,
        "REQUEST_TIMEOUT",
      );
    }

    if (error instanceof TypeError) {
      throw new PanditApiError(
        `Unable to connect to the DivyaDhara API server at ${API_BASE_URL}.`,
        0,
        "API_CONNECTION_ERROR",
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while communicating with the Pandit API.",
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function jsonBody(
  value: unknown,
): RequestInit {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  };
}

/*
|--------------------------------------------------------------------------
| Pandit API
|--------------------------------------------------------------------------
*/

export const panditApi = {
  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  dashboard(): Promise<PanditDashboardResponse> {
    return request<PanditDashboardResponse>(
      "/api/pandit/dashboard",
    ) as Promise<PanditDashboardResponse>;
  },

  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  profile(): Promise<
    PanditApiResult<{
      profile: PanditProfile;
    }>
  > {
    return request<{
      profile: PanditProfile;
    }>(
      "/api/pandit/profile",
    );
  },

  createProfile(
    input: PanditProfileInput,
  ): Promise<
    PanditApiResult<{
      profile: PanditProfile;
    }>
  > {
    return request<{
      profile: PanditProfile;
    }>(
      "/api/pandit/profile",
      {
        method: "POST",
        ...jsonBody(input),
      },
    );
  },

  updateProfile(
    input: PanditProfileInput,
  ): Promise<
    PanditApiResult<{
      profile: PanditProfile;
    }>
  > {
    return request<{
      profile: PanditProfile;
    }>(
      "/api/pandit/profile",
      {
        method: "PATCH",
        ...jsonBody(input),
      },
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Services
  |--------------------------------------------------------------------------
  */

  services(): Promise<
    PanditApiResult<{
      services: PanditService[];
    }>
  > {
    return request<{
      services: PanditService[];
    }>(
      "/api/pandit/services",
    );
  },

  createService(
    input: PanditServiceInput,
  ): Promise<
    PanditApiResult<{
      service: PanditService;
    }>
  > {
    return request<{
      service: PanditService;
    }>(
      "/api/pandit/services",
      {
        method: "POST",
        ...jsonBody(input),
      },
    );
  },

  getService(
    id: number,
  ): Promise<
    PanditApiResult<{
      service: PanditService;
    }>
  > {
    return request<{
      service: PanditService;
    }>(
      `/api/pandit/services/${id}`,
    );
  },

  updateService(
    id: number,
    input: PanditServiceUpdateInput,
  ): Promise<
    PanditApiResult<{
      service: PanditService;
    }>
  > {
    return request<{
      service: PanditService;
    }>(
      `/api/pandit/services/${id}`,
      {
        method: "PATCH",
        ...jsonBody(input),
      },
    );
  },

  deleteService(
    id: number,
  ): Promise<
    PanditApiResult<{
      deletedServiceId: number;
    }>
  > {
    return request<{
      deletedServiceId: number;
    }>(
      `/api/pandit/services/${id}`,
      {
        method: "DELETE",
      },
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Listing
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | Listing status is handled separately from profile updates.
  |--------------------------------------------------------------------------
  */

  setListing(
    listingActive: boolean,
  ): Promise<
    PanditApiResult<{
      listingActive: boolean;
    }>
  > {
    return request<{
      listingActive: boolean;
    }>(
      "/api/pandit/listing",
      {
        method: "PATCH",
        ...jsonBody({
          listingActive,
        }),
      },
    );
  },
};

/*
|--------------------------------------------------------------------------
| Convenience Error Helper
|--------------------------------------------------------------------------
*/

export function getPanditApiErrorMessage(
  error: unknown,
): string {
  if (error instanceof PanditApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while processing the Pandit request.";
}