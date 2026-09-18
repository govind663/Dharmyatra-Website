import {
  DEFAULT_LOCATION,
  INDIA_LOCATIONS,
  calculatePanchang,
  getLocalDateParts,
  validateLocation,
  type IndiaRegion,
  type Panchang,
  type PanchangLocation,
} from "./panchang";

/* =========================================================
   TYPES
========================================================= */

export type FestivalCategory =
  | "national"
  | "pan-india"
  | "vrat"
  | "religious"
  | "sankranti"
  | "regional"
  | "seasonal"
  | "observance";

export type FestivalImportance =
  | "major"
  | "important"
  | "regional"
  | "observance";

export type FestivalLanguage =
  | "en"
  | "hi"
  | "mr"
  | "gu"
  | "bn"
  | "ta"
  | "te"
  | "kn"
  | "ml";

export type Festival = {
  id: string;
  dateISO: string;
  title: string;
  shortTitle?: string;
  category: FestivalCategory;
  importance: FestivalImportance;
  isMajor: boolean;
  description?: string;
  region?: IndiaRegion;
  states?: string[];
  city?: string;
  badge?: string;
  language?: FestivalLanguage;

  /**
   * Festival date depends on Tithi/Panchang.
   */
  isTithiBased?: boolean;

  /**
   * Festival date is based primarily on
   * a solar/fixed calendar rule.
   */
  isSolarBased?: boolean;

  /**
   * True when the current rule is only a
   * broad/candidate rule and should not be
   * treated as authoritative exact timing.
   */
  requiresExactRule?: boolean;

  /**
   * Transparent calculation/observance metadata.
   * These fields help the UI explain why a festival is shown
   * and avoid presenting broad rules as universally exact.
   */
  observanceBasis?:
    | "fixed-date"
    | "tithi"
    | "solar"
    | "regional"
    | "panchang-derived"
    | "candidate";
  confidence?: "high" | "medium" | "candidate";
  trustNote?: string;
  relevance?: "pan-india" | "regional" | "state" | "city";
  relevanceReason?: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

export const FESTIVAL_REGIONS: IndiaRegion[] = [
  "north",
  "south",
  "east",
  "west",
  "central",
  "north-east",
  "union-territory",
];

export const FESTIVAL_CATEGORIES: FestivalCategory[] = [
  "national",
  "pan-india",
  "vrat",
  "religious",
  "sankranti",
  "regional",
  "seasonal",
  "observance",
];

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;

const FESTIVAL_CACHE_LIMIT = 2000;

/**
 * Official administrative coverage used by the DharmYatra UI.
 * This is deliberately independent from festival calculation rules:
 * a state being listed here does NOT mean every festival is observed
 * identically across that state. Local sampradaya, temple tradition and
 * regional Panchang conventions can differ.
 */
export const INDIA_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export type IndiaStateOrUT =
  typeof INDIA_STATES_AND_UTS[number];

export const INDIA_STATE_ALIASES: Record<string, IndiaStateOrUT> = {
  ap: "Andhra Pradesh",
  "andhra pradesh": "Andhra Pradesh",
  arunachal: "Arunachal Pradesh",
  assam: "Assam",
  bihar: "Bihar",
  chhattisgarh: "Chhattisgarh",
  cg: "Chhattisgarh",
  goa: "Goa",
  gujarat: "Gujarat",
  haryana: "Haryana",
  himachal: "Himachal Pradesh",
  "himachal pradesh": "Himachal Pradesh",
  jharkhand: "Jharkhand",
  karnataka: "Karnataka",
  kerala: "Kerala",
  "madhya pradesh": "Madhya Pradesh",
  mp: "Madhya Pradesh",
  maharashtra: "Maharashtra",
  mumbai: "Maharashtra",
  pune: "Maharashtra",
  manipur: "Manipur",
  meghalaya: "Meghalaya",
  mizoram: "Mizoram",
  nagaland: "Nagaland",
  odisha: "Odisha",
  orissa: "Odisha",
  punjab: "Punjab",
  rajasthan: "Rajasthan",
  sikkim: "Sikkim",
  "tamil nadu": "Tamil Nadu",
  tamilnadu: "Tamil Nadu",
  telangana: "Telangana",
  tripura: "Tripura",
  "uttar pradesh": "Uttar Pradesh",
  up: "Uttar Pradesh",
  uttarakhand: "Uttarakhand",
  "west bengal": "West Bengal",
  bengal: "West Bengal",
  delhi: "Delhi",
  "new delhi": "Delhi",
  chandigarh: "Chandigarh",
  ladakh: "Ladakh",
  "jammu and kashmir": "Jammu and Kashmir",
  "jammu kashmir": "Jammu and Kashmir",
  puducherry: "Puducherry",
  pondicherry: "Puducherry",
  lakshadweep: "Lakshadweep",
  "andaman and nicobar islands": "Andaman and Nicobar Islands",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
};

export const FESTIVAL_TRUST_NOTE =
  "DharmYatra calculates festival markers from the selected location and Panchang data. Some observances follow regional or sampradaya-specific rules; where an exact rule is not implemented, the festival is clearly marked as a candidate rather than presented as universal fact.";


/* =========================================================
   INTERNAL CACHE
========================================================= */

const festivalDateCache =
  new Map<string, Festival[]>();

/* =========================================================
   DATE VALIDATION
========================================================= */

/**
 * Build a UTC date without the JavaScript Date.UTC() 0-99 year quirk.
 *
 * Date.UTC(1, ...) historically treats 1 as 1901. Using setUTCFullYear()
 * preserves the requested proleptic Gregorian year 1-9999.
 */
function createSafeUTCDate(
  year: number,
  month0: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month0, day);
  date.setUTCHours(hour, minute, second, millisecond);
  return date;
}

/**
 * Resolve the calendar date represented by an instant in the selected
 * location's timezone.
 */
function getCalendarDatePartsForLocation(
  date: Date,
  location: PanchangLocation,
): {
  year: number;
  month0: number;
  day: number;
} {
  const parts = getLocalDateParts(
    date,
    location.timezone,
  );

  return {
    year: parts.year,
    month0: parts.month - 1,
    day: parts.day,
  };
}

function assertValidYear(
  year: number,
): void {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999
  ) {
    throw new RangeError(
      `Invalid festival year: ${year}`,
    );
  }
}

function assertValidMonth(
  month0: number,
): void {
  if (
    !Number.isInteger(month0) ||
    month0 < 0 ||
    month0 > 11
  ) {
    throw new RangeError(
      `Invalid festival month index: ${month0}. Expected 0-11.`,
    );
  }
}

function assertValidDay(
  year: number,
  month0: number,
  day: number,
): void {
  const days =
    createSafeUTCDate(
      year,
      month0 + 1,
      0,
    ).getUTCDate();

  if (
    !Number.isInteger(day) ||
    day < 1 ||
    day > days
  ) {
    throw new RangeError(
      `Invalid festival day: ${year}-${String(
        month0 + 1,
      ).padStart(2, "0")}-${String(day).padStart(
        2,
        "0",
      )}`,
    );
  }
}

function assertValidDateParts(
  year: number,
  month0: number,
  day: number,
): void {
  assertValidYear(year);
  assertValidMonth(month0);
  assertValidDay(
    year,
    month0,
    day,
  );
}

/* =========================================================
   DATE HELPERS
========================================================= */

/**
 * Creates a stable date-only anchor.
 *
 * The application uses UTC noon intentionally so that
 * calendar dates do not shift because of browser timezone
 * conversions.
 */
export function createFestivalDate(
  year: number,
  month0: number,
  day: number,
): Date {
  assertValidDateParts(
    year,
    month0,
    day,
  );

  return createSafeUTCDate(
    year,
    month0,
    day,
    12,
    0,
    0,
    0,
  );
}

export function getFestivalDateISO(
  year: number,
  month0: number,
  day: number,
): string {
  assertValidDateParts(
    year,
    month0,
    day,
  );

  return [
    String(year).padStart(
      4,
      "0",
    ),
    String(month0 + 1).padStart(
      2,
      "0",
    ),
    String(day).padStart(
      2,
      "0",
    ),
  ].join("-");
}

export function parseFestivalDateISO(
  dateISO: string,
): {
  year: number;
  month0: number;
  day: number;
} {
  if (
    typeof dateISO !==
      "string" ||
    !ISO_DATE_PATTERN.test(
      dateISO,
    )
  ) {
    throw new RangeError(
      `Invalid festival date ISO: ${dateISO}`,
    );
  }

  const year =
    Number(
      dateISO.slice(0, 4),
    );

  const month =
    Number(
      dateISO.slice(5, 7),
    );

  const day =
    Number(
      dateISO.slice(8, 10),
    );

  const month0 =
    month - 1;

  assertValidDateParts(
    year,
    month0,
    day,
  );

  const normalized =
    getFestivalDateISO(
      year,
      month0,
      day,
    );

  if (
    normalized !==
    dateISO
  ) {
    throw new RangeError(
      `Invalid normalized festival date: ${dateISO}`,
    );
  }

  return {
    year,
    month0,
    day,
  };
}

