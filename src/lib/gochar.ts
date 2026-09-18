/**
 * ============================================================================
 * DHARMYATRA - VEDIC ASTROLOGY GOCHAR / TRANSIT ENGINE
 * ============================================================================
 *
 * Production-level Vedic planetary transit engine.
 *
 * Responsibilities:
 * - Current planetary transit positions
 * - Sidereal Rashi calculation
 * - Tropical longitude compatibility
 * - Natal Moon-sign based transit house
 * - Natal Lagna based transit house
 * - Natal Sun-sign based transit house
 * - Transit retrograde status
 * - Rahu / Ketu transit
 * - Classical Vedic Drishti
 * - Jupiter 5th / 7th / 9th Drishti
 * - Saturn 3rd / 7th / 10th Drishti
 * - Mars 4th / 7th / 8th Drishti
 * - Transit-to-natal longitude aspects
 * - Planet-to-planet transit relationships
 * - Rashi transit helpers
 * - Retrograde helpers
 * - Major transit helpers
 * - Personalized Gochar report
 * - Transit sign-change detection
 * - Transit motion/direction
 * - UI-friendly Gochar summary
 *
 * IMPORTANT:
 * Raw astronomical calculations remain delegated to astrology.ts.
 *
 * Interpretation such as:
 * - Good / bad
 * - Sade Sati
 * - Dhaiya
 * - Yogas
 * - Rashifal
 * - Dasha interpretation
 *
 * should be implemented in separate modules.
 *
 * Source of truth:
 * src/lib/astrology.ts
 *
 * Ayanamsha:
 * Lahiri ayanamsha through astrology.ts / panchang.ts.
 *
 * ============================================================================
 */

import {
  ZODIAC_SIGNS,
  type PlanetName,
  type PlanetPosition,
  type ZodiacEnglishSign,
  type ZodiacSign,
  calculateKundli,
  formatDegree,
  getAngularSeparation,
  getAyanamsha,
  getPlanetPosition,
  getRashiNameHindi,
  getZodiacSignFromLongitude,
  normalizeDegrees,
  type AstrologyBirthDetails,
  getAstrologyTrustMetadata,
  getPanIndiaAstrologyLocations,
  findAstrologyLocation,
} from "./astrology";

/* ============================================================================
 * TYPES
 * ========================================================================== */

/**
 * Grahas used for transit calculations.
 *
 * Ascendant is deliberately excluded because it is a chart point.
 */
export type GocharPlanet = Exclude<PlanetName, "Ascendant">;

/**
 * Natal reference used for house calculation.
 */
export type GocharReference = "Moon" | "Ascendant" | "Sun";

/**
 * Classical Vedic transit aspect information.
 */
export interface TransitAspect {
  /**
   * Transit planet producing the aspect.
   */
  planet: GocharPlanet;

  /**
   * House distance from transit planet.
   *
   * 1 = same sign
   * 3 = third
   * 4 = fourth
   * 5 = fifth
   * 7 = seventh
   * 8 = eighth
   * 9 = ninth
   * 10 = tenth
   */
  house: number;

  /**
   * Zodiac sign receiving the aspect.
   */
  targetSign: ZodiacSign;

  /**
   * Target sign index 0-11.
   */
  targetSignIndex: number;

  /**
   * Whether this is a special Vedic aspect beyond the standard 7th.
   */
  isSpecial: boolean;

  /**
   * Human-readable aspect type.
   */
  type:
    | "7th"
    | "Mars-4th"
    | "Mars-8th"
    | "Jupiter-5th"
    | "Jupiter-9th"
    | "Saturn-3rd"
    | "Saturn-10th";

  /**
   * Exact angular separation from a supplied natal longitude.
   */
  angularSeparation?: number;

  /**
   * Absolute deviation from the applicable sign-aspect angular target.
   */
  orbDifference?: number;
}

/**
 * One planet's transit result.
 */
export interface GocharPosition {
  planet: GocharPlanet;

  /**
   * Tropical longitude in degrees.
   *
   * astrology.ts internally calculates the sidereal longitude.
   * Tropical longitude is reconstructed using the same Lahiri ayanamsha.
   */
  tropicalLongitude: number;

  /**
   * Sidereal longitude in degrees.
   */
  siderealLongitude: number;

  /**
   * Rashi.
   */
  sign: ZodiacSign;

  /**
   * Hindi Rashi name for UI/accessibility.
   */
  signHindi: string;

  /**
   * English zodiac sign.
   */
  signEnglish: ZodiacEnglishSign;

  /**
   * Degree inside current Rashi.
   */
  degreeInSign: number;

  /**
   * Formatted degree.
   */
  degreeFormatted: string;

  /**
   * Nakshatra.
   */
  nakshatra: string;

  /**
   * Nakshatra pada 1-4.
   */
  nakshatraPada: number;

  /**
   * Retrograde status.
   */
  isRetrograde: boolean;

  /**
   * Whether this is Rahu/Ketu.
   */
  isNode: boolean;

  /**
   * Whether this is considered fast-moving for UI.
   */
  isFastMoving: boolean;
}

/**
 * Transit house from a natal reference.
 */
export interface GocharHousePosition {
  planet: GocharPlanet;

  reference: GocharReference;

  /**
   * Natal reference sign.
   */
  referenceSign: ZodiacSign;

  /**
   * Natal reference sign index.
   */
  referenceSignIndex: number;

  /**
   * Current transit sign.
   */
  transitSign: ZodiacSign;

  /**
   * Current transit sign index.
   */
  transitSignIndex: number;

  /**
   * House number from natal reference.
   */
  house: number;

  /**
   * Whether transit planet is in the same sign.
   */
  isConjunctReference: boolean;

  /**
   * Whether the transit planet has a special Vedic aspect
   * toward the reference sign.
   */
  hasSpecialAspect: boolean;
}

/**
 * Full Gochar chart.
 */
export interface GocharChart {
  date: Date;

  planets: Record<GocharPlanet, GocharPosition>;

  references?: {
    moon?: {
      sign: ZodiacSign;
      signIndex: number;
    };

    sun?: {
      sign: ZodiacSign;
      signIndex: number;
    };

    ascendant?: {
      sign: ZodiacSign;
      signIndex: number;
      longitude: number;
    };
  };
}

/**
 * Planetary sign change between two dates.
 */
export interface GocharSignChange {
  planet: GocharPlanet;

  from: GocharPosition;

  to: GocharPosition;

