/**
 * DivyaDhara Temple Content
 *
 * Master temple catalogue:
 * - 12 Jyotirlingas
 * - 51 Shakti Peethas (traditional 51-Peetha compilation)
 *
 * Important:
 * 1. Shakti Peetha traditions vary by text and sampradaya. Where identifications differ,
 *    the data is explicitly marked as "traditional / debated".
 * 2. Darshan, aarti, booking, seasonal opening and festival dates are dynamic.
 * 3. Devotional legends are presented as sacred tradition, not as archaeological certainty.
 */

export type TempleSource = {
  title: string;
  organization: string;
  url: string;
  type: "Official Temple" | "Government" | "Tourism" | "Ministry" | "Reference";
  purpose: string;
  lastVerified: string;
};

export type Temple = {
  slug: string;
  name: string;
  sanskrit: string;
  city: string;
  state: string;
  district: string;
  country?: string;

  category: string[];
  deity: string;
  tradition: string;
  image: string;
  rating: string;

  established: string;
  trust: string;
  summary: string;
  history: string[];
  significance: string[];

  // Spiritual + tourist experience layer
  divineAttractions?: string[];
  scripturalConnections?: {
    title: string;
    context: string;
  }[];
  pilgrimExperience?: string[];
  bhagavataConnection?: string[];

  // Shakti Peetha metadata
  peethaNumber?: number;
  peethaBodyPart?: string;
  shaktiForm?: string;
  bhairava?: string;
  identificationNote?: string;

  darshanTimings: { label: string; time: string }[];
  aarti: { name: string; time: string; desc: string }[];

  festivals: {
    name: string;
    month: string;
    desc: string;
  }[];

  facilities: string[];

  howToReach: {
    mode: string;
    detail: string;
  }[];

  committee: {
    name: string;
    role: string;
  }[];

  faqs: {
    q: string;
    a: string;
  }[];

  nearby: string[];
  mapEmbedNote: string;

  liveAarti?: {
    title: string;
    time: string;
  };

  sources?: TempleSource[];
  contentNote?: string;
};


