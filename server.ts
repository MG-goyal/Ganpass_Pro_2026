import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory persistent data store for server-side state (seeded with initial mandals, events, announcements, etc.)
let mandalsStore: any[] = [
  {
    id: 'lalbaugcha-raja',
    slug: 'lalbaugcha-raja',
    name: 'Lalbaugcha Raja',
    marathi_name: 'लालबागचा राजा',
    description: 'The most famous and revered Sarvajanik Ganpati in Mumbai, founded in 1934 at Lalbaug Market. Known as Navasacha Ganpati.',
    area: 'Lalbaug',
    zone: 'Central Mumbai',
    address: 'Lalbaug Market, GD Ambekar Marg, Lalbaug, Parel, Mumbai 400012',
    nearestStation: 'Chinchpokli (Central) / Currey Road',
    latitude: 18.9912,
    longitude: 72.8361,
    coordinates: { lat: 18.9912, lng: 72.8361 },
    image: 'https://images.unsplash.com/photo-1567591414240-e22d9c15bcf0?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Known as Navasacha Ganpati, the wish-fulfilling deity attracting over 1.5 million devotees daily.',
    history: 'Founded in 1934 by local fishermen and traders of Peru Chawl.',
    visiting_information: 'Two queues: Navas Line and Mukh Darshan. 24-hour darshan available.',
    how_to_reach: '5-minute walk from Chinchpokli or Currey Road railway stations.',
    crowdWaitEstimate: '2.5 - 4 hours (Mukh Darshan)',
    avg_darshan_time_mins: 90,
    is_featured: true,
    featured_order: 1,
    is_active: true,
    established_year: 1934,
    category: 'Iconic',
    tags: ['Lalbaug', 'Navas', 'Iconic', 'Central Mumbai']
  },
  {
    id: 'gsb-seva-mandal',
    slug: 'gsb-seva-mandal',
    name: 'GSB Seva Mandal Kings Circle',
    marathi_name: 'जीएसबी सेवा मंडळ',
    description: 'Affectionately known as Mumbai Gold Ganpati. Adorned with over 66 kg of pure gold and 300+ kg of silver.',
    area: "Matunga / King's Circle",
    zone: 'Central Mumbai',
    address: 'Guru Ganesh Prerana, Bhookailash Nagar, Sion East, Mumbai 400022',
    nearestStation: "King's Circle (Harbour) / Matunga (Central)",
    latitude: 19.0330,
    longitude: 72.8570,
    coordinates: { lat: 19.0330, lng: 72.8570 },
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Witness the dazzling 66kg gold-adorned idol and experience traditional Vedic rituals.',
    history: 'Established in 1954 by the Gowd Saraswat Brahmin community.',
    visiting_information: 'Open for 5 days only. Free general darshan queue is fast-moving.',
    how_to_reach: "3 minutes walk from King's Circle railway station.",
    crowdWaitEstimate: '45 - 60 mins',
    avg_darshan_time_mins: 45,
    is_featured: true,
    featured_order: 2,
    is_active: true,
    established_year: 1954,
    category: 'Grand',
    tags: ['GSB', 'Gold Ganpati', 'Eco-Friendly', 'Matunga']
  },
  {
    id: 'chinchpokli-chintamani',
    slug: 'chinchpokli-chintamani',
    name: 'Chinchpokli Cha Chintamani',
    marathi_name: 'चिंचपोकळीचा चिंतामणी',
    description: 'One of South Mumbai oldest mandals (107th year in 2026), celebrated for its magnificent throne design.',
    area: 'Chinchpokli',
    zone: 'Central Mumbai',
    address: 'Dattaram Lad Marg, Chinchpokli, Mumbai 400012',
    nearestStation: 'Chinchpokli (Central Railway)',
    latitude: 18.9880,
    longitude: 72.8340,
    coordinates: { lat: 18.9880, lng: 72.8340 },
    image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Famous for the spectacular Agman Sohala procession with dhol-tasha pathaks.',
    history: 'Established in 1920 by mill workers and locals.',
    visiting_information: 'Darshan is open 6:00 AM to 1:00 AM. Peak hours between 7 PM and 11 PM.',
    how_to_reach: '2 minutes walk from Chinchpokli Station East exit.',
    crowdWaitEstimate: '1 - 2 hours',
    avg_darshan_time_mins: 50,
    is_featured: true,
    featured_order: 3,
    is_active: true,
    established_year: 1920,
    category: 'Heritage',
    tags: ['Chintamani', 'Agman', 'Chinchpokli', 'Heritage']
  },
  {
    id: 'mumbaicha-raja-ganeshgalli',
    slug: 'mumbaicha-raja-ganeshgalli',
    name: 'Mumbaicha Raja (Ganesh Galli)',
    marathi_name: 'मुंबईचा राजा (गणेश गल्ली)',
    description: 'Renowned for pioneering breathtaking life-sized replicas of historic Indian temples.',
    area: 'Lalbaug',
    zone: 'Central Mumbai',
    address: 'Ganesh Galli, Lalbaug, Mumbai 400012',
    nearestStation: 'Currey Road / Chinchpokli',
    latitude: 18.9925,
    longitude: 72.8375,
    coordinates: { lat: 18.9925, lng: 72.8375 },
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Experience monumental thematic pandal architecture replicating India most sacred temples.',
    history: 'Founded in 1928, it is the oldest Sarvajanik mandal in Lalbaug.',
    visiting_information: 'Best visited alongside Lalbaugcha Raja.',
    how_to_reach: '5 mins walk from Currey Road station.',
    crowdWaitEstimate: '1.5 - 2.5 hours',
    avg_darshan_time_mins: 60,
    is_featured: true,
    featured_order: 4,
    is_active: true,
    established_year: 1928,
    category: 'Grand',
    tags: ['Ganesh Galli', 'Theme Pandals', 'Lalbaug']
  },
  {
    id: 'khetwadi-12th-lane',
    slug: 'khetwadi-12th-lane',
    name: 'Khetwadi 12th Lane (Khetwadicha Raja)',
    marathi_name: 'खेतवाडी १२वी गल्ली (खेतवाडीचा राजा)',
    description: 'Home to Mumbai tallest artistic Ganesha idols with intricate multi-headed representations.',
    area: 'Girgaon / Grant Road',
    zone: 'South Mumbai',
    address: '12th Lane Khetwadi, Grant Road East, Mumbai 400004',
    nearestStation: 'Grant Road (Western) / Charni Road',
    latitude: 18.9580,
    longitude: 72.8190,
    coordinates: { lat: 18.9580, lng: 72.8190 },
    image: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Witness the sheer height, grandeur, and scale of Mumbai most awe-inspiring idols.',
    history: 'Formed in 1959, famous worldwide for creating record-breaking tall idols.',
    visiting_information: 'Explore all lanes from 1st to 14th Khetwadi in one circuit.',
    how_to_reach: '7 minutes walk from Grant Road East railway station.',
    crowdWaitEstimate: '1 - 1.5 hours',
    avg_darshan_time_mins: 40,
    is_featured: true,
    featured_order: 5,
    is_active: true,
    established_year: 1959,
    category: 'Iconic',
    tags: ['Khetwadi', 'Tall Idol', 'South Mumbai']
  },
  {
    id: 'andhericha-raja',
    slug: 'andhericha-raja',
    name: 'Andhericha Raja (Azad Nagar)',
    marathi_name: 'अंधेरीचा राजा',
    description: 'The wish-fulfilling deity of the Western Suburbs with magnificent palace-themed sets.',
    area: 'Andheri West',
    zone: 'Western Suburbs',
    address: 'Azad Nagar II, Veera Desai Road, Andheri West, Mumbai 400053',
    nearestStation: 'Azad Nagar Metro / Andheri Western',
    latitude: 19.1290,
    longitude: 72.8360,
    coordinates: { lat: 19.1290, lng: 72.8360 },
    image: 'https://images.unsplash.com/photo-1567591414240-e22d9c15bcf0?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'The pinnacle Ganpati of Western Mumbai, celebrated for extending immersion until Sankashti Chaturthi.',
    history: 'Established in 1966 by the tobacco company workers of Azad Nagar.',
    visiting_information: 'Strict traditional dress code observed.',
    how_to_reach: '2 minutes walk from Azad Nagar Metro Station.',
    crowdWaitEstimate: '1 - 2 hours',
    avg_darshan_time_mins: 45,
    is_featured: true,
    featured_order: 6,
    is_active: true,
    established_year: 1966,
    category: 'Famous',
    tags: ['Andheri', 'Western Suburbs', 'Metro']
  },
  {
    id: 'fort-vibhag-ganeshotsav',
    slug: 'fort-vibhag-ganeshotsav',
    name: 'Fort Vibhag (Fortcha Raja)',
    marathi_name: 'फोर्ट विभाग सार्वजनिक गणेशोत्सव',
    description: 'Known for royal heritage palace decor, grand chandeliers, and immaculate South Mumbai ambiance.',
    area: 'Fort / CSMT',
    zone: 'South Mumbai',
    address: 'Near CST Station, Mint Road, Fort, Mumbai 400001',
    nearestStation: 'CSMT / Churchgate',
    latitude: 18.9380,
    longitude: 72.8350,
    coordinates: { lat: 18.9380, lng: 72.8350 },
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Located within Mumbai historic heritage precinct with ornate palace architecture.',
    history: 'Established in 1955 by Fort area residents and banking staff.',
    visiting_information: 'Easy walking access from CSMT terminus.',
    how_to_reach: '5 minutes walk from CSMT main hall.',
    crowdWaitEstimate: '30 - 45 mins',
    avg_darshan_time_mins: 30,
    is_featured: true,
    featured_order: 7,
    is_active: true,
    established_year: 1955,
    category: 'Heritage',
    tags: ['Fort', 'CSMT', 'South Mumbai']
  },
  {
    id: 'girgaoncha-raja',
    slug: 'girgaoncha-raja',
    name: 'Girgaoncha Raja (Nikadwari Lane)',
    marathi_name: 'गिरगावचा राजा',
    description: 'Famous for its majestic 25-foot traditional Shadu clay (eco-friendly) idol.',
    area: 'Girgaon',
    zone: 'South Mumbai',
    address: 'Nikadwari Lane, Girgaon, Mumbai 400004',
    nearestStation: 'Charni Road (Western Railway)',
    latitude: 18.9540,
    longitude: 72.8180,
    coordinates: { lat: 18.9540, lng: 72.8180 },
    image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Mumbai largest completely eco-friendly pure Shadu clay murti.',
    history: 'Established in 1928 in the heart of historic Girgaon.',
    visiting_information: '4 mins walk from Charni Road station.',
    how_to_reach: 'Walk from Charni Road East along Girgaon Road.',
    crowdWaitEstimate: '45 - 60 mins',
    avg_darshan_time_mins: 35,
    is_featured: true,
    featured_order: 8,
    is_active: true,
    established_year: 1928,
    category: 'Eco-Friendly',
    tags: ['Girgaon', 'Eco-Friendly', 'Shadu Clay']
  },
  {
    id: 'sahyadri-krida-mandal',
    slug: 'sahyadri-krida-mandal',
    name: 'Sahyadri Krida Mandal Chembur',
    marathi_name: 'सह्याद्री क्रीडा मंडळ चेंबूर',
    description: 'Eastern Mumbai foremost festival attraction, renowned for elaborate themed sets.',
    area: 'Chembur / Tilak Nagar',
    zone: 'Eastern Suburbs',
    address: 'Tilak Nagar, Chembur, Mumbai 400089',
    nearestStation: 'Tilak Nagar (Harbour) / Kurla (Central)',
    latitude: 19.0680,
    longitude: 72.8950,
    coordinates: { lat: 19.0680, lng: 72.8950 },
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Experience Eastern Suburbs grandest thematic set designs.',
    history: 'Established in 1977 by local sports and cultural youth.',
    visiting_information: 'Ample parking around Tilak Nagar grounds.',
    how_to_reach: '3 minutes from Tilak Nagar railway station.',
    crowdWaitEstimate: '45 - 75 mins',
    avg_darshan_time_mins: 40,
    is_featured: true,
    featured_order: 9,
    is_active: true,
    established_year: 1977,
    category: 'Cultural',
    tags: ['Chembur', 'Tilak Nagar', 'Eastern Suburbs']
  },
  {
    id: 'keshavji-naik-chawl',
    slug: 'keshavji-naik-chawl',
    name: 'Keshavji Naik Chawl (First Sarvajanik)',
    marathi_name: 'केशवजी नाईक चाळ (पहिले सार्वजनिक गणपती)',
    description: 'The birthplace of Mumbai Sarvajanik Ganeshotsav, founded by Lokmanya Bal Gangadhar Tilak in 1893.',
    area: 'Girgaon',
    zone: 'South Mumbai',
    address: 'Keshavji Naik Chawl, Khadilkar Road, Girgaon, Mumbai 400004',
    nearestStation: 'Charni Road (Western)',
    latitude: 18.9560,
    longitude: 72.8220,
    coordinates: { lat: 18.9560, lng: 72.8220 },
    image: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=1200&q=80',
    why_visit: 'Stand at the exact historical birthplace of Mumbai public Ganesh festival celebration.',
    history: 'Started in 1893 following Lokmanya Tilak call to unite people.',
    visiting_information: 'Intimate chawl courtyard setting.',
    how_to_reach: '6 minutes walk from Charni Road station.',
    crowdWaitEstimate: '20 - 30 mins',
    avg_darshan_time_mins: 25,
    is_featured: true,
    featured_order: 10,
    is_active: true,
    established_year: 1893,
    category: 'Heritage',
    tags: ['First Ganpati', '1893', 'Lokmanya Tilak', 'Historic']
  }
];

