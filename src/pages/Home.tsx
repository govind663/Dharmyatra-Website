import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Clock, Flame, Landmark, MapPin, MessageCircle, MoonStar, Play, Radio, Sparkles, Sun, Users, GraduationCap, Compass, HeartHandshake } from "lucide-react";
import { TEMPLES, SERVICES, PANDITS, EVENTS, ASHRAMS, COURSES, PLACES, PACKAGES, ARTICLES, GALLERY } from "../data/content";
import { computePanchang } from "../lib/panchang";
import { waLink, inr } from "../lib/utils";
import { useSEO, orgSchema } from "../lib/seo";
import { Reveal, SectionHead, Eyebrow, Counter, Stars } from "../components/ui";
import { TempleCard, ServiceCard, PanditCard, PackageCard, EventCard, CourseCard, PlaceCard, AshramCard } from "../components/cards";
import { WhatsAppBand } from "../components/blocks";

const SLIDES = [
  { img: "/images/hero-varanasi.jpeg", kicker: "Kashi · The Eternal City", title: "Where the Ganga Meets Eternity", sub: "Sugam darshan, Ganga aarti boats & verified pandits across 40+ sacred kshetras.", cta1: { l: "Explore Temples", h: "/temples" }, cta2: { l: "Today's Panchang", h: "/panchang" }, sanskrit: "॥ काश्यां मरणान्मुक्तिः ॥" },
  { img: "/images/hero-kedarnath.jpeg", kicker: "Char Dham Yatra 2027", title: "Walk Where the Gods Reside", sub: "Heli & road yatras to Kedarnath, Badrinath, Kashi and the Tamil temple circuit.", cta1: { l: "View Yatra Packages", h: "/packages" }, cta2: { l: "Spiritual Places", h: "/spiritual-places" }, sanskrit: "॥ अतिथि देवो भव ॥" },
  { img: "/images/aarti-night.jpeg", kicker: "Maha Shivratri · Dev Deepawali", title: "Aarti, Katha & Sacred Festivals", sub: "Live aartis, Bhagavat kathas and festival sevas — join in person or from home.", cta1: { l: "Upcoming Events", h: "/events" }, cta2: { l: "Book a Puja", h: "/services" }, sanskrit: "॥ तमसो मा ज्योतिर्गमय ॥" },
];

