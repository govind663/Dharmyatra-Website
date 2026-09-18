/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ============================================================================
 * DHARMYATRA - VEDIC ASTROLOGY
 * SHANI SADE SATI / DHAIYA ENGINE
 * ============================================================================
 *
 * Production-oriented Sade Sati + Dhaiya engine.
 *
 * CORE PRINCIPLES
 * ----------------------------------------------------------------------------
 * 1. Astronomical calculations are delegated to astrology.ts.
 * 2. No independent Saturn/Moon longitude engine is maintained here.
 * 3. Sade Sati is determined from Saturn's SIDEREAL RASHI relative to
 *    the natal Moon sign.
 * 4. Dhaiya is determined from the 4th and 8th positions from natal Moon.
 * 5. Exact Saturn ingress dates are NOT hard-coded.
 * 6. Calculation data is kept separate from traditional interpretation.
 * 7. Location is retained for personalization and calculation transparency.
 * 8. Pan-India locations are sourced from the common astrology location layer.
 *
 * SADE SATI
 * ----------------------------------------------------------------------------
 * Saturn 12th from natal Moon -> First / Rising Phase
 * Saturn 1st  from natal Moon -> Peak / Second Phase
 * Saturn 2nd  from natal Moon -> Third / Setting Phase
 *
 * DHAIYA
 * ----------------------------------------------------------------------------
 * Saturn 4th from natal Moon -> 4th House Dhaiya
 * Saturn 8th from natal Moon -> 8th House Dhaiya
 *
 * TRUST
 * ----------------------------------------------------------------------------
 * DharmYatra clearly distinguishes:
 * - astronomical calculation
 * - location/birth-data relevance
 * - traditional interpretation
 *
 * This module does not present astrology as scientifically validated
 * prediction.
 *
 * ============================================================================
 */

import {
  ZODIAC_SIGNS,
  type GrahaName,
  type NakshatraName,
  type ZodiacEnglishSign,
  type ZodiacSign,
  calculateCurrentDhaiya,
  calculateCurrentSadeSati,
  calculateDhaiya,
  calculateSadeSati,
  getMoonSign,
  getPlanetPosition,
  getRashiLord,
  getRashiNameEnglish,
  getRashiNameHindi,
  getSignDistance,
  getPanIndiaAstrologyLocations,
  findAstrologyLocation,
} from "./astrology";
import type { PanchangLocation } from "./panchang";

/* ============================================================================
 * TYPES
 * ========================================================================== */

export type SadeSatiPhase =
  | "none"
  | "rising"
  | "peak"
  | "setting";

export type SadeSatiPhaseLabel =
  | "Not Active"
  | "First Phase"
  | "Peak Phase"
  | "Third Phase";

export type DhaiyaType =
  | "4th-from-moon"
  | "8th-from-moon"
  | "none";

export type SaturnTransitStatus =
  | "normal"
  | "sade-sati"
  | "dhaiya";

/**
 * Trust/confidence classification.
 *
 * IMPORTANT:
 * This describes calculation/data confidence, not whether an astrological
 * interpretation is scientifically proven.
 */
export type SadeSatiConfidence =
  | "high"
  | "medium"
  | "limited";

/**
 * Relevance level for Pan-India personalization.
 */
export type SadeSatiRelevance =
  | "birth-location"
  | "selected-city"
  | "selected-state"
  | "india";

/**
 * Natal Moon information.
 */
export interface NatalMoonInfo {
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;

  signIndex: number;

  longitude: number;
  degreeInSign: number;

  nakshatra: NakshatraName;
  nakshatraIndex: number;
  nakshatraPada: number;

  lord: GrahaName;
}

/**
 * Saturn transit information.
 */
export interface SaturnTransitInfo {
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;

  signIndex: number;

  longitude: number;
  degreeInSign: number;

  retrograde: boolean;

  nakshatra: NakshatraName;
  nakshatraIndex: number;
  nakshatraPada: number;
}

/**
 * Sade Sati calculation.
 */
export interface SadeSatiAnalysis {
  active: boolean;

  phase: SadeSatiPhase;
  phaseLabel: SadeSatiPhaseLabel;
  phaseNumber: 0 | 1 | 2 | 3;

  natalMoonSign: ZodiacSign;
  natalMoonSignEnglish: ZodiacEnglishSign;
  natalMoonSignHindi: string;

  transitSaturnSign: ZodiacSign;
  transitSaturnSignEnglish: ZodiacEnglishSign;
  transitSaturnSignHindi: string;

  distanceFromMoon: number;
  saturnHouseFromMoon: number;

  natalMoon: NatalMoonInfo;
  transitSaturn: SaturnTransitInfo;
}

/**
 * Dhaiya calculation.
 */
export interface DhaiyaAnalysis {
  active: boolean;

  type: DhaiyaType;
  typeLabel: string;

  natalMoonSign: ZodiacSign;
  natalMoonSignEnglish: ZodiacEnglishSign;
  natalMoonSignHindi: string;

  transitSaturnSign: ZodiacSign;
  transitSaturnSignEnglish: ZodiacEnglishSign;
  transitSaturnSignHindi: string;

  distanceFromMoon: number;
  saturnHouseFromMoon: number;

  natalMoon: NatalMoonInfo;
  transitSaturn: SaturnTransitInfo;
}

/**
 * Complete Saturn analysis.
 */
export interface SaturnTransitAnalysis {
  date: Date;

  status: SaturnTransitStatus;
  statusLabel: string;

  sadeSati: SadeSatiAnalysis;
  dhaiya: DhaiyaAnalysis;

  natalMoon: NatalMoonInfo;
  transitSaturn: SaturnTransitInfo;

  saturnHouseFromMoon: number;

  summary: string;
}

/**
 * Birth details.
 */
export interface SadeSatiBirthDetails {
  date: Date | string | number;
  location?: PanchangLocation;
}

/**
 * Date range status.
 */
export interface SadeSatiDateStatus {
  date: Date;

  active: boolean;

  phase: SadeSatiPhase;
  phaseLabel: SadeSatiPhaseLabel;

  saturnSign: ZodiacSign;
  saturnSignEnglish: ZodiacEnglishSign;

  saturnHouseFromMoon: number;
}

/**
 * Rashi-wise Sade Sati reference.
 */
export interface SadeSatiRashiInfo {
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;

  firstPhaseSaturnSign: ZodiacSign;
  peakPhaseSaturnSign: ZodiacSign;
  thirdPhaseSaturnSign: ZodiacSign;

  firstPhaseHouse: 12;
  peakPhaseHouse: 1;
  thirdPhaseHouse: 2;
}

