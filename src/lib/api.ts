/* ============================================================================
 * DivyaDhara API Client
 * ----------------------------------------------------------------------------
 * Centralized frontend API layer for:
 * - Authentication
 * - Super Admin
 * - Future Pandit / Temple Manager / Sales APIs
 *
 * Backend:
 *   Express + SQLite
 *
 * Frontend:
 *   React + TypeScript + Vite
 * ========================================================================== */

const DEFAULT_API_URL = "http://localhost:3001";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_URL
).replace(/\/+$/, "");

const DEFAULT_TIMEOUT_MS = 20_000;

/* ============================================================================
 * Types
 * ========================================================================== */

export type ApiPrimitive =
  | string
  | number
  | boolean
  | null;

export type ApiJsonValue =
  | ApiPrimitive
  | ApiJsonValue[]
  | {
      [key: string]: ApiJsonValue;
    };

export type ApiObject = Record<string, ApiJsonValue>;

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  [key: string]: unknown;
};

export type ApiRequestOptions = RequestInit & {
  timeoutMs?: number;
  skipJsonHeaders?: boolean;
};

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined;

/* ============================================================================
 * API Error
 * ========================================================================== */

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      details?: unknown;
    } = {},
  ) {
    super(message);

    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code ?? "API_ERROR";
    this.details = options.details;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/* ============================================================================
 * Helpers
 * ========================================================================== */

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isJsonResponse(
  response: Response,
): boolean {
  const contentType =
    response.headers.get("content-type") || "";

  return contentType
    .toLowerCase()
    .includes("application/json");
}

function getErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const data =
    payload as Record<string, unknown>;

  const candidates = [
    data.error,
    data.message,
    data.detail,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return fallback;
}

function getApiErrorCode(
  payload: unknown,
): string {
  if (!payload || typeof payload !== "object") {
    return "API_ERROR";
  }

  const data =
    payload as Record<string, unknown>;

  if (
    typeof data.code === "string" &&
    data.code.trim()
  ) {
    return data.code.trim();
  }

  return "API_ERROR";
}

function normalizePath(
  path: string,
): string {
  if (!path) {
    return "";
  }

  return path.startsWith("/")
    ? path
    : `/${path}`;
}

export function buildApiUrl(
  path: string,
): string {
  return `${API_URL}${normalizePath(path)}`;
}

export function buildQueryString(
  params:
    | Record<string, QueryValue>
    | URLSearchParams
    | undefined,
): string {
  if (!params) {
    return "";
  }

  const search =
    params instanceof URLSearchParams
      ? new URLSearchParams(params)
      : new URLSearchParams();

  if (!(params instanceof URLSearchParams)) {
    for (const [key, value] of Object.entries(
      params,
    )) {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        continue;
      }

      search.set(
        key,
        String(value),
      );
    }
  }

  const query = search.toString();

  return query ? `?${query}` : "";
}

function mergeSignals(
  externalSignal:
    | AbortSignal
    | null
    | undefined,
  timeoutController: AbortController,
): AbortSignal {
  if (!externalSignal) {
    return timeoutController.signal;
  }

  if (
    typeof AbortSignal !== "undefined" &&
    "any" in AbortSignal &&
    typeof AbortSignal.any === "function"
  ) {
    return AbortSignal.any([
      externalSignal,
      timeoutController.signal,
    ]);
  }

  const controller =
    new AbortController();

  const abort = () => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  };

  if (externalSignal.aborted) {
    abort();
  }

  externalSignal.addEventListener(
    "abort",
    abort,
    { once: true },
  );

  timeoutController.signal.addEventListener(
    "abort",
    abort,
    { once: true },
  );

  return controller.signal;
}

function prepareBody(
  body: BodyInit | Record<string, unknown> | null | undefined,
): BodyInit | null | undefined {
  if (
    body === null ||
    body === undefined
  ) {
    return body;
  }

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  if (
    typeof body === "object" &&
    !(body instanceof ReadableStream)
  ) {
    return JSON.stringify(body);
  }

  return body;
}

/* ============================================================================
 * Core Request Function
 * ========================================================================== */

export async function apiRequest<
  T = unknown,
