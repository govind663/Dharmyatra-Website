/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Component,
  useMemo,
  useState,
  type ChangeEvent,
  type ErrorInfo,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Gem,
  Heart,
  Home,
  Info,
  MapPin,
  MoonStar,
  Plane,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  computePanchang,
  DEFAULT_LOCATION,
  getIndiaLocations,
  getLocationById,
  getPanchangTrustNote,
  type PanchangLocation,
} from "../lib/panchang";

import {
  buildMonthlyCalendar,
  type CalendarDayData,
  type CalendarEvent,
} from "../lib/calendar";

import {
  getDailyRashifalBySign,
  getRashiProfile,
} from "../lib/rashifal";

import {
  buildKundli,
  validateBirthDetails,
  type KundliChartData,
} from "../lib/kundli";

import { useSEO } from "../lib/seo";

import {
  Breadcrumbs,
  Reveal,
} from "../components/ui";

import {
  PageHero,
  WhatsAppBand,
} from "../components/blocks";

import {
  PremiumKundliReport,
} from "../components/kundli/KundliCharts";

/* =========================================================
   TYPES
========================================================= */

const PANCHANG_TABS = [
  {
    key: "panchang",
    label: "Panchang",
    href: "/panchang",
  },
  {
    key: "calendar",
    label: "Calendar",
    href: "/calendar",
  },
  {
    key: "rashifal",
    label: "Rashifal",
    href: "/rashifal",
  },
  {
    key: "kundli",
    label: "Kundli",
    href: "/kundli",
  },
] as const;

type PanchangSection =
  (typeof PANCHANG_TABS)[number]["key"];

/* =========================================================
   ERROR BOUNDARY
========================================================= */

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class PanchangErrorBoundary extends Component<
  {
    children: ReactNode;
  },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(
    error: unknown,
  ): ErrorBoundaryState {
    return {
      hasError: true,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo,
  ) {
    console.error(
      "PanchangPage runtime error:",
      error,
      errorInfo,
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-[70vh] bg-[#fffaf5] px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={30} />
            </div>

            <h1 className="mt-5 font-display text-3xl font-semibold text-[#2a1a10]">
              Astrology page could not be loaded
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Something went wrong while loading the Panchang,
              Calendar, Rashifal or Kundli module.
            </p>

            {this.state.message && (
              <div className="mt-5 rounded-2xl bg-red-50 p-4 text-left text-xs leading-6 text-red-800">
                <strong>Error:</strong>{" "}
                {this.state.message}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleHome}
                className="rounded-2xl border border-orange-900/10 bg-orange-50 px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-orange-100"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

/* =========================================================
   SAFE HELPERS
========================================================= */

function isUsableLocation(
  location: PanchangLocation | null | undefined,
): location is PanchangLocation {
  if (!location) return false;

  return (
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude)) &&
    Number(location.latitude) >= -90 &&
    Number(location.latitude) <= 90 &&
    Number(location.longitude) >= -180 &&
    Number(location.longitude) <= 180 &&
    typeof location.timezone === "string" &&
    location.timezone.trim().length > 0
  );
}

function getSafeLocations(): PanchangLocation[] {
  try {
    const locations = getIndiaLocations();

    if (Array.isArray(locations)) {
      const usable = locations.filter(isUsableLocation);

      if (usable.length > 0) {
        return usable;
      }
    }
  } catch (error) {
    console.error(
      "getIndiaLocations failed:",
      error,
    );
  }

  return isUsableLocation(DEFAULT_LOCATION)
    ? [DEFAULT_LOCATION]
    : [];
}

function getSafeLocation(
  id: string | null | undefined,
): PanchangLocation {
  const locations = getSafeLocations();

  if (id) {
    try {
      const found = getLocationById(id);

      if (isUsableLocation(found)) {
        return found;
      }
    } catch (error) {
      console.error(
        "getLocationById failed:",
        error,
      );
    }

    const normalizedId = id.trim().toLowerCase();

    const localMatch = locations.find(
      (item) =>
        String(item.id ?? "")
          .trim()
          .toLowerCase() === normalizedId,
    );

    if (localMatch) {
      return localMatch;
    }
  }

  const defaultMatch = locations.find(
    (item) =>
      String(item.id ?? "")
        .trim()
        .toLowerCase() ===
      String(DEFAULT_LOCATION.id ?? "")
        .trim()
        .toLowerCase(),
  );

  return (
    defaultMatch ??
    locations[0] ??
    DEFAULT_LOCATION
  );
}

function safeComputePanchang(
  date: Date,
  location: PanchangLocation,
) {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      "Invalid Panchang date.",
    );
  }

  if (!isUsableLocation(location)) {
    throw new Error(
      "Invalid Panchang location.",
    );
  }

  try {
    return computePanchang(
      date,
      location,
    );
  } catch (error) {
    console.error(
      "computePanchang failed:",
      error,
    );

    throw error;
  }
}

/* =========================================================
   COMMON CARD
========================================================= */

function Card({
  title,
  icon,
  children,
  dark = false,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <div
        className={`h-full rounded-3xl p-6 ${
          dark
            ? "bg-char-900 text-white"
            : "border border-orange-900/10 bg-white sacred-border"
        }`}
      >
        <p
          className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] ${
            dark
              ? "text-amber-400"
              : "text-orange-700"
          }`}
        >
          {icon}
          {title}
        </p>

        <div className="mt-3">
          {children}
        </div>
      </div>
    </Reveal>
  );
}

/* =========================================================
   TABS
========================================================= */

function PanchangTabs({
  active,
}: {
  active: PanchangSection;
}) {
  return (
    <div className="sticky top-0 z-30 border-y border-orange-900/10 bg-[#fffaf5]/95 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 md:px-6 lg:px-8">
        {PANCHANG_TABS.map(
          (tab) => (
            <Link
              key={tab.key}
              to={tab.href}
              className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
                active === tab.key
                  ? "bg-orange-600 text-white shadow"
                  : "bg-white text-stone-600 ring-1 ring-orange-900/10 hover:bg-orange-50"
              }`}
            >
              {tab.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

/* =========================================================
   LOCATION SELECTOR
========================================================= */

function LocationSelector({
  location,
  onChange,
}: {
  location: PanchangLocation;
  onChange: (
    location: PanchangLocation,
  ) => void;
}) {
  const locations =
    useMemo(
      () => getSafeLocations(),
      [],
    );

  const selectedId =
    String(
      location?.id ??
        locations[0]?.id ??
        "",
    );

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur">
      <MapPin
        size={15}
        className="shrink-0"
      />

      <select
        value={selectedId}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const selected =
            getSafeLocation(
              event.target.value,
            );

          onChange(selected);
        }}
        className="max-w-47.5 bg-transparent text-sm font-bold outline-none"
        aria-label="Select city"
      >
        {locations.map(
          (item) => (
            <option
              key={item.id ?? item.name ?? `${item.latitude}-${item.longitude}`}
              value={item.id ?? ""}
              className="text-stone-900"
            >
              {item.name}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

/* =========================================================
   PAN-INDIA TRUST + PERSONALIZATION
========================================================= */

function getLocationLabel(
  location: PanchangLocation,
): string {
  const name = String(location?.name ?? "").trim();
  if (name) return name;

  const city = String(location?.city ?? "").trim();
  if (city) return city;

  return "Selected India location";
}

function getSafeTimeZone(
  timeZone: string | null | undefined,
): string {
  const candidate = String(timeZone ?? "").trim();

  if (!candidate) {
    return "Asia/Kolkata";
  }

  try {
    new Intl.DateTimeFormat("en-IN", {
      timeZone: candidate,
    }).format();
    return candidate;
  } catch {
    return "Asia/Kolkata";
  }
}

function getDateKeyInTimeZone(
  date: Date,
  timeZone: string,
): string {
  const safeDate = toValidDate(date);

  if (!safeDate) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    calendar: "gregory",
    timeZone: getSafeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(safeDate);

  const values: Record<string, string> = {};

  for (const part of parts) {
    if (
      part.type === "year" ||
      part.type === "month" ||
      part.type === "day"
    ) {
      values[part.type] = part.value;
    }
  }

  return [
    values.year ?? "",
    values.month ?? "",
    values.day ?? "",
  ].join("-");
}

function createLocalNoonDate(
  year: number,
  monthIndex: number,
  day: number,
): Date {
  const date = new Date(0);
  date.setFullYear(
    year,
    monthIndex,
    day,
  );
  date.setHours(
    12,
    0,
    0,
    0,
  );
  return date;
}

function PersonalizationTrustBar({
  location,
  active,
}: {
  location: PanchangLocation;
  active: PanchangSection;
}) {
  const trust = useMemo(
    () => getPanchangTrustNote(location),
    [location],
  );

  const moduleLabel =
    active === "panchang"
      ? "Panchang"
      : active === "calendar"
        ? "Festival Calendar"
        : active === "rashifal"
          ? "Rashifal"
          : "Kundli";

  const regionLabel =
    location.region
      ? String(location.region).replace(/-/g, " ")
      : "India";

  const basisLabels =
    active === "rashifal"
      ? ["Rashi-based guidance", "Daily calculation"]
      : active === "kundli"
        ? ["Lahiri Sidereal", "Birth-chart calculation"]
        : ["Lahiri Sidereal", "Astronomy calculation"];

  const locationModeLabel =
    active === "rashifal"
      ? "date-aware guidance"
      : "location-aware calculation";

  return (
    <div className="border-b border-orange-900/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/80 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-sm">
              <ShieldCheck size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-900">
                Personalized for {getLocationLabel(location)}
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-emerald-800/80">
                {moduleLabel} · {regionLabel} · {locationModeLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-emerald-900">
            {basisLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-900/10"
              >
                {label}
              </span>
            ))}
            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-900/10">
              {String(trust.regionalNote ?? "")
                .split(".")[0] || "Regional rules visible"}
            </span>
          </div>
        </div>

        <p className="mt-2 text-[10px] leading-5 text-stone-500">
          <strong className="text-stone-700">
            {active === "rashifal"
              ? "Date context:"
              : "Why your location matters:"}
          </strong>{" "}
          {active === "rashifal"
            ? "Rashifal is general Rashi-based guidance; the selected location is used to establish the local calendar date."
            : active === "kundli"
              ? "Birth place coordinates and timezone are used for the Vedic birth-chart calculation."
              : `${trust.calculation} Regional and Sampradaya rules may differ, so DharmYatra keeps the calculation basis visible instead of presenting one tradition as universal.`}
        </p>
      </div>
    </div>
  );
}

function persistLocation(location: PanchangLocation): void {
  try {
    if (typeof window === "undefined") return;
    if (!location?.id) return;
    window.localStorage.setItem(
      "dharmyatra.panchang.location",
      location.id,
    );
  } catch (error) {
    console.warn("Unable to persist Panchang location:", error);
  }
}

function getPersistedLocationId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("dharmyatra.panchang.location");
  } catch {
    return null;
  }
}

/* =========================================================
   SAFE PANCHANG FORMATTERS
========================================================= */

type PanchangDateValue = Date | string | null | undefined;

type PanchangIntervalValue = {
  start?: PanchangDateValue;
  end?: PanchangDateValue;
} | null | undefined;

function toValidDate(value: PanchangDateValue): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(
  value: PanchangDateValue,
  timeZone: string,
): string {
  const date = toValidDate(value);
  if (!date) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: getSafeTimeZone(timeZone),
  }).format(date);
}