  /**
   * Number of days between supplied dates.
   */
  daysBetween: number;
}

/**
 * Birth details used by personalized Gochar calculations.
 */
export type GocharBirthDetails = AstrologyBirthDetails;

/**
 * Trust metadata for Gochar calculations.
 *
 * Calculation data and traditional interpretation are deliberately separated.
 */
export interface GocharTrustMetadata {
  engine: "astronomy-engine";
  ayanamsha: "lahiri";
  nodeModel: "mean";
  houseSystem: "whole-sign";
  locationUsed?: {
    id?: string;
    city?: string;
    state?: string;
    country?: string;
    region?: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  locationLabel: string;
  calculationBasis: string;
  confidence: "high" | "medium" | "limited";
  trustNote: string;
  interpretationNote: string;
}

/**
 * Human-friendly personalization context.
 */
export interface GocharPersonalizationContext {
  locationLabel: string;
  city?: string;
  state?: string;
  region?: string;
  relevance: "birth-chart" | "selected-city" | "selected-state" | "india";
  referencePriority: readonly GocharReference[];
  message: string;
  trust: GocharTrustMetadata;
}

/**
 * Complete personalized Gochar report.
 */
export interface PersonalizedGocharReport {
  date: Date;

  chart: GocharChart;

  moonReference?: {
    sign: ZodiacSign;
    signIndex: number;
    houses: GocharHousePosition[];
  };

  ascendantReference?: {
    sign: ZodiacSign;
    signIndex: number;
    houses: GocharHousePosition[];
  };

  sunReference?: {
    sign: ZodiacSign;
    signIndex: number;
    houses: GocharHousePosition[];
  };

  aspects: TransitAspect[];

  /** Calculation transparency and personalization metadata. */
  trust: GocharTrustMetadata;

