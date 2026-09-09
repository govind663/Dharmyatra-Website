import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Play, Image as ImageIcon, X, ArrowRight } from "lucide-react";
import { GALLERY, ARTICLES, TEMPLES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal, SectionHead } from "../components/ui";
import { PageHero } from "../components/blocks";
import { formatDate } from "../lib/utils";

const VIDEO_FAKE = [
  { title: "Saptarishi Aarti — Kashi Vishwanath (Evening)", len: "24:10", img: "/images/aarti-night.jpg", tag: "Live Aarti" },
  { title: "Bhasma Aarti Darshan — Mahakaal Ujjain (4 AM)", len: "18:42", img: "/images/havan-fire.jpg", tag: "Aarti" },
  { title: "Char Dham Helicopter Yatra — Full Film", len: "12:35", img: "/images/yatra-himalaya.jpg", tag: "Yatra" },
  { title: "Meenakshi Thirukalyanam — Celestial Wedding", len: "09:58", img: "/images/temple-south.jpg", tag: "Festival" },
  { title: "Rudrabhishek Vidhi — Step-by-Step with Shastri ji", len: "15:20", img: "/images/puja-thali.jpg", tag: "Puja" },
  { title: "Morning Yoga on the Ganga — Rishikesh", len: "11:04", img: "/images/yoga-course.jpg", tag: "Yoga" },
];

export function Gallery() {
  useSEO({ title: "Gallery — Temples, Aarti, Yatra & Festivals | DivyaDhara", description: "Sacred imagery: Kashi ghats, Kedarnath, Meenakshi gopuram, Ganga aarti, havan, ashrams and yatra trails.", path: "/gallery" });
  const [tag, setTag] = useState("");
  const [light, setLight] = useState<number | null>(null);
  const tags = [...new Set(GALLERY.map((g) => g.tag))];
  const list = GALLERY.filter((g) => !tag || g.tag === tag);
  return (
    <>
      <PageHero eyebrow="Darshan Gallery" title="Sacred Gallery" sub="Dawn ghats, aarti flames and Himalayan trails — lazy-loaded and optimised." image="/images/hero-varanasi.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gallery" }]} />
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setTag("")} className={`rounded-full px-4 py-2.5 text-[13px] font-bold ${!tag ? "bg-[#2a1a10] text-amber-200" : "bg-white text-stone-600 ring-1 ring-orange-900/15"}`}>All</button>
          {tags.map((t) => <button key={t} onClick={() => setTag(t === tag ? "" : t)} className={`rounded-full px-4 py-2.5 text-[13px] font-bold ${tag === t ? "bg-orange-700 text-white" : "bg-white text-stone-600 ring-1 ring-orange-900/15"}`}>{t}</button>)}
        </div>
        <div className="mt-8 columns-2 gap-3 md:columns-3 lg:columns-4 [&>button]:mb-3">
          {list.map((g, i) => (
            <button key={g.src + i} onClick={() => setLight(i)} className="img-zoom group relative block w-full overflow-hidden rounded-2xl text-left" aria-label={`View ${g.title}`}>
              <img src={g.src} alt={g.title} loading="lazy" className="w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
              <span className="absolute bottom-2.5 left-3 right-3"><span className="block text-[13px] font-bold text-white">{g.title}</span><span className="text-[11px] text-amber-300">{g.tag}</span></span>
            </button>
          ))}
        </div>
        {light !== null && list[light] && (
          <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4" onClick={() => setLight(null)} role="dialog" aria-modal="true" aria-label={list[light].title}>
            <div className="relative max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <img src={list[light].src} alt={list[light].title} className="max-h-[80vh] rounded-2xl object-contain" />
              <p className="mt-3 text-center text-sm font-bold text-white">{list[light].title} · {list[light].tag}</p>
              <button onClick={() => setLight(null)} aria-label="Close" className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-black"><X size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function Videos() {
  useSEO({ title: "Videos — Live Aarti, Katha, Yatra Films | DivyaDhara", description: "Watch Ganga & Bhasma aartis, Char Dham films, puja vidhis and yoga sessions. New recordings every week.", path: "/videos" });
  const [active, setActive] = useState<number | null>(null);
  return (
    <>
      <PageHero eyebrow="Darshan Videos" title="Watch & Immerse" sub="Aartis, kathas and yatra films. Tap any card for a cinematic preview experience." image="/images/aarti-night.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Videos" }]} />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VIDEO_FAKE.map((v, i) => (
            <Reveal key={v.title} delay={(i % 3) * 0.07}>
              <button onClick={() => setActive(i)} className="img-zoom group block w-full overflow-hidden rounded-3xl border border-orange-900/10 bg-white text-left sacred-border" aria-label={`Play ${v.title}`}>
                <div className="relative h-52 overflow-hidden">
                  <img src={v.img} alt={v.title} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-black/30" />
                  <span className="absolute inset-0 grid place-items-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-orange-700 shadow-2xl transition group-hover:scale-110"><Play size={24} fill="currentColor" /></span></span>
                  <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-bold text-white">{v.len}</span>
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-orange-600 px-2.5 py-1 text-[11px] font-bold text-white">{v.tag}</span>
                </div>
                <span className="block p-5"><span className="font-display block text-[17px] font-semibold leading-snug text-[#2a1a10]">{v.title}</span><span className="mt-1 block text-xs text-stone-500">DivyaDhara Darshan · Weekly recordings</span></span>
              </button>
            </Reveal>
          ))}
        </div>
        {active !== null && (
          <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4" onClick={() => setActive(null)} role="dialog" aria-modal="true" aria-label={VIDEO_FAKE[active].title}>
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-[#1c1410]" onClick={(e) => e.stopPropagation()}>
              <div className="relative"><img src={VIDEO_FAKE[active].img} alt="" className="h-64 w-full object-cover opacity-70 md:h-96" />
                <span className="absolute inset-0 grid place-items-center"><span className="grid h-20 w-20 place-items-center rounded-full bg-orange-600 text-white shadow-2xl"><Play size={30} fill="currentColor" /></span></span>
                <button onClick={() => setActive(null)} aria-label="Close" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-black"><X size={18} /></button>
              </div>
              <div className="p-6 text-white"><p className="font-display text-xl font-semibold">{VIDEO_FAKE[active].title}</p><p className="mt-2 text-sm text-stone-300">Full streaming with sankalpa booking launches with our media CMS. Meanwhile, join the live aartis via our temple pages or WhatsApp broadcast list.</p>
                <div className="mt-4 flex gap-2"><Link to="/temples" className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold">Find Live Aarti</Link><button onClick={() => setActive(null)} className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold">Close</button></div></div>
            </div>
          </div>
        )}
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-stone-500"><ImageIcon size={15} className="text-orange-600" /> Prefer stills? <Link to="/gallery" className="font-bold text-orange-700 underline">Open the photo gallery</Link></p>
      </div>
    </>
  );
}

