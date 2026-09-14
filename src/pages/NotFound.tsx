import { Link } from "react-router-dom";
import { SearchX, ArrowLeft, Compass } from "lucide-react";
import { useSEO } from "../lib/seo";

export default function NotFound() {
  useSEO({ title: "Page Not Found (404) | DivyaDhara", description: "This page has moved or doesn't exist. Explore temples, pujas, yatras and Panchang.", path: "/404" });
  return (
    <div className="relative overflow-hidden bg-cream-50 px-4 py-24 text-center">
      <div className="mandala-bg absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-lg">
        <p className="font-sanskrit text-6xl text-orange-300">ॐ</p>
        <p className="font-display mt-2 text-7xl font-bold text-orange-800">404</p>
        <h1 className="font-display mt-2 text-2xl font-semibold">This path leads elsewhere, yatri.</h1>
        <p className="mt-2 flex items-center justify-center gap-2 text-stone-500"><SearchX size={16} /> The page you seek has moved or never existed.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link to="/" className="flex items-center gap-1.5 rounded-2xl bg-[#2a1a10] px-6 py-3 text-sm font-bold text-amber-200"><ArrowLeft size={15} /> Home</Link>
          <Link to="/temples" className="btn-saffron rounded-2xl px-6 py-3 text-sm font-bold text-white">Temples</Link>
          <Link to="/packages" className="flex items-center gap-1.5 rounded-2xl border border-orange-700/25 bg-white px-6 py-3 text-sm font-bold text-orange-900"><Compass size={15} /> Yatras</Link>
        </div>
      </div>
    </div>
  );
}
