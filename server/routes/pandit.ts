import {
  Router,
  type Request,
  type Response,
} from "express";

import {
  requireAuth,
  requireRole,
  type AuthenticatedUser,
} from "./auth.ts";

import { db } from "../db/database.ts";

const router = Router();

router.use(
  requireAuth,
  requireRole("pandit"),
);

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PanditProfileRow = {
  id: number;
  user_id: number;
  slug: string;
  display_name: string;
  title: string | null;
  photo: string | null;
  experience_years: number;
  location: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  languages_json: string | null;
  specializations_json: string | null;
  puja_types_json: string | null;
  associated_with: string | null;
  about: string | null;
  availability: string | null;
  service_areas_json: string | null;
  profile_status: string;
  verification_status: string;
  identity_verified: number;
  profile_verified: number;
  authorized_contact: number;
  featured: number;
  listing_active: number;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: number;
  pandit_id: number;
  name: string;
  description: string | null;
  price_amount: number | null;
  currency: string;
  duration_minutes: number | null;
  is_active: number;
  created_at: string;
  updated_at: string;
};

type ParsedResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

/*
|--------------------------------------------------------------------------
| Generic Helpers
|--------------------------------------------------------------------------
*/

function currentUser(
  res: Response,
): AuthenticatedUser {
  return res.locals.user as AuthenticatedUser;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function bodyObject(
  req: Request,
): Record<string, unknown> {
  return isRecord(req.body)
    ? req.body
    : {};
}

/*
|--------------------------------------------------------------------------
| Text Validation
|--------------------------------------------------------------------------
*/

function text(
  value: unknown,
  max = 500,
): string {
  if (typeof value === "string") {
    return value
      .trim()
      .slice(0, max);
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
      .trim()
      .slice(0, max);
  }

  return "";
}

function nullableText(
  value: unknown,
  max = 500,
): string | null {
  const valueText = text(
    value,
    max,
  );

  return valueText || null;
}

function requiredText(
  value: unknown,
  fieldName: string,
  max = 500,
  min = 1,
): ParsedResult<string> {
  if (typeof value !== "string") {
    return {
      ok: false,
      error: `${fieldName} must be a text value.`,
    };
  }

  const valueText =
    value.trim();

  if (
    valueText.length < min
  ) {
    return {
      ok: false,
      error: `${fieldName} must contain at least ${min} character${
        min === 1
          ? ""
          : "s"
      }.`,
    };
  }

  if (
    valueText.length > max
  ) {
    return {
      ok: false,
      error: `${fieldName} cannot exceed ${max} characters.`,
    };
  }

  return {
    ok: true,
    value: valueText,
  };
}

function optionalText(
  value: unknown,
  fieldName: string,
  max = 500,
): ParsedResult<string | null> {
  if (value === undefined) {
    return {
      ok: true,
      value: null,
    };
  }

  if (
    value === null ||
    value === ""
  ) {
    return {
      ok: true,
      value: null,
    };
  }

  if (typeof value !== "string") {
    return {
      ok: false,
      error: `${fieldName} must be a text value.`,
    };
  }

  const valueText =
    value.trim();

  if (
    valueText.length > max
  ) {
    return {
      ok: false,
      error: `${fieldName} cannot exceed ${max} characters.`,
    };
  }

  return {
    ok: true,
    value:
      valueText || null,
  };
}

/*
|--------------------------------------------------------------------------
| Number Validation
|--------------------------------------------------------------------------
*/

function parseNonNegativeInteger(
  value: unknown,
  fieldName: string,
  options: {
    nullable?: boolean;
    min?: number;
    max?: number;
  } = {},
): ParsedResult<number | null> {
  const {
    nullable = true,
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
  } = options;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (nullable) {
      return {
        ok: true,
        value: null,
      };
    }

    return {
      ok: false,
      error: `${fieldName} is required.`,
    };
  }

  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return {
      ok: false,
      error: `${fieldName} must be a number.`,
    };
  }

  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed,
    ) ||
    !Number.isInteger(
      parsed,
    )
  ) {
    return {
      ok: false,
      error: `${fieldName} must be a valid whole number.`,
    };
  }

  if (parsed < min) {
    return {
      ok: false,
      error: `${fieldName} cannot be less than ${min}.`,
    };
  }

  if (parsed > max) {
    return {
      ok: false,
      error: `${fieldName} cannot be greater than ${max}.`,
    };
  }

  return {
    ok: true,
    value: parsed,
  };
}

