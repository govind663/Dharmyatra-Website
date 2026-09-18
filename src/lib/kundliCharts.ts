// src/lib/kundliCharts.ts

import {
  getRashiLord,
  getRashiNameEnglish,
  getRashiNameHindi,
  ZODIAC_SIGNS,
  type PlanetName,
  type ZodiacEnglishSign,
  type ZodiacSign,
} from "./astrology";
import type { KundliChartData } from "./kundli";

export type DivisionalChartId = "D1" | "D9";

export interface DivisionalPlanetPosition {
  planet: Exclude<PlanetName, "Ascendant">;
  longitude: number;
  degreeInSign: number;
  sourceSign: ZodiacSign;
  sourceSignEnglish: ZodiacEnglishSign;
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;
  house: number;
  degreeInNavamsa: number;
  navamsaPart: number;
  retrograde: boolean;
  nakshatra: string;
  pada: number;
}

export interface DivisionalAscendantPosition {
  longitude: number;
  /**
   * Degree within the source natal sign (0 <= value < 30).
   * Kept separate from degreeInNavamsa for compatibility with
   * DivisionalPlanetPosition and KundliCharts consumers.
   */
  degreeInSign: number;
  sourceSign: ZodiacSign;
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;
  degreeInNavamsa: number;
  navamsaPart: number;
}

export interface DivisionalHouseData {
  house: number;
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;
  lord: PlanetName;
  occupants: Array<Exclude<PlanetName, "Ascendant">>;
}

export interface DivisionalChartData {
  id: DivisionalChartId;
  title: string;
  subtitle: string;
  ascendant: DivisionalAscendantPosition;
  planets: DivisionalPlanetPosition[];
  houses: DivisionalHouseData[];
}

const MOVABLE_SIGNS = new Set<ZodiacSign>([
  "Mesha",
  "Karka",
  "Tula",
  "Makara",
]);

const FIXED_SIGNS = new Set<ZodiacSign>([
  "Vrishabha",
  "Simha",
  "Vrishchika",
  "Kumbha",
]);

function normalizeIndex(index: number): number {
  return ((index % 12) + 12) % 12;
}

function signIndex(sign: ZodiacSign): number {
  const index = ZODIAC_SIGNS.indexOf(sign);
  return index >= 0 ? index : 0;
}

function getNavamsaStartSign(sign: ZodiacSign): ZodiacSign {
  const index = signIndex(sign);

  if (MOVABLE_SIGNS.has(sign)) {
    return sign;
  }

  if (FIXED_SIGNS.has(sign)) {
    return ZODIAC_SIGNS[normalizeIndex(index + 8)];
  }

  return ZODIAC_SIGNS[normalizeIndex(index + 4)];
}

export function getNavamsaSign(
  sign: ZodiacSign,
  degreeInSign: number,
): ZodiacSign {
  const safeDegree = Math.min(29.999999, Math.max(0, Number(degreeInSign) || 0));
  const part = Math.min(8, Math.floor(safeDegree / (30 / 9)));
  const start = getNavamsaStartSign(sign);
  return ZODIAC_SIGNS[normalizeIndex(signIndex(start) + part)];
}

export function getNavamsaPart(degreeInSign: number): number {
  const safeDegree = Math.min(29.999999, Math.max(0, Number(degreeInSign) || 0));
  return Math.min(9, Math.floor(safeDegree / (30 / 9)) + 1);
}

export function getNavamsaDegree(degreeInSign: number): number {
  const safeDegree = Math.min(29.999999, Math.max(0, Number(degreeInSign) || 0));
  const segment = 30 / 9;
  const part = Math.min(8, Math.floor(safeDegree / segment));
  return ((safeDegree - part * segment) / segment) * 30;
}

function getWholeSignHouse(
  sign: ZodiacSign,
  ascendantSign: ZodiacSign,
): number {
  return normalizeIndex(signIndex(sign) - signIndex(ascendantSign)) + 1;
}

function createDivisionalAscendant(chart: KundliChartData["chart"]): DivisionalAscendantPosition {
  const source = chart.ascendant;
  const sign = getNavamsaSign(source.sign, source.degreeInSign);
  return {
    longitude: source.longitude,
    degreeInSign: source.degreeInSign,
    sourceSign: source.sign,
    sign,
    signEnglish: getRashiNameEnglish(sign),
    signHindi: getRashiNameHindi(sign),
    degreeInNavamsa: getNavamsaDegree(source.degreeInSign),
    navamsaPart: getNavamsaPart(source.degreeInSign),
  };
}

