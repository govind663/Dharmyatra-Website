/**
 * ============================================================================
 * DHARMYATRA - HINDU CALENDAR ENGINE
 * ============================================================================
 *
 * Production-level calendar orchestration layer.
 *
 * Responsibilities:
 * - Gregorian month calendar
 * - Panchang integration
 * - Tithi markers
 * - Nakshatra information
 * - Ekadashi / Purnima / Amavasya markers
 * - Festival integration
 * - Regional calendar support
 * - India location support
 * - Month / year navigation
 * - Calendar event filtering/search
 * - Calendar summaries
 *
 * IMPORTANT:
 * This file does NOT calculate astronomical positions itself.
 *
 * Astronomy / Panchang calculations remain inside:
 *     ./panchang
 *
 * Festival definitions remain inside:
 *     ./festivals
 *
 * This keeps the application architecture clean and prevents multiple
 * implementations of the same astronomical logic.
 *
 * Date convention:
 * - Calendar dates are represented as YYYY-MM-DD.
 * - Internal calendar Date objects are created at UTC noon.
 * - This prevents accidental midnight/DST boundary problems when a calendar
 *   date is passed between frontend and calculation layers.
 *
 * ============================================================================
 */

import {
  DEFAULT_LOCATION,
  INDIA_LOCATIONS,
  NAKSHATRAS,
  TITHIS,
  getLocationById,
  calculatePanchang,
  type IndiaRegion,
  type Panchang,
  type PanchangLocation,
} from "./panchang";

import {
  getFestivalsForDate,
  getFestivalsForMonth,
  getPersonalizedFestivals,
  type Festival,
} from "./festivals";

/* ============================================================================
 * TYPES
 * ========================================================================== */

export type CalendarWeekStartsOn =
  | "sunday"
  | "monday";

export type CalendarPaksha = "Shukla" | "Krishna";

export type CalendarEventType =
  | "festival"
  | "vrat"
  | "purnima"
  | "amavasya"
  | "ekadashi"
  | "sankranti"
  | "regional"
  | "religious"
  | "national"
  | "observance";

export type CalendarEvent = {
  id: string;

  dateISO: string;

  title: string;

  shortTitle?: string;

  type: CalendarEventType;

  region?: IndiaRegion;

  /** Transparent trust metadata carried from the festival engine. */
  confidence?: "high" | "medium" | "candidate";
  observanceBasis?: "fixed-date" | "tithi" | "solar" | "regional" | "panchang-derived" | "candidate";
  trustNote?: string;
  relevance?: "pan-india" | "regional" | "state" | "city";
  relevanceReason?: string;

  description?: string;

  location?: string;

  isMajor?: boolean;

  badge?: string;
};

export type CalendarDayData = {
  day: number;

  dateISO: string;

  weekday: number;

  weekdayName: string;

  isToday: boolean;

  isCurrentMonth: boolean;

  tithi: {
    name: string;
    shortName: string;
    index: number;
    paksha: CalendarPaksha;
  };

  nakshatra?: {
    name: string;
    index: number;
    pada: number;
  };

  isEkadashi: boolean;

  isPurnima: boolean;

  isAmavasya: boolean;

  events: CalendarEvent[];

  panchang?: Panchang;
};

export type CalendarWeek = {
  weekIndex: number;

  days: CalendarDayData[];
};

export type CalendarMonthNavigation = {
  year: number;

  month: number;

  month0: number;
};

export type MonthlyCalendar = {
  year: number;

  month: number;

  month0: number;

  monthName: string;

  monthNameHindi: string;

  firstDay: number;

  daysInMonth: number;

  previousMonth: CalendarMonthNavigation;

  nextMonth: CalendarMonthNavigation;

  location: PanchangLocation;

  region?: IndiaRegion;

  weekStartsOn: CalendarWeekStartsOn;

  weekdays: string[];

  weekdaysHindi: string[];

  days: CalendarDayData[];

  weeks: CalendarWeek[];

  events: CalendarEvent[];

  majorEvents: CalendarEvent[];

  eventCount: number;

  majorEventCount: number;
};

/* ============================================================================
 * MONTH NAMES
 * ========================================================================== */

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_NAMES_HI = [
  "जनवरी",
  "फरवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
] as const;

/* ============================================================================
 * WEEKDAY NAMES
 * ========================================================================== */

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEKDAY_NAMES_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const WEEKDAY_NAMES_HI = [
  "रविवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "गुरुवार",
  "शुक्रवार",
  "शनिवार",
] as const;

/* ============================================================================
 * PAN-INDIA REGION LABELS
 * ========================================================================== */

export const REGION_LABELS: Record<
  IndiaRegion,
  string
> = {
  north: "North India",
  south: "South India",
  east: "East India",
  west: "West India",
  central: "Central India",
  "north-east": "Northeast India",
  "union-territory": "Union Territories",
};

export const REGION_LABELS_HI: Record<
  IndiaRegion,
  string
> = {
  north: "उत्तर भारत",
  south: "दक्षिण भारत",
  east: "पूर्वी भारत",
  west: "पश्चिमी भारत",
  central: "मध्य भारत",
  "north-east": "पूर्वोत्तर भारत",
  "union-territory": "केंद्र शासित प्रदेश",
};

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const DAYS_PER_WEEK = 7;

const MIN_CALENDAR_ROWS = 5;

const MAX_CALENDAR_ROWS = 6;

const MIN_CALENDAR_YEAR = 1;

const MAX_CALENDAR_YEAR = 9999;

const INDIA_TIMEZONE = "Asia/Kolkata";

/* ============================================================================
 * INTERNAL HELPERS
 * ========================================================================== */

/**
 * Validate a Gregorian calendar input.
 */
function assertValidYearMonth(
  year: number,
  month0: number,
): void {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999
  ) {
    throw new Error(
      `Invalid calendar year: ${year}`,
    );
  }

  if (
    !Number.isInteger(month0) ||
    month0 < 0 ||
    month0 > 11
  ) {
    throw new Error(
      `Invalid calendar month index: ${month0}`,
    );
  }
}

/**
 * Validate day.
 */
function assertValidDay(
  year: number,
  month0: number,
  day: number,
): void {
  assertValidYearMonth(
    year,
    month0,
  );

  const days =
    getDaysInMonth(
      year,
      month0,
    );

  if (
    !Number.isInteger(day) ||
    day < 1 ||
    day > days
  ) {
    throw new Error(
      `Invalid calendar day: ${day} for ${year}-${month0 + 1}`,
    );
  }
}

/**
 * Normalize a calendar date string.
 */
function assertValidDateISO(
  dateISO: string,
): void {
  if (
    typeof dateISO !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      dateISO,
    )
  ) {
    throw new Error(
      `Invalid dateISO: ${String(dateISO)}. Expected YYYY-MM-DD.`,
    );
  }

  const [
    yearString,
    monthString,
    dayString,
  ] = dateISO.split("-");

  const year =
    Number(yearString);

  const month =
    Number(monthString);

  const day =
    Number(dayString);

  assertValidYearMonth(
    year,
    month - 1,
  );

  assertValidDay(
    year,
    month - 1,
    day,
  );
}

/**
 * Create a stable event key.
 */
function createEventKey(
  event: CalendarEvent,
): string {
  return [
    event.dateISO,
    event.type,
    event.title
      .trim()
      .toLowerCase(),
  ].join("|");
}

/**
 * Remove duplicate events while preserving order.
 */
function deduplicateEvents(
  events: CalendarEvent[],
): CalendarEvent[] {
  const seen =
    new Set<string>();

  const result: CalendarEvent[] =
    [];

  for (
    const event of events
  ) {
    const id =
      event.id?.trim();

    const key =
      id ||
      createEventKey(
        event,
      );

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    result.push(event);
  }

  return result;
}

