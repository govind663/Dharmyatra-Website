/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/rashifal.ts

import {
  DEFAULT_LOCATION,
  getIndiaLocations,
  findIndiaLocation,
  type PanchangLocation,
} from "./panchang";

import {
  getMoonSign,
  getRashiLord,
  getAstrologyTrustMetadata,
  getRashiNameEnglish,
  getRashiNameHindi,
  getPlanetPosition,
  getSignDistance,
  type PlanetName,
  type ZodiacEnglishSign,
  type ZodiacSign,
  type NakshatraName,
} from "./astrology";

import {
  getCurrentSadeSati,
  getCurrentDhaiya,
} from "./sadhe-sathi";

/* =========================================================
   TYPES
========================================================= */

export type RashifalPeriod =
  | "daily"
  | "weekly"
  | "monthly";

export type RashifalCategory =
  | "career"
  | "finance"
  | "love"
  | "health"
  | "family"
  | "education"
  | "travel"
  | "spiritual"
  | "general";

export interface RashiProfile {
  sign: ZodiacSign;
  signEnglish: ZodiacEnglishSign;
  signHindi: string;

  lord: PlanetName;

  element:
    | "Fire"
    | "Earth"
    | "Air"
    | "Water";

  quality:
    | "Cardinal"
    | "Fixed"
    | "Mutable";

  luckyNumbers: number[];
  luckyColors: string[];
  luckyDays: string[];

  strengths: string[];
  challenges: string[];
}

export interface RashifalSection {
  title: string;
  text: string;
}

export interface RashifalAstrology {
  moonSign: ZodiacSign;
  moonSignEnglish: ZodiacEnglishSign;

  nakshatra: NakshatraName;
  nakshatraPada: number;

  moonLongitude: number;
  moonDegreeInSign: number;

  saturnSign: ZodiacSign;
  saturnSignEnglish: ZodiacEnglishSign;
  saturnDegreeInSign: number;
  saturnRetrograde: boolean;

  jupiterSign: ZodiacSign;
  jupiterSignEnglish: ZodiacEnglishSign;
  jupiterRetrograde: boolean;

  marsSign: ZodiacSign;
  marsSignEnglish: ZodiacEnglishSign;
  marsRetrograde: boolean;

  rahuSign: ZodiacSign;
  rahuSignEnglish: ZodiacEnglishSign;

  ketuSign: ZodiacSign;
  ketuSignEnglish: ZodiacEnglishSign;

  saturnFromMoon: number;
  jupiterFromMoon: number;
  marsFromMoon: number;
  rahuFromMoon: number;
  ketuFromMoon: number;
}

export interface RashifalTransitInfluence {
  scoreAdjustment: number;

  positiveFactors: string[];
  cautionFactors: string[];

  saturn: string;
  jupiter: string;
  mars: string;
  rahuKetu: string;
}

export interface RashifalSadeSati {
  active: boolean;
  phase: string;
  summary: string;
  advice: string;
}

export interface RashifalDhaiya {
  active: boolean;
  type: string;
  summary: string;
  advice: string;
}

export interface RashifalResult {
  id: string;

  dateISO: string;
  period: RashifalPeriod;

  rashi: ZodiacSign;
  rashiEnglish: ZodiacEnglishSign;
  rashiHindi: string;

  moonSign?: ZodiacSign;
  moonSignEnglish?: ZodiacEnglishSign;

  nakshatra?: string;
  nakshatraPada?: number;

  lord: PlanetName;

  overallRating: number;
  overallLabel: string;

  luckyNumber: number;
  luckyColor: string;
  luckyDay: string;

  sections: RashifalSection[];

  general: string;
  career: string;
  finance: string;
  love: string;
  health: string;
  family: string;
  education: string;
  travel: string;
  spiritual: string;

  doToday: string;
  avoidToday: string;

  advice: string;

  astrology?: RashifalAstrology;

  transitInfluence?: RashifalTransitInfluence;

  sadeSati?: RashifalSadeSati;

  dhaiya?: RashifalDhaiya;

  location?: PanchangLocation;
}

export interface RashifalOptions {
  date?: Date;
  location?: PanchangLocation;
  period?: RashifalPeriod;
}

export interface RashifalCalendarItem {
  dateISO: string;

  rashi: ZodiacSign;

  signHindi: string;

  signEnglish: ZodiacEnglishSign;

  rating: number;

  label: string;
}

/* =========================================================
   TRUST + PAN-INDIA PERSONALIZATION
========================================================= */

export type RashifalConfidence =
  | "high"
  | "medium"
  | "limited";

export type RashifalRelevance =
  | "personal-rashi"
  | "selected-city"
  | "selected-state"
  | "pan-india";

export interface RashifalTrustMetadata {
  engine: "astronomy-engine";
  ayanamsha: "lahiri";
  nodeModel: "mean";
  zodiac: "sidereal";
  calculationBasis: string;
  locationUsed: PanchangLocation;
  locationLabel: string;
  confidence: RashifalConfidence;
  precision: "astronomical-calculation";
  trustNote: string;
  interpretationNote: string;
}

export interface RashifalPersonalization {
  relevance: RashifalRelevance;
  relevanceLabel: string;
  location: PanchangLocation;
  locationLabel: string;
  city?: string;
  state?: string;
  region?: string;
  rashi: ZodiacSign;
  rashiHindi: string;
  rashiEnglish: ZodiacEnglishSign;
  message: string;
  trust: RashifalTrustMetadata;
}

export interface PersonalizedRashifalResult
  extends RashifalResult {
  trust: RashifalTrustMetadata;
  personalization: RashifalPersonalization;
}

export const RASHIFAL_TRUST_NOTE =
  "DharmYatra calculates Rashifal from astronomical planetary positions using a sidereal Vedic framework with Lahiri ayanamsha and mean lunar nodes. The selected Indian location is retained for local context and date interpretation. Rashifal is a traditional interpretive system, so different parampara or astrologers may interpret the same planetary factors differently.";

export const RASHIFAL_INTERPRETATION_NOTE =
  "Rashifal is provided for cultural, spiritual and self-reflection purposes. It is not a guaranteed prediction and should not replace qualified medical, legal, financial or other professional advice.";

function getRashifalLocationLabel(
  location: PanchangLocation,
): string {
  return [
    location.city || location.name,
    location.state,
    location.country,
  ].filter(Boolean).join(", ") || "Selected India location";
}

function getRashifalConfidence(
  date: Date,
  location: PanchangLocation,
): RashifalConfidence {
  if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    return "limited";
  }

  const validDate = date instanceof Date && !Number.isNaN(date.getTime());
  if (!validDate) return "limited";

  return "high";
}

export function getRashifalTrustMetadata(
  location: PanchangLocation = DEFAULT_LOCATION,
  date: Date = new Date(),
): RashifalTrustMetadata {
  const astrologyTrust = getAstrologyTrustMetadata(location);

  return {
    engine: "astronomy-engine",
    ayanamsha: "lahiri",
    nodeModel: "mean",
    zodiac: "sidereal",
    calculationBasis:
      "Planetary transit positions + sidereal Moon/Rashi + traditional transit interpretation + Sade Sati/Dhaiya markers.",
    locationUsed: location,
    locationLabel: getRashifalLocationLabel(location),
    confidence: getRashifalConfidence(date, location),
    precision: "astronomical-calculation",
    trustNote: `${RASHIFAL_TRUST_NOTE} ${astrologyTrust.trustNote}`.trim(),
    interpretationNote: RASHIFAL_INTERPRETATION_NOTE,
  };
}

export function getRashifalPersonalization(
  rashi: ZodiacSign,
  location: PanchangLocation = DEFAULT_LOCATION,
  date: Date = new Date(),
): RashifalPersonalization {
  assertValidRashi(rashi);

  const state = location.state;
  const relevance: RashifalRelevance =
    location.city
      ? "selected-city"
      : state
        ? "selected-state"
        : "pan-india";

  const relevanceLabel =
    relevance === "selected-city"
      ? `Personalized for ${location.city}`
      : relevance === "selected-state"
        ? `Personalized for ${state}`
        : `Personalized for ${RASHI_NAMES_HINDI[rashi]} Rashi`;

  const locationLabel = getRashifalLocationLabel(location);

  const message =
    `यह Rashifal ${RASHI_NAMES_HINDI[rashi]} (${RASHI_PROFILE[rashi].signEnglish}) राशि को आधार बनाकर तैयार किया गया है। चुना गया स्थान ${locationLabel} है, इसलिए DharmYatra आपके चुने हुए शहर/राज्य के संदर्भ को बनाए रखता है। ग्रहों की astronomical calculation और राशि-आधारित interpretation अलग रखी जाती है, ताकि आपको साफ़ पता रहे कि क्या गणना है और क्या पारंपरिक व्याख्या।`;

  return {
    relevance,
    relevanceLabel,
    location,
    locationLabel,
    city: location.city,
    state: location.state,
    region: location.region,
    rashi,
    rashiHindi: RASHI_NAMES_HINDI[rashi],
    rashiEnglish: RASHI_PROFILE[rashi].signEnglish,
    message,
    trust: getRashifalTrustMetadata(location, date),
  };
}

export function getPanIndiaRashifalLocations(): PanchangLocation[] {
  return getIndiaLocations();
}

export function findRashifalLocation(
  query: string,
): PanchangLocation | undefined {
  return findIndiaLocation(query) ?? undefined;
}

export function getRashifalConfidenceLabel(
  confidence: RashifalConfidence,
): string {
  switch (confidence) {
    case "high": return "High calculation confidence";
    case "medium": return "Medium calculation confidence";
    default: return "Limited calculation confidence";
  }
}

export function getRashifalRelevanceLabel(
  relevance: RashifalRelevance,
  location: PanchangLocation = DEFAULT_LOCATION,
): string {
  switch (relevance) {
    case "selected-city": return `Your selected city: ${location.city || getRashifalLocationLabel(location)}`;
    case "selected-state": return `Your selected state: ${location.state || "India"}`;
    case "personal-rashi": return "Your selected Rashi";
    default: return "Pan-India";
  }
}

export function getPersonalizedRashifal(
  date: Date = new Date(),
  location: PanchangLocation = DEFAULT_LOCATION,
  period: RashifalPeriod = "daily",
): PersonalizedRashifalResult {
  const result = getRashifalForDate(date, location, period);
  const personalization = getRashifalPersonalization(
    result.rashi,
    location,
    date,
  );

  return {
    ...result,
    trust: personalization.trust,
    personalization: {
      ...personalization,
      relevance: "personal-rashi",
      relevanceLabel: `Your Rashi: ${RASHI_NAMES_HINDI[result.rashi]} (${result.rashiEnglish})`,
    },
  };
}

export function getRashifalTrustSummary(
  result: RashifalResult | PersonalizedRashifalResult,
): string {
  const trust = "trust" in result
    ? result.trust
    : getRashifalTrustMetadata(result.location || DEFAULT_LOCATION);

  return `${trust.locationLabel} • ${getRashifalConfidenceLabel(trust.confidence)} • Lahiri sidereal • Astronomy Engine`;
}

/* =========================================================
   CONSTANTS
========================================================= */

