// src/components/kundli/KundliCharts.tsx

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Download,
  FileText,
  Gem,
  Grid3X3,
  Heart,
  Loader2,
  MapPin,
  Printer,
  Sparkles,
  Sun,
  WandSparkles,
} from "lucide-react";
import type { KundliChartData } from "../../lib/kundli";
import {
  buildKundliDivisionalCharts,
  type DivisionalChartData,
  type DivisionalPlanetPosition,
} from "../../lib/kundliCharts";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PLANET_ABBREVIATIONS: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
  Rahu: "Ra",
  Ketu: "Ke",
};

const HOUSE_LABELS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
];

const HOUSE_MEANINGS = [
  "Self & personality",
  "Wealth & family",
  "Courage & communication",
  "Home & mother",
  "Children & intelligence",
  "Health & service",
  "Marriage & partnership",
  "Transformation & longevity",
  "Dharma & fortune",
  "Career & status",
  "Gains & networks",
  "Expenses & spirituality",
];

function asFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDegree(value: number): string {
  const safe = Math.max(0, asFiniteNumber(value));
  const degrees = Math.floor(safe);
  const minutes = Math.floor((safe - degrees) * 60);
  return `${degrees}° ${String(minutes).padStart(2, "0")}′`;
}

function formatDate(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";

  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${normalized}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function safeGetTime(value: unknown): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : null;
  }

  return null;
}

function safeText(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function getChartTitle(chart: DivisionalChartData): string {
  return chart.id === "D9" ? "D9 · Navamsa Chart" : "D1 · Lagna / Rashi Chart";
}

function getPlanetLabel(planet: DivisionalPlanetPosition): string {
  return PLANET_ABBREVIATIONS[planet.planet] ?? planet.planet.slice(0, 2);
}

function getChartHousePlanetGroups(chart: DivisionalChartData) {
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    return chart.planets.filter((planet) => planet.house === house);
  });
}

/* =========================================================
   NORTH-INDIAN STYLE SVG CHART
========================================================= */

type Point = { x: number; y: number };

type ChartRegion = {
  house: number;
  polygon: Point[];
  label: Point;
  labelAnchor?: "middle" | "start" | "end";
};

function createTraditionalRegions(size = 520): ChartRegion[] {
  const s = size;
  const c = s / 2;
  const q = s * 0.25;
  const e = s * 0.75;

  /*
   * A clean North-Indian-inspired square/diamond layout.
   * The four middle points form the central diamond and
   * diagonals split the remaining perimeter into 12 readable
   * house regions. House numbering is clockwise from the top.
   */
  const regions: ChartRegion[] = [
    { house: 1, polygon: [{ x: c, y: 0 }, { x: s, y: c }, { x: c, y: c }], label: { x: c + 20, y: c * 0.35 } },
    { house: 2, polygon: [{ x: c, y: 0 }, { x: s, y: 0 }, { x: s, y: c }], label: { x: s * 0.78, y: s * 0.19 } },
    { house: 3, polygon: [{ x: s, y: c }, { x: s, y: s }, { x: c, y: c }], label: { x: s * 0.82, y: c + 26 } },
    { house: 4, polygon: [{ x: s, y: s }, { x: c, y: s }, { x: c, y: c }], label: { x: c + 26, y: s * 0.80 } },
    { house: 5, polygon: [{ x: c, y: s }, { x: 0, y: s }, { x: c, y: c }], label: { x: c - 26, y: s * 0.80 } },
    { house: 6, polygon: [{ x: 0, y: s }, { x: 0, y: c }, { x: c, y: c }], label: { x: s * 0.18, y: c + 26 } },
    { house: 7, polygon: [{ x: 0, y: c }, { x: c, y: 0 }, { x: c, y: c }], label: { x: c - 20, y: c * 0.35 } },
    { house: 8, polygon: [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: 0, y: c }], label: { x: s * 0.22, y: s * 0.19 } },
    { house: 9, polygon: [{ x: 0, y: c }, { x: 0, y: s }, { x: c, y: c }], label: { x: s * 0.18, y: c - 26 } },
    { house: 10, polygon: [{ x: 0, y: s }, { x: c, y: s }, { x: c, y: c }], label: { x: c - 26, y: s * 0.70 } },
    { house: 11, polygon: [{ x: c, y: s }, { x: s, y: s }, { x: c, y: c }], label: { x: c + 26, y: s * 0.70 } },
    { house: 12, polygon: [{ x: s, y: s }, { x: s, y: c }, { x: c, y: c }], label: { x: s * 0.82, y: c - 26 } },
  ];

  return regions.map((region) => ({
    ...region,
    polygon: region.polygon.map((point) => ({ x: point.x / s * size, y: point.y / s * size })),
    label: { x: region.label.x / s * size, y: region.label.y / s * size },
  }));
}