/**
 * Sort calendar events consistently.
 */
function sortCalendarEvents(
  events: CalendarEvent[],
): CalendarEvent[] {
  return [
    ...events,
  ].sort(
    (a, b) => {
      if (
        Boolean(a.isMajor) !==
        Boolean(b.isMajor)
      ) {
        return a.isMajor
          ? -1
          : 1;
      }

      const typeOrder: Record<
        CalendarEventType,
        number
      > = {
        national: 1,
        religious: 2,
        festival: 3,
        ekadashi: 4,
        purnima: 5,
        amavasya: 6,
        sankranti: 7,
        vrat: 8,
        regional: 9,
        observance: 10,
      };

      const typeDifference =
        typeOrder[a.type] -
        typeOrder[b.type];

      if (
        typeDifference !== 0
      ) {
        return typeDifference;
      }

      return a.title.localeCompare(
        b.title,
        "en",
        {
          sensitivity:
            "base",
        },
      );
    },
  );
}


function getCalendarIndiaRegions(): IndiaRegion[] {
  const regions = new Set<IndiaRegion>();

  for (const location of Object.values(INDIA_LOCATIONS)) {
    if (location.region) {
      regions.add(location.region);
    }
  }

  return Array.from(regions);
}

/**
 * Validate a location before handing it to the calculation engine.
 * This keeps calendar-level failures explicit instead of surfacing as a
 * partially rendered calendar.
 */
function assertValidCalendarLocation(
  location: PanchangLocation,
): void {
  if (!location || typeof location !== "object") {
    throw new Error("A valid calendar location is required.");
  }

  if (
    !Number.isFinite(location.latitude) ||
    location.latitude < -90 ||
    location.latitude > 90
  ) {
    throw new Error(
      `Invalid calendar latitude: ${location.latitude}`,
    );
  }

  if (
    !Number.isFinite(location.longitude) ||
    location.longitude < -180 ||
    location.longitude > 180
  ) {
    throw new Error(
      `Invalid calendar longitude: ${location.longitude}`,
    );
  }

  if (
    typeof location.timezone !== "string" ||
    !location.timezone.trim()
  ) {
    throw new Error("A valid IANA timezone is required for the calendar.");
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: location.timezone,
    }).format();
  } catch {
    throw new Error(
      `Invalid calendar timezone: ${location.timezone}`,
    );
  }
}

function assertValidWeekStartsOn(
  weekStartsOn: CalendarWeekStartsOn,
): void {
  if (
    weekStartsOn !== "sunday" &&
    weekStartsOn !== "monday"
  ) {
    throw new Error(
      `Invalid calendar week start: ${String(weekStartsOn)}`,
    );
  }
}

function assertValidNavigationDirection(
  direction: "previous" | "next",
): void {
  if (
    direction !== "previous" &&
    direction !== "next"
  ) {
    throw new Error(
      `Invalid navigation direction: ${String(direction)}`,
    );
  }
}

function getPanchangForCalendarParts(
  year: number,
  month0: number,
  day: number,
  location: PanchangLocation,
): Panchang {
  assertValidDay(year, month0, day);
  assertValidCalendarLocation(location);

  return calculatePanchang(
    createLocalDate(year, month0, day),
    location,
  );
}

/* ============================================================================
 * DATE HELPERS
 * ========================================================================== */

/**
 * Create a deterministic Date representing a calendar day.
 *
 * UTC noon is intentional.
 */
export function createLocalDate(
  year: number,
  month0: number,
  day: number,
): Date {
  assertValidDay(
    year,
    month0,
    day,
  );

  // Avoid Date.UTC's legacy 1900-offset behavior for years 0-99.
  const result = new Date(0);

  result.setUTCFullYear(
    year,
    month0,
    day,
  );

  result.setUTCHours(
    12,
    0,
    0,
    0,
  );

  return result;
}

/**
 * Convert calendar date to YYYY-MM-DD.
 */
export function getDateISO(
  year: number,
  month0: number,
  day: number,
): string {
  assertValidDay(
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

/**
 * Parse YYYY-MM-DD.
 */
export function parseDateISO(
  dateISO: string,
): {
  year: number;
  month0: number;
  day: number;
} {
  assertValidDateISO(
    dateISO,
  );

  const [
    yearString,
    monthString,
    dayString,
  ] = dateISO.split("-");

  const year =
    Number(yearString);

  const month =
    Number(monthString);

  const day =
    Number(dayString);

  return {
    year,

    month0:
      month - 1,

    day,
  };
}

/**
 * Get number of days in month.
 */
export function getDaysInMonth(
  year: number,
  month0: number,
): number {
  assertValidYearMonth(
    year,
    month0,
  );

  // Avoid Date.UTC's legacy 1900-offset behavior for years 0-99.
  const result = new Date(0);

  result.setUTCFullYear(
    year,
    month0 + 1,
    0,
  );

  result.setUTCHours(
    0,
    0,
    0,
    0,
  );

  return result.getUTCDate();
}

/**
 * Get first weekday.
 *
 * Sunday = 0
 * Monday = 1
 * ...
 */
export function getFirstWeekday(
  year: number,
  month0: number,
): number {
  assertValidYearMonth(
    year,
    month0,
  );

  // Avoid Date.UTC's legacy 1900-offset behavior for years 0-99.
  const result = new Date(0);

  result.setUTCFullYear(
    year,
    month0,
    1,
  );

  result.setUTCHours(
    0,
    0,
    0,
    0,
  );

  return result.getUTCDay();
}

/**
 * Previous month.
 */
export function getPreviousMonth(
  year: number,
  month0: number,
): CalendarMonthNavigation {
  assertValidYearMonth(
    year,
    month0,
  );

  if (
    month0 === 0
  ) {
    if (year === MIN_CALENDAR_YEAR) {
      throw new Error(
        "Cannot navigate before the supported calendar year 1.",
      );
    }

    return {
      year:
        year - 1,

      month:
        12,

      month0:
        11,
    };
  }

  return {
    year,

    month:
      month0,

    month0:
      month0 - 1,
  };
}

/**
 * Next month.
 */
export function getNextMonth(
  year: number,
  month0: number,
): CalendarMonthNavigation {
  assertValidYearMonth(
    year,
    month0,
  );

  if (
    month0 === 11
  ) {
    if (year === MAX_CALENDAR_YEAR) {
      throw new Error(
        "Cannot navigate beyond the supported calendar year 9999.",
      );
    }

    return {
      year:
        year + 1,

      month:
        1,

      month0:
        0,
    };
  }

  return {
    year,

    month:
      month0 + 2,

    month0:
      month0 + 1,
  };
}

/**
 * Convert ISO date to Date.
 */
export function dateFromISO(
  dateISO: string,
): Date {
  const {
    year,
    month0,
    day,
  } =
    parseDateISO(
      dateISO,
    );

  return createLocalDate(
    year,
    month0,
    day,
  );
}

/* ============================================================================
 * TODAY
 * ========================================================================== */

/**
 * Get today's date in India.
 *
 * Uses Asia/Kolkata explicitly so the result does not depend on the browser's
 * local timezone.
 */
export function getTodayISO(): string {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          INDIA_TIMEZONE,

        year: "numeric",

        month: "2-digit",

        day: "2-digit",
      },
    );

  const parts =
    formatter.formatToParts(
      new Date(),
    );

  const year =
    Number(
      parts.find(
        (item) =>
          item.type ===
          "year",
      )?.value,
    );

  const month =
    Number(
      parts.find(
        (item) =>
          item.type ===
          "month",
      )?.value,
    );

  const day =
    Number(
      parts.find(
        (item) =>
          item.type ===
          "day",
      )?.value,
    );

  return getDateISO(
    year,
    month - 1,
    day,
  );
}