export const RASHIS: readonly ZodiacSign[] = [
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

export const RASHIS_ENGLISH: readonly ZodiacEnglishSign[] = [
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

export const RASHI_NAMES_HINDI: Record<
  ZodiacSign,
  string
> = {
  Mesha: "मेष",
  Vrishabha: "वृषभ",
  Mithuna: "मिथुन",
  Karka: "कर्क",
  Simha: "सिंह",
  Kanya: "कन्या",
  Tula: "तुला",
  Vrishchika: "वृश्चिक",
  Dhanu: "धनु",
  Makara: "मकर",
  Kumbha: "कुंभ",
  Meena: "मीन",
};

/* =========================================================
   RASHI PROFILES
========================================================= */

export const RASHI_PROFILE: Record<
  ZodiacSign,
  RashiProfile
> = {
  Mesha: {
    sign: "Mesha",
    signEnglish: "Aries",
    signHindi: "मेष",
    lord: "Mars",
    element: "Fire",
    quality: "Cardinal",
    luckyNumbers: [1, 9, 18],
    luckyColors: ["Red", "Maroon", "Orange"],
    luckyDays: ["Tuesday", "Sunday"],
    strengths: [
      "Courage",
      "Leadership",
      "Initiative",
      "Confidence",
    ],
    challenges: [
      "Impatience",
      "Impulsiveness",
      "Short temper",
    ],
  },

  Vrishabha: {
    sign: "Vrishabha",
    signEnglish: "Taurus",
    signHindi: "वृषभ",
    lord: "Venus",
    element: "Earth",
    quality: "Fixed",
    luckyNumbers: [2, 6, 24],
    luckyColors: ["White", "Green", "Pink"],
    luckyDays: ["Friday", "Monday"],
    strengths: [
      "Stability",
      "Patience",
      "Reliability",
      "Practicality",
    ],
    challenges: [
      "Stubbornness",
      "Possessiveness",
      "Resistance to change",
    ],
  },

  Mithuna: {
    sign: "Mithuna",
    signEnglish: "Gemini",
    signHindi: "मिथुन",
    lord: "Mercury",
    element: "Air",
    quality: "Mutable",
    luckyNumbers: [5, 14, 23],
    luckyColors: ["Green", "Yellow", "Light Blue"],
    luckyDays: ["Wednesday", "Friday"],
    strengths: [
      "Communication",
      "Curiosity",
      "Adaptability",
      "Intelligence",
    ],
    challenges: [
      "Restlessness",
      "Overthinking",
      "Inconsistency",
    ],
  },

  Karka: {
    sign: "Karka",
    signEnglish: "Cancer",
    signHindi: "कर्क",
    lord: "Moon",
    element: "Water",
    quality: "Cardinal",
    luckyNumbers: [2, 7, 11],
    luckyColors: ["White", "Silver", "Sea Green"],
    luckyDays: ["Monday", "Thursday"],
    strengths: [
      "Empathy",
      "Care",
      "Intuition",
      "Emotional depth",
    ],
    challenges: [
      "Mood swings",
      "Sensitivity",
      "Attachment",
    ],
  },

  Simha: {
    sign: "Simha",
    signEnglish: "Leo",
    signHindi: "सिंह",
    lord: "Sun",
    element: "Fire",
    quality: "Fixed",
    luckyNumbers: [1, 5, 19],
    luckyColors: ["Gold", "Orange", "Yellow"],
    luckyDays: ["Sunday", "Tuesday"],
    strengths: [
      "Confidence",
      "Creativity",
      "Leadership",
      "Generosity",
    ],
    challenges: [
      "Pride",
      "Need for recognition",
      "Stubbornness",
    ],
  },

  Kanya: {
    sign: "Kanya",
    signEnglish: "Virgo",
    signHindi: "कन्या",
    lord: "Mercury",
    element: "Earth",
    quality: "Mutable",
    luckyNumbers: [5, 14, 23],
    luckyColors: ["Green", "Navy", "Cream"],
    luckyDays: ["Wednesday", "Friday"],
    strengths: [
      "Analysis",
      "Discipline",
      "Organization",
      "Problem solving",
    ],
    challenges: [
      "Over-analysis",
      "Perfectionism",
      "Self-criticism",
    ],
  },

  Tula: {
    sign: "Tula",
    signEnglish: "Libra",
    signHindi: "तुला",
    lord: "Venus",
    element: "Air",
    quality: "Cardinal",
    luckyNumbers: [6, 15, 24],
    luckyColors: ["White", "Pink", "Sky Blue"],
    luckyDays: ["Friday", "Saturday"],
    strengths: [
      "Diplomacy",
      "Balance",
      "Charm",
      "Cooperation",
    ],
    challenges: [
      "Indecision",
      "People pleasing",
      "Avoiding confrontation",
    ],
  },

  Vrishchika: {
    sign: "Vrishchika",
    signEnglish: "Scorpio",
    signHindi: "वृश्चिक",
    lord: "Mars",
    element: "Water",
    quality: "Fixed",
    luckyNumbers: [9, 18, 27],
    luckyColors: ["Red", "Deep Red", "Black"],
    luckyDays: ["Tuesday", "Thursday"],
    strengths: [
      "Determination",
      "Focus",
      "Loyalty",
      "Emotional strength",
    ],
    challenges: [
      "Intensity",
      "Jealousy",
      "Secrecy",
    ],
  },

  Dhanu: {
    sign: "Dhanu",
    signEnglish: "Sagittarius",
    signHindi: "धनु",
    lord: "Jupiter",
    element: "Fire",
    quality: "Mutable",
    luckyNumbers: [3, 12, 21],
    luckyColors: ["Yellow", "Orange", "Purple"],
    luckyDays: ["Thursday", "Sunday"],
    strengths: [
      "Optimism",
      "Wisdom",
      "Adventure",
      "Honesty",
    ],
    challenges: [
      "Overconfidence",
      "Restlessness",
      "Bluntness",
    ],
  },

  Makara: {
    sign: "Makara",
    signEnglish: "Capricorn",
    signHindi: "मकर",
    lord: "Saturn",
    element: "Earth",
    quality: "Cardinal",
    luckyNumbers: [8, 17, 26],
    luckyColors: ["Black", "Grey", "Dark Blue"],
    luckyDays: ["Saturday", "Friday"],
    strengths: [
      "Discipline",
      "Ambition",
      "Patience",
      "Responsibility",
    ],
    challenges: [
      "Pessimism",
      "Workaholism",
      "Rigidity",
    ],
  },

  Kumbha: {
    sign: "Kumbha",
    signEnglish: "Aquarius",
    signHindi: "कुंभ",
    lord: "Saturn",
    element: "Air",
    quality: "Fixed",
    luckyNumbers: [4, 8, 22],
    luckyColors: ["Blue", "Turquoise", "Grey"],
    luckyDays: ["Saturday", "Wednesday"],
    strengths: [
      "Originality",
      "Innovation",
      "Humanitarian spirit",
      "Independence",
    ],
    challenges: [
      "Detachment",
      "Unpredictability",
      "Overthinking",
    ],
  },

  Meena: {
    sign: "Meena",
    signEnglish: "Pisces",
    signHindi: "मीन",
    lord: "Jupiter",
    element: "Water",
    quality: "Mutable",
    luckyNumbers: [3, 7, 12],
    luckyColors: ["Yellow", "Sea Green", "Lavender"],
    luckyDays: ["Thursday", "Monday"],
    strengths: [
      "Compassion",
      "Intuition",
      "Imagination",
      "Spirituality",
    ],
    challenges: [
      "Escapism",
      "Sensitivity",
      "Lack of boundaries",
    ],
  },
};

/* =========================================================
   CONTENT LIBRARY
========================================================= */

interface ContentPack {
  general: string[];
  career: string[];
  finance: string[];
  love: string[];
  health: string[];
  family: string[];
  education: string[];
  travel: string[];
  spiritual: string[];
  advice: string[];
  doToday: string[];
  avoidToday: string[];
}

/*
 * Existing content library retained in structure.
 *
 * The content is intentionally generic because actual
 * planetary influence is calculated separately below.
 */

const CONTENT: Record<
  ZodiacSign,
  ContentPack
> = {
  Mesha: {
    general: [
      "आज पहल करने और लंबित काम आगे बढ़ाने का अच्छा समय है।",
      "आपकी ऊर्जा और आत्मविश्वास आपको महत्वपूर्ण निर्णय लेने में मदद करेंगे।",
      "आज जल्दबाजी के बजाय स्पष्ट प्राथमिकताएँ तय करके काम करें।",
      "नई शुरुआत के लिए दिन सकारात्मक रह सकता है, लेकिन धैर्य बनाए रखें।",
    ],
    career: [
      "काम में नेतृत्व की भूमिका मिल सकती है। वरिष्ठों के साथ बात करते समय परिणामों पर ध्यान दें।",
      "लंबित प्रोजेक्ट पूरा करने से आपकी पेशेवर छवि मजबूत हो सकती है।",
      "नई जिम्मेदारी मिले तो उसे व्यवस्थित तरीके से स्वीकार करें।",
      "व्यवसाय में तेज निर्णय से पहले लागत और परिणाम की दोबारा जाँच करें।",
    ],
    finance: [
      "आय के नए अवसर दिख सकते हैं, लेकिन अनावश्यक खर्च नियंत्रित रखें।",
      "बड़ी खरीदारी से पहले बजट की समीक्षा करें।",
      "निवेश में भावनात्मक निर्णय लेने से बचें।",
      "पुराने बकाये या भुगतान से जुड़ा सकारात्मक अपडेट मिल सकता है।",
    ],
    love: [
      "रिश्तों में स्पष्ट बातचीत से गलतफहमियाँ दूर होंगी।",
      "साथी आपकी सक्रियता को पसंद करेगा, लेकिन धैर्य भी जरूरी है।",
      "अविवाहित लोगों के लिए बातचीत का नया अवसर बन सकता है।",
      "परिवार और साथी के बीच संतुलन बनाए रखने से माहौल बेहतर रहेगा।",
    ],
    health: [
      "अधिक काम के बीच पर्याप्त आराम लेना जरूरी है।",
      "पानी और नींद पर विशेष ध्यान दें।",
      "तनाव कम करने के लिए हल्की शारीरिक गतिविधि उपयोगी रहेगी।",
      "ऊर्जा अच्छी रह सकती है, लेकिन अति-परिश्रम से बचें।",
    ],
    family: [
      "परिवार के किसी सदस्य से महत्वपूर्ण चर्चा हो सकती है।",
      "घर का वातावरण सहयोगी बनाने में आपकी भूमिका अहम रहेगी।",
    ],
    education: [
      "कठिन विषयों पर ध्यान केंद्रित करने के लिए अच्छा दिन है।",
      "प्रैक्टिकल अभ्यास से आपकी समझ बेहतर होगी।",
    ],
    travel: [
      "छोटी यात्रा उपयोगी हो सकती है।",
      "यात्रा से पहले समय और दस्तावेज़ दोबारा जाँच लें।",
    ],
    spiritual: [
      "कुछ समय ध्यान या प्रार्थना के लिए निकालें।",
      "आत्मचिंतन आपको आज सही प्राथमिकताएँ तय करने में मदद करेगा।",
    ],
    advice: [
      "ऊर्जा को सही दिशा में लगाएँ और प्रतिक्रिया देने से पहले एक क्षण रुकें।",
      "जो काम सबसे महत्वपूर्ण है, उसे पहले पूरा करें।",
    ],
    doToday: [
      "महत्वपूर्ण काम सुबह शुरू करें।",
      "लंबित निर्णयों की सूची बनाएँ।",
    ],
    avoidToday: [
      "बिना सोचे वादे करने से बचें।",
      "अनावश्यक बहस से दूर रहें।",
    ],
  },

  Vrishabha: {
    general: [
      "आज स्थिर गति से आगे बढ़ना आपके लिए अधिक लाभदायक रहेगा।",
      "व्यावहारिक सोच आपको सही निर्णय लेने में मदद करेगी।",
      "पुरानी योजना में थोड़ा सुधार अच्छा परिणाम दे सकता है।",
      "धैर्य से किया गया काम अपेक्षा से बेहतर परिणाम दे सकता है।",
    ],
    career: [
      "काम में निरंतरता आपकी सबसे बड़ी ताकत रहेगी।",
      "नई जिम्मेदारी धीरे-धीरे लेकिन स्थायी लाभ दे सकती है।",
      "टीम में आपकी विश्वसनीयता बढ़ेगी।",
      "व्यवसाय में स्थिर ग्राहक या पुराने संपर्क उपयोगी साबित हो सकते हैं।",
    ],
    finance: [
      "बचत पर ध्यान देना आज लाभकारी रहेगा।",
      "स्थिर निवेश योजनाओं की समीक्षा कर सकते हैं।",
      "लक्जरी खर्च सीमित रखना उचित रहेगा।",
      "पुराने वित्तीय दस्तावेज व्यवस्थित करना फायदेमंद रहेगा।",
    ],
    love: [
      "रिश्तों में स्थिरता और भरोसा बढ़ेगा।",
      "छोटी-सी देखभाल आपके रिश्ते में गर्माहट ला सकती है।",
      "अविवाहित लोगों को मित्रता के माध्यम से नया संपर्क मिल सकता है।",
      "जिद छोड़कर बातचीत करने से रिश्ते बेहतर होंगे।",
    ],
    health: [
      "रूटीन और संतुलित भोजन पर ध्यान दें।",
      "लंबे समय तक बैठे रहने से बचें।",
      "नींद की गुणवत्ता सुधारने की कोशिश करें।",
      "हल्की कसरत आपकी ऊर्जा बनाए रखेगी।",
    ],
    family: [
      "परिवार के साथ समय बिताने से भावनात्मक संतुलन बढ़ेगा।",
      "घर से जुड़े किसी निर्णय में आपका व्यावहारिक दृष्टिकोण उपयोगी रहेगा।",
    ],
    education: [
      "धीरे-धीरे लेकिन नियमित अध्ययन सबसे अच्छा परिणाम देगा।",
      "नोट्स व्यवस्थित करने से तैयारी मजबूत होगी।",
    ],
    travel: [
      "आरामदायक और अच्छी तरह योजनाबद्ध यात्रा बेहतर रहेगी।",
      "अनावश्यक जल्दबाजी से बचें।",
    ],
    spiritual: [
      "प्रकृति के करीब कुछ समय बिताना मन को शांत कर सकता है।",
      "कृतज्ञता का अभ्यास सकारात्मकता बढ़ाएगा।",
    ],
    advice: [
      "स्थिर रहें और हर चीज तुरंत बदलने की कोशिश न करें।",
      "आज गुणवत्ता को गति से ऊपर रखें।",
    ],
    doToday: [
      "बजट और काम की प्राथमिकताएँ व्यवस्थित करें।",
      "अधूरे काम पूरे करें।",
    ],
    avoidToday: [
      "जिद में निर्णय लेने से बचें।",
      "अनावश्यक खरीदारी न करें।",
    ],
  },

  Mithuna: {
    general: [
      "आज संवाद और नई जानकारी आपके लिए महत्वपूर्ण भूमिका निभाएगी।",
      "एक साथ कई काम करने के बजाय प्राथमिकता तय करना बेहतर रहेगा।",
      "नई बातचीत से उपयोगी अवसर मिल सकता है।",
      "रचनात्मक सोच से जटिल समस्या का समाधान निकल सकता है।",
    ],
    career: [
      "बैठक या बातचीत में आपकी communication skills प्रभावशाली रहेंगी।",
      "नई तकनीक सीखना करियर के लिए लाभकारी हो सकता है।",
      "नेटवर्किंग से अवसर मिल सकते हैं।",
      "लिखित योजना बनाएँ ताकि छोटे विवरण छूट न जाएँ।",
    ],
    finance: [
      "छोटे-छोटे खर्च जोड़कर बड़ा बजट प्रभाव पड़ सकता है।",
      "डिजिटल भुगतान और वित्तीय रिकॉर्ड जांचें।",
      "नई आय के विचार पर रिसर्च करें।",
      "जल्द लाभ के लालच से बचें।",
    ],
    love: [
      "खुलकर बातचीत करने से भावनात्मक दूरी कम हो सकती है।",
      "मज़ेदार बातचीत रिश्ते को बेहतर बनाएगी।",
      "नए social connection से आकर्षक बातचीत शुरू हो सकती है।",
      "एक साथ बहुत सारे मुद्दे उठाने से बचें।",
    ],
    health: [
      "मानसिक थकान कम करने के लिए स्क्रीन ब्रेक लें।",
      "नींद का समय स्थिर रखें।",
      "हल्की वॉक लाभदायक रहेगी।",
      "अनियमित दिनचर्या पर नियंत्रण रखें।",
    ],
    family: [
      "परिवार में आपकी सलाह उपयोगी साबित होगी।",
      "किसी पुराने मुद्दे पर खुली बातचीत समाधान दे सकती है।",
    ],
    education: [
      "भाषा, टेक्नोलॉजी और communication आधारित विषयों में प्रगति होगी।",
      "छोटे study sessions अच्छे परिणाम देंगे।",
    ],
    travel: [
      "छोटी या काम से जुड़ी यात्रा उपयोगी रह सकती है।",
      "यात्रा कार्यक्रम को flexible रखें।",
    ],
    spiritual: [
      "मंत्र जाप या ध्यान से मानसिक स्पष्टता बढ़ सकती है।",
      "कुछ समय अकेले रहकर विचार व्यवस्थित करें।",
    ],
    advice: [
      "कम चीजें शुरू करें और उन्हें पूरा करें।",
      "बात करने से पहले सामने वाले की बात पूरी सुनें।",
    ],
    doToday: [
      "महत्वपूर्ण संदेश और ईमेल पहले निपटाएँ।",
      "आज एक नया skill सीखें।",
    ],
    avoidToday: [
      "अति-प्रतिबद्धता से बचें।",
      "अफवाहों पर भरोसा न करें।",
    ],
  },

  Karka: {
    general: [
      "आज भावनात्मक समझ आपकी ताकत बनेगी।",
      "घर और काम के बीच संतुलन बनाए रखना जरूरी होगा।",
      "अपनी intuition पर ध्यान दें, लेकिन महत्वपूर्ण निर्णय तथ्यों के आधार पर लें।",
      "शांत वातावरण में काम करने से उत्पादकता बढ़ेगी।",
    ],
    career: [
      "सहकर्मियों के साथ सहयोग से काम आसान होगा।",
      "भावनात्मक होकर पेशेवर प्रतिक्रिया न दें।",
      "पुराना काम दोबारा देखने से सुधार का अवसर मिलेगा।",
      "कार्यस्थल पर आपकी संवेदनशीलता टीम को जोड़ने में मदद करेगी।",
    ],
    finance: [
      "घर से जुड़े खर्च बढ़ सकते हैं।",
      "बचत के लिए स्पष्ट सीमा निर्धारित करें।",
      "किसी परिचित के कहने पर वित्तीय निर्णय न लें।",
      "अचानक खर्च के लिए छोटी emergency reserve रखें।",
    ],
    love: [
      "रिश्ते में भावनात्मक सुरक्षा बढ़ेगी।",
      "अपनी भावनाएँ छिपाने के बजाय शांत तरीके से साझा करें।",
      "परिवार का समर्थन रिश्ते में सकारात्मक असर डाल सकता है।",
      "अत्यधिक अपेक्षाओं से बचें।",
    ],
    health: [
      "तनाव का असर शरीर पर न पड़े, इसका ध्यान रखें।",
      "आराम और पर्याप्त पानी जरूरी है।",
      "घर का संतुलित भोजन बेहतर रहेगा।",
      "नींद का समय सुधारें।",
    ],
    family: [
      "परिवार के साथ महत्वपूर्ण समय मिलेगा।",
      "घर के किसी सदस्य को आपके समर्थन की जरूरत हो सकती है।",
    ],
    education: [
      "शांत माहौल में पढ़ाई तेजी से होगी।",
      "याद करने की बजाय concept समझने पर ध्यान दें।",
    ],
    travel: [
      "परिवार के साथ यात्रा सुखद हो सकती है।",
      "यात्रा में भावनात्मक तनाव से बचें।",
    ],
    spiritual: [
      "ध्यान और प्रार्थना आपको मानसिक स्थिरता दे सकते हैं।",
      "जल तत्व के पास समय बिताना मन को शांत कर सकता है।",
    ],
    advice: [
      "हर बात को व्यक्तिगत न लें।",
      "भावनाओं और तर्क के बीच संतुलन रखें।",
    ],
    doToday: [
      "परिवार के लिए समय निकालें।",
      "महत्वपूर्ण बात शांत मन से करें।",
    ],
    avoidToday: [
      "पुरानी बातों को बार-बार याद न करें।",
      "भावनात्मक खरीदारी से बचें।",
    ],
  },

  Simha: {
    general: [
      "आज आत्मविश्वास और नेतृत्व की भावना मजबूत रहेगी।",
      "आपकी उपस्थिति लोगों पर सकारात्मक प्रभाव डाल सकती है।",
      "नई जिम्मेदारी लेने का अवसर मिल सकता है।",
      "सम्मान पाने से पहले दूसरों के योगदान को भी महत्व दें।",
    ],
    career: [
      "नेतृत्व की भूमिका में अच्छा प्रदर्शन कर सकते हैं।",
      "प्रस्तुति और public speaking आपके पक्ष में रहेंगे।",
      "नई परियोजना के लिए समर्थन मिल सकता है।",
      "अहंकार के बजाय सहयोग से बेहतर परिणाम मिलेंगे।",
    ],
    finance: [
      "कमाई के अच्छे अवसर बन सकते हैं।",
      "प्रतिष्ठा से जुड़े खर्च का बजट रखें।",
      "बड़ी खरीदारी से पहले तुलना करें।",
      "लंबी अवधि की योजना पर ध्यान दें।",
    ],
    love: [
      "रिश्तों में गर्मजोशी बढ़ेगी।",
      "अपने साथी की उपलब्धियों की सराहना करें।",
      "नई पहचान रोमांटिक बातचीत में बदल सकती है।",
      "सिर्फ अपनी बात मनवाने से बचें।",
    ],
    health: [
      "ऊर्जा अच्छी रहेगी, लेकिन आराम भी जरूरी है।",
      "अति-व्यायाम से बचें।",
      "जल और नींद का ध्यान रखें।",
      "तनाव कम करने के लिए खुली हवा में समय बिताएँ।",
    ],
    family: [
      "परिवार में आपकी भूमिका महत्वपूर्ण रहेगी।",
      "किसी उत्सव या आयोजन की तैयारी हो सकती है।",
    ],
    education: [
      "प्रतियोगी परीक्षाओं के लिए focus बनाए रखना उपयोगी रहेगा।",
      "Presentation-based learning आपको suit करेगी।",
    ],
    travel: [
      "यात्रा के दौरान networking का अवसर मिलेगा।",
      "सार्वजनिक या भीड़भाड़ वाले स्थानों में समय प्रबंधन करें।",
    ],
    spiritual: [
      "सूर्योदय के समय शांत ध्यान उपयोगी रहेगा।",
      "कृतज्ञता आपकी मानसिक ऊर्जा बढ़ाएगी।",
    ],
    advice: [
      "नेतृत्व करें, लेकिन दूसरों की बात भी सुनें।",
      "सम्मान पाने का सबसे अच्छा तरीका सम्मान देना है।",
    ],
    doToday: [
      "महत्वपूर्ण प्रस्तुति या बैठक करें।",
      "अपने long-term goal की समीक्षा करें।",
    ],
    avoidToday: [
      "अनावश्यक दिखावे से बचें।",
      "जल्दबाजी में पैसा खर्च न करें।",
    ],
  },

  Kanya: {
    general: [
      "आज planning और organization आपको बढ़त देगा।",
      "बारीकी पर ध्यान देने से बड़ी गलती बच सकती है।",
      "छोटे सुधार लंबे समय में लाभ देंगे।",
      "सब कुछ perfect बनाने की कोशिश में समय बर्बाद न करें।",
    ],
    career: [
      "documentation और analysis में अच्छा प्रदर्शन करेंगे।",
      "काम में systematic approach उपयोगी रहेगी।",
      "नई जिम्मेदारी लेने से पहले scope स्पष्ट करें।",
      "एक महत्वपूर्ण technical या administrative समस्या हल हो सकती है।",
    ],
    finance: [
      "वित्तीय रिकॉर्ड और बिलों की समीक्षा करें।",
      "बचत बढ़ाने की योजना बनाई जा सकती है।",
      "छोटे खर्चों पर ध्यान दें।",
      "Risky decision से पहले data जाँचें।",
    ],
    love: [
      "रिश्तों में छोटी बातों को ज्यादा analyze न करें।",
      "व्यावहारिक सहायता दिखाने से प्रेम मजबूत होगा।",
      "नया संबंध धीरे-धीरे विकसित हो सकता है।",
      "आलोचना के बजाय appreciation पर ध्यान दें।",
    ],
    health: [
      "Routine सबसे ज्यादा मदद करेगा।",
      "पाचन और नींद का ध्यान रखें।",
      "लंबे समय तक काम करने के बीच break लें।",
      "तनाव के लक्षणों को नजरअंदाज न करें।",
    ],
    family: [
      "घर के काम व्यवस्थित करने का अच्छा समय है।",
      "परिवार में आपकी practical advice काम आएगी।",
    ],
    education: [
      "रिवीजन और practice के लिए उत्कृष्ट समय है।",
      "एक structured study plan बनाएँ।",
    ],
    travel: [
      "यात्रा से पहले checklist बनाएँ।",
      "कार्य यात्रा में documentation संभालकर रखें।",
    ],
    spiritual: [
      "लेखन और journaling मानसिक स्पष्टता देगा।",
      "शांत ध्यान से overthinking कम होगा।",
    ],
    advice: [
      "Perfect नहीं, practical बनने की कोशिश करें।",
      "एक समय में एक महत्वपूर्ण task पूरा करें।",
    ],
    doToday: [
      "काम की checklist बनाएँ।",
      "बजट की समीक्षा करें।",
    ],
    avoidToday: [
      "हर छोटी गलती पर खुद को दोष न दें।",
      "अत्यधिक आलोचना से बचें।",
    ],
  },

  Tula: {
    general: [
      "आज संतुलन और सहयोग आपके लिए महत्वपूर्ण रहेंगे।",
      "सही बातचीत से मुश्किल स्थिति को भी आसानी से संभाला जा सकता है।",
      "साझेदारी में अच्छे अवसर मिल सकते हैं।",
      "निर्णय लेते समय अपनी जरूरतों को भी महत्व दें।",
    ],
    career: [
      "Client handling और negotiation अच्छे रहेंगे।",
      "सहयोगी वातावरण में आपकी productivity बढ़ेगी।",
      "Partnership आधारित प्रोजेक्ट आगे बढ़ सकता है।",
      "निर्णय लंबित रखने की आदत कम करें।",
    ],
    finance: [
      "साझेदारी या joint financial planning उपयोगी रह सकती है।",
      "फालतू subscriptions की समीक्षा करें।",
      "खर्च और बचत का संतुलन रखें।",
      "बड़ी खरीद पर दो विकल्पों की तुलना करें।",
    ],
    love: [
      "आज companionship की भावना मजबूत होगी।",
      "ईमानदार बातचीत संबंध में स्थिरता ला सकती है।",
      "अविवाहित लोगों के लिए social event उपयोगी रहेगा।",
      "दूसरों को खुश करने के लिए अपनी सीमा न भूलें।",
    ],
    health: [
      "काम और आराम में संतुलन जरूरी है।",
      "हल्का व्यायाम अच्छा रहेगा।",
      "स्क्रीन टाइम नियंत्रित करें।",
      "मानसिक शांति के लिए नियमित break लें।",
    ],
    family: [
      "परिवार में सहयोग और समझ बढ़ेगी।",
      "किसी विवाद को शांत तरीके से सुलझाने की भूमिका निभा सकते हैं।",
    ],
    education: [
      "Group study से लाभ मिल सकता है।",
      "विचार साझा करने से आपकी समझ मजबूत होगी।",
    ],
    travel: [
      "साथी या मित्र के साथ यात्रा सुखद रहेगी।",
      "योजना में सभी की सुविधा का ध्यान रखें।",
    ],
    spiritual: [
      "सुंदर और शांत वातावरण में समय बिताएँ।",
      "संगीत या ध्यान मन को संतुलित कर सकता है।",
    ],
    advice: [
      "सबको खुश करने के बजाय सही निर्णय पर ध्यान दें।",
      "अपनी boundaries स्पष्ट रखें।",
    ],
    doToday: [
      "महत्वपूर्ण बातचीत करें।",
      "एक लंबित निर्णय पूरा करें।",
    ],
    avoidToday: [
      "अनिर्णय में समय न गँवाएँ।",
      "सिर्फ दूसरों की राय पर निर्भर न रहें।",
    ],
  },

  Vrishchika: {
    general: [
      "आज आपकी focus और determination मजबूत रहेगी।",
      "एक महत्वपूर्ण मुद्दे पर गहरी समझ विकसित हो सकती है।",
      "कम बोलकर सही समय पर सही कदम उठाना लाभकारी रहेगा।",
      "छिपी हुई जानकारी आपके पक्ष में आ सकती है।",
    ],
    career: [
      "Complex problem solving में अच्छा प्रदर्शन करेंगे।",
      "गोपनीय प्रोजेक्ट में जिम्मेदारी बढ़ सकती है।",
      "किसी वरिष्ठ से महत्वपूर्ण feedback मिलेगा।",
      "भावनात्मक reaction से बचें।",
    ],
    finance: [
      "वित्तीय निर्णयों में research जरूरी है।",
      "पुराने भुगतान या निवेश की समीक्षा करें।",
      "छिपे हुए खर्चों पर ध्यान दें।",
      "बिना जाँच financial commitment न करें।",
    ],
    love: [
      "रिश्तों में गहराई बढ़ सकती है।",
      "विश्वास से जुड़ी बात पर खुलकर चर्चा करें।",
      "पुरानी नाराज़गी छोड़ने का समय है।",
      "अत्यधिक possessiveness नुकसान कर सकती है।",
    ],
    health: [
      "तनाव release करने के लिए physical activity उपयोगी है।",
      "आराम और hydration पर ध्यान दें।",
      "भावनात्मक तनाव को दबाकर न रखें।",
      "नींद की कमी से बचें।",
    ],
    family: [
      "परिवार के किसी सदस्य से गहन बातचीत हो सकती है।",
      "पुराना मतभेद सुलझाने का अवसर मिल सकता है।",
    ],
    education: [
      "Research-oriented subjects में अच्छा प्रदर्शन होगा।",
      "Deep study आज आपके लिए उपयुक्त है।",
    ],
    travel: [
      "जरूरत के अनुसार यात्रा करें, बिना योजना के नहीं।",
      "दस्तावेजों की सुरक्षा सुनिश्चित करें।",
    ],
    spiritual: [
      "ध्यान और मौन आपको मानसिक शक्ति देंगे।",
      "आत्मचिंतन आज खासतौर पर उपयोगी रहेगा।",
    ],
    advice: [
      "हर बात control करने की कोशिश न करें।",
      "विश्वास और धैर्य बनाए रखें।",
    ],
    doToday: [
      "एक महत्वपूर्ण समस्या पर गहराई से काम करें।",
      "वित्तीय रिकॉर्ड जाँचें।",
    ],
    avoidToday: [
      "जलन और संदेह से बचें।",
      "भावनात्मक प्रतिक्रिया तुरंत न दें।",
    ],
  },

  Dhanu: {
    general: [
      "आज सीखने और आगे बढ़ने की ऊर्जा मजबूत रहेगी।",
      "नई दिशा में कदम रखने का अवसर मिल सकता है।",
      "Optimism आपको कठिन परिस्थिति से बाहर निकालेगा।",
      "दूर की योजना बनाने के लिए दिन अच्छा है।",
    ],
    career: [
      "नए project या expansion पर विचार हो सकता है।",
      "Mentor या senior से अच्छी सलाह मिलेगी।",
      "Training या certification career में मदद कर सकती है।",
      "Overcommitment से बचें।",
    ],
    finance: [
      "Long-term financial planning पर ध्यान दें।",
      "Travel या education पर खर्च बढ़ सकता है।",
      "आय के विविध स्रोतों पर विचार करें।",
      "Risk लेने से पहले exit plan रखें।",
    ],
    love: [
      "रिश्ते में openness बढ़ेगी।",
      "साथी के साथ यात्रा या नया अनुभव संबंध मजबूत कर सकता है।",
      "नया connection दूर के स्थान से हो सकता है।",
      "बहुत सीधे शब्दों से बचें।",
    ],
    health: [
      "Outdoor activity आपको energy देगी।",
      "अति-थकान से बचें।",
      "रूटीन में stretching शामिल करें।",
      "संतुलित भोजन रखें।",
    ],
    family: [
      "परिवार के साथ future planning पर चर्चा हो सकती है।",
      "किसी सदस्य को आपके encouragement की जरूरत होगी।",
    ],
    education: [
      "Higher education और competitive learning के लिए अच्छा समय है।",
      "नए विषय सीखने का उत्साह बढ़ेगा।",
    ],
    travel: [
      "दूर की यात्रा के संकेत मजबूत हो सकते हैं।",
      "Travel itinerary पहले से तय करें।",
    ],
    spiritual: [
      "धार्मिक या आध्यात्मिक अध्ययन लाभकारी रहेगा।",
      "गुरु या mentor की सलाह उपयोगी हो सकती है।",
    ],
    advice: [
      "बड़े लक्ष्य रखें, लेकिन छोटे कदमों को नजरअंदाज न करें।",
      "आशावाद के साथ practical planning रखें।",
    ],
    doToday: [
      "एक long-term plan लिखें।",
      "नई learning शुरू करें।",
    ],
    avoidToday: [
      "बिना तैयारी commitment न लें।",
      "अत्यधिक optimism में risk न बढ़ाएँ।",
    ],
  },

  Makara: {
    general: [
      "आज discipline और patience आपके सबसे बड़े strengths रहेंगे।",
      "धीरे-धीरे किया गया काम स्थायी परिणाम देगा।",
      "जिम्मेदारियाँ बढ़ सकती हैं, लेकिन उनका परिणाम भी मिलेगा।",
      "लंबी अवधि की योजना पर टिके रहें।",
    ],
    career: [
      "काम में authority और responsibility बढ़ सकती है।",
      "Senior management से recognition संभव है।",
      "सिस्टम सुधारने का अच्छा समय है।",
      "काम का बोझ होने पर delegation करें।",
    ],
    finance: [
      "बचत और दीर्घकालीन निवेश पर ध्यान दें।",
      "बजट disciplined रखें।",
      "Property या asset-related planning पर research कर सकते हैं।",
      "धीरे लेकिन स्थिर financial growth पर भरोसा रखें।",
    ],
    love: [
      "रिश्तों में भरोसा और commitment बढ़ेगा।",
      "काम के कारण साथी को समय कम न दें।",
      "अविवाहित लोगों के लिए serious connection बन सकता है।",
      "भावनाएँ व्यक्त करना न भूलें।",
    ],
    health: [
      "काम के बीच आराम जरूरी है।",
      "पीठ और posture का ध्यान रखें।",
      "नियमित exercise लाभकारी रहेगी।",
      "Stress को जमा न होने दें।",
    ],
    family: [
      "परिवार आपकी stability पर भरोसा करेगा।",
      "घर की जिम्मेदारियों को अकेले लेने से बचें।",
    ],
    education: [
      "Competitive preparation में discipline फायदा देगा।",
      "Long-term study plan बनाकर चलें।",
    ],
    travel: [
      "काम से जुड़ी यात्रा लाभदायक हो सकती है।",
      "कार्यक्रम में पर्याप्त buffer time रखें।",
    ],
    spiritual: [
      "नियमित साधना और अनुशासन मानसिक शांति देगा।",
      "थोड़ा मौन समय उपयोगी रहेगा।",
    ],
    advice: [
      "आज की मेहनत का असर बाद में दिखेगा।",
      "छोटी प्रगति को भी महत्व दें।",
    ],
    doToday: [
      "दीर्घकालीन लक्ष्य की समीक्षा करें।",
      "कार्य प्राथमिकता तय करें।",
    ],
    avoidToday: [
      "काम के कारण स्वास्थ्य नजरअंदाज न करें।",
      "निराशावादी सोच से बचें।",
    ],
  },

  Kumbha: {
    general: [
      "आज नए विचार और अलग दृष्टिकोण आपके लिए उपयोगी होंगे।",
      "परंपरागत तरीके के साथ technology का उपयोग लाभ देगा।",
      "किसी समूह या network से महत्वपूर्ण संपर्क बन सकता है।",
      "अपने ideas को स्पष्ट रूप से प्रस्तुत करें।",
    ],
    career: [
      "Innovation आपके काम की पहचान बन सकती है।",
      "Technology-related अवसर सामने आ सकते हैं।",
      "नई टीम या network उपयोगी रहेगा।",
      "अत्यधिक अलग सोच के कारण practical details न भूलें।",
    ],
    finance: [
      "नई income stream के ideas बन सकते हैं।",
      "Online financial services की समीक्षा करें।",
      "असामान्य investment में research जरूरी है।",
      "बजट में flexibility रखें।",
    ],
    love: [
      "रिश्तों में दोस्ती का महत्व बढ़ेगा।",
      "साथी के साथ खुलकर future plans पर बात करें।",
      "नया connection unconventional माध्यम से हो सकता है।",
      "भावनात्मक दूरी को नजरअंदाज न करें।",
    ],
    health: [
      "Routine में बदलाव से energy बेहतर हो सकती है।",
      "Screen time कम करें।",
      "फ्रेश air और walking लाभकारी रहेगी।",
      "नींद की गुणवत्ता पर ध्यान दें।",
    ],
    family: [
      "परिवार आपके नए विचारों में रुचि दिखा सकता है।",
      "किसी पुराने मतभेद का नया समाधान मिल सकता है।",
    ],
    education: [
      "Technology और research oriented study के लिए अच्छा समय है।",
      "Self-learning से फायदा होगा।",
    ],
    travel: [
      "नए स्थानों की यात्रा आपको fresh perspective दे सकती है।",
      "Unplanned बदलाव के लिए तैयार रहें।",
    ],
    spiritual: [
      "ध्यान के साथ अध्ययन आपको clarity देगा।",
      "सामाजिक सेवा भी आध्यात्मिक संतोष दे सकती है।",
    ],
    advice: [
      "नया सोचें, लेकिन practical implementation तय रखें।",
      "अपने ideas को action plan में बदलें।",
    ],
    doToday: [
      "नई strategy लिखें।",
      "Useful networking करें।",
    ],
    avoidToday: [
      "हर नियम को सिर्फ विरोध के लिए चुनौती न दें।",
      "अनावश्यक social distraction से बचें।",
    ],
  },

  Meena: {
    general: [
      "आज intuition और imagination मजबूत रहेंगे।",
      "रचनात्मक कार्यों में अच्छा flow महसूस हो सकता है।",
      "दूसरों की मदद करते समय अपनी सीमा भी तय करें।",
      "आंतरिक शांति पाने के लिए धीमी गति उपयोगी रहेगी।",
    ],
    career: [
      "Creative और people-oriented कार्यों में सफलता मिल सकती है।",
      "काम में empathy आपकी ताकत बनेगी।",
      "स्पष्ट deadlines तय करना जरूरी होगा।",
      "दूसरों का काम अपने ऊपर लेने से बचें।",
    ],
    finance: [
      "भावनात्मक खर्च से बचें।",
      "बजट को लिखकर चलना लाभदायक रहेगा।",
      "बचत के लिए automatic system उपयोगी हो सकता है।",
      "किसी के कहने पर पैसा invest न करें।",
    ],
    love: [
      "रिश्तों में भावनात्मक जुड़ाव बढ़ेगा।",
      "अपने साथी की भावनाओं को समझने की कोशिश करें।",
      "नया romance धीरे-धीरे विकसित हो सकता है।",
      "अत्यधिक ideal expectations से बचें।",
    ],
    health: [
      "मानसिक विश्राम आज उतना ही जरूरी है जितना physical rest।",
      "नींद और hydration का ध्यान रखें।",
      "ध्यान या breathing exercises लाभ देंगी।",
      "अनियमित भोजन से बचें।",
    ],
    family: [
      "परिवार में emotional bonding बढ़ेगी।",
      "किसी सदस्य को आपकी सुनने की जरूरत होगी।",
    ],
    education: [
      "Creative subjects में अच्छी progress होगी।",
      "शांत वातावरण में अध्ययन बेहतर रहेगा।",
    ],
    travel: [
      "प्रकृति या शांत स्थान की यात्रा मन को सुकून देगी।",
      "यात्रा में आराम और समय दोनों रखें।",
    ],
    spiritual: [
      "ध्यान, प्रार्थना और सेवा आपके लिए विशेष रूप से सकारात्मक रहेंगे।",
      "कुछ समय मौन रहने से clarity बढ़ेगी।",
    ],
    advice: [
      "दूसरों की ऊर्जा से खुद को अलग रखना सीखें।",
      "Intuition को practical action से जोड़ें।",
    ],
    doToday: [
      "कुछ समय ध्यान करें।",
      "जरूरी कामों की स्पष्ट सूची बनाएं।",
    ],
    avoidToday: [
      "हर किसी की समस्या अपने ऊपर न लें।",
      "भावनात्मक निर्णय में जल्दबाजी न करें।",
    ],
  },
};

/* =========================================================
   VALIDATION
========================================================= */

function assertValidRashi(
  rashi: ZodiacSign,
): void {
  if (!RASHIS.includes(rashi)) {
    throw new RangeError(
      `Invalid Rashi: ${String(rashi)}`,
    );
  }
}

function assertValidPeriod(
  period: RashifalPeriod,
): void {
  if (
    period !== "daily" &&
    period !== "weekly" &&
    period !== "monthly"
  ) {
    throw new RangeError(
      `Invalid Rashifal period: ${String(period)}`,
    );
  }
}

function assertValidDate(
  date: Date,
): void {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    throw new RangeError(
      "Invalid rashifal date.",
    );
  }
}

/* =========================================================
   DATE HELPERS
========================================================= */

function normalizeDate(
  date?: Date,
): Date {
  const value = date
    ? new Date(date.getTime())
    : new Date();

  assertValidDate(value);

  return value;
}

export function toISODate(
  date: Date,
): string {
  const value =
    normalizeDate(date);

  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      value.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  date: Date,
  amount: number,
): Date {
  const result =
    normalizeDate(date);

  result.setDate(
    result.getDate() + amount,
  );

  return result;
}

/* =========================================================
   DETERMINISTIC HASH
========================================================= */

function hashString(
  value: string,
): number {
  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index++
  ) {
    hash =
      (hash << 5) -
      hash +
      value.charCodeAt(index);

    hash |= 0;
  }

  return Math.abs(hash);
}