export function buildNavamsaChart(chart: KundliChartData["chart"]): DivisionalChartData {
  const ascendant = createDivisionalAscendant(chart);

  const planets: DivisionalPlanetPosition[] = (Object.values(chart.planets) as NonNullable<KundliChartData["chart"]["planets"][Exclude<PlanetName, "Ascendant">]>[])
    .filter(Boolean)
    .map((position) => {
      const sign = getNavamsaSign(position.sign, position.degreeInSign);
      return {
        planet: position.planet as Exclude<PlanetName, "Ascendant">,
        longitude: position.longitude,
        degreeInSign: position.degreeInSign,
        sourceSign: position.sign,
        sourceSignEnglish: position.signEnglish,
        sign,
        signEnglish: getRashiNameEnglish(sign),
        signHindi: getRashiNameHindi(sign),
        house: getWholeSignHouse(sign, ascendant.sign),
        degreeInNavamsa: getNavamsaDegree(position.degreeInSign),
        navamsaPart: getNavamsaPart(position.degreeInSign),
        retrograde: position.retrograde,
        nakshatra: position.nakshatra,
        pada: position.pada,
      };
    });

  const houses: DivisionalHouseData[] = Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const sign = ZODIAC_SIGNS[normalizeIndex(signIndex(ascendant.sign) + index)];
    return {
      house,
      sign,
      signEnglish: getRashiNameEnglish(sign),
      signHindi: getRashiNameHindi(sign),
      lord: getRashiLord(sign),
      occupants: planets.filter((planet) => planet.house === house).map((planet) => planet.planet),
    };
  });

  return {
    id: "D9",
    title: "Navamsa Chart (D9)",
    subtitle: "Ninth divisional chart • marriage, dharma and finer planetary strength analysis",
    ascendant,
    planets,
    houses,
  };
}

export function buildLagnaChart(chart: KundliChartData["chart"]): DivisionalChartData {
  const ascendant: DivisionalAscendantPosition = {
    longitude: chart.ascendant.longitude,
    degreeInSign: chart.ascendant.degreeInSign,
    sourceSign: chart.ascendant.sign,
    sign: chart.ascendant.sign,
    signEnglish: chart.ascendant.signEnglish,
    signHindi: getRashiNameHindi(chart.ascendant.sign),
    degreeInNavamsa: chart.ascendant.degreeInSign,
    navamsaPart: 0,
  };

  const planets = (Object.values(chart.planets) as NonNullable<KundliChartData["chart"]["planets"][Exclude<PlanetName, "Ascendant">]>[])
    .filter(Boolean)
    .map((position) => ({
      planet: position.planet as Exclude<PlanetName, "Ascendant">,
      longitude: position.longitude,
      degreeInSign: position.degreeInSign,
      sourceSign: position.sign,
      sourceSignEnglish: position.signEnglish,
      sign: position.sign,
      signEnglish: position.signEnglish,
      signHindi: getRashiNameHindi(position.sign),
      house: getWholeSignHouse(position.sign, chart.ascendant.sign),
      degreeInNavamsa: position.degreeInSign,
      navamsaPart: 0,
      retrograde: position.retrograde,
      nakshatra: position.nakshatra,
      pada: position.pada,
    }));

  const houses: DivisionalHouseData[] = chart.houses.map((house) => ({
    house: house.house,
    sign: house.sign,
    signEnglish: house.signEnglish,
    signHindi: getRashiNameHindi(house.sign),
    lord: getRashiLord(house.sign),
    occupants: planets.filter((planet) => planet.house === house.house).map((planet) => planet.planet),
  }));

  return {
    id: "D1",
    title: "Lagna / Rashi Chart (D1)",
    subtitle: "Main birth chart • Lagna, houses and planetary placements",
    ascendant,
    planets,
    houses,
  };
}

export function buildKundliDivisionalCharts(chartData: KundliChartData): {
  d1: DivisionalChartData;
  d9: DivisionalChartData;
} {
  return {
    d1: buildLagnaChart(chartData.chart),
    d9: buildNavamsaChart(chartData.chart),
  };
}