/**
 * Check whether a date is today in India.
 */
export function isTodayISO(
  dateISO: string,
): boolean {
  assertValidDateISO(
    dateISO,
  );

  return (
    dateISO ===
    getTodayISO()
  );
}

/* ============================================================================
 * DATE COMPARISON
 * ========================================================================== */

/**
 * Compare two ISO dates.
 */
export function isSameDate(
  first: string,
  second: string,
): boolean {
  return (
    first === second
  );
}

/**
 * Compare YYYY-MM-DD dates.
 */
export function compareDateISO(
  first: string,
  second: string,
): -1 | 0 | 1 {
  assertValidDateISO(
    first,
  );

  assertValidDateISO(
    second,
  );

  if (
    first < second
  ) {
    return -1;
  }

  if (
    first > second
  ) {
    return 1;
  }

  return 0;
}

/**
 * Add days to a calendar date.
 */
export function addDaysToISO(
  dateISO: string,
  days: number,
): string {
  assertValidDateISO(
    dateISO,
  );

  if (
    !Number.isInteger(
      days,
    )
  ) {
    throw new Error(
      "days must be an integer.",
    );
  }

  const date =
    dateFromISO(
      dateISO,
    );

  date.setUTCDate(
    date.getUTCDate() +
      days,
  );

  const resultYear =
    date.getUTCFullYear();

  if (
    resultYear < MIN_CALENDAR_YEAR ||
    resultYear > MAX_CALENDAR_YEAR
  ) {
    throw new Error(
      `Resulting calendar date is outside the supported range ${MIN_CALENDAR_YEAR}-${MAX_CALENDAR_YEAR}.`,
    );
  }

  return getDateISO(
    resultYear,
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

/* ============================================================================
 * TITHI HELPERS
 * ========================================================================== */

/**
 * Get normalized calendar Tithi.
 */
export function getCalendarTithi(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): {
  name: string;
  shortName: string;
  index: number;
  paksha: CalendarPaksha;
} {
  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      "Invalid date supplied to getCalendarTithi().",
    );
  }

  assertValidCalendarLocation(location);

  const panchang = calculatePanchang(
    date,
    location,
  );

  const tithi = panchang.tithi;

  const shortName =
    createTithiShortName(
      tithi.name,
    );

  return {
    name:
      tithi.name,

    shortName,

    index:
      tithi.index,

    paksha:
      tithi.paksha,
  };
}

/**
 * Generate compact Tithi name.
 */
export function createTithiShortName(
  name: string,
): string {
  const normalized =
    name.trim();

  if (!normalized) {
    return "";
  }

  const replacements: Array<
    [string, string]
  > = [
    [
      "Chaturdashi",
      "Chatur",
    ],
    [
      "Pratipada",
      "Prati",
    ],
    [
      "Dvitiya",
      "Dvit",
    ],
    [
      "Tritiya",
      "Trit",
    ],
    [
      "Chaturthi",
      "Chat",
    ],
    [
      "Panchami",
      "Panch",
    ],
    [
      "Shashthi",
      "Shash",
    ],
    [
      "Saptami",
      "Sapt",
    ],
    [
      "Ashtami",
      "Asht",
    ],
    [
      "Navami",
      "Nav",
    ],
    [
      "Dashami",
      "Dash",
    ],
    [
      "Ekadashi",
      "Ekad",
    ],
    [
      "Dwadashi",
      "Dwad",
    ],
    [
      "Trayodashi",
      "Tray",
    ],
    [
      "Purnima",
      "Purn",
    ],
    [
      "Amavasya",
      "Amav",
    ],
  ];

  let result =
    normalized;

  for (
    const [
      from,
      to,
    ] of replacements
  ) {
    result =
      result.replace(
        from,
        to,
      );
  }

  return result.slice(
    0,
    7,
  );
}

/**
 * Check Tithi by index.
 *
 * This uses the index supplied by panchang.ts.
 */
export function isEkadashiTithi(
  tithiIndex: number,
): boolean {
  return (
    tithiIndex % 15 ===
    10
  );
}

export function isPurnimaTithi(
  tithiIndex: number,
): boolean {
  return (
    tithiIndex ===
    14
  );
}

export function isAmavasyaTithi(
  tithiIndex: number,
): boolean {
  return (
    tithiIndex ===
    29
  );
}

/* ============================================================================
 * FESTIVAL -> EVENT TYPE
 * ========================================================================== */

/**
 * Convert Festival category into calendar event type.
 */
function mapFestivalCategoryToEventType(
  festival: Festival,
): CalendarEventType {
  const title =
    festival.title
      .toLowerCase()
      .trim();

  const category =
    festival.category;

  /*
   * Specific Tithi events always get priority.
   */
  if (
    title.includes(
      "ekadashi",
    )
  ) {
    return "ekadashi";
  }

  if (
    title.includes(
      "purnima",
    )
  ) {
    return "purnima";
  }

  if (
    title.includes(
      "amavasya",
    )
  ) {
    return "amavasya";
  }

  switch (
    category
  ) {
    case "national":
      return "national";

    case "sankranti":
      return "sankranti";

    case "vrat":
      return "vrat";

    case "regional":
      return "regional";

    case "religious":
      return "religious";

    case "observance":
      return "observance";

    default:
      return "festival";
  }
}

/* ============================================================================
 * FESTIVAL IMPORTANCE
 * ========================================================================== */

function isFestivalMajor(
  festival: Festival,
): boolean {
  return (
    festival.isMajor ===
      true ||
    festival.importance ===
      "major"
  );
}

/* ============================================================================
 * FESTIVAL BADGE
 * ========================================================================== */

function getFestivalCalendarBadge(
  festival: Festival,
): string | undefined {
  if (
    festival.badge
  ) {
    return festival.badge;
  }

  const title =
    festival.title
      .toLowerCase();

  if (
    title.includes(
      "ekadashi",
    )
  ) {
    return "Ekadashi";
  }

  if (
    title.includes(
      "purnima",
    )
  ) {
    return "Purnima";
  }

  if (
    title.includes(
      "amavasya",
    )
  ) {
    return "Amavasya";
  }

  if (
    title.includes(
      "diwali",
    ) ||
    title.includes(
      "deepavali",
    )
  ) {
    return "Diwali";
  }

  if (
    title.includes(
      "ganesh",
    )
  ) {
    return "Ganesh";
  }

  if (
    title.includes(
      "navratri",
    )
  ) {
    return "Navratri";
  }

  if (
    title.includes(
      "dussehra",
    ) ||
    title.includes(
      "vijayadashami",
    )
  ) {
    return "Dussehra";
  }

  if (
    title.includes(
      "chhath",
    )
  ) {
    return "Chhath";
  }

  if (
    festival.category ===
    "national"
  ) {
    return "National";
  }

  if (
    festival.category ===
    "sankranti"
  ) {
    return "Sankranti";
  }

  if (
    festival.category ===
    "regional"
  ) {
    return "Regional";
  }

  return "Festival";
}

/* ============================================================================
 * FESTIVAL -> CALENDAR EVENT
 * ========================================================================== */

