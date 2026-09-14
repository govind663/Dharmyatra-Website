
/**
 * ============================================================================
 * DharmYatra - Master Temple Image Downloader
 * ============================================================================
 *
 * File:
 *   scripts/download-temple-images.mjs
 *
 * Run:
 *   node scripts/download-temple-images.mjs
 *
 * Main provider order:
 *
 *   1. Existing local image
 *   2. Wikimedia Commons
 *   3. Wikipedia
 *   4. DuckDuckGo Web Search
 *   5. Google Custom Search API (optional)
 *   6. Bing Image Search API (optional)
 *   7. Official / Government / Tourism website
 *   8. ComfyUI local AI generation
 *
 * Important:
 * - Only missing temple images are processed.
 * - Existing valid images are never overwritten.
 * - 429/rate-limit errors put that provider on cooldown.
 * - The script then moves to the next provider.
 * - A stale worker lock is automatically removed when the old PID
 *   is no longer running.
 * - AI-generated images are clearly marked in the manifest.
 *
 * Optional environment variables:
 *
 *   JOB_LIMIT=66
 *   MIN_FILE_BYTES=20000
 *
 *   REQUEST_DELAY_MS=2500
 *   DOWNLOAD_DELAY_MS=1500
 *   MAX_RETRIES=2
 *   INITIAL_BACKOFF_MS=4000
 *   MAX_BACKOFF_MS=90000
 *   PROVIDER_COOLDOWN_MS=900000
 *
 *   GOOGLE_API_KEY=
 *   GOOGLE_CX=
 *
 *   BING_IMAGE_SEARCH_KEY=
 *
 *   AI_FALLBACK=true
 *   COMFYUI_URL=http://127.0.0.1:8188
 *   COMFYUI_CHECKPOINT=sd_xl_base_1.0.safetensors
 *   COMFYUI_WIDTH=1024
 *   COMFYUI_HEIGHT=1024
 *   COMFYUI_STEPS=28
 *   COMFYUI_CFG=7
 *   COMFYUI_SAMPLER=euler
 *   COMFYUI_SCHEDULER=normal
 *
 * Example:
 *
 *   AI_FALLBACK=true node scripts/download-temple-images.mjs
 *
 * Google:
 *
 *   GOOGLE_API_KEY="YOUR_KEY" \
 *   GOOGLE_CX="YOUR_CX" \
 *   node scripts/download-temple-images.mjs
 *
 * Bing:
 *
 *   BING_IMAGE_SEARCH_KEY="YOUR_KEY" \
 *   node scripts/download-temple-images.mjs
 *
 * ============================================================================
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/* ============================================================================
 * PATHS
 * ========================================================================== */

const ROOT = path.resolve(
  path.dirname(
    fileURLToPath(import.meta.url)
  ),
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

/* ============================================================================
 * CONFIGURATION
 * ========================================================================== */

const JOB_LIMIT = Math.max(
  1,
  positiveInt(
    process.env.JOB_LIMIT,
    999999
  )
);

const MIN_FILE_BYTES = Math.max(
  1000,
  positiveInt(
    process.env.MIN_FILE_BYTES,
    20_000
  )
);

const REQUEST_DELAY_MS = Math.max(
  0,
  positiveInt(
    process.env.REQUEST_DELAY_MS,
    2500
  )
);

const DOWNLOAD_DELAY_MS = Math.max(
  0,
  positiveInt(
    process.env.DOWNLOAD_DELAY_MS,
    1500
  )
);

const MAX_RETRIES = Math.max(
  1,
  positiveInt(
    process.env.MAX_RETRIES,
    2
  )
);

const INITIAL_BACKOFF_MS = Math.max(
  1000,
  positiveInt(
    process.env.INITIAL_BACKOFF_MS,
    4000
  )
);

const MAX_BACKOFF_MS = Math.max(
  10_000,
  positiveInt(
    process.env.MAX_BACKOFF_MS,
    90_000
  )
);

const PROVIDER_COOLDOWN_MS = Math.max(
  60_000,
  positiveInt(
    process.env.PROVIDER_COOLDOWN_MS,
    15 * 60_000
  )
);

const REQUEST_TIMEOUT_MS = Math.max(
  5000,
  positiveInt(
    process.env.REQUEST_TIMEOUT_MS,
    20_000
  )
);

const PAGE_TIMEOUT_MS = Math.max(
  5000,
  positiveInt(
    process.env.PAGE_TIMEOUT_MS,
    15_000
  )
);

const AI_FALLBACK = envBool(
  process.env.AI_FALLBACK,
  true
);

const COMFYUI_URL = String(
  process.env.COMFYUI_URL ||
    "http://127.0.0.1:8188"
).replace(
  /\/$/,
  ""
);

const COMFYUI_CHECKPOINT = String(
  process.env.COMFYUI_CHECKPOINT ||
    "sd_xl_base_1.0.safetensors"
).trim();

const COMFYUI_WIDTH = clampInt(
  process.env.COMFYUI_WIDTH,
  1024,
  512,
  1536
);

const COMFYUI_HEIGHT = clampInt(
  process.env.COMFYUI_HEIGHT,
  1024,
  512,
  1536
);

const COMFYUI_STEPS = clampInt(
  process.env.COMFYUI_STEPS,
  28,
  1,
  100
);

const COMFYUI_CFG = clampFloat(
  process.env.COMFYUI_CFG,
  7,
  1,
  30
);

const COMFYUI_SAMPLER = String(
  process.env.COMFYUI_SAMPLER ||
    "euler"
).trim();

const COMFYUI_SCHEDULER = String(
  process.env.COMFYUI_SCHEDULER ||
    "normal"
).trim();

const COMFYUI_POLL_MS = Math.max(
  1000,
  positiveInt(
    process.env.COMFYUI_POLL_MS,
    2500
  )
);

const COMFYUI_MAX_WAIT_MS = Math.max(
  30_000,
  positiveInt(
    process.env.COMFYUI_MAX_WAIT_MS,
    10 * 60_000
  )
);

const USER_AGENT =
  "DharmYatraTempleImageBot/4.0 " +
  "(local importer; respects source rate limits)";

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const GOOGLE_API_KEY = String(
  process.env.GOOGLE_API_KEY || ""
).trim();

const GOOGLE_CX = String(
  process.env.GOOGLE_CX || ""
).trim();

const BING_IMAGE_SEARCH_KEY = String(
  process.env.BING_IMAGE_SEARCH_KEY || ""
).trim();

const providerCooldowns = {};

/* ============================================================================
 * GENERIC HELPERS
 * ========================================================================== */

function positiveInt(
  value,
  fallback
) {
  const n = Number.parseInt(
    String(value ?? ""),
    10
  );

  return Number.isFinite(n) &&
    n > 0
    ? n
    : fallback;
}

function clampInt(
  value,
  fallback,
  min,
  max
) {
  const n = Number.parseInt(
    String(value ?? ""),
    10
  );

  if (!Number.isFinite(n)) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(min, n)
  );
}

function clampFloat(
  value,
  fallback,
  min,
  max
) {
  const n = Number.parseFloat(
    String(value ?? "")
  );

  if (!Number.isFinite(n)) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(min, n)
  );
}

function envBool(
  value,
  fallback = false
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return [
    "1",
    "true",
    "yes",
    "on",
  ].includes(
    String(value).toLowerCase()
  );
}

function sleep(ms) {
  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );
}

function nowIso() {
  return new Date().toISOString();
}

function randomSeed() {
  return crypto.randomInt(
    1,
    2_147_483_646
  );
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
      ""
    );
}

function truncate(
  value,
  max = 300
) {
  const text =
    String(value ?? "");

  return text.length <= max
    ? text
    : `${text.slice(
        0,
        max - 1
      )}…`;
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

function toAbsoluteUrl(
  value,
  baseUrl
) {
  if (!value) {
    return null;
  }

  try {
    return new URL(
      String(value).trim(),
      baseUrl
    ).href;
  } catch {
    return null;
  }
}

function decodeHtmlUrl(
  value
) {
  if (!value) {
    return value;
  }

  let output =
    String(value);

  try {
    output =
      decodeURIComponent(
        output
      );
  } catch {}

  return output
    .replaceAll(
      "&amp;",
      "&"
    )
    .replaceAll(
      "&quot;",
      '"'
    )
    .replaceAll(
      "&#39;",
      "'"
    );
}

function stripHtml(
  value = ""
) {
  return String(value)
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<noscript[\s\S]*?<\/noscript>/gi,
      " "
    )
    .replace(
      /<[^>]+>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
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
      /\s+/g,
      " "
    )
    .trim();
}