function pick<T>(
  items: readonly T[],
  seed: string,
): T {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "Cannot select from an empty collection.",
    );
  }

  return items[
    hashString(seed) % items.length
  ];
}

/* =========================================================
   RATING
========================================================= */

const RATING_VALUES = [
  3,
  3.5,
  4,
  4,
  4.5,
  4.5,
  5,
] as const;

function weightedRating(
  seed: string,
): number {
  return pick(
    RATING_VALUES,
    seed,
  );
}

function normalizeRating(
  rating: number,
): number {
  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(0, rating),
  );
}

function ratingLabel(
  rating: number,
): string {
  const value =
    normalizeRating(rating);

  if (value >= 4.5) {
    return "बहुत शुभ";
  }

  if (value >= 4) {
    return "शुभ";
  }

  if (value >= 3.5) {
    return "सामान्य से बेहतर";
  }

  if (value >= 3) {
    return "सामान्य";
  }

  return "सावधानी रखें";
}

/* =========================================================
   PERIOD
========================================================= */

function getPeriodLabel(
  period: RashifalPeriod,
): string {
  switch (period) {
    case "daily":
      return "दैनिक राशिफल";

    case "weekly":
      return "साप्ताहिक राशिफल";

    case "monthly":
      return "मासिक राशिफल";

    default:
      return "राशिफल";
  }
}

