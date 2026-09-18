// src/lib/astrology.ts

import * as Astronomy from "astronomy-engine";

import {
  DEFAULT_LOCATION,
  INDIA_LOCATIONS,
  getLahiriAyanamsha,
  getSiderealMoonLongitude,
  type PanchangLocation,
} from "./panchang";

// Backward-compatible type export for modules that historically imported
// PanchangLocation from this shared astrology layer.
export type { PanchangLocation } from "./panchang";

/* =========================================================
   TYPES
========================================================= */

export type ZodiacSign =
  | "Mesha"
  | "Vrishabha"
  | "Mithuna"
  | "Karka"
  | "Simha"
  | "Kanya"
  | "Tula"
  | "Vrishchika"
  | "Dhanu"
  | "Makara"
  | "Kumbha"
  | "Meena";

export type ZodiacEnglishSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type GrahaName =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu";

/**
 * Kept for backward compatibility.
 *
 * Ascendant is a chart point, not a graha.
 */
export type PlanetName = GrahaName | "Ascendant";

export type NakshatraName =
  | "Ashwini"
  | "Bharani"
  | "Krittika"
  | "Rohini"
  | "Mrigashira"
  | "Ardra"
  | "Punarvasu"
  | "Pushya"
  | "Ashlesha"
  | "Magha"
  | "Purva Phalguni"
  | "Uttara Phalguni"
  | "Hasta"
  | "Chitra"
  | "Swati"
  | "Vishakha"
  | "Anuradha"
  | "Jyeshtha"
  | "Mula"
  | "Purva Ashadha"
  | "Uttara Ashadha"
  | "Shravana"
  | "Dhanishtha"
  | "Shatabhisha"
  | "Purva Bhadrapada"
  | "Uttara Bhadrapada"
  | "Revati";

/**
 * Complete planetary position.
 *
 * `longitude` is the primary sidereal longitude.
 *
 * Compatibility aliases:
 * - tropicalLongitude
 * - degree
 * - degreeFormatted
 * - isRetrograde
 * - nakshatraPada
 *
 * These aliases allow Gochar / Rashifal / Sade-Sati
 * modules to consume the same source-of-truth object
 * without duplicating calculations.
 */
export interface PlanetPosition {
  planet: PlanetName;

  /** Primary Lahiri sidereal longitude. */
  longitude: number;

  /** Tropical longitude before ayanamsha subtraction. */
  tropicalLongitude: number;

  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  /** Hindi display name for the current sign. */
  signHindi: string;

  /** Degree inside the current sign, 0–<30. */
  degreeInSign: number;

  /** Backward-compatible alias for degreeInSign. */
  degree: number;

  /** Human-readable DMS representation. */
  degreeFormatted: string;

  /** Primary retrograde flag. */
  retrograde: boolean;

  /** Backward-compatible alias for retrograde. */
  isRetrograde: boolean;

  nakshatra: NakshatraName;
  nakshatraIndex: number;

  /** Nakshatra pada, 1–4. */
  pada: number;

  /** Backward-compatible alias for pada. */
  nakshatraPada: number;
}

export interface AscendantPosition {
  longitude: number;
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;
  degreeInSign: number;
  nakshatra: NakshatraName;
  nakshatraIndex: number;
  pada: number;
}

export interface HouseCusp {
  house: number;
  longitude: number;
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  degreeInSign: number;
}

export interface AstrologyBirthDetails {
  date: Date;
  location?: PanchangLocation;
}

export interface KundliChart {
  date: Date;
  location: PanchangLocation;
  ayanamsha: number;
  planets: Record<PlanetName, PlanetPosition>;
  ascendant: AscendantPosition;
  houses: HouseCusp[];

  moonSign: ZodiacSign;
  moonSignEnglish: ZodiacEnglishSign;

  sunSign: ZodiacSign;
  sunSignEnglish: ZodiacEnglishSign;

  moonNakshatra: NakshatraName;
  moonNakshatraIndex: number;
  moonNakshatraPada: number;
}

export interface MoonSignResult {
  longitude: number;
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  degreeInSign: number;
  nakshatra: NakshatraName;
  nakshatraIndex: number;
  pada: number;
}

export interface PlanetSignResult {
  longitude: number;
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  degreeInSign: number;
  retrograde: boolean;
  nakshatra: NakshatraName;
  nakshatraIndex: number;
  pada: number;
}

export interface AstrologyCalculationMeta {
  engine: "astronomy-engine";
  ayanamsha: "lahiri";
  nodeModel: "mean";
  houseSystem: "whole-sign";
  precisionNote: string;
}

export interface GrahaDrishti {
  from: PlanetName;
  toHouseOffset: number;
  aspectName: string;
}

export type SadeSatiPhase =
  | "none"
  | "rising"
  | "peak"
  | "setting";

export interface SadeSatiResult {
  active: boolean;
  phase: SadeSatiPhase;
  natalMoonSign: ZodiacSign;
  transitSaturnSign: ZodiacSign;
  distanceFromMoon: number;
}

export interface DhaiyaResult {
  active: boolean;
  type: "4th-from-moon" | "8th-from-moon" | "none";
  natalMoonSign: ZodiacSign;
  transitSaturnSign: ZodiacSign;
}

/* =========================================================
   CONSTANTS
========================================================= */

export const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  "Mesha",
  "Vrishabha",
  "Mithuna",
  "Karka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrishchika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
] as const;

export const ZODIAC_SIGNS_ENGLISH: readonly ZodiacEnglishSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const NAKSHATRA_NAMES: readonly NakshatraName[] = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishtha",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

