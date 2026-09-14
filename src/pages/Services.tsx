/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { SERVICES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, SectionHead, Empty } from "../components/ui";
import { ServiceCard } from "../components/cards";
import { PageHero } from "../components/blocks";

const CATS = ["Pandit Booking", "Car Puja", "Bhoomi Puja", "Griha/House Puja", "Marriage/Vivah", "Havan", "Satyanarayan Puja", "Other Puja"];

export default function Services() {
  useSEO({ title: "Puja Services — Pandit Booking, Griha Pravesh, Havan, Vivah | DivyaDhara", description: "Book verified pandits for Griha Pravesh, Rudrabhishek, Havan, Satyanarayan Katha, Vivah, Bhoomi & Car puja — at home or kshetra, with muhurat & samagri.", path: "/services" });
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const list = SERVICES.filter((s) => (!cat || s.category === cat) && (!q || s.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <PageHero eyebrow="Sevas · Home & Kshetra" title="Puja Services" sub="Shastra-true vidhi with verified pandits, transparent pricing and muhurat guidance — at your home or the sacred kshetra." image="/images/puja-thali.jpeg" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Puja Services" }]} />
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-2xl border border-orange-900/15 bg-white px-4 py-3"><Search size={16} className="text-orange-600" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search puja… (e.g., havan, griha, vivah)" className="w-full bg-transparent text-sm outline-none" aria-label="Search pujas" /></label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCat("")} className={`rounded-full px-4 py-2.5 text-[13px] font-bold transition ${!cat ? "bg-[#2a1a10] text-amber-200" : "bg-white text-stone-600 ring-1 ring-orange-900/15"}`}>All</button>
            {CATS.map((c) => <button key={c} onClick={() => setCat(c === cat ? "" : c)} className={`rounded-full px-4 py-2.5 text-[13px] font-bold transition ${cat === c ? "bg-orange-700 text-white" : "bg-white text-stone-600 ring-1 ring-orange-900/15 hover:ring-orange-400"}`}>{c}</button>)}
          </div>
        </div>
        {list.length === 0 ? <div className="mt-8"><Empty title="No puja found" sub="Tell us the sanskar you need — our acharyas cover 40+ vedic rituals beyond this list." /></div> :
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{list.map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />)}</div>}
        <div className="mt-14"><SectionHead eyebrow="How it works" title="Booking in 3 simple steps" />
          <div className="grid gap-4 md:grid-cols-3">
            {["Tell us your need on WhatsApp or the enquiry form — city, language, date.", "Receive muhurat options, pandit profile & transparent samagri list.", "Welcome the pandit; sankalpa in your gotra-naam; prasad & guidance after."].map((s, i) => (
              <div key={i} className="rounded-3xl border border-orange-900/10 bg-white p-6 text-center sacred-border"><p className="font-display mx-auto grid h-12 w-12 place-items-center rounded-full bg-linear-to-br from-orange-600 to-amber-500 text-xl font-bold text-white">{i + 1}</p><p className="mt-3 text-sm leading-relaxed text-stone-600">{s}</p></div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-stone-500">Need something custom? <Link to="/contact" className="font-bold text-orange-700 underline">Talk to us</Link> — Kaalsarp, Navagraha, Chandi Path & more.</p>
        </div>
      </div>
    </>
  );
}