function getPeriodSeedDate(
  date: Date,
  period: RashifalPeriod,
): Date {
  const result =
    normalizeDate(date);

  if (period === "daily") {
    return result;
  }

  if (period === "weekly") {
    const day =
      result.getDay();

    const mondayOffset =
      day === 0 ? -6 : 1 - day;

    return addDays(
      result,
      mondayOffset,
    );
  }

  return new Date(
    result.getFullYear(),
    result.getMonth(),
    1,
  );
}

/* =========================================================
   SIGN DISTANCE
========================================================= */

function signIndex(
  rashi: ZodiacSign,
): number {
  return RASHIS.indexOf(rashi);
}

function distanceFromMoon(
  moonSign: ZodiacSign,
  transitSign: ZodiacSign,
): number {
  const moonIndex =
    signIndex(moonSign);

  const transitIndex =
    signIndex(transitSign);

  return (
    ((transitIndex -
      moonIndex +
      12) %
      12) +
    1
  );
}

/* =========================================================
   ASTROLOGY SNAPSHOT
========================================================= */

function buildAstrologySnapshot(
  date: Date,
  moonSign: ReturnType<typeof getMoonSign>,
): RashifalAstrology {
  const saturn =
    getPlanetPosition(
      "Saturn",
      date,
    );

  const jupiter =
    getPlanetPosition(
      "Jupiter",
      date,
    );

  const mars =
    getPlanetPosition(
      "Mars",
      date,
    );

  const rahu =
    getPlanetPosition(
      "Rahu",
      date,
    );

  const ketu =
    getPlanetPosition(
      "Ketu",
      date,
    );

  return {
    moonSign:
      moonSign.sign,

    moonSignEnglish:
      moonSign.signEnglish,

    nakshatra:
      moonSign.nakshatra,

    nakshatraPada:
      moonSign.pada,

    moonLongitude:
      moonSign.longitude,

    moonDegreeInSign:
      moonSign.degreeInSign,

    saturnSign:
      saturn.sign,

    saturnSignEnglish:
      saturn.signEnglish,

    saturnDegreeInSign:
      saturn.degreeInSign,

    saturnRetrograde:
      saturn.retrograde,

    jupiterSign:
      jupiter.sign,

    jupiterSignEnglish:
      jupiter.signEnglish,

    jupiterRetrograde:
      jupiter.retrograde,

    marsSign:
      mars.sign,

    marsSignEnglish:
      mars.signEnglish,

    marsRetrograde:
      mars.retrograde,

    rahuSign:
      rahu.sign,

    rahuSignEnglish:
      rahu.signEnglish,

    ketuSign:
      ketu.sign,

    ketuSignEnglish:
      ketu.signEnglish,

    saturnFromMoon:
      distanceFromMoon(
        moonSign.sign,
        saturn.sign,
      ),

    jupiterFromMoon:
      distanceFromMoon(
        moonSign.sign,
        jupiter.sign,
      ),

    marsFromMoon:
      distanceFromMoon(
        moonSign.sign,
        mars.sign,
      ),

    rahuFromMoon:
      distanceFromMoon(
        moonSign.sign,
        rahu.sign,
      ),

    ketuFromMoon:
      distanceFromMoon(
        moonSign.sign,
        ketu.sign,
      ),
  };
}