export function getDaysInMonth(
  year: number,
  month0: number,
): number {
  assertValidYear(year);
  assertValidMonth(month0);

  return createSafeUTCDate(
    year,
    month0 + 1,
    0,
  ).getUTCDate();
}

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

function normalizeText(
  value?: string,
): string {
  return (
    value
      ?.normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(
        /[^\p{L}\p{N}\s-]/gu,
        "",
      ) ?? ""
  );
}

function normalizeLocationKey(
  location: PanchangLocation,
): string {
  return [
    location.id,
    location.name,
    location.city,
    location.state,
    location.country,
    location.region,
    Number(location.latitude).toFixed(6),
    Number(location.longitude).toFixed(6),
    location.timezone,
  ]
    .map(
      (value) =>
        normalizeText(
          String(value ?? ""),
        ),
    )
    .join("|");
}

/* =========================================================
   FESTIVAL CACHE HELPERS
========================================================= */

function getFestivalCacheKey(
  dateISO: string,
  location: PanchangLocation,
): string {
  return `${dateISO}|${normalizeLocationKey(
    location,
  )}`;
}

function cloneFestival(
  festival: Festival,
): Festival {
  return {
    ...festival,
    states:
      festival.states
        ? [
            ...festival.states,
          ]
        : undefined,
  };
}

function cloneFestivals(
  festivals: Festival[],
): Festival[] {
  return festivals.map(
    cloneFestival,
  );
}

function getCachedFestivals(
  key: string,
): Festival[] | undefined {
  const cached =
    festivalDateCache.get(
      key,
    );

  if (!cached) {
    return undefined;
  }

  /*
   * Refresh insertion order so frequently
   * accessed entries stay in the cache longer.
   */
  festivalDateCache.delete(
    key,
  );

  festivalDateCache.set(
    key,
    cached,
  );

  return cloneFestivals(
    cached,
  );
}

function setCachedFestivals(
  key: string,
  festivals: Festival[],
): void {
  if (
    festivalDateCache.has(
      key,
    )
  ) {
    festivalDateCache.delete(
      key,
    );
  }

  festivalDateCache.set(
    key,
    cloneFestivals(
      festivals,
    ),
  );

  while (
    festivalDateCache.size >
    FESTIVAL_CACHE_LIMIT
  ) {
    const firstKey =
      festivalDateCache.keys().next()
        .value;

    if (
      firstKey ===
      undefined
    ) {
      break;
    }

    festivalDateCache.delete(
      firstKey,
    );
  }
}

/**
 * Clears the internal festival calculation cache.
 *
 * Useful after changing Panchang algorithms or
 * location configuration during development.
 */
export function clearFestivalCache(): void {
  festivalDateCache.clear();
}

/* =========================================================
   INTERNAL FESTIVAL FACTORY
========================================================= */

function createFestival(
  dateISO: string,
  title: string,
  category: FestivalCategory,
  importance: FestivalImportance,
  options?: Partial<
    Omit<
      Festival,
      | "id"
      | "dateISO"
      | "title"
      | "category"
      | "importance"
      | "isMajor"
    >
  >,
): Festival {
  const normalizedTitle =
    normalizeText(title);

  if (!normalizedTitle) {
    throw new TypeError(
      "Festival title cannot be empty.",
    );
  }

  parseFestivalDateISO(
    dateISO,
  );

  const slug =
    normalizedTitle
      .replace(
        // eslint-disable-next-line no-misleading-character-class
        /[^a-z0-9\u0900-\u097f]+/gi,
        "-",
      )
      .replace(
        /^-|-$/g,
        "",
      ) ||
    "festival";

  const festival: Festival = {
    id: `${dateISO}-${slug}`,
    dateISO,
    title,
    category,
    importance,
    isMajor: importance === "major",
    ...options,
  };

  if (!festival.observanceBasis) {
    festival.observanceBasis = festival.requiresExactRule
      ? "candidate"
      : festival.isTithiBased
        ? "tithi"
        : festival.isSolarBased
          ? "solar"
          : category === "regional"
            ? "regional"
            : "fixed-date";
  }

  if (!festival.confidence) {
    festival.confidence = festival.requiresExactRule
      ? "candidate"
      : festival.isTithiBased || festival.isSolarBased
        ? "medium"
        : "high";
  }

  festival.trustNote =
    festival.trustNote ??
    (festival.requiresExactRule
      ? "Regional/traditional observance rule may require a dedicated exact rule; verify local tradition before treating the date as authoritative."
      : FESTIVAL_TRUST_NOTE);

  return festival;
}

/* =========================================================
   PANCHANG HELPERS
========================================================= */

function hasTithi(
  panchang: Panchang,
  name: string,
): boolean {
  return normalizeText(
    panchang.tithi.name,
  ).includes(
    normalizeText(name),
  );
}

function isPurnimaPanchang(
  panchang: Panchang,
): boolean {
  return hasTithi(
    panchang,
    "purnima",
  );
}

function isAmavasyaPanchang(
  panchang: Panchang,
): boolean {
  return hasTithi(
    panchang,
    "amavasya",
  );
}

function isEkadashiPanchang(
  panchang: Panchang,
): boolean {
  return hasTithi(
    panchang,
    "ekadashi",
  );
}

function isMonthBetween(
  month0: number,
  start: number,
  end: number,
): boolean {
  return (
    month0 >= start &&
    month0 <= end
  );
}

/* =========================================================
   PANCHANG-DERIVED SOLAR FESTIVALS
========================================================= */

/**
 * Build solar-ingress festival markers from the selected location.
 *
 * This is intentionally used for Sankranti because a fixed Gregorian date
 * is only an approximation; the actual solar ingress can occur on a
 * different local calendar date.
 */
function getPanchangDerivedSolarFestivals(
  dateISO: string,
  panchang: Panchang,
  location: PanchangLocation,
): Festival[] {
  const ingress = panchang.solarSign?.ingress;

  if (!ingress) {
    return [];
  }

  const ingressParts =
    getCalendarDatePartsForLocation(
      ingress,
      location,
    );

  const ingressISO =
    getFestivalDateISO(
      ingressParts.year,
      ingressParts.month0,
      ingressParts.day,
    );

  if (ingressISO !== dateISO) {
    return [];
  }

  const signName =
    String(
      panchang.solarSign.name ?? "",
    ).trim();

  if (!signName) {
    return [];
  }

  const signNameNormalized =
    normalizeText(signName);

  const title =
    signNameNormalized === "makara"
      ? "Makar Sankranti"
      : `${signName} Sankranti`;

  const isMakar =
    signNameNormalized === "makara";

  return [
    createFestival(
      dateISO,
      title,
      "sankranti",
      isMakar ? "major" : "important",
      {
        shortTitle: title,
        description:
          `Solar ingress into ${signName} using the selected location's Panchang calculation.`,
        badge: "Sankranti",
        isSolarBased: true,
        requiresExactRule: false,
        confidence: "high",
        observanceBasis: "panchang-derived",
        trustNote:
          `${FESTIVAL_TRUST_NOTE} Solar ingress is taken from the selected location's Panchang calculation.`,
        city:
          location.city ??
          location.name,
      },
    ),
  ];
}

/* =========================================================
   NATIONAL FESTIVALS
========================================================= */

function getNationalFestivals(
  year: number,
  month0: number,
  day: number,
): Festival[] {
  const dateISO =
    getFestivalDateISO(
      year,
      month0,
      day,
    );

  const festivals: Festival[] =
    [];

  if (
    month0 === 0 &&
    day === 26
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Republic Day",
        "national",
        "major",
        {
          shortTitle:
            "Republic Day",
          description:
            "Republic Day of India.",
          badge:
            "National",
          isSolarBased: true,
        },
      ),
    );
  }

  if (
    month0 === 7 &&
    day === 15
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Independence Day",
        "national",
        "major",
        {
          shortTitle:
            "Independence Day",
          description:
            "Independence Day of India.",
          badge:
            "National",
          isSolarBased: true,
        },
      ),
    );
  }

  if (
    month0 === 9 &&
    day === 2
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Gandhi Jayanti",
        "national",
        "major",
        {
          shortTitle:
            "Gandhi Jayanti",
          description:
            "Gandhi Jayanti.",
          badge:
            "National",
          isSolarBased: true,
        },
      ),
    );
  }

  return festivals;
}

/* =========================================================
   EKADASHI
========================================================= */

function getEkadashiFestival(
  dateISO: string,
  panchang: Panchang,
): Festival[] {
  if (
    !isEkadashiPanchang(
      panchang,
    )
  ) {
    return [];
  }

  const title =
    panchang.tithi.paksha ===
    "Shukla"
      ? "Shukla Paksha Ekadashi"
      : "Krishna Paksha Ekadashi";

  return [
    createFestival(
      dateISO,
      title,
      "vrat",
      "important",
      {
        shortTitle:
          "Ekadashi",
        description:
          "Ekadashi fasting and devotional observance.",
        badge:
          "Ekadashi",
        isTithiBased: true,
      },
    ),
  ];
}

/* =========================================================
   PURNIMA
========================================================= */

