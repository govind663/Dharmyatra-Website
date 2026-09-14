// src/lib/kundli.ts

import {
  DEFAULT_LOCATION,
  getIndiaLocations,
  findIndiaLocation,
  type PanchangLocation,
} from "./panchang";

import {
  type PlanetName,
  type PlanetPosition,
  type ZodiacSign,
  type ZodiacEnglishSign,
  type NakshatraName,
  type HouseCusp,
  type KundliChart,
  type VimshottariDashaPeriod,

  calculateKundli,
  getPlanetPosition,
  getRashiLord,
  getRashiNameHindi,
  getRashiNameEnglish,
  getNakshatraLord,
  getKundliSummary,
  calculateVimshottariMahadasha,
  getMoonSign,
  getSunSign,
  getHouseForLongitude,
  getAstrologyTrustMetadata,
  getAstrologyPersonalizationMessage,
} from "./astrology";

/* =========================================================
   TYPES
========================================================= */

export interface BirthDetails {
  name?: string;
  date: string;
  time: string;
  location: PanchangLocation;
}

export interface KundliInput {
  name?: string;
  birthDate: Date | string | number;
  birthTime?: string;
  location?: PanchangLocation;
}

export interface KundliPlanetData extends PlanetPosition {
  house: number;
  houseLabel: string;
  signHindi: string;
  signEnglish: ZodiacEnglishSign;
  nakshatraLord: PlanetName;
}

export interface KundliHouseData extends HouseCusp {
  houseLabel: string;
  lord: PlanetName;
  occupants: PlanetName[];
}

export interface KundliDashaData {
  mahadasha: VimshottariDashaPeriod;
  isCurrent: boolean;
  remainingDays: number;
}

export interface KundliCompatibilitySummary {
  moonSign: ZodiacSign;
  moonSignEnglish: ZodiacEnglishSign;
  moonNakshatra: NakshatraName;
  moonNakshatraPada: number;
}

export interface ManglikResult {
  isManglik: boolean;
  house: number;
  reason: string;
}

export interface KundliTrustMetadata {
  engine: "astronomy-engine";
  ayanamsha: "lahiri";
  zodiac: "sidereal";
  nodeModel: "mean";
  houseSystem: "whole-sign";
  locationUsed: PanchangLocation;
  locationLabel: string;
  confidence: "high" | "medium" | "limited";
  precision: "astronomical-calculation";
  calculationBasis: string;
  trustNote: string;
  interpretationNote: string;
}

export type KundliRelevance =
  | "personal"
  | "selected-city"
  | "selected-state"
  | "pan-india";

export interface KundliPersonalization {
  relevance: KundliRelevance;
  relevanceLabel: string;
  locationLabel: string;
  state?: string;
  region?: string;
  personalizationMessage: string;
  trust: KundliTrustMetadata;
}

export interface KundliChartData {
  birth: BirthDetails;
  chart: KundliChart;

  planets: KundliPlanetData[];
  planetMap: Record<
    PlanetName,
    KundliPlanetData | undefined
  >;

  houses: KundliHouseData[];

  currentMahadasha?: KundliDashaData;
  mahadashas: VimshottariDashaPeriod[];

  manglik: ManglikResult;

  summary: ReturnType<typeof getKundliSummary>;
  trust: KundliTrustMetadata;
  personalization: KundliPersonalization;
}

export interface PlanetDisplayInfo {
  planet: PlanetName;
  label: string;
  hindi: string;
  abbreviated: string;
}

export interface HouseDisplayInfo {
  house: number;
  label: string;
  hindi: string;
}

export interface LagnaData {
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;
  degree: number;
  nakshatra: NakshatraName;
  pada: number;
  lord: PlanetName;
}

export interface KundliQuickProfile {
  lagna: {
    sign: ZodiacSign;
    english: ZodiacEnglishSign;
    hindi: string;
    lord: PlanetName;
  };

  moon: {
    sign: ZodiacSign;
    english: ZodiacEnglishSign;
    hindi: string;
    nakshatra: NakshatraName;
    pada: number;
  };

  sun: {
    sign: ZodiacSign;
    english: ZodiacEnglishSign;
    hindi: string;
  };

  manglik: boolean;

  retrogradePlanets: PlanetName[];
}

/* =========================================================
   CONSTANTS
========================================================= */

export const KUNDLI_PLANETS: readonly Exclude<
  PlanetName,
  "Ascendant"
