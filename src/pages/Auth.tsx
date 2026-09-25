import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Building2,
} from "lucide-react";

import { useSEO } from "../lib/seo";
import {
  Breadcrumbs,
  Reveal,
} from "../components/ui";
import {
  useApp,
  type RegisterInput,
  type UserRole,
} from "../context/AppContext";

/*
|--------------------------------------------------------------------------
| Shared Shell
|--------------------------------------------------------------------------
*/

function Shell({
  title,
  sub,
  children,
  wide = false,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-cream-50 py-10 md:py-16">
      <div
        className="mandala-bg absolute inset-0 opacity-50"
        aria-hidden="true"
      />

      <div
        className={`relative mx-auto px-4 ${
          wide
            ? "max-w-5xl"
            : "max-w-md"
        }`}
      >
        <Breadcrumbs
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: title,
            },
          ]}
        />

        <Reveal
          className={`mt-6 overflow-hidden rounded-[1.75rem] border border-orange-900/10 bg-white shadow-2xl shadow-orange-900/10 ${
            wide ? "" : ""
          }`}
        >
          <div className="bg-linear-to-br from-saffron-900 via-saffron-700 to-orange-600 px-7 pb-8 pt-8 text-center text-white md:px-10">
            <p
              className="font-sanskrit text-4xl text-amber-200"
              aria-hidden="true"
            >
              ॐ
            </p>

            <h1 className="font-display mt-1 text-3xl font-semibold md:text-4xl">
              {title}
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-orange-100/90">
              {sub}
            </p>
          </div>

          <div className="p-6 md:p-8">
            {children}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Input Classes
|--------------------------------------------------------------------------
*/

const inputClass =
  "w-full rounded-xl border border-orange-900/15 bg-orange-50/40 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200";

const inputWithIconClass =
  `${inputClass} pl-10`;

/*
|--------------------------------------------------------------------------
| Role Configuration
|--------------------------------------------------------------------------
*/

type PublicRole =
  | "visitor"
  | "pandit"
  | "temple_manager";

type RoleOption = {
  role: PublicRole;
  label: string;
  description: string;
  icon: typeof User;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "visitor",
    label: "Visitor / Devotee",
    description:
      "Explore temples, book pujas, plan yatras and manage enquiries.",
    icon: User,
  },
  {
    role: "pandit",
    label: "Pandit / Acharya",
    description:
      "Create your profile, list services and receive qualified enquiries.",
    icon: Sparkles,
  },
  {
    role: "temple_manager",
    label: "Temple Manager",
    description:
      "Represent a temple and manage assigned temple information and enquiries.",
    icon: Building2,
  },
];

/*
|--------------------------------------------------------------------------
| Redirect By Role
|--------------------------------------------------------------------------
*/