export const TEMPLE_DATA: Temple[] = [
{
    slug: "kashi-vishwanath-varanasi", name: "Shri Kashi Vishwanath Temple", sanskrit: "काशी विश्वनाथ मन्दिर",
    city: "Varanasi", state: "Uttar Pradesh", district: "Varanasi", category: ["Jyotirlinga", "Shakti Peetha Circuit", "Ancient"],
    deity: "Lord Shiva (Vishwanath)", tradition: "Shaiva · Kashi Shaiva Parampara", image: "/images/kashi-vishwanath-varanasi.jpg",
    rating: "4.9", established: "c. 1780 CE (present structure by Ahilyabai Holkar)", trust: "Shri Kashi Vishwanath Temple Trust",
    summary: "One of the twelve Jyotirlingas, the Vishwanath Temple stands on the western ghats of the Ganga in the eternal city of Kashi — the spiritual capital of India.",
    history: [
      "Kashi is described in the Skanda Purana as the city never forsaken by Shiva. The original Vishwanath shrine was demolished and rebuilt several times across centuries, each time rising again through collective devotion.",
      "The present temple was rebuilt in 1780 by Maharani Ahilyabai Holkar of Indore, with later gold plating of the shikhara sponsored by Maharaja Ranjit Singh in 1835.",
      "The Shri Kashi Vishwanath Dham corridor, inaugurated in 2021, now connects the temple directly to the Ganga — restoring the ancient tirtha-ksetra axis."
    ],
    significance: ["Jyotirlinga — self-manifested pillar of light", "Mukti-kshetra: darshan is believed to grant liberation", "Central to the Panchakroshi Yatra of Kashi", "Mentioned in Skanda, Shiva and Padma Puranas"],
    divineAttractions: ["Kashi Vishwanath Jyotirlinga darshan", "Ganga sunrise boat ride and ghat worship", "Dashashwamedh Ganga Aarti", "Kashi Vishwanath Dham corridor", "Annapurna and Kaal Bhairav sacred circuit"],
    scripturalConnections: [{"title": "Skanda Purana", "context": "Kashi is celebrated in the Kashi Khanda tradition as an Avimukta kshetra associated with Shiva and liberation."}, {"title": "Jyotirlinga tradition", "context": "Kashi Vishwanath is traditionally revered as one of Shiva's twelve Jyotirlingas."}],
    pilgrimExperience: ["Mangala Aarti / early darshan", "Ganga snan or respectful river darshan", "Panchakroshi / local temple circuit", "Evening Ganga Aarti"],
    bhagavataConnection: ["Kashi's wider sacred geography brings Shaiva, Vaishnava and Shakta shrines into one pilgrimage landscape."],
    sources: [{"title": "Official Temple Information", "organization": "Shri Kashi Vishwanath Temple", "url": "https://www.shrikashivishwanath.org/", "type": "Official Temple", "purpose": "Temple history, darshan, aarti, rituals and pilgrim services.", "lastVerified": "2026-09-14"}],
    darshanTimings: [
      { label: "Mangala Aarti Darshan", time: "3:00 AM – 4:00 AM" },
      { label: "General Darshan (Morning)", time: "4:00 AM – 11:30 AM" },
      { label: "Bhog Aarti (closed briefly)", time: "12:00 PM – 1:00 PM" },
      { label: "General Darshan (Afternoon)", time: "1:00 PM – 6:30 PM" },
      { label: "Shringar Bhog Darshan", time: "7:00 PM – 8:30 PM" },
      { label: "Shayan Aarti", time: "9:00 PM – 10:30 PM" }
    ],
    aarti: [
      { name: "Mangala Aarti", time: "3:00 AM", desc: "Pre-dawn awakening of the Lord with Vedic chanting. Ticketed, limited entry." },
      { name: "Saptarishi Aarti", time: "7:00 PM", desc: "Seven archakas perform aarti in the Vedic Saptarishi tradition — the most celebrated daily aarti." },
      { name: "Shringar Bhog Aarti", time: "8:00 PM", desc: "Evening adornment and bhog offering with bhajans." }
    ],
    festivals: [
      { name: "Mahashivratri", month: "Feb / Mar", desc: "The grandest celebration — lakhs of devotees; the sanctum remains open through the night." },
      { name: "Dev Deepawali", month: "Nov", desc: "The ghats blaze with a million diyas celebrating Shiva's victory over Tripurasura." },
      { name: "Shravan Maas", month: "Jul / Aug", desc: "Monday crowds offer Ganga-jal; Kanwariya pilgrims arrive on foot." }
    ],
    facilities: ["Wheelchair assistance & senior-citizen lane", "Free locker & shoe stands", "Prasad & annakshetra counters", "Ganga-view corridor & waiting halls", "Medical aid post", "CCTV-monitored premises", "Multilingual helpdesk (Hindi, English, Tamil, Telugu)", "Online Sugam Darshan booking counter"],
    howToReach: [
      { mode: "Air", detail: "Lal Bahadur Shastri Airport (25 km). Prepaid taxis to Godowlia / Corridor gate." },
      { mode: "Rail", detail: "Varanasi Junction (4 km) & Banaras station (7 km)." },
      { mode: "Road", detail: "Well connected via NH-19. E-rickshaws ply to the corridor gates; the sanctum zone is pedestrian-only." }
    ],
    committee: [{ name: "Chief Executive Officer", role: "Temple Trust Administration" }, { name: "Head Archaka", role: "Garbhagriha Rituals" }, { name: "Dharmarth Karya In-charge", role: "Festivals & Annakshetra" }],
    faqs: [
      { q: "Is mobile phone allowed inside?", a: "Mobile phones, cameras and leather items must be deposited at the free lockers before the security check." },
      { q: "How do I book Sugam Darshan?", a: "Sugam Darshan tickets can be booked at the trust counter or through our WhatsApp assistance desk; carry a valid photo ID." },
      { q: "Is there a dress code?", a: "Modest traditional attire is requested. Dhotis are available for men wishing to perform special sevas." },
      { q: "Best time to visit?", a: "October to March offers pleasant weather. Arrive before 5 AM on Mondays and festival days to avoid long queues." }
    ],
    nearby: ["Annapurna Temple (200 m)", "Kaal Bhairav Temple (2 km)", "Dashashwamedh Ghat (600 m)", "Sankat Mochan Hanuman Temple (6 km)"],
    mapEmbedNote: "Vishwanath Gali, Varanasi, Uttar Pradesh 221001",
    liveAarti: { title: "Live: Saptarishi Aarti — Kashi Vishwanath", time: "Daily · 7:00 PM IST" }
  },
  {
    slug: "meenakshi-madurai", name: "Meenakshi Amman Temple", sanskrit: "மீனாட்சி அம்மன் கோவில்",
    city: "Madurai", state: "Tamil Nadu", district: "Madurai", category: ["Shakti Peetha", "Ancient", "Heritage"],
    deity: "Goddess Meenakshi & Lord Sundareswarar", tradition: "Shaiva-Shakta · Agama (Kamila)", image: "/images/meenakshi-madurai.jpg",
    rating: "4.9", established: "6th century BCE origins; present structure 12th–17th century", trust: "Arulmigu Meenakshi Sundareswarar Thirukkoil",
    summary: "A sprawling 14-acre temple city with fourteen gopurams — the beating heart of Tamil devotional culture and the abode of the fish-eyed Goddess.",
    history: ["Tradition traces the shrine to the Pandya queen Meenakshi herself. The present complex was expanded by successive Pandyas, Vijayanagara rulers and the Nayaks of Madurai.", "The southern gopuram rises 170 feet — among the tallest temple towers in the world — covered with thousands of painted stucco figures narrating Puranic lore."],
    significance: ["Among the foremost Shakti shrines of the South", "Thiruvilaiyadal Puranam's 64 divine plays centred here", "AAyiram Kaal Mandapam — hall of a thousand pillars"],
    divineAttractions: ["Meenakshi Amman darshan", "Sundareswarar shrine", "Four monumental gopurams", "Thousand-Pillar Hall and temple sculpture", "Evening Palliyarai ritual atmosphere"],
    scripturalConnections: [{"title": "Thiruvilaiyadal tradition", "context": "Madurai's sacred stories centre on Shiva's divine plays and the royal-divine story of Meenakshi."}, {"title": "Tamil devotional literature", "context": "The temple belongs to the long Shaiva devotional culture of Tamil Nadu."}],
    pilgrimExperience: ["Morning temple opening", "Meenakshi–Sundareswarar darshan", "Temple architecture walk", "Evening ritual and festival experience"],
    bhagavataConnection: ["Madurai's devotional culture is primarily Shaiva-Shakta, while the wider Tamil sacred landscape includes major Vaishnava and Krishna traditions."],
    sources: [{"title": "Official Temple Portal", "organization": "Hindu Religious and Charitable Endowments Department, Government of Tamil Nadu", "url": "https://maduraimeenakshi.hrce.tn.gov.in/", "type": "Government", "purpose": "Official temple identity, timings, administration and pilgrim information.", "lastVerified": "2026-09-14"}],
    darshanTimings: [{ label: "Morning Darshan", time: "5:00 AM – 12:30 PM" }, { label: "Evening Darshan", time: "4:00 PM – 10:00 PM" }, { label: "Palliyarai Pooja", time: "9:30 PM" }],
    aarti: [{ name: "Ushakkala Pooja", time: "5:30 AM", desc: "Dawn worship opening the sanctums." }, { name: "Uchikala Pooja", time: "12:00 PM", desc: "Midday alankaram and deeparadhana." }, { name: "Arthajama Pooja & Palliyarai", time: "9:30 PM", desc: "Night procession of Sundareswarar to Meenakshi's chamber." }],
    festivals: [{ name: "Meenakshi Thirukalyanam", month: "Apr / May", desc: "The celestial wedding draws over a million devotees during Chithirai festival." }, { name: "Navaratri", month: "Sep / Oct", desc: "Nine nights of alankarams; the golden chariot procession on Vijayadashami." }],
    facilities: ["Free footwear stands at all four entrances", "Temple museum & 1000-pillar hall", "Prasadam counters (Puttu, Appam)", "Multilingual guides", "Wheelchair lanes", "Overseas pilgrim helpdesk"],
    howToReach: [{ mode: "Air", detail: "Madurai Airport (12 km)." }, { mode: "Rail", detail: "Madurai Junction (1.5 km)." }, { mode: "Road", detail: "Central bus stand 2 km; temple zone partly pedestrianised." }],
    committee: [{ name: "Joint Commissioner", role: "HR & CE Department" }, { name: "Head Sivachariar", role: "Agamic Rituals" }],
    faqs: [{ q: "Are non-Hindus allowed?", a: "All are welcome in the outer corridors and mandapams; sanctum entry follows Agama custom." }, { q: "How long does darshan take?", a: "Free darshan 45–90 min at peak; special entry darshan is typically under 30 min." }],
    nearby: ["Thiruparankundram Murugan Temple (8 km)", "Azhagar Kovil (21 km)", "Gandhi Memorial Museum (3 km)"],
    mapEmbedNote: "Madurai Main, Tamil Nadu 625001",
    liveAarti: { title: "Live: Arthajama Pooja — Madurai", time: "Daily · 9:30 PM IST" }
  },
  {
    slug: "kedarnath-dham", name: "Shri Kedarnath Dham", sanskrit: "केदारनाथ धाम",
    city: "Kedarnath", state: "Uttarakhand", district: "Rudraprayag", category: ["Jyotirlinga", "Char Dham", "Himalayan"],
    deity: "Lord Shiva (Kedareshwar)", tradition: "Shaiva · Rawal (Veerashaiva) & Shankaracharya Parampara", image: "/images/kedarnath-dham.jpg",
    rating: "4.9", established: "Legendary antiquity; revived by Adi Shankaracharya (8th c.)", trust: "Shri Badrinath–Kedarnath Temple Committee",
    summary: "At 3,583 metres amid snow peaks at the head of the Mandakini, Kedarnath is the loftiest Jyotirlinga — the crown of the Char Dham.",
    history: ["The Pandavas are said to have sought Shiva here for atonement; the deity dove into the earth, leaving the hump at Kedarnath.", "Adi Shankaracharya restored the shrine in the 8th century and attained samadhi just behind it.", "The temple survived the devastating 2013 floods — a boulder (Bhim Shila) shielded the sanctum, an event devotees call divine protection."],
    significance: ["Highest of the twelve Jyotirlingas", "One of the Char Dham; first among Panch Kedar", "Shankaracharya's mahasamadhi sthal"],
    divineAttractions: ["Kedarnath Jyotirlinga darshan", "Himalayan sunrise over Kedarnath valley", "Bhairavnath temple and mountain views", "Mandakini river landscape", "Shankaracharya samadhi site"],
    scripturalConnections: [{"title": "Skanda / Kedara tradition", "context": "Kedara is celebrated as a major Shaiva kshetra in Himalayan pilgrimage literature."}, {"title": "Mahabharata tradition", "context": "The Pandavas' search for Shiva is central to the popular sacred story of Kedarnath."}],
    pilgrimExperience: ["Seasonal Himalayan yatra", "Dawn darshan", "Mandakini valley walk", "Kedarnath–Bhairavnath sacred circuit"],
    bhagavataConnection: ["The Himalayan pilgrimage route connects with broader Hindu bhakti and sacred geography, including Badrinath and Vaishnava traditions."],
    sources: [{"title": "Official Kedarnath Information", "organization": "Shri Badarinath Kedarnath Temple Committee", "url": "https://badrinath-kedarnath.gov.in/AboutUs/shri-kedarnath.aspx", "type": "Official Temple", "purpose": "Official temple history, pilgrimage identity and access information.", "lastVerified": "2026-09-14"}],
    darshanTimings: [{ label: "Morning Darshan", time: "4:00 AM – 12:00 PM (season)" }, { label: "Evening Darshan", time: "3:00 PM – 9:00 PM (season)" }, { label: "Season", time: "Open late-April to early-Nov (dates vary by Akshaya Tritiya / Bhai Dooj)" }],
    aarti: [{ name: "Maha Rudrabhishek", time: "4:00 AM", desc: "Pre-dawn abhishek with Vedic Rudram chanting." }, { name: "Sandhya Aarti", time: "6:30 PM", desc: "Evening aarti against the Himalayan sunset." }],
    festivals: [{ name: "Opening Ceremony", month: "Apr / May", desc: "Doli of Baba Kedar carried from Ukhimath amid army bands and flower showers." }, { name: "Samadhi of Shankaracharya", month: "Season", desc: "Special prayers at the samadhi shrine behind the temple." }],
    facilities: ["GMVN & trust guesthouses (advance booking essential)", "Medical relief posts en route", "Helicopter services (Phata, Guptkashi, Sirsi)", "Pony / palki regulated stands", "Free bhandara during season", "Biometric registration mandatory"],
    howToReach: [{ mode: "Trek", detail: "18 km upgraded trail from Gaurikund (pony, palki, helicopter options)." }, { mode: "Rail", detail: "Rishikesh (215 km) nearest railhead." }, { mode: "Air", detail: "Jolly Grant, Dehradun (250 km) + heli shuttles." }],
    committee: [{ name: "Chairman, BKTC", role: "Temple Administration" }, { name: "Rawal", role: "Chief Priest (Veerashaiva tradition)" }],
    faqs: [{ q: "When is the temple open?", a: "Generally late April to early November. Winter worship continues at Ukhimath (Omkareshwar Temple)." }, { q: "Is registration required?", a: "Yes — biometric Char Dham registration is mandatory for all pilgrims." }, { q: "Is the trek difficult?", a: "Moderate. Acclimatise at Guptkashi/Sonprayag, start early, and carry woollens even in May." }],
    nearby: ["Bhairavnath Temple (500 m uphill)", "Gandhi Sarovar (3 km)", "Vasuki Tal (8 km trek)", "Ukhimath winter seat (60 km)"],
    mapEmbedNote: "Kedarnath, Rudraprayag, Uttarakhand 246445",
    liveAarti: { title: "Live: Sandhya Aarti — Kedarnath", time: "In season · 6:30 PM IST" }
  },
  {
    slug: "mahakaleshwar-ujjain", name: "Shri Mahakaleshwar Jyotirlinga", sanskrit: "महाकालेश्वर ज्योतिर्लिंग",
    city: "Ujjain", state: "Madhya Pradesh", district: "Ujjain", category: ["Jyotirlinga", "Shakti Peetha Circuit", "Ancient"],
    deity: "Lord Shiva (Mahakaal — Lord of Time)", tradition: "Shaiva · Bhasma-Aarti Parampara", image: "/images/mahakaleshwar-ujjain.jpg",
    rating: "4.9", established: "Ancient; rebuilt by Marathas (18th c.)", trust: "Shri Mahakaleshwar Temple Management Committee",
    summary: "The only south-facing (dakshinamukhi) Jyotirlinga, famed for its pre-dawn Bhasma Aarti — ash worship of Mahakaal on the banks of the Shipra.",
    history: ["Ujjayini was among the seven moksha-puris and a seat of Vedic astronomy — the prime meridian of ancient India passed through it.", "The present five-level temple was restored under the Marathas; the Mahakal Lok corridor (2022) added 108 sculpted narratives around Rudrasagar lake."],
    significance: ["Dakshinamukhi — the fierce, time-conquering form", "Bhasma Aarti: world-famous ash aarti at 4 AM", "One of the Sapta Puri (Ujjayini)"],
    divineAttractions: ["Mahakaleshwar Jyotirlinga darshan", "Bhasma Aarti experience", "Mahakal Lok sculptural corridor", "Shipra river / Ram Ghat", "Kal Bhairav and Harsiddhi sacred circuit"],
    scripturalConnections: [{"title": "Shiva Purana / Jyotirlinga tradition", "context": "Mahakaleshwar is traditionally revered as one of Shiva's twelve Jyotirlingas."}, {"title": "Ujjain sacred geography", "context": "Ujjayini is celebrated as a major moksha and temple city in Hindu pilgrimage traditions."}],
    pilgrimExperience: ["Pre-dawn Bhasma Aarti planning", "Mahakal Lok walk", "Ram Ghat river darshan", "Ujjain temple circuit"],
    bhagavataConnection: ["Ujjain's wider pilgrimage circuit includes Krishna's Sandipani Ashram tradition alongside the Shaiva worship of Mahakaal."],
    sources: [{"title": "Official District Temple Information", "organization": "District Ujjain, Government of Madhya Pradesh", "url": "https://ujjain.nic.in/en/tourist-place/shri-mahakaleshwar-temple/", "type": "Government", "purpose": "Official pilgrimage and heritage information for Mahakaleshwar.", "lastVerified": "2026-09-14"}],
    darshanTimings: [{ label: "Bhasma Aarti", time: "4:00 AM – 6:00 AM (ticketed)" }, { label: "General Darshan", time: "6:00 AM – 11:00 PM" }],
    aarti: [{ name: "Bhasma Aarti", time: "4:00 AM", desc: "Sacred ash anointment with damru, conch and Vedic hymns. Book 2–4 weeks ahead." }, { name: "Sandhya Aarti", time: "7:00 PM", desc: "Grand evening aarti with 11 Brahmin priests." }],
    festivals: [{ name: "Mahashivratri", month: "Feb / Mar", desc: "Nine-day celebration ending with the sehra procession." }, { name: "Simhastha Kumbh", month: "Every 12 years", desc: "One of four Kumbh sites on the Shipra." }],
    facilities: ["Online Bhasma Aarti booking", "Mahakal Lok corridor & light-sound show", "Laddu prasad counters", "Dharamshalas & Annakshetra", "Senior-citizen darshan lane"],
    howToReach: [{ mode: "Air", detail: "Indore Airport (55 km)." }, { mode: "Rail", detail: "Ujjain Junction (2 km)." }],
    committee: [{ name: "Collector (Chairman)", role: "Management Committee" }, { name: "Head Pujari", role: "Bhasma Aarti Rituals" }],
    faqs: [{ q: "How to book Bhasma Aarti?", a: "Online via the trust portal with photo ID; reporting at 2:30 AM in dhoti/saree is required." }, { q: "What should I wear?", a: "Traditional attire mandatory for Bhasma Aarti; modest dress for general darshan." }],
    nearby: ["Harsiddhi Mata (400 m)", "Kal Bhairav (8 km)", "Sandipani Ashram (5 km)"],
    mapEmbedNote: "Ujjain, Madhya Pradesh 456006",
    liveAarti: { title: "Live: Bhasma Aarti — Mahakaal", time: "Daily · 4:00 AM IST" }
  },
  {
    slug: "jagannath-puri", name: "Shree Jagannath Temple, Puri", sanskrit: "ଜଗନ୍ନାଥ ମନ୍ଦିର",
    city: "Puri", state: "Odisha", district: "Puri", category: ["Char Dham", "Heritage", "Vaishnava"],
    deity: "Lord Jagannath, Balabhadra & Devi Subhadra", tradition: "Vaishnava · Jagannath Culture", image: "/images/jagannath-puri.jpg",
    rating: "4.8", established: "12th century (Anantavarman Chodaganga)", trust: "Shree Jagannatha Temple Administration (SJTA)",
    summary: "One of the Char Dham, home of the Lord of the Universe — famed for the Rath Yatra, the Mahaprasad of Ananda Bazaar and the Nilachakra flag ritual.",
    history: ["Built by the Eastern Ganga king Anantavarman Chodaganga in the 12th century, the 214-ft curvilinear shikhara dominates Puri's skyline.", "The daily Chula-changing of the Nilachakra flag by chula sevaks has continued unbroken for centuries."],
    significance: ["Char Dham (eastern seat)", "Rath Yatra — the world's grandest chariot festival", "Mahaprasad cooked in seven earthen pots, one atop another"],
    divineAttractions: ["Jagannath, Balabhadra and Subhadra darshan", "Grand Road and Rath Yatra heritage", "Ananda Bazaar Mahaprasad tradition", "Gundicha Temple pilgrimage", "Sea-facing Puri spiritual landscape"],
    scripturalConnections: [{"title": "Jagannath tradition", "context": "Jagannath is a major Vaishnava deity and one of India's great pilgrimage centres."}, {"title": "Skanda / regional Puri traditions", "context": "Puri's sacred geography is described through long-standing temple, festival and pilgrimage traditions."}],
    pilgrimExperience: ["Jagannath darshan according to temple rules", "Mahaprasad experience where permitted", "Grand Road heritage walk", "Rath Yatra season pilgrimage"],
    bhagavataConnection: ["Jagannath worship is deeply connected with Krishna/Vishnu bhakti and the wider Bhagavata devotional tradition."],
    sources: [{"title": "Shree Jagannath Temple", "organization": "District Administration Puri, Government of Odisha", "url": "https://puri.odisha.gov.in/en/tourism/tourist-places/shree-jagannath-temple", "type": "Government", "purpose": "Temple history, pilgrimage importance, festivals and visitor information.", "lastVerified": "2026-09-14"}],
    darshanTimings: [{ label: "Temple Opening", time: "5:00 AM" }, { label: "General Darshan", time: "6:00 AM – 9:00 PM (pauses during rituals)" }, { label: "Pahuda (closing)", time: "~10:30 PM" }],
    aarti: [{ name: "Mangala Alati", time: "5:30 AM", desc: "First lamp-waving before the deities." }, { name: "Sandhya Alati", time: "Evening", desc: "Dusk lamps at the Lion's Gate and sanctum." }],
    festivals: [{ name: "Rath Yatra", month: "Jun / Jul", desc: "Three colossal chariots carry the deities to Gundicha Temple; millions pull the ropes." }, { name: "Snana Purnima", month: "Jun", desc: "Ceremonial bathing of 108 pitchers; deities then observe Anasara rest." }],
    facilities: ["Ananda Bazaar Mahaprasad market", "Shoe & mobile stands at gates", "Pilgrim rest sheds", "SJTA information centre"],
    howToReach: [{ mode: "Air", detail: "Bhubaneswar Airport (60 km)." }, { mode: "Rail", detail: "Puri station (3 km)." }],
    committee: [{ name: "Chief Administrator (SJTA)", role: "Temple Administration" }, { name: "Gajapati Maharaja", role: "Adya Sevak (first servitor)" }],
    faqs: [{ q: "Who can enter the temple?", a: "Practising Hindus may enter the shrine; all visitors can experience Rath Yatra, the Grand Road, Anand Bazaar and the sea-facing rituals." }, { q: "What is Mahaprasad?", a: "The 56-bhog cooked in the temple kitchen and sold at Ananda Bazaar — considered the world's largest open-air food offering." }],
    nearby: ["Gundicha Temple (3 km)", "Konark Sun Temple (35 km)", "Chilika Lake (50 km)"],
    mapEmbedNote: "Grand Road, Puri, Odisha 752001"
  },
  {
    slug: "somnath-gujarat", name: "Shree Somnath Jyotirlinga", sanskrit: "सोमनाथ ज्योतिर्लिंग",
    city: "Prabhas Patan", state: "Gujarat", district: "Gir Somnath", category: ["Jyotirlinga", "Coastal", "Heritage"],
    deity: "Lord Shiva (Somnath — Lord of the Moon)", tradition: "Shaiva · Chalukya Architecture", image: "/images/somnath-gujarat.jpg",
    rating: "4.8", established: "Ancient; present shrine 1951", trust: "Shree Somnath Trust",
    summary: "The first Jyotirlinga, rising on the Arabian Sea shore — the eternal shrine that has been rebuilt in devotion after every destruction.",
    history: ["Described as the first among Jyotirlingas, Somnath was raided and rebuilt repeatedly across a millennium — a symbol of civilisational resilience.", "Sardar Vallabhbhai Patel initiated the modern reconstruction; the present Chalukya-style temple was consecrated in 1951."],
    significance: ["Pratham Jyotirlinga", "Bhalka Tirtha nearby — Krishna's departure lila", "Triveni Sangam of Hiran, Kapila & Saraswati"],
    divineAttractions: ["Somnath Jyotirlinga darshan", "Arabian Sea templefront", "Temple evening aarti", "Jay Somnath light-and-sound experience", "Prabhas Patan sacred circuit"],
    scripturalConnections: [{"title": "Jyotirlinga tradition", "context": "Somnath is traditionally revered as the first of Shiva's twelve Jyotirlingas."}, {"title": "Prabhasa Kshetra tradition", "context": "Prabhas is an important sacred landscape associated with Shiva and Krishna traditions."}],
    pilgrimExperience: ["Morning sea-facing darshan", "Aarti by the Arabian Sea", "Prabhas Tirtha circuit", "Temple heritage and reconstruction story"],
    bhagavataConnection: ["Prabhas Patan is closely associated with the sacred geography of Krishna's final earthly journey, making Somnath a distinctive Shiva–Krishna pilgrimage combination."],
    sources: [{"title": "Official Temple Portal", "organization": "Shree Somnath Trust", "url": "https://somnath.org/", "type": "Official Temple", "purpose": "Temple history, darshan, aarti and pilgrimage information.", "lastVerified": "2026-09-14"}],
    darshanTimings: [{ label: "Darshan", time: "6:00 AM – 9:30 PM" }, { label: "Aarti", time: "7:00 AM · 12:00 PM · 7:00 PM" }, { label: "Sound & Light Show", time: "8:00 PM (seasonal)" }],
    aarti: [{ name: "Morning / Madhyahna / Sandhya Aarti", time: "7 AM · 12 PM · 7 PM", desc: "Three daily aartis with Somnath Ashtakam." }],
    festivals: [{ name: "Mahashivratri", month: "Feb / Mar", desc: "Three-day fair with cultural programmes on the beachfront." }, { name: "Kartik Purnima", month: "Nov", desc: "Deepotsav along the Somnath seafront." }],
    facilities: ["Trust guesthouses (Sagar Darshan, Tirthdham)", "Sound & light show", "Museum & Prabhas interpretation centre", "Wheelchair access"],
    howToReach: [{ mode: "Air", detail: "Diu (85 km) / Rajkot (200 km)." }, { mode: "Rail", detail: "Veraval (7 km)." }],
    committee: [{ name: "Chairman, Shree Somnath Trust", role: "Administration" }],
    faqs: [{ q: "Is there a light & sound show?", a: "Yes, 'Jay Somnath' runs each evening (weather permitting) narrating the temple's history." }],
    nearby: ["Bhalka Tirtha (5 km)", "Triveni Sangam (2 km)", "Gir National Park (45 km)"],
    mapEmbedNote: "Prabhas Patan, Gujarat 362268"
  },
  {
    slug: "tirupati-balaji", name: "Sri Venkateswara Temple, Tirumala", sanskrit: "శ్రీ వేంకటేశ్వర ఆలయం",
    city: "Tirumala", state: "Andhra Pradesh", district: "Tirupati", category: ["Vaishnava", "Hill Shrine", "Ancient"],
    deity: "Lord Venkateswara (Balaji)", tradition: "Srivaishnava · Vaikhanasa Agama", image: "/images/tirupati-balaji.jpg",
    rating: "4.9", established: "Antiquity; inscriptions from 9th century", trust: "Tirumala Tirupati Devasthanams (TTD)",
    summary: "The world's most-visited sacred shrine — the abode of Lord Venkateswara atop the Seshachalam hills, famed for Suprabhatam and Laddu prasadam.",
    history: ["Pallava, Chola, Pandya and Vijayanagara kings endowed the shrine; Krishnadevaraya's gold-covered Ananda Nilayam vimana still gleams.", "TTD administers one of the world's largest pilgrim ecosystems — free meals, tonsuring, hospitals and Vedic universities."],
    significance: ["Kali Yuga Vaikuntham", "Suprabhatam — the dawn hymn heard across India", "Hundi offerings funding vast dharmic charities"],
    divineAttractions: ["Sri Venkateswara darshan", "Ananda Nilayam temple architecture", "Swami Pushkarini sacred tank", "Varaha Swamy shrine", "Tirumala hill viewpoints"],
    scripturalConnections: [{"title": "Venkatachala Mahatmya tradition", "context": "Tirumala is celebrated through the sacred geography and legends of Lord Venkateswara."}, {"title": "Bhagavata / Vaishnava bhakti", "context": "The temple's living worship belongs to the wider Krishna–Vishnu devotional tradition of South India."}],
    pilgrimExperience: ["Time-slot darshan", "Suprabhatam / seva planning", "Temple pradakshina where permitted", "Tirumala hill and sacred tank circuit"],
    bhagavataConnection: ["Venkateswara is worshipped as a form of Vishnu and belongs strongly to the living Vaishnava bhakti world associated with Krishna and Bhagavata traditions."],
    sources: [{"title": "Official Tirumala Portal", "organization": "Tirumala Tirupati Devasthanams", "url": "https://www.tirumala.org/", "type": "Official Temple", "purpose": "Current darshan, seva, temple and pilgrim information.", "lastVerified": "2026-09-14"}],
    darshanTimings: [{ label: "Suprabhatam", time: "3:00 AM" }, { label: "Sarva Darshan", time: "From ~6:30 AM (time-slot based)" }, { label: "Ekantha Seva", time: "~1:00 AM (closing)" }],
    aarti: [{ name: "Suprabhatam", time: "3:00 AM", desc: "Awakening hymn composed by Prativadi Bhayankaram Annan." }, { name: "Thomala Seva", time: "3:30 AM", desc: "Floral adornment of the Lord." }, { name: "Archana & Darshan", time: "4:30 AM onwards", desc: "Sahasranama archana before Sarva Darshan." }],
    festivals: [{ name: "Brahmotsavam", month: "Sep / Oct", desc: "Nine-day festival with Garuda Seva drawing lakhs." }, { name: "Vaikuntha Ekadashi", month: "Dec / Jan", desc: "Vaikuntha Dwaram opened; massive pilgrim turnout." }],
    facilities: ["Time-slot Sarva Darshan & Divya Darshan tokens", "Free Anna Prasadam complex", "Tonsure halls & baggage centres", "TTD guesthouses & hospitals", "Alipiri footpath (3,550 steps)"],
    howToReach: [{ mode: "Air", detail: "Tirupati Airport (40 km)." }, { mode: "Rail", detail: "Tirupati (22 km uphill)." }, { mode: "Road", detail: "TTD buses every few minutes from Tirupati to Tirumala." }],
    committee: [{ name: "Chairman, TTD Board", role: "Administration" }, { name: "Executive Officer", role: "Operations" }],
    faqs: [{ q: "Do I need a darshan ticket?", a: "Free Sarva Darshan requires a time-slot token; Special Entry (Rs. 300) darshan can be booked online in advance." }, { q: "Where do I get Laddu prasadam?", a: "Laddu counters operate near the temple complex on presentation of the darshan ticket." }],
    nearby: ["Sri Padmavathi Temple, Tiruchanur (25 km)", "Kapila Theertham (Tirupati)", "Chandragiri Fort (20 km)"],
    mapEmbedNote: "Tirumala, Andhra Pradesh 517504"
  },
  {
    slug: "rameshwaram-jyotirlinga", name: "Shri Ramanathaswamy Temple", sanskrit: "இராமநாதசுவாமி கோயில்",
    city: "Rameshwaram", state: "Tamil Nadu", district: "Ramanathapuram", category: ["Jyotirlinga", "Char Dham", "Coastal"],
    deity: "Lord Ramanathaswamy & Goddess Parvathavardhini", tradition: "Shaiva · Ramayana Kshetra", image: "/images/rameshwaram-jyotirlinga.jpg",
    rating: "4.8", established: "Ramayana origins; present structure 12th–19th century", trust: "HR & CE Dept., Govt. of Tamil Nadu",
    summary: "Where Rama worshipped Shiva before crossing to Lanka — famed for its 1,200-metre pillared corridor, the longest temple corridor on earth.",
    history: ["Rama is said to have installed the Ramalingam here; Hanuman brought the Vishwalingam from Kashi — worshipped first to this day.", "The Sethupathi kings and later the Nadar community built the magnificent third prakaram corridor with 1,212 carved pillars."],
    significance: ["Southernmost Jyotirlinga; Char Dham (southern seat)", "22 sacred theerthams — ritual bathing precedes darshan", "Sethu / Ram Setu darshan point at Dhanushkodi"],
    divineAttractions: ["Ramanathaswamy Jyotirlinga darshan", "22 sacred theerthams", "Long pillared temple corridors", "Agni Theertham seafront", "Dhanushkodi and Ramayana sacred landscape"],
    scripturalConnections: [{"title": "Ramayana tradition", "context": "Rameshwaram is traditionally associated with Rama's worship of Shiva before the Lanka campaign."}, {"title": "Jyotirlinga tradition", "context": "Ramanathaswamy is traditionally revered as one of Shiva's twelve Jyotirlingas."}],
    pilgrimExperience: ["22-theertham ritual sequence", "Jyotirlinga darshan", "Temple corridor heritage walk", "Dhanushkodi sacred-landscape visit"],
    bhagavataConnection: ["The site is primarily Ramayana-Shaiva in character, while the wider Tamil devotional landscape includes the Vaishnava bhakti tradition."],
    sources: [{"title": "Ramanathaswamy Temple", "organization": "Ramanathapuram District Administration, Government of Tamil Nadu", "url": "https://ramanathapuram.nic.in/tourist-place/ramanathaswamy-temple/", "type": "Government", "purpose": "Temple heritage, pilgrimage significance, theerthams and access information.", "lastVerified": "2026-09-14"}],
    darshanTimings: [{ label: "Theertham Bathing", time: "5:00 AM – 12:00 PM" }, { label: "Spatika Lingam Darshan", time: "5:00 AM – 6:00 AM" }, { label: "General Darshan", time: "6:00 AM – 9:00 PM" }],
    aarti: [{ name: "Palliyarai Deepa Aradhana", time: "Evening", desc: "Lamp worship with Thevaram hymns." }, { name: "Spatika Lingam Pooja", time: "5:00 AM", desc: "Crystal lingam darshan — arrive before 5 AM." }],
    festivals: [{ name: "Maha Shivaratri", month: "Feb / Mar", desc: "Float festival (Theppam) in the temple tank." }, { name: "Ramalinga Prathistha Day", month: "Season", desc: "Re-enactment of Rama's worship." }],
    facilities: ["22-theertham bathing assistance", "Locker & dhoti counters", "Sea-view mandapams", "Guides for corridor history"],
    howToReach: [{ mode: "Rail", detail: "Rameshwaram station on Pamban island (2 km) — over the iconic sea bridge." }, { mode: "Road", detail: "170 km from Madurai via NH-87." }],
    committee: [{ name: "Joint Commissioner", role: "HR & CE Administration" }],
    faqs: [{ q: "Must I bathe in all 22 theerthams?", a: "It is customary and auspicious; priests assist pilgrims through the wells in about 1–2 hours." }, { q: "Can I visit Dhanushkodi?", a: "Yes — shared jeeps run to the ghost town and Ram Setu viewpoint, 20 km away." }],
    nearby: ["Dhanushkodi & Ram Setu viewpoint", "Pamban Bridge", "APJ Abdul Kalam Memorial"],
    mapEmbedNote: "Rameshwaram, Tamil Nadu 623526"
  },

  {
    slug: "mallikarjuna-srisailam",
    name: "Shri Mallikarjuna Jyotirlinga",
    sanskrit: "श्री मल्लिकार्जुन ज्योतिर्लिंग",
    city: "Srisailam",
    state: "Andhra Pradesh",
    district: "Nandyal",
    category: ["Jyotirlinga", "Sacred Pilgrimage"],
    deity: "Lord Shiva (Mallikarjuna) & Goddess Bhramaramba",
    tradition: "Shaiva · Srisailam Kshetra · Shakta-Shaiva tradition",
    image: "/images/mallikarjuna-srisailam.jpg",
    established: "Ancient pilgrimage centre; present temple complex developed over successive dynasties",
    trust: "Srisaila Devasthanam",
    rating: "Editorially not rated",
    summary: "The sacred Srisailam hill on the Krishna river, where Mallikarjuna and Bhramaramba unite one of the great Shaiva and Shakta pilgrimage traditions.",
    history: [
      "Srisailam is an ancient sacred hill whose inscriptions and temple traditions reflect centuries of patronage by regional dynasties.",
      "Temple tradition associates Mallikarjuna with Shiva and Bhramaramba with the Divine Mother, making the kshetra especially important to Shaiva and Shakta pilgrims."
    ],
    significance: [
      "One of the twelve Jyotirlingas",
      "Traditionally known as Dakshina Kailasa",
      "Also a major Shakti worship centre through Bhramaramba Devi"
    ],
    divineAttractions: [
      "Mallikarjuna Jyotirlinga darshan",
      "Bhramaramba Devi shrine",
      "Krishna river gorge and Srisailam hills",
      "Sacred pradakshina around temple streets",
      "Sunrise and sunset views from the hill country"
    ],
    scripturalConnections: [
      {
        title: "Shiva Purana tradition",
        context: "The Jyotirlinga tradition connects Shiva's manifestation at Srisailam with the sacred Srisaila mountain."
      },
      {
        title: "Skanda Purana / Srisaila tradition",
        context: "Srisailam is celebrated as an ancient Shaiva kshetra in regional pilgrimage literature."
      }
    ],
    pilgrimExperience: [
      "Early-morning temple darshan",
      "Shaiva-Shakta combined pilgrimage",
      "Krishna river darshan",
      "Kshetra pradakshina and sacred hill travel"
    ],
    bhagavataConnection: [
      "Bhakti is expressed through naam-smarana, temple seva and pilgrimage; Vaishnava visitors can experience the wider devotional culture of Andhra sacred geography."
    ],
    darshanTimings: [
      {
        label: "General Darshan",
        time: "Temple schedule varies by seva and festival"
      }
    ],
    aarti: [
      {
        name: "Daily Temple Aarti",
        time: "As per temple schedule",
        desc: "Ritual sequence varies by seva calendar; verify at the official temple before travel."
      }
    ],
    festivals: [
      {
        name: "Mahashivratri Brahmotsavam",
        month: "Feb / Mar",
        desc: "Major Shaiva festival with extended worship and large pilgrim participation."
      },
      {
        name: "Karthika Masam",
        month: "Nov",
        desc: "Deepa, Shiva worship and pilgrimage season across Andhra sacred sites."
      }
    ],
    facilities: [
      "Pilgrim accommodation and guest houses",
      "Prasadam counters",
      "Temple information facilities",
      "Local transport and pilgrimage assistance"
    ],
    howToReach: [
      {
        mode: "Air",
        detail: "Nearest major airport access is generally through Hyderabad; road travel continues into the hill region."
      },
      {
        mode: "Road",
        detail: "Well connected by road from Hyderabad, Kurnool and surrounding Andhra/Telangana towns."
      }
    ],
    committee: [
      {
        name: "Srisaila Devasthanam",
        role: "Temple Administration"
      }
    ],
    faqs: [
      {
        q: "Is Mallikarjuna one of the Jyotirlingas?",
        a: "Yes. It is traditionally counted among Shiva's twelve Jyotirlinga shrines."
      },
      {
        q: "What makes Srisailam unique?",
        a: "The kshetra combines Jyotirlinga worship of Mallikarjuna with the major Shakti shrine of Bhramaramba."
      }
    ],
    nearby: [
      "Bhramaramba Devi Temple",
      "Srisailam Dam",
      "Patala Ganga",
      "Sakshi Ganapati Temple"
    ],
    mapEmbedNote: "Srisailam, Nandyal district, Andhra Pradesh",
    contentNote: "Legendary elements are presented as sacred temple tradition. Seva timings and access should be checked with Srisaila Devasthanam."
  },
  {
    slug: "omkareshwar-madhya-pradesh",
    name: "Shri Omkareshwar Jyotirlinga",
    sanskrit: "ॐकारेश्वर ज्योतिर्लिंग",
    city: "Omkareshwar",
    state: "Madhya Pradesh",
    district: "Khandwa",
    category: ["Jyotirlinga", "Sacred Pilgrimage"],
    deity: "Lord Shiva (Omkareshwar)",
    tradition: "Shaiva · Narmada Kshetra",
    image: "/images/omkareshwar-madhya-pradesh.jpg",
    established: "Ancient; temple tradition developed over many centuries",
    trust: "Shri Omkareshwar Temple Trust / local temple administration",
    rating: "Editorially not rated",
    summary: "A Jyotirlinga on Mandhata island in the Narmada, where river, sacred sound and temple worship converge in a dramatic island pilgrimage.",
    history: [
      "The Omkareshwar pilgrimage is centred on the Mandhata island shaped by the Narmada and associated with the sacred syllable Om in regional tradition.",
      "Temple architecture and the surrounding pilgrimage route reflect centuries of Shaiva worship along the Narmada."
    ],
    significance: [
      "One of the twelve Jyotirlingas",
      "Mandhata island and Narmada river pilgrimage",
      "Often visited together with Mamleshwar / Amareshwar on the opposite bank"
    ],
    divineAttractions: [
      "Omkareshwar Jyotirlinga darshan",
      "Narmada river ghats",
      "Island parikrama around Mandhata",
      "Mamleshwar temple across the river",
      "Boat and ghat experience at dawn"
    ],
    scripturalConnections: [
      {
        title: "Shiva Purana tradition",
        context: "Omkareshwar is celebrated within the Jyotirlinga narrative associated with Shiva's sacred manifestations."
      },
      {
        title: "Narmada Mahatmya tradition",
        context: "The Narmada is revered as a sacred river whose pilgrimage culture shapes the Omkareshwar experience."
      }
    ],
    pilgrimExperience: [
      "Narmada snan or river darshan",
      "Mandhata island parikrama",
      "Sunrise ghat worship",
      "Combined Omkareshwar–Mamleshwar darshan"
    ],
    bhagavataConnection: [
      "The river pilgrimage complements broader Hindu bhakti traditions, with Omkareshwar serving as a Shaiva centre in the Narmada sacred landscape."
    ],
    darshanTimings: [
      {
        label: "General Darshan",
        time: "Varies with daily seva schedule"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti",
        time: "As per temple schedule",
        desc: "Daily ritual worship; exact seva timings should be confirmed locally."
      }
    ],
    festivals: [
      {
        name: "Mahashivratri",
        month: "Feb / Mar",
        desc: "Major Shiva festival with night-long worship and large pilgrim gatherings."
      },
      {
        name: "Kartik Purnima",
        month: "Nov",
        desc: "Narmada and temple pilgrimage becomes especially vibrant around the full moon."
      }
    ],
    facilities: [
      "Pilgrim dharamshalas and hotels",
      "Prasadam and puja counters",
      "Boat and local transport access",
      "Ghat facilities"
    ],
    howToReach: [
      {
        mode: "Air",
        detail: "Indore airport is the principal air gateway; continue by road."
      },
      {
        mode: "Rail",
        detail: "Khandwa and nearby rail connections can be used with onward road travel."
      },
      {
        mode: "Road",
        detail: "Approachable from Indore, Khandwa and major Madhya Pradesh routes."
      }
    ],
    committee: [
      {
        name: "Temple Administration",
        role: "Darshan, Seva and Pilgrim Services"
      }
    ],
    faqs: [
      {
        q: "What is special about Omkareshwar?",
        a: "The Jyotirlinga is situated on the sacred Mandhata island in the Narmada."
      },
      {
        q: "Should I visit Mamleshwar too?",
        a: "Yes. Many pilgrims traditionally include the Mamleshwar shrine in the same pilgrimage circuit."
      }
    ],
    nearby: [
      "Mamleshwar Temple",
      "Narmada Ghat",
      "Siddhanath Temple",
      "Kajal Rani Cave / local Narmada viewpoints"
    ],
    mapEmbedNote: "Mandhata Island, Omkareshwar, Khandwa, Madhya Pradesh",
    contentNote: "Narmada bathing and parikrama customs vary by family and pilgrimage tradition."
  },
  {
    slug: "trimbakeshwar-nashik",
    name: "Shri Trimbakeshwar Jyotirlinga",
    sanskrit: "त्र्यंबकेश्वर ज्योतिर्लिंग",
    city: "Trimbak",
    state: "Maharashtra",
    district: "Nashik",
    category: ["Jyotirlinga", "Sacred Pilgrimage"],
    deity: "Lord Shiva (Trimbakeshwar)",
    tradition: "Shaiva · Godavari Udbhava Kshetra",
    image: "/images/trimbakeshwar-nashik.jpg",
    established: "18th century present temple on an ancient sacred site",
    trust: "Shri Trimbakeshwar Temple Trust",
    rating: "Editorially not rated",
    summary: "At the foot of Brahmagiri, Trimbakeshwar marks the sacred source region of the Godavari and houses a distinctive Jyotirlinga associated with the Trimurti.",
    history: [
      "The present black-stone temple was built under Peshwa-era patronage on an older sacred site.",
      "The temple's sanctum and surrounding Brahmagiri-Godavari landscape form a major pilgrimage centre in Nashik."
    ],
    significance: [
      "One of the twelve Jyotirlingas",
      "Source region of the Godavari",
      "Distinctive Trimurti-associated lingam tradition",
      "Gateway to Brahmagiri and sacred Godavari pilgrimage"
    ],
    divineAttractions: [
      "Trimbakeshwar Jyotirlinga darshan",
      "Kushavarta Tirtha",
      "Brahmagiri foothills",
      "Godavari origin pilgrimage route",
      "Sacred temple architecture in black stone"
    ],
    scripturalConnections: [
      {
        title: "Shiva Purana tradition",
        context: "The Jyotirlinga tradition associates Shiva's manifestation here with Gautama Rishi and the sacred descent of the Godavari."
      },
      {
        title: "Nath / regional pilgrimage traditions",
        context: "Brahmagiri and nearby tirthas form a dense sacred geography visited by Shaiva pilgrims."
      }
    ],
    pilgrimExperience: [
      "Kushavarta darshan",
      "Brahmagiri pilgrimage",
      "Jyotirlinga seva",
      "Traditional river-origin rituals"
    ],
    bhagavataConnection: [
      "Nashik's wider sacred landscape also includes Ramayana-linked Panchavati, creating a combined Shiva–Rama devotional journey."
    ],
    darshanTimings: [
      {
        label: "General Darshan",
        time: "Daily schedule varies with rituals"
      }
    ],
    aarti: [
      {
        name: "Morning Aarti",
        time: "As per temple schedule",
        desc: "Confirm the day's official seva schedule before visiting."
      }
    ],
    festivals: [
      {
        name: "Mahashivratri",
        month: "Feb / Mar",
        desc: "Major Shaiva festival with special worship."
      },
      {
        name: "Kumbh / Simhastha Nashik",
        month: "Cyclical",
        desc: "The larger Nashik pilgrimage region becomes a major gathering centre during Kumbh years."
      },
      {
        name: "Shravan",
        month: "Jul / Aug",
        desc: "Monday Shiva worship and abhisheks draw increased pilgrims."
      }
    ],
    facilities: [
      "Puja and abhishek booking assistance",
      "Local guides and pilgrimage shops",
      "Dharamshalas and hotels",
      "Roadside pilgrim facilities"
    ],
    howToReach: [
      {
        mode: "Air",
        detail: "Nashik airport is the closest regional air gateway."
      },
      {
        mode: "Rail",
        detail: "Nashik Road is the principal railhead with onward road travel."
      },
      {
        mode: "Road",
        detail: "Trimbak is well connected by road from Nashik city."
      }
    ],
    committee: [
      {
        name: "Temple Trust",
        role: "Temple Administration and Seva Management"
      }
    ],
    faqs: [
      {
        q: "What is unique about the Jyotirlinga here?",
        a: "The lingam is traditionally associated with Brahma, Vishnu and Shiva in a distinctive threefold form."
      },
      {
        q: "What should I visit with the temple?",
        a: "Kushavarta Tirtha, Brahmagiri and the wider Panchavati–Nashik sacred circuit are natural extensions."
      }
    ],
    nearby: [
      "Kushavarta Tirtha",
      "Brahmagiri Hill",
      "Panchavati",
      "Saptashrungi Devi"
    ],
    mapEmbedNote: "Trimbak, Nashik, Maharashtra",
    contentNote: "Exact seva/ticketing rules are dynamic; verify with the official temple trust."
  },
  {
    slug: "bhimashankar-pune",
    name: "Shri Bhimashankar Jyotirlinga",
    sanskrit: "भीमाशंकर ज्योतिर्लिंग",
    city: "Bhimashankar",
    state: "Maharashtra",
    district: "Pune",
    category: ["Jyotirlinga", "Sacred Pilgrimage"],
    deity: "Lord Shiva (Bhimashankar)",
    tradition: "Shaiva · Sahyadri Kshetra",
    image: "/images/bhimashankar-pune.jpg",
    established: "Ancient shrine; present temple includes later medieval and Maratha-period features",
    trust: "Bhimashankar Temple Trust / local administration",
    rating: "Editorially not rated",
    summary: "A forested Sahyadri Jyotirlinga where ancient Shiva worship meets biodiversity, hill trekking and the source traditions of the Bhima river.",
    history: [
      "The shrine is associated with long-standing Bhimashankar pilgrimage traditions in the Sahyadri range.",
      "The present temple carries Nagara and regional architectural influences, while the wider sanctuary preserves a distinctive mountain ecology."
    ],
    significance: [
      "One of the twelve Jyotirlingas",
      "Source region of the Bhima river",
      "Sahyadri forest pilgrimage",
      "Temple reliefs depicting epic and devotional themes"
    ],
    divineAttractions: [
      "Bhimashankar Jyotirlinga darshan",
      "Sacred forest and hill landscape",
      "Bhim river source traditions",
      "Temple carvings of Ramayana, Mahabharata and Shiva themes",
      "Monsoon-green pilgrimage trails"
    ],
    scripturalConnections: [
      {
        title: "Shiva Purana tradition",
        context: "The shrine is celebrated within the broader Jyotirlinga tradition and local Bhimashankar legend."
      },
      {
        title: "Epic visual tradition",
        context: "Temple sculpture and iconography preserve scenes connected with Hindu sacred narratives."
      }
    ],
    pilgrimExperience: [
      "Forest pilgrimage walk",
      "Dawn darshan",
      "Monsoon spiritual retreat",
      "Nature and sacred-history circuit"
    ],
    bhagavataConnection: [
      "The devotional atmosphere is enriched by the wider Hindu storytelling tradition reflected in temple imagery and regional bhakti practice."
    ],
    darshanTimings: [
      {
        label: "General Darshan",
        time: "Daily schedule varies"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti",
        time: "As per daily schedule",
        desc: "Daily worship timings should be confirmed before travel."
      }
    ],
    festivals: [
      {
        name: "Mahashivratri",
        month: "Feb / Mar",
        desc: "Major annual Shiva festival."
      },
      {
        name: "Shravan Mondays",
        month: "Jul / Aug",
        desc: "Monsoon pilgrimage and increased Shiva worship."
      }
    ],
    facilities: [
      "Pilgrim accommodation",
      "Food and prasadam facilities",
      "Local guides",
      "Trekking and forest access support"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Reached by road from Pune, Mumbai and Nashik through the Sahyadri region."
      }
    ],
    committee: [
      {
        name: "Temple Administration",
        role: "Darshan and Pilgrim Services"
      }
    ],
    faqs: [
      {
        q: "Is Bhimashankar suitable for nature lovers?",
        a: "Yes. The temple sits in a forested Sahyadri environment with a strong pilgrimage-plus-nature character."
      },
      {
        q: "When is the landscape most scenic?",
        a: "The monsoon creates lush scenery, though road and trail conditions can become more difficult."
      }
    ],
    nearby: [
      "Bhimashankar Wildlife Sanctuary",
      "Gupt Bhimashankar",
      "Hanuman Lake",
      "Dimbhe Dam region"
    ],
    mapEmbedNote: "Bhimashankar, Pune district, Maharashtra",
    contentNote: "Monsoon travel requires weather-aware planning; trail and road conditions can change."
  },
  {
    slug: "vaidyanath-deoghar",
    name: "Baba Baidyanath Jyotirlinga",
    sanskrit: "बैद्यनाथ ज्योतिर्लिंग",
    city: "Deoghar",
    state: "Jharkhand",
    district: "Deoghar",
    category: ["Jyotirlinga", "Sacred Pilgrimage"],
    deity: "Lord Shiva (Baidyanath)",
    tradition: "Shaiva · Deoghar pilgrimage tradition",
    image: "/images/vaidyanath-deoghar.jpg",
    established: "Ancient pilgrimage centre; temple complex reflects multiple historical periods",
    trust: "Baba Baidyanath Temple administration",
    rating: "Editorially not rated",
    summary: "The Deoghar Jyotirlinga, revered in eastern India, where intense Shiva devotion meets the Kanwar pilgrimage and a historic temple cluster.",
    history: [
      "Deoghar has been a major Shaiva pilgrimage destination for centuries and is strongly associated with Kanwar pilgrims carrying Ganga water.",
      "The temple complex contains a principal Shiva shrine surrounded by a group of associated temples that create a compact sacred city."
    ],
    significance: [
      "One of the twelve Jyotirlingas",
      "Major Shravan Kanwar pilgrimage destination",
      "Eastern India Shiva pilgrimage centre",
      "Temple cluster with multiple sacred shrines"
    ],
    divineAttractions: [
      "Baidyanath Jyotirlinga darshan",
      "Temple-cluster pradakshina",
      "Shravan Kanwar pilgrimage atmosphere",
      "Local Shiva devotional markets",
      "Sacred offerings and puja traditions"
    ],
    scripturalConnections: [
      {
        title: "Shiva Purana / Jyotirlinga tradition",
        context: "Baidyanath is counted among Shiva's twelve Jyotirlinga manifestations in traditional pilgrimage literature."
      },
      {
        title: "Ravana legend",
        context: "Local sacred tradition connects the shrine with Ravana's intense worship of Shiva."
      }
    ],
    pilgrimExperience: [
      "Shravan pilgrimage",
      "Abhishek and jal offering",
      "Temple-cluster darshan",
      "Night devotional atmosphere"
    ],
    bhagavataConnection: [
      "The eastern Indian pilgrimage landscape connects Shaiva and broader bhakti traditions through katha, sankirtan and festival devotion."
    ],
    darshanTimings: [
      {
        label: "Darshan",
        time: "Varies with daily rituals and festival periods"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti",
        time: "As per official schedule",
        desc: "Festival and Shravan timings can differ substantially."
      }
    ],
    festivals: [
      {
        name: "Shravan Mela",
        month: "Jul / Aug",
        desc: "One of the great Shiva pilgrimages, with Kanwariyas arriving from the Ganga."
      },
      {
        name: "Mahashivratri",
        month: "Feb / Mar",
        desc: "Major annual Shiva festival with special worship."
      }
    ],
    facilities: [
      "Pilgrim shelters and dharamshalas",
      "Prasadam and puja counters",
      "Kanwar pilgrimage support",
      "Medical and civic facilities during major fairs"
    ],
    howToReach: [
      {
        mode: "Air",
        detail: "Deoghar Airport is the nearest air gateway."
      },
      {
        mode: "Rail",
        detail: "Deoghar and Jasidih provide rail access with local transfers."
      },
      {
        mode: "Road",
        detail: "Well connected by road with Jharkhand and Bihar pilgrimage circuits."
      }
    ],
    committee: [
      {
        name: "Baba Baidyanath Temple Administration",
        role: "Temple and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Why is Deoghar important in Shravan?",
        a: "Kanwariyas traditionally carry Ganga water and offer it to Baba Baidyanath, creating a major pilgrimage season."
      },
      {
        q: "Is Baidyanath also associated with Shakti worship?",
        a: "Yes. Some Shakti Peetha traditions associate Deoghar with Jai Durga / Baidyanath Shakti worship; identifications vary by tradition."
      }
    ],
    nearby: [
      "Basukinath Dham",
      "Trikuta Parvat",
      "Tapovan",
      "Nandan Pahar"
    ],
    mapEmbedNote: "Baidyanath Dham, Deoghar, Jharkhand",
    contentNote: "Shakti Peetha identification at Deoghar is tradition-dependent; this record separates the Jyotirlinga identity from the Shakti tradition."
  },
  {
    slug: "nageshwar-dwarka",
    name: "Shri Nageshwar Jyotirlinga",
    sanskrit: "नागेश्वर ज्योतिर्लिंग",
    city: "Dwarka",
    state: "Gujarat",
    district: "Devbhumi Dwarka",
    category: ["Jyotirlinga", "Sacred Pilgrimage"],
    deity: "Lord Shiva (Nageshwar)",
    tradition: "Shaiva · Dwarka sacred circuit",
    image: "/images/nageshwar-dwarka.jpg",
    established: "Ancient shrine tradition; present temple developed in modern pilgrimage era",
    trust: "Nageshwar Temple administration",
    rating: "Editorially not rated",
    summary: "A coastal Shiva shrine on the Dwarka pilgrimage route, where Jyotirlinga worship is paired naturally with Krishna's sacred city and Arabian Sea landscapes.",
    history: [
      "Nageshwar is part of the ancient Shiva pilgrimage tradition associated with the Dwarka region.",
      "The shrine's present pilgrimage experience is shaped by the coastal temple landscape, large Shiva icon and connection with the wider Char Dham circuit."
    ],
    significance: [
      "One of the twelve Jyotirlingas in the commonly followed western India pilgrimage tradition",
      "Coastal Shiva shrine",
      "Natural pairing with Dwarka Krishna pilgrimage"
    ],
    divineAttractions: [
      "Nageshwar Jyotirlinga darshan",
      "Massive Shiva murti",
      "Coastal pilgrimage road",
      "Dwarkadhish temple circuit",
      "Arabian Sea sunset experience"
    ],
    scripturalConnections: [
      {
        title: "Shiva Purana tradition",
        context: "The Nageshwar story is included in traditional Jyotirlinga pilgrimage narratives."
      },
      {
        title: "Dwarka sacred geography",
        context: "The shrine forms a Shaiva complement to the Vaishnava pilgrimage of Dwarka."
      }
    ],
    pilgrimExperience: [
      "Combined Shiva–Krishna pilgrimage",
      "Coastal temple darshan",
      "Sunset spiritual sightseeing",
      "Dwarka tirtha circuit"
    ],
    bhagavataConnection: [
      "Dwarka is one of the most important Krishna sacred geographies; visiting Nageshwar creates a distinctive Shiva–Krishna devotional circuit."
    ],
    darshanTimings: [
      {
        label: "General Darshan",
        time: "Verify current temple schedule"
      }
    ],
    aarti: [
      {
        name: "Daily Aarti",
        time: "As per temple schedule",
        desc: "Confirm timing on the day of visit."
      }
    ],
    festivals: [
      {
        name: "Mahashivratri",
        month: "Feb / Mar",
        desc: "Main Shiva festival at Nageshwar."
      },
      {
        name: "Krishna Janmashtami / Dwarka festivals",
        month: "Aug / Sep",
        desc: "The wider Dwarka pilgrimage region becomes especially vibrant during Krishna festivals."
      }
    ],
    facilities: [
      "Pilgrim parking",
      "Prasadam facilities",
      "Local guide and temple assistance",
      "Roadside pilgrimage services"
    ],
    howToReach: [
      {
        mode: "Air",
        detail: "Jamnagar is a major air gateway; Porbandar also serves the broader Saurashtra region."
      },
      {
        mode: "Rail",
        detail: "Dwarka railway station is the principal rail access for the circuit."
      },
      {
        mode: "Road",
        detail: "Connected by road with Dwarka and Gujarat's coastal pilgrimage corridor."
      }
    ],
    committee: [
      {
        name: "Temple Administration",
        role: "Darshan and Pilgrim Services"
      }
    ],
    faqs: [
      {
        q: "Can I visit Nageshwar and Dwarkadhish together?",
        a: "Yes. They are commonly combined as part of the Dwarka sacred circuit."
      },
      {
        q: "Is Nageshwar the same as any other Nagesh Jyotirlinga tradition?",
        a: "Different historical locations have been debated in scholarship and pilgrimage traditions; the Dwarka Nageshwar shrine is one widely followed identification."
      }
    ],
    nearby: [
      "Dwarkadhish Temple",
      "Bet Dwarka",
      "Rukmini Devi Temple",
      "Gopi Talav"
    ],
    mapEmbedNote: "Nageshwar, near Dwarka, Devbhumi Dwarka, Gujarat",
    contentNote: "The Nageshwar location has historical/traditional identification debates; present-day temple identity follows the Dwarka pilgrimage tradition."
  },
  {
    slug: "grishneshwar-ellora",
    name: "Grishneshwar Jyotirlinga",
    sanskrit: "घृष्णेश्वर ज्योतिर्लिंग",
    city: "Verul (Ellora)",
    state: "Maharashtra",
    district: "Chhatrapati Sambhajinagar",
    category: ["Jyotirlinga", "Sacred Pilgrimage"],
    deity: "Lord Shiva (Grishneshwar / Ghushmeshwar)",
    tradition: "Shaiva · Maratha-era temple tradition",
    image: "/images/grishneshwar-ellora.jpg",
    established: "Ancient shrine tradition; present temple rebuilt in the 18th century",
    trust: "Shri Grishneshwar Temple administration",
    rating: "Editorially not rated",
    summary: "The final Jyotirlinga in the commonly followed list, set beside the monumental Ellora cave complex and the sacred landscape of western Maharashtra.",
    history: [
      "The shrine has an ancient sacred tradition and is associated with the Ghushma / Kusuma legend in popular devotional narratives.",
      "The present temple was rebuilt in the 18th century under Maratha-era patronage, with richly carved stone architecture."
    ],
    significance: [
      "Traditionally counted as the twelfth and final Jyotirlinga",
      "Located close to UNESCO-listed Ellora Caves",
      "Direct-touch lingam ritual tradition is noted in modern pilgrimage descriptions"
    ],
    divineAttractions: [
      "Grishneshwar Jyotirlinga darshan",
      "Red-stone temple carvings",
      "Ellora Cave pilgrimage",
      "Kailasa Temple heritage experience",
      "Verul village sacred landscape"
    ],
    scripturalConnections: [
      {
        title: "Shiva Purana tradition",
        context: "The shrine's popular legend centres on devotion, perseverance and Shiva's grace through the story of Ghushma."
      },
      {
        title: "Ellora sacred landscape",
        context: "The temple sits within a region where Hindu, Buddhist and Jain cave traditions coexist, making the journey both spiritual and heritage-rich."
      }
    ],
    pilgrimExperience: [
      "Temple darshan and abhishek customs",
      "Ellora cave exploration",
      "Heritage photography from permitted areas",
      "Combined pilgrimage and archaeology circuit"
    ],
    bhagavataConnection: [
      "The Ellora region supports a broader Hindu sacred-art journey in which Shaiva stories appear alongside wider puranic and devotional iconography."
    ],
    darshanTimings: [
      {
        label: "General Darshan",
        time: "Verify current temple hours and ritual pauses"
      }
    ],
    aarti: [
      {
        name: "Daily Aarti",
        time: "As per temple schedule",
        desc: "Current timings can vary with ritual calendar."
      }
    ],
    festivals: [
      {
        name: "Mahashivratri",
        month: "Feb / Mar",
        desc: "Major annual Shiva celebration."
      },
      {
        name: "Shravan",
        month: "Jul / Aug",
        desc: "Increased pilgrim flow and Shiva worship during the monsoon."
      }
    ],
    facilities: [
      "Temple assistance",
      "Prasadam and puja counters",
      "Hotels and pilgrimage stays in the Ellora/Aurangabad region",
      "Road and tourist guide services"
    ],
    howToReach: [
      {
        mode: "Air",
        detail: "Chhatrapati Sambhajinagar airport is the closest major air gateway."
      },
      {
        mode: "Rail",
        detail: "Chhatrapati Sambhajinagar railway station provides regional access."
      },
      {
        mode: "Road",
        detail: "Located near Ellora on the road network from Chhatrapati Sambhajinagar."
      }
    ],
    committee: [
      {
        name: "Temple Administration",
        role: "Darshan and Pilgrim Services"
      }
    ],
    faqs: [
      {
        q: "What can I combine with Grishneshwar?",
        a: "Ellora Caves, especially the Kailasa temple, make a natural sacred-heritage extension to the visit."
      },
      {
        q: "Is the lingam directly touchable?",
        a: "Current temple customs should be checked locally because access rules can change."
      }
    ],
    nearby: [
      "Ellora Caves",
      "Kailasa Temple",
      "Daulatabad Fort",
      "Bibi Ka Maqbara"
    ],
    mapEmbedNote: "Verul near Ellora, Chhatrapati Sambhajinagar, Maharashtra",
    contentNote: "Temple entry customs and dress requirements can change; verify locally before arrival."
  },

  {
    slug: "shakti-peetha-01-mahamayi-amarnath",
    name: "Shakti Peetha — Maa Mahamaya",
    sanskrit: "Maa Mahamaya",
    city: "Amarnath",
    state: "Jammu and Kashmir",
    district: "Anantnag",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Mahamaya (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-01-mahamayi-amarnath.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Mahamaya, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Amarnath. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the throat of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Mahamaya is worshipped alongside the protective Bhairava Trisandhyasvar."
    ],
    significance: [
      "Traditional Shakti Peetha #1 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Throat",
      "Devi: Maa Mahamaya · Bhairava: Trisandhyasvar"
    ],
    divineAttractions: [
      "Maa Mahamaya darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated throat, Devi name Maa Mahamaya and Bhairava Trisandhyasvar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 1,
    peethaBodyPart: "Throat",
    shaktiForm: "Maa Mahamaya",
    bhairava: "Trisandhyasvar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Amarnath; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Amarnath",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Amarnath, Anantnag, Jammu and Kashmir",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-02-phullara-attahasa",
    name: "Shakti Peetha — Maa Phullara",
    sanskrit: "Maa Phullara",
    city: "Attahasa",
    state: "West Bengal",
    district: "Birbhum",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Phullara (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-02-phullara-attahasa.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Phullara, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Attahasa. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the lower lip of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Phullara is worshipped alongside the protective Bhairava Vishwesh."
    ],
    significance: [
      "Traditional Shakti Peetha #2 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Lower lip",
      "Devi: Maa Phullara · Bhairava: Vishwesh"
    ],
    divineAttractions: [
      "Maa Phullara darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated lower lip, Devi name Maa Phullara and Bhairava Vishwesh."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 2,
    peethaBodyPart: "Lower lip",
    shaktiForm: "Maa Phullara",
    bhairava: "Vishwesh",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Attahasa; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Attahasa",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Attahasa, Birbhum, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-03-bahula-ketugram-bardhaman",
    name: "Shakti Peetha — Maa Bahula",
    sanskrit: "Maa Bahula",
    city: "Ketugram / Bardhaman",
    state: "West Bengal",
    district: "Purba Bardhaman",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Bahula (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-03-bahula-ketugram-bardhaman.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Bahula, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Ketugram / Bardhaman. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left arm of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Bahula is worshipped alongside the protective Bhairava Bhiruk."
    ],
    significance: [
      "Traditional Shakti Peetha #3 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left arm",
      "Devi: Maa Bahula · Bhairava: Bhiruk"
    ],
    divineAttractions: [
      "Maa Bahula darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left arm, Devi name Maa Bahula and Bhairava Bhiruk."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 3,
    peethaBodyPart: "Left arm",
    shaktiForm: "Maa Bahula",
    bhairava: "Bhiruk",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Ketugram / Bardhaman; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Ketugram / Bardhaman",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Ketugram / Bardhaman, Purba Bardhaman, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-04-mahishmardini-bakreshwar",
    name: "Shakti Peetha — Maa Mahishmardini",
    sanskrit: "Maa Mahishmardini",
    city: "Bakreshwar",
    state: "West Bengal",
    district: "Birbhum",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Mahishmardini (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-04-mahishmardini-bakreshwar.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Mahishmardini, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Bakreshwar. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the portion between the eyebrows of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Mahishmardini is worshipped alongside the protective Bhairava Vakranath."
    ],
    significance: [
      "Traditional Shakti Peetha #4 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Portion between the eyebrows",
      "Devi: Maa Mahishmardini · Bhairava: Vakranath"
    ],
    divineAttractions: [
      "Maa Mahishmardini darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated portion between the eyebrows, Devi name Maa Mahishmardini and Bhairava Vakranath."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 4,
    peethaBodyPart: "Portion between the eyebrows",
    shaktiForm: "Maa Mahishmardini",
    bhairava: "Vakranath",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Bakreshwar; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Bakreshwar",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Bakreshwar, Birbhum, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-05-avanti-bhairavparvat-ujjain",
    name: "Shakti Peetha — Maa Avanti",
    sanskrit: "Maa Avanti",
    city: "Bhairavparvat, Ujjain",
    state: "Madhya Pradesh",
    district: "Ujjain",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Avanti (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-05-avanti-bhairavparvat-ujjain.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Avanti, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Bhairavparvat, Ujjain. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the elbow / upper lip (debated) of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Avanti is worshipped alongside the protective Bhairava Lambakarna."
    ],
    significance: [
      "Traditional Shakti Peetha #5 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Elbow / upper lip (debated)",
      "Devi: Maa Avanti · Bhairava: Lambakarna"
    ],
    divineAttractions: [
      "Maa Avanti darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated elbow / upper lip (debated), Devi name Maa Avanti and Bhairava Lambakarna."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 5,
    peethaBodyPart: "Elbow / upper lip (debated)",
    shaktiForm: "Maa Avanti",
    bhairava: "Lambakarna",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions. This particular body-part attribution is explicitly debated in the source tradition.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Bhairavparvat, Ujjain; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Bhairavparvat, Ujjain",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Bhairavparvat, Ujjain, Ujjain, Madhya Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions. This particular body-part attribution is explicitly debated in the source tradition."
  },
  {
    slug: "shakti-peetha-06-aparna-bhavanipur",
    name: "Shakti Peetha — Maa Aparna",
    sanskrit: "Maa Aparna",
    city: "Bhavanipur",
    state: "Bangladesh",
    district: "Bogra",
    country: "Bangladesh",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Aparna (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-06-aparna-bhavanipur.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Aparna, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Bhavanipur. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the anklet / left chest / right eye (debated) of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Aparna is worshipped alongside the protective Bhairava Vaman."
    ],
    significance: [
      "Traditional Shakti Peetha #6 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Anklet / left chest / right eye (debated)",
      "Devi: Maa Aparna · Bhairava: Vaman"
    ],
    divineAttractions: [
      "Maa Aparna darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated anklet / left chest / right eye (debated), Devi name Maa Aparna and Bhairava Vaman."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 6,
    peethaBodyPart: "Anklet / left chest / right eye (debated)",
    shaktiForm: "Maa Aparna",
    bhairava: "Vaman",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions. This particular body-part attribution is explicitly debated in the source tradition.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Bhavanipur; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Bhavanipur",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Bhavanipur, Bogra, Bangladesh, Bangladesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions. This particular body-part attribution is explicitly debated in the source tradition."
  },
  {
    slug: "shakti-peetha-07-gandaki-chandi-chandi-river-gandaki-region",
    name: "Shakti Peetha — Gandaki Chandi",
    sanskrit: "Gandaki Chandi",
    city: "Chandi River / Gandaki region",
    state: "Nepal",
    district: "Mustang",
    country: "Nepal",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Gandaki Chandi (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-07-gandaki-chandi-chandi-river-gandaki-region.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Gandaki Chandi, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Chandi River / Gandaki region. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the cheek of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Gandaki Chandi is worshipped alongside the protective Bhairava Chakrapani."
    ],
    significance: [
      "Traditional Shakti Peetha #7 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Cheek",
      "Devi: Gandaki Chandi · Bhairava: Chakrapani"
    ],
    divineAttractions: [
      "Gandaki Chandi darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated cheek, Devi name Gandaki Chandi and Bhairava Chakrapani."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 7,
    peethaBodyPart: "Cheek",
    shaktiForm: "Gandaki Chandi",
    bhairava: "Chakrapani",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Chandi River / Gandaki region; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Chandi River / Gandaki region",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Chandi River / Gandaki region, Mustang, Nepal, Nepal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-08-bhramari-janasthaan-nashik",
    name: "Shakti Peetha — Maa Bhramari",
    sanskrit: "Maa Bhramari",
    city: "Janasthaan, Nashik",
    state: "Maharashtra",
    district: "Nashik",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Bhramari (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-08-bhramari-janasthaan-nashik.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Bhramari, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Janasthaan, Nashik. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the chin of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Bhramari is worshipped alongside the protective Bhairava Vikritaksh."
    ],
    significance: [
      "Traditional Shakti Peetha #8 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Chin",
      "Devi: Maa Bhramari · Bhairava: Vikritaksh"
    ],
    divineAttractions: [
      "Maa Bhramari darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated chin, Devi name Maa Bhramari and Bhairava Vikritaksh."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 8,
    peethaBodyPart: "Chin",
    shaktiForm: "Maa Bhramari",
    bhairava: "Vikritaksh",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Janasthaan, Nashik; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Janasthaan, Nashik",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Janasthaan, Nashik, Nashik, Maharashtra",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-09-hinglaj-hinglaj-balochistan",
    name: "Shakti Peetha — Mata Hinglaj",
    sanskrit: "Mata Hinglaj",
    city: "Hinglaj, Balochistan",
    state: "Pakistan",
    district: "Lasbela",
    country: "Pakistan",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Mata Hinglaj (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-09-hinglaj-hinglaj-balochistan.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Mata Hinglaj, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Hinglaj, Balochistan. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the head / brahmarandhra of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Mata Hinglaj is worshipped alongside the protective Bhairava Bhimalochana."
    ],
    significance: [
      "Traditional Shakti Peetha #9 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Head / Brahmarandhra",
      "Devi: Mata Hinglaj · Bhairava: Bhimalochana"
    ],
    divineAttractions: [
      "Mata Hinglaj darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated head / brahmarandhra, Devi name Mata Hinglaj and Bhairava Bhimalochana."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 9,
    peethaBodyPart: "Head / Brahmarandhra",
    shaktiForm: "Mata Hinglaj",
    bhairava: "Bhimalochana",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Hinglaj, Balochistan; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Hinglaj, Balochistan",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Hinglaj, Balochistan, Lasbela, Pakistan, Pakistan",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-10-jayanti-nartiang",
    name: "Shakti Peetha — Jayanti Shakti",
    sanskrit: "Jayanti Shakti",
    city: "Nartiang",
    state: "Meghalaya",
    district: "West Jaintia Hills",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Jayanti Shakti (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-10-jayanti-nartiang.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Jayanti Shakti, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Nartiang. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left thigh of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Jayanti Shakti is worshipped alongside the protective Bhairava Kamadishwar."
    ],
    significance: [
      "Traditional Shakti Peetha #10 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left thigh",
      "Devi: Jayanti Shakti · Bhairava: Kamadishwar"
    ],
    divineAttractions: [
      "Jayanti Shakti darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left thigh, Devi name Jayanti Shakti and Bhairava Kamadishwar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 10,
    peethaBodyPart: "Left thigh",
    shaktiForm: "Jayanti Shakti",
    bhairava: "Kamadishwar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Nartiang; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Nartiang",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Nartiang, West Jaintia Hills, Meghalaya",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-11-jeshoreshwari-satkhira-khulna-region",
    name: "Shakti Peetha — Jeshoreshwari",
    sanskrit: "Jeshoreshwari",
    city: "Satkhira / Khulna region",
    state: "Bangladesh",
    district: "Satkhira",
    country: "Bangladesh",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Jeshoreshwari (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-11-jeshoreshwari-satkhira-khulna-region.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Jeshoreshwari, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Satkhira / Khulna region. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the palm of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Jeshoreshwari is worshipped alongside the protective Bhairava Chanda."
    ],
    significance: [
      "Traditional Shakti Peetha #11 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Palm",
      "Devi: Jeshoreshwari · Bhairava: Chanda"
    ],
    divineAttractions: [
      "Jeshoreshwari darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated palm, Devi name Jeshoreshwari and Bhairava Chanda."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 11,
    peethaBodyPart: "Palm",
    shaktiForm: "Jeshoreshwari",
    bhairava: "Chanda",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Satkhira / Khulna region; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Satkhira / Khulna region",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Satkhira / Khulna region, Satkhira, Bangladesh, Bangladesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-12-jwala-siddhida-jwalamukhi-kangra",
    name: "Shakti Peetha — Siddhida",
    sanskrit: "Siddhida",
    city: "Jwalamukhi, Kangra",
    state: "Himachal Pradesh",
    district: "Kangra",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Siddhida (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-12-jwala-siddhida-jwalamukhi-kangra.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Siddhida, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Jwalamukhi, Kangra. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the tongue of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Siddhida is worshipped alongside the protective Bhairava Unmatta Bhairava."
    ],
    significance: [
      "Traditional Shakti Peetha #12 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Tongue",
      "Devi: Siddhida · Bhairava: Unmatta Bhairava"
    ],
    divineAttractions: [
      "Siddhida darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated tongue, Devi name Siddhida and Bhairava Unmatta Bhairava."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 12,
    peethaBodyPart: "Tongue",
    shaktiForm: "Siddhida",
    bhairava: "Unmatta Bhairava",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Jwalamukhi, Kangra; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Jwalamukhi, Kangra",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Jwalamukhi, Kangra, Kangra, Himachal Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-13-dakshina-kali-kalighat-kolkata",
    name: "Shakti Peetha — Dakshina Kali",
    sanskrit: "Dakshina Kali",
    city: "Kalighat, Kolkata",
    state: "West Bengal",
    district: "Kolkata",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Dakshina Kali (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-13-dakshina-kali-kalighat-kolkata.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Dakshina Kali, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Kalighat, Kolkata. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right toes of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Dakshina Kali is worshipped alongside the protective Bhairava Nakuleshwar."
    ],
    significance: [
      "Traditional Shakti Peetha #13 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right toes",
      "Devi: Dakshina Kali · Bhairava: Nakuleshwar"
    ],
    divineAttractions: [
      "Dakshina Kali darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right toes, Devi name Dakshina Kali and Bhairava Nakuleshwar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 13,
    peethaBodyPart: "Right toes",
    shaktiForm: "Dakshina Kali",
    bhairava: "Nakuleshwar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Kalighat, Kolkata; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Kalighat, Kolkata",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Kalighat, Kolkata, Kolkata, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-14-kalmadhav-amarkantak",
    name: "Shakti Peetha — Kalmadhava",
    sanskrit: "Kalmadhava",
    city: "Amarkantak",
    state: "Madhya Pradesh",
    district: "Anuppur",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Kalmadhava (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-14-kalmadhav-amarkantak.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Kalmadhava, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Amarkantak. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left buttock of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Kalmadhava is worshipped alongside the protective Bhairava Asitananda."
    ],
    significance: [
      "Traditional Shakti Peetha #14 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left buttock",
      "Devi: Kalmadhava · Bhairava: Asitananda"
    ],
    divineAttractions: [
      "Kalmadhava darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left buttock, Devi name Kalmadhava and Bhairava Asitananda."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 14,
    peethaBodyPart: "Left buttock",
    shaktiForm: "Kalmadhava",
    bhairava: "Asitananda",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Amarkantak; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Amarkantak",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Amarkantak, Anuppur, Madhya Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-15-kamakhya-guwahati-nilachal-hill",
    name: "Shakti Peetha — Maa Kamakhya",
    sanskrit: "Maa Kamakhya",
    city: "Guwahati / Nilachal Hill",
    state: "Assam",
    district: "Kamrup Metropolitan",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Kamakhya (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-15-kamakhya-guwahati-nilachal-hill.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Kamakhya, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Guwahati / Nilachal Hill. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the yoni of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Kamakhya is worshipped alongside the protective Bhairava —."
    ],
    significance: [
      "Traditional Shakti Peetha #15 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Yoni",
      "Devi: Maa Kamakhya · Bhairava: —"
    ],
    divineAttractions: [
      "Maa Kamakhya darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated yoni, Devi name Maa Kamakhya and Bhairava —."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 15,
    peethaBodyPart: "Yoni",
    shaktiForm: "Maa Kamakhya",
    bhairava: "—",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Guwahati / Nilachal Hill; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Guwahati / Nilachal Hill",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Guwahati / Nilachal Hill, Kamrup Metropolitan, Assam",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-16-devgarbha-kankleshwari-kankalitala-region",
    name: "Shakti Peetha — Devgarbha",
    sanskrit: "Devgarbha",
    city: "Kankalitala region",
    state: "West Bengal",
    district: "Birbhum",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Devgarbha (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-16-devgarbha-kankleshwari-kankalitala-region.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Devgarbha, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Kankalitala region. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the bones of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Devgarbha is worshipped alongside the protective Bhairava Ruru."
    ],
    significance: [
      "Traditional Shakti Peetha #16 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Bones",
      "Devi: Devgarbha · Bhairava: Ruru"
    ],
    divineAttractions: [
      "Devgarbha darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated bones, Devi name Devgarbha and Bhairava Ruru."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 16,
    peethaBodyPart: "Bones",
    shaktiForm: "Devgarbha",
    bhairava: "Ruru",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Kankalitala region; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Kankalitala region",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Kankalitala region, Birbhum, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-17-sravani-kanyakumari",
    name: "Shakti Peetha — Sravani",
    sanskrit: "Sravani",
    city: "Kanyakumari",
    state: "Tamil Nadu",
    district: "Kanyakumari",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Sravani (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-17-sravani-kanyakumari.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Sravani, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Kanyakumari. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the back and spine of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Sravani is worshipped alongside the protective Bhairava Nimish."
    ],
    significance: [
      "Traditional Shakti Peetha #17 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Back and spine",
      "Devi: Sravani · Bhairava: Nimish"
    ],
    divineAttractions: [
      "Sravani darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated back and spine, Devi name Sravani and Bhairava Nimish."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 17,
    peethaBodyPart: "Back and spine",
    shaktiForm: "Sravani",
    bhairava: "Nimish",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Kanyakumari; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Kanyakumari",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Kanyakumari, Kanyakumari, Tamil Nadu",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-18-chamudeshwari-jaya-durga-chamundi-hills-mysuru",
    name: "Shakti Peetha — Chamundeshwari",
    sanskrit: "Chamundeshwari",
    city: "Chamundi Hills, Mysuru",
    state: "Karnataka",
    district: "Mysuru",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Chamundeshwari (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-18-chamudeshwari-jaya-durga-chamundi-hills-mysuru.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Chamundeshwari, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Chamundi Hills, Mysuru. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the hair of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Chamundeshwari is worshipped alongside the protective Bhairava Bheeshan Bhairava."
    ],
    significance: [
      "Traditional Shakti Peetha #18 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Hair",
      "Devi: Chamundeshwari · Bhairava: Bheeshan Bhairava"
    ],
    divineAttractions: [
      "Chamundeshwari darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated hair, Devi name Chamundeshwari and Bhairava Bheeshan Bhairava."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 18,
    peethaBodyPart: "Hair",
    shaktiForm: "Chamundeshwari",
    bhairava: "Bheeshan Bhairava",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Chamundi Hills, Mysuru; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Chamundi Hills, Mysuru",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Chamundi Hills, Mysuru, Mysuru, Karnataka",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-19-vimla-kiriteshwari-murshidabad",
    name: "Shakti Peetha — Vimla / Kiriteshwari",
    sanskrit: "Vimla / Kiriteshwari",
    city: "Murshidabad",
    state: "West Bengal",
    district: "Murshidabad",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Vimla / Kiriteshwari (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-19-vimla-kiriteshwari-murshidabad.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Vimla / Kiriteshwari, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Murshidabad. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the crown of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Vimla / Kiriteshwari is worshipped alongside the protective Bhairava Samvarta."
    ],
    significance: [
      "Traditional Shakti Peetha #19 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Crown",
      "Devi: Vimla / Kiriteshwari · Bhairava: Samvarta"
    ],
    divineAttractions: [
      "Vimla / Kiriteshwari darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated crown, Devi name Vimla / Kiriteshwari and Bhairava Samvarta."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 19,
    peethaBodyPart: "Crown",
    shaktiForm: "Vimla / Kiriteshwari",
    bhairava: "Samvarta",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Murshidabad; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Murshidabad",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Murshidabad, Murshidabad, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-20-kumari-anandamayee-temple-region",
    name: "Shakti Peetha — Kumari",
    sanskrit: "Kumari",
    city: "Anandamayee Temple region",
    state: "West Bengal",
    district: "Hooghly",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Kumari (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-20-kumari-anandamayee-temple-region.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Kumari, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Anandamayee Temple region. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right shoulder of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Kumari is worshipped alongside the protective Bhairava Bhairava."
    ],
    significance: [
      "Traditional Shakti Peetha #20 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right shoulder",
      "Devi: Kumari · Bhairava: Bhairava"
    ],
    divineAttractions: [
      "Kumari darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right shoulder, Devi name Kumari and Bhairava Bhairava."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 20,
    peethaBodyPart: "Right shoulder",
    shaktiForm: "Kumari",
    bhairava: "Bhairava",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Anandamayee Temple region; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Anandamayee Temple region",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Anandamayee Temple region, Hooghly, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-21-bhramri-bodaganj-jalpaiguri",
    name: "Shakti Peetha — Bhraamri Devi",
    sanskrit: "Bhraamri Devi",
    city: "Bodaganj, Jalpaiguri",
    state: "West Bengal",
    district: "Jalpaiguri",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Bhraamri Devi (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-21-bhramri-bodaganj-jalpaiguri.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Bhraamri Devi, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Bodaganj, Jalpaiguri. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left leg of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Bhraamri Devi is worshipped alongside the protective Bhairava Iswar."
    ],
    significance: [
      "Traditional Shakti Peetha #21 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left leg",
      "Devi: Bhraamri Devi · Bhairava: Iswar"
    ],
    divineAttractions: [
      "Bhraamri Devi darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left leg, Devi name Bhraamri Devi and Bhairava Iswar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 21,
    peethaBodyPart: "Left leg",
    shaktiForm: "Bhraamri Devi",
    bhairava: "Iswar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Bodaganj, Jalpaiguri; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Bodaganj, Jalpaiguri",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Bodaganj, Jalpaiguri, Jalpaiguri, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-22-dakshayani-manasa-manasarovar",
    name: "Shakti Peetha — Dakshayani / Manasa",
    sanskrit: "Dakshayani / Manasa",
    city: "Manasarovar",
    state: "Tibet",
    district: "Ngari / Burang",
    country: "Tibet",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Dakshayani / Manasa (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-22-dakshayani-manasa-manasarovar.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Dakshayani / Manasa, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Manasarovar. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right hand of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Dakshayani / Manasa is worshipped alongside the protective Bhairava Amar."
    ],
    significance: [
      "Traditional Shakti Peetha #22 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right hand",
      "Devi: Dakshayani / Manasa · Bhairava: Amar"
    ],
    divineAttractions: [
      "Dakshayani / Manasa darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right hand, Devi name Dakshayani / Manasa and Bhairava Amar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 22,
    peethaBodyPart: "Right hand",
    shaktiForm: "Dakshayani / Manasa",
    bhairava: "Amar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Manasarovar; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Manasarovar",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Manasarovar, Ngari / Burang, Tibet, Tibet",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-23-gayatri-manibandh-pushkar",
    name: "Shakti Peetha — Gayatri / Chamunda",
    sanskrit: "Gayatri / Chamunda",
    city: "Pushkar",
    state: "Rajasthan",
    district: "Ajmer",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Gayatri / Chamunda (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-23-gayatri-manibandh-pushkar.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Gayatri / Chamunda, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Pushkar. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the wrist / bracelet of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Gayatri / Chamunda is worshipped alongside the protective Bhairava Sharvananda."
    ],
    significance: [
      "Traditional Shakti Peetha #23 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Wrist / bracelet",
      "Devi: Gayatri / Chamunda · Bhairava: Sharvananda"
    ],
    divineAttractions: [
      "Gayatri / Chamunda darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated wrist / bracelet, Devi name Gayatri / Chamunda and Bhairava Sharvananda."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 23,
    peethaBodyPart: "Wrist / bracelet",
    shaktiForm: "Gayatri / Chamunda",
    bhairava: "Sharvananda",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Pushkar; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Pushkar",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Pushkar, Ajmer, Rajasthan",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-24-uma-mithila-india-nepal-border",
    name: "Shakti Peetha — Uma Devi",
    sanskrit: "Uma Devi",
    city: "Mithila, India–Nepal border",
    state: "Bihar",
    district: "Darbhanga",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Uma Devi (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-24-uma-mithila-india-nepal-border.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Uma Devi, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Mithila, India–Nepal border. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left shoulder of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Uma Devi is worshipped alongside the protective Bhairava Mahodar."
    ],
    significance: [
      "Traditional Shakti Peetha #24 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left shoulder",
      "Devi: Uma Devi · Bhairava: Mahodar"
    ],
    divineAttractions: [
      "Uma Devi darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left shoulder, Devi name Uma Devi and Bhairava Mahodar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 24,
    peethaBodyPart: "Left shoulder",
    shaktiForm: "Uma Devi",
    bhairava: "Mahodar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Mithila, India–Nepal border; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Mithila, India–Nepal border",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Mithila, India–Nepal border, Darbhanga, Bihar",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-25-nagapooshani-nainativu-jaffna",
    name: "Shakti Peetha — Nagapooshani",
    sanskrit: "Nagapooshani",
    city: "Nainativu, Jaffna",
    state: "Sri Lanka",
    district: "Jaffna",
    country: "Sri Lanka",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Nagapooshani (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-25-nagapooshani-nainativu-jaffna.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Nagapooshani, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Nainativu, Jaffna. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the anklets of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Nagapooshani is worshipped alongside the protective Bhairava Nayinaar."
    ],
    significance: [
      "Traditional Shakti Peetha #25 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Anklets",
      "Devi: Nagapooshani · Bhairava: Nayinaar"
    ],
    divineAttractions: [
      "Nagapooshani darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated anklets, Devi name Nagapooshani and Bhairava Nayinaar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 25,
    peethaBodyPart: "Anklets",
    shaktiForm: "Nagapooshani",
    bhairava: "Nayinaar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Nainativu, Jaffna; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Nainativu, Jaffna",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Nainativu, Jaffna, Jaffna, Sri Lanka, Sri Lanka",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-26-mahashira-guhyeshwari-kathmandu",
    name: "Shakti Peetha — Mahashira",
    sanskrit: "Mahashira",
    city: "Guhyeshwari, Kathmandu",
    state: "Nepal",
    district: "Kathmandu",
    country: "Nepal",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Mahashira (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-26-mahashira-guhyeshwari-kathmandu.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Mahashira, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Guhyeshwari, Kathmandu. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the hips of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Mahashira is worshipped alongside the protective Bhairava Kapali."
    ],
    significance: [
      "Traditional Shakti Peetha #26 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Hips",
      "Devi: Mahashira · Bhairava: Kapali"
    ],
    divineAttractions: [
      "Mahashira darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated hips, Devi name Mahashira and Bhairava Kapali."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 26,
    peethaBodyPart: "Hips",
    shaktiForm: "Mahashira",
    bhairava: "Kapali",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Guhyeshwari, Kathmandu; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Guhyeshwari, Kathmandu",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Guhyeshwari, Kathmandu, Kathmandu, Nepal, Nepal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-27-bhavani-chandranath-hills",
    name: "Shakti Peetha — Bhavani",
    sanskrit: "Bhavani",
    city: "Chandranath Hills",
    state: "Bangladesh",
    district: "Chittagong",
    country: "Bangladesh",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Bhavani (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-27-bhavani-chandranath-hills.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Bhavani, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Chandranath Hills. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right arm of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Bhavani is worshipped alongside the protective Bhairava Chandrashekhar."
    ],
    significance: [
      "Traditional Shakti Peetha #27 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right arm",
      "Devi: Bhavani · Bhairava: Chandrashekhar"
    ],
    divineAttractions: [
      "Bhavani darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right arm, Devi name Bhavani and Bhairava Chandrashekhar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 27,
    peethaBodyPart: "Right arm",
    shaktiForm: "Bhavani",
    bhairava: "Chandrashekhar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Chandranath Hills; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Chandranath Hills",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Chandranath Hills, Chittagong, Bangladesh, Bangladesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-28-varahi-panch-sagar",
    name: "Shakti Peetha — Varahi",
    sanskrit: "Varahi",
    city: "Panch Sagar",
    state: "Uttar Pradesh",
    district: "Varanasi",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Varahi (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-28-varahi-panch-sagar.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Varahi, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Panch Sagar. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the lower teeth of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Varahi is worshipped alongside the protective Bhairava Maharudra."
    ],
    significance: [
      "Traditional Shakti Peetha #28 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Lower teeth",
      "Devi: Varahi · Bhairava: Maharudra"
    ],
    divineAttractions: [
      "Varahi darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated lower teeth, Devi name Varahi and Bhairava Maharudra."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 28,
    peethaBodyPart: "Lower teeth",
    shaktiForm: "Varahi",
    bhairava: "Maharudra",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Panch Sagar; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Panch Sagar",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Panch Sagar, Varanasi, Uttar Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-29-chandrabhaga-junagadh",
    name: "Shakti Peetha — Chandrabagha",
    sanskrit: "Chandrabagha",
    city: "Junagadh",
    state: "Gujarat",
    district: "Junagadh",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Chandrabagha (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-29-chandrabhaga-junagadh.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Chandrabagha, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Junagadh. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the stomach of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Chandrabagha is worshipped alongside the protective Bhairava Vakratund."
    ],
    significance: [
      "Traditional Shakti Peetha #29 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Stomach",
      "Devi: Chandrabagha · Bhairava: Vakratund"
    ],
    divineAttractions: [
      "Chandrabagha darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated stomach, Devi name Chandrabagha and Bhairava Vakratund."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 29,
    peethaBodyPart: "Stomach",
    shaktiForm: "Chandrabagha",
    bhairava: "Vakratund",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Junagadh; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Junagadh",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Junagadh, Junagadh, Gujarat",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-30-lalita-prayag-prayagraj",
    name: "Shakti Peetha — Lalita",
    sanskrit: "Lalita",
    city: "Prayag / Prayagraj",
    state: "Uttar Pradesh",
    district: "Prayagraj",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Lalita (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-30-lalita-prayag-prayagraj.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Lalita, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Prayag / Prayagraj. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the fingers of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Lalita is worshipped alongside the protective Bhairava Benimadhav."
    ],
    significance: [
      "Traditional Shakti Peetha #30 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Fingers",
      "Devi: Lalita · Bhairava: Benimadhav"
    ],
    divineAttractions: [
      "Lalita darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated fingers, Devi name Lalita and Bhairava Benimadhav."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 30,
    peethaBodyPart: "Fingers",
    shaktiForm: "Lalita",
    bhairava: "Benimadhav",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Prayag / Prayagraj; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Prayag / Prayagraj",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Prayag / Prayagraj, Prayagraj, Uttar Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-31-savitri-bhadra-kali-kurukshetra",
    name: "Shakti Peetha — Savitri / Bhadra Kali",
    sanskrit: "Savitri / Bhadra Kali",
    city: "Kurukshetra",
    state: "Haryana",
    district: "Kurukshetra",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Savitri / Bhadra Kali (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-31-savitri-bhadra-kali-kurukshetra.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Savitri / Bhadra Kali, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Kurukshetra. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right ankle of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Savitri / Bhadra Kali is worshipped alongside the protective Bhairava Sthanu Mahadev."
    ],
    significance: [
      "Traditional Shakti Peetha #31 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right ankle",
      "Devi: Savitri / Bhadra Kali · Bhairava: Sthanu Mahadev"
    ],
    divineAttractions: [
      "Savitri / Bhadra Kali darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right ankle, Devi name Savitri / Bhadra Kali and Bhairava Sthanu Mahadev."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 31,
    peethaBodyPart: "Right ankle",
    shaktiForm: "Savitri / Bhadra Kali",
    bhairava: "Sthanu Mahadev",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Kurukshetra; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Kurukshetra",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Kurukshetra, Kurukshetra, Haryana",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-32-maihar-shivani-maihar",
    name: "Shakti Peetha — Maihar / Shivani",
    sanskrit: "Maihar / Shivani",
    city: "Maihar",
    state: "Madhya Pradesh",
    district: "Satna",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maihar / Shivani (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-32-maihar-shivani-maihar.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maihar / Shivani, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Maihar. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the breast of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maihar / Shivani is worshipped alongside the protective Bhairava Canda."
    ],
    significance: [
      "Traditional Shakti Peetha #32 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Breast",
      "Devi: Maihar / Shivani · Bhairava: Canda"
    ],
    divineAttractions: [
      "Maihar / Shivani darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated breast, Devi name Maihar / Shivani and Bhairava Canda."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 32,
    peethaBodyPart: "Breast",
    shaktiForm: "Maihar / Shivani",
    bhairava: "Canda",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Maihar; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Maihar",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Maihar, Satna, Madhya Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-33-nandini-nandikeshwari-nandikeshwari-birbhum",
    name: "Shakti Peetha — Nandini",
    sanskrit: "Nandini",
    city: "Nandikeshwari, Birbhum",
    state: "West Bengal",
    district: "Birbhum",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Nandini (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-33-nandini-nandikeshwari-nandikeshwari-birbhum.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Nandini, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Nandikeshwari, Birbhum. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the necklace of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Nandini is worshipped alongside the protective Bhairava Nandikeshwar."
    ],
    significance: [
      "Traditional Shakti Peetha #33 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Necklace",
      "Devi: Nandini · Bhairava: Nandikeshwar"
    ],
    divineAttractions: [
      "Nandini darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated necklace, Devi name Nandini and Bhairava Nandikeshwar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 33,
    peethaBodyPart: "Necklace",
    shaktiForm: "Nandini",
    bhairava: "Nandikeshwar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Nandikeshwari, Birbhum; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Nandikeshwari, Birbhum",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Nandikeshwari, Birbhum, Birbhum, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-34-sarvashail-rakini-kotilingeswar-region-godavari",
    name: "Shakti Peetha — Vishweshwari / Rakini / Viswamatuka",
    sanskrit: "Vishweshwari / Rakini / Viswamatuka",
    city: "Kotilingeswar region, Godavari",
    state: "Andhra Pradesh",
    district: "East Godavari",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Vishweshwari / Rakini / Viswamatuka (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-34-sarvashail-rakini-kotilingeswar-region-godavari.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Vishweshwari / Rakini / Viswamatuka, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Kotilingeswar region, Godavari. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left cheek of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Vishweshwari / Rakini / Viswamatuka is worshipped alongside the protective Bhairava Vatsnabh / Dandapani."
    ],
    significance: [
      "Traditional Shakti Peetha #34 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left cheek",
      "Devi: Vishweshwari / Rakini / Viswamatuka · Bhairava: Vatsnabh / Dandapani"
    ],
    divineAttractions: [
      "Vishweshwari / Rakini / Viswamatuka darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left cheek, Devi name Vishweshwari / Rakini / Viswamatuka and Bhairava Vatsnabh / Dandapani."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 34,
    peethaBodyPart: "Left cheek",
    shaktiForm: "Vishweshwari / Rakini / Viswamatuka",
    bhairava: "Vatsnabh / Dandapani",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Kotilingeswar region, Godavari; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Kotilingeswar region, Godavari",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Kotilingeswar region, Godavari, East Godavari, Andhra Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-35-mahishasuramardini-shivaharkaray-karachi",
    name: "Shakti Peetha — Mahishasuramardini",
    sanskrit: "Mahishasuramardini",
    city: "Shivaharkaray, Karachi",
    state: "Pakistan",
    district: "Karachi",
    country: "Pakistan",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Mahishasuramardini (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-35-mahishasuramardini-shivaharkaray-karachi.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Mahishasuramardini, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Shivaharkaray, Karachi. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the third eye of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Mahishasuramardini is worshipped alongside the protective Bhairava Krodish."
    ],
    significance: [
      "Traditional Shakti Peetha #35 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Third eye",
      "Devi: Mahishasuramardini · Bhairava: Krodish"
    ],
    divineAttractions: [
      "Mahishasuramardini darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated third eye, Devi name Mahishasuramardini and Bhairava Krodish."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 35,
    peethaBodyPart: "Third eye",
    shaktiForm: "Mahishasuramardini",
    bhairava: "Krodish",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Shivaharkaray, Karachi; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Shivaharkaray, Karachi",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Shivaharkaray, Karachi, Karachi, Pakistan, Pakistan",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-36-narmada-shondesh-amarkantak",
    name: "Shakti Peetha — Narmada",
    sanskrit: "Narmada",
    city: "Amarkantak",
    state: "Madhya Pradesh",
    district: "Anuppur",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Narmada (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-36-narmada-shondesh-amarkantak.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Narmada, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Amarkantak. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right buttock of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Narmada is worshipped alongside the protective Bhairava Bhadrasen."
    ],
    significance: [
      "Traditional Shakti Peetha #36 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right buttock",
      "Devi: Narmada · Bhairava: Bhadrasen"
    ],
    divineAttractions: [
      "Narmada darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right buttock, Devi name Narmada and Bhairava Bhadrasen."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 36,
    peethaBodyPart: "Right buttock",
    shaktiForm: "Narmada",
    bhairava: "Bhadrasen",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Amarkantak; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Amarkantak",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Amarkantak, Anuppur, Madhya Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-37-bhramaramba-srisundari-srisailam",
    name: "Shakti Peetha — Bhramaramba Devi / SriSundari",
    sanskrit: "Bhramaramba Devi / SriSundari",
    city: "Srisailam",
    state: "Andhra Pradesh",
    district: "Nandyal",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Bhramaramba Devi / SriSundari (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-37-bhramaramba-srisundari-srisailam.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Bhramaramba Devi / SriSundari, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Srisailam. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right anklet of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Bhramaramba Devi / SriSundari is worshipped alongside the protective Bhairava Sundarananda."
    ],
    significance: [
      "Traditional Shakti Peetha #37 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right anklet",
      "Devi: Bhramaramba Devi / SriSundari · Bhairava: Sundarananda"
    ],
    divineAttractions: [
      "Bhramaramba Devi / SriSundari darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right anklet, Devi name Bhramaramba Devi / SriSundari and Bhairava Sundarananda."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 37,
    peethaBodyPart: "Right anklet",
    shaktiForm: "Bhramaramba Devi / SriSundari",
    bhairava: "Sundarananda",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Srisailam; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Srisailam",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Srisailam, Nandyal, Andhra Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-38-maha-lakshmi-sri-shail-sylhet-region",
    name: "Shakti Peetha — Mahalaksmi",
    sanskrit: "Mahalaksmi",
    city: "Sri Shail / Sylhet region",
    state: "Bangladesh",
    district: "Sylhet",
    country: "Bangladesh",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Mahalaksmi (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-38-maha-lakshmi-sri-shail-sylhet-region.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Mahalaksmi, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Sri Shail / Sylhet region. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the neck of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Mahalaksmi is worshipped alongside the protective Bhairava Sambaranand."
    ],
    significance: [
      "Traditional Shakti Peetha #38 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Neck",
      "Devi: Mahalaksmi · Bhairava: Sambaranand"
    ],
    divineAttractions: [
      "Mahalaksmi darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated neck, Devi name Mahalaksmi and Bhairava Sambaranand."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 38,
    peethaBodyPart: "Neck",
    shaktiForm: "Mahalaksmi",
    bhairava: "Sambaranand",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Sri Shail / Sylhet region; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Sri Shail / Sylhet region",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Sri Shail / Sylhet region, Sylhet, Bangladesh, Bangladesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-39-narayani-suchindram-kanyakumari-region",
    name: "Shakti Peetha — Maa Narayani / Kanya Kumari / Bhagavathy Amman",
    sanskrit: "Maa Narayani / Kanya Kumari / Bhagavathy Amman",
    city: "Suchindram / Kanyakumari region",
    state: "Tamil Nadu",
    district: "Kanyakumari",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Maa Narayani / Kanya Kumari / Bhagavathy Amman (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-39-narayani-suchindram-kanyakumari-region.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Maa Narayani / Kanya Kumari / Bhagavathy Amman, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Suchindram / Kanyakumari region. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the upper teeth of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Maa Narayani / Kanya Kumari / Bhagavathy Amman is worshipped alongside the protective Bhairava Sangharor Samhara."
    ],
    significance: [
      "Traditional Shakti Peetha #39 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Upper teeth",
      "Devi: Maa Narayani / Kanya Kumari / Bhagavathy Amman · Bhairava: Sangharor Samhara"
    ],
    divineAttractions: [
      "Maa Narayani / Kanya Kumari / Bhagavathy Amman darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated upper teeth, Devi name Maa Narayani / Kanya Kumari / Bhagavathy Amman and Bhairava Sangharor Samhara."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 39,
    peethaBodyPart: "Upper teeth",
    shaktiForm: "Maa Narayani / Kanya Kumari / Bhagavathy Amman",
    bhairava: "Sangharor Samhara",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Suchindram / Kanyakumari region; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Suchindram / Kanyakumari region",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Suchindram / Kanyakumari region, Kanyakumari, Tamil Nadu",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-40-sugandha-shikarpur-barishal",
    name: "Shakti Peetha — Sunanda",
    sanskrit: "Sunanda",
    city: "Shikarpur, Barishal",
    state: "Bangladesh",
    district: "Barishal",
    country: "Bangladesh",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Sunanda (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-40-sugandha-shikarpur-barishal.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Sunanda, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Shikarpur, Barishal. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the nose of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Sunanda is worshipped alongside the protective Bhairava Traimbak."
    ],
    significance: [
      "Traditional Shakti Peetha #40 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Nose",
      "Devi: Sunanda · Bhairava: Traimbak"
    ],
    divineAttractions: [
      "Sunanda darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated nose, Devi name Sunanda and Bhairava Traimbak."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 40,
    peethaBodyPart: "Nose",
    shaktiForm: "Sunanda",
    bhairava: "Traimbak",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Shikarpur, Barishal; local access conditions should be checked before travel."
      },
      {
        mode: "Travel planning",
        detail: "Cross-border, permit, ferry or local access rules can apply; verify current requirements before departure."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Shikarpur, Barishal",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Shikarpur, Barishal, Barishal, Bangladesh, Bangladesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-41-tripura-sundari-udaipur-tripura",
    name: "Shakti Peetha — Tripura Sundari",
    sanskrit: "Tripura Sundari",
    city: "Udaipur, Tripura",
    state: "Tripura",
    district: "Gomati",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Tripura Sundari (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-41-tripura-sundari-udaipur-tripura.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Tripura Sundari, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Udaipur, Tripura. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right foot of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Tripura Sundari is worshipped alongside the protective Bhairava Tripuresh."
    ],
    significance: [
      "Traditional Shakti Peetha #41 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right foot",
      "Devi: Tripura Sundari · Bhairava: Tripuresh"
    ],
    divineAttractions: [
      "Tripura Sundari darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right foot, Devi name Tripura Sundari and Bhairava Tripuresh."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 41,
    peethaBodyPart: "Right foot",
    shaktiForm: "Tripura Sundari",
    bhairava: "Tripuresh",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Udaipur, Tripura; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Udaipur, Tripura",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Udaipur, Tripura, Gomati, Tripura",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-42-mangal-chandi-ujaani",
    name: "Shakti Peetha — Mangal Chandika",
    sanskrit: "Mangal Chandika",
    city: "Ujaani",
    state: "West Bengal",
    district: "Purba Bardhaman",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Mangal Chandika (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-42-mangal-chandi-ujaani.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Mangal Chandika, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Ujaani. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the right wrist of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Mangal Chandika is worshipped alongside the protective Bhairava Kapilambar."
    ],
    significance: [
      "Traditional Shakti Peetha #42 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Right wrist",
      "Devi: Mangal Chandika · Bhairava: Kapilambar"
    ],
    divineAttractions: [
      "Mangal Chandika darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated right wrist, Devi name Mangal Chandika and Bhairava Kapilambar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 42,
    peethaBodyPart: "Right wrist",
    shaktiForm: "Mangal Chandika",
    bhairava: "Kapilambar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Ujaani; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Ujaani",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Ujaani, Purba Bardhaman, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-43-vishalakshi-varanasi",
    name: "Shakti Peetha — Vishalakshi",
    sanskrit: "Vishalakshi",
    city: "Varanasi",
    state: "Uttar Pradesh",
    district: "Varanasi",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Vishalakshi (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-43-vishalakshi-varanasi.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Vishalakshi, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Varanasi. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the earring of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Vishalakshi is worshipped alongside the protective Bhairava Kaal Bhairava."
    ],
    significance: [
      "Traditional Shakti Peetha #43 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Earring",
      "Devi: Vishalakshi · Bhairava: Kaal Bhairava"
    ],
    divineAttractions: [
      "Vishalakshi darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated earring, Devi name Vishalakshi and Bhairava Kaal Bhairava."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 43,
    peethaBodyPart: "Earring",
    shaktiForm: "Vishalakshi",
    bhairava: "Kaal Bhairava",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Varanasi; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Varanasi",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Varanasi, Varanasi, Uttar Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-44-kapalini-vibash-medinipur-region",
    name: "Shakti Peetha — Kapalini / Kali Maa",
    sanskrit: "Kapalini / Kali Maa",
    city: "Vibash / Medinipur region",
    state: "West Bengal",
    district: "Purba Medinipur",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Kapalini / Kali Maa (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-44-kapalini-vibash-medinipur-region.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Kapalini / Kali Maa, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Vibash / Medinipur region. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left ankle of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Kapalini / Kali Maa is worshipped alongside the protective Bhairava Sarvananda."
    ],
    significance: [
      "Traditional Shakti Peetha #44 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left ankle",
      "Devi: Kapalini / Kali Maa · Bhairava: Sarvananda"
    ],
    divineAttractions: [
      "Kapalini / Kali Maa darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left ankle, Devi name Kapalini / Kali Maa and Bhairava Sarvananda."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 44,
    peethaBodyPart: "Left ankle",
    shaktiForm: "Kapalini / Kali Maa",
    bhairava: "Sarvananda",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Vibash / Medinipur region; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Vibash / Medinipur region",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Vibash / Medinipur region, Purba Medinipur, West Bengal",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-45-ambika-bharatpur",
    name: "Shakti Peetha — Ambika",
    sanskrit: "Ambika",
    city: "Bharatpur",
    state: "Rajasthan",
    district: "Bharatpur",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Ambika (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-45-ambika-bharatpur.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Ambika, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Bharatpur. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left leg of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Ambika is worshipped alongside the protective Bhairava Amriteshwar."
    ],
    significance: [
      "Traditional Shakti Peetha #45 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left leg",
      "Devi: Ambika · Bhairava: Amriteshwar"
    ],
    divineAttractions: [
      "Ambika darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left leg, Devi name Ambika and Bhairava Amriteshwar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 45,
    peethaBodyPart: "Left leg",
    shaktiForm: "Ambika",
    bhairava: "Amriteshwar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Bharatpur; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Bharatpur",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Bharatpur, Bharatpur, Rajasthan",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-46-uma-vrindavan-bhuteshwar",
    name: "Shakti Peetha — Uma",
    sanskrit: "Uma",
    city: "Vrindavan / Bhuteshwar",
    state: "Uttar Pradesh",
    district: "Mathura",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Uma (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-46-uma-vrindavan-bhuteshwar.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Uma, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Vrindavan / Bhuteshwar. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the hair of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Uma is worshipped alongside the protective Bhairava Bhuteshwar."
    ],
    significance: [
      "Traditional Shakti Peetha #46 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Hair",
      "Devi: Uma · Bhairava: Bhuteshwar"
    ],
    divineAttractions: [
      "Uma darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated hair, Devi name Uma and Bhairava Bhuteshwar."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 46,
    peethaBodyPart: "Hair",
    shaktiForm: "Uma",
    bhairava: "Bhuteshwar",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Vrindavan / Bhuteshwar; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Vrindavan / Bhuteshwar",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Vrindavan / Bhuteshwar, Mathura, Uttar Pradesh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-47-tripurmalini-jalandhar",
    name: "Shakti Peetha — Tripuramalini",
    sanskrit: "Tripuramalini",
    city: "Jalandhar",
    state: "Punjab",
    district: "Jalandhar",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Tripuramalini (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-47-tripurmalini-jalandhar.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Tripuramalini, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Jalandhar. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the left breast of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Tripuramalini is worshipped alongside the protective Bhairava Bhishan."
    ],
    significance: [
      "Traditional Shakti Peetha #47 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Left breast",
      "Devi: Tripuramalini · Bhairava: Bhishan"
    ],
    divineAttractions: [
      "Tripuramalini darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated left breast, Devi name Tripuramalini and Bhairava Bhishan."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 47,
    peethaBodyPart: "Left breast",
    shaktiForm: "Tripuramalini",
    bhairava: "Bhishan",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Jalandhar; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Jalandhar",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Jalandhar, Jalandhar, Punjab",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-48-amba-ambaji",
    name: "Shakti Peetha — Amba",
    sanskrit: "Amba",
    city: "Ambaji",
    state: "Gujarat",
    district: "Banaskantha",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Amba (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-48-amba-ambaji.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Amba, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Ambaji. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the heart of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Amba is worshipped alongside the protective Bhairava Batuk Bhairav."
    ],
    significance: [
      "Traditional Shakti Peetha #48 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Heart",
      "Devi: Amba · Bhairava: Batuk Bhairav"
    ],
    divineAttractions: [
      "Amba darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated heart, Devi name Amba and Bhairava Batuk Bhairav."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 48,
    peethaBodyPart: "Heart",
    shaktiForm: "Amba",
    bhairava: "Batuk Bhairav",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Ambaji; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Ambaji",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Ambaji, Banaskantha, Gujarat",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-49-jai-durga-deoghar",
    name: "Shakti Peetha — Jai Durga",
    sanskrit: "Jai Durga",
    city: "Deoghar",
    state: "Jharkhand",
    district: "Deoghar",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Jai Durga (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-49-jai-durga-deoghar.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Jai Durga, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Deoghar. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the ears of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Jai Durga is worshipped alongside the protective Bhairava Vaidyanath."
    ],
    significance: [
      "Traditional Shakti Peetha #49 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Ears",
      "Devi: Jai Durga · Bhairava: Vaidyanath"
    ],
    divineAttractions: [
      "Jai Durga darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated ears, Devi name Jai Durga and Bhairava Vaidyanath."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 49,
    peethaBodyPart: "Ears",
    shaktiForm: "Jai Durga",
    bhairava: "Vaidyanath",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Deoghar; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Deoghar",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Deoghar, Deoghar, Jharkhand",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-50-danteshwari-dantewada",
    name: "Shakti Peetha — Danteshwari",
    sanskrit: "Danteshwari",
    city: "Dantewada",
    state: "Chhattisgarh",
    district: "Dantewada",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Danteshwari (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-50-danteshwari-dantewada.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Danteshwari, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Dantewada. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the tooth of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Danteshwari is worshipped alongside the protective Bhairava Kapalbhairava."
    ],
    significance: [
      "Traditional Shakti Peetha #50 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Tooth",
      "Devi: Danteshwari · Bhairava: Kapalbhairava"
    ],
    divineAttractions: [
      "Danteshwari darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated tooth, Devi name Danteshwari and Bhairava Kapalbhairava."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 50,
    peethaBodyPart: "Tooth",
    shaktiForm: "Danteshwari",
    bhairava: "Kapalbhairava",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Dantewada; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Dantewada",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Dantewada, Dantewada, Chhattisgarh",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  },
  {
    slug: "shakti-peetha-51-biraja-jajpur",
    name: "Shakti Peetha — Biraja",
    sanskrit: "Biraja",
    city: "Jajpur",
    state: "Odisha",
    district: "Jajpur",
    country: "India",
    category: [
      "Shakti Peetha",
      "Shakta",
      "Sacred Pilgrimage"
    ],
    deity: "Biraja (Shakti)",
    tradition: "Shakta · Traditional Shakti Peetha",
    image: "/images/shakti-peetha-51-biraja-jajpur.jpg",
    rating: "Editorially not rated",
    established: "Ancient sacred tradition; present temple form varies by site",
    trust: "Local temple / regional religious administration",
    summary: "Biraja, worshipped here as a manifestation of Shakti, is traditionally associated with this sacred Peetha at Jajpur. The site combines Devi worship, regional pilgrimage culture and a distinct sacred landscape for travellers.",
    history: [
      "According to the traditional Shakti Peetha narrative, the navel of Sati is associated with this Peetha.",
      "The shrine is remembered through regional Shakta tradition as a place where Biraja is worshipped alongside the protective Bhairava Varaha."
    ],
    significance: [
      "Traditional Shakti Peetha #51 in the selected 51-Peetha compilation",
      "Associated Sati sacred element: Navel",
      "Devi: Biraja · Bhairava: Varaha"
    ],
    divineAttractions: [
      "Biraja darshan and sacred altar experience",
      "Local temple architecture and ritual ambience",
      "Traditional pilgrim route / sacred landscape",
      "Festival-season lamps, flowers and devotional music"
    ],
    scripturalConnections: [
      {
        title: "Shakta Peetha tradition",
        context: "The Peetha is recorded in traditional Shakta compilations with Sati's associated navel, Devi name Biraja and Bhairava Varaha."
      },
      {
        title: "Devi-centered pilgrimage",
        context: "The site is best understood through Shakti worship, local temple tradition and sacred geography; exact historical identifications vary by source."
      }
    ],
    pilgrimExperience: [
      "Begin with quiet darshan and observe local temple etiquette",
      "Walk the surrounding sacred circuit where practical",
      "Experience local bhajan, deepa and festival traditions",
      "Combine the shrine with nearby heritage or nature attractions"
    ],
    peethaNumber: 51,
    peethaBodyPart: "Navel",
    shaktiForm: "Biraja",
    bhairava: "Varaha",
    identificationNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions.",
    darshanTimings: [
      {
        label: "Darshan",
        time: "Current local temple schedule — verify before travel"
      }
    ],
    aarti: [
      {
        name: "Temple Aarti / Deepa Seva",
        time: "As per local temple calendar",
        desc: "Daily ritual patterns differ from site to site; verify with the local shrine."
      }
    ],
    festivals: [
      {
        name: "Navaratri",
        month: "Sep / Oct",
        desc: "The Divine Mother is celebrated through special alankara, lamps, mantra and devotional gatherings."
      },
      {
        name: "Regional Devi Festival",
        month: "Varies",
        desc: "Local festival customs, processions and special sevas are observed according to the shrine tradition."
      }
    ],
    facilities: [
      "Local puja / prasad facilities",
      "Basic pilgrim assistance",
      "Nearby accommodation or city hospitality",
      "Local transport access"
    ],
    howToReach: [
      {
        mode: "Road",
        detail: "Approach from the main town / district around Jajpur; local access conditions should be checked before travel."
      },
      {
        mode: "Air / Rail",
        detail: "Use the nearest regional airport or railway station, followed by local road transport."
      }
    ],
    committee: [
      {
        name: "Local Temple Administration",
        role: "Darshan, Seva and Pilgrim Management"
      }
    ],
    faqs: [
      {
        q: "Is this an officially undisputed Shakti Peetha?",
        a: "Shakti Peetha lists differ across texts and traditions. This record follows the selected traditional 51-Peetha compilation and marks disputed identifications where applicable."
      },
      {
        q: "Can tourists visit?",
        a: "Visitors should follow the temple's current dress, photography, entry and ritual rules and respect the local community's customs."
      }
    ],
    nearby: [
      "Nearby sacred sites around Jajpur",
      "Regional heritage / pilgrimage circuit",
      "Local nature or cultural attractions"
    ],
    mapEmbedNote: "Jajpur, Jajpur, Odisha",
    sources: [
      {
        title: "51 Shakti Peethas — Traditional Compilation",
        organization: "Mata Hinglaj / Shakta reference",
        url: "https://www.matahinglaj.in/list-of-51-shakti-peethas",
        type: "Reference",
        purpose: "Traditional Peetha number, Devi name, Bhairava and associated Sati body-part identification.",
        lastVerified: "2026-09-14"
      }
    ],
    contentNote: "Traditional 51-Peetha compilation. Body-part and location identifications can vary between Shakta texts and regional traditions."
  }
];

export const JYOTIRLINGA_DATA = TEMPLE_DATA.filter(
  (temple) => temple.category.includes("Jyotirlinga")
);

export const SHAKTI_PEETHA_DATA = TEMPLE_DATA.filter(
  (temple) => temple.category.includes("Shakti Peetha")
);

export const JYOTIRLINGA_COUNT = 12;
export const SHAKTI_PEETHA_COUNT = 51;

export const TEMPLE_DATA_META = {
  jyotirlingas: JYOTIRLINGA_COUNT,
  shaktiPeethas: SHAKTI_PEETHA_COUNT,
  totalTempleRecords: TEMPLE_DATA.length,
  shaktiPeethaTradition:
    "Traditional 51-Peetha compilation; exact lists, names, body-part associations and identifications vary across texts and regional traditions.",
  sourcePolicy:
    "Prefer official temple/government sources for dynamic timings, access, booking and festival dates. Use traditional references for scriptural and Shakta identity where appropriate.",
} as const;