/**
 * Phase metadata.
 */
export interface SadeSatiPhaseInfo {
  phase: SadeSatiPhase;
  phaseNumber: 0 | 1 | 2 | 3;

  label: SadeSatiPhaseLabel;

  houseFromMoon: 0 | 12 | 1 | 2;

  description: string;

  keywords: readonly string[];
}

/* ============================================================================
 * PAN-INDIA TRUST / PERSONALIZATION TYPES
 * ========================================================================== */

export interface SadeSatiTrustMetadata {
  system: "Vedic";
  planet: "Saturn";
  reference: "natal-moon";

  zodiac: "sidereal";
  ayanamsha: "lahiri";

  sadeSatiHouses: readonly number[];
  dhaiyaHouses: readonly number[];

  exactIngressDates: false;

  locationUsed?: PanchangLocation;
  locationLabel: string;

  confidence: SadeSatiConfidence;
  relevance: SadeSatiRelevance;

  calculationBasis: string;

  trustNote: string;
  interpretationNote: string;
}

export interface PersonalizedSadeSatiSummary
  extends SadeSatiSummary {
  relevance: SadeSatiRelevance;
  relevanceLabel: string;

  locationLabel: string;

  trust: SadeSatiTrustMetadata;

  personalizationMessage: string;
}

export interface PersonalizedSaturnTransitAnalysis
  extends SaturnTransitAnalysis {
  relevance: SadeSatiRelevance;
  relevanceLabel: string;

  locationLabel: string;

  trust: SadeSatiTrustMetadata;

  personalizationMessage: string;
}

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

export const SADE_SATI_APPROX_YEARS = 7.5;

export const SADE_SATI_APPROX_PHASE_YEARS = 2.5;

export const SADE_SATI_HOUSES = [
  12,
  1,
  2,
] as const;

export const DHAIYA_HOUSES = [
  4,
  8,
] as const;

export const SADE_SATI_PHASES: readonly SadeSatiPhaseInfo[] = [
  {
    phase: "none",
    phaseNumber: 0,
    label: "Not Active",
    houseFromMoon: 0,
    description:
      "Saturn is not currently in the traditional Sade Sati zone from the natal Moon.",
    keywords: [
      "normal",
      "outside-sade-sati",
    ],
  },
  {
    phase: "rising",
    phaseNumber: 1,
    label: "First Phase",
    houseFromMoon: 12,
    description:
      "Saturn is transiting the 12th sign from the natal Moon.",
    keywords: [
      "transition",
      "expenses",
      "detachment",
      "responsibility",
    ],
  },
  {
    phase: "peak",
    phaseNumber: 2,
    label: "Peak Phase",
    houseFromMoon: 1,
    description:
      "Saturn is transiting the natal Moon sign itself.",
    keywords: [
      "discipline",
      "responsibility",
      "pressure",
      "maturity",
    ],
  },
  {
    phase: "setting",
    phaseNumber: 3,
    label: "Third Phase",
    houseFromMoon: 2,
    description:
      "Saturn is transiting the 2nd sign from the natal Moon.",
    keywords: [
      "finances",
      "family",
      "speech",
      "consolidation",
    ],
  },
] as const;

export const DHAIYA_TYPE_LABELS: Readonly<
  Record<DhaiyaType, string>
> = {
  "4th-from-moon": "4th House Dhaiya",
  "8th-from-moon": "8th House Dhaiya",
  none: "No Dhaiya",
};

export const SADE_SATI_SIGN_OFFSETS = {
  rising: -1,
  peak: 0,
  setting: 1,
} as const;

/**
 * Public trust statement used throughout DharmYatra UI.
 */
export const SADE_SATI_TRUST_NOTE =
  "DharmYatra calculates Sade Sati and Dhaiya from astronomical planetary positions using a Lahiri sidereal framework and the natal Moon sign. Results depend on accurate birth data and the selected calculation date. Traditional interpretation can vary by parampara and astrologer.";

export const SADE_SATI_INTERPRETATION_NOTE =
  "Sade Sati and Dhaiya are traditional Vedic astrology frameworks. Their interpretations are not scientifically validated predictions. DharmYatra presents calculation data separately from traditional guidance so users can understand what is calculated and what is interpretive.";

export const SADE_SATI_LOCATION_NOTE =
  "For Sade Sati itself, the natal Moon sign is the primary reference. Birth location is retained for calculation transparency and future chart-based personalization; changing location can matter when other horoscope factors such as Lagna and houses are included.";

/* ============================================================================
 * INTERNAL HELPERS
 * ========================================================================== */

