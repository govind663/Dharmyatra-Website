/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/*
|--------------------------------------------------------------------------
| API Configuration
|--------------------------------------------------------------------------
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

const API_TIMEOUT_MS = 15_000;

/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
*/

export type UserRole =
  | "visitor"
  | "pandit"
  | "temple_manager"
  | "sales"
  | "super_admin";

export type UserStatus =
  | "pending"
  | "active"
  | "suspended"
  | "rejected"
  | "blocked";

/*
|--------------------------------------------------------------------------
| Auth User
|--------------------------------------------------------------------------
*/

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
};

/*
|--------------------------------------------------------------------------
| Profile Update Input
|--------------------------------------------------------------------------
*/

export type ProfileUpdateInput = Partial<
  Pick<
    User,
    | "name"
    | "phone"
    | "city"
    | "state"
    | "country"
    | "avatar"
  >
>;

/*
|--------------------------------------------------------------------------
| Registration Types
|--------------------------------------------------------------------------
*/

export type ServiceRegistrationInput = {
  name: string;
  description?: string;
  priceAmount?: number | string;
  durationMinutes?: number | string;
};

export type RegisterInput = {
  role: Extract<
    UserRole,
    "visitor" | "pandit" | "temple_manager"
  >;

  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  password: string;

  preferredLanguage?: string;
  marketingConsent?: boolean;

  /*
   * Pandit-specific fields.
   */
  title?: string;
  photo?: string;
  experienceYears?: number | string;
  district?: string;
  languages?: string[];
  specializations?: string[];
  pujaTypes?: string[];
  associatedWith?: string;
  about?: string;
  availability?: string;
  serviceAreas?: string[];
  services?: ServiceRegistrationInput[];

  /*
   * Temple Manager-specific fields.
   */
  designation?: string;
  organizationName?: string;
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export type LoginCredentials = {
  email: string;
  password: string;
};

/*
|--------------------------------------------------------------------------
| Booking
|--------------------------------------------------------------------------
*/

export type Booking = {
  id: string;
  kind: string;
  title: string;
  date: string;
  status: string;
  detail: string;
};

/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

export type Notification = {
  id: string;
  text: string;
  date: string;
};

/*
|--------------------------------------------------------------------------
| API Responses
|--------------------------------------------------------------------------
*/

type ApiEnvelope = {
  success?: boolean;
  authenticated?: boolean;
  user?: User | null;
  message?: string;
  error?: string;
};

type AuthApiResponse = ApiEnvelope;

type ProfileApiResponse = ApiEnvelope;

/*
|--------------------------------------------------------------------------
| App State
|--------------------------------------------------------------------------
*/

type AppState = {
  /*
   * Authentication
   */
  user: User | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  authError: string | null;

  login: (
    credentials: LoginCredentials,
  ) => Promise<User>;

  register: (
    data: RegisterInput,
  ) => Promise<{
    authenticated: boolean;
    user: User;
    message: string;
  }>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<User | null>;

  clearAuthError: () => void;

  /*
   * Profile
   */
  updateProfile: (
    update: ProfileUpdateInput,
  ) => Promise<User>;

  isProfileUpdating: boolean;

  /*
   * Role helpers
   */
  hasRole: (...roles: UserRole[]) => boolean;

  isVisitor: boolean;
  isPandit: boolean;
  isTempleManager: boolean;
  isSales: boolean;
  isSuperAdmin: boolean;

  /*
   * Saved content
   */
  savedTemples: string[];
  savedPlaces: string[];

  toggleSave: (
    kind: "temple" | "place",
    slug: string,
  ) => void;

  /*
   * Bookings
   */
  bookings: Booking[];

  addBooking: (
    booking: Omit<
      Booking,
      "id" | "status"
    >,
  ) => void;

  /*
   * Notifications
   */
  notifications: Notification[];
};

/*
|--------------------------------------------------------------------------
| Context
|--------------------------------------------------------------------------
*/

const Ctx =
  createContext<AppState | null>(null);

/*
|--------------------------------------------------------------------------
| Local Storage Helper
|--------------------------------------------------------------------------
*/

function loadStoredValue<T>(
  key: string,
  fallback: T,
): T {
  if (
    typeof window ===
    "undefined"
  ) {
    return fallback;
  }

  try {
    const value =
      window.localStorage.getItem(
        key,
      );

    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/*
|--------------------------------------------------------------------------
| Local Storage Writer
|--------------------------------------------------------------------------
*/

function saveStoredValue<T>(
  key: string,
  value: T,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value),
    );
  } catch {
    /*
     * Ignore quota/private-mode/storage failures.
     */
  }
}