function formatDateLabel(
  value: PanchangDateValue,
  timeZone: string,
): string {
  const date = toValidDate(value);
  if (!date) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: getSafeTimeZone(timeZone),
  }).format(date);
}

function formatWeekday(
  value: PanchangDateValue,
  timeZone: string,
): string {
  const date = toValidDate(value);
  if (!date) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: getSafeTimeZone(timeZone),
  }).format(date);
}

function formatInterval(value: PanchangIntervalValue, timeZone: string): string {
  if (!value?.start || !value?.end) return "--";
  return `${formatTime(value.start, timeZone)} – ${formatTime(value.end, timeZone)}`;
}

function getVaraLord(value: PanchangDateValue, timeZone: string): string {
  const date = toValidDate(value);
  if (!date) return "--";
  const weekday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: getSafeTimeZone(timeZone),
  }).format(date).toLowerCase();
  const map: Record<string, string> = {
    sunday: "Surya",
    monday: "Chandra",
    tuesday: "Mangala",
    wednesday: "Budha",
    thursday: "Guru",
    friday: "Shukra",
    saturday: "Shani",
  };
  return map[weekday] ?? "--";
}

function getDayChoghadiyaItems(panchang: ReturnType<typeof computePanchang>) {
  return (panchang.choghadiya ?? []).filter((item) => item.isDay);
}

function getAuspiciousChoghadiya(panchang: ReturnType<typeof computePanchang>) {
  return getDayChoghadiyaItems(panchang).filter(
    (item) => item.quality === "auspicious",
  );
}

function getInauspiciousChoghadiya(panchang: ReturnType<typeof computePanchang>) {
  return getDayChoghadiyaItems(panchang).filter(
    (item) => item.quality === "inauspicious",
  );
}

/* =========================================================
   DATE HELPERS
========================================================= */

