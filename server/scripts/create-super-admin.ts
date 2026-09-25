import "dotenv/config";

import {
  randomBytes,
  scrypt as scryptCallback,
} from "node:crypto";

import {
  closeDatabase,
  db,
} from "../db/database.ts";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type RoleRow = {
  id: number;
  code: string;
};

type ExistingUserRow = {
  id: number;
  name: string;
  email: string;
  status: string;
  role: string;
};

/*
|--------------------------------------------------------------------------
| Environment Helpers
|--------------------------------------------------------------------------
*/

function getRequiredEnv(
  key: string,
): string {
  const value = process.env[key];

  if (
    value === undefined ||
    value.trim() === ""
  ) {
    throw new Error(
      `Missing required environment variable: ${key}`,
    );
  }

  return value;
}

/*
|--------------------------------------------------------------------------
| Normalization
|--------------------------------------------------------------------------
*/

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function normalizeName(
  value: string,
): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

function isValidEmail(
  email: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function isValidPassword(
  password: string,
): boolean {
  return (
    password.length >=
      MIN_PASSWORD_LENGTH &&
    password.length <=
      MAX_PASSWORD_LENGTH
  );
}

function validateCredentials(
  credentials: {
    name: string;
    email: string;
    password: string;
  },
): void {
  if (
    credentials.name.length < 2
  ) {
    throw new Error(
      "SUPER_ADMIN_NAME must contain at least 2 characters.",
    );
  }

  if (
    credentials.name.length > 150
  ) {
    throw new Error(
      "SUPER_ADMIN_NAME cannot exceed 150 characters.",
    );
  }

  if (
    !isValidEmail(credentials.email)
  ) {
    throw new Error(
      "SUPER_ADMIN_EMAIL is not a valid email address.",
    );
  }

  if (
    !isValidPassword(
      credentials.password,
    )
  ) {
    throw new Error(
      `SUPER_ADMIN_PASSWORD must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
    );
  }
}

/*
|--------------------------------------------------------------------------
| Password Hashing
|--------------------------------------------------------------------------
|
| MUST remain compatible with server/routes/auth.ts
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
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join(":");
}

/*
|--------------------------------------------------------------------------
| Super Admin Role
|--------------------------------------------------------------------------
*/

function getSuperAdminRole(): RoleRow {
  const role =
    db
      .prepare(
        `
        SELECT
          id,
          code
        FROM roles
        WHERE code = 'super_admin'
        LIMIT 1
        `,
      )
      .get() as
      | RoleRow
      | undefined;

  if (!role) {
    throw new Error(
      'Database role "super_admin" was not found. Make sure schema.sql has been initialized correctly.',
    );
  }

  return role;
}

/*
|--------------------------------------------------------------------------
| Existing User
|--------------------------------------------------------------------------
*/

function findUserByEmail(
  email: string,
): ExistingUserRow | undefined {
  return db
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
      WHERE LOWER(u.email) = LOWER(?)
      LIMIT 1
      `,
    )
    .get(email) as
    | ExistingUserRow
    | undefined;
}

/*
|--------------------------------------------------------------------------
| Audit Log
|--------------------------------------------------------------------------
*/

function createAuditLog(
  params: {
    userId: number;
    action: string;
    entityType: string;
    entityId: number;
    newData: Record<
      string,
      unknown
    >;
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
      NULL,
      ?,
      NULL,
      ?,
      CURRENT_TIMESTAMP
    )
    `,
  ).run(
    params.userId,
    params.action,
    params.entityType,
    params.entityId,
    JSON.stringify(
      params.newData,
    ),
    "CLI:create-super-admin",
  );
}

/*
|--------------------------------------------------------------------------
| Environment Credentials
|--------------------------------------------------------------------------
*/

function getEnvironmentCredentials(): {
  name: string;
  email: string;
  password: string;
} {
  const name =
    normalizeName(
      getRequiredEnv(
        "SUPER_ADMIN_NAME",
      ),
    );

  const email =
    normalizeEmail(
      getRequiredEnv(
        "SUPER_ADMIN_EMAIL",
      ),
    );

  const password =
    getRequiredEnv(
      "SUPER_ADMIN_PASSWORD",
    );

  return {
    name,
    email,
    password,
  };
}

/*
|--------------------------------------------------------------------------
| Create / Synchronize Super Admin
|--------------------------------------------------------------------------
*/

async function createOrSyncSuperAdmin(): Promise<void> {
  console.log("");
  console.log(
    "==============================================",
  );
  console.log(
    "       DIVYADHARA SUPER ADMIN SETUP",
  );
  console.log(
    "==============================================",
  );
  console.log(
    "Mode     : Environment Variables",
  );
  console.log(
    "Database : SQLite",
  );
  console.log(
    "Role     : super_admin",
  );
  console.log(
    "Status   : active",
  );
  console.log(
    "==============================================",
  );
  console.log("");

  /*
   * Verify role.
   */
  const role =
    getSuperAdminRole();

  if (
    role.code !==
    "super_admin"
  ) {
    throw new Error(
      'Database role configuration is invalid. Expected "super_admin".',
    );
  }

  /*
   * Load and validate environment credentials.
   */
  const credentials =
    getEnvironmentCredentials();

  validateCredentials(
    credentials,
  );

  /*
   * Check current account.
   */
  const existingUser =
    findUserByEmail(
      credentials.email,
    );

  /*
   * Hash password regardless of whether
   * this is a create or synchronization.
   */
  console.log(
    "Creating secure password hash...",
  );

  const passwordHash =
    await hashPassword(
      credentials.password,
    );

  /*
   * Create or update atomically.
   */
  const result =
    db.transaction(
      () => {
        /*
         * CASE 1:
         * No account exists.
         */
        if (!existingUser) {
          const insertResult =
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
                  NULL,
                  ?,
                  CURRENT_TIMESTAMP,
                  'active',
                  NULL,
                  NULL,
                  'India',
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP
                )
                `,
              )
              .run(
                role.id,
                credentials.name,
                credentials.email,
                passwordHash,
              );

          const userId =
            Number(
              insertResult.lastInsertRowid,
            );

          createAuditLog({
            userId,
            action:
              "system.super_admin_bootstrap",
            entityType:
              "user",
            entityId:
              userId,
            newData: {
              role:
                "super_admin",
              status:
                "active",
              email:
                credentials.email,
              source:
                "create-super-admin.ts",
              operation:
                "created",
            },
          });

          return {
            operation: "created",
            userId,
          };
        }

        /*
         * CASE 2:
         * Email already belongs to another role.
         */
        if (
          existingUser.role !==
          "super_admin"
        ) {
          throw new Error(
            `The email "${existingUser.email}" is already registered with role "${existingUser.role}". Use a different email for the Super Admin account.`,
          );
        }

        /*
         * CASE 3:
         * Existing Super Admin.
         *
         * Synchronize:
         * - name
         * - password
         * - role_id
         * - status
         * - email verification
         */
        db.prepare(
          `
          UPDATE users
          SET
            role_id = ?,
            name = ?,
            password_hash = ?,
            email_verified_at = COALESCE(
              email_verified_at,
              CURRENT_TIMESTAMP
            ),
            status = 'active',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
        ).run(
          role.id,
          credentials.name,
          passwordHash,
          existingUser.id,
        );

        /*
         * Invalidate old sessions.
         *
         * This ensures every login after a password
         * synchronization starts with the new
         * credentials.
         */
        db.prepare(
          `
          DELETE FROM sessions
          WHERE user_id = ?
          `,
        ).run(
          existingUser.id,
        );

        createAuditLog({
          userId:
            existingUser.id,
          action:
            "system.super_admin_bootstrap_sync",
          entityType:
            "user",
          entityId:
            existingUser.id,
          newData: {
            role:
              "super_admin",
            status:
              "active",
            email:
              credentials.email,
            source:
              "create-super-admin.ts",
            operation:
              "synchronized",
          },
        });

        return {
          operation: "synchronized",
          userId:
            existingUser.id,
        };
      },
    )();

  /*
   * Verify final account.
   */
  const created =
    db
      .prepare(
        `
        SELECT
          u.id,
          u.name,
          u.email,
          u.status,
          r.code AS role,
          length(u.password_hash) AS password_hash_length
        FROM users u
        INNER JOIN roles r
          ON r.id = u.role_id
        WHERE u.id = ?
        LIMIT 1
        `,
      )
      .get(
        result.userId,
      ) as
      | (ExistingUserRow & {
          password_hash_length: number;
        })
      | undefined;

  if (!created) {
    throw new Error(
      "Super Admin was processed but could not be verified.",
    );
  }

  if (
    created.role !==
    "super_admin"
  ) {
    throw new Error(
      'Final account does not have the "super_admin" role.',
    );
  }

  if (
    created.status !==
    "active"
  ) {
    throw new Error(
      'Final Super Admin account is not "active".',
    );
  }

  if (
    created.password_hash_length <
    100
  ) {
    throw new Error(
      "Password hash verification failed.",
    );
  }

  /*
   * Success.
   */
  console.log("");
  console.log(
    "==============================================",
  );
  console.log(
    result.operation ===
      "created"
      ? "   SUPER ADMIN CREATED"
      : "   SUPER ADMIN SYNCHRONIZED",
  );
  console.log(
    "==============================================",
  );
  console.log(
    `User ID : ${created.id}`,
  );
  console.log(
    `Name    : ${created.name}`,
  );
  console.log(
    `Email   : ${created.email}`,
  );
  console.log(
    `Role    : ${created.role}`,
  );
  console.log(
    `Status  : ${created.status}`,
  );
  console.log(
    `Hash OK : yes`,
  );
  console.log(
    "Password: hidden",
  );
  console.log(
    "==============================================",
  );
  console.log("");
  console.log(
    "Use the normal DivyaDhara /login page to sign in.",
  );
  console.log("");
}

/*
|--------------------------------------------------------------------------
| Main
|--------------------------------------------------------------------------
*/

async function main(): Promise<void> {
  try {
    await createOrSyncSuperAdmin();

    process.exitCode =
      0;
  } catch (error) {
    console.error("");
    console.error(
      "Super Admin setup failed:",
    );
    console.error(
      error instanceof Error
        ? error.message
        : String(error),
    );
    console.error("");

    process.exitCode =
      1;
  } finally {
    closeDatabase();
  }
}

/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

void main();