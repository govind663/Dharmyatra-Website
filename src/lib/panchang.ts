// ============================================================================
// src/lib/panchang.ts
// ============================================================================
// DharmYatra Panchang Engine
//
// Purpose:
// - Location-aware Vedic Panchang calculations
// - Lahiri-style sidereal calculations
// - Tithi / Nakshatra / Yoga / Karana
// - Sunrise / Sunset / Moonrise / Moonset
// - Choghadiya / Rahukaal / Yamaganda / Gulika
// - Abhijit / Brahma Muhurat / Dur Muhurat / Varjyam
// - Solar Sankranti / Solar sign
// - Sidereal Amavasya / Purnima
// - Regional Indian calendar support / city-aware personalization
// - Transparent calculation metadata for user trust
//
// Astronomy dependency:
//   astronomy-engine
//
// NOTE:
// This is an application-grade Vedic Panchang engine.
// For professional ephemeris-grade Panchang publishing, a dedicated
// Swiss Ephemeris / Drik Siddhanta implementation is recommended.
// ============================================================================

import * as Astronomy from "astronomy-engine";

// ============================================================================
// TYPES
// ============================================================================

export type IndiaRegion =
  | "north"
  | "south"
  | "east"
  | "west"
  | "central"
  | "north-east"
  | "union-territory";

export type LunarMonthSystem =
  | "amanta"
  | "purnimanta"
  | "solar";

export interface PanchangLocation {
  id?: string;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  region?: IndiaRegion;
  latitude: number;
  longitude: number;
  timezone: string;
  language?: string;
  locale?: string;
}

export interface PanchangOptions {
  lunarMonthSystem?: LunarMonthSystem;
}

export interface PanchangCalculationMeta {
  standard: "vedic-sidereal";
  ayanamsha: "lahiri-style";
  engine: "astronomy-engine";
  locationAware: true;
  regionalSystem: LunarMonthSystem;
  transparency: string;
}

export interface SolarTimes {
  sunrise: Date | null;
  sunset: Date | null;
  dawn: Date | null;
  dusk: Date | null;
}

export interface LunarTimes {
  moonrise: Date | null;
  moonset: Date | null;
}

export interface PanchangDateRange {
  start: Date;
  end: Date;
}

export interface TithiResult {
  [x: string]: number;
  index: number;
  number: number;
  name: string;
  paksha: "Shukla" | "Krishna";
  pakshaHindi: "शुक्ल" | "कृष्ण";
  percentage: number;
  elapsedDegrees: number;
  remainingDegrees: number;
  start: Date | null;
  end: Date | null;
  remainingMinutes: number | null;
  isPurnima: boolean;
  isAmavasya: boolean;
}

export interface NakshatraResult {
  [x: string]: ReactNode;
  index: number;
  number: number;
  name: string;
  pada: number;
  percentage: number;
  elapsedDegrees: number;
  remainingDegrees: number;
  start: Date | null;
  end: Date | null;
  remainingMinutes: number | null;
}

export interface YogaResult {
  index: number;
  number: number;
  name: string;
  percentage: number;
  elapsedDegrees: number;
  remainingDegrees: number;
  start: Date | null;
  end: Date | null;
  remainingMinutes: number | null;
}

export interface KaranaResult {
  index: number;
  number: number;
  name: string;
  type:
    | "movable"
    | "fixed"
    | "kimstughna"
    | "shakuni"
    | "chatushpada"
    | "naga";
  percentage: number;
  elapsedDegrees: number;
  remainingDegrees: number;
  start: Date | null;
  end: Date | null;
  remainingMinutes: number | null;
}

export interface SolarSignResult {
  index: number;
  number: number;
  name: string;
  nameHindi: string;
  longitude: number;
  degreeInSign: number;
  ingress: Date | null;
  nextIngress: Date | null;
}

export interface LunarMonthResult {
  index: number;
  number: number;
  name: string;
  nameHindi: string;
  isAdhik: boolean;
  solarSignIndex: number;
  solarSignName: string;
  amavasyaStart: Date | null;
  nextAmavasya: Date | null;
}

export interface ChoghadiyaItem {
  index: number;
  name: string;
  nameHindi: string;
  quality: "auspicious" | "inauspicious" | "neutral";
  start: Date;
  end: Date;
  durationMinutes: number;
  isDay: boolean;
}

export interface RahukaalResult {
  start: Date;
  end: Date;
  durationMinutes: number;
  segment: number;
}

export interface YamagandaResult {
  start: Date;
  end: Date;
  durationMinutes: number;
  segment: number;
}

export interface GulikaResult {
  start: Date;
  end: Date;
  durationMinutes: number;
  segment: number;
}

export interface AbhijitResult {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface BrahmaMuhuratResult {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface DurMuhuratResult {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface VarjyamResult {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface HoraItem {
  index: number;
  planet:
    | "Sun"
    | "Moon"
    | "Mars"
    | "Mercury"
    | "Jupiter"
    | "Venus"
    | "Saturn";
  start: Date;
  end: Date;
  isDay: boolean;
}

export interface FestivalMarker {
  id: string;
  name: string;
  nameHindi: string;
  date: Date;
  type:
    | "tithi"
    | "solar"
    | "lunar"
    | "festival"
    | "observance";
  description?: string;
}

export interface Panchang {
  sunrise: any;
  date: Date;
  location: PanchangLocation;

  solar: SolarTimes;
  lunar: LunarTimes;

  tithi: TithiResult;
  nakshatra: NakshatraResult;
  yoga: YogaResult;
  karana: KaranaResult;

  solarSign: SolarSignResult;
  lunarMonth: LunarMonthResult;

  choghadiya: ChoghadiyaItem[];
  nightChoghadiya: ChoghadiyaItem[];

  rahukaal: RahukaalResult | null;
  yamaganda: YamagandaResult | null;
  gulika: GulikaResult | null;

  abhijit: AbhijitResult | null;
  brahmaMuhurat: BrahmaMuhuratResult | null;
  durMuhurat: DurMuhuratResult[];
  varjyam: VarjyamResult | null;

  hora: HoraItem[];
  nightHora: HoraItem[];

  festivals: FestivalMarker[];