function ensureDate(
  value: Date | string | number,
): Date {
  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid Sade Sati date: ${String(value)}`,
    );
  }

  return date;
}

function positiveModulo(
  value: number,
  divisor: number,
): number {
  return (
    ((value % divisor) + divisor) % divisor
  );
}

function ensureZodiacSign(
  sign: ZodiacSign,
): ZodiacSign {
  if (!ZODIAC_SIGNS.includes(sign)) {
    throw new Error(
      `Invalid zodiac sign: ${String(sign)}`,
    );
  }

  return sign;
}

function getSignIndex(
  sign: ZodiacSign,
): number {
  ensureZodiacSign(sign);

  const index =
    ZODIAC_SIGNS.indexOf(sign);

  if (index < 0) {
    throw new Error(
      `Unable to determine zodiac sign index: ${sign}`,
    );
  }

  return index;
}

function getSignAtIndex(
  index: number,
): ZodiacSign {
  return ZODIAC_SIGNS[
    positiveModulo(index, 12)
  ];
}

function getPhaseNumber(
  phase: SadeSatiPhase,
): 0 | 1 | 2 | 3 {
  switch (phase) {
    case "rising":
      return 1;

    case "peak":
      return 2;

    case "setting":
      return 3;

    default:
      return 0;
  }
}

export function getSadeSatiPhaseLabel(
  phase: SadeSatiPhase,
): SadeSatiPhaseLabel {
  switch (phase) {
    case "rising":
      return "First Phase";

    case "peak":
      return "Peak Phase";

    case "setting":
      return "Third Phase";

    default:
      return "Not Active";
  }
}

export function getSadeSatiPhaseInfo(
  phase: SadeSatiPhase,
): SadeSatiPhaseInfo {
  const result =
    SADE_SATI_PHASES.find(
      (item) => item.phase === phase,
    );

  if (!result) {
    throw new Error(
      `Unknown Sade Sati phase: ${phase}`,
    );
  }

  return result;
}

/**
 * Build complete natal Moon information.
 */
function getMoonInfo(
  birthDateInput: Date | string | number,
): NatalMoonInfo {
  const birthDate =
    ensureDate(birthDateInput);

  const moon =
    getMoonSign(birthDate);

  const sign =
    ensureZodiacSign(moon.sign);

  return {
    sign,

    signEnglish:
      getRashiNameEnglish(sign),

    signHindi:
      getRashiNameHindi(sign),

    signIndex:
      getSignIndex(sign),

    longitude:
      moon.longitude,

    degreeInSign:
      moon.degreeInSign,

    nakshatra:
      moon.nakshatra,

    nakshatraIndex:
      moon.nakshatraIndex,

    nakshatraPada:
      moon.pada,

    lord:
      getRashiLord(sign),
  };
}

/**
 * Build complete Saturn transit information.
 */
function getSaturnInfo(
  dateInput: Date | string | number,
): SaturnTransitInfo {
  const date =
    ensureDate(dateInput);

  const saturn =
    getPlanetPosition(
      "Saturn",
      date,
    );

  const sign =
    ensureZodiacSign(saturn.sign);

  return {
    sign,

    signEnglish:
      getRashiNameEnglish(sign),

    signHindi:
      getRashiNameHindi(sign),

    signIndex:
      getSignIndex(sign),

    longitude:
      saturn.longitude,

    degreeInSign:
      saturn.degreeInSign,

    retrograde:
      Boolean(saturn.retrograde),

    nakshatra:
      saturn.nakshatra,

    nakshatraIndex:
      saturn.nakshatraIndex,

    nakshatraPada:
      saturn.pada,
  };
}

function phaseFromDistance(
  distance: number,
): SadeSatiPhase {
  switch (distance) {
    case 12:
      return "rising";

    case 1:
      return "peak";

    case 2:
      return "setting";

    default:
      return "none";
  }
}

function dhaiyaTypeFromDistance(
  distance: number,
): DhaiyaType {
  switch (distance) {
    case 4:
      return "4th-from-moon";

    case 8:
      return "8th-from-moon";

    default:
      return "none";
  }
}

function getOverallStatus(
  sadeSatiActive: boolean,
  dhaiyaActive: boolean,
): SaturnTransitStatus {
  if (sadeSatiActive) {
    return "sade-sati";
  }

  if (dhaiyaActive) {
    return "dhaiya";
  }

  return "normal";
}

function buildSummary(
  status: SaturnTransitStatus,
  sadeSati: SadeSatiAnalysis,
  dhaiya: DhaiyaAnalysis,
): string {
  if (status === "sade-sati") {
    return (
      `Shani Sade Sati active — ${sadeSati.phaseLabel}. ` +
      `Saturn is ${sadeSati.saturnHouseFromMoon}th ` +
      `from the natal Moon sign.`
    );
  }

  if (status === "dhaiya") {
    return (
      `Shani Dhaiya active — ${dhaiya.typeLabel}. ` +
      `Saturn is ${dhaiya.saturnHouseFromMoon}th ` +
      `from the natal Moon sign.`
    );
  }

  return (
    "Saturn is currently outside the traditional " +
    "Sade Sati and Dhaiya zones from the natal Moon."
  );
}

/* ============================================================================
 * SIGN-ONLY OBJECT BUILDERS
 * ========================================================================== */

function buildMoonInfoFromSign(
  sign: ZodiacSign,
): NatalMoonInfo {
  const normalized =
    ensureZodiacSign(sign);

  const signIndex =
    getSignIndex(normalized);

  return {
    sign: normalized,

    signEnglish:
      getRashiNameEnglish(normalized),

    signHindi:
      getRashiNameHindi(normalized),

    signIndex,

    longitude:
      signIndex * 30,

    degreeInSign: 0,

    /**
     * Sign-only calculations do not know actual Moon Nakshatra.
     * These values are structural placeholders and MUST NOT be presented
     * as the actual natal Nakshatra.
     */
    nakshatra: "Ashwini",
    nakshatraIndex: 0,
    nakshatraPada: 1,

    lord:
      getRashiLord(normalized),
  };
}

function buildSaturnInfoFromSign(
  sign: ZodiacSign,
): SaturnTransitInfo {
  const normalized =
    ensureZodiacSign(sign);

  const signIndex =
    getSignIndex(normalized);

  return {
    sign: normalized,

    signEnglish:
      getRashiNameEnglish(normalized),

    signHindi:
      getRashiNameHindi(normalized),

    signIndex,

    longitude:
      signIndex * 30,

    degreeInSign: 0,

    retrograde: false,

    /**
     * Sign-only calculation does not know actual Saturn Nakshatra.
     * Structural placeholders only.
     */
    nakshatra: "Ashwini",
    nakshatraIndex: 0,
    nakshatraPada: 1,
  };
}

/* ============================================================================
 * BASIC SIGN CALCULATIONS
 * ========================================================================== */

export function analyzeSadeSati(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): SadeSatiAnalysis {
  const natalSign =
    ensureZodiacSign(natalMoonSign);

  const transitSign =
    ensureZodiacSign(transitSaturnSign);

  const distance =
    getSignDistance(
      natalSign,
      transitSign,
    );

  const phase =
    phaseFromDistance(distance);

  return {
    active:
      phase !== "none",

    phase,

    phaseLabel:
      getSadeSatiPhaseLabel(phase),

    phaseNumber:
      getPhaseNumber(phase),

    natalMoonSign:
      natalSign,

    natalMoonSignEnglish:
      getRashiNameEnglish(natalSign),

    natalMoonSignHindi:
      getRashiNameHindi(natalSign),

    transitSaturnSign:
      transitSign,

    transitSaturnSignEnglish:
      getRashiNameEnglish(transitSign),

    transitSaturnSignHindi:
      getRashiNameHindi(transitSign),

    distanceFromMoon:
      distance,

    saturnHouseFromMoon:
      distance,

    natalMoon:
      buildMoonInfoFromSign(natalSign),

    transitSaturn:
      buildSaturnInfoFromSign(transitSign),
  };
}

export function analyzeDhaiya(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): DhaiyaAnalysis {
  const natalSign =
    ensureZodiacSign(natalMoonSign);

  const transitSign =
    ensureZodiacSign(transitSaturnSign);

  const distance =
    getSignDistance(
      natalSign,
      transitSign,
    );

  const type =
    dhaiyaTypeFromDistance(distance);

  return {
    active:
      type !== "none",

    type,

    typeLabel:
      DHAIYA_TYPE_LABELS[type],

    natalMoonSign:
      natalSign,

    natalMoonSignEnglish:
      getRashiNameEnglish(natalSign),

    natalMoonSignHindi:
      getRashiNameHindi(natalSign),

    transitSaturnSign:
      transitSign,

    transitSaturnSignEnglish:
      getRashiNameEnglish(transitSign),

    transitSaturnSignHindi:
      getRashiNameHindi(transitSign),

    distanceFromMoon:
      distance,

    saturnHouseFromMoon:
      distance,

    natalMoon:
      buildMoonInfoFromSign(natalSign),

    transitSaturn:
      buildSaturnInfoFromSign(transitSign),
  };
}

/* ============================================================================
 * BIRTH DATE ANALYSIS
 * ========================================================================== */

export function calculateSadeSatiAnalysis(
  birthDateInput: Date | string | number,
  transitDateInput: Date | string | number = new Date(),
): SadeSatiAnalysis {
  const birthDate =
    ensureDate(birthDateInput);

  const transitDate =
    ensureDate(transitDateInput);

  const moon =
    getMoonSign(birthDate);

  const saturn =
    getPlanetPosition(
      "Saturn",
      transitDate,
    );

  return buildSadeSatiAnalysis(
    moon,
    saturn,
  );
}

function buildSadeSatiAnalysis(
  moon: ReturnType<typeof getMoonSign>,
  saturn: ReturnType<typeof getPlanetPosition>,
): SadeSatiAnalysis {
  const natalMoonInfo: NatalMoonInfo = {
    sign:
      moon.sign,

    signEnglish:
      moon.signEnglish,

    signHindi:
      getRashiNameHindi(moon.sign),

    signIndex:
      getSignIndex(moon.sign),

    longitude:
      moon.longitude,

    degreeInSign:
      moon.degreeInSign,

    nakshatra:
      moon.nakshatra,

    nakshatraIndex:
      moon.nakshatraIndex,

    nakshatraPada:
      moon.pada,

    lord:
      getRashiLord(moon.sign),
  };

  const saturnInfo: SaturnTransitInfo = {
    sign:
      saturn.sign,

    signEnglish:
      saturn.signEnglish,

    signHindi:
      getRashiNameHindi(saturn.sign),

    signIndex:
      getSignIndex(saturn.sign),

    longitude:
      saturn.longitude,

    degreeInSign:
      saturn.degreeInSign,

    retrograde:
      Boolean(saturn.retrograde),

    nakshatra:
      saturn.nakshatra,

    nakshatraIndex:
      saturn.nakshatraIndex,

    nakshatraPada:
      saturn.pada,
  };

  const distance =
    getSignDistance(
      moon.sign,
      saturn.sign,
    );

  const phase =
    phaseFromDistance(distance);

  return {
    active:
      phase !== "none",

    phase,

    phaseLabel:
      getSadeSatiPhaseLabel(phase),

    phaseNumber:
      getPhaseNumber(phase),

    natalMoonSign:
      moon.sign,

    natalMoonSignEnglish:
      moon.signEnglish,

    natalMoonSignHindi:
      getRashiNameHindi(moon.sign),

    transitSaturnSign:
      saturn.sign,

    transitSaturnSignEnglish:
      saturn.signEnglish,

    transitSaturnSignHindi:
      getRashiNameHindi(saturn.sign),

    distanceFromMoon:
      distance,

    saturnHouseFromMoon:
      distance,

    natalMoon:
      natalMoonInfo,

    transitSaturn:
      saturnInfo,
  };
}

export function calculateDhaiyaAnalysis(
  birthDateInput: Date | string | number,
  transitDateInput: Date | string | number = new Date(),
): DhaiyaAnalysis {
  const birthDate =
    ensureDate(birthDateInput);

  const transitDate =
    ensureDate(transitDateInput);

  const moon =
    getMoonSign(birthDate);

  const saturn =
    getPlanetPosition(
      "Saturn",
      transitDate,
    );

  return buildDhaiyaAnalysis(
    moon,
    saturn,
  );
}

function buildDhaiyaAnalysis(
  moon: ReturnType<typeof getMoonSign>,
  saturn: ReturnType<typeof getPlanetPosition>,
): DhaiyaAnalysis {
  const natalMoonInfo: NatalMoonInfo = {
    sign:
      moon.sign,

    signEnglish:
      moon.signEnglish,

    signHindi:
      getRashiNameHindi(moon.sign),

    signIndex:
      getSignIndex(moon.sign),

    longitude:
      moon.longitude,

    degreeInSign:
      moon.degreeInSign,

    nakshatra:
      moon.nakshatra,

    nakshatraIndex:
      moon.nakshatraIndex,

    nakshatraPada:
      moon.pada,

    lord:
      getRashiLord(moon.sign),
  };

  const saturnInfo: SaturnTransitInfo = {
    sign:
      saturn.sign,

    signEnglish:
      saturn.signEnglish,

    signHindi:
      getRashiNameHindi(saturn.sign),

    signIndex:
      getSignIndex(saturn.sign),

    longitude:
      saturn.longitude,

    degreeInSign:
      saturn.degreeInSign,

    retrograde:
      Boolean(saturn.retrograde),

    nakshatra:
      saturn.nakshatra,

    nakshatraIndex:
      saturn.nakshatraIndex,

    nakshatraPada:
      saturn.pada,
  };

  const distance =
    getSignDistance(
      moon.sign,
      saturn.sign,
    );

  const type =
    dhaiyaTypeFromDistance(distance);

  return {
    active:
      type !== "none",

    type,

    typeLabel:
      DHAIYA_TYPE_LABELS[type],

    natalMoonSign:
      moon.sign,

    natalMoonSignEnglish:
      moon.signEnglish,

    natalMoonSignHindi:
      getRashiNameHindi(moon.sign),

    transitSaturnSign:
      saturn.sign,

    transitSaturnSignEnglish:
      saturn.signEnglish,

    transitSaturnSignHindi:
      getRashiNameHindi(saturn.sign),

    distanceFromMoon:
      distance,

    saturnHouseFromMoon:
      distance,

    natalMoon:
      natalMoonInfo,

    transitSaturn:
      saturnInfo,
  };
}

/* ============================================================================
 * COMPLETE SATURN ANALYSIS
 * ========================================================================== */

export function calculateSaturnTransitAnalysis(
  birthDateInput: Date | string | number,
  transitDateInput: Date | string | number = new Date(),
): SaturnTransitAnalysis {
  const birthDate =
    ensureDate(birthDateInput);

  const transitDate =
    ensureDate(transitDateInput);

  const moon =
    getMoonSign(birthDate);

  const saturn =
    getPlanetPosition(
      "Saturn",
      transitDate,
    );

  const sadeSati =
    buildSadeSatiAnalysis(
      moon,
      saturn,
    );

  const dhaiya =
    buildDhaiyaAnalysis(
      moon,
      saturn,
    );

  const status =
    getOverallStatus(
      sadeSati.active,
      dhaiya.active,
    );

  return {
    date:
      transitDate,

    status,

    statusLabel:
      getSaturnTransitStatusLabel(status),

    sadeSati,

    dhaiya,

    natalMoon:
      sadeSati.natalMoon,

    transitSaturn:
      sadeSati.transitSaturn,

    saturnHouseFromMoon:
      sadeSati.saturnHouseFromMoon,

    summary:
      buildSummary(
        status,
        sadeSati,
        dhaiya,
      ),
  };
}

export function calculateCurrentSaturnTransit(
  birthDateInput: Date | string | number,
): SaturnTransitAnalysis {
  return calculateSaturnTransitAnalysis(
    birthDateInput,
    new Date(),
  );
}

export function getSaturnTransitStatusLabel(
  status: SaturnTransitStatus,
): string {
  switch (status) {
    case "sade-sati":
      return "Shani Sade Sati";

    case "dhaiya":
      return "Shani Dhaiya";

    default:
      return "Normal Saturn Transit";
  }
}

/* ============================================================================
 * ASTROLOGY ENGINE COMPATIBILITY
 * ========================================================================== */

export function getCurrentSadeSati(
  birthDateInput: Date | string | number,
  transitDateInput: Date | string | number = new Date(),
) {
  return calculateCurrentSadeSati(
    birthDateInput,
    transitDateInput,
  );
}

export function getCurrentDhaiya(
  birthDateInput: Date | string | number,
  transitDateInput: Date | string | number = new Date(),
) {
  return calculateCurrentDhaiya(
    birthDateInput,
    transitDateInput,
  );
}

export function getSadeSatiBySigns(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
) {
  return calculateSadeSati(
    natalMoonSign,
    transitSaturnSign,
  );
}

export function getDhaiyaBySigns(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
) {
  return calculateDhaiya(
    natalMoonSign,
    transitSaturnSign,
  );
}

/* ============================================================================
 * HOUSE / ZONE HELPERS
 * ========================================================================== */

export function getSaturnHouseFromNatalMoon(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): number {
  return getSignDistance(
    natalMoonSign,
    transitSaturnSign,
  );
}

export function isSadeSatiActiveBySigns(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): boolean {
  return isSadeSatiHouse(
    getSignDistance(
      natalMoonSign,
      transitSaturnSign,
    ),
  );
}

export function isDhaiyaActiveBySigns(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): boolean {
  return isDhaiyaHouse(
    getSignDistance(
      natalMoonSign,
      transitSaturnSign,
    ),
  );
}

export function getSadeSatiPhaseBySigns(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): SadeSatiPhase {
  return phaseFromDistance(
    getSignDistance(
      natalMoonSign,
      transitSaturnSign,
    ),
  );
}

export function getDhaiyaTypeBySigns(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): DhaiyaType {
  return dhaiyaTypeFromDistance(
    getSignDistance(
      natalMoonSign,
      transitSaturnSign,
    ),
  );
}

/* ============================================================================
 * RASHI-WISE SADE SATI
 * ========================================================================== */

export function getSadeSatiRashiInfo(
  moonSign: ZodiacSign,
): SadeSatiRashiInfo {
  const sign =
    ensureZodiacSign(moonSign);

  const index =
    getSignIndex(sign);

  return {
    sign,

    signEnglish:
      getRashiNameEnglish(sign),

    signHindi:
      getRashiNameHindi(sign),

    firstPhaseSaturnSign:
      getSignAtIndex(
        index +
          SADE_SATI_SIGN_OFFSETS.rising,
      ),

    peakPhaseSaturnSign:
      getSignAtIndex(
        index +
          SADE_SATI_SIGN_OFFSETS.peak,
      ),

    thirdPhaseSaturnSign:
      getSignAtIndex(
        index +
          SADE_SATI_SIGN_OFFSETS.setting,
      ),

    firstPhaseHouse: 12,

    peakPhaseHouse: 1,

    thirdPhaseHouse: 2,
  };
}

export function getAllSadeSatiRashiInfo(): SadeSatiRashiInfo[] {
  return ZODIAC_SIGNS.map(
    (sign) =>
      getSadeSatiRashiInfo(sign),
  );
}

export function getRashisCurrentlyUnderSadeSati(
  transitSaturnSign: ZodiacSign,
): ZodiacSign[] {
  const transitIndex =
    getSignIndex(
      transitSaturnSign,
    );

  return ZODIAC_SIGNS.filter(
    (moonSign) => {
      const moonIndex =
        getSignIndex(moonSign);

      const distance =
        positiveModulo(
          transitIndex -
            moonIndex,
          12,
        ) + 1;

      return (
        distance === 12 ||
        distance === 1 ||
        distance === 2
      );
    },
  );
}

export function getRashisCurrentlyUnderDhaiya(
  transitSaturnSign: ZodiacSign,
): ZodiacSign[] {
  const transitIndex =
    getSignIndex(
      transitSaturnSign,
    );

  return ZODIAC_SIGNS.filter(
    (moonSign) => {
      const moonIndex =
        getSignIndex(moonSign);

      const distance =
        positiveModulo(
          transitIndex -
            moonIndex,
          12,
        ) + 1;

      return (
        distance === 4 ||
        distance === 8
      );
    },
  );
}

/* ============================================================================
 * DATE RANGE ANALYSIS
 * ========================================================================== */

export function getSadeSatiDateRange(
  birthDateInput: Date | string | number,
  startDateInput: Date | string | number,
  days: number,
): SadeSatiDateStatus[] {
  const birthDate =
    ensureDate(birthDateInput);

  const startDate =
    ensureDate(startDateInput);

  if (
    !Number.isInteger(days) ||
    days < 0
  ) {
    throw new Error(
      `days must be a non-negative integer. Received: ${days}`,
    );
  }

  const natalMoon =
    getMoonSign(birthDate);

  return Array.from(
    { length: days },
    (_, index) => {
      const date =
        new Date(
          startDate.getTime(),
        );

      date.setDate(
        date.getDate() + index,
      );

      const saturn =
        getPlanetPosition(
          "Saturn",
          date,
        );

      const distance =
        getSignDistance(
          natalMoon.sign,
          saturn.sign,
        );

      const phase =
        phaseFromDistance(distance);

      return {
        date,

        active:
          phase !== "none",

        phase,

        phaseLabel:
          getSadeSatiPhaseLabel(phase),

        saturnSign:
          saturn.sign,

        saturnSignEnglish:
          saturn.signEnglish,

        saturnHouseFromMoon:
          distance,
      };
    },
  );
}

export function getSadeSatiCheckpoints(
  birthDateInput: Date | string | number,
  startDateInput: Date | string | number,
  months: number,
): SadeSatiDateStatus[] {
  const birthDate =
    ensureDate(birthDateInput);

  const startDate =
    ensureDate(startDateInput);

  if (
    !Number.isInteger(months) ||
    months < 0
  ) {
    throw new Error(
      `months must be a non-negative integer. Received: ${months}`,
    );
  }

  const natalMoon =
    getMoonSign(birthDate);

  return Array.from(
    { length: months },
    (_, index) => {
      const date =
        new Date(
          startDate.getTime(),
        );

      date.setMonth(
        date.getMonth() + index,
      );

      const saturn =
        getPlanetPosition(
          "Saturn",
          date,
        );

      const distance =
        getSignDistance(
          natalMoon.sign,
          saturn.sign,
        );

      const phase =
        phaseFromDistance(distance);

      return {
        date,

        active:
          phase !== "none",

        phase,

        phaseLabel:
          getSadeSatiPhaseLabel(phase),

        saturnSign:
          saturn.sign,

        saturnSignEnglish:
          saturn.signEnglish,

        saturnHouseFromMoon:
          distance,
      };
    },
  );
}

/* ============================================================================
 * UI SUMMARIES
 * ========================================================================== */

export interface SadeSatiSummary {
  active: boolean;

  phase: SadeSatiPhase;
  phaseLabel: SadeSatiPhaseLabel;

  moonSign: ZodiacSign;
  moonSignEnglish: ZodiacEnglishSign;
  moonSignHindi: string;

  saturnSign: ZodiacSign;
  saturnSignEnglish: ZodiacEnglishSign;
  saturnSignHindi: string;

  houseFromMoon: number;

  retrograde: boolean;

  summary: string;
}

export function getSadeSatiSummary(
  birthDateInput: Date | string | number,
  transitDateInput: Date | string | number = new Date(),
): SadeSatiSummary {
  const analysis =
    calculateSadeSatiAnalysis(
      birthDateInput,
      transitDateInput,
    );

  return {
    active:
      analysis.active,

    phase:
      analysis.phase,

    phaseLabel:
      analysis.phaseLabel,

    moonSign:
      analysis.natalMoonSign,

    moonSignEnglish:
      analysis.natalMoonSignEnglish,

    moonSignHindi:
      analysis.natalMoonSignHindi,

    saturnSign:
      analysis.transitSaturnSign,

    saturnSignEnglish:
      analysis.transitSaturnSignEnglish,

    saturnSignHindi:
      analysis.transitSaturnSignHindi,

    houseFromMoon:
      analysis.saturnHouseFromMoon,

    retrograde:
      analysis.transitSaturn.retrograde,

    summary:
      analysis.active
        ? `Sade Sati is active in the ${analysis.phaseLabel.toLowerCase()}.`
        : "Sade Sati is not currently active.",
  };
}

export interface DhaiyaSummary {
  active: boolean;

  type: DhaiyaType;
  typeLabel: string;

  moonSign: ZodiacSign;
  moonSignEnglish: ZodiacEnglishSign;

  saturnSign: ZodiacSign;
  saturnSignEnglish: ZodiacEnglishSign;

  houseFromMoon: number;

  retrograde: boolean;
}

export function getDhaiyaSummary(
  birthDateInput: Date | string | number,
  transitDateInput: Date | string | number = new Date(),
): DhaiyaSummary {
  const analysis =
    calculateDhaiyaAnalysis(
      birthDateInput,
      transitDateInput,
    );

  return {
    active:
      analysis.active,

    type:
      analysis.type,

    typeLabel:
      analysis.typeLabel,

    moonSign:
      analysis.natalMoonSign,

    moonSignEnglish:
      analysis.natalMoonSignEnglish,

    saturnSign:
      analysis.transitSaturnSign,

    saturnSignEnglish:
      analysis.transitSaturnSignEnglish,

    houseFromMoon:
      analysis.saturnHouseFromMoon,

    retrograde:
      analysis.transitSaturn.retrograde,
  };
}

/* ============================================================================
 * CURRENT SATURN HELPERS
 * ========================================================================== */

export function getCurrentSaturnSign(
  dateInput: Date | string | number = new Date(),
): ZodiacSign {
  return getPlanetPosition(
    "Saturn",
    ensureDate(dateInput),
  ).sign;
}

export function getCurrentSaturnEnglishSign(
  dateInput: Date | string | number = new Date(),
): ZodiacEnglishSign {
  return getPlanetPosition(
    "Saturn",
    ensureDate(dateInput),
  ).signEnglish;
}

export function getCurrentSaturnDegree(
  dateInput: Date | string | number = new Date(),
): number {
  return getPlanetPosition(
    "Saturn",
    ensureDate(dateInput),
  ).degreeInSign;
}

export function isSaturnRetrograde(
  dateInput: Date | string | number = new Date(),
): boolean {
  return Boolean(
    getPlanetPosition(
      "Saturn",
      ensureDate(dateInput),
    ).retrograde,
  );
}

/* ============================================================================
 * INTERPRETATION
 * ========================================================================== */

export interface SadeSatiInterpretation {
  phase: SadeSatiPhase;

  title: string;
  description: string;

  focusAreas: readonly string[];
  guidance: readonly string[];
}

export function getSadeSatiInterpretation(
  phase: SadeSatiPhase,
): SadeSatiInterpretation {
  switch (phase) {
    case "rising":
      return {
        phase,

        title:
          "Sade Sati First Phase",

        description:
          "Traditionally associated with transition, restructuring, responsibilities, expenses and changes in priorities.",

        focusAreas: [
          "Financial planning",
          "Responsibilities",
          "Travel or relocation",
          "Emotional detachment",
          "Long-term planning",
        ],

        guidance: [
          "Maintain disciplined routines.",
          "Review unnecessary financial commitments.",
          "Prefer practical long-term decisions.",
          "Give adequate rest and recovery time.",
        ],
      };

    case "peak":
      return {
        phase,

        title:
          "Sade Sati Peak Phase",

        description:
          "Traditionally associated with increased responsibility, discipline, maturity and personal restructuring.",

        focusAreas: [
          "Personal discipline",
          "Career responsibility",
          "Mental resilience",
          "Healthy routines",
          "Long-term commitments",
        ],

        guidance: [
          "Prefer consistency over shortcuts.",
          "Keep important responsibilities organized.",
          "Avoid impulsive decisions.",
          "Build sustainable routines.",
        ],
      };

    case "setting":
      return {
        phase,

        title:
          "Sade Sati Third Phase",

        description:
          "Traditionally associated with consolidation, family responsibilities, financial discipline and completion of longer lessons.",

        focusAreas: [
          "Family",
          "Finances",
          "Communication",
          "Savings",
          "Consolidation",
        ],

        guidance: [
          "Keep financial planning disciplined.",
          "Communicate carefully.",
          "Complete pending responsibilities.",
          "Focus on stability rather than unnecessary risk.",
        ],
      };

    default:
      return {
        phase: "none",

        title:
          "Sade Sati Not Active",

        description:
          "Saturn is outside the traditional three-sign Sade Sati zone from the natal Moon.",

        focusAreas: [
          "Consistency",
          "Long-term planning",
          "Discipline",
        ],

        guidance: [
          "Continue building stable routines.",
          "Use patience and consistency as practical principles.",
        ],
      };
  }
}

/* ============================================================================
 * TRUST / PAN-INDIA PERSONALIZATION
 * ========================================================================== */

/**
 * Safely create a human-readable location label.
 */
export function getSadeSatiLocationLabel(
  location?: PanchangLocation,
): string {
  if (!location) {
    return "India / location not specified";
  }

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

  if (
    typeof location.name === "string" &&
    location.name.trim()
  ) {
    return location.name;
  }

  return "Selected Indian location";
}

/**
 * Determine personalization relevance.
 */
export function getSadeSatiRelevance(
  location?: PanchangLocation,
): SadeSatiRelevance {
  if (!location) {
    return "india";
  }

  if (
    typeof location.city === "string" &&
    location.city.trim()
  ) {
    return "selected-city";
  }

  if (
    typeof location.state === "string" &&
    location.state.trim()
  ) {
    return "selected-state";
  }

  return "india";
}

export function getSadeSatiRelevanceLabel(
  relevance: SadeSatiRelevance,
): string {
  switch (relevance) {
    case "birth-location":
      return "Birth Location Based";

    case "selected-city":
      return "Selected City";

    case "selected-state":
      return "Selected State";

    case "india":
    default:
      return "India";
  }
}

/**
 * Get trust metadata.
 */
export function getSadeSatiTrustMetadata(
  location?: PanchangLocation,
): SadeSatiTrustMetadata {
  const relevance =
    getSadeSatiRelevance(location);

  return {
    system: "Vedic",

    planet: "Saturn",

    reference: "natal-moon",

    zodiac: "sidereal",

    ayanamsha: "lahiri",

    sadeSatiHouses:
      SADE_SATI_HOUSES,

    dhaiyaHouses:
      DHAIYA_HOUSES,

    exactIngressDates:
      false,

    locationUsed:
      location,

    locationLabel:
      getSadeSatiLocationLabel(location),

    confidence:
      "high",

    relevance,

    calculationBasis:
      "Saturn sidereal Rashi relative to the natal Moon Rashi.",

    trustNote:
      SADE_SATI_TRUST_NOTE,

    interpretationNote:
      SADE_SATI_INTERPRETATION_NOTE,
  };
}

/**
 * Human-readable personalization explanation.
 */
export function getSadeSatiPersonalizationMessage(
  location?: PanchangLocation,
): string {
  const locationLabel =
    getSadeSatiLocationLabel(location);

  if (!location) {
    return (
      "Your Sade Sati result is primarily based on your natal Moon sign " +
      "and Saturn's sidereal transit. Add a precise birth location for " +
      "better overall horoscope personalization."
    );
  }

  return (
    `Your DharmYatra Saturn analysis is personalized using the selected ` +
    `location (${locationLabel}) together with your birth-date Moon sign ` +
    `and the selected transit date. Sade Sati itself is Moon-Rashi based; ` +
    `location becomes especially important when Lagna, houses and other ` +
    `chart factors are included.`
  );
}

/**
 * Get all supported Pan-India locations from the common astrology layer.
 *
 * This prevents Panchang, Astrology and Sade Sati from maintaining separate
 * city databases.
 */
export function getPanIndiaSadeSatiLocations(): PanchangLocation[] {
  return getPanIndiaAstrologyLocations();
}

/**
 * Search supported Indian location.
 */
export function findSadeSatiLocation(
  query: string,
): PanchangLocation | undefined {
  const normalized =
    String(query ?? "").trim();

  if (!normalized) {
    return undefined;
  }

  return findAstrologyLocation(
    normalized,
  );
}

/**
 * Check whether a location belongs to the supported Pan-India registry.
 */
export function isSupportedSadeSatiLocation(
  location?: PanchangLocation,
): boolean {
  if (!location) {
    return false;
  }

  const locations =
    getPanIndiaSadeSatiLocations();

  return locations.some(
    (item) => {
      if (
        location.id &&
        item.id &&
        location.id === item.id
      ) {
        return true;
      }

      const cityA =
        String(location.city ?? "").toLowerCase();

      const cityB =
        String(item.city ?? "").toLowerCase();

      const stateA =
        String(location.state ?? "").toLowerCase();

      const stateB =
        String(item.state ?? "").toLowerCase();

      return (
        cityA.length > 0 &&
        cityA === cityB &&
        stateA === stateB
      );
    },
  );
}

/**
 * Return a transparent calculation explanation for UI.
 */
export function getSadeSatiCalculationExplanation(): string[] {
  return [
    "Natal Moon Rashi is calculated from the supplied birth date/time.",
    "Saturn's current position is calculated from the astronomy engine.",
    "The zodiac reference is sidereal with Lahiri ayanamsha.",
    "Sade Sati uses Saturn in the 12th, 1st or 2nd sign from natal Moon.",
    "Dhaiya uses Saturn in the 4th or 8th sign from natal Moon.",
    "Exact Saturn ingress dates are not hard-coded in this module.",
    "Traditional interpretation is presented separately from calculation.",
  ];
}

/**
 * Build personalized Sade Sati summary.
 */
export function getPersonalizedSadeSatiSummary(
  birthDateInput: Date | string | number,
  location?: PanchangLocation,
  transitDateInput: Date | string | number = new Date(),
): PersonalizedSadeSatiSummary {
  const summary =
    getSadeSatiSummary(
      birthDateInput,
      transitDateInput,
    );

  const trust =
    getSadeSatiTrustMetadata(location);

  return {
    ...summary,

    relevance:
      trust.relevance,

    relevanceLabel:
      getSadeSatiRelevanceLabel(
        trust.relevance,
      ),

    locationLabel:
      trust.locationLabel,

    trust,

    personalizationMessage:
      getSadeSatiPersonalizationMessage(
        location,
      ),
  };
}

/**
 * Build personalized complete Saturn analysis.
 */
export function getPersonalizedSaturnTransitAnalysis(
  birthDateInput: Date | string | number,
  location?: PanchangLocation,
  transitDateInput: Date | string | number = new Date(),
): PersonalizedSaturnTransitAnalysis {
  const analysis =
    calculateSaturnTransitAnalysis(
      birthDateInput,
      transitDateInput,
    );

  const trust =
    getSadeSatiTrustMetadata(location);

  return {
    ...analysis,

    relevance:
      trust.relevance,

    relevanceLabel:
      getSadeSatiRelevanceLabel(
        trust.relevance,
      ),

    locationLabel:
      trust.locationLabel,

    trust,

    personalizationMessage:
      getSadeSatiPersonalizationMessage(
        location,
      ),
  };
}

/**
 * Get a UI-ready trust badge.
 */
export function getSadeSatiConfidenceLabel(
  confidence: SadeSatiConfidence,
): string {
  switch (confidence) {
    case "high":
      return "Astronomical calculation";

    case "medium":
      return "Calculation with limited input";

    case "limited":
    default:
      return "Limited calculation context";
  }
}

/**
 * Complete user-facing trust summary.
 */
export function getSadeSatiTrustSummary(
  location?: PanchangLocation,
): string {
  const metadata =
    getSadeSatiTrustMetadata(location);

  return (
    `${metadata.calculationBasis} ` +
    `Framework: ${metadata.ayanamsha} sidereal. ` +
    `Location: ${metadata.locationLabel}. ` +
    `Traditional interpretation may vary.`
  );
}

/* ============================================================================
 * METADATA / VALIDATION
 * ========================================================================== */

export interface SadeSatiCalculationMeta {
  system: "Vedic";
  reference: "natal-moon";
  planet: "Saturn";
  zodiac: "sidereal";
  ayanamsha: "lahiri";

  sadeSatiHouses: readonly number[];
  dhaiyaHouses: readonly number[];

  exactIngressDates: false;

  interpretationNote: string;
}

export function getSadeSatiCalculationMeta(): SadeSatiCalculationMeta {
  return {
    system: "Vedic",

    reference: "natal-moon",

    planet: "Saturn",

    zodiac: "sidereal",

    ayanamsha: "lahiri",

    sadeSatiHouses:
      SADE_SATI_HOUSES,

    dhaiyaHouses:
      DHAIYA_HOUSES,

    exactIngressDates:
      false,

    interpretationNote:
      SADE_SATI_INTERPRETATION_NOTE,
  };
}

export function isActiveSadeSatiPhase(
  phase: SadeSatiPhase,
): boolean {
  return phase !== "none";
}

export function getSaturnMoonDistance(
  natalMoonSign: ZodiacSign,
  transitSaturnSign: ZodiacSign,
): number {
  return getSignDistance(
    natalMoonSign,
    transitSaturnSign,
  );
}

export function isSadeSatiHouse(
  houseFromMoon: number,
): boolean {
  return (
    houseFromMoon === 12 ||
    houseFromMoon === 1 ||
    houseFromMoon === 2
  );
}

export function isDhaiyaHouse(
  houseFromMoon: number,
): boolean {
  return (
    houseFromMoon === 4 ||
    houseFromMoon === 8
  );
}

export function getSadeSatiPhaseFromHouse(
  houseFromMoon: number,
): SadeSatiPhase {
  switch (houseFromMoon) {
    case 12:
      return "rising";

    case 1:
      return "peak";

    case 2:
      return "setting";

    default:
      return "none";
  }
}

export function getDhaiyaTypeFromHouse(
  houseFromMoon: number,
): DhaiyaType {
  switch (houseFromMoon) {
    case 4:
      return "4th-from-moon";

    case 8:
      return "8th-from-moon";

    default:
      return "none";
  }
}

/* ============================================================================
 * DEFAULT EXPORT
 * ========================================================================== */

const sadheSati = {
  SADE_SATI_APPROX_YEARS,
  SADE_SATI_APPROX_PHASE_YEARS,

  SADE_SATI_HOUSES,
  DHAIYA_HOUSES,

  SADE_SATI_PHASES,
  DHAIYA_TYPE_LABELS,
  SADE_SATI_SIGN_OFFSETS,

  SADE_SATI_TRUST_NOTE,
  SADE_SATI_INTERPRETATION_NOTE,
  SADE_SATI_LOCATION_NOTE,

  analyzeSadeSati,
  analyzeDhaiya,

  calculateSadeSatiAnalysis,
  calculateDhaiyaAnalysis,
  calculateSaturnTransitAnalysis,
  calculateCurrentSaturnTransit,

  getCurrentSadeSati,
  getCurrentDhaiya,

  getSadeSatiBySigns,
  getDhaiyaBySigns,

  getSaturnHouseFromNatalMoon,

  isSadeSatiActiveBySigns,
  isDhaiyaActiveBySigns,

  getSadeSatiPhaseBySigns,
  getDhaiyaTypeBySigns,

  getSadeSatiRashiInfo,
  getAllSadeSatiRashiInfo,

  getRashisCurrentlyUnderSadeSati,
  getRashisCurrentlyUnderDhaiya,

  getSadeSatiDateRange,
  getSadeSatiCheckpoints,

  getSadeSatiSummary,
  getDhaiyaSummary,

  getCurrentSaturnSign,
  getCurrentSaturnEnglishSign,
  getCurrentSaturnDegree,
  isSaturnRetrograde,

  getSadeSatiPhaseLabel,
  getSadeSatiPhaseInfo,
  getSadeSatiInterpretation,

  getSaturnTransitStatusLabel,

  getSadeSatiCalculationMeta,

  isActiveSadeSatiPhase,
  getSaturnMoonDistance,
  isSadeSatiHouse,
  isDhaiyaHouse,

  getSadeSatiPhaseFromHouse,
  getDhaiyaTypeFromHouse,

  getSadeSatiLocationLabel,
  getSadeSatiRelevance,
  getSadeSatiRelevanceLabel,
  getSadeSatiTrustMetadata,

  getSadeSatiPersonalizationMessage,

  getPanIndiaSadeSatiLocations,
  findSadeSatiLocation,
  isSupportedSadeSatiLocation,

  getSadeSatiCalculationExplanation,

  getPersonalizedSadeSatiSummary,
  getPersonalizedSaturnTransitAnalysis,

  getSadeSatiConfidenceLabel,
  getSadeSatiTrustSummary,
};

export default sadheSati;