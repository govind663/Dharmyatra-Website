import {
  useEffect,
  type ReactNode,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Layout from "./components/Layout";
import {
  AppProvider,
  useApp,
} from "./context/AppContext";

/* ============================================================================
 * PUBLIC / MAIN PAGES
 * ========================================================================== */

import Home from "./pages/Home";

import Temples from "./pages/Temples";
import TempleDetail from "./pages/TempleDetail";

import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";

import Pandits from "./pages/Pandits";
import PanditDetail from "./pages/PanditDetail";

import AshramList, {
  AshramDetail,
} from "./pages/Ashrams";

import {
  CourseList,
  CourseDetail,
} from "./pages/Courses";

import {
  Places,
  Packages,
  PlaceDetail,
  PackageDetail,
  PackageEnquiry,
} from "./pages/Yatra";

import {
  EventList,
  EventDetail,
} from "./pages/Events";

import { PanchangPage } from "./pages/Panchang";

import {
  Gallery,
  Videos,
  Articles,
  ArticleDetail,
} from "./pages/Media";

import {
  About,
  Contact,
} from "./pages/Info";

/* ============================================================================
 * AUTH
 * ========================================================================== */

import {
  Login,
  Register,
  Forgot,
} from "./pages/Auth";

/* ============================================================================
 * ACCOUNT
 * ========================================================================== */

import Dashboard from "./pages/Dashboard";

/* ============================================================================
 * ADMIN
 * ========================================================================== */

import AdminDashboard from "./pages/AdminDashboard";

/* ============================================================================
 * FALLBACK
 * ========================================================================== */

import NotFound from "./pages/NotFound";

/* ============================================================================
 * SCROLL TO TOP
 * ========================================================================== */

/**
 * Keeps the user at the top whenever the route changes.
 *
 * Search params are included because Panchang and other pages may use
 * query-string driven state.
 */
function ScrollToTop() {
  const {
    pathname,
    search,
  } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [
    pathname,
    search,
  ]);

  return null;
}

/* ============================================================================
 * AUTH / ROLE GUARDS
 * ========================================================================== */

type SupportedRole =
  | "visitor"
  | "pandit"
  | "temple_manager"
  | "sales"
  | "super_admin";

type RequireRoleProps = {
  roles: SupportedRole[];
  children: ReactNode;
};

/**
 * Protected role-based route guard.
 *
 * Behaviour:
 * - While auth state is loading -> lightweight loading screen
 * - No authenticated user -> /login
 * - Authenticated but wrong role -> /
 * - Correct role -> render requested page
 *
 * This guard is intentionally frontend navigation protection only.
 * The real security boundary remains the Express backend middleware.
 */
function RequireRole({
  roles,
  children,
}: RequireRoleProps) {
  const {
    user,
    isLoading,
  } = useApp();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fdfaf5] px-5">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-orange-800">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-300 border-t-orange-700" />
          </div>

          <h1 className="mt-4 font-display text-xl font-semibold text-[#2a1a10]">
            Verifying session
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Please wait while DivyaDhara
            verifies your account.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    !roles.includes(
      user.role as SupportedRole,
    )
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

/* ============================================================================
 * ROUTES
 * ========================================================================== */

