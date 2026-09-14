import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";
import { useSEO } from "../lib/seo";
import { Breadcrumbs, Reveal } from "../components/ui";
import { useApp } from "../context/AppContext";

function Shell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-cream-50 py-12 md:py-16">
      <div className="mandala-bg absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-md px-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
        <Reveal className="mt-6 overflow-hidden rounded-[1.75rem] border border-orange-900/10 bg-white shadow-2xl shadow-orange-900/10">
          <div className="bg-linear-to-br from-saffron-900 via-saffron-700 to-orange-600 px-8 pb-8 pt-8 text-center text-white">
            <p className="font-sanskrit text-4xl text-amber-200">ॐ</p>
            <h1 className="font-display mt-1 text-3xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-orange-100/90">{sub}</p>
          </div>
          <div className="p-7 md:p-8">{children}</div>
        </Reveal>
      </div>
    </div>
  );
}

export function Login() {
  useSEO({ title: "Login — DivyaDhara", description: "Login to DivyaDhara to manage bookings, saved temples and yatra enquiries.", path: "/login" });
  const { login } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const input = "w-full rounded-xl border border-orange-900/15 bg-orange-50/40 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200";
  return (
    <Shell title="Swagatam Back" sub="Login to your DivyaDhara account">
      <form onSubmit={(e) => { e.preventDefault(); login({ name: f.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Devotee", email: f.email, phone: "+91 ", city: "Varanasi" }); nav("/dashboard"); }} className="space-y-3">
        <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="li-e">Email</label><div className="relative"><Mail size={15} className="absolute left-3.5 top-3.5 text-orange-500" /><input id="li-e" required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" className={`${input} pl-10`} /></div></div>
        <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="li-p">Password</label><div className="relative"><Lock size={15} className="absolute left-3.5 top-3.5 text-orange-500" /><input id="li-p" required minLength={6} type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" className={`${input} pl-10`} /></div></div>
        <button className="btn-saffron flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white"><LogIn size={16} /> Login Securely</button>
      </form>
      <div className="mt-4 flex items-center justify-between text-[13px]"><Link to="/forgot-password" className="font-bold text-orange-700 hover:underline">Forgot password?</Link><Link to="/register" className="font-bold text-orange-700 hover:underline">New here? Register</Link></div>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-stone-400"><ShieldCheck size={13} /> Demo auth — data stays on your device</p>
    </Shell>
  );
}

export function Register() {
  useSEO({ title: "Register — Join DivyaDhara", description: "Create a DivyaDhara account: bookings, saved temples, yatra enquiries and festival reminders.", path: "/register" });
  const { login } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", city: "" });
  const input = "w-full rounded-xl border border-orange-900/15 bg-orange-50/40 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200";
  return (
    <Shell title="Join the Parivaar" sub="One account for temples, pujas & yatras">
      <form onSubmit={(e) => { e.preventDefault(); login({ name: f.name, email: f.email, phone: f.phone, city: f.city || "Bharat" }); nav("/dashboard"); }} className="space-y-3">
        <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="rg-n">Full name *</label><div className="relative"><User size={15} className="absolute left-3.5 top-3.5 text-orange-500" /><input id="rg-n" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g., Ananya Sharma" className={`${input} pl-10`} /></div></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="rg-e">Email *</label><input id="rg-e" required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@…" className={input} /></div>
          <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="rg-p">Mobile *</label><input id="rg-p" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 …" className={input} /></div>
        </div>
        <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="rg-c">City</label><div className="relative"><MapPin size={15} className="absolute left-3.5 top-3.5 text-orange-500" /><input id="rg-c" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Your city" className={`${input} pl-10`} /></div></div>
        <button className="btn-saffron flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white"><UserPlus size={16} /> Create Account</button>
      </form>
      <p className="mt-4 text-center text-[13px] text-stone-500">Already a member? <Link to="/login" className="font-bold text-orange-700 hover:underline">Login</Link></p>
    </Shell>
  );
}

export function Forgot() {
  useSEO({ title: "Forgot Password — DivyaDhara", description: "Reset your DivyaDhara password.", path: "/forgot-password" });
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <Shell title="Reset Password" sub="We'll email you a reset link">
      {done ? <p className="rounded-2xl bg-emerald-50 p-5 text-center text-sm font-semibold text-emerald-900 ring-1 ring-emerald-200">If an account exists for <strong>{email}</strong>, a reset link is on its way. 🙏</p> : (
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-3">
          <div><label className="mb-1 block text-xs font-bold text-stone-600" htmlFor="fp-e">Email</label><div className="relative"><Phone size={15} className="absolute left-3.5 top-3.5 text-orange-500" /><input id="fp-e" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-orange-900/15 bg-orange-50/40 px-4 py-3 pl-10 text-sm outline-none focus:border-orange-500" /></div></div>
          <button className="btn-saffron flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white">Send Reset Link <ArrowRight size={15} /></button>
          <p className="text-center text-[13px]"><Link to="/login" className="font-bold text-orange-700">← Back to login</Link></p>
        </form>
      )}
    </Shell>
  );
}