function escapeRegExp(
  value
) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function getMeta(
  html,
  key
) {
  const escaped =
    escapeRegExp(key);

  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),

    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,
      "i"
    ),
  ];

  for (const regex of patterns) {
    const match =
      String(html).match(
        regex
      );

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function getHtmlTitle(
  html
) {
  const match =
    String(html).match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    );

  return match?.[1]
    ? stripHtml(match[1])
    : null;
}

function uniqByUrl(
  items
) {
  const map =
    new Map();

  for (const item of items || []) {
    if (
      !item?.imageUrl ||
      !isHttpUrl(
        item.imageUrl
      )
    ) {
      continue;
    }

    if (
      !map.has(
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

/* ============================================================================
 * JSON STATE
 * ========================================================================== */

async function readJson(
  file,
  fallback
) {
  try {
    return JSON.parse(
      await fs.readFile(
        file,
        "utf8"
      )
    );
  } catch {
    return fallback;
  }
}

async function writeJson(
  file,
  value
) {
  await fs.mkdir(
    path.dirname(file),
    {
      recursive: true,
    }
  );

  const temporary =
    `${file}.${process.pid}.tmp`;

  await fs.writeFile(
    temporary,
    `${JSON.stringify(
      value,
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

/* ============================================================================
 * TEMPLE PARSER
 * ========================================================================== */

function parseTemples(
  source
) {
  const rows = [
    ...String(source).matchAll(
      /\bslug:\s*["']([^"']+)["'][\s\S]*?\bname:\s*["']([^"']+)["'][\s\S]*?\bcity:\s*["']([^"']+)["']\s*,\s*state:\s*["']([^"']+)["']/g
    ),
  ];

  const temples = [];
  const seen = new Set();

  for (const row of rows) {
    const temple = {
      slug:
        row[1].trim(),

      name:
        row[2].trim(),

      city:
        row[3].trim(),

      state:
        row[4].trim(),
    };

    if (
      !seen.has(
        temple.slug
      )
    ) {
      seen.add(
        temple.slug
      );

      temples.push(
        temple
      );
    }
  }

  return temples;
}

/* ============================================================================
 * HTTP
 * ========================================================================== */

class ProviderRateLimitError extends Error {
  constructor(
    provider,
    waitMs,
    message
  ) {
    super(message);

    this.name =
      "ProviderRateLimitError";

    this.provider =
      provider;

    this.waitMs =
      waitMs;
  }
}

function isProviderCoolingDown(
  provider
) {
  const until =
    Number(
      providerCooldowns[
        provider
      ] || 0
    );

  if (!until) {
    return false;
  }

  if (
    until <=
    Date.now()
  ) {
    delete providerCooldowns[
      provider
    ];

    return false;
  }

  return true;
}

function cooldownRemaining(
  provider
) {
  return Math.max(
    0,
    Number(
      providerCooldowns[
        provider
      ] || 0
    ) - Date.now()
  );
}

function startProviderCooldown(
  provider,
  waitMs
) {
  providerCooldowns[
    provider
  ] =
    Date.now() +
    Math.max(
      PROVIDER_COOLDOWN_MS,
      waitMs || 0
    );
}

function parseRetryAfter(
  value
) {
  if (!value) {
    return 0;
  }

  const seconds =
    Number.parseFloat(
      String(value)
    );

  if (
    Number.isFinite(
      seconds
    )
  ) {
    return Math.max(
      1000,
      seconds * 1000
    );
  }

  const date =
    Date.parse(
      String(value)
    );

  if (
    Number.isFinite(
      date
    )
  ) {
    return Math.max(
      1000,
      date -
        Date.now()
    );
  }

  return 0;
}

async function request(
  url,
  options = {},
  timeoutMs = REQUEST_TIMEOUT_MS,
  provider = "Generic"
) {
  if (
    isProviderCoolingDown(
      provider
    )
  ) {
    const remaining =
      cooldownRemaining(
        provider
      );

    throw new ProviderRateLimitError(
      provider,
      remaining,
      `${provider} is on cooldown`
    );
  }

  let lastError =
    null;

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      const controller =
        new AbortController();

      const timer =
        setTimeout(
          () =>
            controller.abort(),
          timeoutMs
        );

      let response;

      try {
        response =
          await fetch(
            url,
            {
              redirect:
                "follow",

              ...options,

              signal:
                controller.signal,

              headers: {
                "User-Agent":
                  USER_AGENT,

                ...(options.headers ||
                  {}),
              },
            }
          );
      } finally {
        clearTimeout(timer);
      }

      if (
        response.ok
      ) {
        return response;
      }

      if (
        response.status ===
        429
      ) {
        const retryAfter =
          parseRetryAfter(
            response.headers.get(
              "retry-after"
            )
          );

        const waitMs =
          Math.max(
            retryAfter,
            Math.min(
              MAX_BACKOFF_MS,
              INITIAL_BACKOFF_MS *
                2 **
                  (attempt - 1)
            )
          );

        startProviderCooldown(
          provider,
          waitMs
        );

        throw new ProviderRateLimitError(
          provider,
          Math.max(
            PROVIDER_COOLDOWN_MS,
            waitMs
          ),
          `HTTP 429 from ${provider}`
        );
      }

      if (
        response.status >=
        500
      ) {
        const waitMs =
          Math.min(
            MAX_BACKOFF_MS,
            INITIAL_BACKOFF_MS *
              2 **
                (attempt - 1)
          );

        console.log(
          `        ↻ ${provider} HTTP ${response.status}; retrying in ${Math.ceil(
            waitMs / 1000
          )}s`
        );

        await sleep(
          waitMs
        );

        continue;
      }

      throw new Error(
        `HTTP ${response.status} from ${provider}`
      );
    } catch (error) {
      lastError =
        error;

      if (
        error instanceof
        ProviderRateLimitError
      ) {
        throw error;
      }

      if (
        attempt >=
        MAX_RETRIES
      ) {
        break;
      }

      const waitMs =
        Math.min(
          MAX_BACKOFF_MS,
          INITIAL_BACKOFF_MS *
            2 **
              (attempt - 1)
        );

      console.log(
        `        ↻ ${provider} network retry ${attempt}/${MAX_RETRIES}; waiting ${Math.ceil(
          waitMs / 1000
        )}s`
      );

      await sleep(
        waitMs
      );
    }
  }

  throw (
    lastError ||
    new Error(
      `${provider} request failed`
    )
  );
}

/* ============================================================================
 * LOCAL FILE
 * ========================================================================== */

async function findLocalImage(
  slug
) {
  const cleanSlug =
    safeSlug(slug);

  for (const extension of IMAGE_EXTENSIONS) {
    const filename =
      `${cleanSlug}${extension}`;

    const absolutePath =
      path.join(
        IMAGE_DIR,
        filename
      );

    try {
      const stat =
        await fs.stat(
          absolutePath
        );

      if (
        stat.isFile() &&
        stat.size >=
          MIN_FILE_BYTES
      ) {
        return {
          absolutePath,
          localPath:
            `/images/${filename}`,
          size:
            stat.size,
        };
      }
    } catch {}
  }

  return null;
}

async function countLocalImages(
  temples
) {
  const found = [];
  const missing = [];

  for (const temple of temples) {
    const local =
      await findLocalImage(
        temple.slug
      );

    if (local) {
      found.push({
        ...temple,
        ...local,
      });
    } else {
      missing.push(
        temple
      );
    }
  }

  return {
    count:
      found.length,

    found,

    missing,
  };
}

/* ============================================================================
 * IMAGE CONVERSION
 * ========================================================================== */

async function convertToJpg(
  input,
  output
) {
  try {
    await execFileAsync(
      "magick",
      [
        input,
        "-auto-orient",
        "-resize",
        "1800x1800>",
        "-strip",
        "-sampling-factor",
        "4:2:0",
        "-interlace",
        "Plane",
        "-quality",
        "88",
        output,
      ]
    );

    return "ImageMagick";
  } catch {}

  try {
    await execFileAsync(
      "convert",
      [
        input,
        "-auto-orient",
        "-resize",
        "1800x1800>",
        "-strip",
        "-sampling-factor",
        "4:2:0",
        "-interlace",
        "Plane",
        "-quality",
        "88",
        output,
      ]
    );

    return "ImageMagick legacy";
  } catch {}

  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-i",
        input,
        "-vf",
        "scale=w=1800:h=1800:force_original_aspect_ratio=decrease",
        "-q:v",
        "3",
        output,
      ]
    );

    return "FFmpeg";
  } catch {
    throw new Error(
      "Image conversion failed. Install ImageMagick or FFmpeg."
    );
  }
}

async function saveBufferAsJpg(
  temple,
  buffer
) {
  const slug =
    safeSlug(
      temple.slug
    );

  const temporary =
    path.join(
      IMAGE_DIR,
      `.${slug}.${process.pid}.download`
    );

  const output =
    path.join(
      IMAGE_DIR,
      `${slug}.jpg`
    );

  await fs.mkdir(
    IMAGE_DIR,
    {
      recursive: true,
    }
  );

  /*
   * Never overwrite an existing valid file.
   */
  const existing =
    await findLocalImage(
      temple.slug
    );

  if (existing) {
    return {
      localPath:
        existing.localPath,

      absolutePath:
        existing.absolutePath,

      size:
        existing.size,

      converter:
        "Existing local image",
    };
  }

  await fs.writeFile(
    temporary,
    buffer
  );

  try {
    const converter =
      await convertToJpg(
        temporary,
        output
      );

    const stat =
      await fs.stat(
        output
      );

    if (
      stat.size <
      MIN_FILE_BYTES
    ) {
      await fs
        .unlink(
          output
        )
        .catch(() => {});

      throw new Error(
        `Converted image too small (${stat.size} bytes)`
      );
    }

    return {
      localPath:
        `/images/${slug}.jpg`,

      absolutePath:
        output,

      size:
        stat.size,

      converter,
    };
  } finally {
    await fs
      .unlink(
        temporary
      )
      .catch(() => {});
  }
}

/* ============================================================================
 * DOWNLOAD
 * ========================================================================== */

async function downloadBinary(
  url,
  provider
) {
  await sleep(
    DOWNLOAD_DELAY_MS
  );

  const response =
    await request(
      url,
      {
        headers: {
          Accept:
            "image/avif,image/webp,image/jpeg,image/png,image/*,*/*;q=0.8",
        },
      },
      REQUEST_TIMEOUT_MS,
      provider
    );

  const contentType =
    String(
      response.headers.get(
        "content-type"
      ) || ""
    ).toLowerCase();

  if (
    !contentType.startsWith(
      "image/"
    ) &&
    !contentType.includes(
      "octet-stream"
    )
  ) {
    throw new Error(
      `URL did not return an image (${contentType || "unknown content type"})`
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

  return buffer;
}

/* ============================================================================
 * WIKIMEDIA
 * ========================================================================== */

async function providerCommons(
  temple
) {
  const endpoint =
    new URL(
      "https://commons.wikimedia.org/w/api.php"
    );

  endpoint.searchParams.set(
    "action",
    "query"
  );

  endpoint.searchParams.set(
    "generator",
    "search"
  );

  endpoint.searchParams.set(
    "gsrsearch",
    `"${temple.name}" ${temple.city} ${temple.state}`
  );

  endpoint.searchParams.set(
    "gsrnamespace",
    "6"
  );

  endpoint.searchParams.set(
    "gsrlimit",
    "10"
  );

  endpoint.searchParams.set(
    "prop",
    "imageinfo"
  );

  endpoint.searchParams.set(
    "iiprop",
    "url|size|mime|extmetadata"
  );

  endpoint.searchParams.set(
    "iiurlwidth",
    "1800"
  );

  endpoint.searchParams.set(
    "format",
    "json"
  );

  endpoint.searchParams.set(
    "formatversion",
    "2"
  );

  const response =
    await request(
      endpoint.href,
      {
        headers: {
          Accept:
            "application/json",
        },
      },
      REQUEST_TIMEOUT_MS,
      "Wikimedia Commons"
    );

  const data =
    await response.json();

  const pages =
    Array.isArray(
      data?.query?.pages
    )
      ? data.query.pages
      : [];

  const ranked =
    pages
      .filter(
        page =>
          page?.imageinfo?.[0]
            ?.url
      )
      .map(page => {
        const title =
          String(
            page.title ||
              ""
          ).toLowerCase();

        const info =
          page.imageinfo[0];

        let score = 0;

        const words =
          temple.name
            .toLowerCase()
            .split(
              /[^a-z0-9]+/
            )
            .filter(
              word =>
                word.length >=
                4
            );

        if (
          title.includes(
            temple.city.toLowerCase()
          )
        ) {
          score += 30;
        }

        if (
          title.includes(
            temple.state.toLowerCase()
          )
        ) {
          score += 10;
        }

        if (
          title.includes(
            "temple"
          )
        ) {
          score += 15;
        }

        if (
          title.includes(
            "mandir"
          )
        ) {
          score += 10;
        }

        if (
          title.includes(
            "shrine"
          )
        ) {
          score += 8;
        }

        for (const word of words) {
          if (
            title.includes(
              word
            )
          ) {
            score += 6;
          }
        }

        if (
          (info.width || 0) >=
          1200
        ) {
          score += 5;
        }

        if (
          (info.height || 0) >=
          800
        ) {
          score += 5;
        }

        if (
          /logo|map|flag|poster|icon/i.test(
            title
          )
        ) {
          score -= 100;
        }

        return {
          page,
          info,
          score,
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score
      );

  const best =
    ranked[0];

  if (!best) {
    throw new Error(
      "No suitable Commons image found"
    );
  }

  const metadata =
    best.info.extmetadata ||
    {};

  return {
    provider:
      "Wikimedia Commons",

    imageUrl:
      best.info.thumburl ||
      best.info.url,

    sourcePage:
      `https://commons.wikimedia.org/wiki/${encodeURIComponent(
        best.page.title
      ).replace(
        /%3A/gi,
        ":"
      )}`,

    sourceTitle:
      best.page.title,

    rights:
      metadata.LicenseShortName
        ?.value ||
      "License is shown on the Commons file page; verify before commercial use.",

    width:
      best.info.width ||
      null,

    height:
      best.info.height ||
      null,

    mime:
      best.info.mime ||
      null,

    evidence:
      "Wikimedia Commons API imageinfo",
  };
}

/* ============================================================================
 * WIKIPEDIA
 * ========================================================================== */

async function providerWikipedia(
  temple
) {
  const searchApi =
    new URL(
      "https://en.wikipedia.org/w/api.php"
    );

  searchApi.searchParams.set(
    "action",
    "query"
  );

  searchApi.searchParams.set(
    "list",
    "search"
  );

  searchApi.searchParams.set(
    "srsearch",
    `${temple.name} ${temple.city} ${temple.state}`
  );

  searchApi.searchParams.set(
    "srlimit",
    "5"
  );

  searchApi.searchParams.set(
    "format",
    "json"
  );

  searchApi.searchParams.set(
    "formatversion",
    "2"
  );

  const response =
    await request(
      searchApi.href,
      {
        headers: {
          Accept:
            "application/json",
        },
      },
      REQUEST_TIMEOUT_MS,
      "Wikipedia"
    );

  const data =
    await response.json();

  const results =
    data?.query?.search ||
    [];

  if (!results.length) {
    throw new Error(
      "No Wikipedia page found"
    );
  }

  for (const result of results) {
    const title =
      result?.title;

    if (!title) {
      continue;
    }

    await sleep(
      REQUEST_DELAY_MS
    );

    const pageApi =
      new URL(
        "https://en.wikipedia.org/w/api.php"
      );

    pageApi.searchParams.set(
      "action",
      "query"
    );

    pageApi.searchParams.set(
      "prop",
      "pageimages"
    );

    pageApi.searchParams.set(
      "titles",
      title
    );

    pageApi.searchParams.set(
      "piprop",
      "thumbnail|original|name"
    );

    pageApi.searchParams.set(
      "pithumbsize",
      "1800"
    );

    pageApi.searchParams.set(
      "format",
      "json"
    );

    pageApi.searchParams.set(
      "formatversion",
      "2"
    );

    const pageResponse =
      await request(
        pageApi.href,
        {
          headers: {
            Accept:
              "application/json",
          },
        },
        REQUEST_TIMEOUT_MS,
        "Wikipedia"
      );

    const pageData =
      await pageResponse.json();

    const page =
      pageData?.query
        ?.pages?.[0];

    const image =
      page?.original?.source ||
      page?.thumbnail?.source;

    if (!image) {
      continue;
    }

    return {
      provider:
        "Wikipedia",

      imageUrl:
        image,

      sourcePage:
        `https://en.wikipedia.org/wiki/${encodeURIComponent(
          String(
            title
          ).replaceAll(
            " ",
            "_"
          )
        )}`,

      sourceTitle:
        title,

      rights:
        "Verify the underlying image/file license before commercial use.",

      width:
        page?.original?.width ||
        page?.thumbnail?.width ||
        null,

      height:
        page?.original?.height ||
        page?.thumbnail?.height ||
        null,

      mime: null,

      evidence:
        "Wikipedia pageimages API",
    };
  }

  throw new Error(
    "Wikipedia pages had no usable image"
  );
}

/* ============================================================================
 * SEARCH QUERIES
 * ========================================================================== */

function buildSearchQueries(
  temple
) {
  const name =
    temple.name;

  const city =
    temple.city;

  const state =
    temple.state;

  const queries = [
    `"${name}" ${city} ${state} temple`,
    `"${name}" ${city} ${state} mandir`,
    `"${name}" ${city} India shrine`,
    `"${name}" ${state} temple`,
  ];

  /*
   * Special terminology helps with Shakti Peethas and Jyotirlingas.
   */
  if (
    /shakti|peetha|devi|mata|maa|mahadevi/i.test(
      name
    )
  ) {
    queries.push(
      `"${name}" ${city} Shakti Peetha`,
      `"${name}" ${state} Shakti Peeth`
    );
  }

  if (
    /jyotirling|jyotirlinga|mahadev|kashi|kedarnath|somnath/i.test(
      name
    )
  ) {
    queries.push(
      `"${name}" Jyotirlinga`,
      `"${name}" Jyotirling`
    );
  }

  return [
    ...new Set(
      queries
    ),
  ];
}

/* ============================================================================
 * DUCKDUCKGO WEB SEARCH
 * ========================================================================== */

function extractSearchResultUrls(
  html
) {
  const urls =
    new Set();

  const patterns = [
    /href=["']\/l\/\?uddg=([^"']+)["']/gi,
    /href=["'](https?:\/\/[^"']+)["']/gi,
  ];

  for (const regex of patterns) {
    for (const match of html.matchAll(
      regex
    )) {
      let url =
        decodeHtmlUrl(
          match[1]
        );

      if (
        !isHttpUrl(
          url
        )
      ) {
        continue;
      }

      try {
        const parsed =
          new URL(url);

        parsed.hash = "";

        urls.add(
          parsed.href
        );
      } catch {}
    }
  }

  return [
    ...urls,
  ];
}

async function duckDuckGoSearch(
  query
) {
  const endpoint =
    new URL(
      "https://html.duckduckgo.com/html/"
    );

  endpoint.searchParams.set(
    "q",
    query
  );

  const response =
    await request(
      endpoint.href,
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml",
        },
      },
      PAGE_TIMEOUT_MS,
      "DuckDuckGo"
    );

  return response.text();
}

function extractCandidateImages(
  html,
  pageUrl
) {
  const candidates =
    [];

  const metaKeys = [
    "og:image",
    "og:image:url",
    "twitter:image",
    "twitter:image:src",
  ];

  for (const key of metaKeys) {
    const value =
      getMeta(
        html,
        key
      );

    const absolute =
      toAbsoluteUrl(
        value,
        pageUrl
      );

    if (
      absolute
    ) {
      candidates.push({
        imageUrl:
          absolute,

        evidence:
          key,
      });
    }
  }

  /*
   * JSON-LD
   */
  const jsonLdRegex =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(
    jsonLdRegex
  )) {
    try {
      const parsed =
        JSON.parse(
          match[1]
        );

      const nodes =
        Array.isArray(
          parsed
        )
          ? parsed
          : [parsed];

      for (const node of nodes) {
        const images = [];

        if (
          typeof node?.image ===
          "string"
        ) {
          images.push(
            node.image
          );
        }

        if (
          Array.isArray(
            node?.image
          )
        ) {
          images.push(
            ...node.image
          );
        }

        if (
          typeof node?.image?.url ===
          "string"
        ) {
          images.push(
            node.image.url
          );
        }

        for (const image of images) {
          const absolute =
            toAbsoluteUrl(
              image,
              pageUrl
            );

          if (
            absolute
          ) {
            candidates.push({
              imageUrl:
                absolute,

              evidence:
                "JSON-LD image",
            });
          }
        }
      }
    } catch {}
  }

  /*
   * Raw image URLs in page source.
   */
  const rawImageRegex =
    /https?:\/\/[^"'\\\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s<>]*)?/gi;

  for (const match of html.matchAll(
    rawImageRegex
  )) {
    const url =
      decodeHtmlUrl(
        match[0]
      );

    if (
      isHttpUrl(
        url
      )
    ) {
      candidates.push({
        imageUrl:
          url,

        evidence:
          "Direct image URL in page source",
      });
    }
  }

  return uniqByUrl(
    candidates
  );
}

function scoreSearchPage(
  pageUrl,
  html,
  temple
) {
  const host =
    hostOf(
      pageUrl
    );

  const text =
    stripHtml(
      html
    ).toLowerCase();

  const name =
    temple.name.toLowerCase();

  const city =
    temple.city.toLowerCase();

  const state =
    temple.state.toLowerCase();

  let score = 0;

  if (
    text.includes(name)
  ) {
    score += 30;
  }

  if (
    text.includes(city)
  ) {
    score += 20;
  }

  if (
    text.includes(state)
  ) {
    score += 10;
  }

  if (
    text.includes(
      "temple"
    )
  ) {
    score += 15;
  }

  if (
    text.includes(
      "mandir"
    )
  ) {
    score += 10;
  }

  if (
    text.includes(
      "shakti peetha"
    )
  ) {
    score += 10;
  }

  if (
    text.includes(
      "jyotirlinga"
    )
  ) {
    score += 10;
  }

  if (
    host.endsWith(
      ".gov.in"
    )
  ) {
    score += 50;
  }

  if (
    host.endsWith(
      ".nic.in"
    )
  ) {
    score += 45;
  }

  if (
    host.includes(
      "tourism"
    )
  ) {
    score += 25;
  }

  if (
    host.includes(
      "temple"
    )
  ) {
    score += 15;
  }

  if (
    getMeta(
      html,
      "og:image"
    )
  ) {
    score += 20;
  }

  return score;
}

async function providerDuckDuckGoWeb(
  temple
) {
  const queries =
    buildSearchQueries(
      temple
    );

  const pageUrls =
    [];

  for (const query of queries) {
    console.log(
      `        Search: ${query}`
    );

    try {
      const html =
        await duckDuckGoSearch(
          query
        );

      pageUrls.push(
        ...extractSearchResultUrls(
          html
        )
      );
    } catch (error) {
      console.log(
        `        ↳ Search failed: ${truncate(
          error.message,
          180
        )}`
      );
    }

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  const uniquePages = [
    ...new Set(
      pageUrls
    ),
  ].slice(
    0,
    20
  );

  if (
    !uniquePages.length
  ) {
    throw new Error(
      "DuckDuckGo returned no web pages"
    );
  }

  const candidates =
    [];

  for (const pageUrl of uniquePages) {
    try {
      const response =
        await request(
          pageUrl,
          {
            headers: {
              Accept:
                "text/html,application/xhtml+xml,text/html;q=0.9,*/*;q=0.8",
            },
          },
          PAGE_TIMEOUT_MS,
          "DuckDuckGo Web Search"
        );

      const html =
        await response.text();

      const score =
        scoreSearchPage(
          pageUrl,
          html,
          temple
        );

      const pageImages =
        extractCandidateImages(
          html,
          pageUrl
        );

      for (const image of pageImages) {
        candidates.push({
          ...image,

          sourcePage:
            pageUrl,

          sourceTitle:
            getHtmlTitle(
              html
            ),

          sourceHost:
            hostOf(
              pageUrl
            ),

          score,
        });
      }
    } catch {
      // Continue to next page.
    }

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  candidates.sort(
    (a, b) =>
      b.score - a.score
  );

  const ranked =
    uniqByUrl(
      candidates
    );

  if (!ranked.length) {
    throw new Error(
      "No downloadable webpage image found"
    );
  }

  let lastError =
    null;

  /*
   * Try multiple image candidates, not only the first one.
   */
  for (
    let index = 0;
    index <
      Math.min(
        ranked.length,
        15
      );
    index++
  ) {
    const candidate =
      ranked[index];

    try {
      const buffer =
        await downloadBinary(
          candidate.imageUrl,
          "DuckDuckGo Web Search"
        );

      return {
        provider:
          "DuckDuckGo Web Search",

        buffer,

        imageUrl:
          candidate.imageUrl,

        sourcePage:
          candidate.sourcePage,

        sourceTitle:
          candidate.sourceTitle ||
          candidate.sourceHost,

        rights:
          "External webpage image. Verify original source copyright/license before commercial use.",

        width:
          null,

        height:
          null,

        mime:
          null,

        evidence:
          candidate.evidence,
      };
    } catch (error) {
      lastError =
        error;

      console.log(
        `        ↳ Candidate ${index + 1} failed: ${truncate(
          error.message,
          180
        )}`
      );
    }
  }

  throw new Error(
    `DuckDuckGo found candidates but none downloaded${
      lastError
        ? `: ${lastError.message}`
        : ""
    }`
  );
}

/* ============================================================================
 * GOOGLE CUSTOM SEARCH
 * ========================================================================== */

async function providerGoogle(
  temple
) {
  if (
    !GOOGLE_API_KEY ||
    !GOOGLE_CX
  ) {
    throw new Error(
      "Google API credentials not configured"
    );
  }

  const queries =
    buildSearchQueries(
      temple
    );

  const candidates =
    [];

  for (const query of queries.slice(
    0,
    4
  )) {
    const endpoint =
      new URL(
        "https://www.googleapis.com/customsearch/v1"
      );

    endpoint.searchParams.set(
      "key",
      GOOGLE_API_KEY
    );

    endpoint.searchParams.set(
      "cx",
      GOOGLE_CX
    );

    endpoint.searchParams.set(
      "q",
      query
    );

    endpoint.searchParams.set(
      "searchType",
      "image"
    );

    endpoint.searchParams.set(
      "num",
      "10"
    );

    endpoint.searchParams.set(
      "safe",
      "active"
    );

    const response =
      await request(
        endpoint.href,
        {
          headers: {
            Accept:
              "application/json",
          },
        },
        REQUEST_TIMEOUT_MS,
        "Google Custom Search"
      );

    const data =
      await response.json();

    const items =
      Array.isArray(
        data?.items
      )
        ? data.items
        : [];

    for (const item of items) {
      if (
        !isHttpUrl(
          item?.link
        )
      ) {
        continue;
      }

      candidates.push({
        imageUrl:
          item.link,

        sourcePage:
          item.image
            ?.contextLink ||
          item.link,

        sourceTitle:
          item.title ||
          null,

        width:
          item.image?.width ||
          null,

        height:
          item.image?.height ||
          null,

        score:
          (item.image?.width ||
            0) +
          (item.image?.height ||
            0),

        evidence:
          "Google Custom Search image result",
      });
    }

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  const ranked =
    uniqByUrl(
      candidates
    ).sort(
      (a, b) =>
        b.score - a.score
    );

  if (!ranked.length) {
    throw new Error(
      "Google returned no image results"
    );
  }

  for (const candidate of ranked.slice(
    0,
    12
  )) {
    try {
      const buffer =
        await downloadBinary(
          candidate.imageUrl,
          "Google Custom Search"
        );

      return {
        provider:
          "Google Custom Search",

        buffer,

        imageUrl:
          candidate.imageUrl,

        sourcePage:
          candidate.sourcePage,

        sourceTitle:
          candidate.sourceTitle,

        rights:
          "Google search result; verify original source copyright/license before commercial use.",

        width:
          candidate.width,

        height:
          candidate.height,

        mime:
          null,

        evidence:
          candidate.evidence,
      };
    } catch {}
  }

  throw new Error(
    "Google image results were not downloadable"
  );
}

/* ============================================================================
 * BING IMAGE SEARCH
 * ========================================================================== */

async function providerBing(
  temple
) {
  if (
    !BING_IMAGE_SEARCH_KEY
  ) {
    throw new Error(
      "Bing API credentials not configured"
    );
  }

  const endpoint =
    new URL(
      "https://api.bing.microsoft.com/v7.0/images/search"
    );

  endpoint.searchParams.set(
    "q",
    `${temple.name} ${temple.city} ${temple.state} temple India`
  );

  endpoint.searchParams.set(
    "count",
    "20"
  );

  endpoint.searchParams.set(
    "safeSearch",
    "Strict"
  );

  const response =
    await request(
      endpoint.href,
      {
        headers: {
          Accept:
            "application/json",

          "Ocp-Apim-Subscription-Key":
            BING_IMAGE_SEARCH_KEY,
        },
      },
      REQUEST_TIMEOUT_MS,
      "Bing Image Search"
    );

  const data =
    await response.json();

  const values =
    Array.isArray(
      data?.value
    )
      ? data.value
      : [];

  if (!values.length) {
    throw new Error(
      "Bing returned no image results"
    );
  }

  const ranked =
    values
      .filter(
        item =>
          isHttpUrl(
            item?.contentUrl
          )
      )
      .map(item => {
        let score = 0;

        const text =
          `${item.name || ""} ${
            item.hostPageTitle ||
            ""
          }`.toLowerCase();

        if (
          text.includes(
            temple.city.toLowerCase()
          )
        ) {
          score += 20;
        }

        if (
          text.includes(
            "temple"
          )
        ) {
          score += 15;
        }

        if (
          (item.width || 0) >=
          1200
        ) {
          score += 10;
        }

        if (
          (item.height || 0) >=
          800
        ) {
          score += 10;
        }

        return {
          imageUrl:
            item.contentUrl,

          sourcePage:
            item.hostPageUrl ||
            item.contentUrl,

          sourceTitle:
            item.name ||
            item.hostPageTitle ||
            null,

          width:
            item.width ||
            null,

          height:
            item.height ||
            null,

          score,
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score
      );

  for (const candidate of ranked) {
    try {
      const buffer =
        await downloadBinary(
          candidate.imageUrl,
          "Bing Image Search"
        );

      return {
        provider:
          "Bing Image Search",

        buffer,

        imageUrl:
          candidate.imageUrl,

        sourcePage:
          candidate.sourcePage,

        sourceTitle:
          candidate.sourceTitle,

        rights:
          "Bing search result; verify original source copyright/license before commercial use.",

        width:
          candidate.width,

        height:
          candidate.height,

        mime:
          null,

        evidence:
          "Bing Image Search result",
      };
    } catch {}
  }

  throw new Error(
    "Bing image results were not downloadable"
  );
}

/* ============================================================================
 * OFFICIAL / GOVERNMENT / TOURISM
 * ========================================================================== */

function trustedOfficialHost(
  host
) {
  const value =
    String(
      host || ""
    ).toLowerCase();

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
      "trust"
    ) ||
    value.includes(
      "mandir"
    )
  );
}

function officialSourceKind(
  host
) {
  const value =
    String(
      host || ""
    ).toLowerCase();

  if (
    value.endsWith(
      ".gov.in"
    ) ||
    value.endsWith(
      ".nic.in"
    )
  ) {
    return "Government / Tourism Website";
  }

  if (
    value.includes(
      "tourism"
    )
  ) {
    return "Tourism Website";
  }

  if (
    value.includes(
      "trust"
    )
  ) {
    return "Temple Trust Website";
  }

  return "Official Temple Website";
}

async function providerOfficialWeb(
  temple
) {
  const queries = [
    `"${temple.name}" ${temple.city} official`,
    `"${temple.name}" ${temple.city} tourism`,
    `"${temple.name}" ${temple.state} government`,
    `"${temple.name}" temple trust`,
  ];

  const pageUrls =
    [];

  for (const query of queries) {
    try {
      const html =
        await duckDuckGoSearch(
          query
        );

      pageUrls.push(
        ...extractSearchResultUrls(
          html
        )
      );
    } catch {}

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  const uniquePages =
    [
      ...new Set(
        pageUrls
      ),
    ].slice(
      0,
      20
    );

  const candidates =
    [];

  for (const pageUrl of uniquePages) {
    const host =
      hostOf(
        pageUrl
      );

    if (
      !trustedOfficialHost(
        host
      )
    ) {
      continue;
    }

    try {
      const response =
        await request(
          pageUrl,
          {
            headers: {
              Accept:
                "text/html,application/xhtml+xml,text/html;q=0.9,*/*;q=0.8",
            },
          },
          PAGE_TIMEOUT_MS,
          "Official Web Search"
        );

      const html =
        await response.text();

      const text =
        stripHtml(
          html
        ).toLowerCase();

      let score = 0;

      if (
        host.endsWith(
          ".gov.in"
        )
      ) {
        score += 60;
      }

      if (
        host.endsWith(
          ".nic.in"
        )
      ) {
        score += 50;
      }

      if (
        host.includes(
          "tourism"
        )
      ) {
        score += 30;
      }

      if (
        text.includes(
          temple.name.toLowerCase()
        )
      ) {
        score += 30;
      }

      if (
        text.includes(
          temple.city.toLowerCase()
        )
      ) {
        score += 20;
      }

      for (const image of extractCandidateImages(
        html,
        pageUrl
      )) {
        candidates.push({
          ...image,

          sourcePage:
            pageUrl,

          sourceTitle:
            getHtmlTitle(
              html
            ),

          sourceHost:
            host,

          score,
        });
      }
    } catch {}

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  candidates.sort(
    (a, b) =>
      b.score - a.score
  );

  if (!candidates.length) {
    throw new Error(
      "No official/government/tourism image found"
    );
  }

  for (const candidate of candidates.slice(
    0,
    15
  )) {
    try {
      const buffer =
        await downloadBinary(
          candidate.imageUrl,
          "Official Web Search"
        );

      return {
        provider:
          officialSourceKind(
            candidate.sourceHost
          ),

        buffer,

        imageUrl:
          candidate.imageUrl,

        sourcePage:
          candidate.sourcePage,

        sourceTitle:
          candidate.sourceTitle ||
          candidate.sourceHost,

        rights:
          "External official/government/tourism webpage image. Verify copyright/license before commercial use.",

        width:
          null,

        height:
          null,

        mime:
          null,

        evidence:
          candidate.evidence,
      };
    } catch {}
  }

  throw new Error(
    "Official pages contained images but none were downloadable"
  );
}

/* ============================================================================
 * COMFYUI
 * ========================================================================== */

function buildAiPrompt(
  temple
) {
  return [
    `Create a highly photorealistic documentary travel photograph of ${temple.name}, located in ${temple.city}, ${temple.state}, India.`,

    "Authentic Indian sacred architecture appropriate to the geographical region.",

    "Respectful Hindu devotional atmosphere and realistic pilgrimage setting.",

    "Natural daylight, physically accurate shadows, realistic perspective and believable human scale.",

    "Premium professional travel photography, DSLR quality, ultra-detailed realistic stone and architectural textures.",

    "Realistic vegetation, atmosphere, sky and surrounding environment.",

    "No fantasy architecture, no cartoon, no illustration, no CGI appearance.",

    "Do not invent readable temple signage, logos, watermarks or brand marks.",

    "No distorted buildings, no duplicate people, no malformed objects.",

    "The result should look like a genuine professional travel photograph.",
  ].join(
    " "
  );
}

function buildComfyWorkflow(
  temple
) {
  const seed =
    randomSeed();

  const positivePrompt =
    buildAiPrompt(
      temple
    );

  const negativePrompt = [
    "cartoon",
    "anime",
    "painting",
    "illustration",
    "3d render",
    "cgi",
    "fantasy architecture",
    "surreal",
    "low quality",
    "blurry",
    "pixelated",
    "watermark",
    "logo",
    "text",
    "bad perspective",
    "deformed building",
    "duplicate people",
    "distorted people",
    "oversaturated",
  ].join(
    ", "
  );

  /*
   * Standard ComfyUI API workflow.
   *
   * It uses common built-in nodes:
   * CheckpointLoaderSimple
   * CLIPTextEncode
   * EmptyLatentImage
   * KSampler
   * VAEDecode
   * SaveImage
   */
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

        denoise: 1,

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
          COMFYUI_CHECKPOINT,
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

        batch_size: 1,
      },
    },

    "6": {
      class_type:
        "CLIPTextEncode",

      inputs: {
        text:
          positivePrompt,

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
          `DharmYatra/${safeSlug(
            temple.slug
          )}`,

        images: [
          "8",
          0,
        ],
      },
    },
  };
}

async function comfyRequest(
  url,
  options = {}
) {
  return request(
    url,
    options,
    REQUEST_TIMEOUT_MS,
    "ComfyUI"
  );
}

async function providerComfyUI(
  temple
) {
  /*
   * First verify that ComfyUI is reachable.
   */
  const systemResponse =
    await comfyRequest(
      `${COMFYUI_URL}/system_stats`,
      {
        headers: {
          Accept:
            "application/json",
        },
      }
    );

  if (
    !systemResponse.ok
  ) {
    throw new Error(
      "ComfyUI is not reachable"
    );
  }

  const workflow =
    buildComfyWorkflow(
      temple
    );

  const queueResponse =
    await comfyRequest(
      `${COMFYUI_URL}/prompt`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body: JSON.stringify({
          prompt:
            workflow,

          client_id:
            `dharmyatra-${process.pid}`,
        }),
      }
    );

  const queueData =
    await queueResponse.json();

  if (
    queueData?.error
  ) {
    throw new Error(
      `ComfyUI queue error: ${JSON.stringify(
        queueData.error
      )}`
    );
  }

  const promptId =
    queueData?.prompt_id;

  if (!promptId) {
    throw new Error(
      `ComfyUI did not return prompt_id: ${JSON.stringify(
        queueData
      )}`
    );
  }

  console.log(
    `        ComfyUI prompt: ${promptId}`
  );

  const startedAt =
    Date.now();

  let history = null;

  while (
    Date.now() -
      startedAt <
    COMFYUI_MAX_WAIT_MS
  ) {
    await sleep(
      COMFYUI_POLL_MS
    );

    const historyResponse =
      await comfyRequest(
        `${COMFYUI_URL}/history/${encodeURIComponent(
          promptId
        )}`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

    const historyData =
      await historyResponse.json();

    history =
      historyData?.[
        promptId
      ];

    if (!history) {
      continue;
    }

    if (
      history.status
        ?.status_str ===
      "error"
    ) {
      throw new Error(
        `ComfyUI generation error: ${JSON.stringify(
          history.status
        )}`
      );
    }

    if (
      history.status
        ?.completed ||
      history.outputs
    ) {
      break;
    }
  }

  if (!history) {
    throw new Error(
      "ComfyUI generation timed out"
    );
  }

  const outputImages =
    [];

  for (const nodeOutput of Object.values(
    history.outputs || {}
  )) {
    for (const image of
      nodeOutput?.images || []) {
      if (
        image?.filename
      ) {
        outputImages.push(
          image
        );
      }
    }
  }

  if (
    !outputImages.length
  ) {
    throw new Error(
      "ComfyUI finished without an image output"
    );
  }

  const image =
    outputImages[0];

  const viewUrl =
    new URL(
      `${COMFYUI_URL}/view`
    );

  viewUrl.searchParams.set(
    "filename",
    image.filename
  );

  viewUrl.searchParams.set(
    "subfolder",
    image.subfolder ||
      ""
  );

  viewUrl.searchParams.set(
    "type",
    image.type ||
      "output"
  );

  const imageResponse =
    await comfyRequest(
      viewUrl.href,
      {
        headers: {
          Accept:
            "image/*",
        },
      }
    );

  const buffer =
    Buffer.from(
      await imageResponse.arrayBuffer()
    );

  if (
    buffer.length <
    MIN_FILE_BYTES
  ) {
    throw new Error(
      `ComfyUI output too small (${buffer.length} bytes)`
    );
  }

  return {
    provider:
      "ComfyUI (AI Generated)",

    isAiGenerated:
      true,

    buffer,

    imageUrl:
      viewUrl.href,

    sourcePage:
      COMFYUI_URL,

    sourceTitle:
      `Local ComfyUI AI - ${temple.name}`,

    rights:
      "AI-generated locally using the configured ComfyUI model/workflow.",

    width:
      COMFYUI_WIDTH,

    height:
      COMFYUI_HEIGHT,

    mime:
      "image/png",

    evidence:
      `ComfyUI prompt_id=${promptId}; generated locally`,
  };
}

/* ============================================================================
 * MASTER PROVIDER CHAIN
 * ========================================================================== */

async function findBestImage(
  temple
) {
  const providers = [
    {
      name:
        "Wikimedia Commons",

      run:
        () =>
          providerCommons(
            temple
          ),
    },

    {
      name:
        "Wikipedia",

      run:
        () =>
          providerWikipedia(
            temple
          ),
    },

    {
      name:
        "DuckDuckGo Web Search",

      run:
        () =>
          providerDuckDuckGoWeb(
            temple
          ),
    },

    {
      name:
        "Google Custom Search",

      enabled:
        Boolean(
          GOOGLE_API_KEY &&
            GOOGLE_CX
        ),

      run:
        () =>
          providerGoogle(
            temple
          ),
    },

    {
      name:
        "Bing Image Search",

      enabled:
        Boolean(
          BING_IMAGE_SEARCH_KEY
        ),

      run:
        () =>
          providerBing(
            temple
          ),
    },

    {
      name:
        "Official / Government / Tourism",

      run:
        () =>
          providerOfficialWeb(
            temple
          ),
    },
  ];

  if (
    AI_FALLBACK
  ) {
    providers.push({
      name:
        "ComfyUI AI",

      run:
        () =>
          providerComfyUI(
            temple
          ),
    });
  }

  const errors =
    [];

  for (const provider of providers) {
    if (
      provider.enabled ===
      false
    ) {
      continue;
    }

    if (
      isProviderCoolingDown(
        provider.name
      )
    ) {
      const remain =
        cooldownRemaining(
          provider.name
        );

      console.log(
        `      → ${provider.name} SKIP - cooldown ${Math.ceil(
          remain / 1000
        )}s`
      );

      errors.push({
        provider:
          provider.name,

        error:
          "Provider cooldown active",
      });

      continue;
    }

    console.log(
      `      → ${provider.name}`
    );

    try {
      const result =
        await provider.run();

      if (
        result?.buffer ||
        result?.imageUrl
      ) {
        return result;
      }

      throw new Error(
        "Provider returned no usable image"
      );
    } catch (error) {
      if (
        error instanceof
        ProviderRateLimitError
      ) {
        startProviderCooldown(
          provider.name,
          error.waitMs
        );

        console.log(
          `        ⏸ ${provider.name} rate-limited; moving to next provider`
        );
      } else {
        console.log(
          `        ✗ ${truncate(
            error?.message ||
              String(error),
            500
          )}`
        );
      }

      errors.push({
        provider:
          provider.name,

        error:
          truncate(
            error?.message ||
              String(error),
            1000
          ),
      });
    }

    await sleep(
      REQUEST_DELAY_MS
    );
  }

  throw new Error(
    errors.length
      ? errors
          .map(
            item =>
              `${item.provider}: ${item.error}`
          )
          .join(
            " | "
          )
      : "No image provider succeeded"
  );
}

/* ============================================================================
 * LOCK MANAGEMENT
 * ========================================================================== */

async function acquireLock() {
  /*
   * Detect stale lock.
   */
  try {
    const existing =
      JSON.parse(
        await fs.readFile(
          LOCK_FILE,
          "utf8"
        )
      );

    if (
      existing?.pid
    ) {
      const pid =
        Number(
          existing.pid
        );

      try {
        process.kill(
          pid,
          0
        );

        console.error("");

        console.error(
          `✗ Another image downloader is already running. PID: ${pid}`
        );

        console.error(
          `  Started: ${
            existing.startedAt ||
            "unknown"
          }`
        );

        return false;
      } catch {
        console.log(
          "⚠ Stale worker lock detected."
        );

        console.log(
          "  Previous process is no longer running."
        );

        console.log(
          "  Removing stale lock..."
        );

        await fs
          .unlink(
            LOCK_FILE
          )
          .catch(() => {});
      }
    }
  } catch {
    /*
     * Invalid/missing lock.
     * Try fresh lock below.
     */
  }

  try {
    const handle =
      await fs.open(
        LOCK_FILE,
        "wx"
      );

    await handle.writeFile(
      JSON.stringify(
        {
          pid:
            process.pid,

          startedAt:
            nowIso(),

          script:
            "download-temple-images.mjs",
        },
        null,
        2
      )
    );

    await handle.close();

    return true;
  } catch {
    console.error(
      `✗ Worker lock exists: ${LOCK_FILE}`
    );

    return false;
  }
}

async function releaseLock() {
  await fs
    .unlink(
      LOCK_FILE
    )
    .catch(() => {});
}

/* ============================================================================
 * STATE
 * ========================================================================== */

let state = null;
let manifest = null;
let failures = null;

async function initializeState(
  temples
) {
  state =
    await readJson(
      STATE_FILE,
      {
        version: 4,

        createdAt:
          nowIso(),

        updatedAt:
          nowIso(),

        jobs: {},

        providerCooldowns:
          {},
      }
    );

  manifest =
    await readJson(
      MANIFEST_FILE,
      {}
    );

  const rawFailures =
    await readJson(
      FAILURES_FILE,
      []
    );

  failures = {};

  if (
    Array.isArray(
      rawFailures
    )
  ) {
    for (const item of rawFailures) {
      if (
        item?.slug
      ) {
        failures[
          item.slug
        ] = item;
      }
    }
  } else if (
    rawFailures &&
    typeof rawFailures ===
      "object"
  ) {
    Object.assign(
      failures,
      rawFailures
    );
  }

  if (
    !state.jobs ||
    typeof state.jobs !==
      "object"
  ) {
    state.jobs = {};
  }

  if (
    state.providerCooldowns &&
    typeof state.providerCooldowns ===
      "object"
  ) {
    for (const [
      provider,
      until,
    ] of Object.entries(
      state.providerCooldowns
    )) {
      if (
        Number(until) >
        Date.now()
      ) {
        providerCooldowns[
          provider
        ] = Number(
          until
        );
      }
    }
  }

  for (const temple of temples) {
    if (
      !state.jobs[
        temple.slug
      ]
    ) {
      state.jobs[
        temple.slug
      ] = {
        slug:
          temple.slug,

        name:
          temple.name,

        city:
          temple.city,

        state:
          temple.state,

        status:
          "pending",

        attempts:
          0,

        downloaded:
          false,

        source:
          null,

        lastError:
          null,

        nextRetryAt:
          null,

        createdAt:
          nowIso(),

        updatedAt:
          nowIso(),
      };
    }
  }
}

async function persistState() {
  if (
    !state
  ) {
    return;
  }

  state.updatedAt =
    nowIso();

  state.providerCooldowns =
    {
      ...providerCooldowns,
    };

  await writeJson(
    STATE_FILE,
    state
  );

  await writeJson(
    MANIFEST_FILE,
    manifest
  );

  await writeJson(
    FAILURES_FILE,
    Object.values(
      failures
    )
  );
}

/* ============================================================================
 * MAIN
 * ========================================================================== */

async function main() {
  await fs.mkdir(
    IMAGE_DIR,
    {
      recursive: true,
    }
  );

  /* ------------------------------------------------------------------------ */
  /* Read temples.ts                                                          */
  /* ------------------------------------------------------------------------ */

  let templesSource;

  try {
    templesSource =
      await fs.readFile(
        TEMPLES_FILE,
        "utf8"
      );
  } catch (error) {
    console.error(
      `✗ Cannot read temples file: ${TEMPLES_FILE}`
    );

    console.error(
      error.message
    );

    process.exitCode =
      2;

    return;
  }

  const temples =
    parseTemples(
      templesSource
    );

  if (
    !temples.length
  ) {
    console.error(
      `✗ No temple records found in ${TEMPLES_FILE}`
    );

    process.exitCode =
      2;

    return;
  }

  await initializeState(
    temples
  );

  /* ------------------------------------------------------------------------ */
  /* Existing count                                                           */
  /* ------------------------------------------------------------------------ */

  const initial =
    await countLocalImages(
      temples
    );

  /*
   * Existing local files are always treated as completed,
   * even when state JSON says otherwise.
   */
  for (const temple of initial.found) {
    const job =
      state.jobs[
        temple.slug
      ];

    job.status =
      "completed";

    job.downloaded =
      true;

    job.lastError =
      null;

    job.nextRetryAt =
      null;

    job.updatedAt =
      nowIso();

    delete failures[
      temple.slug
    ];
  }

  await persistState();

  const remaining =
    initial.missing;

  /* ------------------------------------------------------------------------ */
  /* Header                                                                   */
  /* ------------------------------------------------------------------------ */

  console.log("");

  console.log(
    "========================================================================"
  );

  console.log(
    " DharmYatra - FINAL MASTER TEMPLE IMAGE DOWNLOADER"
  );

  console.log(
    "========================================================================"
  );

  console.log(
    `Total temple records : ${temples.length}`
  );

  console.log(
    `Already downloaded   : ${initial.count}`
  );

  console.log(
    `Remaining            : ${remaining.length}`
  );

  console.log(
    `This run limit       : ${Math.min(
      JOB_LIMIT,
      remaining.length
    )}`
  );

  console.log(
    `Images directory     : ${IMAGE_DIR}`
  );

  console.log(
    `AI fallback          : ${
      AI_FALLBACK
        ? "ON"
        : "OFF"
    }`
  );

  console.log(
    `Google API           : ${
      GOOGLE_API_KEY &&
      GOOGLE_CX
        ? "ON"
        : "OFF"
    }`
  );

  console.log(
    `Bing API             : ${
      BING_IMAGE_SEARCH_KEY
        ? "ON"
        : "OFF"
    }`
  );

  if (
    AI_FALLBACK
  ) {
    console.log(
      `ComfyUI              : ${COMFYUI_URL}`
    );

    console.log(
      `AI checkpoint        : ${COMFYUI_CHECKPOINT}`
    );
  }

  console.log(
    "========================================================================"
  );

  /* ------------------------------------------------------------------------ */
  /* Nothing to do                                                           */
  /* ------------------------------------------------------------------------ */

  if (
    !remaining.length
  ) {
    console.log("");

    console.log(
      `✓ All ${temples.length} temple images are already present.`
    );

    console.log(
      `✓ Verified local images: ${initial.count}/${temples.length}`
    );

    return;
  }

  /* ------------------------------------------------------------------------ */
  /* Lock                                                                     */
  /* ------------------------------------------------------------------------ */

  const locked =
    await acquireLock();

  if (!locked) {
    process.exitCode =
      1;

    return;
  }

  let completedThisRun =
    0;

  let failedThisRun =
    0;

  const limit =
    Math.min(
      JOB_LIMIT,
      remaining.length
    );

  try {
    for (
      let index = 0;
      index < limit;
      index++
    ) {
      const temple =
        remaining[index];

      const job =
        state.jobs[
          temple.slug
        ];

      console.log("");

      console.log(
        "------------------------------------------------------------------------"
      );

      console.log(
        `[${index + 1}/${limit}] ${temple.name}`
      );

      console.log(
        `    ${temple.city}, ${temple.state}`
      );

      console.log(
        `    Target: /images/${safeSlug(
          temple.slug
        )}.jpg`
      );

      /* -------------------------------------------------------------------- */
      /* Re-check local file before doing anything expensive                  */
      /* -------------------------------------------------------------------- */

      const local =
        await findLocalImage(
          temple.slug
        );

      if (local) {
        job.status =
          "completed";

        job.downloaded =
          true;

        job.lastError =
          null;

        job.nextRetryAt =
          null;

        job.updatedAt =
          nowIso();

        delete failures[
          temple.slug
        ];

        await persistState();

        console.log(
          `    ✓ Already exists (${Math.round(
            local.size / 1024
          )} KB) - skipped`
        );

        completedThisRun++;

        continue;
      }

      /* -------------------------------------------------------------------- */
      /* Job start                                                             */
      /* -------------------------------------------------------------------- */

      job.status =
        "running";

      job.downloaded =
        false;

      job.attempts +=
        1;

      job.lastError =
        null;

      job.updatedAt =
        nowIso();

      await persistState();

      try {
        const selected =
          await findBestImage(
            temple
          );

        console.log(
          `    ✓ Provider: ${selected.provider}`
        );

        if (
          selected.sourcePage
        ) {
          console.log(
            `    ✓ Source: ${truncate(
              selected.sourcePage,
              240
            )}`
          );
        }

        const buffer =
          selected.buffer ||
          (await downloadBinary(
            selected.imageUrl,
            selected.provider
          ));

        const saved =
          await saveBufferAsJpg(
            temple,
            buffer
          );

        const record = {
          slug:
            temple.slug,

          name:
            temple.name,

          city:
            temple.city,

          state:
            temple.state,

          localPath:
            saved.localPath,

          provider:
            selected.provider,

          isAiGenerated:
            Boolean(
              selected.isAiGenerated
            ),

          sourcePage:
            selected.sourcePage ||
            null,

          sourceTitle:
            selected.sourceTitle ||
            null,

          directImageUrl:
            selected.imageUrl ||
            null,

          rights:
            selected.rights ||
            null,

          evidence:
            selected.evidence ||
            null,

          width:
            selected.width ||
            null,

          height:
            selected.height ||
            null,

          mime:
            selected.mime ||
            null,

          convertedBy:
            saved.converter,

          fileSize:
            saved.size,

          downloadedAt:
            nowIso(),
        };

        manifest[
          temple.slug
        ] = record;

        job.status =
          "completed";

        job.downloaded =
          true;

        job.source =
          record;

        job.lastError =
          null;

        job.nextRetryAt =
          null;

        job.updatedAt =
          nowIso();

        delete failures[
          temple.slug
        ];

        await persistState();

        console.log(
          `    ✓ DONE: ${saved.localPath}`
        );

        console.log(
          `    ✓ Size: ${Math.round(
            saved.size / 1024
          )} KB`
        );

        if (
          selected.isAiGenerated
        ) {
          console.log(
            "    ⚠ AI GENERATED image - marked in manifest"
          );
        }

        completedThisRun++;
      } catch (error) {
        const retryDelay =
          Math.min(
            MAX_BACKOFF_MS,
            INITIAL_BACKOFF_MS *
              2 **
                Math.max(
                  0,
                  job.attempts - 1
                )
          );

        job.status =
          "failed";

        job.downloaded =
          false;

        job.lastError =
          error?.message ||
          String(error);

        job.nextRetryAt =
          new Date(
            Date.now() +
              retryDelay
          ).toISOString();

        job.updatedAt =
          nowIso();

        failures[
          temple.slug
        ] = {
          slug:
            temple.slug,

          name:
            temple.name,

          city:
            temple.city,

          state:
            temple.state,

          attempts:
            job.attempts,

          error:
            job.lastError,

          nextRetryAt:
            job.nextRetryAt,

          updatedAt:
            nowIso(),
        };

        await persistState();

        console.log("");

        console.log(
          `    ✗ FAILED: ${truncate(
            job.lastError,
            1200
          )}`
        );

        console.log(
          `    ↻ Next run retry after: ${job.nextRetryAt}`
        );

        failedThisRun++;
      }

      if (
        index <
        limit - 1
      ) {
        console.log(
          `    … next temple in ${Math.ceil(
            REQUEST_DELAY_MS /
              1000
          )}s`
        );

        await sleep(
          REQUEST_DELAY_MS
        );
      }
    }
  } finally {
    await releaseLock();
  }

  /* ------------------------------------------------------------------------ */
  /* Final verification                                                       */
  /* ------------------------------------------------------------------------ */

  const final =
    await countLocalImages(
      temples
    );

  await persistState();

  console.log("");

  console.log(
    "========================================================================"
  );

  console.log(
    " Download run finished"
  );

  console.log(
    "========================================================================"
  );

  console.log(
    `Initial local images : ${initial.count}/${temples.length}`
  );

  console.log(
    `Completed this run  : ${completedThisRun}`
  );

  console.log(
    `Failed this run     : ${failedThisRun}`
  );

  console.log(
    `Total local images  : ${final.count}/${temples.length}`
  );

  console.log(
    `Still missing       : ${final.missing.length}`
  );

  console.log(
    `Manifest            : ${MANIFEST_FILE}`
  );

  console.log(
    `Failures            : ${FAILURES_FILE}`
  );

  console.log(
    `Job state           : ${STATE_FILE}`
  );

  console.log(
    "========================================================================"
  );

  if (
    final.missing.length
  ) {
    console.log("");

    console.log(
      "Run the same command again to continue."
    );

    console.log(
      "Existing images will be skipped automatically."
    );
  } else {
    console.log("");

    console.log(
      `🎉 Complete: ${final.count}/${temples.length} temple images are available locally.`
    );
  }
}

/* ============================================================================
 * PROCESS SIGNALS
 * ========================================================================== */

let shuttingDown =
  false;

async function shutdown(
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
    `⚠ Received ${signal}. Releasing lock...`
  );

  await releaseLock();

  process.exit(
    130
  );
}

process.once(
  "SIGINT",
  () =>
    shutdown(
      "SIGINT"
    )
);

process.once(
  "SIGTERM",
  () =>
    shutdown(
      "SIGTERM"
    )
);

/* ============================================================================
 * GLOBAL ERROR HANDLING
 * ========================================================================== */

process.on(
  "uncaughtException",
  async error => {
    console.error("");

    console.error(
      "✗ Uncaught exception:"
    );

    console.error(
      error
    );

    await releaseLock();

    process.exit(
      1
    );
  }
);

process.on(
  "unhandledRejection",
  async error => {
    console.error("");

    console.error(
      "✗ Unhandled rejection:"
    );

    console.error(
      error
    );

    await releaseLock();

    process.exit(
      1
    );
  }
);

/* ============================================================================
 * START
 * ========================================================================== */

main().catch(
  async error => {
    console.error("");

    console.error(
      "✗ Fatal error:"
    );

    console.error(
      error?.stack ||
        error?.message ||
        error
    );

    await releaseLock();

    process.exitCode =
      1;
  }
);