/*
|--------------------------------------------------------------------------
| API Fetch
|--------------------------------------------------------------------------
|
| Centralized enough for this context while keeping the file self-contained.
|--------------------------------------------------------------------------
*/

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(
      () => {
        controller.abort();
      },
      API_TIMEOUT_MS,
    );

  try {
    const response =
      await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          ...options,

          credentials:
            "include",

          signal:
            controller.signal,

          headers: {
            Accept:
              "application/json",

            ...(options.body
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),

            ...(options.headers ||
              {}),
          },
        },
      );

    /*
     * A few endpoints may legitimately return an empty body.
     */
    const contentType =
      response.headers.get(
        "content-type",
      ) || "";

    let data:
      | T
      | ApiEnvelope
      | null = null;

    if (
      response.status !== 204
    ) {
      if (
        contentType.includes(
          "application/json",
        )
      ) {
        try {
          data =
            (await response.json()) as T;
        } catch {
          data = null;
        }
      } else {
        try {
          const text =
            await response.text();

          data = text
            ? (text as T)
            : null;
        } catch {
          data = null;
        }
      }
    }

    if (!response.ok) {
      const apiError =
        data as
          | ApiEnvelope
          | null;

      throw new Error(
        apiError?.error ||
          apiError?.message ||
          `Request failed with status ${response.status}.`,
      );
    }

    return data as T;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        "The DivyaDhara API request timed out. Please check that the backend server is running.",
      );
    }

    if (
      error instanceof TypeError
    ) {
      throw new Error(
        "Unable to connect to the DivyaDhara API server. Please make sure the backend server is running.",
      );
    }

    throw error instanceof Error
      ? error
      : new Error(
          "Unexpected API error.",
        );
  } finally {
    window.clearTimeout(
      timeoutId,
    );
  }
}

/*
|--------------------------------------------------------------------------
| User Validation
|--------------------------------------------------------------------------
*/

const VALID_ROLES: UserRole[] =
  [
    "visitor",
    "pandit",
    "temple_manager",
    "sales",
    "super_admin",
  ];

const VALID_STATUSES: UserStatus[] =
  [
    "pending",
    "active",
    "suspended",
    "rejected",
    "blocked",
  ];

function isValidUser(
  value: unknown,
): value is User {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<User>;

  return (
    typeof candidate.id ===
      "number" &&
    Number.isFinite(
      candidate.id,
    ) &&
    typeof candidate.name ===
      "string" &&
    typeof candidate.email ===
      "string" &&
    typeof candidate.role ===
      "string" &&
    VALID_ROLES.includes(
      candidate.role as UserRole,
    ) &&
    typeof candidate.status ===
      "string" &&
    VALID_STATUSES.includes(
      candidate.status as UserStatus,
    )
  );
}

/*
|--------------------------------------------------------------------------
| Default Bookings
|--------------------------------------------------------------------------
*/

const DEFAULT_BOOKINGS: Booking[] =
  [
    {
      id: "DD-2481",
      kind: "Puja Enquiry",
      title:
        "Satyanarayan Katha — Home",
      date: "2026-09-02",
      status: "Confirmed",
      detail:
        "Pandit assigned · Varanasi",
    },
    {
      id: "DD-2510",
      kind: "Yatra Enquiry",
      title:
        "Kashi · Ayodhya · Prayagraj 5D",
      date: "2026-09-05",
      status: "In progress",
      detail:
        "2 travellers · Oct batch",
    },
  ];

