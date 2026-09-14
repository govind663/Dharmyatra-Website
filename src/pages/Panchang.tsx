import {
  Component,
  useMemo,
  useState,
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
    error: unknown,
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
    window.location.href = "/";
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

function getSafeLocations(): PanchangLocation[] {
  try {
    const locations = getIndiaLocations();

    if (
      Array.isArray(locations) &&
      locations.length > 0
    ) {
      return locations;
    }
  } catch (error) {
    console.error(
      "getIndiaLocations failed:",
      error,
    );
  }

  return [DEFAULT_LOCATION];
}

function getSafeLocation(
  id: string | null | undefined,
): PanchangLocation {
  const locations = getSafeLocations();

  if (id) {
    try {
      const found = getLocationById(id);

      if (found) {
        return found;
      }
    } catch (error) {
      console.error(
        "getLocationById failed:",
        error,
      );
    }
  }

  return (
    locations.find(
      (item) =>
        item.id === DEFAULT_LOCATION.id,
    ) ??
    locations[0] ??
    DEFAULT_LOCATION
  );
}

function safeComputePanchang(
  date: Date,
  location: PanchangLocation,
) {
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
            ? "bg-[#1c1410] text-white"
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
    location?.id ??
    locations[0]?.id ??
    "";

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur">
      <MapPin
        size={15}
        className="shrink-0"
      />

      <select
        value={selectedId}
        onChange={(event) => {
          const selected =
            getSafeLocation(
              event.target.value,
            );

          onChange(selected);
        }}
        className="max-w-[190px] bg-transparent text-sm font-bold outline-none"
        aria-label="Select city"
      >
        {locations.map(
          (item) => (
            <option
              key={item.id}
              value={item.id}
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

function getLocationLabel(location: PanchangLocation): string {
  return (
    location.name ??
    location.city ??
    "Selected India location"
  );
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
                {moduleLabel} · {regionLabel} · location-aware calculation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-emerald-900">
            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-900/10">
              Lahiri Sidereal
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-900/10">
              Astronomy calculation
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-900/10">
              {trust.regionalNote.split(".")[0]}
            </span>
          </div>
        </div>

        <p className="mt-2 text-[10px] leading-5 text-stone-500">
          <strong className="text-stone-700">Why your location matters:</strong>{" "}
          {trust.calculation} Regional and Sampradaya rules may differ, so DharmYatra keeps the calculation basis visible instead of presenting one tradition as universal.
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
   DATE HELPERS
========================================================= */

function parseISODate(
  value: string | null,
): Date | null {
  if (!value) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value,
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const date = new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
    0,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return date;
}

function formatDateForQuery(
  date: Date,
): string {
  return [
    String(
      date.getFullYear(),
    ).padStart(4, "0"),
    String(
      date.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      date.getDate(),
    ).padStart(2, "0"),
  ].join("-");
}

function getDateFromQuery(
  value: string | null,
): Date {
  const parsed =
    parseISODate(value);

  if (parsed) {
    return parsed;
  }

  const today =
    new Date();

  today.setHours(
    12,
    0,
    0,
    0,
  );

  return today;
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
        ),
      [queryDate],
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

            <span className="min-w-[220px] text-center text-sm font-bold">
              {p.displayDate}
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
                  key={festival}
                  className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-[13px] font-bold text-white shadow"
                >
                  {festival}
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
              {p.vara}
            </p>

            <p className="text-sm text-stone-500">
              Lord:{" "}
              {p.varaLord}
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
              {p.tithi.ends}
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        p.tithi.pct ??
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
              {p.yoga.ends}
            </p>

            <p className="text-xs text-stone-400">
              Karana ends ~{" "}
              {p.karana.ends}
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
              {p.sunrise}
            </p>

            <p className="text-[15px] font-bold text-[#2a1a10]">
              Sunset{" "}
              {p.sunset}
            </p>

            <p className="mt-1 text-sm text-stone-500">
              Moonrise ~{" "}
              {p.moonrise}
            </p>

            <p className="text-sm text-stone-500">
              Moonset ~{" "}
              {p.moonset}
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
              {p.abhijit.start}{" "}
              –{" "}
              {p.abhijit.end}
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
              {p.rahukaal.start}{" "}
              –{" "}
              {p.rahukaal.end}
            </p>

            <p className="mt-2 text-sm text-stone-500">
              Yamaganda{" "}
              {p.yamaganda.start}{" "}
              –{" "}
              {p.yamaganda.end}
            </p>

            <p className="text-sm text-stone-500">
              Gulika{" "}
              {p.gulika.start}{" "}
              –{" "}
              {p.gulika.end}
            </p>
          </Card>

          <Card
            title="Day Choghadiya"
            icon={
              <Clock size={14} />
            }
          >
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {p.choghadiya.day.map(
                (
                  item,
                  index,
                ) => (
                  <div
                    key={`${item.name}-${index}`}
                    className={`rounded-xl px-2 py-2 ${
                      item.nature ===
                        "Shubh" ||
                      item.nature ===
                        "Labh" ||
                      item.nature ===
                        "Amrit" ||
                      item.nature ===
                        "Chal"
                        ? "bg-emerald-50 text-emerald-900"
                        : "bg-red-50 text-red-900"
                    }`}
                  >
                    <p className="text-[11px] font-bold">
                      {item.name}
                    </p>

                    <p className="text-[10px] opacity-70">
                      {item.start}
                    </p>

                    <p className="text-[10px] opacity-60">
                      {item.end}
                    </p>
                  </div>
                ),
              )}
            </div>

            <p className="mt-2 text-xs text-stone-500">
              {
                p.choghadiya
                  .note
              }
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
                {p.shubh.map(
                  (
                    item,
                    index,
                  ) => (
                    <p
                      key={`${item}-${index}`}
                      className="text-xs leading-relaxed text-emerald-700"
                    >
                      {item}
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
                {p.avoid.map(
                  (
                    item,
                    index,
                  ) => (
                    <p
                      key={`${item}-${index}`}
                      className="text-xs leading-relaxed text-red-700"
                    >
                      {item}
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
  const firstDay =
    new Date(
      year,
      month,
      1,
      12,
      0,
      0,
      0,
    );

  const firstWeekday =
    firstDay.getDay();

  const gridStart =
    new Date(
      year,
      month,
      1 - firstWeekday,
      12,
      0,
      0,
      0,
    );

  const today =
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
          paksha:
            p?.tithi?.paksha ??
            "Shukla",
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
        "Festival data temporarily unavailable. Basic Panchang calendar is shown.",
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

  const initialDate =
    useMemo(
      () => new Date(),
      [],
    );

  const [
    calendarYear,
    setCalendarYear,
  ] = useState(
    initialDate.getFullYear(),
  );

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState(
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
        (current) =>
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
    const current =
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
          <div className="min-w-[760px]">
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
                      className={`min-h-[105px] rounded-2xl border p-1.5 text-left transition md:min-h-[140px] md:p-2 ${
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

  const rashifalMap =
    useMemo(() => {
      try {
        const results =
          getDailyRashifalBySign(
            new Date(),
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
    }, []);

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

        <div className="mt-8 rounded-3xl bg-[#1c1410] p-6 text-white">
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

            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-amber-300">
              Daily Guidance
            </span>
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
              {active?.overallRating ??
                0}
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
      "Basic Kundli — Birth Chart & Vedic Astrology | DharmYatra",

    description:
      "Basic Kundli interface for birth date, time and place with location-aware sidereal calculations.",

    path: "/kundli",
  });

  const locations =
    useMemo(
      () => getSafeLocations(),
      [],
    );

  const defaultBirthLocation =
    useMemo(
      () => {
        if (
          location?.id
        ) {
          const found =
            locations.find(
              (item) =>
                item.id ===
                location.id,
            );

          if (found) {
            return found;
          }
        }

        return (
          locations[0] ??
          DEFAULT_LOCATION
        );
      },
      [
        location,
        locations,
      ],
    );

  const [
    birthDate,
    setBirthDate,
  ] = useState("");

  const [
    birthTime,
    setBirthTime,
  ] = useState("");

  const [
    birthPlace,
    setBirthPlace,
  ] = useState(
    defaultBirthLocation.id ??
      "",
  );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    chartData,
    setChartData,
  ] =
    useState<KundliChartData | null>(
      null,
    );

  const birthLocation =
    getSafeLocation(
      birthPlace,
    );

  const submit = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setError("");
    setSubmitted(false);
    setChartData(null);

    const details = {
      name: "Guest",
      date: birthDate,
      time: birthTime,
      location:
        birthLocation,
    };

    try {
      const validationErrors =
        validateBirthDetails(
          details,
        );

      if (
        validationErrors.length >
        0
      ) {
        setError(
          validationErrors.join(
            " ",
          ),
        );

        return;
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Birth details validation failed.",
      );

      return;
    }

    try {
      const result =
        buildKundli({
          name: "Guest",
          birthDate,
          birthTime,
          location:
            birthLocation,
        });

      if (!result) {
        throw new Error(
          "Kundli engine returned empty data.",
        );
      }

      setChartData(
        result,
      );

      setSubmitted(
        true,
      );
    } catch (
      caughtError
    ) {
      console.error(
        "buildKundli failed:",
        caughtError,
      );

      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Unable to generate Kundli.",
      );
    }
  };

  const lagna =
    chartData?.chart
      ?.ascendant;

  const moon =
    chartData?.chart
      ?.planets?.Moon;

  const sun =
    chartData?.chart
      ?.planets?.Sun;

  return (
    <>
      <PageHero
        eyebrow="Kundli · Janma Chart"
        title="Basic Kundli"
        sub="Enter birth details to prepare a location-aware basic Vedic astrology profile."
        image="/images/aarti-night.jpeg"
      />

      <PanchangTabs
        active="kundli"
      />

      <PersonalizationTrustBar
        location={location}
        active="kundli"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Kundli",
            },
          ]}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal className="rounded-3xl border border-orange-900/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                <UserRound
                  size={21}
                />
              </div>

              <div>
                <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">
                  Birth Details
                </h2>

                <p className="text-sm text-stone-500">
                  Exact birth date,
                  time and place
                  are required for
                  the basic chart.
                </p>
              </div>
            </div>

            <form
              onSubmit={submit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="birth-date"
                  className="mb-2 block text-sm font-bold text-stone-700"
                >
                  Birth Date
                </label>

                <input
                  id="birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(
                    event,
                  ) =>
                    setBirthDate(
                      event.target
                        .value,
                    )
                  }
                  required
                  className="w-full rounded-2xl border border-orange-900/10 bg-orange-50/40 px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="birth-time"
                  className="mb-2 block text-sm font-bold text-stone-700"
                >
                  Birth Time
                </label>

                <input
                  id="birth-time"
                  type="time"
                  value={birthTime}
                  onChange={(
                    event,
                  ) =>
                    setBirthTime(
                      event.target
                        .value,
                    )
                  }
                  required
                  className="w-full rounded-2xl border border-orange-900/10 bg-orange-50/40 px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="birth-place"
                  className="mb-2 block text-sm font-bold text-stone-700"
                >
                  Birth Place
                </label>

                <select
                  id="birth-place"
                  value={
                    birthPlace
                  }
                  onChange={(
                    event,
                  ) =>
                    setBirthPlace(
                      event.target
                        .value,
                    )
                  }
                  className="w-full rounded-2xl border border-orange-900/10 bg-orange-50/40 px-4 py-3 text-sm outline-none focus:border-orange-500"
                >
                  {locations.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {
                          item.name
                        }{" "}
                        —{" "}
                        {
                          item.region
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4 text-xs leading-relaxed text-stone-600">
                <div className="flex items-start gap-2">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0 text-orange-600"
                  />

                  <span>
                    {
                      birthLocation.name
                    }
                    , India ·{" "}
                    {Number(
                      birthLocation.latitude,
                    ).toFixed(4)}
                    °N ·{" "}
                    {Number(
                      birthLocation.longitude,
                    ).toFixed(4)}
                    °E
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {error}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white shadow transition hover:bg-orange-700"
              >
                Generate Basic Kundli
              </button>
            </form>
          </Reveal>

          <Reveal className="rounded-3xl bg-[#1c1410] p-6 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Basic Birth Chart
            </p>

            {!submitted ||
            !chartData ? (
              <div className="mt-8">
                <div className="grid min-h-[320px] place-items-center rounded-3xl border border-white/10 bg-white/5 text-center">
                  <div className="px-6">
                    <MoonStar
                      size={38}
                      className="mx-auto text-amber-300"
                    />

                    <p className="mt-4 font-display text-xl font-semibold">
                      Your Kundli
                    </p>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-stone-400">
                      Enter birth date,
                      time and place to
                      generate basic
                      Lagna, Moon sign,
                      planets and
                      Dasha information.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-5">
                    <p className="text-xs text-stone-400">
                      Birth Date
                    </p>

                    <p className="mt-1 font-bold">
                      {birthDate}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-5">
                    <p className="text-xs text-stone-400">
                      Birth Time
                    </p>

                    <p className="mt-1 font-bold">
                      {birthTime}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-xs text-stone-400">
                    Birth Place
                  </p>

                  <p className="mt-1 font-bold">
                    {
                      birthLocation.name
                    }
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
                    <p className="text-xs text-amber-300">
                      Lagna
                    </p>

                    <p className="mt-1 font-display text-2xl font-semibold">
                      {
                        lagna?.sign ??
                        "--"
                      }
                    </p>

                    <p className="text-sm text-stone-300">
                      {
                        lagna?.signEnglish ??
                        "--"
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs text-stone-400">
                      Moon Sign
                    </p>

                    <p className="mt-1 font-display text-2xl font-semibold">
                      {
                        moon?.sign ??
                        "--"
                      }
                    </p>

                    <p className="text-sm text-stone-300">
                      {
                        moon?.signEnglish ??
                        "--"
                      }
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-stone-400">
                        Moon Nakshatra
                      </p>

                      <p className="mt-1 font-bold">
                        {
                          moon?.nakshatra ??
                          "--"
                        }
                      </p>
                    </div>

                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-300">
                      Pada{" "}
                      {
                        moon?.pada ??
                        "--"
                      }
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs text-stone-400">
                    Sun Sign
                  </p>

                  <p className="mt-1 font-bold">
                    {sun?.sign ??
                      "--"}{" "}
                    ·{" "}
                    {
                      sun?.signEnglish ??
                      "--"
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs text-stone-400">
                    Ayanamsha
                  </p>

                  <p className="mt-1 font-bold">
                    {Number(
                      chartData.chart
                        ?.ayanamsha ??
                        0,
                    ).toFixed(4)}
                    °
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs text-stone-400">
                    Manglik Screening
                  </p>

                  <p className="mt-1 font-bold">
                    {chartData.manglik
                      ?.isManglik
                      ? "Possible Manglik indication"
                      : "No simplified Manglik indication"}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-stone-400">
                    {
                      chartData
                        .manglik
                        ?.reason
                    }
                  </p>
                </div>
              </div>
            )}
          </Reveal>
        </div>

        {chartData && (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card
              title="Planets"
              icon={
                <Sparkles
                  size={14}
                />
              }
            >
              <div className="space-y-2">
                {(
                  chartData.planets ??
                  []
                ).map(
                  (
                    planet,
                  ) => (
                    <div
                      key={
                        planet.planet
                      }
                      className="flex items-center justify-between gap-3 rounded-xl bg-orange-50 px-3 py-2"
                    >
                      <span className="text-xs font-bold text-stone-700">
                        {
                          planet.planet
                        }
                      </span>

                      <span className="text-xs text-stone-500">
                        {
                          planet.sign
                        }{" "}
                        · H{" "}
                        {
                          planet.house
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>
            </Card>

            <Card
              title="Houses"
              icon={
                <Home size={14} />
              }
            >
              <div className="space-y-2">
                {(
                  chartData.houses ??
                  []
                ).map(
                  (
                    house,
                  ) => (
                    <div
                      key={
                        house.house
                      }
                      className="rounded-xl bg-orange-50 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-stone-700">
                          {
                            house.houseLabel
                          }
                        </span>

                        <span className="text-xs text-stone-500">
                          {
                            house.sign
                          }
                        </span>
                      </div>

                      {house.occupants
                        ?.length >
                        0 && (
                        <p className="mt-1 text-[11px] text-stone-500">
                          Planets:{" "}
                          {house.occupants.join(
                            ", ",
                          )}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </Card>

            <Card
              title="Mahadasha"
              icon={
                <Clock size={14} />
              }
            >
              <div className="space-y-2">
                {(
                  chartData.mahadashas ??
                  []
                )
                  .slice(0, 5)
                  .map(
                    (
                      period,
                    ) => (
                      <div
                        key={`${period.lord}-${period.start.toISOString()}`}
                        className="rounded-xl bg-orange-50 px-3 py-2"
                      >
                        <p className="text-xs font-bold text-stone-700">
                          {
                            period.lord
                          }
                        </p>

                        <p className="mt-1 text-[11px] text-stone-500">
                          {period.start.toLocaleDateString(
                            "en-IN",
                          )}{" "}
                          →{" "}
                          {period.end.toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                    ),
                  )}
              </div>
            </Card>
          </div>
        )}

        <Reveal className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-stone-600">
          <strong className="text-[#3a2415]">
            Kundli accuracy:
          </strong>{" "}
          जन्म समय और स्थान में छोटी त्रुटि भी
          Lagna, houses और divisional calculations
          को प्रभावित कर सकती है। Current
          implementation basic sidereal chart
          engine पर आधारित है।
        </Reveal>

        <div className="mt-8">
          <WhatsAppBand
            title="Need a detailed Kundli consultation?"
            sub="Share your birth details for a personalized astrology consultation."
            message="Namaste! I would like to discuss a detailed Kundli consultation."
          />
        </div>
      </div>
    </>
  );
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