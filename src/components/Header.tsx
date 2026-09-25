/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Compass,
  Crown,
  Flame,
  Heart,
  Image as ImageIcon,
  Images,
  Landmark,
  MapPinned,
  Menu,
  MessageCircle,
  MoonStar,
  Package,
  PlayCircle,
  Search,
  Sparkles,
  User,
  WandSparkles,
  X,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { waLink, cx } from "../lib/utils";

import {
  TEMPLES,
  SERVICES,
  PLACES,
  PACKAGES,
} from "../data/content";

/* =========================================================
   NAVIGATION TYPES
========================================================= */

type HeaderChild = {
  label: string;
  href: string;
  desc?: string;
};

type HeaderLink = {
  label: string;
  href: string;
  children?: HeaderChild[];
};

/* =========================================================
   PRIMARY NAVIGATION
========================================================= */

const LINKS: HeaderLink[] = [
  { label: "Home", href: "/" },
  {
    label: "Dharma",
    href: "/temples",
    children: [
      { label: "Temples", href: "/temples", desc: "Discover temples, darshan, aarti & sacred places" },
      { label: "Puja Services", href: "/services", desc: "Book puja, seva and traditional ceremonies" },
      { label: "Pandits", href: "/pandits", desc: "Find pandits for puja & spiritual guidance" },
      { label: "Ashrams", href: "/ashrams", desc: "Explore spiritual ashrams and learning spaces" },
    ],
  },
  {
    label: "Panchang",
    href: "/panchang",
    children: [
      { label: "Today's Panchang", href: "/panchang", desc: "Tithi, Nakshatra, Yoga, Rahukaal & Muhurat" },
      { label: "Festival Calendar", href: "/calendar", desc: "Festivals, Ekadashi, Purnima, Amavasya & vrat" },
      { label: "Today's Rashifal", href: "/rashifal", desc: "Personal daily guidance for all 12 Rashis" },
      { label: "Kundli", href: "/kundli", desc: "Birth chart, Lagna, planets, houses & Dasha" },
      { label: "Gochar", href: "/gochar", desc: "Planetary transits and their influence" },
    ],
  },
  {
    label: "Yatra",
    href: "/packages",
    children: [
      { label: "Yatra Packages", href: "/packages", desc: "Plan spiritual journeys across Bharat" },
      { label: "Spiritual Places", href: "/spiritual-places", desc: "Jyotirlingas, Char Dham, sacred cities & dham" },
      { label: "Events", href: "/events", desc: "Spiritual festivals, yatras & special events" },
      { label: "Gallery", href: "/gallery", desc: "Temples, aarti, festivals & yatra moments" },
      { label: "Videos", href: "/videos", desc: "Darshan, katha, aarti & spiritual travel videos" },
    ],
  },
  {
    label: "Learn",
    href: "/courses",
    children: [
      { label: "Courses", href: "/courses", desc: "Learn spiritual and traditional subjects" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/* =========================================================
   PANCHANG PATHS
========================================================= */

const PANCHANG_PATHS = [
  "/panchang",
  "/calendar",
  "/rashifal",
  "/kundli",
  "/gochar",
];

/* =========================================================
   YATRA PATHS
========================================================= */

const YATRA_PATHS = [
  "/packages",
  "/spiritual-places",
  "/events",
  "/gallery",
  "/videos",
];

const DHARMA_PATHS = [
  "/temples",
  "/services",
  "/pandits",
  "/ashrams",
];

const LEARN_PATHS = [
  "/courses",
];

/* =========================================================
   CHILD ICONS
========================================================= */

function PanchangChildIcon({ href }: { href: string }) {
  if (href === "/panchang" || href === "/calendar") return <CalendarDays size={16} />;
  if (href === "/rashifal") return <Sparkles size={16} />;
  if (href === "/kundli") return <MoonStar size={16} />;
  if (href === "/gochar") return <WandSparkles size={16} />;
  return <CalendarDays size={16} />;
}

function YatraChildIcon({ href }: { href: string }) {
  if (href === "/packages") return <Package size={16} />;
  if (href === "/spiritual-places") return <Landmark size={16} />;
  if (href === "/events") return <Bell size={16} />;
  if (href === "/gallery") return <Images size={16} />;
  if (href === "/videos") return <PlayCircle size={16} />;
  return <Compass size={16} />;
}

function DharmaChildIcon({ href }: { href: string }) {
  if (href === "/temples") return <Landmark size={16} />;
  if (href === "/services") return <Sparkles size={16} />;
  if (href === "/pandits") return <Crown size={16} />;
  if (href === "/ashrams") return <Compass size={16} />;
  return <Compass size={16} />;
}

function LearnChildIcon() {
  return <BookOpen size={16} />;
}

/* =========================================================
   MOBILE CHILD ICON
========================================================= */

function MobileChildIcon({
  parent,
  href,
}: {
  parent?: string;
  href: string;
}) {
  if (parent === "Panchang") {
    return <span className="text-orange-500"><PanchangChildIcon href={href} /></span>;
  }
  if (parent === "Yatra") {
    return <span className="text-orange-500"><YatraChildIcon href={href} /></span>;
  }
  if (parent === "Dharma") {
    return <span className="text-orange-500"><DharmaChildIcon href={href} /></span>;
  }
  if (parent === "Learn") {
    return <span className="text-orange-500"><LearnChildIcon /></span>;
  }
  return null;
}

/* =========================================================
   HEADER
========================================================= */



export default function Header() {
  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const [
    mobile,
    setMobile,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    q,
    setQ,
  ] = useState("");

  const { user } =
    useApp();

  const loc =
    useLocation();

  const nav =
    useNavigate();

  /* =======================================================
     SCROLL STATE
  ======================================================= */

  useEffect(() => {
    const handleScroll =
      () => {
        setScrolled(
          window.scrollY > 24,
        );
      };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  /* =======================================================
     CLOSE OVERLAYS ON ROUTE CHANGE
  ======================================================= */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobile(false);
    setSearchOpen(false);
    setQ("");
  }, [loc.pathname]);

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      mobile
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobile]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setMobile(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* =======================================================
     ACTIVE NAV HELPERS
  ======================================================= */

  const isPanchangActive =
    PANCHANG_PATHS.includes(
      loc.pathname,
    );

  const isYatraActive =
    YATRA_PATHS.some(
      (path) =>
        loc.pathname === path ||
        loc.pathname.startsWith(`${path}/`),
    );

  const isDharmaActive =
    DHARMA_PATHS.some(
      (path) =>
        loc.pathname === path ||
        loc.pathname.startsWith(`${path}/`),
    );

  const isLearnActive =
    LEARN_PATHS.some(
      (path) =>
        loc.pathname === path ||
        loc.pathname.startsWith(`${path}/`),
    );

  const isPathActive = (
    href: string,
  ) => {
    if (href === "/") {
      return (
        loc.pathname ===
        "/"
      );
    }

    return (
      loc.pathname ===
        href ||
      loc.pathname.startsWith(
        `${href}/`,
      )
    );
  };

  /* =======================================================
     SEARCH RESULTS
  ======================================================= */

  const results = useMemo(() => {
    const searchTerm =
      q.trim().toLowerCase();

    if (
      searchTerm.length <
      2
    ) {
      return [];
    }

    const searchResults: {
      label: string;
      sub: string;
      href: string;
      type: string;
    }[] = [];

    /* -----------------------------------------------
       Temples
    ------------------------------------------------ */

    TEMPLES.filter(
      (temple) =>
        (
          temple.name +
          temple.city +
          temple.state
        )
          .toLowerCase()
          .includes(
            searchTerm,
          ),
    )
      .slice(0, 3)
      .forEach(
        (temple) => {
          searchResults.push({
            label:
              temple.name,
            sub: `${temple.city}, ${temple.state}`,
            href: `/temples/${temple.slug}`,
            type: "Temple",
          });
        },
      );

    /* -----------------------------------------------
       Services
    ------------------------------------------------ */

    SERVICES.filter(
      (service) =>
        (
          service.name +
          service.category
        )
          .toLowerCase()
          .includes(
            searchTerm,
          ),
    )
      .slice(0, 3)
      .forEach(
        (service) => {
          searchResults.push({
            label:
              service.name,
            sub:
              service.category,
            href: `/services/${service.slug}`,
            type:
              "Puja Service",
          });
        },
      );

    /* -----------------------------------------------
       Spiritual Places
    ------------------------------------------------ */

    PLACES.filter(
      (place) =>
        (
          place.name +
          place.state
        )
          .toLowerCase()
          .includes(
            searchTerm,
          ),
    )
      .slice(0, 2)
      .forEach(
        (place) => {
          searchResults.push({
            label:
              place.name,
            sub:
              place.type,
            href: `/spiritual-places/${place.slug}`,
            type:
              "Spiritual Place",
          });
        },
      );

    /* -----------------------------------------------
       Packages
    ------------------------------------------------ */

    PACKAGES.filter(
      (item) =>
        (
          item.name +
          item.destination
        )
          .toLowerCase()
          .includes(
            searchTerm,
          ),
    )
      .slice(0, 2)
      .forEach(
        (item) => {
          searchResults.push({
            label:
              item.name,
            sub:
              item.duration,
            href: `/packages/${item.slug}`,
            type: "Yatra",
          });
        },
      );

    /* -----------------------------------------------
       Static Panchang Search
    ------------------------------------------------ */

    const staticPanchang =
      [
        {
          label:
            "Today's Panchang",
          sub:
            "Tithi, Nakshatra, Rahukaal & Muhurat",
          href: "/panchang",
          keywords:
            "panchang tithi nakshatra rahukaal muhurat",
          type: "Panchang",
        },
        {
          label:
            "Festival Calendar",
          sub:
            "Ekadashi, Purnima, Amavasya & festivals",
          href: "/calendar",
          keywords:
            "calendar festival ekadashi purnima amavasya vrat",
          type:
            "Calendar",
        },
        {
          label:
            "Today's Rashifal",
          sub:
            "Daily guidance for all 12 Rashis",
          href: "/rashifal",
          keywords:
            "rashifal rashi horoscope mesh vrishabh mithun astrology",
          type:
            "Rashifal",
        },
        {
          label: "Kundli",
          sub: "Birth chart, Lagna, planets, houses & Dasha",
          href: "/kundli",
          keywords: "kundli janam kundli birth chart lagna astrology dasha",
          type: "Kundli",
        },
        {
          label: "Gochar",
          sub: "Planetary transits and their influence",
          href: "/gochar",
          keywords: "gochar transit graha planet shani guru rahu ketu astrology",
          type: "Gochar",
        },
        {
          label: "Temples",
          sub: "Temples, darshan, aarti and sacred places",
          href: "/temples",
          keywords: "temple mandir darshan aarti puja",
          type: "Temple",
        },
        {
          label: "Puja Services",
          sub: "Book puja, seva and traditional ceremonies",
          href: "/services",
          keywords: "puja seva pandit griha puja bhumi puja vivah",
          type: "Puja Service",
        },
        {
          label: "Pandits",
          sub: "Find pandits for puja and spiritual guidance",
          href: "/pandits",
          keywords: "pandit priest purohit puja",
          type: "Pandit",
        },
        {
          label: "Ashrams",
          sub: "Spiritual ashrams and learning spaces",
          href: "/ashrams",
          keywords: "ashram spiritual meditation guru",
          type: "Ashram",
        },
        {
          label: "Events",
          sub: "Spiritual festivals, yatras and special events",
          href: "/events",
          keywords: "events utsav festival yatra spiritual",
          type: "Event",
        },
        {
          label: "Courses",
          sub: "Spiritual and traditional learning",
          href: "/courses",
          keywords: "course learning vedic spiritual astrology",
          type: "Course",
        },
      ];

    staticPanchang
      .filter(
        (item) =>
          (
            item.label +
            item.sub +
            item.keywords
          )
            .toLowerCase()
            .includes(
              searchTerm,
            ),
      )
      .forEach(
        (item) => {
          searchResults.push({
            label:
              item.label,
            sub:
              item.sub,
            href:
              item.href,
            type:
              item.type,
          });
        },
      );

    return searchResults;
  }, [q]);

  /* =======================================================
     OPEN SEARCH
  ======================================================= */

  const openSearch = () => {
    setMobile(false);
    setSearchOpen(true);
  };

  /* =======================================================
     NAVIGATE SEARCH RESULT
  ======================================================= */

  const openSearchResult = (
    href: string,
  ) => {
    setSearchOpen(false);
    setQ("");
    nav(href);
  };

  /* =======================================================
     MOBILE NAV DATA
  ======================================================= */

  const mobileLinks =
    useMemo(() => {
      const items: {
        label: string;
        href: string;
        parent?: string;
      }[] = [];

      LINKS.forEach(
        (link) => {
          items.push({
            label:
              link.label,
            href:
              link.href,
          });

          if (
            link.children
          ) {
            link.children.forEach(
              (child) => {
                items.push({
                  label:
                    child.label,
                  href:
                    child.href,
                  parent:
                    link.label,
                });
              },
            );
          }
        },
      );

      const seen =
        new Set<string>();

      return items.filter(
        (item) => {
          const key =
            item.href;

          if (
            seen.has(
              key,
            )
          ) {
            return false;
          }

          seen.add(
            key,
          );

          return true;
        },
      );
    }, []);

  return (
    <>
      {/* ===================================================
          TOP SACRED STRIP
      ==================================================== */}

      <div className="bg-linear-to-r from-saffron-900 via-saffron-700 to-saffron-900 text-center text-[12px] font-medium tracking-wide text-amber-100">
        <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5">
          <Flame
            size={13}
            className="diya-glow shrink-0 text-amber-300"
          />

          <span className="font-sanskrit text-[13px]">
            ॥ सर्वे भवन्तु सुखिनः ॥
          </span>

          <span className="hidden text-amber-200/90 sm:inline">
            — Dev Deepawali boats &
            Mahashivratri sevas now
            open for booking
          </span>
        </p>
      </div>

      {/* ===================================================
          HEADER
      ==================================================== */}

      <header
        className={cx(
          "sticky top-0 z-50 transition-all duration-300",

          scrolled
            ? "glass-warm border-b border-orange-900/10 shadow-[0_10px_40px_-15px_rgba(154,52,18,0.4)]"
            : "border-b border-orange-900/5 bg-cream-50/95",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 md:px-6 lg:px-8">
          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            className="group flex items-center gap-2.5"
            aria-label="DharmYatra home"
          >
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-orange-600 via-orange-700 to-saffron-900 shadow-lg shadow-orange-600/30 transition group-hover:scale-105">
              <span className="font-sanskrit text-2xl leading-none text-amber-100">
                ॐ
              </span>

              <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-300/40" />
            </span>

            <span className="leading-tight">
              <span className="font-display block text-[20px] text-xl font-bold tracking-tight text-[#2a1a10]">
                दिव्य &nbsp;
                <span className="text-gradient-saffron">
                  धारा
                </span>
              </span>

              <span className="block text-[12px] font-semibold uppercase  text-orange-700/80">
                पवित्र भारत यात्रा
              </span>
            </span>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <nav
            className="hidden items-center gap-0.5 xl:flex"
            aria-label="Primary navigation"
          >
            {LINKS.map(
              (link) => {
                const dropdownActive =
                  Boolean(
                    link.children?.some(
                      (
                        child,
                      ) =>
                        loc.pathname ===
                          child.href ||
                        loc.pathname.startsWith(
                          `${child.href}/`,
                        ),
                    ),
                  );

                const active =
                  link.label ===
                  "Panchang"
                    ? isPanchangActive
                    : link.label ===
                      "Yatra"
                      ? isYatraActive
                      : isPathActive(
                          link.href,
                        );

                return (
                  <div
                    key={
                      link.label
                    }
                    className="group relative"
                  >
                    <NavLink
                      to={
                        link.href
                      }
                      className={() =>
                        cx(
                          "flex items-center gap-1 rounded-full px-3 py-2 text-[13.5px] font-semibold transition",

                          active ||
                            dropdownActive
                            ? "bg-orange-100 text-orange-900"
                            : "text-stone-700 hover:bg-orange-50 hover:text-orange-900",
                        )
                      }
                    >
                      {link.label}

                      {link.children && (
                        <ChevronDown
                          size={13}
                          className="opacity-60 transition group-hover:rotate-180"
                        />
                      )}
                    </NavLink>

                    {link.children && (
                      <div className="invisible absolute left-0 top-full w-80 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        <div className="overflow-hidden rounded-2xl border border-orange-900/10 bg-white p-2 shadow-2xl shadow-orange-900/15">
                          {link.children.map(
                            (
                              child,
                            ) => {
                              const childActive =
                                loc.pathname ===
                                  child.href ||
                                loc.pathname.startsWith(
                                  `${child.href}/`,
                                );

                              const isPanchangChild =
                                link.label ===
                                "Panchang";

                              const isYatraChild =
                                link.label === "Yatra";

                              const isDharmaChild =
                                link.label === "Dharma";

                              const isLearnChild =
                                link.label === "Learn";

                              return (
                                <Link
                                  key={
                                    child.href
                                  }
                                  to={
                                    child.href
                                  }
                                  className={cx(
                                    "block rounded-xl px-4 py-3 transition",

                                    childActive
                                      ? "bg-orange-50"
                                      : "hover:bg-orange-50",
                                  )}
                                >
                                  <div className="flex items-start gap-3">                                    {(isPanchangChild ||
                                      isYatraChild ||
                                      isDharmaChild ||
                                      isLearnChild) && (
                                      <span
                                        className={cx(
                                          "mt-0.5 shrink-0",
                                          childActive
                                            ? "text-orange-700"
                                            : "text-orange-500",
                                        )}
                                      >
                                        {isPanchangChild ? (
                                          <PanchangChildIcon href={child.href} />
                                        ) : isYatraChild ? (
                                          <YatraChildIcon href={child.href} />
                                        ) : isDharmaChild ? (
                                          <DharmaChildIcon href={child.href} />
                                        ) : (
                                          <LearnChildIcon />
                                        )}
                                      </span>
                                    )}

                                    <span className="min-w-0">
                                      <span
                                        className={cx(
                                          "block text-sm font-bold",

                                          childActive
                                            ? "text-orange-800"
                                            : "text-stone-800",
                                        )}
                                      >
                                        {
                                          child.label
                                        }
                                      </span>

                                      {child.desc && (
                                        <span className="mt-0.5 block text-xs text-stone-500">
                                          {
                                            child.desc
                                          }
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </Link>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </nav>

          {/* =================================================
              HEADER ACTIONS
          ================================================== */}

          <div className="flex items-center gap-2">
            {/* Search */}

            <button
              type="button"
              onClick={
                openSearch
              }
              aria-label="Search temples, puja, yatras, panchang, astrology"
              className="grid h-10 w-10 place-items-center rounded-full border border-orange-900/15 bg-white text-stone-700 transition hover:border-orange-500 hover:text-orange-700"
            >
              <Search
                size={17}
              />
            </button>

            {/* WhatsApp */}

            <a
              href={waLink(
                "Namaste DharmYatra! I need guidance for darshan / puja / yatra.",
              )}
              target="_blank"
              rel="noreferrer"
              className="btn-saffron hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-bold text-white sm:inline-flex"
            >
              <MessageCircle
                size={15}
              />
              WhatsApp
            </a>

            {/* Login / Dashboard */}

            <Link
              to={
                user
                  ? "/dashboard"
                  : "/login"
              }
              className="hidden items-center gap-1.5 rounded-full border border-orange-700/25 bg-orange-50 px-4 py-2.5 text-[13px] font-bold text-orange-900 transition hover:bg-orange-100 sm:inline-flex"
            >
              {user ? (
                <Heart
                  size={15}
                />
              ) : (
                <User
                  size={15}
                />
              )}

              {user
                ? user.name.split(
                    " ",
                  )[0]
                : "Login"}
            </Link>

            {/* Mobile button */}

            <button
              type="button"
              onClick={() =>
                setMobile(
                  true,
                )
              }
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-[#2a1a10] text-amber-100 xl:hidden"
            >
              <Menu
                size={18}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================
          MOBILE DRAWER
      ==================================================== */}

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm xl:hidden"
            onClick={() =>
              setMobile(false)
            }
          >
            <motion.aside
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 260,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col overflow-hidden bg-cream-50 shadow-2xl"
            >
              {/* Mobile header */}

              <div className="relative overflow-hidden bg-linear-to-br from-saffron-900 via-saffron-700 to-orange-600 px-6 pb-8 pt-6 text-white">
                <div className="mandala-bg absolute inset-0 opacity-20" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="font-sanskrit text-3xl text-amber-200">
                      ॐ
                    </p>

                    <p className="mt-1 font-display text-2xl font-bold">
                      DharmYatra
                    </p>

                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/90">
                      Sacred Bharat Yatra
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMobile(
                        false,
                      )
                    }
                    aria-label="Close menu"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/15"
                  >
                    <X
                      size={18}
                    />
                  </button>
                </div>
              </div>

              {/* Mobile nav */}

              <nav
                className="flex-1 overflow-y-auto px-4 py-4"
                aria-label="Mobile navigation"
              >
                {mobileLinks.map(
                  (item) => {
                    let active =
                      false;

                    if (
                      item.parent ===
                      "Panchang"
                    ) {
                      active =
                        isPanchangActive &&
                        item.href ===
                          loc.pathname;
                    } else if (
                      item.parent === "Yatra" ||
                      item.parent === "Dharma" ||
                      item.parent === "Learn"
                    ) {
                      active =
                        item.href === loc.pathname ||
                        loc.pathname.startsWith(`${item.href}/`);
                    } else if (
                      item.href === "/"
                    ) {
                      active =
                        loc.pathname ===
                        "/";
                    } else {
                      active =
                        loc.pathname ===
                          item.href ||
                        loc.pathname.startsWith(
                          `${item.href}/`,
                        );
                    }

                    return (
                      <NavLink
                        key={`${item.href}-${item.label}`}
                        to={
                          item.href
                        }
                        onClick={() =>
                          setMobile(
                            false,
                          )
                        }
                        className={() =>
                          cx(
                            "mb-1 flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold transition",

                            active
                              ? "bg-orange-100 text-orange-900"
                              : "text-stone-700 hover:bg-orange-50",
                          )
                        }
                      >
                        <span className="flex items-center gap-2.5">
                          <MobileChildIcon
                            parent={
                              item.parent
                            }
                            href={
                              item.href
                            }
                          />

                          {item.label}
                        </span>

                        <span className="text-orange-400">
                          →
                        </span>
                      </NavLink>
                    );
                  },
                )}
              </nav>

              {/* Mobile actions */}

              <div className="space-y-2 border-t border-orange-900/10 p-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobile(
                      false,
                    );

                    setSearchOpen(
                      true,
                    );
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-900/15 bg-white px-4 py-3.5 font-bold text-stone-700"
                >
                  <Search
                    size={17}
                  />
                  Search
                </button>

                <a
                  href={waLink(
                    "Namaste DharmYatra! I need guidance for darshan / puja / yatra.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-saffron flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold text-white"
                >
                  <MessageCircle
                    size={17}
                  />
                  WhatsApp Us
                </a>

                <Link
                  to={
                    user
                      ? "/dashboard"
                      : "/login"
                  }
                  onClick={() =>
                    setMobile(
                      false,
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl border border-orange-700/25 bg-orange-50 px-4 py-3.5 font-bold text-orange-900"
                >
                  <User
                    size={17}
                  />

                  {user
                    ? "My Dashboard"
                    : "Login / Register"}
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          SEARCH OVERLAY
      ==================================================== */}

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-60 bg-char-900/60 p-4 backdrop-blur-sm"
            onClick={() =>
              setSearchOpen(
                false,
              )
            }
          >
            <motion.div
              initial={{
                y: -24,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -24,
                opacity: 0,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="mx-auto mt-[8vh] max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Search input */}

              <div className="flex items-center gap-3 border-b border-orange-900/10 px-5 py-4">
                <Search
                  size={19}
                  className="text-orange-600"
                />

                <input
                  autoFocus
                  value={q}
                  onChange={(
                    event,
                  ) =>
                    setQ(
                      event
                        .target
                        .value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        "Enter" &&
                      results[0]
                    ) {
                      openSearchResult(
                        results[0]
                          .href,
                      );
                    }
                  }}
                  placeholder="Search temples, puja, places, yatras, rashifal, kundli…"
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-stone-400"
                  aria-label="Search"
                />

                <button
                  type="button"
                  onClick={() =>
                    setSearchOpen(
                      false,
                    )
                  }
                  aria-label="Close search"
                  className="grid h-9 w-9 place-items-center rounded-full bg-stone-100"
                >
                  <X
                    size={16}
                  />
                </button>
              </div>

              {/* Search results */}

              <div className="max-h-[50vh] overflow-y-auto p-3">
                {q.trim().length <
                2 ? (
                  <div className="px-3 py-6 text-center text-sm text-stone-500">
                    <p className="font-sanskrit text-2xl text-orange-300">
                      ॐ
                    </p>

                    <p className="mt-2">
                      Try “Kashi”,
                      “Rudrabhishek”,
                      “Char Dham”,
                      “Rashifal”,
                      “Kundli”…
                    </p>
                  </div>
                ) : results.length ===
                  0 ? (
                  <p className="px-3 py-8 text-center text-sm text-stone-500">
                    No matches found.{" "}
                    <a
                      className="font-bold text-orange-700 underline"
                      href={waLink(
                        `Namaste! I searched for "${q}" on DharmYatra.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ask us on
                      WhatsApp
                    </a>
                    .
                  </p>
                ) : (
                  results.map(
                    (
                      result,
                      index,
                    ) => (
                      <button
                        type="button"
                        key={`${result.href}-${result.label}-${index}`}
                        onClick={() =>
                          openSearchResult(
                            result.href,
                          )
                        }
                        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-orange-50"
                      >
                        <span className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
                            {result.type ===
                            "Rashifal" ? (
                              <Sparkles
                                size={
                                  15
                                }
                              />
                            ) : result.type ===
                              "Kundli" ? (
                              <MoonStar
                                size={
                                  15
                                }
                              />
                            ) : result.type ===
                              "Calendar" ? (
                              <CalendarDays
                                size={
                                  15
                                }
                              />
                            ) : result.type ===
                              "Yatra" ? (
                              <MapPinned
                                size={
                                  15
                                }
                              />
                            ) : result.type ===
                              "Spiritual Place" ? (
                              <Landmark
                                size={
                                  15
                                }
                              />
                            ) : result.type ===
                              "Temple" ? (
                              <Landmark
                                size={
                                  15
                                }
                              />
                            ) : result.type ===
                              "Puja Service" ? (
                              <Sparkles
                                size={
                                  15
                                }
                              />
                            ) : (
                              <Search
                                size={
                                  15
                                }
                              />
                            )}
                          </span>

                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-stone-800">
                              {
                                result.label
                              }
                            </span>

                            <span className="mt-0.5 block text-xs text-stone-500">
                              {
                                result.sub
                              }
                            </span>
                          </span>
                        </span>

                        <span className="shrink-0 text-orange-500">
                          →
                        </span>
                      </button>
                    ),
                  )
                )}
              </div>

              {/* Search footer */}

              <div className="flex items-center gap-2 border-t border-orange-900/10 bg-orange-50/60 px-5 py-3 text-xs text-stone-500">
                <Bell
                  size={13}
                  className="text-orange-600"
                />

                <span>
                  Popular:
                  Mahashivratri ·
                  Temple · Puja · Char Dham ·
                  Rashifal · Kundli · Gochar
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}