export const PLANETS: readonly GrahaName[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

const PHYSICAL_PLANETS: readonly Exclude<
  GrahaName,
  "Rahu" | "Ketu"
>[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
] as const;

const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;
const SIGN_SPAN = 30;

const MS_PER_DAY = 86_400_000;

/**
 * Mean lunar node orbital period.
 *
 * Mean node is intentionally retained as the default model.
 * It should not be presented as a true-node professional ephemeris.
 */
const RAHU_MEAN_MOTION_DEG_PER_DAY =
  -360 / 6798.383;

const RAHU_REFERENCE_DATE =
  new Date("2000-01-01T12:00:00.000Z");

const RAHU_REFERENCE_LONGITUDE =
  125.04455501;

/* =========================================================
   RASHI METADATA
========================================================= */

export interface RashiProfile {
  sign: ZodiacSign;
  english: ZodiacEnglishSign;
  hindi: string;
  lord: GrahaName;
  element: "Fire" | "Earth" | "Air" | "Water";
  movable: boolean;
}

export const RASHI_PROFILES: readonly RashiProfile[] = [
  {
    sign: "Mesha",
    english: "Aries",
    hindi: "मेष",
    lord: "Mars",
    element: "Fire",
    movable: true,
  },
  {
    sign: "Vrishabha",
    english: "Taurus",
    hindi: "वृषभ",
    lord: "Venus",
    element: "Earth",
    movable: false,
  },
  {
    sign: "Mithuna",
    english: "Gemini",
    hindi: "मिथुन",
    lord: "Mercury",
    element: "Air",
    movable: false,
  },
  {
    sign: "Karka",
    english: "Cancer",
    hindi: "कर्क",
    lord: "Moon",
    element: "Water",
    movable: true,
  },
  {
    sign: "Simha",
    english: "Leo",
    hindi: "सिंह",
    lord: "Sun",
    element: "Fire",
    movable: false,
  },
  {
    sign: "Kanya",
    english: "Virgo",
    hindi: "कन्या",
    lord: "Mercury",
    element: "Earth",
    movable: false,
  },
  {
    sign: "Tula",
    english: "Libra",
    hindi: "तुला",
    lord: "Venus",
    element: "Air",
    movable: true,
  },
  {
    sign: "Vrishchika",
    english: "Scorpio",
    hindi: "वृश्चिक",
    lord: "Mars",
    element: "Water",
    movable: false,
  },
  {
    sign: "Dhanu",
    english: "Sagittarius",
    hindi: "धनु",
    lord: "Jupiter",
    element: "Fire",
    movable: false,
  },
  {
    sign: "Makara",
    english: "Capricorn",
    hindi: "मकर",
    lord: "Saturn",
    element: "Earth",
    movable: true,
  },
  {
    sign: "Kumbha",
    english: "Aquarius",
    hindi: "कुंभ",
    lord: "Saturn",
    element: "Air",
    movable: false,
  },
  {
    sign: "Meena",
    english: "Pisces",
    hindi: "मीन",
    lord: "Jupiter",
    element: "Water",
    movable: true,
  },
] as const;

/* =========================================================
   BASIC HELPERS
========================================================= */

export function normalizeDegrees(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    throw new Error(
      "Invalid longitude value.",
    );
  }

  const result = value % 360;

  return result < 0
    ? result + 360
    : result;
}

/**
 * Signed shortest angular difference.
 *
 * Result is in [-180, +180).
 */
export function angularDifference(
  from: number,
  to: number,
): number {
  let diff = normalizeDegrees(
    from - to,
  );

  if (diff >= 180) {
    diff -= 360;
  }

  return diff;
}

/**
 * Smallest unsigned angular separation.
 *
 * Result is in [0, 180].
 */
export function getAngularSeparation(
  firstLongitude: number,
  secondLongitude: number,
): number {
  return Math.abs(
    angularDifference(
      firstLongitude,
      secondLongitude,
    ),
  );
}

export function degreesToDMS(
  degrees: number,
): {
  degrees: number;
  minutes: number;
  seconds: number;
} {
  const normalized = Math.abs(
    degrees,
  );

  let wholeDegrees =
    Math.floor(normalized);

  const remainderMinutes =
    (normalized - wholeDegrees) * 60;

  let minutes =
    Math.floor(remainderMinutes);

  let seconds =
    Math.round(
      (remainderMinutes - minutes) * 60,
    );

  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }

  if (minutes === 60) {
    minutes = 0;
    wholeDegrees += 1;
  }

  return {
    degrees: wholeDegrees,
    minutes,
    seconds,
  };
}

export function formatDegree(
  degrees: number,
): string {
  const dms =
    degreesToDMS(degrees);

  return `${dms.degrees}° ${dms.minutes
    .toString()
    .padStart(2, "0")}' ${dms.seconds
    .toString()
    .padStart(2, "0")}"`;
}

export function signIndexFromLongitude(
  longitude: number,
): number {
  return Math.floor(
    normalizeDegrees(longitude) /
      SIGN_SPAN,
  );
}

export function getZodiacSignFromLongitude(
  longitude: number,
): ZodiacSign {
  return ZODIAC_SIGNS[
    signIndexFromLongitude(
      longitude,
    )
  ];
}

export function getEnglishZodiacSignFromLongitude(
  longitude: number,
): ZodiacEnglishSign {
  return ZODIAC_SIGNS_ENGLISH[
    signIndexFromLongitude(
      longitude,
    )
  ];
}

export function getDegreeInSign(
  longitude: number,
): number {
  return (
    normalizeDegrees(longitude) %
    SIGN_SPAN
  );
}

/* =========================================================
   BACKWARD-COMPATIBILITY ALIASES
========================================================= */

/**
 * Compatibility alias used by older Gochar implementations.
 */
export function getSignIndex(
  longitude: number,
): number {
  return signIndexFromLongitude(
    longitude,
  );
}

/**
 * Compatibility alias used by older Gochar implementations.
 */
export function getZodiacSign(
  longitude: number,
): ZodiacSign {
  return getZodiacSignFromLongitude(
    longitude,
  );
}

/**
 * Compatibility alias for English sign lookup.
 */
export function getEnglishZodiacSign(
  longitude: number,
): ZodiacEnglishSign {
  return getEnglishZodiacSignFromLongitude(
    longitude,
  );
}

/* =========================================================
   NAKSHATRA
========================================================= */

export function getNakshatraIndex(
  longitude: number,
): number {
  return Math.floor(
    normalizeDegrees(longitude) /
      NAKSHATRA_SPAN,
  );
}

export function getNakshatraName(
  longitude: number,
): NakshatraName {
  return NAKSHATRA_NAMES[
    getNakshatraIndex(longitude)
  ];
}

export function getNakshatraPada(
  longitude: number,
): number {
  const normalized =
    normalizeDegrees(longitude);

  const nakshatraIndex =
    getNakshatraIndex(
      normalized,
    );

  const offset =
    normalized -
    nakshatraIndex *
      NAKSHATRA_SPAN;

  return Math.min(
    4,
    Math.floor(
      offset / PADA_SPAN,
    ) + 1,
  );
}

export function getNakshatraDetails(
  longitude: number,
): {
  name: NakshatraName;
  index: number;
  pada: number;
} {
  const normalized =
    normalizeDegrees(longitude);

  const index =
    getNakshatraIndex(
      normalized,
    );

  return {
    name:
      NAKSHATRA_NAMES[index],
    index,
    pada:
      getNakshatraPada(
        normalized,
      ),
  };
}

/* =========================================================
   DATE / VALIDATION
========================================================= */

function ensureDate(
  value: Date | string | number,
): Date {
  const date =
    value instanceof Date
      ? new Date(
          value.getTime(),
        )
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      "Invalid astrology date.",
    );
  }

  return date;
}