>[] = [
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

export const HOUSE_NAMES_ENGLISH: readonly string[] = [
  "1st House",
  "2nd House",
  "3rd House",
  "4th House",
  "5th House",
  "6th House",
  "7th House",
  "8th House",
  "9th House",
  "10th House",
  "11th House",
  "12th House",
] as const;

export const HOUSE_NAMES_HINDI: readonly string[] = [
  "प्रथम भाव",
  "द्वितीय भाव",
  "तृतीय भाव",
  "चतुर्थ भाव",
  "पंचम भाव",
  "षष्ठ भाव",
  "सप्तम भाव",
  "अष्टम भाव",
  "नवम भाव",
  "दशम भाव",
  "एकादश भाव",
  "द्वादश भाव",
] as const;

export const KENDRA_HOUSES = [
  1,
  4,
  7,
  10,
] as const;

export const TRIKONA_HOUSES = [
  1,
  5,
  9,
] as const;

export const MANGALIK_HOUSES = [
  1,
  4,
  7,
  8,
  12,
] as const;

export const PLANET_DISPLAY: Record<
  Exclude<PlanetName, "Ascendant">,
  PlanetDisplayInfo
> = {
  Sun: {
    planet: "Sun",
    label: "Sun",
    hindi: "सूर्य",
    abbreviated: "Su",
  },

  Moon: {
    planet: "Moon",
    label: "Moon",
    hindi: "चंद्र",
    abbreviated: "Mo",
  },

  Mars: {
    planet: "Mars",
    label: "Mars",
    hindi: "मंगल",
    abbreviated: "Ma",
  },

  Mercury: {
    planet: "Mercury",
    label: "Mercury",
    hindi: "बुध",
    abbreviated: "Me",
  },

  Jupiter: {
    planet: "Jupiter",
    label: "Jupiter",
    hindi: "गुरु",
    abbreviated: "Ju",
  },

  Venus: {
    planet: "Venus",
    label: "Venus",
    hindi: "शुक्र",
    abbreviated: "Ve",
  },

  Saturn: {
    planet: "Saturn",
    label: "Saturn",
    hindi: "शनि",
    abbreviated: "Sa",
  },

  Rahu: {
    planet: "Rahu",
    label: "Rahu",
    hindi: "राहु",
    abbreviated: "Ra",
  },

  Ketu: {
    planet: "Ketu",
    label: "Ketu",
    hindi: "केतु",
    abbreviated: "Ke",
  },
};

/* =========================================================
   BASIC NORMALIZATION HELPERS
========================================================= */

function normalizeString(
  value: unknown,
): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function isFiniteNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

/* =========================================================
   DATE VALIDATION
========================================================= */

export function isValidBirthDate(
  value: Date | string | number,
): boolean {
  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    Number.isFinite(date.getTime())
  );
}

export function isValidBirthTime(
  time?: string,
): boolean {
  if (!time) {
    return false;
  }

  const normalized = normalizeString(time);

  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    normalized,
  );
}

/* =========================================================
   LOCATION VALIDATION
========================================================= */

