import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, CheckCircle2, Send } from "lucide-react";
import { waLink } from "../lib/utils";
import { useApp } from "../context/AppContext";
import { Reveal } from "./ui";

export function EnquiryForm({ context, title = "Send Enquiry", compact = false }: { context: string; title?: string; compact?: boolean }) {
  const { addBooking } = useApp();
  const [f, setF] = useState({ name: "", mobile: "", email: "", date: "", travellers: "2", message: "" });
  const [done, setDone] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const waMsg = `Namaste DivyaDhara!%0A${encodeURIComponent(context)}%0AName: ${encodeURIComponent(f.name)}%0AMobile: ${encodeURIComponent(f.mobile)}%0ADate: ${encodeURIComponent(f.date)}%0ATravellers: ${encodeURIComponent(f.travellers)}%0A${encodeURIComponent(f.message)}`;
  if (done) return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center md:p-8">
      <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
      <h3 className="font-display mt-3 text-2xl font-semibold text-emerald-950">Dhanyavaad{f.name ? `, ${f.name.split(" ")[0]}` : ""}! 🙏</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-emerald-900/80">Your enquiry has been received. Our seva team will call/WhatsApp you shortly. A reference has been added to your dashboard.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link to="/dashboard" className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white">View in Dashboard</Link>
        <button onClick={() => setDone(false)} className="rounded-xl border border-emerald-300 px-5 py-2.5 text-sm font-bold text-emerald-800">New enquiry</button>
      </div>
    </div>
  );
  const input = "w-full rounded-xl border border-orange-900/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200";
  return (
    <form onSubmit={(e) => { e.preventDefault(); addBooking({ kind: "Enquiry", title: context.slice(0, 60), date: new Date().toISOString().slice(0, 10), detail: `${f.name} · ${f.mobile}` }); setDone(true); }} className="rounded-3xl border border-orange-900/10 bg-white p-6 shadow-xl shadow-orange-900/5 md:p-8">
      <h3 className="font-display text-xl font-semibold text-[#2a1a10]">{title}</h3>
      <p className="mt-1 text-[13px] text-stone-500">Free guidance · Response within a few hours · Hindi, English + 6 languages</p>
      <div className={`mt-5 grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor={`n-${context.length}`}>Full name *</label><input id={`n-${context.length}`} required value={f.name} onChange={set("name")} placeholder="e.g., Ananya Sharma" className={input} /></div>
        <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor={`m-${context.length}`}>Mobile (WhatsApp) *</label><input id={`m-${context.length}`} required pattern="[0-9+ ]{10,15}" value={f.mobile} onChange={set("mobile")} placeholder="+91 …" className={input} /></div>
        <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor={`e-${context.length}`}>Email</label><input id={`e-${context.length}`} type="email" value={f.email} onChange={set("email")} placeholder="you@example.com" className={input} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-xs font-bold text-stone-600">Date</label><input type="date" value={f.date} onChange={set("date")} className={input} /></div>
          <div><label className="mb-1 block text-xs font-bold text-stone-600">Travellers</label><select value={f.travellers} onChange={set("travellers")} className={input}>{["1", "2", "3-5", "6-12", "12+ (group)"].map((o) => <option key={o}>{o}</option>)}</select></div>
        </div>
      </div>
      <div className="mt-3"><label className="mb-1 block text-xs font-bold text-stone-600">Message / preferences</label><textarea rows={3} value={f.message} onChange={set("message")} placeholder="Tell us your needs — language, city, budget, special requirements…" className={input} /></div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-saffron flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white"><Send size={15} /> Submit Enquiry</button>
        <a href={`https://wa.me/919876543210?text=${waMsg}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-105"><MessageCircle size={16} /> WhatsApp Instead</a>
      </div>
      <p className="mt-3 text-center text-[11px] text-stone-400">By submitting, you agree to be contacted about this enquiry. No spam, ever.</p>
    </form>
  );
}

export function WhatsAppBand({ title, sub, message }: { title: string; sub: string; message: string }) {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-[#075E54] via-[#0b7a5f] to-[#128C7E] p-8 text-white md:p-12">
        <div className="mandala-bg absolute inset-0 opacity-15" aria-hidden />
        <span className="font-sanskrit pointer-events-none absolute -right-4 -top-8 select-none text-[11rem] leading-none text-white/10" aria-hidden>ॐ</span>
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-200">Instant seva on WhatsApp</p>
            <h3 className="font-display mt-2 text-2xl font-semibold md:text-4xl">{title}</h3>
            <p className="mt-2 text-[15px] text-emerald-50/90">{sub}</p>
          </div>
          <a href={waLink(message)} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-7 py-4 font-bold text-[#075E54] shadow-xl transition hover:scale-105 active:scale-95">
            <MessageCircle size={20} /> Chat Now
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export function PageHero({ eyebrow, title, sub, image, children }: { eyebrow: string; title: string; sub: string; image: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-char-900 text-white">
      <div className="absolute inset-0">
        <img src={image} alt="" aria-hidden className="kenburns h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-linear-to-t from-char-900 via-transparent to-transparent" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 md:px-6 md:pb-20 md:pt-24 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 backdrop-blur">{eyebrow}</p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-200 md:text-lg">{sub}</p>
        {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