function validateLatitude(
  latitude: number,
): void {
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(
      `Invalid latitude: ${latitude}.`,
    );
  }
}

function validateLongitude(
  longitude: number,
): void {
  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      `Invalid longitude: ${longitude}.`,
    );
  }
}

function validateLocation(
  location: PanchangLocation,
): void {
  validateLatitude(
    location.latitude,
  );

  validateLongitude(
    location.longitude,
  );
}

function validateGraha(
  planet: PlanetName,
): asserts planet is GrahaName {
  if (planet === "Ascendant") {
    throw new Error(
      "Ascendant is a chart point, not a graha.",
    );
  }
}

/* =========================================================
   ASTRONOMY ENGINE HELPERS
========================================================= */

function getPlanetTropicalLongitude(
  planet: Exclude<
    GrahaName,
    "Rahu" | "Ketu"
  >,
  date: Date,
): number {
  switch (planet) {
    case "Sun":
      return normalizeDegrees(
        Astronomy.SunPosition(
          date,
        ).elon,
      );

    case "Moon":
      return normalizeDegrees(
        Astronomy.EclipticGeoMoon(
          date,
        ).lon,
      );

    case "Mercury":
      return normalizeDegrees(
        Astronomy.EclipticLongitude(
          Astronomy.Body.Mercury,
          date,
        ),
      );

    case "Venus":
      return normalizeDegrees(
        Astronomy.EclipticLongitude(
          Astronomy.Body.Venus,
          date,
        ),
      );

    case "Mars":
      return normalizeDegrees(
        Astronomy.EclipticLongitude(
          Astronomy.Body.Mars,
          date,
        ),
      );

    case "Jupiter":
      return normalizeDegrees(
        Astronomy.EclipticLongitude(
          Astronomy.Body.Jupiter,
          date,
        ),
      );

    case "Saturn":
      return normalizeDegrees(
        Astronomy.EclipticLongitude(
          Astronomy.Body.Saturn,
          date,
        ),
      );

    default:
      throw new Error(
        `Unsupported astronomical body: ${planet}`,
      );
  }
}

/* =========================================================
   AYANAMSHA
========================================================= */

export function getAyanamsha(
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  return getLahiriAyanamsha(
    date,
  );
}

export function getSiderealLongitude(
  tropicalLongitude: number,
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  const ayanamsha =
    getAyanamsha(date);

  return normalizeDegrees(
    tropicalLongitude -
      ayanamsha,
  );
}

/* =========================================================
   RAHU / KETU
========================================================= */

/**
 * Mean Rahu longitude.
 *
 * This intentionally remains the mean-node model.
 */
export function getMeanRahuLongitude(
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  const daysSinceReference =
    (date.getTime() -
      RAHU_REFERENCE_DATE.getTime()) /
    MS_PER_DAY;

  const tropicalLongitude =
    RAHU_REFERENCE_LONGITUDE +
    RAHU_MEAN_MOTION_DEG_PER_DAY *
      daysSinceReference;

  return normalizeDegrees(
    tropicalLongitude,
  );
}

export function getMeanKetuLongitude(
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  return normalizeDegrees(
    getMeanRahuLongitude(date) +
      180,
  );
}

export function getSiderealMeanRahuLongitude(
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  return getSiderealLongitude(
    getMeanRahuLongitude(date),
    date,
  );
}

export function getSiderealMeanKetuLongitude(
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  return getSiderealLongitude(
    getMeanKetuLongitude(date),
    date,
  );
}

/* =========================================================
   RETROGRADE
========================================================= */

function isRetrogradePlanet(
  planet: Exclude<
    GrahaName,
    "Sun" | "Moon" | "Rahu" | "Ketu"
  >,
  dateInput: Date | string | number,
): boolean {
  const date =
    ensureDate(dateInput);

  const halfWindow =
    6 * 60 * 60 * 1000;

  const before =
    new Date(
      date.getTime() -
        halfWindow,
    );

  const after =
    new Date(
      date.getTime() +
        halfWindow,
    );

  const previous =
    getPlanetTropicalLongitude(
      planet,
      before,
    );

  const next =
    getPlanetTropicalLongitude(
      planet,
      after,
    );

  return (
    angularDifference(
      next,
      previous,
    ) < 0
  );
}

/* =========================================================
   PLANET POSITION
========================================================= */

export function getPlanetPosition(
  planet: PlanetName,
  dateInput: Date | string | number,
): PlanetPosition {
  const date =
    ensureDate(dateInput);

  validateGraha(planet);

  let tropicalLongitude: number;
  let retrograde = false;

  switch (planet) {
    case "Sun":
      tropicalLongitude =
        getPlanetTropicalLongitude(
          "Sun",
          date,
        );
      break;

    case "Moon":
      tropicalLongitude =
        getPlanetTropicalLongitude(
          "Moon",
          date,
        );
      break;

    case "Mars":
      tropicalLongitude =
        getPlanetTropicalLongitude(
          "Mars",
          date,
        );

      retrograde =
        isRetrogradePlanet(
          "Mars",
          date,
        );
      break;

    case "Mercury":
      tropicalLongitude =
        getPlanetTropicalLongitude(
          "Mercury",
          date,
        );

      retrograde =
        isRetrogradePlanet(
          "Mercury",
          date,
        );
      break;

    case "Jupiter":
      tropicalLongitude =
        getPlanetTropicalLongitude(
          "Jupiter",
          date,
        );

      retrograde =
        isRetrogradePlanet(
          "Jupiter",
          date,
        );
      break;

    case "Venus":
      tropicalLongitude =
        getPlanetTropicalLongitude(
          "Venus",
          date,
        );

      retrograde =
        isRetrogradePlanet(
          "Venus",
          date,
        );
      break;

    case "Saturn":
      tropicalLongitude =
        getPlanetTropicalLongitude(
          "Saturn",
          date,
        );

      retrograde =
        isRetrogradePlanet(
          "Saturn",
          date,
        );
      break;

    case "Rahu":
      tropicalLongitude =
        getMeanRahuLongitude(
          date,
        );

      retrograde = true;
      break;

    case "Ketu":
      tropicalLongitude =
        getMeanKetuLongitude(
          date,
        );

      retrograde = true;
      break;

    default:
      throw new Error(
        `Unsupported planet: ${planet}`,
      );
  }

  const siderealLongitude =
    getSiderealLongitude(
      tropicalLongitude,
      date,
    );

  const sign =
    getZodiacSignFromLongitude(
      siderealLongitude,
    );

  const signEnglish =
    getEnglishZodiacSignFromLongitude(
      siderealLongitude,
    );

  const degreeInSign =
    getDegreeInSign(
      siderealLongitude,
    );

  const nakshatra =
    getNakshatraDetails(
      siderealLongitude,
    );

  return {
    planet,

    longitude:
      siderealLongitude,

    tropicalLongitude,

    sign,

    signEnglish,

    signHindi:
      getRashiNameHindi(sign),

    degreeInSign,

    // Compatibility alias.
    degree:
      degreeInSign,

    degreeFormatted:
      formatDegree(
        degreeInSign,
      ),

    retrograde,

    // Compatibility alias.
    isRetrograde:
      retrograde,

    nakshatra:
      nakshatra.name,

    nakshatraIndex:
      nakshatra.index,

    pada:
      nakshatra.pada,

    // Compatibility alias.
    nakshatraPada:
      nakshatra.pada,
  };
}