function parseMoney(
  value: unknown,
  fieldName = "Price",
): ParsedResult<number | null> {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return {
      ok: true,
      value: null,
    };
  }

  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return {
      ok: false,
      error: `${fieldName} must be a valid number.`,
    };
  }

  const raw =
    String(value).trim();

  if (
    !/^\d+(?:\.\d{1,2})?$/.test(
      raw,
    )
  ) {
    return {
      ok: false,
      error: `${fieldName} must be a non-negative number with up to 2 decimal places.`,
    };
  }

  const parsed =
    Number(raw);

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed < 0
  ) {
    return {
      ok: false,
      error: `${fieldName} must be a non-negative number.`,
    };
  }

  return {
    ok: true,
    value: Number(
      parsed.toFixed(2),
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Boolean Validation
|--------------------------------------------------------------------------
*/

function parseBoolean(
  value: unknown,
  fieldName: string,
): ParsedResult<boolean> {
  if (
    typeof value === "boolean"
  ) {
    return {
      ok: true,
      value,
    };
  }

  if (
    typeof value === "number"
  ) {
    if (value === 1) {
      return {
        ok: true,
        value: true,
      };
    }

    if (value === 0) {
      return {
        ok: true,
        value: false,
      };
    }
  }

  if (
    typeof value === "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();

    if (
      normalized === "true" ||
      normalized === "1"
    ) {
      return {
        ok: true,
        value: true,
      };
    }

    if (
      normalized === "false" ||
      normalized === "0"
    ) {
      return {
        ok: true,
        value: false,
      };
    }
  }

  return {
    ok: false,
    error: `${fieldName} must be true or false.`,
  };
}

/*
|--------------------------------------------------------------------------
| Array Helpers
|--------------------------------------------------------------------------
*/

function stringArray(
  value: unknown,
  maxItems = 30,
  maxLength = 120,
): string[] {
  if (Array.isArray(value)) {
    const result: string[] = [];

    for (
      const item of value.slice(
        0,
        maxItems,
      )
    ) {
      if (
        typeof item !== "string"
      ) {
        continue;
      }

      const itemText =
        item
          .trim()
          .slice(
            0,
            maxLength,
          );

      if (
        itemText &&
        !result.includes(
          itemText,
        )
      ) {
        result.push(
          itemText,
        );
      }
    }

    return result;
  }

  if (
    typeof value === "string"
  ) {
    const parts =
      value
        .split(",")
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean)
        .slice(
          0,
          maxItems,
        );

    const result: string[] =
      [];

    for (
      const item of parts
    ) {
      const itemText =
        item.slice(
          0,
          maxLength,
        );

      if (
        itemText &&
        !result.includes(
          itemText,
        )
      ) {
        result.push(
          itemText,
        );
      }
    }

    return result;
  }

  return [];
}

function readJsonArray(
  value:
    | string
    | null
    | undefined,
): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(value);

    return stringArray(
      parsed,
    );
  } catch {
    return [];
  }
}

function parseProfileArray(
  value: unknown,
  fieldName: string,
): ParsedResult<string[]> {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return {
      ok: true,
      value: [],
    };
  }

  if (
    !Array.isArray(value) &&
    typeof value !== "string"
  ) {
    return {
      ok: false,
      error: `${fieldName} must be an array or comma-separated text.`,
    };
  }

  return {
    ok: true,
    value: stringArray(
      value,
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Slug Helpers
|--------------------------------------------------------------------------
*/

function makeSlugBase(
  value: string,
): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
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
      .slice(0, 70) ||
    "pandit"
  );
}

function makeUniqueSlug(
  value: string,
  ignoreId?: number,
): string {
  const base =
    makeSlugBase(value);

  let slug = base;
  let counter = 1;

  while (true) {
    const row =
      db
        .prepare(
          `
          SELECT id
          FROM pandit_profiles
          WHERE slug = ?
            AND (? IS NULL OR id != ?)
          LIMIT 1
          `,
        )
        .get(
          slug,
          ignoreId ?? null,
          ignoreId ?? null,
        ) as
        | {
            id: number;
          }
        | undefined;

    if (!row) {
      return slug;
    }

    counter += 1;
    slug = `${base}-${counter}`;
  }
}

/*
|--------------------------------------------------------------------------
| Database Readers
|--------------------------------------------------------------------------
*/

