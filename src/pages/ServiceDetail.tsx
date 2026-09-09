import { Link, useParams } from "react-router-dom";
import { Clock, BadgeCheck, ListChecks, ScrollText, MessageCircle, ChevronRight } from "lucide-react";
import { SERVICES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal, Faq } from "../components/ui";
import { ServiceCard } from "../components/cards";
import { EnquiryForm, WhatsAppBand } from "../components/blocks";
import { waLink } from "../lib/utils";

export default function ServiceDetail() {
  const { slug } = useParams();
  const s = SERVICES.find((x) => x.slug === slug);
  useSEO({ title: s ? `${s.name} — ${s.price} | DivyaDhara Puja Services` : "Service Not Found", description: s ? `${s.name}: ${s.tagline} Duration ${s.duration}. Muhurat, samagri & verified pandit included.` : "Not found", path: `/services/${slug}`, image: s?.image });
  if (!s) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Service not found</h1><Link to="/services" className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white">All services</Link></div>;
  const wa = waLink(`Namaste! I want to book: ${s.name} (${s.price}, ${s.duration}). Please share muhurat & samagri list.`);
  return (
    <>
      <section className="relative overflow-hidden bg-[#1c1410] text-white">
        <img src={s.image} alt={s.name} className="kenburns absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1410] via-black/50 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Puja Services", href: "/services" }, { label: s.name }]} />
          <span className="mt-6 inline-block rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold text-[#3a2415]">{s.category}</span>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{s.name}</h1>
          <p className="mt-3 max-w-2xl text-stone-200">{s.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-bold">
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 backdrop-blur"><Clock size={14} /> {s.duration}</span>
            <span className="rounded-full bg-emerald-500/90 px-4 py-2">{s.price}</span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 backdrop-blur"><BadgeCheck size={14} /> Verified pandit</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa} target="_blank" rel="noreferrer" className="btn-saffron flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white"><MessageCircle size={16} /> Book on WhatsApp</a>
            <a href="#enquire" className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur">Enquire Below</a>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Reveal><h2 className="font-display text-2xl font-semibold text-[#2a1a10]">About this Puja</h2>{s.description.map((d, i) => <p key={i} className="mt-3 leading-relaxed text-stone-600">{d}</p>)}</Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><ListChecks size={22} className="text-orange-600" /> Benefits & Inclusions</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">{s.benefits.map((b) => <li key={b} className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950 ring-1 ring-emerald-200"><span className="text-emerald-600">✓</span>{b}</li>)}</ul>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><ScrollText size={22} className="text-orange-600" /> Samagri List</h2>
            <ul className="mt-4 space-y-2">{s.samagri.map((m) => <li key={m} className="flex items-start gap-2.5 rounded-xl border border-orange-900/10 bg-white px-4 py-3 text-sm text-stone-600"><span className="text-orange-600">❖</span>{m}</li>)}</ul>
            <p className="mt-3 text-[13px] text-stone-500">Full personalised samagri PDF is shared on booking, adjusted to your region & family custom.</p>
          </Reveal>
          <Reveal className="mt-8"><h2 className="font-display text-2xl font-semibold text-[#2a1a10]">FAQs</h2><div className="mt-4"><Faq items={s.faqs} /></div></Reveal>
          <Reveal className="mt-8 flex items-center justify-between rounded-2xl bg-orange-50 p-5 ring-1 ring-orange-200">
            <p className="text-sm font-semibold text-stone-700">Also need a pandit you can speak to first?</p>
            <Link to="/pandits" className="flex items-center gap-1 text-sm font-bold text-orange-700">Meet pandits <ChevronRight size={15} /></Link>
          </Reveal>
        </div>
        <aside id="enquire" className="mt-10 scroll-mt-28 lg:mt-0"><div className="lg:sticky lg:top-28"><EnquiryForm context={`Puja booking: ${s.name}`} title="Book This Puja" /></div></aside>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-6 md:px-6 lg:px-8"><WhatsAppBand title="Confused about muhurat or samagri?" sub="Send us your city and preferred date — an acharya will reply with shubh muhurat options, free." message={`Namaste! For ${s.name}, please suggest a shubh muhurat.`} /></div>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold">Related Sevas</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{SERVICES.filter((x) => x.slug !== s.slug).slice(0, 4).map((x, i) => <ServiceCard key={x.slug} s={x} i={i} />)}</div>
      </section>
    </>
  );
}