/* =========================================================
   ASCENDANT / LAGNA
========================================================= */

/**
 * Local sidereal time in hours.
 */
export function getLocalSiderealTimeHours(
  dateInput: Date | string | number,
  longitude: number,
): number {
  const date =
    ensureDate(dateInput);

  validateLongitude(
    longitude,
  );

  const gmst =
    Astronomy.SiderealTime(
      date,
    );

  const localSiderealTime =
    gmst +
    longitude / 15;

  return (
    ((localSiderealTime % 24) +
      24) %
    24
  );
}

/**
 * Date-specific true obliquity of the ecliptic.
 */
export function getEclipticObliquity(
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  return Astronomy.e_tilt(
    new Astronomy.AstroTime(
      date,
    ),
  ).tobl;
}

/**
 * Calculates tropical Ascendant using
 * the Meeus-style formula.
 */
export function getTropicalAscendantLongitude(
  dateInput: Date | string | number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): number {
  const date =
    ensureDate(dateInput);

  validateLocation(
    location,
  );

  const latitudeRad =
    (location.latitude *
      Math.PI) /
    180;

  const lstHours =
    getLocalSiderealTimeHours(
      date,
      location.longitude,
    );

  const localSiderealDegrees =
    lstHours * 15;

  const localSiderealRadians =
    (localSiderealDegrees *
      Math.PI) /
    180;

  const obliquityDegrees =
    getEclipticObliquity(
      date,
    );

  const obliquityRadians =
    (obliquityDegrees *
      Math.PI) /
    180;

  const x =
    Math.sin(
      localSiderealRadians,
    ) *
      Math.cos(
        obliquityRadians,
      ) +
    Math.tan(latitudeRad) *
      Math.sin(
        obliquityRadians,
      );

  const y =
    -Math.cos(
      localSiderealRadians,
    );

  // eslint-disable-next-line prefer-const
  let ascendantRadians =
    Math.atan2(y, x);

  let ascendantDegrees =
    (ascendantRadians *
      180) /
    Math.PI;

  if (x < 0) {
    ascendantDegrees +=
      180;
  } else {
    ascendantDegrees +=
      360;
  }

  if (
    ascendantDegrees < 180
  ) {
    ascendantDegrees +=
      180;
  } else {
    ascendantDegrees -=
      180;
  }

  return normalizeDegrees(
    ascendantDegrees,
  );
}

/**
 * Sidereal Lahiri Ascendant / Lagna.
 */
export function getAscendantLongitude(
  dateInput: Date | string | number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): number {
  const date =
    ensureDate(dateInput);

  const tropicalAscendant =
    getTropicalAscendantLongitude(
      date,
      location,
    );

  return getSiderealLongitude(
    tropicalAscendant,
    date,
  );
}

export function getAscendantPosition(
  dateInput: Date | string | number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): AscendantPosition {
  const date =
    ensureDate(dateInput);

  const longitude =
    getAscendantLongitude(
      date,
      location,
    );

  const nakshatra =
    getNakshatraDetails(
      longitude,
    );

  return {
    longitude,

    sign:
      getZodiacSignFromLongitude(
        longitude,
      ),

    signEnglish:
      getEnglishZodiacSignFromLongitude(
        longitude,
      ),

    signHindi:
      getRashiNameHindi(
        getZodiacSignFromLongitude(longitude),
      ),

    degreeInSign:
      getDegreeInSign(
        longitude,
      ),

    nakshatra:
      nakshatra.name,

    nakshatraIndex:
      nakshatra.index,

    pada:
      nakshatra.pada,
  };
}

/* =========================================================
   HOUSES
========================================================= */

/**
 * Whole-sign house system.
 *
 * House 1 = Ascendant sign.
 */
export function getWholeSignHouses(
  ascendantLongitude: number,
): HouseCusp[] {
  const ascendantSignIndex =
    signIndexFromLongitude(
      ascendantLongitude,
    );

  return Array.from(
    { length: 12 },
    (_, index) => {
      const signIndex =
        (ascendantSignIndex +
          index) %
        12;

      const longitude =
        signIndex * SIGN_SPAN;

      return {
        house: index + 1,

        longitude,

        sign:
          ZODIAC_SIGNS[
            signIndex
          ],

        signEnglish:
          ZODIAC_SIGNS_ENGLISH[
            signIndex
          ],

        degreeInSign: 0,
      };
    },
  );
}

export function getHouseForLongitude(
  longitude: number,
  ascendantLongitude: number,
): number {
  const ascendantSignIndex =
    signIndexFromLongitude(
      ascendantLongitude,
    );

  const planetSignIndex =
    signIndexFromLongitude(
      longitude,
    );

  return (
    ((planetSignIndex -
      ascendantSignIndex +
      12) %
      12) +
    1
  );
}

/* =========================================================
   MOON / SUN
========================================================= */

export function getMoonSign(
  dateInput: Date | string | number,
): MoonSignResult {
  const date =
    ensureDate(dateInput);

  const longitude =
    getSiderealMoonLongitude(
      date,
    );

  const nakshatra =
    getNakshatraDetails(
      longitude,
    );

  return {
    longitude,

    sign:
      getZodiacSignFromLongitude(
        longitude,
      ),

    signEnglish:
      getEnglishZodiacSignFromLongitude(
        longitude,
      ),

    degreeInSign:
      getDegreeInSign(
        longitude,
      ),

    nakshatra:
      nakshatra.name,

    nakshatraIndex:
      nakshatra.index,

    pada:
      nakshatra.pada,
  };
}

export function getSunSign(
  dateInput: Date | string | number,
): PlanetSignResult {
  return getPlanetPosition(
    "Sun",
    dateInput,
  );
}

/* =========================================================
   ALL PLANETS
========================================================= */

export function getAllPlanetPositions(
  dateInput: Date | string | number,
): Record<
  PlanetName,
  PlanetPosition
