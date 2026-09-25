/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Router,
  type Request,
  type Response,
} from "express";

import {
  randomBytes,
  scrypt as scryptCallback,
} from "node:crypto";

import {
  db,
} from "../db/database.ts";

import {
  requireAuth,
  requireRole,
  type AuthenticatedUser,
  type UserRole,
} from "./auth.ts";

const router = Router();

/*
|--------------------------------------------------------------------------
| Admin Router Protection
|--------------------------------------------------------------------------
|
| Every route in this file requires:
|
| 1. Valid authenticated session
| 2. super_admin role
|
|--------------------------------------------------------------------------
*/

router.use(
  requireAuth,
  requireRole("super_admin"),
);

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type UserListRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
  avatar: string | null;
  role: UserRole;
  created_at: string | null;
  updated_at: string | null;
  last_login_at: string | null;
};

type PanditAdminRow = {
  id: number;
  user_id: number;
  slug: string;
  display_name: string;
  title: string | null;
  photo: string | null;
  experience_years: number | null;
  location: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  profile_status: string;
  verification_status: string;
  identity_verified: number | null;
  profile_verified: number | null;
  authorized_contact: number | null;
  featured: number | null;
  listing_active: number | null;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_status: string;
};

type TempleManagerAdminRow = {
  id: number;
  user_id: number;
  designation: string | null;
  organization_name: string | null;
  verification_status: string;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_status: string;
  city: string | null;
  state: string | null;
};

type PaginatedResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AuditActor = {
  id: number;
  role: UserRole;
};

/*
|--------------------------------------------------------------------------
| Generic Helpers
|--------------------------------------------------------------------------
*/