let eventsStore: any[] = [
  {
    id: 'chintamani-agman-2026',
    name: 'Chinchpokli Cha Chintamani Agman Sohala 2026',
    title: 'Chinchpokli Cha Chintamani Agman Sohala 2026',
    description: 'The legendary ceremonial arrival procession of Chinchpokli Cha Chintamani with 10+ dhol-tasha pathaks.',
    type: 'Agman',
    image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80',
    location: 'Dattaram Lad Marg, Chinchpokli, Mumbai',
    start_at: '2026-08-30T14:00:00Z',
    end_at: '2026-08-30T23:30:00Z',
    is_visible: true,
    mandal_id: 'chinchpokli-chintamani',
    organizer: 'Chinchpokli Sarvajanik Utsav Mandal'
  },
  {
    id: 'lalbaugcha-raja-pratham-darshan',
    name: 'Lalbaugcha Raja Pratham Darshan & Mukhawata Sohala',
    title: 'Lalbaugcha Raja Pratham Darshan & Mukhawata Sohala',
    description: 'First official public unveiling of Lalbaugcha Raja 2026 idol and royal background court set.',
    type: 'Festival Event',
    image: 'https://images.unsplash.com/photo-1567591414240-e22d9c15bcf0?auto=format&fit=crop&w=1200&q=80',
    location: 'Lalbaug Market Pandal',
    start_at: '2026-09-11T19:00:00Z',
    end_at: '2026-09-11T22:00:00Z',
    is_visible: true,
    mandal_id: 'lalbaugcha-raja',
    organizer: 'Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal'
  }
];