> {
  const date =
    ensureDate(dateInput);

  const result =
    {} as Record<
      PlanetName,
      PlanetPosition
    >;

  for (const planet of PLANETS) {
    result[planet] =
      getPlanetPosition(
        planet,
        date,
      );
  }

  return result;
}

/* =========================================================
   KUNDLI
========================================================= */

export function calculateKundli(
  details: AstrologyBirthDetails,
): KundliChart {
  const date =
    ensureDate(details.date);

  const location =
    details.location ??
    DEFAULT_LOCATION;

  validateLocation(
    location,
  );

  const planets =
    getAllPlanetPositions(
      date,
    );

  const ascendant =
    getAscendantPosition(
      date,
      location,
    );

  const houses =
    getWholeSignHouses(
      ascendant.longitude,
    );

  const moon =
    planets.Moon;

  const sun =
    planets.Sun;

  return {
    date,

    location,

    ayanamsha:
      getAyanamsha(date),

    planets,

    ascendant,

    houses,

    moonSign:
      moon.sign,

    moonSignEnglish:
      moon.signEnglish,

    sunSign:
      sun.sign,

    sunSignEnglish:
      sun.signEnglish,

    moonNakshatra:
      moon.nakshatra,

    moonNakshatraIndex:
      moon.nakshatraIndex,

    moonNakshatraPada:
      moon.pada,
  };
}

/* =========================================================
   CALCULATION META
========================================================= */

export function getAstrologyCalculationMeta(): AstrologyCalculationMeta {
  return {
    engine:
      "astronomy-engine",

    ayanamsha:
      "lahiri",

    nodeModel:
      "mean",

    houseSystem:
      "whole-sign",

    precisionNote:
      "Planetary positions use Astronomy Engine. Rahu/Ketu use mean-node approximation. Astrological interpretation requires a validated Vedic ruleset.",
  };
}

/* =========================================================
   PLANET / SIGN UTILITIES
========================================================= */

export function getPlanetInSign(
  planet: PlanetName,
  dateInput: Date | string | number,
): ZodiacSign {
  return getPlanetPosition(
    planet,
    dateInput,
  ).sign;
}

export function getPlanetDegree(
  planet: PlanetName,
  dateInput: Date | string | number,
): number {
  return getPlanetPosition(
    planet,
    dateInput,
  ).degreeInSign;
}

export function getPlanetNakshatra(
  planet: PlanetName,
  dateInput: Date | string | number,
): NakshatraName {
  return getPlanetPosition(
    planet,
    dateInput,
  ).nakshatra;
}

export function getPlanetHouse(
  planet: PlanetName,
  dateInput: Date | string | number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): number {
  const date =
    ensureDate(dateInput);

  const planetPosition =
    getPlanetPosition(
      planet,
      date,
    );

  const ascendant =
    getAscendantPosition(
      date,
      location,
    );

  return getHouseForLongitude(
    planetPosition.longitude,
    ascendant.longitude,
  );
}

/* =========================================================
   RASHI HELPERS
========================================================= */

function getRashiProfile(
  sign: ZodiacSign,
): RashiProfile {
  const profile =
    RASHI_PROFILES.find(
      (item) =>
        item.sign === sign,
    );

  if (!profile) {
    throw new Error(
      `Unknown zodiac sign: ${sign}`,
    );
  }

  return profile;
}

export function getRashiNameHindi(
  sign: ZodiacSign,
): string {
  return getRashiProfile(
    sign,
  ).hindi;
}

export function getRashiNameEnglish(
  sign: ZodiacSign,
): ZodiacEnglishSign {
  return getRashiProfile(
    sign,
  ).english;
}

export function getRashiLord(
  sign: ZodiacSign,
): GrahaName {
  return getRashiProfile(
    sign,
  ).lord;
}

export function getRashiElement(
  sign: ZodiacSign,
): RashiProfile["element"] {
  return getRashiProfile(
    sign,
  ).element;
}

export function isMovableRashi(
  sign: ZodiacSign,
): boolean {
  return getRashiProfile(
    sign,
  ).movable;
}

/* =========================================================
   NAKSHATRA LORD
========================================================= */

export const NAKSHATRA_LORDS: readonly GrahaName[] =
  [
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
  ] as const;

export function getNakshatraLord(
  nakshatraIndex: number,
): GrahaName {
  if (
    !Number.isInteger(
      nakshatraIndex,
    ) ||
    nakshatraIndex < 0 ||
    nakshatraIndex >= 27
  ) {
    throw new Error(
      `Invalid Nakshatra index: ${nakshatraIndex}`,
    );
  }

  return NAKSHATRA_LORDS[
    nakshatraIndex % 9
  ];
}

export function getNakshatraLordByLongitude(
  longitude: number,
): GrahaName {
  return getNakshatraLord(
    getNakshatraIndex(
      longitude,
    ),
  );
}

/* =========================================================
   VIMSHOTTARI DASHA
========================================================= */

export interface VimshottariDashaPeriod {
  lord: GrahaName;
  years: number;
  start: Date;
  end: Date;
}

export const VIMSHOTTARI_YEARS: Record<
  GrahaName,
  number
> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const VIMSHOTTARI_ORDER: readonly GrahaName[] =
  [
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
  ] as const;

export function calculateVimshottariMahadasha(
  birthDateInput:
    | Date
    | string
    | number,
): VimshottariDashaPeriod[] {
  const birthDate =
    ensureDate(
      birthDateInput,
    );

  const moon =
    getMoonSign(
      birthDate,
    );

  const nakshatraIndex =
    moon.nakshatraIndex;

  const startingLord =
    getNakshatraLord(
      nakshatraIndex,
    );

  const startingIndex =
    VIMSHOTTARI_ORDER.indexOf(
      startingLord,
    );

  const nakshatraStart =
    nakshatraIndex *
    NAKSHATRA_SPAN;

  const elapsed =
    normalizeDegrees(
      moon.longitude -
        nakshatraStart,
    );

  const elapsedFraction =
    elapsed /
    NAKSHATRA_SPAN;

  const startingYears =
    VIMSHOTTARI_YEARS[
      startingLord
    ];

  const remainingYears =
    startingYears *
    Math.max(
      0,
      Math.min(
        1,
        1 -
          elapsedFraction,
      ),
    );

  const periods: VimshottariDashaPeriod[] =
    [];

  let cursor =
    new Date(
      birthDate.getTime(),
    );

  for (
    let i = 0;
    i <
    VIMSHOTTARI_ORDER.length;
    i++
  ) {
    const lord =
      VIMSHOTTARI_ORDER[
        (startingIndex + i) %
          VIMSHOTTARI_ORDER.length
      ];

    const years =
      i === 0
        ? remainingYears
        : VIMSHOTTARI_YEARS[
            lord
          ];

    const end =
      new Date(
        cursor.getTime() +
          years *
            365.2425 *
            MS_PER_DAY,
      );

    periods.push({
      lord,

      years,

      start:
        new Date(
          cursor.getTime(),
        ),

      end,
    });

    cursor = end;
  }

  return periods;
}

