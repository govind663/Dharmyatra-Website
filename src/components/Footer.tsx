import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Flame,
  Send,
  CalendarDays,
  Clock3,
  Sparkles,
  MoonStar,
  MapPinned,
  Landmark,
  Images,
  PlayCircle,
  Compass,
  Heart,
  ShieldCheck,
} from "lucide-react";

import {
  waLink,
  DISPLAY_PHONE,
  CONTACT_EMAIL,
} from "../lib/utils";

/* =========================================================
   FOOTER NAVIGATION TYPES
========================================================= */

type FooterLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

/* =========================================================
   FOOTER NAVIGATION
========================================================= */

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Explore",
    links: [
      { label: "Temples of India", href: "/temples", icon: <Landmark size={14} /> },
      { label: "Spiritual Places", href: "/spiritual-places", icon: <MapPinned size={14} /> },
      { label: "Yatra Packages", href: "/packages", icon: <Compass size={14} /> },
      { label: "Ashrams", href: "/ashrams", icon: <Heart size={14} /> },
      { label: "Events & Kathas", href: "/events", icon: <Flame size={14} /> },
      { label: "Gallery", href: "/gallery", icon: <Images size={14} /> },
      { label: "Videos", href: "/videos", icon: <PlayCircle size={14} /> },
    ],
  },
  {
    heading: "Puja & Seva",
    links: [
      { label: "Puja Services", href: "/services", icon: <Sparkles size={14} /> },
      { label: "Book a Pandit", href: "/pandits", icon: <ShieldCheck size={14} /> },
      { label: "Cultural Courses", href: "/courses", icon: <Heart size={14} /> },
      { label: "Contact for Guidance", href: "/contact", icon: <MessageCircle size={14} /> },
    ],
  },
  {
    heading: "Panchang & Jyotish",
    links: [
      { label: "Today's Panchang", href: "/panchang", icon: <CalendarDays size={14} /> },
      { label: "Festival Calendar", href: "/calendar", icon: <CalendarDays size={14} /> },
      { label: "Today's Rashifal", href: "/rashifal", icon: <Sparkles size={14} /> },
      { label: "Kundli", href: "/kundli", icon: <MoonStar size={14} /> },
      { label: "Gochar", href: "/gochar", icon: <Clock3 size={14} /> },
    ],
  },
  {
    heading: "Quick Links",
    links: [
      { label: "About DharmYatra", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Login / Register", href: "/login" },
      { label: "My Dashboard", href: "/dashboard" },
      { label: "Trust & Mission", href: "/about", icon: <ShieldCheck size={14} /> },
    ],
  },
];

