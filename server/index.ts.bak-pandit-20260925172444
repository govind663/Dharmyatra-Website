/* eslint-disable @typescript-eslint/no-unused-vars */
import "dotenv/config";

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import {
  closeDatabase,
  isDatabaseConnected,
  databasePath,
} from "./db/database.ts";

import authRoutes from "./routes/auth.ts";
import adminRoutes from "./routes/admin.ts";

/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

const PORT =
  Number(
    process.env.PORT ||
      3001,
  );

const HOST =
  process.env.HOST ||
  "0.0.0.0";

const NODE_ENV =
  process.env.NODE_ENV ||
  "development";

const IS_PRODUCTION =
  NODE_ENV ===
  "production";

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/

function getAllowedOrigins(): Set<string> {
  const configuredOrigins =
    process.env.CORS_ORIGINS
      ?.split(",")
      .map(
        (origin) =>
          origin.trim(),
      )
      .filter(Boolean);

  if (
    configuredOrigins &&
    configuredOrigins.length >
      0
  ) {
    return new Set(
      configuredOrigins,
    );
  }

  return new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ]);
}

const ALLOWED_ORIGINS =
  getAllowedOrigins();

/*
|--------------------------------------------------------------------------
| Express Application
|--------------------------------------------------------------------------
*/

const app =
  express();

/*
|--------------------------------------------------------------------------
| Basic Application Settings
|--------------------------------------------------------------------------
*/

app.disable(
  "x-powered-by",
);

/*
|--------------------------------------------------------------------------
| Body Parsing
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

/*
|--------------------------------------------------------------------------
| CORS Middleware
|--------------------------------------------------------------------------
*/

app.use(
  (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const origin =
      req.headers.origin;

    if (
      origin &&
      ALLOWED_ORIGINS.has(
        origin,
      )
    ) {
      res.setHeader(
        "Access-Control-Allow-Origin",
        origin,
      );

      res.setHeader(
        "Access-Control-Allow-Credentials",
        "true",
      );

      res.setHeader(
        "Vary",
        "Origin",
      );
    }

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
    );

    if (
      req.method ===
      "OPTIONS"
    ) {
      res
        .status(204)
        .end();

      return;
    }

    next();
  },
);

/*
|--------------------------------------------------------------------------
| Security Headers
|--------------------------------------------------------------------------
*/

app.use(
  (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    res.setHeader(
      "X-Content-Type-Options",
      "nosniff",
    );

    res.setHeader(
      "X-Frame-Options",
      "SAMEORIGIN",
    );

    res.setHeader(
      "Referrer-Policy",
      "strict-origin-when-cross-origin",
    );

    next();
  },
);