function getPurnimaFestival(
  dateISO: string,
  panchang: Panchang,
): Festival[] {
  if (
    !isPurnimaPanchang(
      panchang,
    )
  ) {
    return [];
  }

  return [
    createFestival(
      dateISO,
      "Purnima",
      "vrat",
      "important",
      {
        shortTitle:
          "Purnima",
        description:
          "Full Moon / Purnima observance.",
        badge:
          "Purnima",
        isTithiBased: true,
      },
    ),
  ];
}

/* =========================================================
   AMAVASYA
========================================================= */

function getAmavasyaFestival(
  dateISO: string,
  panchang: Panchang,
): Festival[] {
  if (
    !isAmavasyaPanchang(
      panchang,
    )
  ) {
    return [];
  }

  return [
    createFestival(
      dateISO,
      "Amavasya",
      "vrat",
      "important",
      {
        shortTitle:
          "Amavasya",
        description:
          "New Moon / Amavasya observance.",
        badge:
          "Amavasya",
        isTithiBased: true,
      },
    ),
  ];
}

/* =========================================================
   SOLAR FESTIVALS
========================================================= */

function getSolarFestivals(
  year: number,
  month0: number,
  day: number,
): Festival[] {
  const dateISO =
    getFestivalDateISO(
      year,
      month0,
      day,
    );

  const festivals: Festival[] =
    [];

  if (
    month0 === 0 &&
    day >= 14 &&
    day <= 17
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Pongal Season",
        "regional",
        "regional",
        {
          shortTitle:
            "Pongal",
          region:
            "south",
          states: [
            "Tamil Nadu",
          ],
          description:
            "Tamil harvest festival season.",
          badge:
            "Tamil Nadu",
          isSolarBased: true,
        },
      ),
    );
  }

  if (
    month0 === 3 &&
    day === 14
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Tamil New Year",
        "regional",
        "major",
        {
          shortTitle:
            "Tamil New Year",
          region:
            "south",
          states: [
            "Tamil Nadu",
          ],
          description:
            "Tamil Puthandu / Tamil New Year.",
          badge:
            "Tamil Nadu",
          isSolarBased: true,
        },
      ),
    );
  }

  if (
    month0 === 3 &&
    day >= 14 &&
    day <= 15
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Vishu",
        "regional",
        "major",
        {
          shortTitle:
            "Vishu",
          region:
            "south",
          states: [
            "Kerala",
          ],
          description:
            "Vishu observance in Kerala.",
          badge:
            "Kerala",
          isSolarBased: true,
        },
      ),
    );
  }

  if (
    month0 === 3 &&
    day === 14
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Poila Boishakh",
        "regional",
        "major",
        {
          shortTitle:
            "Poila Boishakh",
          region:
            "east",
          states: [
            "West Bengal",
          ],
          description:
            "Bengali New Year.",
          badge:
            "Bengal",
          isSolarBased: true,
        },
      ),
    );
  }

  if (
    month0 === 3 &&
    day >= 13 &&
    day <= 16
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Bohag Bihu",
        "regional",
        "major",
        {
          shortTitle:
            "Bohag Bihu",
          region:
            "north-east",
          states: [
            "Assam",
          ],
          description:
            "Assamese New Year and Bohag Bihu season.",
          badge:
            "Assam",
          isSolarBased: true,
        },
      ),
    );
  }

  if (
    month0 === 3 &&
    day === 13
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Baisakhi",
        "regional",
        "major",
        {
          shortTitle:
            "Baisakhi",
          region:
            "north",
          states: [
            "Punjab",
            "Haryana",
          ],
          description:
            "Baisakhi harvest festival.",
          badge:
            "Punjab",
          isSolarBased: true,
        },
      ),
    );
  }

  return festivals;
}

/* =========================================================
   PAN-INDIA TITHI FESTIVALS
========================================================= */

