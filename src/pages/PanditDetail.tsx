import { Link, useParams } from "react-router-dom";
import { MapPin, Languages, Award, Clock, MessageCircle, ShieldCheck, ChevronRight } from "lucide-react";
import { PANDITS, SERVICES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal } from "../components/ui";
import { ServiceCard } from "../components/cards";
import { EnquiryForm, WhatsAppBand } from "../components/blocks";
import { waLink } from "../lib/utils";

export default function PanditDetail() {
  const { slug } = useParams();
  const p = PANDITS.find((x) => x.slug === slug);
  useSEO({ title: p ? `${p.name} — ${p.title} | DivyaDhara Pandits` : "Pandit Not Found", description: p ? `${p.name}: ${p.experience} yrs, ${p.specializations.join(", ")}. Languages ${p.languages.join(", ")}. Book for ${p.pujaTypes.join(", ")} in ${p.location}.` : "Not found", path: `/pandits/${slug}`, image: p?.photo, schema: p ? { "@context": "https://schema.org", "@type": "Person", name: p.name, jobTitle: "Vedic Pandit", address: p.location } : undefined });
  if (!p) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Acharya not found</h1><Link to="/pandits" className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white">All pandits</Link></div>;
  const wa = waLink(`Namaste! I want to book ${p.name} (${p.title}) for ${p.specializations[0]}. My city/date is…`);
  return (
    <>
      <div className="bg-gradient-to-br from-[#2a1a10] via-[#7c2d12] to-[#c2410c] text-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pandits", href: "/pandits" }, { label: p.name }]} />
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
            <img src={p.photo} alt={`Portrait of ${p.name}`} className="h-40 w-40 rounded-[1.75rem] border-4 border-amber-300/70 object-cover shadow-2xl md:h-52 md:w-52" />
            <div className="flex-1">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/40"><ShieldCheck size={13} /> Identity-verified Acharya</p>
              <h1 className="font-display mt-3 text-3xl font-semibold md:text-5xl">{p.name}</h1>
              <p className="mt-1 font-semibold text-amber-300">{p.title}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-orange-100">
                <span className="flex items-center gap-1.5"><Award size={15} /> {p.experience} years anubhav</span>
                <span className="flex items-center gap-1.5"><MapPin size={15} /> {p.location}</span>
                <span className="flex items-center gap-1.5"><Languages size={15} /> {p.languages.join(" · ")}</span>
                <span className="flex items-center gap-1.5"><Clock size={15} /> {p.availability}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"><MessageCircle size={16} /> Contact Pandit</a>
                <a href="#book" className="btn-saffron rounded-2xl px-6 py-3 text-sm font-bold text-white">Request Booking</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Reveal><h2 className="font-display text-2xl font-semibold text-[#2a1a10]">About the Acharya</h2><p className="mt-3 leading-relaxed text-stone-600">{p.about}</p>
            <p className="mt-3 rounded-2xl bg-orange-50 p-4 text-sm text-stone-600 ring-1 ring-orange-200"><strong className="text-orange-900">Associated with:</strong> {p.associatedWith}</p></Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">Specializations & Puja Types</h2>
            <div className="mt-3 flex flex-wrap gap-2">{p.specializations.map((s) => <span key={s} className="rounded-full bg-orange-100 px-3.5 py-1.5 text-[13px] font-bold text-orange-900">{s}</span>)}{p.pujaTypes.map((s) => <span key={s} className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-bold text-stone-600 ring-1 ring-orange-200">{s}</span>)}</div>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">Sevas & Dakshina</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-orange-900/10">
              {p.services.map((s, i) => <div key={s.name} className={`flex flex-wrap items-center justify-between gap-2 px-5 py-4 ${i % 2 ? "bg-orange-50/60" : "bg-white"}`}><div><p className="text-sm font-bold text-stone-800">{s.name}</p><p className="text-xs text-stone-500">{s.duration}</p></div><span className="rounded-full bg-emerald-950 px-3.5 py-1.5 text-[13px] font-bold text-amber-300">{s.price}</span></div>)}
            </div>
            <p className="mt-2 text-xs text-stone-500">Dakshina varies by city & samagri. Final quote confirmed before booking — no hidden charges.</p>
          </Reveal>
          <Reveal className="mt-8 rounded-3xl border border-orange-900/10 bg-white p-6 sacred-border">
            <h3 className="flex items-center gap-2 font-bold text-[#2a1a10]"><ShieldCheck size={18} className="text-emerald-600" /> Contact & Privacy</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{p.authorizedContact ? "This acharya has authorised WhatsApp contact through DivyaDhara. Tap Contact Pandit — your number is shared only with the acharya for this enquiry." : "Per this acharya's parampara maryada, direct numbers are shared only after a confirmed booking. Enquire below and the coordinator will arrange a call."}</p>
          </Reveal>
          <div className="mt-8"><h2 className="font-display text-2xl font-semibold">Related Puja Services</h2><div className="mt-4 grid gap-5 sm:grid-cols-2">{SERVICES.slice(0, 2).map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />)}</div>
            <Link to="/pandits" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-orange-700">← All pandits</Link> <Link to="/services" className="ml-4 inline-flex items-center gap-1 text-sm font-bold text-orange-700">All services <ChevronRight size={14} /></Link></div>
        </div>
        <aside id="book" className="mt-10 scroll-mt-28 lg:mt-0"><div className="lg:sticky lg:top-28"><EnquiryForm context={`Pandit request: ${p.name} (${p.specializations[0]})`} title="Request This Pandit" /></div></aside>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-14 md:px-6 lg:px-8"><WhatsAppBand title={`Want ${p.name.split(" ")[0]} ji for your sanskar?`} sub="Share your city, language and date — we'll confirm availability and muhurat within hours." message={`Namaste! I want to book ${p.name} for ${p.specializations[0]}.`} /></div>
    </>
  );
}