function getProfile(
  userId: number,
): PanditProfileRow | undefined {
  return db
    .prepare(
      `
      SELECT
        id,
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
      FROM pandit_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
    )
    .get(userId) as
    | PanditProfileRow
    | undefined;
}

function getService(
  userId: number,
  serviceId: number,
): ServiceRow | undefined {
  return db
    .prepare(
      `
      SELECT
        ps.id,
        ps.pandit_id,
        ps.name,
        ps.description,
        ps.price_amount,
        ps.currency,
        ps.duration_minutes,
        ps.is_active,
        ps.created_at,
        ps.updated_at
      FROM pandit_service_offerings ps
      INNER JOIN pandit_profiles pp
        ON pp.id = ps.pandit_id
      WHERE pp.user_id = ?
        AND ps.id = ?
      LIMIT 1
      `,
    )
    .get(
      userId,
      serviceId,
    ) as
    | ServiceRow
    | undefined;
}

function getServices(
  panditId: number,
): ServiceRow[] {
  return db
    .prepare(
      `
      SELECT
        id,
        pandit_id,
        name,
        description,
        price_amount,
        currency,
        duration_minutes,
        is_active,
        created_at,
        updated_at
      FROM pandit_service_offerings
      WHERE pandit_id = ?
      ORDER BY id DESC
      `,
    )
    .all(panditId) as ServiceRow[];
}

/*
|--------------------------------------------------------------------------
| API Serializers
|--------------------------------------------------------------------------
*/

function publicProfile(
  profile: PanditProfileRow,
) {
  return {
    id: profile.id,
    userId: profile.user_id,
    slug: profile.slug,
    displayName:
      profile.display_name,
    title: profile.title,
    photo: profile.photo,
    experienceYears:
      profile.experience_years,
    location: profile.location,
    city: profile.city,
    district: profile.district,
    state: profile.state,
    country: profile.country,
    languages:
      readJsonArray(
        profile.languages_json,
      ),
    specializations:
      readJsonArray(
        profile.specializations_json,
      ),
    pujaTypes:
      readJsonArray(
        profile.puja_types_json,
      ),
    associatedWith:
      profile.associated_with,
    about: profile.about,
    availability:
      profile.availability,
    serviceAreas:
      readJsonArray(
        profile.service_areas_json,
      ),
    profileStatus:
      profile.profile_status,
    verificationStatus:
      profile.verification_status,
    identityVerified:
      Boolean(
        profile.identity_verified,
      ),
    profileVerified:
      Boolean(
        profile.profile_verified,
      ),
    authorizedContact:
      Boolean(
        profile.authorized_contact,
      ),
    featured:
      Boolean(profile.featured),
    listingActive:
      Boolean(
        profile.listing_active,
      ),
    createdAt:
      profile.created_at,
    updatedAt:
      profile.updated_at,
  };
}

function publicService(
  service: ServiceRow,
) {
  return {
    id: service.id,
    panditId:
      service.pandit_id,
    name: service.name,
    description:
      service.description,
    priceAmount:
      service.price_amount,
    currency:
      service.currency,
    durationMinutes:
      service.duration_minutes,
    isActive:
      Boolean(service.is_active),
    createdAt:
      service.created_at,
    updatedAt:
      service.updated_at,
  };
}

/*
|--------------------------------------------------------------------------
| Audit
|--------------------------------------------------------------------------
*/

function auditRequestMeta(
  req: Request,
) {
  const userAgent =
    req.get("user-agent");

  return {
    ipAddress:
      req.ip || null,
    userAgent:
      userAgent
        ? userAgent.slice(
            0,
            1000,
          )
        : null,
  };
}

function writeAudit(
  req: Request,
  userId: number,
  action: string,
  entityType: string,
  entityId: number,
  oldData: unknown,
  newData: unknown,
): void {
  const meta =
    auditRequestMeta(req);

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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
  ).run(
    userId,
    action,
    entityType,
    entityId,
    oldData === undefined ||
    oldData === null
      ? null
      : JSON.stringify(
          oldData,
        ),
    newData === undefined ||
    newData === null
      ? null
      : JSON.stringify(
          newData,
        ),
    meta.ipAddress,
    meta.userAgent,
  );
}

/*
|--------------------------------------------------------------------------
| Misc Validation
|--------------------------------------------------------------------------
*/

function validHttpOrRelativePhoto(
  value: string | null,
): boolean {
  if (!value) {
    return true;
  }

  if (
    value.startsWith("/") ||
    value.startsWith("./")
  ) {
    return true;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}

function parseServiceId(
  req: Request,
  res: Response,
): number | null {
  const serviceId =
    Number(
      req.params.id,
    );

  if (
    !Number.isInteger(
      serviceId,
    ) ||
    serviceId <= 0
  ) {
    res.status(400).json({
      success: false,
      error:
        "Invalid service ID.",
    });

    return null;
  }

  return serviceId;
}

/*
|--------------------------------------------------------------------------
| Dashboard Response
|--------------------------------------------------------------------------
*/

function sendDashboard(
  res: Response,
): void {
  const user =
    currentUser(res);

  const profile =
    getProfile(user.id);

  if (!profile) {
    res.status(404).json({
      success: false,
      error:
        "Pandit profile not found.",
      code:
        "PANDIT_PROFILE_NOT_FOUND",
    });

    return;
  }

  const services =
    getServices(
      profile.id,
    );

  const activeServices =
    services.filter(
      (service) =>
        service.is_active ===
        1,
    ).length;

  const inactiveServices =
    services.length -
    activeServices;

  res.json({
    success: true,
    profile:
      publicProfile(
        profile,
      ),
    services:
      services.map(
        publicService,
      ),
    stats: {
      totalServices:
        services.length,
      activeServices,
      inactiveServices,
    },
  });
}

/*
|--------------------------------------------------------------------------
| GET /api/pandit/dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  (_req: Request, res: Response) => {
    try {
      sendDashboard(res);
    } catch (error) {
      console.error(
        "Pandit dashboard error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load Pandit dashboard.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/pandit/profile
|--------------------------------------------------------------------------
*/

router.get(
  "/profile",
  (_req: Request, res: Response) => {
    try {
      const user =
        currentUser(res);

      const profile =
        getProfile(
          user.id,
        );

      if (!profile) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
          code:
            "PANDIT_PROFILE_NOT_FOUND",
        });

        return;
      }

      res.json({
        success: true,
        profile:
          publicProfile(
            profile,
          ),
      });
    } catch (error) {
      console.error(
        "Pandit profile GET error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load Pandit profile.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/pandit/profile
|--------------------------------------------------------------------------
|
| Creates a Pandit profile if the authenticated Pandit account does not
| already have one.
|--------------------------------------------------------------------------
*/

router.post(
  "/profile",
  (req: Request, res: Response) => {
    try {
      const user =
        currentUser(res);

      const existing =
        getProfile(
          user.id,
        );

      if (existing) {
        res.status(409).json({
          success: false,
          error:
            "Pandit profile already exists.",
        });

        return;
      }

      const body =
        bodyObject(req);

      /*
      |--------------------------------------------------------------------------
      | Display Name
      |--------------------------------------------------------------------------
      */

      const displayNameResult =
        requiredText(
          body.displayName ===
            undefined
            ? user.name
            : body.displayName,
          "Display name",
          150,
          2,
        );

      if (!displayNameResult.ok) {
        res.status(400).json({
          success: false,
          error:
            displayNameResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Text Fields
      |--------------------------------------------------------------------------
      */

      const titleResult =
        optionalText(
          body.title,
          "Title",
          200,
        );

      if (!titleResult.ok) {
        res.status(400).json({
          success: false,
          error:
            titleResult.error,
        });

        return;
      }

      const photoResult =
        optionalText(
          body.photo,
          "Photo",
          500,
        );

      if (!photoResult.ok) {
        res.status(400).json({
          success: false,
          error:
            photoResult.error,
        });

        return;
      }

      if (
        !validHttpOrRelativePhoto(
          photoResult.value,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Photo must be a valid HTTP(S) URL or relative path.",
        });

        return;
      }

      const phoneResult =
        optionalText(
          body.phone,
          "Phone",
          30,
        );

      if (!phoneResult.ok) {
        res.status(400).json({
          success: false,
          error:
            phoneResult.error,
        });

        return;
      }

      const cityResult =
        optionalText(
          body.city,
          "City",
          120,
        );

      if (!cityResult.ok) {
        res.status(400).json({
          success: false,
          error:
            cityResult.error,
        });

        return;
      }

      const districtResult =
        optionalText(
          body.district,
          "District",
          120,
        );

      if (!districtResult.ok) {
        res.status(400).json({
          success: false,
          error:
            districtResult.error,
        });

        return;
      }

      const stateResult =
        optionalText(
          body.state,
          "State",
          120,
        );

      if (!stateResult.ok) {
        res.status(400).json({
          success: false,
          error:
            stateResult.error,
        });

        return;
      }

      const countryResult =
        optionalText(
          body.country,
          "Country",
          100,
        );

      if (!countryResult.ok) {
        res.status(400).json({
          success: false,
          error:
            countryResult.error,
        });

        return;
      }

      const locationResult =
        optionalText(
          body.location,
          "Location",
          200,
        );

      if (!locationResult.ok) {
        res.status(400).json({
          success: false,
          error:
            locationResult.error,
        });

        return;
      }

      const associatedResult =
        optionalText(
          body.associatedWith,
          "Associated with",
          300,
        );

      if (!associatedResult.ok) {
        res.status(400).json({
          success: false,
          error:
            associatedResult.error,
        });

        return;
      }

      const aboutResult =
        optionalText(
          body.about,
          "About",
          5000,
        );

      if (!aboutResult.ok) {
        res.status(400).json({
          success: false,
          error:
            aboutResult.error,
        });

        return;
      }

      const availabilityResult =
        optionalText(
          body.availability,
          "Availability",
          300,
        );

      if (
        !availabilityResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            availabilityResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Number Fields
      |--------------------------------------------------------------------------
      */

      const experienceResult =
        parseNonNegativeInteger(
          body.experienceYears,
          "Experience years",
          {
            nullable: true,
            min: 0,
            max: 100,
          },
        );

      if (
        !experienceResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            experienceResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Arrays
      |--------------------------------------------------------------------------
      */

      const languagesResult =
        parseProfileArray(
          body.languages,
          "Languages",
        );

      if (
        !languagesResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            languagesResult.error,
        });

        return;
      }

      const specializationsResult =
        parseProfileArray(
          body.specializations,
          "Specializations",
        );

      if (
        !specializationsResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            specializationsResult.error,
        });

        return;
      }

      const pujaTypesResult =
        parseProfileArray(
          body.pujaTypes,
          "Puja types",
        );

      if (
        !pujaTypesResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            pujaTypesResult.error,
        });

        return;
      }

      const serviceAreasResult =
        parseProfileArray(
          body.serviceAreas,
          "Service areas",
        );

      if (
        !serviceAreasResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            serviceAreasResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Final Values
      |--------------------------------------------------------------------------
      */

      const displayName =
        displayNameResult.value;

      const slug =
        makeUniqueSlug(
          displayName,
        );

      const experienceYears =
        experienceResult.value ??
        0;

      const languages =
        languagesResult.value;

      const specializations =
        specializationsResult.value;

      const pujaTypes =
        pujaTypesResult.value;

      const serviceAreas =
        serviceAreasResult.value;

      const city =
        cityResult.value ??
        user.city ??
        null;

      const state =
        stateResult.value ??
        user.state ??
        null;

      const country =
        countryResult.value ??
        user.country ??
        "India";

      const profileId =
        db.transaction(() => {
          const result =
            db.prepare(
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
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
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
              user.id,
              slug,
              displayName,
              titleResult.value,
              photoResult.value,
              experienceYears,
              locationResult.value,
              city,
              districtResult.value,
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
              associatedResult.value,
              aboutResult.value,
              availabilityResult.value,
              JSON.stringify(
                serviceAreas,
              ),
            );

          const createdProfileId =
            Number(
              result.lastInsertRowid,
            );

          const nextUserName =
            body.name ===
            undefined
              ? user.name
              : nullableText(
                  body.name,
                  150,
                ) ??
                user.name;

          const nextPhone =
            body.phone ===
            undefined
              ? user.phone ??
                null
              : phoneResult.value;

          db.prepare(
            `
            UPDATE users
            SET
              name = ?,
              phone = ?,
              city = ?,
              state = ?,
              country = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
          ).run(
            nextUserName,
            nextPhone,
            city,
            state,
            country,
            user.id,
          );

          writeAudit(
            req,
            user.id,
            "pandit.profile_created",
            "pandit_profile",
            createdProfileId,
            null,
            {
              displayName,
              slug,
            },
          );

          return createdProfileId;
        })();

      void profileId;

      const profile =
        getProfile(
          user.id,
        );

      if (!profile) {
        res.status(500).json({
          success: false,
          error:
            "Profile was created but could not be loaded.",
        });

        return;
      }

      res.status(201).json({
        success: true,
        message:
          "Pandit profile created successfully.",
        profile:
          publicProfile(
            profile,
          ),
      });
    } catch (error) {
      console.error(
        "Pandit profile POST error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message
          .toLowerCase()
          .includes("unique")
      ) {
        res.status(409).json({
          success: false,
          error:
            "A Pandit profile with this information already exists.",
        });

        return;
      }

      res.status(500).json({
        success: false,
        error:
          "Unable to create Pandit profile.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/pandit/profile
|--------------------------------------------------------------------------
|
| IMPORTANT:
| listingActive is intentionally NOT accepted here.
| Listing status can only be changed through /listing.
|--------------------------------------------------------------------------
*/

router.patch(
  "/profile",
  (req: Request, res: Response) => {
    try {
      const user =
        currentUser(res);

      const existing =
        getProfile(
          user.id,
        );

      if (!existing) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
          code:
            "PANDIT_PROFILE_NOT_FOUND",
        });

        return;
      }

      const body =
        bodyObject(req);

      /*
      |--------------------------------------------------------------------------
      | Display Name
      |--------------------------------------------------------------------------
      */

      const displayName =
        body.displayName ===
        undefined
          ? existing.display_name
          : text(
              body.displayName,
              150,
            );

      if (
        displayName.length < 2
      ) {
        res.status(400).json({
          success: false,
          error:
            "Display name must contain at least 2 characters.",
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Text Fields
      |--------------------------------------------------------------------------
      */

      const titleResult =
        body.title ===
        undefined
          ? {
              ok: true as const,
              value:
                existing.title,
            }
          : optionalText(
              body.title,
              "Title",
              200,
            );

      if (!titleResult.ok) {
        res.status(400).json({
          success: false,
          error:
            titleResult.error,
        });

        return;
      }

      const photoResult =
        body.photo ===
        undefined
          ? {
              ok: true as const,
              value:
                existing.photo,
            }
          : optionalText(
              body.photo,
              "Photo",
              500,
            );

      if (!photoResult.ok) {
        res.status(400).json({
          success: false,
          error:
            photoResult.error,
        });

        return;
      }

      if (
        !validHttpOrRelativePhoto(
          photoResult.value,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Photo must be a valid HTTP(S) URL or relative path.",
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Experience
      |--------------------------------------------------------------------------
      */

      const experienceResult =
        body.experienceYears ===
        undefined
          ? {
              ok: true as const,
              value:
                existing.experience_years,
            }
          : parseNonNegativeInteger(
              body.experienceYears,
              "Experience years",
              {
                nullable: false,
                min: 0,
                max: 100,
              },
            );

      if (
        !experienceResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            experienceResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Arrays
      |--------------------------------------------------------------------------
      */

      const languages =
        body.languages ===
        undefined
          ? readJsonArray(
              existing.languages_json,
            )
          : stringArray(
              body.languages,
            );

      const specializations =
        body.specializations ===
        undefined
          ? readJsonArray(
              existing.specializations_json,
            )
          : stringArray(
              body.specializations,
            );

      const pujaTypes =
        body.pujaTypes ===
        undefined
          ? readJsonArray(
              existing.puja_types_json,
            )
          : stringArray(
              body.pujaTypes,
            );

      const serviceAreas =
        body.serviceAreas ===
        undefined
          ? readJsonArray(
              existing.service_areas_json,
            )
          : stringArray(
              body.serviceAreas,
            );

      /*
      |--------------------------------------------------------------------------
      | Remaining Fields
      |--------------------------------------------------------------------------
      */

      const nextLocation =
        body.location ===
        undefined
          ? existing.location
          : nullableText(
              body.location,
              200,
            );

      const nextCity =
        body.city ===
        undefined
          ? existing.city
          : nullableText(
              body.city,
              120,
            );

      const nextDistrict =
        body.district ===
        undefined
          ? existing.district
          : nullableText(
              body.district,
              120,
            );

      const nextState =
        body.state ===
        undefined
          ? existing.state
          : nullableText(
              body.state,
              120,
            );

      const nextCountry =
        body.country ===
        undefined
          ? existing.country
          : nullableText(
              body.country,
              100,
            );

      const nextAssociatedWith =
        body.associatedWith ===
        undefined
          ? existing.associated_with
          : nullableText(
              body.associatedWith,
              300,
            );

      const nextAbout =
        body.about ===
        undefined
          ? existing.about
          : nullableText(
              body.about,
              5000,
            );

      const nextAvailability =
        body.availability ===
        undefined
          ? existing.availability
          : nullableText(
              body.availability,
              300,
            );

      const nextName =
        body.name === undefined
          ? user.name
          : nullableText(
              body.name,
              150,
            ) ??
            user.name;

      const nextPhone =
        body.phone ===
        undefined
          ? user.phone ??
            null
          : nullableText(
              body.phone,
              30,
            );

      /*
      |--------------------------------------------------------------------------
      | Atomic Update
      |--------------------------------------------------------------------------
      */

      db.transaction(() => {
        const profileResult =
          db
            .prepare(
              `
              UPDATE pandit_profiles
              SET
                display_name = ?,
                title = ?,
                photo = ?,
                experience_years = ?,
                location = ?,
                city = ?,
                district = ?,
                state = ?,
                country = ?,
                languages_json = ?,
                specializations_json = ?,
                puja_types_json = ?,
                associated_with = ?,
                about = ?,
                availability = ?,
                service_areas_json = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
                AND user_id = ?
              `,
            )
            .run(
              displayName,
              titleResult.value,
              photoResult.value,
              experienceResult.value,
              nextLocation,
              nextCity,
              nextDistrict,
              nextState,
              nextCountry,
              JSON.stringify(
                languages,
              ),
              JSON.stringify(
                specializations,
              ),
              JSON.stringify(
                pujaTypes,
              ),
              nextAssociatedWith,
              nextAbout,
              nextAvailability,
              JSON.stringify(
                serviceAreas,
              ),
              existing.id,
              user.id,
            );

        if (
          profileResult.changes !==
          1
        ) {
          throw new Error(
            "Pandit profile update did not affect a record.",
          );
        }

        db.prepare(
          `
          UPDATE users
          SET
            name = ?,
            phone = ?,
            city = ?,
            state = ?,
            country = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
        ).run(
          nextName,
          nextPhone,
          nextCity,
          nextState,
          nextCountry,
          user.id,
        );

        writeAudit(
          req,
          user.id,
          "pandit.profile_updated",
          "pandit_profile",
          existing.id,
          publicProfile(
            existing,
          ),
          {
            displayName,
            title:
              titleResult.value,
            photo:
              photoResult.value,
            experienceYears:
              experienceResult.value,
            location:
              nextLocation,
            city:
              nextCity,
            district:
              nextDistrict,
            state:
              nextState,
            country:
              nextCountry,
            languages,
            specializations,
            pujaTypes,
            associatedWith:
              nextAssociatedWith,
            about: nextAbout,
            availability:
              nextAvailability,
            serviceAreas,
          },
        );
      })();

      const updated =
        getProfile(
          user.id,
        );

      if (!updated) {
        res.status(500).json({
          success: false,
          error:
            "Profile was updated but could not be loaded.",
        });

        return;
      }

      res.json({
        success: true,
        message:
          "Pandit profile updated successfully.",
        profile:
          publicProfile(
            updated,
          ),
      });
    } catch (error) {
      console.error(
        "Pandit profile PATCH error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update Pandit profile.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/pandit/services
|--------------------------------------------------------------------------
*/

router.get(
  "/services",
  (_req: Request, res: Response) => {
    try {
      const user =
        currentUser(res);

      const profile =
        getProfile(
          user.id,
        );

      if (!profile) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
          code:
            "PANDIT_PROFILE_NOT_FOUND",
        });

        return;
      }

      const services =
        getServices(
          profile.id,
        );

      res.json({
        success: true,
        services:
          services.map(
            publicService,
          ),
      });
    } catch (error) {
      console.error(
        "Pandit services GET error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load Pandit services.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/pandit/services
|--------------------------------------------------------------------------
*/

router.post(
  "/services",
  (req: Request, res: Response) => {
    try {
      const user =
        currentUser(res);

      const profile =
        getProfile(
          user.id,
        );

      if (!profile) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
          code:
            "PANDIT_PROFILE_NOT_FOUND",
        });

        return;
      }

      const body =
        bodyObject(req);

      /*
      |--------------------------------------------------------------------------
      | Name
      |--------------------------------------------------------------------------
      */

      const nameResult =
        requiredText(
          body.name,
          "Service name",
          180,
          2,
        );

      if (!nameResult.ok) {
        res.status(400).json({
          success: false,
          error:
            nameResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Description
      |--------------------------------------------------------------------------
      */

      const descriptionResult =
        optionalText(
          body.description,
          "Description",
          1000,
        );

      if (
        !descriptionResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            descriptionResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Price
      |--------------------------------------------------------------------------
      */

      const priceResult =
        parseMoney(
          body.priceAmount,
          "Price",
        );

      if (!priceResult.ok) {
        res.status(400).json({
          success: false,
          error:
            priceResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Currency
      |--------------------------------------------------------------------------
      */

      const currency =
        body.currency ===
          undefined ||
        body.currency ===
          null ||
        body.currency === ""
          ? "INR"
          : text(
              body.currency,
              3,
            ).toUpperCase();

      if (
        !/^[A-Z]{3}$/.test(
          currency,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Currency must be a valid 3-letter code such as INR, USD or AED.",
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Duration
      |--------------------------------------------------------------------------
      */

      const durationResult =
        parseNonNegativeInteger(
          body.durationMinutes,
          "Duration",
          {
            nullable: true,
            min: 1,
            max: 1440,
          },
        );

      if (
        !durationResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            durationResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Active
      |--------------------------------------------------------------------------
      */

      let isActive =
        true;

      if (
        body.isActive !==
        undefined
      ) {
        const activeResult =
          parseBoolean(
            body.isActive,
            "isActive",
          );

        if (
          !activeResult.ok
        ) {
          res.status(400).json({
            success: false,
            error:
              activeResult.error,
          });

          return;
        }

        isActive =
          activeResult.value;
      }

      /*
      |--------------------------------------------------------------------------
      | Insert
      |--------------------------------------------------------------------------
      */

      const result =
        db
          .prepare(
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
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `,
          )
          .run(
            profile.id,
            nameResult.value,
            descriptionResult.value,
            priceResult.value,
            currency,
            durationResult.value,
            isActive ? 1 : 0,
          );

      const serviceId =
        Number(
          result.lastInsertRowid,
        );

      const service =
        getService(
          user.id,
          serviceId,
        );

      if (!service) {
        res.status(500).json({
          success: false,
          error:
            "Service was created but could not be loaded.",
        });

        return;
      }

      writeAudit(
        req,
        user.id,
        "pandit.service_created",
        "pandit_service_offering",
        serviceId,
        null,
        publicService(
          service,
        ),
      );

      res.status(201).json({
        success: true,
        message:
          "Puja service created successfully.",
        service:
          publicService(
            service,
          ),
      });
    } catch (error) {
      console.error(
        "Pandit service POST error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to create Puja service.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/pandit/services/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/services/:id",
  (req: Request, res: Response) => {
    try {
      const serviceId =
        parseServiceId(
          req,
          res,
        );

      if (
        serviceId ===
        null
      ) {
        return;
      }

      const user =
        currentUser(res);

      const service =
        getService(
          user.id,
          serviceId,
        );

      if (!service) {
        res.status(404).json({
          success: false,
          error:
            "Puja service not found.",
        });

        return;
      }

      res.json({
        success: true,
        service:
          publicService(
            service,
          ),
      });
    } catch (error) {
      console.error(
        "Pandit service GET error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load Puja service.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/pandit/services/:id
|--------------------------------------------------------------------------
*/

router.patch(
  "/services/:id",
  (req: Request, res: Response) => {
    try {
      const serviceId =
        parseServiceId(
          req,
          res,
        );

      if (
        serviceId ===
        null
      ) {
        return;
      }

      const user =
        currentUser(res);

      const existing =
        getService(
          user.id,
          serviceId,
        );

      if (!existing) {
        res.status(404).json({
          success: false,
          error:
            "Puja service not found.",
        });

        return;
      }

      const body =
        bodyObject(req);

      /*
      |--------------------------------------------------------------------------
      | Name
      |--------------------------------------------------------------------------
      */

      const name =
        body.name ===
        undefined
          ? existing.name
          : text(
              body.name,
              180,
            );

      if (
        name.length < 2
      ) {
        res.status(400).json({
          success: false,
          error:
            "Service name must contain at least 2 characters.",
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Description
      |--------------------------------------------------------------------------
      */

      const description =
        body.description ===
        undefined
          ? existing.description
          : nullableText(
              body.description,
              1000,
            );

      /*
      |--------------------------------------------------------------------------
      | Price
      |--------------------------------------------------------------------------
      */

      const priceResult =
        body.priceAmount ===
        undefined
          ? {
              ok: true as const,
              value:
                existing.price_amount,
            }
          : parseMoney(
              body.priceAmount,
              "Price",
            );

      if (
        !priceResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            priceResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Currency
      |--------------------------------------------------------------------------
      */

      const currency =
        body.currency ===
        undefined
          ? existing.currency
          : text(
              body.currency,
              3,
            ).toUpperCase();

      if (
        !/^[A-Z]{3}$/.test(
          currency,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Currency must be a valid 3-letter code such as INR, USD or AED.",
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Duration
      |--------------------------------------------------------------------------
      */

      const durationResult =
        body.durationMinutes ===
        undefined
          ? {
              ok: true as const,
              value:
                existing.duration_minutes,
            }
          : parseNonNegativeInteger(
              body.durationMinutes,
              "Duration",
              {
                nullable: true,
                min: 1,
                max: 1440,
              },
            );

      if (
        !durationResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            durationResult.error,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Active
      |--------------------------------------------------------------------------
      */

      let isActive =
        existing.is_active ===
        1;

      if (
        body.isActive !==
        undefined
      ) {
        const activeResult =
          parseBoolean(
            body.isActive,
            "isActive",
          );

        if (
          !activeResult.ok
        ) {
          res.status(400).json({
            success: false,
            error:
              activeResult.error,
          });

          return;
        }

        isActive =
          activeResult.value;
      }

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      const result =
        db
          .prepare(
            `
            UPDATE pandit_service_offerings
            SET
              name = ?,
              description = ?,
              price_amount = ?,
              currency = ?,
              duration_minutes = ?,
              is_active = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND pandit_id = ?
            `,
          )
          .run(
            name,
            description,
            priceResult.value,
            currency,
            durationResult.value,
            isActive ? 1 : 0,
            serviceId,
            existing.pandit_id,
          );

      if (
        result.changes !==
        1
      ) {
        res.status(409).json({
          success: false,
          error:
            "Puja service could not be updated.",
        });

        return;
      }

      const updated =
        getService(
          user.id,
          serviceId,
        );

      if (!updated) {
        res.status(500).json({
          success: false,
          error:
            "Service was updated but could not be loaded.",
        });

        return;
      }

      writeAudit(
        req,
        user.id,
        "pandit.service_updated",
        "pandit_service_offering",
        serviceId,
        publicService(
          existing,
        ),
        publicService(
          updated,
        ),
      );

      res.json({
        success: true,
        message:
          "Puja service updated successfully.",
        service:
          publicService(
            updated,
          ),
      });
    } catch (error) {
      console.error(
        "Pandit service PATCH error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update Puja service.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| DELETE /api/pandit/services/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/services/:id",
  (req: Request, res: Response) => {
    try {
      const serviceId =
        parseServiceId(
          req,
          res,
        );

      if (
        serviceId ===
        null
      ) {
        return;
      }

      const user =
        currentUser(res);

      const existing =
        getService(
          user.id,
          serviceId,
        );

      if (!existing) {
        res.status(404).json({
          success: false,
          error:
            "Puja service not found.",
        });

        return;
      }

      const result =
        db
          .prepare(
            `
            DELETE FROM pandit_service_offerings
            WHERE id = ?
              AND pandit_id = ?
            `,
          )
          .run(
            serviceId,
            existing.pandit_id,
          );

      if (
        result.changes !==
        1
      ) {
        res.status(409).json({
          success: false,
          error:
            "Puja service could not be deleted.",
        });

        return;
      }

      writeAudit(
        req,
        user.id,
        "pandit.service_deleted",
        "pandit_service_offering",
        serviceId,
        publicService(
          existing,
        ),
        null,
      );

      res.json({
        success: true,
        message:
          "Puja service deleted successfully.",
        deletedServiceId:
          serviceId,
      });
    } catch (error) {
      console.error(
        "Pandit service DELETE error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message.toLowerCase()
          : "";

      if (
        message.includes(
          "foreign key",
        ) ||
        message.includes(
          "constraint",
        )
      ) {
        res.status(409).json({
          success: false,
          error:
            "This Puja service cannot be deleted because it is already linked to another record. Deactivate it instead.",
        });

        return;
      }

      res.status(500).json({
        success: false,
        error:
          "Unable to delete Puja service.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/pandit/listing
|--------------------------------------------------------------------------
|
| Listing status is intentionally isolated from profile updates.
|
| Activation:
|   - Requires Admin-approved profile.
|
| Deactivation:
|   - Allowed at any time.
|--------------------------------------------------------------------------
*/

router.patch(
  "/listing",
  (req: Request, res: Response) => {
    try {
      const user =
        currentUser(res);

      const profile =
        getProfile(
          user.id,
        );

      if (!profile) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
          code:
            "PANDIT_PROFILE_NOT_FOUND",
        });

        return;
      }

      const body =
        bodyObject(req);

      if (
        body.listingActive ===
        undefined
      ) {
        res.status(400).json({
          success: false,
          error:
            "listingActive is required.",
        });

        return;
      }

      const listingResult =
        parseBoolean(
          body.listingActive,
          "listingActive",
        );

      if (
        !listingResult.ok
      ) {
        res.status(400).json({
          success: false,
          error:
            listingResult.error,
        });

        return;
      }

      const listingActive =
        listingResult.value;

      /*
      |--------------------------------------------------------------------------
      | Approval Gate
      |--------------------------------------------------------------------------
      */

      if (
        listingActive &&
        profile.profile_status !==
          "approved"
      ) {
        res.status(409).json({
          success: false,
          error:
            "Listing cannot be activated until your Pandit profile is approved by Admin.",
          code:
            "PANDIT_PROFILE_NOT_APPROVED",
        });

        return;
      }

      const previousValue =
        Boolean(
          profile.listing_active,
        );

      const result =
        db
          .prepare(
            `
            UPDATE pandit_profiles
            SET
              listing_active = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND user_id = ?
            `,
          )
          .run(
            listingActive ? 1 : 0,
            profile.id,
            user.id,
          );

      if (
        result.changes !==
        1
      ) {
        res.status(409).json({
          success: false,
          error:
            "Pandit listing status could not be updated.",
        });

        return;
      }

      writeAudit(
        req,
        user.id,
        listingActive
          ? "pandit.listing_activated"
          : "pandit.listing_deactivated",
        "pandit_profile",
        profile.id,
        {
          listingActive:
            previousValue,
        },
        {
          listingActive,
        },
      );

      res.json({
        success: true,
        message:
          listingActive
            ? "Pandit listing activated successfully."
            : "Pandit listing deactivated successfully.",
        listingActive,
      });
    } catch (error) {
      console.error(
        "Pandit listing PATCH error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update Pandit listing status.",
      });
    }
  },
);

export default router;