/* =========================================================
   PLANETARY DISTANCE / CONJUNCTION
========================================================= */

export function getPlanetaryLongitudeDistance(
  firstPlanet: PlanetName,
  secondPlanet: PlanetName,
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  const first =
    getPlanetPosition(
      firstPlanet,
      date,
    );

  const second =
    getPlanetPosition(
      secondPlanet,
      date,
    );

  return normalizeDegrees(
    first.longitude -
      second.longitude,
  );
}

export function getPlanetaryAngularSeparation(
  firstPlanet: PlanetName,
  secondPlanet: PlanetName,
  dateInput: Date | string | number,
): number {
  const date =
    ensureDate(dateInput);

  const first =
    getPlanetPosition(
      firstPlanet,
      date,
    );

  const second =
    getPlanetPosition(
      secondPlanet,
      date,
    );

  return getAngularSeparation(
    first.longitude,
    second.longitude,
  );
}

export function arePlanetsConjunct(
  firstPlanet: PlanetName,
  secondPlanet: PlanetName,
  dateInput: Date | string | number,
  orb = 8,
): boolean {
  if (
    !Number.isFinite(orb) ||
    orb < 0 ||
    orb > 180
  ) {
    throw new Error(
      `Invalid conjunction orb: ${orb}`,
    );
  }

  return (
    getPlanetaryAngularSeparation(
      firstPlanet,
      secondPlanet,
      dateInput,
    ) <= orb
  );
}

export function arePlanetsOpposite(
  firstPlanet: PlanetName,
  secondPlanet: PlanetName,
  dateInput: Date | string | number,
  orb = 8,
): boolean {
  if (
    !Number.isFinite(orb) ||
    orb < 0 ||
    orb > 180
  ) {
    throw new Error(
      `Invalid opposition orb: ${orb}`,
    );
  }

  const distance =
    getPlanetaryAngularSeparation(
      firstPlanet,
      secondPlanet,
      dateInput,
    );

  return (
    Math.abs(
      distance - 180,
    ) <= orb
  );
}

/* =========================================================
   GRAHA DRISHTI
========================================================= */

export function getGrahaDrishtiOffsets(
  planet: GrahaName,
): readonly number[] {
  switch (planet) {
    case "Mars":
      return [4, 7, 8];

    case "Jupiter":
      return [5, 7, 9];

    case "Saturn":
      return [3, 7, 10];

    case "Sun":
    case "Moon":
    case "Mercury":
    case "Venus":
    case "Rahu":
    case "Ketu":
      return [7];

    default:
      return [7];
  }
}

export function getGrahaDrishti(
  fromPlanet: GrahaName,
  fromHouse: number,
): GrahaDrishti[] {
  if (
    !Number.isInteger(
      fromHouse,
    ) ||
    fromHouse < 1 ||
    fromHouse > 12
  ) {
    throw new Error(
      `Invalid house: ${fromHouse}`,
    );
  }

  return getGrahaDrishtiOffsets(
    fromPlanet,
  ).map(
    (offset) => ({
      from: fromPlanet,

      toHouseOffset:
        offset,

      aspectName:
        `${offset}th-house-aspect`,
    }),
  );
}

export function doesPlanetAspectHouse(
  planet: GrahaName,
  planetHouse: number,
  targetHouse: number,
): boolean {
  if (
    planetHouse < 1 ||
    planetHouse > 12 ||
    targetHouse < 1 ||
    targetHouse > 12
  ) {
    return false;
  }

  const offsets =
    getGrahaDrishtiOffsets(
      planet,
    );

  return offsets.some(
    (offset) =>
      ((planetHouse - 1 +
        offset -
        1) %
        12) +
        1 ===
      targetHouse,
  );
}

/* =========================================================
   SADE SATI / DHAIYA
========================================================= */

export function getSignDistance(
  fromSign: ZodiacSign,
  toSign: ZodiacSign,
): number {
  const from =
    ZODIAC_SIGNS.indexOf(
      fromSign,
    );

  const to =
    ZODIAC_SIGNS.indexOf(
      toSign,
    );

  if (
    from < 0 ||
    to < 0
  ) {
    throw new Error(
      "Invalid zodiac sign.",
    );
  }

  return (
    ((to -
      from +
      12) %
      12) +
    1
  );
}

/**
 * Sade Sati:
 *
 * Saturn in:
 * 12th from natal Moon = rising
 * 1st from natal Moon  = peak
 * 2nd from natal Moon  = setting
 */
export function calculateSadeSati(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): SadeSatiResult {
  const distance =
    getSignDistance(
      natalMoonSign,
      transitSaturnSign,
    );

  let phase: SadeSatiPhase =
    "none";

  if (
    distance === 12
  ) {
    phase = "rising";
  } else if (
    distance === 1
  ) {
    phase = "peak";
  } else if (
    distance === 2
  ) {
    phase = "setting";
  }

  return {
    active:
      phase !== "none",

    phase,

    natalMoonSign,

    transitSaturnSign,

    distanceFromMoon:
      distance,
  };
}

/**
 * Saturn in 4th or 8th from natal Moon.
 */
export function calculateDhaiya(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): DhaiyaResult {
  const distance =
    getSignDistance(
      natalMoonSign,
      transitSaturnSign,
    );

  let type:
    | DhaiyaResult["type"] =
    "none";

  if (
    distance === 4
  ) {
    type =
      "4th-from-moon";
  } else if (
    distance === 8
  ) {
    type =
      "8th-from-moon";
  }

  return {
    active:
      type !== "none",

    type,

    natalMoonSign,

    transitSaturnSign,
  };
}

export function calculateCurrentSadeSati(
  birthDateInput:
    | Date
    | string
    | number,
  transitDateInput:
    | Date
    | string
    | number,
): SadeSatiResult {
  const birthDate =
    ensureDate(
      birthDateInput,
    );

  const transitDate =
    ensureDate(
      transitDateInput,
    );

  const natalMoon =
    getMoonSign(
      birthDate,
    );

  const transitSaturn =
    getPlanetPosition(
      "Saturn",
      transitDate,
    );

  return calculateSadeSati(
    natalMoon.sign,
    transitSaturn.sign,
  );
}