export function isValidKundliLocation(
  location?: PanchangLocation,
): boolean {
  if (!location) {
    return false;
  }

  return (
    isFiniteNumber(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    isFiniteNumber(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

/* =========================================================
   COMPLETE BIRTH DETAILS VALIDATION
========================================================= */

export function validateBirthDetails(
  details: BirthDetails,
): string[] {
  const errors: string[] = [];

  const dateValue =
    normalizeString(details?.date);

  const timeValue =
    normalizeString(details?.time);

  if (!dateValue) {
    errors.push(
      "Birth date is required.",
    );
  } else if (
    !isValidBirthDate(dateValue)
  ) {
    errors.push(
      "Birth date is invalid.",
    );
  }

  if (!timeValue) {
    errors.push(
      "Birth time is required.",
    );
  } else if (
    !isValidBirthTime(timeValue)
  ) {
    errors.push(
      "Birth time must be in HH:mm format.",
    );
  }

  if (!details?.location) {
    errors.push(
      "Birth location is required.",
    );
  } else {
    if (
      !isFiniteNumber(
        details.location.latitude,
      ) ||
      details.location.latitude < -90 ||
      details.location.latitude > 90
    ) {
      errors.push(
        "Birth latitude is invalid.",
      );
    }

    if (
      !isFiniteNumber(
        details.location.longitude,
      ) ||
      details.location.longitude < -180 ||
      details.location.longitude > 180
    ) {
      errors.push(
        "Birth longitude is invalid.",
      );
    }
  }

  return errors;
}

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

/**
 * Converts the supplied birth date and optional birth time
 * into a JavaScript Date instance.
 *
 * IMPORTANT:
 * The application currently relies on the browser/runtime
 * timezone when combining a calendar date with HH:mm.
 *
 * For exact historical timezone/DST calculations, the
 * Panchang/Astrology engine should eventually accept an
 * explicit IANA timezone from PanchangLocation.
 */
function parseBirthDateTime(
  birthDate: Date | string | number,
  birthTime?: string,
): Date {
  const date =
    birthDate instanceof Date
      ? new Date(birthDate.getTime())
      : new Date(birthDate);

  if (
    Number.isNaN(date.getTime()) ||
    !Number.isFinite(date.getTime())
  ) {
    throw new Error(
      "Invalid birth date.",
    );
  }

  if (!birthTime) {
    return date;
  }

  const normalizedTime =
    normalizeString(birthTime);

  if (
    !isValidBirthTime(normalizedTime)
  ) {
    throw new Error(
      "Invalid birth time. Expected HH:mm.",
    );
  }

  const [
    hours,
    minutes,
  ] = normalizedTime
    .split(":")
    .map(Number);

  const result =
    new Date(date.getTime());

  result.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return result;
}

/**
 * Returns YYYY-MM-DD using the local calendar
 * representation of the supplied Date.
 */
function formatBirthDate(
  date: Date,
): string {
  const year = date
    .getFullYear()
    .toString()
    .padStart(4, "0");

  const month = (
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0");

  const day = date
    .getDate()
    .toString()
    .padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Returns HH:mm using local time.
 */
function formatBirthTime(
  date: Date,
): string {
  const hours = date
    .getHours()
    .toString()
    .padStart(2, "0");

  const minutes = date
    .getMinutes()
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}`;
}

/* =========================================================
   HOUSE HELPERS
========================================================= */

export function isValidHouse(
  house: number,
): boolean {
  return (
    Number.isInteger(house) &&
    house >= 1 &&
    house <= 12
  );
}

export function getHouseLabel(
  house: number,
): string {
  if (!isValidHouse(house)) {
    return "Unknown House";
  }

  return (
    HOUSE_NAMES_ENGLISH[house - 1] ??
    "Unknown House"
  );
}

export function getHouseHindiLabel(
  house: number,
): string {
  if (!isValidHouse(house)) {
    return "अज्ञात भाव";
  }

  return (
    HOUSE_NAMES_HINDI[house - 1] ??
    "अज्ञात भाव"
  );
}

export function getHouseDisplayInfo(
  house: number,
): HouseDisplayInfo {
  return {
    house,
    label: getHouseLabel(house),
    hindi: getHouseHindiLabel(house),
  };
}

export function getHouseLord(
  houseCusp: HouseCusp,
): PlanetName {
  return getRashiLord(
    houseCusp.sign,
  );
}

export function getPlanetHouseFromChart(
  planet: PlanetName,
  chart: KundliChart,
): number {
  if (planet === "Ascendant") {
    return 1;
  }

  const position =
    chart.planets[planet];

  if (!position) {
    return 0;
  }

  const house =
    getHouseForLongitude(
      position.longitude,
      chart.ascendant.longitude,
    );

  return isValidHouse(house)
    ? house
    : 0;
}

/* =========================================================
   PLANET DATA
========================================================= */

export function getKundliPlanetData(
  planet: Exclude<
    PlanetName,
    "Ascendant"
  >,
  chart: KundliChart,
): KundliPlanetData {
  const position =
    chart.planets[planet];

  if (!position) {
    throw new Error(
      `Planet position not available for ${planet}.`,
    );
  }

  const house =
    getPlanetHouseFromChart(
      planet,
      chart,
    );

  return {
    ...position,

    house,

    houseLabel:
      getHouseLabel(house),

    signHindi:
      getRashiNameHindi(
        position.sign,
      ),

    signEnglish:
      getRashiNameEnglish(
        position.sign,
      ),

    nakshatraLord:
      getNakshatraLord(
        position.nakshatraIndex,
      ),
  };
}

export function getAllKundliPlanetData(
  chart: KundliChart,
): KundliPlanetData[] {
  return KUNDLI_PLANETS.map(
    (planet) =>
      getKundliPlanetData(
        planet,
        chart,
      ),
  );
}

export function createPlanetMap(
  planets: KundliPlanetData[],
): Record<
  PlanetName,
  KundliPlanetData | undefined
> {
  const map: Record<
    PlanetName,
    KundliPlanetData | undefined
  > = {
    Sun: undefined,
    Moon: undefined,
    Mars: undefined,
    Mercury: undefined,
    Jupiter: undefined,
    Venus: undefined,
    Saturn: undefined,
    Rahu: undefined,
    Ketu: undefined,
    Ascendant: undefined,
  };

  for (const planet of planets) {
    if (planet.planet in map) {
      map[planet.planet] =
        planet;
    }
  }

  return map;
}

export function getPlanetDisplayInfo(
  planet: Exclude<
    PlanetName,
    "Ascendant"
  >,
): PlanetDisplayInfo {
  return PLANET_DISPLAY[planet];
}

/* =========================================================
   HOUSE DATA
========================================================= */

export function getKundliHouseData(
  chart: KundliChart,
): KundliHouseData[] {
  return chart.houses.map(
    (house) => {
      const occupants =
        getPlanetsInHouse(
          chart,
          house.house,
        );

      return {
        ...house,

        houseLabel:
          getHouseLabel(
            house.house,
          ),

        lord:
          getHouseLord(
            house,
          ),

        occupants,
      };
    },
  );
}

/* =========================================================
   ASCENDANT / LAGNA
========================================================= */

export function getLagnaData(
  chart: KundliChart,
): LagnaData {
  const ascendant =
    chart.ascendant;

  return {
    sign: ascendant.sign,

    signEnglish:
      ascendant.signEnglish,

    signHindi:
      getRashiNameHindi(
        ascendant.sign,
      ),

    degree:
      ascendant.degreeInSign,

    nakshatra:
      ascendant.nakshatra,

    pada:
      ascendant.pada,

    lord:
      getRashiLord(
        ascendant.sign,
      ),
  };
}

/* =========================================================
   CURRENT MAHADASHA
========================================================= */

function findCurrentDasha(
  periods: VimshottariDashaPeriod[],
  date: Date,
): KundliDashaData | undefined {
  if (!periods.length) {
    return undefined;
  }

  const timestamp =
    date.getTime();

  const active =
    periods.find(
      (period) =>
        timestamp >=
          period.start.getTime() &&
        timestamp <
          period.end.getTime(),
    );

  if (!active) {
    return undefined;
  }

  const remainingMilliseconds =
    Math.max(
      0,
      active.end.getTime() -
        timestamp,
    );

  const remainingDays =
    remainingMilliseconds /
    86_400_000;

  return {
    mahadasha: active,

    isCurrent: true,

    remainingDays:
      Number(
        remainingDays.toFixed(2),
      ),
  };
}

export function getCurrentMahadasha(
  periods: VimshottariDashaPeriod[],
  date: Date = new Date(),
): KundliDashaData | undefined {
  return findCurrentDasha(
    periods,
    date,
  );
}

/* =========================================================
   MANGAL DOSHA
========================================================= */

/**
 * Simplified Manglik screening.
 *
 * Mars in:
 * 1st, 4th, 7th, 8th or 12th house
 * from Lagna.
 *
 * This does NOT apply advanced cancellation rules,
 * Moon/Venus reference rules, exceptions or regional
 * Jyotish traditions.
 */
export function getManglikResult(
  chart: KundliChart,
): ManglikResult {
  const marsHouse =
    getPlanetHouseFromChart(
      "Mars",
      chart,
    );

  const isManglik =
    MANGALIK_HOUSES.includes(
      marsHouse as
        (typeof MANGALIK_HOUSES)[number],
    );

  if (!isManglik) {
    return {
      isManglik: false,

      house: marsHouse,

      reason:
        "Mars is not placed in the simplified Manglik houses.",
    };
  }

  return {
    isManglik: true,

    house: marsHouse,

    reason:
      `Mars is placed in the ${getHouseLabel(
        marsHouse,
      )}.`,
  };
}

/* =========================================================
   MOON SUMMARY
========================================================= */

export function getKundliMoonSummary(
  birthDate: Date | string | number,
) {
  const moon =
    getMoonSign(
      birthDate,
    );

  return {
    moonSign:
      moon.sign,

    moonSignEnglish:
      moon.signEnglish,

    moonSignHindi:
      getRashiNameHindi(
        moon.sign,
      ),

    moonNakshatra:
      moon.nakshatra,

    moonNakshatraPada:
      moon.pada,

    moonLongitude:
      moon.longitude,
  };
}

/* =========================================================
   SUN SUMMARY
========================================================= */

export function getKundliSunSummary(
  birthDate: Date | string | number,
) {
  const sun =
    getSunSign(
      birthDate,
    );

  return {
    sunSign:
      sun.sign,

    sunSignEnglish:
      sun.signEnglish,

    sunSignHindi:
      getRashiNameHindi(
        sun.sign,
      ),

    sunNakshatra:
      sun.nakshatra,

    sunNakshatraPada:
      sun.pada,

    sunLongitude:
      sun.longitude,
  };
}

/* =========================================================
   FULL KUNDLI BUILD
========================================================= */

export function buildKundli(
  input: KundliInput,
): KundliChartData {
  const location =
    input.location ??
    DEFAULT_LOCATION;

  if (
    !isValidKundliLocation(
      location,
    )
  ) {
    throw new Error(
      "Invalid birth location. Latitude and longitude are required.",
    );
  }

  const birthDateTime =
    parseBirthDateTime(
      input.birthDate,
      input.birthTime,
    );

  const birth: BirthDetails = {
    name:
      normalizeString(
        input.name,
      ) || undefined,

    date:
      formatBirthDate(
        birthDateTime,
      ),

    time:
      input.birthTime
        ? normalizeString(
            input.birthTime,
          )
        : formatBirthTime(
            birthDateTime,
          ),

    location,
  };

  const chart =
    calculateKundli({
      date:
        birthDateTime,

      location,
    });

  if (!chart) {
    throw new Error(
      "Unable to calculate Kundli chart.",
    );
  }

  const planets =
    getAllKundliPlanetData(
      chart,
    );

  const planetMap =
    createPlanetMap(
      planets,
    );

  const houses =
    getKundliHouseData(
      chart,
    );

  const mahadashas =
    calculateVimshottariMahadasha(
      birthDateTime,
    );

  const currentMahadasha =
    findCurrentDasha(
      mahadashas,
      new Date(),
    );

  const manglik =
    getManglikResult(
      chart,
    );

  const summary =
    getKundliSummary(
      birthDateTime,
      location,
    );

  return {
    birth,

    chart,

    planets,

    planetMap,

    houses,

    currentMahadasha,

    mahadashas,

    manglik,

    summary,

    trust:
      getKundliTrustMetadata(
        location,
        input.birthTime,
      ),

    personalization:
      getKundliPersonalization(
        location,
        input.birthTime,
      ),
  };
}

/* =========================================================
   VALIDATED KUNDLI CALCULATOR
========================================================= */

export function calculateKundliFromBirthDetails(
  details: BirthDetails,
): KundliChartData {
  const errors =
    validateBirthDetails(
      details,
    );

  if (errors.length > 0) {
    throw new Error(
      errors.join(" "),
    );
  }

  return buildKundli({
    name: details.name,

    birthDate:
      details.date,

    birthTime:
      details.time,

    location:
      details.location,
  });
}

/* =========================================================
   PLANET POSITION SHORTCUT
========================================================= */

export function getBirthPlanetPosition(
  planet: Exclude<
    PlanetName,
    "Ascendant"
  >,
  birthDate: Date | string | number,
  birthTime?: string,
): PlanetPosition {
  const date =
    parseBirthDateTime(
      birthDate,
      birthTime,
    );

  return getPlanetPosition(
    planet,
    date,
  );
}

/* =========================================================
   PLANET POSITION FOR ALL PLANETS
========================================================= */

export function getBirthPlanetPositions(
  birthDate: Date | string | number,
  birthTime?: string,
): PlanetPosition[] {
  const date =
    parseBirthDateTime(
      birthDate,
      birthTime,
    );

  return KUNDLI_PLANETS.map(
    (planet) =>
      getPlanetPosition(
        planet,
        date,
      ),
  );
}

/* =========================================================
   HOUSE OCCUPANCY
========================================================= */

export function getPlanetsInHouse(
  chart: KundliChart,
  house: number,
): PlanetName[] {
  if (!isValidHouse(house)) {
    return [];
  }

  return KUNDLI_PLANETS.filter(
    (planet) =>
      getPlanetHouseFromChart(
        planet,
        chart,
      ) === house,
  );
}

/* =========================================================
   PLANETS IN SIGN
========================================================= */

export function getPlanetsInSign(
  chart: KundliChart,
  sign: ZodiacSign,
): PlanetName[] {
  return KUNDLI_PLANETS.filter(
    (planet) =>
      chart.planets[
        planet
      ]?.sign === sign,
  );
}

/* =========================================================
   RETROGRADE PLANETS
========================================================= */

export function getRetrogradePlanets(
  chart: KundliChart,
): PlanetPosition[] {
  return KUNDLI_PLANETS
    .map(
      (planet) =>
        chart.planets[planet],
    )
    .filter(
      (
        planet,
      ): planet is PlanetPosition =>
        Boolean(
          planet?.retrograde,
        ),
    );
}

export function getRetrogradePlanetNames(
  chart: KundliChart,
): PlanetName[] {
  return getRetrogradePlanets(
    chart,
  ).map(
    (planet) =>
      planet.planet,
  );
}

/* =========================================================
   KENDRA / TRIKONA
========================================================= */

export function isKendraHouse(
  house: number,
): boolean {
  return KENDRA_HOUSES.includes(
    house as
      (typeof KENDRA_HOUSES)[number],
  );
}

export function isTrikonaHouse(
  house: number,
): boolean {
  return TRIKONA_HOUSES.includes(
    house as
      (typeof TRIKONA_HOUSES)[number],
  );
}

/* =========================================================
   HOUSE SIGN LOOKUP
========================================================= */

export function getHouseSign(
  chart: KundliChart,
  house: number,
): ZodiacSign | undefined {
  if (!isValidHouse(house)) {
    return undefined;
  }

  const item =
    chart.houses.find(
      (entry) =>
        entry.house === house,
    );

  return item?.sign;
}

export function getHouseSignEnglish(
  chart: KundliChart,
  house: number,
): ZodiacEnglishSign | undefined {
  if (!isValidHouse(house)) {
    return undefined;
  }

  const item =
    chart.houses.find(
      (entry) =>
        entry.house === house,
    );

  return item?.signEnglish;
}

export function getHouseSignHindi(
  chart: KundliChart,
  house: number,
): string | undefined {
  const sign =
    getHouseSign(
      chart,
      house,
    );

  if (!sign) {
    return undefined;
  }

  return getRashiNameHindi(
    sign,
  );
}

/* =========================================================
   HOUSE LORD PLACEMENT
========================================================= */

export function getHouseLordPlacement(
  chart: KundliChart,
  house: number,
): {
  lord: PlanetName;
  house: number;
  sign: ZodiacSign;
} | undefined {
  if (!isValidHouse(house)) {
    return undefined;
  }

  const houseEntry =
    chart.houses.find(
      (entry) =>
        entry.house === house,
    );

  if (!houseEntry) {
    return undefined;
  }

  const lord =
    getRashiLord(
      houseEntry.sign,
    );

  if (!chart.planets[lord]) {
    return undefined;
  }

  const lordHouse =
    getPlanetHouseFromChart(
      lord,
      chart,
    );

  return {
    lord,

    house: lordHouse,

    sign:
      chart.planets[
        lord
      ].sign,
  };
}

/* =========================================================
   HOUSE CLASSIFICATION HELPERS
========================================================= */

export function getKendraHouses(): readonly number[] {
  return KENDRA_HOUSES;
}

export function getTrikonaHouses(): readonly number[] {
  return TRIKONA_HOUSES;
}

export function isDusthanaHouse(
  house: number,
): boolean {
  return (
    house === 6 ||
    house === 8 ||
    house === 12
  );
}

export function isUpachayaHouse(
  house: number,
): boolean {
  return (
    house === 3 ||
    house === 6 ||
    house === 10 ||
    house === 11
  );
}

/* =========================================================
   PLANET HOUSE LOOKUP
========================================================= */

export function getPlanetHouseMap(
  chart: KundliChart,
): Record<
  PlanetName,
  number | undefined
> {
  const map: Record<
    PlanetName,
    number | undefined
  > = {
    Sun: undefined,
    Moon: undefined,
    Mars: undefined,
    Mercury: undefined,
    Jupiter: undefined,
    Venus: undefined,
    Saturn: undefined,
    Rahu: undefined,
    Ketu: undefined,
    Ascendant: 1,
  };

  for (const planet of KUNDLI_PLANETS) {
    map[planet] =
      getPlanetHouseFromChart(
        planet,
        chart,
      );
  }

  return map;
}

/* =========================================================
   HOUSE OCCUPANT MAP
========================================================= */

export function getHouseOccupantMap(
  chart: KundliChart,
): Record<
  number,
  PlanetName[]
> {
  const result: Record<
    number,
    PlanetName[]
  > = {};

  for (
    let house = 1;
    house <= 12;
    house++
  ) {
    result[house] =
      getPlanetsInHouse(
        chart,
        house,
      );
  }

  return result;
}

/* =========================================================
   SIGN PLANET MAP
========================================================= */

export function getSignPlanetMap(
  chart: KundliChart,
): Record<
  ZodiacSign,
  PlanetName[]
> {
  const result =
    {} as Record<
      ZodiacSign,
      PlanetName[]
    >;

  for (const planet of KUNDLI_PLANETS) {
    const position =
      chart.planets[planet];

    if (!position) {
      continue;
    }

    const sign =
      position.sign;

    if (!result[sign]) {
      result[sign] = [];
    }

    result[sign].push(
      planet,
    );
  }

  return result;
}

/* =========================================================
   KUNDLI QUICK PROFILE
========================================================= */

export function getKundliQuickProfile(
  chartData: KundliChartData,
): KundliQuickProfile {
  const lagna =
    getLagnaData(
      chartData.chart,
    );

  const moon =
    chartData.chart.planets.Moon;

  const sun =
    chartData.chart.planets.Sun;

  return {
    lagna: {
      sign:
        lagna.sign,

      english:
        lagna.signEnglish,

      hindi:
        lagna.signHindi,

      lord:
        lagna.lord,
    },

    moon: {
      sign:
        moon.sign,

      english:
        moon.signEnglish,

      hindi:
        getRashiNameHindi(
          moon.sign,
        ),

      nakshatra:
        moon.nakshatra,

      pada:
        moon.pada,
    },

    sun: {
      sign:
        sun.sign,

      english:
        sun.signEnglish,

      hindi:
        getRashiNameHindi(
          sun.sign,
        ),
    },

    manglik:
      chartData.manglik
        .isManglik,

    retrogradePlanets:
      getRetrogradePlanetNames(
        chartData.chart,
      ),
  };
}

/* =========================================================
   KUNDLI SUMMARY HELPERS
========================================================= */

export function getLagnaSummary(
  chart: KundliChart,
) {
  const lagna =
    getLagnaData(chart);

  return {
    sign:
      lagna.sign,

    signEnglish:
      lagna.signEnglish,

    signHindi:
      lagna.signHindi,

    degree:
      lagna.degree,

    nakshatra:
      lagna.nakshatra,

    pada:
      lagna.pada,

    lord:
      lagna.lord,
  };
}

export function getPlanetSummary(
  chart: KundliChart,
  planet: Exclude<
    PlanetName,
    "Ascendant"
  >,
) {
  const data =
    getKundliPlanetData(
      planet,
      chart,
    );

  return {
    planet:
      data.planet,

    sign:
      data.sign,

    signEnglish:
      data.signEnglish,

    signHindi:
      data.signHindi,

    house:
      data.house,

    houseLabel:
      data.houseLabel,

    nakshatra:
      data.nakshatra,

    pada:
      data.pada,

    nakshatraLord:
      data.nakshatraLord,

    retrograde:
      data.retrograde,

    longitude:
      data.longitude,
  };
}

/* =========================================================
   DEFAULT LOCATION
========================================================= */

export function getDefaultKundliLocation(): PanchangLocation {
  return DEFAULT_LOCATION;
}

/* =========================================================
   LOCATION NORMALIZATION
========================================================= */

export function normalizeKundliLocation(
  location?: PanchangLocation,
): PanchangLocation {
  return (
    location ??
    DEFAULT_LOCATION
  );
}

/* =========================================================
   KUNDLI INPUT NORMALIZATION
========================================================= */

export function normalizeKundliInput(
  input: KundliInput,
): KundliInput {
  return {
    name:
      normalizeString(
        input.name,
      ) || undefined,

    birthDate:
      input.birthDate,

    birthTime:
      input.birthTime
        ? normalizeString(
            input.birthTime,
          )
        : undefined,

    location:
      normalizeKundliLocation(
        input.location,
      ),
  };
}

/* =========================================================
   SAFE KUNDLI CALCULATION
========================================================= */

export interface SafeKundliResult {
  success: boolean;
  data?: KundliChartData;
  errors: string[];
}

export function tryBuildKundli(
  input: KundliInput,
): SafeKundliResult {
  try {
    const normalized =
      normalizeKundliInput(
        input,
      );

    if (
      !isValidBirthDate(
        normalized.birthDate,
      )
    ) {
      return {
        success: false,
        errors: [
          "Birth date is invalid.",
        ],
      };
    }

    if (
      normalized.birthTime &&
      !isValidBirthTime(
        normalized.birthTime,
      )
    ) {
      return {
        success: false,
        errors: [
          "Birth time must be in HH:mm format.",
        ],
      };
    }

    if (
      !isValidKundliLocation(
        normalized.location,
      )
    ) {
      return {
        success: false,
        errors: [
          "Birth location is invalid.",
        ],
      };
    }

    return {
      success: true,

      data:
        buildKundli(
          normalized,
        ),

      errors: [],
    };
  } catch (error) {
    return {
      success: false,

      errors: [
        error instanceof Error
          ? error.message
          : "Unable to calculate Kundli.",
      ],
    };
  }
}

/* =========================================================
   DATE / TIME EXPORTS
========================================================= */

export function getBirthDateTime(
  birthDate: Date | string | number,
  birthTime?: string,
): Date {
  return parseBirthDateTime(
    birthDate,
    birthTime,
  );
}

export function formatKundliBirthDate(
  date: Date,
): string {
  return formatBirthDate(
    date,
  );
}

export function formatKundliBirthTime(
  date: Date,
): string {
  return formatBirthTime(
    date,
  );
}

/* =========================================================
   PAN-INDIA TRUST & PERSONALIZATION
========================================================= */

/**
 * DharmYatra's transparent Kundli calculation note.
 *
 * Calculation data and traditional interpretation are deliberately kept
 * separate. This makes the result easier to understand for users across
 * India, regardless of their state, language, or regional tradition.
 */
export const KUNDLI_TRUST_NOTE =
  "DharmYatra calculates the birth chart using astronomical positions with Lahiri sidereal ayanamsha, mean lunar nodes and whole-sign houses. The selected birth location is retained with the result because location and birth time can materially affect Lagna and house placement. Traditional Jyotish interpretation can vary by parampara, astrologer and rule set, so calculated astronomical data should be distinguished from interpretation.";

export const KUNDLI_INTERPRETATION_NOTE =
  "Kundli, Rashi, Nakshatra, Dasha, Manglik and other Jyotish interpretations are traditional Vedic astrology frameworks intended for cultural, spiritual and self-reflection purposes. They should not be presented as guaranteed predictions or as substitutes for qualified medical, legal, financial or other professional advice.";

function getSafeLocationLabel(
  location: PanchangLocation,
): string {
  const parts = [
    location.city,
    location.state,
    location.country,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
}

function getKundliConfidence(
  birthTime?: string,
  location?: PanchangLocation,
): "high" | "medium" | "limited" {
  if (!location) return "limited";
  if (!birthTime || !isValidBirthTime(birthTime)) return "limited";
  return "high";
}

/**
 * Get transparent calculation metadata for UI trust badges and reports.
 */
export function getKundliTrustMetadata(
  location: PanchangLocation = DEFAULT_LOCATION,
  birthTime?: string,
): KundliTrustMetadata {
  const astrology = getAstrologyTrustMetadata(location);

  return {
    engine: astrology.engine,
    ayanamsha: astrology.ayanamsha,
    zodiac: "sidereal",
    nodeModel: astrology.nodeModel,
    houseSystem: astrology.houseSystem,
    locationUsed: location,
    locationLabel: getSafeLocationLabel(location),
    confidence: getKundliConfidence(birthTime, location),
    precision: astrology.precision,
    calculationBasis:
      "Birth date + local birth time + selected birth location + astronomical planetary positions + Lahiri sidereal conversion + whole-sign house calculation.",
    trustNote: KUNDLI_TRUST_NOTE,
    interpretationNote: KUNDLI_INTERPRETATION_NOTE,
  };
}

/**
 * Explain why this particular Kundli belongs to the user.
 */
export function getKundliPersonalizationMessage(
  location: PanchangLocation = DEFAULT_LOCATION,
  birthTime?: string,
): string {
  const locationLabel = getSafeLocationLabel(location);
  const timeNote = birthTime && isValidBirthTime(birthTime)
    ? "your supplied birth time"
    : "the available birth-time information";

  return getAstrologyPersonalizationMessage(location).replace(
    /selected location/gi,
    `selected birth location (${locationLabel})`,
  ) + ` The Kundli uses ${timeNote}; a different birth time or location can change Lagna and house-based results.`;
}

/**
 * Add India-wide relevance metadata without pretending that every regional
 * tradition uses identical rules.
 */
export function getKundliPersonalization(
  location: PanchangLocation = DEFAULT_LOCATION,
  birthTime?: string,
): KundliPersonalization {
  const trust = getKundliTrustMetadata(location, birthTime);
  const state = location.state;
  const region = location.region;
  const locationLabel = getSafeLocationLabel(location);

  let relevance: KundliRelevance = "personal";
  let relevanceLabel = "Personal Birth Chart";

  if (state) {
    relevance = "selected-state";
    relevanceLabel = `Personal Chart • ${state}`;
  } else if (location.city) {
    relevance = "selected-city";
    relevanceLabel = `Personal Chart • ${location.city}`;
  } else {
    relevance = "pan-india";
    relevanceLabel = "Personal Chart • India";
  }

  return {
    relevance,
    relevanceLabel,
    locationLabel,
    state,
    region,
    personalizationMessage:
      getKundliPersonalizationMessage(location, birthTime),
    trust,
  };
}

/**
 * Return the same India-wide location registry used by Panchang/Astrology.
 * Keeping one source of truth prevents state/city calculations from drifting.
 */
export function getPanIndiaKundliLocations(): PanchangLocation[] {
  return getIndiaLocations();
}

/**
 * Find a supported Indian Kundli location by city/state/name/ID.
 */
export function findKundliLocation(
  query: string,
): PanchangLocation | undefined {
  const result = findIndiaLocation(query);
  return result ?? undefined;
}

/**
 * Check whether a location is part of the supported India registry.
 * Coordinate-only custom locations are still valid for calculations, but are
 * not treated as a named Pan-India registry location.
 */
export function isPanIndiaKundliLocation(
  location: PanchangLocation,
): boolean {
  return getIndiaLocations().some((item) => {
    if (location.id && item.id) return item.id === location.id;
    return (
      Math.abs(item.latitude - location.latitude) < 0.0001 &&
      Math.abs(item.longitude - location.longitude) < 0.0001
    );
  });
}

/**
 * Build a UI-ready identity card so users can immediately connect the chart
 * with their own birth details.
 */
export interface KundliIdentityCard {
  name?: string;
  birthDate: string;
  birthTime: string;
  location: PanchangLocation;
  locationLabel: string;
  lagna: string;
  lagnaHindi: string;
  moonSign: string;
  moonSignHindi: string;
  moonNakshatra: NakshatraName;
  moonNakshatraPada: number;
  sunSign: string;
  sunSignHindi: string;
  relevanceLabel: string;
  personalizationMessage: string;
  trust: KundliTrustMetadata;
}

export function getKundliIdentityCard(
  chartData: KundliChartData,
): KundliIdentityCard {
  const lagna = getLagnaData(chartData.chart);
  const moon = chartData.chart.planets.Moon;
  const sun = chartData.chart.planets.Sun;

  return {
    name: chartData.birth.name,
    birthDate: chartData.birth.date,
    birthTime: chartData.birth.time,
    location: chartData.birth.location,
    locationLabel: getSafeLocationLabel(chartData.birth.location),
    lagna: lagna.signEnglish,
    lagnaHindi: lagna.signHindi,
    moonSign: moon.signEnglish,
    moonSignHindi: getRashiNameHindi(moon.sign),
    moonNakshatra: moon.nakshatra,
    moonNakshatraPada: moon.pada,
    sunSign: sun.signEnglish,
    sunSignHindi: getRashiNameHindi(sun.sign),
    relevanceLabel: chartData.personalization.relevanceLabel,
    personalizationMessage: chartData.personalization.personalizationMessage,
    trust: chartData.trust,
  };
}

/**
 * Human-readable trust summary for cards, reports and SEO-visible UI.
 */
export function getKundliTrustSummary(
  chartData: KundliChartData,
): string {
  const { trust, personalization } = chartData;
  return `${personalization.relevanceLabel}: ${trust.locationLabel}. Calculated with ${trust.ayanamsha} sidereal zodiac, ${trust.nodeModel} lunar nodes and ${trust.houseSystem} houses. ${trust.interpretationNote}`;
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const kundli = {
  /* Constants */
  KUNDLI_PLANETS,
  HOUSE_NAMES_ENGLISH,
  HOUSE_NAMES_HINDI,
  PLANET_DISPLAY,

  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  MANGALIK_HOUSES,

  /* Validation */
  validateBirthDetails,
  isValidBirthDate,
  isValidBirthTime,
  isValidKundliLocation,
  isValidHouse,

  /* Date / Time */
  getBirthDateTime,
  formatKundliBirthDate,
  formatKundliBirthTime,

  /* House */
  getHouseLabel,
  getHouseHindiLabel,
  getHouseDisplayInfo,
  getHouseLord,
  getPlanetHouseFromChart,

  /* Planets */
  getKundliPlanetData,
  getAllKundliPlanetData,
  createPlanetMap,
  getPlanetDisplayInfo,
  getBirthPlanetPosition,
  getBirthPlanetPositions,

  /* Houses */
  getKundliHouseData,
  getPlanetsInHouse,
  getHouseOccupantMap,
  getHouseSign,
  getHouseSignEnglish,
  getHouseSignHindi,
  getHouseLordPlacement,

  /* Lagna */
  getLagnaData,
  getLagnaSummary,

  /* Sun / Moon */
  getKundliMoonSummary,
  getKundliSunSummary,

  /* Dasha */
  getCurrentMahadasha,

  /* Manglik */
  getManglikResult,

  /* Sign */
  getPlanetsInSign,
  getSignPlanetMap,

  /* Retrograde */
  getRetrogradePlanets,
  getRetrogradePlanetNames,

  /* House classifications */
  isKendraHouse,
  isTrikonaHouse,
  isDusthanaHouse,
  isUpachayaHouse,

  /* Maps */
  getPlanetHouseMap,

  /* Summaries */
  getPlanetSummary,

  /* Quick profile */
  getKundliQuickProfile,

  /* Main calculation */
  buildKundli,
  calculateKundliFromBirthDetails,
  tryBuildKundli,

  /* Location */
  normalizeKundliLocation,
  normalizeKundliInput,
  getDefaultKundliLocation,

  /* Pan-India trust & personalization */
  getKundliTrustMetadata,
  getKundliPersonalization,
  getKundliPersonalizationMessage,
  getPanIndiaKundliLocations,
  findKundliLocation,
  isPanIndiaKundliLocation,
  getKundliIdentityCard,
  getKundliTrustSummary,
  KUNDLI_TRUST_NOTE,
  KUNDLI_INTERPRETATION_NOTE,
};

export default kundli;