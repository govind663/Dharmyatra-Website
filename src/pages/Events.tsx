import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Clock, CalendarDays, MessageCircle, Users, Ticket } from "lucide-react";
import { EVENTS } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal, SectionHead } from "../components/ui";
import { EventCard } from "../components/cards";
import { EnquiryForm, PageHero, WhatsAppBand } from "../components/blocks";
import { waLink, formatDate } from "../lib/utils";

export function EventList() {
  useSEO({ title: "Spiritual Events — Shivratri, Katha, Satsang, Rath Yatra | DivyaDhara", description: "Maha Shivratri, Dev Deepawali, Bhagavat Katha, Yoga festival, Thirukalyanam & Rath Yatra — dates, venues, programmes & registration.", path: "/events" });
  const [cat, setCat] = useState("");
  const cats = [...new Set(EVENTS.map((e) => e.category))];
  const list = EVENTS.filter((e) => !cat || e.category === cat);
  return (
    <>
      <PageHero eyebrow="Utsav · Satsang · Katha" title="Spiritual Events" sub="Festivals, kathas, satsangs and cultural programmes — join in person or through live darshan." image="/images/festival-crowd.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Events" }]} />
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setCat("")} className={`rounded-full px-4 py-2.5 text-[13px] font-bold ${!cat ? "bg-[#2a1a10] text-amber-200" : "bg-white text-stone-600 ring-1 ring-orange-900/15"}`}>All</button>
          {cats.map((c) => <button key={c} onClick={() => setCat(c === cat ? "" : c)} className={`rounded-full px-4 py-2.5 text-[13px] font-bold ${cat === c ? "bg-orange-700 text-white" : "bg-white text-stone-600 ring-1 ring-orange-900/15"}`}>{c}</button>)}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map((e, i) => <EventCard key={e.slug} e={e} i={i} />)}</div>
      </div>
    </>
  );
}

export function EventDetail() {
  const { slug } = useParams();
  const e = EVENTS.find((x) => x.slug === slug);
  useSEO({ title: e ? `${e.title} — ${formatDate(e.date)} | DivyaDhara Events` : "Event Not Found", description: e ? `${e.title} at ${e.venue}, ${e.city} on ${formatDate(e.date)}. ${e.description.slice(0, 140)}` : "Not found", path: `/events/${slug}`, image: e?.image, schema: e ? { "@context": "https://schema.org", "@type": "Event", name: e.title, startDate: e.date, location: { "@type": "Place", name: e.venue, address: e.city } } : undefined });
  const related = useMemo(() => EVENTS.filter((x) => x.slug !== slug).slice(0, 3), [slug]);
  if (!e) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Event not found</h1><Link to="/events" className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white">All events</Link></div>;
  const wa = waLink(`Namaste! I want to register for: ${e.title} on ${formatDate(e.date)} at ${e.venue}.`);
  const d = new Date(e.date);
  return (
    <>
      <section className="relative overflow-hidden bg-[#1c1410] text-white">
        <img src={e.image} alt={e.title} className="kenburns absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1410] via-black/55 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Events", href: "/events" }, { label: e.title }]} />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-2xl bg-white px-4 py-2 text-center shadow"><span className="block text-2xl font-extrabold leading-none text-orange-800">{d.getDate()}</span><span className="text-[10px] font-bold uppercase text-stone-500">{d.toLocaleString("en-IN", { month: "long", year: "numeric" })}</span></span>
            <span className="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-bold">{e.category}</span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur"><Clock size={13} /> {e.time}</span>
          </div>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold md:text-5xl">{e.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-stone-200"><MapPin size={15} className="text-amber-400" /> {e.venue}, {e.city} · By {e.organizer}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white"><MessageCircle size={16} /> Register on WhatsApp</a>
            <a href="#register" className="btn-saffron rounded-2xl px-6 py-3 text-sm font-bold text-white">Register Below</a>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Reveal><h2 className="font-display text-2xl font-semibold text-[#2a1a10]">About this Event</h2><p className="mt-3 leading-relaxed text-stone-600">{e.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <p className="rounded-2xl bg-orange-50 p-4 text-sm ring-1 ring-orange-200"><strong>Date</strong><br />{formatDate(e.date)}</p>
              <p className="rounded-2xl bg-orange-50 p-4 text-sm ring-1 ring-orange-200"><strong>Time</strong><br />{e.time}</p>
              <p className="rounded-2xl bg-orange-50 p-4 text-sm ring-1 ring-orange-200"><strong>Entry</strong><br />{e.fee}</p>
            </div></Reveal>
          <Reveal className="mt-8"><h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><CalendarDays size={22} className="text-orange-600" /> Programme Schedule</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-orange-900/10">{e.schedule.map((s, i) => <div key={i} className={`flex items-center gap-4 px-5 py-3.5 text-sm ${i % 2 ? "bg-orange-50/60" : "bg-white"}`}><span className="w-20 shrink-0 font-extrabold text-orange-800">{s.t}</span><span className="text-stone-700">{s.item}</span></div>)}</div></Reveal>
          <Reveal className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-orange-900/10 bg-white p-6 sacred-border"><h3 className="flex items-center gap-2 font-bold"><Users size={18} className="text-orange-600" /> Organizer</h3><p className="mt-2 text-sm text-stone-600">{e.organizer}</p></div>
            <div className="rounded-3xl border border-orange-900/10 bg-white p-6 sacred-border"><h3 className="flex items-center gap-2 font-bold"><Ticket size={18} className="text-orange-600" /> Venue</h3><p className="mt-2 text-sm text-stone-600">{e.venue}, {e.city}</p><div className="mt-3 overflow-hidden rounded-2xl"><iframe title={`Map ${e.venue}`} src={`https://www.google.com/maps?q=${encodeURIComponent(e.venue + ", " + e.city)}&output=embed`} className="h-40 w-full" loading="lazy" /></div></div>
          </Reveal>
          <Reveal className="mt-8"><h2 className="font-display text-2xl font-semibold">Glimpses</h2><div className="mt-4 grid grid-cols-3 gap-2.5"><img src={e.image} alt={e.title} loading="lazy" className="h-32 rounded-2xl object-cover md:h-44" /><img src="/images/aarti-night.jpg" alt="Aarti" loading="lazy" className="h-32 rounded-2xl object-cover md:h-44" /><img src="/images/festival-crowd.jpg" alt="Festival" loading="lazy" className="h-32 rounded-2xl object-cover md:h-44" /></div></Reveal>
        </div>
        <aside id="register" className="mt-10 scroll-mt-28 lg:mt-0"><div className="lg:sticky lg:top-28"><EnquiryForm context={`Event registration: ${e.title} (${formatDate(e.date)})`} title="Register for Event" /></div></aside>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-6 md:px-6 lg:px-8"><WhatsAppBand title="Coming with family or a bhajan mandali?" sub="Group seating, senior assistance and yajman opportunities arranged on request." message={`Namaste! Group registration for ${e.title}.`} /></div>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <SectionHead eyebrow="More Utsavs" title="Other Events" />
        <div className="grid gap-6 md:grid-cols-3">{related.map((x, i) => <EventCard key={x.slug} e={x} i={i} />)}</div>
      </section>
    </>
  );
}
