import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, User, BadgeCheck, MessageCircle, BookOpen, CalendarDays } from "lucide-react";
import { COURSES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal, SectionHead } from "../components/ui";
import { CourseCard } from "../components/cards";
import { EnquiryForm, PageHero, WhatsAppBand } from "../components/blocks";
import { waLink } from "../lib/utils";

export function CourseList() {
  useSEO({ title: "Cultural Courses — Sanskrit, Yoga, Gita, Bhajan | DivyaDhara", description: "Live online & residential courses: Sanskrit, 200-hr Yoga, Dhyana meditation, Bhagavad Gita, Bhajan music & Bal Sanskar for children.", path: "/courses" });
  const [cat, setCat] = useState("");
  const cats = [...new Set(COURSES.map((c) => c.category))];
  const list = COURSES.filter((c) => !cat || c.category === cat);
  return (
    <>
      <PageHero eyebrow="Vidya · Sadhana" title="Cultural Courses" sub="Learn from practising acharyas — live batches, small cohorts, recordings and certification." image="/images/yoga-course.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Courses" }]} />
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setCat("")} className={`rounded-full px-4 py-2.5 text-[13px] font-bold ${!cat ? "bg-[#2a1a10] text-amber-200" : "bg-white text-stone-600 ring-1 ring-orange-900/15"}`}>All</button>
          {cats.map((c) => <button key={c} onClick={() => setCat(c === cat ? "" : c)} className={`rounded-full px-4 py-2.5 text-[13px] font-bold ${cat === c ? "bg-orange-700 text-white" : "bg-white text-stone-600 ring-1 ring-orange-900/15"}`}>{c}</button>)}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map((c, i) => <CourseCard key={c.slug} c={c} i={i} />)}</div>
      </div>
    </>
  );
}

export function CourseDetail() {
  const { slug } = useParams();
  const c = COURSES.find((x) => x.slug === slug);
  useSEO({ title: c ? `${c.title} — ${c.fee} | DivyaDhara Courses` : "Course Not Found", description: c ? `${c.title} by ${c.instructor}. ${c.duration} · ${c.mode}. ${c.overview}` : "Not found", path: `/courses/${slug}`, image: c?.image, schema: c ? { "@context": "https://schema.org", "@type": "Course", name: c.title, description: c.overview, provider: { "@type": "Organization", name: "DivyaDhara" } } : undefined });
  if (!c) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Course not found</h1><Link to="/courses" className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white">All courses</Link></div>;
  const wa = waLink(`Namaste! I want to register for: ${c.title} (${c.fee}). Please share batch dates.`);
  return (
    <>
      <section className="relative overflow-hidden bg-[#1c1410] text-white">
        <img src={c.image} alt={c.title} className="kenburns absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1410] via-black/55 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Courses", href: "/courses" }, { label: c.title }]} />
          <div className="mt-6 flex flex-wrap gap-2 text-[12px] font-bold">
            <span className="rounded-full bg-amber-400 px-3 py-1 text-[#3a2415]">{c.category}</span>
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">{c.level}</span>
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">{c.mode}</span>
            <span className="rounded-full bg-emerald-500/90 px-3 py-1">{c.fee}</span>
          </div>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold md:text-5xl">{c.title}</h1>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-200"><span className="flex items-center gap-1.5"><User size={15} className="text-amber-400" /> {c.instructor}</span><span className="flex items-center gap-1.5"><Clock size={15} className="text-amber-400" /> {c.duration}</span><span className="flex items-center gap-1.5"><CalendarDays size={15} className="text-amber-400" /> {c.schedule}</span></p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white"><MessageCircle size={16} /> Register on WhatsApp</a>
            <a href="#register" className="btn-saffron rounded-2xl px-6 py-3 text-sm font-bold text-white">Register Below</a>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Reveal><h2 className="font-display text-2xl font-semibold text-[#2a1a10]">Overview</h2><p className="mt-3 leading-relaxed text-stone-600">{c.overview}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[`Eligibility: ${c.eligibility}`, `Schedule: ${c.schedule}`, `Mode: ${c.mode}`].map((x) => <p key={x} className="rounded-2xl bg-orange-50 p-4 text-[13px] font-semibold text-stone-700 ring-1 ring-orange-200">{x}</p>)}
            </div></Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]"><BookOpen size={22} className="text-orange-600" /> Curriculum</h2>
            <ol className="mt-4 space-y-2.5">{c.curriculum.map((m, i) => <li key={m} className="flex items-start gap-3 rounded-2xl border border-orange-900/10 bg-white px-4 py-3.5 text-sm text-stone-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-xs font-extrabold text-white">{i + 1}</span>{m}</li>)}</ol>
          </Reveal>
          <Reveal className="mt-8 flex items-center gap-3 rounded-3xl bg-[#1c1410] p-6 text-white">
            <BadgeCheck size={28} className="shrink-0 text-amber-400" />
            <p className="text-sm leading-relaxed">Certificate of completion, lifetime recordings access and alumni satsang circle included in the fee. Scholarships for gurukul students — <Link to="/contact" className="font-bold text-amber-300 underline">ask us</Link>.</p>
          </Reveal>
        </div>
        <aside id="register" className="mt-10 scroll-mt-28 lg:mt-0"><div className="lg:sticky lg:top-28"><EnquiryForm context={`Course registration: ${c.title}`} title="Register Interest" /></div></aside>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-6 md:px-6 lg:px-8"><WhatsAppBand title="Doubts about level or schedule?" sub="Message us — an academic counsellor will place you in the right batch, free." message={`Namaste! I have a question about the course: ${c.title}`} /></div>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <SectionHead eyebrow="Keep Learning" title="Other Courses" />
        <div className="grid gap-6 md:grid-cols-3">{COURSES.filter((x) => x.slug !== c.slug).slice(0, 3).map((x, i) => <CourseCard key={x.slug} c={x} i={i} />)}</div>
      </section>
    </>
  );
}
