import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Layout from "./components/Layout";
import { AppProvider } from "./context/AppContext";

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

import {
  Login,
  Register,
  Forgot,
} from "./pages/Auth";

import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

/**
 * Keeps the user at the top when moving between pages.
 * This is especially helpful for detail pages and mobile navigation.
 */
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname, search]);

  return null;
}

/**
 * Central application routing for DivyaDhara.
 *
 * Route groups:
 * - Dharma: temples, puja services, pandits, ashrams
 * - Panchang & Jyotish: panchang, calendar, rashifal, kundli, gochar
 * - Yatra: packages, spiritual places, events, gallery, videos
 * - Learn: courses and articles
 * - Account: login, register, dashboard
 */
function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<Layout />}>

          {/* =================================================
              HOME
          ================================================== */}
          <Route index element={<Home />} />

          {/* =================================================
              DHARMA — TEMPLES
          ================================================== */}
          <Route path="temples" element={<Temples />} />
          <Route path="temples/:slug" element={<TempleDetail />} />

          {/* Friendly/legacy singular URL */}
          <Route
            path="temple/:slug"
            element={<Navigate to="/temples" replace />}
          />

          {/* =================================================
              DHARMA — PUJA SERVICES
          ================================================== */}
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />

          {/* Friendly alternate URL */}
          <Route
            path="puja-services"
            element={<Navigate to="/services" replace />}
          />

          {/* =================================================
              DHARMA — PANDITS
          ================================================== */}
          <Route path="pandits" element={<Pandits />} />
          <Route path="pandits/:slug" element={<PanditDetail />} />

          <Route
            path="pandit/:slug"
            element={<Navigate to="/pandits" replace />}
          />

          {/* =================================================
              DHARMA — ASHRAMS
          ================================================== */}
          <Route path="ashrams" element={<AshramList />} />
          <Route path="ashrams/:slug" element={<AshramDetail />} />

          {/* =================================================
              LEARN — COURSES
          ================================================== */}
          <Route path="courses" element={<CourseList />} />
          <Route path="courses/:slug" element={<CourseDetail />} />

          {/* =================================================
              PANCHANG / CALENDAR / RASHIFAL / KUNDLI / GOCHAR
              All five views are handled by the Panchang page.
              The page can use the current route to select the
              correct module/tab.
          ================================================== */}
          <Route path="panchang" element={<PanchangPage />} />
          <Route path="calendar" element={<PanchangPage />} />
          <Route path="rashifal" element={<PanchangPage />} />
          <Route path="kundli" element={<PanchangPage />} />
          <Route path="gochar" element={<PanchangPage />} />

          {/* Friendly astrology aliases */}
          <Route
            path="jyotish"
            element={<Navigate to="/kundli" replace />}
          />
          <Route
            path="horoscope"
            element={<Navigate to="/rashifal" replace />}
          />

          {/* =================================================
              YATRA — EVENTS
          ================================================== */}
          <Route path="events" element={<EventList />} />
          <Route path="events/:slug" element={<EventDetail />} />

          {/* =================================================
              YATRA — SPIRITUAL PLACES
          ================================================== */}
          <Route path="spiritual-places" element={<Places />} />
          <Route
            path="spiritual-places/:slug"
            element={<PlaceDetail />}
          />

          {/* Friendly alternate URL */}
          <Route
            path="places"
            element={<Navigate to="/spiritual-places" replace />}
          />

          {/* =================================================
              YATRA — PACKAGES
          ================================================== */}
          <Route path="packages" element={<Packages />} />
          <Route
            path="packages/:slug"
            element={<PackageDetail />}
          />
          <Route
            path="packages/:slug/enquiry"
            element={<PackageEnquiry />}
          />

          {/* Friendly alternate URL */}
          <Route
            path="yatra-packages"
            element={<Navigate to="/packages" replace />}
          />

          {/* =================================================
              MEDIA
          ================================================== */}
          <Route path="gallery" element={<Gallery />} />
          <Route path="videos" element={<Videos />} />
          <Route path="articles" element={<Articles />} />
          <Route
            path="articles/:slug"
            element={<ArticleDetail />}
          />

          {/* =================================================
              INFORMATION
          ================================================== */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />

          {/* =================================================
              AUTHENTICATION
          ================================================== */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="forgot-password"
            element={<Forgot />}
          />

          {/* =================================================
              USER DASHBOARD
          ================================================== */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* =================================================
              404
          ================================================== */}
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