function festivalToCalendarEvent(
  festival: Festival,
): CalendarEvent {
  return {
    id:
      festival.id,

    dateISO:
      festival.dateISO,

    title:
      festival.title,

    shortTitle:
      festival.shortTitle ??
      festival.title,

    type:
      mapFestivalCategoryToEventType(
        festival,
      ),

    region:
      festival.region,

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

    description:
      festival.description,

    location:
      festival.city,

    isMajor:
      isFestivalMajor(
        festival,
      ),

    badge:
      getFestivalCalendarBadge(
        festival,
      ),
  };
}

/* ============================================================================
 * FESTIVAL EVENTS
 * ========================================================================== */

/**
 * Get festival events for one date.
 */
export function getCalendarFestivalEventsForDate(
  dateISO: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  assertValidDateISO(
    dateISO,
  );
  assertValidCalendarLocation(location);

  const festivals =
    getFestivalsForDate(
      dateFromISO(
        dateISO,
      ),
      location,
    );

  return sortCalendarEvents(
    deduplicateEvents(
      festivals.map(
        festivalToCalendarEvent,
      ),
    ),
  );
}

/**
 * Get all festival events for month.
 */
export function getFestivalEventsForMonth(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  assertValidYearMonth(
    year,
    month0,
  );
  assertValidCalendarLocation(location);

  const festivals =
    getFestivalsForMonth(
      year,
      month0,
      location,
    );

  return sortCalendarEvents(
    deduplicateEvents(
      festivals.map(
        festivalToCalendarEvent,
      ),
    ),
  );
}

/**
 * Get all festival events for a year.
 */
export function getFestivalEventsForYear(
  year: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  assertValidYearMonth(year, 0);
  assertValidCalendarLocation(location);

  const events: CalendarEvent[] =
    [];

  for (
    let month0 = 0;
    month0 < 12;
    month0++
  ) {
    events.push(
      ...getFestivalEventsForMonth(
        year,
        month0,
        location,
      ),
    );
  }

  return sortCalendarEvents(
    deduplicateEvents(
      events,
    ),
  );
}

/* ============================================================================
 * DATE EVENTS
 * ========================================================================== */

/**
 * Get all calendar events for a specific date.
 */
export function getCalendarEventsForDate(
  date: Date,
  location: PanchangLocation =
    DEFAULT_LOCATION,
  precomputedPanchang?: Panchang,
): CalendarEvent[] {
  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      "Invalid date supplied to getCalendarEventsForDate().",
    );
  }

  assertValidCalendarLocation(location);

  const dateISO =
    getDateISO(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    );

  const festivalEvents =
    getCalendarFestivalEventsForDate(
      dateISO,
      location,
    );

  const tithi =
    precomputedPanchang
      ? {
          name:
            precomputedPanchang.tithi
              .name,

          shortName:
            createTithiShortName(
              precomputedPanchang
                .tithi.name,
            ),

          index:
            precomputedPanchang.tithi
              .index,

          paksha:
            precomputedPanchang.tithi
              .paksha,
        }
      : getCalendarTithi(
          date,
          location,
        );

  const events: CalendarEvent[] = [
    ...festivalEvents,
  ];

  /*
   * We add fallback markers only when the festival engine has not already
   * supplied a matching event.
   */
  const hasEventType =
    (
      type: CalendarEventType,
    ): boolean =>
      events.some(
        (event) =>
          event.type === type,
      );

  const hasTitle =
    (
      keyword: string,
    ): boolean =>
      events.some(
        (event) =>
          event.title
            .toLowerCase()
            .includes(
              keyword,
            ),
      );

  /*
   * Ekadashi
   */
  if (
    isEkadashiTithi(
      tithi.index,
    ) &&
    !hasEventType(
      "ekadashi",
    ) &&
    !hasTitle(
      "ekadashi",
    )
  ) {
    events.push({
      id:
        `${dateISO}-ekadashi`,

      dateISO,

      title:
        "Ekadashi Vrat",

      shortTitle:
        "Ekadashi",

      type:
        "ekadashi",

      description:
        "Ekadashi fasting and devotional observance.",

      isMajor:
        true,

      badge:
        "Ekadashi",
    });
  }

  /*
   * Purnima
   */
  if (
    isPurnimaTithi(
      tithi.index,
    ) &&
    !hasEventType(
      "purnima",
    ) &&
    !hasTitle(
      "purnima",
    )
  ) {
    events.push({
      id:
        `${dateISO}-purnima`,

      dateISO,

      title:
        "Purnima",

      shortTitle:
        "Purnima",

      type:
        "purnima",

      description:
        "Full Moon / Purnima observance.",

      isMajor:
        true,

      badge:
        "Purnima",
    });
  }

  /*
   * Amavasya
   */
  if (
    isAmavasyaTithi(
      tithi.index,
    ) &&
    !hasEventType(
      "amavasya",
    ) &&
    !hasTitle(
      "amavasya",
    )
  ) {
    events.push({
      id:
        `${dateISO}-amavasya`,

      dateISO,

      title:
        "Amavasya",

      shortTitle:
        "Amavasya",

      type:
        "amavasya",

      description:
        "New Moon / Amavasya observance.",

      isMajor:
        true,

      badge:
        "Amavasya",
    });
  }

  return sortCalendarEvents(
    deduplicateEvents(
      events,
    ),
  );
}

/* ============================================================================
 * CREATE CALENDAR DAY
 * ========================================================================== */

/**
 * Create one calendar day.
 */
export function createCalendarDay(
  year: number,
  month0: number,
  day: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
  includePanchang = false,
): CalendarDayData {
  assertValidDay(
    year,
    month0,
    day,
  );

  const date =
    createLocalDate(
      year,
      month0,
      day,
    );

  const dateISO =
    getDateISO(
      year,
      month0,
      day,
    );

  const weekday =
    date.getUTCDay();

  // One Panchang calculation is enough for Tithi + optional daily details.
  // The same object is passed to getCalendarEventsForDate() to avoid a second
  // full Panchang calculation for every calendar cell.
  const dailyPanchang =
    getPanchangForCalendarParts(
      year,
      month0,
      day,
      location,
    );

  const tithi = {
    name: dailyPanchang.tithi.name,
    shortName: createTithiShortName(
      dailyPanchang.tithi.name,
    ),
    index: dailyPanchang.tithi.index,
    paksha: dailyPanchang.tithi.paksha,
  };

  const nakshatra =
    dailyPanchang.nakshatra
      ? {
          name:
            dailyPanchang.nakshatra
              .name,

          index:
            dailyPanchang.nakshatra
              .index,

          pada:
            dailyPanchang.nakshatra
              .pada,
        }
      : undefined;

  return {
    day,

    dateISO,

    weekday,

    weekdayName:
      WEEKDAY_NAMES[
        weekday
      ],

    isToday:
      isTodayISO(
        dateISO,
      ),

    isCurrentMonth:
      true,

    tithi,

    nakshatra,

    isEkadashi:
      isEkadashiTithi(
        tithi.index,
      ),

    isPurnima:
      isPurnimaTithi(
        tithi.index,
      ),

    isAmavasya:
      isAmavasyaTithi(
        tithi.index,
      ),

    events:
      getCalendarEventsForDate(
        date,
        location,
        dailyPanchang,
      ),

    panchang:
      includePanchang
        ? dailyPanchang
        : undefined,
  };
}

/* ============================================================================
 * ADJACENT MONTH CELLS
 * ========================================================================== */

function createAdjacentMonthDay(
  year: number,
  month0: number,
  day: number,
  location: PanchangLocation,
): CalendarDayData {
  const data =
    createCalendarDay(
      year,
      month0,
      day,
      location,
      false,
    );

  return {
    ...data,

    isCurrentMonth:
      false,
  };
}

/**
 * Create previous-month calendar cells.
 */