  ayanamsha: number;
  sunLongitude: number;
  moonLongitude: number;
  calculationMeta: PanchangCalculationMeta;
}

// ============================================================================
// DEFAULT LOCATIONS
// ============================================================================

export const DEFAULT_LOCATION: PanchangLocation = {
  id: "mumbai",
  name: "Mumbai, Maharashtra, India",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  region: "west",
  latitude: 19.076,
  longitude: 72.8777,
  timezone: "Asia/Kolkata",
  language: "hi",
  locale: "en-IN",
};

const india = (
  id: string,
  city: string,
  state: string,
  latitude: number,
  longitude: number,
  region: IndiaRegion,
  language = "hi",
): PanchangLocation => ({
  id,
  name: `${city}, ${state}, India`,
  city,
  state,
  country: "India",
  region,
  latitude,
  longitude,
  timezone: "Asia/Kolkata",
  language,
  locale: "en-IN",
});

/** Major-city coverage across every Indian state/UT. */
export const INDIA_LOCATIONS: Record<string, PanchangLocation> = {
  // West
  mumbai: DEFAULT_LOCATION,
  naviMumbai: india("naviMumbai", "Navi Mumbai", "Maharashtra", 19.033, 73.0297, "west"),
  pune: india("pune", "Pune", "Maharashtra", 18.5204, 73.8567, "west"),
  nagpur: india("nagpur", "Nagpur", "Maharashtra", 21.1458, 79.0882, "central"),
  ahmedabad: india("ahmedabad", "Ahmedabad", "Gujarat", 23.0225, 72.5714, "west", "gu"),
  surat: india("surat", "Surat", "Gujarat", 21.1702, 72.8311, "west", "gu"),
  rajkot: india("rajkot", "Rajkot", "Gujarat", 22.3039, 70.8022, "west", "gu"),
  panaji: india("panaji", "Panaji", "Goa", 15.4909, 73.8278, "west", "en"),
  // North
  delhi: india("delhi", "New Delhi", "Delhi", 28.6139, 77.209, "north"),
  gurugram: india("gurugram", "Gurugram", "Haryana", 28.4595, 77.0266, "north"),
  amritsar: india("amritsar", "Amritsar", "Punjab", 31.634, 74.8723, "north"),
  chandigarh: india("chandigarh", "Chandigarh", "Chandigarh", 30.7333, 76.7794, "north"),
  jaipur: india("jaipur", "Jaipur", "Rajasthan", 26.9124, 75.7873, "north"),
  jodhpur: india("jodhpur", "Jodhpur", "Rajasthan", 26.2389, 73.0243, "north"),
  lucknow: india("lucknow", "Lucknow", "Uttar Pradesh", 26.8467, 80.9462, "north"),
  varanasi: india("varanasi", "Varanasi", "Uttar Pradesh", 25.3176, 82.9739, "north"),
  ayodhya: india("ayodhya", "Ayodhya", "Uttar Pradesh", 26.799, 82.204, "north"),
  prayagraj: india("prayagraj", "Prayagraj", "Uttar Pradesh", 25.4358, 81.8463, "north"),
  mathura: india("mathura", "Mathura", "Uttar Pradesh", 27.4924, 77.6737, "north"),
  haridwar: india("haridwar", "Haridwar", "Uttarakhand", 29.9457, 78.1642, "north"),
  dehradun: india("dehradun", "Dehradun", "Uttarakhand", 30.3165, 78.0322, "north"),
  shimla: india("shimla", "Shimla", "Himachal Pradesh", 31.1048, 77.1734, "north"),
  jammu: india("jammu", "Jammu", "Jammu and Kashmir", 32.7266, 74.857, "north"),
  srinagar: india("srinagar", "Srinagar", "Jammu and Kashmir", 34.0837, 74.7973, "north"),
  leh: india("leh", "Leh", "Ladakh", 34.1526, 77.5771, "union-territory"),
  // Central
  ujjain: india("ujjain", "Ujjain", "Madhya Pradesh", 23.1765, 75.7885, "central"),
  bhopal: india("bhopal", "Bhopal", "Madhya Pradesh", 23.2599, 77.4126, "central"),
  indore: india("indore", "Indore", "Madhya Pradesh", 22.7196, 75.8577, "central"),
  raipur: india("raipur", "Raipur", "Chhattisgarh", 21.2514, 81.6296, "central"),
  bilaspur: india("bilaspur", "Bilaspur", "Chhattisgarh", 22.0797, 82.1409, "central"),
  // East
  kolkata: india("kolkata", "Kolkata", "West Bengal", 22.5726, 88.3639, "east", "bn"),
  gaya: india("gaya", "Gaya", "Bihar", 24.7914, 85.0002, "east"),
  patna: india("patna", "Patna", "Bihar", 25.5941, 85.1376, "east"),
  ranchi: india("ranchi", "Ranchi", "Jharkhand", 23.3441, 85.3096, "east"),
  bhubaneswar: india("bhubaneswar", "Bhubaneswar", "Odisha", 20.2961, 85.8245, "east", "or"),
  puri: india("puri", "Puri", "Odisha", 19.8135, 85.8312, "east", "or"),
  // South
  bengaluru: india("bengaluru", "Bengaluru", "Karnataka", 12.9716, 77.5946, "south", "kn"),
  mysuru: india("mysuru", "Mysuru", "Karnataka", 12.2958, 76.6394, "south", "kn"),
  chennai: india("chennai", "Chennai", "Tamil Nadu", 13.0827, 80.2707, "south", "ta"),
  madurai: india("madurai", "Madurai", "Tamil Nadu", 9.9252, 78.1198, "south", "ta"),
  coimbatore: india("coimbatore", "Coimbatore", "Tamil Nadu", 11.0168, 76.9558, "south", "ta"),
  hyderabad: india("hyderabad", "Hyderabad", "Telangana", 17.385, 78.4867, "south", "te"),
  vijayawada: india("vijayawada", "Vijayawada", "Andhra Pradesh", 16.5062, 80.648, "south", "te"),
  visakhapatnam: india("visakhapatnam", "Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185, "south", "te"),
  thiruvananthapuram: india("thiruvananthapuram", "Thiruvananthapuram", "Kerala", 8.5241, 76.9366, "south", "ml"),
  kochi: india("kochi", "Kochi", "Kerala", 9.9312, 76.2673, "south", "ml"),
  kozhikode: india("kozhikode", "Kozhikode", "Kerala", 11.2588, 75.7804, "south", "ml"),
  // North-East
  guwahati: india("guwahati", "Guwahati", "Assam", 26.1445, 91.7362, "north-east", "as"),
  gangtok: india("gangtok", "Gangtok", "Sikkim", 27.3314, 88.6138, "north-east", "en"),
  shillong: india("shillong", "Shillong", "Meghalaya", 25.5788, 91.8933, "north-east", "en"),
  imphal: india("imphal", "Imphal", "Manipur", 24.817, 93.9368, "north-east", "en"),
  agartala: india("agartala", "Agartala", "Tripura", 23.8315, 91.2868, "north-east", "en"),
  aizawl: india("aizawl", "Aizawl", "Mizoram", 23.7271, 92.7176, "north-east", "en"),
  kohima: india("kohima", "Kohima", "Nagaland", 25.6751, 94.1086, "north-east", "en"),
  itanagar: india("itanagar", "Itanagar", "Arunachal Pradesh", 27.0844, 93.6053, "north-east", "en"),
  // Union Territories
  portBlair: india("portBlair", "Port Blair", "Andaman and Nicobar Islands", 11.6234, 92.7265, "union-territory", "en"),
  puducherry: india("puducherry", "Puducherry", "Puducherry", 11.9416, 79.8083, "union-territory", "ta"),
  kavaratti: india("kavaratti", "Kavaratti", "Lakshadweep", 10.5669, 72.642, "union-territory", "ml"),
  silvassa: india("silvassa", "Silvassa", "Dadra and Nagar Haveli and Daman and Diu", 20.2763, 73.0083, "union-territory", "gu"),
};

export function getIndiaLocations(): PanchangLocation[] {
  return Object.values(INDIA_LOCATIONS);
}

export function getLocationById(id: string): PanchangLocation | null {
  return INDIA_LOCATIONS[id.trim()] ?? null;
}

export function getLocationsByRegion(region: IndiaRegion): PanchangLocation[] {
  return getIndiaLocations().filter((location) => location.region === region);
}

export function getLocationsByState(state: string): PanchangLocation[] {
  const target = state.trim().toLowerCase();
  return getIndiaLocations().filter((location) => (location.state ?? "").toLowerCase() === target);
}

export function findIndiaLocation(query: string): PanchangLocation | null {
  const target = query.trim().toLowerCase();
  if (!target) return null;
  return (
    getIndiaLocations().find((location) =>
      [location.id, location.city, location.name, location.state].filter(Boolean).some((value) => value!.toLowerCase() === target),
    ) ??
    getIndiaLocations().find((location) =>
      [location.city, location.name, location.state].filter(Boolean).some((value) => value!.toLowerCase().includes(target)),
    ) ??
    null
  );
}

// ============================================================================
// NAMES
// ============================================================================

export const TITHIS = [
  "Pratipada",
  "Dvitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
] as const;

export const TITHIS_HINDI = [
  "प्रतिपदा",
  "द्वितीया",
  "तृतीया",
  "चतुर्थी",
  "पंचमी",
  "षष्ठी",
  "सप्तमी",
  "अष्टमी",
  "नवमी",
  "दशमी",
  "एकादशी",
  "द्वादशी",
  "त्रयोदशी",
  "चतुर्दशी",
  "पूर्णिमा",
] as const;

export const NAKSHATRAS = [
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

export const NAKSHATRAS_HINDI = [
  "अश्विनी",
  "भरणी",
  "कृत्तिका",
  "रोहिणी",
  "मृगशिरा",
  "आर्द्रा",
  "पुनर्वसु",
  "पुष्य",
  "आश्लेषा",
  "मघा",
  "पूर्वा फाल्गुनी",
  "उत्तरा फाल्गुनी",
  "हस्त",
  "चित्रा",
  "स्वाती",
  "विशाखा",
  "अनुराधा",
  "ज्येष्ठा",
  "मूल",
  "पूर्वाषाढ़ा",
  "उत्तराषाढ़ा",
  "श्रवण",
  "धनिष्ठा",
  "शतभिषा",
  "पूर्वा भाद्रपद",
  "उत्तरा भाद्रपद",
  "रेवती",
] as const;

export const YOGAS = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shula",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
] as const;

export const KARANAS_MOVABLE = [
  "Bava",
  "Balava",
  "Kaulava",
  "Taitila",
  "Garaja",
  "Vanija",
  "Vishti",
] as const;

export const KARANAS_FIXED = [
  "Shakuni",
  "Chatushpada",
  "Naga",
] as const;

export const RASHIS = [
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

export const RASHIS_HINDI = [
  "मेष",
  "वृषभ",
  "मिथुन",
  "कर्क",
  "सिंह",
  "कन्या",
  "तुला",
  "वृश्चिक",
  "धनु",
  "मकर",
  "कुंभ",
  "मीन",
] as const;

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEKDAYS_HINDI = [
  "रविवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "गुरुवार",
  "शुक्रवार",
  "शनिवार",
] as const;

// ============================================================================
// BASIC MATH
// ============================================================================

export function normalizeDegrees(value: number): number {
  const result = value % 360;
  return result < 0 ? result + 360 : result;
}

export function normalizeRadians(value: number): number {
  const result = value % (Math.PI * 2);
  return result < 0 ? result + Math.PI * 2 : result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

export function round(value: number, decimals = 6): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Forward angular distance from `from` to `to`.
 *
 * Examples:
 * 350 -> 10 = 20°
 * 10 -> 350 = 340°
 * 0 -> 0 = 0°
 */
export function angularDistanceForward(
  from: number,
  to: number,
): number {
  return normalizeDegrees(to - from);
}

/**
 * Signed shortest angular difference.
 */
export function angularDifference(
  from: number,
  to: number,
): number {
  const value = normalizeDegrees(to - from);

  if (value > 180) {
    return value - 360;
  }

  return value;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addHours(date: Date, hours: number): Date {
  return addMinutes(date, hours * 60);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export function differenceMinutes(
  start: Date,
  end: Date,
): number {
  return (end.getTime() - start.getTime()) / 60_000;
}

export function differenceHours(
  start: Date,
  end: Date,
): number {
  return differenceMinutes(start, end) / 60;
}

export function differenceDays(
  start: Date,
  end: Date,
): number {
  return differenceHours(start, end) / 24;
}

export function formatDateISO(date: Date): string {
  return date.toISOString();
}

export function formatDateISOForTimezone(
  date: Date,
  timezone: string,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function getWeekdayIndex(date: Date): number {
  return date.getUTCDay();
}

// ============================================================================
// TIMEZONE
// ============================================================================

function getTimezoneOffsetMinutes(
  date: Date,
  timezone: string,
): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );

  return Math.round((asUTC - date.getTime()) / 60_000);
}

/**
 * Creates a UTC Date representing a local calendar date/time
 * in the supplied IANA timezone.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
  timezone = "Asia/Kolkata",
): Date {
  let guess = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
    ),
  );

  for (let i = 0; i < 4; i += 1) {
    const offset = getTimezoneOffsetMinutes(
      guess,
      timezone,
    );

    const target = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
    );

    const corrected = target - offset * 60_000;

    if (Math.abs(corrected - guess.getTime()) < 1000) {
      return new Date(corrected);
    }

    guess = new Date(corrected);
  }

  return guess;
}

export function getLocalDateParts(
  date: Date,
  timezone: string,
): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekdayName = get("weekday");

  const weekdayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdayMap[weekdayName] ?? 0,
  };
}

export function createDateAnchor(
  date: Date,
  timezone = DEFAULT_LOCATION.timezone,
): Date {
  const parts = getLocalDateParts(date, timezone);

  return zonedTimeToUtc(
    parts.year,
    parts.month,
    parts.day,
    0,
    0,
    0,
    timezone,
  );
}

export function getNextLocalDateAnchor(
  date: Date,
  days = 1,
  timezone = DEFAULT_LOCATION.timezone,
): Date {
  const anchor = createDateAnchor(date, timezone);
  return addDays(anchor, days);
}

// ============================================================================
// LOCATION VALIDATION
// ============================================================================

export function validateLocation(
  location: PanchangLocation,
): PanchangLocation {
  if (
    !location ||
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude)
  ) {
    throw new Error("Invalid Panchang location.");
  }

  if (location.latitude < -90 || location.latitude > 90) {
    throw new Error("Latitude must be between -90 and 90.");
  }

  if (location.longitude < -180 || location.longitude > 180) {
    throw new Error("Longitude must be between -180 and 180.");
  }

  return {
    ...DEFAULT_LOCATION,
    ...location,
    name: location.name ?? `${location.city ?? "Selected location"}, ${location.state ?? "India"}`,
    country: location.country ?? "India",
  };
}

// ============================================================================
// LAHIRI-STYLE AYANAMSHA
// ============================================================================

/**
 * Lahiri-style sidereal ayanamsha approximation.
 *
 * This is deliberately isolated so the entire Panchang engine uses
 * one consistent sidereal reference.
 *
 * For professional ephemeris-grade calculations, replace this function
 * with an exact Lahiri/Swiss-Ephemeris implementation.
 */
export function getLahiriAyanamsha(date: Date): number {
  if (!isValidDate(date)) {
    throw new Error("Invalid date for ayanamsha calculation.");
  }

  const jd =
    date.getTime() / 86_400_000 + 2_440_587.5;

  const t = (jd - 2_451_545.0) / 36_525;

  // Lahiri-style polynomial approximation around J2000.
  const ayanamsha =
    23.853055 +
    1.3969713 * t +
    0.0003086 * t * t;

  return normalizeDegrees(ayanamsha);
}

export function getAyanamsha(date: Date): number {
  return getLahiriAyanamsha(date);
}

// ============================================================================
// ASTRONOMY LONGITUDES
// ============================================================================

export function getTropicalSunLongitude(
  date: Date,
): number {
  const position = Astronomy.SunPosition(date);

  return normalizeDegrees(position.elon);
}

export function getTropicalMoonLongitude(
  date: Date,
): number {
  const moon = Astronomy.EclipticGeoMoon(date);

  return normalizeDegrees(moon.lon);
}

export function getSiderealSunLongitude(
  date: Date,
): number {
  return normalizeDegrees(
    getTropicalSunLongitude(date) -
      getLahiriAyanamsha(date),
  );
}

export function getSiderealMoonLongitude(
  date: Date,
): number {
  return normalizeDegrees(
    getTropicalMoonLongitude(date) -
      getLahiriAyanamsha(date),
  );
}

export function getSunLongitude(
  date: Date,
): number {
  return getSiderealSunLongitude(date);
}

export function getMoonLongitude(
  date: Date,
): number {
  return getSiderealMoonLongitude(date);
}

// ============================================================================
// SIGN HELPERS
// ============================================================================

export function getSolarSignIndex(
  date: Date,
): number {
  return Math.floor(getSiderealSunLongitude(date) / 30);
}

export function getSolarSignName(
  date: Date,
): string {
  return RASHIS[getSolarSignIndex(date)];
}

export function getSolarSignNameHindi(
  date: Date,
): string {
  return RASHIS_HINDI[getSolarSignIndex(date)];
}

export function getRashiIndexFromLongitude(
  longitude: number,
): number {
  return Math.floor(normalizeDegrees(longitude) / 30);
}

export function getRashiNameFromLongitude(
  longitude: number,
): string {
  return RASHIS[getRashiIndexFromLongitude(longitude)];
}

export function getRashiNameHindiFromLongitude(
  longitude: number,
): string {
  return RASHIS_HINDI[
    getRashiIndexFromLongitude(longitude)
  ];
}

export function getDegreeInRashi(
  longitude: number,
): number {
  return normalizeDegrees(longitude) % 30;
}

// ============================================================================
// ANGULAR PROGRESSION
// ============================================================================

export function getTithiAngle(date: Date): number {
  return normalizeDegrees(
    getSiderealMoonLongitude(date) -
      getSiderealSunLongitude(date),
  );
}

export function getYogaAngle(date: Date): number {
  return normalizeDegrees(
    getSiderealMoonLongitude(date) +
      getSiderealSunLongitude(date),
  );
}

export function getNakshatraAngle(date: Date): number {
  return getSiderealMoonLongitude(date);
}

// ============================================================================
// ROBUST NEXT ANGULAR BOUNDARY SEARCH
// ============================================================================

interface AngularBoundaryOptions {
  stepMinutes?: number;
  maxHours?: number;
  toleranceSeconds?: number;
}

/**
 * Finds the next point at which a monotonically advancing angular quantity
 * reaches the next target boundary.
 *
 * IMPORTANT FIX:
 * We do NOT compare signed angular differences directly.
 *
 * Instead:
 * 1. Capture the current angle.
 * 2. Calculate the forward angular distance to target.
 * 3. Track continuous forward progression.
 * 4. Detect crossing.
 * 5. Binary-search the crossing.
 *
 * This prevents 0°/360° boundary failures.
 */
export function findNextAngularBoundary(
  date: Date,
  getAngle: (date: Date) => number,
  targetAngle: number,
  options: AngularBoundaryOptions = {},
): Date | null {
  if (!isValidDate(date)) {
    return null;
  }

  const stepMinutes = options.stepMinutes ?? 10;
  const maxHours = options.maxHours ?? 48;
  const toleranceSeconds =
    options.toleranceSeconds ?? 1;

  const startAngle = normalizeDegrees(getAngle(date));
  const target = normalizeDegrees(targetAngle);

  let requiredDistance = angularDistanceForward(
    startAngle,
    target,
  );

  // If exactly on boundary, move to the NEXT occurrence.
  if (requiredDistance < 1e-9) {
    requiredDistance = 360;
  }

  let previousDate = cloneDate(date);
  let previousAngle = startAngle;
  let previousProgress = 0;

  const maxIterations = Math.ceil(
    (maxHours * 60) / stepMinutes,
  );

  for (let i = 1; i <= maxIterations; i += 1) {
    const currentDate = addMinutes(
      date,
      i * stepMinutes,
    );

    const currentAngle = normalizeDegrees(
      getAngle(currentDate),
    );

    const delta = angularDistanceForward(
      previousAngle,
      currentAngle,
    );

    // Avoid pathological reverse-motion jumps.
    // Astronomy quantities used here are effectively monotonic
    // over the short search window.
    const progress = previousProgress + delta;

    if (progress + 1e-7 >= requiredDistance) {
      let low = previousDate;
      let high = currentDate;

      for (;;) {
        const width =
          high.getTime() - low.getTime();

        if (
          width <=
          toleranceSeconds * 1000
        ) {
          return new Date(
            (low.getTime() + high.getTime()) / 2,
          );
        }

        const middle = new Date(
          (low.getTime() + high.getTime()) / 2,
        );

        let middleProgress = 0;

        const middleAngle = normalizeDegrees(
          getAngle(middle),
        );

        middleProgress =
          angularDistanceForward(
            startAngle,
            middleAngle,
          );

        // Handle a possible full-cycle wrap.
        if (
          middleProgress + 1e-7 >=
          requiredDistance
        ) {
          high = middle;
        } else {
          low = middle;
        }
      }
    }

    previousDate = currentDate;
    previousAngle = currentAngle;
    previousProgress = progress;
  }

  return null;
}

// ============================================================================
// PREVIOUS ANGULAR BOUNDARY SEARCH
// ============================================================================

export function findPreviousAngularBoundary(
  date: Date,
  getAngle: (date: Date) => number,
  targetAngle: number,
  options: AngularBoundaryOptions = {},
): Date | null {
  if (!isValidDate(date)) {
    return null;
  }

  const stepMinutes = options.stepMinutes ?? 10;
  const maxHours = options.maxHours ?? 48;
  const toleranceSeconds =
    options.toleranceSeconds ?? 1;

  const startAngle = normalizeDegrees(getAngle(date));
  const target = normalizeDegrees(targetAngle);

  let requiredDistance = angularDistanceForward(
    target,
    startAngle,
  );

  if (requiredDistance < 1e-9) {
    requiredDistance = 360;
  }

  let previousDate = cloneDate(date);
  let previousAngle = startAngle;
  let previousProgress = 0;

  const maxIterations = Math.ceil(
    (maxHours * 60) / stepMinutes,
  );

  for (let i = 1; i <= maxIterations; i += 1) {
    const currentDate = addMinutes(
      date,
      -i * stepMinutes,
    );

    const currentAngle = normalizeDegrees(
      getAngle(currentDate),
    );

    const delta = angularDistanceForward(
      currentAngle,
      previousAngle,
    );

    const progress =
      previousProgress + delta;

    if (progress + 1e-7 >= requiredDistance) {
      let low = currentDate;
      let high = previousDate;

      for (;;) {
        const width =
          high.getTime() - low.getTime();

        if (
          width <=
          toleranceSeconds * 1000
        ) {
          return new Date(
            (low.getTime() + high.getTime()) / 2,
          );
        }

        const middle = new Date(
          (low.getTime() + high.getTime()) / 2,
        );

        const middleAngle = normalizeDegrees(
          getAngle(middle),
        );

        const distanceFromMiddleToStart =
          angularDistanceForward(
            middleAngle,
            startAngle,
          );

        if (
          distanceFromMiddleToStart + 1e-7 >=
          requiredDistance
        ) {
          low = middle;
        } else {
          high = middle;
        }
      }
    }

    previousDate = currentDate;
    previousAngle = currentAngle;
    previousProgress = progress;
  }

  return null;
}

// ============================================================================
// TITHI
// ============================================================================

export function getTithiIndex(date: Date): number {
  const angle = getTithiAngle(date);

  return Math.floor(angle / 12);
}

export function getTithiName(
  index: number,
): string {
  const normalized = ((index % 30) + 30) % 30;

  return TITHIS[normalized % 15];
}

export function getTithiNameHindi(
  index: number,
): string {
  const normalized = ((index % 30) + 30) % 30;

  return TITHIS_HINDI[normalized % 15];
}

export function getTithiPaksha(
  index: number,
): "Shukla" | "Krishna" {
  return index < 15 ? "Shukla" : "Krishna";
}

export function getTithiPakshaHindi(
  index: number,
): "शुक्ल" | "कृष्ण" {
  return index < 15 ? "शुक्ल" : "कृष्ण";
}

export function getTithiBoundaryAngle(
  index: number,
): number {
  return normalizeDegrees(index * 12);
}

export function getTithiStart(
  date: Date,
): Date | null {
  const index = getTithiIndex(date);

  return findPreviousAngularBoundary(
    date,
    getTithiAngle,
    getTithiBoundaryAngle(index),
    {
      stepMinutes: 10,
      maxHours: 30,
    },
  );
}

export function getTithiEnd(
  date: Date,
): Date | null {
  const index = getTithiIndex(date);

  return findNextAngularBoundary(
    date,
    getTithiAngle,
    getTithiBoundaryAngle(index + 1),
    {
      stepMinutes: 10,
      maxHours: 30,
    },
  );
}

export function getTithi(
  date: Date,
): TithiResult {
  const angle = getTithiAngle(date);
  const index = clamp(
    Math.floor(angle / 12),
    0,
    29,
  );

  const elapsedDegrees =
    angle - index * 12;

  const remainingDegrees =
    12 - elapsedDegrees;

  const start = getTithiStart(date);
  const end = getTithiEnd(date);

  const remainingMinutes =
    end && end.getTime() > date.getTime()
      ? differenceMinutes(date, end)
      : null;

  return {
    index,
    number: index + 1,
    name: getTithiName(index),
    paksha: getTithiPaksha(index),
    pakshaHindi: getTithiPakshaHindi(index),
    percentage: clamp(
      (elapsedDegrees / 12) * 100,
      0,
      100,
    ),
    elapsedDegrees,
    remainingDegrees,
    start,
    end,
    remainingMinutes,
    isPurnima: index === 14,
    isAmavasya: index === 29,
  };
}

// ============================================================================
// NAKSHATRA
// ============================================================================

export const NAKSHATRA_SPAN =
  360 / 27;

export const PADA_SPAN =
  NAKSHATRA_SPAN / 4;

export function getNakshatraIndex(
  longitude: number,
): number {
  return Math.floor(
    normalizeDegrees(longitude) /
      NAKSHATRA_SPAN,
  );
}

export function getNakshatraName(
  index: number,
): string {
  const normalized =
    ((index % 27) + 27) % 27;

  return NAKSHATRAS[normalized];
}

export function getNakshatraNameHindi(
  index: number,
): string {
  const normalized =
    ((index % 27) + 27) % 27;

  return NAKSHATRAS_HINDI[normalized];
}

export function getNakshatraPada(
  longitude: number,
): number {
  const normalized =
    normalizeDegrees(longitude);

  const positionInNakshatra =
    normalized % NAKSHATRA_SPAN;

  return clamp(
    Math.floor(
      positionInNakshatra / PADA_SPAN,
    ) + 1,
    1,
    4,
  );
}

export function getNakshatraStart(
  date: Date,
): Date | null {
  const longitude =
    getSiderealMoonLongitude(date);

  const index =
    getNakshatraIndex(longitude);

  const boundary =
    index * NAKSHATRA_SPAN;

  return findPreviousAngularBoundary(
    date,
    getNakshatraAngle,
    boundary,
    {
      stepMinutes: 10,
      maxHours: 36,
    },
  );
}

export function getNakshatraEnd(
  date: Date,
): Date | null {
  const longitude =
    getSiderealMoonLongitude(date);

  const index =
    getNakshatraIndex(longitude);

  const boundary =
    (index + 1) * NAKSHATRA_SPAN;

  return findNextAngularBoundary(
    date,
    getNakshatraAngle,
    boundary,
    {
      stepMinutes: 10,
      maxHours: 36,
    },
  );
}

export function getNakshatra(
  date: Date,
): NakshatraResult {
  const longitude =
    getSiderealMoonLongitude(date);

  const index =
    getNakshatraIndex(longitude);

  const positionInNakshatra =
    longitude -
    index * NAKSHATRA_SPAN;

  const elapsedDegrees =
    positionInNakshatra;

  const remainingDegrees =
    NAKSHATRA_SPAN -
    elapsedDegrees;

  const start =
    getNakshatraStart(date);

  const end =
    getNakshatraEnd(date);

  const remainingMinutes =
    end && end.getTime() > date.getTime()
      ? differenceMinutes(date, end)
      : null;

  return {
    index,
    number: index + 1,
    name: getNakshatraName(index),
    pada: getNakshatraPada(longitude),
    percentage: clamp(
      (elapsedDegrees / NAKSHATRA_SPAN) *
        100,
      0,
      100,
    ),
    elapsedDegrees,
    remainingDegrees,
    start,
    end,
    remainingMinutes,
  };
}

// ============================================================================
// YOGA
// ============================================================================

export const YOGA_SPAN = 360 / 27;

export function getYogaIndex(
  date: Date,
): number {
  return Math.floor(
    getYogaAngle(date) /
      YOGA_SPAN,
  );
}

export function getYogaName(
  index: number,
): string {
  const normalized =
    ((index % 27) + 27) % 27;

  return YOGAS[normalized];
}

export function getYogaStart(
  date: Date,
): Date | null {
  const angle =
    getYogaAngle(date);

  const index =
    Math.floor(angle / YOGA_SPAN);

  const boundary =
    index * YOGA_SPAN;

  return findPreviousAngularBoundary(
    date,
    getYogaAngle,
    boundary,
    {
      stepMinutes: 10,
      maxHours: 36,
    },
  );
}

export function getYogaEnd(
  date: Date,
): Date | null {
  const angle =
    getYogaAngle(date);

  const index =
    Math.floor(angle / YOGA_SPAN);

  const boundary =
    (index + 1) * YOGA_SPAN;

  return findNextAngularBoundary(
    date,
    getYogaAngle,
    boundary,
    {
      stepMinutes: 10,
      maxHours: 36,
    },
  );
}

export function getYoga(
  date: Date,
): YogaResult {
  const angle =
    getYogaAngle(date);

  const index =
    Math.floor(angle / YOGA_SPAN);

  const elapsedDegrees =
    angle - index * YOGA_SPAN;

  const remainingDegrees =
    YOGA_SPAN -
    elapsedDegrees;

  const start =
    getYogaStart(date);

  const end =
    getYogaEnd(date);

  const remainingMinutes =
    end && end.getTime() > date.getTime()
      ? differenceMinutes(date, end)
      : null;

  return {
    index,
    number: index + 1,
    name: getYogaName(index),
    percentage: clamp(
      (elapsedDegrees / YOGA_SPAN) * 100,
      0,
      100,
    ),
    elapsedDegrees,
    remainingDegrees,
    start,
    end,
    remainingMinutes,
  };
}

// ============================================================================
// KARANA
// ============================================================================

/**
 * There are 60 Karana slots in a lunar month.
 *
 * Slot 0:
 *   Kimstughna
 *
 * Slots 1–56:
 *   Seven movable Karanas repeated 8 times.
 *
 * Slots 57–59:
 *   Shakuni
 *   Chatushpada
 *   Naga
 */
export function getKaranaIndex(
  date: Date,
): number {
  const tithiAngle =
    getTithiAngle(date);

  const tithiIndex =
    Math.floor(tithiAngle / 12);

  const halfProgress =
    (tithiAngle -
      tithiIndex * 12) /
    6;

  return clamp(
    tithiIndex * 2 +
      Math.floor(halfProgress),
    0,
    59,
  );
}

export function getKaranaName(
  index: number,
): string {
  const normalized =
    clamp(Math.floor(index), 0, 59);

  if (normalized === 0) {
    return "Kimstughna";
  }

  if (normalized >= 1 && normalized <= 56) {
    return KARANAS_MOVABLE[
      (normalized - 1) % 7
    ];
  }

  if (normalized === 57) {
    return "Shakuni";
  }

  if (normalized === 58) {
    return "Chatushpada";
  }

  return "Naga";
}

export function getKaranaType(
  index: number,
): KaranaResult["type"] {
  if (index === 0) {
    return "kimstughna";
  }

  if (index >= 1 && index <= 56) {
    return "movable";
  }

  if (index === 57) {
    return "shakuni";
  }

  if (index === 58) {
    return "chatushpada";
  }

  return "naga";
}

export function getKaranaStart(
  date: Date,
): Date | null {
  const tithiAngle =
    getTithiAngle(date);

  const slotAngle =
    Math.floor(tithiAngle / 6) * 6;

  return findPreviousAngularBoundary(
    date,
    getTithiAngle,
    slotAngle,
    {
      stepMinutes: 5,
      maxHours: 18,
    },
  );
}

export function getKaranaEnd(
  date: Date,
): Date | null {
  const tithiAngle =
    getTithiAngle(date);

  const slotAngle =
    (Math.floor(tithiAngle / 6) + 1) * 6;

  return findNextAngularBoundary(
    date,
    getTithiAngle,
    slotAngle,
    {
      stepMinutes: 5,
      maxHours: 18,
    },
  );
}

export function getKarana(
  date: Date,
): KaranaResult {
  const angle =
    getTithiAngle(date);

  const karanaIndex =
    getKaranaIndex(date);

  const slotStart =
    Math.floor(angle / 6) * 6;

  const elapsedDegrees =
    angle - slotStart;

  const remainingDegrees =
    6 - elapsedDegrees;

  const start =
    getKaranaStart(date);

  const end =
    getKaranaEnd(date);

  const remainingMinutes =
    end && end.getTime() > date.getTime()
      ? differenceMinutes(date, end)
      : null;

  return {
    index: karanaIndex,
    number: karanaIndex + 1,
    name: getKaranaName(karanaIndex),
    type: getKaranaType(karanaIndex),
    percentage: clamp(
      (elapsedDegrees / 6) * 100,
      0,
      100,
    ),
    elapsedDegrees,
    remainingDegrees,
    start,
    end,
    remainingMinutes,
  };
}

// ============================================================================
// SIDEREAL AMAVASYA / PURNIMA
// ============================================================================

/**
 * FIX:
 *
 * We intentionally do NOT use:
 *
 *   Astronomy.SearchMoonPhase(0, ...)
 *
 * because that represents a tropical lunar phase reference,
 * while this Panchang engine determines Tithi from sidereal
 * Sun/Moon longitudes.
 *
 * Amavasya is therefore searched using the same sidereal
 * Moon-Sun angular difference used by Tithi.
 */

export function findNextAmavasya(
  date: Date,
): Date | null {
  const angle =
    getTithiAngle(date);

  const currentTithi =
    Math.floor(angle / 12);

  const target =
    currentTithi < 29
      ? 348
      : 360;

  return findNextAngularBoundary(
    date,
    getTithiAngle,
    target,
    {
      stepMinutes: 10,
      maxHours: 48,
    },
  );
}

export function findPreviousAmavasya(
  date: Date,
): Date | null {
  const angle =
    getTithiAngle(date);

  const currentTithi =
    Math.floor(angle / 12);

  const target =
    currentTithi > 0
      ? currentTithi * 12
      : 0;

  return findPreviousAngularBoundary(
    date,
    getTithiAngle,
    target,
    {
      stepMinutes: 10,
      maxHours: 48,
    },
  );
}

export function findNextPurnima(
  date: Date,
): Date | null {
  const angle =
    getTithiAngle(date);

  const currentTithi =
    Math.floor(angle / 12);

  const target =
    currentTithi < 14
      ? 168
      : currentTithi < 29
        ? 348
        : 360 + 168;

  return findNextAngularBoundary(
    date,
    getTithiAngle,
    target,
    {
      stepMinutes: 10,
      maxHours: 48,
    },
  );
}

export function findPreviousPurnima(
  date: Date,
): Date | null {
  const angle =
    getTithiAngle(date);

  const currentTithi =
    Math.floor(angle / 12);

  const target =
    currentTithi > 14
      ? 348
      : currentTithi > 0
        ? 168
        : 168 - 360;

  return findPreviousAngularBoundary(
    date,
    getTithiAngle,
    normalizeDegrees(target),
    {
      stepMinutes: 10,
      maxHours: 48,
    },
  );
}

// ============================================================================
// ASTRONOMY OBSERVER
// ============================================================================

function createObserver(
  location: PanchangLocation,
): Astronomy.Observer {
  return new Astronomy.Observer(
    location.latitude,
    location.longitude,
    0,
  );
}

// ============================================================================
// SUNRISE / SUNSET
// ============================================================================

function searchRiseSet(
  body: Astronomy.Body,
  date: Date,
  location: PanchangLocation,
  direction: 1 | -1,
): Date | null {
  try {
    const observer =
      createObserver(location);

    const result =
      Astronomy.SearchRiseSet(
        body,
        observer,
        direction,
        date,
        1.5,
      );

    return result
      ? result.date
      : null;
  } catch {
    return null;
  }
}

function isSameLocalDate(
  dateA: Date | null,
  dateB: Date,
  timezone: string,
): boolean {
  if (!dateA) {
    return false;
  }

  return (
    formatDateISOForTimezone(
      dateA,
      timezone,
    ) ===
    formatDateISOForTimezone(
      dateB,
      timezone,
    )
  );
}

export function getSolarTimes(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): SolarTimes {
  const safeLocation =
    validateLocation(location);

  const anchor =
    createDateAnchor(
      date,
      safeLocation.timezone,
    );

  const sunrise =
    searchRiseSet(
      Astronomy.Body.Sun,
      anchor,
      safeLocation,
      1,
    );

  const sunset =
    searchRiseSet(
      Astronomy.Body.Sun,
      anchor,
      safeLocation,
      -1,
    );

  let safeSunrise =
    isSameLocalDate(
      sunrise,
      anchor,
      safeLocation.timezone,
    )
      ? sunrise
      : null;

  let safeSunset =
    isSameLocalDate(
      sunset,
      anchor,
      safeLocation.timezone,
    )
      ? sunset
      : null;

  if (!safeSunrise) {
    const next =
      searchRiseSet(
        Astronomy.Body.Sun,
        addHours(anchor, -12),
        safeLocation,
        1,
      );

    safeSunrise =
      isSameLocalDate(
        next,
        anchor,
        safeLocation.timezone,
      )
        ? next
        : null;
  }

  if (!safeSunset) {
    const next =
      searchRiseSet(
        Astronomy.Body.Sun,
        addHours(anchor, -6),
        safeLocation,
        -1,
      );

    safeSunset =
      isSameLocalDate(
        next,
        anchor,
        safeLocation.timezone,
      )
        ? next
        : null;
  }

  let dawn: Date | null = null;
  let dusk: Date | null = null;

  try {
    const observer =
      createObserver(safeLocation);

    const dawnResult =
      Astronomy.SearchAltitude(
        Astronomy.Body.Sun,
        observer,
        1,
        anchor,
        0.5,
        -6,
      );

    const duskResult =
      Astronomy.SearchAltitude(
        Astronomy.Body.Sun,
        observer,
        -1,
        anchor,
        0.5,
        -6,
      );

    dawn = dawnResult?.date ?? null;
    dusk = duskResult?.date ?? null;
  } catch {
    dawn = null;
    dusk = null;
  }

  return {
    sunrise: safeSunrise,
    sunset: safeSunset,
    dawn,
    dusk,
  };
}

// ============================================================================
// MOONRISE / MOONSET
// ============================================================================

export function getLunarTimes(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): LunarTimes {
  const safeLocation =
    validateLocation(location);

  const anchor =
    createDateAnchor(
      date,
      safeLocation.timezone,
    );

  const moonrise =
    searchRiseSet(
      Astronomy.Body.Moon,
      addHours(anchor, -6),
      safeLocation,
      1,
    );

  const moonset =
    searchRiseSet(
      Astronomy.Body.Moon,
      addHours(anchor, -6),
      safeLocation,
      -1,
    );

  return {
    moonrise: isSameLocalDate(
      moonrise,
      anchor,
      safeLocation.timezone,
    )
      ? moonrise
      : null,

    moonset: isSameLocalDate(
      moonset,
      anchor,
      safeLocation.timezone,
    )
      ? moonset
      : null,
  };
}

// ============================================================================
// SOLAR SIGN
// ============================================================================

export function getSolarSign(
  date: Date,
): SolarSignResult {
  const longitude =
    getSiderealSunLongitude(date);

  const index =
    getRashiIndexFromLongitude(longitude);

  const degreeInSign =
    getDegreeInRashi(longitude);

  const previousIngress =
    findPreviousSolarIngress(
      date,
    );

  const nextIngress =
    findNextSolarIngress(
      date,
    );

  return {
    index,
    number: index + 1,
    name: RASHIS[index],
    nameHindi: RASHIS_HINDI[index],
    longitude,
    degreeInSign,
    ingress: previousIngress,
    nextIngress,
  };
}

// ============================================================================
// SOLAR INGRESS / SANKRANTI
// ============================================================================

export function findNextSolarIngress(
  date: Date,
): Date | null {
  const currentLongitude =
    getSiderealSunLongitude(date);

  const currentSign =
    Math.floor(
      currentLongitude / 30,
    );

  const target =
    (currentSign + 1) * 30;

  return findNextAngularBoundary(
    date,
    getSiderealSunLongitude,
    target,
    {
      stepMinutes: 60,
      maxHours: 800,
      toleranceSeconds: 2,
    },
  );
}

export function findPreviousSolarIngress(
  date: Date,
): Date | null {
  const currentLongitude =
    getSiderealSunLongitude(date);

  const currentSign =
    Math.floor(
      currentLongitude / 30,
    );

  const target =
    currentSign * 30;

  return findPreviousAngularBoundary(
    date,
    getSiderealSunLongitude,
    target,
    {
      stepMinutes: 60,
      maxHours: 800,
      toleranceSeconds: 2,
    },
  );
}

export function getNextSankranti(
  date: Date,
): Date | null {
  return findNextSolarIngress(date);
}

export function getPreviousSankranti(
  date: Date,
): Date | null {
  return findPreviousSolarIngress(date);
}

export function countSolarTransitions(
  start: Date,
  end: Date,
): number {
  if (
    !isValidDate(start) ||
    !isValidDate(end) ||
    end <= start
  ) {
    return 0;
  }

  let count = 0;
  let cursor = cloneDate(start);

  const maxTransitions = Math.ceil(
    differenceDays(start, end) / 25,
  ) + 3;

  for (
    let i = 0;
    i < maxTransitions;
    i += 1
  ) {
    const ingress =
      findNextSolarIngress(cursor);

    if (
      !ingress ||
      ingress >= end
    ) {
      break;
    }

    if (ingress > start) {
      count += 1;
    }

    cursor = addMinutes(
      ingress,
      2,
    );
  }

  return count;
}

// ============================================================================
// LUNAR MONTH
// ============================================================================

const LUNAR_MONTH_NAMES = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashwin",
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
] as const;

const LUNAR_MONTH_NAMES_HINDI = [
  "चैत्र",
  "वैशाख",
  "ज्येष्ठ",
  "आषाढ़",
  "श्रावण",
  "भाद्रपद",
  "आश्विन",
  "कार्तिक",
  "मार्गशीर्ष",
  "पौष",
  "माघ",
  "फाल्गुन",
] as const;

/**
 * Foundation mapping for an Amanta-style Indian lunar calendar.
 *
 * Regional Panchang systems differ:
 * - Amanta
 * - Purnimanta
 * - Tamil
 * - Malayalam
 * - Bengali
 * etc.
 *
 * This engine keeps the core astronomical boundary calculation
 * separate from regional naming.
 */
export function getLunarMonthIndexFromSolarSign(
  solarSignIndex: number,
): number {
  return (
    (solarSignIndex + 1) % 12
  );
}

export function getLunarMonthName(
  index: number,
): string {
  return LUNAR_MONTH_NAMES[
    ((index % 12) + 12) % 12
  ];
}

export function getLunarMonthNameHindi(
  index: number,
): string {
  return LUNAR_MONTH_NAMES_HINDI[
    ((index % 12) + 12) % 12
  ];
}

export function getLunarMonthIndex(
  date: Date,
): number {
  const previousAmavasya =
    findPreviousAmavasya(date);

  if (!previousAmavasya) {
    return 0;
  }

  const solarSign =
    getSolarSignIndex(
      previousAmavasya,
    );

  return getLunarMonthIndexFromSolarSign(
    solarSign,
  );
}

export function isAdhikMaas(
  date: Date,
): boolean {
  const previousAmavasya =
    findPreviousAmavasya(date);

  const nextAmavasya =
    findNextAmavasya(date);

  if (
    !previousAmavasya ||
    !nextAmavasya
  ) {
    return false;
  }

  return (
    countSolarTransitions(
      previousAmavasya,
      nextAmavasya,
    ) === 0
  );
}

export function getLunarMonth(
  date: Date,
  options: PanchangOptions = {},
): LunarMonthResult {
  const system = options.lunarMonthSystem ?? "amanta";
  const previousAmavasya =
    findPreviousAmavasya(date);
  const nextAmavasya =
    findNextAmavasya(date);

  const reference =
    system === "purnimanta"
      ? findPreviousPurnima(date) ?? previousAmavasya ?? date
      : previousAmavasya ?? date;

  const solarSignIndex =
    getSolarSignIndex(reference);

  const index =
    getLunarMonthIndexFromSolarSign(
      solarSignIndex,
    );

  const isAdhik =
    previousAmavasya &&
    nextAmavasya
      ? countSolarTransitions(
          previousAmavasya,
          nextAmavasya,
        ) === 0
      : false;

  return {
    index,
    number: index + 1,
    name: getLunarMonthName(index),
    nameHindi:
      getLunarMonthNameHindi(index),
    isAdhik,
    solarSignIndex,
    solarSignName:
      RASHIS[solarSignIndex],
    amavasyaStart:
      previousAmavasya,
    nextAmavasya,
  };
}

// ============================================================================
// CHOGHADIYA
// ============================================================================

export const CHOGHADIYA_NAMES = [
  "Udveg",
  "Chal",
  "Labh",
  "Amrit",
  "Kaal",
  "Shubh",
  "Rog",
] as const;

export const CHOGHADIYA_NAMES_HINDI = [
  "उद्वेग",
  "चल",
  "लाभ",
  "अमृत",
  "काल",
  "शुभ",
  "रोग",
] as const;

const CHOGHADIYA_QUALITY: Record<
  string,
  ChoghadiyaItem["quality"]
> = {
  Udveg: "inauspicious",
  Chal: "neutral",
  Labh: "auspicious",
  Amrit: "auspicious",
  Kaal: "inauspicious",
  Shubh: "auspicious",
  Rog: "inauspicious",
};

/**
 * Classical daytime sequence by weekday.
 *
 * Index:
 * 0 Sunday
 * 1 Monday
 * ...
 * 6 Saturday
 */
const DAY_CHOGHADIYA: readonly string[][] = [
  [
    "Udveg",
    "Chal",
    "Labh",
    "Amrit",
    "Kaal",
    "Shubh",
    "Rog",
    "Udveg",
  ],
  [
    "Amrit",
    "Kaal",
    "Shubh",
    "Rog",
    "Udveg",
    "Chal",
    "Labh",
    "Amrit",
  ],
  [
    "Rog",
    "Udveg",
    "Chal",
    "Labh",
    "Amrit",
    "Kaal",
    "Shubh",
    "Rog",
  ],
  [
    "Labh",
    "Amrit",
    "Kaal",
    "Shubh",
    "Rog",
    "Udveg",
    "Chal",
    "Labh",
  ],
  [
    "Shubh",
    "Rog",
    "Udveg",
    "Chal",
    "Labh",
    "Amrit",
    "Kaal",
    "Shubh",
  ],
  [
    "Chal",
    "Labh",
    "Amrit",
    "Kaal",
    "Shubh",
    "Rog",
    "Udveg",
    "Chal",
  ],
  [
    "Kaal",
    "Shubh",
    "Rog",
    "Udveg",
    "Chal",
    "Labh",
    "Amrit",
    "Kaal",
  ],
];

const NIGHT_CHOGHADIYA: readonly string[][] = [
  [
    "Shubh",
    "Amrit",
    "Chal",
    "Rog",
    "Kaal",
    "Labh",
    "Udveg",
    "Shubh",
  ],
  [
    "Chal",
    "Rog",
    "Kaal",
    "Labh",
    "Udveg",
    "Shubh",
    "Amrit",
    "Chal",
  ],
  [
    "Rog",
    "Kaal",
    "Labh",
    "Udveg",
    "Shubh",
    "Amrit",
    "Chal",
    "Rog",
  ],
  [
    "Kaal",
    "Labh",
    "Udveg",
    "Shubh",
    "Amrit",
    "Chal",
    "Rog",
    "Kaal",
  ],
  [
    "Labh",
    "Udveg",
    "Shubh",
    "Amrit",
    "Chal",
    "Rog",
    "Kaal",
    "Labh",
  ],
  [
    "Amrit",
    "Chal",
    "Rog",
    "Kaal",
    "Labh",
    "Udveg",
    "Shubh",
    "Amrit",
  ],
  [
    "Udveg",
    "Shubh",
    "Amrit",
    "Chal",
    "Rog",
    "Kaal",
    "Labh",
    "Udveg",
  ],
];

export function getChoghadiya(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): ChoghadiyaItem[] {
  const solar =
    getSolarTimes(date, location);

  if (
    !solar.sunrise ||
    !solar.sunset ||
    solar.sunset <= solar.sunrise
  ) {
    return [];
  }

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  const sequence =
    DAY_CHOGHADIYA[weekday];

  const duration =
    differenceMinutes(
      solar.sunrise,
      solar.sunset,
    ) / 8;

  return sequence.map(
    (name, index) => {
      const start =
        addMinutes(
          solar.sunrise!,
          index * duration,
        );

      const end =
        addMinutes(
          start,
          duration,
        );

      const hindiIndex =
        CHOGHADIYA_NAMES.indexOf(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name as any,
        );

      return {
        index,
        name,
        nameHindi:
          CHOGHADIYA_NAMES_HINDI[
            hindiIndex >= 0
              ? hindiIndex
              : 0
          ],
        quality:
          CHOGHADIYA_QUALITY[name] ??
          "neutral",
        start,
        end,
        durationMinutes: duration,
        isDay: true,
      };
    },
  );
}

export function getNightChoghadiya(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): ChoghadiyaItem[] {
  const solar =
    getSolarTimes(date, location);

  if (
    !solar.sunset
  ) {
    return [];
  }

  const nextDate =
    getNextLocalDateAnchor(
      date,
      1,
      location.timezone,
    );

  const nextSolar =
    getSolarTimes(
      nextDate,
      location,
    );

  if (
    !nextSolar.sunrise ||
    nextSolar.sunrise <= solar.sunset
  ) {
    return [];
  }

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  const sequence =
    NIGHT_CHOGHADIYA[weekday];

  const duration =
    differenceMinutes(
      solar.sunset,
      nextSolar.sunrise,
    ) / 8;

  return sequence.map(
    (name, index) => {
      const start =
        addMinutes(
          solar.sunset!,
          index * duration,
        );

      const end =
        addMinutes(
          start,
          duration,
        );

      const hindiIndex =
        CHOGHADIYA_NAMES.indexOf(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name as any,
        );

      return {
        index,
        name,
        nameHindi:
          CHOGHADIYA_NAMES_HINDI[
            hindiIndex >= 0
              ? hindiIndex
              : 0
          ],
        quality:
          CHOGHADIYA_QUALITY[name] ??
          "neutral",
        start,
        end,
        durationMinutes: duration,
        isDay: false,
      };
    },
  );
}

// ============================================================================
// DAY SEGMENT HELPERS
// ============================================================================

function getDaySegment(
  sunrise: Date,
  sunset: Date,
  segment: number,
): {
  start: Date;
  end: Date;
} {
  const duration =
    differenceMinutes(
      sunrise,
      sunset,
    ) / 8;

  const start =
    addMinutes(
      sunrise,
      segment * duration,
    );

  return {
    start,
    end: addMinutes(
      start,
      duration,
    ),
  };
}

// ============================================================================
// RAHUKAAL
// ============================================================================

export const RAHUKAAL_SEGMENTS = [
  7, // Sunday
  1, // Monday
  6, // Tuesday
  4, // Wednesday
  5, // Thursday
  3, // Friday
  2, // Saturday
] as const;

export function getRahukaal(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): RahukaalResult | null {
  const solar =
    getSolarTimes(date, location);

  if (
    !solar.sunrise ||
    !solar.sunset
  ) {
    return null;
  }

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  const segment =
    RAHUKAAL_SEGMENTS[weekday];

  const result =
    getDaySegment(
      solar.sunrise,
      solar.sunset,
      segment,
    );

  return {
    ...result,
    durationMinutes:
      differenceMinutes(
        result.start,
        result.end,
      ),
    segment: segment + 1,
  };
}

// ============================================================================
// YAMAGANDA
// ============================================================================

export const YAMAGANDA_SEGMENTS = [
  4, // Sunday
  3, // Monday
  2, // Tuesday
  1, // Wednesday
  0, // Thursday
  6, // Friday
  5, // Saturday
] as const;

export function getYamaganda(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): YamagandaResult | null {
  const solar =
    getSolarTimes(date, location);

  if (
    !solar.sunrise ||
    !solar.sunset
  ) {
    return null;
  }

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  const segment =
    YAMAGANDA_SEGMENTS[weekday];

  const result =
    getDaySegment(
      solar.sunrise,
      solar.sunset,
      segment,
    );

  return {
    ...result,
    durationMinutes:
      differenceMinutes(
        result.start,
        result.end,
      ),
    segment: segment + 1,
  };
}

// ============================================================================
// GULIKA / MANDI
// ============================================================================

export const GULIKA_SEGMENTS = [
  6, // Sunday
  5, // Monday
  4, // Tuesday
  3, // Wednesday
  2, // Thursday
  1, // Friday
  0, // Saturday
] as const;

export function getGulika(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): GulikaResult | null {
  const solar =
    getSolarTimes(date, location);

  if (
    !solar.sunrise ||
    !solar.sunset
  ) {
    return null;
  }

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  const segment =
    GULIKA_SEGMENTS[weekday];

  const result =
    getDaySegment(
      solar.sunrise,
      solar.sunset,
      segment,
    );

  return {
    ...result,
    durationMinutes:
      differenceMinutes(
        result.start,
        result.end,
      ),
    segment: segment + 1,
  };
}

// ============================================================================
// ABHIJIT MUHURAT
// ============================================================================

export function getAbhijitMuhurat(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): AbhijitResult | null {
  const solar =
    getSolarTimes(date, location);

  if (
    !solar.sunrise ||
    !solar.sunset
  ) {
    return null;
  }

  const dayDuration =
    differenceMinutes(
      solar.sunrise,
      solar.sunset,
    );

  const duration =
    dayDuration / 15;

  const midpoint =
    new Date(
      (
        solar.sunrise.getTime() +
        solar.sunset.getTime()
      ) / 2,
    );

  const start =
    addMinutes(
      midpoint,
      -duration / 2,
    );

  const end =
    addMinutes(
      midpoint,
      duration / 2,
    );

  return {
    start,
    end,
    durationMinutes: duration,
  };
}

// ============================================================================
// BRAHMA MUHURAT
// ============================================================================

export function getBrahmaMuhurat(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): BrahmaMuhuratResult | null {
  const solar =
    getSolarTimes(date, location);

  if (!solar.sunrise) {
    return null;
  }

  const end =
    solar.sunrise;

  const start =
    addMinutes(
      end,
      -96,
    );

  return {
    start,
    end,
    durationMinutes: 96,
  };
}

// ============================================================================
// DUR MUHURAT
// ============================================================================

export function getDurMuhurat(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): DurMuhuratResult[] {
  const solar =
    getSolarTimes(date, location);

  if (
    !solar.sunrise ||
    !solar.sunset
  ) {
    return [];
  }

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  // Traditional application-level approximation:
  // two Dur Muhurat windows are derived from daytime.
  //
  // These should later be replaced with a dedicated regional
  // Drik Panchang Dur Muhurat implementation if required.
  const dayDuration =
    differenceMinutes(
      solar.sunrise,
      solar.sunset,
    );

  const segment =
    dayDuration / 15;

  const firstOffset =
    ((weekday + 1) % 7) * segment;

  const secondOffset =
    ((weekday + 5) % 7) * segment;

  const firstStart =
    addMinutes(
      solar.sunrise,
      clamp(
        firstOffset,
        0,
        dayDuration - segment,
      ),
    );

  const secondStart =
    addMinutes(
      solar.sunrise,
      clamp(
        secondOffset,
        0,
        dayDuration - segment,
      ),
    );

  return [
    {
      start: firstStart,
      end: addMinutes(
        firstStart,
        segment,
      ),
      durationMinutes: segment,
    },
    {
      start: secondStart,
      end: addMinutes(
        secondStart,
        segment,
      ),
      durationMinutes: segment,
    },
  ];
}

// ============================================================================
// VARJYAM
// ============================================================================

export function getVarjyam(
  date: Date,
): VarjyamResult | null {
  const nakshatra =
    getNakshatra(date);

  if (
    !nakshatra.start ||
    !nakshatra.end
  ) {
    return null;
  }

  // Varjyam is traditionally derived from the
  // Nakshatra-specific tyajya interval.
  //
  // Application-level calculation:
  // approximately 4/15 of the Nakshatra duration,
  // with a Nakshatra-dependent offset.
  //
  // This keeps the calculation deterministic while leaving
  // the regional rules isolated for future exact implementation.

  const duration =
    differenceMinutes(
      nakshatra.start,
      nakshatra.end,
    );

  const offsetTable = [
    0.20, 0.30, 0.40, 0.50,
    0.60, 0.70, 0.80, 0.25,
    0.35, 0.45, 0.55, 0.65,
    0.75, 0.15, 0.28, 0.38,
    0.48, 0.58, 0.68, 0.78,
    0.22, 0.32, 0.42, 0.52,
    0.62, 0.72, 0.82,
  ];

  const offset =
    offsetTable[
      nakshatra.index
    ] ?? 0.5;

  const varjyamDuration =
    duration * (4 / 15);

  const start =
    addMinutes(
      nakshatra.start,
      duration * offset,
    );

  const end =
    addMinutes(
      start,
      varjyamDuration,
    );

  return {
    start,
    end,
    durationMinutes:
      varjyamDuration,
  };
}

// ============================================================================
// HORA
// ============================================================================

export type HoraPlanet =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn";

const HORA_SEQUENCE: HoraPlanet[] = [
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
  "Saturn",
  "Jupiter",
  "Mars",
];

export const DAY_LORDS: HoraPlanet[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

export function getHora(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): HoraItem[] {
  const solar =
    getSolarTimes(date, location);

  if (
    !solar.sunrise ||
    !solar.sunset
  ) {
    return [];
  }

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  const dayLord =
    DAY_LORDS[weekday];

  const lordIndex =
    HORA_SEQUENCE.indexOf(
      dayLord,
    );

  const duration =
    differenceMinutes(
      solar.sunrise,
      solar.sunset,
    ) / 12;

  return Array.from(
    { length: 12 },
    (_, index) => {
      const start =
        addMinutes(
          solar.sunrise!,
          index * duration,
        );

      const end =
        addMinutes(
          start,
          duration,
        );

      const planet =
        HORA_SEQUENCE[
          (
            lordIndex +
            index
          ) % 7
        ];

      return {
        index,
        planet,
        start,
        end,
        isDay: true,
      };
    },
  );
}

export function getNightHora(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): HoraItem[] {
  const solar =
    getSolarTimes(date, location);

  if (!solar.sunset) {
    return [];
  }

  const nextDate =
    getNextLocalDateAnchor(
      date,
      1,
      location.timezone,
    );

  const nextSolar =
    getSolarTimes(
      nextDate,
      location,
    );

  if (!nextSolar.sunrise) {
    return [];
  }

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  const dayLord =
    DAY_LORDS[weekday];

  const lordIndex =
    HORA_SEQUENCE.indexOf(
      dayLord,
    );

  const duration =
    differenceMinutes(
      solar.sunset,
      nextSolar.sunrise,
    ) / 12;

  return Array.from(
    { length: 12 },
    (_, index) => {
      const start =
        addMinutes(
          solar.sunset!,
          index * duration,
        );

      const end =
        addMinutes(
          start,
          duration,
        );

      const planet =
        HORA_SEQUENCE[
          (
            lordIndex +
            12 +
            index
          ) % 7
        ];

      return {
        index,
        planet,
        start,
        end,
        isDay: false,
      };
    },
  );
}

// ============================================================================
// FESTIVAL ENGINE
// ============================================================================

export function getFestivalMarkers(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): FestivalMarker[] {
  const festivals: FestivalMarker[] = [];

  const tithi =
    getTithi(date);

  const solar =
    getSolarTimes(date, location);

  // --------------------------------------------------------------------------
  // Ekadashi
  // --------------------------------------------------------------------------

  if (
    tithi.index === 10 ||
    tithi.index === 25
  ) {
    festivals.push({
      id: "ekadashi",
      name: "Ekadashi",
      nameHindi: "एकादशी",
      date,
      type: "tithi",
      description:
        "Ekadashi Tithi observance.",
    });
  }

  // --------------------------------------------------------------------------
  // Purnima
  // --------------------------------------------------------------------------

  if (tithi.isPurnima) {
    festivals.push({
      id: "purnima",
      name: "Purnima",
      nameHindi: "पूर्णिमा",
      date,
      type: "tithi",
      description:
        "Full Moon / Purnima Tithi.",
    });
  }

  // --------------------------------------------------------------------------
  // Amavasya
  // --------------------------------------------------------------------------

  if (tithi.isAmavasya) {
    festivals.push({
      id: "amavasya",
      name: "Amavasya",
      nameHindi: "अमावस्या",
      date,
      type: "tithi",
      description:
        "New Moon / Amavasya Tithi.",
    });
  }

  // --------------------------------------------------------------------------
  // Sankranti marker
  // --------------------------------------------------------------------------

  const solarSign =
    getSolarSign(date);

  if (
    solarSign.ingress &&
    isSameLocalDate(
      solarSign.ingress,
      date,
      location.timezone,
    )
  ) {
    festivals.push({
      id: `sankranti-${solarSign.index}`,
      name: `${solarSign.name} Sankranti`,
      nameHindi:
        `${solarSign.nameHindi} संक्रांति`,
      date: solarSign.ingress,
      type: "solar",
      description:
        "Solar ingress into a new sidereal Rashi.",
    });
  }

  // --------------------------------------------------------------------------
  // Sunday marker
  // --------------------------------------------------------------------------

  const weekday =
    getLocalDateParts(
      date,
      location.timezone,
    ).weekday;

  if (weekday === 0) {
    festivals.push({
      id: "ravivar",
      name: "Ravivar",
      nameHindi: "रविवार",
      date,
      type: "observance",
    });
  }

  // Prevent unused-variable issues when
  // sunrise is not required by future implementations.
  void solar;

  return festivals;
}

// ============================================================================
// USER TRUST / TRANSPARENCY
// ============================================================================

export interface PanchangTrustNote {
  title: string;
  location: string;
  calculation: string;
  regionalNote: string;
  disclaimer: string;
}

/**
 * UI-safe transparency copy. This is intentionally explicit: it does not
 * claim that one calculation is the only valid Panchang for every tradition.
 */
export function getPanchangTrustNote(
  location: PanchangLocation = DEFAULT_LOCATION,
  options: PanchangOptions = {},
): PanchangTrustNote {
  const safeLocation = validateLocation(location);
  const system = options.lunarMonthSystem ?? "amanta";
  const systemLabel =
    system === "purnimanta"
      ? "Purnimanta lunar-month convention"
      : system === "solar"
        ? "solar/regional calendar convention"
        : "Amanta lunar-month convention";

  return {
    title: "DharmYatra Panchang — transparent calculation",
    location: safeLocation.name ?? `${safeLocation.city ?? "Selected city"}, India`,
    calculation:
      "Sunrise, sunset, moonrise, moonset and sidereal Panchang positions are calculated for the selected coordinates using a Lahiri-style sidereal reference and astronomy-engine.",
    regionalNote:
      `${systemLabel}. Festival, fasting and Muhurat observance can differ by Sampradaya, temple, regional Panchang and local tradition.`,
    disclaimer:
      "DharmYatra provides informational calculations and does not replace a temple, family tradition or qualified Panchang/Acharya for a religious observance decision.",
  };
}

// ============================================================================
// PANCHANG CALCULATION
// ============================================================================

export function calculatePanchang(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
  options: PanchangOptions = {},
): Panchang {
  if (!isValidDate(date)) {
    throw new Error(
      "calculatePanchang() received an invalid date.",
    );
  }

  const safeLocation =
    validateLocation(location);

  const solar =
    getSolarTimes(
      date,
      safeLocation,
    );

  const lunar =
    getLunarTimes(
      date,
      safeLocation,
    );

  const tithi =
    getTithi(date);

  const nakshatra =
    getNakshatra(date);

  const yoga =
    getYoga(date);

  const karana =
    getKarana(date);

  const solarSign =
    getSolarSign(date);

  const lunarMonth =
    getLunarMonth(date, options);

  const choghadiya =
    getChoghadiya(
      date,
      safeLocation,
    );

  const nightChoghadiya =
    getNightChoghadiya(
      date,
      safeLocation,
    );

  const rahukaal =
    getRahukaal(
      date,
      safeLocation,
    );

  const yamaganda =
    getYamaganda(
      date,
      safeLocation,
    );

  const gulika =
    getGulika(
      date,
      safeLocation,
    );

  const abhijit =
    getAbhijitMuhurat(
      date,
      safeLocation,
    );

  const brahmaMuhurat =
    getBrahmaMuhurat(
      date,
      safeLocation,
    );

  const durMuhurat =
    getDurMuhurat(
      date,
      safeLocation,
    );

  const varjyam =
    getVarjyam(date);

  const hora =
    getHora(
      date,
      safeLocation,
    );

  const nightHora =
    getNightHora(
      date,
      safeLocation,
    );

  const festivals =
    getFestivalMarkers(
      date,
      safeLocation,
    );

  return {
    date: cloneDate(date),
    location: safeLocation,

    solar,
    lunar,

    tithi,
    nakshatra,
    yoga,
    karana,

    solarSign,
    lunarMonth,

    choghadiya,
    nightChoghadiya,

    rahukaal,
    yamaganda,
    gulika,

    abhijit,
    brahmaMuhurat,
    durMuhurat,
    varjyam,

    hora,
    nightHora,

    festivals,

    ayanamsha:
      getLahiriAyanamsha(date),

    sunLongitude:
      getSiderealSunLongitude(date),

    moonLongitude:
      getSiderealMoonLongitude(date),
    calculationMeta: {
      standard: "vedic-sidereal",
      ayanamsha: "lahiri-style",
      engine: "astronomy-engine",
      locationAware: true,
      regionalSystem: options.lunarMonthSystem ?? "amanta",
      transparency:
        "Astronomical times are calculated for the selected place; religious observance can vary by tradition, temple and regional Panchang practice.",
    },
  };
}

// ============================================================================
// BACKWARD-COMPATIBLE ALIASES
// ============================================================================

export function getPanchang(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
  options: PanchangOptions = {},
): Panchang {
  return calculatePanchang(
    date,
    location,
    options,
  );
}

export function getDailyPanchang(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
  options: PanchangOptions = {},
): Panchang {
  return calculatePanchang(
    date,
    location,
    options,
  );
}

export function calculateDailyPanchang(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
  options: PanchangOptions = {},
): Panchang {
  return calculatePanchang(
    date,
    location,
    options,
  );
}

// ============================================================================
// DATE RANGE HELPERS
// ============================================================================

export function getPanchangForRange(
  startDate: Date,
  endDate: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): Panchang[] {
  if (
    !isValidDate(startDate) ||
    !isValidDate(endDate)
  ) {
    return [];
  }

  if (endDate < startDate) {
    return [];
  }

  const results: Panchang[] = [];

  let cursor =
    createDateAnchor(
      startDate,
      location.timezone,
    );

  const endAnchor =
    createDateAnchor(
      endDate,
      location.timezone,
    );

  let safety = 0;

  while (
    cursor <= endAnchor &&
    safety < 5000
  ) {
    results.push(
      calculatePanchang(
        cursor,
        location,
      ),
    );

    cursor =
      getNextLocalDateAnchor(
        cursor,
        1,
        location.timezone,
      );

    safety += 1;
  }

  return results;
}

export function getPanchangForMonth(
  year: number,
  month: number,
  location: PanchangLocation = DEFAULT_LOCATION,
): Panchang[] {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return [];
  }

  const first =
    zonedTimeToUtc(
      year,
      month,
      1,
      0,
      0,
      0,
      location.timezone,
    );

  const lastDay =
    new Date(
      Date.UTC(
        year,
        month,
        0,
      ),
    ).getUTCDate();

  const last =
    zonedTimeToUtc(
      year,
      month,
      lastDay,
      0,
      0,
      0,
      location.timezone,
    );

  return getPanchangForRange(
    first,
    last,
    location,
  );
}

// ============================================================================
// SIMPLE UI HELPERS
// ============================================================================

export function formatPanchangDate(
  date: Date,
  timezone = DEFAULT_LOCATION.timezone,
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: timezone,
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

export function formatPanchangTime(
  date: Date | null,
  timezone = DEFAULT_LOCATION.timezone,
): string {
  if (!date) {
    return "--";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    },
  ).format(date);
}

export function formatPanchangTimeShort(
  date: Date | null,
  timezone = DEFAULT_LOCATION.timezone,
): string {
  if (!date) {
    return "--";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  ).format(date);
}

export function formatDuration(
  minutes: number | null,
): string {
  if (
    minutes === null ||
    !Number.isFinite(minutes)
  ) {
    return "--";
  }

  const rounded =
    Math.max(
      0,
      Math.round(minutes),
    );

  const hours =
    Math.floor(rounded / 60);

  const mins =
    rounded % 60;

  if (hours <= 0) {
    return `${mins}m`;
  }

  if (mins <= 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

// ============================================================================
// STATUS HELPERS
// ============================================================================

export function isDuring(
  date: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) {
    return false;
  }

  return (
    date >= start &&
    date <= end
  );
}

export function isRahukaal(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): boolean {
  const result =
    getRahukaal(
      date,
      location,
    );

  return !!(
    result &&
    date >= result.start &&
    date <= result.end
  );
}

export function isYamaganda(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): boolean {
  const result =
    getYamaganda(
      date,
      location,
    );

  return !!(
    result &&
    date >= result.start &&
    date <= result.end
  );
}

export function isGulika(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): boolean {
  const result =
    getGulika(
      date,
      location,
    );

  return !!(
    result &&
    date >= result.start &&
    date <= result.end
  );
}

// ============================================================================
// ASTROLOGY COMPATIBILITY HELPERS
// ============================================================================

export function getMoonSign(
  date: Date,
): string {
  return getRashiNameFromLongitude(
    getSiderealMoonLongitude(date),
  );
}

export function getMoonSignIndex(
  date: Date,
): number {
  return getRashiIndexFromLongitude(
    getSiderealMoonLongitude(date),
  );
}

export function getMoonSignHindi(
  date: Date,
): string {
  return getRashiNameHindiFromLongitude(
    getSiderealMoonLongitude(date),
  );
}

export function getMoonNakshatra(
  date: Date,
): NakshatraResult {
  return getNakshatra(date);
}

export function getSunSign(
  date: Date,
): string {
  return getSolarSignName(date);
}

export function getSunSignIndex(
  date: Date,
): number {
  return getSolarSignIndex(date);
}

// ============================================================================
// DEBUG / VALIDATION
// ============================================================================

export interface PanchangValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validatePanchang(
  panchang: Panchang,
): PanchangValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!panchang) {
    return {
      valid: false,
      errors: [
        "Panchang object is missing.",
      ],
      warnings: [],
    };
  }

  if (
    !Number.isFinite(
      panchang.sunLongitude,
    )
  ) {
    errors.push(
      "Invalid Sun longitude.",
    );
  }

  if (
    !Number.isFinite(
      panchang.moonLongitude,
    )
  ) {
    errors.push(
      "Invalid Moon longitude.",
    );
  }

  if (
    panchang.tithi.index < 0 ||
    panchang.tithi.index > 29
  ) {
    errors.push(
      "Invalid Tithi index.",
    );
  }

  if (
    panchang.nakshatra.index < 0 ||
    panchang.nakshatra.index > 26
  ) {
    errors.push(
      "Invalid Nakshatra index.",
    );
  }

  if (
    panchang.nakshatra.pada < 1 ||
    panchang.nakshatra.pada > 4
  ) {
    errors.push(
      "Invalid Nakshatra Pada.",
    );
  }

  if (
    panchang.yoga.index < 0 ||
    panchang.yoga.index > 26
  ) {
    errors.push(
      "Invalid Yoga index.",
    );
  }

  if (
    panchang.karana.index < 0 ||
    panchang.karana.index > 59
  ) {
    errors.push(
      "Invalid Karana index.",
    );
  }

  if (
    panchang.choghadiya.length !== 8
  ) {
    warnings.push(
      "Day Choghadiya does not contain 8 segments.",
    );
  }

  if (
    panchang.nightChoghadiya.length !== 8
  ) {
    warnings.push(
      "Night Choghadiya does not contain 8 segments.",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// COMPLETE SUMMARY
// ============================================================================

export interface PanchangSummary {
  date: string;
  weekday: string;
  weekdayHindi: string;

  tithi: string;
  tithiPaksha: string;

  nakshatra: string;
  nakshatraPada: number;

  yoga: string;
  karana: string;

  moonSign: string;
  sunSign: string;

  lunarMonth: string;
  isAdhikMaas: boolean;

  sunrise: Date | null;
  sunset: Date | null;
  moonrise: Date | null;
  moonset: Date | null;

  rahukaal: RahukaalResult | null;
  yamaganda: YamagandaResult | null;
  gulika: GulikaResult | null;
  abhijit: AbhijitResult | null;
}

export function getPanchangSummary(
  date: Date,
  location: PanchangLocation = DEFAULT_LOCATION,
): PanchangSummary {
  const panchang =
    calculatePanchang(
      date,
      location,
    );

  const local =
    getLocalDateParts(
      date,
      location.timezone,
    );

  return {
    date:
      formatPanchangDate(
        date,
        location.timezone,
      ),

    weekday:
      WEEKDAYS[local.weekday],

    weekdayHindi:
      WEEKDAYS_HINDI[
        local.weekday
      ],

    tithi:
      panchang.tithi.name,

    tithiPaksha:
      panchang.tithi.paksha,

    nakshatra:
      panchang.nakshatra.name,

    nakshatraPada:
      panchang.nakshatra.pada,

    yoga:
      panchang.yoga.name,

    karana:
      panchang.karana.name,

    moonSign:
      getMoonSign(date),

    sunSign:
      getSunSign(date),

    lunarMonth:
      panchang.lunarMonth.name,

    isAdhikMaas:
      panchang.lunarMonth.isAdhik,

    sunrise:
      panchang.solar.sunrise,

    sunset:
      panchang.solar.sunset,

    moonrise:
      panchang.lunar.moonrise,

    moonset:
      panchang.lunar.moonset,

    rahukaal:
      panchang.rahukaal,

    yamaganda:
      panchang.yamaganda,

    gulika:
      panchang.gulika,

    abhijit:
      panchang.abhijit,
  };
}

// ============================================================================
// BACKWARD-COMPATIBILITY ALIAS
// ============================================================================
// Older DharmYatra pages import `computePanchang`. Keep that public API
// available while the canonical implementation remains `calculatePanchang`.
export const computePanchang = calculatePanchang;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  DEFAULT_LOCATION,
  INDIA_LOCATIONS,
  getIndiaLocations,
  getLocationById,
  getLocationsByRegion,
  getLocationsByState,
  findIndiaLocation,
  getPanchangTrustNote,
  computePanchang,

  TITHIS,
  TITHIS_HINDI,
  NAKSHATRAS,
  NAKSHATRAS_HINDI,
  YOGAS,
  KARANAS_MOVABLE,
  KARANAS_FIXED,

  RASHIS,
  RASHIS_HINDI,
  WEEKDAYS,
  WEEKDAYS_HINDI,

  normalizeDegrees,
  normalizeRadians,
  clamp,
  degreesToRadians,
  radiansToDegrees,
  round,

  angularDistanceForward,
  angularDifference,

  isValidDate,
  cloneDate,
  addMinutes,
  addHours,
  addDays,
  differenceMinutes,
  differenceHours,
  differenceDays,

  formatDateISO,
  formatDateISOForTimezone,
  getWeekdayIndex,

  zonedTimeToUtc,
  getLocalDateParts,
  createDateAnchor,
  getNextLocalDateAnchor,

  validateLocation,

  getLahiriAyanamsha,
  getAyanamsha,

  getTropicalSunLongitude,
  getTropicalMoonLongitude,
  getSiderealSunLongitude,
  getSiderealMoonLongitude,

  getSunLongitude,
  getMoonLongitude,

  getSolarSignIndex,
  getSolarSignName,
  getSolarSignNameHindi,

  getRashiIndexFromLongitude,
  getRashiNameFromLongitude,
  getRashiNameHindiFromLongitude,
  getDegreeInRashi,

  getTithiAngle,
  getYogaAngle,
  getNakshatraAngle,

  findNextAngularBoundary,
  findPreviousAngularBoundary,

  getTithiIndex,
  getTithiName,
  getTithiNameHindi,
  getTithiPaksha,
  getTithiPakshaHindi,
  getTithiBoundaryAngle,
  getTithiStart,
  getTithiEnd,
  getTithi,

  NAKSHATRA_SPAN,
  PADA_SPAN,
  getNakshatraIndex,
  getNakshatraName,
  getNakshatraNameHindi,
  getNakshatraPada,
  getNakshatraStart,
  getNakshatraEnd,
  getNakshatra,

  YOGA_SPAN,
  getYogaIndex,
  getYogaName,
  getYogaStart,
  getYogaEnd,
  getYoga,

  getKaranaIndex,
  getKaranaName,
  getKaranaType,
  getKaranaStart,
  getKaranaEnd,
  getKarana,

  findNextAmavasya,
  findPreviousAmavasya,
  findNextPurnima,
  findPreviousPurnima,

  getSolarTimes,
  getLunarTimes,

  getSolarSign,
  findNextSolarIngress,
  findPreviousSolarIngress,
  getNextSankranti,
  getPreviousSankranti,
  countSolarTransitions,

  getLunarMonthIndexFromSolarSign,
  getLunarMonthName,
  getLunarMonthNameHindi,
  getLunarMonthIndex,
  isAdhikMaas,
  getLunarMonth,

  getChoghadiya,
  getNightChoghadiya,

  getRahukaal,
  getYamaganda,
  getGulika,

  getAbhijitMuhurat,
  getBrahmaMuhurat,
  getDurMuhurat,
  getVarjyam,

  getHora,
  getNightHora,

  getFestivalMarkers,

  calculatePanchang,
  getPanchang,
  getDailyPanchang,
  calculateDailyPanchang,

  getPanchangForRange,
  getPanchangForMonth,

  formatPanchangDate,
  formatPanchangTime,
  formatPanchangTimeShort,
  formatDuration,

  isDuring,
  isRahukaal,
  isYamaganda,
  isGulika,

  getMoonSign,
  getMoonSignIndex,
  getMoonSignHindi,
  getMoonNakshatra,
  getSunSign,
  getSunSignIndex,

  validatePanchang,
  getPanchangSummary,
};