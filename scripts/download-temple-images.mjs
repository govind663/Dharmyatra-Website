#!/usr/bin/env node

/**
 * DharmYatra / DivyaDhara
 * FINAL Temple Image Downloader
 *
 * Provider order:
 *   1. Existing local image
 *   2. Wikimedia Commons
 *   3. Wikipedia
 *   4. Official / Temple / Government / Tourism
 *   5. Google Custom Search JSON API (optional)
 *   6. Bing Image Search API (optional)
 *   7. DuckDuckGo web discovery
 *   8. ComfyUI local AI generation
 *
 * IMPORTANT:
 * - Google works only when GOOGLE_API_KEY + GOOGLE_CX are both configured.
 * - ComfyUI must be running at COMFYUI_URL for AI fallback.
 * - AI-generated images are recorded as isAiGenerated=true.
 * - Existing valid files are never overwritten.
 */

import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/* ==========================================================================
 * PATHS
 * ========================================================================== */

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const TEMPLES_FILE = path.join(
  ROOT,
  "src",
  "data",
  "temples.ts"
);

const IMAGE_DIR = path.join(
  ROOT,
  "public",
  "images"
);

const STATE_FILE = path.join(
  IMAGE_DIR,
  ".temple-image-jobs.json"
);

const MANIFEST_FILE = path.join(
  IMAGE_DIR,
  "temple-image-sources.json"
);

const FAILURES_FILE = path.join(
  IMAGE_DIR,
  "temple-image-failures.json"
);

const LOCK_FILE = path.join(
  IMAGE_DIR,
  ".temple-image-worker.lock"
);

/* ==========================================================================
 * ENV HELPERS
 * ========================================================================== */

function envString(name, fallback = "") {
  const value = process.env[name];

  if (value == null) {
    return fallback;
  }

  return String(value).trim();
}

function envInt(
  name,
  fallback,
  min = 0
) {
  const raw = envString(
    name,
    String(fallback)
  );

  const value = Number.parseInt(
    raw,
    10
  );

  return Number.isFinite(value) &&
    value >= min
    ? value
    : fallback;
}

function envFloat(
  name,
  fallback
) {
  const raw = envString(
    name,
    String(fallback)
  );

  const value = Number.parseFloat(
    raw
  );

  return Number.isFinite(value)
    ? value
    : fallback;
}

function envBool(
  name,
  fallback = false
) {
  const value = envString(
    name,
    fallback
      ? "true"
      : "false"
  ).toLowerCase();

  return [
    "1",
    "true",
    "yes",
    "on",
  ].includes(value);
}

/* ==========================================================================
 * CONFIG
 * ========================================================================== */

const JOB_LIMIT = envInt(
  "JOB_LIMIT",
  66,
  1
);

const MIN_FILE_BYTES = envInt(
  "MIN_FILE_BYTES",
  20000,
  1
);

const REQUEST_DELAY_MS = envInt(
  "REQUEST_DELAY_MS",
  1000,
  0
);

const DOWNLOAD_DELAY_MS = envInt(
  "DOWNLOAD_DELAY_MS",
  800,
  0
);

const MAX_RETRIES = envInt(
  "MAX_RETRIES",
  1,
  0
);

const INITIAL_BACKOFF_MS = envInt(
  "INITIAL_BACKOFF_MS",
  2000,
  0
);

const MAX_BACKOFF_MS = envInt(
  "MAX_BACKOFF_MS",
  15000,
  0
);

const PROVIDER_COOLDOWN_MS = envInt(
  "PROVIDER_COOLDOWN_MS",
  300000,
  0
);

const REQUEST_TIMEOUT_MS = envInt(
  "REQUEST_TIMEOUT_MS",
  10000,
  1000
);

const PAGE_TIMEOUT_MS = envInt(
  "PAGE_TIMEOUT_MS",
  10000,
  1000
);

/**
 * Overall maximum time for one provider for one temple.
 * This is the main anti-hang protection.
 */
const PROVIDER_TOTAL_TIMEOUT_MS =
  envInt(
    "PROVIDER_TOTAL_TIMEOUT_MS",
    45000,
    5000
  );

/**
 * Maximum number of web pages to inspect
 * during official/tourism discovery.
 */
const OFFICIAL_MAX_PAGES = envInt(
  "OFFICIAL_MAX_PAGES",
  8,
  1
);

/**
 * Maximum candidate images to try from
 * one source page.
 */
const MAX_IMAGE_CANDIDATES_PER_PAGE =
  envInt(
    "MAX_IMAGE_CANDIDATES_PER_PAGE",
    8,
    1
);

/* Google */

const GOOGLE_API_KEY = envString(
  "GOOGLE_API_KEY"
);

const GOOGLE_CX = envString(
  "GOOGLE_CX"
);

/* Bing */

const BING_IMAGE_SEARCH_KEY =
  envString(
    "BING_IMAGE_SEARCH_KEY"
  );

/* AI */

const AI_FALLBACK = envBool(
  "AI_FALLBACK",
  true
);

const COMFYUI_URL = envString(
  "COMFYUI_URL",
  "http://127.0.0.1:8188"
).replace(/\/+$/, "");

const COMFYUI_CHECKPOINT =
  envString(
    "COMFYUI_CHECKPOINT",
    "sd_xl_base_1.0.safetensors"
  );

const COMFYUI_WIDTH = envInt(
  "COMFYUI_WIDTH",
  1024,
  64
);

const COMFYUI_HEIGHT = envInt(
  "COMFYUI_HEIGHT",
  1024,
  64
);

const COMFYUI_STEPS = envInt(
  "COMFYUI_STEPS",
  28,
  1
);

const COMFYUI_CFG = envFloat(
  "COMFYUI_CFG",
  7
);

const COMFYUI_SAMPLER = envString(
  "COMFYUI_SAMPLER",
  "euler"
);

const COMFYUI_SCHEDULER = envString(
  "COMFYUI_SCHEDULER",
  "normal"
);

const COMFYUI_POLL_MS = envInt(
  "COMFYUI_POLL_MS",
  2500,
  250
);

const COMFYUI_MAX_WAIT_MS =
  envInt(
    "COMFYUI_MAX_WAIT_MS",
    600000,
    10000
  );

const USER_AGENT = envString(
  "IMAGE_BOT_USER_AGENT",
  "DharmYatraTempleImageBot/2.0"
);

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

/* ==========================================================================
 * RUNTIME STATE
 * ========================================================================== */

const PROVIDER_COOLDOWNS = new Map();

let currentState = null;
let currentManifest = null;
let currentFailures = null;
let shuttingDown = false;

/* ==========================================================================
 * GENERIC HELPERS
 * ========================================================================== */

function sleep(ms) {
  return new Promise(
    (resolve) => setTimeout(resolve, ms)
  );
}

function nowIso() {
  return new Date().toISOString();
}

function safeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      "");
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(
    String(value || "")
  );
}

function hostOf(url) {
  try {
    return new URL(url)
      .hostname
      .toLowerCase();
  } catch {
    return "";
  }
}

function decodeHtml(value = "") {
  return String(value)
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /&lt;/gi,
      "<"
    )
    .replace(
      /&gt;/gi,
      ">"
    );
}

function stripHtml(value = "") {
  return decodeHtml(
    String(value)
      .replace(
        /<script[\s\S]*?<\/script>/gi,
        " "
      )
      .replace(
        /<style[\s\S]*?<\/style>/gi,
        " "
      )
      .replace(
        /<[^>]+>/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
  ).trim();
}

function toAbsoluteUrl(
  value,
  baseUrl
) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(
      value,
      baseUrl
    ).href;

    return isHttpUrl(url)
      ? url
      : null;
  } catch {
    return null;
  }
}

function sanitizeFilename(value) {
  return String(value || "")
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      "_"
    );
}

