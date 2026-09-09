import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, CalendarCheck, Heart, Bell, Settings, LogOut, MessageCircle, MapPin, Phone, Save } from "lucide-react";
import { TEMPLES, PLACES } from "../data/content";
import { useSEO } from "../lib/seo";
import { Reveal, Empty } from "../components/ui";
import { useApp } from "../context/AppContext";
import { cx } from "../lib/utils";

const TABS = [
  { id: "overview", l: "Overview", i: <LayoutDashboard size={16} /> },
  { id: "profile", l: "Profile", i: <User size={16} /> },
  { id: "bookings", l: "My Bookings", i: <CalendarCheck size={16} /> },
  { id: "saved", l: "Saved", i: <Heart size={16} /> },
  { id: "notifications", l: "Notifications", i: <Bell size={16} /> },
  { id: "settings", l: "Settings", i: <Settings size={16} /> },
];

export default function Dashboard() {
  useSEO({ title: "My Dashboard — Bookings, Saved Temples & Profile | DivyaDhara", description: "Manage your DivyaDhara account: bookings, puja & yatra enquiries, saved temples, notifications and profile.", path: "/dashboard" });
  const { user, logout, updateProfile, bookings, savedTemples, savedPlaces, toggleSave, notifications } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState("overview");
  const [f, setF] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", city: user?.city ?? "" });
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({ whatsapp: true, email: true, festival: true });
  if (!user) return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="font-sanskrit text-5xl text-orange-300">ॐ</p>
      <h1 className="font-display mt-3 text-3xl font-semibold">Please login first</h1>
      <p className="mt-2 text-stone-500">Your dashboard holds bookings, saved temples and yatra enquiries.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link to="/login" className="btn-saffron rounded-2xl px-6 py-3 text-sm font-bold text-white">Login</Link>
        <Link to="/register" className="rounded-2xl border border-orange-700/25 px-6 py-3 text-sm font-bold text-orange-900">Register</Link>
      </div>
    </div>
  );
  const savedT = TEMPLES.filter((t) => savedTemples.includes(t.slug));
  const savedP = PLACES.filter((p) => savedPlaces.includes(p.slug));
  const input = "w-full rounded-xl border border-orange-900/15 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200";
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      {/* head */}
      <Reveal className="flex flex-col items-start justify-between gap-4 rounded-[1.75rem] bg-gradient-to-br from-[#2a1a10] via-[#7c2d12] to-[#c2410c] p-6 text-white md:flex-row md:items-center md:p-8">
        <div className="flex items-center gap-4">
          <span className="font-display grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-bold text-amber-200 ring-1 ring-white/25">{user.name.charAt(0).toUpperCase()}</span>
          <div><p className="text-xs uppercase tracking-[0.25em] text-amber-300">Jai Shri Ram · Dashboard</p><h1 className="font-display text-2xl font-semibold md:text-3xl">Namaste, {user.name.split(" ")[0]} 🙏</h1><p className="text-sm text-orange-100/80">{user.email} · {user.city}</p></div>
        </div>
        <div className="flex gap-2">
          <a href={`https://wa.me/919876543210?text=${encodeURIComponent("Namaste! I need help with my DivyaDhara bookings.")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-[13px] font-bold"><MessageCircle size={15} /> Help</a>
          <button onClick={() => { logout(); nav("/"); }} className="flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-bold"><LogOut size={15} /> Logout</button>
        </div>
      </Reveal>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* tabs */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={tab === t.id} className={cx("flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition", tab === t.id ? "bg-[#2a1a10] text-amber-200 shadow" : "bg-white text-stone-600 ring-1 ring-orange-900/10 hover:bg-orange-50")}>{t.i} {t.l}
              {t.id === "bookings" && bookings.length > 0 && <span className="ml-auto rounded-full bg-orange-600 px-2 py-0.5 text-[11px] text-white">{bookings.length}</span>}
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          {tab === "overview" && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[{ l: "Total Enquiries", v: String(bookings.length), d: "Puja · Yatra · Events" }, { l: "Saved Temples", v: String(savedT.length), d: "Your sacred wishlist" }, { l: "Saved Places", v: String(savedP.length), d: "Yatra dreams" }].map((c) => (
                <div key={c.l} className="rounded-3xl border border-orange-900/10 bg-white p-6 text-center sacred-border"><p className="font-display text-4xl font-bold text-orange-800">{c.v}</p><p className="mt-1 text-sm font-bold text-stone-700">{c.l}</p><p className="text-xs text-stone-500">{c.d}</p></div>
              ))}
              <div className="rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200 sm:col-span-3">
                <h3 className="font-display text-lg font-semibold">Recent activity</h3>
                {bookings.length === 0 ? <p className="mt-2 text-sm text-stone-500">No enquiries yet — <Link to="/services" className="font-bold text-orange-700 underline">book your first puja</Link>.</p> :
                  <ul className="mt-3 space-y-2">{bookings.slice(0, 3).map((b) => <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 text-sm"><span><strong>{b.title}</strong> <span className="text-stone-400">· {b.id}</span></span><span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">{b.status}</span></li>)}</ul>}
              </div>
            </div>
          )}
          {tab === "profile" && (
            <form onSubmit={(e) => { e.preventDefault(); updateProfile({ name: f.name, email: f.email, phone: f.phone, city: f.city }); setSaved(true); setTimeout(() => setSaved(false), 2500); }} className="rounded-3xl border border-orange-900/10 bg-white p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold">Profile</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="d-n">Full name</label><input id="d-n" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} /></div>
                <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="d-e">Email</label><input id="d-e" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={input} /></div>
                <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="d-p">Mobile</label><input id="d-p" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input} /></div>
                <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="d-c">City</label><input id="d-c" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={input} /></div>
              </div>
              <button className="btn-saffron mt-4 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"><Save size={15} /> {saved ? "Saved ✓" : "Save Changes"}</button>
            </form>
          )}
          {tab === "bookings" && (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold">My Bookings & Enquiries</h2>
              {bookings.length === 0 ? <Empty title="No bookings yet" sub="Your puja, pandit, yatra, course and event enquiries will appear here." action={<Link to="/services" className="btn-saffron rounded-xl px-6 py-3 text-sm font-bold text-white">Explore Sevas</Link>} /> :
                bookings.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-900/10 bg-white p-4">
                    <div><p className="text-[11px] font-bold uppercase tracking-widest text-orange-700">{b.kind} · {b.id}</p><p className="font-bold text-stone-800">{b.title}</p><p className="text-[13px] text-stone-500">{b.date} · {b.detail}</p></div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">{b.status}</span>
                  </div>
                ))}
              <div className="grid gap-2 sm:grid-cols-2">
                <Link to="/services" className="rounded-2xl bg-orange-50 p-4 text-sm font-bold text-orange-900 ring-1 ring-orange-200">+ New Puja Enquiry</Link>
                <Link to="/packages" className="rounded-2xl bg-orange-50 p-4 text-sm font-bold text-orange-900 ring-1 ring-orange-200">+ New Yatra Enquiry</Link>
                <Link to="/pandits" className="rounded-2xl bg-orange-50 p-4 text-sm font-bold text-orange-900 ring-1 ring-orange-200">+ Pandit Request</Link>
                <Link to="/courses" className="rounded-2xl bg-orange-50 p-4 text-sm font-bold text-orange-900 ring-1 ring-orange-200">+ Course Registration</Link>
              </div>
            </div>
          )}
          {tab === "saved" && (
            <div>
              <h2 className="font-display text-xl font-semibold">Saved Temples & Places</h2>
              {savedT.length === 0 && savedP.length === 0 ? <div className="mt-4"><Empty title="Nothing saved yet" sub="Tap the heart on any temple or place to build your sacred wishlist." action={<Link to="/temples" className="btn-saffron rounded-xl px-6 py-3 text-sm font-bold text-white">Discover Temples</Link>} /></div> : (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">{savedT.map((t) => <div key={t.slug} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-orange-900/10"><img src={t.image} alt={t.name} className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><Link to={`/temples/${t.slug}`} className="block truncate text-sm font-bold hover:text-orange-700">{t.name}</Link><p className="flex items-center gap-1 text-xs text-stone-500"><MapPin size={11} /> {t.city}</p></div><button onClick={() => toggleSave("temple", t.slug)} className="text-xs font-bold text-red-600">Remove</button></div>)}</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">{savedP.map((p) => <div key={p.slug} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-orange-900/10"><img src={p.image} alt={p.name} className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><Link to={`/spiritual-places/${p.slug}`} className="block truncate text-sm font-bold hover:text-orange-700">{p.name}</Link><p className="text-xs text-stone-500">{p.state}</p></div><button onClick={() => toggleSave("place", p.slug)} className="text-xs font-bold text-red-600">Remove</button></div>)}</div>
                </>
              )}
            </div>
          )}
          {tab === "notifications" && (
            <div className="space-y-2.5">
              <h2 className="font-display text-xl font-semibold">Notifications</h2>
              {notifications.map((n) => <div key={n.id} className="flex items-start gap-3 rounded-2xl border border-orange-900/10 bg-white p-4"><Bell size={17} className="mt-0.5 shrink-0 text-orange-600" /><div><p className="text-sm text-stone-700">{n.text}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400"><Phone size={11} /> {n.date}</p></div></div>)}
            </div>
          )}
          {tab === "settings" && (
            <div className="rounded-3xl border border-orange-900/10 bg-white p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold">Notification Settings</h2>
              {[{ k: "whatsapp", l: "WhatsApp updates", d: "Booking confirmations & yatra alerts" }, { k: "email", l: "Email — Divya Patra", d: "Weekly Panchang & festival letter" }, { k: "festival", l: "Festival reminders", d: "Ekadashi, Purnima, Shivratri alerts" }].map((o) => (
                <label key={o.k} className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-orange-50/60 px-4 py-3.5 ring-1 ring-orange-100">
                  <span><span className="block text-sm font-bold text-stone-800">{o.l}</span><span className="block text-xs text-stone-500">{o.d}</span></span>
                  <input type="checkbox" checked={prefs[o.k as keyof typeof prefs]} onChange={() => setPrefs({ ...prefs, [o.k]: !prefs[o.k as keyof typeof prefs] })} className="h-5 w-5 accent-orange-700" />
                </label>
              ))}
              <p className="mt-4 text-xs text-stone-400">Preferences save automatically on this device.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