function normalizeText(
  value: unknown,
  maxLength = 500,
): string {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

function normalizeNullableText(
  value: unknown,
  maxLength = 500,
): string | null {
  const valueText =
    normalizeText(
      value,
      maxLength,
    );

  return valueText || null;
}

function normalizeEmail(
  value: unknown,
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isValidEmail(
  email: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function normalizePhone(
  value: unknown,
): string | null {
  const phone =
    normalizeText(
      value,
      30,
    );

  return phone || null;
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

function parsePositiveInteger(
  value: unknown,
  fallback: number,
  max = 100,
): number {
  const parsed =
    Number(
      value,
    );

  if (
    !Number.isInteger(
      parsed,
    ) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return Math.min(
    parsed,
    max,
  );
}

function parsePage(
  value: unknown,
): number {
  return parsePositiveInteger(
    value,
    1,
    Number.MAX_SAFE_INTEGER,
  );
}

function parseLimit(
  value: unknown,
  fallback = 25,
): number {
  return parsePositiveInteger(
    value,
    fallback,
    100,
  );
}

function parseUserId(
  value: unknown,
): number | null {
  const id =
    Number(
      value,
    );

  if (
    !Number.isSafeInteger(
      id,
    ) ||
    id <= 0
  ) {
    return null;
  }

  return id;
}

function parseBoolean(
  value: unknown,
): boolean | null {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  const normalized =
    normalizeText(
      value,
      20,
    ).toLowerCase();

  if (
    normalized ===
      "true" ||
    normalized ===
      "1" ||
    normalized ===
      "yes"
  ) {
    return true;
  }

  if (
    normalized ===
      "false" ||
    normalized ===
      "0" ||
    normalized ===
      "no"
  ) {
    return false;
  }

  return null;
}

function parseOptionalNonNegativeInteger(
  value: unknown,
): number | null {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value ===
      ""
  ) {
    return null;
  }

  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed < 0
  ) {
    return null;
  }

  return Math.floor(
    parsed,
  );
}

/*
|--------------------------------------------------------------------------
| SQLite Schema Helpers
|--------------------------------------------------------------------------
*/

function tableExists(
  tableName: string,
): boolean {
  const row =
    db
      .prepare(
        `
        SELECT 1 AS found
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
        LIMIT 1
        `,
      )
      .get(
        tableName,
      ) as
      | {
          found: number;
        }
      | undefined;

  return Boolean(
    row?.found,
  );
}

function getTableColumns(
  tableName: string,
): string[] {
  if (
    !tableExists(
      tableName,
    )
  ) {
    return [];
  }

  const rows =
    db
      .prepare(
        `
        PRAGMA table_info(${quoteIdentifier(
          tableName,
        )})
        `,
      )
      .all() as Array<{
      name: string;
    }>;

  return rows.map(
    (row) =>
      row.name,
  );
}

function hasColumn(
  tableName: string,
  columnName: string,
): boolean {
  return getTableColumns(
    tableName,
  ).includes(
    columnName,
  );
}

function firstExistingColumn(
  tableName: string,
  candidates: string[],
): string | null {
  const columns =
    getTableColumns(
      tableName,
    );

  for (
    const candidate of candidates
  ) {
    if (
      columns.includes(
        candidate,
      )
    ) {
      return candidate;
    }
  }

  return null;
}

function quoteIdentifier(
  identifier: string,
): string {
  return `"${identifier.replace(
    /"/g,
    '""',
  )}"`;
}

/*
|--------------------------------------------------------------------------
| Audit Logging
|--------------------------------------------------------------------------
*/

function getAdminActor(
  res: Response,
): AuditActor {
  const user =
    res.locals.user as
      | AuthenticatedUser
      | undefined;

  if (!user) {
    throw new Error(
      "Authenticated admin user is missing.",
    );
  }

  return {
    id: user.id,
    role: user.role,
  };
}

function getClientIp(
  req: Request,
): string | null {
  return req.ip || null;
}

function getUserAgent(
  req: Request,
): string | null {
  return normalizeNullableText(
    req.get(
      "user-agent",
    ),
    500,
  );
}

function createAuditLog(
  params: {
    userId: number;
    action: string;
    entityType: string;
    entityId?: number | null;
    oldData?: unknown;
    newData?: unknown;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
): void {
  if (
    !tableExists(
      "audit_logs",
    )
  ) {
    return;
  }

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
    params.userId,
    params.action,
    params.entityType,
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
| Password Hashing
|--------------------------------------------------------------------------
|
| Same implementation as auth.ts.
|--------------------------------------------------------------------------
*/

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
): Promise<Buffer> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
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

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

function buildPagination(
  page: number,
  limit: number,
  total: number,
): PaginatedResponse {
  return {
    page,
    limit,
    total,
    totalPages:
      Math.ceil(
        total / limit,
      ),
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/admin/dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  (
    req: Request,
    res: Response,
  ) => {
    void req;

    try {
      const stats = {
        users: 0,
        activeUsers: 0,
        pendingUsers: 0,
        visitors: 0,
        pandits: 0,
        pendingPandits: 0,
        templeManagers: 0,
        pendingTempleManagers: 0,
        salesUsers: 0,
        superAdmins: 0,
        temples: 0,
        leads: 0,
        openLeads: 0,
        subscriptions: 0,
        activeSubscriptions: 0,
        plans: 0,
        auditLogs: 0,
      };

      /*
       * User statistics.
       */
      const userStats =
        db
          .prepare(
            `
            SELECT
              COUNT(*) AS total,
              SUM(
                CASE
                  WHEN status = 'active'
                  THEN 1
                  ELSE 0
                END
              ) AS active,
              SUM(
                CASE
                  WHEN status = 'pending'
                  THEN 1
                  ELSE 0
                END
              ) AS pending
            FROM users
            `,
          )
          .get() as
        | {
            total: number;
            active: number | null;
            pending: number | null;
          }
        | undefined;

      stats.users =
        Number(
          userStats?.total ??
            0,
        );

      stats.activeUsers =
        Number(
          userStats?.active ??
            0,
        );

      stats.pendingUsers =
        Number(
          userStats?.pending ??
            0,
        );

      /*
       * Role counts.
       */
      const roleRows =
        db
          .prepare(
            `
            SELECT
              r.code AS role,
              COUNT(u.id) AS count
            FROM roles r
            LEFT JOIN users u
              ON u.role_id = r.id
            GROUP BY
              r.id,
              r.code
            `,
          )
          .all() as Array<{
          role: UserRole;
          count: number;
        }>;

      for (
        const row of roleRows
      ) {
        const count =
          Number(
            row.count,
          );

        switch (row.role) {
          case "visitor":
            stats.visitors =
              count;
            break;

          case "pandit":
            stats.pandits =
              count;
            break;

          case "temple_manager":
            stats.templeManagers =
              count;
            break;

          case "sales":
            stats.salesUsers =
              count;
            break;

          case "super_admin":
            stats.superAdmins =
              count;
            break;
        }
      }

      /*
       * Pending Pandits.
       */
      if (
        tableExists(
          "pandit_profiles",
        )
      ) {
        const row =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM pandit_profiles
              WHERE profile_status = 'pending'
              `,
            )
            .get() as
            | {
                count: number;
              }
            | undefined;

        stats.pendingPandits =
          Number(
            row?.count ??
              0,
          );
      }

      /*
       * Pending Temple Managers.
       */
      if (
        tableExists(
          "temple_manager_profiles",
        )
      ) {
        const row =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM temple_manager_profiles tmp
              INNER JOIN users u
                ON u.id = tmp.user_id
              INNER JOIN roles r
                ON r.id = u.role_id
              WHERE r.code = 'temple_manager'
                AND u.status = 'pending'
              `,
            )
            .get() as
            | {
                count: number;
              }
            | undefined;

        stats.pendingTempleManagers =
          Number(
            row?.count ??
              0,
          );
      }

      /*
       * Temples.
       */
      if (
        tableExists(
          "temples",
        )
      ) {
        const row =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM temples
              `,
            )
            .get() as
            | {
                count: number;
              }
            | undefined;

        stats.temples =
          Number(
            row?.count ??
              0,
          );
      }

      /*
       * Leads.
       */
      if (
        tableExists(
          "leads",
        )
      ) {
        const totalRow =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM leads
              `,
            )
            .get() as
            | {
                count: number;
              }
            | undefined;

        stats.leads =
          Number(
            totalRow?.count ??
              0,
          );

        if (
          hasColumn(
            "leads",
            "status",
          )
        ) {
          const openRow =
            db
              .prepare(
                `
                SELECT COUNT(*) AS count
                FROM leads
                WHERE status IN (
                  'new',
                  'pending',
                  'open',
                  'assigned',
                  'in_progress',
                  'follow_up'
                )
                `,
              )
              .get() as
              | {
                  count: number;
                }
              | undefined;

          stats.openLeads =
            Number(
              openRow?.count ??
                0,
            );
        }
      }

      /*
       * Subscription plans.
       */
      if (
        tableExists(
          "subscription_plans",
        )
      ) {
        const row =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM subscription_plans
              `,
            )
            .get() as
            | {
                count: number;
              }
            | undefined;

        stats.plans =
          Number(
            row?.count ??
              0,
          );
      }

      /*
       * Subscriptions.
       */
      if (
        tableExists(
          "pandit_subscriptions",
        )
      ) {
        const row =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM pandit_subscriptions
              `,
            )
            .get() as
            | {
                count: number;
              }
            | undefined;

        stats.subscriptions =
          Number(
            row?.count ??
              0,
          );

        if (
          hasColumn(
            "pandit_subscriptions",
            "status",
          )
        ) {
          const activeRow =
            db
              .prepare(
                `
                SELECT COUNT(*) AS count
                FROM pandit_subscriptions
                WHERE status = 'active'
                `,
              )
              .get() as
              | {
                  count: number;
                }
              | undefined;

          stats.activeSubscriptions =
            Number(
              activeRow?.count ??
                0,
            );
        }
      }

      /*
       * Audit logs.
       */
      if (
        tableExists(
          "audit_logs",
        )
      ) {
        const row =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM audit_logs
              `,
            )
            .get() as
            | {
                count: number;
              }
            | undefined;

        stats.auditLogs =
          Number(
            row?.count ??
              0,
          );
      }

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load admin dashboard.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/users
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const page =
        parsePage(
          req.query.page,
        );

      const limit =
        parseLimit(
          req.query.limit,
          25,
        );

      const offset =
        (page - 1) *
        limit;

      const search =
        normalizeText(
          req.query.search,
          150,
        );

      const requestedRole =
        normalizeText(
          req.query.role,
          50,
        ).toLowerCase();

      const requestedStatus =
        normalizeText(
          req.query.status,
          50,
        ).toLowerCase();

      const whereParts: string[] =
        [];

      const values: unknown[] =
        [];

      if (search) {
        whereParts.push(
          `
          (
            u.name LIKE ?
            OR u.email LIKE ?
            OR COALESCE(u.phone, '') LIKE ?
            OR COALESCE(u.city, '') LIKE ?
          )
          `,
        );

        const pattern =
          `%${search}%`;

        values.push(
          pattern,
          pattern,
          pattern,
          pattern,
        );
      }

      if (
        requestedRole
      ) {
        whereParts.push(
          "r.code = ?",
        );

        values.push(
          requestedRole,
        );
      }

      if (
        requestedStatus
      ) {
        whereParts.push(
          "u.status = ?",
        );

        values.push(
          requestedStatus,
        );
      }

      const whereSql =
        whereParts.length
          ? `WHERE ${whereParts.join(
              " AND ",
            )}`
          : "";

      const totalRow =
        db
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM users u
            INNER JOIN roles r
              ON r.id = u.role_id
            ${whereSql}
            `,
          )
          .get(
            ...values,
          ) as
          | {
              count: number;
            }
          | undefined;

      const total =
        Number(
          totalRow?.count ??
            0,
        );

      const rows =
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
              u.status,
              u.avatar,
              r.code AS role,
              u.created_at,
              u.updated_at,
              u.last_login_at
            FROM users u
            INNER JOIN roles r
              ON r.id = u.role_id
            ${whereSql}
            ORDER BY
              u.created_at DESC,
              u.id DESC
            LIMIT ?
            OFFSET ?
            `,
          )
          .all(
            ...values,
            limit,
            offset,
          ) as UserListRow[];

      res.json({
        success: true,
        users:
          rows.map(
            (row) => ({
              id: row.id,
              name: row.name,
              email: row.email,
              phone: row.phone,
              city: row.city,
              state: row.state,
              country: row.country,
              status: row.status,
              avatar: row.avatar,
              role: row.role,
              createdAt:
                row.created_at,
              updatedAt:
                row.updated_at,
              lastLoginAt:
                row.last_login_at,
            }),
          ),
        pagination:
          buildPagination(
            page,
            limit,
            total,
          ),
      });
    } catch (error) {
      console.error(
        "Admin users error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load users.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/users/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/users/:id",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const userId =
        parseUserId(
          req.params.id,
        );

      if (!userId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid user ID.",
        });

        return;
      }

      const user =
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
              u.status,
              u.avatar,
              u.email_verified_at,
              u.created_at,
              u.updated_at,
              u.last_login_at,
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
          | (UserListRow & {
              email_verified_at:
                | string
                | null;
            })
          | undefined;

      if (!user) {
        res.status(404).json({
          success: false,
          error:
            "User not found.",
        });

        return;
      }

      let roleProfile:
        | unknown
        | null = null;

      if (
        user.role ===
        "visitor" &&
        tableExists(
          "visitor_profiles",
        )
      ) {
        roleProfile =
          db
            .prepare(
              `
              SELECT *
              FROM visitor_profiles
              WHERE user_id = ?
              LIMIT 1
              `,
            )
            .get(
              userId,
            ) ?? null;
      }

      if (
        user.role ===
        "pandit" &&
        tableExists(
          "pandit_profiles",
        )
      ) {
        roleProfile =
          db
            .prepare(
              `
              SELECT *
              FROM pandit_profiles
              WHERE user_id = ?
              LIMIT 1
              `,
            )
            .get(
              userId,
            ) ?? null;
      }

      if (
        user.role ===
        "temple_manager" &&
        tableExists(
          "temple_manager_profiles",
        )
      ) {
        roleProfile =
          db
            .prepare(
              `
              SELECT *
              FROM temple_manager_profiles
              WHERE user_id = ?
              LIMIT 1
              `,
            )
            .get(
              userId,
            ) ?? null;
      }

      res.json({
        success: true,
        user: {
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
          emailVerified:
            Boolean(
              user.email_verified_at,
            ),
          createdAt:
            user.created_at,
          updatedAt:
            user.updated_at,
          lastLoginAt:
            user.last_login_at,
          roleProfile,
        },
      });
    } catch (error) {
      console.error(
        "Admin user detail error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load user.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/users/:id/status
|--------------------------------------------------------------------------
*/

router.patch(
  "/users/:id/status",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      const targetId =
        parseUserId(
          req.params.id,
        );

      if (!targetId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid user ID.",
        });

        return;
      }

      const status =
        normalizeText(
          req.body?.status,
          30,
        ).toLowerCase();

      const allowedStatuses =
        new Set([
          "pending",
          "active",
          "suspended",
          "rejected",
          "blocked",
        ]);

      if (
        !allowedStatuses.has(
          status,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Invalid user status.",
        });

        return;
      }

      if (
        targetId ===
        actor.id
      ) {
        res.status(403).json({
          success: false,
          error:
            "You cannot change your own Super Admin status.",
        });

        return;
      }

      const target =
        db
          .prepare(
            `
            SELECT
              u.id,
              u.name,
              u.email,
              u.status,
              r.code AS role
            FROM users u
            INNER JOIN roles r
              ON r.id = u.role_id
            WHERE u.id = ?
            LIMIT 1
            `,
          )
          .get(
            targetId,
          ) as
          | {
              id: number;
              name: string;
              email: string;
              status: string;
              role: UserRole;
            }
          | undefined;

      if (!target) {
        res.status(404).json({
          success: false,
          error:
            "User not found.",
        });

        return;
      }

      /*
       * Never modify Super Admin accounts from
       * this general status endpoint.
       */
      if (
        target.role ===
        "super_admin"
      ) {
        res.status(403).json({
          success: false,
          error:
            "Super Admin status must not be modified from the general user management endpoint.",
        });

        return;
      }

      db.prepare(
        `
        UPDATE users
        SET
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
      ).run(
        status,
        targetId,
      );

      /*
       * Sessions must be cleared when account becomes
       * non-active.
       */
      if (
        status !==
        "active"
      ) {
        db.prepare(
          `
          DELETE FROM sessions
          WHERE user_id = ?
          `,
        ).run(
          targetId,
        );
      }

      createAuditLog({
        userId:
          actor.id,
        action:
          "admin.user_status_updated",
        entityType:
          "user",
        entityId:
          targetId,
        oldData: {
          status:
            target.status,
          role:
            target.role,
        },
        newData: {
          status,
          role:
            target.role,
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

      res.json({
        success: true,
        message:
          "User status updated successfully.",
        user: {
          id: target.id,
          status,
        },
      });
    } catch (error) {
      console.error(
        "Admin user status error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update user status.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/admin/sales
|--------------------------------------------------------------------------
|
| Creates internal Sales users.
|
| Public Sales registration remains disabled.
|--------------------------------------------------------------------------
*/

router.post(
  "/sales",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
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

      if (
        name.length <
        2
      ) {
        res.status(400).json({
          success: false,
          error:
            "Name must contain at least 2 characters.",
        });

        return;
      }

      if (
        !isValidEmail(
          email,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Please provide a valid email address.",
        });

        return;
      }

      if (
        !isValidPhone(
          phone,
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Please provide a valid phone number.",
        });

        return;
      }

      if (
        typeof password !==
          "string" ||
        password.length <
          8 ||
        password.length >
          128
      ) {
        res.status(400).json({
          success: false,
          error:
            "Password must be between 8 and 128 characters.",
        });

        return;
      }

      const existing =
        db
          .prepare(
            `
            SELECT
              u.id,
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
          | {
              id: number;
              role: UserRole;
            }
          | undefined;

      if (existing) {
        res.status(409).json({
          success: false,
          error:
            `This email is already registered with role "${existing.role}".`,
        });

        return;
      }

      const salesRole =
        db
          .prepare(
            `
            SELECT
              id,
              code
            FROM roles
            WHERE code = 'sales'
            LIMIT 1
            `,
          )
          .get() as
          | {
              id: number;
              code: string;
            }
          | undefined;

      if (!salesRole) {
        res.status(500).json({
          success: false,
          error:
            'Role "sales" is not configured.',
        });

        return;
      }

      const passwordHash =
        await hashPassword(
          password,
        );

      const result =
        db.transaction(
          () => {
            const inserted =
              db
                .prepare(
                  `
                  INSERT INTO users (
                    role_id,
                    name,
                    email,
                    phone,
                    password_hash,
                    email_verified_at,
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
                    CURRENT_TIMESTAMP,
                    'active',
                    ?,
                    ?,
                    ?,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                  )
                  `,
                )
                .run(
                  salesRole.id,
                  name,
                  email,
                  phone,
                  passwordHash,
                  city,
                  state,
                  country,
                );

            const userId =
              Number(
                inserted.lastInsertRowid,
              );

            createAuditLog({
              userId:
                actor.id,
              action:
                "admin.sales_created",
              entityType:
                "user",
              entityId:
                userId,
              newData: {
                role:
                  "sales",
                name,
                email,
                status:
                  "active",
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

            return userId;
          },
        )();

      res.status(201).json({
        success: true,
        message:
          "Sales account created successfully.",
        user: {
          id: result,
          name,
          email,
          phone,
          city,
          state,
          country,
          role: "sales",
          status: "active",
        },
      });
    } catch (error) {
      console.error(
        "Admin sales creation error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to create Sales account.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/pandits
|--------------------------------------------------------------------------
*/

router.get(
  "/pandits",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const page =
        parsePage(
          req.query.page,
        );

      const limit =
        parseLimit(
          req.query.limit,
          25,
        );

      const offset =
        (page - 1) *
        limit;

      const profileStatus =
        normalizeText(
          req.query.status,
          50,
        ).toLowerCase();

      const search =
        normalizeText(
          req.query.search,
          150,
        );

      const whereParts: string[] =
        [];

      const values: unknown[] =
        [];

      if (
        profileStatus
      ) {
        whereParts.push(
          "pp.profile_status = ?",
        );

        values.push(
          profileStatus,
        );
      }

      if (search) {
        whereParts.push(
          `
          (
            pp.display_name LIKE ?
            OR u.email LIKE ?
            OR COALESCE(u.phone, '') LIKE ?
            OR COALESCE(pp.city, '') LIKE ?
            OR COALESCE(pp.state, '') LIKE ?
          )
          `,
        );

        const pattern =
          `%${search}%`;

        values.push(
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
        );
      }

      const whereSql =
        whereParts.length
          ? `WHERE ${whereParts.join(
              " AND ",
            )}`
          : "";

      const totalRow =
        db
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM pandit_profiles pp
            INNER JOIN users u
              ON u.id = pp.user_id
            ${whereSql}
            `,
          )
          .get(
            ...values,
          ) as
          | {
              count: number;
            }
          | undefined;

      const total =
        Number(
          totalRow?.count ??
            0,
        );

      const rows =
        db
          .prepare(
            `
            SELECT
              pp.id,
              pp.user_id,
              pp.slug,
              pp.display_name,
              pp.title,
              pp.photo,
              pp.experience_years,
              pp.location,
              pp.city,
              pp.district,
              pp.state,
              pp.country,
              pp.profile_status,
              pp.verification_status,
              pp.identity_verified,
              pp.profile_verified,
              pp.authorized_contact,
              pp.featured,
              pp.listing_active,
              u.name AS user_name,
              u.email AS user_email,
              u.phone AS user_phone,
              u.status AS user_status
            FROM pandit_profiles pp
            INNER JOIN users u
              ON u.id = pp.user_id
            ${whereSql}
            ORDER BY
              CASE
                WHEN pp.profile_status = 'pending'
                THEN 0
                ELSE 1
              END,
              pp.created_at DESC,
              pp.id DESC
            LIMIT ?
            OFFSET ?
            `,
          )
          .all(
            ...values,
            limit,
            offset,
          ) as PanditAdminRow[];

      res.json({
        success: true,
        pandits:
          rows.map(
            (row) => ({
              id: row.id,
              userId:
                row.user_id,
              slug:
                row.slug,
              displayName:
                row.display_name,
              title:
                row.title,
              photo:
                row.photo,
              experienceYears:
                row.experience_years ??
                0,
              location:
                row.location,
              city:
                row.city,
              district:
                row.district,
              state:
                row.state,
              country:
                row.country,
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
                Boolean(
                  row.featured,
                ),
              listingActive:
                Boolean(
                  row.listing_active,
                ),
              user: {
                id:
                  row.user_id,
                name:
                  row.user_name,
                email:
                  row.user_email,
                phone:
                  row.user_phone,
                status:
                  row.user_status,
              },
            }),
          ),
        pagination:
          buildPagination(
            page,
            limit,
            total,
          ),
      });
    } catch (error) {
      console.error(
        "Admin Pandits error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load Pandits.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/admin/pandits/:id/approve
|--------------------------------------------------------------------------
*/

router.post(
  "/pandits/:id/approve",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      const panditId =
        parseUserId(
          req.params.id,
        );

      if (!panditId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid Pandit user ID.",
        });

        return;
      }

      const pandit =
        db
          .prepare(
            `
            SELECT
              pp.id,
              pp.user_id,
              pp.slug,
              pp.profile_status,
              pp.verification_status,
              u.name,
              u.email,
              u.status
            FROM pandit_profiles pp
            INNER JOIN users u
              ON u.id = pp.user_id
            INNER JOIN roles r
              ON r.id = u.role_id
            WHERE pp.user_id = ?
              AND r.code = 'pandit'
            LIMIT 1
            `,
          )
          .get(
            panditId,
          ) as
          | {
              id: number;
              user_id: number;
              slug: string;
              profile_status: string;
              verification_status: string;
              name: string;
              email: string;
              status: string;
            }
          | undefined;

      if (!pandit) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
        });

        return;
      }

      const transaction =
        db.transaction(
          () => {
            /*
             * Account becomes active after approval.
             */
            db.prepare(
              `
              UPDATE users
              SET
                status = 'active',
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
              `,
            ).run(
              panditId,
            );

            /*
             * Profile becomes approved.
             *
             * Listing stays inactive until a paid subscription
             * is activated.
             */
            db.prepare(
              `
              UPDATE pandit_profiles
              SET
                profile_status = 'approved',
                profile_verified = 1,
                listing_active = 0,
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?
              `,
            ).run(
              panditId,
            );

            createAuditLog({
              userId:
                actor.id,
              action:
                "admin.pandit_approved",
              entityType:
                "pandit",
              entityId:
                pandit.id,
              oldData: {
                userStatus:
                  pandit.status,
                profileStatus:
                  pandit.profile_status,
                verificationStatus:
                  pandit.verification_status,
              },
              newData: {
                userStatus:
                  "active",
                profileStatus:
                  "approved",
                profileVerified:
                  true,
                listingActive:
                  false,
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
          },
        );

      transaction();

      res.json({
        success: true,
        message:
          "Pandit approved successfully. Listing remains inactive until an eligible subscription is active.",
        pandit: {
          userId:
            panditId,
          profileStatus:
            "approved",
          listingActive:
            false,
        },
      });
    } catch (error) {
      console.error(
        "Pandit approval error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to approve Pandit.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/admin/pandits/:id/reject
|--------------------------------------------------------------------------
*/

router.post(
  "/pandits/:id/reject",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      const panditId =
        parseUserId(
          req.params.id,
        );

      if (!panditId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid Pandit user ID.",
        });

        return;
      }

      const reason =
        normalizeNullableText(
          req.body?.reason,
          1000,
        );

      const pandit =
        db
          .prepare(
            `
            SELECT
              pp.id,
              pp.profile_status,
              pp.verification_status,
              u.status
            FROM pandit_profiles pp
            INNER JOIN users u
              ON u.id = pp.user_id
            INNER JOIN roles r
              ON r.id = u.role_id
            WHERE pp.user_id = ?
              AND r.code = 'pandit'
            LIMIT 1
            `,
          )
          .get(
            panditId,
          ) as
          | {
              id: number;
              profile_status: string;
              verification_status: string;
              status: string;
            }
          | undefined;

      if (!pandit) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
        });

        return;
      }

      const transaction =
        db.transaction(
          () => {
            db.prepare(
              `
              UPDATE users
              SET
                status = 'rejected',
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
              `,
            ).run(
              panditId,
            );

            db.prepare(
              `
              UPDATE pandit_profiles
              SET
                profile_status = 'rejected',
                listing_active = 0,
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?
              `,
            ).run(
              panditId,
            );

            db.prepare(
              `
              DELETE FROM sessions
              WHERE user_id = ?
              `,
            ).run(
              panditId,
            );

            createAuditLog({
              userId:
                actor.id,
              action:
                "admin.pandit_rejected",
              entityType:
                "pandit",
              entityId:
                pandit.id,
              oldData: {
                userStatus:
                  pandit.status,
                profileStatus:
                  pandit.profile_status,
                verificationStatus:
                  pandit.verification_status,
              },
              newData: {
                userStatus:
                  "rejected",
                profileStatus:
                  "rejected",
                listingActive:
                  false,
                reason,
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
          },
        );

      transaction();

      res.json({
        success: true,
        message:
          "Pandit application rejected.",
      });
    } catch (error) {
      console.error(
        "Pandit rejection error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to reject Pandit.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/temple-managers
|--------------------------------------------------------------------------
*/

router.get(
  "/temple-managers",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const page =
        parsePage(
          req.query.page,
        );

      const limit =
        parseLimit(
          req.query.limit,
          25,
        );

      const offset =
        (page - 1) *
        limit;

      const search =
        normalizeText(
          req.query.search,
          150,
        );

      const whereParts: string[] =
        [];

      const values: unknown[] =
        [];

      if (search) {
        whereParts.push(
          `
          (
            u.name LIKE ?
            OR u.email LIKE ?
            OR COALESCE(tmp.organization_name, '') LIKE ?
            OR COALESCE(u.city, '') LIKE ?
          )
          `,
        );

        const pattern =
          `%${search}%`;

        values.push(
          pattern,
          pattern,
          pattern,
          pattern,
        );
      }

      const whereSql =
        whereParts.length
          ? `AND ${whereParts.join(
              " AND ",
            )}`
          : "";

      const totalRow =
        db
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM temple_manager_profiles tmp
            INNER JOIN users u
              ON u.id = tmp.user_id
            INNER JOIN roles r
              ON r.id = u.role_id
            WHERE r.code = 'temple_manager'
            ${whereSql}
            `,
          )
          .get(
            ...values,
          ) as
          | {
              count: number;
            }
          | undefined;

      const total =
        Number(
          totalRow?.count ??
            0,
        );

      const rows =
        db
          .prepare(
            `
            SELECT
              tmp.id,
              tmp.user_id,
              tmp.designation,
              tmp.organization_name,
              tmp.verification_status,
              u.name AS user_name,
              u.email AS user_email,
              u.phone AS user_phone,
              u.status AS user_status,
              u.city,
              u.state
            FROM temple_manager_profiles tmp
            INNER JOIN users u
              ON u.id = tmp.user_id
            INNER JOIN roles r
              ON r.id = u.role_id
            WHERE r.code = 'temple_manager'
            ${whereSql}
            ORDER BY
              CASE
                WHEN u.status = 'pending'
                THEN 0
                ELSE 1
              END,
              tmp.id DESC
            LIMIT ?
            OFFSET ?
            `,
          )
          .all(
            ...values,
            limit,
            offset,
          ) as TempleManagerAdminRow[];

      res.json({
        success: true,
        templeManagers:
          rows.map(
            (row) => ({
              id:
                row.id,
              userId:
                row.user_id,
              designation:
                row.designation,
              organizationName:
                row.organization_name,
              verificationStatus:
                row.verification_status,
              user: {
                id:
                  row.user_id,
                name:
                  row.user_name,
                email:
                  row.user_email,
                phone:
                  row.user_phone,
                status:
                  row.user_status,
                city:
                  row.city,
                state:
                  row.state,
              },
            }),
          ),
        pagination:
          buildPagination(
            page,
            limit,
            total,
          ),
      });
    } catch (error) {
      console.error(
        "Temple Manager list error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load Temple Managers.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/admin/temple-managers/:id/approve
|--------------------------------------------------------------------------
*/

router.post(
  "/temple-managers/:id/approve",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      const userId =
        parseUserId(
          req.params.id,
        );

      if (!userId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid Temple Manager user ID.",
        });

        return;
      }

      const manager =
        db
          .prepare(
            `
            SELECT
              tmp.id,
              tmp.user_id,
              tmp.designation,
              tmp.organization_name,
              tmp.verification_status,
              u.name,
              u.email,
              u.status
            FROM temple_manager_profiles tmp
            INNER JOIN users u
              ON u.id = tmp.user_id
            INNER JOIN roles r
              ON r.id = u.role_id
            WHERE tmp.user_id = ?
              AND r.code = 'temple_manager'
            LIMIT 1
            `,
          )
          .get(
            userId,
          ) as
          | {
              id: number;
              user_id: number;
              designation: string | null;
              organization_name: string | null;
              verification_status: string;
              name: string;
              email: string;
              status: string;
            }
          | undefined;

      if (!manager) {
        res.status(404).json({
          success: false,
          error:
            "Temple Manager profile not found.",
        });

        return;
      }

      const transaction =
        db.transaction(
          () => {
            db.prepare(
              `
              UPDATE users
              SET
                status = 'active',
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
              `,
            ).run(
              userId,
            );

            /*
             * Use the profile verification field if present.
             * Existing schema already initializes this value as pending.
             */
            if (
              hasColumn(
                "temple_manager_profiles",
                "verification_status",
              )
            ) {
              /*
               * "verified" is used here as the final approved
               * verification state.
               */
              db.prepare(
                `
                UPDATE temple_manager_profiles
                SET
                  verification_status = 'verified',
                  updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                `,
              ).run(
                userId,
              );
            }

            createAuditLog({
              userId:
                actor.id,
              action:
                "admin.temple_manager_approved",
              entityType:
                "temple_manager",
              entityId:
                manager.id,
              oldData: {
                userStatus:
                  manager.status,
                verificationStatus:
                  manager.verification_status,
              },
              newData: {
                userStatus:
                  "active",
                verificationStatus:
                  "verified",
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
          },
        );

      transaction();

      res.json({
        success: true,
        message:
          "Temple Manager approved successfully.",
        templeManager: {
          userId,
          status:
            "active",
          verificationStatus:
            "verified",
        },
      });
    } catch (error) {
      console.error(
        "Temple Manager approval error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to approve Temple Manager.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/admin/temple-managers/:id/reject
|--------------------------------------------------------------------------
*/

router.post(
  "/temple-managers/:id/reject",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      const userId =
        parseUserId(
          req.params.id,
        );

      const reason =
        normalizeNullableText(
          req.body?.reason,
          1000,
        );

      if (!userId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid Temple Manager user ID.",
        });

        return;
      }

      const manager =
        db
          .prepare(
            `
            SELECT
              tmp.id,
              tmp.verification_status,
              u.status
            FROM temple_manager_profiles tmp
            INNER JOIN users u
              ON u.id = tmp.user_id
            INNER JOIN roles r
              ON r.id = u.role_id
            WHERE tmp.user_id = ?
              AND r.code = 'temple_manager'
            LIMIT 1
            `,
          )
          .get(
            userId,
          ) as
          | {
              id: number;
              verification_status: string;
              status: string;
            }
          | undefined;

      if (!manager) {
        res.status(404).json({
          success: false,
          error:
            "Temple Manager profile not found.",
        });

        return;
      }

      const transaction =
        db.transaction(
          () => {
            db.prepare(
              `
              UPDATE users
              SET
                status = 'rejected',
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
              `,
            ).run(
              userId,
            );

            /*
             * Keep verification state as rejected.
             */
            db.prepare(
              `
              UPDATE temple_manager_profiles
              SET
                verification_status = 'rejected',
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?
              `,
            ).run(
              userId,
            );

            db.prepare(
              `
              DELETE FROM sessions
              WHERE user_id = ?
              `,
            ).run(
              userId,
            );

            createAuditLog({
              userId:
                actor.id,
              action:
                "admin.temple_manager_rejected",
              entityType:
                "temple_manager",
              entityId:
                manager.id,
              oldData: {
                userStatus:
                  manager.status,
                verificationStatus:
                  manager.verification_status,
              },
              newData: {
                userStatus:
                  "rejected",
                verificationStatus:
                  "rejected",
                reason,
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
          },
        );

      transaction();

      res.json({
        success: true,
        message:
          "Temple Manager application rejected.",
      });
    } catch (error) {
      console.error(
        "Temple Manager rejection error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to reject Temple Manager.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/plans
|--------------------------------------------------------------------------
*/

router.get(
  "/plans",
  (
    req: Request,
    res: Response,
  ) => {
    void req;

    try {
      if (
        !tableExists(
          "subscription_plans",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Subscription plans table is not configured.",
        });

        return;
      }

      const plans =
        db
          .prepare(
            `
            SELECT *
            FROM subscription_plans
            ORDER BY
              CASE
                WHEN id IS NULL
                THEN 1
                ELSE 0
              END,
              id ASC
            `,
          )
          .all();

      res.json({
        success: true,
        plans,
      });
    } catch (error) {
      console.error(
        "Admin plans error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load subscription plans.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/plans/:id
|--------------------------------------------------------------------------
*/

router.patch(
  "/plans/:id",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      const planId =
        parseUserId(
          req.params.id,
        );

      if (!planId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid subscription plan ID.",
        });

        return;
      }

      if (
        !tableExists(
          "subscription_plans",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Subscription plans table is not configured.",
        });

        return;
      }

      const existing =
        db
          .prepare(
            `
            SELECT *
            FROM subscription_plans
            WHERE id = ?
            LIMIT 1
            `,
          )
          .get(
            planId,
          ) as
          | Record<
              string,
              unknown
            >
          | undefined;

      if (!existing) {
        res.status(404).json({
          success: false,
          error:
            "Subscription plan not found.",
        });

        return;
      }

      const columns =
        getTableColumns(
          "subscription_plans",
        );

      const aliases: Array<{
        bodyKeys: string[];
        columnCandidates: string[];
        transform: (
          value: unknown,
        ) => unknown;
      }> = [
        {
          bodyKeys: [
            "name",
          ],
          columnCandidates: [
            "name",
            "plan_name",
            "title",
          ],
          transform:
            (value) =>
              normalizeText(
                value,
                150,
              ),
        },
        {
          bodyKeys: [
            "description",
          ],
          columnCandidates: [
            "description",
          ],
          transform:
            (value) =>
              normalizeNullableText(
                value,
                1000,
              ),
        },
        {
          bodyKeys: [
            "priceAmount",
            "price",
            "amount",
          ],
          columnCandidates: [
            "price_amount",
            "price",
            "amount",
          ],
          transform:
            (
              value,
            ) =>
              parseOptionalNonNegativeInteger(
                value,
              ),
        },
        {
          bodyKeys: [
            "leadLimit",
            "leads",
            "leadCredits",
          ],
          columnCandidates: [
            "lead_limit",
            "lead_credits",
            "leads",
            "max_leads",
          ],
          transform:
            (
              value,
            ) =>
              parseOptionalNonNegativeInteger(
                value,
              ),
        },
        {
          bodyKeys: [
            "durationDays",
            "days",
          ],
          columnCandidates: [
            "duration_days",
            "validity_days",
            "days",
          ],
          transform:
            (
              value,
            ) =>
              parseOptionalNonNegativeInteger(
                value,
              ),
        },
        {
          bodyKeys: [
            "listingEnabled",
          ],
          columnCandidates: [
            "listing_enabled",
          ],
          transform:
            (
              value,
            ) =>
              parseBoolean(
                value,
              ) === true
                ? 1
                : 0,
        },
        {
          bodyKeys: [
            "featured",
          ],
          columnCandidates: [
            "featured",
          ],
          transform:
            (
              value,
            ) =>
              parseBoolean(
                value,
              ) === true
                ? 1
                : 0,
        },
        {
          bodyKeys: [
            "prioritySupport",
          ],
          columnCandidates: [
            "priority_support",
          ],
          transform:
            (
              value,
            ) =>
              parseBoolean(
                value,
              ) === true
                ? 1
                : 0,
        },
        {
          bodyKeys: [
            "isActive",
            "active",
          ],
          columnCandidates: [
            "is_active",
            "active",
          ],
          transform:
            (
              value,
            ) =>
              parseBoolean(
                value,
              ) === true
                ? 1
                : 0,
        },
      ];

      const assignments: string[] =
        [];

      const values: unknown[] =
        [];

      for (
        const alias of aliases
      ) {
        const suppliedKey =
          alias.bodyKeys.find(
            (key) =>
              Object.prototype.hasOwnProperty.call(
                req.body ??
                  {},
                key,
              ),
          );

        if (!suppliedKey) {
          continue;
        }

        const column =
          alias.columnCandidates.find(
            (candidate) =>
              columns.includes(
                candidate,
              ),
          );

        if (!column) {
          continue;
        }

        assignments.push(
          `${quoteIdentifier(
            column,
          )} = ?`,
        );

        values.push(
          alias.transform(
            req.body[
              suppliedKey
            ],
          ),
        );
      }

      if (
        columns.includes(
          "updated_at",
        )
      ) {
        assignments.push(
          "updated_at = CURRENT_TIMESTAMP",
        );
      }

      if (
        assignments.length ===
        0
      ) {
        res.status(400).json({
          success: false,
          error:
            "No supported plan fields were supplied.",
        });

        return;
      }

      values.push(
        planId,
      );

      db.prepare(
        `
        UPDATE subscription_plans
        SET ${assignments.join(
          ", ",
        )}
        WHERE id = ?
        `,
      ).run(
        ...values,
      );

      const updated =
        db
          .prepare(
            `
            SELECT *
            FROM subscription_plans
            WHERE id = ?
            LIMIT 1
            `,
          )
          .get(
            planId,
          );

      createAuditLog({
        userId:
          actor.id,
        action:
          "admin.subscription_plan_updated",
        entityType:
          "subscription_plan",
        entityId:
          planId,
        oldData:
          existing,
        newData:
          updated,
        ipAddress:
          getClientIp(
            req,
          ),
        userAgent:
          getUserAgent(
            req,
          ),
      });

      res.json({
        success: true,
        message:
          "Subscription plan updated successfully.",
        plan:
          updated,
      });
    } catch (error) {
      console.error(
        "Admin plan update error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update subscription plan.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/leads
|--------------------------------------------------------------------------
*/

router.get(
  "/leads",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      if (
        !tableExists(
          "leads",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Leads table is not configured.",
        });

        return;
      }

      const page =
        parsePage(
          req.query.page,
        );

      const limit =
        parseLimit(
          req.query.limit,
          25,
        );

      const offset =
        (page - 1) *
        limit;

      const search =
        normalizeText(
          req.query.search,
          150,
        );

      const status =
        normalizeText(
          req.query.status,
          60,
        );

      const source =
        normalizeText(
          req.query.source,
          100,
        );

      const columns =
        getTableColumns(
          "leads",
        );

      const whereParts: string[] =
        [];

      const values: unknown[] =
        [];

      if (search) {
        const searchColumns =
          [
            "name",
            "full_name",
            "email",
            "phone",
            "subject",
            "message",
            "source",
            "lead_type",
            "type",
          ].filter(
            (column) =>
              columns.includes(
                column,
              ),
          );

        if (
          searchColumns.length >
          0
        ) {
          const pattern =
            `%${search}%`;

          whereParts.push(
            `(${searchColumns
              .map(
                (column) =>
                  `COALESCE(${quoteIdentifier(
                    column,
                  )}, '') LIKE ?`,
              )
              .join(
                " OR ",
              )})`,
          );

          for (
            const column of searchColumns
          ) {
            void column;

            values.push(
              pattern,
            );
          }
        }
      }

      if (
        status &&
        columns.includes(
          "status",
        )
      ) {
        whereParts.push(
          "status = ?",
        );

        values.push(
          status,
        );
      }

      if (
        source &&
        columns.includes(
          "source",
        )
      ) {
        whereParts.push(
          "source = ?",
        );

        values.push(
          source,
        );
      }

      const whereSql =
        whereParts.length
          ? `WHERE ${whereParts.join(
              " AND ",
            )}`
          : "";

      const countRow =
        db
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM leads
            ${whereSql}
            `,
          )
          .get(
            ...values,
          ) as
          | {
              count: number;
            }
          | undefined;

      const total =
        Number(
          countRow?.count ??
            0,
        );

      const idColumn =
        columns.includes(
          "id",
        )
          ? "id"
          : columns[0] ??
            null;

      const orderSql =
        idColumn
          ? `ORDER BY ${quoteIdentifier(
              idColumn,
            )} DESC`
          : "";

      const rows =
        db
          .prepare(
            `
            SELECT *
            FROM leads
            ${whereSql}
            ${orderSql}
            LIMIT ?
            OFFSET ?
            `,
          )
          .all(
            ...values,
            limit,
            offset,
          );

      res.json({
        success: true,
        leads:
          rows,
        pagination:
          buildPagination(
            page,
            limit,
            total,
          ),
      });
    } catch (error) {
      console.error(
        "Admin leads error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load leads.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/subscriptions
|--------------------------------------------------------------------------
*/

router.get(
  "/subscriptions",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      if (
        !tableExists(
          "pandit_subscriptions",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Pandit subscriptions table is not configured.",
        });

        return;
      }

      const page =
        parsePage(
          req.query.page,
        );

      const limit =
        parseLimit(
          req.query.limit,
          25,
        );

      const offset =
        (page - 1) *
        limit;

      const columns =
        getTableColumns(
          "pandit_subscriptions",
        );

      const whereParts: string[] =
        [];

      const values: unknown[] =
        [];

      const status =
        normalizeText(
          req.query.status,
          60,
        );

      if (
        status &&
        columns.includes(
          "status",
        )
      ) {
        whereParts.push(
          "ps.status = ?",
        );

        values.push(
          status,
        );
      }

      const whereSql =
        whereParts.length
          ? `WHERE ${whereParts.join(
              " AND ",
            )}`
          : "";

      const countRow =
        db
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM pandit_subscriptions ps
            ${whereSql}
            `,
          )
          .get(
            ...values,
          ) as
          | {
              count: number;
            }
          | undefined;

      const total =
        Number(
          countRow?.count ??
            0,
        );

      /*
       * Use a generic base query because this endpoint must remain
       * resilient to minor subscription-schema variations.
       */
      const rows =
        db
          .prepare(
            `
            SELECT
              ps.*
            FROM pandit_subscriptions ps
            ${whereSql}
            ${
              columns.includes(
                "id",
              )
                ? "ORDER BY ps.id DESC"
                : ""
            }
            LIMIT ?
            OFFSET ?
            `,
          )
          .all(
            ...values,
            limit,
            offset,
          ) as Array<
          Record<
            string,
            unknown
          >
        >;

      /*
       * Enrich each subscription where the expected pandit_id
       * relationship exists.
       */
      const panditIdColumn =
        columns.includes(
          "pandit_id",
        )
          ? "pandit_id"
          : columns.includes(
                "user_id",
              )
            ? "user_id"
            : null;

      const enriched =
        rows.map(
          (subscription) => {
            if (
              !panditIdColumn
            ) {
              return {
                ...subscription,
                pandit: null,
              };
            }

            const rawId =
              Number(
                subscription[
                  panditIdColumn
                ],
              );

            if (
              !Number.isSafeInteger(
                rawId,
              ) ||
              rawId <= 0
            ) {
              return {
                ...subscription,
                pandit: null,
              };
            }

            /*
             * If pandit_id points to pandit_profiles,
             * use that. Otherwise try user_id.
             */
            let pandit =
              null as
                | Record<
                    string,
                    unknown
                  >
                | null;

            if (
              panditIdColumn ===
                "pandit_id" &&
              tableExists(
                "pandit_profiles",
              )
            ) {
              pandit =
                (db
                  .prepare(
                    `
                    SELECT
                      pp.id,
                      pp.user_id,
                      pp.slug,
                      pp.display_name,
                      pp.title,
                      pp.city,
                      pp.state,
                      pp.profile_status,
                      pp.listing_active,
                      u.email,
                      u.status AS user_status
                    FROM pandit_profiles pp
                    INNER JOIN users u
                      ON u.id = pp.user_id
                    WHERE pp.id = ?
                    LIMIT 1
                    `,
                  )
                  .get(
                    rawId,
                  ) as
                  | Record<
                      string,
                      unknown
                    >
                  | undefined) ??
                null;
            }

            if (
              !pandit &&
              panditIdColumn ===
                "user_id"
            ) {
              pandit =
                (db
                  .prepare(
                    `
                    SELECT
                      pp.id,
                      pp.user_id,
                      pp.slug,
                      pp.display_name,
                      pp.title,
                      pp.city,
                      pp.state,
                      pp.profile_status,
                      pp.listing_active,
                      u.email,
                      u.status AS user_status
                    FROM pandit_profiles pp
                    INNER JOIN users u
                      ON u.id = pp.user_id
                    WHERE pp.user_id = ?
                    LIMIT 1
                    `,
                  )
                  .get(
                    rawId,
                  ) as
                  | Record<
                      string,
                      unknown
                    >
                  | undefined) ??
                null;
            }

            return {
              ...subscription,
              pandit,
            };
          },
        );

      res.json({
        success: true,
        subscriptions:
          enriched,
        pagination:
          buildPagination(
            page,
            limit,
            total,
          ),
      });
    } catch (error) {
      console.error(
        "Admin subscriptions error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load subscriptions.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/temples
|--------------------------------------------------------------------------
*/

router.get(
  "/temples",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      if (
        !tableExists(
          "temples",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Temples table is not configured.",
        });

        return;
      }

      const page =
        parsePage(
          req.query.page,
        );

      const limit =
        parseLimit(
          req.query.limit,
          25,
        );

      const offset =
        (page - 1) *
        limit;

      const search =
        normalizeText(
          req.query.search,
          150,
        );

      const columns =
        getTableColumns(
          "temples",
        );

      const whereParts: string[] =
        [];

      const values: unknown[] =
        [];

      if (
        search
      ) {
        const searchableColumns =
          [
            "name",
            "slug",
            "city",
            "state",
            "district",
            "country",
          ].filter(
            (column) =>
              columns.includes(
                column,
              ),
          );

        if (
          searchableColumns.length
        ) {
          whereParts.push(
            `(${searchableColumns
              .map(
                (column) =>
                  `COALESCE(${quoteIdentifier(
                    column,
                  )}, '') LIKE ?`,
              )
              .join(
                " OR ",
              )})`,
          );

          const pattern =
            `%${search}%`;

          for (
            const column of searchableColumns
          ) {
            void column;

            values.push(
              pattern,
            );
          }
        }
      }

      const whereSql =
        whereParts.length
          ? `WHERE ${whereParts.join(
              " AND ",
            )}`
          : "";

      const countRow =
        db
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM temples
            ${whereSql}
            `,
          )
          .get(
            ...values,
          ) as
          | {
              count: number;
            }
          | undefined;

      const total =
        Number(
          countRow?.count ??
            0,
        );

      const orderColumn =
        columns.includes(
          "id",
        )
          ? "id"
          : columns.includes(
                "name",
              )
            ? "name"
            : null;

      const rows =
        db
          .prepare(
            `
            SELECT *
            FROM temples
            ${whereSql}
            ${
              orderColumn
                ? `ORDER BY ${quoteIdentifier(
                    orderColumn,
                  )} DESC`
                : ""
            }
            LIMIT ?
            OFFSET ?
            `,
          )
          .all(
            ...values,
            limit,
            offset,
          );

      res.json({
        success: true,
        temples:
          rows,
        pagination:
          buildPagination(
            page,
            limit,
            total,
          ),
      });
    } catch (error) {
      console.error(
        "Admin temples error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load temples.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/settings
|--------------------------------------------------------------------------
*/

router.get(
  "/settings",
  (
    req: Request,
    res: Response,
  ) => {
    void req;

    try {
      if (
        !tableExists(
          "settings",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Settings table is not configured.",
        });

        return;
      }

      const rows =
        db
          .prepare(
            `
            SELECT *
            FROM settings
            `,
          )
          .all();

      res.json({
        success: true,
        settings:
          rows,
      });
    } catch (error) {
      console.error(
        "Admin settings error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load settings.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/settings
|--------------------------------------------------------------------------
|
| Supports common settings-table column names:
|
| key / setting_key
| value / setting_value
| type / value_type
| description
|--------------------------------------------------------------------------
*/

router.patch(
  "/settings",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      if (
        !tableExists(
          "settings",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Settings table is not configured.",
        });

        return;
      }

      const settingKey =
        normalizeText(
          req.body?.key ??
            req.body?.settingKey,
          150,
        );

      const settingValue =
        req.body?.value ??
        req.body?.settingValue;

      if (!settingKey) {
        res.status(400).json({
          success: false,
          error:
            "Setting key is required.",
        });

        return;
      }

      const keyColumn =
        firstExistingColumn(
          "settings",
          [
            "key",
            "setting_key",
            "name",
          ],
        );

      const valueColumn =
        firstExistingColumn(
          "settings",
          [
            "value",
            "setting_value",
            "content",
          ],
        );

      if (
        !keyColumn ||
        !valueColumn
      ) {
        res.status(500).json({
          success: false,
          error:
            "Settings table does not contain a supported key/value structure.",
        });

        return;
      }

      const existing =
        db
          .prepare(
            `
            SELECT *
            FROM settings
            WHERE ${quoteIdentifier(
              keyColumn,
            )} = ?
            LIMIT 1
            `,
          )
          .get(
            settingKey,
          ) as
          | Record<
              string,
              unknown
            >
          | undefined;

      if (!existing) {
        res.status(404).json({
          success: false,
          error:
            "Setting not found.",
        });

        return;
      }

      const updates: string[] =
        [
          `${quoteIdentifier(
            valueColumn,
          )} = ?`,
        ];

      const values: unknown[] =
        [
          typeof settingValue ===
          "string"
            ? settingValue.trim()
            : JSON.stringify(
                settingValue,
              ),
        ];

      const typeColumn =
        firstExistingColumn(
          "settings",
          [
            "type",
            "value_type",
          ],
        );

      if (
        typeColumn &&
        req.body?.type !==
          undefined
      ) {
        updates.push(
          `${quoteIdentifier(
            typeColumn,
          )} = ?`,
        );

        values.push(
          normalizeText(
            req.body
              ?.type,
            50,
          ),
        );
      }

      const descriptionColumn =
        firstExistingColumn(
          "settings",
          [
            "description",
          ],
        );

      if (
        descriptionColumn &&
        req.body
          ?.description !==
          undefined
      ) {
        updates.push(
          `${quoteIdentifier(
            descriptionColumn,
          )} = ?`,
        );

        values.push(
          normalizeNullableText(
            req.body
              ?.description,
            1000,
          ),
        );
      }

      const updatedAtColumn =
        firstExistingColumn(
          "settings",
          [
            "updated_at",
          ],
        );

      if (updatedAtColumn) {
        updates.push(
          `${quoteIdentifier(
            updatedAtColumn,
          )} = CURRENT_TIMESTAMP`,
        );
      }

      values.push(
        settingKey,
      );

      db.prepare(
        `
        UPDATE settings
        SET ${updates.join(
          ", ",
        )}
        WHERE ${quoteIdentifier(
          keyColumn,
        )} = ?
        `,
      ).run(
        ...values,
      );

      const updated =
        db
          .prepare(
            `
            SELECT *
            FROM settings
            WHERE ${quoteIdentifier(
              keyColumn,
            )} = ?
            LIMIT 1
            `,
          )
          .get(
            settingKey,
          );

      createAuditLog({
        userId:
          actor.id,
        action:
          "admin.setting_updated",
        entityType:
          "setting",
        newData: {
          key:
            settingKey,
          before:
            existing,
          after:
            updated,
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

      res.json({
        success: true,
        message:
          "Setting updated successfully.",
        setting:
          updated,
      });
    } catch (error) {
      console.error(
        "Admin settings update error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update setting.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/admin/audit-logs
|--------------------------------------------------------------------------
*/

router.get(
  "/audit-logs",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      if (
        !tableExists(
          "audit_logs",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Audit log table is not configured.",
        });

        return;
      }

      const page =
        parsePage(
          req.query.page,
        );

      const limit =
        parseLimit(
          req.query.limit,
          50,
        );

      const offset =
        (page - 1) *
        limit;

      const search =
        normalizeText(
          req.query.search,
          150,
        );

      const whereParts: string[] =
        [];

      const values: unknown[] =
        [];

      if (
        search
      ) {
        const searchableColumns =
          [
            "action",
            "entity_type",
            "ip_address",
            "user_agent",
          ].filter(
            (column) =>
              hasColumn(
                "audit_logs",
                column,
              ),
          );

        if (
          searchableColumns.length
        ) {
          const pattern =
            `%${search}%`;

          whereParts.push(
            `(${searchableColumns
              .map(
                (column) =>
                  `COALESCE(${quoteIdentifier(
                    column,
                  )}, '') LIKE ?`,
              )
              .join(
                " OR ",
              )})`,
          );

          for (
            const column of searchableColumns
          ) {
            void column;

            values.push(
              pattern,
            );
          }
        }
      }

      const whereSql =
        whereParts.length
          ? `WHERE ${whereParts.join(
              " AND ",
            )}`
          : "";

      const totalRow =
        db
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM audit_logs
            ${whereSql}
            `,
          )
          .get(
            ...values,
          ) as
          | {
              count: number;
            }
          | undefined;

      const total =
        Number(
          totalRow?.count ??
            0,
        );

      const rows =
        db
          .prepare(
            `
            SELECT *
            FROM audit_logs
            ${whereSql}
            ${
              hasColumn(
                "audit_logs",
                "id",
              )
                ? "ORDER BY id DESC"
                : ""
            }
            LIMIT ?
            OFFSET ?
            `,
          )
          .all(
            ...values,
            limit,
            offset,
          );

      res.json({
        success: true,
        auditLogs:
          rows,
        pagination:
          buildPagination(
            page,
            limit,
            total,
          ),
      });
    } catch (error) {
      console.error(
        "Admin audit logs error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load audit logs.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| POST /api/admin/pandits/:id/feature
|--------------------------------------------------------------------------
|
| Optional admin control for featured listing.
|--------------------------------------------------------------------------
*/

router.patch(
  "/pandits/:id/feature",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      const userId =
        parseUserId(
          req.params.id,
        );

      if (!userId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid Pandit user ID.",
        });

        return;
      }

      if (
        !tableExists(
          "pandit_profiles",
        )
      ) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profiles table is not configured.",
        });

        return;
      }

      if (
        !hasColumn(
          "pandit_profiles",
          "featured",
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Featured listing is not supported by the current schema.",
        });

        return;
      }

      const featured =
        parseBoolean(
          req.body
            ?.featured,
        );

      if (
        featured ===
        null
      ) {
        res.status(400).json({
          success: false,
          error:
            "featured must be true or false.",
        });

        return;
      }

      const current =
        db
          .prepare(
            `
            SELECT
              id,
              featured,
              profile_status,
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
              featured:
                | number
                | null;
              profile_status: string;
              listing_active:
                | number
                | null;
            }
          | undefined;

      if (!current) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
        });

        return;
      }

      db.prepare(
        `
        UPDATE pandit_profiles
        SET
          featured = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
      ).run(
        featured ? 1 : 0,
        userId,
      );

      createAuditLog({
        userId:
          actor.id,
        action:
          "admin.pandit_featured_updated",
        entityType:
          "pandit",
        entityId:
          current.id,
        oldData: {
          featured:
            Boolean(
              current.featured,
            ),
        },
        newData: {
          featured,
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

      res.json({
        success: true,
        message:
          featured
            ? "Pandit marked as featured."
            : "Pandit removed from featured listings.",
        featured,
      });
    } catch (error) {
      console.error(
        "Admin feature update error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update featured status.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/pandits/:id/listing
|--------------------------------------------------------------------------
|
| Admin can enable/disable listing.
|--------------------------------------------------------------------------
*/

router.patch(
  "/pandits/:id/listing",
  (
    req: Request,
    res: Response,
  ) => {
    try {
      const actor =
        getAdminActor(
          res,
        );

      const userId =
        parseUserId(
          req.params.id,
        );

      if (!userId) {
        res.status(400).json({
          success: false,
          error:
            "Invalid Pandit user ID.",
        });

        return;
      }

      if (
        !hasColumn(
          "pandit_profiles",
          "listing_active",
        )
      ) {
        res.status(400).json({
          success: false,
          error:
            "Listing control is not supported by the current schema.",
        });

        return;
      }

      const listingActive =
        parseBoolean(
          req.body
            ?.listingActive,
        );

      if (
        listingActive ===
        null
      ) {
        res.status(400).json({
          success: false,
          error:
            "listingActive must be true or false.",
        });

        return;
      }

      const profile =
        db
          .prepare(
            `
            SELECT
              id,
              user_id,
              profile_status,
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
              user_id: number;
              profile_status: string;
              listing_active:
                | number
                | null;
            }
          | undefined;

      if (!profile) {
        res.status(404).json({
          success: false,
          error:
            "Pandit profile not found.",
        });

        return;
      }

      /*
       * Do not manually activate a non-approved profile.
       */
      if (
        listingActive &&
        profile.profile_status !==
          "approved"
      ) {
        res.status(409).json({
          success: false,
          error:
            "Pandit must be approved before the listing can be activated.",
        });

        return;
      }

      db.prepare(
        `
        UPDATE pandit_profiles
        SET
          listing_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
      ).run(
        listingActive
          ? 1
          : 0,
        userId,
      );

      createAuditLog({
        userId:
          actor.id,
        action:
          "admin.pandit_listing_updated",
        entityType:
          "pandit",
        entityId:
          profile.id,
        oldData: {
          listingActive:
            Boolean(
              profile.listing_active,
            ),
        },
        newData: {
          listingActive,
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

      res.json({
        success: true,
        message:
          "Pandit listing status updated.",
        listingActive,
      });
    } catch (error) {
      console.error(
        "Admin listing update error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to update Pandit listing.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| Health / Permission Info
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  (
    req: Request,
    res: Response,
  ) => {
    void req;

    try {
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

      res.json({
        success: true,
        user: {
          id:
            user.id,
          name:
            user.name,
          email:
            user.email,
          role:
            user.role,
          status:
            user.status,
          phone:
            user.phone,
          city:
            user.city,
          state:
            user.state,
          country:
            user.country,
          avatar:
            user.avatar,
          roleProfile:
            user.roleProfile,
        },
      });
    } catch (error) {
      console.error(
        "Admin current user error:",
        error,
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to load current admin account.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| Admin Router Export
|--------------------------------------------------------------------------
*/

export default router;