import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type User = { name: string; email: string; phone: string; city: string } | null;
type Booking = { id: string; kind: string; title: string; date: string; status: string; detail: string };

type AppState = {
  user: User;
  login: (u: NonNullable<User>) => void;
  logout: () => void;
  updateProfile: (u: NonNullable<User>) => void;
  savedTemples: string[];
  savedPlaces: string[];
  toggleSave: (kind: "temple" | "place", slug: string) => void;
  bookings: Booking[];
  addBooking: (b: Omit<Booking, "id" | "status">) => void;
  notifications: { id: string; text: string; date: string }[];
};

const Ctx = createContext<AppState | null>(null);
function load<T>(k: string, fb: T): T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : fb; } catch { return fb; }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => load("dd_user", null));
  const [savedTemples, setSavedTemples] = useState<string[]>(() => load("dd_saved_t", []));
  const [savedPlaces, setSavedPlaces] = useState<string[]>(() => load("dd_saved_p", []));
  const [bookings, setBookings] = useState<Booking[]>(() => load("dd_bookings", [
    { id: "DD-2481", kind: "Puja Enquiry", title: "Satyanarayan Katha — Home", date: "2026-09-02", status: "Confirmed", detail: "Pandit assigned · Varanasi" },
    { id: "DD-2510", kind: "Yatra Enquiry", title: "Kashi · Ayodhya · Prayagraj 5D", date: "2026-09-05", status: "In progress", detail: "2 travellers · Oct batch" },
  ]));
  const [notifications] = useState(() => load("dd_notif", [
    { id: "n1", text: "Your Satyanarayan Katha pandit has been assigned.", date: "2026-09-06" },
    { id: "n2", text: "Dev Deepawali boats in Varanasi are filling — reserve early.", date: "2026-09-04" },
    { id: "n3", text: "New batch: Sanskrit Foundation begins first Saturday.", date: "2026-09-01" },
  ]));

  useEffect(() => { localStorage.setItem("dd_user", JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem("dd_saved_t", JSON.stringify(savedTemples)); }, [savedTemples]);
  useEffect(() => { localStorage.setItem("dd_saved_p", JSON.stringify(savedPlaces)); }, [savedPlaces]);
  useEffect(() => { localStorage.setItem("dd_bookings", JSON.stringify(bookings)); }, [bookings]);

  const login = (u: NonNullable<User>) => setUser(u);
  const logout = () => setUser(null);
  const updateProfile = (u: NonNullable<User>) => setUser(u);
  const toggleSave = (kind: "temple" | "place", slug: string) => {
    if (kind === "temple") setSavedTemples((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));
    else setSavedPlaces((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));
  };
  const addBooking = (b: Omit<Booking, "id" | "status">) =>
    setBookings((s) => [{ ...b, id: `DD-${Math.floor(2400 + Math.random() * 600)}`, status: "Received" }, ...s]);

  return <Ctx.Provider value={{ user, login, logout, updateProfile, savedTemples, savedPlaces, toggleSave, bookings, addBooking, notifications }}>{children}</Ctx.Provider>;
}
export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