>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    skipJsonHeaders = false,
    signal: externalSignal,
    headers,
    body,
    ...requestInit
  } = options;

  const controller =
    new AbortController();

  const timeoutId = window.setTimeout(
    () => {
      controller.abort();
    },
    timeoutMs,
  );

  const signal = mergeSignals(
    externalSignal,
    controller,
  );

  const preparedBody =
    prepareBody(body);

  const finalHeaders =
    new Headers(headers);

  if (!skipJsonHeaders) {
    if (
      !finalHeaders.has(
        "Accept",
      )
    ) {
      finalHeaders.set(
        "Accept",
        "application/json",
      );
    }

    const canSendJson =
      preparedBody !== undefined &&
      preparedBody !== null &&
      typeof preparedBody === "string";

    if (
      canSendJson &&
      !finalHeaders.has(
        "Content-Type",
      )
    ) {
      finalHeaders.set(
        "Content-Type",
        "application/json",
      );
    }
  }

  try {
    const response = await fetch(
      buildApiUrl(path),
      {
        ...requestInit,
        headers: finalHeaders,
        body: preparedBody,
        credentials: "include",
        signal,
      },
    );

    let payload: unknown = null;

    if (response.status !== 204) {
      if (isJsonResponse(response)) {
        try {
          payload =
            await response.json();
        } catch {
          payload = null;
        }
      } else {
        try {
          const text =
            await response.text();

          payload = text
            ? {
                message: text,
              }
            : null;
        } catch {
          payload = null;
        }
      }
    }

    if (!response.ok) {
      const fallback =
        `API request failed with status ${response.status}.`;

      throw new ApiError(
        getErrorMessage(
          payload,
          fallback,
        ),
        {
          status: response.status,
          code:
            getApiErrorCode(
              payload,
            ),
          details: payload,
        },
      );
    }

    if (
      payload &&
      isPlainObject(payload) &&
      "success" in payload &&
      payload.success === false
    ) {
      throw new ApiError(
        getErrorMessage(
          payload,
          "The API reported an error.",
        ),
        {
          status: response.status,
          code:
            getApiErrorCode(
              payload,
            ),
          details: payload,
        },
      );
    }

    if (
      payload &&
      isPlainObject(payload)
    ) {
      return payload as ApiResponse<T>;
    }

    return {
      success: true,
      data: payload as T,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ApiError(
        `Request timed out after ${timeoutMs}ms.`,
        {
          code: "REQUEST_TIMEOUT",
        },
      );
    }

    if (
      error instanceof TypeError
    ) {
      throw new ApiError(
        "Unable to connect to the DivyaDhara server. Please check that the backend is running.",
        {
          code: "NETWORK_ERROR",
          details: error,
        },
      );
    }

    throw new ApiError(
      "An unexpected API error occurred.",
      {
        code: "UNKNOWN_ERROR",
        details: error,
      },
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/* ============================================================================
 * Convenience Methods
 * ========================================================================== */

export async function apiGet<
  T = unknown,
>(
  path: string,
  params?: Record<
    string,
    QueryValue
  >,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const query =
    buildQueryString(params);

  return apiRequest<T>(
    `${path}${query}`,
    {
      ...options,
      method: "GET",
    },
  );
}

export async function apiPost<
  T = unknown,
>(
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    path,
    {
      ...options,
      method: "POST",
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );
}

export async function apiPut<
  T = unknown,
>(
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    path,
    {
      ...options,
      method: "PUT",
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );
}

export async function apiPatch<
  T = unknown,
>(
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    path,
    {
      ...options,
      method: "PATCH",
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );
}

export async function apiDelete<
  T = unknown,
>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    path,
    {
      ...options,
      method: "DELETE",
    },
  );
}

/* ============================================================================
 * Authentication Types
 * ========================================================================== */

export type AuthRole =
  | "visitor"
  | "pandit"
  | "temple_manager"
  | "sales"
  | "super_admin";

export type AuthStatus =
  | "pending"
  | "active"
  | "suspended"
  | "rejected"
  | "blocked";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  role: AuthRole;
  status: AuthStatus;
  avatar: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  role:
    | "visitor"
    | "pandit"
    | "temple_manager";
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  password: string;

  preferredLanguage?: string;
  marketingConsent?: boolean;

  title?: string;
  photo?: string;
  experienceYears?: number;
  district?: string;
  languages?: string[];
  specializations?: string[];
  pujaTypes?: string[];
  associatedWith?: string;
  about?: string;
  availability?: string;
  serviceAreas?: string[];

  services?: Array<{
    name: string;
    description?: string;
    priceAmount?: number;
    durationMinutes?: number;
  }>;

  [key: string]: unknown;
};

export type AuthMeData = {
  authenticated: boolean;
  user: AuthUser | null;
};

export type AuthLoginData = {
  authenticated: boolean;
  user: AuthUser;
};

export type AuthRegisterData = {
  authenticated: boolean;
  user: AuthUser;
};

export type AuthRoleData = {
  role: AuthRole;
  status: AuthStatus;
  userId: number;
};