function escapeRegExp(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/* ==========================================================================
 * LOGGING
 * ========================================================================== */

function info(message) {
  console.log(message);
}

function providerLog(
  provider,
  message = ""
) {
  console.log(
    `      → ${provider}${message ? ` ${message}` : ""}`
  );
}

function successLog(
  provider,
  extra = ""
) {
  console.log(
    `        ✓ ${provider}${extra ? ` ${extra}` : ""}`
  );
}

function failLog(
  provider,
  message
) {
  console.log(
    `        ✗ ${provider}: ${message}`
  );
}

/* ==========================================================================
 * TIMEOUT WRAPPER
 * ========================================================================== */

async function withTimeout(
  promise,
  timeoutMs,
  message = "Operation timed out"
) {
  let timer;

  const timeoutPromise =
    new Promise(
      (_, reject) => {
        timer = setTimeout(
          () => {
            reject(
              new Error(
                message
              )
            );
          },
          timeoutMs
        );
      }
    );

  try {
    return await Promise.race([
      promise,
      timeoutPromise,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/* ==========================================================================
 * JSON FILE HELPERS
 * ========================================================================== */

async function ensureDirectories() {
  await fs.mkdir(
    IMAGE_DIR,
    {
      recursive: true,
    }
  );
}

async function readJson(
  file,
  fallback
) {
  try {
    const text =
      await fs.readFile(
        file,
        "utf8"
      );

    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

async function writeJson(
  file,
  data
) {
  const temporary =
    `${file}.tmp`;

  await fs.writeFile(
    temporary,
    `${JSON.stringify(
      data,
      null,
      2
    )}\n`,
    "utf8"
  );

  await fs.rename(
    temporary,
    file
  );
}

async function loadState() {
  const fallback = {
    version: 2,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    completed: {},
    attempts: {},
  };

  const raw =
    await readJson(
      STATE_FILE,
      {}
    );

  return {
    ...fallback,
    ...(raw &&
    typeof raw === "object"
      ? raw
      : {}),
    completed:
      raw?.completed &&
      typeof raw.completed ===
        "object"
        ? raw.completed
        : {},
    attempts:
      raw?.attempts &&
      typeof raw.attempts ===
        "object"
        ? raw.attempts
        : {},
  };
}

async function saveState(state) {
  state.updatedAt =
    nowIso();

  await writeJson(
    STATE_FILE,
    state
  );
}

async function loadManifest() {
  const raw =
    await readJson(
      MANIFEST_FILE,
      {}
    );

  return raw &&
    typeof raw === "object"
    ? raw
    : {};
}

async function saveManifest(
  manifest
) {
  await writeJson(
    MANIFEST_FILE,
    manifest
  );
}

async function loadFailures() {
  const raw =
    await readJson(
      FAILURES_FILE,
      {}
    );

  return raw &&
    typeof raw === "object"
    ? raw
    : {};
}

async function saveFailures(
  failures
) {
  await writeJson(
    FAILURES_FILE,
    failures
  );
}

/* ==========================================================================
 * LOCK
 * ========================================================================== */

async function acquireLock() {
  await fs.mkdir(
    IMAGE_DIR,
    {
      recursive: true,
    }
  );

  let existing = null;

  try {
    existing =
      JSON.parse(
        await fs.readFile(
          LOCK_FILE,
          "utf8"
        )
      );
  } catch {
    existing = null;
  }

  if (existing?.pid) {
    try {
      process.kill(
        existing.pid,
        0
      );

      throw new Error(
        `Another downloader process is already running (PID ${existing.pid})`
      );
    } catch (error) {
      if (
        String(
          error?.message || ""
        ).includes(
          "Another downloader"
        )
      ) {
        throw error;
      }

      /* stale lock */
    }
  }

  await fs.writeFile(
    LOCK_FILE,
    JSON.stringify(
      {
        pid: process.pid,
        startedAt: nowIso(),
      },
      null,
      2
    ),
    "utf8"
  );
}

async function releaseLock() {
  try {
    await fs.unlink(
      LOCK_FILE
    );
  } catch {
    // already removed
  }
}

/* ==========================================================================
 * TEMPLES.TS PARSER
 * ========================================================================== */

function removeComments(text) {
  return String(text)
    .replace(
      /\/\*[\s\S]*?\*\//g,
      ""
    )
    .replace(
      /(^|[^:])\/\/.*$/gm,
      "$1"
    );
}

function extractBalancedObject(
  text,
  start
) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (
    let i = start;
    i < text.length;
    i += 1
  ) {
    const char = text[i];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (
      char === "'" ||
      char === '"' ||
      char === "`"
    ) {
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(
          start,
          i + 1
        );
      }
    }
  }

  return null;
}

function parseStringField(
  objectText,
  key
) {
  const pattern =
    new RegExp(
      `${escapeRegExp(
        key
      )}\\s*:\\s*["'\`]([^"'\`]*)["'\`]`,
      "i"
    );

  const match =
    objectText.match(
      pattern
    );

  return (
    match?.[1]?.trim() ||
    ""
  );
}

function parseTemplesFromTS(
  source
) {
  const text =
    removeComments(
      source
    );

  const records = [];
  let cursor = 0;

  while (
    cursor < text.length
  ) {
    const sliced =
      text.slice(cursor);

    const match =
      sliced.match(
        /(?:^|[{\s,])slug\s*:\s*["']([^"']+)["']/i
      );

    if (!match) {
      break;
    }

    const slug =
      match[1].trim();

    const relative =
      match.index ?? 0;

    const slugPosition =
      cursor + relative;

    const objectStart =
      text.lastIndexOf(
        "{",
        slugPosition
      );

    if (
      objectStart < 0
    ) {
      cursor =
        slugPosition + 1;

      continue;
    }

    const objectText =
      extractBalancedObject(
        text,
        objectStart
      );

    if (!objectText) {
      cursor =
        slugPosition + 1;

      continue;
    }

    records.push({
      slug,
      name:
        parseStringField(
          objectText,
          "name"
        ) || slug,
      city:
        parseStringField(
          objectText,
          "city"
        ),
      district:
        parseStringField(
          objectText,
          "district"
        ),
      state:
        parseStringField(
          objectText,
          "state"
        ),
      category:
        parseStringField(
          objectText,
          "category"
        ),
      deity:
        parseStringField(
          objectText,
          "deity"
        ),
      tradition:
        parseStringField(
          objectText,
          "tradition"
        ),
      image:
        parseStringField(
          objectText,
          "image"
        ),
      summary:
        parseStringField(
          objectText,
          "summary"
        ),
      trust:
        parseStringField(
          objectText,
          "trust"
        ),
    });

    cursor =
      objectStart +
      objectText.length;
  }

  const unique =
    new Map();

  for (const temple of records) {
    if (
      temple.slug &&
      !unique.has(
        temple.slug
      )
    ) {
      unique.set(
        temple.slug,
        temple
      );
    }
  }

  return [
    ...unique.values(),
  ];
}

/* ==========================================================================
 * IMAGE TARGET
 * ========================================================================== */

function getTargetFilename(
  temple
) {
  const existing =
    String(
      temple.image || ""
    )
      .split("?")[0]
      .split("#")[0];

  if (existing) {
    const filename =
      sanitizeFilename(
        path.basename(
          existing
        )
      );

    const extension =
      path.extname(
        filename
      ).toLowerCase();

    if (
      filename &&
      IMAGE_EXTENSIONS.includes(
        extension
      )
    ) {
      return filename;
    }
  }

  return (
    `${safeSlug(
      temple.name
    ) || "temple"}.jpg`
  );
}

function getTargetPath(
  temple
) {
  return path.join(
    IMAGE_DIR,
    getTargetFilename(
      temple
    )
  );
}

function getTargetUrl(
  temple
) {
  return `/images/${getTargetFilename(
    temple
  )}`;
}

/* ==========================================================================
 * IMAGE VALIDATION
 * ========================================================================== */

function hasImageMagic(
  buffer
) {
  if (
    !Buffer.isBuffer(
      buffer
    ) ||
    buffer.length < 12
  ) {
    return false;
  }

  /* JPEG */
  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return true;
  }

  /* PNG */
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }

  /* RIFF WEBP */
  if (
    buffer.toString(
      "ascii",
      0,
      4
    ) === "RIFF" &&
    buffer.toString(
      "ascii",
      8,
      12
    ) === "WEBP"
  ) {
    return true;
  }

  /* GIF */
  if (
    buffer.toString(
      "ascii",
      0,
      6
    ) === "GIF87a" ||
    buffer.toString(
      "ascii",
      0,
      6
    ) === "GIF89a"
  ) {
    return true;
  }

  return false;
}

async function isValidImageFile(
  file
) {
  try {
    const stat =
      await fs.stat(file);

    if (
      !stat.isFile() ||
      stat.size <
        MIN_FILE_BYTES
    ) {
      return false;
    }

    const buffer =
      await fs.readFile(
        file
      );

    return hasImageMagic(
      buffer
    );
  } catch {
    return false;
  }
}

/* ==========================================================================
 * IMAGE CONVERSION
 * ========================================================================== */

async function commandExists(
  command
) {
  try {
    await execFileAsync(
      command,
      ["--version"]
    );

    return true;
  } catch {
    return false;
  }
}

async function convertToJpeg(
  source,
  target
) {
  if (
    await commandExists(
      "magick"
    )
  ) {
    await execFileAsync(
      "magick",
      [
        source,
        "-auto-orient",
        "-strip",
        "-quality",
        "90",
        target,
      ]
    );

    return true;
  }

  if (
    await commandExists(
      "ffmpeg"
    )
  ) {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-i",
        source,
        "-q:v",
        "2",
        target,
      ]
    );

    return true;
  }

  return false;
}

async function saveImageBuffer(
  buffer,
  targetFile,
  contentType = ""
) {
  await fs.mkdir(
    path.dirname(
      targetFile
    ),
    {
      recursive: true,
    }
  );

  if (
    !hasImageMagic(
      buffer
    )
  ) {
    throw new Error(
      "Response is not a valid image"
    );
  }

  const extension =
    path.extname(
      targetFile
    ).toLowerCase();

  const detectedExtension =
    contentType.includes(
      "png"
    )
      ? ".png"
      : contentType.includes(
          "webp"
        )
      ? ".webp"
      : ".jpg";

  const tempFile =
    `${targetFile}.download${detectedExtension}`;

  await fs.writeFile(
    tempFile,
    buffer
  );

  try {
    if (
      extension === ".jpg" ||
      extension === ".jpeg"
    ) {
      if (
        detectedExtension ===
          ".jpg" ||
        detectedExtension ===
          ".jpeg"
      ) {
        await fs.rename(
          tempFile,
          targetFile
        );
      } else {
        const converted =
          await convertToJpeg(
            tempFile,
            targetFile
          );

        if (!converted) {
          await fs.rename(
            tempFile,
            targetFile
          );
        }
      }
    } else {
      await fs.rename(
        tempFile,
        targetFile
      );
    }
  } finally {
    try {
      await fs.unlink(
        tempFile
      );
    } catch {
      // expected if renamed
    }
  }

  if (
    !(await isValidImageFile(
      targetFile
    ))
  ) {
    throw new Error(
      "Saved image failed validation"
    );
  }
}

/* ==========================================================================
 * PROVIDER RETRY / HTTP
 * ========================================================================== */

function isProviderCooling(
  provider
) {
  return (
    (
      PROVIDER_COOLDOWNS.get(
        provider
      ) || 0
    ) > Date.now()
  );
}

function coolProvider(
  provider,
  duration =
    PROVIDER_COOLDOWN_MS
) {
  PROVIDER_COOLDOWNS.set(
    provider,
    Date.now() + duration
  );
}

function retryDelay(
  attempt
) {
  const exponential =
    INITIAL_BACKOFF_MS *
    Math.pow(
      2,
      attempt
    );

  const jitter =
    Math.floor(
      Math.random() * 500
    );

  return Math.min(
    MAX_BACKOFF_MS,
    exponential + jitter
  );
}

async function fetchWithTimeout(
  url,
  options = {},
  timeout =
    REQUEST_TIMEOUT_MS
) {
  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () =>
        controller.abort(),
      timeout
    );

  try {
    return await fetch(
      url,
      {
        ...options,
        headers: {
          "User-Agent":
            USER_AGENT,
          Accept:
            options.headers
              ?.Accept ||
            options.accept ||
            "*/*",
          ...(options.headers ||
            {}),
        },
        signal:
          controller.signal,
      }
    );
  } finally {
    clearTimeout(
      timer
    );
  }
}

async function requestText(
  url,
  options = {}
) {
  let lastError =
    null;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt += 1
  ) {
    try {
      const response =
        await fetchWithTimeout(
          url,
          options,
          options.timeout ||
            REQUEST_TIMEOUT_MS
        );

      if (
        response.status ===
        429
      ) {
        if (
          options.provider
        ) {
          coolProvider(
            options.provider
          );
        }

        throw new Error(
          "HTTP 429"
        );
      }

      if (
        response.status >=
        500
      ) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      if (
        !response.ok
      ) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      return await response.text();
    } catch (error) {
      lastError = error;

      if (
        attempt >=
        MAX_RETRIES
      ) {
        break;
      }

      await sleep(
        retryDelay(
          attempt
        )
      );
    }
  }

  throw (
    lastError ||
    new Error(
      "Request failed"
    )
  );
}

