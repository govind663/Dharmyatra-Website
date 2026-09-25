/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Heart,
  Bell,
  Settings,
  LogOut,
  MessageCircle,
  MapPin,
  Phone,
  Save,
  Mail,
  ShieldCheck,
  LoaderCircle,
  Globe2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { TEMPLES, PLACES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Reveal, Empty } from "../components/ui";
import { useApp } from "../context/AppContext";
import { cx } from "../lib/utils";

const TABS = [
  {
    id: "overview",
    l: "Overview",
    i: <LayoutDashboard size={16} />,
  },
  {
    id: "profile",
    l: "Profile",
    i: <User size={16} />,
  },
  {
    id: "bookings",
    l: "My Bookings",
    i: <CalendarCheck size={16} />,
  },
  {
    id: "saved",
    l: "Saved",
    i: <Heart size={16} />,
  },
  {
    id: "notifications",
    l: "Notifications",
    i: <Bell size={16} />,
  },
  {
    id: "settings",
    l: "Settings",
    i: <Settings size={16} />,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

type ProfileForm = {
  name: string;
  phone: string;
  city: string;
  state: string;
  country: string;
};

type NotificationPrefs = {
  whatsapp: boolean;
  email: boolean;
  festival: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  whatsapp: true,
  email: true,
  festival: true,
};

/*
|--------------------------------------------------------------------------
| Notification Preferences
|--------------------------------------------------------------------------
*/

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(
      "dd_notification_prefs",
    );

    if (!raw) {
      return DEFAULT_PREFS;
    }

    const parsed =
      JSON.parse(raw) as Partial<NotificationPrefs>;

    return {
      whatsapp:
        typeof parsed.whatsapp === "boolean"
          ? parsed.whatsapp
          : DEFAULT_PREFS.whatsapp,

      email:
        typeof parsed.email === "boolean"
          ? parsed.email
          : DEFAULT_PREFS.email,

      festival:
        typeof parsed.festival === "boolean"
          ? parsed.festival
          : DEFAULT_PREFS.festival,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/*
|--------------------------------------------------------------------------
| Role Labels
|--------------------------------------------------------------------------
*/

function roleLabel(role?: string): string {
  switch (role) {
    case "pandit":
      return "Pandit / Acharya";

    case "temple_manager":
      return "Temple Manager";

    case "sales":
      return "Sales";

    case "super_admin":
      return "Super Admin";

    case "visitor":
    default:
      return "Visitor / Devotee";
  }
}

/*
|--------------------------------------------------------------------------
| Status Labels
|--------------------------------------------------------------------------
*/

function statusLabel(status?: string): string {
  switch (status) {
    case "active":
      return "Active";

    case "pending":
      return "Pending Approval";

    case "suspended":
      return "Suspended";

    case "rejected":
      return "Rejected";

    case "blocked":
      return "Blocked";

    default:
      return "Active";
  }
}

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export default function Dashboard() {
  useSEO({
    title:
      "My Dashboard — Bookings, Saved Temples & Profile | DivyaDhara",

    description:
      "Manage your DivyaDhara account: bookings, puja & yatra enquiries, saved temples, notifications and profile.",

    path: "/dashboard",
  });

  const {
    user,
    isLoading,
    authError,
    isProfileUpdating,
    logout,
    updateProfile,
    bookings,
    savedTemples,
    savedPlaces,
    toggleSave,
    notifications,
    clearAuthError,
  } = useApp();

  const nav = useNavigate();

  /*
   * ----------------------------------------------------------------------
   * Local State
   * ----------------------------------------------------------------------
   */

  const [tab, setTab] =
    useState<TabId>("overview");

  const [f, setF] =
    useState<ProfileForm>({
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      city: user?.city ?? "",
      state: user?.state ?? "",
      country: user?.country ?? "India",
    });

  const [saved, setSaved] =
    useState(false);

  const [profileError, setProfileError] =
    useState<string | null>(null);

  const [prefs, setPrefs] =
    useState<NotificationPrefs>(
      loadPrefs,
    );

  /*
   * ----------------------------------------------------------------------
   * Sync form with authenticated backend user
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    if (!user) {
      return;
    }

    setF({
      name: user.name ?? "",
      phone: user.phone ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      country: user.country ?? "India",
    });
  }, [user]);

  /*
   * ----------------------------------------------------------------------
   * Clear transient save state when changing tabs
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    if (tab !== "profile") {
      setSaved(false);
      setProfileError(null);
    }
  }, [tab]);

  /*
   * ----------------------------------------------------------------------
   * Persist local notification preferences
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        "dd_notification_prefs",
        JSON.stringify(prefs),
      );
    } catch {
      // Ignore localStorage failures.
    }
  }, [prefs]);

  /*
   * ----------------------------------------------------------------------
   * Logout
   * ----------------------------------------------------------------------
   */

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      nav("/");
    }
  };

  /*
   * ----------------------------------------------------------------------
   * Profile Save
   * ----------------------------------------------------------------------
   */

  const handleProfileSave = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setProfileError(null);
    clearAuthError();

    const name = f.name.trim();
    const phone = f.phone.trim();
    const city = f.city.trim();
    const state = f.state.trim();
    const country = f.country.trim();

    if (!name) {
      setProfileError(
        "Please enter your full name.",
      );
      return;
    }

    if (name.length < 2) {
      setProfileError(
        "Full name must contain at least 2 characters.",
      );
      return;
    }

    if (!phone) {
      setProfileError(
        "Please enter your mobile number.",
      );
      return;
    }

    if (phone.length < 7) {
      setProfileError(
        "Please enter a valid mobile number.",
      );
      return;
    }

    try {
      /*
       * Backend-persistent profile update.
       *
       * Email is intentionally not included.
       * Email remains read-only in this profile screen.
       */
      await updateProfile({
        name,
        phone,
        city,
        state,
        country,
      });

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    }
  };

  /*
   * ----------------------------------------------------------------------
   * Loading State
   * ----------------------------------------------------------------------
   */

  if (isLoading && !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-20">
        <div className="text-center">
          <div
            className="
              mx-auto grid h-14 w-14 place-items-center
              rounded-2xl bg-orange-50 text-orange-700
            "
          >
            <LoaderCircle
              size={24}
              className="animate-spin"
            />
          </div>

          <h1
            className="
              font-display mt-5 text-2xl
              font-semibold text-stone-900
            "
          >
            Loading your dashboard
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Restoring your secure DivyaDhara session…
          </p>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Logged Out State
   * ----------------------------------------------------------------------
   */

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-sanskrit text-5xl text-orange-300">
          ॐ
        </p>

        <h1 className="font-display mt-3 text-3xl font-semibold">
          Please login first
        </h1>

        <p className="mt-2 text-stone-500">
          Your dashboard holds bookings, saved temples
          and yatra enquiries.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/login"
            className="
              btn-saffron rounded-2xl px-6 py-3
              text-sm font-bold text-white
            "
          >
            Login
          </Link>

          <Link
            to="/register"
            className="
              rounded-2xl border border-orange-700/25
              px-6 py-3 text-sm font-bold text-orange-900
            "
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Derived Data
   * ----------------------------------------------------------------------
   */

  const savedT = TEMPLES.filter((t) =>
    savedTemples.includes(t.slug),
  );

  const savedP = PLACES.filter((p) =>
    savedPlaces.includes(p.slug),
  );

  const input =
    "w-full rounded-xl border border-orange-900/15 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200";

  const readonlyInput =
    "w-full cursor-not-allowed rounded-xl border border-orange-900/10 bg-stone-50 px-4 py-3 text-sm text-stone-600 outline-none";

  const firstName =
    user.name.trim().split(/\s+/)[0] ||
    "Devotee";

  const avatarLetter =
    user.name.trim().charAt(0).toUpperCase() ||
    "D";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      {/* =========================================================
          DASHBOARD HEADER
      ========================================================== */}

      <Reveal
        className="
          flex flex-col items-start justify-between gap-4
          rounded-[1.75rem]
          bg-linear-to-br from-[#2a1a10] via-saffron-900 to-saffron-700
          p-6 text-white
          md:flex-row md:items-center md:p-8
        "
      >
        <div className="flex min-w-0 items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.name} profile`}
              className="
                h-16 w-16 shrink-0 rounded-2xl
                object-cover ring-1 ring-white/25
              "
            />
          ) : (
            <span
              className="
                grid h-16 w-16 shrink-0 place-items-center
                rounded-2xl bg-white/15
                text-2xl font-bold text-amber-200
                ring-1 ring-white/25
              "
              aria-hidden="true"
            >
              {avatarLetter}
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className="
                  text-xs uppercase tracking-[0.25em]
                  text-amber-300
                "
              >
                Jai Shri Ram · Dashboard
              </p>

              {user.status === "active" && (
                <span
                  className="
                    inline-flex items-center gap-1
                    rounded-full bg-emerald-400/15
                    px-2.5 py-1
                    text-[10px] font-bold uppercase tracking-wider
                    text-emerald-200
                    ring-1 ring-emerald-300/20
                  "
                >
                  <ShieldCheck size={11} />
                  Active
                </span>
              )}
            </div>

            <h1
              className="
                font-display mt-1 truncate
                text-2xl font-semibold
                md:text-3xl
              "
            >
              Namaste, {firstName} 🙏
            </h1>

            <div
              className="
                mt-1 flex flex-wrap items-center
                gap-x-2 gap-y-1
                text-sm text-orange-100/80
              "
            >
              <span>{user.email}</span>

              {user.city && (
                <>
                  <span aria-hidden="true">
                    ·
                  </span>

                  <span>{user.city}</span>
                </>
              )}

              <span aria-hidden="true">
                ·
              </span>

              <span>
                {roleLabel(user.role)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <a
            href={`https://wa.me/919820809883?text=${encodeURIComponent(
              "Namaste! I need help with my DivyaDhara account and bookings.",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="
              flex flex-1 items-center justify-center gap-1.5
              rounded-xl bg-[#25D366] px-4 py-2.5
              text-[13px] font-bold text-white
              sm:flex-none
            "
          >
            <MessageCircle size={15} />
            Help
          </a>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="
              flex flex-1 items-center justify-center gap-1.5
              rounded-xl border border-white/25 bg-white/10
              px-4 py-2.5 text-[13px] font-bold
              hover:bg-white/15
              sm:flex-none
            "
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </Reveal>

      {/* =========================================================
          MAIN DASHBOARD
      ========================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* =======================================================
            TABS
        ======================================================== */}

        <nav
          className="flex gap-2 overflow-x-auto lg:flex-col"
          aria-label="Dashboard sections"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cx(
                "flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition",
                tab === t.id
                  ? "bg-[#2a1a10] text-amber-200 shadow"
                  : "bg-white text-stone-600 ring-1 ring-orange-900/10 hover:bg-orange-50",
              )}
            >
              {t.i}

              <span>{t.l}</span>

              {t.id === "bookings" &&
                bookings.length > 0 && (
                  <span className="ml-auto rounded-full bg-orange-600 px-2 py-0.5 text-[11px] text-white">
                    {bookings.length}
                  </span>
                )}

              {t.id === "notifications" &&
                notifications.length > 0 && (
                  <span className="ml-auto rounded-full bg-orange-600 px-2 py-0.5 text-[11px] text-white">
                    {notifications.length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        {/* =======================================================
            CONTENT
        ======================================================== */}

        <div className="min-w-0">
          {/* =====================================================
              OVERVIEW
          ====================================================== */}

          {tab === "overview" && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  l: "Total Enquiries",
                  v: String(bookings.length),
                  d: "Puja · Yatra · Events",
                },
                {
                  l: "Saved Temples",
                  v: String(savedT.length),
                  d: "Your sacred wishlist",
                },
                {
                  l: "Saved Places",
                  v: String(savedP.length),
                  d: "Yatra dreams",
                },
              ].map((c) => (
                <div
                  key={c.l}
                  className="
                    rounded-3xl border border-orange-900/10
                    bg-white p-6 text-center sacred-border
                  "
                >
                  <p
                    className="
                      font-display text-4xl
                      font-bold text-orange-800
                    "
                  >
                    {c.v}
                  </p>

                  <p className="mt-1 text-sm font-bold text-stone-700">
                    {c.l}
                  </p>

                  <p className="text-xs text-stone-500">
                    {c.d}
                  </p>
                </div>
              ))}

              <div
                className="
                  rounded-3xl bg-amber-50 p-6
                  ring-1 ring-amber-200
                  sm:col-span-3
                "
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      Recent activity
                    </h3>

                    <p className="mt-0.5 text-xs text-stone-500">
                      Latest puja, pandit, yatra and event enquiries
                    </p>
                  </div>

                  <Link
                    to="/services"
                    className="
                      text-xs font-bold text-orange-700
                      underline underline-offset-2
                    "
                  >
                    Explore Sevas
                  </Link>
                </div>

                {bookings.length === 0 ? (
                  <p className="mt-4 text-sm text-stone-500">
                    No enquiries yet —{" "}
                    <Link
                      to="/services"
                      className="font-bold text-orange-700 underline"
                    >
                      book your first puja
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {bookings
                      .slice(0, 3)
                      .map((b) => (
                        <li
                          key={b.id}
                          className="
                            flex flex-wrap items-center
                            justify-between gap-2
                            rounded-xl bg-white
                            px-4 py-3 text-sm
                            ring-1 ring-orange-900/5
                          "
                        >
                          <span className="min-w-0">
                            <strong className="text-stone-800">
                              {b.title}
                            </strong>{" "}
                            <span className="text-stone-400">
                              · {b.id}
                            </span>
                          </span>

                          <span
                            className="
                              rounded-full bg-emerald-100
                              px-2.5 py-0.5
                              text-xs font-bold
                              text-emerald-900
                            "
                          >
                            {b.status}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div
                className="
                  rounded-3xl border border-orange-900/10
                  bg-white p-6
                  sm:col-span-3
                "
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className="text-orange-700"
                  />

                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      Account
                    </h3>

                    <p className="text-xs text-stone-500">
                      Your DivyaDhara account status
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p
                      className="
                        text-[10px] font-bold
                        uppercase tracking-wider
                        text-stone-400
                      "
                    >
                      Role
                    </p>

                    <p className="mt-1 text-sm font-bold text-stone-800">
                      {roleLabel(user.role)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p
                      className="
                        text-[10px] font-bold
                        uppercase tracking-wider
                        text-stone-400
                      "
                    >
                      Status
                    </p>

                    <p className="mt-1 text-sm font-bold text-stone-800">
                      {statusLabel(user.status)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p
                      className="
                        text-[10px] font-bold
                        uppercase tracking-wider
                        text-stone-400
                      "
                    >
                      Location
                    </p>

                    <p
                      className="
                        mt-1 flex items-center gap-1
                        text-sm font-bold text-stone-800
                      "
                    >
                      <MapPin
                        size={13}
                        className="text-orange-700"
                      />

                      {user.city || "India"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              PROFILE
          ====================================================== */}

          {tab === "profile" && (
            <form
              onSubmit={handleProfileSave}
              className="
                rounded-3xl border border-orange-900/10
                bg-white p-6 md:p-8
              "
            >
              <div
                className="
                  flex flex-col justify-between gap-3
                  sm:flex-row sm:items-start
                "
              >
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    Profile
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Keep your contact and location details up to date.
                  </p>
                </div>

                <span
                  className="
                    inline-flex w-fit items-center gap-1.5
                    rounded-full bg-orange-50
                    px-3 py-1.5 text-xs font-bold
                    text-orange-800
                    ring-1 ring-orange-100
                  "
                >
                  <User size={13} />
                  {roleLabel(user.role)}
                </span>
              </div>

              {/* Global auth error */}
              {authError && (
                <div
                  className="
                    mt-5 flex items-start gap-3
                    rounded-2xl border border-red-200
                    bg-red-50 p-4
                    text-sm text-red-800
                  "
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="font-bold">
                      Account update error
                    </p>

                    <p className="mt-0.5">
                      {authError}
                    </p>
                  </div>
                </div>
              )}

              {/* Profile-specific error */}
              {profileError && !authError && (
                <div
                  className="
                    mt-5 flex items-start gap-3
                    rounded-2xl border border-red-200
                    bg-red-50 p-4
                    text-sm text-red-800
                  "
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="font-bold">
                      Unable to save profile
                    </p>

                    <p className="mt-0.5">
                      {profileError}
                    </p>
                  </div>
                </div>
              )}

              {/* Success */}
              {saved && (
                <div
                  className="
                    mt-5 flex items-start gap-3
                    rounded-2xl border border-emerald-200
                    bg-emerald-50 p-4
                    text-sm text-emerald-800
                  "
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-bold">
                      Profile updated successfully.
                    </p>

                    <p className="mt-0.5">
                      Your latest profile details are saved to your account.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label
                    className="
                      mb-1.5 block text-xs font-bold
                      text-stone-600
                    "
                    htmlFor="d-n"
                  >
                    Full name
                  </label>

                  <input
                    id="d-n"
                    type="text"
                    value={f.name}
                    onChange={(e) =>
                      setF({
                        ...f,
                        name: e.target.value,
                      })
                    }
                    autoComplete="name"
                    maxLength={120}
                    className={input}
                    placeholder="Your full name"
                    disabled={isProfileUpdating}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    className="
                      mb-1.5 flex items-center gap-1
                      text-xs font-bold text-stone-600
                    "
                    htmlFor="d-e"
                  >
                    <Mail size={12} />
                    Email
                  </label>

                  <input
                    id="d-e"
                    type="email"
                    value={user.email}
                    readOnly
                    aria-readonly="true"
                    className={readonlyInput}
                  />

                  <p className="mt-1.5 text-[11px] text-stone-400">
                    Account email is managed separately for security.
                  </p>
                </div>

                {/* Mobile */}
                <div>
                  <label
                    className="
                      mb-1.5 flex items-center gap-1
                      text-xs font-bold text-stone-600
                    "
                    htmlFor="d-p"
                  >
                    <Phone size={12} />
                    Mobile
                  </label>

                  <input
                    id="d-p"
                    type="tel"
                    value={f.phone}
                    onChange={(e) =>
                      setF({
                        ...f,
                        phone: e.target.value,
                      })
                    }
                    autoComplete="tel"
                    maxLength={30}
                    className={input}
                    placeholder="+91 90000 00000"
                    disabled={isProfileUpdating}
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    className="
                      mb-1.5 flex items-center gap-1
                      text-xs font-bold text-stone-600
                    "
                    htmlFor="d-c"
                  >
                    <MapPin size={12} />
                    City
                  </label>

                  <input
                    id="d-c"
                    type="text"
                    value={f.city}
                    onChange={(e) =>
                      setF({
                        ...f,
                        city: e.target.value,
                      })
                    }
                    autoComplete="address-level2"
                    maxLength={100}
                    className={input}
                    placeholder="e.g. Mumbai"
                    disabled={isProfileUpdating}
                  />
                </div>

                {/* State */}
                <div>
                  <label
                    className="
                      mb-1.5 block text-xs font-bold
                      text-stone-600
                    "
                    htmlFor="d-s"
                  >
                    State
                  </label>

                  <input
                    id="d-s"
                    type="text"
                    value={f.state}
                    onChange={(e) =>
                      setF({
                        ...f,
                        state: e.target.value,
                      })
                    }
                    autoComplete="address-level1"
                    maxLength={100}
                    className={input}
                    placeholder="e.g. Maharashtra"
                    disabled={isProfileUpdating}
                  />
                </div>

                {/* Country */}
                <div>
                  <label
                    className="
                      mb-1.5 flex items-center gap-1
                      text-xs font-bold text-stone-600
                    "
                    htmlFor="d-country"
                  >
                    <Globe2 size={12} />
                    Country
                  </label>

                  <input
                    id="d-country"
                    type="text"
                    value={f.country}
                    onChange={(e) =>
                      setF({
                        ...f,
                        country: e.target.value,
                      })
                    }
                    autoComplete="country-name"
                    maxLength={100}
                    className={input}
                    placeholder="India"
                    disabled={isProfileUpdating}
                  />
                </div>
              </div>

              <div
                className="
                  mt-5 flex flex-col gap-3
                  border-t border-orange-900/10
                  pt-5 sm:flex-row sm:items-center
                "
              >
                <button
                  type="submit"
                  disabled={isProfileUpdating}
                  className="
                    btn-saffron flex items-center
                    justify-center gap-2
                    rounded-xl px-6 py-3
                    text-sm font-bold text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {isProfileUpdating ? (
                    <>
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />

                      Saving…
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 size={15} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </button>

                {isProfileUpdating && (
                  <p className="text-xs text-stone-500">
                    Saving your profile to DivyaDhara…
                  </p>
                )}
              </div>
            </form>
          )}

          {/* =====================================================
              BOOKINGS
          ====================================================== */}

          {tab === "bookings" && (
            <div className="space-y-3">
              <div
                className="
                  flex flex-col justify-between gap-3
                  sm:flex-row sm:items-center
                "
              >
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    My Bookings & Enquiries
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Track your puja, pandit, yatra,
                    course and event requests.
                  </p>
                </div>

                {bookings.length > 0 && (
                  <span
                    className="
                      w-fit rounded-full bg-orange-50
                      px-3 py-1.5 text-xs font-bold
                      text-orange-800
                      ring-1 ring-orange-100
                    "
                  >
                    {bookings.length} total
                  </span>
                )}
              </div>

              {bookings.length === 0 ? (
                <Empty
                  title="No bookings yet"
                  sub="Your puja, pandit, yatra, course and event enquiries will appear here."
                  action={
                    <Link
                      to="/services"
                      className="
                        btn-saffron rounded-xl px-6 py-3
                        text-sm font-bold text-white
                      "
                    >
                      Explore Sevas
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="
                          flex flex-wrap items-center
                          justify-between gap-3
                          rounded-2xl
                          border border-orange-900/10
                          bg-white p-4
                        "
                      >
                        <div className="min-w-0">
                          <p
                            className="
                              text-[11px] font-bold
                              uppercase tracking-widest
                              text-orange-700
                            "
                          >
                            {b.kind} · {b.id}
                          </p>

                          <p className="mt-0.5 font-bold text-stone-800">
                            {b.title}
                          </p>

                          <p
                            className="
                              mt-1 flex flex-wrap
                              items-center gap-1
                              text-[13px] text-stone-500
                            "
                          >
                            <span>{b.date}</span>

                            <span aria-hidden="true">
                              ·
                            </span>

                            <span>{b.detail}</span>
                          </p>
                        </div>

                        <span
                          className="
                            rounded-full bg-emerald-100
                            px-3 py-1 text-xs
                            font-bold text-emerald-900
                          "
                        >
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2 pt-2 sm:grid-cols-2">
                    <Link
                      to="/services"
                      className="
                        rounded-2xl bg-orange-50 p-4
                        text-sm font-bold text-orange-900
                        ring-1 ring-orange-200
                        transition hover:bg-orange-100
                      "
                    >
                      + New Puja Enquiry
                    </Link>

                    <Link
                      to="/packages"
                      className="
                        rounded-2xl bg-orange-50 p-4
                        text-sm font-bold text-orange-900
                        ring-1 ring-orange-200
                        transition hover:bg-orange-100
                      "
                    >
                      + New Yatra Enquiry
                    </Link>

                    <Link
                      to="/pandits"
                      className="
                        rounded-2xl bg-orange-50 p-4
                        text-sm font-bold text-orange-900
                        ring-1 ring-orange-200
                        transition hover:bg-orange-100
                      "
                    >
                      + Pandit Request
                    </Link>

                    <Link
                      to="/courses"
                      className="
                        rounded-2xl bg-orange-50 p-4
                        text-sm font-bold text-orange-900
                        ring-1 ring-orange-200
                        transition hover:bg-orange-100
                      "
                    >
                      + Course Registration
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =====================================================
              SAVED
          ====================================================== */}

          {tab === "saved" && (
            <div>
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Saved Temples & Places
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Your personal sacred wishlist.
                </p>
              </div>

              {savedT.length === 0 &&
              savedP.length === 0 ? (
                <div className="mt-4">
                  <Empty
                    title="Nothing saved yet"
                    sub="Tap the heart on any temple or place to build your sacred wishlist."
                    action={
                      <Link
                        to="/temples"
                        className="
                          btn-saffron rounded-xl px-6 py-3
                          text-sm font-bold text-white
                        "
                      >
                        Discover Temples
                      </Link>
                    }
                  />
                </div>
              ) : (
                <>
                  {savedT.length > 0 && (
                    <div className="mt-4">
                      <h3
                        className="
                          mb-3 text-sm font-bold
                          uppercase tracking-wider
                          text-stone-500
                        "
                      >
                        Saved Temples
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {savedT.map((t) => (
                          <div
                            key={t.slug}
                            className="
                              flex items-center gap-3
                              rounded-2xl bg-white p-3
                              ring-1 ring-orange-900/10
                            "
                          >
                            <img
                              src={t.image}
                              alt={t.name}
                              className="
                                h-14 w-14 shrink-0
                                rounded-xl object-cover
                              "
                            />

                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/temples/${t.slug}`}
                                className="
                                  block truncate text-sm
                                  font-bold hover:text-orange-700
                                "
                              >
                                {t.name}
                              </Link>

                              <p
                                className="
                                  flex items-center gap-1
                                  text-xs text-stone-500
                                "
                              >
                                <MapPin size={11} />
                                {t.city}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleSave(
                                  "temple",
                                  t.slug,
                                )
                              }
                              className="
                                shrink-0 text-xs font-bold
                                text-red-600
                                hover:text-red-700
                              "
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {savedP.length > 0 && (
                    <div className="mt-6">
                      <h3
                        className="
                          mb-3 text-sm font-bold
                          uppercase tracking-wider
                          text-stone-500
                        "
                      >
                        Saved Spiritual Places
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {savedP.map((p) => (
                          <div
                            key={p.slug}
                            className="
                              flex items-center gap-3
                              rounded-2xl bg-white p-3
                              ring-1 ring-orange-900/10
                            "
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="
                                h-14 w-14 shrink-0
                                rounded-xl object-cover
                              "
                            />

                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/spiritual-places/${p.slug}`}
                                className="
                                  block truncate text-sm
                                  font-bold hover:text-orange-700
                                "
                              >
                                {p.name}
                              </Link>

                              <p className="text-xs text-stone-500">
                                {p.state}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleSave(
                                  "place",
                                  p.slug,
                                )
                              }
                              className="
                                shrink-0 text-xs font-bold
                                text-red-600
                                hover:text-red-700
                              "
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* =====================================================
              NOTIFICATIONS
          ====================================================== */}

          {tab === "notifications" && (
            <div className="space-y-2.5">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Notifications
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Important updates related to your DivyaDhara activity.
                </p>
              </div>

              {notifications.length === 0 ? (
                <Empty
                  title="No notifications"
                  sub="You're all caught up. New account and booking updates will appear here."
                />
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="
                      flex items-start gap-3
                      rounded-2xl
                      border border-orange-900/10
                      bg-white p-4
                    "
                  >
                    <span
                      className="
                        grid h-9 w-9 shrink-0
                        place-items-center rounded-xl
                        bg-orange-50 text-orange-600
                      "
                    >
                      <Bell size={17} />
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm text-stone-700">
                        {n.text}
                      </p>

                      <p
                        className="
                          mt-1 flex items-center gap-1
                          text-xs text-stone-400
                        "
                      >
                        <Phone size={11} />
                        {n.date}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* =====================================================
              SETTINGS
          ====================================================== */}

          {tab === "settings" && (
            <div
              className="
                rounded-3xl border border-orange-900/10
                bg-white p-6 md:p-8
              "
            >
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Notification Settings
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Choose which updates you would like to receive.
                </p>
              </div>

              {[
                {
                  k: "whatsapp" as const,
                  l: "WhatsApp updates",
                  d: "Booking confirmations & yatra alerts",
                },
                {
                  k: "email" as const,
                  l: "Email — Divya Patra",
                  d: "Weekly Panchang & festival letter",
                },
                {
                  k: "festival" as const,
                  l: "Festival reminders",
                  d: "Ekadashi, Purnima, Shivratri alerts",
                },
              ].map((o) => (
                <label
                  key={o.k}
                  className="
                    mt-3 flex cursor-pointer
                    items-center justify-between gap-4
                    rounded-2xl bg-orange-50/60
                    px-4 py-3.5
                    ring-1 ring-orange-100
                  "
                >
                  <span>
                    <span
                      className="
                        block text-sm font-bold
                        text-stone-800
                      "
                    >
                      {o.l}
                    </span>

                    <span
                      className="
                        block text-xs text-stone-500
                      "
                    >
                      {o.d}
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={prefs[o.k]}
                    onChange={() =>
                      setPrefs({
                        ...prefs,
                        [o.k]:
                          !prefs[o.k],
                      })
                    }
                    className="
                      h-5 w-5 accent-orange-700
                    "
                  />
                </label>
              ))}

              <div
                className="
                  mt-5 rounded-2xl bg-stone-50 p-4
                "
              >
                <p className="text-xs text-stone-500">
                  Notification preferences are currently
                  saved on this device. Central
                  account-level notification preferences can
                  be connected to the backend notification
                  system later.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}