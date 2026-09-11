import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { TEMPLES, STATES, CATEGORIES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal, Empty } from "../components/ui";
import { TempleCard } from "../components/cards";
import { PageHero } from "../components/blocks";

export default function Temples() {
  useSEO({ title: "Temples of India — Darshan Timings, Aarti & History | DivyaDhara", description: "Explore Jyotirlingas, Char Dham seats & heritage temples: darshan timings, aartis, festivals, history and how to reach — with Sugam darshan assistance.", path: "/temples", image: "/images/hero-varanasi.jpeg" });
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [cat, setCat] = useState("");
  const list = useMemo(() => TEMPLES.filter((t) =>
    (!q || (t.name + t.city + t.deity + t.state).toLowerCase().includes(q.toLowerCase())) &&
    (!state || t.state === state) && (!cat || t.category.includes(cat))
  ), [q, state, cat]);
  const sel = "rounded-xl border border-orange-900/15 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-orange-500";
  return (
    <>
      <PageHero eyebrow="Sacred Kshetras · Mandir" title="Temples of Bharat" sub="Jyotirlingas, Char Dham dhams and living heritage — darshan timings, aartis, festivals and pilgrim guidance." image="/images/hero-varanasi.jpeg">
        <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">{TEMPLES.length} featured kshetras · 1200+ documented</span>
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Temples" }]} />
        <Reveal className="mt-6 rounded-3xl border border-orange-900/10 bg-white p-4 shadow-lg shadow-orange-900/5 md:p-5">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
            <label className="flex items-center gap-2 rounded-xl border border-orange-900/15 bg-orange-50/50 px-3.5 py-2.5">
              <Search size={16} className="shrink-0 text-orange-600" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search temple, deity, city…" className="w-full bg-transparent text-sm outline-none" aria-label="Search temples" />
            </label>
            <select value={state} onChange={(e) => setState(e.target.value)} className={sel} aria-label="Filter by state"><option value="">All States</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={sel} aria-label="Filter by category"><option value="">All Categories</option>{CATEGORIES.map((s) => <option key={s}>{s}</option>)}</select>
            <button onClick={() => { setQ(""); setState(""); setCat(""); }} className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-200"><SlidersHorizontal size={15} /> Reset</button>
          </div>
        </Reveal>
        <p className="mt-6 flex items-center gap-1.5 text-sm text-stone-500" role="status"><MapPin size={14} className="text-orange-600" /> Showing <strong className="text-stone-800">{list.length}</strong> kshetras</p>
        {list.length === 0 ? <div className="mt-6"><Empty title="No temples match your search" sub="Try a different deity, city or category — or ask our seva guides on WhatsApp and we'll help you find the right kshetra." action={<Link to="/contact" className="btn-saffron rounded-xl px-6 py-3 text-sm font-bold text-white">Ask a Seva Guide</Link>} /></div> : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((t, i) => <TempleCard key={t.slug} t={t} i={i} />)}
          </div>
        )}
      </div>
    </>
  );
}