let announcementsStore: any[] = [
  {
    id: 'traffic-advisory-lalbaug-parel',
    title: 'Traffic Advisory: Dr. BA Road & Lalbaug Flyover One-Way',
    description: 'Mumbai Traffic Police has notified one-way vehicular traffic along Dr. Babasaheb Ambedkar Road from Parel TT to Chinchpokli bridge.',
    priority: 1,
    is_visible: true,
    start_at: '2026-08-01T00:00:00Z',
    end_at: '2026-09-30T23:59:59Z',
    badge_text: 'Traffic Alert',
    cta_text: 'View Live Routes',
    cta_url: '/plan'
  },
  {
    id: 'ganpass-10-passport-open',
    title: 'GanPass 10 Digital Passport Active for 2026!',
    description: 'Earn the 2026 Mumbai Pilgrim Verification by checking in at the Top 10 Sacred Mandals. Keep GPS enabled on your smartphone.',
    priority: 2,
    is_visible: true,
    start_at: '2026-08-01T00:00:00Z',
    end_at: '2026-09-30T23:59:59Z',
    badge_text: 'Passport Live',
    cta_text: 'Open My Passport',
    cta_url: '/ganpass'
  }
];

let settingsStore = {
  key: 'main_settings',
  festival_name: 'Mumbai Sarvajanik Ganeshotsav',
  festival_edition: '2026 - 134th Year',
  festival_start_date: '2026-09-14',
  festival_end_date: '2026-09-24',
  show_events: true,
  show_announcements: true,
  show_featured: true,
  show_planner: true,
  show_explore: true,
  checkin_enabled: true,
  passport_enabled: true,
  registration_enabled: true,
  checkin_radius_meters: 150.0,
  featured_limit: 10,
  maintenance_mode: false,
  contact_email: 'helpdesk@ganpass.in',
  instagram: '@ganpass_mumbai',
  website: 'https://ganpass.in',
  emergency_helpline: '112 / 100',
};

