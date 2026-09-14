/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PANDITS } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Empty } from "../components/ui";
import { PanditCard } from "../components/cards";
import { PageHero } from "../components/blocks";

export default function Pandits() {
  useSEO({ title: "Verified Pandits — Rudrabhishek, Havan, Vivah | DivyaDhara", description: "Meet verified Vedic pandits across Kashi, Ujjain, Tirupati, Puri & more. Filter by language, specialization & puja. Transparent pricing, muhurat included.", path: "/pandits" });
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("");
  const [spec, setSpec] = useState("");
  const langs = [...new Set(PANDITS.flatMap((p) => p.languages))];
  const specs = [...new Set(PANDITS.flatMap((p) => p.specializations))];
  const list = PANDITS.filter((p) => (!q || (p.name + p.location).toLowerCase().includes(q.toLowerCase())) && (!lang || p.languages.includes(lang)) && (!spec || p.specializations.includes(spec)));
  const sel = "rounded-xl border border-orange-900/15 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-orange-500";
  return (
    <>
      <PageHero eyebrow="Acharyas · Verified" title="Pandits You Can Trust" sub="Parampara-trained and identity-verified. Personal contact shared only after confirmed booking — your privacy and theirs, protected." image="/images/pandit-portrait.jpeg" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pandits" }]} />
        <div className="mt-6 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <label className="flex items-center gap-2 rounded-xl border border-orange-900/15 bg-white px-3.5 py-2.5"><Search size={16} className="text-orange-600" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or city…" className="w-full bg-transparent text-sm outline-none" aria-label="Search pandits" /></label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={sel} aria-label="Language"><option value="">All Languages</option>{langs.map((l) => <option key={l}>{l}</option>)}</select>
          <select value={spec} onChange={(e) => setSpec(e.target.value)} className={sel} aria-label="Specialization"><option value="">All Specializations</option>{specs.map((l) => <option key={l}>{l}</option>)}</select>
        </div>
        <p className="mt-5 text-sm text-stone-500" role="status">Showing <strong className="text-stone-800">{list.length}</strong> verified acharyas</p>
        {list.length === 0 ? <div className="mt-6"><Empty title="No pandits match" sub="We onboard acharyas weekly. Tell us your city & language — we'll connect you within a day." /></div> :
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map((p, i) => <PanditCard key={p.slug} p={p} i={i} />)}</div>}
        <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-sm leading-relaxed text-emerald-950 md:p-8">
          <h2 className="font-display text-xl font-semibold">How we verify pandits</h2>
          <p className="mt-2">Every acharya shares government ID, parampara/guru reference and a recorded mantra-path sample reviewed by our Vedic board. We publish experience honestly and never fabricate reviews — trust is our real prasad.</p>
        </div>
      </div>
    </>
  );
}
