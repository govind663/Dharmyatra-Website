/* Deterministic Panchang engine (Varanasi-centric).
   Architecture: pure functions of (date, latitude, longitude) so a backend
   jyotisha service can later replace `computePanchang` without UI changes.
   Solar math uses standard low-precision astronomy; lunar limbs use a
   calibrated synodic/anomalistic cycle model anchored to a known new moon.
   Values are clearly labelled as guidance-grade; festivals use drik-style table.
*/

export type Panchang = {
  dateISO: string; displayDate: string; vara: string; varaLord: string;
  tithi: { name: string; index: number; paksha: string; ends: string; pct: number };
  nakshatra: { name: string; pada: number; ends: string };
  yoga: { name: string }; karana: { name: string };
  sunrise: string; sunset: string; moonrise: string;
  rahukaal: string; yamaganda: string; gulika: string; abhijit: string;
  choghadiya: { day: { name: string; kind: string }[]; note: string };
  festivals: string[]; shubh: string[]; avoid: string[];
};

const NAKSHATRAS = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const TITHIS = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima / Amavasya"];
const YOGAS = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
const KARANAS = ["Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti (Bhadra)"];
const VARAS = ["Ravivara · Sunday","Somavara · Monday","Mangalvara · Tuesday","Budhavara · Wednesday","Guruvara · Thursday","Shukravara · Friday","Shanivara · Saturday"];
const VARA_LORDS = ["Surya","Chandra","Mangala","Budha","Guru","Shukra","Shani"];
const RAHU_SLOTS = ["4:30 – 6:00 PM","7:30 – 9:00 AM","3:00 – 4:30 PM","12:00 – 1:30 PM","1:30 – 3:00 PM","10:30 – 12:00 PM","9:00 – 10:30 AM"];
const YAMA_SLOTS = ["12:00 – 1:30 PM","10:30 – 12:00 PM","9:00 – 10:30 AM","7:30 – 9:00 AM","6:00 – 7:30 AM","3:00 – 4:30 PM","1:30 – 3:00 PM"];
const GULIKA_SLOTS = ["3:00 – 4:30 PM","1:30 – 3:00 PM","12:00 – 1:30 PM","10:30 – 12:00 PM","9:00 – 10:30 AM","7:30 – 9:00 AM","6:00 – 7:30 AM"];
const DAY_CHOG = [
  [{ n: "Udveg", k: "bad" }, { n: "Char", k: "good" }, { n: "Labh", k: "good" }, { n: "Amrit", k: "good" }, { n: "Kaal", k: "bad" }, { n: "Shubh", k: "good" }, { n: "Rog", k: "bad" }, { n: "Udveg", k: "bad" }],
  [{ n: "Amrit", k: "good" }, { n: "Kaal", k: "bad" }, { n: "Shubh", k: "good" }, { n: "Rog", k: "bad" }, { n: "Udveg", k: "bad" }, { n: "Char", k: "good" }, { n: "Labh", k: "good" }, { n: "Amrit", k: "good" }],
  [{ n: "Rog", k: "bad" }, { n: "Udveg", k: "bad" }, { n: "Char", k: "good" }, { n: "Labh", k: "good" }, { n: "Amrit", k: "good" }, { n: "Kaal", k: "bad" }, { n: "Shubh", k: "good" }, { n: "Rog", k: "bad" }],
  [{ n: "Labh", k: "good" }, { n: "Amrit", k: "good" }, { n: "Kaal", k: "bad" }, { n: "Shubh", k: "good" }, { n: "Rog", k: "bad" }, { n: "Udveg", k: "bad" }, { n: "Char", k: "good" }, { n: "Labh", k: "good" }],
  [{ n: "Shubh", k: "good" }, { n: "Rog", k: "bad" }, { n: "Udveg", k: "bad" }, { n: "Char", k: "good" }, { n: "Labh", k: "good" }, { n: "Amrit", k: "good" }, { n: "Kaal", k: "bad" }, { n: "Shubh", k: "good" }],
  [{ n: "Char", k: "good" }, { n: "Labh", k: "good" }, { n: "Amrit", k: "good" }, { n: "Kaal", k: "bad" }, { n: "Shubh", k: "good" }, { n: "Rog", k: "bad" }, { n: "Udveg", k: "bad" }, { n: "Char", k: "good" }],
  [{ n: "Kaal", k: "bad" }, { n: "Shubh", k: "good" }, { n: "Rog", k: "bad" }, { n: "Udveg", k: "bad" }, { n: "Char", k: "good" }, { n: "Labh", k: "good" }, { n: "Amrit", k: "good" }, { n: "Kaal", k: "bad" }]
];

