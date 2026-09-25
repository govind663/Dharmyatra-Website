import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

import { db } from "../db/database.ts";

const router = Router();

/*
|--------------------------------------------------------------------------
| Types
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

export type VisitorRoleProfile = {
  type: "visitor";
  preferredLanguage: string | null;
  marketingConsent: boolean;
};

export type PanditRoleProfile = {
  type: "pandit";
  id: number;
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
};

export type TempleManagerRoleProfile = {
  type: "temple_manager";
  designation: string | null;
  organizationName: string | null;
  verificationStatus: string;
};

export type SalesRoleProfile = {
  type: "sales";
};

export type SuperAdminRoleProfile = {
  type: "super_admin";
};

export type RoleProfile =
  | VisitorRoleProfile
  | PanditRoleProfile
  | TempleManagerRoleProfile
  | SalesRoleProfile
  | SuperAdminRoleProfile;

export type AuthenticatedUser = {
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
  roleProfile: RoleProfile;
};

type UserDatabaseRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: UserStatus;
  avatar: string | null;
  role: UserRole;
};

type UserWithPasswordRow =
  UserDatabaseRow & {
    password_hash: string;
  };

type SessionDatabaseRow = {
  session_id: number;
  user_id: number;
  expires_at: string;
};

type ServiceInput = {
  name?: unknown;
  description?: unknown;
  priceAmount?: unknown;
  price?: unknown;
  durationMinutes?: unknown;
  duration?: unknown;
};

type PasswordResetDatabaseRow = {
  id: number;
  user_id: number;
  expires_at: string;
  used_at: string | null;
};

type VerificationDatabaseRow = {
  id: number;
  user_id: number;
  expires_at: string;
  verified_at: string | null;
};

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const SESSION_DAYS = positiveInteger(
  process.env.SESSION_DAYS,
  7,
);

const PASSWORD_RESET_MINUTES =
  positiveInteger(
    process.env.PASSWORD_RESET_MINUTES,
    30,
  );

const VERIFICATION_TOKEN_MINUTES =
  positiveInteger(
    process.env.VERIFICATION_TOKEN_MINUTES,
    30,
  );

const IS_PRODUCTION =
  process.env.NODE_ENV === "production";

const COOKIE_NAME = (
  process.env.AUTH_COOKIE_NAME ||
  "divyadhara_session"
).replace(
  /[^A-Za-z0-9_-]/g,
  "_",
);

/*
|--------------------------------------------------------------------------
| Generic Helpers
|--------------------------------------------------------------------------
*/

function positiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
}

function normalizeEmail(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .slice(0, 320);
}

function normalizeText(
  value: unknown,
  maxLength = 500,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(0, maxLength);
}

function normalizeNullableText(
  value: unknown,
  maxLength = 500,
): string | null {
  const text =
    normalizeText(
      value,
      maxLength,
    );

  return text || null;
}

function normalizePhone(
  value: unknown,
): string | null {
  const text =
    normalizeText(
      value,
      30,
    );

  return text || null;
}

function isValidEmail(
  email: string,
): boolean {
  return (
    email.length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    )
  );
}

function isValidPhone(
  phone: string | null,
): boolean {
  if (!phone) {
    return true;
  }

  return /^[+0-9()\-\s]{7,20}$/.test(
    phone,
  );
}

function isValidPassword(
  password: unknown,
): password is string {
  return (
    typeof password ===
      "string" &&
    password.length >= 8 &&
    password.length <= 128
  );
}

function uniqueStringArray(
  value: unknown,
  maxItems = 30,
): string[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  const output: string[] = [];

  for (
    const item of value.slice(
      0,
      maxItems,
    )
  ) {
    const text =
      normalizeText(
        item,
        120,
      );

    if (!text) {
      continue;
    }

    if (
      !output.includes(text)
    ) {
      output.push(text);
    }
  }

  return output;
}

function parseJsonStringArray(
  value: unknown,
  maxItems = 30,
): string[] {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return [];
  }

  try {
    return uniqueStringArray(
      JSON.parse(value),
      maxItems,
    );
  } catch {
    return [];
  }
}

function normalizeRole(
  value: unknown,
): UserRole | null {
  const role =
    normalizeText(
      value,
      50,
    ).toLowerCase();

  switch (role) {
    case "visitor":
    case "pandit":
    case "temple_manager":
    case "sales":
    case "super_admin":
      return role;

    default:
      return null;
  }
}

function parseNonNegativeInteger(
  value: unknown,
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "number"
  ) {
    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return null;
    }

    return Math.floor(value);
  }

  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "");

  if (!normalized) {
    return null;
  }

  const parsed =
    Number(normalized);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return null;
  }

  return Math.floor(parsed);
}