/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use(
  (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const startedAt =
      Date.now();

    res.on(
      "finish",
      () => {
        const duration =
          Date.now() -
          startedAt;

        console.log(
          `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
        );
      },
    );

    next();
  },
);

/*
|--------------------------------------------------------------------------
| Root API
|--------------------------------------------------------------------------
*/

app.get(
  "/api",
  (
    _req: Request,
    res: Response,
  ) => {
    res.json({
      success: true,
      name: "DivyaDhara API",
      version: "1.0.0",
      environment:
        NODE_ENV,
      message:
        "DivyaDhara backend is running.",
    });
  },
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (
    _req: Request,
    res: Response,
  ) => {
    const databaseConnected =
      isDatabaseConnected();

    const healthy =
      databaseConnected;

    res
      .status(
        healthy
          ? 200
          : 503,
      )
      .json({
        success:
          healthy,

        service:
          "divyadhara-api",

        status:
          healthy
            ? "healthy"
            : "degraded",

        environment:
          NODE_ENV,

        timestamp:
          new Date().toISOString(),

        database: {
          connected:
            databaseConnected,
        },
      });
  },
);

/*
|--------------------------------------------------------------------------
| Development Database Information
|--------------------------------------------------------------------------
*/

if (!IS_PRODUCTION) {
  app.get(
    "/api/dev/database",
    (
      _req: Request,
      res: Response,
    ) => {
      res.json({
        success: true,
        database:
          "SQLite",

        connected:
          isDatabaseConnected(),

        path:
          databasePath,
      });
    },
  );
}

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| POST /api/auth/register
| POST /api/auth/login
| POST /api/auth/logout
| GET  /api/auth/me
| GET  /api/auth/role
| PATCH /api/auth/profile
| POST /api/auth/forgot-password
| POST /api/auth/reset-password
| POST /api/auth/verify-email
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes,
);

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
|
| Every route inside adminRoutes is protected by:
|
| requireAuth
| requireRole("super_admin")
|
| Therefore frontend users cannot access these APIs merely by
| knowing the endpoint URL.
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin",
  adminRoutes,
);

/*
|--------------------------------------------------------------------------
| Future API Routes
|--------------------------------------------------------------------------
|
| These will be added as the backend modules are implemented.
|
| app.use("/api/pandits", panditRoutes);
| app.use("/api/subscriptions", subscriptionRoutes);
| app.use("/api/leads", leadRoutes);
| app.use("/api/temples", templeRoutes);
| app.use("/api/sales", salesRoutes);
| app.use("/api/temple-managers", templeManagerRoutes);
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| API 404 Handler
|--------------------------------------------------------------------------
|
| This must remain AFTER all /api routes.
|--------------------------------------------------------------------------
*/

app.use(
  "/api",
  (
    req: Request,
    res: Response,
  ) => {
    res
      .status(404)
      .json({
        success: false,
        error:
          "API route not found",
        path:
          req.originalUrl,
      });
  },
);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

type ApiError = {
  message?: string;
  status?: number;
  statusCode?: number;
  type?: string;
};

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error(
      "Unhandled API error:",
      error,
    );

    const apiError =
      error as ApiError;

    const errorStatus =
      typeof apiError.statusCode ===
      "number"
        ? apiError.statusCode
        : typeof apiError.status ===
            "number"
          ? apiError.status
          : apiError.type ===
              "entity.parse.failed"
            ? 400
            : 500;

    const status =
      errorStatus >=
        400 &&
      errorStatus <
        600
        ? errorStatus
        : 500;

    const message =
      IS_PRODUCTION
        ? status ===
          400
          ? "Invalid request body."
          : "Internal server error."
        : typeof apiError.message ===
            "string"
          ? apiError.message
          : "Unknown server error.";

    res
      .status(status)
      .json({
        success: false,
        error: message,
      });
  },
);

/*
|--------------------------------------------------------------------------
| Server State
|--------------------------------------------------------------------------
*/

let httpServer:
  | ReturnType<
      typeof app.listen
    >
  | undefined;

let shuttingDown =
  false;

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

function shutdown(
  signal: string,
): void {
  if (shuttingDown) {
    return;
  }

  shuttingDown =
    true;

  console.log(
    `\nReceived ${signal}. Shutting down...`,
  );

  /*
   * Server not started.
   */
  if (!httpServer) {
    try {
      closeDatabase();

      console.log(
        "SQLite connection closed.",
      );
    } catch (error) {
      console.error(
        "Error while closing SQLite:",
        error,
      );
    }

    process.exit(0);

    return;
  }

  /*
   * Stop accepting new connections.
   */
  httpServer.close(
    (
      error?: Error,
    ) => {
      if (error) {
        console.error(
          "Error while stopping HTTP server:",
          error,
        );
      }

      try {
        closeDatabase();

        console.log(
          "SQLite connection closed.",
        );
      } catch (dbError) {
        console.error(
          "Error while closing SQLite:",
          dbError,
        );
      }

      process.exit(
        error
          ? 1
          : 0,
      );
    },
  );

  /*
   * Safety timeout.
   */
  setTimeout(
    () => {
      console.error(
        "Forced shutdown after timeout.",
      );

      try {
        closeDatabase();
      } catch {
        // Ignore final cleanup error.
      }

      process.exit(1);
    },
    10_000,
  ).unref();
}

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

function startServer(): void {
  /*
   * Verify SQLite before starting HTTP.
   */
  if (
    !isDatabaseConnected()
  ) {
    console.error(
      "❌ SQLite database connection failed.",
    );

    process.exit(1);

    return;
  }

  /*
   * Validate port.
   */
  if (
    !Number.isInteger(
      PORT,
    ) ||
    PORT < 1 ||
    PORT > 65_535
  ) {
    console.error(
      `❌ Invalid PORT value: ${process.env.PORT}`,
    );

    process.exit(1);

    return;
  }

  httpServer =
    app.listen(
      PORT,
      HOST,
      () => {
        console.log("");

        console.log(
          "==============================================",
        );

        console.log(
          "        DIVYADHARA API SERVER",
        );

        console.log(
          "==============================================",
        );

        console.log(
          `Environment : ${NODE_ENV}`,
        );

        console.log(
          `Host        : ${HOST}`,
        );

        console.log(
          `Port        : ${PORT}`,
        );

        console.log(
          `API         : http://localhost:${PORT}/api`,
        );

        console.log(
          `Health      : http://localhost:${PORT}/api/health`,
        );

        console.log(
          `Auth        : http://localhost:${PORT}/api/auth`,
        );

        console.log(
          `Admin       : http://localhost:${PORT}/api/admin`,
        );

        console.log(
          `Database    : SQLite`,
        );

        console.log(
          "Database OK : true",
        );

        console.log(
          "==============================================",
        );

        console.log("");
      },
    );

  /*
   * HTTP server-level errors.
   */
  httpServer.on(
    "error",
    (
      error: NodeJS.ErrnoException,
    ) => {
      console.error(
        "HTTP server error:",
        error,
      );

      if (
        error.code ===
        "EADDRINUSE"
      ) {
        console.error(
          `❌ Port ${PORT} is already in use.`,
        );
      }

      shutdown(
        "server-error",
      );
    },
  );
}

/*
|--------------------------------------------------------------------------
| Process Signals
|--------------------------------------------------------------------------
*/

process.on(
  "SIGINT",
  () => {
    shutdown(
      "SIGINT",
    );
  },
);

process.on(
  "SIGTERM",
  () => {
    shutdown(
      "SIGTERM",
    );
  },
);

/*
|--------------------------------------------------------------------------
| Fatal Runtime Errors
|--------------------------------------------------------------------------
*/

process.on(
  "uncaughtException",
  (
    error,
  ) => {
    console.error(
      "Uncaught exception:",
      error,
    );

    shutdown(
      "uncaughtException",
    );
  },
);

process.on(
  "unhandledRejection",
  (
    reason,
  ) => {
    console.error(
      "Unhandled promise rejection:",
      reason,
    );
  },
);

/*
|--------------------------------------------------------------------------
| Start Application
|--------------------------------------------------------------------------
*/

startServer();

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
  app,
  startServer,
};