/* =========================================================
   SOCIAL LINKS
========================================================= */

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: Facebook,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    icon: Youtube,
  },
  {
    label: "Twitter",
    href: "https://x.com/",
    icon: Twitter,
  },
];

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  const [email, setEmail] =
    useState("");

  const [subscribed, setSubscribed] =
    useState(false);

  const [emailError, setEmailError] =
    useState("");

  /* =======================================================
     NEWSLETTER
  ======================================================= */

  const handleNewsletterSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedEmail =
      email.trim();

    if (!trimmedEmail) {
      setEmailError(
        "Please enter your email address.",
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      )
    ) {
      setEmailError(
        "Please enter a valid email address.",
      );

      return;
    }

    setEmailError("");
    setSubscribed(true);
  };

  return (
    <footer className="relative overflow-hidden bg-char-900 text-stone-300">
      {/* ===================================================
          TOP GOLD DIVIDER
      ==================================================== */}

      <div className="h-1.5 bg-linear-to-r from-amber-500 via-orange-600 to-amber-500" />

      <div
        className="mandala-bg absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
      />

      {/* ===================================================
          NEWSLETTER
      ==================================================== */}

      <div className="relative mx-auto max-w-7xl px-4 pt-12 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-amber-500/20 bg-linear-to-br from-[#2a1a10] to-[#3d2c1c]">
          <div className="relative p-6 md:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
              {/* Newsletter copy */}

              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
                  <Flame size={13} />

                  Divya Patra — Weekly Wisdom
                </p>

                <h3 className="font-display mt-2 text-2xl font-semibold leading-tight text-amber-50 md:text-3xl">
                  Panchang, festivals & katha
                  <br className="hidden sm:block" />
                  in your inbox.
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-stone-400">
                  One thoughtful email every Monday
                  with spiritual insights, upcoming
                  festivals, Panchang highlights and
                  sacred travel inspiration.
                </p>

                <p className="mt-2 text-xs font-medium text-amber-400/70">
                  No spam. Unsubscribe anytime.
                </p>
              </div>

              {/* Newsletter form */}

              {subscribed ? (
                <div className="w-full max-w-md rounded-2xl border border-emerald-400/20 bg-emerald-900/40 px-6 py-5">
                  <p className="text-sm font-bold text-emerald-200">
                    Thank you. You are subscribed.
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-emerald-300/80">
                    Weekly Divya Patra updates will be
                    sent to your email.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={
                    handleNewsletterSubmit
                  }
                  className="w-full max-w-md"
                >
                  <div className="flex w-full gap-2">
                    <label
                      htmlFor="footer-newsletter-email"
                      className="sr-only"
                    >
                      Email address
                    </label>

                    <input
                      id="footer-newsletter-email"
                      type="email"
                      value={email}
                      required
                      onChange={(
                        event,
                      ) => {
                        setEmail(
                          event.target.value,
                        );

                        if (emailError) {
                          setEmailError("");
                        }
                      }}
                      placeholder="you@example.com"
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-500"
                    />

                    <button
                      type="submit"
                      className="btn-gold flex shrink-0 items-center gap-1.5 rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
                    >
                      <Send size={15} />
                      Join
                    </button>
                  </div>

                  {emailError && (
                    <p className="mt-2 px-1 text-xs font-medium text-red-300">
                      {emailError}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          MAIN FOOTER
      ==================================================== */}

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.35fr_repeat(4,1fr)] md:px-6 lg:px-8">
        {/* =================================================
            BRAND / CONTACT
        ================================================== */}

        <div>
          {/* Brand */}

          <Link
            to="/"
            className="group inline-flex items-center gap-2.5"
            aria-label="DharmYatra home"
          >
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-saffron-900 shadow-lg shadow-orange-900/20">
              <span className="font-sanskrit text-2xl leading-none text-amber-100">
                ॐ
              </span>

              <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-300/30" />
            </span>

            <span>
              <span className="font-display block text-xl font-bold text-amber-50">
                Divya
                <span className="text-gradient-saffron">
                  Dhara
                </span>
              </span>

              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">
                Sacred Bharat Yatra
              </span>
            </span>
          </Link>

          {/* Description */}

          <p className="mt-4 max-w-sm text-sm leading-7 text-stone-400">
            Discover temples, connect with pandits,
            perform puja, learn sacred traditions,
            follow the Panchang and plan meaningful
            yatras across Bharat.
          </p>

          <p className="font-sanskrit mt-4 text-sm text-amber-300/90">
            ॥ तमसो मा ज्योतिर्गमय ॥
          </p>

          {/* Contact */}

          <div className="mt-5 space-y-3 text-sm">
            <p className="flex items-start gap-2.5">
              <MapPin
                size={15}
                className="mt-0.5 shrink-0 text-orange-500"
              />

              <span className="leading-5">
                Assi Ghat Road,
                <br />
                Varanasi, UP 221005
              </span>
            </p>

            <a
              href={`tel:${DISPLAY_PHONE}`}
              className="flex items-center gap-2.5 transition hover:text-amber-300"
            >
              <Phone
                size={14}
                className="shrink-0 text-orange-500"
              />

              {DISPLAY_PHONE}
            </a>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2.5 break-all transition hover:text-amber-300"
            >
              <Mail
                size={14}
                className="shrink-0 text-orange-500"
              />

              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Social */}

          <div className="mt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-stone-500">
              Follow DharmYatra
            </p>

            <div className="flex gap-2">
              {SOCIAL_LINKS.map(
                ({
                  label,
                  href,
                  icon: Icon,
                }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-stone-400 transition hover:border-orange-500 hover:bg-orange-600 hover:text-white"
                  >
                    <Icon
                      size={16}
                    />
                  </a>
                ),
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER COLUMNS
        ================================================== */}

        {FOOTER_COLUMNS.map(
          (column) => (
            <nav
              key={
                column.heading
              }
              aria-label={
                column.heading
              }
            >
              <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
                {column.heading}
              </h4>

              <ul className="mt-4 space-y-2.5">
                {column.links.map(
                  (link) => (
                    <li
                      key={
                        link.label
                      }
                    >
                      <Link
                        to={
                          link.href
                        }
                        className="group flex items-center gap-2 text-sm text-stone-400 transition hover:text-amber-300"
                      >
                        {link.icon && (
                          <span className="shrink-0 text-orange-500/80 transition group-hover:text-orange-400">
                            {
                              link.icon
                            }
                          </span>
                        )}

                        <span>
                          {
                            link.label
                          }
                        </span>
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ),
        )}
      </div>

      {/* ===================================================
          QUICK YATRA / PANCHANG CTA BAND
      ==================================================== */}

      <div className="relative border-y border-white/10 bg-black/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-amber-100">
              <Compass
                size={16}
                className="text-orange-400"
              />

              Planning a sacred journey?
            </p>

            <p className="mt-1 text-xs text-stone-500">
              Explore Yatra packages, sacred places,
              Panchang and spiritual services.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/packages"
              className="rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-700"
            >
              Explore Yatras
            </Link>

            <Link
              to="/panchang"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-white/10"
            >
              Today's Panchang
            </Link>

            <Link
              to="/services"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-stone-300 transition hover:bg-white/10 hover:text-white"
            >
              Puja Services
            </Link>
            <Link
              to="/rashifal"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-stone-300 transition hover:bg-white/10 hover:text-white"
            >
              Rashifal
            </Link>
          </div>
        </div>
      </div>

      {/* ===================================================
          BOTTOM BAR
      ==================================================== */}

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-stone-500 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <p className="leading-5">
            © 2026 DharmYatra · Crafted with devotion
            in Bharat. Panchang values are
            guidance-grade.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to="/about"
              className="transition hover:text-amber-300"
            >
              Trust & Mission
            </Link>

            <Link
              to="/contact"
              className="transition hover:text-amber-300"
            >
              Grievance
            </Link>

            <Link
              to="/contact"
              className="transition hover:text-amber-300"
            >
              Contact
            </Link>

            <a
              href="/sitemap.xml"
              className="transition hover:text-amber-300"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>

      {/* ===================================================
          FLOATING WHATSAPP
      ==================================================== */}

      <a
        href={waLink(
          "Namaste DharmYatra! I need guidance for darshan, puja or yatra.",
        )}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with DharmYatra on WhatsApp"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-6px_rgba(37,211,102,0.7)] transition hover:scale-110 active:scale-95"
      >
        <MessageCircle
          size={26}
          fill="currentColor"
          strokeWidth={0}
        />

        <span
          className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500"
          aria-hidden="true"
        />
      </a>
    </footer>
  );
}