function createPreviousMonthDays(
  year: number,
  month0: number,
  count: number,
  location: PanchangLocation,
): CalendarDayData[] {
  if (
    count <= 0
  ) {
    return [];
  }

  const previous =
    getPreviousMonth(
      year,
      month0,
    );

  const daysInPrevious =
    getDaysInMonth(
      previous.year,
      previous.month0,
    );

  const result: CalendarDayData[] =
    [];

  const firstDay =
    daysInPrevious -
    count +
    1;

  for (
    let day = firstDay;
    day <= daysInPrevious;
    day++
  ) {
    result.push(
      createAdjacentMonthDay(
        previous.year,
        previous.month0,
        day,
        location,
      ),
    );
  }

  return result;
}

/**
 * Create next-month calendar cells.
 */
function createNextMonthDays(
  year: number,
  month0: number,
  count: number,
  location: PanchangLocation,
): CalendarDayData[] {
  if (
    count <= 0
  ) {
    return [];
  }

  const next =
    getNextMonth(
      year,
      month0,
    );

  const result: CalendarDayData[] =
    [];

  for (
    let day = 1;
    day <= count;
    day++
  ) {
    result.push(
      createAdjacentMonthDay(
        next.year,
        next.month0,
        day,
        location,
      ),
    );
  }

  return result;
}

/* ============================================================================
 * WEEKDAY OFFSET
 * ========================================================================== */

/**
 * Calculate calendar grid offset.
 */
export function getCalendarStartOffset(
  firstWeekday: number,
  weekStartsOn: CalendarWeekStartsOn,
): number {
  assertValidWeekStartsOn(
    weekStartsOn,
  );

  if (
    !Number.isInteger(firstWeekday) ||
    firstWeekday < 0 ||
    firstWeekday > 6
  ) {
    throw new Error(
      `Invalid weekday: ${firstWeekday}`,
    );
  }

  if (
    weekStartsOn ===
    "sunday"
  ) {
    return firstWeekday;
  }

  return firstWeekday === 0
    ? 6
    : firstWeekday - 1;
}

/* ============================================================================
 * MONTHLY CALENDAR
 * ========================================================================== */

/**
 * Build a complete monthly calendar.
 */
export function buildMonthlyCalendar(
  year: number,
  month0: number,
  options?: {
    location?: PanchangLocation;
    weekStartsOn?: CalendarWeekStartsOn;
    includePanchang?: boolean;
  },
): MonthlyCalendar {
  assertValidYearMonth(
    year,
    month0,
  );

  const location =
    options?.location ??
    DEFAULT_LOCATION;

  const weekStartsOn =
    options?.weekStartsOn ??
    "sunday";

  assertValidWeekStartsOn(
    weekStartsOn,
  );

  assertValidCalendarLocation(
    location,
  );

  const includePanchang =
    options?.includePanchang ??
    false;

  const daysInMonth =
    getDaysInMonth(
      year,
      month0,
    );

  const firstDay =
    getFirstWeekday(
      year,
      month0,
    );

  const offset =
    getCalendarStartOffset(
      firstDay,
      weekStartsOn,
    );

  const days: CalendarDayData[] =
    [];

  /*
   * Previous month cells.
   */
  if (
    offset > 0
  ) {
    days.push(
      ...createPreviousMonthDays(
        year,
        month0,
        offset,
        location,
      ),
    );
  }

  /*
   * Current month.
   */
  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push(
      createCalendarDay(
        year,
        month0,
        day,
        location,
        includePanchang,
      ),
    );
  }

  /*
   * Always use a complete 5/6 row calendar.
   */
  const currentRows =
    Math.ceil(
      days.length /
        DAYS_PER_WEEK,
    );

  const requiredRows =
    Math.min(
      MAX_CALENDAR_ROWS,
      Math.max(
        MIN_CALENDAR_ROWS,
        currentRows,
      ),
    );

  const targetCells =
    requiredRows *
    DAYS_PER_WEEK;

  const remaining =
    Math.max(
      0,
      targetCells -
        days.length,
    );

  if (
    remaining > 0
  ) {
    days.push(
      ...createNextMonthDays(
        year,
        month0,
        remaining,
        location,
      ),
    );
  }

  /*
   * Safety fallback.
   */
  while (
    days.length %
      DAYS_PER_WEEK !==
    0
  ) {
    days.push(
      ...createNextMonthDays(
        year,
        month0,
        1,
        location,
      ),
    );
  }

  const weeks: CalendarWeek[] =
    [];

  for (
    let i = 0;
    i < days.length;
    i += DAYS_PER_WEEK
  ) {
    weeks.push({
      weekIndex:
        i / DAYS_PER_WEEK,

      days:
        days.slice(
          i,
          i + DAYS_PER_WEEK,
        ),
    });
  }

  const currentMonthDays =
    days.filter(
      (day) =>
        day.isCurrentMonth,
    );

  const events =
    sortCalendarEvents(
      deduplicateEvents(
        currentMonthDays.flatMap(
          (day) =>
            day.events,
        ),
      ),
    );

  const majorEvents =
    events.filter(
      (event) =>
        event.isMajor ===
        true,
    );

  return {
    year,

    month:
      month0 + 1,

    month0,

    monthName:
      MONTH_NAMES[
        month0
      ],

    monthNameHindi:
      MONTH_NAMES_HI[
        month0
      ],

    firstDay,

    daysInMonth,

    previousMonth:
      getPreviousMonth(
        year,
        month0,
      ),

    nextMonth:
      getNextMonth(
        year,
        month0,
      ),

    location,

    region:
      location.region,

    weekStartsOn,

    weekdays:
      getWeekdayLabels(
        weekStartsOn,
      ),

    weekdaysHindi:
      getWeekdayLabelsHindi(
        weekStartsOn,
      ),

    days,

    weeks,

    events,

    majorEvents,

    eventCount:
      events.length,

    majorEventCount:
      majorEvents.length,
  };
}

/* ============================================================================
 * SIMPLE MONTH CALENDAR
 * ========================================================================== */

/**
 * Backward-compatible month calendar.
 */
