import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail, MessageCircle, Flame, Send } from "lucide-react";
import { useState } from "react";
import { waLink, DISPLAY_PHONE, CONTACT_EMAIL } from "../lib/utils";

const COLS: { h: string; links: { l: string; h: string }[] }[] = [
  { h: "Discover", links: [{ l: "Temples of India", h: "/temples" }, { l: "Spiritual Places", h: "/spiritual-places" }, { l: "Yatra Packages", h: "/packages" }, { l: "Ashrams", h: "/ashrams" }, { l: "Gallery & Videos", h: "/gallery" }] },
  { h: "Sevas", links: [{ l: "Puja Services", h: "/services" }, { l: "Book a Pandit", h: "/pandits" }, { l: "Cultural Courses", h: "/courses" }, { l: "Events & Kathas", h: "/events" }, { l: "Today's Panchang", h: "/panchang" }] },
  { h: "Platform", links: [{ l: "About Us", h: "/about" }, { l: "Contact", h: "/contact" }, { l: "Login / Register", h: "/login" }, { l: "My Dashboard", h: "/dashboard" }, { l: "Festival Calendar", h: "/calendar" }] },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  return (
    <footer className="relative overflow-hidden bg-[#1c1410] text-stone-300">
      <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500" />
      <div className="mandala-bg absolute inset-0 opacity-[0.07]" aria-hidden />
      {/* newsletter */}
      <div className="relative mx-auto max-w-7xl px-4 pt-12 md:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#2a1a10] to-[#3d2c1c] p-6 md:flex-row md:items-center md:p-8">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400"><Flame size={13} /> Divya Patra — Weekly Wisdom</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-amber-50 md:text-3xl">Panchang, festivals & katha in your inbox.</h3>
            <p className="mt-1 text-sm text-stone-400">One thoughtful email every Monday. No spam, ever. Unsubscribe anytime.</p>
          </div>
          {ok ? (
            <p className="rounded-2xl bg-emerald-900/60 px-6 py-4 text-sm font-semibold text-emerald-200">🙏 Dhanyavaad! You are subscribed. Shubh din.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setOk(true); }} className="flex w-full max-w-md gap-2">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-500" />
              <button className="btn-gold flex shrink-0 items-center gap-1.5 rounded-2xl px-5 py-3 text-sm font-bold text-white"><Send size={15} /> Join</button>
            </form>
          )}
        </div>
      </div>
      {/* columns */}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-[#7c2d12]"><span className="font-sanskrit text-2xl text-amber-100">ॐ</span></span>
            <span><span className="font-display block text-xl font-bold text-amber-50">DivyaDhara</span><span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">Sacred Bharat Yatra</span></span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">India's premium digital spiritual ecosystem — discover temples, connect with verified pandits, perform puja, learn Sanskrit & yoga, follow the Panchang, and plan sacred yatras across Bharat.</p>
          <p className="font-sanskrit mt-3 text-amber-300/90">॥ तमसो मा ज्योतिर्गमय ॥</p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2"><MapPin size={14} className="text-orange-500" /> Assi Ghat Road, Varanasi, UP 221005</p>
            <p className="flex items-center gap-2"><Phone size={14} className="text-orange-500" /> {DISPLAY_PHONE}</p>
            <p className="flex items-center gap-2"><Mail size={14} className="text-orange-500" /> {CONTACT_EMAIL}</p>
          </div>
          <div className="mt-5 flex gap-2">
            {[Instagram, Facebook, Youtube, Twitter].map((I, i) => (
              <a key={i} href="#social" aria-label="Social link" onClick={(e) => e.preventDefault()} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:border-orange-500 hover:bg-orange-600 hover:text-white"><I size={16} /></a>
            ))}
          </div>
        </div>
        {COLS.map((c) => (
          <nav key={c.h} aria-label={c.h}>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">{c.h}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => <li key={l.l}><Link to={l.h} className="text-sm text-stone-400 transition hover:text-amber-300">{l.l}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-stone-500 md:flex-row md:px-6 lg:px-8">
          <p>© 2026 DivyaDhara · Crafted with devotion in Varanasi, Bharat. Panchang values are guidance-grade.</p>
          <p className="flex gap-4"><Link to="/about" className="hover:text-amber-300">Trust & Mission</Link><Link to="/contact" className="hover:text-amber-300">Grievance</Link><a href="/sitemap.xml" className="hover:text-amber-300">Sitemap</a></p>
        </div>
      </div>
      <a href={waLink("Namaste DivyaDhara!")} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-6px_rgba(37,211,102,0.7)] transition hover:scale-110 active:scale-95">
        <MessageCircle size={26} fill="currentColor" strokeWidth={0} />
        <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
      </a>
    </footer>
  );
}