function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ====================================================================
         * PUBLIC WEBSITE LAYOUT
         * ================================================================== */}

        <Route element={<Layout />}>
          {/* ------------------------------------------------------------------
           * HOME
           * ---------------------------------------------------------------- */}

          <Route
            index
            element={<Home />}
          />

          {/* ------------------------------------------------------------------
           * DHARMA — TEMPLES
           * ---------------------------------------------------------------- */}

          <Route
            path="temples"
            element={<Temples />}
          />

          <Route
            path="temples/:slug"
            element={<TempleDetail />}
          />

          <Route
            path="temple/:slug"
            element={
              <Navigate
                to="/temples"
                replace
              />
            }
          />

          {/* ------------------------------------------------------------------
           * DHARMA — PUJA SERVICES
           * ---------------------------------------------------------------- */}

          <Route
            path="services"
            element={<Services />}
          />

          <Route
            path="services/:slug"
            element={<ServiceDetail />}
          />

          <Route
            path="puja-services"
            element={
              <Navigate
                to="/services"
                replace
              />
            }
          />

          {/* ------------------------------------------------------------------
           * DHARMA — PANDITS
           * ---------------------------------------------------------------- */}

          <Route
            path="pandits"
            element={<Pandits />}
          />

          <Route
            path="pandits/:slug"
            element={<PanditDetail />}
          />

          <Route
            path="pandit/:slug"
            element={
              <Navigate
                to="/pandits"
                replace
              />
            }
          />

          {/* ------------------------------------------------------------------
           * DHARMA — ASHRAMS
           * ---------------------------------------------------------------- */}

          <Route
            path="ashrams"
            element={<AshramList />}
          />

          <Route
            path="ashrams/:slug"
            element={<AshramDetail />}
          />

          {/* ------------------------------------------------------------------
           * LEARN — COURSES
           * ---------------------------------------------------------------- */}

          <Route
            path="courses"
            element={<CourseList />}
          />

          <Route
            path="courses/:slug"
            element={<CourseDetail />}
          />

          {/* ------------------------------------------------------------------
           * PANCHANG / CALENDAR / RASHIFAL / KUNDLI / GOCHAR
           * ---------------------------------------------------------------- */}

          <Route
            path="panchang"
            element={<PanchangPage />}
          />

          <Route
            path="calendar"
            element={<PanchangPage />}
          />

          <Route
            path="rashifal"
            element={<PanchangPage />}
          />

          <Route
            path="kundli"
            element={<PanchangPage />}
          />

          <Route
            path="gochar"
            element={<PanchangPage />}
          />

          {/* ------------------------------------------------------------------
           * ASTROLOGY ALIASES
           * ---------------------------------------------------------------- */}

          <Route
            path="jyotish"
            element={
              <Navigate
                to="/kundli"
                replace
              />
            }
          />

          <Route
            path="horoscope"
            element={
              <Navigate
                to="/rashifal"
                replace
              />
            }
          />

          {/* ------------------------------------------------------------------
           * EVENTS
           * ---------------------------------------------------------------- */}

          <Route
            path="events"
            element={<EventList />}
          />

          <Route
            path="events/:slug"
            element={<EventDetail />}
          />

          {/* ------------------------------------------------------------------
           * SPIRITUAL PLACES
           * ---------------------------------------------------------------- */}

          <Route
            path="spiritual-places"
            element={<Places />}
          />

          <Route
            path="spiritual-places/:slug"
            element={<PlaceDetail />}
          />

          <Route
            path="places"
            element={
              <Navigate
                to="/spiritual-places"
                replace
              />
            }
          />

          {/* ------------------------------------------------------------------
           * YATRA PACKAGES
           * ---------------------------------------------------------------- */}

          <Route
            path="packages"
            element={<Packages />}
          />

          <Route
            path="packages/:slug"
            element={<PackageDetail />}
          />

          <Route
            path="packages/:slug/enquiry"
            element={<PackageEnquiry />}
          />

          <Route
            path="yatra-packages"
            element={
              <Navigate
                to="/packages"
                replace
              />
            }
          />

          {/* ------------------------------------------------------------------
           * MEDIA
           * ---------------------------------------------------------------- */}

          <Route
            path="gallery"
            element={<Gallery />}
          />

          <Route
            path="videos"
            element={<Videos />}
          />

          <Route
            path="articles"
            element={<Articles />}
          />

          <Route
            path="articles/:slug"
            element={<ArticleDetail />}
          />

          {/* ------------------------------------------------------------------
           * INFORMATION
           * ---------------------------------------------------------------- */}

          <Route
            path="about"
            element={<About />}
          />

          <Route
            path="contact"
            element={<Contact />}
          />

          {/* ------------------------------------------------------------------
           * AUTHENTICATION
           * ---------------------------------------------------------------- */}

          <Route
            path="login"
            element={<Login />}
          />

          <Route
            path="register"
            element={<Register />}
          />

          <Route
            path="forgot-password"
            element={<Forgot />}
          />

          {/* ------------------------------------------------------------------
           * VISITOR ACCOUNT
           * ----------------------------------------------------------------
           *
           * Dashboard component itself already handles the no-user case.
           * We keep this route inside the public Layout because the visitor
           * dashboard belongs to the normal website shell.
           * ---------------------------------------------------------------- */}

          <Route
            path="dashboard"
            element={<Dashboard />}
          />
        </Route>

        {/* ====================================================================
         * SUPER ADMIN AREA
         *
         * IMPORTANT:
         * This route is deliberately OUTSIDE the public Layout.
         *
         * AdminDashboard has its own:
         * - header
         * - sidebar
         * - navigation
         * - authentication UX
         *
         * Backend still protects /api/admin/* with:
         * requireAuth + requireRole("super_admin")
         * ================================================================== */}

        <Route
          path="admin/dashboard"
          element={
            <RequireRole
              roles={[
                "super_admin",
              ]}
            >
              <AdminDashboard />
            </RequireRole>
          }
        />

        {/* Friendly admin root URL */}

        <Route
          path="admin"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        {/* ====================================================================
         * 404
         *
         * This must remain last.
         * ================================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </>
  );
}

/* ============================================================================
 * APP ROOT
 * ========================================================================== */

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}