function parsePositiveInteger(
  value: unknown,
): number | null {
  const parsed =
    parseNonNegativeInteger(
      value,
    );

  if (
    parsed === null ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

function uniqueString(
  values: string[],
): string {
  return values
    .map((value) =>
      value.trim(),
    )
    .filter(Boolean)
    .join(" · ");
}

function getClientIp(
  req: Request,
): string | null {
  return normalizeNullableText(
    req.ip,
    100,
  );
}

function getUserAgent(
  req: Request,
): string | null {
  return normalizeNullableText(
    req.get("user-agent"),
    500,
  );
}

/*
|--------------------------------------------------------------------------
| Password Hashing
|--------------------------------------------------------------------------
*/

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
): Promise<Buffer> {
  return new Promise(
    (resolve, reject) => {
      scryptCallback(
        password,
        salt,
        keyLength,
        {
          N: 16384,
          r: 8,
          p: 1,
          maxmem:
            32 * 1024 * 1024,
        },
        (
          error,
          derivedKey,
        ) => {
          if (error) {
            reject(error);
            return;
          }

          if (
            !Buffer.isBuffer(
              derivedKey,
            )
          ) {
            reject(
              new Error(
                "Password derivation failed.",
              ),
            );

            return;
          }

          resolve(
            derivedKey,
          );
        },
      );
    },
  );
}

async function hashPassword(
  password: string,
): Promise<string> {
  const salt =
    randomBytes(16);

  const derivedKey =
    await deriveKey(
      password,
      salt,
      64,
    );

  return [
    salt.toString(
      "hex",
    ),
    derivedKey.toString(
      "hex",
    ),
  ].join(":");
}

async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts =
    storedHash.split(":");

  if (
    parts.length !== 2
  ) {
    return false;
  }

  const saltHex =
    parts[0];

  const hashHex =
    parts[1];

  if (
    !saltHex ||
    !hashHex
  ) {
    return false;
  }

  try {
    const salt =
      Buffer.from(
        saltHex,
        "hex",
      );

    const expectedHash =
      Buffer.from(
        hashHex,
        "hex",
      );

    if (
      salt.length === 0 ||
      expectedHash.length === 0
    ) {
      return false;
    }

    const actualHash =
      await deriveKey(
        password,
        salt,
        expectedHash.length,
      );

    if (
      actualHash.length !==
      expectedHash.length
    ) {
      return false;
    }

    return timingSafeEqual(
      actualHash,
      expectedHash,
    );
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| Token Helpers
|--------------------------------------------------------------------------
*/

function makeToken(): string {
  return randomBytes(48).toString(
    "hex",
  );
}

function hashToken(
  token: string,
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

/*
|--------------------------------------------------------------------------
| User Queries
|--------------------------------------------------------------------------
*/

function getUserByEmail(
  email: string,
): UserDatabaseRow | undefined {
  return db
    .prepare(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.city,
        u.state,
        u.country,
        u.status,
        u.avatar,
        r.code AS role
      FROM users u
      INNER JOIN roles r
        ON r.id = u.role_id
      WHERE LOWER(u.email) = LOWER(?)
      LIMIT 1
      `,
    )
    .get(
      email,
    ) as
    | UserDatabaseRow
    | undefined;
}

function getUserById(
  userId: number,
): UserDatabaseRow | undefined {
  return db
    .prepare(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.city,
        u.state,
        u.country,
        u.status,
        u.avatar,
        r.code AS role
      FROM users u
      INNER JOIN roles r
        ON r.id = u.role_id
      WHERE u.id = ?
      LIMIT 1
      `,
    )
    .get(
      userId,
    ) as
    | UserDatabaseRow
    | undefined;
}

function getRoleId(
  role: UserRole,
): number {
  const row =
    db
      .prepare(
        `
        SELECT id
        FROM roles
        WHERE code = ?
        LIMIT 1
        `,
      )
      .get(
        role,
      ) as
      | { id: number }
      | undefined;

  if (!row) {
    throw new Error(
      `Role "${role}" is not configured.`,
    );
  }

  return row.id;
}

/*
|--------------------------------------------------------------------------
| Role Profile Queries
|--------------------------------------------------------------------------
*/

function getRoleProfile(
  userId: number,
  role: UserRole,
): RoleProfile {
  /*
   * Visitor
   */
  if (
    role === "visitor"
  ) {
    const row =
      db
        .prepare(
          `
          SELECT
            preferred_language,
            marketing_consent
          FROM visitor_profiles
          WHERE user_id = ?
          LIMIT 1
          `,
        )
        .get(
          userId,
        ) as
        | {
            preferred_language:
              | string
              | null;
            marketing_consent:
              | number
              | null;
          }
        | undefined;

    return {
      type: "visitor",
      preferredLanguage:
        row?.preferred_language ??
        null,
      marketingConsent:
        Boolean(
          row?.marketing_consent,
        ),
    };
  }

  /*
   * Pandit
   */
  if (
    role === "pandit"
  ) {
    const row =
      db
        .prepare(
          `
          SELECT
            id,
            slug,
            display_name,
            title,
            photo,
            experience_years,
            location,
            city,
            district,
            state,
            country,
            languages_json,
            specializations_json,
            puja_types_json,
            associated_with,
            about,
            availability,
            service_areas_json,
            profile_status,
            verification_status,
            identity_verified,
            profile_verified,
            authorized_contact,
            featured,
            listing_active
          FROM pandit_profiles
          WHERE user_id = ?
          LIMIT 1
          `,
        )
        .get(
          userId,
        ) as
        | {
            id: number;
            slug: string;
            display_name: string;
            title:
              | string
              | null;
            photo:
              | string
              | null;
            experience_years:
              | number
              | null;
            location:
              | string
              | null;
            city:
              | string
              | null;
            district:
              | string
              | null;
            state:
              | string
              | null;
            country:
              | string
              | null;
            languages_json:
              | string
              | null;
            specializations_json:
              | string
              | null;
            puja_types_json:
              | string
              | null;
            associated_with:
              | string
              | null;
            about:
              | string
              | null;
            availability:
              | string
              | null;
            service_areas_json:
              | string
              | null;
            profile_status: string;
            verification_status: string;
            identity_verified:
              | number
              | null;
            profile_verified:
              | number
              | null;
            authorized_contact:
              | number
              | null;
            featured:
              | number
              | null;
            listing_active:
              | number
              | null;
          }
        | undefined;

    if (!row) {
      return {
        type: "pandit",
        id: 0,
        slug: "",
        displayName: "",
        title: null,
        photo: null,
        experienceYears: 0,
        location: null,
        city: null,
        district: null,
        state: null,
        country: null,
        languages: [],
        specializations: [],
        pujaTypes: [],
        associatedWith: null,
        about: null,
        availability: null,
        serviceAreas: [],
        profileStatus: "draft",
        verificationStatus:
          "pending",
        identityVerified: false,
        profileVerified: false,
        authorizedContact: false,
        featured: false,
        listingActive: false,
      };
    }

    return {
      type: "pandit",
      id: row.id,
      slug: row.slug,
      displayName:
        row.display_name,
      title: row.title,
      photo: row.photo,
      experienceYears:
        row.experience_years ??
        0,
      location: row.location,
      city: row.city,
      district: row.district,
      state: row.state,
      country: row.country,
      languages:
        parseJsonStringArray(
          row.languages_json,
        ),
      specializations:
        parseJsonStringArray(
          row.specializations_json,
        ),
      pujaTypes:
        parseJsonStringArray(
          row.puja_types_json,
        ),
      associatedWith:
        row.associated_with,
      about: row.about,
      availability:
        row.availability,
      serviceAreas:
        parseJsonStringArray(
          row.service_areas_json,
        ),
      profileStatus:
        row.profile_status,
      verificationStatus:
        row.verification_status,
      identityVerified:
        Boolean(
          row.identity_verified,
        ),
      profileVerified:
        Boolean(
          row.profile_verified,
        ),
      authorizedContact:
        Boolean(
          row.authorized_contact,
        ),
      featured:
        Boolean(row.featured),
      listingActive:
        Boolean(
          row.listing_active,
        ),
    };
  }

  /*
   * Temple Manager
   */
  if (
    role ===
    "temple_manager"
  ) {
    const row =
      db
        .prepare(
          `
          SELECT
            designation,
            organization_name,
            verification_status
          FROM temple_manager_profiles
          WHERE user_id = ?
          LIMIT 1
          `,
        )
        .get(
          userId,
        ) as
        | {
            designation:
              | string
              | null;
            organization_name:
              | string
              | null;
            verification_status:
              | string
              | null;
          }
        | undefined;

    return {
      type: "temple_manager",
      designation:
        row?.designation ??
        null,
      organizationName:
        row?.organization_name ??
        null,
      verificationStatus:
        row?.verification_status ??
        "pending",
    };
  }

  /*
   * Sales
   */
  if (
    role === "sales"
  ) {
    return {
      type: "sales",
    };
  }

  /*
   * Super Admin
   */
  return {
    type: "super_admin",
  };
}

/*
|--------------------------------------------------------------------------
| Public User
|--------------------------------------------------------------------------
*/

function publicUser(
  user: UserDatabaseRow,
): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    state: user.state,
    country: user.country,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    roleProfile:
      getRoleProfile(
        user.id,
        user.role,
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Registration Helpers
|--------------------------------------------------------------------------
*/

function isPublicRegistrationRole(
  role: UserRole | null,
): role is
  | "visitor"
  | "pandit"
  | "temple_manager" {
  return (
    role === "visitor" ||
    role === "pandit" ||
    role ===
      "temple_manager"
  );
}

/*
|--------------------------------------------------------------------------
| Permissions
|--------------------------------------------------------------------------
*/

function hasPermission(
  userId: number,
  permissionCode: string,
): boolean {
  const normalizedCode =
    normalizeText(
      permissionCode,
      150,
    );

  if (
    !normalizedCode
  ) {
    return false;
  }

  const row =
    db
      .prepare(
        `
        SELECT 1
        FROM users u
        INNER JOIN roles r
          ON r.id = u.role_id
        INNER JOIN role_permissions rp
          ON rp.role_id = r.id
        INNER JOIN permissions p
          ON p.id = rp.permission_id
        WHERE u.id = ?
          AND p.code = ?
          AND u.status = 'active'
        LIMIT 1
        `,
      )
      .get(
        userId,
        normalizedCode,
      );

  return Boolean(row);
}

/*
|--------------------------------------------------------------------------
| Pandit Slug
|--------------------------------------------------------------------------
*/

function makePanditSlug(
  name: string,
): string {
  const base =
    name
      .normalize("NFKD")
      .toLowerCase()
      .replace(
        /[^\w\s-]/g,
        "",
      )
      .replace(
        /[\s_-]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      )
      .slice(
        0,
        70,
      ) ||
    "pandit";

  let slug = base;
  let counter = 1;

  while (
    db
      .prepare(
        `
        SELECT id
        FROM pandit_profiles
        WHERE slug = ?
        LIMIT 1
        `,
      )
      .get(slug)
  ) {
    counter += 1;

    slug =
      `${base}-${counter}`;
  }

  return slug;
}

/*
|--------------------------------------------------------------------------
| Cookies
|--------------------------------------------------------------------------
*/

function setSessionCookie(
  res: Response,
  token: string,
): void {
  const maxAge =
    SESSION_DAYS *
    24 *
    60 *
    60;

  const cookieParts = [
    `${COOKIE_NAME}=${encodeURIComponent(
      token,
    )}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];

  if (
    IS_PRODUCTION
  ) {
    cookieParts.push(
      "Secure",
    );
  }

  res.setHeader(
    "Set-Cookie",
    cookieParts.join(
      "; ",
    ),
  );
}

function clearSessionCookie(
  res: Response,
): void {
  const cookieParts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];

  if (
    IS_PRODUCTION
  ) {
    cookieParts.push(
      "Secure",
    );
  }

  res.setHeader(
    "Set-Cookie",
    cookieParts.join(
      "; ",
    ),
  );
}

function getCookieToken(
  req: Request,
): string | null {
  const cookieHeader =
    req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (
    const rawCookie of cookieHeader.split(
      ";",
    )
  ) {
    const separatorIndex =
      rawCookie.indexOf("=");

    if (
      separatorIndex ===
      -1
    ) {
      continue;
    }

    const name =
      rawCookie
        .slice(
          0,
          separatorIndex,
        )
        .trim();

    if (
      name !==
      COOKIE_NAME
    ) {
      continue;
    }

    const value =
      rawCookie
        .slice(
          separatorIndex + 1,
        )
        .trim();

    if (!value) {
      return null;
    }

    try {
      return decodeURIComponent(
        value,
      );
    } catch {
      return value;
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Session Management
|--------------------------------------------------------------------------
*/

function createSession(
  userId: number,
): string {
  const token =
    makeToken();

  const tokenHash =
    hashToken(token);

  const expiresAt =
    new Date(
      Date.now() +
        SESSION_DAYS *
          24 *
          60 *
          60 *
          1000,
    ).toISOString();

  db.prepare(
    `
    INSERT INTO sessions (
      user_id,
      token_hash,
      expires_at,
      created_at,
      last_activity_at
    )
    VALUES (
      ?,
      ?,
      ?,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    `,
  ).run(
    userId,
    tokenHash,
    expiresAt,
  );

  return token;
}

function removeSession(
  token: string,
): void {
  db.prepare(
    `
    DELETE FROM sessions
    WHERE token_hash = ?
    `,
  ).run(
    hashToken(token),
  );
}

function removeAllUserSessions(
  userId: number,
): void {
  db.prepare(
    `
    DELETE FROM sessions
    WHERE user_id = ?
    `,
  ).run(
    userId,
  );
}

function getSessionUser(
  token: string,
): AuthenticatedUser | null {
  const tokenHash =
    hashToken(token);

  const row =
    db
      .prepare(
        `
        SELECT
          s.id AS session_id,
          s.user_id,
          s.expires_at
        FROM sessions s
        WHERE s.token_hash = ?
        LIMIT 1
        `,
      )
      .get(
        tokenHash,
      ) as
      | SessionDatabaseRow
      | undefined;

  if (!row) {
    return null;
  }

  const expiryTime =
    new Date(
      row.expires_at,
    ).getTime();

  if (
    !Number.isFinite(
      expiryTime,
    ) ||
    expiryTime <= Date.now()
  ) {
    db.prepare(
      `
      DELETE FROM sessions
      WHERE id = ?
      `,
    ).run(
      row.session_id,
    );

    return null;
  }

  const user =
    getUserById(
      row.user_id,
    );

  if (!user) {
    db.prepare(
      `
      DELETE FROM sessions
      WHERE id = ?
      `,
    ).run(
      row.session_id,
    );

    return null;
  }

  /*
   * Any status that is not currently usable
   * invalidates the session.
   */
  if (
    user.status !== "active"
  ) {
    db.prepare(
      `
      DELETE FROM sessions
      WHERE id = ?
      `,
    ).run(
      row.session_id,
    );

    return null;
  }

  /*
   * Update activity timestamp.
   */
  db.prepare(
    `
    UPDATE sessions
    SET last_activity_at =
      CURRENT_TIMESTAMP
    WHERE id = ?
    `,
  ).run(
    row.session_id,
  );

  return publicUser(
    user,
  );
}

/*
|--------------------------------------------------------------------------
| Email Verification
|--------------------------------------------------------------------------
*/

function createEmailVerificationToken(
  userId: number,
): {
  token: string;
  expiresAt: string;
} {
  const rawToken =
    makeToken();

  const tokenHash =
    hashToken(
      rawToken,
    );

  const expiresAt =
    new Date(
      Date.now() +
        VERIFICATION_TOKEN_MINUTES *
          60 *
          1000,
    ).toISOString();

  db.prepare(
    `
    DELETE FROM verification_tokens
    WHERE user_id = ?
      AND purpose =
        'email_verification'
      AND verified_at IS NULL
    `,
  ).run(
    userId,
  );

  db.prepare(
    `
    INSERT INTO verification_tokens (
      user_id,
      token_hash,
      purpose,
      expires_at,
      created_at
    )
    VALUES (
      ?,
      ?,
      'email_verification',
      ?,
      CURRENT_TIMESTAMP
    )
    `,
  ).run(
    userId,
    tokenHash,
    expiresAt,
  );

  return {
    token: rawToken,
    expiresAt,
  };
}

/*
|--------------------------------------------------------------------------
| Audit Logging
|--------------------------------------------------------------------------
*/

function createAuditLog(
  params: {
    userId?: number | null;
    action: string;
    entityType?: string | null;
    entityId?: number | null;
    oldData?: unknown;
    newData?: unknown;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
): void {
  db.prepare(
    `
    INSERT INTO audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_data_json,
      new_data_json,
      ip_address,
      user_agent,
      created_at
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      CURRENT_TIMESTAMP
    )
    `,
  ).run(
    params.userId ??
      null,
    params.action,
    params.entityType ??
      null,
    params.entityId ??
      null,
    params.oldData ===
      undefined
      ? null
      : JSON.stringify(
          params.oldData,
        ),
    params.newData ===
      undefined
      ? null
      : JSON.stringify(
          params.newData,
        ),
    params.ipAddress ??
      null,
    params.userAgent ??
      null,
  );
}

/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
*/

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token =
    getCookieToken(
      req,
    );

  if (!token) {
    res.status(401).json({
      success: false,
      error:
        "Authentication required.",
    });

    return;
  }

  const user =
    getSessionUser(
      token,
    );

  if (!user) {
    clearSessionCookie(
      res,
    );

    res.status(401).json({
      success: false,
      error:
        "Session expired or invalid.",
    });

    return;
  }

  res.locals.user =
    user;

  next();
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token =
    getCookieToken(
      req,
    );

  if (token) {
    const user =
      getSessionUser(
        token,
      );

    if (user) {
      res.locals.user =
        user;
    }
  }

  next();
}

export function requireRole(
  ...roles: UserRole[]
) {
  return (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const user =
      res.locals.user as
        | AuthenticatedUser
        | undefined;

    if (!user) {
      res.status(401).json({
        success: false,
        error:
          "Authentication required.",
      });

      return;
    }

    if (
      !roles.includes(
        user.role,
      )
    ) {
      res.status(403).json({
        success: false,
        error:
          "You do not have permission to access this resource.",
      });

      return;
    }

    next();
  };
}

export function requirePermission(
  permissionCode: string,
) {
  return (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const user =
      res.locals.user as
        | AuthenticatedUser
        | undefined;

    if (!user) {
      res.status(401).json({
        success: false,
        error:
          "Authentication required.",
      });

      return;
    }

    /*
     * Super Admin is above normal role permissions.
     */
    if (
      user.role ===
      "super_admin"
    ) {
      next();
      return;
    }

    if (
      !hasPermission(
        user.id,
        permissionCode,
      )
    ) {
      res.status(403).json({
        success: false,
        error:
          "You do not have permission to access this resource.",
      });

      return;
    }

    next();
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/auth/me
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  optionalAuth,
  (
    _req: Request,
    res: Response,
  ) => {
    const user =
      res.locals.user as
        | AuthenticatedUser
        | undefined;

    res.json({
      success: true,
      authenticated:
        Boolean(user),
      user:
        user ?? null,
    });
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/auth/register
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const role =
        normalizeRole(
          req.body?.role,
        );

      const name =
        normalizeText(
          req.body?.name,
          150,
        );

      const email =
        normalizeEmail(
          req.body?.email,
        );

      const phone =
        normalizePhone(
          req.body?.phone,
        );

      const city =
        normalizeNullableText(
          req.body?.city,
          120,
        );

      const state =
        normalizeNullableText(
          req.body?.state,
          120,
        );

      const country =
        normalizeNullableText(
          req.body?.country,
          100,
        ) || "India";

      const password =
        req.body?.password;

      /*
       * Role validation
       */
      if (!role) {
        res.status(400).json({
          success: false,
          error:
            "A valid role is required.",
        });

        return;
      }

      /*
       * Prevent public creation of
       * Sales / Super Admin accounts.
       */
      if (
        !isPublicRegistrationRole(
          role,
        )
      ) {
        res.status(403).json({
          success: false,
          error:
            "This role cannot be registered publicly.",
        });

        return;
      }

      /*
       * Name validation
       */
      if (
        name.length < 2
      ) {
        res.status(400).json({
          success: false,
          error:
            "Name must contain at least 2 characters.",
        });

        return;
      }

      /*
       * Email validation
       */
      if (
        !isValidEmail(
          email,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Please enter a valid email address.",
        });

        return;
      }

      /*
       * Phone validation
       */
      if (
        !isValidPhone(
          phone,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Please enter a valid phone number.",
        });

        return;
      }

      /*
       * Password validation
       */
      if (
        !isValidPassword(
          password,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Password must be between 8 and 128 characters.",
        });

        return;
      }

      /*
       * Duplicate email check.
       */
      const existingUser =
        getUserByEmail(
          email,
        );

      if (existingUser) {
        res.status(409).json({
          success: false,
          error:
            "An account with this email already exists.",
        });

        return;
      }

      /*
       * Hash password before
       * entering the DB transaction.
       */
      const passwordHash =
        await hashPassword(
          password,
        );

      let createdUserId =
        0;

      /*
       * Registration transaction.
       */
      const transaction =
        db.transaction(() => {
          const roleId =
            getRoleId(
              role,
            );

          /*
           * Visitor is active immediately.
           *
           * Pandit / Temple Manager:
           * pending until admin approval.
           */
          const userStatus:
            | "active"
            | "pending" =
            role === "visitor"
              ? "active"
              : "pending";

          const result =
            db
              .prepare(
                `
                INSERT INTO users (
                  role_id,
                  name,
                  email,
                  phone,
                  password_hash,
                  status,
                  city,
                  state,
                  country,
                  created_at,
                  updated_at
                )
                VALUES (
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP
                )
                `,
              )
              .run(
                roleId,
                name,
                email,
                phone,
                passwordHash,
                userStatus,
                city,
                state,
                country,
              );

          createdUserId =
            Number(
              result.lastInsertRowid,
            );

          /*
           * Visitor profile
           */
          if (
            role === "visitor"
          ) {
            db.prepare(
              `
              INSERT INTO visitor_profiles (
                user_id,
                preferred_language,
                marketing_consent,
                created_at,
                updated_at
              )
              VALUES (
                ?,
                ?,
                ?,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              )
              `,
            ).run(
              createdUserId,
              normalizeNullableText(
                req.body
                  ?.preferredLanguage,
                80,
              ),
              req.body
                ?.marketingConsent
                ? 1
                : 0,
            );
          }

          /*
           * Pandit profile
           */
          if (
            role === "pandit"
          ) {
            const slug =
              makePanditSlug(
                name,
              );

            const languages =
              uniqueStringArray(
                req.body
                  ?.languages,
              );

            const specializations =
              uniqueStringArray(
                req.body
                  ?.specializations,
              );

            const pujaTypes =
              uniqueStringArray(
                req.body
                  ?.pujaTypes,
              );

            const serviceAreas =
              uniqueStringArray(
                req.body
                  ?.serviceAreas,
              );

            const experience =
              parseNonNegativeInteger(
                req.body
                  ?.experienceYears ??
                  req.body
                    ?.experience,
              ) ?? 0;

            const panditResult =
              db
                .prepare(
                  `
                  INSERT INTO pandit_profiles (
                    user_id,
                    slug,
                    display_name,
                    title,
                    photo,
                    experience_years,
                    location,
                    city,
                    district,
                    state,
                    country,
                    languages_json,
                    specializations_json,
                    puja_types_json,
                    associated_with,
                    about,
                    availability,
                    service_areas_json,
                    profile_status,
                    verification_status,
                    identity_verified,
                    profile_verified,
                    authorized_contact,
                    featured,
                    listing_active,
                    created_at,
                    updated_at
                  )
                  VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'pending',
                    'pending',
                    0,
                    0,
                    0,
                    0,
                    0,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                  )
                  `,
                )
                .run(
                  createdUserId,
                  slug,
                  name,
                  normalizeNullableText(
                    req.body
                      ?.title,
                    200,
                  ),
                  normalizeNullableText(
                    req.body
                      ?.photo,
                    500,
                  ),
                  experience,
                  uniqueString([
                    city ?? "",
                    state ?? "",
                  ]) ||
                    null,
                  city,
                  normalizeNullableText(
                    req.body
                      ?.district,
                    120,
                  ),
                  state,
                  country,
                  JSON.stringify(
                    languages,
                  ),
                  JSON.stringify(
                    specializations,
                  ),
                  JSON.stringify(
                    pujaTypes,
                  ),
                  normalizeNullableText(
                    req.body
                      ?.associatedWith,
                    300,
                  ),
                  normalizeNullableText(
                    req.body
                      ?.about,
                    5000,
                  ),
                  normalizeNullableText(
                    req.body
                      ?.availability,
                    300,
                  ),
                  JSON.stringify(
                    serviceAreas,
                  ),
                );

            const panditId =
              Number(
                panditResult.lastInsertRowid,
              );

            const services =
              Array.isArray(
                req.body?.services,
              )
                ? (
                    req.body
                      .services as ServiceInput[]
                  ).slice(
                    0,
                    30,
                  )
                : [];

            const insertService =
              db.prepare(
                `
                INSERT INTO pandit_service_offerings (
                  pandit_id,
                  name,
                  description,
                  price_amount,
                  currency,
                  duration_minutes,
                  is_active,
                  created_at,
                  updated_at
                )
                VALUES (
                  ?,
                  ?,
                  ?,
                  ?,
                  'INR',
                  ?,
                  1,
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP
                )
                `,
              );

            for (
              const service of services
            ) {
              const serviceName =
                normalizeText(
                  service?.name,
                  180,
                );

              if (
                !serviceName
              ) {
                continue;
              }

              const price =
                parseNonNegativeInteger(
                  service
                    ?.priceAmount ??
                    service?.price,
                );

              const duration =
                parsePositiveInteger(
                  service
                    ?.durationMinutes ??
                    service?.duration,
                );

              insertService.run(
                panditId,
                serviceName,
                normalizeNullableText(
                  service
                    ?.description,
                  500,
                ),
                price,
                duration,
              );
            }
          }

          /*
           * Temple Manager profile
           */
          if (
            role ===
            "temple_manager"
          ) {
            db.prepare(
              `
              INSERT INTO temple_manager_profiles (
                user_id,
                designation,
                organization_name,
                verification_status,
                created_at,
                updated_at
              )
              VALUES (
                ?,
                ?,
                ?,
                'pending',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              )
              `,
            ).run(
              createdUserId,
              normalizeNullableText(
                req.body
                  ?.designation,
                200,
              ),
              normalizeNullableText(
                req.body
                  ?.organizationName,
                250,
              ),
            );
          }

          /*
           * Email verification token
           *
           * Delivery integration can consume this later.
           */
          createEmailVerificationToken(
            createdUserId,
          );

          /*
           * Audit log
           */
          createAuditLog({
            userId:
              createdUserId,
            action:
              "auth.register",
            entityType:
              "user",
            entityId:
              createdUserId,
            newData: {
              role,
              name,
              email,
            },
            ipAddress:
              getClientIp(
                req,
              ),
            userAgent:
              getUserAgent(
                req,
              ),
          });
        });

      try {
        transaction();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "";

        const lowered =
          errorMessage.toLowerCase();

        if (
          lowered.includes(
            "unique constraint",
          ) ||
          lowered.includes(
            "users.email",
          ) ||
          lowered.includes(
            "pandit_profiles.slug",
          )
        ) {
          res.status(409).json({
            success: false,
            error:
              lowered.includes(
                "pandit_profiles.slug",
              )
                ? "Unable to create a unique Pandit profile."
                : "An account with this email already exists.",
          });

          return;
        }

        throw error;
      }

      const user =
        getUserById(
          createdUserId,
        );

      if (!user) {
        res.status(500).json({
          success: false,
          error:
            "Account was created but could not be loaded.",
        });

        return;
      }

      /*
       * Visitor gets session immediately.
       */
      if (
        role === "visitor" &&
        user.status === "active"
      ) {
        const sessionToken =
          createSession(
            user.id,
          );

        setSessionCookie(
          res,
          sessionToken,
        );

        res.status(201).json({
          success: true,
          message:
            "Registration successful.",
          authenticated:
            true,
          user:
            publicUser(
              user,
            ),
        });

        return;
      }

      /*
       * Professional accounts remain pending.
       */
      res.status(201).json({
        success: true,
        message:
          role === "pandit"
            ? "Pandit registration submitted. Your profile is awaiting verification."
            : "Temple Manager registration submitted. Your account is awaiting approval.",
        authenticated:
          false,
        user:
          publicUser(
            user,
          ),
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to complete registration.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/auth/login
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email,
        );

      const password =
        req.body?.password;

      if (
        !isValidEmail(
          email,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Please enter a valid email address.",
        });

        return;
      }

      if (
        typeof password !==
          "string" ||
        password.length === 0
      ) {
        res.status(400).json({
          success: false,
          error:
            "Password is required.",
        });

        return;
      }

      const userWithPassword =
        db
          .prepare(
            `
            SELECT
              u.id,
              u.name,
              u.email,
              u.phone,
              u.city,
              u.state,
              u.country,
              u.password_hash,
              u.status,
              u.avatar,
              r.code AS role
            FROM users u
            INNER JOIN roles r
              ON r.id = u.role_id
            WHERE LOWER(u.email) =
              LOWER(?)
            LIMIT 1
            `,
          )
          .get(
            email,
          ) as
          | UserWithPasswordRow
          | undefined;

      if (
        !userWithPassword
      ) {
        res.status(401).json({
          success: false,
          error:
            "Invalid email or password.",
        });

        return;
      }

      const validPassword =
        await verifyPassword(
          password,
          userWithPassword.password_hash,
        );

      if (!validPassword) {
        res.status(401).json({
          success: false,
          error:
            "Invalid email or password.",
        });

        return;
      }

      /*
       * Account status validation.
       */
      if (
        userWithPassword.status ===
        "blocked"
      ) {
        res.status(403).json({
          success: false,
          error:
            "This account has been blocked.",
        });

        return;
      }

      if (
        userWithPassword.status ===
        "suspended"
      ) {
        res.status(403).json({
          success: false,
          error:
            "This account is currently suspended.",
        });

        return;
      }

      if (
        userWithPassword.status ===
        "rejected"
      ) {
        res.status(403).json({
          success: false,
          error:
            "This account has been rejected.",
        });

        return;
      }

      if (
        userWithPassword.status ===
          "pending" &&
        userWithPassword.role !==
          "visitor"
      ) {
        res.status(403).json({
          success: false,
          error:
            userWithPassword.role ===
            "pandit"
              ? "Your Pandit account is awaiting admin verification."
              : "Your Temple Manager account is awaiting admin approval.",
        });

        return;
      }

      /*
       * Any other unsupported status is
       * denied rather than accidentally authenticated.
       */
      if (
        userWithPassword.status !==
        "active"
      ) {
        res.status(403).json({
          success: false,
          error:
            "This account is not currently available for login.",
        });

        return;
      }

      /*
       * Create fresh session.
       */
      const sessionToken =
        createSession(
          userWithPassword.id,
        );

      setSessionCookie(
        res,
        sessionToken,
      );

      /*
       * Update login metadata.
       */
      db.prepare(
        `
        UPDATE users
        SET
          last_login_at =
            CURRENT_TIMESTAMP,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE id = ?
        `,
      ).run(
        userWithPassword.id,
      );

      /*
       * Audit login.
       */
      createAuditLog({
        userId:
          userWithPassword.id,
        action:
          "auth.login",
        entityType:
          "user",
        entityId:
          userWithPassword.id,
        ipAddress:
          getClientIp(req),
        userAgent:
          getUserAgent(req),
      });

      const currentUser =
        getUserById(
          userWithPassword.id,
        );

      if (
        !currentUser
      ) {
        clearSessionCookie(
          res,
        );

        res.status(500).json({
          success: false,
          error:
            "Unable to load authenticated account.",
        });

        return;
      }

      res.json({
        success: true,
        message:
          "Login successful.",
        authenticated:
          true,
        user:
          publicUser(
            currentUser,
          ),
      });
    } catch (error) {
      console.error(
        "Login error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to login.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/auth/logout
|--------------------------------------------------------------------------
*/

router.post(
  "/logout",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const token =
        getCookieToken(
          req,
        );

      let userId:
        | number
        | null = null;

      if (token) {
        /*
         * Resolve session before deleting it
         * so we can write audit information.
         */
        const currentUser =
          getSessionUser(
            token,
          );

        userId =
          currentUser?.id ??
          null;

        removeSession(
          token,
        );
      }

      clearSessionCookie(
        res,
      );

      if (userId) {
        createAuditLog({
          userId,
          action:
            "auth.logout",
          entityType:
            "user",
          entityId:
            userId,
          ipAddress:
            getClientIp(
              req,
            ),
          userAgent:
            getUserAgent(
              req,
            ),
        });
      }

      res.json({
        success: true,
        authenticated:
          false,
        message:
          "Logged out successfully.",
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error,
      );

      /*
       * Cookie is cleared even if
       * audit/session cleanup fails.
       */
      clearSessionCookie(
        res,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to logout.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/auth/profile
|--------------------------------------------------------------------------
|
| Editable:
|   name
|   phone
|   city
|   state
|   country
|   avatar
|
| Not editable:
|   email
|   role
|   status
|   password
|--------------------------------------------------------------------------
*/

router.patch(
  "/profile",
  requireAuth,
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const sessionUser =
        res.locals.user as
          | AuthenticatedUser
          | undefined;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          error:
            "Authentication required.",
        });

        return;
      }

      const currentUser =
        getUserById(
          sessionUser.id,
        );

      if (!currentUser) {
        res.status(404).json({
          success: false,
          error:
            "User account not found.",
        });

        return;
      }

      const body =
        req.body ?? {};

      /*
       * Strictly whitelist supported fields.
       */
      const hasName =
        Object.prototype.hasOwnProperty.call(
          body,
          "name",
        );

      const hasPhone =
        Object.prototype.hasOwnProperty.call(
          body,
          "phone",
        );

      const hasCity =
        Object.prototype.hasOwnProperty.call(
          body,
          "city",
        );

      const hasState =
        Object.prototype.hasOwnProperty.call(
          body,
          "state",
        );

      const hasCountry =
        Object.prototype.hasOwnProperty.call(
          body,
          "country",
        );

      const hasAvatar =
        Object.prototype.hasOwnProperty.call(
          body,
          "avatar",
        );

      const name =
        hasName
          ? normalizeText(
              body.name,
              150,
            )
          : undefined;

      const phone =
        hasPhone
          ? normalizePhone(
              body.phone,
            )
          : undefined;

      const city =
        hasCity
          ? normalizeNullableText(
              body.city,
              120,
            )
          : undefined;

      const state =
        hasState
          ? normalizeNullableText(
              body.state,
              120,
            )
          : undefined;

      const country =
        hasCountry
          ? normalizeNullableText(
              body.country,
              100,
            )
          : undefined;

      const avatar =
        hasAvatar
          ? normalizeNullableText(
              body.avatar,
              1000,
            )
          : undefined;

      /*
       * Name validation
       */
      if (
        hasName &&
        (!name ||
          name.length < 2)
      ) {
        res.status(400).json({
          success: false,
          error:
            "Name must contain at least 2 characters.",
        });

        return;
      }

      /*
       * Phone validation
       */
      if (
        hasPhone &&
        !isValidPhone(
          phone ?? null,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Please enter a valid phone number.",
        });

        return;
      }

      /*
       * No changes
       */
      if (
        !hasName &&
        !hasPhone &&
        !hasCity &&
        !hasState &&
        !hasCountry &&
        !hasAvatar
      ) {
        res.json({
          success: true,
          message:
            "No profile changes were supplied.",
          user:
            publicUser(
              currentUser,
            ),
        });

        return;
      }

      /*
       * User table update.
       */
      const assignments: string[] =
        [];

      const values: unknown[] =
        [];

      if (hasName) {
        assignments.push(
          "name = ?",
        );
        values.push(name);
      }

      if (hasPhone) {
        assignments.push(
          "phone = ?",
        );
        values.push(
          phone ?? null,
        );
      }

      if (hasCity) {
        assignments.push(
          "city = ?",
        );
        values.push(
          city ?? null,
        );
      }

      if (hasState) {
        assignments.push(
          "state = ?",
        );
        values.push(
          state ?? null,
        );
      }

      if (hasCountry) {
        assignments.push(
          "country = ?",
        );
        values.push(
          country ?? null,
        );
      }

      if (hasAvatar) {
        assignments.push(
          "avatar = ?",
        );
        values.push(
          avatar ?? null,
        );
      }

      assignments.push(
        "updated_at = CURRENT_TIMESTAMP",
      );

      values.push(
        sessionUser.id,
      );

      const transaction =
        db.transaction(() => {
          /*
           * Update common user profile.
           */
          db.prepare(
            `
            UPDATE users
            SET ${assignments.join(
              ", ",
            )}
            WHERE id = ?
            `,
          ).run(
            ...values,
          );

          /*
           * Sync common identity fields
           * into Pandit profile.
           */
          if (
            currentUser.role ===
            "pandit"
          ) {
            const panditUpdates: string[] =
              [];

            const panditValues: unknown[] =
              [];

            if (hasName) {
              panditUpdates.push(
                "display_name = ?",
              );

              panditValues.push(
                name,
              );
            }

            if (hasCity) {
              panditUpdates.push(
                "city = ?",
              );

              panditValues.push(
                city ?? null,
              );
            }

            if (hasState) {
              panditUpdates.push(
                "state = ?",
              );

              panditValues.push(
                state ?? null,
              );
            }

            if (hasCountry) {
              panditUpdates.push(
                "country = ?",
              );

              panditValues.push(
                country ?? null,
              );
            }

            /*
             * Keep Pandit location readable.
             */
            if (
              hasCity ||
              hasState
            ) {
              const finalCity =
                hasCity
                  ? city ??
                    null
                  : currentUser.city;

              const finalState =
                hasState
                  ? state ??
                    null
                  : currentUser.state;

              panditUpdates.push(
                "location = ?",
              );

              panditValues.push(
                uniqueString([
                  finalCity ??
                    "",
                  finalState ??
                    "",
                ]) ||
                  null,
              );
            }

            if (
              panditUpdates.length >
              0
            ) {
              panditUpdates.push(
                "updated_at = CURRENT_TIMESTAMP",
              );

              panditValues.push(
                sessionUser.id,
              );

              db.prepare(
                `
                UPDATE pandit_profiles
                SET ${panditUpdates.join(
                  ", ",
                )}
                WHERE user_id = ?
                `,
              ).run(
                ...panditValues,
              );
            }
          }

          /*
           * Audit profile change.
           */
          createAuditLog({
            userId:
              sessionUser.id,
            action:
              "auth.profile_updated",
            entityType:
              "user",
            entityId:
              sessionUser.id,
            oldData: {
              name:
                currentUser.name,
              phone:
                currentUser.phone,
              city:
                currentUser.city,
              state:
                currentUser.state,
              country:
                currentUser.country,
              avatar:
                currentUser.avatar,
            },
            newData: {
              name:
                hasName
                  ? name
                  : currentUser.name,
              phone:
                hasPhone
                  ? phone
                  : currentUser.phone,
              city:
                hasCity
                  ? city
                  : currentUser.city,
              state:
                hasState
                  ? state
                  : currentUser.state,
              country:
                hasCountry
                  ? country
                  : currentUser.country,
              avatar:
                hasAvatar
                  ? avatar
                  : currentUser.avatar,
            },
            ipAddress:
              getClientIp(
                req,
              ),
            userAgent:
              getUserAgent(
                req,
              ),
          });
        });

      transaction();

      /*
       * Reload authoritative user.
       */
      const updatedUser =
        getUserById(
          sessionUser.id,
        );

      if (
        !updatedUser
      ) {
        res.status(500).json({
          success: false,
          error:
            "Profile was updated but the account could not be loaded.",
        });

        return;
      }

      res.json({
        success: true,
        message:
          "Profile updated successfully.",
        user:
          publicUser(
            updatedUser,
          ),
      });
    } catch (error) {
      console.error(
        "Profile update error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update your profile.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/auth/forgot-password
|--------------------------------------------------------------------------
*/

router.post(
  "/forgot-password",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email,
        );

      /*
       * Always use a generic response
       * for unknown/invalid accounts.
       */
      const genericResponse =
        () => {
          res.json({
            success: true,
            message:
              "If an account exists for this email, a password reset link has been prepared.",
          });
        };

      if (
        !isValidEmail(
          email,
        )
      ) {
        genericResponse();
        return;
      }

      const user =
        getUserByEmail(
          email,
        );

      if (!user) {
        genericResponse();
        return;
      }

      /*
       * Remove previous active reset tokens.
       */
      db.prepare(
        `
        DELETE FROM password_reset_tokens
        WHERE user_id = ?
          AND used_at IS NULL
        `,
      ).run(
        user.id,
      );

      const rawToken =
        makeToken();

      const tokenHash =
        hashToken(
          rawToken,
        );

      const expiresAt =
        new Date(
          Date.now() +
            PASSWORD_RESET_MINUTES *
              60 *
              1000,
        ).toISOString();

      db.prepare(
        `
        INSERT INTO password_reset_tokens (
          user_id,
          token_hash,
          expires_at,
          created_at
        )
        VALUES (
          ?,
          ?,
          ?,
          CURRENT_TIMESTAMP
        )
        `,
      ).run(
        user.id,
        tokenHash,
        expiresAt,
      );

      createAuditLog({
        userId:
          user.id,
        action:
          "auth.forgot_password",
        entityType:
          "user",
        entityId:
          user.id,
        ipAddress:
          getClientIp(req),
        userAgent:
          getUserAgent(req),
      });

      /*
       * Development mode:
       * expose token for local testing.
       *
       * Production mode:
       * email integration should deliver
       * the reset link instead.
       */
      if (
        !IS_PRODUCTION
      ) {
        res.json({
          success: true,
          message:
            "Development password reset token generated.",
          resetToken:
            rawToken,
          expiresAt,
        });

        return;
      }

      genericResponse();
    } catch (error) {
      console.error(
        "Forgot password error:",
        error,
      );

      /*
       * Do not leak account existence.
       */
      res.json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been prepared.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/auth/reset-password
|--------------------------------------------------------------------------
*/

router.post(
  "/reset-password",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const token =
        normalizeText(
          req.body?.token,
          200,
        );

      const password =
        req.body?.password;

      if (!token) {
        res.status(400).json({
          success: false,
          error:
            "Password reset token is required.",
        });

        return;
      }

      if (
        !isValidPassword(
          password,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Password must be between 8 and 128 characters.",
        });

        return;
      }

      const record =
        db
          .prepare(
            `
            SELECT
              id,
              user_id,
              expires_at,
              used_at
            FROM password_reset_tokens
            WHERE token_hash = ?
            LIMIT 1
            `,
          )
          .get(
            hashToken(
              token,
            ),
          ) as
          | PasswordResetDatabaseRow
          | undefined;

      if (!record) {
        res.status(400).json({
          success: false,
          error:
            "Invalid or expired reset token.",
        });

        return;
      }

      if (
        record.used_at
      ) {
        res.status(400).json({
          success: false,
          error:
            "This reset token has already been used.",
        });

        return;
      }

      const expiry =
        new Date(
          record.expires_at,
        ).getTime();

      if (
        !Number.isFinite(
          expiry,
        ) ||
        expiry <= Date.now()
      ) {
        res.status(400).json({
          success: false,
          error:
            "Invalid or expired reset token.",
        });

        return;
      }

      const passwordHash =
        await hashPassword(
          password,
        );

      const transaction =
        db.transaction(() => {
          /*
           * Update password.
           */
          db.prepare(
            `
            UPDATE users
            SET
              password_hash = ?,
              updated_at =
                CURRENT_TIMESTAMP
            WHERE id = ?
            `,
          ).run(
            passwordHash,
            record.user_id,
          );

          /*
           * Force logout from
           * every existing session.
           */
          removeAllUserSessions(
            record.user_id,
          );

          /*
           * Consume token.
           */
          db.prepare(
            `
            UPDATE password_reset_tokens
            SET used_at =
              CURRENT_TIMESTAMP
            WHERE id = ?
            `,
          ).run(
            record.id,
          );

          /*
           * Audit password reset.
           */
          createAuditLog({
            userId:
              record.user_id,
            action:
              "auth.password_reset",
            entityType:
              "user",
            entityId:
              record.user_id,
            ipAddress:
              getClientIp(
                req,
              ),
            userAgent:
              getUserAgent(
                req,
              ),
          });
        });

      transaction();

      clearSessionCookie(
        res,
      );

      res.json({
        success: true,
        message:
          "Password reset successful. Please login again.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to reset password.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/auth/verify-email
|--------------------------------------------------------------------------
*/

router.post(
  "/verify-email",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const token =
        normalizeText(
          req.body?.token,
          200,
        );

      if (!token) {
        res.status(400).json({
          success: false,
          error:
            "Verification token is required.",
        });

        return;
      }

      const record =
        db
          .prepare(
            `
            SELECT
              id,
              user_id,
              expires_at,
              verified_at
            FROM verification_tokens
            WHERE token_hash = ?
              AND purpose =
                'email_verification'
            LIMIT 1
            `,
          )
          .get(
            hashToken(
              token,
            ),
          ) as
          | VerificationDatabaseRow
          | undefined;

      if (!record) {
        res.status(400).json({
          success: false,
          error:
            "Invalid or expired verification token.",
        });

        return;
      }

      if (
        record.verified_at
      ) {
        res.json({
          success: true,
          message:
            "Email has already been verified.",
        });

        return;
      }

      const expiry =
        new Date(
          record.expires_at,
        ).getTime();

      if (
        !Number.isFinite(
          expiry,
        ) ||
        expiry <= Date.now()
      ) {
        res.status(400).json({
          success: false,
          error:
            "Invalid or expired verification token.",
        });

        return;
      }

      const transaction =
        db.transaction(() => {
          db.prepare(
            `
            UPDATE verification_tokens
            SET verified_at =
              CURRENT_TIMESTAMP
            WHERE id = ?
            `,
          ).run(
            record.id,
          );

          db.prepare(
            `
            UPDATE users
            SET
              email_verified_at =
                CURRENT_TIMESTAMP,
              updated_at =
                CURRENT_TIMESTAMP
            WHERE id = ?
            `,
          ).run(
            record.user_id,
          );

          createAuditLog({
            userId:
              record.user_id,
            action:
              "auth.email_verified",
            entityType:
              "user",
            entityId:
              record.user_id,
            ipAddress:
              getClientIp(
                req,
              ),
            userAgent:
              getUserAgent(
                req,
              ),
          });
        });

      transaction();

      res.json({
        success: true,
        message:
          "Email verified successfully.",
      });
    } catch (error) {
      console.error(
        "Email verification error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to verify email.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/auth/role
|--------------------------------------------------------------------------
*/

router.get(
  "/role",
  requireAuth,
  (
    _req: Request,
    res: Response,
  ) => {
    const user =
      res.locals.user as AuthenticatedUser;

    res.json({
      success: true,
      role:
        user.role,
      status:
        user.status,
      userId:
        user.id,
      roleProfile:
        user.roleProfile,
    });
  },
);

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default router;