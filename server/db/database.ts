import Database from "better-sqlite3";
import {
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import {
  dirname,
  isAbsolute,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";

/*
|--------------------------------------------------------------------------
| DivyaDhara SQLite Database
|--------------------------------------------------------------------------
|
| Project structure:
|
| divyadhara-website/
| ├── data/
| │   ├── divyadhara.sqlite
| │   ├── divyadhara.sqlite-shm
| │   └── divyadhara.sqlite-wal
| │
| └── server/
|     └── db/
|         ├── database.ts
|         └── schema.sql
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Resolve Current File
|--------------------------------------------------------------------------
*/

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  dirname(__filename);

/*
|--------------------------------------------------------------------------
| Project Root
|--------------------------------------------------------------------------
|
| database.ts
|   ↓
| server/
|   ↓
| project root
|
|--------------------------------------------------------------------------
*/

const PROJECT_ROOT =
  resolve(__dirname, "../..");

/*
|--------------------------------------------------------------------------
| Default SQLite Location
|--------------------------------------------------------------------------
*/

const DEFAULT_DATA_DIR =
  resolve(
    PROJECT_ROOT,
    "data",
  );

const DEFAULT_DATABASE_FILE =
  resolve(
    DEFAULT_DATA_DIR,
    "divyadhara.sqlite",
  );

/*
|--------------------------------------------------------------------------
| Environment Database Path
|--------------------------------------------------------------------------
|
| .env:
|
| DIVYADHARA_DB_PATH=./data/divyadhara.sqlite
|
| Absolute path also supported:
|
| DIVYADHARA_DB_PATH=/var/www/divyadhara/data/divyadhara.sqlite
|
|--------------------------------------------------------------------------
*/

function resolveDatabasePath(): string {
  const configuredPath =
    process.env.DIVYADHARA_DB_PATH?.trim();

  if (!configuredPath) {
    return DEFAULT_DATABASE_FILE;
  }

  if (isAbsolute(configuredPath)) {
    return resolve(
      configuredPath,
    );
  }

  return resolve(
    process.cwd(),
    configuredPath,
  );
}

const DATABASE_FILE =
  resolveDatabasePath();

/*
|--------------------------------------------------------------------------
| Database Directory
|--------------------------------------------------------------------------
|
| This is derived from the actual database file.
| Therefore custom database paths work correctly.
|
|--------------------------------------------------------------------------
*/

const DATABASE_DIR =
  dirname(DATABASE_FILE);

/*
|--------------------------------------------------------------------------
| Schema File
|--------------------------------------------------------------------------
*/

const SCHEMA_FILE =
  resolve(
    __dirname,
    "schema.sql",
  );

/*
|--------------------------------------------------------------------------
| Ensure Directory
|--------------------------------------------------------------------------
*/

function ensureDatabaseDirectory(): void {
  if (
    existsSync(
      DATABASE_DIR,
    )
  ) {
    return;
  }

  mkdirSync(
    DATABASE_DIR,
    {
      recursive: true,
    },
  );
}

/*
|--------------------------------------------------------------------------
| Read Schema
|--------------------------------------------------------------------------
*/

function readSchema(): string {
  if (
    !existsSync(
      SCHEMA_FILE,
    )
  ) {
    throw new Error(
      `SQLite schema file not found: ${SCHEMA_FILE}`,
    );
  }

  const schema =
    readFileSync(
      SCHEMA_FILE,
      "utf8",
    ).trim();

  if (!schema) {
    throw new Error(
      `SQLite schema file is empty: ${SCHEMA_FILE}`,
    );
  }

  return schema;
}

/*
|--------------------------------------------------------------------------
| Initialize Schema
|--------------------------------------------------------------------------
*/

function initializeSchema(
  database: Database.Database,
): void {
  const schema =
    readSchema();

  database.exec(
    schema,
  );
}

/*
|--------------------------------------------------------------------------
| Configure SQLite
|--------------------------------------------------------------------------
*/

function configureDatabase(
  database: Database.Database,
): void {
  /*
   * Enforce FOREIGN KEY constraints.
   */
  database.pragma(
    "foreign_keys = ON",
  );

  /*
   * WAL improves concurrent read/write behavior.
   */
  database.pragma(
    "journal_mode = WAL",
  );

  /*
   * Wait up to 5 seconds when the database is locked.
   */
  database.pragma(
    "busy_timeout = 5000",
  );

  /*
   * Good balance between performance and durability.
   */
  database.pragma(
    "synchronous = NORMAL",
  );

  /*
   * Store temporary SQLite structures in memory.
   */
  database.pragma(
    "temp_store = MEMORY",
  );

  /*
   * Keep recursive triggers enabled.
   */
  database.pragma(
    "recursive_triggers = ON",
  );
}

/*
|--------------------------------------------------------------------------
| Verify Database
|--------------------------------------------------------------------------
*/

function verifyDatabase(
  database: Database.Database,
): void {
  /*
   * Basic SQL connectivity.
   */
  database
    .prepare(
      "SELECT 1",
    )
    .get();

  /*
   * SQLite integrity check.
   *
   * "ok" means the database file is structurally healthy.
   */
  const integrity =
    database
      .prepare(
        "PRAGMA integrity_check",
      )
      .get() as
      | {
          integrity_check?: string;
        }
      | undefined;

  if (
    integrity?.integrity_check !==
    "ok"
  ) {
    throw new Error(
      `SQLite integrity check failed: ${
        integrity?.integrity_check ??
        "unknown error"
      }`,
    );
  }

  /*
   * Check that the main application tables exist.
   */
  const requiredTables = [
    "roles",
    "permissions",
    "users",
    "pandit_profiles",
    "subscription_plans",
    "pandit_subscriptions",
    "leads",
    "lead_assignments",
    "payments",
    "sessions",
  ];

  const tableExists =
    database.prepare(
      `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name = ?
      LIMIT 1
      `,
    );

  for (
    const tableName of
    requiredTables
  ) {
    const row =
      tableExists.get(
        tableName,
      );

    if (!row) {
      throw new Error(
        `Required SQLite table is missing: ${tableName}`,
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| Initialize Database
|--------------------------------------------------------------------------
*/

function initializeDatabase(): Database.Database {
  let database:
    | Database.Database
    | undefined;

  try {
    /*
     * Ensure actual database directory exists.
     */
    ensureDatabaseDirectory();

    /*
     * Open SQLite database.
     *
     * better-sqlite3 creates the file automatically
     * when it does not exist.
     */
    database =
      new Database(
        DATABASE_FILE,
      );

    /*
     * Configure SQLite.
     */
    configureDatabase(
      database,
    );

    /*
     * Create tables, indexes, roles, permissions,
     * packages and default settings.
     */
    initializeSchema(
      database,
    );

    /*
     * Verify database integrity and required tables.
     */
    verifyDatabase(
      database,
    );

    return database;
  } catch (error) {
    /*
     * Close partially-opened database on initialization
     * failure to avoid leaving the native handle open.
     */
    if (
      database &&
      database.open
    ) {
      try {
        database.close();
      } catch {
        // Ignore cleanup failure.
      }
    }

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Shared Database Connection
|--------------------------------------------------------------------------
|
| Import from other backend files:
|
| import { db } from "../db/database.ts";
|
|--------------------------------------------------------------------------
*/

export const db =
  initializeDatabase();

/*
|--------------------------------------------------------------------------
| Useful Paths
|--------------------------------------------------------------------------
*/

export const databasePath =
  DATABASE_FILE;

export const databaseDirectory =
  DATABASE_DIR;

export const schemaPath =
  SCHEMA_FILE;

/*
|--------------------------------------------------------------------------
| Graceful Database Close
|--------------------------------------------------------------------------
*/

export function closeDatabase(): void {
  if (!db.open) {
    return;
  }

  try {
    db.close();
  } catch (error) {
    console.error(
      "Failed to close SQLite database:",
      error,
    );
  }
}

/*
|--------------------------------------------------------------------------
| Database Connection Check
|--------------------------------------------------------------------------
*/

export function isDatabaseConnected(): boolean {
  if (!db.open) {
    return false;
  }

  try {
    db
      .prepare(
        "SELECT 1",
      )
      .get();

    return true;
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| Database Statistics
|--------------------------------------------------------------------------
|
| Useful for /api/health or admin diagnostics.
|
|--------------------------------------------------------------------------
*/

export function getDatabaseStats(): {
  connected: boolean;
  file: string;
  sizeTables: number;
} {
  if (!db.open) {
    return {
      connected: false,
      file: DATABASE_FILE,
      sizeTables: 0,
    };
  }

  try {
    const result =
      db
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM sqlite_master
          WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
          `,
        )
        .get() as
        | {
            count: number;
          }
        | undefined;

    return {
      connected: true,
      file: DATABASE_FILE,
      sizeTables:
        Number(
          result?.count ?? 0,
        ),
    };
  } catch {
    return {
      connected: false,
      file: DATABASE_FILE,
      sizeTables: 0,
    };
  }
}

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default db;