function getPanIndiaTithiFestivals(
  dateISO: string,
  panchang: Panchang,
  month0: number,
): Festival[] {
  const festivals: Festival[] =
    [];

  if (
    hasTithi(
      panchang,
      "Chaturdashi",
    ) &&
    isMonthBetween(
      month0,
      1,
      2,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Maha Shivratri",
        "pan-india",
        "major",
        {
          shortTitle:
            "Maha Shivratri",
          description:
            "Major Shiva festival observed with fasting and night-long worship.",
          badge:
            "Shiva",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Navami",
    ) &&
    isMonthBetween(
      month0,
      2,
      3,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Ram Navami",
        "pan-india",
        "major",
        {
          shortTitle:
            "Ram Navami",
          description:
            "Ram Navami observance.",
          badge:
            "Ram Navami",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    isPurnimaPanchang(
      panchang,
    ) &&
    isMonthBetween(
      month0,
      2,
      3,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Hanuman Jayanti Period",
        "pan-india",
        "important",
        {
          shortTitle:
            "Hanuman Jayanti",
          description:
            "Hanuman Jayanti observance period. Regional traditions vary.",
          badge:
            "Hanuman",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Tritiya",
    ) &&
    isMonthBetween(
      month0,
      3,
      4,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Akshaya Tritiya",
        "pan-india",
        "major",
        {
          shortTitle:
            "Akshaya Tritiya",
          description:
            "Akshaya Tritiya observance.",
          badge:
            "Akshaya Tritiya",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    isPurnimaPanchang(
      panchang,
    ) &&
    isMonthBetween(
      month0,
      3,
      5,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Buddha Purnima",
        "pan-india",
        "major",
        {
          shortTitle:
            "Buddha Purnima",
          description:
            "Buddha Purnima / Vesak observance.",
          badge:
            "Buddha",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    isPurnimaPanchang(
      panchang,
    ) &&
    month0 === 6
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Guru Purnima",
        "pan-india",
        "major",
        {
          shortTitle:
            "Guru Purnima",
          description:
            "Guru Purnima observance.",
          badge:
            "Guru",
          isTithiBased: true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Panchami",
    ) &&
    isMonthBetween(
      month0,
      6,
      7,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Nag Panchami Period",
        "pan-india",
        "important",
        {
          shortTitle:
            "Nag Panchami",
          description:
            "Nag Panchami observance period.",
          badge:
            "Nag Panchami",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    isPurnimaPanchang(
      panchang,
    ) &&
    month0 === 7
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Raksha Bandhan",
        "pan-india",
        "major",
        {
          shortTitle:
            "Raksha Bandhan",
          description:
            "Raksha Bandhan / Rakhi observance.",
          badge:
            "Rakhi",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Ashtami",
    ) &&
    isMonthBetween(
      month0,
      7,
      8,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Krishna Janmashtami",
        "pan-india",
        "major",
        {
          shortTitle:
            "Janmashtami",
          description:
            "Krishna Janmashtami observance.",
          badge:
            "Krishna",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Chaturthi",
    ) &&
    isMonthBetween(
      month0,
      7,
      8,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Ganesh Chaturthi",
        "pan-india",
        "major",
        {
          shortTitle:
            "Ganesh Chaturthi",
          description:
            "Ganesh Chaturthi observance.",
          badge:
            "Ganesh",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Pratipada",
    ) &&
    isMonthBetween(
      month0,
      8,
      9,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Sharadiya Navratri",
        "pan-india",
        "major",
        {
          shortTitle:
            "Navratri",
          description:
            "Sharadiya Navratri observance.",
          badge:
            "Navratri",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Dashami",
    ) &&
    isMonthBetween(
      month0,
      8,
      9,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Vijayadashami",
        "pan-india",
        "major",
        {
          shortTitle:
            "Dussehra",
          description:
            "Vijayadashami / Dussehra observance.",
          badge:
            "Dussehra",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Chaturthi",
    ) &&
    isMonthBetween(
      month0,
      9,
      10,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Karwa Chauth Period",
        "regional",
        "important",
        {
          shortTitle:
            "Karwa Chauth",
          region:
            "north",
          states: [
            "Punjab",
            "Haryana",
            "Rajasthan",
            "Uttar Pradesh",
            "Delhi",
          ],
          description:
            "Karwa Chauth observance period.",
          badge:
            "Karwa Chauth",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    isAmavasyaPanchang(
      panchang,
    ) &&
    isMonthBetween(
      month0,
      9,
      10,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Diwali",
        "pan-india",
        "major",
        {
          shortTitle:
            "Diwali",
          description:
            "Deepavali / Lakshmi Puja observance.",
          badge:
            "Diwali",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Pratipada",
    ) &&
    isMonthBetween(
      month0,
      9,
      10,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Govardhan Puja Period",
        "pan-india",
        "important",
        {
          shortTitle:
            "Govardhan Puja",
          description:
            "Govardhan Puja observance period.",
          badge:
            "Govardhan",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    hasTithi(
      panchang,
      "Dwitiya",
    ) &&
    isMonthBetween(
      month0,
      9,
      10,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Bhai Dooj Period",
        "pan-india",
        "important",
        {
          shortTitle:
            "Bhai Dooj",
          description:
            "Bhai Dooj observance period.",
          badge:
            "Bhai Dooj",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    isPurnimaPanchang(
      panchang,
    ) &&
    isMonthBetween(
      month0,
      10,
      11,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Kartik Purnima",
        "pan-india",
        "major",
        {
          shortTitle:
            "Kartik Purnima",
          description:
            "Kartik Purnima observance. Dev Deepawali is especially associated with Varanasi.",
          badge:
            "Kartik Purnima",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  if (
    (
      hasTithi(
        panchang,
        "Shashthi",
      ) ||
      hasTithi(
        panchang,
        "Saptami",
      )
    ) &&
    isMonthBetween(
      month0,
      9,
      11,
    )
  ) {
    festivals.push(
      createFestival(
        dateISO,
        "Chhath Puja Period",
        "regional",
        "major",
        {
          shortTitle:
            "Chhath Puja",
          region:
            "north",
          states: [
            "Bihar",
            "Jharkhand",
            "Uttar Pradesh",
          ],
          description:
            "Chhath Puja observance.",
          badge:
            "Chhath",
          isTithiBased: true,
          requiresExactRule:
            true,
        },
      ),
    );
  }

  return festivals;
}

/* =========================================================
   REGIONAL FESTIVALS
========================================================= */

function getRegionalFestivals(
  _year: number,
  month0: number,
  day: number,
  dateISO: string,
  panchang: Panchang,
  location: PanchangLocation,
): Festival[] {
  const festivals: Festival[] =
    [];

  /* =====================================================
     WEST INDIA
  ===================================================== */

  if (
    location.region ===
    "west"
  ) {
    if (
      hasTithi(
        panchang,
        "Pratipada",
      ) &&
      isMonthBetween(
        month0,
        2,
        3,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Gudi Padwa",
          "regional",
          "major",
          {
            shortTitle:
              "Gudi Padwa",
            region:
              "west",
            states: [
              "Maharashtra",
              "Goa",
            ],
            description:
              "Maharashtrian and Konkani New Year.",
            badge:
              "Maharashtra",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }

    if (
      hasTithi(
        panchang,
        "Chaturthi",
      ) &&
      isMonthBetween(
        month0,
        7,
        8,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Ganeshotsav",
          "regional",
          "major",
          {
            shortTitle:
              "Ganeshotsav",
            region:
              "west",
            states: [
              "Maharashtra",
              "Goa",
            ],
            description:
              "Maharashtra and western India Ganesh festival period.",
            badge:
              "Maharashtra",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }

    if (
      isPurnimaPanchang(
        panchang,
      ) &&
      month0 === 7
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Narali Purnima",
          "regional",
          "major",
          {
            shortTitle:
              "Narali Purnima",
            region:
              "west",
            states: [
              "Maharashtra",
              "Goa",
            ],
            description:
              "Narali Purnima observed along Maharashtra and Konkan coastal areas.",
            badge:
              "Konkan",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }

    if (
      hasTithi(
        panchang,
        "Ashtami",
      ) &&
      isMonthBetween(
        month0,
        7,
        8,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Dahi Handi Period",
          "regional",
          "important",
          {
            shortTitle:
              "Dahi Handi",
            region:
              "west",
            states: [
              "Maharashtra",
            ],
            description:
              "Maharashtra Dahi Handi observance period.",
            badge:
              "Maharashtra",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }

    if (
      month0 === 0 &&
      day === 14
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Makar Sankranti",
          "regional",
          "major",
          {
            shortTitle:
              "Makar Sankranti",
            region:
              "west",
            states: [
              "Maharashtra",
            ],
            description:
              "Maharashtra Sankranti observance.",
            badge:
              "Maharashtra",
            isSolarBased: true,
          },
        ),
      );
    }
  }

  /* =====================================================
     GUJARAT
  ===================================================== */

  const locationName =
    normalizeText(
      location.name,
    );

  if (
    locationName.includes(
      "ahmedabad",
    ) ||
    locationName.includes(
      "surat",
    )
  ) {
    if (
      month0 === 0 &&
      day === 14
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Uttarayan",
          "regional",
          "major",
          {
            shortTitle:
              "Uttarayan",
            region:
              "west",
            states: [
              "Gujarat",
            ],
            description:
              "Gujarat Uttarayan / Makar Sankranti celebration.",
            badge:
              "Gujarat",
            isSolarBased: true,
          },
        ),
      );
    }

    if (
      hasTithi(
        panchang,
        "Pratipada",
      ) &&
      isMonthBetween(
        month0,
        9,
        10,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Gujarati New Year",
          "regional",
          "major",
          {
            shortTitle:
              "Gujarati New Year",
            region:
              "west",
            states: [
              "Gujarat",
            ],
            description:
              "Bestu Varas / Gujarati New Year.",
            badge:
              "Gujarat",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }
  }

  /* =====================================================
     NORTH
  ===================================================== */

  if (
    location.region ===
    "north"
  ) {
    if (
      month0 === 0 &&
      day === 13
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Lohri",
          "regional",
          "major",
          {
            shortTitle:
              "Lohri",
            region:
              "north",
            states: [
              "Punjab",
              "Haryana",
              "Himachal Pradesh",
            ],
            description:
              "Winter harvest festival of North India.",
            badge:
              "Punjab",
            isSolarBased: true,
          },
        ),
      );
    }

    if (
      hasTithi(
        panchang,
        "Tritiya",
      ) &&
      isMonthBetween(
        month0,
        6,
        7,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Teej Period",
          "regional",
          "important",
          {
            shortTitle:
              "Teej",
            region:
              "north",
            states: [
              "Rajasthan",
              "Haryana",
              "Punjab",
              "Uttar Pradesh",
            ],
            description:
              "Teej festival period; exact observance varies by regional tradition.",
            badge:
              "Teej",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }
  }

  /* =====================================================
     EAST
  ===================================================== */

  if (
    location.region ===
    "east"
  ) {
    if (
      hasTithi(
        panchang,
        "Dvitiya",
      ) &&
      isMonthBetween(
        month0,
        5,
        6,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Jagannath Rath Yatra",
          "regional",
          "major",
          {
            shortTitle:
              "Rath Yatra",
            region:
              "east",
            states: [
              "Odisha",
            ],
            city:
              "Puri",
            description:
              "Jagannath Rath Yatra observance in Odisha.",
            badge:
              "Odisha",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }

    if (
      (
        hasTithi(
          panchang,
          "Saptami",
        ) ||
        hasTithi(
          panchang,
          "Ashtami",
        ) ||
        hasTithi(
          panchang,
          "Navami",
        )
      ) &&
      isMonthBetween(
        month0,
        8,
        9,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Durga Puja Period",
          "regional",
          "major",
          {
            shortTitle:
              "Durga Puja",
            region:
              "east",
            states: [
              "West Bengal",
              "Odisha",
              "Assam",
              "Tripura",
              "Jharkhand",
            ],
            description:
              "Durga Puja observance period.",
            badge:
              "Durga Puja",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }

    if (
      isAmavasyaPanchang(
        panchang,
      ) &&
      isMonthBetween(
        month0,
        9,
        10,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Kali Puja",
          "regional",
          "major",
          {
            shortTitle:
              "Kali Puja",
            region:
              "east",
            states: [
              "West Bengal",
              "Assam",
              "Odisha",
            ],
            description:
              "Kali Puja / Shyama Puja observance.",
            badge:
              "Kali Puja",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }
  }

  /* =====================================================
     SOUTH
  ===================================================== */

  if (
    location.region ===
    "south"
  ) {
    if (
      hasTithi(
        panchang,
        "Pratipada",
      ) &&
      isMonthBetween(
        month0,
        2,
        3,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Ugadi",
          "regional",
          "major",
          {
            shortTitle:
              "Ugadi",
            region:
              "south",
            states: [
              "Karnataka",
              "Andhra Pradesh",
              "Telangana",
            ],
            description:
              "Ugadi New Year observance.",
            badge:
              "Ugadi",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }

    if (
      month0 === 3 &&
      day >= 14 &&
      day <= 15
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Vishu",
          "regional",
          "major",
          {
            shortTitle:
              "Vishu",
            region:
              "south",
            states: [
              "Kerala",
            ],
            description:
              "Vishu observance in Kerala.",
            badge:
              "Kerala",
            isSolarBased: true,
          },
        ),
      );
    }

    if (
      month0 === 7 &&
      day >= 15 &&
      day <= 31
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Onam Season",
          "regional",
          "important",
          {
            shortTitle:
              "Onam",
            region:
              "south",
            states: [
              "Kerala",
            ],
            description:
              "Kerala Onam festival season.",
            badge:
              "Kerala",
            requiresExactRule:
              true,
          },
        ),
      );
    }

    if (
      month0 === 3 &&
      day === 14
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Kerala New Year",
          "regional",
          "important",
          {
            shortTitle:
              "Kerala New Year",
            region:
              "south",
            states: [
              "Kerala",
            ],
            description:
              "Malayalam solar new year period.",
            badge:
              "Kerala",
            isSolarBased: true,
          },
        ),
      );
    }
  }

  /* =====================================================
     NORTHEAST
  ===================================================== */

  if (
    location.region ===
    "north-east"
  ) {
    if (
      month0 === 3 &&
      day >= 13 &&
      day <= 16
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Bohag Bihu",
          "regional",
          "major",
          {
            shortTitle:
              "Bohag Bihu",
            region:
              "north-east",
            states: [
              "Assam",
            ],
            description:
              "Assamese New Year and spring festival.",
            badge:
              "Assam",
            isSolarBased: true,
          },
        ),
      );
    }

    if (
      (
        hasTithi(
          panchang,
          "Saptami",
        ) ||
        hasTithi(
          panchang,
          "Ashtami",
        ) ||
        hasTithi(
          panchang,
          "Navami",
        )
      ) &&
      isMonthBetween(
        month0,
        8,
        9,
      )
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Durga Puja Period",
          "regional",
          "major",
          {
            shortTitle:
              "Durga Puja",
            region:
              "north-east",
            states: [
              "Assam",
              "Tripura",
              "Meghalaya",
            ],
            description:
              "Durga Puja festival period.",
            badge:
              "Durga Puja",
            isTithiBased: true,
            requiresExactRule:
              true,
          },
        ),
      );
    }
  }

  /* =====================================================
     CENTRAL
  ===================================================== */

  if (
    location.region ===
    "central"
  ) {
    if (
      month0 === 2 &&
      day >= 1 &&
      day <= 31
    ) {
      festivals.push(
        createFestival(
          dateISO,
          "Bhagoria Season",
          "regional",
          "regional",
          {
            shortTitle:
              "Bhagoria",
            region:
              "central",
            states: [
              "Madhya Pradesh",
              "Maharashtra",
              "Gujarat",
            ],
            description:
              "Bhagoria tribal festival season; exact local observance varies.",
            badge:
              "Regional",
            requiresExactRule:
              true,
          },
        ),
      );
    }
  }

  return festivals;
}

/* =========================================================
   CANONICAL FESTIVAL KEY
========================================================= */

function getCanonicalFestivalName(
  festival: Festival,
): string {
  const title =
    normalizeText(
      festival.title,
    );

  if (
    title.includes(
      "ganeshotsav",
    ) ||
    title.includes(
      "ganesh chaturthi",
    )
  ) {
    return "ganesh-chaturthi";
  }

  if (
    title.includes(
      "makar sankranti",
    ) ||
    title.includes(
      "uttarayan",
    )
  ) {
    return "makar-sankranti";
  }

  if (
    title.includes(
      "vishu",
    ) ||
    title.includes(
      "kerala new year",
    )
  ) {
    return "vishu";
  }

  if (
    title.includes(
      "bohag bihu",
    )
  ) {
    return "bohag-bihu";
  }

  return title;
}

function getCanonicalFestivalKey(
  festival: Festival,
): string {
  return [
    festival.dateISO,
    getCanonicalFestivalName(
      festival,
    ),
  ].join(":");
}

/* =========================================================
   FESTIVAL MERGE
========================================================= */

function getImportanceRank(
  importance: FestivalImportance,
): number {
  switch (importance) {
    case "major":
      return 4;

    case "important":
      return 3;

    case "regional":
      return 2;

    case "observance":
      return 1;

    default:
      return 0;
  }
}

function mergeFestivalRecords(
  existing: Festival,
  incoming: Festival,
): Festival {
  const existingRank =
    getImportanceRank(
      existing.importance,
    );

  const incomingRank =
    getImportanceRank(
      incoming.importance,
    );

  const preferred =
    incomingRank >
    existingRank
      ? incoming
      : existing;

  return {
    ...preferred,

    id:
      existing.id,

    dateISO:
      existing.dateISO,

    title:
      preferred.title,

    shortTitle:
      preferred.shortTitle ??
      existing.shortTitle ??
      incoming.shortTitle,

    description:
      preferred.description ??
      existing.description ??
      incoming.description,

    region:
      preferred.region ??
      existing.region ??
      incoming.region,

    states:
      preferred.states ??
      existing.states ??
      incoming.states,

    city:
      preferred.city ??
      existing.city ??
      incoming.city,

    badge:
      preferred.badge ??
      existing.badge ??
      incoming.badge,

    language:
      preferred.language ??
      existing.language ??
      incoming.language,

    isMajor:
      existing.isMajor ||
      incoming.isMajor,

    isTithiBased:
      Boolean(
        existing.isTithiBased ||
          incoming.isTithiBased,
      ),

    isSolarBased:
      Boolean(
        existing.isSolarBased ||
          incoming.isSolarBased,
      ),

    requiresExactRule:
      Boolean(
        existing.requiresExactRule ||
          incoming.requiresExactRule,
      ),

    importance:
      existingRank >=
      incomingRank
        ? existing.importance
        : incoming.importance,

    confidence:
      existing.confidence === "candidate" ||
      incoming.confidence === "candidate"
        ? "candidate"
        : existing.confidence === "medium" ||
            incoming.confidence === "medium"
          ? "medium"
          : existing.confidence ?? incoming.confidence,

    observanceBasis:
      preferred.observanceBasis ??
      existing.observanceBasis ??
      incoming.observanceBasis,

    trustNote:
      preferred.trustNote ??
      existing.trustNote ??
      incoming.trustNote,

    relevance:
      preferred.relevance ??
      existing.relevance ??
      incoming.relevance,

    relevanceReason:
      preferred.relevanceReason ??
      existing.relevanceReason ??
      incoming.relevanceReason,
  };
}

/* =========================================================
   DEDUPLICATION
========================================================= */

export function deduplicateFestivals(
  festivals: Festival[],
): Festival[] {
  const map =
    new Map<
      string,
      Festival
    >();

  for (
    const festival of festivals
  ) {
    const key =
      getCanonicalFestivalKey(
        festival,
      );

    const existing =
      map.get(key);

    if (!existing) {
      map.set(
        key,
        festival,
      );

      continue;
    }

    map.set(
      key,
      mergeFestivalRecords(
        existing,
        festival,
      ),
    );
  }

  return Array.from(
    map.values(),
  ).sort(
    compareFestivals,
  );
}

/* =========================================================
   SORTING
========================================================= */

function compareFestivals(
  a: Festival,
  b: Festival,
): number {
  return (
    a.dateISO.localeCompare(
      b.dateISO,
    ) ||
    getImportanceRank(
      b.importance,
    ) -
      getImportanceRank(
        a.importance,
      ) ||
    Number(b.isMajor) -
      Number(a.isMajor) ||
    a.title.localeCompare(
      b.title,
      "en",
      {
        sensitivity:
          "base",
      },
    )
  );
}

/* =========================================================
   FESTIVALS FOR DATE
========================================================= */

export function getFestivalsForDate(
  date: Date,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Festival[] {
  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new TypeError(
      "getFestivalsForDate() requires a valid Date object.",
    );
  }

  validateLocation(location);

  const {
    year,
    month0,
    day,
  } =
    getCalendarDatePartsForLocation(
      date,
      location,
    );

  assertValidDateParts(
    year,
    month0,
    day,
  );

  const dateISO =
    getFestivalDateISO(
      year,
      month0,
      day,
    );

  const cacheKey =
    getFestivalCacheKey(
      dateISO,
      location,
    );

  const cached =
    getCachedFestivals(
      cacheKey,
    );

  if (cached) {
    return cached;
  }

  const panchang =
    calculatePanchang(
      date,
      location,
    );

  const festivals: Festival[] =
    [];

  festivals.push(
    ...getNationalFestivals(
      year,
      month0,
      day,
    ),
  );

  festivals.push(
    ...getSolarFestivals(
      year,
      month0,
      day,
    ),
  );

  festivals.push(
    ...getPanchangDerivedSolarFestivals(
      dateISO,
      panchang,
      location,
    ),
  );

  festivals.push(
    ...getEkadashiFestival(
      dateISO,
      panchang,
    ),
  );

  festivals.push(
    ...getPurnimaFestival(
      dateISO,
      panchang,
    ),
  );

  festivals.push(
    ...getAmavasyaFestival(
      dateISO,
      panchang,
    ),
  );

  festivals.push(
    ...getPanIndiaTithiFestivals(
      dateISO,
      panchang,
      month0,
    ),
  );

  festivals.push(
    ...getRegionalFestivals(
      year,
      month0,
      day,
      dateISO,
      panchang,
      location,
    ),
  );

  const result =
    deduplicateFestivals(
      festivals,
    );

  setCachedFestivals(
    cacheKey,
    result,
  );

  return cloneFestivals(
    result,
  );
}

/* =========================================================
   FESTIVALS FOR DATE ISO
========================================================= */

export function getFestivalsForDateISO(
  dateISO: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Festival[] {
  const {
    year,
    month0,
    day,
  } =
    parseFestivalDateISO(
      dateISO,
    );

  return getFestivalsForDate(
    createFestivalDate(
      year,
      month0,
      day,
    ),
    location,
  );
}

/* =========================================================
   FESTIVALS FOR MONTH
========================================================= */

export function getFestivalsForMonth(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Festival[] {
  assertValidYear(year);
  assertValidMonth(month0);
  validateLocation(location);

  const days =
    getDaysInMonth(
      year,
      month0,
    );

  const festivals: Festival[] =
    [];

  for (
    let day = 1;
    day <= days;
    day++
  ) {
    festivals.push(
      ...getFestivalsForDate(
        createFestivalDate(
          year,
          month0,
          day,
        ),
        location,
      ),
    );
  }

  return deduplicateFestivals(
    festivals,
  );
}

/* =========================================================
   FESTIVALS FOR YEAR
========================================================= */

export function getFestivalsForYear(
  year: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Festival[] {
  assertValidYear(year);
  validateLocation(location);

  const festivals: Festival[] =
    [];

  for (
    let month0 = 0;
    month0 < 12;
    month0++
  ) {
    festivals.push(
      ...getFestivalsForMonth(
        year,
        month0,
        location,
      ),
    );
  }

  return deduplicateFestivals(
    festivals,
  );
}

/* =========================================================
   MAJOR FESTIVALS
========================================================= */

export function getMajorFestivalsForMonth(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Festival[] {
  return getFestivalsForMonth(
    year,
    month0,
    location,
  ).filter(
    (festival) =>
      festival.isMajor,
  );
}

export function getMajorFestivalsForYear(
  year: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Festival[] {
  return getFestivalsForYear(
    year,
    location,
  ).filter(
    (festival) =>
      festival.isMajor,
  );
}

/* =========================================================
   REGIONAL FESTIVALS
========================================================= */

export function getRegionalFestivalsForMonth(
  year: number,
  month0: number,
  region: IndiaRegion,
): Festival[] {
  if (
    !FESTIVAL_REGIONS.includes(
      region,
    )
  ) {
    return [];
  }

  const location =
    Object.values(
      INDIA_LOCATIONS,
    ).find(
      (item) =>
        item.region ===
        region,
    ) ??
    DEFAULT_LOCATION;

  return getFestivalsForMonth(
    year,
    month0,
    location,
  ).filter(
    (festival) =>
      festival.region ===
      region,
  );
}

/* =========================================================
   STATE FILTER
========================================================= */

export function getFestivalsByState(
  year: number,
  month0: number,
  state: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Festival[] {
  const normalized =
    normalizeText(state);

  if (!normalized) {
    return [];
  }

  const normalizedState =
    normalizeIndiaState(state);

  const targetState =
    normalizedState
      ? normalizeText(normalizedState)
      : normalized;

  return getFestivalsForMonth(
    year,
    month0,
    location,
  ).filter(
    (festival) =>
      festival.states?.some(
        (item) => {
          const itemState =
            normalizeIndiaState(item);

          return normalizeText(
            itemState ?? item,
          ) === targetState;
        },
      ) ?? false,
  );
}

/* =========================================================
   FILTER
========================================================= */

export type FestivalFilterOptions = {
  category?: FestivalCategory;
  importance?: FestivalImportance;
  region?: IndiaRegion;
  majorOnly?: boolean;
  tithiBasedOnly?: boolean;
  solarBasedOnly?: boolean;

  /**
   * When true, only festivals that do NOT
   * require an exact astronomical/traditional
   * rule are returned.
   */
  exactOnly?: boolean;
};

export function filterFestivals(
  festivals: Festival[],
  options?: FestivalFilterOptions,
): Festival[] {
  if (!Array.isArray(festivals) || festivals.length === 0) {
    return [];
  }

  if (!options) {
    return [
      ...festivals,
    ];
  }

  return festivals.filter(
    (festival) => {
      if (
        options.category &&
        festival.category !==
          options.category
      ) {
        return false;
      }

      if (
        options.importance &&
        festival.importance !==
          options.importance
      ) {
        return false;
      }

      if (
        options.region &&
        festival.region !==
          options.region
      ) {
        return false;
      }

      if (
        options.majorOnly &&
        !festival.isMajor
      ) {
        return false;
      }

      if (
        options.tithiBasedOnly &&
        !festival.isTithiBased
      ) {
        return false;
      }

      if (
        options.solarBasedOnly &&
        !festival.isSolarBased
      ) {
        return false;
      }

      if (
        options.exactOnly &&
        festival.requiresExactRule
      ) {
        return false;
      }

      return true;
    },
  );
}

/* =========================================================
   SEARCH
========================================================= */

export function searchFestivals(
  year: number,
  month0: number,
  searchTerm: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Festival[] {
  const normalized =
    normalizeText(
      searchTerm,
    );

  if (!normalized) {
    return [];
  }

  return getFestivalsForMonth(
    year,
    month0,
    location,
  ).filter(
    (festival) =>
      normalizeText(
        festival.title,
      ).includes(
        normalized,
      ) ||
      normalizeText(
        festival.shortTitle,
      ).includes(
        normalized,
      ) ||
      normalizeText(
        festival.description,
      ).includes(
        normalized,
      ) ||
      normalizeText(
        festival.badge,
      ).includes(
        normalized,
      ) ||
      normalizeText(
        festival.city,
      ).includes(
        normalized,
      ) ||
      festival.states?.some(
        (state) =>
          normalizeText(
            state,
          ).includes(
            normalized,
          ),
      ) ||
      normalizeText(
        festival.region,
      ).includes(
        normalized,
      ),
  );
}

/* =========================================================
   FESTIVAL BADGE
========================================================= */

export function getFestivalBadge(
  festivals: Festival[],
): string | null {
  const sorted =
    [
      ...festivals,
    ].sort(
      compareFestivals,
    );

  const major =
    sorted.find(
      (festival) =>
        festival.isMajor &&
        festival.badge,
    );

  if (
    major?.badge
  ) {
    return major.badge;
  }

  return (
    sorted.find(
      (festival) =>
        festival.badge,
    )?.badge ??
    null
  );
}

/* =========================================================
   PRIMARY FESTIVAL
========================================================= */

export function getPrimaryFestival(
  festivals: Festival[],
): Festival | null {
  const sorted =
    [
      ...festivals,
    ].sort(
      compareFestivals,
    );

  return (
    sorted.find(
      (festival) =>
        festival.isMajor,
    ) ??
    sorted.find(
      (festival) =>
        festival.importance ===
        "important",
    ) ??
    sorted[0] ??
    null
  );
}

/* =========================================================
   SUMMARY
========================================================= */

export function getFestivalSummary(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): {
  total: number;
  major: number;
  national: number;
  panIndia: number;
  regional: number;
  vrat: number;
  sankranti: number;
  religious: number;
  seasonal: number;
  observance: number;
} {
  const festivals =
    getFestivalsForMonth(
      year,
      month0,
      location,
    );

  return {
    total:
      festivals.length,

    major:
      festivals.filter(
        (festival) =>
          festival.isMajor,
      ).length,

    national:
      festivals.filter(
        (festival) =>
          festival.category ===
          "national",
      ).length,

    panIndia:
      festivals.filter(
        (festival) =>
          festival.category ===
          "pan-india",
      ).length,

    regional:
      festivals.filter(
        (festival) =>
          festival.category ===
          "regional",
      ).length,

    vrat:
      festivals.filter(
        (festival) =>
          festival.category ===
          "vrat",
      ).length,

    sankranti:
      festivals.filter(
        (festival) =>
          festival.category ===
          "sankranti",
      ).length,

    religious:
      festivals.filter(
        (festival) =>
          festival.category ===
          "religious",
      ).length,

    seasonal:
      festivals.filter(
        (festival) =>
          festival.category ===
          "seasonal",
      ).length,

    observance:
      festivals.filter(
        (festival) =>
          festival.category ===
          "observance",
      ).length,
  };
}

/* =========================================================
   FESTIVAL LOCATION
========================================================= */

export function resolveFestivalLocation(
  cityId?: string,
): PanchangLocation {
  const key =
    typeof cityId === "string"
      ? cityId.trim()
      : "";

  if (
    key &&
    INDIA_LOCATIONS[key]
  ) {
    return INDIA_LOCATIONS[key];
  }

  const normalizedKey =
    normalizeText(key);

  if (normalizedKey) {
    const matched =
      Object.values(
        INDIA_LOCATIONS,
      ).find(
        (location) =>
          normalizeText(location.id) === normalizedKey ||
          normalizeText(location.name) === normalizedKey ||
          normalizeText(location.city) === normalizedKey,
      );

    if (matched) {
      return matched;
    }
  }

  return DEFAULT_LOCATION;
}

/* =========================================================
   CITY FESTIVAL CALENDAR
========================================================= */

export function getCityFestivalsForMonth(
  year: number,
  month0: number,
  cityId: string,
): Festival[] {
  const location =
    resolveFestivalLocation(
      cityId,
    );

  return getFestivalsForMonth(
    year,
    month0,
    location,
  );
}

/* =========================================================
   DATE DETAILS
========================================================= */

export function getFestivalDateDetails(
  dateISO: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): {
  dateISO: string;
  panchang: Panchang;
  festivals: Festival[];
} {
  const {
    year,
    month0,
    day,
  } =
    parseFestivalDateISO(
      dateISO,
    );

  validateLocation(location);

  const date =
    createFestivalDate(
      year,
      month0,
      day,
    );

  const panchang =
    calculatePanchang(
      date,
      location,
    );

  return {
    dateISO,
    panchang,
    festivals:
      getFestivalsForDate(
        date,
        location,
      ),
  };
}

/* =========================================================
   FESTIVAL NAME TRANSLATIONS
========================================================= */

export const FESTIVAL_NAMES: Record<
  string,
  Partial<
    Record<
      FestivalLanguage,
      string
    >
  >
> = {
  "Republic Day": {
    en: "Republic Day",
    hi: "गणतंत्र दिवस",
    mr: "प्रजासत्ताक दिन",
  },

  "Independence Day": {
    en: "Independence Day",
    hi: "स्वतंत्रता दिवस",
    mr: "स्वातंत्र्य दिन",
  },

  "Gandhi Jayanti": {
    en: "Gandhi Jayanti",
    hi: "गांधी जयंती",
    mr: "गांधी जयंती",
  },

  "Makar Sankranti": {
    en: "Makar Sankranti",
    hi: "मकर संक्रांति",
    mr: "मकर संक्रांत",
    gu: "મકરસંક્રાંતિ",
  },

  "Shukla Paksha Ekadashi": {
    en: "Shukla Paksha Ekadashi",
    hi: "शुक्ल पक्ष एकादशी",
    mr: "शुक्ल पक्ष एकादशी",
  },

  "Krishna Paksha Ekadashi": {
    en: "Krishna Paksha Ekadashi",
    hi: "कृष्ण पक्ष एकादशी",
    mr: "कृष्ण पक्ष एकादशी",
  },

  Ekadashi: {
    en: "Ekadashi",
    hi: "एकादशी",
    mr: "एकादशी",
    gu: "એકાદશી",
    bn: "একাদশী",
    ta: "ஏகாதசி",
    te: "ఏకాదశి",
    kn: "ಏಕಾದಶಿ",
    ml: "ഏകാദശി",
  },

  Purnima: {
    en: "Purnima",
    hi: "पूर्णिमा",
    mr: "पौर्णिमा",
    gu: "પૂનમ",
    bn: "পূর্ণিমা",
  },

  Amavasya: {
    en: "Amavasya",
    hi: "अमावस्या",
    mr: "अमावस्या",
    gu: "અમાવસ્યા",
    bn: "অমাবস্যা",
  },

  "Maha Shivratri": {
    en: "Maha Shivratri",
    hi: "महाशिवरात्रि",
    mr: "महाशिवरात्री",
    gu: "મહાશિવરાત્રી",
    bn: "মহাশিবরাত্রি",
    ta: "மகா சிவராத்திரி",
    te: "మహాశివరాత్రి",
    kn: "ಮಹಾ ಶಿವರಾತ್ರಿ",
    ml: "മഹാശിവരാത്രി",
  },

  "Ram Navami": {
    en: "Ram Navami",
    hi: "राम नवमी",
    mr: "राम नवमी",
    gu: "રામ નવમી",
    bn: "রাম নবমী",
  },

  "Akshaya Tritiya": {
    en: "Akshaya Tritiya",
    hi: "अक्षय तृतीया",
    mr: "अक्षय तृतीया",
    gu: "અખાત્રીજ",
  },

  "Buddha Purnima": {
    en: "Buddha Purnima",
    hi: "बुद्ध पूर्णिमा",
    mr: "बुद्ध पौर्णिमा",
  },

  "Guru Purnima": {
    en: "Guru Purnima",
    hi: "गुरु पूर्णिमा",
    mr: "गुरु पौर्णिमा",
  },

  "Nag Panchami Period": {
    en: "Nag Panchami",
    hi: "नाग पंचमी",
    mr: "नाग पंचमी",
  },

  "Raksha Bandhan": {
    en: "Raksha Bandhan",
    hi: "रक्षाबंधन",
    mr: "रक्षाबंधन",
    gu: "રક્ષાબંધન",
  },

  "Krishna Janmashtami": {
    en: "Krishna Janmashtami",
    hi: "कृष्ण जन्माष्टमी",
    mr: "कृष्ण जन्माष्टमी",
    gu: "કૃષ્ણ જન્માષ્ટમી",
  },

  "Ganesh Chaturthi": {
    en: "Ganesh Chaturthi",
    hi: "गणेश चतुर्थी",
    mr: "गणेश चतुर्थी",
    gu: "ગણેશ ચતુર્થી",
    bn: "গণেশ চতুর্থী",
    ta: "விநாயகர் சதுர்த்தி",
    te: "వినాయక చవితి",
    kn: "ಗಣೇಶ ಚತುರ್ಥಿ",
    ml: "ഗണേശ ചതുർത്ഥി",
  },

  Ganeshotsav: {
    en: "Ganeshotsav",
    hi: "गणेशोत्सव",
    mr: "गणेशोत्सव",
  },

  "Sharadiya Navratri": {
    en: "Sharadiya Navratri",
    hi: "शारदीय नवरात्रि",
    mr: "शारदीय नवरात्र",
    gu: "શારદીય નવરાત્રી",
  },

  Vijayadashami: {
    en: "Vijayadashami",
    hi: "विजयादशमी",
    mr: "विजयादशमी",
    gu: "વિજયાદશમી",
  },

  Diwali: {
    en: "Diwali",
    hi: "दीपावली",
    mr: "दिवाळी",
    gu: "દિવાળી",
    bn: "দীপাবলি",
    ta: "தீபாவளி",
    te: "దీపావళి",
    kn: "ದೀಪಾವಳಿ",
    ml: "ദീപാവലി",
  },

  "Govardhan Puja Period": {
    en: "Govardhan Puja",
    hi: "गोवर्धन पूजा",
    mr: "गोवर्धन पूजा",
    gu: "ગોવર્ધન પૂજા",
  },

  "Bhai Dooj Period": {
    en: "Bhai Dooj",
    hi: "भाई दूज",
    mr: "भाऊबीज",
    gu: "ભાઈબીજ",
  },

  "Kartik Purnima": {
    en: "Kartik Purnima",
    hi: "कार्तिक पूर्णिमा",
    mr: "कार्तिक पौर्णिमा",
  },

  "Gudi Padwa": {
    en: "Gudi Padwa",
    hi: "गुड़ी पड़वा",
    mr: "गुढी पाडवा",
  },

  "Narali Purnima": {
    en: "Narali Purnima",
    hi: "नारळी पौर्णिमा",
    mr: "नारळी पौर्णिमा",
  },

  "Dahi Handi Period": {
    en: "Dahi Handi",
    hi: "दही हांडी",
    mr: "दही हंडी",
  },

  "Gujarati New Year": {
    en: "Gujarati New Year",
    hi: "गुजराती नववर्ष",
    gu: "બેસ્ટુ વરસ",
  },

  Lohri: {
    en: "Lohri",
    hi: "लोहड़ी",
    mr: "लोहड़ी",
  },

  Baisakhi: {
    en: "Baisakhi",
    hi: "बैसाखी",
    mr: "बैसाखी",
  },

  "Jagannath Rath Yatra": {
    en: "Jagannath Rath Yatra",
    hi: "जगन्नाथ रथ यात्रा",
    bn: "জগন্নাথ রথযাত্রা",
  },

  "Durga Puja Period": {
    en: "Durga Puja",
    hi: "दुर्गा पूजा",
    bn: "দুর্গাপূজা",
    mr: "दुर्गापूजा",
  },

  "Kali Puja": {
    en: "Kali Puja",
    hi: "काली पूजा",
    bn: "কালীপূজা",
  },

  Ugadi: {
    en: "Ugadi",
    hi: "उगादी",
    te: "ఉగాది",
    kn: "ಯುಗಾದಿ",
  },

  Vishu: {
    en: "Vishu",
    hi: "विषु",
    ml: "വിഷു",
  },

  "Kerala New Year": {
    en: "Kerala New Year",
    hi: "केरल नववर्ष",
    ml: "കേരള പുതുവർഷം",
  },

  "Onam Season": {
    en: "Onam",
    hi: "ओणम",
    ml: "ഓണം",
  },

  "Pongal Season": {
    en: "Pongal",
    hi: "पोंगल",
    ta: "பொங்கல்",
  },

  "Tamil New Year": {
    en: "Tamil New Year",
    hi: "तमिल नववर्ष",
    ta: "தமிழ் புத்தாண்டு",
  },

  "Poila Boishakh": {
    en: "Poila Boishakh",
    hi: "पोइला बोइशाख",
    bn: "পয়লা বৈশাখ",
  },

  "Bohag Bihu": {
    en: "Bohag Bihu",
    hi: "बोहाग बिहू",
    bn: "বহাগ বিহু",
  },

  "Karwa Chauth Period": {
    en: "Karwa Chauth",
    hi: "करवा चौथ",
    mr: "करवा चौथ",
  },

  "Chhath Puja Period": {
    en: "Chhath Puja",
    hi: "छठ पूजा",
    mr: "छठ पूजा",
  },

  "Teej Period": {
    en: "Teej",
    hi: "तीज",
    mr: "तीज",
  },

  "Bhagoria Season": {
    en: "Bhagoria",
    hi: "भगोरिया",
    mr: "भगोरिया",
  },
};

/* =========================================================
   TRANSLATION
========================================================= */

export function translateFestivalName(
  festival: Festival,
  language: FestivalLanguage,
): string {
  return (
    FESTIVAL_NAMES[
      festival.title
    ]?.[language] ??
    FESTIVAL_NAMES[
      festival.shortTitle ??
        festival.title
    ]?.[language] ??
    festival.title
  );
}

/* =========================================================
   LANGUAGES
========================================================= */

export const SUPPORTED_FESTIVAL_LANGUAGES: {
  id: FestivalLanguage;
  name: string;
  nativeName: string;
}[] = [
  {
    id: "en",
    name: "English",
    nativeName:
      "English",
  },
  {
    id: "hi",
    name: "Hindi",
    nativeName:
      "हिन्दी",
  },
  {
    id: "mr",
    name: "Marathi",
    nativeName:
      "मराठी",
  },
  {
    id: "gu",
    name: "Gujarati",
    nativeName:
      "ગુજરાતી",
  },
  {
    id: "bn",
    name: "Bengali",
    nativeName:
      "বাংলা",
  },
  {
    id: "ta",
    name: "Tamil",
    nativeName:
      "தமிழ்",
  },
  {
    id: "te",
    name: "Telugu",
    nativeName:
      "తెలుగు",
  },
  {
    id: "kn",
    name: "Kannada",
    nativeName:
      "ಕನ್ನಡ",
  },
  {
    id: "ml",
    name: "Malayalam",
    nativeName:
      "മലയാളം",
  },
];

/* =========================================================
   LOCATIONS
========================================================= */

export function getFestivalLocations(): PanchangLocation[] {
  return Object.values(
    INDIA_LOCATIONS,
  );
}

export function getFestivalRegions(): IndiaRegion[] {
  return [
    ...FESTIVAL_REGIONS,
  ];
}

/* =========================================================
   CALENDAR ADAPTER
========================================================= */

export type FestivalCalendarEvent = {
  id: string;
  dateISO: string;
  title: string;
  shortTitle?: string;

  type:
    | "festival"
    | "regional"
    | "national"
    | "vrat"
    | "sankranti";

  region?: IndiaRegion;
  description?: string;
  location?: string;
  isMajor?: boolean;
  badge?: string;
  confidence?: Festival["confidence"];
  observanceBasis?: Festival["observanceBasis"];
  trustNote?: string;
  relevance?: Festival["relevance"];
  relevanceReason?: string;
};

export function festivalsToCalendarEvents(
  festivals: Festival[],
): FestivalCalendarEvent[] {
  return festivals
    .map(
      (festival) => {
        let type:
          | FestivalCalendarEvent["type"] =
          "festival";

        switch (
          festival.category
        ) {
          case "national":
            type =
              "national";
            break;

          case "regional":
            type =
              "regional";
            break;

          case "vrat":
            type =
              "vrat";
            break;

          case "sankranti":
            type =
              "sankranti";
            break;

          default:
            type =
              "festival";
        }

        return {
          id:
            festival.id,

          dateISO:
            festival.dateISO,

          title:
            festival.title,

          shortTitle:
            festival.shortTitle,

          type,

          region:
            festival.region,

          description:
            festival.description,

          location:
            festival.city,

          isMajor:
            festival.isMajor,

          badge:
            festival.badge,

          confidence:
            festival.confidence,

          observanceBasis:
            festival.observanceBasis,

          trustNote:
            festival.trustNote,

          relevance:
            festival.relevance,

          relevanceReason:
            festival.relevanceReason,
        };
      },
    )
    .sort(
      (a, b) =>
        a.dateISO.localeCompare(
          b.dateISO,
        ) ||
        Number(b.isMajor) -
          Number(a.isMajor) ||
        a.title.localeCompare(
          b.title,
          "en",
          {
            sensitivity:
              "base",
          },
        ),
    );
}

/* =========================================================
   PAN-INDIA PERSONALIZATION + TRUST HELPERS
========================================================= */

export function normalizeIndiaState(
  value?: string,
): IndiaStateOrUT | null {
  const key = normalizeText(value);
  return INDIA_STATE_ALIASES[key] ??
    (INDIA_STATES_AND_UTS.find(
      (state) => normalizeText(state) === key,
    ) ?? null);
}

export function getIndiaStatesAndUTs(): IndiaStateOrUT[] {
  return [...INDIA_STATES_AND_UTS];
}

export function getFestivalTrustMetadata(festival?: Festival): {
  confidence: "high" | "medium" | "candidate";
  basis: Festival["observanceBasis"];
  label: string;
  note: string;
} {
  const confidence = festival?.confidence ?? "high";
  const basis = festival?.observanceBasis ?? "fixed-date";

  const label =
    confidence === "candidate"
      ? "Traditional rule — verify locally"
      : confidence === "medium"
        ? "Regional Panchang rule"
        : "Panchang-based";

  return {
    confidence,
    basis,
    label,
    note: festival?.trustNote ?? FESTIVAL_TRUST_NOTE,
  };
}

/**
 * Returns festivals most relevant to a selected Indian state/city.
 * Pan-India festivals remain visible; regional/state matches receive
 * a relevance marker so users can understand why the event appears.
 */
export function getPersonalizedFestivals(
  year: number,
  month0: number,
  location: PanchangLocation = DEFAULT_LOCATION,
): Festival[] {
  validateLocation(location);

  const state = normalizeIndiaState(
    (location as PanchangLocation & { state?: string }).state,
  );

  return getFestivalsForMonth(year, month0, location)
    .map((festival) => {
      const festivalStates = festival.states ?? [];
      const stateMatch = !!state && festivalStates.some(
        (item) => {
          const normalizedFestivalState =
            normalizeIndiaState(item);
          return normalizeText(
            normalizedFestivalState ?? item,
          ) === normalizeText(
            state,
          );
        },
      );

      const locationCity =
        location.city ??
        location.name;

      const cityMatch =
        !!festival.city &&
        !!locationCity &&
        normalizeText(festival.city) ===
          normalizeText(locationCity);

      const regionMatch =
        !!festival.region &&
        festival.region === location.region;

      const relevance: Festival["relevance"] =
        cityMatch ? "city" :
        stateMatch ? "state" :
        regionMatch ? "regional" :
        festival.category === "pan-india" ||
            festival.category === "national"
          ? "pan-india"
          : "pan-india";

      const relevanceReason =
        stateMatch
          ? `Relevant to ${state}.`
          : regionMatch
            ? `Relevant to the ${location.region ?? "selected"} region.`
            : relevance === "pan-india"
              ? "Shown as a national or broadly observed Indian festival."
              : `Relevant to ${location.name}.`;

      return {
        ...festival,
        relevance,
        relevanceReason,
      };
    })
    .sort((a, b) => {
      const rank: Record<NonNullable<Festival["relevance"]>, number> = {
        city: 4,
        state: 3,
        regional: 2,
        "pan-india": 1,
      };
      return (rank[b.relevance ?? "pan-india"] - rank[a.relevance ?? "pan-india"]) ||
        Number(b.isMajor) - Number(a.isMajor) ||
        a.title.localeCompare(b.title, "en", { sensitivity: "base" });
    });
}

export function getFestivalPersonalizationMessage(
  location: PanchangLocation = DEFAULT_LOCATION,
): string {
  validateLocation(location);

  const label =
    [
      location.city ?? location.name,
      location.state,
      location.country,
    ]
      .filter(
        (value): value is string =>
          typeof value === "string" &&
          value.trim().length > 0,
      )
      .join(", ");

  return `Showing festivals for ${label || "the selected Indian location"}. Sunrise, sunset and Panchang-derived observances use this selected location. Local temple, sampradaya and community traditions may differ.`;
}

export function isFestivalExact(
  festival: Festival,
): boolean {
  return (
    festival.requiresExactRule !== true &&
    festival.confidence === "high" &&
    (
      festival.observanceBasis === "fixed-date" ||
      festival.observanceBasis === "panchang-derived" ||
      festival.observanceBasis === "solar"
    )
  );
}

export function getFestivalConfidenceLabel(
  festival: Festival,
): string {
  return getFestivalTrustMetadata(festival).label;
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  FESTIVAL_REGIONS,
  FESTIVAL_CATEGORIES,

  SUPPORTED_FESTIVAL_LANGUAGES,
  FESTIVAL_NAMES,

  createFestivalDate,
  getFestivalDateISO,
  parseFestivalDateISO,
  getDaysInMonth,

  clearFestivalCache,

  getFestivalsForDate,
  getFestivalsForDateISO,

  getFestivalsForMonth,
  getFestivalsForYear,

  getMajorFestivalsForMonth,
  getMajorFestivalsForYear,

  getRegionalFestivalsForMonth,

  getFestivalsByState,

  filterFestivals,

  searchFestivals,

  deduplicateFestivals,

  getFestivalBadge,
  getPrimaryFestival,

  getFestivalSummary,

  resolveFestivalLocation,

  getCityFestivalsForMonth,

  getFestivalDateDetails,

  translateFestivalName,

  festivalsToCalendarEvents,

  getFestivalLocations,
  getFestivalRegions,

  INDIA_STATES_AND_UTS,
  INDIA_STATE_ALIASES,
  FESTIVAL_TRUST_NOTE,
  normalizeIndiaState,
  getIndiaStatesAndUTs,
  getFestivalTrustMetadata,
  getPersonalizedFestivals,
  getFestivalPersonalizationMessage,
  isFestivalExact,
  getFestivalConfidenceLabel,
};