function Hero() {
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, [reduce]);
  const s = SLIDES[idx];
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-[#1c1410] text-white" aria-label="Featured sacred journeys">
      <AnimatePresence mode="popLayout">
        <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1 }} className="absolute inset-0">
          <img src={s.img} alt={s.title} className="kenburns h-full w-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1410] via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>
      {/* floating diya particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[...Array(7)].map((_, i) => (
          <span key={i} className="animate-floaty absolute rounded-full bg-amber-400/70 blur-[1px]" style={{ width: 5 + (i % 3) * 3, height: 5 + (i % 3) * 3, left: `${8 + i * 13}%`, top: `${30 + ((i * 17) % 45)}%`, animationDelay: `${i * 0.9}s`, opacity: 0.5 }} />
        ))}
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-40 md:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.6 }}>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 backdrop-blur"><Flame size={13} /> {s.kicker}</p>
            <p className="font-sanskrit mt-4 text-xl text-amber-300/95 md:text-2xl">{s.sanskrit}</p>
            <h1 className="font-display mt-2 max-w-3xl text-[2.6rem] font-semibold leading-[1.05] md:text-7xl">{s.title}</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-stone-200 md:text-lg">{s.sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={s.cta1.h} className="btn-saffron rounded-2xl px-7 py-3.5 text-sm font-bold text-white">{s.cta1.l} →</Link>
              <Link to={s.cta2.h} className="rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">{s.cta2.l}</Link>
              <a href={waLink("Namaste DivyaDhara! I want to plan a darshan / puja / yatra.")} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110"><MessageCircle size={16} /> WhatsApp</a>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* slider controls */}
        <div className="mt-10 flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => setIdx((idx + SLIDES.length - 1) % SLIDES.length)} aria-label="Previous slide" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition hover:bg-white/25"><ChevronLeft size={18} /></button>
            <button onClick={() => setIdx((idx + 1) % SLIDES.length)} aria-label="Next slide" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition hover:bg-white/25"><ChevronRight size={18} /></button>
          </div>
          <div className="flex gap-2" role="tablist" aria-label="Hero slides">
            {SLIDES.map((sl, i) => (
              <button key={i} role="tab" aria-selected={i === idx} aria-label={sl.kicker} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-10 bg-amber-400" : "w-4 bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
          <p className="ml-auto hidden items-center gap-2 text-xs text-stone-300 md:flex"><Radio size={13} className="text-red-400" /> Live aartis daily · <Link to="/videos" className="font-bold text-amber-300 underline">Watch</Link></p>
        </div>
      </div>
      {/* trust ribbon */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/45 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-4 py-3 text-[12px] font-semibold text-amber-100/90 md:px-6">
          {["Verified Vedic Pandits", "40+ Sacred Kshetras", "Transparent Pricing", "Sugam Darshan Assistance", "Sattvic Yatra Stays"].map((t) => <span key={t} className="flex shrink-0 items-center gap-1.5">✦ {t}</span>)}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useSEO({
    title: "DivyaDhara — Temples, Pandits, Pujas, Yatras & Spiritual Wisdom of India",
    description: "India's premium digital spiritual ecosystem: discover temples, book verified pandits & pujas, explore ashrams & courses, follow Panchang & festivals, and plan sacred yatras.",
    path: "/",
    schema: [orgSchema(), { "@context": "https://schema.org", "@type": "WebSite", name: "DivyaDhara", url: "https://divyadhara.in", potentialAction: { "@type": "SearchAction", target: "https://divyadhara.in/temples?q={query}", "query-input": "required name=query" } }],
  });
  const p = computePanchang(new Date());
  const liveTemples = TEMPLES.filter((t) => t.liveAarti).slice(0, 3);
  return (
    <>
      <Hero />

      {/* 2 · intro + counters */}
      <section className="relative overflow-hidden bg-[#fffdf7] py-16 md:py-24">
        <div className="mandala-bg absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <Eyebrow icon={<Sparkles size={12} />}>India's Sacred Ecosystem</Eyebrow>
            <h2 className="font-display mt-4 text-3xl font-semibold leading-tight text-[#2a1a10] md:text-5xl">One platform for <span className="text-gradient-saffron">darshan, puja, learning</span> & sacred travel.</h2>
            <p className="font-sanskrit mt-3 text-lg text-orange-800">॥ धर्मो रक्षति रक्षितः ॥</p>
            <p className="mt-4 leading-relaxed text-stone-600">DivyaDhara unites temples, verified pandits, ashrams, acharyas and yatra experts into a single trustworthy ecosystem. From your first Rudrabhishek at home to the Char Dham by helicopter — walk the sacred path with guidance at every step.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/about" className="btn-saffron rounded-2xl px-6 py-3 text-sm font-bold text-white">Our Story & Mission</Link>
              <Link to="/contact" className="rounded-2xl border border-orange-700/25 bg-white px-6 py-3 text-sm font-bold text-orange-900 transition hover:bg-orange-50">Talk to a Seva Guide</Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {[{ n: 1200, s: "+", l: "Temples documented", i: <Landmark size={18} /> }, { n: 350, s: "+", l: "Verified pandits", i: <Users size={18} /> }, { n: 85, s: "+", l: "Curated yatra batches / yr", i: <Compass size={18} /> }, { n: 52000, s: "+", l: "Pilgrims guided", i: <HeartHandshake size={18} /> }].map((c, i) => (
              <Reveal key={c.l} delay={i * 0.08}>
                <div className="sacred-border rounded-3xl bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-xl">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 text-white">{c.i}</span>
                  <p className="font-display mt-3 text-3xl font-bold text-orange-900 md:text-4xl"><Counter to={c.n} suffix={c.s} /></p>
                  <p className="mt-1 text-[13px] font-semibold text-stone-500">{c.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · featured temples */}
      <section className="bg-gradient-to-b from-[#fffdf7] to-orange-50/60 py-16 md:py-24" aria-label="Featured temples">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Sacred Kshetras" title="Featured Temples of Bharat" sub="Jyotirlingas, Char Dham seats and living heritage — with darshan timings, aartis and festivals." sanskrit="॥ तीर्थानां हृदयं काशी ॥" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLES.slice(0, 4).map((t, i) => <TempleCard key={t.slug} t={t} i={i} />)}
          </div>
          <Reveal className="mt-10 text-center">
            <Link to="/temples" className="inline-flex items-center gap-2 rounded-2xl border border-orange-700/25 bg-white px-7 py-3.5 text-sm font-bold text-orange-900 shadow-sm transition hover:bg-orange-50">View all temples <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      {/* 4 · live aarti */}
      <section className="relative overflow-hidden bg-[#1c1410] py-16 text-white md:py-20" aria-label="Live aarti">
        <img src="/images/aarti-night.jpeg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1410] via-[#1c1410]/85 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"><span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Live · Daily</p>
              <h2 className="font-display mt-4 text-3xl font-semibold md:text-5xl">Live Aarti & <span className="text-amber-400">Darshan</span></h2>
              <p className="mt-3 text-stone-300">Join the Saptarishi Aarti of Kashi, Bhasma Aarti of Mahakaal and evening deeparadhana — streamed with sankalpa options for your family.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/videos" className="btn-gold flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white"><Play size={15} /> Watch Live & Recordings</Link>
                <a href={waLink("Namaste! I want to offer a sankalpa during the live aarti. My name/gotra is…")} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20">Offer Sankalpa</a>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {liveTemples.map((t, i) => (
                <Reveal key={t.slug} delay={i * 0.1}>
                  <Link to={`/temples/${t.slug}`} className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur transition hover:border-amber-400/40">
                    <div className="relative h-36 overflow-hidden">
                      <img src={t.image} alt={t.liveAarti!.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE</span>
                    </div>
                    <div className="p-4"><p className="text-[13px] font-bold leading-snug">{t.liveAarti!.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-amber-300"><Clock size={12} /> {t.liveAarti!.time}</p></div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5 · darshan timings strip */}
      <section className="border-b border-orange-900/10 bg-amber-50/70 py-12" aria-label="Darshan timings today">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-700"><Bell size={13} /> Mandir Suchna · Today</p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-[#2a1a10] md:text-3xl">Darshan windows at a glance</h2>
            </div>
            <Link to="/temples" className="text-sm font-bold text-orange-700 underline underline-offset-4">All temple timings →</Link>
          </Reveal>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {TEMPLES.slice(0, 4).map((t, i) => (
              <Reveal key={t.slug} delay={i * 0.07}>
                <Link to={`/temples/${t.slug}`} className="block rounded-2xl border border-orange-900/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <p className="truncate text-sm font-bold text-[#2a1a10]">{t.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[13px] text-stone-600"><Clock size={13} className="text-orange-600" /> {t.darshanTimings[0].time}</p>
                  <p className="text-[12px] text-stone-500">{t.darshanTimings[1]?.label} · {t.darshanTimings[1]?.time.split("–")[0]}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · puja services */}
      <section className="py-16 md:py-24" aria-label="Puja services">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Sevas at Home & Kshetra" title="Puja Services, Done Right" sub="Transparent pricing, muhurat guidance and samagri lists — from Griha Pravesh to Maha Havan." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.slice(0, 4).map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />)}
          </div>
          <Reveal className="mt-10 text-center"><Link to="/services" className="btn-saffron inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white">All 8 puja services <ArrowRight size={16} /></Link></Reveal>
        </div>
      </section>

      {/* 7 · pandits */}
      <section className="bg-gradient-to-b from-orange-50/70 to-[#fffdf7] py-16 md:py-24" aria-label="Featured pandits">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Verified Acharyas" title="Pandits You Can Trust" sub="Parampara-trained, background-verified and reviewed through completed sevas — never anonymous." />
          <div className="grid gap-6 md:grid-cols-3">
            {PANDITS.slice(0, 3).map((pt, i) => <PanditCard key={pt.slug} p={pt} i={i} />)}
          </div>
          <Reveal className="mt-10 text-center"><Link to="/pandits" className="inline-flex items-center gap-2 rounded-2xl border border-orange-700/25 bg-white px-7 py-3.5 text-sm font-bold text-orange-900 transition hover:bg-orange-50">Meet all pandits <ArrowRight size={16} /></Link></Reveal>
        </div>
      </section>

      {/* 8 · events */}
      <section className="py-16 md:py-24" aria-label="Upcoming events">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Utsav & Satsang" title="Upcoming Spiritual Events" sub="Shivratri, Dev Deepawali, Bhagavat Katha and the great Rath Yatra." />
          <div className="grid gap-6 md:grid-cols-3">
            {EVENTS.slice(0, 3).map((e, i) => <EventCard key={e.slug} e={e} i={i} />)}
          </div>
          <Reveal className="mt-10 text-center"><Link to="/events" className="inline-flex items-center gap-2 rounded-2xl border border-orange-700/25 bg-white px-7 py-3.5 text-sm font-bold text-orange-900 transition hover:bg-orange-50">All events & kathas <ArrowRight size={16} /></Link></Reveal>
        </div>
      </section>

      {/* 9 · ashrams */}
      <section className="bg-[#1c1410] py-16 text-stone-200 md:py-24" aria-label="Ashram highlights">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Tapobhumi" title="Ashram Highlights" sub="Live, learn and serve — from Rishikesh's Ganga aarti to Arunachala's silence." />
          <div className="grid gap-6 lg:grid-cols-2">
            {ASHRAMS.slice(0, 2).map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.1}>
                <Link to={`/ashrams/${a.slug}`} className="img-zoom group grid overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur transition hover:border-amber-400/40 sm:grid-cols-2">
                  <div className="relative h-56 overflow-hidden sm:h-full sm:min-h-[240px]"><img src={a.image} alt={a.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></div>
                  <div className="p-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">{a.place}</p>
                    <h3 className="font-display mt-1 text-2xl font-semibold text-white">{a.name}</h3>
                    <p className="mt-1 text-sm text-amber-200/90">{a.guru}</p>
                    <p className="clamp-3 mt-3 text-sm leading-relaxed text-stone-300">{a.summary}</p>
                    <p className="mt-4 text-sm font-bold text-amber-300">Stay, schedule & seva →</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center"><Link to="/ashrams" className="rounded-2xl border border-amber-400/30 bg-white/5 px-7 py-3.5 text-sm font-bold text-amber-200 backdrop-blur transition hover:bg-white/10">Explore all ashrams</Link></Reveal>
        </div>
      </section>

      {/* 10 · courses */}
      <section className="py-16 md:py-24" aria-label="Cultural courses">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Vidya & Sadhana" title="Learn the Living Traditions" sub="Sanskrit, Gita, yoga, meditation and bhajan — taught live by practising acharyas." />
          <div className="grid gap-6 md:grid-cols-3">
            {COURSES.slice(0, 3).map((c, i) => <CourseCard key={c.slug} c={c} i={i} />)}
          </div>
          <Reveal className="mt-10 text-center"><Link to="/courses" className="btn-saffron inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white"><GraduationCap size={16} /> All courses</Link></Reveal>
        </div>
      </section>

      {/* 11 · panchang today */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#7c2d12] via-[#c2410c] to-[#9a3412] py-16 text-white md:py-24" aria-label="Today's panchang">
        <span className="font-sanskrit pointer-events-none absolute -left-6 top-0 select-none text-[14rem] leading-none text-white/10" aria-hidden>ॐ</span>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <Eyebrow icon={<MoonStar size={12} />}>Panchang · {p.displayDate}</Eyebrow>
              <h2 className="font-display mt-4 text-3xl font-semibold md:text-5xl">Today's Sacred Almanac</h2>
              <p className="mt-3 text-orange-100/90">Guidance-grade Varanasi panchang — tithi, nakshatra, Rahukaal and Abhijit, computed fresh every day.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/panchang" className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-orange-900 transition hover:bg-amber-100">Full Panchang</Link>
                <Link to="/calendar" className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20">Festival Calendar</Link>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ icon: <MoonStar size={17} />, l: "Tithi", v: `${p.tithi.name}`, s: `${p.tithi.paksha} · ends ${p.tithi.ends}` }, { icon: <Sparkles size={17} />, l: "Nakshatra", v: `${p.nakshatra.name} · Pada ${p.nakshatra.pada}`, s: `Yoga: ${p.yoga.name} · Karana: ${p.karana.name}` }, { icon: <Sun size={17} />, l: "Sunrise – Sunset", v: `${p.sunrise} – ${p.sunset}`, s: `Moonrise ${p.moonrise} · ${p.vara}` }, { icon: <Clock size={17} />, l: "Rahukaal (avoid)", v: p.rahukaal, s: `Abhijit (shubh): ${p.abhijit}` }].map((c, i) => (
              <Reveal key={c.l} delay={i * 0.08}>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur transition hover:bg-white/15">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">{c.icon} {c.l}</p>
                  <p className="font-display mt-2 text-xl font-semibold">{c.v}</p>
                  <p className="mt-1 text-[13px] text-orange-100/80">{c.s}</p>
                </div>
              </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 12 · yatra */}
      <section className="bg-gradient-to-b from-[#fffdf7] to-orange-50/60 py-16 md:py-24" aria-label="Yatra packages">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Sacred Travel" title="Signature Yatra Packages" sub="Heli Char Dham, Kashi–Ayodhya–Prayagraj and the Tamil grand circuit — sattvic stays, VIP darshan help." />
          <div className="grid gap-6 md:grid-cols-3">
            {PACKAGES.slice(0, 3).map((pk, i) => <PackageCard key={pk.slug} p={pk} i={i} />)}
          </div>
          <Reveal className="mt-10 text-center"><Link to="/packages" className="btn-saffron inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white"><Compass size={16} /> All yatra packages</Link></Reveal>
        </div>
      </section>

      {/* 13 · pilgrimage places */}
      <section className="py-16 md:py-24" aria-label="Pilgrimage places">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Tirtha Kshetra" title="Popular Pilgrimage Places" sub="Holy cities, dhams and temple towns — history, best time and how to reach." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLACES.slice(0, 4).map((pl, i) => <PlaceCard key={pl.slug} p={pl} i={i} />)}
          </div>
          <Reveal className="mt-10 text-center"><Link to="/spiritual-places" className="inline-flex items-center gap-2 rounded-2xl border border-orange-700/25 bg-white px-7 py-3.5 text-sm font-bold text-orange-900 transition hover:bg-orange-50">All spiritual places <ArrowRight size={16} /></Link></Reveal>
        </div>
      </section>

      {/* 14 · gallery + videos */}
      <section className="bg-[#1c1410] py-16 text-white md:py-24" aria-label="Gallery">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Darshan Gallery" title="Glimpses of the Sacred" sub="Temples at dawn, aarti flames and Himalayan trails." />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {GALLERY.slice(0, 8).map((g, i) => (
              <Reveal key={g.src + i} delay={(i % 4) * 0.06}>
                <Link to="/gallery" className="img-zoom group relative block overflow-hidden rounded-2xl" aria-label={g.title}>
                  <img src={g.src} alt={g.title} loading="lazy" className="h-44 w-full object-cover md:h-56" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                  <span className="absolute bottom-2.5 left-3 right-3"><span className="block text-[12px] font-bold">{g.title}</span><span className="text-[11px] text-amber-300">{g.tag}</span></span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/gallery" className="rounded-2xl border border-amber-400/30 bg-white/5 px-6 py-3 text-sm font-bold text-amber-200 transition hover:bg-white/10">Open Gallery</Link>
            <Link to="/videos" className="btn-gold flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white"><Play size={15} /> Watch Videos</Link>
          </Reveal>
        </div>
      </section>

      {/* 15 · articles */}
      <section className="py-16 md:py-24" aria-label="Knowledge articles">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead eyebrow="Jnana" title="Wisdom & Guides" sub="Panchang primers, yatra checklists and the meaning behind the rituals." />
          <div className="grid gap-6 md:grid-cols-3">
            {ARTICLES.slice(0, 3).map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.08}>
                <Link to={`/articles/${a.slug}`} className="img-zoom group block overflow-hidden rounded-3xl border border-orange-900/10 bg-white sacred-border">
                  <div className="h-48 overflow-hidden"><img src={a.image} alt={a.title} loading="lazy" className="h-full w-full object-cover" /></div>
                  <div className="p-6">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-700"><BookOpen size={12} /> {a.category} · {a.readTime}</p>
                    <h3 className="font-display clamp-2 mt-2 text-xl font-semibold leading-snug text-[#2a1a10] group-hover:text-orange-800">{a.title}</h3>
                    <p className="clamp-2 mt-2 text-sm text-stone-600">{a.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center"><Link to="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-orange-700 underline underline-offset-4">Read all articles <ArrowRight size={15} /></Link></Reveal>
        </div>
      </section>

      {/* stats band */}
      <section className="border-y border-orange-900/10 bg-amber-50/60 py-10" aria-label="Platform impact">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4 md:px-6">
          {[{ v: 8, s: "", l: "Puja categories" }, { v: 12, s: "", l: "Signature yatra routes" }, { v: 6, s: "", l: "Living course lineages" }, { v: 365, s: "", l: "Days of Panchang guidance" }].map((x) => (
            <div key={x.l}><p className="font-display text-3xl font-bold text-orange-900 md:text-4xl"><Counter to={x.v} suffix={x.s} /></p><p className="mt-1 text-[13px] font-semibold text-stone-500">{x.l}</p></div>
          ))}
        </div>
      </section>

      {/* 16 · whatsapp + more links */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-16 md:px-6 lg:px-8">
        <WhatsAppBand title="Not sure where to begin your sacred journey?" sub="Tell us your city, language and wish — a seva guide will craft your darshan, puja or yatra plan on WhatsApp within hours." message="Namaste DivyaDhara! Please help me plan my spiritual journey." />
        <Reveal>
          <div className="grid gap-4 rounded-[2rem] border border-orange-900/10 bg-white p-6 sacred-border md:grid-cols-3 md:p-8">
            {[{ icon: <CalendarDays size={20} />, t: "Festival Calendar", d: "Ekadashi, Purnima, Amavasya & vrats for the full year.", h: "/calendar" }, { icon: <MapPin size={20} />, t: "Darshan Timings", d: "Morning–evening windows for every major temple.", h: "/temples" }, { icon: <BookOpen size={20} />, t: "Courses & Gurukul", d: "Sanskrit to Bhajan — new batches every month.", h: "/courses" }].map((c) => (
              <Link key={c.t} to={c.h} className="group flex items-start gap-4 rounded-2xl bg-orange-50/60 p-5 transition hover:bg-orange-50">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 text-white">{c.icon}</span>
                <span><span className="font-display block text-lg font-semibold text-[#2a1a10]">{c.t}</span><span className="mt-1 block text-sm text-stone-600">{c.d}</span></span>
              </Link>
            ))}
          </div>
        </Reveal>
        {/* price note */}
        <Reveal>
          <p className="text-center text-xs text-stone-400">Puja from {inr(1100)} · Yatra batches with sattvic stays · All pandits identity-verified · <Link to="/about" className="font-bold text-orange-700 underline">How we verify</Link></p>
        </Reveal>
      </section>
    </>
  );
}
