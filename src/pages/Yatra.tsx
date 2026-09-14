import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import { PLACES, PACKAGES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, SectionHead } from "../components/ui";
import { PlaceCard, PackageCard } from "../components/cards";
import { PageHero } from "../components/blocks";
import { inr } from "../lib/utils";

export function Places() {
  useSEO({
    title:
      "Spiritual Places — Jyotirlingas, Char Dham, Holy Cities | DivyaDhara",
    description:
      "Jyotirlingas, Shakti Peethas, Char Dham, holy cities & ashram circuits: history, significance, best time, how to reach and nearby places.",
    path: "/spiritual-places",
  });
  const [q, setQ] = useState("");
  const list = PLACES.filter(
    (p) =>
      !q || (p.name + p.state + p.type).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHero
        eyebrow="Tirtha Kshetra · Bharat"
        title="Spiritual Places of India"
        sub="From Himalayan dhams to island temples — significance, attractions, best time and how to reach."
        image="/images/yatra-himalaya.jpeg"
      />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Spiritual Places" }]}
        />
        <label className="mt-6 flex items-center gap-2 rounded-2xl border border-orange-900/15 bg-white px-4 py-3">
          <Search size={16} className="text-orange-600" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search places… (e.g., Kashi, Char Dham, Madurai)"
            className="w-full bg-transparent text-sm outline-none"
            aria-label="Search places"
          />
        </label>
        <p className="mt-4 text-sm text-stone-500" role="status">
          Showing <strong className="text-stone-800">{list.length}</strong>{" "}
          sacred destinations
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => (
            <PlaceCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      </div>
    </>
  );
}

export function Packages() {
  useSEO({
    title: "Yatra Packages — Char Dham, Kashi, Tamil Circuit | DivyaDhara",
    description:
      "Premium pilgrimage packages: Char Dham helicopter, Kashi–Ayodhya–Prayagraj, Maharashtra Jyotirlingas, Tamil grand circuit & Do Dham. Sattvic stays, VIP darshan help.",
    path: "/packages",
  });
  const [max, setMax] = useState(200000);
  const list = PACKAGES.filter((p) => p.price <= max);
  return (
    <>
      <PageHero
        eyebrow="Yatra · Premium Pilgrimage"
        title="Signature Yatra Packages"
        sub="Small groups, sattvic stays, darshan assistance and acharya guidance — travel as sadhana."
        image="/images/hero-kedarnath.jpeg"
      >
        <Link
          to="/spiritual-places"
          className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20"
        >
          Explore Places First
        </Link>
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Yatra Packages" }]}
        />
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-3xl border border-orange-900/10 bg-white p-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-[#2a1a10]">
              Filter by budget (per person)
            </p>
            <p className="text-xs text-stone-500">
              Up to <strong className="text-orange-800">{inr(max)}</strong> ·{" "}
              {list.length} yatras
            </p>
          </div>
          <input
            type="range"
            min={15000}
            max={200000}
            step={5000}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full accent-orange-700 md:w-72"
            aria-label="Maximum price"
          />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <PackageCard key={p.slug} p={p} i={i} />
          ))}
        </div>
        <div className="mt-12">
          <SectionHead
            eyebrow="Custom Yatra"
            title="Need a private or group yatra?"
            sub="Family kul-devta trips, corporate spiritual offsites, senior-citizen slow yatras — designed around you."
          />
          <p className="text-center">
            <Link
              to="/contact"
              className="btn-saffron rounded-2xl px-7 py-3.5 text-sm font-bold text-white"
            >
              Request Custom Yatra
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

import { useParams } from "react-router-dom";
import { Breadcrumbs as BC, Reveal } from "../components/ui";
import { EnquiryForm, WhatsAppBand } from "../components/blocks";
import { waLink } from "../lib/utils";
import {
  MessageCircle,
  Clock,
  Bus,
  BedDouble,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

export function PlaceDetail() {
  const { slug } = useParams();
  const p = PLACES.find((x) => x.slug === slug);
  useSEO({
    title: p
      ? `${p.name} — History, Best Time & How to Reach | DivyaDhara`
      : "Place Not Found",
    description: p ? `${p.name} (${p.state}): ${p.summary}` : "Not found",
    path: `/spiritual-places/${slug}`,
    image: p?.image,
  });
  if (!p)
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Place not found</h1>
        <Link
          to="/spiritual-places"
          className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white"
        >
          All places
        </Link>
      </div>
    );
  return (
    <>
      <section className="relative overflow-hidden bg-[#1c1410] text-white">
        <img
          src={p.image}
          alt={p.name}
          className="kenburns absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1410] via-black/50 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6 lg:px-8">
          <BC
            items={[
              { label: "Home", href: "/" },
              { label: "Spiritual Places", href: "/spiritual-places" },
              { label: p.name },
            ]}
          />
          <span className="mt-6 inline-block rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold text-[#3a2415]">
            {p.type}
          </span>
          <h1 className="font-display mt-3 text-4xl font-semibold md:text-6xl">
            {p.name}
          </h1>
          <p className="mt-3 max-w-2xl text-stone-200">{p.summary}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-200">
            <MapPin size={15} /> {p.state} · Best time: {p.bestTime}
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">
              Significance
            </h2>
            <ul className="mt-4 space-y-2">
              {p.significance.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2.5 rounded-xl bg-orange-50/70 px-4 py-3 text-sm text-stone-700 ring-1 ring-orange-100"
                >
                  <span className="text-orange-600">❖</span>
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">
              What to Experience
            </h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {p.attractions.map((a) => (
                <p
                  key={a}
                  className="rounded-2xl border border-orange-900/10 bg-white p-4 text-sm font-semibold text-stone-700"
                >
                  ✦ {a}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#1c1410] p-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Best Time
              </p>
              <p className="font-display mt-1 text-lg font-semibold">
                {p.bestTime}
              </p>
            </div>
            <div className="rounded-2xl border border-orange-900/10 bg-white p-5 md:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange-700">
                How to Reach
              </p>
              <p className="mt-1 text-sm text-stone-600">{p.reach}</p>
            </div>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">
              Nearby Sacred Places
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {p.nearby.map((n) => (
                <span
                  key={n}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-stone-700 ring-1 ring-orange-900/10"
                >
                  {n}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">
              Glimpses
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-32 rounded-2xl object-cover md:h-44"
              />
              <img
                src="/images/hero-varanasi.jpeg"
                alt="Sacred ghats"
                loading="lazy"
                className="h-32 rounded-2xl object-cover md:h-44"
              />
              <img
                src="/images/aarti-night.jpeg"
                alt="Evening aarti"
                loading="lazy"
                className="h-32 rounded-2xl object-cover md:h-44"
              />
            </div>
          </Reveal>
        </div>
        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-28">
            <EnquiryForm
              context={`Place enquiry: ${p.name}`}
              title="Plan My Visit"
            />
          </div>
        </aside>
      </div>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold">
          Yatras covering this region
        </h2>
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {PACKAGES.slice(0, 3).map((x, i) => (
            <PackageCard key={x.slug} p={x} i={i} />
          ))}
        </div>
      </section>
    </>
  );
}

export function PackageDetail() {
  const { slug } = useParams();
  const pk = PACKAGES.find((x) => x.slug === slug);
  useSEO({
    title: pk
      ? `${pk.name} — ${inr(pk.price)} | DivyaDhara Yatras`
      : "Package Not Found",
    description: pk
      ? `${pk.name}: ${pk.duration}, ${pk.destination}. ${pk.transport}, ${pk.stay}. Dates: ${pk.dates.join(", ")}.`
      : "Not found",
    path: `/packages/${slug}`,
    image: pk?.image,
  });
  if (!pk)
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Yatra not found</h1>
        <Link
          to="/packages"
          className="btn-saffron mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-white"
        >
          All yatras
        </Link>
      </div>
    );
  const wa = waLink(
    `Namaste! I want to join: ${pk.name} (${pk.duration}, ${inr(pk.price)}/person). Travellers & date: …`,
  );
  return (
    <>
      <section className="relative overflow-hidden bg-[#1c1410] text-white">
        <img
          src={pk.image}
          alt={pk.name}
          className="kenburns absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1410] via-black/50 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6 lg:px-8">
          <BC
            items={[
              { label: "Home", href: "/" },
              { label: "Yatra Packages", href: "/packages" },
              { label: pk.name },
            ]}
          />
          <div className="mt-6 flex flex-wrap gap-2 text-[12px] font-bold">
            <span className="rounded-full bg-orange-600 px-3 py-1">
              {pk.duration}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              {pk.groupSize}
            </span>
            {pk.oldPrice && (
              <span className="rounded-full bg-amber-400 px-3 py-1 text-[#3a2415]">
                Save {inr(pk.oldPrice - pk.price)}
              </span>
            )}
          </div>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">
            {pk.name}
          </h1>
          <p className="mt-2 text-amber-200">{pk.destination}</p>
          <p className="mt-3">
            <span className="font-display text-4xl font-bold text-amber-300">
              {inr(pk.price)}
            </span>{" "}
            <span className="text-sm text-stone-300">
              per person · {pk.meals}
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white"
            >
              <MessageCircle size={16} /> Enquire on WhatsApp
            </a>
            <Link
              to={`/packages/${pk.slug}/enquiry`}
              className="btn-saffron rounded-2xl px-6 py-3 text-sm font-bold text-white"
            >
              Book This Yatra →
            </Link>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Reveal className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-orange-900/10 bg-white p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-700">
                <Bus size={14} /> Transport
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700">
                {pk.transport}
              </p>
            </div>
            <div className="rounded-2xl border border-orange-900/10 bg-white p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-700">
                <BedDouble size={14} /> Stay
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700">
                {pk.stay}
              </p>
            </div>
            <div className="rounded-2xl border border-orange-900/10 bg-white p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-700">
                <UtensilsCrossed size={14} /> Meals
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700">
                {pk.meals}
              </p>
            </div>
          </Reveal>
          <Reveal className="mt-6 rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#3a2415]">
              <Clock size={15} className="text-orange-700" /> Departures:{" "}
              {pk.dates.join(" · ")}
            </p>
            <p className="mt-1 text-[13px] text-stone-600">
              Places covered: {pk.places.join(" · ")}
            </p>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-[#2a1a10]">
              Day-wise Itinerary
            </h2>
            <ol className="relative mt-5 space-y-5 border-l-2 border-orange-200 pl-6">
              {pk.itinerary.map((d) => (
                <li key={d.day} className="relative">
                  <span className="absolute -left-[2.05rem] top-0 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-[10px] font-extrabold text-white ring-4 ring-[#fffdf7]">
                    {d.day.replace("Day ", "D")}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-700">
                    {d.day}
                  </p>
                  <p className="font-display text-lg font-semibold text-[#2a1a10]">
                    {d.title}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{d.desc}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6">
              <h3 className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 size={18} /> Inclusions
              </h3>
              <ul className="mt-3 space-y-1.5">
                {pk.inclusions.map((x) => (
                  <li key={x} className="text-sm text-emerald-950/90">
                    ✓ {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-red-200 bg-red-50/60 p-6">
              <h3 className="flex items-center gap-2 font-bold text-red-950">
                <XCircle size={18} /> Exclusions
              </h3>
              <ul className="mt-3 space-y-1.5">
                {pk.exclusions.map((x) => (
                  <li key={x} className="text-sm text-red-950/80">
                    ✕ {x}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-[#2a1a10]">
              <FileText size={22} className="text-orange-600" /> Terms
            </h2>
            <ul className="mt-3 space-y-1.5">
              {pk.terms.map((x) => (
                <li key={x} className="text-sm text-stone-600">
                  • {x}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="mt-8">
            <h2 className="font-display text-2xl font-semibold">
              Glimpses of this route
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <img
                src={pk.image}
                alt={pk.name}
                loading="lazy"
                className="h-32 rounded-2xl object-cover md:h-44"
              />
              <img
                src="/images/hero-varanasi.jpeg"
                alt="Ganga ghats"
                loading="lazy"
                className="h-32 rounded-2xl object-cover md:h-44"
              />
              <img
                src="/images/aarti-night.jpeg"
                alt="Aarti"
                loading="lazy"
                className="h-32 rounded-2xl object-cover md:h-44"
              />
            </div>
          </Reveal>
        </div>
        <aside className="mt-10 lg:mt-0">
          <div className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-[#1c1410] p-6 text-center text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-400">
                Starting price
              </p>
              <p className="font-display mt-1 text-4xl font-bold text-amber-300">
                {inr(pk.price)}
              </p>
              <p className="text-xs text-stone-400">
                per person on twin sharing
              </p>
              <Link
                to={`/packages/${pk.slug}/enquiry`}
                className="btn-saffron mt-4 block rounded-2xl px-4 py-3.5 text-sm font-bold text-white"
              >
                Enquire / Reserve Seat
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white"
              >
                WhatsApp Yatra Desk
              </a>
            </div>
            <EnquiryForm
              context={`Yatra: ${pk.name}`}
              title="Quick Enquiry"
              compact
            />
          </div>
        </aside>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-6 md:px-6 lg:px-8">
        <WhatsAppBand
          title="Travelling with seniors or a large family?"
          sub="We arrange wheelchairs, slow-paced itineraries, ground-floor rooms and Jain / no-onion-garlic meals on request."
          message={`Namaste! For ${pk.name}, I need senior-citizen / family assistance.`}
        />
      </div>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <h2 className="font-display flex items-center gap-2 text-2xl font-semibold">
          More Yatras <ChevronRight size={20} className="text-orange-600" />
        </h2>
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {PACKAGES.filter((x) => x.slug !== pk.slug)
            .slice(0, 3)
            .map((x, i) => (
              <PackageCard key={x.slug} p={x} i={i} />
            ))}
        </div>
      </section>
    </>
  );
}

export function PackageEnquiry() {
  const { slug } = useParams();
  const pk = PACKAGES.find((x) => x.slug === slug);
  useSEO({
    title: pk ? `Enquire — ${pk.name} | DivyaDhara` : "Enquiry",
    description: pk
      ? `Reserve your seat for ${pk.name} (${pk.duration}). Free guidance, no advance needed for enquiry.`
      : "Enquiry",
    path: `/packages/${slug}/enquiry`,
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <BC
        items={[
          { label: "Home", href: "/" },
          { label: "Yatra Packages", href: "/packages" },
          ...(pk ? [{ label: pk.name, href: `/packages/${pk.slug}` }] : []),
          { label: "Enquiry" },
        ]}
      />
      <Reveal className="mt-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-700">
          Reserve your seat · No advance for enquiry
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold md:text-4xl">
          {pk ? pk.name : "Yatra Enquiry"}
        </h1>
        {pk && (
          <p className="mt-2 text-stone-500">
            {pk.duration} · {pk.destination} · from {inr(pk.price)}/person
          </p>
        )}
      </Reveal>
      <div className="mt-8">
        <EnquiryForm
          context={
            pk
              ? `Yatra booking enquiry: ${pk.name} (${pk.duration})`
              : "Yatra enquiry"
          }
          title="Travel Enquiry Form"
        />
      </div>
      <p className="mt-6 text-center text-sm text-stone-500">
        Prefer talking?{" "}
        <a
          className="font-bold text-orange-700 underline"
          href={waLink(
            pk
              ? `Namaste! I want to join ${pk.name}.`
              : "Namaste! I want to plan a yatra.",
          )}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp the Yatra Desk
        </a>
      </p>
    </div>
  );
}
