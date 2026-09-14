import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return (
    <div className="min-h-screen bg-cream-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-xl focus:bg-orange-700 focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
    </div>
  );
}
