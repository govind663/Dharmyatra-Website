import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, Flame, Heart, Menu, Search, User, X, MessageCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { waLink, cx } from "../lib/utils";
import { TEMPLES, SERVICES, PLACES, PACKAGES } from "../data/content";

const LINKS: { label: string; href: string; children?: { label: string; href: string; desc?: string }[] }[] = [
  { label: "Home", href: "/" },
  { label: "Temples", href: "/temples" },
  { label: "Puja Services", href: "/services" },
  { label: "Pandits", href: "/pandits" },
  { label: "Ashrams", href: "/ashrams" },
  { label: "Courses", href: "/courses" },
  {
    label: "Panchang", href: "/panchang",
    children: [
      { label: "Today's Panchang", href: "/panchang", desc: "Tithi, Nakshatra, Rahukaal" },
      { label: "Festival Calendar", href: "/calendar", desc: "Ekadashi, Purnima, Vrath" },
    ],
  },
  { label: "Events", href: "/events" },
  {
    label: "Yatra", href: "/packages",
    children: [
      { label: "Yatra Packages", href: "/packages", desc: "Char Dham, Kashi, Tamil circuit" },
      { label: "Spiritual Places", href: "/spiritual-places", desc: "Jyotirlingas, Char Dham, cities" },
      { label: "Gallery", href: "/gallery", desc: "Temples, aarti, festivals" },
      { label: "Videos", href: "/videos", desc: "Darshan, katha, travel" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { user } = useApp();
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { setMobile(false); setSearchOpen(false); }, [loc.pathname]);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);

  const results = q.trim().length > 1 ? [
    ...TEMPLES.filter((t) => (t.name + t.city + t.state).toLowerCase().includes(q.toLowerCase())).slice(0, 3).map((t) => ({ label: t.name, sub: `${t.city}, ${t.state}`, href: `/temples/${t.slug}` })),
    ...SERVICES.filter((s) => (s.name + s.category).toLowerCase().includes(q.toLowerCase())).slice(0, 3).map((s) => ({ label: s.name, sub: s.category, href: `/services/${s.slug}` })),
    ...PLACES.filter((p) => (p.name + p.state).toLowerCase().includes(q.toLowerCase())).slice(0, 2).map((p) => ({ label: p.name, sub: p.type, href: `/spiritual-places/${p.slug}` })),
    ...PACKAGES.filter((p) => (p.name + p.destination).toLowerCase().includes(q.toLowerCase())).slice(0, 2).map((p) => ({ label: p.name, sub: p.duration, href: `/packages/${p.slug}` })),
  ] : [];

  return (
    <>
      {/* top sacred strip */}
      <div className="bg-gradient-to-r from-[#7c2d12] via-[#c2410c] to-[#7c2d12] text-center text-[12px] font-medium tracking-wide text-amber-100">
        <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5">
          <Flame size={13} className="diya-glow shrink-0 text-amber-300" />
          <span className="font-sanskrit text-[13px]">॥ सर्वे भवन्तु सुखिनः ॥</span>
          <span className="hidden sm:inline text-amber-200/90">— Dev Deepawali boats & Mahashivratri sevas now open for booking</span>
        </p>
      </div>

      <header className={cx("sticky top-0 z-50 transition-all duration-300", scrolled ? "glass-warm shadow-[0_10px_40px_-15px_rgba(154,52,18,0.4)] border-b border-orange-900/10" : "bg-[#fffdf7]/95 border-b border-orange-900/5")}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 md:px-6 lg:px-8">
          {/* logo */}
          <Link to="/" className="group flex items-center gap-2.5" aria-label="DivyaDhara home">
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-700 to-[#7c2d12] shadow-lg shadow-orange-600/30 transition group-hover:scale-105">
              <span className="font-sanskrit text-2xl leading-none text-amber-100">ॐ</span>
              <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-300/40" />
            </span>
            <span className="leading-tight">
              <span className="font-display block text-[19px] font-bold tracking-tight text-[#2a1a10]">Divya<span className="text-gradient-saffron">Dhara</span></span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-orange-700/80">Sacred Bharat Yatra</span>
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <div key={l.label} className="group relative">
                <NavLink to={l.href} className={({ isActive }) => cx("flex items-center gap-1 rounded-full px-3 py-2 text-[13.5px] font-semibold transition", isActive || (l.children && l.children.some((c) => loc.pathname === c.href)) ? "bg-orange-100 text-orange-900" : "text-stone-700 hover:bg-orange-50 hover:text-orange-900")}>
                  {l.label}{l.children && <ChevronDown size={13} className="opacity-60 transition group-hover:rotate-180" />}
                </NavLink>
                {l.children && (
                  <div className="invisible absolute left-0 top-full w-72 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-orange-900/10 bg-white p-2 shadow-2xl shadow-orange-900/15">
                      {l.children.map((c) => (
                        <Link key={c.href} to={c.href} className="block rounded-xl px-4 py-3 transition hover:bg-orange-50">
                          <span className="block text-sm font-bold text-stone-800">{c.label}</span>
                          {c.desc && <span className="block text-xs text-stone-500">{c.desc}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} aria-label="Search temples, pujas, yatras" className="grid h-10 w-10 place-items-center rounded-full border border-orange-900/15 bg-white text-stone-700 transition hover:border-orange-500 hover:text-orange-700">
              <Search size={17} />
            </button>
            <a href={waLink("Namaste DivyaDhara! I need guidance for darshan / puja / yatra.")} target="_blank" rel="noreferrer" className="btn-saffron hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-bold text-white sm:inline-flex">
              <MessageCircle size={15} /> WhatsApp
            </a>
            <Link to={user ? "/dashboard" : "/login"} className="hidden items-center gap-1.5 rounded-full border border-orange-700/25 bg-orange-50 px-4 py-2.5 text-[13px] font-bold text-orange-900 transition hover:bg-orange-100 sm:inline-flex">
              {user ? <Heart size={15} /> : <User size={15} />}{user ? user.name.split(" ")[0] : "Login"}
            </Link>
            <button onClick={() => setMobile(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full bg-[#2a1a10] text-amber-100 xl:hidden">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm xl:hidden" onClick={() => setMobile(false)}>
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 260 }} onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-hidden bg-[#fffdf7] shadow-2xl">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#7c2d12] via-[#c2410c] to-orange-600 px-6 pb-8 pt-6 text-white">
                <div className="mandala-bg absolute inset-0 opacity-20" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="font-sanskrit text-3xl text-amber-200">ॐ</p>
                    <p className="font-display mt-1 text-2xl font-bold">DivyaDhara</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/90">Sacred Bharat Yatra</p>
                  </div>
                  <button onClick={() => setMobile(false)} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><X size={18} /></button>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile">
                {LINKS.flatMap((l) => (l.children ? [{ label: l.label, href: l.href }, ...l.children] : [l])).filter((v, i, a) => a.findIndex((x) => x.href === v.href) === i).map((l) => (
                  <NavLink key={l.href + l.label} to={l.href} className={({ isActive }) => cx("mb-1 flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold transition", isActive ? "bg-orange-100 text-orange-900" : "text-stone-700 hover:bg-orange-50")}>
                    {l.label}<span className="text-orange-400">→</span>
                  </NavLink>
                ))}
              </nav>
              <div className="space-y-2 border-t border-orange-900/10 p-4">
                <a href={waLink("Namaste DivyaDhara!")} target="_blank" rel="noreferrer" className="btn-saffron flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold text-white"><MessageCircle size={17} /> WhatsApp Us</a>
                <Link to={user ? "/dashboard" : "/login"} className="flex items-center justify-center gap-2 rounded-2xl border border-orange-700/25 bg-orange-50 px-4 py-3.5 font-bold text-orange-900"><User size={17} />{user ? "My Dashboard" : "Login / Register"}</Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-[#1c1410]/60 p-4 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
            <motion.div initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="mx-auto mt-[8vh] max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center gap-3 border-b border-orange-900/10 px-5 py-4">
                <Search size={19} className="text-orange-600" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && results[0]) { nav(results[0].href); } }} placeholder="Search temples, pujas, places, yatras…" className="w-full bg-transparent text-[15px] outline-none placeholder:text-stone-400" aria-label="Search" />
                <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="grid h-9 w-9 place-items-center rounded-full bg-stone-100"><X size={16} /></button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-3">
                {q.trim().length < 2 ? (
                  <div className="px-3 py-6 text-center text-sm text-stone-500">
                    <p className="font-sanskrit text-2xl text-orange-300">ॐ</p>
                    <p className="mt-2">Try “Kashi”, “Rudrabhishek”, “Char Dham”, “Meenakshi”…</p>
                  </div>
                ) : results.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-stone-500">No matches found. <a className="font-bold text-orange-700 underline" href={waLink(`Namaste! I searched for "${q}" on DivyaDhara.`)} target="_blank" rel="noreferrer">Ask us on WhatsApp</a>.</p>
                ) : results.map((r) => (
                  <button key={r.href} onClick={() => nav(r.href)} className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-orange-50">
                    <span><span className="block text-sm font-bold text-stone-800">{r.label}</span><span className="block text-xs text-stone-500">{r.sub}</span></span>
                    <span className="text-orange-500">→</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-orange-900/10 bg-orange-50/60 px-5 py-3 text-xs text-stone-500">
                <Bell size={13} className="text-orange-600" /> Popular: Mahashivratri · Bhasma Aarti · Char Dham Heli · Sanskrit
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
