import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { AppProvider } from "./context/AppContext";
import Home from "./pages/Home";
import Temples from "./pages/Temples";
import TempleDetail from "./pages/TempleDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Pandits from "./pages/Pandits";
import PanditDetail from "./pages/PanditDetail";
import AshramList, { AshramDetail } from "./pages/Ashrams";
import { CourseList, CourseDetail } from "./pages/Courses";
import { Places, Packages, PlaceDetail, PackageDetail, PackageEnquiry } from "./pages/Yatra";
import { EventList, EventDetail } from "./pages/Events";
import { PanchangPage, CalendarPage } from "./pages/Panchang";
import { Gallery, Videos, Articles, ArticleDetail } from "./pages/Media";
import { About, Contact } from "./pages/Info";
import { Login, Register, Forgot } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="temples" element={<Temples />} />
            <Route path="temples/:slug" element={<TempleDetail />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:slug" element={<ServiceDetail />} />
            <Route path="pandits" element={<Pandits />} />
            <Route path="pandits/:slug" element={<PanditDetail />} />
            <Route path="ashrams" element={<AshramList />} />
            <Route path="ashrams/:slug" element={<AshramDetail />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/:slug" element={<CourseDetail />} />
            <Route path="panchang" element={<PanchangPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="events" element={<EventList />} />
            <Route path="events/:slug" element={<EventDetail />} />
            <Route path="spiritual-places" element={<Places />} />
            <Route path="spiritual-places/:slug" element={<PlaceDetail />} />
            <Route path="packages" element={<Packages />} />
            <Route path="packages/:slug" element={<PackageDetail />} />
            <Route path="packages/:slug/enquiry" element={<PackageEnquiry />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="videos" element={<Videos />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/:slug" element={<ArticleDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<Forgot />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