/* ============================================================================
 * Authentication API
 * ========================================================================== */

export const authApi = {
  async me() {
    return apiGet<AuthMeData>(
      "/api/auth/me",
    );
  },

  async role() {
    return apiGet<AuthRoleData>(
      "/api/auth/role",
    );
  },

  async login(
    payload: LoginPayload,
  ) {
    return apiPost<AuthLoginData>(
      "/api/auth/login",
      payload,
    );
  },

  async register(
    payload: RegisterPayload,
  ) {
    return apiPost<AuthRegisterData>(
      "/api/auth/register",
      payload,
    );
  },

  async logout() {
    return apiPost<{
      authenticated: false;
    }>(
      "/api/auth/logout",
    );
  },

  async forgotPassword(
    email: string,
  ) {
    return apiPost<{
      resetToken?: string;
      expiresAt?: string;
    }>(
      "/api/auth/forgot-password",
      { email },
    );
  },

  async resetPassword(
    payload: {
      token: string;
      password: string;
    },
  ) {
    return apiPost(
      "/api/auth/reset-password",
      payload,
    );
  },

  async verifyEmail(
    token: string,
  ) {
    return apiPost(
      "/api/auth/verify-email",
      { token },
    );
  },
};

/* ============================================================================
 * Generic Admin Types
 * ========================================================================== */

export type AdminUserFilters = {
  search?: string;
  role?: AuthRole;
  status?: AuthStatus;
  page?: number;
  limit?: number;
};

export type AdminListFilters = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export type AdminStatusPayload = {
  status:
    | "pending"
    | "active"
    | "suspended"
    | "rejected"
    | "blocked";
  reason?: string;
};

export type AdminRejectPayload = {
  reason?: string;
};

export type AdminFeaturePayload = {
  featured: boolean;
};

export type AdminListingPayload = {
  listingActive: boolean;
};

export type AdminPlanPayload = {
  name?: string;
  code?: string;
  priceAmount?: number;
  currency?: string;
  leadLimit?: number;
  durationDays?: number;
  listingEnabled?: boolean;
  featured?: boolean;
  prioritySupport?: boolean;
  isActive?: boolean;
  [key: string]: unknown;
};

export type AdminSettingsPayload =
  Record<string, unknown>;

export type CreateSalesPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

/* ============================================================================
 * Super Admin API
 * ========================================================================== */