let userStampsStore: Record<string, string[]> = {};

// Helper: Haversine distance
function getHaversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ----------------- API ROUTES ----------------- //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ganpass-fullstack-gateway',
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const emailClean = (email || '').trim().toLowerCase();
  const name = emailClean.split('@')[0] || 'Devotee';
  const role = emailClean.includes('admin') ? 'admin' : 'user';

  const user = {
    id: role === 'admin' ? 'admin-super' : `user-${Date.now()}`,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email: emailClean || 'devotee@ganpass.in',
    role,
    stamps: userStampsStore[emailClean] || [],
  };

  res.json({
    access_token: `token_${user.id}_${Date.now()}`,
    token_type: 'bearer',
    user,
  });
});

app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  const adminUser = {
    id: 'admin-super',
    name: 'Mandal Admin Officer',
    email: email || 'admin@ganpass.in',
    role: 'admin',
    stamps: [],
  };

  res.json({
    access_token: `token_admin_${Date.now()}`,
    token_type: 'bearer',
    user: adminUser,
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 'devotee-1',
    name: 'Devotee Guest',
    email: 'devotee@ganpass.in',
    role: 'user',
    stamps: [],
  });
});

// Mandals Routes
app.get('/api/mandals', (req, res) => {
  const { search, area, category, featuredOnly } = req.query;
  let results = mandalsStore.filter((m) => m.is_active);

  if (area && area !== 'All') {
    results = results.filter((m) => m.area.toLowerCase().includes(String(area).toLowerCase()));
  }
  if (category && category !== 'All') {
    results = results.filter((m) => m.category === category);
  }
  if (featuredOnly === 'true') {
    results = results.filter((m) => m.is_featured);
  }
  if (search) {
    const s = String(search).toLowerCase().trim();
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(s) ||
        (m.marathi_name && m.marathi_name.includes(s)) ||
        m.area.toLowerCase().includes(s) ||
        (m.tags && m.tags.some((t: string) => t.toLowerCase().includes(s)))
    );
  }

  res.json(results);
});