async function downloadBinary(
  url,
  options = {}
) {
  let lastError =
    null;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt += 1
  ) {
    try {
      const response =
        await fetchWithTimeout(
          url,
          options,
          options.timeout ||
            REQUEST_TIMEOUT_MS
        );

      if (
        response.status ===
        429
      ) {
        if (
          options.provider
        ) {
          coolProvider(
            options.provider
          );
        }

        throw new Error(
          "HTTP 429"
        );
      }

      if (
        !response.ok
      ) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const buffer =
        Buffer.from(
          await response.arrayBuffer()
        );

      if (
        buffer.length <
        MIN_FILE_BYTES
      ) {
        throw new Error(
          `Image too small (${buffer.length} bytes)`
        );
      }

      return {
        buffer,
        contentType:
          response.headers.get(
            "content-type"
          ) || "",
        finalUrl:
          response.url ||
          url,
      };
    } catch (error) {
      lastError = error;

      if (
        attempt >=
        MAX_RETRIES
      ) {
        break;
      }

      await sleep(
        retryDelay(
          attempt
        )
      );
    }
  }

  throw (
    lastError ||
    new Error(
      "Image download failed"
    )
  );
}

/* ==========================================================================
 * META / HTML IMAGE EXTRACTION
 * ========================================================================== */

function getMeta(
  html,
  key
) {
  const escaped =
    escapeRegExp(
      key
    );

  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${escaped}["'][^>]*content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*property=["']${escaped}["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${escaped}["'][^>]*content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*name=["']${escaped}["']`,
      "i"
    ),
  ];

  for (
    const pattern of patterns
  ) {
    const match =
      html.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      return decodeHtml(
        match[1].trim()
      );
    }
  }

  return null;
}

function uniqueCandidates(
  candidates
) {
  const map =
    new Map();

  for (const item of candidates) {
    if (
      item?.imageUrl &&
      isHttpUrl(
        item.imageUrl
      )
    ) {
      map.set(
        item.imageUrl,
        item
      );
    }
  }

  return [
    ...map.values(),
  ];
}