function parseISODate(
  value: string | null | undefined,
): Date | null {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      normalized,
    );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = createLocalNoonDate(
    year,
    month - 1,
    day,
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateForQuery(
  date: Date,
): string {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  return [
    String(date.getFullYear()).padStart(
      4,
      "0",
    ),
    String(date.getMonth() + 1).padStart(
      2,
      "0",
    ),
    String(date.getDate()).padStart(
      2,
      "0",
    ),
  ].join("-");
}

function getDateFromQuery(
  value: string | null,
  timeZone: string,
): Date {
  const parsed = parseISODate(value);

  if (parsed) {
    return parsed;
  }

  const todayKey = getDateKeyInTimeZone(
    new Date(),
    timeZone,
  );

  return (
    parseISODate(todayKey) ??
    createLocalNoonDate(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
    )
  );
}

/* =========================================================
   TITHI
========================================================= */

function getShortTithiName(
  name: string,
): string {
  const value =
    name.trim().toLowerCase();

  switch (value) {
    case "pratipada":
      return "Prat.";

    case "dvitiya":
      return "Dvit.";

    case "tritiya":
      return "Trit.";

    case "chaturthi":
      return "Chat.";

    case "panchami":
      return "Panch.";

    case "shashthi":
      return "Shash.";

    case "saptami":
      return "Sapt.";

    case "ashtami":
      return "Asht.";

    case "navami":
      return "Nav.";

    case "dashami":
      return "Dash.";

    case "ekadashi":
      return "Ekadashi";

    case "dvadashi":
      return "Dvad.";

    case "trayodashi":
      return "Trayod.";

    case "chaturdashi":
      return "Chat.";

    case "purnima":
      return "Purnima";

    case "amavasya":
      return "Amavasya";

    default:
      return name;
  }
}

/* =========================================================
   RASHI LIST
========================================================= */

const RASHIS = [
  {
    name: "Mesha",
    hindi: "मेष",
    symbol: "Aries",
  },
  {
    name: "Vrishabha",
    hindi: "वृषभ",
    symbol: "Taurus",
  },
  {
    name: "Mithuna",
    hindi: "मिथुन",
    symbol: "Gemini",
  },
  {
    name: "Karka",
    hindi: "कर्क",
    symbol: "Cancer",
  },
  {
    name: "Simha",
    hindi: "सिंह",
    symbol: "Leo",
  },
  {
    name: "Kanya",
    hindi: "कन्या",
    symbol: "Virgo",
  },
  {
    name: "Tula",
    hindi: "तुला",
    symbol: "Libra",
  },
  {
    name: "Vrishchika",
    hindi: "वृश्चिक",
    symbol: "Scorpio",
  },
  {
    name: "Dhanu",
    hindi: "धनु",
    symbol: "Sagittarius",
  },
  {
    name: "Makara",
    hindi: "मकर",
    symbol: "Capricorn",
  },
  {
    name: "Kumbha",
    hindi: "कुंभ",
    symbol: "Aquarius",
  },
  {
    name: "Meena",
    hindi: "मीन",
    symbol: "Pisces",
  },
] as const;

type RashiKey =
  (typeof RASHIS)[number]["name"];

/* =========================================================
   RASHIFAL ICON
========================================================= */

function RashifalCategoryIcon({
  type,
}: {
  type:
    | "general"
    | "career"
    | "finance"
    | "love"
    | "health"
    | "education"
    | "family"
    | "travel"
    | "spiritual";
}) {
  switch (type) {
    case "career":
      return (
        <BriefcaseBusiness
          size={14}
        />
      );

    case "finance":
      return (
        <WalletCards
          size={14}
        />
      );

    case "love":
      return (
        <Heart size={14} />
      );

    case "health":
      return (
        <ShieldCheck
          size={14}
        />
      );

    case "education":
      return (
        <GraduationCap
          size={14}
        />
      );

    case "family":
      return (
        <Home size={14} />
      );

    case "travel":
      return (
        <Plane size={14} />
      );

    case "spiritual":
      return (
        <Sparkles
          size={14}
        />
      );

    case "general":
    default:
      return (
        <Sparkles
          size={14}
        />
      );
  }
}

/* =========================================================
   PANCHANG VIEW
========================================================= */

function PanchangView({
  location,
  onLocationChange,
}: {
  location: PanchangLocation;
  onLocationChange: (
    location: PanchangLocation,
  ) => void;
}) {
  useSEO({
    title:
      "Today's Panchang — Tithi, Nakshatra, Rahukaal, Muhurat | DharmYatra",

    description:
      "Location-aware daily Panchang with Tithi, Nakshatra, Yoga, Karana, sunrise, sunset, Rahukaal, Abhijit Muhurat and Choghadiya.",

    path: "/panchang",
  });

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const queryDate =
    searchParams.get("date");

  const effectiveDate =
    useMemo(
      () =>
        getDateFromQuery(
          queryDate,
          location.timezone,
        ),
      [location.timezone, queryDate],
    );

  const calculation =
    useMemo(() => {
      try {
        return {
          data:
            safeComputePanchang(
              effectiveDate,
              location,
            ),
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error:
            error instanceof
            Error
              ? error.message
              : "Unable to calculate Panchang.",
        };
      }
    }, [
      effectiveDate,
      location,
    ]);

  const p =
    calculation.data;

  const changeDay = (
    amount: number,
  ) => {
    const next =
      new Date(
        effectiveDate.getTime(),
      );

    next.setDate(
      next.getDate() +
        amount,
    );

    navigate(
      `/panchang?date=${formatDateForQuery(
        next,
      )}`,
    );
  };

  const resetDay = () => {
    navigate(
      "/panchang",
    );
  };

  if (!p) {
    return (
      <>
        <PageHero
          eyebrow="Panchang · Daily Almanac"
          title="Today's Panchang"
          sub="Daily Panchang calculation."
          image="/images/aarti-night.jpeg"
        />

        <PanchangTabs
          active="panchang"
        />

        <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle
              size={32}
              className="mx-auto text-red-600"
            />

            <h2 className="mt-4 text-xl font-bold text-red-900">
              Panchang calculation failed
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {calculation.error ??
                "Unable to calculate Panchang for the selected location and date."}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Panchang · Daily Almanac"
        title="Today's Panchang"
        sub={`Tithi, Nakshatra, Yoga, Karana, Rahukaal and Muhurat for ${location.name}.`}
        image="/images/aarti-night.jpeg"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1.5 backdrop-blur">
            <button
              type="button"
              onClick={() =>
                changeDay(-1)
              }
              aria-label="Previous day"
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/15"
            >
              <ChevronLeft
                size={17}
              />
            </button>

            <span className="min-w-55 text-center text-sm font-bold">
              {formatDateLabel(p.date, p.location.timezone)}
            </span>

            <button
              type="button"
              onClick={() =>
                changeDay(1)
              }
              aria-label="Next day"
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/15"
            >
              <ChevronRight
                size={17}
              />
            </button>
          </div>

          <LocationSelector
            location={location}
            onChange={
              onLocationChange
            }
          />

          {queryDate && (
            <button
              type="button"
              onClick={
                resetDay
              }
              className="rounded-2xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold backdrop-blur"
            >
              Today
            </button>
          )}
        </div>
      </PageHero>

      <PanchangTabs
        active="panchang"
      />

      <PersonalizationTrustBar
        location={location}
        active="panchang"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Panchang",
            },
          ]}
        />

        <div className="mt-4 rounded-3xl border border-orange-900/10 bg-orange-50 p-4 text-sm text-stone-700">
          <div className="flex items-center gap-2 font-bold">
            <MapPin
              size={16}
              className="text-orange-600"
            />

            {p.location.name}
          </div>

          <p className="mt-1 text-xs text-stone-500">
            {p.location.region ??
              "India"}{" "}
            ·{" "}
            {Number(
              p.location.latitude,
            ).toFixed(4)}
            °N ·{" "}
            {Number(
              p.location.longitude,
            ).toFixed(4)}
            °E
          </p>
        </div>

        {p.festivals.length >
          0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {p.festivals.map(
              (festival) => (
                <span
                  key={festival.id}
                  className="rounded-full bg-linear-to-r from-orange-600 to-amber-500 px-4 py-2 text-[13px] font-bold text-white shadow"
                  title={festival.description ?? festival.nameHindi}
                >
                  {festival.name}
                </span>
              ),
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Vara (Weekday)"
            icon={
              <CalendarDays
                size={14}
              />
            }
          >
            <p className="font-display text-2xl font-semibold text-[#2a1a10]">
              {formatWeekday(p.date, p.location.timezone)}
            </p>

            <p className="text-sm text-stone-500">
              Lord:{" "}
              {getVaraLord(p.date, p.location.timezone)}
            </p>
          </Card>

          <Card
            title="Tithi"
            icon={
              <MoonStar
                size={14}
              />
            }
            dark
          >
            <p className="font-display text-2xl font-semibold text-amber-200">
              {p.tithi.name}
            </p>

            <p className="text-sm text-stone-300">
              {p.tithi.paksha}{" "}
              · ends ~{" "}
              {formatTime(p.tithi.end, p.location.timezone)}
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-linear-to-r from-orange-500 to-amber-400"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        p.tithi.percentage ??
                          0,
                      ),
                    ),
                  )}%`,
                }}
              />
            </div>
          </Card>

          <Card
            title="Nakshatra"
            icon={
              <Sparkles
                size={14}
              />
            }
          >
            <p className="font-display text-2xl font-semibold text-[#2a1a10]">
              {p.nakshatra.name}{" "}
              <span className="text-base text-stone-500">
                · Pada{" "}
                {
                  p.nakshatra.pada
                }
              </span>
            </p>

            <p className="text-sm text-stone-500">
              Ends ~{" "}
              {
                p.nakshatra
                  .ends
              }
            </p>
          </Card>

          <Card
            title="Yoga & Karana"
            icon={
              <Info size={14} />
            }
          >
            <p className="font-display text-xl font-semibold text-[#2a1a10]">
              {p.yoga.name}{" "}
              Yoga
            </p>

            <p className="text-sm text-stone-500">
              {p.karana.name}{" "}
              Karana
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Yoga ends ~{" "}
              {formatTime(p.yoga.end, p.location.timezone)}
            </p>

            <p className="text-xs text-stone-400">
              Karana ends ~{" "}
              {formatTime(p.karana.end, p.location.timezone)}
            </p>
          </Card>

          <Card
            title="Sun & Moon"
            icon={
              <Sun size={14} />
            }
          >
            <p className="text-[15px] font-bold text-[#2a1a10]">
              Sunrise{" "}
              {formatTime(p.solar.sunrise, p.location.timezone)}
            </p>

            <p className="text-[15px] font-bold text-[#2a1a10]">
              Sunset{" "}
              {formatTime(p.solar.sunset, p.location.timezone)}
            </p>

            <p className="mt-1 text-sm text-stone-500">
              Moonrise ~{" "}
              {formatTime(p.lunar.moonrise, p.location.timezone)}
            </p>

            <p className="text-sm text-stone-500">
              Moonset ~{" "}
              {formatTime(p.lunar.moonset, p.location.timezone)}
            </p>
          </Card>

          <Card
            title="Abhijit Muhurat"
            icon={
              <Sparkles
                size={14}
              />
            }
            dark
          >
            <p className="font-display text-2xl font-semibold text-emerald-300">
              {formatInterval(p.abhijit, p.location.timezone)}
            </p>

            <p className="text-sm text-stone-300">
              Traditional midday
              muhurat window.
            </p>
          </Card>

          <Card
            title="Rahukaal"
            icon={
              <AlertTriangle
                size={14}
              />
            }
          >
            <p className="font-display text-2xl font-semibold text-red-800">
              {formatInterval(p.rahukaal, p.location.timezone)}
            </p>

            <p className="mt-2 text-sm text-stone-500">
              Yamaganda{" "}
              {formatInterval(p.yamaganda, p.location.timezone)}
            </p>

            <p className="text-sm text-stone-500">
              Gulika{" "}
              {formatInterval(p.gulika, p.location.timezone)}
            </p>
          </Card>

          <Card
            title="Day Choghadiya"
            icon={
              <Clock size={14} />
            }
          >
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {getDayChoghadiyaItems(p).map(
                (
                  item,
                  index,
                ) => (
                  <div
                    key={`${item.name}-${index}`}
                    className={`rounded-xl px-2 py-2 ${
                      item.quality === "auspicious"
                        ? "bg-emerald-50 text-emerald-900"
                        : item.quality === "inauspicious"
                          ? "bg-red-50 text-red-900"
                          : "bg-orange-50 text-orange-900"
                    }`}
                  >
                    <p className="text-[11px] font-bold">
                      {item.name}
                    </p>

                    <p className="text-[10px] opacity-70">
                      {formatTime(item.start, p.location.timezone)}
                    </p>

                    <p className="text-[10px] opacity-60">
                      {formatTime(item.end, p.location.timezone)}
                    </p>
                  </div>
                ),
              )}
            </div>

            <p className="mt-2 text-xs text-stone-500">
              Day Choghadiya from sunrise · Labh, Amrit, Shubh and Char are considered shubh.
            </p>
          </Card>

          <Card
            title="Shubh · Avoid"
            icon={
              <Sun size={14} />
            }
          >
            <div>
              <p className="text-sm font-bold text-emerald-800">
                Shubh
              </p>

              <div className="mt-2 space-y-1.5">
                {getAuspiciousChoghadiya(p).map(
                  (
                    item,
                    index,
                  ) => (
                    <p
                      key={`${item.index}-${index}`}
                      className="text-xs leading-relaxed text-emerald-700"
                    >
                      {item.name} · {formatTime(item.start, p.location.timezone)} – {formatTime(item.end, p.location.timezone)}
                    </p>
                  ),
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-bold text-red-800">
                Avoid
              </p>

              <div className="mt-2 space-y-1.5">
                {getInauspiciousChoghadiya(p).map(
                  (
                    item,
                    index,
                  ) => (
                    <p
                      key={`${item.index}-${index}`}
                      className="text-xs leading-relaxed text-red-700"
                    >
                      {item.name} · {formatTime(item.start, p.location.timezone)} – {formatTime(item.end, p.location.timezone)}
                    </p>
                  ),
                )}
              </div>
            </div>
          </Card>
        </div>

        <Reveal className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 p-5 text-[13px] leading-relaxed text-stone-600">
          <strong className="text-[#3a2415]">
            Panchang calculation:
          </strong>{" "}
          Tithi, Nakshatra, Yoga,
          Karana, sunrise, sunset और
          daily muhurat selected
          location के coordinates के
          आधार पर calculate किए जाते हैं।
          Detailed festival rules
          dedicated{" "}
          <code>
            festivals.ts
          </code>{" "}
          layer में maintain किए जाते हैं।
        </Reveal>

        <div className="mt-8">
          <WhatsAppBand
            title="Need a personal shubh muhurat?"
            sub="Share the purpose and birth details for a more personalized consultation."
            message="Namaste! Please suggest a shubh muhurat for my upcoming sanskar."
          />
        </div>
      </div>
    </>
  );
}

/* =========================================================
   CALENDAR TYPES
========================================================= */

type CalendarPageData = {
  monthName: string;
  year: number;
  weekdays: string[];
  days: CalendarDayData[];
  events: CalendarEvent[];
};

type CalendarBuildResult = {
  data: CalendarPageData;
  error: string | null;
};

/* =========================================================
   FALLBACK CALENDAR
========================================================= */

function createFallbackCalendar(
  year: number,
  month: number,
  location: PanchangLocation,
): CalendarPageData {
  const firstDay = createLocalNoonDate(
    year,
    month,
    1,
  );

  const firstWeekday =
    firstDay.getDay();

  const gridStart =
    createLocalNoonDate(
      year,
      month,
      1 - firstWeekday,
    );

  const todayKey =
    getDateKeyInTimeZone(
      new Date(),
      location.timezone,
    );

  const today =
    parseISODate(todayKey) ??
    new Date();

  const days: CalendarDayData[] =
    [];

  for (
    let index = 0;
    index < 42;
    index += 1
  ) {
    const currentDate =
      new Date(
        gridStart.getTime(),
      );

    currentDate.setDate(
      gridStart.getDate() +
        index,
    );

    const dateISO =
      formatDateForQuery(
        currentDate,
      );

    let p: ReturnType<
      typeof computePanchang
    > | null = null;

    try {
      p =
        safeComputePanchang(
          currentDate,
          location,
        );
    } catch {
      p = null;
    }

    const isToday =
      currentDate.getFullYear() ===
        today.getFullYear() &&
      currentDate.getMonth() ===
        today.getMonth() &&
      currentDate.getDate() ===
        today.getDate();

    const isCurrentMonth =
      currentDate.getFullYear() ===
        year &&
      currentDate.getMonth() ===
        month;

    const tithiName =
      String(
        p?.tithi?.name ??
          "",
      )
        .trim()
        .toLowerCase();

    const isEkadashi =
      tithiName.includes(
        "ekadashi",
      );

    const isPurnima =
      tithiName.includes(
        "purnima",
      );

    const isAmavasya =
      tithiName.includes(
        "amavasya",
      );

    const paksha =
      p?.tithi?.paksha === "Krishna"
        ? "Krishna"
        : "Shukla";

    const dayData: CalendarDayData =
      {
        dateISO,

        day:
          currentDate.getDate(),

        weekday:
          currentDate.getDay(),

        weekdayName:
          currentDate.toLocaleDateString(
            "en-IN",
            {
              weekday:
                "long",
            },
          ),

        isToday,

        isCurrentMonth,

        tithi: {
          shortName:
            getShortTithiName(
              p?.tithi?.name ??
                "--",
            ),
          name:
            p?.tithi?.name ??
            "",
          index:
            Number(
              p?.tithi?.index ??
                0,
            ),
          paksha,
        },

        isEkadashi,

        isPurnima,

        isAmavasya,

        events: [],
      };

    days.push(
      dayData,
    );
  }

  return {
    monthName:
      firstDay.toLocaleDateString(
        "en-IN",
        {
          month: "long",
        },
      ),

    year,

    weekdays: [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ],

    days,

    events: [],
  };
}

/* =========================================================
   SAFE CALENDAR
========================================================= */

function buildSafeCalendar(
  year: number,
  month: number,
  location: PanchangLocation,
): CalendarBuildResult {
  try {
    const result =
      buildMonthlyCalendar(
        year,
        month,
        {
          location,
          weekStartsOn:
            "sunday",
          includePanchang:
            false,
        },
      );

    if (
      !result ||
      !Array.isArray(
        result.days,
      )
    ) {
      throw new Error(
        "Invalid calendar response.",
      );
    }

    return {
      data:
        result as CalendarPageData,
      error: null,
    };
  } catch (error) {
    console.error(
      "buildMonthlyCalendar failed:",
      error,
    );

    let fallback: CalendarPageData;

    try {
      fallback =
        createFallbackCalendar(
          year,
          month,
          location,
        );
    } catch (fallbackError) {
      console.error(
        "Calendar fallback failed:",
        fallbackError,
      );

      fallback =
        createFallbackCalendar(
          year,
          month,
          DEFAULT_LOCATION,
        );
    }

    return {
      data: fallback,
      error:
        "Calendar data could not be loaded. A basic Panchang calendar is shown as a fallback.",
    };
  }
}

/* =========================================================
   CALENDAR VIEW
========================================================= */

function CalendarView({
  location,
  onLocationChange,
}: {
  location: PanchangLocation;
  onLocationChange: (
    location: PanchangLocation,
  ) => void;
}) {
  useSEO({
    title:
      "Hindu Calendar — Festivals, Ekadashi, Purnima & Amavasya | DharmYatra",

    description:
      "Location-aware Hindu calendar with festivals, Ekadashi, Purnima, Amavasya and regional observances.",

    path: "/calendar",
  });

  const initialDateKey = useMemo(
    () =>
      getDateKeyInTimeZone(
        new Date(),
        location.timezone,
      ),
    [location.timezone],
  );

  const initialDate =
    parseISODate(initialDateKey) ??
    new Date();

  const [
    calendarYear,
    setCalendarYear,
  ] = useState<number>(
    initialDate.getFullYear(),
  );

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState<number>(
    initialDate.getMonth(),
  );

  const calendarResult =
    useMemo(
      () =>
        buildSafeCalendar(
          calendarYear,
          calendarMonth,
          location,
        ),
      [
        calendarYear,
        calendarMonth,
        location,
      ],
    );

  const calendar =
    calendarResult.data;

  const calendarError =
    calendarResult.error;

  const goPreviousMonth =
    () => {
      if (
        calendarMonth ===
        0
      ) {
        setCalendarYear(
          (current) =>
            current - 1,
        );

        setCalendarMonth(
          11,
        );

        return;
      }

      setCalendarMonth(
        (current) =>
          current - 1,
      );
    };

  const goNextMonth = () => {
    if (
      calendarMonth ===
      11
    ) {
      setCalendarYear(
        (current: number) =>
          current + 1,
      );

      setCalendarMonth(
        0,
      );

      return;
    }

    setCalendarMonth(
      (current) =>
        current + 1,
    );
  };

  const goToday = () => {
    const todayKey =
      getDateKeyInTimeZone(
        new Date(),
        location.timezone,
      );

    const current =
      parseISODate(todayKey) ??
      new Date();

    setCalendarYear(
      current.getFullYear(),
    );

    setCalendarMonth(
      current.getMonth(),
    );
  };

  const primaryEvent = (
    day: CalendarDayData,
  ): CalendarEvent | undefined => {
    return (
      day.events?.find(
        (event) =>
          event.isMajor,
      ) ??
      day.events?.[0]
    );
  };

  const majorEvents =
    [
      ...(calendar.events ??
        []),
    ]
      .filter(
        (event) =>
          event.isMajor,
      )
      .sort(
        (a, b) =>
          a.dateISO.localeCompare(
            b.dateISO,
          ),
      );

  return (
    <>
      <PageHero
        eyebrow="Calendar · Utsav"
        title="Festival Calendar"
        sub={`Pan-India festival calendar for ${location.name} — Ekadashi, Purnima, Amavasya and regional observances.`}
        image="/images/festival-crowd.jpeg"
      >
        <div className="flex flex-wrap items-center gap-2">
          <LocationSelector
            location={location}
            onChange={
              onLocationChange
            }
          />

          <button
            type="button"
            onClick={
              goToday
            }
            className="rounded-2xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            Current Month
          </button>
        </div>
      </PageHero>

      <PanchangTabs
        active="calendar"
      />

      <PersonalizationTrustBar
        location={location}
        active="calendar"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Panchang",
              href: "/panchang",
            },
            {
              label: "Calendar",
            },
          ]}
        />

        {calendarError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <Info
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Calendar fallback mode
              </p>

              <p className="mt-1 text-xs leading-relaxed">
                {calendarError}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-orange-900/10 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={
              goPreviousMonth
            }
            aria-label="Previous month"
            className="grid h-10 w-10 place-items-center rounded-full bg-orange-50 text-stone-700 transition hover:bg-orange-100"
          >
            <ChevronLeft
              size={18}
            />
          </button>

          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">
              {
                calendar.monthName
              }{" "}
              {
                calendar.year
              }
            </h2>

            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-stone-500">
              <MapPin
                size={12}
              />

              {
                location.name
              }
            </p>
          </div>

          <button
            type="button"
            onClick={
              goNextMonth
            }
            aria-label="Next month"
            className="grid h-10 w-10 place-items-center rounded-full bg-orange-50 text-stone-700 transition hover:bg-orange-100"
          >
            <ChevronRight
              size={18}
            />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="min-w-190">
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-stone-400 md:gap-2">
              {calendar.weekdays.map(
                (weekday) => (
                  <div
                    key={
                      weekday
                    }
                    className="py-2"
                  >
                    {
                      weekday
                    }
                  </div>
                ),
              )}
            </div>

            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {calendar.days.map(
                (day) => {
                  const event =
                    primaryEvent(
                      day,
                    );

                  return (
                    <Link
                      key={`${day.dateISO}-${day.isCurrentMonth}`}
                      to={`/panchang?date=${day.dateISO}`}
                      className={`min-h-26.25 rounded-2xl border p-1.5 text-left transition md:min-h-35 md:p-2 ${
                        !day.isCurrentMonth
                          ? "opacity-40"
                          : "hover:-translate-y-0.5 hover:shadow-md"
                      } ${
                        day.isToday
                          ? "ring-2 ring-orange-500 ring-offset-1"
                          : ""
                      } ${
                        day.isPurnima
                          ? "border-amber-400 bg-amber-50"
                          : day.isAmavasya
                            ? "border-stone-400 bg-stone-100"
                            : day.isEkadashi
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-orange-900/10 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-extrabold text-stone-800 md:text-base">
                          {
                            day.day
                          }
                        </p>

                        {day.isToday && (
                          <span className="rounded-full bg-orange-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                            TODAY
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[10px] font-semibold text-stone-500">
                        {
                          day
                            .tithi
                            ?.shortName ??
                          "--"
                        }
                      </p>

                      {day.isEkadashi && (
                        <p className="mt-1 rounded-full bg-emerald-600 px-1.5 py-1 text-[9px] font-bold text-white">
                          Ekadashi
                        </p>
                      )}

                      {day.isPurnima && (
                        <p className="mt-1 rounded-full bg-amber-500 px-1.5 py-1 text-[9px] font-bold text-white">
                          Purnima
                        </p>
                      )}

                      {day.isAmavasya && (
                        <p className="mt-1 rounded-full bg-stone-700 px-1.5 py-1 text-[9px] font-bold text-white">
                          Amavasya
                        </p>
                      )}

                      {event &&
                        !day.isEkadashi &&
                        !day.isPurnima &&
                        !day.isAmavasya && (
                          <p className="mt-1 line-clamp-2 rounded-lg bg-orange-100 px-1.5 py-1 text-[9px] font-bold text-orange-900">
                            {
                              event.shortTitle ??
                              event.title
                            }
                          </p>
                        )}
                    </Link>
                  );
                },
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-600" />
            Ekadashi
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            Purnima
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-stone-700" />
            Amavasya
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full ring-2 ring-orange-500" />
            Today
          </span>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#2a1a10]">
                {
                  calendar.monthName
                }{" "}
                Festivals
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Major festival and
                observance markers for{" "}
                {
                  location.name
                }.
              </p>
            </div>

            <Link
              to="/panchang"
              className="rounded-xl bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100"
            >
              Open Today's Panchang
            </Link>
          </div>

          {majorEvents.length >
          0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {majorEvents.map(
                (event) => (
                  <Link
                    key={
                      event.id
                    }
                    to={`/panchang?date=${event.dateISO}`}
                    className="rounded-2xl border border-orange-900/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={17}
                        className="mt-0.5 shrink-0 text-orange-600"
                      />

                      <div>
                        <p className="text-xs font-bold text-orange-700">
                          {
                            event.dateISO
                          }
                        </p>

                        <p className="mt-1 font-bold text-stone-800">
                          {
                            event.title
                          }
                        </p>

                        {event.description && (
                          <p className="mt-1 text-xs leading-relaxed text-stone-500">
                            {
                              event.description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-orange-900/20 bg-orange-50 p-5 text-sm text-stone-500">
              No major festival
              markers are available
              for this month in the
              selected location.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   RASHIFAL VIEW
========================================================= */

function formatRashifalRating(
  value: unknown,
): string {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return "0.0";
  }

  return Math.min(
    5,
    Math.max(0, numeric),
  ).toFixed(1);
}

function RashifalView({
  location,
}: {
  location: PanchangLocation;
}) {
  useSEO({
    title:
      "Daily Rashifal — Career, Finance, Love & Life Guidance | DharmYatra",

    description:
      "Daily guidance for all 12 Rashis covering career, finance, love, education, family and wellbeing.",

    path: "/rashifal",
  });

  const [
    selectedRashi,
    setSelectedRashi,
  ] = useState<RashiKey>(
    "Mesha",
  );

  const rashifalDateKey = getDateKeyInTimeZone(
    new Date(),
    location.timezone,
  );

  const rashifalMap =
    useMemo(() => {
      try {
        const effectiveRashifalDate =
          parseISODate(
            rashifalDateKey,
          ) ?? new Date();

        const results =
          getDailyRashifalBySign(
            effectiveRashifalDate,
          );

        if (
          !Array.isArray(
            results,
          )
        ) {
          return new Map();
        }

        return new Map(
          results.map(
            (item) => [
              item.rashi,
              item,
            ],
          ),
        );
      } catch (error) {
        console.error(
          "Rashifal calculation failed:",
          error,
        );

        return new Map();
      }
    }, [rashifalDateKey]);

  const active =
    rashifalMap.get(
      selectedRashi,
    );

  const rashi =
    RASHIS.find(
      (item) =>
        item.name ===
        selectedRashi,
    ) ??
    RASHIS[0];

  let profile: ReturnType<
    typeof getRashiProfile
  > | null = null;

  try {
    profile =
      getRashiProfile(
        rashi.name,
      );
  } catch (error) {
    console.error(
      "getRashiProfile failed:",
      error,
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Rashifal · Daily Guidance"
        title="Today's Rashifal"
        sub="Choose your Rashi and explore guidance across career, finance, relationships, family, education and wellbeing."
        image="/images/festival-crowd.jpeg"
      />

      <PanchangTabs
        active="rashifal"
      />

      <PersonalizationTrustBar
        location={location}
        active="rashifal"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Rashifal",
            },
          ]}
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {RASHIS.map(
            (item) => {
              const isActive =
                item.name ===
                selectedRashi;

              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() =>
                    setSelectedRashi(
                      item.name,
                    )
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-orange-500 bg-orange-50 shadow"
                      : "border-orange-900/10 bg-white hover:bg-orange-50"
                  }`}
                >
                  <p className="text-lg font-bold text-stone-800">
                    {item.hindi}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    {item.name} ·{" "}
                    {item.symbol}
                  </p>
                </button>
              );
            },
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-char-900 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Selected Rashi
          </p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-4xl font-semibold">
                {rashi.hindi}
              </h2>

              <p className="mt-1 text-sm text-stone-300">
                {rashi.name} ·{" "}
                {rashi.symbol}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-amber-300">
                Daily Guidance
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-stone-300">
                {getLocationLabel(location)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="General"
            icon={
              <RashifalCategoryIcon
                type="general"
              />
            }
          >
            <p className="text-sm leading-7 text-stone-600">
              {active?.general ??
                "Rashifal data is unavailable for this Rashi."}
            </p>
          </Card>

          <Card
            title="Career"
            icon={
              <RashifalCategoryIcon
                type="career"
              />
            }
          >
            <p className="text-sm leading-7 text-stone-600">
              {active?.career ??
                "--"}
            </p>
          </Card>

          <Card
            title="Finance"
            icon={
              <RashifalCategoryIcon
                type="finance"
              />
            }
          >
            <p className="text-sm leading-7 text-stone-600">
              {active?.finance ??
                "--"}
            </p>
          </Card>

          <Card
            title="Love & Marriage"
            icon={
              <RashifalCategoryIcon
                type="love"
              />
            }
            dark
          >
            <p className="text-sm leading-7 text-stone-300">
              {active?.love ??
                "--"}
            </p>
          </Card>

          <Card
            title="Health & Wellness"
            icon={
              <RashifalCategoryIcon
                type="health"
              />
            }
          >
            <p className="text-sm leading-7 text-stone-600">
              {active?.health ??
                "--"}
            </p>
          </Card>

          <Card
            title="Education"
            icon={
              <RashifalCategoryIcon
                type="education"
              />
            }
          >
            <p className="text-sm leading-7 text-stone-600">
              {active?.education ??
                "--"}
            </p>
          </Card>

          <Card
            title="Family"
            icon={
              <RashifalCategoryIcon
                type="family"
              />
            }
          >
            <p className="text-sm leading-7 text-stone-600">
              {active?.family ??
                "--"}
            </p>
          </Card>

          <Card
            title="Travel"
            icon={
              <RashifalCategoryIcon
                type="travel"
              />
            }
          >
            <p className="text-sm leading-7 text-stone-600">
              {active?.travel ??
                "--"}
            </p>
          </Card>

          <Card
            title="Spiritual"
            icon={
              <RashifalCategoryIcon
                type="spiritual"
              />
            }
          >
            <p className="text-sm leading-7 text-stone-600">
              {active?.spiritual ??
                "--"}
            </p>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card
            title="Today's Rating"
            icon={
              <Sparkles
                size={14}
              />
            }
          >
            <p className="font-display text-3xl font-semibold text-[#2a1a10]">
              {formatRashifalRating(
                active?.overallRating,
              )}
              /5
            </p>

            <p className="mt-1 text-sm text-stone-500">
              {active?.overallLabel ??
                "General"}
            </p>
          </Card>

          <Card
            title="Lucky Details"
            icon={
              <Sparkles
                size={14}
              />
            }
          >
            <p className="text-sm text-stone-600">
              Number:{" "}
              <strong>
                {active?.luckyNumber ??
                  "--"}
              </strong>
            </p>

            <p className="text-sm text-stone-600">
              Color:{" "}
              <strong>
                {active?.luckyColor ??
                  "--"}
              </strong>
            </p>

            <p className="text-sm text-stone-600">
              Day:{" "}
              <strong>
                {active?.luckyDay ??
                  "--"}
              </strong>
            </p>
          </Card>

          <Card
            title="Rashi Profile"
            icon={
              <Info
                size={14}
              />
            }
          >
            <p className="text-sm text-stone-600">
              Lord:{" "}
              <strong>
                {profile?.lord ??
                  "--"}
              </strong>
            </p>

            <p className="mt-1 text-sm text-stone-600">
              Element:{" "}
              <strong>
                {profile?.element ??
                  "--"}
              </strong>
            </p>

            <p className="mt-1 text-sm text-stone-600">
              Quality:{" "}
              <strong>
                {profile?.quality ??
                  "--"}
              </strong>
            </p>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card
            title="Do Today"
            icon={
              <ShieldCheck
                size={14}
              />
            }
          >
            <p className="text-sm leading-7 text-emerald-700">
              {active?.doToday ??
                "--"}
            </p>
          </Card>

          <Card
            title="Avoid Today"
            icon={
              <AlertTriangle
                size={14}
              />
            }
          >
            <p className="text-sm leading-7 text-red-700">
              {active?.avoidToday ??
                "--"}
            </p>
          </Card>
        </div>

        <Reveal className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-stone-600">
          <strong className="text-[#3a2415]">
            Note:
          </strong>{" "}
          यह general Rashi-based guidance है।
          Personalized astrology के लिए exact
          birth date, time और place के आधार पर
          full Kundli analysis आवश्यक है।
        </Reveal>
      </div>
    </>
  );
}

/* =========================================================
   KUNDLI VIEW
========================================================= */

function KundliView({
  location,
}: {
  location: PanchangLocation;
}) {
  useSEO({
    title:
      "Premium Kundli — Lagna, D9 Navamsa & Vedic Birth Chart | DharmYatra",

    description:
      "Generate a premium Vedic Kundli with D1 Lagna chart, D9 Navamsa chart, planetary positions, 12 houses, Mahadasha and Manglik screening.",

    path: "/kundli",
  });

  const locations = useMemo(
    () => getSafeLocations(),
    [],
  );

  const defaultBirthLocation = useMemo(() => {
    if (location?.id) {
      const found = locations.find(
        (item) => item.id === location.id,
      );

      if (found) return found;
    }

    return locations[0] ?? DEFAULT_LOCATION;
  }, [location, locations]);

  const [birthName, setBirthName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState(
    defaultBirthLocation.id ?? "",
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<KundliChartData | null>(null);

  const birthLocation = getSafeLocation(birthPlace);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitted(false);
    setChartData(null);

    const safeName = birthName.trim() || "Guest";

    const details = {
      name: safeName,
      date: birthDate,
      time: birthTime,
      location: birthLocation,
    };

    try {
      const validationErrors = validateBirthDetails(details);

      if (validationErrors.length > 0) {
        setError(validationErrors.join(" "));
        return;
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Birth details validation failed.",
      );
      return;
    }

    try {
      const result = buildKundli({
        name: safeName,
        birthDate,
        birthTime,
        location: birthLocation,
      });

      if (!result) {
        throw new Error("Kundli engine returned empty data.");
      }

      setChartData(result);
      setSubmitted(true);
    } catch (caughtError) {
      console.error("buildKundli failed:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate Kundli.",
      );
    }
  };

  const maxBirthDate =
    useMemo(
      () =>
        getDateKeyInTimeZone(
          new Date(),
          birthLocation.timezone,
        ),
      [birthLocation.timezone],
    );

  return (
    <>
      <PageHero
        eyebrow="Kundli · Janma Chart"
        title="Premium Janma Kundli"
        sub="Create a detailed location-aware Vedic birth report with a Pandit-style Lagna chart and D9 Navamsa chart."
        image="/images/aarti-night.jpeg"
      />

      <PanchangTabs active="kundli" />

      <PersonalizationTrustBar
        location={location}
        active="kundli"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Kundli" },
          ]}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal className="rounded-4xl border border-orange-900/10 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                <UserRound size={21} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-700">
                  Vedic Birth Report
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">
                  Birth Details
                </h2>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-stone-500">
              Exact birth date, time and place are required for a meaningful Lagna and divisional-chart calculation.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="birth-name" className="mb-2 block text-sm font-bold text-stone-700">
                  Full Name
                </label>
                <input
                  id="birth-name"
                  type="text"
                  value={birthName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setBirthName(event.target.value)}
                  placeholder="Enter full name"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-orange-900/10 bg-orange-50/40 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label htmlFor="birth-date" className="mb-2 block text-sm font-bold text-stone-700">
                  Birth Date
                </label>
                <input
                  id="birth-date"
                  type="date"
                  value={birthDate}
                  max={maxBirthDate || undefined}
                  autoComplete="bday"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setBirthDate(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-orange-900/10 bg-orange-50/40 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label htmlFor="birth-time" className="mb-2 block text-sm font-bold text-stone-700">
                  Birth Time
                </label>
                <input
                  id="birth-time"
                  type="time"
                  value={birthTime}
                  autoComplete="off"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setBirthTime(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-orange-900/10 bg-orange-50/40 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label htmlFor="birth-place" className="mb-2 block text-sm font-bold text-stone-700">
                  Birth Place
                </label>
                <select
                  id="birth-place"
                  value={birthPlace}
                  autoComplete="off"
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => setBirthPlace(event.target.value)}
                  className="w-full rounded-2xl border border-orange-900/10 bg-orange-50/40 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  {locations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4 text-xs leading-relaxed text-stone-600">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-orange-600" />
                  <span>
                    {birthLocation.name}, India · {Number(birthLocation.latitude).toFixed(4)}°N · {Number(birthLocation.longitude).toFixed(4)}°E
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-4 text-xs leading-6 text-emerald-900">
                <div className="flex items-center gap-2 font-black">
                  <ShieldCheck size={15} />
                  Calculation basis is visible
                </div>
                <p className="mt-1 text-emerald-800/80">
                  Lahiri sidereal zodiac · mean nodes · whole-sign houses · astronomical calculation.
                </p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-linear-to-r from-orange-600 to-amber-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-900/10 transition hover:-translate-y-0.5 hover:from-orange-700 hover:to-amber-600"
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles size={16} />
                  Generate Premium Kundli
                </span>
              </button>

              {submitted && chartData && (
                <p className="text-center text-[11px] font-bold text-emerald-700">
                  Kundli generated successfully. Full preview is ready below.
                </p>
              )}
            </form>
          </Reveal>

          <Reveal className="rounded-4xl bg-linear-to-br from-[#2a1a10] via-[#1d1511] to-[#3b2214] p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 text-amber-400">
              <GemIcon />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                DharmYatra Astrology
              </span>
            </div>

            <h2 className="mt-3 font-display text-3xl font-semibold">
              Pandit-style Kundli Preview
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">
              Generate the complete report to preview D1 Lagna, D9 Navamsa, planetary placements, houses, Mahadasha and key screening details before downloading the PDF.
            </p>

            {!chartData ? (
              <div className="mt-8 grid min-h-105 place-items-center rounded-3xl border border-white/10 bg-white/5 text-center">
                <div className="max-w-md px-6">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-400/10 ring-1 ring-amber-400/20">
                    <MoonStar size={38} className="text-amber-300" />
                  </div>
                  <p className="mt-5 font-display text-2xl font-semibold">
                    Your complete Janma Kundli
                  </p>
                  <p className="mt-2 text-sm leading-7 text-stone-400">
                    Fill the birth details to generate the main Lagna chart and D9 Navamsa chart with a complete report preview.
                  </p>

                  <div className="mt-6 grid gap-2 sm:grid-cols-3">
                    {["D1 Lagna", "D9 Navamsa", "PDF Report"].map((item) => (
                      <div key={item} className="rounded-xl bg-white/5 px-3 py-2 text-[10px] font-black text-amber-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-300">Lagna</p>
                  <p className="mt-1 font-display text-xl font-semibold">{chartData.chart.ascendant.sign}</p>
                  <p className="text-xs text-stone-300">{chartData.chart.ascendant.signEnglish}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400">Moon Rashi</p>
                  <p className="mt-1 font-display text-xl font-semibold">{chartData.chart.moonSign}</p>
                  <p className="text-xs text-stone-300">{chartData.chart.moonNakshatra}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400">Current Dasha</p>
                  <p className="mt-1 font-display text-xl font-semibold">{chartData.currentMahadasha?.mahadasha?.lord ?? "—"}</p>
                  <p className="text-xs text-stone-300">Vimshottari</p>
                </div>
              </div>
            )}
          </Reveal>
        </div>

        {chartData && (
          <PremiumKundliReport chartData={chartData} />
        )}

        <div className="mt-8">
          <WhatsAppBand
            title="Need a detailed Kundli consultation?"
            sub="Share the generated report with a Pandit or request a personalized consultation through WhatsApp."
            message="Namaste! I have generated my DharmYatra Kundli and would like a detailed consultation."
          />
        </div>
      </div>
    </>
  );
}

function GemIcon() {
  return <Gem size={16} />;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export function PanchangPage() {
  const routerLocation =
    useLocation();

  const pathname =
    routerLocation.pathname;

  const [
    selectedLocation,
    setSelectedLocation,
  ] =
    useState<PanchangLocation>(
      () =>
        getSafeLocation(
          getPersistedLocationId() ??
            DEFAULT_LOCATION.id,
        ),
    );

  let active: PanchangSection =
    "panchang";

  switch (pathname) {
    case "/calendar":
      active =
        "calendar";
      break;

    case "/rashifal":
      active =
        "rashifal";
      break;

    case "/kundli":
      active =
        "kundli";
      break;

    case "/panchang":
    default:
      active =
        "panchang";
      break;
  }

  const handleLocationChange = (
    nextLocation: PanchangLocation,
  ) => {
    if (!isUsableLocation(nextLocation)) {
      console.warn(
        "Ignoring invalid Panchang location selection.",
        nextLocation,
      );
      return;
    }

    setSelectedLocation(nextLocation);
    persistLocation(nextLocation);
  };

  return (
    <PanchangErrorBoundary>
      <main className="min-h-screen bg-[#fffaf5]">
        {active ===
          "panchang" && (
          <PanchangView
            location={
              selectedLocation
            }
            onLocationChange={
              handleLocationChange
            }
          />
        )}

        {active ===
          "calendar" && (
          <CalendarView
            location={
              selectedLocation
            }
            onLocationChange={
              handleLocationChange
            }
          />
        )}

        {active ===
          "rashifal" && (
          <RashifalView
            location={selectedLocation}
          />
        )}

        {active ===
          "kundli" && (
          <KundliView
            location={
              selectedLocation
            }
          />
        )}
      </main>
    </PanchangErrorBoundary>
  );
}

/* =========================================================
   NAMED EXPORTS
========================================================= */

export {
  PanchangView,
  CalendarView,
  RashifalView,
  KundliView,
};

export default PanchangPage;