export function calculateCurrentDhaiya(
  birthDateInput:
    | Date
    | string
    | number,
  transitDateInput:
    | Date
    | string
    | number,
): DhaiyaResult {
  const birthDate =
    ensureDate(
      birthDateInput,
    );

  const transitDate =
    ensureDate(
      transitDateInput,
    );

  const natalMoon =
    getMoonSign(
      birthDate,
    );

  const transitSaturn =
    getPlanetPosition(
      "Saturn",
      transitDate,
    );

  return calculateDhaiya(
    natalMoon.sign,
    transitSaturn.sign,
  );
}

/* =========================================================
   LOCATION HELPERS
========================================================= */

export function getAstrologyLocations(): PanchangLocation[] {
  return Object.values(
    INDIA_LOCATIONS,
  );
}

export function getAstrologyLocationById(
  id: string,
): PanchangLocation | undefined {
  if (!id?.trim()) {
    return undefined;
  }

  return getAstrologyLocations().find(
    (location) =>
      location.id === id,
  );
}

/* =========================================================
   KUNDLI SUMMARY
========================================================= */

export interface KundliSummary {
  lagna: ZodiacSign;
  lagnaEnglish: ZodiacEnglishSign;

  moonSign: ZodiacSign;
  moonSignEnglish: ZodiacEnglishSign;

  sunSign: ZodiacSign;
  sunSignEnglish: ZodiacEnglishSign;

  moonNakshatra: NakshatraName;
  moonNakshatraPada: number;

  lagnaLord: GrahaName;
  moonSignLord: GrahaName;

  ayanamsha: number;
}

export function getKundliSummary(
  birthDateInput:
    | Date
    | string
    | number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): KundliSummary {
  const date =
    ensureDate(
      birthDateInput,
    );

  const chart =
    calculateKundli({
      date,
      location,
    });

  return {
    lagna:
      chart.ascendant.sign,

    lagnaEnglish:
      chart.ascendant.signEnglish,

    moonSign:
      chart.moonSign,

    moonSignEnglish:
      chart.moonSignEnglish,

    sunSign:
      chart.sunSign,

    sunSignEnglish:
      chart.sunSignEnglish,

    moonNakshatra:
      chart.moonNakshatra,

    moonNakshatraPada:
      chart.moonNakshatraPada,

    lagnaLord:
      getRashiLord(
        chart.ascendant.sign,
      ),

    moonSignLord:
      getRashiLord(
        chart.moonSign,
      ),

    ayanamsha:
      chart.ayanamsha,
  };
}

/* =========================================================
   PAN-INDIA TRUST + PERSONALIZATION
========================================================= */

/**
 * Transparency metadata exposed to the UI.
 *
 * DharmYatra deliberately separates astronomical calculation from
 * interpretation. This makes it easier for users to understand what was
 * calculated, which location was used, and which traditional conventions
 * were selected.
 */
export interface AstrologyTrustMetadata {
  engine: "astronomy-engine";
  ayanamsha: "lahiri";
  nodeModel: "mean";
  houseSystem: "whole-sign";
  locationUsed: PanchangLocation;
  locationLabel: string;
  calculationBasis: string;
  precision: "astronomical-calculation";
  confidence: "high" | "medium" | "limited";
  trustNote: string;
  interpretationNote: string;
}

export type AstrologyRelevance =
  | "birth-chart"
  | "selected-city"
  | "selected-state"
  | "india";

export interface PersonalizedAstrologySummary extends KundliSummary {
  relevance: AstrologyRelevance;
  relevanceLabel: string;
  relevanceLabelHindi: string;
  location: PanchangLocation;
  trust: AstrologyTrustMetadata;
}

export const ASTROLOGY_TRUST_NOTE =
  "DharmYatra uses astronomical calculations with Lahiri sidereal ayanamsha, mean lunar nodes, and whole-sign houses. The result is location- and time-dependent. Traditional astrology interpretations can vary by parampara, astrologer, and chosen rules, so calculation data is kept separate from interpretation.";

export const ASTROLOGY_INTERPRETATION_NOTE =
  "Rashi, Nakshatra, Graha, Dasha, Gochar and other chart factors are traditional Vedic astrology frameworks. They should be used for cultural, spiritual and self-reflection purposes rather than as guaranteed predictions or substitutes for professional medical, legal, financial, or other expert advice.";

function getSafeLocationLabel(
  location: PanchangLocation,
): string {
  const parts = [
    location.city,
    location.state,
    location.country,
  ].filter(
    (value): value is string =>
      typeof value === "string" &&
      value.trim().length > 0,
  );

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return "Selected location in India";
}

/**
 * Return transparent calculation metadata for UI trust panels.
 */
export function getAstrologyTrustMetadata(
  location: PanchangLocation = DEFAULT_LOCATION,
): AstrologyTrustMetadata {
  validateLocation(location);

  return {
    engine: "astronomy-engine",
    ayanamsha: "lahiri",
    nodeModel: "mean",
    houseSystem: "whole-sign",
    locationUsed: location,
    locationLabel:
      getSafeLocationLabel(location),
    calculationBasis:
      "Sidereal planetary longitudes + local ascendant + whole-sign houses",
    precision: "astronomical-calculation",
    confidence: "high",
    trustNote:
      ASTROLOGY_TRUST_NOTE,
    interpretationNote:
      ASTROLOGY_INTERPRETATION_NOTE,
  };
}

/**
 * Build a user-facing explanation of why the result belongs to the user.
 *
 * This does not infer identity or personal attributes. It only describes the
 * birth details and location supplied to the calculator.
 */
export function getAstrologyPersonalizationMessage(
  location: PanchangLocation = DEFAULT_LOCATION,
): string {
  validateLocation(location);

  const locationLabel =
    getSafeLocationLabel(location);

  return `Your Kundli is calculated for the birth date/time you provided and the selected location: ${locationLabel}. Changing the birth time or location can change the Ascendant, houses and some chart details.`;
}

/**
 * Create a complete personalized summary suitable for a profile/dashboard.
 */
export function getPersonalizedKundliSummary(
  birthDateInput:
    | Date
    | string
    | number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): PersonalizedAstrologySummary {
  const summary =
    getKundliSummary(
      birthDateInput,
      location,
    );

  const trust =
    getAstrologyTrustMetadata(
      location,
    );

  return {
    ...summary,
    relevance: "birth-chart",
    relevanceLabel: "Your birth chart",
    relevanceLabelHindi: "आपकी जन्म कुंडली",
    location,
    trust,
  };
}

/**
 * Return all supported India locations from the Panchang source of truth.
 * Keeping one location registry prevents astrology and Panchang from
 * silently using different city lists.
 */
