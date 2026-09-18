import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PANDITS } from "../data/content";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Empty } from "../components/ui";
import { PanditCard } from "../components/cards";
import { PageHero } from "../components/blocks";

export default function Pandits() {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("");
  const [spec, setSpec] = useState("");

  const normalizedQuery = q.trim().toLowerCase();

  const langs = useMemo(
    () =>
      [...new Set(PANDITS.flatMap((p) => p.languages))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [],
  );

  const specs = useMemo(
    () =>
      [...new Set(PANDITS.flatMap((p) => p.specializations))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [],
  );

  const list = useMemo(
    () =>
      PANDITS.filter((p) => {
        const searchable = `${p.name} ${p.location} ${p.specializations.join(" ")} ${p.pujaTypes.join(" ")} ${p.languages.join(" ")}`
          .toLowerCase();

        return (
          (!normalizedQuery || searchable.includes(normalizedQuery)) &&
          (!lang || p.languages.includes(lang)) &&
          (!spec || p.specializations.includes(spec))
        );
      }),
    [lang, normalizedQuery, spec],
  );

  const hasFilters = Boolean(q || lang || spec);

  const resetFilters = () => {
    setQ("");
    setLang("");
    setSpec("");
  };

  const siteOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  const panditItems = PANDITS.map((p, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: siteOrigin ? `${siteOrigin}/pandits/${p.slug}` : `/pandits/${p.slug}`,
    item: {
      "@type": "Person",
      name: p.name,
      url: siteOrigin ? `${siteOrigin}/pandits/${p.slug}` : `/pandits/${p.slug}`,
      image: p.photo,
      description: p.about,
      jobTitle: p.title,
      knowsLanguage: p.languages,
      areaServed: p.location,
      knowsAbout: [...new Set([...p.specializations, ...p.pujaTypes])],
    },
  }));

  useSEO({
    title: "Verified Vedic Pandits for Puja & Rituals | DivyaDhara",
    description:
      "Find verified Vedic pandits for Rudrabhishek, Havan, Vivah, Puja and traditional rituals across India. Browse by city, language and specialization with transparent service details and booking enquiry.",
    path: "/pandits",
    image: "/images/pandit-portrait.jpeg",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": siteOrigin ? `${siteOrigin}/pandits#webpage` : "/pandits#webpage",
          name: "Verified Vedic Pandits",
          url: siteOrigin ? `${siteOrigin}/pandits` : "/pandits",
          description:
            "Directory of verified Vedic pandits and acharyas for puja, havan, vivah and traditional spiritual services.",
          breadcrumb: {
            "@id": siteOrigin
              ? `${siteOrigin}/pandits#breadcrumb`
              : "/pandits#breadcrumb",
          },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: panditItems,
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": siteOrigin
            ? `${siteOrigin}/pandits#breadcrumb`
            : "/pandits#breadcrumb",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteOrigin ? `${siteOrigin}/` : "/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Pandits",
              item: siteOrigin ? `${siteOrigin}/pandits` : "/pandits",
            },
          ],
        },
      ],
    },
  });

  return (
    <>
      <PageHero
        eyebrow="Acharyas · Verified"
        title="Pandits You Can Trust"
        sub="Parampara-trained and identity-verified. Personal contact shared only after confirmed booking — your privacy and theirs, protected."
        image="/images/pandit-portrait.jpeg"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Pandits" },
          ]}
        />

        <section
          aria-labelledby="pandit-directory-heading"
          className="mt-7"
        >
          <div className="max-w-4xl">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
              Vedic Pandit Directory
            </p>
            <h2
              id="pandit-directory-heading"
              className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#2a1a10] sm:text-3xl"
            >
              Find a Pandit by City, Language or Specialization
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">
              Explore the currently published DharmYatra pandit profiles for puja,
              havan, vivah and other traditional services. Use the filters to
              narrow the directory by language, specialization, city or Pandit
              name. Each profile provides the information currently available
              for that acharya before you send a booking enquiry.
            </p>
          </div>

          <div
            className="mt-6 rounded-3xl border border-orange-900/10 bg-white p-4 shadow-[0_10px_35px_rgba(72,36,8,.05)] sm:p-5"
            aria-label="Pandit directory filters"
          >
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-stone-500">
              <SlidersHorizontal size={14} className="text-orange-600" />
              Search & filters
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-orange-900/15 bg-[#fffaf5] px-3.5 py-2.5 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10">
                <Search
                  size={16}
                  className="shrink-0 text-orange-600"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search Pandit, city or puja…"
                  className="w-full bg-transparent text-sm outline-none"
                  aria-label="Search pandits by name, city or puja"
                  autoComplete="off"
                  spellCheck={false}
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    aria-label="Clear pandit search"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-stone-400 transition hover:bg-orange-100 hover:text-orange-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>

              <label className="sr-only" htmlFor="pandit-language">
                Filter pandits by language
              </label>
              <select
                id="pandit-language"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="min-h-11 rounded-xl border border-orange-900/15 bg-[#fffaf5] px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                aria-label="Filter pandits by language"
              >
                <option value="">All Languages</option>
                {langs.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="pandit-specialization">
                Filter pandits by specialization
              </label>
              <select
                id="pandit-specialization"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                className="min-h-11 rounded-xl border border-orange-900/15 bg-[#fffaf5] px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                aria-label="Filter pandits by specialization"
              >
                <option value="">All Specializations</option>
                {specs.map((specialization) => (
                  <option
                    key={specialization}
                    value={specialization}
                  >
                    {specialization}
                  </option>
                ))}
              </select>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-11 rounded-xl border border-orange-900/15 bg-white px-4 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-orange-50"
                >
                  Reset
                </button>
              ) : (
                <div className="hidden md:block" aria-hidden="true" />
              )}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="pandit-results-heading"
          className="mt-7"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
                Current listings
              </p>
              <h2
                id="pandit-results-heading"
                className="mt-1 font-display text-xl font-semibold text-[#2a1a10] sm:text-2xl"
              >
                Verified Acharya Profiles
              </h2>
            </div>
            <p
              className="text-sm text-stone-500"
              role="status"
              aria-live="polite"
            >
              Showing{" "}
              <strong className="text-stone-800">{list.length}</strong>{" "}
              {list.length === 1 ? "verified acharya" : "verified acharyas"}
            </p>
          </div>

          {list.length === 0 ? (
            <div className="mt-6">
              <Empty
                title="No pandits match your filters"
                sub="We onboard acharyas regularly. Tell us your city and language through the enquiry flow and the team can help identify a suitable connection."
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => (
                <PanditCard key={p.slug} p={p} i={i} />
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="verification-heading"
          className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-sm leading-relaxed text-emerald-950 md:p-8"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            Trust & verification
          </p>
          <h2
            id="verification-heading"
            className="mt-1 font-display text-xl font-semibold"
          >
            How we verify pandits
          </h2>
          <p className="mt-2">
            Every acharya shares government ID, parampara/guru reference and a
            recorded mantra-path sample reviewed by our Vedic board. We publish
            experience honestly and never fabricate reviews — trust is our real
            prasad.
          </p>
        </section>

        <section
          aria-labelledby="booking-help-heading"
          className="mt-8 rounded-3xl border border-orange-900/10 bg-[#fffaf5] p-6 md:p-8"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
            Booking guidance
          </p>
          <h2
            id="booking-help-heading"
            className="mt-1 font-display text-xl font-semibold text-[#2a1a10]"
          >
            Choose the right Pandit for your ritual
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
            Compare the published specialization, puja types, languages,
            experience and location shown on each profile. Open the individual
            Pandit page for the complete profile and use the booking enquiry to
            share your city, preferred date and ritual requirements.
          </p>
        </section>
      </main>
    </>
  );
}