  /** User-facing context explaining how the report is personalized. */
  personalization: GocharPersonalizationContext;
}

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

/**
 * All standard Vedic Gochar planets.
 */
export const GOCHAR_PLANETS: readonly GocharPlanet[] = [
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

/**
 * Fast-moving planets.
 *
 * UI classification only.
 */
export const FAST_MOVING_GOCHAR_PLANETS: readonly GocharPlanet[] = [
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
] as const;

/**
 * Classical Vedic Drishti.
 *
 * Standard:
 * Every planet -> 7th
 *
 * Mars:
 * 4th, 7th, 8th
 *
 * Jupiter:
 * 5th, 7th, 9th
 *
 * Saturn:
 * 3rd, 7th, 10th
 *
 * Rahu/Ketu:
 * 7th only here because node-specific Drishti traditions vary.
 */
export const VEDIC_ASPECTS: Readonly<
  Record<GocharPlanet, readonly number[]>
> = {
  Sun: [7],
  Moon: [7],
  Mars: [4, 7, 8],
  Mercury: [7],
  Jupiter: [5, 7, 9],
  Venus: [7],
  Saturn: [3, 7, 10],
  Rahu: [7],
  Ketu: [7],
};

/**
 * Major long-term transit planets.
 */
export const MAJOR_TRANSIT_PLANETS: readonly GocharPlanet[] = [
  "Jupiter",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

const SIGN_COUNT = 12;

/* ============================================================================
 * INTERNAL HELPERS
 * ========================================================================== */

/**
 * Convert arbitrary input into a validated Date.
 */
function ensureDate(value: Date | string | number): Date {
  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw new Error(`Invalid transit date: ${String(value)}`);
  }

  return date;
}

/**
 * Safe modulo.
 */
function positiveModulo(
  value: number,
  divisor: number,
): number {
  return ((value % divisor) + divisor) % divisor;
}

/**
 * Validate Gochar planet.
 */
function ensureGocharPlanet(
  planet: PlanetName,
): asserts planet is GocharPlanet {
  if (planet === "Ascendant") {
    throw new Error(
      "Ascendant is not a planetary Gochar body.",
    );
  }

  if (
    !GOCHAR_PLANETS.includes(
      planet as GocharPlanet,
    )
  ) {
    throw new Error(
      `Unsupported Gochar planet: ${planet}`,
    );
  }
}

/**
 * Get canonical Rashi index.
 *
 * This replaces the old getSignIndex() dependency.
 */
function getRashiIndex(sign: ZodiacSign): number {
  const index = ZODIAC_SIGNS.indexOf(sign);

  if (index === -1) {
    throw new Error(
      `Unsupported zodiac sign: ${sign}`,
    );
  }

  return index;
}

/**
 * Convert longitude into Rashi index.
 */
function longitudeToSignIndex(
  longitude: number,
): number {
  return Math.floor(
    normalizeDegrees(longitude) / 30,
  );
}

/**
 * Get degree within current Rashi.
 */
function longitudeToDegreeInSign(
  longitude: number,
): number {
  return normalizeDegrees(longitude) % 30;
}

/**
 * Calculate house/sign distance.
 *
 * Example:
 *
 * Aries -> Cancer = 4th
 */
function signDistance(
  referenceSignIndex: number,
  transitSignIndex: number,
): number {
  return (
    positiveModulo(
      transitSignIndex - referenceSignIndex,
      SIGN_COUNT,
    ) + 1
  );
}

/**
 * Normalize and validate a zodiac sign index.
 *
 * The public helpers historically accepted any finite numeric index;
 * wrapping keeps that compatibility while rejecting NaN/Infinity.
 */
function normalizeSignIndex(signIndex: number): number {
  if (!Number.isFinite(signIndex)) {
    throw new Error("signIndex must be a finite number.");
  }

  return positiveModulo(
    Math.trunc(signIndex),
    SIGN_COUNT,
  );
}

/**
 * Return the unsigned angular distance represented by a Vedic sign-aspect
 * offset. Offsets beyond 180° have an equivalent shortest separation.
 */
function getAspectTargetSeparation(
  house: number,
): number {
  const targetAngle = positiveModulo(
    (house - 1) * 30,
    360,
  );

  return Math.min(
    targetAngle,
    360 - targetAngle,
  );
}

/**
 * Calculate the difference between an actual angular separation and a Vedic
 * aspect target separation.
 */
function getAspectOrbDifference(
  separation: number,
  house: number,
): number {
  return Math.abs(
    separation -
      getAspectTargetSeparation(house),
  );
}

/**
 * Build transit-house rows from an already calculated transit map.
 */
function buildTransitHousePositions(
  reference: GocharReference,
  referenceSignIndex: number,
  positions: Record<GocharPlanet, GocharPosition>,
): GocharHousePosition[] {
  const safeReferenceSignIndex =
    normalizeSignIndex(referenceSignIndex);

  const referenceSign =
    getZodiacSignFromLongitude(
      safeReferenceSignIndex * 30,
    );

  return GOCHAR_PLANETS.map((planet) => {
    const transit = positions[planet];

    const transitSignIndex =
      longitudeToSignIndex(
        transit.siderealLongitude,
      );

    const house =
      signDistance(
        safeReferenceSignIndex,
        transitSignIndex,
      );

    const referenceDistance =
      signDistance(
        transitSignIndex,
        safeReferenceSignIndex,
      );

    const hasSpecialAspect =
      referenceDistance !== 7 &&
      getPlanetAspectHouses(
        planet,
      ).includes(referenceDistance);

    return {
      planet,
      reference,
      referenceSign,
      referenceSignIndex:
        safeReferenceSignIndex,
      transitSign: transit.sign,
      transitSignIndex,
      house,
      isConjunctReference:
        house === 1,
      hasSpecialAspect,
    };
  });
}

/**
 * Days between dates.
 */
function daysBetween(
  start: Date,
  end: Date,
): number {
  return (
    Math.abs(
      end.getTime() - start.getTime(),
    ) / 86_400_000
  );
}

/**
 * Fast-moving UI classification.
 */
function isFastMovingPlanet(
  planet: GocharPlanet,
): boolean {
  return FAST_MOVING_GOCHAR_PLANETS.includes(
    planet,
  );
}

/**
 * Get aspect type.
 */
function getTransitAspectType(
  planet: GocharPlanet,
  house: number,
): TransitAspect["type"] {
  if (planet === "Mars") {
    if (house === 4) return "Mars-4th";
    if (house === 8) return "Mars-8th";
  }

  if (planet === "Jupiter") {
    if (house === 5) return "Jupiter-5th";
    if (house === 9) return "Jupiter-9th";
  }

  if (planet === "Saturn") {
    if (house === 3) return "Saturn-3rd";
    if (house === 10) return "Saturn-10th";
  }

  return "7th";
}

/**
 * Determine whether an aspect is a special aspect.
 */
function isSpecialAspectHouse(
  house: number,
): boolean {
  return house !== 7;
}

/**
 * Validate longitude.
 */
function ensureLongitude(
  longitude: number,
  name = "longitude",
): void {
  if (!Number.isFinite(longitude)) {
    throw new Error(
      `Invalid ${name}.`,
    );
  }
}

/**
 * Validate orb.
 */
function ensureOrb(
  orbDegrees: number,
): void {
  if (
    !Number.isFinite(orbDegrees) ||
    orbDegrees < 0 ||
    orbDegrees > 30
  ) {
    throw new Error(
      "orbDegrees must be between 0 and 30.",
    );
  }
}

/* ============================================================================
 * TRANSIT POSITION
 * ========================================================================== */

/**
 * Get complete sidereal Gochar position for one planet.
 *
 * `date` represents the exact instant used by the astronomy engine. Callers
 * should convert a calendar day to the desired timezone/instant before calling
 * this function when time-of-day precision matters.
 *
 * Astronomy remains delegated to astrology.ts.
 */
export function getGocharPosition(
  planet: GocharPlanet,
  date: Date | string | number = new Date(),
): GocharPosition {
  ensureGocharPlanet(planet);

  const normalizedDate = ensureDate(date);

  const position: PlanetPosition =
    getPlanetPosition(
      planet,
      normalizedDate,
    );

  const siderealLongitude =
    normalizeDegrees(
      position.longitude,
    );

  const calculatedSign =
    getZodiacSignFromLongitude(
      siderealLongitude,
    );

  const sign =
    calculatedSign === position.sign
      ? position.sign
      : calculatedSign;

  /**
   * Current astrology.ts stores sidereal longitude.
   *
   * Vedic relation:
   *
   * sidereal = tropical - ayanamsha
   *
   * therefore:
   *
   * tropical = sidereal + ayanamsha
   */
  const ayanamsha = getAyanamsha(
    normalizedDate,
  );

  const tropicalLongitude =
    normalizeDegrees(
      siderealLongitude + ayanamsha,
    );

  const degreeInSign =
    position.degreeInSign ??
    longitudeToDegreeInSign(
      siderealLongitude,
    );

  const degreeFormatted =
    formatDegree(degreeInSign);

  return {
    planet,

    tropicalLongitude,

    siderealLongitude,

    sign,

    signHindi:
      getRashiNameHindi(sign),

    signEnglish:
      position.signEnglish,

    degreeInSign,

    degreeFormatted,

    nakshatra:
      position.nakshatra,

    nakshatraPada:
      position.pada,

    isRetrograde:
      Boolean(position.retrograde),

    isNode:
      planet === "Rahu" ||
      planet === "Ketu",

    isFastMoving:
      isFastMovingPlanet(planet),
  };
}

/**
 * Get all nine standard Gochar positions.
 */
export function getAllGocharPositions(
  date: Date | string | number = new Date(),
): Record<
  GocharPlanet,
  GocharPosition
> {
  const normalizedDate =
    ensureDate(date);

  const result =
    {} as Record<
      GocharPlanet,
      GocharPosition
    >;

  for (
    const planet of GOCHAR_PLANETS
  ) {
    result[planet] =
      getGocharPosition(
        planet,
        normalizedDate,
      );
  }

  return result;
}

/* ============================================================================
 * TRANSIT CHART
 * ========================================================================== */

/**
 * Calculate complete Gochar chart.
 */
export function calculateGochar(
  date: Date | string | number = new Date(),
): GocharChart {
  const normalizedDate =
    ensureDate(date);

  return {
    date: normalizedDate,

    planets:
      getAllGocharPositions(
        normalizedDate,
      ),
  };
}

/* ============================================================================
 * NATAL REFERENCE
 * ========================================================================== */

/**
 * Get natal Moon reference.
 */
export function getNatalMoonReference(
  birthDetails: GocharBirthDetails,
): {
  sign: ZodiacSign;
  signIndex: number;
  longitude: number;
} {
  const kundli =
    calculateKundli(
      birthDetails,
    );

  const moon =
    kundli.planets.Moon;

  return {
    sign: moon.sign,

    signIndex:
      getRashiIndex(
        moon.sign,
      ),

    longitude:
      moon.longitude,
  };
}

/**
 * Get natal Sun reference.
 */
export function getNatalSunReference(
  birthDetails: GocharBirthDetails,
): {
  sign: ZodiacSign;
  signIndex: number;
  longitude: number;
} {
  const kundli =
    calculateKundli(
      birthDetails,
    );

  const sun =
    kundli.planets.Sun;

  return {
    sign: sun.sign,

    signIndex:
      getRashiIndex(
        sun.sign,
      ),

    longitude:
      sun.longitude,
  };
}

/**
 * Get natal Ascendant reference.
 */
export function getNatalAscendantReference(
  birthDetails: GocharBirthDetails,
): {
  sign: ZodiacSign;
  signIndex: number;
  longitude: number;
} {
  const kundli =
    calculateKundli(
      birthDetails,
    );

  const ascendant =
    kundli.ascendant;

  return {
    sign: ascendant.sign,

    signIndex:
      getRashiIndex(
        ascendant.sign,
      ),

    longitude:
      ascendant.longitude,
  };
}

/* ============================================================================
 * HOUSE FROM NATAL REFERENCE
 * ========================================================================== */

/**
 * Get transit house from any natal reference sign.
 */
export function getTransitHouseFromSign(
  transitPlanet: GocharPlanet,
  referenceSignIndex: number,
  date: Date | string | number = new Date(),
  reference: GocharReference = "Moon",
): GocharHousePosition {
  ensureGocharPlanet(
    transitPlanet,
  );

  const normalizedDate =
    ensureDate(date);

  const safeReferenceSignIndex =
    normalizeSignIndex(
      referenceSignIndex,
    );

  const transit =
    getGocharPosition(
      transitPlanet,
      normalizedDate,
    );

  const transitSignIndex =
    longitudeToSignIndex(
      transit.siderealLongitude,
    );

  const house =
    signDistance(
      safeReferenceSignIndex,
      transitSignIndex,
    );

  const referenceSign =
    getZodiacSignFromLongitude(
      safeReferenceSignIndex * 30,
    );

  /**
   * Determine whether the reference sign receives
   * a special aspect from the transit planet.
   *
   * From transit planet's sign:
   * house = distance to reference sign.
   */
  const aspectHouses =
    getPlanetAspectHouses(
      transitPlanet,
    );

  const referenceDistance =
    signDistance(
      transitSignIndex,
      safeReferenceSignIndex,
    );

  const hasSpecialAspect =
    referenceDistance !== 7 &&
    aspectHouses.includes(
      referenceDistance,
    );

  return {
    planet:
      transitPlanet,

    reference,

    referenceSign,

    referenceSignIndex:
      safeReferenceSignIndex,

    transitSign:
      transit.sign,

    transitSignIndex,

    house,

    isConjunctReference:
      house === 1,

    hasSpecialAspect,
  };
}

/**
 * Get transit houses from natal Moon.
 */
export function getTransitHousesFromMoon(
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): GocharHousePosition[] {
  const reference =
    getNatalMoonReference(
      birthDetails,
    );

  const positions =
    getAllGocharPositions(
      date,
    );

  return buildTransitHousePositions(
    "Moon",
    reference.signIndex,
    positions,
  );
}

/**
 * Get transit houses from natal Sun.
 */
export function getTransitHousesFromSun(
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): GocharHousePosition[] {
  const reference =
    getNatalSunReference(
      birthDetails,
    );

  const positions =
    getAllGocharPositions(
      date,
    );

  return buildTransitHousePositions(
    "Sun",
    reference.signIndex,
    positions,
  );
}

/**
 * Get transit houses from natal Ascendant.
 */
export function getTransitHousesFromAscendant(
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): GocharHousePosition[] {
  const reference =
    getNatalAscendantReference(
      birthDetails,
    );

  const positions =
    getAllGocharPositions(
      date,
    );

  return buildTransitHousePositions(
    "Ascendant",
    reference.signIndex,
    positions,
  );
}

/* ============================================================================
 * VEDIC DRSHTI
 * ========================================================================== */

/**
 * Get classical aspect houses for a planet.
 */
export function getPlanetAspectHouses(
  planet: GocharPlanet,
): readonly number[] {
  ensureGocharPlanet(
    planet,
  );

  return VEDIC_ASPECTS[
    planet
  ];
}

/**
 * Calculate signs receiving Vedic aspects.
 */
export function getTransitAspects(
  planet: GocharPlanet,
  date: Date | string | number = new Date(),
): TransitAspect[] {
  ensureGocharPlanet(
    planet,
  );

  const normalizedDate =
    ensureDate(date);

  const transit =
    getGocharPosition(
      planet,
      normalizedDate,
    );

  const sourceSignIndex =
    longitudeToSignIndex(
      transit.siderealLongitude,
    );

  return getPlanetAspectHouses(
    planet,
  ).map((house) => {
    const targetSignIndex =
      positiveModulo(
        sourceSignIndex +
          house -
          1,
        SIGN_COUNT,
      );

    return {
      planet,

      house,

      targetSign:
        getZodiacSignFromLongitude(
          targetSignIndex * 30,
        ),

      targetSignIndex,

      isSpecial:
        isSpecialAspectHouse(
          house,
        ),

      type:
        getTransitAspectType(
          planet,
          house,
        ),
    };
  });
}

/**
 * Get all classical transit aspects.
 */
export function getAllTransitAspects(
  date: Date | string | number = new Date(),
): TransitAspect[] {
  const normalizedDate =
    ensureDate(date);

  return GOCHAR_PLANETS.flatMap(
    (planet) =>
      getTransitAspects(
        planet,
        normalizedDate,
      ),
  );
}

/* ============================================================================
 * ASPECT TO NATAL LONGITUDE
 * ========================================================================== */

/**
 * Check transit aspect against natal longitude.
 *
 * NOTE:
 * This uses angular longitude relationships with an orb.
 * This is an interpretation/ruleset layer on top of astronomy.
 */
export function isTransitAspectingNatalLongitude(
  transitPlanet: GocharPlanet,
  natalLongitude: number,
  date: Date | string | number = new Date(),
  orbDegrees = 5,
): boolean {
  ensureGocharPlanet(
    transitPlanet,
  );

  ensureLongitude(
    natalLongitude,
    "natal longitude",
  );

  ensureOrb(
    orbDegrees,
  );

  const transit =
    getGocharPosition(
      transitPlanet,
      date,
    );

  const separation =
    getAngularSeparation(
      transit.siderealLongitude,
      natalLongitude,
    );

  for (
    const house of getPlanetAspectHouses(
      transitPlanet,
    )
  ) {
    const difference =
      getAspectOrbDifference(
        separation,
        house,
      );

    if (
      difference <=
      orbDegrees
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Detailed transit aspects to natal longitude.
 */
export function getTransitAspectsToNatalLongitude(
  transitPlanet: GocharPlanet,
  natalLongitude: number,
  date: Date | string | number = new Date(),
  orbDegrees = 5,
): TransitAspect[] {
  ensureGocharPlanet(
    transitPlanet,
  );

  ensureLongitude(
    natalLongitude,
    "natal longitude",
  );

  ensureOrb(
    orbDegrees,
  );

  const normalizedDate =
    ensureDate(date);

  const transit =
    getGocharPosition(
      transitPlanet,
      normalizedDate,
    );

  const sourceSignIndex =
    longitudeToSignIndex(
      transit.siderealLongitude,
    );

  const separation =
    getAngularSeparation(
      transit.siderealLongitude,
      natalLongitude,
    );

  return getPlanetAspectHouses(
    transitPlanet,
  )
    .filter((house) => {
      const difference =
        getAspectOrbDifference(
          separation,
          house,
        );

      return (
        difference <=
        orbDegrees
      );
    })
    .map((house) => {
      const targetSignIndex =
        positiveModulo(
          sourceSignIndex +
            house -
            1,
          SIGN_COUNT,
        );

      return {
        planet:
          transitPlanet,

        house,

        targetSign:
          getZodiacSignFromLongitude(
            targetSignIndex * 30,
          ),

        targetSignIndex,

        isSpecial:
          isSpecialAspectHouse(
            house,
          ),

        type:
          getTransitAspectType(
            transitPlanet,
            house,
          ),

        angularSeparation:
          separation,

        orbDifference:
          getAspectOrbDifference(
            separation,
            house,
          ),
      };
    });
}

/* ============================================================================
 * PLANET-TO-PLANET RELATION
 * ========================================================================== */

/**
 * Sidereal angular separation between two transit planets.
 */
export function getTransitPlanetSeparation(
  planetA: GocharPlanet,
  planetB: GocharPlanet,
  date: Date | string | number = new Date(),
): number {
  ensureGocharPlanet(
    planetA,
  );

  ensureGocharPlanet(
    planetB,
  );

  const normalizedDate =
    ensureDate(date);

  const a =
    getGocharPosition(
      planetA,
      normalizedDate,
    );

  const b =
    getGocharPosition(
      planetB,
      normalizedDate,
    );

  return getAngularSeparation(
    a.siderealLongitude,
    b.siderealLongitude,
  );
}

/**
 * Check transit conjunction.
 */
export function areTransitPlanetsConjunct(
  planetA: GocharPlanet,
  planetB: GocharPlanet,
  date: Date | string | number = new Date(),
  orbDegrees = 8,
): boolean {
  if (
    !Number.isFinite(
      orbDegrees,
    ) ||
    orbDegrees < 0 ||
    orbDegrees > 30
  ) {
    throw new Error(
      "orbDegrees must be between 0 and 30.",
    );
  }

  return (
    getTransitPlanetSeparation(
      planetA,
      planetB,
      date,
    ) <= orbDegrees
  );
}

/**
 * Check transit opposition.
 */
export function areTransitPlanetsOpposite(
  planetA: GocharPlanet,
  planetB: GocharPlanet,
  date: Date | string | number = new Date(),
  orbDegrees = 8,
): boolean {
  if (
    !Number.isFinite(
      orbDegrees,
    ) ||
    orbDegrees < 0 ||
    orbDegrees > 30
  ) {
    throw new Error(
      "orbDegrees must be between 0 and 30.",
    );
  }

  const separation =
    getTransitPlanetSeparation(
      planetA,
      planetB,
      date,
    );

  return (
    Math.abs(
      180 - separation,
    ) <= orbDegrees
  );
}

/* ============================================================================
 * RASHI TRANSIT HELPERS
 * ========================================================================== */

/**
 * Get all planets transiting a Rashi.
 */
export function getPlanetsInSign(
  sign: ZodiacSign,
  date: Date | string | number = new Date(),
): GocharPosition[] {
  const normalizedDate =
    ensureDate(date);

  return GOCHAR_PLANETS
    .map((planet) =>
      getGocharPosition(
        planet,
        normalizedDate,
      ),
    )
    .filter(
      (position) =>
        position.sign === sign,
    );
}

/**
 * Get all planets transiting a sign index.
 */
export function getPlanetsInSignIndex(
  signIndex: number,
  date: Date | string | number = new Date(),
): GocharPosition[] {
  const safeIndex =
    normalizeSignIndex(
      signIndex,
    );

  const sign =
    getZodiacSignFromLongitude(
      safeIndex * 30,
    );

  return getPlanetsInSign(
    sign,
    date,
  );
}

/**
 * Check whether a planet is in a sign.
 */
export function isPlanetInSign(
  planet: GocharPlanet,
  sign: ZodiacSign,
  date: Date | string | number = new Date(),
): boolean {
  ensureGocharPlanet(
    planet,
  );

  return (
    getGocharPosition(
      planet,
      date,
    ).sign === sign
  );
}

/* ============================================================================
 * RETROGRADE
 * ========================================================================== */

/**
 * Get retrograde Gochar planets.
 */
export function getRetrogradeGocharPlanets(
  date: Date | string | number = new Date(),
): GocharPosition[] {
  const normalizedDate =
    ensureDate(date);

  return GOCHAR_PLANETS
    .map((planet) =>
      getGocharPosition(
        planet,
        normalizedDate,
      ),
    )
    .filter(
      (position) =>
        position.isRetrograde,
    );
}

/**
 * Get retrograde planet names.
 */
export function getRetrogradeGocharPlanetNames(
  date: Date | string | number = new Date(),
): GocharPlanet[] {
  return getRetrogradeGocharPlanets(
    date,
  ).map(
    (position) =>
      position.planet,
  );
}

/* ============================================================================
 * RAHU / KETU
 * ========================================================================== */

/**
 * Get Rahu and Ketu together.
 */
export function getRahuKetuGochar(
  date: Date | string | number = new Date(),
): {
  rahu: GocharPosition;
  ketu: GocharPosition;
} {
  const normalizedDate =
    ensureDate(date);

  return {
    rahu:
      getGocharPosition(
        "Rahu",
        normalizedDate,
      ),

    ketu:
      getGocharPosition(
        "Ketu",
        normalizedDate,
      ),
  };
}

/**
 * Get Rahu-Ketu separation.
 */
export function getRahuKetuSeparation(
  date: Date | string | number = new Date(),
): number {
  const {
    rahu,
    ketu,
  } =
    getRahuKetuGochar(
      date,
    );

  return getAngularSeparation(
    rahu.siderealLongitude,
    ketu.siderealLongitude,
  );
}

/* ============================================================================
 * MAJOR TRANSITS
 * ========================================================================== */

/**
 * Get major transit positions.
 */
export function getMajorTransitPositions(
  date: Date | string | number = new Date(),
): GocharPosition[] {
  const normalizedDate =
    ensureDate(date);

  return MAJOR_TRANSIT_PLANETS.map(
    (planet) =>
      getGocharPosition(
        planet,
        normalizedDate,
      ),
  );
}

/* ============================================================================
 * PERSONALIZED GOCHAR
 * ========================================================================== */

/**
 * Build personalized Gochar report.
 */
export function calculatePersonalizedGochar(
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): PersonalizedGocharReport {
  const normalizedDate =
    ensureDate(date);

  const chart =
    calculateGochar(
      normalizedDate,
    );

  const kundli =
    calculateKundli(
      birthDetails,
    );

  const moon =
    kundli.planets.Moon;

  const sun =
    kundli.planets.Sun;

  const ascendant =
    kundli.ascendant;

  const moonSignIndex =
    getRashiIndex(
      moon.sign,
    );

  const sunSignIndex =
    getRashiIndex(
      sun.sign,
    );

  const ascendantSignIndex =
    getRashiIndex(
      ascendant.sign,
    );

  const positions =
    chart.planets;

  return {
    date:
      normalizedDate,

    chart,

    moonReference: {
      sign:
        moon.sign,

      signIndex:
        moonSignIndex,

      houses:
        buildTransitHousePositions(
          "Moon",
          moonSignIndex,
          positions,
        ),
    },

    ascendantReference: {
      sign:
        ascendant.sign,

      signIndex:
        ascendantSignIndex,

      houses:
        buildTransitHousePositions(
          "Ascendant",
          ascendantSignIndex,
          positions,
        ),
    },

    sunReference: {
      sign:
        sun.sign,

      signIndex:
        sunSignIndex,

      houses:
        buildTransitHousePositions(
          "Sun",
          sunSignIndex,
          positions,
        ),
    },

    aspects:
      getAllTransitAspects(
        normalizedDate,
      ),

    trust: getGocharTrustMetadata(
      birthDetails.location,
    ),

    personalization:
      getGocharPersonalizationContext(
        birthDetails,
      ),
  };
}

/* ============================================================================
 * HOUSE LOOKUP
 * ========================================================================== */

/**
 * Get planet transit house from natal Moon.
 */
export function getPlanetTransitHouseFromMoon(
  planet: GocharPlanet,
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): number {
  const moon =
    getNatalMoonReference(
      birthDetails,
    );

  return getTransitHouseFromSign(
    planet,
    moon.signIndex,
    date,
    "Moon",
  ).house;
}

/**
 * Get planet transit house from natal Ascendant.
 */
export function getPlanetTransitHouseFromAscendant(
  planet: GocharPlanet,
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): number {
  const ascendant =
    getNatalAscendantReference(
      birthDetails,
    );

  return getTransitHouseFromSign(
    planet,
    ascendant.signIndex,
    date,
    "Ascendant",
  ).house;
}

/**
 * Get planet transit house from natal Sun.
 */
export function getPlanetTransitHouseFromSun(
  planet: GocharPlanet,
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): number {
  const sun =
    getNatalSunReference(
      birthDetails,
    );

  return getTransitHouseFromSign(
    planet,
    sun.signIndex,
    date,
    "Sun",
  ).house;
}

/* ============================================================================
 * TRANSIT SIGN CHANGE
 * ========================================================================== */

/**
 * Compare two dates and identify Rashi changes.
 *
 * This detects a sign difference between the two supplied dates.
 *
 * It does NOT claim to be the exact ingress time.
 */
export function getGocharSignChanges(
  fromDate: Date | string | number,
  toDate: Date | string | number,
): GocharSignChange[] {
  const from =
    ensureDate(fromDate);

  const to =
    ensureDate(toDate);

  if (
    to.getTime() <
    from.getTime()
  ) {
    throw new Error(
      "toDate must be greater than or equal to fromDate.",
    );
  }

  const fromPositions =
    getAllGocharPositions(
      from,
    );

  const toPositions =
    getAllGocharPositions(
      to,
    );

  return GOCHAR_PLANETS
    .filter(
      (planet) =>
        fromPositions[planet]
          .sign !==
        toPositions[planet]
          .sign,
    )
    .map(
      (planet) => ({
        planet,

        from:
          fromPositions[
            planet
          ],

        to:
          toPositions[
            planet
          ],

        daysBetween:
          daysBetween(
            from,
            to,
          ),
      }),
    );
}

/* ============================================================================
 * TRANSIT MOTION
 * ========================================================================== */

/**
 * Signed sidereal motion between two dates.
 *
 * Positive = forward
 * Negative = backward
 */
export function getTransitMotion(
  planet: GocharPlanet,
  fromDate: Date | string | number,
  toDate: Date | string | number,
): number {
  ensureGocharPlanet(
    planet,
  );

  const from =
    getGocharPosition(
      planet,
      fromDate,
    );

  const to =
    getGocharPosition(
      planet,
      toDate,
    );

  let delta =
    to.siderealLongitude -
    from.siderealLongitude;

  if (delta > 180) {
    delta -= 360;
  }

  if (delta < -180) {
    delta += 360;
  }

  return delta;
}

/**
 * Determine apparent direction.
 */
export function getTransitDirection(
  planet: GocharPlanet,
  fromDate: Date | string | number,
  toDate: Date | string | number,
): "direct" | "retrograde" | "stationary" {
  const motion =
    getTransitMotion(
      planet,
      fromDate,
      toDate,
    );

  /**
   * Stationary is deliberately based on the
   * supplied date interval.
   */
  const epsilon = 0.0001;

  if (
    Math.abs(motion) <=
    epsilon
  ) {
    return "stationary";
  }

  return motion > 0
    ? "direct"
    : "retrograde";
}

/* ============================================================================
 * SPECIAL TRANSIT CHECKS
 * ========================================================================== */

/**
 * Check planet over natal Moon.
 */
export function isPlanetOverNatalMoon(
  planet: GocharPlanet,
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): boolean {
  return (
    getPlanetTransitHouseFromMoon(
      planet,
      birthDetails,
      date,
    ) === 1
  );
}

/**
 * Check planet over natal Ascendant.
 */
export function isPlanetOverNatalAscendant(
  planet: GocharPlanet,
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): boolean {
  return (
    getPlanetTransitHouseFromAscendant(
      planet,
      birthDetails,
      date,
    ) === 1
  );
}

/**
 * Check Saturn in Sade Sati zone.
 *
 * 12th / 1st / 2nd from natal Moon.
 *
 * Interpretation remains in sadhe-sathi.ts.
 */
export function isSaturnInSadeSatiZone(
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): boolean {
  const house =
    getPlanetTransitHouseFromMoon(
      "Saturn",
      birthDetails,
      date,
    );

  return (
    house === 12 ||
    house === 1 ||
    house === 2
  );
}

/**
 * Check Saturn in Dhaiya zone.
 *
 * 4th / 8th from natal Moon.
 */
export function isSaturnInDhaiyaZone(
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): boolean {
  const house =
    getPlanetTransitHouseFromMoon(
      "Saturn",
      birthDetails,
      date,
    );

  return (
    house === 4 ||
    house === 8
  );
}

/**
 * Jupiter transit aspect.
 */
export function hasJupiterSpecialTransitAspect(
  natalLongitude: number,
  date: Date | string | number = new Date(),
  orbDegrees = 5,
): boolean {
  return isTransitAspectingNatalLongitude(
    "Jupiter",
    natalLongitude,
    date,
    orbDegrees,
  );
}

/**
 * Saturn transit aspect.
 */
export function hasSaturnTransitAspect(
  natalLongitude: number,
  date: Date | string | number = new Date(),
  orbDegrees = 5,
): boolean {
  return isTransitAspectingNatalLongitude(
    "Saturn",
    natalLongitude,
    date,
    orbDegrees,
  );
}

/**
 * Mars transit aspect.
 */
export function hasMarsTransitAspect(
  natalLongitude: number,
  date: Date | string | number = new Date(),
  orbDegrees = 5,
): boolean {
  return isTransitAspectingNatalLongitude(
    "Mars",
    natalLongitude,
    date,
    orbDegrees,
  );
}

/* ============================================================================
 * GOCHAR SUMMARY
 * ========================================================================== */

/**
 * UI-friendly Gochar summary.
 */
export interface GocharSummary {
  date: Date;

  planets: Array<{
    planet: GocharPlanet;
    sign: ZodiacSign;
    signHindi: string;
    degree: number;
    nakshatra: string;
    nakshatraPada: number;
    isRetrograde: boolean;
  }>;

  retrogradePlanets: GocharPlanet[];

  majorTransits: Array<{
    planet: GocharPlanet;
    sign: ZodiacSign;
    signHindi: string;
    degree: number;
    isRetrograde: boolean;
  }>;
}

/**
 * Generate Gochar summary.
 */
export function getGocharSummary(
  date: Date | string | number = new Date(),
): GocharSummary {
  const normalizedDate =
    ensureDate(date);

  const positions =
    getAllGocharPositions(
      normalizedDate,
    );

  const planets =
    GOCHAR_PLANETS.map(
      (planet) => {
        const position =
          positions[planet];

        return {
          planet,

          sign:
            position.sign,

          signHindi:
            position.signHindi,

          degree:
            position.degreeInSign,

          nakshatra:
            position.nakshatra,

          nakshatraPada:
            position.nakshatraPada,

          isRetrograde:
            position.isRetrograde,
        };
      },
    );

  return {
    date:
      normalizedDate,

    planets,

    retrogradePlanets:
      planets
        .filter(
          (planet) =>
            planet.isRetrograde,
        )
        .map(
          (planet) =>
            planet.planet,
        ),

    majorTransits:
      MAJOR_TRANSIT_PLANETS.map(
        (planet) => {
          const position =
            positions[planet];

          return {
            planet,

            sign:
              position.sign,

            signHindi:
              position.signHindi,

            degree:
              position.degreeInSign,

            isRetrograde:
              position.isRetrograde,
          };
        },
      ),
  };
}

/* ============================================================================
 * PAN-INDIA TRUST + PERSONALIZATION
 * ========================================================================== */

/**
 * Stable trust statement used throughout the Gochar UI.
 */
export const GOCHAR_TRUST_NOTE =
  "DharmYatra calculates Gochar positions from astronomical data using Lahiri sidereal ayanamsha, mean lunar nodes and whole-sign house references. Planetary positions are calculation data; traditional transit interpretations can vary by parampara, astrologer and ruleset.";

/**
 * Interpretation safety statement.
 */
export const GOCHAR_INTERPRETATION_NOTE =
  "Gochar, Rashifal, Sade Sati, Dhaiya and transit-aspect interpretations belong to traditional Vedic astrology. They are best used for cultural, spiritual and self-reflection purposes, not as guaranteed predictions or substitutes for professional medical, legal, financial or other expert advice.";

function getGocharLocationLabel(
  location?: AstrologyBirthDetails["location"],
): string {
  if (!location) return "India (default calculation location)";

  const parts = [
    location.city,
    location.state,
    location.country,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    )
    .map(
      (value) =>
        value.trim(),
    );

  if (parts.length) return parts.join(", ");
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
}

/**
 * Return transparent calculation metadata for the selected birth location.
 */
export function getGocharTrustMetadata(
  location?: AstrologyBirthDetails["location"],
): GocharTrustMetadata {
  const astrologyTrust = getAstrologyTrustMetadata(location);

  return {
    engine: "astronomy-engine",
    ayanamsha: "lahiri",
    nodeModel: "mean",
    houseSystem: "whole-sign",
    locationUsed: astrologyTrust.locationUsed
      ? {
          id: astrologyTrust.locationUsed.id,
          city: astrologyTrust.locationUsed.city,
          state: astrologyTrust.locationUsed.state,
          country: astrologyTrust.locationUsed.country,
          region: astrologyTrust.locationUsed.region,
          latitude: astrologyTrust.locationUsed.latitude,
          longitude: astrologyTrust.locationUsed.longitude,
          timezone: astrologyTrust.locationUsed.timezone,
        }
      : undefined,
    locationLabel: getGocharLocationLabel(location),
    calculationBasis:
      "Sidereal planetary transit positions from astronomy-engine, converted with Lahiri ayanamsha; house references use whole-sign counting from natal Moon, Sun and Ascendant.",
    confidence: astrologyTrust.confidence,
    trustNote: GOCHAR_TRUST_NOTE,
    interpretationNote: GOCHAR_INTERPRETATION_NOTE,
  };
}

/**
 * Explain why a Gochar result is personally relevant.
 */
export function getGocharPersonalizationContext(
  birthDetails?: GocharBirthDetails,
): GocharPersonalizationContext {
  const location = birthDetails?.location;
  const trust = getGocharTrustMetadata(location);

  if (!birthDetails) {
    return {
      locationLabel: trust.locationLabel,
      relevance: "india",
      referencePriority: ["Moon", "Ascendant", "Sun"],
      message:
        "This is a general Gochar view. Add your birth date, birth time and birth location to relate transits to your natal Moon, Lagna and Sun.",
      trust,
    };
  }

  const city = location?.city;
  const state = location?.state;
  const region = location?.region;
  const locationPart = city && state
    ? `${city}, ${state}`
    : city || state || trust.locationLabel;

  return {
    locationLabel: trust.locationLabel,
    city,
    state,
    region,
    relevance: city ? "selected-city" : state ? "selected-state" : "birth-chart",
    referencePriority: ["Moon", "Ascendant", "Sun"],
    message:
      `Your Gochar is personalized from your natal Moon, Lagna and Sun using the supplied birth details${locationPart ? ` for ${locationPart}` : ""}. Changing the birth time or location can change the Lagna and therefore house-based transit results.`,
    trust,
  };
}

/**
 * All supported Pan-India astrology locations, sourced from the common
 * Panchang/Astrology location registry.
 */
export function getPanIndiaGocharLocations() {
  return getPanIndiaAstrologyLocations();
}

/**
 * Find a supported Indian Gochar location by city/state/name.
 */
export function findGocharLocation(query: string) {
  if (typeof query !== "string") {
    return undefined;
  }

  const normalizedQuery =
    query.trim();

  if (!normalizedQuery) {
    return undefined;
  }

  return findAstrologyLocation(
    normalizedQuery,
  );
}

/**
 * Get a compact, UI-friendly personalized Gochar summary.
 */
export interface PersonalizedGocharSummary {
  date: Date;
  locationLabel: string;
  relevance: GocharPersonalizationContext["relevance"];
  message: string;
  moonSign?: ZodiacSign;
  sunSign?: ZodiacSign;
  ascendantSign?: ZodiacSign;
  majorTransits: GocharPosition[];
  retrogradePlanets: GocharPlanet[];
  rahu: GocharPosition;
  ketu: GocharPosition;
  trust: GocharTrustMetadata;
}

/**
 * Build a user-relatable Gochar summary without inventing predictive claims.
 */
export function getPersonalizedGocharSummary(
  birthDetails: GocharBirthDetails,
  date: Date | string | number = new Date(),
): PersonalizedGocharSummary {
  const report = calculatePersonalizedGochar(birthDetails, date);
  const context = report.personalization;
  const positions = report.chart.planets;

  return {
    date: report.date,
    locationLabel: context.locationLabel,
    relevance: context.relevance,
    message: context.message,
    moonSign: report.moonReference?.sign,
    sunSign: report.sunReference?.sign,
    ascendantSign: report.ascendantReference?.sign,
    majorTransits: getMajorTransitPositions(report.date),
    retrogradePlanets: getRetrogradeGocharPlanetNames(report.date),
    rahu: positions.Rahu,
    ketu: positions.Ketu,
    trust: report.trust,
  };
}

/**
 * Human-readable confidence label for Gochar UI.
 */
export function getGocharConfidenceLabel(
  confidence: GocharTrustMetadata["confidence"],
): string {
  switch (confidence) {
    case "high":
      return "High calculation confidence";
    case "medium":
      return "Calculation confidence: medium";
    default:
      return "Limited calculation confidence";
  }
}

/**
 * Human-readable relevance label for Gochar UI.
 */
export function getGocharRelevanceLabel(
  relevance: GocharPersonalizationContext["relevance"],
): string {
  switch (relevance) {
    case "birth-chart":
      return "Personal birth-chart Gochar";
    case "selected-city":
      return "Personalized for selected city";
    case "selected-state":
      return "Personalized for selected state";
    default:
      return "Pan-India general Gochar";
  }
}

/* ============================================================================
 * DEFAULT EXPORT
 * ========================================================================== */

const gochar = {
  GOCHAR_PLANETS,

  FAST_MOVING_GOCHAR_PLANETS,

  MAJOR_TRANSIT_PLANETS,

  VEDIC_ASPECTS,

  getGocharPosition,

  getAllGocharPositions,

  calculateGochar,

  getNatalMoonReference,

  getNatalSunReference,

  getNatalAscendantReference,

  getTransitHouseFromSign,

  getTransitHousesFromMoon,

  getTransitHousesFromSun,

  getTransitHousesFromAscendant,

  getPlanetAspectHouses,

  getTransitAspects,

  getAllTransitAspects,

  isTransitAspectingNatalLongitude,

  getTransitAspectsToNatalLongitude,

  getTransitPlanetSeparation,

  areTransitPlanetsConjunct,

  areTransitPlanetsOpposite,

  getPlanetsInSign,

  getPlanetsInSignIndex,

  isPlanetInSign,

  getRetrogradeGocharPlanets,

  getRetrogradeGocharPlanetNames,

  getRahuKetuGochar,

  getRahuKetuSeparation,

  getMajorTransitPositions,

  calculatePersonalizedGochar,

  getPlanetTransitHouseFromMoon,

  getPlanetTransitHouseFromAscendant,

  getPlanetTransitHouseFromSun,

  getGocharSignChanges,

  getTransitMotion,

  getTransitDirection,

  isPlanetOverNatalMoon,

  isPlanetOverNatalAscendant,

  isSaturnInSadeSatiZone,

  isSaturnInDhaiyaZone,

  hasJupiterSpecialTransitAspect,

  hasSaturnTransitAspect,

  hasMarsTransitAspect,

  getGocharSummary,

  GOCHAR_TRUST_NOTE,

  GOCHAR_INTERPRETATION_NOTE,

  getGocharTrustMetadata,

  getGocharPersonalizationContext,

  getPanIndiaGocharLocations,

  findGocharLocation,

  getPersonalizedGocharSummary,

  getGocharConfidenceLabel,

  getGocharRelevanceLabel,
};

export default gochar;