/*
|--------------------------------------------------------------------------
| Default Notifications
|--------------------------------------------------------------------------
*/

const DEFAULT_NOTIFICATIONS: Notification[] =
  [
    {
      id: "n1",
      text:
        "Your Satyanarayan Katha pandit has been assigned.",
      date: "2026-09-06",
    },
    {
      id: "n2",
      text:
        "Dev Deepawali boats in Varanasi are filling — reserve early.",
      date: "2026-09-04",
    },
    {
      id: "n3",
      text:
        "New batch: Sanskrit Foundation begins first Saturday.",
      date: "2026-09-01",
    },
  ];

/*
|--------------------------------------------------------------------------
| Data Sanitizers
|--------------------------------------------------------------------------
*/

function trimText(
  value: string,
): string {
  return value.trim();
}

function normalizeNullableText(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  return cleaned || null;
}

function isValidPhone(
  phone: string,
): boolean {
  return (
    /^[+0-9()\-\s]{7,20}$/.test(
      phone,
    )
  );
}

/*
|--------------------------------------------------------------------------
| App Provider
|--------------------------------------------------------------------------
*/

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * ----------------------------------------------------------------------
   * Authentication State
   * ----------------------------------------------------------------------
   */

  const [
    user,
    setUser,
  ] = useState<User | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    authError,
    setAuthError,
  ] = useState<string | null>(
    null,
  );

  /*
   * ----------------------------------------------------------------------
   * Profile Update State
   * ----------------------------------------------------------------------
   */

  const [
    isProfileUpdating,
    setIsProfileUpdating,
  ] = useState(false);

  /*
   * ----------------------------------------------------------------------
   * Saved Content
   * ----------------------------------------------------------------------
   */

  const [
    savedTemples,
    setSavedTemples,
  ] = useState<string[]>(
    () =>
      loadStoredValue<string[]>(
        "dd_saved_t",
        [],
      ),
  );

  const [
    savedPlaces,
    setSavedPlaces,
  ] = useState<string[]>(
    () =>
      loadStoredValue<string[]>(
        "dd_saved_p",
        [],
      ),
  );

  /*
   * ----------------------------------------------------------------------
   * Bookings
   * ----------------------------------------------------------------------
   */

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>(
    () =>
      loadStoredValue<Booking[]>(
        "dd_bookings",
        DEFAULT_BOOKINGS,
      ),
  );

  /*
   * ----------------------------------------------------------------------
   * Notifications
   * ----------------------------------------------------------------------
   */

  const [
    notifications,
  ] = useState<Notification[]>(
    () =>
      loadStoredValue<
        Notification[]
      >(
        "dd_notif",
        DEFAULT_NOTIFICATIONS,
      ),
  );

  /*
   * ----------------------------------------------------------------------
   * Persist Saved Temples
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    saveStoredValue(
      "dd_saved_t",
      savedTemples,
    );
  }, [savedTemples]);

  /*
   * ----------------------------------------------------------------------
   * Persist Saved Places
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    saveStoredValue(
      "dd_saved_p",
      savedPlaces,
    );
  }, [savedPlaces]);

  /*
   * ----------------------------------------------------------------------
   * Persist Bookings
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    saveStoredValue(
      "dd_bookings",
      bookings,
    );
  }, [bookings]);

  /*
   * ----------------------------------------------------------------------
   * Refresh Authenticated User
   * ----------------------------------------------------------------------
   */

  const refreshUser =
    useCallback(
      async (): Promise<User | null> => {
        try {
          const response =
            await apiFetch<AuthApiResponse>(
              "/api/auth/me",
            );

          if (
            response.authenticated &&
            response.user &&
            isValidUser(
              response.user,
            )
          ) {
            setUser(
              response.user,
            );

            setAuthError(null);

            return response.user;
          }

          /*
           * No active session is a normal state.
           */
          setUser(null);
          setAuthError(null);

          return null;
        } catch (error) {
          /*
           * A failed session check means we should not keep a stale
           * frontend authentication state.
           */
          setUser(null);

          const message =
            error instanceof Error
              ? error.message
              : "Unable to verify your session.";

          setAuthError(message);

          return null;
        }
      },
      [],
    );

  /*
   * ----------------------------------------------------------------------
   * Initial Session Check
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const checkSession =
      async () => {
        setIsLoading(true);

        try {
          const response =
            await apiFetch<AuthApiResponse>(
              "/api/auth/me",
            );

          if (!mounted) {
            return;
          }

          if (
            response.authenticated &&
            response.user &&
            isValidUser(
              response.user,
            )
          ) {
            setUser(
              response.user,
            );

            setAuthError(null);
          } else {
            setUser(null);
            setAuthError(null);
          }
        } catch (error) {
          if (!mounted) {
            return;
          }

          setUser(null);

          setAuthError(
            error instanceof Error
              ? error.message
              : "Unable to connect to the authentication server.",
          );
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ----------------------------------------------------------------------
   * Login
   * ----------------------------------------------------------------------
   */

  const login =
    useCallback(
      async (
        credentials: LoginCredentials,
      ): Promise<User> => {
        setAuthError(null);
        setIsLoading(true);

        const email =
          credentials.email
            .trim()
            .toLowerCase();

        const password =
          credentials.password;

        if (!email) {
          const message =
            "Email address is required.";

          setAuthError(message);
          setIsLoading(false);

          throw new Error(
            message,
          );
        }

        if (!password) {
          const message =
            "Password is required.";

          setAuthError(message);
          setIsLoading(false);

          throw new Error(
            message,
          );
        }

        try {
          const response =
            await apiFetch<AuthApiResponse>(
              "/api/auth/login",
              {
                method: "POST",
                body: JSON.stringify({
                  email,
                  password,
                }),
              },
            );

          if (
            !response.user ||
            !isValidUser(
              response.user,
            )
          ) {
            throw new Error(
              "Login succeeded but no valid user account was returned.",
            );
          }

          setUser(
            response.user,
          );

          setAuthError(null);

          return response.user;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to login.";

          setUser(null);
          setAuthError(message);

          throw new Error(message);
        } finally {
          setIsLoading(false);
        }
      },
      [],
    );

  /*
   * ----------------------------------------------------------------------
   * Register
   * ----------------------------------------------------------------------
   */

  const register =
    useCallback(
      async (
        data: RegisterInput,
      ): Promise<{
        authenticated: boolean;
        user: User;
        message: string;
      }> => {
        setAuthError(null);
        setIsLoading(true);

        try {
          const response =
            await apiFetch<AuthApiResponse>(
              "/api/auth/register",
              {
                method: "POST",
                body: JSON.stringify(
                  data,
                ),
              },
            );

          if (
            !response.user ||
            !isValidUser(
              response.user,
            )
          ) {
            throw new Error(
              "Registration succeeded but no valid user account was returned.",
            );
          }

          const authenticated =
            Boolean(
              response.authenticated,
            );

          if (
            authenticated
          ) {
            setUser(
              response.user,
            );
          } else {
            /*
             * Professional accounts are currently registered as
             * pending and should not be treated as authenticated.
             */
            setUser(null);
          }

          setAuthError(null);

          return {
            authenticated,
            user:
              response.user,
            message:
              response.message ||
              "Registration successful.",
          };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to complete registration.";

          setAuthError(message);

          throw new Error(message);
        } finally {
          setIsLoading(false);
        }
      },
      [],
    );

  /*
   * ----------------------------------------------------------------------
   * Logout
   * ----------------------------------------------------------------------
   */

  const logout =
    useCallback(
      async (): Promise<void> => {
        setAuthError(null);

        try {
          await apiFetch<AuthApiResponse>(
            "/api/auth/logout",
            {
              method: "POST",
            },
          );
        } catch (error) {
          /*
           * The local session state must still be cleared even when
           * the backend is unavailable.
           */
          console.error(
            "Logout request failed:",
            error,
          );
        } finally {
          setUser(null);
          setIsProfileUpdating(
            false,
          );
        }
      },
      [],
    );

  /*
   * ----------------------------------------------------------------------
   * Profile Update
   * ----------------------------------------------------------------------
   *
   * Backend contract:
   *
   * PATCH /api/auth/profile
   *
   * Email is intentionally NOT accepted.
   * ----------------------------------------------------------------------
   */

  const updateProfile =
    useCallback(
      async (
        update: ProfileUpdateInput,
      ): Promise<User> => {
        if (!user) {
          const message =
            "You must be logged in to update your profile.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        /*
         * Build a clean payload.
         */
        const payload: ProfileUpdateInput =
          {};

        /*
         * Name
         */
        if (
          update.name !==
          undefined
        ) {
          payload.name =
            trimText(
              update.name,
            );
        }

        /*
         * Phone
         */
        if (
          update.phone !==
          undefined
        ) {
          payload.phone =
            update.phone ===
            null
              ? null
              : trimText(
                  update.phone,
                );
        }

        /*
         * City
         */
        if (
          update.city !==
          undefined
        ) {
          payload.city =
            normalizeNullableText(
              update.city,
            );
        }

        /*
         * State
         */
        if (
          update.state !==
          undefined
        ) {
          payload.state =
            normalizeNullableText(
              update.state,
            );
        }

        /*
         * Country
         */
        if (
          update.country !==
          undefined
        ) {
          payload.country =
            normalizeNullableText(
              update.country,
            );
        }

        /*
         * Avatar
         */
        if (
          update.avatar !==
          undefined
        ) {
          payload.avatar =
            normalizeNullableText(
              update.avatar,
            );
        }

        /*
         * Nothing changed.
         */
        if (
          Object.keys(
            payload,
          ).length === 0
        ) {
          setAuthError(null);

          return user;
        }

        /*
         * Validate name.
         */
        if (
          payload.name !==
            undefined &&
          payload.name.length ===
            0
        ) {
          const message =
            "Name cannot be empty.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        if (
          payload.name !==
            undefined &&
          payload.name.length >
            150
        ) {
          const message =
            "Name cannot exceed 150 characters.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        /*
         * Validate phone.
         */
        if (
          payload.phone &&
          !isValidPhone(
            payload.phone,
          )
        ) {
          const message =
            "Please enter a valid phone number.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        /*
         * Field length protection.
         */
        if (
          payload.phone &&
          payload.phone.length >
            30
        ) {
          const message =
            "Phone number is too long.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        if (
          payload.city &&
          payload.city.length >
            120
        ) {
          const message =
            "City cannot exceed 120 characters.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        if (
          payload.state &&
          payload.state.length >
            120
        ) {
          const message =
            "State cannot exceed 120 characters.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        if (
          payload.country &&
          payload.country.length >
            100
        ) {
          const message =
            "Country cannot exceed 100 characters.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        if (
          payload.avatar &&
          payload.avatar.length >
            500
        ) {
          const message =
            "Avatar value cannot exceed 500 characters.";

          setAuthError(message);

          throw new Error(
            message,
          );
        }

        setAuthError(null);
        setIsProfileUpdating(
          true,
        );

        try {
          const response =
            await apiFetch<ProfileApiResponse>(
              "/api/auth/profile",
              {
                method: "PATCH",
                body: JSON.stringify(
                  payload,
                ),
              },
            );

          if (
            !response.user ||
            !isValidUser(
              response.user,
            )
          ) {
            throw new Error(
              "Profile update succeeded but the server did not return a valid updated user.",
            );
          }

          /*
           * Server response is the source of truth.
           */
          setUser(
            response.user,
          );

          setAuthError(null);

          return response.user;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to update your profile.";

          setAuthError(message);

          throw new Error(message);
        } finally {
          setIsProfileUpdating(
            false,
          );
        }
      },
      [user],
    );

  /*
   * ----------------------------------------------------------------------
   * Clear Auth Error
   * ----------------------------------------------------------------------
   */

  const clearAuthError =
    useCallback(() => {
      setAuthError(null);
    }, []);

  /*
   * ----------------------------------------------------------------------
   * Role Helper
   * ----------------------------------------------------------------------
   */

  const hasRole =
    useCallback(
      (
        ...roles: UserRole[]
      ): boolean => {
        if (!user) {
          return false;
        }

        return roles.includes(
          user.role,
        );
      },
      [user],
    );

  /*
   * ----------------------------------------------------------------------
   * Role Flags
   * ----------------------------------------------------------------------
   */

  const isVisitor =
    user?.role ===
    "visitor";

  const isPandit =
    user?.role ===
    "pandit";

  const isTempleManager =
    user?.role ===
    "temple_manager";

  const isSales =
    user?.role ===
    "sales";

  const isSuperAdmin =
    user?.role ===
    "super_admin";

  /*
   * ----------------------------------------------------------------------
   * Toggle Saved Content
   * ----------------------------------------------------------------------
   */

  const toggleSave =
    useCallback(
      (
        kind:
          | "temple"
          | "place",
        slug: string,
      ) => {
        const cleanSlug =
          slug.trim();

        if (!cleanSlug) {
          return;
        }

        if (
          kind ===
          "temple"
        ) {
          setSavedTemples(
            (current) => {
              if (
                current.includes(
                  cleanSlug,
                )
              ) {
                return current.filter(
                  (item) =>
                    item !==
                    cleanSlug,
                );
              }

              return [
                ...current,
                cleanSlug,
              ];
            },
          );

          return;
        }

        setSavedPlaces(
          (current) => {
            if (
              current.includes(
                cleanSlug,
              )
            ) {
              return current.filter(
                (item) =>
                  item !==
                  cleanSlug,
              );
            }

            return [
              ...current,
              cleanSlug,
            ];
          },
        );
      },
      [],
    );

  /*
   * ----------------------------------------------------------------------
   * Add Booking
   * ----------------------------------------------------------------------
   */

  const addBooking =
    useCallback(
      (
        booking: Omit<
          Booking,
          "id" | "status"
        >,
      ) => {
        const newBooking: Booking =
          {
            ...booking,
            id: `DD-${Date.now()}`,
            status: "Received",
          };

        setBookings(
          (current) => [
            newBooking,
            ...current,
          ],
        );
      },
      [],
    );

  /*
   * ----------------------------------------------------------------------
   * Memoized Context Value
   * ----------------------------------------------------------------------
   */

  const contextValue =
    useMemo<AppState>(
      () => ({
        /*
         * Authentication
         */
        user,

        isAuthenticated:
          Boolean(user),

        isLoading,

        authError,

        login,

        register,

        logout,

        refreshUser,

        clearAuthError,

        /*
         * Profile
         */
        updateProfile,

        isProfileUpdating,

        /*
         * Role helpers
         */
        hasRole,

        isVisitor,

        isPandit,

        isTempleManager,

        isSales,

        isSuperAdmin,

        /*
         * Saved content
         */
        savedTemples,

        savedPlaces,

        toggleSave,

        /*
         * Bookings
         */
        bookings,

        addBooking,

        /*
         * Notifications
         */
        notifications,
      }),
      [
        user,
        isLoading,
        authError,
        login,
        register,
        logout,
        refreshUser,
        clearAuthError,
        updateProfile,
        isProfileUpdating,
        hasRole,
        isVisitor,
        isPandit,
        isTempleManager,
        isSales,
        isSuperAdmin,
        savedTemples,
        savedPlaces,
        toggleSave,
        bookings,
        addBooking,
        notifications,
      ],
    );

  return (
    <Ctx.Provider
      value={contextValue}
    >
      {children}
    </Ctx.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useApp
|--------------------------------------------------------------------------
*/

export function useApp(): AppState {
  const context =
    useContext(Ctx);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider.",
    );
  }

  return context;
}