/* =========================================================
   TRANSIT INTERPRETATION
========================================================= */

function getJupiterInfluence(
  house: number,
): {
  adjustment: number;
  text: string;
  positive?: string;
} {
  if (
    house === 1 ||
    house === 5 ||
    house === 7 ||
    house === 9 ||
    house === 11
  ) {
    return {
      adjustment: 0.5,
      text:
        "गुरु की स्थिति विकास, ज्ञान, अवसर और सकारात्मक निर्णयों को समर्थन दे सकती है।",
      positive:
        "गुरु का गोचर सहयोगी संकेत दे रहा है।",
    };
  }

  if (
    house === 6 ||
    house === 8 ||
    house === 12
  ) {
    return {
      adjustment: -0.25,
      text:
        "गुरु का वर्तमान गोचर खर्च, जिम्मेदारियों या अतिरिक्त सीखने की जरूरत बढ़ा सकता है।",
    };
  }

  return {
    adjustment: 0.25,
    text:
      "गुरु का गोचर धीरे-धीरे सकारात्मक विकास की दिशा बना सकता है।",
    positive:
      "गुरु की ऊर्जा दीर्घकालीन विकास को समर्थन दे सकती है।",
  };
}

function getSaturnInfluence(
  house: number,
): {
  adjustment: number;
  text: string;
  caution?: string;
} {
  if (
    house === 3 ||
    house === 6 ||
    house === 10 ||
    house === 11
  ) {
    return {
      adjustment: 0.25,
      text:
        "शनि की स्थिति अनुशासन, मेहनत और स्थायी प्रगति पर जोर देती है।",
      caution:
        "परिणाम धीरे मिल सकते हैं, इसलिए निरंतरता बनाए रखें।",
    };
  }

  if (
    house === 1 ||
    house === 4 ||
    house === 7 ||
    house === 8 ||
    house === 12
  ) {
    return {
      adjustment: -0.25,
      text:
        "शनि का प्रभाव जिम्मेदारियों, धैर्य और सावधानी की मांग कर सकता है।",
      caution:
        "महत्वपूर्ण निर्णयों में जल्दबाजी से बचें।",
    };
  }

  return {
    adjustment: 0,
    text:
      "शनि का प्रभाव आज धैर्य और जिम्मेदारी के साथ आगे बढ़ने का संकेत देता है।",
  };
}