function scoreCandidate(
  candidate,
  temple
) {
  const combined =
    [
      candidate.imageUrl,
      candidate.sourceTitle,
      candidate.evidence,
      candidate.sourceUrl,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  let score =
    Number(
      candidate.baseScore ||
        0
    );

  const terms = [
    temple.name,
    temple.city,
    temple.state,
    temple.district,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .split(
      /[^a-z0-9]+/
    )
    .filter(
      (word) =>
        word.length >= 4
    );

  for (const term of terms) {
    if (
      combined.includes(
        term
      )
    ) {
      score += 5;
    }
  }

  const positives = [
    ["official", 20],
    ["temple", 10],
    ["tourism", 12],
    ["government", 12],
    ["devasthanam", 15],
    ["trust", 10],
    ["mandir", 8],
  ];

  for (const [
    term,
    points,
  ] of positives) {
    if (
      combined.includes(
        term
      )
    ) {
      score += points;
    }
  }

  if (
    combined.includes(
      "upload.wikimedia.org"
    )
  ) {
    score += 25;
  }

  if (
    combined.includes(
      "commons.wikimedia.org"
    )
  ) {
    score += 20;
  }

  if (
    combined.includes(
      ".gov.in"
    )
  ) {
    score += 15;
  }

  if (
    /logo|favicon|icon|sprite|avatar/i.test(
      combined
    )
  ) {
    score -= 40;
  }

  if (
    /thumbnail|thumb|small|tiny/i.test(
      combined
    )
  ) {
    score -= 10;
  }

  return score;
}

function extractImageCandidates(
  html,
  pageUrl,
  temple
) {
  const candidates = [];

  for (
    const metaKey of [
      "og:image",
      "twitter:image",
    ]
  ) {
    const value =
      getMeta(
        html,
        metaKey
      );

    const absolute =
      toAbsoluteUrl(
        value,
        pageUrl
      );

    if (absolute) {
      candidates.push({
        imageUrl:
          absolute,
        sourceUrl:
          pageUrl,
        evidence:
          metaKey,
        baseScore:
          35,
      });
    }
  }

  const imgRegex =
    /<img\b[^>]*?(?:src|data-src|data-lazy-src|data-original)=["']([^"']+)["'][^>]*>/gi;

  let match;

  while (
    (match =
      imgRegex.exec(
        html
      )) !== null
  ) {
    const absolute =
      toAbsoluteUrl(
        match[1],
        pageUrl
      );

    if (absolute) {
      candidates.push({
        imageUrl:
          absolute,
        sourceUrl:
          pageUrl,
        evidence:
          match[0].slice(
            0,
            500
          ),
        baseScore:
          15,
      });
    }
  }

  const srcsetRegex =
    /<(?:img|source)\b[^>]*srcset=["']([^"']+)["'][^>]*>/gi;

  while (
    (match =
      srcsetRegex.exec(
        html
      )) !== null
  ) {
    for (const part of match[1].split(",")) {
      const raw =
        part.trim().split(
          /\s+/
        )[0];

      const absolute =
        toAbsoluteUrl(
          raw,
          pageUrl
        );

      if (absolute) {
        candidates.push({
          imageUrl:
            absolute,
          sourceUrl:
            pageUrl,
          evidence:
            "srcset",
          baseScore:
            18,
        });
      }
    }
  }

  const rawImageRegex =
    /https?:\/\/[^"'<>\\\s]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'<>\\\s]*)?/gi;

  while (
    (match =
      rawImageRegex.exec(
        html
      )) !== null
  ) {
    const imageUrl =
      decodeHtml(
        match[0]
      );

    if (
      isHttpUrl(
        imageUrl
      )
    ) {
      candidates.push({
        imageUrl,
        sourceUrl:
          pageUrl,
        evidence:
          "raw image URL",
        baseScore:
          8,
      });
    }
  }

  return uniqueCandidates(
    candidates
      .map(
        (item) => ({
          ...item,
          score:
            scoreCandidate(
              item,
              temple
            ),
        })
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      )
  );
}

/* ==========================================================================
 * CANDIDATE DOWNLOAD
 * ========================================================================== */

async function tryDownloadCandidate(
  candidate,
  targetFile,
  provider
) {
  try {
    await sleep(
      DOWNLOAD_DELAY_MS
    );

    const result =
      await downloadBinary(
        candidate.imageUrl,
        {
          provider,
          timeout:
            REQUEST_TIMEOUT_MS,
          headers: {
            Referer:
              candidate.sourceUrl ||
              undefined,
          },
        }
      );

    await saveImageBuffer(
      result.buffer,
      targetFile,
      result.contentType
    );

    return {
      sourceUrl:
        candidate.sourceUrl ||
        candidate.imageUrl,
      imageUrl:
        candidate.imageUrl,
      finalUrl:
        result.finalUrl,
      contentType:
        result.contentType,
      sourceTitle:
        candidate.sourceTitle ||
        "",
      license:
        candidate.license ||
        "",
      author:
        candidate.author ||
        "",
    };
  } catch {
    return null;
  }
}

/* ==========================================================================
 * SEARCH QUERIES
 * ========================================================================== */

function buildSearchQueries(
  temple
) {
  const name =
    temple.name ||
    "";

  const city =
    temple.city ||
    "";

  const district =
    temple.district ||
    "";

  const state =
    temple.state ||
    "";

  const category =
    temple.category ||
    "";

  const queries = [
    `"${name}" official temple`,
    `"${name}" temple website`,
    `"${name}" ${city} ${state}`,
    `"${name}" ${state} tourism`,
    `"${name}" government tourism`,
  ];

  if (
    category
      .toLowerCase()
      .includes(
        "shakti"
      )
  ) {
    queries.unshift(
      `"${name}" Shakti Peetha`
    );
  }

  if (
    district
  ) {
    queries.push(
      `"${name}" ${district} ${state}`
    );
  }

  return [
    ...new Set(
      queries.filter(
        Boolean
      )
    ),
  ];
}

/* ==========================================================================
 * WIKIMEDIA
 * ========================================================================== */

async function providerWikimedia(
  temple,
  targetFile
) {
  const provider =
    "Wikimedia Commons";

  const queries = [
    `"${temple.name}"`,
    `${temple.name} temple`,
    `${temple.name} ${temple.city}`,
  ];

  const all = [];

  for (
    let i = 0;
    i < queries.length;
    i += 1
  ) {
    const query =
      queries[i];

    console.log(
      `        Query ${i + 1}/${queries.length}: ${query}`
    );

    try {
      const api =
        new URL(
          "https://commons.wikimedia.org/w/api.php"
        );

      api.searchParams.set(
        "action",
        "query"
      );

      api.searchParams.set(
        "format",
        "json"
      );

      api.searchParams.set(
        "generator",
        "search"
      );

      api.searchParams.set(
        "gsrsearch",
        query
      );

      api.searchParams.set(
        "gsrnamespace",
        "6"
      );

      api.searchParams.set(
        "gsrlimit",
        "10"
      );

      api.searchParams.set(
        "prop",
        "imageinfo"
      );

      api.searchParams.set(
        "iiprop",
        "url|mime|size|extmetadata"
      );

      const text =
        await requestText(
          api.href,
          {
            provider,
          }
        );

      const json =
        JSON.parse(
          text
        );

      const pages =
        Object.values(
          json?.query?.pages ||
            {}
        );

      for (const page of pages) {
        const image =
          page?.imageinfo?.[0];

        if (
          !image?.url
        ) {
          continue;
        }

        if (
          !String(
            image.mime || ""
          ).startsWith(
            "image/"
          )
        ) {
          continue;
        }

        if (
          Number(
            image.width || 0
          ) < 500
        ) {
          continue;
        }

        const meta =
          image.extmetadata ||
          {};

        all.push({
          imageUrl:
            image.url,
          sourceUrl:
            `https://commons.wikimedia.org/wiki/${encodeURIComponent(
              String(
                page.title || ""
              ).replace(
                /\s+/g,
                "_"
              )
            )}`,
          sourceTitle:
            page.title ||
            "",
          evidence:
            `${page.title || ""} ${
              meta.LicenseShortName
                ?.value || ""
            }`,
          baseScore:
            50,
          license:
            meta.LicenseShortName
              ?.value ||
            meta.License
              ?.value ||
            "",
          author:
            meta.Artist?.value ||
            "",
        });
      }
    } catch (error) {
      console.log(
        `        Request error: ${
          error?.message ||
          "unknown"
        }`
      );
    }

    if (
      i <
      queries.length - 1
    ) {
      await sleep(
        REQUEST_DELAY_MS
      );
    }
  }

  const candidates =
    uniqueCandidates(
      all
    )
      .map(
        (item) => ({
          ...item,
          score:
            scoreCandidate(
              item,
              temple
            ),
        })
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  for (
    const candidate of
    candidates.slice(
      0,
      15
    )
  ) {
    const result =
      await tryDownloadCandidate(
        candidate,
        targetFile,
        provider
      );

    if (result) {
      return {
        ...result,
        provider,
      };
    }
  }

  return null;
}

/* ==========================================================================
 * WIKIPEDIA
 * ========================================================================== */

async function providerWikipedia(
  temple,
  targetFile
) {
  const provider =
    "Wikipedia";

  const queries = [
    temple.name,
    `${temple.name} temple`,
  ];

  for (
    let i = 0;
    i < queries.length;
    i += 1
  ) {
    const query =
      queries[i];

    console.log(
      `        Query ${i + 1}/${queries.length}: ${query}`
    );

    try {
      const search =
        new URL(
          "https://en.wikipedia.org/w/api.php"
        );

      search.searchParams.set(
        "action",
        "query"
      );

      search.searchParams.set(
        "format",
        "json"
      );

      search.searchParams.set(
        "list",
        "search"
      );

      search.searchParams.set(
        "srsearch",
        query
      );

      search.searchParams.set(
        "srlimit",
        "5"
      );

      const text =
        await requestText(
          search.href,
          {
            provider,
          }
        );

      const json =
        JSON.parse(
          text
        );

      const results =
        json?.query
          ?.search || [];

      for (
        const result of
        results.slice(0, 3)
      ) {
        const title =
          result?.title;

        if (!title) {
          continue;
        }

        const pageUrl =
          `https://en.wikipedia.org/wiki/${encodeURIComponent(
            title.replace(
              /\s+/g,
              "_"
            )
          )}`;

        console.log(
          `        Page: ${title}`
        );

        const html =
          await requestText(
            pageUrl,
            {
              provider,
              timeout:
                PAGE_TIMEOUT_MS,
            }
          );

        const candidates =
          extractImageCandidates(
            html,
            pageUrl,
            temple
          );

        for (
          const candidate of
          candidates.slice(
            0,
            MAX_IMAGE_CANDIDATES_PER_PAGE
          )
        ) {
          const downloaded =
            await tryDownloadCandidate(
              candidate,
              targetFile,
              provider
            );

          if (downloaded) {
            return {
              ...downloaded,
              provider,
              sourceTitle:
                title,
            };
          }
        }
      }
    } catch (error) {
      console.log(
        `        Request error: ${
          error?.message ||
          "unknown"
        }`
      );
    }

    if (
      i <
      queries.length - 1
    ) {
      await sleep(
        REQUEST_DELAY_MS
      );
    }
  }

  return null;
}

/* ==========================================================================
 * DUCKDUCKGO WEB SEARCH
 * ========================================================================== */

async function duckDuckGoSearch(
  query
) {
  const url =
    new URL(
      "https://html.duckduckgo.com/html/"
    );

  url.searchParams.set(
    "q",
    query
  );

  const html =
    await requestText(
      url.href,
      {
        provider:
          "DuckDuckGo",
        timeout:
          PAGE_TIMEOUT_MS,
      }
    );

  const results =
    [];

  const regex =
    /<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while (
    (match =
      regex.exec(
        html
      )) !== null
  ) {
    const urlValue =
      decodeHtml(
        match[1]
      );

    const title =
      stripHtml(
        match[2]
      );

    if (
      isHttpUrl(
        urlValue
      )
    ) {
      results.push({
        url:
          urlValue,
        title,
      });
    }
  }

  return results;
}

/* ==========================================================================
 * OFFICIAL / GOV / TOURISM
 * ========================================================================== */

function isPreferredHost(
  host
) {
  const value =
    String(host || "")
      .toLowerCase();

  return (
    value.endsWith(
      ".gov.in"
    ) ||
    value.endsWith(
      ".nic.in"
    ) ||
    value.includes(
      "tourism"
    ) ||
    value.includes(
      "devasthanam"
    ) ||
    value.includes(
      "temple"
    ) ||
    value.includes(
      "mandir"
    ) ||
    value.includes(
      "trust"
    ) ||
    value.includes(
      "darshan"
    )
  );
}

async function providerOfficialSites(
  temple,
  targetFile
) {
  const provider =
    "Official / Government / Tourism";

  const queries =
    buildSearchQueries(
      temple
    );

  const pages =
    [];

  for (
    let i = 0;
    i < queries.length;
    i += 1
  ) {
    const query =
      queries[i];

    console.log(
      `        Search ${i + 1}/${queries.length}: ${query}`
    );

    try {
      const results =
        await duckDuckGoSearch(
          query
        );

      pages.push(
        ...results
      );
    } catch (error) {
      console.log(
        `        Search error: ${
          error?.message ||
          "unknown"
        }`
      );
    }

    if (
      i <
      queries.length - 1
    ) {
      await sleep(
        REQUEST_DELAY_MS
      );
    }
  }

  const uniquePages =
    [
      ...new Map(
        pages.map(
          (item) => [
            item.url,
            item,
          ]
        )
      ).values(),
    ]
      .sort(
        (a, b) => {
          const as =
            isPreferredHost(
              hostOf(a.url)
            )
              ? 20
              : 0;

          const bs =
            isPreferredHost(
              hostOf(b.url)
            )
              ? 20
              : 0;

          return bs - as;
        }
      )
      .slice(
        0,
        OFFICIAL_MAX_PAGES
      );

  console.log(
    `        Candidate pages: ${uniquePages.length}`
  );

  for (
    let i = 0;
    i < uniquePages.length;
    i += 1
  ) {
    const page =
      uniquePages[i];

    console.log(
      `        Page ${i + 1}/${uniquePages.length}: ${hostOf(
        page.url
      )}`
    );

    try {
      const html =
        await requestText(
          page.url,
          {
            provider,
            timeout:
              PAGE_TIMEOUT_MS,
            accept:
              "text/html,application/xhtml+xml,*/*;q=0.8",
          }
        );

      const candidates =
        extractImageCandidates(
          html,
          page.url,
          temple
        );

      const preferred =
        isPreferredHost(
          hostOf(
            page.url
          )
        );

      for (
        const candidate of
        candidates
          .map(
            (item) => ({
              ...item,
              sourceTitle:
                page.title ||
                item.sourceTitle ||
                "",
              baseScore:
                item.baseScore +
                (
                  preferred
                    ? 25
                    : 0
                ),
            })
          )
          .sort(
            (a, b) =>
              scoreCandidate(
                b,
                temple
              ) -
              scoreCandidate(
                a,
                temple
              )
          )
          .slice(
            0,
            MAX_IMAGE_CANDIDATES_PER_PAGE
          )
      ) {
        const result =
          await tryDownloadCandidate(
            candidate,
            targetFile,
            provider
          );

        if (result) {
          return {
            ...result,
            provider,
            pageUrl:
              page.url,
            sourceTitle:
              page.title ||
              "",
          };
        }
      }
    } catch (error) {
      console.log(
        `        Page error: ${
          error?.message ||
          "unknown"
        }`
      );
    }

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  return null;
}

/* ==========================================================================
 * GOOGLE CUSTOM SEARCH API
 * ========================================================================== */

async function providerGoogle(
  temple,
  targetFile
) {
  const provider =
    "Google Custom Search";

  if (
    !GOOGLE_API_KEY ||
    !GOOGLE_CX
  ) {
    return null;
  }

  const queries = [
    `${temple.name} temple`,
    `${temple.name} ${temple.city}`,
    `${temple.name} ${temple.state}`,
  ];

  for (
    let i = 0;
    i < queries.length;
    i += 1
  ) {
    const query =
      queries[i];

    console.log(
      `        Query ${i + 1}/${queries.length}: ${query}`
    );

    try {
      const url =
        new URL(
          "https://www.googleapis.com/customsearch/v1"
        );

      url.searchParams.set(
        "key",
        GOOGLE_API_KEY
      );

      url.searchParams.set(
        "cx",
        GOOGLE_CX
      );

      url.searchParams.set(
        "q",
        query
      );

      url.searchParams.set(
        "searchType",
        "image"
      );

      url.searchParams.set(
        "num",
        "10"
      );

      url.searchParams.set(
        "safe",
        "active"
      );

      url.searchParams.set(
        "gl",
        "in"
      );

      const text =
        await requestText(
          url.href,
          {
            provider,
            timeout:
              REQUEST_TIMEOUT_MS,
            accept:
              "application/json,*/*;q=0.8",
          }
        );

      const json =
        JSON.parse(
          text
        );

      for (
        const item of
        (
          json?.items || []
        ).slice(0, 10)
      ) {
        if (
          !isHttpUrl(
            item?.link
          )
        ) {
          continue;
        }

        const candidate = {
          imageUrl:
            item.link,
          sourceUrl:
            item.image
              ?.contextLink ||
            item.link,
          sourceTitle:
            item.title ||
            "",
          evidence:
            `${item.title || ""} ${
              item.displayLink ||
              ""
            }`,
          baseScore:
            35,
        };

        const result =
          await tryDownloadCandidate(
            candidate,
            targetFile,
            provider
          );

        if (result) {
          return {
            ...result,
            provider,
            contextUrl:
              item.image
                ?.contextLink ||
              "",
          };
        }
      }
    } catch (error) {
      const message =
        error?.message ||
        "Google request failed";

      console.log(
        `        ${message}`
      );

      if (
        message.includes(
          "HTTP 429"
        ) ||
        message.includes(
          "HTTP 403"
        )
      ) {
        coolProvider(
          provider
        );

        break;
      }
    }
  }

  return null;
}

/* ==========================================================================
 * BING IMAGE API
 * ========================================================================== */

async function providerBing(
  temple,
  targetFile
) {
  const provider =
    "Bing Image Search";

  if (
    !BING_IMAGE_SEARCH_KEY
  ) {
    return null;
  }

  const queries = [
    `${temple.name} temple`,
    `${temple.name} ${temple.city}`,
    `${temple.name} ${temple.state}`,
  ];

  for (
    let i = 0;
    i < queries.length;
    i += 1
  ) {
    const query =
      queries[i];

    console.log(
      `        Query ${i + 1}/${queries.length}: ${query}`
    );

    try {
      const url =
        new URL(
          "https://api.bing.microsoft.com/v7.0/images/search"
        );

      url.searchParams.set(
        "q",
        query
      );

      url.searchParams.set(
        "count",
        "10"
      );

      url.searchParams.set(
        "safeSearch",
        "Moderate"
      );

      const text =
        await requestText(
          url.href,
          {
            provider,
            timeout:
              REQUEST_TIMEOUT_MS,
            headers: {
              "Ocp-Apim-Subscription-Key":
                BING_IMAGE_SEARCH_KEY,
              Accept:
                "application/json",
            },
          }
        );

      const json =
        JSON.parse(
          text
        );

      for (
        const item of
        (
          json?.value || []
        ).slice(0, 10)
      ) {
        if (
          !isHttpUrl(
            item?.contentUrl
          )
        ) {
          continue;
        }

        const candidate = {
          imageUrl:
            item.contentUrl,
          sourceUrl:
            item.hostPageUrl ||
            item.contentUrl,
          sourceTitle:
            item.name ||
            "",
          evidence:
            `${item.name || ""} ${
              item.hostPageDisplayUrl ||
              ""
            }`,
          baseScore:
            28,
        };

        const result =
          await tryDownloadCandidate(
            candidate,
            targetFile,
            provider
          );

        if (result) {
          return {
            ...result,
            provider,
          };
        }
      }
    } catch (error) {
      console.log(
        `        ${error?.message || "Bing request failed"}`
      );

      if (
        /HTTP (401|403|429)/.test(
          error?.message || ""
        )
      ) {
        coolProvider(
          provider
        );

        break;
      }
    }
  }

  return null;
}

/* ==========================================================================
 * DUCKDUCKGO FALLBACK IMAGE DISCOVERY
 * ========================================================================== */

async function providerDuckDuckGo(
  temple,
  targetFile
) {
  const provider =
    "DuckDuckGo";

  const queries = [
    `${temple.name} temple`,
    `${temple.name} ${temple.city} temple`,
  ];

  for (
    let i = 0;
    i < queries.length;
    i += 1
  ) {
    const query =
      queries[i];

    console.log(
      `        Query ${i + 1}/${queries.length}: ${query}`
    );

    try {
      const results =
        await duckDuckGoSearch(
          `${query} images`
        );

      for (
        const result of
        results.slice(
          0,
          8
        )
      ) {
        console.log(
          `        Source: ${hostOf(
            result.url
          )}`
        );

        try {
          const html =
            await requestText(
              result.url,
              {
                provider,
                timeout:
                  PAGE_TIMEOUT_MS,
              }
            );

          const candidates =
            extractImageCandidates(
              html,
              result.url,
              temple
            );

          for (
            const candidate of
            candidates.slice(
              0,
              MAX_IMAGE_CANDIDATES_PER_PAGE
            )
          ) {
            const downloaded =
              await tryDownloadCandidate(
                candidate,
                targetFile,
                provider
              );

            if (downloaded) {
              return {
                ...downloaded,
                provider,
                pageUrl:
                  result.url,
                sourceTitle:
                  result.title ||
                  "",
              };
            }
          }
        } catch {
          // next source
        }
      }
    } catch (error) {
      console.log(
        `        Search error: ${
          error?.message ||
          "unknown"
        }`
      );
    }

    if (
      i <
      queries.length - 1
    ) {
      await sleep(
        REQUEST_DELAY_MS
      );
    }
  }

  return null;
}

/* ==========================================================================
 * COMFYUI
 * ========================================================================== */

async function comfyHealth() {
  try {
    const response =
      await fetchWithTimeout(
        `${COMFYUI_URL}/system_stats`,
        {
          method:
            "GET",
          headers: {
            Accept:
              "application/json",
          },
        },
        10000
      );

    return response.ok;
  } catch {
    return false;
  }
}

async function getComfyCheckpointList() {
  try {
    const response =
      await fetchWithTimeout(
        `${COMFYUI_URL}/object_info/CheckpointLoaderSimple`,
        {
          method:
            "GET",
          headers: {
            Accept:
              "application/json",
          },
        },
        10000
      );

    if (
      !response.ok
    ) {
      return [];
    }

    const json =
      await response.json();

    const choices =
      json
        ?.CheckpointLoaderSimple
        ?.input
        ?.required
        ?.ckpt_name
        ?.[0];

    if (
      Array.isArray(
        choices
      )
    ) {
      return choices;
    }

    return [];
  } catch {
    return [];
  }
}

async function resolveComfyCheckpoint() {
  const available =
    await getComfyCheckpointList();

  if (
    available.length === 0
  ) {
    return {
      checkpoint:
        COMFYUI_CHECKPOINT,
      available: [],
    };
  }

  if (
    available.includes(
      COMFYUI_CHECKPOINT
    )
  ) {
    return {
      checkpoint:
        COMFYUI_CHECKPOINT,
      available,
    };
  }

  const preferred =
    available.find(
      (name) =>
        /sdxl|sd_xl|xl/i.test(
          name
        )
    );

  return {
    checkpoint:
      preferred ||
      available[0],
    available,
  };
}

function comfyWorkflow(
  prompt,
  negativePrompt,
  checkpoint
) {
  const seed =
    Math.floor(
      Math.random() *
        4_000_000_000
    );

  return {
    "3": {
      class_type:
        "KSampler",
      inputs: {
        seed,
        steps:
          COMFYUI_STEPS,
        cfg:
          COMFYUI_CFG,
        sampler_name:
          COMFYUI_SAMPLER,
        scheduler:
          COMFYUI_SCHEDULER,
        denoise:
          1,
        model: [
          "4",
          0,
        ],
        positive: [
          "6",
          0,
        ],
        negative: [
          "7",
          0,
        ],
        latent_image: [
          "5",
          0,
        ],
      },
    },

    "4": {
      class_type:
        "CheckpointLoaderSimple",
      inputs: {
        ckpt_name:
          checkpoint,
      },
    },

    "5": {
      class_type:
        "EmptyLatentImage",
      inputs: {
        width:
          COMFYUI_WIDTH,
        height:
          COMFYUI_HEIGHT,
        batch_size:
          1,
      },
    },

    "6": {
      class_type:
        "CLIPTextEncode",
      inputs: {
        text:
          prompt,
        clip: [
          "4",
          1,
        ],
      },
    },

    "7": {
      class_type:
        "CLIPTextEncode",
      inputs: {
        text:
          negativePrompt,
        clip: [
          "4",
          1,
        ],
      },
    },

    "8": {
      class_type:
        "VAEDecode",
      inputs: {
        samples: [
          "3",
          0,
        ],
        vae: [
          "4",
          2,
        ],
      },
    },

    "9": {
      class_type:
        "SaveImage",
      inputs: {
        filename_prefix:
          "dharmyatra_temple",
        images: [
          "8",
          0,
        ],
      },
    },
  };
}

function comfyPrompt(
  temple
) {
  const location = [
    temple.city,
    temple.district,
    temple.state,
    "India",
  ]
    .filter(Boolean)
    .join(", ");

  return [
    "Photorealistic professional Indian pilgrimage travel photography.",
    `Authentic exterior architectural representation of ${temple.name} temple`,
    location
      ? `located in ${location}`
      : "located in India",
    "Hindu sacred temple architecture.",
    "Realistic Indian temple materials and proportions.",
    "Natural daylight.",
    "Professional tourism photography.",
    "Wide architectural composition.",
    "Detailed facade.",
    "Peaceful devotional atmosphere.",
    "Realistic colors.",
    "High detail.",
    "Premium website hero photograph.",
    "No text.",
    "No watermark.",
    "No logo.",
    "No fantasy architecture.",
    "No fictional architecture.",
  ].join(" ");
}

function comfyNegativePrompt() {
  return [
    "cartoon",
    "anime",
    "illustration",
    "painting",
    "3d render",
    "cgi",
    "fantasy",
    "fictional temple",
    "science fiction",
    "distorted architecture",
    "deformed building",
    "duplicate buildings",
    "extra towers",
    "melting structures",
    "blur",
    "low quality",
    "text",
    "watermark",
    "logo",
  ].join(", ");
}

async function comfyQueue(
  workflow
) {
  const response =
    await fetchWithTimeout(
      `${COMFYUI_URL}/prompt`,
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept:
            "application/json",
        },
        body:
          JSON.stringify({
            prompt:
              workflow,
            client_id:
              `dharmyatra-${process.pid}-${Date.now()}`,
          }),
      },
      REQUEST_TIMEOUT_MS
    );

  const text =
    await response.text();

  if (
    !response.ok
  ) {
    throw new Error(
      `ComfyUI /prompt HTTP ${response.status}: ${text.slice(
        0,
        500
      )}`
    );
  }

  let json;

  try {
    json =
      JSON.parse(text);
  } catch {
    throw new Error(
      "ComfyUI returned invalid JSON"
    );
  }

  if (
    !json.prompt_id
  ) {
    throw new Error(
      "ComfyUI did not return prompt_id"
    );
  }

  return json.prompt_id;
}

async function comfyWait(
  promptId
) {
  const started =
    Date.now();

  while (
    Date.now() -
      started <
    COMFYUI_MAX_WAIT_MS
  ) {
    const response =
      await fetchWithTimeout(
        `${COMFYUI_URL}/history/${encodeURIComponent(
          promptId
        )}`,
        {
          method:
            "GET",
          headers: {
            Accept:
              "application/json",
          },
        },
        REQUEST_TIMEOUT_MS
      );

    if (
      response.ok
    ) {
      const history =
        await response.json();

      const record =
        history?.[
          promptId
        ];

      if (
        record
      ) {
        const status =
          record.status;

        if (
          status?.status_str ===
          "error"
        ) {
          throw new Error(
            "ComfyUI generation failed"
          );
        }

        const outputs =
          record.outputs ||
          {};

        if (
          Object.keys(
            outputs
          ).length > 0
        ) {
          return record;
        }
      }
    }

    console.log(
      `        ComfyUI: generation running... ${Math.floor(
        (Date.now() -
          started) /
          1000
      )}s`
    );

    await sleep(
      COMFYUI_POLL_MS
    );
  }

  throw new Error(
    `ComfyUI timeout after ${Math.floor(
      COMFYUI_MAX_WAIT_MS /
        1000
    )} seconds`
  );
}

function extractComfyImages(
  history
) {
  const images =
    [];

  for (
    const output of Object.values(
      history?.outputs ||
        {}
    )
  ) {
    for (
      const image of
      output?.images ||
      []
    ) {
      if (
        image?.filename
      ) {
        images.push(
          image
        );
      }
    }
  }

  return images;
}

async function comfyDownload(
  image,
  targetFile
) {
  const url =
    new URL(
      `${COMFYUI_URL}/view`
    );

  url.searchParams.set(
    "filename",
    image.filename
  );

  url.searchParams.set(
    "subfolder",
    image.subfolder ||
      ""
  );

  url.searchParams.set(
    "type",
    image.type ||
      "output"
  );

  const result =
    await downloadBinary(
      url.href,
      {
        provider:
          "ComfyUI AI",
        timeout:
          REQUEST_TIMEOUT_MS,
      }
    );

  await saveImageBuffer(
    result.buffer,
    targetFile,
    result.contentType
  );

  return true;
}

async function providerComfyUI(
  temple,
  targetFile
) {
  const provider =
    "ComfyUI AI";

  if (
    !AI_FALLBACK
  ) {
    return null;
  }

  const online =
    await comfyHealth();

  if (!online) {
    return null;
  }

  const checkpointInfo =
    await resolveComfyCheckpoint();

  const checkpoint =
    checkpointInfo.checkpoint;

  if (
    checkpointInfo.available.length >
      0 &&
    !checkpointInfo.available.includes(
      checkpoint
    )
  ) {
    throw new Error(
      `No usable ComfyUI checkpoint found`
    );
  }

  if (
    checkpoint !==
    COMFYUI_CHECKPOINT
  ) {
    console.log(
      `        ComfyUI checkpoint fallback: ${checkpoint}`
    );
  }

  const prompt =
    comfyPrompt(
      temple
    );

  const negative =
    comfyNegativePrompt();

  const workflow =
    comfyWorkflow(
      prompt,
      negative,
      checkpoint
    );

  console.log(
    "        ComfyUI: queueing generation..."
  );

  const promptId =
    await comfyQueue(
      workflow
    );

  console.log(
    `        ComfyUI prompt ID: ${promptId}`
  );

  const history =
    await comfyWait(
      promptId
    );

  const images =
    extractComfyImages(
      history
    );

  if (
    images.length === 0
  ) {
    throw new Error(
      "ComfyUI completed but returned no image"
    );
  }

  for (const image of images) {
    try {
      await comfyDownload(
        image,
        targetFile
      );

      return {
        provider,
        sourceUrl:
          `${COMFYUI_URL}/history/${promptId}`,
        imageUrl:
          `${COMFYUI_URL}/view?filename=${encodeURIComponent(
            image.filename
          )}`,
        sourceTitle:
          "ComfyUI generated image",
        prompt,
        promptId,
        aiModel:
          checkpoint,
        isAiGenerated:
          true,
      };
    } catch {
      // next output
    }
  }

  return null;
}

/* ==========================================================================
 * LOCAL CHECK
 * ========================================================================== */

async function existingImage(
  targetFile
) {
  if (
    await isValidImageFile(
      targetFile
    )
  ) {
    const stat =
      await fs.stat(
        targetFile
      );

    return {
      bytes:
        stat.size,
      modifiedAt:
        stat.mtime.toISOString(),
    };
  }

  return null;
}

/* ==========================================================================
 * MANIFEST
 * ========================================================================== */

async function saveManifestEntry(
  temple,
  targetFile,
  result
) {
  const stat =
    await fs.stat(
      targetFile
    );

  currentManifest[
    temple.slug
  ] = {
    slug:
      temple.slug,
    name:
      temple.name,
    target:
      getTargetUrl(
        temple
      ),
    provider:
      result.provider ||
      "",
    sourceUrl:
      result.sourceUrl ||
      "",
    imageUrl:
      result.imageUrl ||
      "",
    finalUrl:
      result.finalUrl ||
      "",
    sourceTitle:
      result.sourceTitle ||
      "",
    pageUrl:
      result.pageUrl ||
      "",
    contextUrl:
      result.contextUrl ||
      "",
    license:
      result.license ||
      "",
    author:
      result.author ||
      "",
    isAiGenerated:
      Boolean(
        result.isAiGenerated
      ),
    aiModel:
      result.aiModel ||
      "",
    prompt:
      result.prompt ||
      "",
    promptId:
      result.promptId ||
      "",
    bytes:
      stat.size,
    downloadedAt:
      nowIso(),
  };

  await saveManifest(
    currentManifest
  );
}

/* ==========================================================================
 * PROCESS ONE TEMPLE
 * ========================================================================== */

async function processTemple(
  temple
) {
  const targetFile =
    getTargetPath(
      temple
    );

  console.log("");
  console.log(
    `    ${temple.name}`
  );

  const location =
    [
      temple.city,
      temple.state,
    ]
      .filter(Boolean)
      .join(", ");

  if (
    location
  ) {
    console.log(
      `    ${location}`
    );
  }

  console.log(
    `    Target: ${getTargetUrl(
      temple
    )}`
  );

  /* Existing */

  const local =
    await existingImage(
      targetFile
    );

  if (local) {
    console.log(
      "      ✓ Existing valid image — skipped"
    );

    currentState.completed[
      temple.slug
    ] = {
      status:
        "existing",
      target:
        getTargetUrl(
          temple
        ),
      bytes:
        local.bytes,
      updatedAt:
        nowIso(),
    };

    delete currentFailures[
      temple.slug
    ];

    return {
      success:
        true,
      provider:
        "Local existing",
    };
  }

  await fs.mkdir(
    path.dirname(
      targetFile
    ),
    {
      recursive: true,
    }
  );

  const providers = [
    {
      name:
        "Wikimedia Commons",
      fn:
        providerWikimedia,
    },
    {
      name:
        "Wikipedia",
      fn:
        providerWikipedia,
    },
    {
      name:
        "Official / Government / Tourism",
      fn:
        providerOfficialSites,
    },
    {
      name:
        "Google Custom Search",
      fn:
        providerGoogle,
    },
    {
      name:
        "Bing Image Search",
      fn:
        providerBing,
    },
    {
      name:
        "DuckDuckGo",
      fn:
        providerDuckDuckGo,
    },
    {
      name:
        "ComfyUI AI",
      fn:
        providerComfyUI,
    },
  ];

  for (
    const provider of
    providers
  ) {
    const name =
      provider.name;

    /* Optional provider checks */

    if (
      name ===
        "Google Custom Search" &&
      (!GOOGLE_API_KEY ||
        !GOOGLE_CX)
    ) {
      failLog(
        name,
        "disabled: GOOGLE_API_KEY / GOOGLE_CX not configured"
      );

      continue;
    }

    if (
      name ===
        "Bing Image Search" &&
      !BING_IMAGE_SEARCH_KEY
    ) {
      failLog(
        name,
        "disabled: BING_IMAGE_SEARCH_KEY not configured"
      );

      continue;
    }

    if (
      name ===
        "ComfyUI AI" &&
      !AI_FALLBACK
    ) {
      failLog(
        name,
        "disabled: AI_FALLBACK=false"
      );

      continue;
    }

    if (
      isProviderCooling(
        name
      )
    ) {
      failLog(
        name,
        "provider cooldown active"
      );

      continue;
    }

    providerLog(
      name
    );

    try {
      const result =
        await withTimeout(
          provider.fn(
            temple,
            targetFile
          ),
          PROVIDER_TOTAL_TIMEOUT_MS,
          `${name} timeout after ${Math.floor(
            PROVIDER_TOTAL_TIMEOUT_MS /
              1000
          )} seconds`
        );

      if (
        result
      ) {
        successLog(
          name,
          result.sourceUrl
            ? `→ ${result.sourceUrl}`
            : ""
        );

        await saveManifestEntry(
          temple,
          targetFile,
          result
        );

        currentState.completed[
          temple.slug
        ] = {
          status:
            "downloaded",
          provider:
            result.provider ||
            name,
          target:
            getTargetUrl(
              temple
            ),
          isAiGenerated:
            Boolean(
              result.isAiGenerated
            ),
          updatedAt:
            nowIso(),
        };

        delete currentFailures[
          temple.slug
        ];

        return {
          success:
            true,
          ...result,
        };
      }

      failLog(
        name,
        "no suitable image found"
      );
    } catch (error) {
      const message =
        error?.message ||
        "provider failed";

      failLog(
        name,
        message
      );

      if (
        message.includes(
          "timeout"
        )
      ) {
        coolProvider(
          name,
          Math.min(
            PROVIDER_COOLDOWN_MS,
            120000
          )
        );
      }
    }
  }

  /* Everything failed */

  currentFailures[
    temple.slug
  ] = {
    slug:
      temple.slug,
    name:
      temple.name,
    target:
      getTargetUrl(
        temple
      ),
    failedAt:
      nowIso(),
    message:
      "All configured image providers failed",
  };

  currentState.completed[
    temple.slug
  ] = {
    status:
      "failed",
    target:
      getTargetUrl(
        temple
      ),
    updatedAt:
      nowIso(),
  };

  return {
    success:
      false,
  };
}

/* ==========================================================================
 * MAIN
 * ========================================================================== */

async function main() {
  await ensureDirectories();

  await acquireLock();

  currentState =
    await loadState();

  currentManifest =
    await loadManifest();

  currentFailures =
    await loadFailures();

  try {
    console.log("");
    console.log(
      "============================================================"
    );
    console.log(
      " DharmYatra Temple Image Downloader"
    );
    console.log(
      "============================================================"
    );
    console.log("");

    console.log(
      `Project root          : ${ROOT}`
    );

    console.log(
      `Temples file          : ${TEMPLES_FILE}`
    );

    console.log(
      `Image directory       : ${IMAGE_DIR}`
    );

    console.log(
      `Job limit             : ${JOB_LIMIT}`
    );

    console.log(
      `Minimum file bytes    : ${MIN_FILE_BYTES}`
    );

    console.log(
      `Provider timeout      : ${PROVIDER_TOTAL_TIMEOUT_MS} ms`
    );

    console.log(
      `Request timeout       : ${REQUEST_TIMEOUT_MS} ms`
    );

    console.log(
      `AI fallback           : ${
        AI_FALLBACK
          ? "ON"
          : "OFF"
      }`
    );

    console.log(
      `Google provider       : ${
        GOOGLE_API_KEY &&
        GOOGLE_CX
          ? "ON"
          : "OFF"
      }`
    );

    console.log(
      `Bing provider         : ${
        BING_IMAGE_SEARCH_KEY
          ? "ON"
          : "OFF"
      }`
    );

    console.log(
      `ComfyUI URL           : ${COMFYUI_URL}`
    );

    console.log(
      `ComfyUI checkpoint    : ${COMFYUI_CHECKPOINT}`
    );

    console.log("");

    /* Read temples */

    let source;

    try {
      source =
        await fs.readFile(
          TEMPLES_FILE,
          "utf8"
        );
    } catch (error) {
      throw new Error(
        `Unable to read temples.ts: ${error.message}`
      );
    }

    const temples =
      parseTemplesFromTS(
        source
      );

    if (
      temples.length === 0
    ) {
      throw new Error(
        "No temple records detected in src/data/temples.ts"
      );
    }

    console.log(
      `Total temple records : ${temples.length}`
    );

    /* Normalize old state */

    currentState.completed ??=
      {};

    currentState.attempts ??=
      {};

    /* Find missing */

    let alreadyDownloaded =
      0;

    const missing =
      [];

    for (const temple of temples) {
      const targetFile =
        getTargetPath(
          temple
        );

      const valid =
        await isValidImageFile(
          targetFile
        );

      if (valid) {
        alreadyDownloaded +=
          1;

        currentState.completed[
          temple.slug
        ] = {
          ...currentState
            .completed[
            temple.slug
          ],
          status:
            currentState
              .completed[
              temple.slug
            ]?.status ===
              "downloaded"
              ? "downloaded"
              : "existing",
          target:
            getTargetUrl(
              temple
            ),
          updatedAt:
            nowIso(),
        };
      } else {
        missing.push(
          temple
        );
      }
    }

    console.log(
      `Already downloaded   : ${alreadyDownloaded}`
    );

    console.log(
      `Remaining             : ${missing.length}`
    );

    const jobs =
      missing.slice(
        0,
        JOB_LIMIT
      );

    console.log(
      `This run limit        : ${jobs.length}`
    );

    /* ComfyUI status */

    if (
      AI_FALLBACK
    ) {
      const online =
        await comfyHealth();

      console.log(
        `ComfyUI status        : ${
          online
            ? "ONLINE"
            : "OFFLINE / UNAVAILABLE"
        }`
      );

      if (
        online
      ) {
        const checkpointInfo =
          await resolveComfyCheckpoint();

        if (
          checkpointInfo
            .available.length > 0
        ) {
          console.log(
            `ComfyUI checkpoints  : ${checkpointInfo.available.length} available`
          );

          console.log(
            `ComfyUI selected     : ${checkpointInfo.checkpoint}`
          );
        }
      } else {
        console.log(
          "  AI fallback available only after ComfyUI is started."
        );
      }
    }

    console.log("");

    if (
      jobs.length === 0
    ) {
      console.log(
        "✓ All temple images are already available."
      );

      await saveState(
        currentState
      );

      return;
    }

    let successful =
      0;

    let failed =
      0;

    for (
      let i = 0;
      i < jobs.length;
      i += 1
    ) {
      const temple =
        jobs[i];

      console.log(
        `[${i + 1}/${jobs.length}] ${
          temple.category ||
          "Temple"
        } — ${temple.name}`
      );

      currentState.attempts[
        temple.slug
      ] =
        Number(
          currentState
            .attempts[
            temple.slug
          ] || 0
        ) + 1;

      try {
        const result =
          await processTemple(
            temple
          );

        if (
          result.success
        ) {
          successful +=
            1;
        } else {
          failed +=
            1;
        }
      } catch (error) {
        failed +=
          1;

        currentFailures[
          temple.slug
        ] = {
          slug:
            temple.slug,
          name:
            temple.name,
          target:
            getTargetUrl(
              temple
            ),
          failedAt:
            nowIso(),
          message:
            error?.message ||
            "Unknown processing error",
        };

        console.log(
          `      ✗ Processing error: ${
            error?.message ||
            "unknown"
          }`
        );
      }

      /* Save after EVERY temple */

      await saveState(
        currentState
      );

      await saveManifest(
        currentManifest
      );

      await saveFailures(
        currentFailures
      );

      if (
        i <
        jobs.length - 1
      ) {
        await sleep(
          REQUEST_DELAY_MS
        );
      }
    }

    /* Recalculate remaining */

    let stillMissing =
      0;

    for (const temple of temples) {
      const targetFile =
        getTargetPath(
          temple
        );

      if (
        !(await isValidImageFile(
          targetFile
        ))
      ) {
        stillMissing +=
          1;
      }
    }

    await saveState(
      currentState
    );

    await saveManifest(
      currentManifest
    );

    await saveFailures(
      currentFailures
    );

    console.log("");
    console.log(
      "============================================================"
    );
    console.log(
      " DOWNLOAD SUMMARY"
    );
    console.log(
      "============================================================"
    );

    console.log(
      `Total temples         : ${temples.length}`
    );

    console.log(
      `Processed this run   : ${jobs.length}`
    );

    console.log(
      `Successful            : ${successful}`
    );

    console.log(
      `Failed                : ${failed}`
    );

    console.log(
      `Still missing         : ${stillMissing}`
    );

    console.log("");
    console.log(
      `Source manifest       : ${MANIFEST_FILE}`
    );

    console.log(
      `Job state             : ${STATE_FILE}`
    );

    console.log(
      `Failure log           : ${FAILURES_FILE}`
    );

    console.log(
      "============================================================"
    );
    console.log("");
  } finally {
    await releaseLock();
  }
}

/* ==========================================================================
 * SIGNAL HANDLING
 * ========================================================================== */

async function gracefulShutdown(
  signal
) {
  if (
    shuttingDown
  ) {
    return;
  }

  shuttingDown =
    true;

  console.log("");
  console.log(
    `Received ${signal}. Saving current state...`
  );

  try {
    if (
      currentState
    ) {
      await saveState(
        currentState
      );
    }

    if (
      currentManifest
    ) {
      await saveManifest(
        currentManifest
      );
    }

    if (
      currentFailures
    ) {
      await saveFailures(
        currentFailures
      );
    }
  } catch {
    // ignore shutdown persistence errors
  }

  await releaseLock();

  process.exit(
    signal ===
      "SIGINT"
      ? 130
      : 143
  );
}

process.on(
  "SIGINT",
  () =>
    gracefulShutdown(
      "SIGINT"
    )
);

process.on(
  "SIGTERM",
  () =>
    gracefulShutdown(
      "SIGTERM"
    )
);

/* ==========================================================================
 * START
 * ========================================================================== */

main().catch(
  async (error) => {
    console.error("");
    console.error(
      "✗ FATAL ERROR"
    );
    console.error(
      error?.stack ||
        error?.message ||
        error
    );
    console.error("");

    await releaseLock();

    process.exit(1);
  }
);