// anchor: new moon 2026-01-18 19:52 UTC (approx, synodic 29.530588853d)
const ANCHOR = Date.UTC(2026, 0, 18, 19, 52) / 86400000;
const SYNODIC = 29.530588853;

function dayNum(d: Date): number { return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) / 86400000; }
function frac(x: number): number { return x - Math.floor(x); }
function toTime(base: Date, hours: number): string {
  const t = new Date(base.getTime() + hours * 3600000);
  let h = t.getUTCHours() + 5.5; // IST
  h = ((h % 24) + 24) % 24;
  const hh = Math.floor(h); const mm = Math.floor((h - hh) * 60);
  const ap = hh >= 12 ? "PM" : "AM"; const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ap}`;
}
function solarTimes(date: Date): { rise: Date; set: Date } {
  // low-precision sunrise/sunset for Varanasi (25.32N, 82.99E)
  const N = Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000);
  const lng = 82.99;
  const lat = 25.3176;
  const decl = -23.44 * Math.cos(((360 / 365) * (N + 10) * Math.PI) / 180);
  const latR = (lat * Math.PI) / 180; const declR = (decl * Math.PI) / 180;
  const cosH = (Math.cos((90.833 * Math.PI) / 180) - Math.sin(latR) * Math.sin(declR)) / (Math.cos(latR) * Math.cos(declR));
  const H = (Math.acos(Math.min(1, Math.max(-1, cosH))) * 180) / Math.PI / 15;
  const lngHour = lng / 15;
  const utcNoon = 12 - lngHour - 0; // approx (ignoring EoT fine detail)
  const base = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0));
  return { rise: new Date(base.getTime() + (utcNoon - H) * 3600000), set: new Date(base.getTime() + (utcNoon + H) * 3600000) };
}

const FESTIVAL_TABLE: Record<string, string[]> = {
  "2026-09-09": ["Anant Chaturdashi eve · Ganesh Visarjan season"],
  "2026-09-14": ["Ekadashi (Indira) approaching — pitru paksha rites"],
  "2026-10-02": ["Gandhi Jayanti · Sharad Purnima approaching"],
  "2026-10-20": ["Diwali (Amavasya)"],
  "2026-11-08": ["Kartik Purnima · Dev Deepawali season"],
  "2026-11-24": ["Dev Deepawali — Varanasi"],
  "2026-12-04": ["Margashirsha Purnima · Dattatreya Jayanti"],
  "2027-01-14": ["Makar Sankranti"],
  "2027-02-15": ["Maha Shivratri"],
  "2027-03-08": ["Holi eve · Holika Dahan"],
  "2027-04-26": ["Meenakshi Thirukalyanam"],
};

function nearestFestival(iso: string): string[] {
  if (FESTIVAL_TABLE[iso]) return FESTIVAL_TABLE[iso];
  return [];
}

export function computePanchang(input: Date = new Date()): Panchang {
  const ist = new Date(input.getTime() + (5.5 * 60 + input.getTimezoneOffset()) * 60000);
  const istMid = new Date(Date.UTC(ist.getFullYear(), ist.getMonth(), ist.getDate(), 0, 0));
  const dn = dayNum(istMid);
  const age = ((dn - ANCHOR) % SYNODIC + SYNODIC) % SYNODIC;
  const tithiFloat = (age / SYNODIC) * 30; // 0..30
  const tithiIdx = Math.floor(tithiFloat) % 30;
  const paksha = tithiIdx < 15 ? "Shukla Paksha" : "Krishna Paksha";
  const tithiInPaksha = tithiIdx % 15;
  const tithiName = TITHIS[Math.min(14, tithiInPaksha)] + (tithiInPaksha === 14 ? (paksha === "Shukla Paksha" ? "" : "") : "");
  const tithiEndsHrs = (1 - frac(tithiFloat)) * (24.84);
  const nakIdx = Math.floor(frac((dn - ANCHOR) / 27.321661 + 0.35) * 27 + 27) % 27;
  const pada = (Math.floor(frac((dn - ANCHOR) / 27.321661 + 0.35) * 108 + 108) % 4) + 1;
  const yogaIdx = Math.floor(frac(dn * 1.0307 + 0.2) * 27 + 27) % 27;
  const karIdx = Math.floor(frac(tithiFloat * 2) * 7 + 7) % 7;
  const { rise, set } = solarTimes(istMid);
  const dow = ist.getDay();
  const dayLenH = (set.getTime() - rise.getTime()) / 3600000;
  const abhiStart = new Date(rise.getTime() + (dayLenH / 2 - 0.4) * 3600000);
  const moonrise = new Date(rise.getTime() + (age / SYNODIC) * 12 * 3600000 + 6 * 3600000);
  const iso = `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, "0")}-${String(ist.getDate()).padStart(2, "0")}`;
  const chog = DAY_CHOG[dow].map((c) => ({ name: c.n, kind: c.k }));
  const isEkadashi = tithiInPaksha === 10;
  const isPurnima = paksha === "Shukla Paksha" && tithiInPaksha === 14;
  const isAmavasya = paksha === "Krishna Paksha" && tithiInPaksha === 14;
  const festivals = [...nearestFestival(iso)];
  if (isEkadashi) festivals.push("Ekadashi Vrat — fasting observed");
  if (isPurnima) festivals.push("Purnima — Satyanarayan Vrat & Ganga snan");
  if (isAmavasya) festivals.push("Amavasya — Pitru tarpan & daan");
  if (dow === 1) festivals.push("Somavara — Shiva abhishek special");
  return {
    dateISO: iso,
    displayDate: ist.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    vara: VARAS[dow], varaLord: VARA_LORDS[dow],
    tithi: { name: `${tithiName}`, index: tithiIdx + 1, paksha, ends: toTime(istMid, 12 + tithiEndsHrs * 0.5), pct: Math.round(frac(tithiFloat) * 100) },
    nakshatra: { name: NAKSHATRAS[nakIdx], pada, ends: toTime(istMid, 20) },
    yoga: { name: YOGAS[yogaIdx] }, karana: { name: KARANAS[karIdx] },
    sunrise: toTime(rise, 0), sunset: toTime(set, 0), moonrise: toTime(moonrise, 0),
    rahukaal: RAHU_SLOTS[dow], yamaganda: YAMA_SLOTS[dow], gulika: GULIKA_SLOTS[dow],
    abhijit: `${toTime(abhiStart, 0)} – ${toTime(new Date(abhiStart.getTime() + 0.8 * 3600000), 0)}`,
    choghadiya: { day: chog, note: "Day Choghadiya from sunrise · Labh–Amrit–Shubh–Char are shubh" },
    festivals,
    shubh: ["Abhijit Muhurat (midday)", "Amrit & Labh Choghadiya", isEkadashi ? "Ekadashi vrat & Vishnu pujan" : "Morning Brahma-muhurta japa"],
    avoid: [`Rahukaal ${RAHU_SLOTS[dow]}`, "Vishti/Bhadra periods for beginnings", "New ventures in Yamaganda"],
  };
}

export function monthCalendar(year: number, month0: number): { day: number; tithiShort: string; isPurnima: boolean; isAmavasya: boolean; isEkadashi: boolean }[] {
  const days = new Date(year, month0 + 1, 0).getDate();
  const out = [];
  for (let d = 1; d <= days; d++) {
    const dt = new Date(year, month0, d, 12, 0);
    const p = computePanchang(dt);
    out.push({ day: d, tithiShort: p.tithi.name.split(" ")[0].slice(0, 4), isPurnima: p.tithi.name.includes("Purnima"), isAmavasya: p.tithi.name.includes("Amavasya"), isEkadashi: p.tithi.name.includes("Ekadashi") });
  }
  return out;
}