function getDashboardPath(
  role: UserRole,
): string {
  switch (role) {
    case "pandit":
      return "/pandit/dashboard";

    case "temple_manager":
      return "/temple-manager/dashboard";

    case "sales":
      return "/sales/dashboard";

    case "super_admin":
      return "/admin/dashboard";

    case "visitor":
    default:
      return "/dashboard";
  }
}

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export function Login() {
  useSEO({
    title:
      "Login — DivyaDhara",
    description:
      "Securely login to your DivyaDhara account to manage bookings, temple saves, enquiries and role-specific services.",
    path: "/login",
  });

  const {
    login,
    isLoading,
    authError,
    clearAuthError,
  } = useApp();

  const nav =
    useNavigate();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const [submitted, setSubmitted] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    clearAuthError();
    setSubmitted(true);

    try {
      const user =
        await login({
          email:
            form.email.trim(),
          password:
            form.password,
        });

      nav(
        getDashboardPath(
          user.role,
        ),
      );
    } catch {
      /*
       * AppContext already stores the
       * user-facing authentication error.
       */
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <Shell
      title="Swagatam Back"
      sub="Login to your DivyaDhara account and continue your spiritual journey."
    >
      {authError && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p className="font-bold">
            Login unsuccessful
          </p>
          <p className="mt-1">
            {authError}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label
            className="mb-1.5 block text-xs font-bold text-stone-600"
            htmlFor="login-email"
          >
            Email address
          </label>

          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-3.5 text-orange-500"
              aria-hidden="true"
            />

            <input
              id="login-email"
              required
              autoComplete="email"
              type="email"
              value={
                form.email
              }
              onChange={(event) => {
                setForm(
                  (current) => ({
                    ...current,
                    email:
                      event.target
                        .value,
                  }),
                );

                clearAuthError();
              }}
              placeholder="you@example.com"
              className={
                inputWithIconClass
              }
            />
          </div>
        </div>

        <div>
          <label
            className="mb-1.5 block text-xs font-bold text-stone-600"
            htmlFor="login-password"
          >
            Password
          </label>

          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-3.5 text-orange-500"
              aria-hidden="true"
            />

            <input
              id="login-password"
              required
              minLength={8}
              autoComplete="current-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={
                form.password
              }
              onChange={(event) => {
                setForm(
                  (current) => ({
                    ...current,
                    password:
                      event.target
                        .value,
                  }),
                );

                clearAuthError();
              }}
              placeholder="Minimum 8 characters"
              className={`${inputWithIconClass} pr-12`}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) =>
                    !current,
                )
              }
              className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-orange-50 hover:text-orange-700"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            submitted
          }
          className="btn-saffron flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ||
          submitted ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn
                size={16}
              />
              Login Securely
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between gap-4 text-[13px]">
        <Link
          to="/forgot-password"
          className="font-bold text-orange-700 hover:underline"
        >
          Forgot password?
        </Link>

        <Link
          to="/register"
          className="font-bold text-orange-700 hover:underline"
        >
          New here? Register
        </Link>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-orange-50/70 p-4 ring-1 ring-orange-100">
        <ShieldCheck
          size={17}
          className="mt-0.5 shrink-0 text-orange-600"
        />

        <div>
          <p className="text-xs font-bold text-stone-800">
            Secure account access
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
            Your authenticated session is
            managed by the DivyaDhara
            backend. Your password is
            never stored in the browser.
          </p>
        </div>
      </div>
    </Shell>
  );
}

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export function Register() {
  useSEO({
    title:
      "Register — Join DivyaDhara",
    description:
      "Create a DivyaDhara account as a devotee, Pandit or Temple Manager.",
    path: "/register",
  });

  const {
    register,
    isLoading,
    authError,
    clearAuthError,
  } = useApp();

  const nav =
    useNavigate();

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<PublicRole>(
    "visitor",
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",

    password: "",
    confirmPassword: "",

    /*
     * Pandit fields
     */
    title: "",
    experienceYears: "",
    district: "",
    languages: "",
    specializations: "",
    pujaTypes: "",
    associatedWith: "",
    about: "",
    availability: "",
    serviceAreas: "",

    /*
     * Temple Manager fields
     */
    designation: "",
    organizationName: "",
  });

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [submitted, setSubmitted] =
    useState(false);

  const selectedRoleConfig =
    useMemo(
      () =>
        ROLE_OPTIONS.find(
          (item) =>
            item.role ===
            selectedRole,
        ) ??
        ROLE_OPTIONS[0],
      [selectedRole],
    );

  const updateField = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    clearAuthError();
    setSuccessMessage(
      null,
    );
  };

  const csvToArray = (
    value: string,
  ): string[] => {
    return value
      .split(",")
      .map((item) =>
        item.trim(),
      )
      .filter(Boolean);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    clearAuthError();
    setSuccessMessage(
      null,
    );
    setSubmitted(true);

    if (
      form.password !==
      form.confirmPassword
    ) {
      setSubmitted(false);

      /*
       * We use AppContext's error slot
       * so the existing UI remains simple.
       */
      alert(
        "Password and confirm password do not match.",
      );

      return;
    }

    if (
      form.password.length <
      8
    ) {
      setSubmitted(false);

      alert(
        "Password must contain at least 8 characters.",
      );

      return;
    }

    const payload: RegisterInput =
      {
        role:
          selectedRole,
        name:
          form.name.trim(),
        email:
          form.email.trim(),
        phone:
          form.phone.trim(),
        city:
          form.city.trim(),
        state:
          form.state.trim(),
        country:
          form.country.trim() ||
          "India",
        password:
          form.password,

        ...(selectedRole ===
          "pandit"
          ? {
              title:
                form.title.trim(),
              experienceYears:
                form.experienceYears
                  .trim(),
              district:
                form.district.trim(),

              languages:
                csvToArray(
                  form.languages,
                ),

              specializations:
                csvToArray(
                  form.specializations,
                ),

              pujaTypes:
                csvToArray(
                  form.pujaTypes,
                ),

              associatedWith:
                form.associatedWith.trim(),

              about:
                form.about.trim(),

              availability:
                form.availability.trim(),

              serviceAreas:
                csvToArray(
                  form.serviceAreas,
                ),
            }
          : {}),

        ...(selectedRole ===
          "temple_manager"
          ? {
              designation:
                form.designation.trim(),

              organizationName:
                form.organizationName.trim(),
            }
          : {}),
      };

    try {
      const response =
        await register(
          payload,
        );

      setSuccessMessage(
        response.message,
      );

      /*
       * Visitor account is active immediately.
       * Professional accounts remain pending until
       * admin approval.
       */
      if (
        response.authenticated
      ) {
        nav(
          getDashboardPath(
            response.user
              .role,
          ),
        );

        return;
      }

      /*
       * For Pandit / Temple Manager:
       * stay on register screen and show
       * the pending approval message.
       */
      setForm(
        (current) => ({
          ...current,
          password: "",
          confirmPassword: "",
        }),
      );
    } catch {
      /*
       * AppContext exposes the error.
       */
    } finally {
      setSubmitted(
        false,
      );
    }
  };

  return (
    <Shell
      wide
      title="Join the DivyaDhara Parivaar"
      sub="One account for spiritual discovery, Pandit services and temple management."
    >
      {authError && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p className="font-bold">
            Registration could not be completed
          </p>

          <p className="mt-1">
            {authError}
          </p>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-bold">
              Registration submitted
            </p>

            <p className="mt-1">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* =======================================================
          ROLE SELECTOR
      ======================================================= */}

      <div>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">
              Choose account type
            </p>

            <h2 className="font-display mt-1 text-xl font-semibold text-[#2a1a10]">
              How will you use DivyaDhara?
            </h2>
          </div>

          <span className="hidden text-xs text-stone-400 sm:block">
            Select one role
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {ROLE_OPTIONS.map(
            (option) => {
              const Icon =
                option.icon;

              const active =
                selectedRole ===
                option.role;

              return (
                <button
                  key={
                    option.role
                  }
                  type="button"
                  onClick={() => {
                    setSelectedRole(
                      option.role,
                    );
                    clearAuthError();
                    setSuccessMessage(
                      null,
                    );
                  }}
                  className={`group rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-900/5 ring-2 ring-orange-200"
                      : "border-orange-900/10 bg-white hover:border-orange-300 hover:bg-orange-50/40"
                  }`}
                  aria-pressed={
                    active
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        active
                          ? "bg-orange-600 text-white"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      <Icon
                        size={18}
                      />
                    </span>

                    <div className="min-w-0">
                      <p className="font-bold text-[#2a1a10]">
                        {
                          option.label
                        }
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-stone-500">
                        {
                          option.description
                        }
                      </p>
                    </div>
                  </div>
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* =======================================================
          REGISTRATION FORM
      ======================================================= */}

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-8 space-y-6"
      >
        {/* ---------------------------------------------------
            Common Details
        --------------------------------------------------- */}

        <section>
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">
              Account details
            </p>

            <p className="mt-1 text-sm text-stone-500">
              Basic information for your
              DivyaDhara account.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="register-name"
              >
                Full name *
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-3.5 text-orange-500"
                />

                <input
                  id="register-name"
                  required
                  autoComplete="name"
                  value={
                    form.name
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "name",
                      event.target
                        .value,
                    )
                  }
                  placeholder="e.g. Ananya Sharma"
                  className={
                    inputWithIconClass
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="register-email"
              >
                Email *
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-3.5 text-orange-500"
                />

                <input
                  id="register-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={
                    form.email
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "email",
                      event.target
                        .value,
                    )
                  }
                  placeholder="you@example.com"
                  className={
                    inputWithIconClass
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="register-phone"
              >
                Mobile *
              </label>

              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-3.5 text-orange-500"
                />

                <input
                  id="register-phone"
                  required
                  type="tel"
                  autoComplete="tel"
                  value={
                    form.phone
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "phone",
                      event.target
                        .value,
                    )
                  }
                  placeholder="+91 98XXXXXXXX"
                  className={
                    inputWithIconClass
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="register-city"
              >
                City *
              </label>

              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-3.5 text-orange-500"
                />

                <input
                  id="register-city"
                  required
                  value={
                    form.city
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "city",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Your city"
                  className={
                    inputWithIconClass
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="register-state"
              >
                State
              </label>

              <input
                id="register-state"
                value={
                  form.state
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "state",
                    event.target
                      .value,
                  )
                }
                placeholder="Maharashtra"
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="register-country"
              >
                Country
              </label>

              <input
                id="register-country"
                value={
                  form.country
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "country",
                    event.target
                      .value,
                  )
                }
                className={
                  inputClass
                }
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------
            Security
        --------------------------------------------------- */}

        <section>
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">
              Account security
            </p>

            <p className="mt-1 text-sm text-stone-500">
              Use at least 8 characters.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="register-password"
              >
                Password *
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-3.5 text-orange-500"
                />

                <input
                  id="register-password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    form.password
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "password",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Minimum 8 characters"
                  className={`${inputWithIconClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-orange-50 hover:text-orange-700"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={16}
                    />
                  ) : (
                    <Eye
                      size={16}
                    />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="register-confirm-password"
              >
                Confirm password *
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-3.5 text-orange-500"
                />

                <input
                  id="register-confirm-password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    form.confirmPassword
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "confirmPassword",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Re-enter password"
                  className={`${inputWithIconClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-orange-50 hover:text-orange-700"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={16}
                    />
                  ) : (
                    <Eye
                      size={16}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------
            Pandit Fields
        --------------------------------------------------- */}

        {selectedRole ===
          "pandit" && (
          <section className="rounded-3xl border border-orange-200 bg-orange-50/50 p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-600 text-white">
                <GraduationCap
                  size={18}
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">
                  Pandit profile
                </p>

                <h3 className="font-display mt-1 text-xl font-semibold text-[#2a1a10]">
                  Build your public
                  Pandit listing
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  Your profile will remain
                  pending until it has been
                  reviewed and approved.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-title"
                >
                  Title / Acharya designation
                </label>

                <input
                  id="pandit-title"
                  value={
                    form.title
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "title",
                      event.target
                        .value,
                    )
                  }
                  placeholder="e.g. Vedic Acharya · Rudrabhishek Specialist"
                  className={
                    inputClass
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-experience"
                >
                  Experience (years)
                </label>

                <input
                  id="pandit-experience"
                  type="number"
                  min={0}
                  max={100}
                  value={
                    form.experienceYears
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "experienceYears",
                      event.target
                        .value,
                    )
                  }
                  placeholder="e.g. 15"
                  className={
                    inputClass
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-district"
                >
                  District
                </label>

                <input
                  id="pandit-district"
                  value={
                    form.district
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "district",
                      event.target
                        .value,
                    )
                  }
                  placeholder="e.g. Varanasi"
                  className={
                    inputClass
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-languages"
                >
                  Languages
                </label>

                <input
                  id="pandit-languages"
                  value={
                    form.languages
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "languages",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Hindi, Sanskrit, English"
                  className={
                    inputClass
                  }
                />

                <p className="mt-1 text-[10px] text-stone-400">
                  Separate multiple
                  languages with commas.
                </p>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-specializations"
                >
                  Specializations
                </label>

                <input
                  id="pandit-specializations"
                  value={
                    form.specializations
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "specializations",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Rudrabhishek, Vivah Sanskar"
                  className={
                    inputClass
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-puja-types"
                >
                  Puja types
                </label>

                <input
                  id="pandit-puja-types"
                  value={
                    form.pujaTypes
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "pujaTypes",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Havan, Rudrabhishek, Marriage"
                  className={
                    inputClass
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-associated"
                >
                  Associated with
                </label>

                <input
                  id="pandit-associated"
                  value={
                    form.associatedWith
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "associatedWith",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Temple / tradition / parampara"
                  className={
                    inputClass
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-availability"
                >
                  Availability
                </label>

                <input
                  id="pandit-availability"
                  value={
                    form.availability
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "availability",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Mon-Sat · Advance booking 2 days"
                  className={
                    inputClass
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-service-areas"
                >
                  Service areas
                </label>

                <input
                  id="pandit-service-areas"
                  value={
                    form.serviceAreas
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "serviceAreas",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Varanasi, Kashi, nearby areas"
                  className={
                    inputClass
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="pandit-about"
                >
                  About you
                </label>

                <textarea
                  id="pandit-about"
                  rows={5}
                  value={
                    form.about
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "about",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Tell devotees about your training, ritual practice and services."
                  className={
                    inputClass
                  }
                />
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------
            Temple Manager Fields
        --------------------------------------------------- */}

        {selectedRole ===
          "temple_manager" && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white">
                <Building2
                  size={18}
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">
                  Temple management
                </p>

                <h3 className="font-display mt-1 text-xl font-semibold text-[#2a1a10]">
                  Tell us about your temple role
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  Temple Manager accounts require
                  admin review and temple assignment.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="manager-designation"
                >
                  Designation
                </label>

                <input
                  id="manager-designation"
                  value={
                    form.designation
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "designation",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Temple Manager / Trust Representative"
                  className={
                    inputClass
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-stone-600"
                  htmlFor="manager-organization"
                >
                  Temple / Organisation name
                </label>

                <input
                  id="manager-organization"
                  value={
                    form.organizationName
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "organizationName",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Temple or trust name"
                  className={
                    inputClass
                  }
                />
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------
            Selected Role Summary
        --------------------------------------------------- */}

        <div className="rounded-2xl bg-[#2a1a10] p-4 text-white">
          <div className="flex items-start gap-3">
            <selectedRoleConfig.icon
              size={18}
              className="mt-0.5 shrink-0 text-amber-300"
            />

            <div>
              <p className="text-sm font-bold">
                {
                  selectedRoleConfig.label
                }
              </p>

              <p className="mt-1 text-xs leading-relaxed text-stone-300">
                {
                  selectedRoleConfig.description
                }
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------
            Submit
        --------------------------------------------------- */}

        <button
          type="submit"
          disabled={
            isLoading ||
            submitted
          }
          className="btn-saffron flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ||
          submitted ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus
                size={16}
              />
              Create Account
              <ArrowRight
                size={15}
              />
            </>
          )}
        </button>

        <p className="text-center text-[13px] text-stone-500">
          Already a member?{" "}
          <Link
            to="/login"
            className="font-bold text-orange-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </Shell>
  );
}

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
*/

export function Forgot() {
  useSEO({
    title:
      "Forgot Password — DivyaDhara",
    description:
      "Request a secure password reset for your DivyaDhara account.",
    path: "/forgot-password",
  });

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    done,
    setDone,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /*
   * Development token.
   *
   * The backend currently returns a reset token
   * in development so the flow can be tested
   * before an email provider is connected.
   */
  const [
    developmentToken,
    setDevelopmentToken,
  ] = useState("");

  const [
    resetMode,
    setResetMode,
  ] = useState(false);

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmNewPassword,
    setConfirmNewPassword,
  ] = useState("");

  const [
    resetLoading,
    setResetLoading,
  ] = useState(false);

  const [
    resetDone,
    setResetDone,
  ] = useState(false);

  const handleRequestReset =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError(null);
      setLoading(true);

      try {
        const response =
          await fetch(
            `${(
              import.meta.env
                .VITE_API_URL ||
              "http://localhost:3001"
            ).replace(
              /\/+$/,
              "",
            )}/api/auth/forgot-password`,
            {
              method:
                "POST",
              credentials:
                "include",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              body: JSON.stringify(
                {
                  email:
                    email.trim(),
                },
              ),
            },
          );

        const data =
          (await response.json()) as {
            success?: boolean;
            message?: string;
            error?: string;
            resetToken?: string;
          };

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to request password reset.",
          );
        }

        setDone(true);

        if (
          import.meta.env
            .DEV &&
          data.resetToken
        ) {
          setDevelopmentToken(
            data.resetToken,
          );
          setResetMode(true);
        }
      } catch (requestError) {
        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to request password reset.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleResetPassword =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError(null);

      if (
        !developmentToken
      ) {
        setError(
          "Reset token is missing.",
        );

        return;
      }

      if (
        newPassword.length <
        8
      ) {
        setError(
          "Password must contain at least 8 characters.",
        );

        return;
      }

      if (
        newPassword !==
        confirmNewPassword
      ) {
        setError(
          "Password and confirm password do not match.",
        );

        return;
      }

      setResetLoading(
        true,
      );

      try {
        const response =
          await fetch(
            `${(
              import.meta.env
                .VITE_API_URL ||
              "http://localhost:3001"
            ).replace(
              /\/+$/,
              "",
            )}/api/auth/reset-password`,
            {
              method:
                "POST",
              credentials:
                "include",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              body: JSON.stringify(
                {
                  token:
                    developmentToken,
                  password:
                    newPassword,
                },
              ),
            },
          );

        const data =
          (await response.json()) as {
            success?: boolean;
            message?: string;
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to reset password.",
          );
        }

        setResetDone(
          true,
        );

        setNewPassword(
          "",
        );

        setConfirmNewPassword(
          "",
        );
      } catch (resetError) {
        setError(
          resetError instanceof
            Error
            ? resetError.message
            : "Unable to reset password.",
        );
      } finally {
        setResetLoading(
          false,
        );
      }
    };

  return (
    <Shell
      title="Reset Password"
      sub="Request a secure password reset for your DivyaDhara account."
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {resetDone ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2
              size={28}
              className="mx-auto text-emerald-600"
            />

            <p className="mt-3 text-sm font-bold text-emerald-900">
              Password reset successful
            </p>

            <p className="mt-1 text-xs leading-relaxed text-emerald-800">
              Your password has been updated.
              Please login again.
            </p>
          </div>

          <Link
            to="/login"
            className="btn-saffron flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white"
          >
            Go to Login
            <ArrowRight
              size={15}
            />
          </Link>
        </div>
      ) : resetMode &&
        developmentToken ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-900">
              Development password reset
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              Email delivery is not connected
              yet. The backend supplied a
              temporary development token.
            </p>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-bold text-stone-600"
              htmlFor="dev-reset-token"
            >
              Reset token
            </label>

            <input
              id="dev-reset-token"
              readOnly
              value={
                developmentToken
              }
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          <form
            onSubmit={
              handleResetPassword
            }
            className="space-y-4"
          >
            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="new-password"
              >
                New password
              </label>

              <input
                id="new-password"
                required
                minLength={8}
                type="password"
                value={
                  newPassword
                }
                onChange={(
                  event,
                ) =>
                  setNewPassword(
                    event.target
                      .value,
                  )
                }
                placeholder="Minimum 8 characters"
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-stone-600"
                htmlFor="confirm-new-password"
              >
                Confirm new password
              </label>

              <input
                id="confirm-new-password"
                required
                minLength={8}
                type="password"
                value={
                  confirmNewPassword
                }
                onChange={(
                  event,
                ) =>
                  setConfirmNewPassword(
                    event.target
                      .value,
                  )
                }
                placeholder="Re-enter new password"
                className={
                  inputClass
                }
              />
            </div>

            <button
              type="submit"
              disabled={
                resetLoading
              }
              className="btn-saffron flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {resetLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Updating password...
                </>
              ) : (
                <>
                  <Lock
                    size={15}
                  />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      ) : done ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2
              size={28}
              className="mx-auto text-emerald-600"
            />

            <p className="mt-3 text-sm font-bold text-emerald-900">
              Reset request received
            </p>

            <p className="mt-1 text-xs leading-relaxed text-emerald-800">
              If an account exists for{" "}
              <strong>
                {email}
              </strong>
              , a reset link will be sent.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDone(false);
              setEmail("");
              setError(null);
            }}
            className="w-full rounded-xl border border-orange-900/10 bg-stone-50 px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
          >
            Request another reset
          </button>

          <p className="text-center text-[13px]">
            <Link
              to="/login"
              className="font-bold text-orange-700 hover:underline"
            >
              ← Back to login
            </Link>
          </p>
        </div>
      ) : (
        <form
          onSubmit={
            handleRequestReset
          }
          className="space-y-4"
        >
          <div>
            <label
              className="mb-1.5 block text-xs font-bold text-stone-600"
              htmlFor="forgot-email"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-3.5 text-orange-500"
              />

              <input
                id="forgot-email"
                required
                type="email"
                autoComplete="email"
                value={
                  email
                }
                onChange={(
                  event,
                ) => {
                  setEmail(
                    event.target
                      .value,
                  );
                  setError(null);
                }}
                placeholder="you@example.com"
                className={
                  inputWithIconClass
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-saffron flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending request...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight
                  size={15}
                />
              </>
            )}
          </button>

          <p className="text-center text-[13px]">
            <Link
              to="/login"
              className="font-bold text-orange-700 hover:underline"
            >
              ← Back to login
            </Link>
          </p>

          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck
              size={13}
            />
            We do not reveal whether an
            email is registered.
          </p>
        </form>
      )}
    </Shell>
  );
}