app.get('/api/mandals/featured', (req, res) => {
  const featured = mandalsStore
    .filter((m) => m.is_featured && m.is_active)
    .sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99))
    .slice(0, 10);
  res.json(featured);
});

app.get('/api/mandals/areas', (req, res) => {
  const areas = Array.from(new Set(mandalsStore.map((m) => m.area))).sort();
  res.json(areas);
});

app.get('/api/mandals/:id', (req, res) => {
  const id = req.params.id;
  const mandal = mandalsStore.find((m) => m.id === id || m.slug === id);
  if (!mandal) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mandal not found' } });
  }

  const curLat = mandal.latitude || mandal.coordinates?.lat || 18.9912;
  const curLng = mandal.longitude || mandal.coordinates?.lng || 72.8361;

  const nearby = mandalsStore
    .filter((m) => m.id !== mandal.id && m.is_active)
    .map((m) => {
      const mLat = m.latitude || m.coordinates?.lat || 18.9912;
      const mLng = m.longitude || m.coordinates?.lng || 72.8361;
      const dist = Math.hypot(mLat - curLat, mLng - curLng);
      return { dist, mandal: m };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 4)
    .map((item) => item.mandal);

  res.json({ ...mandal, nearby_mandals: nearby });
});

app.post('/api/mandals', (req, res) => {
  const newId = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `mandal-${Date.now()}`;
  const newMandal = {
    ...req.body,
    id: newId,
    slug: newId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mandalsStore.unshift(newMandal);
  res.status(201).json(newMandal);
});

app.put('/api/mandals/:id', (req, res) => {
  const index = mandalsStore.findIndex((m) => m.id === req.params.id || m.slug === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mandal not found' } });
  }
  mandalsStore[index] = { ...mandalsStore[index], ...req.body, updated_at: new Date().toISOString() };
  res.json(mandalsStore[index]);
});

app.delete('/api/mandals/:id', (req, res) => {
  mandalsStore = mandalsStore.filter((m) => m.id !== req.params.id && m.slug !== req.params.id);
  res.json({ success: true });
});

// Events Routes
app.get('/api/events', (req, res) => {
  res.json(eventsStore);
});

app.get('/api/events/live-upcoming', (req, res) => {
  res.json(eventsStore.slice(0, 4));
});

app.post('/api/events', (req, res) => {
  const newEvent = {
    ...req.body,
    id: `event-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  eventsStore.unshift(newEvent);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const index = eventsStore.findIndex((e) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
  eventsStore[index] = { ...eventsStore[index], ...req.body, updated_at: new Date().toISOString() };
  res.json(eventsStore[index]);
});

app.delete('/api/events/:id', (req, res) => {
  eventsStore = eventsStore.filter((e) => e.id !== req.params.id);
  res.json({ success: true });
});

// Announcements Routes
app.get('/api/announcements', (req, res) => {
  res.json(announcementsStore);
});

app.get('/api/announcements/active', (req, res) => {
  res.json(announcementsStore.filter((a) => a.is_visible));
});

app.post('/api/announcements', (req, res) => {
  const newAnn = {
    ...req.body,
    id: `announcement-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  announcementsStore.unshift(newAnn);
  res.status(201).json(newAnn);
});

app.put('/api/announcements/:id', (req, res) => {
  const index = announcementsStore.findIndex((a) => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Announcement not found' } });
  announcementsStore[index] = { ...announcementsStore[index], ...req.body, updated_at: new Date().toISOString() };
  res.json(announcementsStore[index]);
});

app.delete('/api/announcements/:id', (req, res) => {
  announcementsStore = announcementsStore.filter((a) => a.id !== req.params.id);
  res.json({ success: true });
});

// Featured 10 Routes
app.get('/api/featured/slots', (req, res) => {
  const featured = mandalsStore.filter((m) => m.is_featured);
  const slots = [];
  for (let i = 1; i <= 10; i++) {
    const assigned = featured.find((m) => m.featured_order === i) || featured[i - 1] || null;
    slots.push({ slotNumber: i, mandal: assigned });
  }
  res.json({ success: true, slots, active_count: slots.filter((s) => s.mandal).length });
});

app.put('/api/featured/slots', (req, res) => {
  const { slots } = req.body;
  mandalsStore.forEach((m) => {
    m.is_featured = false;
    m.featured_order = undefined;
  });
  if (Array.isArray(slots)) {
    slots.slice(0, 10).forEach((slot: any) => {
      if (slot.mandalId) {
        const found = mandalsStore.find((m) => m.id === slot.mandalId);
        if (found) {
          found.is_featured = true;
          found.featured_order = slot.slotNumber;
        }
      }
    });
  }
  res.json({ success: true });
});

// Stamps & GPS Checkin Route
app.post('/api/stamps/checkin', (req, res) => {
  const { mandal_id, latitude, longitude } = req.body;
  const mandal = mandalsStore.find((m) => m.id === mandal_id);
  if (!mandal) {
    return res.status(404).json({ error: { code: 'MANDAL_NOT_FOUND', message: 'Mandal not found' } });
  }

  const mLat = mandal.latitude || mandal.coordinates?.lat || 18.9912;
  const mLng = mandal.longitude || mandal.coordinates?.lng || 72.8361;
  const distMeters = getHaversineDistanceMeters(latitude, longitude, mLat, mLng);
  const maxRadius = 150.0;

  if (distMeters > maxRadius) {
    return res.status(403).json({
      error: {
        code: 'OUT_OF_RADIUS',
        message: `GPS Verification: You are ${distMeters.toFixed(1)}m away. You must be within 150m of ${mandal.name} to collect your stamp.`,
        distance_meters: distMeters,
      },
    });
  }

  res.json({
    success: true,
    is_new: true,
    message: `Verified! Successfully stamped GanPass for ${mandal.name}.`,
    mandal,
    distance_meters: distMeters,
    stamped_at: new Date().toISOString(),
  });
});

// Dashboard Stats
app.get('/api/admin/dashboard/stats', (req, res) => {
  res.json({
    total_mandals: mandalsStore.length,
    featured_mandals: mandalsStore.filter((m) => m.is_featured && m.is_active).length,
    upcoming_events: eventsStore.length,
    live_events: 1,
    active_announcements: announcementsStore.filter((a) => a.is_visible).length,
    plans_generated: 1420,
    stamps_collected: 8930,
    registered_users: 3240,
  });
});

// Settings
app.get('/api/settings', (req, res) => {
  res.json(settingsStore);
});

app.put('/api/settings', (req, res) => {
  settingsStore = { ...settingsStore, ...req.body };
  res.json(settingsStore);
});

// Gemini AI Route (Secure server-side API call)
app.post('/api/ai/ask', async (req, res) => {
  const { query, context_mandal_id } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the official GanPass 2026 Mumbai Ganesh Festival AI Guide. User Question: ${query}. Provide a concise, practical, 100-word answer with timings, nearest railway station, and crowd advice.`,
      });
      return res.json({
        answer: response.text || 'Ganpati Bappa Morya! Have a blessed darshan.',
        recommendations: [
          'Visit early morning (6 AM - 8 AM) for faster darshan queues',
          'Use Mumbai Suburban Rail to avoid road traffic restrictions',
          'Keep your GPS active to stamp your GanPass 10 pilgrimage',
        ],
      });
    } catch (e) {
      // Fallback
    }
  }

  res.json({
    answer: `For "${query || 'your pilgrimage'}", the best darshan window is between 06:00 AM and 09:00 AM. Mandals like Lalbaugcha Raja, GSB Seva Mandal, and Mumbaicha Raja have dedicated queues and footwear counters. Use local suburban trains to Chinchpokli, Currey Road, or King's Circle.`,
    recommendations: [
      'Early morning slots (6 AM - 9 AM) have shortest queues',
      'Use Central Railway for Lalbaug and Western Railway for Girgaon and Khetwadi',
      'Keep GPS enabled to collect your official GanPass stamp within 150m',
    ],
    suggested_mandals: ['lalbaugcha-raja', 'gsb-seva-mandal', 'chinchpokli-chintamani'],
  });
});

// ----------------- VITE MIDDLEWARE ----------------- //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GanPass Full-Stack Gateway active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
