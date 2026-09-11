import { useMemo, useState } from "react";
import { MoonStar, Sun, Clock, AlertTriangle, Sparkles, CalendarDays, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { computePanchang, monthCalendar } from "../lib/panchang";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal } from "../components/ui";
import { PageHero, WhatsAppBand } from "../components/blocks";

function Card({ title, icon, children, dark = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; dark?: boolean }) {
  return (
    <Reveal>
      <div className={`h-full rounded-3xl p-6 ${dark ? "bg-[#1c1410] text-white" : "border border-orange-900/10 bg-white sacred-border"}`}>
        <p className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] ${dark ? "text-amber-400" : "text-orange-700"}`}>{icon} {title}</p>
        <div className="mt-3">{children}</div>
      </div>
    </Reveal>
  );
}

export function PanchangPage() {
  useSEO({ title: "Today's Panchang — Tithi, Nakshatra, Rahukaal, Muhurat | DivyaDhara", description: "Daily Varanasi Panchang: tithi, nakshatra, yoga, karana, sunrise/sunset, Rahukaal, Abhijit muhurat, Choghadiya, Ekadashi–Purnima–Amavasya guidance.", path: "/panchang" });
  const [offset, setOffset] = useState(0);
  const p = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + offset); return computePanchang(d); }, [offset]);
  return (
    <>
      <PageHero eyebrow="Panchang · Daily Almanac" title="Today's Panchang" sub="Tithi, Nakshatra, Yoga, Karana, Rahukaal and shubh muhurat — computed fresh for Varanasi, guidance-grade." image="/images/aarti-night.jpeg">
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1.5 backdrop-blur">
          <button onClick={() => setOffset(offset - 1)} aria-label="Previous day" className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/15"><ChevronLeft size={17} /></button>
          <span className="min-w-[220px] text-center text-sm font-bold">{p.displayDate}</span>
          <button onClick={() => setOffset(offset + 1)} aria-label="Next day" className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/15"><ChevronRight size={17} /></button>
        </div>
        {offset !== 0 && <button onClick={() => setOffset(0)} className="rounded-2xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold backdrop-blur">Back to today</button>}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Panchang" }]} />
        {p.festivals.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{p.festivals.map((f) => <span key={f} className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-[13px] font-bold text-white shadow">✦ {f}</span>)}</div>}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card title="Vara (Weekday)" icon={<CalendarDays size={14} />}><p className="font-display text-2xl font-semibold text-[#2a1a10]">{p.vara}</p><p className="text-sm text-stone-500">Lord: {p.varaLord}</p></Card>
          <Card title="Tithi" icon={<MoonStar size={14} />} dark><p className="font-display text-2xl font-semibold text-amber-200">{p.tithi.name}</p><p className="text-sm text-stone-300">{p.tithi.paksha} · ends ~{p.tithi.ends}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${p.tithi.pct}%` }} /></div></Card>
          <Card title="Nakshatra" icon={<Sparkles size={14} />}><p className="font-display text-2xl font-semibold text-[#2a1a10]">{p.nakshatra.name} <span className="text-base text-stone-500">· Pada {p.nakshatra.pada}</span></p><p className="text-sm text-stone-500">Ends ~{p.nakshatra.ends}</p></Card>
          <Card title="Yoga & Karana" icon={<Info size={14} />}><p className="font-display text-xl font-semibold text-[#2a1a10]">{p.yoga.name} Yoga</p><p className="text-sm text-stone-500">{p.karana.name} Karana</p></Card>
          <Card title="Sun & Moon" icon={<Sun size={14} />}><p className="text-[15px] font-bold text-[#2a1a10]">Sunrise {p.sunrise} · Sunset {p.sunset}</p><p className="text-sm text-stone-500">Moonrise ~{p.moonrise}</p></Card>
          <Card title="Abhijit Muhurat (Shubh)" icon={<Sparkles size={14} />} dark><p className="font-display text-2xl font-semibold text-emerald-300">{p.abhijit}</p><p className="text-sm text-stone-300">Best window for beginnings today</p></Card>
          <Card title="Rahukaal (Avoid)" icon={<AlertTriangle size={14} />}><p className="font-display text-2xl font-semibold text-red-800">{p.rahukaal}</p><p className="text-sm text-stone-500">Yamaganda {p.yamaganda} · Gulika {p.gulika}</p></Card>
          <Card title="Day Choghadiya" icon={<Clock size={14} />}><div className="flex flex-wrap gap-1.5">{p.choghadiya.day.map((c, i) => <span key={i} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${c.kind === "good" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>{c.name}</span>)}</div><p className="mt-2 text-xs text-stone-500">{p.choghadiya.note}</p></Card>
          <Card title="Shubh · Avoid" icon={<Sun size={14} />}><p className="text-sm font-bold text-emerald-800">Shubh: {p.shubh.join(" · ")}</p><p className="mt-1.5 text-sm text-red-800">Avoid: {p.avoid.join(" · ")}</p></Card>
        </div>
        <Reveal className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 p-5 text-[13px] leading-relaxed text-stone-600">
          <strong className="text-[#3a2415]">How this Panchang is computed:</strong> sunrise/sunset use solar geometry for Varanasi (25.32°N, 82.99°E); tithi & nakshatra derive from calibrated synodic/anomalistic lunar cycles; Rahukaal/Yamaganda follow the classical weekday-slot system; Choghadiya follows the standard day sequence. Values are guidance-grade for daily devotion and muhurat shortlisting — final sanskar muhurats are confirmed by our acharyas from your janma details.
        </Reveal>
        <div className="mt-8"><WhatsAppBand title="Need a personal shubh muhurat?" sub="Share the purpose (vivah, griha pravesh, yatra) and birth details — an acharya replies with options, free." message="Namaste! Please suggest a shubh muhurat for my upcoming sanskar." /></div>
      </div>
    </>
  );
}

