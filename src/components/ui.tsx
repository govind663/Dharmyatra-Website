import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";
import { cx } from "../lib/utils";

export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  );
}

export function Eyebrow({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-700/20 bg-linear-to-r from-orange-50 to-amber-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-800">
      {icon}{children}
    </span>
  );
}

export function SectionHead({ eyebrow, title, sub, align = "center", sanskrit }: { eyebrow: string; title: ReactNode; sub?: string; align?: "center" | "left"; sanskrit?: string }) {
  return (
    <Reveal className={cx("mb-10 max-w-3xl md:mb-14", align === "center" ? "mx-auto text-center" : "text-left")}> 
      <Eyebrow><span className="font-sanskrit text-sm normal-case tracking-normal text-orange-700">॥</span> {eyebrow}</Eyebrow>
      <h2 className="font-display mt-4 text-3xl font-semibold leading-[1.12] text-[#2a1a10] md:text-[2.75rem]">{title}</h2>
      {sanskrit && <p className="font-sanskrit mt-2 text-lg text-orange-800/80">{sanskrit}</p>}
      {sub && <p className="mt-4 text-[15px] leading-relaxed text-stone-600 md:text-base">{sub}</p>}
      <div className={cx("mt-6 flex items-center gap-2", align === "center" && "justify-center")} aria-hidden>
        <span className="h-px w-14 bg-linear-to-r from-transparent to-orange-500" />
        <span className="text-orange-600">❖</span>
        <span className="h-px w-14 bg-linear-to-l from-transparent to-orange-500" />
      </div>
    </Reveal>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const schema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, ...(it.href ? { item: `https://divyadhara.in${it.href}` } : {}) })) };
  return (
    <nav aria-label="Breadcrumb" className="text-[13px]">
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <ol className="flex flex-wrap items-center gap-1.5 text-stone-500">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} className="text-orange-400" />}
            {it.href && i < items.length - 1 ? <Link to={it.href} className="hover:text-orange-700 hover:underline">{it.label}</Link> : <span className={i === items.length - 1 ? "font-semibold text-orange-900" : ""}>{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Stars({ value = "4.9" }: { value?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/90 px-2.5 py-1 text-xs font-bold text-amber-300">
      <Star size={12} fill="currentColor" /> {value}
    </span>
  );
}

export function Counter({ to, suffix = "", duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / (duration * 1000));
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);
  const value = reduce && inView ? to : n;
  return <span ref={ref}>{value.toLocaleString("en-IN")}{suffix}</span>;
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-orange-900/10 overflow-hidden rounded-2xl border border-orange-900/10 bg-white/80">
      {items.map((f, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[#3a2415] transition hover:bg-orange-50/60 md:px-6">
            <span className="text-[15px]">{f.q}</span>
            <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full border text-lg leading-none transition", open === i ? "border-orange-600 bg-orange-600 text-white" : "border-orange-300 text-orange-700")}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-stone-600 md:px-6">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export function Empty({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-orange-300 bg-orange-50/50 px-6 py-14 text-center">
      <div className="font-sanskrit mx-auto mb-3 text-4xl text-orange-400">ॐ</div>
      <h3 className="font-display text-xl font-semibold text-[#3a2415]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{sub}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