export function getMonthCalendar(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarDayData[] {
  return buildMonthlyCalendar(
    year,
    month0,
    {
      location,

      weekStartsOn:
        "sunday",

      includePanchang:
        false,
    },
  ).days;
}

/**
 * Location-aware monthly calendar.
 */
export function getMonthCalendarForLocation(
  year: number,
  month0: number,
  location: PanchangLocation,
): MonthlyCalendar {
  return buildMonthlyCalendar(
    year,
    month0,
    {
      location,

      weekStartsOn:
        "sunday",

      includePanchang:
        false,
    },
  );
}

/**
 * City-based monthly calendar.
 */
export function getMonthCalendarForCity(
  year: number,
  month0: number,
  cityId: string,
): MonthlyCalendar {
  const location =
    resolveCalendarLocation(
      cityId,
    );

  return buildMonthlyCalendar(
    year,
    month0,
    {
      location,

      weekStartsOn:
        "sunday",

      includePanchang:
        false,
    },
  );
}

/* ============================================================================
 * FULL PANCHANG CALENDAR
 * ========================================================================== */

/**
 * Build calendar with Panchang loaded for every current-month day.
 *
 * This is more expensive than buildMonthlyCalendar(... includePanchang:false).
 *
 * Use it only when the UI actually needs full daily Panchang details.
 */
export function buildPanchangMonthlyCalendar(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
  weekStartsOn: CalendarWeekStartsOn =
    "sunday",
): MonthlyCalendar {
  return buildMonthlyCalendar(
    year,
    month0,
    {
      location,

      weekStartsOn,

      includePanchang:
        true,
    },
  );
}

/* ============================================================================
 * DATE DETAILS
 * ========================================================================== */

/**
 * Get complete calendar date details.
 */
export function getCalendarDateDetails(
  dateISO: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): {
  dateISO: string;
  date: Date;
  panchang: Panchang;
  events: CalendarEvent[];
} {
  assertValidDateISO(
    dateISO,
  );

  const date =
    dateFromISO(
      dateISO,
    );

  const {
    year,
    month0,
    day,
  } =
    parseDateISO(
      dateISO,
    );

  const panchang =
    getPanchangForCalendarParts(
      year,
      month0,
      day,
      location,
    );

  const events =
    getCalendarEventsForDate(
      date,
      location,
    );

  return {
    dateISO,

    date,

    panchang,

    events,
  };
}

/**
 * Get Panchang for calendar date.
 */
export function getPanchangForCalendarDate(
  dateISO: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Panchang {
  const {
    year,
    month0,
    day,
  } =
    parseDateISO(
      dateISO,
    );

  return getPanchangForCalendarParts(
    year,
    month0,
    day,
    location,
  );
}

/**
 * Get full Panchang from an existing CalendarDayData.
 */
export function getFullCalendarDayPanchang(
  day: CalendarDayData,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): Panchang {
  return (
    day.panchang ??
    getPanchangForCalendarDate(
      day.dateISO,
      location,
    )
  );
}

/* ============================================================================
 * FESTIVAL HELPERS
 * ========================================================================== */

export function getEventsForMonth(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  return getFestivalEventsForMonth(
    year,
    month0,
    location,
  );
}

export function getMajorEventsForMonth(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  return getEventsForMonth(
    year,
    month0,
    location,
  ).filter(
    (event) =>
      event.isMajor ===
      true,
  );
}

export function getEkadashiDates(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  return getEventsForMonth(
    year,
    month0,
    location,
  ).filter(
    (event) =>
      event.type ===
        "ekadashi" ||
      event.title
        .toLowerCase()
        .includes(
          "ekadashi",
        ),
  );
}

export function getPurnimaDates(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  return getEventsForMonth(
    year,
    month0,
    location,
  ).filter(
    (event) =>
      event.type ===
        "purnima" ||
      event.title
        .toLowerCase()
        .includes(
          "purnima",
        ),
  );
}

export function getAmavasyaDates(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  return getEventsForMonth(
    year,
    month0,
    location,
  ).filter(
    (event) =>
      event.type ===
        "amavasya" ||
      event.title
        .toLowerCase()
        .includes(
          "amavasya",
        ),
  );
}

/* ============================================================================
 * REGIONAL CALENDAR
 * ========================================================================== */

/**
 * Get events for a specific Indian region.
 */
export function getRegionalEventsForMonth(
  year: number,
  month0: number,
  region: IndiaRegion,
): CalendarEvent[] {
  const locations =
    Object.values(
      INDIA_LOCATIONS,
    ).filter(
      (location) =>
        location.region ===
        region,
    );

  /*
   * If the project has no location explicitly assigned to the region,
   * fall back to DEFAULT_LOCATION.
   */
  const location =
    locations[0] ??
    DEFAULT_LOCATION;

  return getEventsForMonth(
    year,
    month0,
    location,
  ).filter(
    (event) =>
      event.region ===
        region ||
      event.type ===
        "regional",
  );
}

/**
 * Build one calendar for each India region.
 */
export function getIndiaRegionCalendars(
  year: number,
  month0: number,
): Partial<
  Record<
    IndiaRegion,
    MonthlyCalendar
  >
> {
  const result: Partial<
    Record<
      IndiaRegion,
      MonthlyCalendar
    >
  > = {};

  for (
    const region of
    getCalendarIndiaRegions()
  ) {
    const location =
      Object.values(
        INDIA_LOCATIONS,
      ).find(
        (item) =>
          item.region ===
          region,
      ) ??
      DEFAULT_LOCATION;

    result[region] =
      buildMonthlyCalendar(
        year,
        month0,
        {
          location,

          weekStartsOn:
            "sunday",

          includePanchang:
            false,
        },
      );
  }

  return result;
}

/* ============================================================================
 * LOCATION
 * ========================================================================== */

/**
 * Resolve location by city ID.
 */
export function resolveCalendarLocation(
  cityId?: string,
  fallback: PanchangLocation =
    DEFAULT_LOCATION,
): PanchangLocation {
  if (
    !cityId ||
    !cityId.trim()
  ) {
    return fallback;
  }

  const location =
    getLocationById(
      cityId,
    );

  return (
    location ??
    fallback
  );
}

/**
 * Get all configured Indian calendar locations.
 */
export function getCalendarLocations(): PanchangLocation[] {
  return Object.values(
    INDIA_LOCATIONS,
  );
}

/**
 * Get locations grouped by region.
 */
export function getCalendarLocationsByRegion(): Record<
  IndiaRegion,
  PanchangLocation[]
> {
  const result =
    {} as Record<
      IndiaRegion,
      PanchangLocation[]
    >;

  for (
    const region of
    getCalendarIndiaRegions()
  ) {
    result[region] =
      Object.values(
        INDIA_LOCATIONS,
      ).filter(
        (location) =>
          location.region ===
          region,
      );
  }

  return result;
}

/* ============================================================================
 * WEEKDAY LABELS
 * ========================================================================== */

/**
 * Get English weekday labels.
 */
export function getWeekdayLabels(
  weekStartsOn: CalendarWeekStartsOn =
    "sunday",
): string[] {
  assertValidWeekStartsOn(
    weekStartsOn,
  );

  if (
    weekStartsOn ===
    "sunday"
  ) {
    return [
      ...WEEKDAY_NAMES_SHORT,
    ];
  }

  return [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];
}

/**
 * Get Hindi weekday labels.
 */
export function getWeekdayLabelsHindi(
  weekStartsOn: CalendarWeekStartsOn =
    "sunday",
): string[] {
  assertValidWeekStartsOn(
    weekStartsOn,
  );

  if (
    weekStartsOn ===
    "sunday"
  ) {
    return [
      "रवि",
      "सोम",
      "मंगल",
      "बुध",
      "गुरु",
      "शुक्र",
      "शनि",
    ];
  }

  return [
    "सोम",
    "मंगल",
    "बुध",
    "गुरु",
    "शुक्र",
    "शनि",
    "रवि",
  ];
}

/* ============================================================================
 * NAVIGATION
 * ========================================================================== */

/**
 * Navigate one month.
 */
export function navigateMonth(
  year: number,
  month0: number,
  direction:
    | "previous"
    | "next",
): {
  year: number;
  month0: number;
} {
  assertValidYearMonth(
    year,
    month0,
  );
  assertValidNavigationDirection(
    direction,
  );

  if (
    direction ===
    "previous"
  ) {
    if (
      month0 === 0 &&
      year === MIN_CALENDAR_YEAR
    ) {
      throw new Error(
        "Cannot navigate before the supported calendar year 1.",
      );
    }

    return month0 === 0
      ? {
          year:
            year - 1,

          month0:
            11,
        }
      : {
          year,

          month0:
            month0 - 1,
        };
  }

  if (
    month0 === 11 &&
    year === MAX_CALENDAR_YEAR
  ) {
    throw new Error(
      "Cannot navigate beyond the supported calendar year 9999.",
    );
  }

  return month0 === 11
    ? {
        year:
          year + 1,

        month0:
          0,
      }
    : {
        year,

        month0:
          month0 + 1,
      };
}

/**
 * Navigate one year.
 */
export function navigateYear(
  year: number,
  direction:
    | "previous"
    | "next",
): number {
  assertValidYearMonth(year, 0);
  assertValidNavigationDirection(
    direction,
  );

  const nextYear =
    direction === "previous"
      ? year - 1
      : year + 1;

  if (
    nextYear < MIN_CALENDAR_YEAR ||
    nextYear > MAX_CALENDAR_YEAR
  ) {
    throw new Error(
      `Year navigation is limited to ${MIN_CALENDAR_YEAR}-${MAX_CALENDAR_YEAR}.`,
    );
  }

  return nextYear;
}

/* ============================================================================
 * DATE RANGE
 * ========================================================================== */

/**
 * Get month date range.
 */
export function getMonthDateRange(
  year: number,
  month0: number,
): {
  start: string;
  end: string;
} {
  assertValidYearMonth(
    year,
    month0,
  );

  return {
    start:
      getDateISO(
        year,
        month0,
        1,
      ),

    end:
      getDateISO(
        year,
        month0,
        getDaysInMonth(
          year,
          month0,
        ),
      ),
  };
}

/**
 * Get all ISO dates in month.
 */
export function getMonthDateISOs(
  year: number,
  month0: number,
): string[] {
  assertValidYearMonth(year, month0);

  const days =
    getDaysInMonth(
      year,
      month0,
    );

  return Array.from(
    {
      length: days,
    },
    (_, index) =>
      getDateISO(
        year,
        month0,
        index + 1,
      ),
  );
}

/* ============================================================================
 * YEAR CALENDAR
 * ========================================================================== */

/**
 * Get all twelve monthly calendars.
 */
export function getYearCalendar(
  year: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): MonthlyCalendar[] {
  assertValidYearMonth(year, 0);
  assertValidCalendarLocation(location);

  return Array.from(
    {
      length: 12,
    },
    (_, month0) =>
      buildMonthlyCalendar(
        year,
        month0,
        {
          location,

          weekStartsOn:
            "sunday",

          includePanchang:
            false,
        },
      ),
  );
}

/* ============================================================================
 * SEARCH
 * ========================================================================== */

/**
 * Search calendar events in a month.
 */
export function searchCalendarEvents(
  year: number,
  month0: number,
  searchTerm: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent[] {
  const normalized =
    searchTerm
      .trim()
      .toLowerCase();

  if (!normalized) {
    return [];
  }

  return getEventsForMonth(
    year,
    month0,
    location,
  ).filter(
    (event) => {
      const fields = [
        event.title,

        event.shortTitle,

        event.description,

        event.location,

        event.badge,
      ];

      return fields.some(
        (field) =>
          field
            ?.toLowerCase()
            .includes(
              normalized,
            ),
      );
    },
  );
}

/* ============================================================================
 * EVENT FILTERING
 * ========================================================================== */

export function filterCalendarEvents(
  events: CalendarEvent[],
  options?: {
    type?: CalendarEventType;

    region?: IndiaRegion;

    majorOnly?: boolean;

    search?: string;
  },
): CalendarEvent[] {
  const search =
    options?.search
      ?.trim()
      .toLowerCase();

  return events.filter(
    (event) => {
      if (
        options?.type &&
        event.type !==
          options.type
      ) {
        return false;
      }

      if (
        options?.region &&
        event.region !==
          options.region
      ) {
        return false;
      }

      if (
        options?.majorOnly &&
        !event.isMajor
      ) {
        return false;
      }

      if (
        search &&
        ![
          event.title,

          event.shortTitle,

          event.description,

          event.location,

          event.badge,
        ].some(
          (value) =>
            value
              ?.toLowerCase()
              .includes(
                search,
              ),
        )
      ) {
        return false;
      }

      return true;
    },
  );
}

/* ============================================================================
 * DAY HELPERS
 * ========================================================================== */

export type CalendarDayCategory =
  | "normal"
  | "ekadashi"
  | "purnima"
  | "amavasya"
  | "festival"
  | "regional"
  | "national";

/**
 * Determine primary category for a calendar day.
 */
export function getCalendarDayCategory(
  day: CalendarDayData,
): CalendarDayCategory {
  if (
    day.events.some(
      (event) =>
        event.type ===
        "national",
    )
  ) {
    return "national";
  }

  if (
    day.events.some(
      (event) =>
        event.type ===
        "regional",
    )
  ) {
    return "regional";
  }

  if (
    day.events.some(
      (event) =>
        event.type ===
          "festival" ||
        event.type ===
          "religious" ||
        event.type ===
          "sankranti",
    )
  ) {
    return "festival";
  }

  if (
    day.isEkadashi
  ) {
    return "ekadashi";
  }

  if (
    day.isPurnima
  ) {
    return "purnima";
  }

  if (
    day.isAmavasya
  ) {
    return "amavasya";
  }

  return "normal";
}

/**
 * Get primary Tithi/event badge.
 */
export function getTithiBadge(
  day: CalendarDayData,
): string | null {
  if (
    day.isEkadashi
  ) {
    return "Ekadashi";
  }

  if (
    day.isPurnima
  ) {
    return "Purnima";
  }

  if (
    day.isAmavasya
  ) {
    return "Amavasya";
  }

  const majorEvent =
    day.events.find(
      (event) =>
        event.isMajor &&
        Boolean(
          event.badge,
        ),
    );

  return (
    majorEvent?.badge ??
    null
  );
}

/**
 * Get most important event of day.
 */
export function getPrimaryCalendarEvent(
  day: CalendarDayData,
): CalendarEvent | null {
  return (
    day.events.find(
      (event) =>
        event.isMajor,
    ) ??
    day.events[0] ??
    null
  );
}

/**
 * Event count.
 */
export function getCalendarEventCount(
  day: CalendarDayData,
): number {
  return day.events.length;
}

/* ============================================================================
 * MONTH SUMMARY
 * ========================================================================== */

export type CalendarSummary = {
  month: string;

  monthHindi: string;

  year: number;

  days: number;

  eventCount: number;

  majorEventCount: number;

  ekadashiCount: number;

  purnimaCount: number;

  amavasyaCount: number;

  regionalEventCount: number;

  nationalEventCount: number;
};

/**
 * Generate monthly calendar summary.
 */
export function getCalendarSummary(
  year: number,
  month0: number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarSummary {
  const calendar =
    buildMonthlyCalendar(
      year,
      month0,
      {
        location,

        weekStartsOn:
          "sunday",

        includePanchang:
          false,
      },
    );

  return {
    month:
      calendar.monthName,

    monthHindi:
      calendar.monthNameHindi,

    year,

    days:
      calendar.daysInMonth,

    eventCount:
      calendar.events.length,

    majorEventCount:
      calendar.majorEvents
        .length,

    ekadashiCount:
      calendar.events.filter(
        (event) =>
          event.type ===
            "ekadashi" ||
          event.title
            .toLowerCase()
            .includes(
              "ekadashi",
            ),
      ).length,

    purnimaCount:
      calendar.events.filter(
        (event) =>
          event.type ===
            "purnima" ||
          event.title
            .toLowerCase()
            .includes(
              "purnima",
            ),
      ).length,

    amavasyaCount:
      calendar.events.filter(
        (event) =>
          event.type ===
            "amavasya" ||
          event.title
            .toLowerCase()
            .includes(
              "amavasya",
            ),
      ).length,

    regionalEventCount:
      calendar.events.filter(
        (event) =>
          event.type ===
          "regional",
      ).length,

    nationalEventCount:
      calendar.events.filter(
        (event) =>
          event.type ===
          "national",
      ).length,
  };
}

/* ============================================================================
 * EVENT DATE LOOKUPS
 * ========================================================================== */

/**
 * Find all event dates matching a term in a month.
 */
export function findEventDates(
  year: number,
  month0: number,
  searchTerm: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): string[] {
  return [
    ...new Set(
      searchCalendarEvents(
        year,
        month0,
        searchTerm,
        location,
      ).map(
        (event) =>
          event.dateISO,
      ),
    ),
  ];
}

/**
 * Find first matching event in month.
 */
export function findFirstCalendarEvent(
  year: number,
  month0: number,
  searchTerm: string,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): CalendarEvent | null {
  return (
    searchCalendarEvents(
      year,
      month0,
      searchTerm,
      location,
    )[0] ??
    null
  );
}

/* ============================================================================
 * MONTHLY EVENT INDEX
 * ========================================================================== */

export function createMonthlyEventIndex(
  calendar: MonthlyCalendar,
): Record<
  string,
  CalendarEvent[]
> {
  const index: Record<
    string,
    CalendarEvent[]
  > = {};

  for (
    const event of
    calendar.events
  ) {
    if (
      !index[event.dateISO]
    ) {
      index[event.dateISO] =
        [];
    }

    index[event.dateISO].push(
      event,
    );
  }

  return index;
}

/* ============================================================================
 * DAY MAP
 * ========================================================================== */

export function createCalendarDayMap(
  calendar: MonthlyCalendar,
): Record<
  string,
  CalendarDayData
> {
  const result: Record<
    string,
    CalendarDayData
  > = {};

  for (
    const day of
    calendar.days
  ) {
    result[day.dateISO] =
      day;
  }

  return result;
}


/** Calendar-owned weekday aliases kept for compatibility with older UI code. */
export const VARAS = WEEKDAY_NAMES;

/**
 * Legacy monthCalendar helper. Prefer buildMonthlyCalendar() for new code.
 */
export function monthCalendar(
  year: number,
  month0: number,
  location: PanchangLocation = DEFAULT_LOCATION,
): MonthlyCalendar {
  return buildMonthlyCalendar(year, month0, { location });
}

/* ============================================================================
 * PAN-INDIA TRUST + PERSONALIZATION
 * ========================================================================== */

export type CalendarPersonalization = {
  location: PanchangLocation;
  region?: IndiaRegion;
  state?: string;
  city?: string;
  title: string;
  message: string;
  trustNote: string;
};

export function getCalendarTrustNote(
  location: PanchangLocation = DEFAULT_LOCATION,
): CalendarPersonalization {
  assertValidCalendarLocation(
    location,
  );

  const city = location.city ?? location.name ?? "Selected location";
  const state = location.state;
  const region = location.region;

  return {
    location,
    region,
    state,
    city,
    title: "Your DharmYatra Calendar",
    message: state
      ? `Showing Panchang and festival information relevant to ${city}, ${state}. Regional observances may vary by local tradition.`
      : `Showing Panchang and festival information for ${city}. Select your city for more locally relevant results.`,
    trustNote:
      "Dates are generated from the selected location and DharmYatra's Panchang/festival engines. Regional and Sampradaya-specific observances are identified rather than presented as universally identical.",
  };
}

export function getPersonalizedCalendarEventsForMonth(
  year: number,
  month0: number,
  location: PanchangLocation = DEFAULT_LOCATION,
): CalendarEvent[] {
  assertValidYearMonth(year, month0);
  assertValidCalendarLocation(location);

  const festivals = getPersonalizedFestivals(
    year,
    month0,
    location,
  );

  return sortCalendarEvents(
    deduplicateEvents(
      festivals.map(festivalToCalendarEvent),
    ),
  );
}

export function getPersonalizedCalendarEventsForDate(
  dateISO: string,
  location: PanchangLocation = DEFAULT_LOCATION,
): CalendarEvent[] {
  assertValidDateISO(dateISO);
  const { year, month0 } = parseDateISO(dateISO);

  return getPersonalizedCalendarEventsForMonth(
    year,
    month0,
    location,
  ).filter((event) => event.dateISO === dateISO);
}

export function getCalendarRelevanceLabel(
  event: CalendarEvent,
): string {
  switch (event.relevance) {
    case "city":
      return "For your city";
    case "state":
      return "For your state";
    case "regional":
      return "For your region";
    case "pan-india":
    default:
      return "Pan-India";
  }
}

export function getCalendarConfidenceLabel(
  event: CalendarEvent,
): string {
  switch (event.confidence) {
    case "high":
      return "Calculated / established";
    case "medium":
      return "Regional / rule-based";
    case "candidate":
      return "Candidate — verify local tradition";
    default:
      return "Informational";
  }
}

export function getCalendarEventTrustSummary(
  event: CalendarEvent,
): string {
  return event.trustNote ??
    "DharmYatra provides informational calendar data. Local temple, family and Sampradaya traditions may differ.";
}

/** Backward-compatible region helper. */
export function getIndiaRegions(): IndiaRegion[] {
  return getCalendarIndiaRegions();
}

/* ============================================================================
 * DEFAULT EXPORT
 * ========================================================================== */

const calendar = {
  MONTH_NAMES,
  getCalendarIndiaRegions,
  getCalendarTrustNote,
  getPersonalizedCalendarEventsForMonth,
  getPersonalizedCalendarEventsForDate,
  getCalendarRelevanceLabel,
  getCalendarConfidenceLabel,
  getCalendarEventTrustSummary,

  MONTH_NAMES_HI,

  WEEKDAY_NAMES,

  WEEKDAY_NAMES_SHORT,

  WEEKDAY_NAMES_HI,

  REGION_LABELS,

  REGION_LABELS_HI,

  createLocalDate,

  getDateISO,

  parseDateISO,

  dateFromISO,

  getDaysInMonth,

  getFirstWeekday,

  getPreviousMonth,

  getNextMonth,

  getTodayISO,

  isTodayISO,

  isSameDate,

  compareDateISO,

  addDaysToISO,

  createTithiShortName,

  getCalendarTithi,

  isEkadashiTithi,

  isPurnimaTithi,

  isAmavasyaTithi,

  getCalendarFestivalEventsForDate,

  getCalendarEventsForDate,

  createCalendarDay,

  getCalendarStartOffset,

  buildMonthlyCalendar,

  buildPanchangMonthlyCalendar,

  getMonthCalendar,

  getMonthCalendarForLocation,

  getMonthCalendarForCity,

  getCalendarDateDetails,

  getPanchangForCalendarDate,

  getFullCalendarDayPanchang,

  getFestivalEventsForMonth,

  getFestivalEventsForYear,

  getEventsForMonth,

  getMajorEventsForMonth,

  getEkadashiDates,

  getPurnimaDates,

  getAmavasyaDates,

  getRegionalEventsForMonth,

  getIndiaRegionCalendars,

  resolveCalendarLocation,

  getCalendarLocations,

  getCalendarLocationsByRegion,

  getWeekdayLabels,

  getWeekdayLabelsHindi,

  navigateMonth,

  navigateYear,

  getMonthDateRange,

  getMonthDateISOs,

  getYearCalendar,

  searchCalendarEvents,

  filterCalendarEvents,

  getCalendarDayCategory,

  getTithiBadge,

  getPrimaryCalendarEvent,

  getCalendarEventCount,

  getCalendarSummary,

  findEventDates,

  findFirstCalendarEvent,

  createMonthlyEventIndex,

  createCalendarDayMap,

  VARAS,

  monthCalendar,

  getIndiaRegions,

};

/* ============================================================================
 * BACKWARD COMPATIBILITY EXPORTS
 * ========================================================================== */

export {

  getLocationById,

  NAKSHATRAS,

  TITHIS,

};

export default calendar;