export function Articles() {
  useSEO({ title: "Wisdom & Guides — Panchang, Yatra, Sanskar | DivyaDhara", description: "Essays and practical guides: reading the Panchang, Bhasma Aarti, Char Dham preparation, Griha Pravesh muhurats, Sanskrit for beginners.", path: "/articles" });
  return (
    <>
      <PageHero eyebrow="Jnana · Wisdom" title="Articles & Guides" sub="The meaning behind the rituals — researched, respectful, practical." image="/images/temple-corridor.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Articles" }]} />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 0.07}>
              <Link to={`/articles/${a.slug}`} className="img-zoom group block h-full overflow-hidden rounded-3xl border border-orange-900/10 bg-white sacred-border">
                <div className="h-52 overflow-hidden"><img src={a.image} alt={a.title} loading="lazy" className="h-full w-full object-cover" /></div>
                <div className="p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-700">{a.category} · {formatDate(a.date)} · {a.readTime}</p>
                  <h2 className="font-display clamp-2 mt-2 text-xl font-semibold text-[#2a1a10] group-hover:text-orange-800">{a.title}</h2>
                  <p className="clamp-2 mt-2 text-sm text-stone-600">{a.excerpt}</p>
                  <p className="mt-3 text-sm font-bold text-orange-700">Read article <ArrowRight size={14} className="inline" /></p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

export function ArticleDetail() {
  const { slug } = useParams();
  const a = ARTICLES.find((x) => x.slug === slug);
  useSEO({ title: a ? `${a.title} | DivyaDhara Wisdom` : "Article Not Found", description: a?.excerpt ?? "Not found", path: `/articles/${slug}`, image: a?.image, schema: a ? { "@context": "https://schema.org", "@type": "Article", headline: a.title, datePublished: a.date } : undefined });
  if (!a) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Article not found</h1><Link to="/articles" className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white">All articles</Link></div>;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Articles", href: "/articles" }, { label: a.title }]} />
      <Reveal className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-700">{a.category} · {formatDate(a.date)} · {a.readTime} read</p>
        <h1 className="font-display mt-3 text-3xl font-semibold leading-tight md:text-[2.75rem]">{a.title}</h1>
        <p className="mt-3 text-lg text-stone-500">{a.excerpt}</p>
      </Reveal>
      <img src={a.image} alt={a.title} className="mt-6 h-72 w-full rounded-[1.75rem] object-cover md:h-96" />
      <div className="prose-sacred mt-8 text-[16.5px]">{a.body.map((p, i) => <p key={i}>{p}</p>)}</div>
      <div className="mt-8 rounded-3xl bg-orange-50 p-6 ring-1 ring-orange-200">
        <p className="text-sm text-stone-600">Related kshetras: {TEMPLES.slice(0, 3).map((t, i) => <span key={t.slug}><Link to={`/temples/${t.slug}`} className="font-bold text-orange-700 underline">{t.name}</Link>{i < 2 ? " · " : ""}</span>)}</p>
      </div>
      <SectionHead eyebrow="Keep Reading" title="More Wisdom" />
      <div className="grid gap-4 md:grid-cols-2">
        {ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 2).map((x) => (
          <Link key={x.slug} to={`/articles/${x.slug}`} className="rounded-2xl border border-orange-900/10 bg-white p-5 transition hover:shadow-lg"><p className="text-[11px] font-bold uppercase tracking-widest text-orange-700">{x.category}</p><p className="font-display mt-1 font-semibold">{x.title}</p></Link>
        ))}
      </div>
    </article>
  );
}