export const adminApi = {
  async dashboard<
    T = unknown,
  >() {
    return apiGet<T>(
      "/api/admin/dashboard",
    );
  },

  async me<
    T = AuthUser,
  >() {
    return apiGet<T>(
      "/api/admin/me",
    );
  },

  async users<
    T = unknown,
  >(
    filters?: AdminUserFilters,
  ) {
    return apiGet<T>(
      "/api/admin/users",
      filters,
    );
  },

  async user<
    T = unknown,
  >(
    userId: number | string,
  ) {
    return apiGet<T>(
      `/api/admin/users/${encodeURIComponent(
        String(userId),
      )}`,
    );
  },

  async updateUserStatus<
    T = unknown,
  >(
    userId: number | string,
    payload: AdminStatusPayload,
  ) {
    return apiPatch<T>(
      `/api/admin/users/${encodeURIComponent(
        String(userId),
      )}/status`,
      payload,
    );
  },

  async createSales<
    T = unknown,
  >(
    payload: CreateSalesPayload,
  ) {
    return apiPost<T>(
      "/api/admin/sales",
      payload,
    );
  },

  async pandits<
    T = unknown,
  >(
    filters?: AdminListFilters,
  ) {
    return apiGet<T>(
      "/api/admin/pandits",
      filters,
    );
  },

  async approvePandit<
    T = unknown,
  >(
    userId: number | string,
  ) {
    return apiPost<T>(
      `/api/admin/pandits/${encodeURIComponent(
        String(userId),
      )}/approve`,
    );
  },

  async rejectPandit<
    T = unknown,
  >(
    userId: number | string,
    payload?: AdminRejectPayload,
  ) {
    return apiPost<T>(
      `/api/admin/pandits/${encodeURIComponent(
        String(userId),
      )}/reject`,
      payload ?? {},
    );
  },

  async featurePandit<
    T = unknown,
  >(
    userId: number | string,
    featured: boolean,
  ) {
    return apiPatch<T>(
      `/api/admin/pandits/${encodeURIComponent(
        String(userId),
      )}/feature`,
      {
        featured,
      } satisfies AdminFeaturePayload,
    );
  },

  async togglePanditListing<
    T = unknown,
  >(
    userId: number | string,
    listingActive: boolean,
  ) {
    return apiPatch<T>(
      `/api/admin/pandits/${encodeURIComponent(
        String(userId),
      )}/listing`,
      {
        listingActive,
      } satisfies AdminListingPayload,
    );
  },

  async templeManagers<
    T = unknown,
  >(
    filters?: AdminListFilters,
  ) {
    return apiGet<T>(
      "/api/admin/temple-managers",
      filters,
    );
  },

  async approveTempleManager<
    T = unknown,
  >(
    userId: number | string,
  ) {
    return apiPost<T>(
      `/api/admin/temple-managers/${encodeURIComponent(
        String(userId),
      )}/approve`,
    );
  },

  async rejectTempleManager<
    T = unknown,
  >(
    userId: number | string,
    payload?: AdminRejectPayload,
  ) {
    return apiPost<T>(
      `/api/admin/temple-managers/${encodeURIComponent(
        String(userId),
      )}/reject`,
      payload ?? {},
    );
  },

  async plans<
    T = unknown,
  >() {
    return apiGet<T>(
      "/api/admin/plans",
    );
  },

  async updatePlan<
    T = unknown,
  >(
    planId: number | string,
    payload: AdminPlanPayload,
  ) {
    return apiPatch<T>(
      `/api/admin/plans/${encodeURIComponent(
        String(planId),
      )}`,
      payload,
    );
  },

  async leads<
    T = unknown,
  >(
    filters?: AdminListFilters,
  ) {
    return apiGet<T>(
      "/api/admin/leads",
      filters,
    );
  },

  async subscriptions<
    T = unknown,
  >(
    filters?: AdminListFilters,
  ) {
    return apiGet<T>(
      "/api/admin/subscriptions",
      filters,
    );
  },

  async temples<
    T = unknown,
  >(
    filters?: AdminListFilters,
  ) {
    return apiGet<T>(
      "/api/admin/temples",
      filters,
    );
  },

  async settings<
    T = unknown,
  >() {
    return apiGet<T>(
      "/api/admin/settings",
    );
  },

  async updateSettings<
    T = unknown,
  >(
    payload: AdminSettingsPayload,
  ) {
    return apiPatch<T>(
      "/api/admin/settings",
      payload,
    );
  },

  async auditLogs<
    T = unknown,
  >(
    filters?: AdminListFilters,
  ) {
    return apiGet<T>(
      "/api/admin/audit-logs",
      filters,
    );
  },
};

/* ============================================================================
 * Future Role APIs
 *
 * These wrappers are intentionally small. The actual backend routes can be
 * added later without changing the central request implementation.
 * ========================================================================== */

export const panditApi = {
  getProfile: <T = unknown>() =>
    apiGet<T>(
      "/api/pandit/profile",
    ),

  updateProfile: <T = unknown>(
    payload: Record<string, unknown>,
  ) =>
    apiPatch<T>(
      "/api/pandit/profile",
      payload,
    ),

  getLeads: <T = unknown>(
    params?: Record<string, QueryValue>,
  ) =>
    apiGet<T>(
      "/api/pandit/leads",
      params,
    ),

  getSubscription: <T = unknown>() =>
    apiGet<T>(
      "/api/pandit/subscription",
    ),
};

export const templeManagerApi = {
  me: <T = unknown>() =>
    apiGet<T>(
      "/api/temple-manager/me",
    ),

  temples: <T = unknown>(
    params?: Record<string, QueryValue>,
  ) =>
    apiGet<T>(
      "/api/temple-manager/temples",
      params,
    ),

  updateTemple: <T = unknown>(
    templeId: number | string,
    payload: Record<string, unknown>,
  ) =>
    apiPatch<T>(
      `/api/temple-manager/temples/${encodeURIComponent(
        String(templeId),
      )}`,
      payload,
    ),
};

export const salesApi = {
  dashboard: <T = unknown>() =>
    apiGet<T>(
      "/api/sales/dashboard",
    ),

  leads: <T = unknown>(
    params?: Record<string, QueryValue>,
  ) =>
    apiGet<T>(
      "/api/sales/leads",
      params,
    ),

  followups: <T = unknown>(
    params?: Record<string, QueryValue>,
  ) =>
    apiGet<T>(
      "/api/sales/followups",
      params,
    ),

  pandits: <T = unknown>(
    params?: Record<string, QueryValue>,
  ) =>
    apiGet<T>(
      "/api/sales/pandits",
      params,
    ),
};

/* ============================================================================
 * Exports
 * ========================================================================== */

export {
  API_URL,
  DEFAULT_API_URL,
  DEFAULT_TIMEOUT_MS,
};