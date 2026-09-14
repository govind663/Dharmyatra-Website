import { Link, useParams } from "react-router-dom";
import { MapPin, BedDouble, UtensilsCrossed, CalendarDays, Camera, MessageCircle } from "lucide-react";
import { ASHRAMS } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal, SectionHead } from "../components/ui";
import { AshramCard } from "../components/cards";
import { EnquiryForm, PageHero, WhatsAppBand } from "../components/blocks";
import { waLink } from "../lib/utils";

function AshramList() {
  useSEO({ title: "Ashrams of India — Stay, Satsang & Seva | DivyaDhara", description: "Rishikesh, Tiruvannamalai, Bengaluru & Puducherry ashrams: daily schedule, stay, sattvic food, courses and seva opportunities.", path: "/ashrams" });
  return (
    <>
      <PageHero eyebrow="Tapobhumi · Ashram" title="Ashrams & Spiritual Homes" sub="Stay, practise and serve — daily schedules, sattvic food and course calendars from India's beloved ashrams." image="/images/ashram-dawn.jpeg" />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Ashrams" }]} />
        {ASHRAMS.map((a, i) => <AshramCard key={a.slug} a={a} i={i} />)}
      </div>
    </>
  );
}

export function AshramDetail() {
  const { slug } = useParams();
  const a = ASHRAMS.find((x) => x.slug === slug);
  useSEO({ title: a ? `${a.name}, ${a.place} — Stay, Schedule & Seva | DivyaDhara` : "Ashram Not Found", description: a ? `${a.name} (${a.place}): ${a.summary} Daily schedule, accommodation, food, courses.` : "Not found", path: `/ashrams/${slug}`, image: a?.image });
  if (!a) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Ashram not found</h1><Link to="/ashrams" className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white">All ashrams</Link></div>;
  const wa = waLink(`Namaste! I wish to stay / join a programme at ${a.name}, ${a.place}. Please guide me.`);
  return (
    <>
      <section className="relative overflow-hidden bg-char-900 text-white">
        <img src={a.image} alt={a.name} className="kenburns absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-char-900 via-black/50 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Ashrams", href: "/ashrams" }, { label: a.name }]} />
          <p className="mt-6 flex items-center gap-1.5 text-sm font-bold text-amber-300"><MapPin size={15} /> {a.place}, {a.state}</p>
          <h1 className="font-display mt-2 max-w-3xl text-4xl font-semibold md:text-6xl">{a.name}</h1>
          <p className="mt-3 font-semibold text-amber-200">Guided by {a.guru}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa} target="_blank" rel="noreferrer" className="btn-saffron flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white"><MessageCircle size={16} /> Stay Enquiry</a>
            <a href="#visit" className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur">Plan a Visit</a>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-700">History & Parampara</p><p className="mt-3 leading-relaxed text-stone-600">{a.history}</p></Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><CalendarDays size={22} className="text-orange-600" /> Daily Schedule</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-orange-900/10">{a.schedule.map((s, i) => <div key={i} className={`flex items-center gap-4 px-5 py-3.5 text-sm ${i % 2 ? "bg-orange-50/60" : "bg-white"}`}><span className="w-20 shrink-0 font-extrabold text-orange-800">{s.time}</span><span className="text-stone-700">{s.item}</span></div>)}</div>
          </Reveal>
          <Reveal className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-orange-900/10 bg-white p-6 sacred-border"><h3 className="flex items-center gap-2 font-bold text-[#2a1a10]"><BedDouble size={18} className="text-orange-600" /> Accommodation</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">{a.stay}</p></div>
            <div className="rounded-3xl border border-orange-900/10 bg-white p-6 sacred-border"><h3 className="flex items-center gap-2 font-bold text-[#2a1a10]"><UtensilsCrossed size={18} className="text-orange-600" /> Food</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">{a.food}</p></div>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">Spiritual Activities & Courses</h2>
            <div className="mt-3 flex flex-wrap gap-2">{[...a.activities, ...a.courses].map((c) => <span key={c} className="rounded-full bg-orange-100 px-3.5 py-1.5 text-[13px] font-bold text-orange-900">{c}</span>)}</div>
            <p className="mt-3 text-sm text-stone-500">{a.contactNote}</p>
            <Link to="/courses" className="mt-2 inline-block text-sm font-bold text-orange-700 underline underline-offset-4">Browse related courses →</Link>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><Camera size={22} className="text-orange-600" /> Glimpses</h2>
            <div className="mt-4 grid grid-cols-3 gap-2.5"><img src={a.image} alt={a.name} loading="lazy" className="h-32 rounded-2xl object-cover md:h-44" /><img src="/images/yoga-course.jpeg" alt="Yoga at the ashram" loading="lazy" className="h-32 rounded-2xl object-cover md:h-44" /><img src="/images/puja-thali.jpeg" alt="Ashram rituals" loading="lazy" className="h-32 rounded-2xl object-cover md:h-44" /></div>
          </Reveal>
        </div>
        <aside id="visit" className="mt-10 scroll-mt-28 lg:mt-0"><div className="lg:sticky lg:top-28"><EnquiryForm context={`Ashram stay: ${a.name}, ${a.place}`} title="Plan My Ashram Stay" /></div></aside>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-6 md:px-6 lg:px-8"><WhatsAppBand title={`Called to stay at ${a.place}?`} sub="We help with room requests, programme dates, what to pack and ashram etiquette." message={`Namaste! I wish to visit ${a.name}. Please guide me.`} /></div>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <SectionHead eyebrow="More Homes of Sadhana" title="Other Ashrams" />
        <div className="grid gap-6 lg:grid-cols-2">{ASHRAMS.filter((x) => x.slug !== a.slug).slice(0, 2).map((x, i) => <AshramCard key={x.slug} a={x} i={i} />)}</div>
      </section>
    </>
  );
}

export default AshramList;