function PremiumChartSvg({ chart }: { chart: DivisionalChartData }) {
  const size = 520;
  const center = size / 2;
  const regions = createTraditionalRegions(size);
  const houseGroups = getChartHousePlanetGroups(chart);

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#b86d22]/30 bg-[radial-gradient(circle_at_50%_38%,rgba(255,251,238,.98),rgba(249,235,207,.96)_58%,rgba(238,211,171,.96))] p-2 shadow-[0_24px_80px_rgba(87,47,12,.15)] sm:p-3">
        <div className="absolute inset-0 pointer-events-none opacity-40 [background-image:radial-gradient(circle_at_15%_15%,rgba(192,127,49,.25)_0,transparent_1px),radial-gradient(circle_at_75%_80%,rgba(192,127,49,.16)_0,transparent_1px)] [background-size:38px_38px,52px_52px]" />
        <div className="relative rounded-[1.6rem] border border-[#b87322]/25 bg-[#fffdf8] p-2 sm:p-3">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="block h-auto w-full"
            role="img"
            aria-label={`${getChartTitle(chart)} Vedic Kundli chart`}
          >
            <defs>
              <filter id={`chartShadow-${chart.id}`} x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7b4017" floodOpacity="0.08" />
              </filter>
              <radialGradient id={`centerGlow-${chart.id}`} cx="50%" cy="45%" r="70%">
                <stop offset="0%" stopColor="#fff5dc" />
                <stop offset="100%" stopColor="#f7ead4" />
              </radialGradient>
            </defs>

            <rect x="10" y="10" width="500" height="500" rx="28" fill="#fffdf8" stroke="#9d5d24" strokeOpacity="0.55" strokeWidth="3" filter={`url(#chartShadow-${chart.id})`} />

            {regions.map((region) => {
              const points = region.polygon.map((point) => `${point.x},${point.y}`).join(" ");
              const active = region.house === 1;
              return (
                <polygon
                  key={region.house}
                  points={points}
                  fill={active ? "#fff3da" : region.house % 2 === 0 ? "#fffaf0" : "#fffdf8"}
                  stroke="#a56527"
                  strokeOpacity="0.60"
                  strokeWidth="2.2"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            <polygon
              points={`${center},${center - 96} ${center + 96},${center} ${center},${center + 96} ${center - 96},${center}`}
              fill={`url(#centerGlow-${chart.id})`}
              stroke="#a56527"
              strokeWidth="2.5"
              strokeOpacity="0.58"
            />

            <circle cx={center} cy={center} r="42" fill="#2a1a10" opacity="0.96" />
            <text x={center} y={center - 6} textAnchor="middle" fill="#ffd166" fontSize="20" fontWeight="900">ॐ</text>
            <text x={center} y={center + 20} textAnchor="middle" fill="#fff7e8" fontSize="10" fontWeight="800" letterSpacing="1.4">
              {chart.id === "D9" ? "NAVAMSA" : "LAGNA"}
            </text>

            {regions.map((region) => {
              const data = chart.houses[region.house - 1];
              const planets = houseGroups[region.house - 1];
              const anchor = region.labelAnchor ?? "middle";
              return (
                <g key={`content-${region.house}`}>
                  <text
                    x={region.label.x}
                    y={region.label.y - 12}
                    textAnchor={anchor}
                    fill="#7b4017"
                    fontSize="11"
                    fontWeight="900"
                  >
                    {region.house}
                  </text>

                  <text
                    x={region.label.x}
                    y={region.label.y + 3}
                    textAnchor={anchor}
                    fill="#3b2112"
                    fontSize="13"
                    fontWeight="800"
                  >
                    {data?.signHindi ?? "—"}
                  </text>

                  <text
                    x={region.label.x}
                    y={region.label.y + 19}
                    textAnchor={anchor}
                    fill="#8b6b51"
                    fontSize="8"
                    fontWeight="700"
                  >
                    {data?.sign ?? "—"}
                  </text>

                  <foreignObject
                    x={region.label.x - 54}
                    y={region.label.y + 27}
                    width="108"
                    height="58"
                  >
                    <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-wrap items-center justify-center gap-1">
                      {region.house === 1 && (
                        <span className="rounded-md bg-orange-600 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">Lagna</span>
                      )}
                      {planets.map((planet) => (
                        <span
                          key={`${region.house}-${planet.planet}`}
                          title={`${planet.planet} · ${planet.sign} · ${formatDegree(planet.degreeInSign)}`}
                          className={`rounded-md px-1.5 py-0.5 text-[8px] font-black shadow-sm ${
                            planet.retrograde
                              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                              : "bg-[#2a1a10] text-amber-100"
                          }`}
                        >
                          {PLANET_SYMBOLS[planet.planet] ?? getPlanetLabel(planet)} {getPlanetLabel(planet)}{planet.retrograde ? "℞" : ""}
                        </span>
                      ))}
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            <text x="28" y="43" fill="#b87322" fontSize="10" fontWeight="900" letterSpacing="1.5">DHARMYATRA</text>
            <text x="492" y="493" textAnchor="end" fill="#8b6b51" fontSize="8" fontWeight="700">{chart.id} · VEDIC</text>
          </svg>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-orange-50 px-3 py-2 text-center ring-1 ring-orange-900/5">
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-orange-700">Lagna</p>
          <p className="mt-0.5 text-[11px] font-black text-[#3b2112]">{chart.ascendant.signHindi}</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-center ring-1 ring-amber-900/5">
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-amber-700">Degree</p>
          <p className="mt-0.5 text-[11px] font-black text-[#3b2112]">{formatDegree(chart.ascendant.degreeInNavamsa)}</p>
        </div>
        <div className="rounded-xl bg-stone-100 px-3 py-2 text-center ring-1 ring-stone-900/5">
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-stone-600">Chart</p>
          <p className="mt-0.5 text-[11px] font-black text-[#3b2112]">{chart.id}</p>
        </div>
        <div className="rounded-xl bg-[#2a1a10] px-3 py-2 text-center text-white">
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-amber-300">Houses</p>
          <p className="mt-0.5 text-[11px] font-black">12 Bhava</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[9px] font-bold text-stone-500">
        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-orange-900/10">Su = Sun</span>
        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-orange-900/10">Mo = Moon</span>
        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-orange-900/10">Ma = Mars</span>
        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-orange-900/10">Me = Mercury</span>
        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-orange-900/10">Ju = Jupiter</span>
        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-orange-900/10">Ve = Venus</span>
        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-orange-900/10">Sa = Saturn</span>
        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-orange-900/10">℞ = Retrograde</span>
      </div>
    </div>
  );
}

/* =========================================================
   HOUSE TABLE
========================================================= */

function HouseQuickTable({ chart }: { chart: DivisionalChartData }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {chart.houses.map((house) => (
        <div
          key={house.house}
          className="group rounded-2xl border border-orange-900/10 bg-white p-3.5 shadow-[0_8px_30px_rgba(74,40,12,.05)] transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_14px_35px_rgba(74,40,12,.08)]"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-700">House {house.house}</p>
              <p className="mt-0.5 font-semibold text-[#2a1a10]">{HOUSE_LABELS[house.house - 1]} · {house.signHindi}</p>
            </div>
            <span className="rounded-full bg-orange-50 px-2 py-1 text-[8px] font-black text-orange-700 ring-1 ring-orange-900/5">
              {house.sign}
            </span>
          </div>
          <p className="mt-2 text-[10px] font-semibold text-stone-500">{HOUSE_MEANINGS[house.house - 1]}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-stone-100 px-2 py-1 text-[9px] font-bold text-stone-600">Lord: {house.lord}</span>
            <span className="rounded-md bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-700">
              {house.occupants.length ? `${house.occupants.length} Planet${house.occupants.length > 1 ? "s" : ""}` : "Empty"}
            </span>
          </div>
          {house.occupants.length > 0 && (
            <p className="mt-2 text-[10px] leading-5 text-stone-500">{house.occupants.join(", ")}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   PLANET TABLE
========================================================= */

function ChartTable({ chart }: { chart: DivisionalChartData }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-orange-900/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-xs">
          <thead className="bg-[#2a1a10] text-amber-100">
            <tr>
              <th className="px-3 py-3 sm:px-4">Planet</th>
              <th className="px-3 py-3 sm:px-4">Sign</th>
              <th className="px-3 py-3 sm:px-4">House</th>
              <th className="px-3 py-3 sm:px-4">Degree</th>
              <th className="px-3 py-3 sm:px-4">Nakshatra</th>
              <th className="px-3 py-3 sm:px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {chart.planets.map((planet) => (
              <tr key={planet.planet} className="border-t border-orange-900/10 transition hover:bg-orange-50/40">
                <td className="px-3 py-3 font-bold text-stone-800 sm:px-4">
                  <span className="mr-1.5 text-orange-700">{PLANET_SYMBOLS[planet.planet] ?? "•"}</span>
                  {planet.planet}
                </td>
                <td className="px-3 py-3 text-stone-600 sm:px-4">
                  {planet.signHindi} · {planet.sign}
                </td>
                <td className="px-3 py-3 font-semibold text-orange-700 sm:px-4">
                  H{planet.house}
                </td>
                <td className="px-3 py-3 text-stone-600 sm:px-4">
                  {formatDegree(planet.degreeInSign)}
                </td>
                <td className="px-3 py-3 text-stone-600 sm:px-4">
                  {safeText(planet.nakshatra)} · P{safeText(planet.pada)}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${planet.retrograde ? "bg-red-50 text-red-700 ring-1 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
                    {planet.retrograde ? "Retrograde" : "Direct"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE CARDS
========================================================= */

function SummaryCard({
  title,
  value,
  sub,
  icon,
  tone = "orange",
}: {
  title: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  tone?: "orange" | "amber" | "emerald" | "dark";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700"
        : tone === "dark"
          ? "bg-[#2a1a10] text-amber-300"
          : "bg-orange-50 text-orange-700";

  return (
    <div className="group rounded-2xl border border-orange-900/10 bg-white p-4 shadow-[0_10px_35px_rgba(68,35,10,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(68,35,10,.09)]">
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-xl ${toneClass}`}>
          {icon}
        </span>
        <span className="min-w-0 truncate text-[9px] font-black uppercase tracking-[0.18em] text-stone-500">{title}</span>
      </div>
      <p className="mt-3 break-words font-display text-xl font-semibold text-[#2a1a10]">{value}</p>
      {sub && <p className="mt-1 break-words text-[11px] leading-5 text-stone-500">{sub}</p>}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
  icon,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-orange-700">
          {icon}
          {eyebrow}
        </p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[#2a1a10] sm:text-3xl">{title}</h3>
        {sub && <p className="mt-1 max-w-3xl text-xs leading-5 text-stone-500 sm:text-sm">{sub}</p>}
      </div>
    </div>
  );
}

function ReportStatStrip({ chartData }: { chartData: KundliChartData }) {
  const moon = chartData.chart.planets.Moon;
  const sun = chartData.chart.planets.Sun;
  const current = chartData.currentMahadasha?.mahadasha;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Lagna"
        value={`${safeText(chartData.chart.ascendant?.signHindi)} · ${safeText(chartData.chart.ascendant?.sign)}`}
        sub={`${safeText(chartData.chart.ascendant?.signEnglish)} · ${formatDegree(chartData.chart.ascendant?.degreeInSign)}`}
        icon={<Sun size={15} />}
      />
      <SummaryCard
        title="Moon Rashi"
        value={safeText(moon?.sign)}
        sub={`${safeText(moon?.signEnglish)} · ${safeText(moon?.nakshatra)} · P${safeText(moon?.pada)}`}
        icon={<Sparkles size={15} />}
        tone="amber"
      />
      <SummaryCard
        title="Sun Sign"
        value={safeText(sun?.sign)}
        sub={`${safeText(sun?.signEnglish)} · ${formatDegree(sun?.degreeInSign ?? 0)}`}
        icon={<Sun size={15} />}
        tone="emerald"
      />
      <SummaryCard
        title="Current Mahadasha"
        value={safeText(current?.lord)}
        sub={current ? `${formatDate(current.start)} → ${formatDate(current.end)}` : "Not available"}
        icon={<Gem size={15} />}
        tone="dark"
      />
    </div>
  );
}

/* =========================================================
   REPORT
========================================================= */

export function PremiumKundliReport({
  chartData,
}: {
  chartData: KundliChartData;
}) {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activeChart, setActiveChart] = useState<"D1" | "D9">("D1");
  const [showFullTables, setShowFullTables] = useState(true);

  const charts = useMemo(
    () => buildKundliDivisionalCharts(chartData),
    [chartData],
  );

  const moon = chartData.chart.planets.Moon;
  const currentMahadasha = chartData.currentMahadasha?.mahadasha;
  const displayedChart = activeChart === "D9" ? charts.d9 : charts.d1;

  const downloadPDF = async () => {
    if (!reportRef.current || exporting) return;

    setExporting(true);

    try {
      const node = reportRef.current;
      const canvas = await html2canvas(node, {
        scale: Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5)),
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#fffaf5",
        scrollY: -window.scrollY,
        windowWidth: Math.max(document.documentElement.scrollWidth, 1200),
        onclone: (clonedDocument) => {
          const cloned = clonedDocument.getElementById("dharmyatra-kundli-report");
          if (cloned instanceof HTMLElement) {
            cloned.style.width = "1120px";
            cloned.style.maxWidth = "1120px";
            cloned.style.margin = "0";
            cloned.style.background = "#fffaf5";
          }

          clonedDocument.querySelectorAll("[data-pdf-hide]").forEach((element) => {
            if (element instanceof HTMLElement) {
              element.style.display = "none";
            }
          });
        },
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const margin = 7;
      const pageWidth = 210;
      const pageHeight = 297;
      const printableWidth = pageWidth - margin * 2;
      const pageContentHeight = pageHeight - margin * 2;
      const imageHeight = (canvas.height * printableWidth) / canvas.width;

      let sourceY = 0;
      let page = 0;

      while (sourceY < imageHeight - 0.5) {
        if (page > 0) pdf.addPage();

        const sliceHeight = Math.min(pageContentHeight, imageHeight - sourceY);
        const sourceTop = Math.floor((sourceY / imageHeight) * canvas.height);
        const sourceSliceHeight = Math.max(
          1,
          Math.min(canvas.height - sourceTop, Math.floor((sliceHeight / imageHeight) * canvas.height)),
        );

        const crop = document.createElement("canvas");
        crop.width = canvas.width;
        crop.height = sourceSliceHeight;
        const context = crop.getContext("2d");

        if (!context) throw new Error("Unable to create PDF canvas.");

        context.fillStyle = "#fffaf5";
        context.fillRect(0, 0, crop.width, crop.height);
        context.drawImage(
          canvas,
          0,
          sourceTop,
          canvas.width,
          sourceSliceHeight,
          0,
          0,
          crop.width,
          crop.height,
        );

        const image = crop.toDataURL("image/jpeg", 0.94);
        pdf.addImage(image, "JPEG", margin, margin, printableWidth, sliceHeight, undefined, "FAST");

        sourceY += sliceHeight;
        page += 1;
      }

      const safeName = (chartData.birth.name || "DharmYatra")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      pdf.save(`${safeName || "dharmyatra"}-janma-kundli.pdf`);
    } catch (error) {
      console.error("Kundli PDF export failed:", error);
      window.print();
    } finally {
      setExporting(false);
    }
  };

  const printReport = () => window.print();

  return (
    <section
      ref={reportRef}
      id="dharmyatra-kundli-report"
      className="relative mx-auto mt-8 w-full max-w-[1120px] space-y-6 pb-10 print:mt-0 print:max-w-none print:space-y-4 print:pb-0"
    >
      {/* Premium cover/header */}
      <header className="relative overflow-hidden rounded-[2rem] bg-[#24170f] p-5 text-white shadow-[0_28px_80px_rgba(45,22,8,.20)] sm:p-7 print:rounded-none">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-amber-300/15" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border border-orange-300/10" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">
              <Gem size={13} /> DharmYatra · Vedic Astrology
            </div>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Complete Janma Kundli
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300 sm:text-base">
              A premium birth-chart preview with D1 Lagna, D9 Navamsa, planetary positions, 12 Bhava, Mahadasha and traditional consultation notes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden" data-pdf-hide>
            <button
              type="button"
              onClick={downloadPDF}
              disabled={exporting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-[#2a1a10] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {exporting ? "Creating PDF…" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={printReport}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/15"
            >
              <Printer size={15} /> Print
            </button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-2 border-t border-white/10 pt-4 text-[10px] font-bold text-stone-300 sm:grid-cols-3">
          <div className="flex items-center gap-2"><MapPin size={13} className="text-amber-300" /> {safeText(chartData.birth.location?.name)}</div>
          <div>{formatDate(chartData.birth.date)} · {formatTime(chartData.birth.time)}</div>
          <div className="sm:text-right">Lahiri Sidereal · D1 + D9</div>
        </div>
      </header>

      <ReportStatStrip chartData={chartData} />

      {/* Birth identity */}
      <section className="rounded-[2rem] border border-orange-900/10 bg-white p-5 shadow-[0_14px_50px_rgba(72,36,8,.06)] sm:p-7">
        <SectionHeader
          eyebrow="Birth Identity"
          title={safeText(chartData.birth.name, "Guest")}
          sub="The exact birth inputs used for this calculation are shown here for transparency before interpreting the chart."
          icon={<Sparkles size={12} />}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-orange-50/70 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-700">Date of Birth</p>
            <p className="mt-1 break-words font-bold text-[#2a1a10]">{formatDate(chartData.birth.date)}</p>
          </div>
          <div className="rounded-2xl bg-amber-50/70 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-700">Birth Time</p>
            <p className="mt-1 font-bold text-[#2a1a10]">{formatTime(chartData.birth.time)}</p>
          </div>
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">Birth Place</p>
            <p className="mt-1 break-words font-bold text-[#2a1a10]">{safeText(chartData.birth.location?.name)}</p>
          </div>
          <div className="rounded-2xl bg-[#2a1a10] p-4 text-white">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-300">Ayanamsha</p>
            <p className="mt-1 font-bold">{asFiniteNumber(chartData.chart.ayanamsha).toFixed(4)}° Lahiri</p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-orange-900/10 bg-[#fffaf5] p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400">Latitude</p>
              <p className="mt-1 text-xs font-bold text-stone-700">{asFiniteNumber(chartData.birth.location?.latitude).toFixed(4)}°N</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400">Longitude</p>
              <p className="mt-1 text-xs font-bold text-stone-700">{asFiniteNumber(chartData.birth.location?.longitude).toFixed(4)}°E</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400">Moon Nakshatra</p>
              <p className="mt-1 text-xs font-bold text-stone-700">{safeText(moon?.nakshatra)} · Pada {safeText(moon?.pada)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400">Moon Rashi</p>
              <p className="mt-1 text-xs font-bold text-stone-700">{safeText(moon?.signHindi)} · {safeText(moon?.sign)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chart switcher */}
      <section className="overflow-hidden rounded-[2rem] border border-orange-900/10 bg-white shadow-[0_14px_50px_rgba(72,36,8,.06)]">
        <div className="border-b border-orange-900/10 bg-[#fffaf5] p-5 sm:p-7">
          <SectionHeader
            eyebrow="Pandit-style Vedic Charts"
            title="Lagna & Navamsa"
            sub="Switch between the main D1 birth chart and the D9 Navamsa chart. Both are calculated from the same sidereal natal data."
            icon={<Grid3X3 size={12} />}
          />

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 ring-1 ring-orange-900/10 sm:max-w-md" data-pdf-hide>
            <button
              type="button"
              onClick={() => setActiveChart("D1")}
              className={`rounded-xl px-3 py-3 text-left transition ${activeChart === "D1" ? "bg-orange-600 text-white shadow" : "text-stone-600 hover:bg-orange-50"}`}
            >
              <span className="block text-[9px] font-black uppercase tracking-[0.16em]">D1 · Main Chart</span>
              <span className="mt-1 block text-xs font-bold">Lagna / Rashi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChart("D9")}
              className={`rounded-xl px-3 py-3 text-left transition ${activeChart === "D9" ? "bg-[#2a1a10] text-amber-200 shadow" : "text-stone-600 hover:bg-amber-50"}`}
            >
              <span className="block text-[9px] font-black uppercase tracking-[0.16em]">D9 · Divisional</span>
              <span className="mt-1 block text-xs font-bold">Navamsa</span>
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,.9fr)]">
          <div className="min-w-0 rounded-[1.7rem] border border-orange-900/10 bg-[#fffaf5] p-3 sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-700">{displayedChart.id === "D1" ? "D1 · Rashi" : "D9 · Navamsa"}</p>
                <h4 className="mt-1 font-display text-2xl font-semibold text-[#2a1a10]">{displayedChart.id === "D1" ? "Lagna Chart" : "Navamsa Chart"}</h4>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-stone-600 ring-1 ring-orange-900/10">12 Bhava · whole-sign</span>
            </div>
            <PremiumChartSvg chart={displayedChart} />
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.7rem] bg-[#2a1a10] p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 text-amber-300"><WandSparkles size={15} /><span className="text-[9px] font-black uppercase tracking-[0.18em]">Chart Identity</span></div>
              <p className="mt-2 font-display text-2xl font-semibold">{getChartTitle(displayedChart)}</p>
              <p className="mt-2 text-xs leading-6 text-stone-300">{displayedChart.subtitle}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/5 p-3"><p className="text-[9px] text-stone-400">Ascendant</p><p className="mt-1 text-sm font-bold text-amber-100">{safeText(displayedChart.ascendant.signHindi)}</p></div>
                <div className="rounded-xl bg-white/5 p-3"><p className="text-[9px] text-stone-400">Navamsa Part</p><p className="mt-1 text-sm font-bold text-amber-100">{displayedChart.ascendant.navamsaPart || "—"}</p></div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-orange-900/10 bg-white p-5 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-700">Reading Guide</p>
              <div className="mt-3 space-y-2 text-xs leading-5 text-stone-600">
                <p><strong className="text-stone-800">House:</strong> where the energy manifests.</p>
                <p><strong className="text-stone-800">Sign:</strong> the zodiac sign occupying the house.</p>
                <p><strong className="text-stone-800">Planet:</strong> the graha influencing that house.</p>
                <p><strong className="text-stone-800">℞:</strong> retrograde indicator from the calculation engine.</p>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-amber-300 bg-amber-50 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-800">Interpretation note</p>
              <p className="mt-2 text-xs leading-6 text-amber-950">D1 is the primary birth chart. D9 is the Navamsa divisional chart and is commonly considered for marriage, dharma and deeper planetary strength analysis.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-orange-900/10 bg-[#fffdf9] p-4 sm:p-7">
          <SectionHeader
            eyebrow={`${displayedChart.id} House Map`}
            title="12 Bhava Overview"
            sub="Each house is shown with its sign, lord, traditional area of life and occupying planets."
            icon={<Grid3X3 size={12} />}
          />
          <div className="mt-5">
            <HouseQuickTable chart={displayedChart} />
          </div>
        </div>
      </section>

      {/* Full planetary details */}
      <section className="rounded-[2rem] border border-orange-900/10 bg-white p-5 shadow-[0_14px_50px_rgba(72,36,8,.06)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Graha Sthiti"
            title="Planetary Positions"
            sub="Complete D1 and D9 planetary details including sign, house, degree, Nakshatra and motion status."
            icon={<Sparkles size={12} />}
          />
          <button
            type="button"
            onClick={() => setShowFullTables((value) => !value)}
            className="rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-black text-orange-700 transition hover:bg-orange-100 print:hidden"
            data-pdf-hide
          >
            {showFullTables ? "Collapse Details" : "Show Full Details"}
          </button>
        </div>

        {showFullTables && (
          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-orange-700">D1 · Main Birth Chart</p>
                  <p className="mt-1 text-xs text-stone-500">Natal graha positions used for the main Lagna chart.</p>
                </div>
              </div>
              <ChartTable chart={charts.d1} />
            </div>

            <div>
              <div className="mb-3">
                <p className="text-[9px] font-black uppercase tracking-[0.17em] text-amber-700">D9 · Navamsa</p>
                <p className="mt-1 text-xs text-stone-500">Divisional planetary positions calculated from the sidereal natal longitude.</p>
              </div>
              <ChartTable chart={charts.d9} />
            </div>
          </div>
        )}
      </section>

      {/* Dasha + dosha */}
      <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-[2rem] bg-[#24170f] p-5 text-white shadow-[0_18px_55px_rgba(42,20,8,.16)] sm:p-7">
          <SectionHeader
            eyebrow="Dasha System"
            title="Vimshottari Mahadasha"
            sub="Major planetary periods are shown in sequence, with the current Mahadasha highlighted where available."
            icon={<Gem size={12} />}
          />

          <div className="mt-5 space-y-2">
            {chartData.mahadashas.slice(0, 9).map((period) => {
              const periodStart = safeGetTime(period.start);
              const currentStart = safeGetTime(currentMahadasha?.start);
              const isCurrent = Boolean(period.lord === currentMahadasha?.lord && periodStart !== null && periodStart === currentStart);

              return (
                <div
                  key={`${period.lord}-${periodStart ?? String(period.start)}`}
                  className={`rounded-2xl p-3.5 transition ${isCurrent ? "bg-amber-400/15 ring-1 ring-amber-400/40" : "bg-white/5 ring-1 ring-white/5"}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black text-amber-100">{period.lord}</p>
                      <p className="mt-1 text-[10px] text-stone-400">{formatDate(period.start)} → {formatDate(period.end)}</p>
                    </div>
                    {isCurrent && <span className="self-start rounded-full bg-amber-400 px-2.5 py-1 text-[8px] font-black text-[#2a1a10]">CURRENT MAHADASHA</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-900/10 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeader
            eyebrow="Dosha / Screening"
            title="Important Indicators"
            sub="High-level screening values available from the current Kundli engine."
            icon={<Sparkles size={12} />}
          />

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-700">Manglik Screening</p>
              <p className="mt-1 font-bold text-[#2a1a10]">{chartData.manglik.isManglik ? "Possible Manglik indication" : "No simplified Manglik indication"}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">{safeText(chartData.manglik.reason)}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-700">Moon Nakshatra</p>
              <p className="mt-1 font-bold text-[#2a1a10]">{safeText(moon?.nakshatra)} · Pada {safeText(moon?.pada)}</p>
              <p className="mt-1 text-xs text-stone-500">Nakshatra Lord: {safeText(chartData.planetMap.Moon?.nakshatraLord)}</p>
            </div>
            <div className="rounded-2xl bg-stone-100 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-600">Calculation Method</p>
              <p className="mt-1 font-bold text-[#2a1a10]">Sidereal · Lahiri</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">Whole-sign houses and astronomical planetary longitudes from the configured astrology engine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final summary */}
      <section className="rounded-[2rem] border border-orange-900/10 bg-white p-5 shadow-[0_14px_50px_rgba(72,36,8,.06)] sm:p-7">
        <SectionHeader
          eyebrow="Quick Summary"
          title="Key Birth Chart Highlights"
          sub="A compact preview of the most important chart identity fields before deeper interpretation."
          icon={<WandSparkles size={12} />}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard title="Lagna / Ascendant" value={`${safeText(charts.d1.ascendant.signHindi)} · ${safeText(charts.d1.ascendant.sign)}`} sub={`${safeText(charts.d1.ascendant.signEnglish)} · ${formatDegree(charts.d1.ascendant.degreeInSign)}`} icon={<Sun size={15} />} />
          <SummaryCard title="D9 Navamsa Lagna" value={`${safeText(charts.d9.ascendant.signHindi)} · ${safeText(charts.d9.ascendant.sign)}`} sub={`${safeText(charts.d9.ascendant.signEnglish)} · Part ${safeText(charts.d9.ascendant.navamsaPart)}`} icon={<Grid3X3 size={15} />} tone="amber" />
          <SummaryCard title="Birth Location" value={safeText(chartData.birth.location?.name)} sub={`${asFiniteNumber(chartData.birth.location?.latitude).toFixed(4)}°N · ${asFiniteNumber(chartData.birth.location?.longitude).toFixed(4)}°E`} icon={<MapPin size={15} />} tone="emerald" />
        </div>
      </section>

      {/* Trust note */}
      <section className="rounded-[2rem] border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-900/5">
            <Gem size={17} />
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-800">Pandit consultation note</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              Birth time and birthplace accuracy can materially affect Lagna, houses and divisional charts. D9 / Navamsa shown here is derived from sidereal natal longitude using standard Navamsa division rules. This report is a calculation and guidance interface, not a substitute for a qualified individual Pandit or astrologer.
            </p>
            {chartData.trust?.trustNote && (
              <p className="mt-2 text-xs leading-6 text-stone-500">{chartData.trust.trustNote}</p>
            )}
          </div>
        </div>
      </section>

      <footer className="hidden pt-2 text-center text-[9px] text-stone-400 print:block">
        DharmYatra · Complete Vedic Birth Report · {formatDate(new Date())}
      </footer>
    </section>
  );
}