function getMarsInfluence(
  house: number,
): {
  adjustment: number;
  text: string;
  caution?: string;
} {
  if (
    house === 3 ||
    house === 6 ||
    house === 10 ||
    house === 11
  ) {
    return {
      adjustment: 0.2,
      text:
        "मंगल की स्थिति ऊर्जा, साहस और कार्यक्षमता को बढ़ा सकती है।",
    };
  }

  if (
    house === 4 ||
    house === 7 ||
    house === 8 ||
    house === 12
  ) {
    return {
      adjustment: -0.2,
      text:
        "मंगल का प्रभाव प्रतिक्रिया और तनाव को बढ़ा सकता है।",
      caution:
        "बहस और जल्दबाजी से बचें।",
    };
  }

  return {
    adjustment: 0,
    text:
      "मंगल आज सक्रियता और निर्णय क्षमता को प्रभावित कर सकता है।",
  };
}

function getRahuKetuInfluence(
  rahuHouse: number,
  ketuHouse: number,
): {
  adjustment: number;
  text: string;
  caution?: string;
} {
  if (
    rahuHouse === 3 ||
    rahuHouse === 6 ||
    rahuHouse === 10 ||
    rahuHouse === 11
  ) {
    return {
      adjustment: 0.15,
      text:
        "राहु का प्रभाव नए अवसरों, तकनीक और असामान्य दिशा में प्रगति ला सकता है।",
    };
  }

  if (
    rahuHouse === 8 ||
    rahuHouse === 12 ||
    ketuHouse === 8 ||
    ketuHouse === 12
  ) {
    return {
      adjustment: -0.15,
      text:
        "राहु-केतु का प्रभाव भ्रम, अचानक बदलाव या आंतरिक बेचैनी बढ़ा सकता है।",
      caution:
        "अधूरी जानकारी के आधार पर निर्णय न लें।",
    };
  }

  return {
    adjustment: 0,
    text:
      "राहु-केतु की स्थिति आज आपको सोच-समझकर बदलाव करने की प्रेरणा दे सकती है।",
  };
}

/* =========================================================
   TRANSIT ANALYSIS
========================================================= */

function calculateTransitInfluence(
  astrology: RashifalAstrology,
): RashifalTransitInfluence {
  const positiveFactors: string[] = [];
  const cautionFactors: string[] = [];

  const jupiter =
    getJupiterInfluence(
      astrology.jupiterFromMoon,
    );

  const saturn =
    getSaturnInfluence(
      astrology.saturnFromMoon,
    );

  const mars =
    getMarsInfluence(
      astrology.marsFromMoon,
    );

  const rahuKetu =
    getRahuKetuInfluence(
      astrology.rahuFromMoon,
      astrology.ketuFromMoon,
    );

  if (jupiter.positive) {
    positiveFactors.push(
      jupiter.positive,
    );
  }

  if (saturn.caution) {
    cautionFactors.push(
      saturn.caution,
    );
  }

  if (mars.caution) {
    cautionFactors.push(
      mars.caution,
    );
  }

  if (rahuKetu.caution) {
    cautionFactors.push(
      rahuKetu.caution,
    );
  }

  if (
    astrology.jupiterRetrograde
  ) {
    cautionFactors.push(
      "गुरु वक्री होने पर पुराने निर्णयों और योजनाओं की समीक्षा उपयोगी हो सकती है।",
    );
  }

  if (
    astrology.saturnRetrograde
  ) {
    cautionFactors.push(
      "शनि वक्री होने पर जिम्मेदारियों और पुराने मामलों की दोबारा समीक्षा करें।",
    );
  }

  const adjustment =
    jupiter.adjustment +
    saturn.adjustment +
    mars.adjustment +
    rahuKetu.adjustment;

  return {
    scoreAdjustment:
      Number(
        adjustment.toFixed(2),
      ),

    positiveFactors,

    cautionFactors,

    saturn:
      saturn.text,

    jupiter:
      jupiter.text,

    mars:
      mars.text,

    rahuKetu:
      rahuKetu.text,
  };
}

/* =========================================================
   SADE SATI
========================================================= */

type SadeSatiEngineResult = ReturnType<typeof getCurrentSadeSati>;
type DhaiyaEngineResult = ReturnType<typeof getCurrentDhaiya>;

function buildSadeSatiResult(
  analysis: SadeSatiEngineResult | null | undefined,
): RashifalSadeSati {
  if (!analysis) {
    return {
      active: false,
      phase: "none",
      summary:
        "वर्तमान गणना के अनुसार शनि की साढ़ेसाती सक्रिय नहीं है।",
      advice:
        "सामान्य अनुशासन और सकारात्मक दिनचर्या बनाए रखें।",
    };
  }

  const active =
    Boolean(
      (analysis as any).isActive ??
        (analysis as any).active,
    );

  const phase =
    String(
      (analysis as any).phase ??
        "none",
    );

  const summary =
    String(
      (analysis as any).summary ??
        (active
          ? "साढ़ेसाती की अवधि सक्रिय है।"
          : "साढ़ेसाती सक्रिय नहीं है।"),
    );

  const advice =
    String(
      (analysis as any).advice ??
        (active
          ? "धैर्य, अनुशासन और जिम्मेदार निर्णयों पर ध्यान दें।"
          : "नियमितता और संतुलन बनाए रखें।"),
    );

  return {
    active,
    phase,
    summary,
    advice,
  };
}

/* =========================================================
   DHAIYA
========================================================= */

function buildDhaiyaResult(
  analysis: DhaiyaEngineResult | null | undefined,
): RashifalDhaiya {
  if (!analysis) {
    return {
      active: false,
      type: "none",
      summary:
        "वर्तमान गणना के अनुसार शनि ढैय्या सक्रिय नहीं है।",
      advice:
        "सामान्य सावधानी और अनुशासन बनाए रखें।",
    };
  }

  const active =
    Boolean(
      (analysis as any).isActive ??
        (analysis as any).active,
    );

  const type =
    String(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (analysis as any).type ??
        (analysis as any).phase ??
        "none",
    );

  const summary =
    String(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (analysis as any).summary ??
        (active
          ? "शनि ढैय्या की अवधि सक्रिय है।"
          : "शनि ढैय्या सक्रिय नहीं है।"),
    );

  const advice =
    String(
      (analysis as any).advice ??
        (active
          ? "धैर्य रखें और अनावश्यक जोखिम से बचें।"
          : "नियमितता बनाए रखें।"),
    );

  return {
    active,
    type,
    summary,
    advice,
  };
}

/* =========================================================
   SAFE SADE SATI / DHAIYA ACCESS
========================================================= */

function calculateSadeSatiSafe(
  date: Date,
  moonSign: ZodiacSign,
): RashifalSadeSati {
  try {
    const result =
      getCurrentSadeSati(
        date,
        moonSign,
      );

    return buildSadeSatiResult(
      result,
    );
  } catch {
    return {
      active: false,
      phase: "none",
      summary:
        "साढ़ेसाती की स्थिति उपलब्ध नहीं हो सकी।",
      advice:
        "सामान्य अनुशासन और संतुलन बनाए रखें।",
    };
  }
}

function calculateDhaiyaSafe(
  date: Date,
  moonSign: ZodiacSign,
): RashifalDhaiya {
  try {
    const result =
      getCurrentDhaiya(
        date,
        moonSign,
      );

    return buildDhaiyaResult(
      result,
    );
  } catch {
    return {
      active: false,
      type: "none",
      summary:
        "ढैय्या की स्थिति उपलब्ध नहीं हो सकी।",
      advice:
        "सामान्य सावधानी और संतुलन बनाए रखें।",
    };
  }
}

/* =========================================================
   PERIOD CONTENT
========================================================= */

type GeneratedRashifalContent = Omit<
  RashifalResult,
  | "id"
  | "dateISO"
  | "period"
  | "rashi"
  | "rashiEnglish"
  | "rashiHindi"
  | "lord"
  | "moonSign"
  | "moonSignEnglish"
  | "nakshatra"
  | "nakshatraPada"
  | "location"
  | "astrology"
  | "transitInfluence"
  | "sadeSati"
  | "dhaiya"
>;

