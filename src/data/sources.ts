import type { TempleSource } from "./types";

/**
 * Authoritative source registry for temple content.
 * Keep factual source links here so they can be updated without touching
 * the main temple content blocks.
 */
export const TEMPLE_SOURCES: Record<string, TempleSource[]> = {
  "kashi-vishwanath-varanasi": [
    {
      title: "Daily Schedule & Aarti",
      organization: "Shri Kashi Vishwanath Official Web Portal",
      url: "https://shrikashivishwanath.org/general/daily_schedule",
      type: "Official Temple",
      purpose: "Current aarti, darshan and seva schedule.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
    {
      title: "Temple Rituals",
      organization: "Shri Kashi Vishwanath Official Web Portal",
      url: "https://www.shrikashivishwanath.org/general/rituals",
      type: "Official Temple",
      purpose: "Temple opening, darshan and ritual information.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
  ],
  "meenakshi-madurai": [
    {
      title: "Official Temple Portal",
      organization: "HR & CE Department, Government of Tamil Nadu",
      url: "https://maduraimeenakshi.hrce.tn.gov.in/",
      type: "Government",
      purpose: "Official temple identity, timings and administration information.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
    {
      title: "Pooja Information",
      organization: "HR & CE Department, Government of Tamil Nadu",
      url: "https://maduraimeenakshi.hrce.tn.gov.in/hrcehome/index_temple.php?action=pooja_info&tid=31962",
      type: "Government",
      purpose: "Current pooja timings and temple service information.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
  ],
  "kedarnath-dham": [
    {
      title: "Shri Kedarnath Dham",
      organization: "Shri Badarinath Kedarnath Temple Committee",
      url: "https://badrinath-kedarnath.gov.in/AboutUs/shri-kedarnath.aspx",
      type: "Official Temple",
      purpose: "Temple history, seasonal opening and pilgrimage information.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
    {
      title: "Official Puja Booking",
      organization: "Shri Badarinath Kedarnath Temple Committee",
      url: "https://badrinath-kedarnath.gov.in/online-services/book-puja-online/Book_Pooja_Online.aspx",
      type: "Official Temple",
      purpose: "Current puja timings and booking information.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
  ],
  "mahakaleshwar-ujjain": [
    {
      title: "Shri Mahakaleshwar Temple",
      organization: "District Ujjain, Government of Madhya Pradesh",
      url: "https://ujjain.nic.in/en/tourist-place/shri-mahakaleshwar-temple/",
      type: "Government",
      purpose: "Temple significance, religious heritage and official district information.",
      lastVerified: "2026-09-14",
    },
    {
      title: "Places of Interest – Ujjain",
      organization: "District Ujjain, Government of Madhya Pradesh",
      url: "https://ujjain.nic.in/en/places-of-interest/",
      type: "Government",
      purpose: "Additional official context for Ujjain's pilgrimage heritage.",
      lastVerified: "2026-09-14",
    },
  ],
  "jagannath-puri": [
    {
      title: "Shree Jagannath Temple",
      organization: "District Administration Puri, Government of Odisha",
      url: "https://puri.odisha.gov.in/en/tourism/tourist-places/shree-jagannath-temple",
      type: "Government",
      purpose: "Temple history, Char Dham status, festivals and connectivity.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
  ],
  "somnath-gujarat": [
    {
      title: "Somnath Darshan",
      organization: "Shree Somnath Trust",
      url: "https://somnath.org/somnath-darshan/",
      type: "Official Temple",
      purpose: "Temple history, Jyotirlinga tradition and cultural narrative.",
      lastVerified: "2026-09-14",
    },
    {
      title: "Jay Somnath – Official Trust Portal",
      organization: "Shree Somnath Trust",
      url: "https://somnath.org/",
      type: "Official Temple",
      purpose: "Official temple, darshan, booking and visitor information.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
  ],
  "tirupati-balaji": [
    {
      title: "Temple History",
      organization: "Tirumala Tirupati Devasthanams",
      url: "https://tirumala.org/TTDTempleHistory.aspx",
      type: "Official Temple",
      purpose: "Temple history and sacred tradition.",
      lastVerified: "2026-09-14",
    },
    {
      title: "Daily Sevas",
      organization: "Tirumala Tirupati Devasthanams",
      url: "https://www.tirumala.org/DailySevas.aspx",
      type: "Official Temple",
      purpose: "Daily seva and darshan schedule.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
    {
      title: "Current Temple Schedule & Updates",
      organization: "Tirumala Tirupati Devasthanams",
      url: "https://www.tirumala.org/Temple.aspx/Documents/Current_Booking.aspx",
      type: "Official Temple",
      purpose: "Current day schedules, ticket status and pilgrim updates.",
      lastVerified: "2026-09-14",
      dynamic: true,
    },
  ],
  "rameshwaram-jyotirlinga": [
    {
      title: "Ramanathaswamy Temple",
      organization: "Ramanathapuram District Administration, Government of Tamil Nadu",
      url: "https://ramanathapuram.nic.in/tourist-place/ramanathaswamy-temple/",
      type: "Government",
      purpose: "Temple history, Jyotirlinga significance, theerthams and connectivity.",
      lastVerified: "2026-09-14",
    },
    {
      title: "Tourist Places – Ramanathapuram",
      organization: "Ramanathapuram District Administration, Government of Tamil Nadu",
      url: "https://ramanathapuram.nic.in/tourism/tourist-places/",
      type: "Government",
      purpose: "Official regional pilgrimage and nearby attraction information.",
      lastVerified: "2026-09-14",
    },
  ],
};

export const CONTENT_SOURCE_NOTE =
  "Historical and spiritual narratives are editorially presented from authoritative sources. Ritual timings, access rules, ticketing and seasonal schedules can change; verify live details from the linked official source before travel.";
