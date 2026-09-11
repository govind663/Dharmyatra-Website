import { Link, useParams } from "react-router-dom";
import { MapPin, Clock, Flame, Users, Sparkles, Phone, MessageCircle, ChevronRight, CalendarDays, Camera, Train } from "lucide-react";
import { TEMPLES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal, Faq, SectionHead, Stars } from "../components/ui";
import { TempleCard } from "../components/cards";
import { EnquiryForm, WhatsAppBand } from "../components/blocks";
import { waLink } from "../lib/utils";

export default function TempleDetail() {
  const { slug } = useParams();
  const t = TEMPLES.find((x) => x.slug === slug);
  useSEO({
    title: t ? `${t.name}, ${t.city} — Darshan Timings, Aarti & History | DivyaDhara` : "Temple Not Found | DivyaDhara",
    description: t ? `${t.name} (${t.city}, ${t.state}): ${t.summary} Darshan & aarti timings, festivals, facilities and how to reach.` : "Temple not found.",
    path: `/temples/${slug}`, image: t?.image,
    schema: t ? { "@context": "https://schema.org", "@type": "TouristAttraction", name: t.name, description: t.summary, address: { "@type": "PostalAddress", addressLocality: t.city, addressRegion: t.state, addressCountry: "IN" } } : undefined,
  });
  if (!t) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Temple not found</h1><p className="mt-2 text-stone-500">This kshetra may be documented soon.</p><Link to="/temples" className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white">Back to temples</Link></div>;
  const wa = waLink(`Namaste! I want guidance for darshan at ${t.name}, ${t.city}. Please share Sugam Darshan / aarti / stay help.`);
  return (
    <>
      <section className="relative overflow-hidden bg-[#1c1410] text-white">
        <img src={t.image} alt={`${t.name}, ${t.city}`} className="kenburns absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1410] via-black/45 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6 md:pt-20 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Temples", href: "/temples" }, { label: t.name }]} />
          <div className="mt-6 flex flex-wrap gap-2">{t.category.map((c) => <span key={c} className="rounded-full bg-amber-400/95 px-3 py-1 text-[11px] font-extrabold text-[#3a2415]">{c}</span>)}<Stars value={t.rating} /></div>
          <p className="font-sanskrit mt-4 text-xl text-amber-300">{t.sanskrit}</p>
          <h1 className="font-display mt-1 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{t.name}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-200"><span className="flex items-center gap-1.5"><MapPin size={15} className="text-amber-400" /> {t.city}, {t.district}, {t.state}</span><span className="flex items-center gap-1.5"><Sparkles size={15} className="text-amber-400" /> {t.deity}</span></p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa} target="_blank" rel="noreferrer" className="btn-saffron flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white"><MessageCircle size={16} /> Darshan Enquiry</a>
            <a href="#timings" className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20">Darshan Timings</a>
            <a href="#aarti" className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20">Aarti & Festivals</a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="min-w-0">
          {/* about + history */}
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-700">About the Kshetra · {t.tradition}</p>
            <p className="mt-3 text-[17px] font-medium leading-relaxed text-[#3a2415]">{t.summary}</p>
            <p className="mt-2 text-sm text-stone-500">Established: {t.established} · Trust: {t.trust}</p>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">History & Significance</h2>
            <div className="prose-sacred mt-4">{t.history.map((h, i) => <p key={i}>{h}</p>)}
              <ul>{t.significance.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </Reveal>
          {/* timings */}
          <Reveal className="mt-10" >
            <h2 id="timings" className="font-display flex scroll-mt-28 items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><Clock size={22} className="text-orange-600" /> Darshan Timings</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-orange-900/10">
              {t.darshanTimings.map((d, i) => (
                <div key={i} className={`flex items-center justify-between gap-4 px-5 py-3.5 text-sm ${i % 2 ? "bg-orange-50/60" : "bg-white"}`}>
                  <span className="font-semibold text-stone-700">{d.label}</span><span className="shrink-0 rounded-full bg-[#2a1a10] px-3 py-1 text-[12px] font-bold text-amber-200">{d.time}</span>
                </div>
              ))}
            </div>
          </Reveal>
          {/* aarti + live */}
          <Reveal className="mt-10">
            <h2 id="aarti" className="font-display flex scroll-mt-28 items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><Flame size={22} className="text-orange-600" /> Aarti & Live Darshan</h2>
            {t.liveAarti && <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-700 to-orange-700 p-4 text-white"><span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold"><span className="h-2 w-2 animate-pulse rounded-full bg-white" /> LIVE</span><div><p className="text-sm font-bold">{t.liveAarti.title}</p><p className="text-xs text-orange-100">{t.liveAarti.time}</p></div><Link to="/videos" className="ml-auto shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-red-800">Watch</Link></div>}
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {t.aarti.map((a) => <div key={a.name} className="rounded-2xl border border-orange-900/10 bg-white p-4 sacred-border"><p className="font-display font-semibold text-[#2a1a10]">{a.name}</p><p className="text-xs font-bold text-orange-700">{a.time}</p><p className="mt-1.5 text-[13px] text-stone-600">{a.desc}</p></div>)}
            </div>
          </Reveal>
          {/* festivals */}
          <Reveal className="mt-10">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><CalendarDays size={22} className="text-orange-600" /> Festivals</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {t.festivals.map((f) => <div key={f.name} className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 ring-1 ring-orange-200"><p className="text-[11px] font-bold uppercase tracking-widest text-orange-700">{f.month}</p><p className="font-display font-semibold text-[#2a1a10]">{f.name}</p><p className="mt-1 text-[13px] text-stone-600">{f.desc}</p></div>)}
            </div>
          </Reveal>
          {/* trust + pandits */}
          <Reveal className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-orange-900/10 bg-white p-6 sacred-border">
              <h3 className="font-display flex items-center gap-2 text-lg font-semibold"><Users size={18} className="text-orange-600" /> Trust & Committee</h3>
              <p className="mt-1 text-sm font-semibold text-orange-800">{t.trust}</p>
              <ul className="mt-3 space-y-2">{t.committee.map((c) => <li key={c.name} className="flex justify-between gap-3 text-sm"><span className="font-semibold text-stone-700">{c.name}</span><span className="text-stone-500">{c.role}</span></li>)}</ul>
            </div>
            <div className="rounded-3xl bg-[#1c1410] p-6 text-white">
              <h3 className="font-display flex items-center gap-2 text-lg font-semibold"><Phone size={18} className="text-amber-400" /> Pandit & Trust Contact</h3>
              <p className="mt-2 text-sm text-stone-300">For abhishek, sankalpa and festival sevas, our kshetra desk connects you to authorised temple pandits.</p>
              <div className="mt-4 flex gap-2">
                <a href={wa} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-[13px] font-bold"><MessageCircle size={14} /> WhatsApp</a>
                <Link to="/pandits" className="flex-1 rounded-xl border border-white/20 px-3 py-2.5 text-center text-[13px] font-bold">Find Pandit</Link>
              </div>
              <p className="mt-3 text-[11px] text-stone-400">Personal contact numbers are shared only after verified booking, per temple policy.</p>
            </div>
          </Reveal>
          {/* facilities + reach */}
          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">Facilities</h2>
            <div className="mt-4 flex flex-wrap gap-2">{t.facilities.map((f) => <span key={f} className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-[13px] font-semibold text-emerald-900 ring-1 ring-emerald-200">✓ {f}</span>)}</div>
          </Reveal>
          <Reveal className="mt-10">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><Train size={22} className="text-orange-600" /> How to Reach & Location</h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500"><MapPin size={14} className="text-orange-600" /> {t.mapEmbedNote}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">{t.howToReach.map((h) => <div key={h.mode} className="rounded-2xl border border-orange-900/10 bg-white p-4"><p className="text-xs font-extrabold uppercase tracking-widest text-orange-700">{h.mode}</p><p className="mt-1 text-[13px] text-stone-600">{h.detail}</p></div>)}</div>
            <div className="mt-4 overflow-hidden rounded-3xl border border-orange-900/10">
              <iframe title={`Map of ${t.name}`} src={`https://www.google.com/maps?q=${encodeURIComponent(t.mapEmbedNote)}&output=embed`} className="h-64 w-full" loading="lazy" />
            </div>
          </Reveal>
          {/* gallery strip */}
          <Reveal className="mt-10">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><Camera size={22} className="text-orange-600" /> Gallery Glimpses</h2>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[t.image, "/images/aarti-night.jpeg", "/images/puja-thali.jpeg"].map((src, i) => <img key={i} src={src} alt={`${t.name} glimpse ${i + 1}`} loading="lazy" className="h-32 rounded-2xl object-cover md:h-44" />)}
            </div>
            <Link to="/gallery" className="mt-3 inline-block text-sm font-bold text-orange-700 underline underline-offset-4">Open full gallery →</Link>
          </Reveal>
          {/* nearby + faq */}
          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">Nearby Spiritual Places</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{t.nearby.map((n) => <Link key={n} to="/spiritual-places" className="flex items-center justify-between rounded-xl bg-orange-50/70 px-4 py-3 text-sm font-semibold text-stone-700 ring-1 ring-orange-100 transition hover:bg-orange-50">{n} <ChevronRight size={15} className="text-orange-500" /></Link>)}</div>
          </Reveal>
          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">Pilgrim FAQs</h2>
            <div className="mt-4"><Faq items={t.faqs} /></div>
          </Reveal>
        </div>
        {/* sticky side */}
        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-28 space-y-4">
            <EnquiryForm context={`Temple enquiry: ${t.name}, ${t.city}`} title="Plan My Darshan" compact />
            <div className="rounded-3xl bg-[#1c1410] p-6 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">Sugam Darshan Desk</p>
              <p className="font-display mt-1 text-xl font-semibold">Senior citizens & families assisted daily.</p>
              <a href={wa} target="_blank" rel="noreferrer" className="btn-saffron mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white"><MessageCircle size={15} /> WhatsApp Temple Desk</a>
            </div>
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-8">
        <WhatsAppBand title={`Visiting ${t.city}? Let us arrange everything.`} sub="Sugam darshan tickets, aarti passes, pandit sankalpa, sattvic stay and local transport — one WhatsApp message." message={`Namaste! I'm visiting ${t.name}. Please help with darshan + stay.`} />
      </div>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <SectionHead eyebrow="Continue the Yatra" title="More Sacred Kshetras" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{TEMPLES.filter((x) => x.slug !== t.slug).slice(0, 4).map((x, i) => <TempleCard key={x.slug} t={x} i={i} />)}</div>
      </section>
    </>
  );
}