function createRashifalText(
  rashi: ZodiacSign,
  dateISO: string,
  period: RashifalPeriod,
): GeneratedRashifalContent {
  assertValidRashi(rashi);
  assertValidPeriod(period);

  const content =
    CONTENT[rashi];

  const periodDate =
    getPeriodSeedDate(
      new Date(
        `${dateISO}T12:00:00`,
      ),
      period,
    );

  const seedBase =
    `${toISODate(periodDate)}-${rashi}-${period}`;

  const general =
    pick(
      content.general,
      `${seedBase}-general`,
    );

  const career =
    pick(
      content.career,
      `${seedBase}-career`,
    );

  const finance =
    pick(
      content.finance,
      `${seedBase}-finance`,
    );

  const love =
    pick(
      content.love,
      `${seedBase}-love`,
    );

  const health =
    pick(
      content.health,
      `${seedBase}-health`,
    );

  const family =
    pick(
      content.family,
      `${seedBase}-family`,
    );

  const education =
    pick(
      content.education,
      `${seedBase}-education`,
    );

  const travel =
    pick(
      content.travel,
      `${seedBase}-travel`,
    );

  const spiritual =
    pick(
      content.spiritual,
      `${seedBase}-spiritual`,
    );

  const advice =
    pick(
      content.advice,
      `${seedBase}-advice`,
    );

  const doToday =
    pick(
      content.doToday,
      `${seedBase}-do`,
    );

  const avoidToday =
    pick(
      content.avoidToday,
      `${seedBase}-avoid`,
    );

  const rating =
    weightedRating(
      `${seedBase}-rating`,
    );

  const profile =
    RASHI_PROFILE[rashi];

  return {
    overallRating:
      rating,

    overallLabel:
      ratingLabel(rating),

    luckyNumber:
      pick(
        profile.luckyNumbers,
        `${seedBase}-number`,
      ),

    luckyColor:
      pick(
        profile.luckyColors,
        `${seedBase}-color`,
      ),

    luckyDay:
      pick(
        profile.luckyDays,
        `${seedBase}-day`,
      ),

    sections: [
      {
        title: "सामान्य",
        text: general,
      },
      {
        title: "करियर",
        text: career,
      },
      {
        title: "धन",
        text: finance,
      },
      {
        title: "प्रेम",
        text: love,
      },
      {
        title: "स्वास्थ्य",
        text: health,
      },
      {
        title: "परिवार",
        text: family,
      },
      {
        title: "शिक्षा",
        text: education,
      },
      {
        title: "यात्रा",
        text: travel,
      },
      {
        title: "आध्यात्मिक",
        text: spiritual,
      },
    ],

    general,
    career,
    finance,
    love,
    health,
    family,
    education,
    travel,
    spiritual,

    doToday,
    avoidToday,

    advice,
  };
}

/* =========================================================
   TRANSIT TEXT INJECTION
========================================================= */

function appendTransitAdvice(
  baseAdvice: string,
  influence: RashifalTransitInfluence,
  sadeSati: RashifalSadeSati,
  dhaiya: RashifalDhaiya,
): string {
  const parts: string[] = [
    baseAdvice,
  ];

  if (
    influence.positiveFactors.length
  ) {
    parts.push(
      influence.positiveFactors[0],
    );
  }

  if (
    influence.cautionFactors.length
  ) {
    parts.push(
      influence.cautionFactors[0],
    );
  }

  if (sadeSati.active) {
    parts.push(
      `साढ़ेसाती: ${sadeSati.advice}`,
    );
  }

  if (dhaiya.active) {
    parts.push(
      `ढैय्या: ${dhaiya.advice}`,
    );
  }

  return parts.join(" ");
}

/* =========================================================
   FINAL SCORE
========================================================= */

function calculateFinalScore(
  baseRating: number,
  influence: RashifalTransitInfluence,
  sadeSati: RashifalSadeSati,
  dhaiya: RashifalDhaiya,
): number {
  let score =
    baseRating +
    influence.scoreAdjustment;

  if (sadeSati.active) {
    score -= 0.25;
  }

  if (dhaiya.active) {
    score -= 0.15;
  }

  return Number(
    normalizeRating(score)
      .toFixed(1),
  );
}

/* =========================================================
   RASHIFAL FOR RASHI
========================================================= */

export function getRashifalForRashi(
  rashi: ZodiacSign,
  date: Date = new Date(),
  period: RashifalPeriod = "daily",
  location?: PanchangLocation,
): RashifalResult {
  assertValidRashi(rashi);
  assertValidPeriod(period);

  const targetDate =
    normalizeDate(date);

  const dateISO =
    toISODate(targetDate);

  const profile =
    RASHI_PROFILE[rashi];

  const content =
    createRashifalText(
      rashi,
      dateISO,
      period,
    );

  /*
   * For a sign-based Rashifal, use the selected
   * Rashi as the Moon-reference sign.
   */
  const moon =
    getMoonSign(targetDate);

  const astrology =
    buildAstrologySnapshot(
      targetDate,
      moon,
    );

  /*
   * The requested Rashi is used as the
   * interpretation reference.
   */
  const referenceAstrology =
    {
      ...astrology,

      moonSign: rashi,

      moonSignEnglish:
        profile.signEnglish,

      saturnFromMoon:
        distanceFromMoon(
          rashi,
          astrology.saturnSign,
        ),

      jupiterFromMoon:
        distanceFromMoon(
          rashi,
          astrology.jupiterSign,
        ),

      marsFromMoon:
        distanceFromMoon(
          rashi,
          astrology.marsSign,
        ),

      rahuFromMoon:
        distanceFromMoon(
          rashi,
          astrology.rahuSign,
        ),

      ketuFromMoon:
        distanceFromMoon(
          rashi,
          astrology.ketuSign,
        ),
    };

  const transitInfluence =
    calculateTransitInfluence(
      referenceAstrology,
    );

  const sadeSati =
    calculateSadeSatiSafe(
      targetDate,
      rashi,
    );

  const dhaiya =
    calculateDhaiyaSafe(
      targetDate,
      rashi,
    );

  const finalRating =
    calculateFinalScore(
      content.overallRating,
      transitInfluence,
      sadeSati,
      dhaiya,
    );

  const finalAdvice =
    appendTransitAdvice(
      content.advice,
      transitInfluence,
      sadeSati,
      dhaiya,
    );

  return {
    id:
      `${dateISO}-${period}-${rashi}`,

    dateISO,

    period,

    rashi,

    rashiEnglish:
      profile.signEnglish,

    rashiHindi:
      profile.signHindi,

    lord:
      profile.lord,

    ...content,

    overallRating:
      finalRating,

    overallLabel:
      ratingLabel(finalRating),

    advice:
      finalAdvice,

    astrology:
      referenceAstrology,

    transitInfluence,

    sadeSati,

    dhaiya,

    location,
  };
}

/* =========================================================
   PERSONALIZED RASHIFAL
========================================================= */

export function getRashifalForDate(
  date: Date = new Date(),
  location: PanchangLocation =
    DEFAULT_LOCATION,
  period: RashifalPeriod = "daily",
): RashifalResult {
  assertValidPeriod(period);

  const targetDate =
    normalizeDate(date);

  const moon =
    getMoonSign(targetDate);

  const result =
    getRashifalForRashi(
      moon.sign,
      targetDate,
      period,
      location,
    );

  return {
    ...result,

    moonSign:
      moon.sign,

    moonSignEnglish:
      moon.signEnglish,

    nakshatra:
      moon.nakshatra,

    nakshatraPada:
      moon.pada,

    astrology:
      result.astrology
        ? {
            ...result.astrology,

            moonSign:
              moon.sign,

            moonSignEnglish:
              moon.signEnglish,

            nakshatra:
              moon.nakshatra,

            nakshatraPada:
              moon.pada,

            moonLongitude:
              moon.longitude,

            moonDegreeInSign:
              moon.degreeInSign,
          }
        : undefined,
  };
}

/* =========================================================
   DAILY
========================================================= */

export function getDailyRashifal(
  date: Date = new Date(),
  location: PanchangLocation =
    DEFAULT_LOCATION,
): RashifalResult {
  return getRashifalForDate(
    date,
    location,
    "daily",
  );
}

/* =========================================================
   WEEKLY
========================================================= */

export function getWeeklyRashifal(
  date: Date = new Date(),
  location: PanchangLocation =
    DEFAULT_LOCATION,
): RashifalResult {
  return getRashifalForDate(
    date,
    location,
    "weekly",
  );
}

/* =========================================================
   MONTHLY
========================================================= */

export function getMonthlyRashifal(
  date: Date = new Date(),
  location: PanchangLocation =
    DEFAULT_LOCATION,
): RashifalResult {
  return getRashifalForDate(
    date,
    location,
    "monthly",
  );
}

/* =========================================================
   ALL RASHIS
========================================================= */

export function getDailyRashifalBySign(
  date: Date = new Date(),
): RashifalResult[] {
  const targetDate =
    normalizeDate(date);

  return RASHIS.map(
    (rashi) =>
      getRashifalForRashi(
        rashi,
        targetDate,
        "daily",
      ),
  );
}

export function getWeeklyRashifalBySign(
  date: Date = new Date(),
): RashifalResult[] {
  const targetDate =
    normalizeDate(date);

  return RASHIS.map(
    (rashi) =>
      getRashifalForRashi(
        rashi,
        targetDate,
        "weekly",
      ),
  );
}

export function getMonthlyRashifalBySign(
  date: Date = new Date(),
): RashifalResult[] {
  const targetDate =
    normalizeDate(date);

  return RASHIS.map(
    (rashi) =>
      getRashifalForRashi(
        rashi,
        targetDate,
        "monthly",
      ),
  );
}

/* =========================================================
   DATE RANGE
========================================================= */

export function getRashifalRange(
  startDate: Date,
  days: number,
  rashi: ZodiacSign,
  period: RashifalPeriod = "daily",
): RashifalResult[] {
  assertValidRashi(rashi);
  assertValidPeriod(period);

  const start =
    normalizeDate(startDate);

  if (!Number.isFinite(days)) {
    throw new RangeError(
      "days must be a finite number.",
    );
  }

  const count =
    Math.floor(days);

  if (count <= 0) {
    return [];
  }

  return Array.from(
    { length: count },
    (_, index) =>
      getRashifalForRashi(
        rashi,
        addDays(
          start,
          index,
        ),
        period,
      ),
  );
}

/* =========================================================
   CALENDAR
========================================================= */

export function getRashifalCalendar(
  startDate: Date,
  days: number,
  rashi: ZodiacSign,
): RashifalCalendarItem[] {
  return getRashifalRange(
    startDate,
    days,
    rashi,
    "daily",
  ).map(
    (item) => ({
      dateISO:
        item.dateISO,

      rashi:
        item.rashi,

      signHindi:
        item.rashiHindi,

      signEnglish:
        item.rashiEnglish,

      rating:
        item.overallRating,

      label:
        item.overallLabel,
    }),
  );
}

/* =========================================================
   RASHI LOOKUPS
========================================================= */

export function getRashiProfile(
  rashi: ZodiacSign,
): RashiProfile {
  assertValidRashi(rashi);

  return RASHI_PROFILE[rashi];
}

export function getRashiByEnglishName(
  englishName: string,
): ZodiacSign | undefined {
  const normalized =
    String(englishName ?? "")
      .trim()
      .toLowerCase();

  if (!normalized) {
    return undefined;
  }

  return RASHIS.find(
    (rashi) =>
      RASHI_PROFILE[rashi]
        .signEnglish
        .toLowerCase() ===
      normalized,
  );
}

export function getRashiByHindiName(
  hindiName: string,
): ZodiacSign | undefined {
  const normalized =
    String(hindiName ?? "")
      .trim();

  if (!normalized) {
    return undefined;
  }

  return RASHIS.find(
    (rashi) =>
      RASHI_PROFILE[rashi]
        .signHindi ===
      normalized,
  );
}

export function findRashi(
  query: string,
): ZodiacSign | undefined {
  const normalized =
    String(query ?? "")
      .trim()
      .toLowerCase();

  if (!normalized) {
    return undefined;
  }

  const aliases: Record<
    string,
    ZodiacSign
  > = {
    aries: "Mesha",
    mesha: "Mesha",
    mesh: "Mesha",
    "मेष": "Mesha",

    taurus: "Vrishabha",
    vrishabha: "Vrishabha",
    vrishabh: "Vrishabha",
    "वृषभ": "Vrishabha",

    gemini: "Mithuna",
    mithuna: "Mithuna",
    mithun: "Mithuna",
    "मिथुन": "Mithuna",

    cancer: "Karka",
    karka: "Karka",
    kark: "Karka",
    "कर्क": "Karka",

    leo: "Simha",
    simha: "Simha",
    "सिंह": "Simha",

    virgo: "Kanya",
    kanya: "Kanya",
    "कन्या": "Kanya",

    libra: "Tula",
    tula: "Tula",
    "तुला": "Tula",

    scorpio: "Vrishchika",
    vrishchika: "Vrishchika",
    vrishchik: "Vrishchika",
    "वृश्चिक": "Vrishchika",

    sagittarius: "Dhanu",
    dhanu: "Dhanu",
    "धनु": "Dhanu",

    capricorn: "Makara",
    makara: "Makara",
    makar: "Makara",
    "मकर": "Makara",

    aquarius: "Kumbha",
    kumbha: "Kumbha",
    kumbh: "Kumbha",
    "कुंभ": "Kumbha",

    pisces: "Meena",
    meena: "Meena",
    meen: "Meena",
    "मीन": "Meena",
  };

  return aliases[normalized];
}