export function CalendarPage() {
  useSEO({ title: "Hindu Festival Calendar 2026–27 — Ekadashi, Purnima | DivyaDhara", description: "Monthly Hindu calendar with tithi markers: Ekadashi, Purnima, Amavasya, Mahashivratri, Diwali, Rath Yatra and vrats.", path: "/calendar" });
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const days = useMemo(() => monthCalendar(ym.y, ym.m), [ym]);
  const first = new Date(ym.y, ym.m, 1).getDay();
  const monthName = new Date(ym.y, ym.m, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
  const step = (d: number) => { const dt = new Date(ym.y, ym.m + d, 1); setYm({ y: dt.getFullYear(), m: dt.getMonth() }); };
  return (
    <>
      <PageHero eyebrow="Calendar · Utsav" title="Festival Calendar" sub="Tithi-marked months — Ekadashi, Purnima, Amavasya and the great festivals at a glance." image="/images/festival-crowd.jpeg" />
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Panchang", href: "/panchang" }, { label: "Calendar" }]} />
        <div className="mt-6 flex items-center justify-between rounded-3xl border border-orange-900/10 bg-white p-4">
          <button onClick={() => step(-1)} aria-label="Previous month" className="grid h-10 w-10 place-items-center rounded-full bg-orange-50 hover:bg-orange-100"><ChevronLeft size={18} /></button>
          <h2 className="font-display text-2xl font-semibold">{monthName}</h2>
          <button onClick={() => step(1)} aria-label="Next month" className="grid h-10 w-10 place-items-center rounded-full bg-orange-50 hover:bg-orange-100"><ChevronRight size={18} /></button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-stone-400 md:gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} />)}
          {days.map((d) => (
            <div key={d.day} className={`min-h-[64px] rounded-2xl border p-1.5 text-center transition md:min-h-[84px] md:p-2 ${d.isPurnima ? "border-amber-400 bg-amber-50" : d.isAmavasya ? "border-stone-400 bg-stone-100" : d.isEkadashi ? "border-emerald-300 bg-emerald-50" : "border-orange-900/10 bg-white"}`}>
              <p className="text-sm font-extrabold text-stone-800 md:text-base">{d.day}</p>
              <p className="text-[10px] font-semibold text-stone-500">{d.tithiShort}</p>
              {d.isEkadashi && <p className="mt-0.5 rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">Ekadashi</p>}
              {d.isPurnima && <p className="mt-0.5 rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">Purnima</p>}
              {d.isAmavasya && <p className="mt-0.5 rounded-full bg-stone-700 px-1 text-[9px] font-bold text-white">Amavasya</p>}
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-stone-500">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-600" /> Ekadashi vrat</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500" /> Purnima</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-stone-700" /> Amavasya</span>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {["2026-11-24|Dev Deepawali — Varanasi deepotsav", "2026-10-20|Diwali Amavasya — Lakshmi pujan", "2027-02-15|Maha Shivratri — night-long abhishek", "2027-07-06|Rath Yatra — Puri", "2027-04-26|Meenakshi Thirukalyanam", "2027-01-14|Makar Sankranti"].map((s) => {
            const [dt, label] = s.split("|");
            return <div key={s} className="flex items-center gap-3 rounded-2xl border border-orange-900/10 bg-white px-4 py-3 text-sm"><CalendarDays size={16} className="shrink-0 text-orange-600" /><span className="font-bold text-stone-800">{dt}</span><span className="text-stone-600">{label}</span></div>;
          })}
        </div>
      </div>
    </>
  );
}