export function getPanIndiaAstrologyLocations(): PanchangLocation[] {
  return getAstrologyLocations();
}

/**
 * Find an astrology location by a user-friendly city/state/id search term.
 */
export function findAstrologyLocation(
  query: string,
): PanchangLocation | undefined {
  const normalized =
    query
      .trim()
      .toLowerCase();

  if (!normalized) {
    return undefined;
  }

  return getAstrologyLocations().find(
    (location) => {
      const haystack = [
        location.id,
        location.city,
        location.state,
        location.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(
        normalized,
      );
    },
  );
}

/**
 * Validate a user-selected Indian astrology location without requiring the
 * UI to know the internal location registry structure.
 */
export function isSupportedAstrologyLocation(
  location: PanchangLocation,
): boolean {
  if (!location) {
    return false;
  }

  if (location.id) {
    return Boolean(
      getAstrologyLocationById(
        location.id,
      ),
    );
  }

  return Number.isFinite(
    location.latitude,
  ) && Number.isFinite(
    location.longitude,
  );
}

/**
 * UI-friendly labels for the twelve Rashis.
 */
export function getRashiDisplay(
  sign: ZodiacSign,
): {
  sanskrit: ZodiacSign;
  english: ZodiacEnglishSign;
  hindi: string;
  lord: GrahaName;
  element: RashiProfile["element"];
} {
  const profile =
    getRashiProfile(sign);

  return {
    sanskrit: profile.sign,
    english: profile.english,
    hindi: profile.hindi,
    lord: profile.lord,
    element: profile.element,
  };
}

/**
 * UI-friendly Nakshatra information.
 */
export function getNakshatraDisplay(
  longitude: number,
): {
  name: NakshatraName;
  index: number;
  pada: number;
  lord: GrahaName;
} {
  const details =
    getNakshatraDetails(
      longitude,
    );

  return {
    ...details,
    lord: getNakshatraLord(
      details.index,
    ),
  };
}

/**
 * Produce a compact, transparent chart identity for a user's dashboard.
 */
export interface AstrologyIdentityCard {
  lagna: ZodiacSign;
  lagnaEnglish: ZodiacEnglishSign;
  lagnaHindi: string;
  moonSign: ZodiacSign;
  moonSignEnglish: ZodiacEnglishSign;
  moonSignHindi: string;
  sunSign: ZodiacSign;
  sunSignEnglish: ZodiacEnglishSign;
  sunSignHindi: string;
  moonNakshatra: NakshatraName;
  moonNakshatraPada: number;
  locationLabel: string;
  personalizationMessage: string;
  trust: AstrologyTrustMetadata;
}

export function getAstrologyIdentityCard(
  birthDateInput:
    | Date
    | string
    | number,
  location: PanchangLocation =
    DEFAULT_LOCATION,
): AstrologyIdentityCard {
  const chart =
    calculateKundli({
      date: ensureDate(
        birthDateInput,
      ),
      location,
    });

  const trust =
    getAstrologyTrustMetadata(
      location,
    );

  return {
    lagna:
      chart.ascendant.sign,
    lagnaEnglish:
      chart.ascendant.signEnglish,
    lagnaHindi:
      getRashiNameHindi(
        chart.ascendant.sign,
      ),
    moonSign:
      chart.moonSign,
    moonSignEnglish:
      chart.moonSignEnglish,
    moonSignHindi:
      getRashiNameHindi(
        chart.moonSign,
      ),
    sunSign:
      chart.sunSign,
    sunSignEnglish:
      chart.sunSignEnglish,
    sunSignHindi:
      getRashiNameHindi(
        chart.sunSign,
      ),
    moonNakshatra:
      chart.moonNakshatra,
    moonNakshatraPada:
      chart.moonNakshatraPada,
    locationLabel:
      trust.locationLabel,
    personalizationMessage:
      getAstrologyPersonalizationMessage(
        location,
      ),
    trust,
  };
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const astrology = {
  ZODIAC_SIGNS,
  ZODIAC_SIGNS_ENGLISH,
  NAKSHATRA_NAMES,
  PLANETS,
  PHYSICAL_PLANETS,

  RASHI_PROFILES,
  NAKSHATRA_LORDS,

  VIMSHOTTARI_YEARS,
  VIMSHOTTARI_ORDER,

  normalizeDegrees,
  angularDifference,
  getAngularSeparation,

  degreesToDMS,
  formatDegree,

  signIndexFromLongitude,
  getSignIndex,

  getZodiacSignFromLongitude,
  getZodiacSign,

  getEnglishZodiacSignFromLongitude,
  getEnglishZodiacSign,

  getDegreeInSign,

  getNakshatraIndex,
  getNakshatraName,
  getNakshatraPada,
  getNakshatraDetails,

  getAyanamsha,
  getSiderealLongitude,

  getMeanRahuLongitude,
  getMeanKetuLongitude,
  getSiderealMeanRahuLongitude,
  getSiderealMeanKetuLongitude,

  getPlanetPosition,
  getAllPlanetPositions,

  getLocalSiderealTimeHours,
  getEclipticObliquity,
  getTropicalAscendantLongitude,
  getAscendantLongitude,
  getAscendantPosition,

  getWholeSignHouses,
  getHouseForLongitude,

  getMoonSign,
  getSunSign,

  calculateKundli,
  getAstrologyCalculationMeta,

  getPlanetInSign,
  getPlanetDegree,
  getPlanetNakshatra,
  getPlanetHouse,

  getRashiNameHindi,
  getRashiNameEnglish,
  getRashiLord,
  getRashiElement,
  isMovableRashi,

  getNakshatraLord,
  getNakshatraLordByLongitude,

  calculateVimshottariMahadasha,

  getPlanetaryLongitudeDistance,
  getPlanetaryAngularSeparation,
  arePlanetsConjunct,
  arePlanetsOpposite,

  getGrahaDrishtiOffsets,
  getGrahaDrishti,
  doesPlanetAspectHouse,

  getSignDistance,
  calculateSadeSati,
  calculateDhaiya,
  calculateCurrentSadeSati,
  calculateCurrentDhaiya,

  getAstrologyLocations,
  getAstrologyLocationById,
  getPanIndiaAstrologyLocations,
  findAstrologyLocation,
  isSupportedAstrologyLocation,

  getAstrologyTrustMetadata,
  getAstrologyPersonalizationMessage,
  getPersonalizedKundliSummary,
  getRashiDisplay,
  getNakshatraDisplay,
  getAstrologyIdentityCard,

  ASTROLOGY_TRUST_NOTE,
  ASTROLOGY_INTERPRETATION_NOTE,

  getKundliSummary,
};

export default astrology;