/* =========================================================
   RASHI INDEX
========================================================= */

export function getRashiIndex(
  rashi: ZodiacSign,
): number {
  assertValidRashi(rashi);

  return RASHIS.indexOf(rashi);
}

/* =========================================================
   NEXT / PREVIOUS RASHI
========================================================= */

export function getNextRashi(
  rashi: ZodiacSign,
): ZodiacSign {
  const index =
    getRashiIndex(rashi);

  return RASHIS[
    (index + 1) %
      RASHIS.length
  ];
}

export function getPreviousRashi(
  rashi: ZodiacSign,
): ZodiacSign {
  const index =
    getRashiIndex(rashi);

  return RASHIS[
    (index - 1 +
      RASHIS.length) %
      RASHIS.length
  ];
}

/* =========================================================
   LUCKY DETAILS
========================================================= */

export interface LuckyDetails {
  number: number;
  color: string;
  day: string;
}

export function getLuckyDetails(
  rashi: ZodiacSign,
  date: Date = new Date(),
): LuckyDetails {
  assertValidRashi(rashi);

  const targetDate =
    normalizeDate(date);

  const dateISO =
    toISODate(targetDate);

  const profile =
    getRashiProfile(rashi);

  return {
    number:
      pick(
        profile.luckyNumbers,
        `${dateISO}-${rashi}-lucky-number`,
      ),

    color:
      pick(
        profile.luckyColors,
        `${dateISO}-${rashi}-lucky-color`,
      ),

    day:
      pick(
        profile.luckyDays,
        `${dateISO}-${rashi}-lucky-day`,
      ),
  };
}

/* =========================================================
   CATEGORY HELPERS
========================================================= */

export function getRashifalCategory(
  rashi: ZodiacSign,
  category: RashifalCategory,
  date: Date = new Date(),
): string {
  assertValidRashi(rashi);

  const result =
    getRashifalForRashi(
      rashi,
      date,
      "daily",
    );

  switch (category) {
    case "career":
      return result.career;

    case "finance":
      return result.finance;

    case "love":
      return result.love;

    case "health":
      return result.health;

    case "family":
      return result.family;

    case "education":
      return result.education;

    case "travel":
      return result.travel;

    case "spiritual":
      return result.spiritual;

    case "general":
    default:
      return result.general;
  }
}

/* =========================================================
   RASHIFAL SCORE
========================================================= */

export function getRashifalScore(
  rashi: ZodiacSign,
  date: Date = new Date(),
  period: RashifalPeriod = "daily",
): number {
  return getRashifalForRashi(
    rashi,
    date,
    period,
  ).overallRating;
}

export function getRashifalLabel(
  rating: number,
): string {
  return ratingLabel(rating);
}

/* =========================================================
   SORTING / RANKING
========================================================= */

export function rankRashisByToday(
  date: Date = new Date(),
): RashifalResult[] {
  return getDailyRashifalBySign(
    date,
  ).sort(
    (a, b) =>
      b.overallRating -
      a.overallRating,
  );
}

export function getTopRashisToday(
  date: Date = new Date(),
  limit = 3,
): RashifalResult[] {
  if (!Number.isFinite(limit)) {
    return [];
  }

  return rankRashisByToday(
    date,
  ).slice(
    0,
    Math.max(
      0,
      Math.floor(limit),
    ),
  );
}

/* =========================================================
   SUMMARY
========================================================= */

export function getRashifalSummary(
  rashi: ZodiacSign,
  date: Date = new Date(),
  period: RashifalPeriod = "daily",
): string {
  const result =
    getRashifalForRashi(
      rashi,
      date,
      period,
    );

  let summary =
    `${getPeriodLabel(
      period,
    )} — ${result.rashiHindi} (${result.rashiEnglish}): ${result.general}`;

  if (
    result.sadeSati?.active
  ) {
    summary +=
      ` ${result.sadeSati.summary}`;
  }

  if (
    result.dhaiya?.active
  ) {
    summary +=
      ` ${result.dhaiya.summary}`;
  }

  return summary;
}

/* =========================================================
   SEARCH
========================================================= */

function normalizeSearchText(
  value: string,
): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFC");
}

export function searchRashis(
  query: string,
): RashiProfile[] {
  const normalized =
    normalizeSearchText(query);

  if (!normalized) {
    return RASHIS.map(
      (rashi) =>
        RASHI_PROFILE[rashi],
    );
  }

  return RASHIS
    .map(
      (rashi) =>
        RASHI_PROFILE[rashi],
    )
    .filter(
      (profile) => {
        const sign =
          normalizeSearchText(
            profile.sign,
          );

        const english =
          normalizeSearchText(
            profile.signEnglish,
          );

        const hindi =
          normalizeSearchText(
            profile.signHindi,
          );

        return (
          sign.includes(
            normalized,
          ) ||
          english.includes(
            normalized,
          ) ||
          hindi.includes(
            normalized,
          )
        );
      },
    );
}

/* =========================================================
   RASHIFAL METADATA
========================================================= */

export function getRashiMetadata(
  rashi: ZodiacSign,
) {
  const profile =
    getRashiProfile(rashi);

  return {
    sign:
      profile.sign,

    signEnglish:
      profile.signEnglish,

    signHindi:
      profile.signHindi,

    lord:
      profile.lord,

    element:
      profile.element,

    quality:
      profile.quality,

    strengths: [
      ...profile.strengths,
    ],

    challenges: [
      ...profile.challenges,
    ],

    luckyNumbers: [
      ...profile.luckyNumbers,
    ],

    luckyColors: [
      ...profile.luckyColors,
    ],

    luckyDays: [
      ...profile.luckyDays,
    ],
  };
}

/* =========================================================
   RASHI DISPLAY HELPERS
========================================================= */

export function getRashiName(
  rashi: ZodiacSign,
): {
  english: ZodiacEnglishSign;
  hindi: string;
} {
  assertValidRashi(rashi);

  return {
    english:
      getRashiNameEnglish(rashi),

    hindi:
      getRashiNameHindi(rashi),
  };
}

export function getRashiLordName(
  rashi: ZodiacSign,
): PlanetName {
  assertValidRashi(rashi);

  return getRashiLord(rashi);
}

/* =========================================================
   PLANETARY TRANSIT HELPERS
========================================================= */

export interface RashifalTransitSummary {
  saturn: ZodiacSign;
  jupiter: ZodiacSign;
  mars: ZodiacSign;
  rahu: ZodiacSign;
  ketu: ZodiacSign;

  saturnFromMoon: number;
  jupiterFromMoon: number;
  marsFromMoon: number;
  rahuFromMoon: number;
  ketuFromMoon: number;
}

export function getRashifalTransitSummary(
  date: Date = new Date(),
  rashi?: ZodiacSign,
): RashifalTransitSummary {
  const targetDate =
    normalizeDate(date);

  const moon =
    rashi ??
    getMoonSign(
      targetDate,
    ).sign;

  const saturn =
    getPlanetPosition(
      "Saturn",
      targetDate,
    );

  const jupiter =
    getPlanetPosition(
      "Jupiter",
      targetDate,
    );

  const mars =
    getPlanetPosition(
      "Mars",
      targetDate,
    );

  const rahu =
    getPlanetPosition(
      "Rahu",
      targetDate,
    );

  const ketu =
    getPlanetPosition(
      "Ketu",
      targetDate,
    );

  return {
    saturn:
      saturn.sign,

    jupiter:
      jupiter.sign,

    mars:
      mars.sign,

    rahu:
      rahu.sign,

    ketu:
      ketu.sign,

    saturnFromMoon:
      distanceFromMoon(
        moon,
        saturn.sign,
      ),

    jupiterFromMoon:
      distanceFromMoon(
        moon,
        jupiter.sign,
      ),

    marsFromMoon:
      distanceFromMoon(
        moon,
        mars.sign,
      ),

    rahuFromMoon:
      distanceFromMoon(
        moon,
        rahu.sign,
      ),

    ketuFromMoon:
      distanceFromMoon(
        moon,
        ketu.sign,
      ),
  };
}

/* =========================================================
   SADE SATI HELPERS
========================================================= */

export function isSadeSatiActive(
  rashi: ZodiacSign,
  date: Date = new Date(),
): boolean {
  return calculateSadeSatiSafe(
    date,
    rashi,
  ).active;
}

export function getSadeSatiStatus(
  rashi: ZodiacSign,
  date: Date = new Date(),
): RashifalSadeSati {
  return calculateSadeSatiSafe(
    date,
    rashi,
  );
}

export function isDhaiyaActive(
  rashi: ZodiacSign,
  date: Date = new Date(),
): boolean {
  return calculateDhaiyaSafe(
    date,
    rashi,
  ).active;
}

export function getDhaiyaStatus(
  rashi: ZodiacSign,
  date: Date = new Date(),
): RashifalDhaiya {
  return calculateDhaiyaSafe(
    date,
    rashi,
  );
}

/* =========================================================
   PERIOD HELPERS
========================================================= */

export function getRashifalPeriodLabel(
  period: RashifalPeriod,
): string {
  assertValidPeriod(period);

  return getPeriodLabel(period);
}

export function isValidRashifalPeriod(
  period: string,
): period is RashifalPeriod {
  return (
    period === "daily" ||
    period === "weekly" ||
    period === "monthly"
  );
}

export function isValidRashi(
  rashi: string,
): rashi is ZodiacSign {
  return (
    RASHIS as readonly string[]
  ).includes(rashi);
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const rashifal = {
  RASHIS,

  RASHIS_ENGLISH,

  RASHI_NAMES_HINDI,

  RASHI_PROFILE,

  getRashifalForRashi,
  getRashifalForDate,

  getDailyRashifal,
  getWeeklyRashifal,
  getMonthlyRashifal,

  getDailyRashifalBySign,
  getWeeklyRashifalBySign,
  getMonthlyRashifalBySign,

  getRashifalRange,
  getRashifalCalendar,

  getRashiProfile,
  getRashiByEnglishName,
  getRashiByHindiName,
  findRashi,

  getRashiIndex,

  getNextRashi,
  getPreviousRashi,

  getLuckyDetails,

  getRashifalCategory,

  getRashifalScore,
  getRashifalLabel,

  rankRashisByToday,
  getTopRashisToday,

  getRashifalSummary,

  searchRashis,

  getRashiMetadata,

  getRashiName,
  getRashiLordName,

  getRashifalTransitSummary,

  isSadeSatiActive,
  getSadeSatiStatus,

  isDhaiyaActive,
  getDhaiyaStatus,

  getRashifalPeriodLabel,
  isValidRashifalPeriod,
  isValidRashi,

  RASHIFAL_TRUST_NOTE,
  RASHIFAL_INTERPRETATION_NOTE,
  getRashifalTrustMetadata,
  getRashifalPersonalization,
  getPersonalizedRashifal,
  getPanIndiaRashifalLocations,
  findRashifalLocation,
  getRashifalConfidenceLabel,
  getRashifalRelevanceLabel,
  getRashifalTrustSummary,
};

export default rashifal;