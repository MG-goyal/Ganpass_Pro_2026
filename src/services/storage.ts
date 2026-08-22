import { Mandal, FestivalEvent, Announcement, SiteSettings, User } from '../types';

const STORAGE_KEYS = {
  MANDALS: 'ganpass_mandals_v2',
  EVENTS: 'ganpass_events_v2',
  ANNOUNCEMENTS: 'ganpass_announcements_v1',
  SETTINGS: 'ganpass_settings_v1',
  USER: 'ganpass_user_v1',
  ADMIN_AUTH: 'ganpass_admin_auth_v1',
  STAMPS: 'ganpass_stamps_v1',
  PLANS: 'ganpass_saved_plans_v1',
};

// Safe storage getter and setter without auto-seeding dummy defaults
export const getStorageData = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return defaultVal;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
};

export const setStorageData = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
};

const normalizeMandal = (m: Mandal): Mandal => {
  const lat = m.coordinates?.lat ?? m.latitude ?? 18.9912;
  const lng = m.coordinates?.lng ?? m.longitude ?? 72.8361;
  return {
    ...m,
    latitude: lat,
    longitude: lng,
    coordinates: { lat, lng },
    heroImageUrl: m.heroImageUrl || m.image || '',
    image: m.image || m.heroImageUrl || '',
    isActive: m.isActive ?? m.is_active ?? true,
    is_active: m.is_active ?? m.isActive ?? true,
    isFeatured10: m.isFeatured10 ?? m.is_featured ?? false,
    is_featured: m.is_featured ?? m.isFeatured10 ?? false,
    whyVisit: m.whyVisit || m.why_visit || '',
    why_visit: m.why_visit || m.why_visit || '',
    howToReach: m.howToReach || m.how_to_reach || '',
    how_to_reach: m.how_to_reach || m.howToReach || '',
    visitingInformation: m.visitingInformation || m.visiting_information || '',
    visiting_information: m.visiting_information || m.visitingInformation || '',
    nearestStation: m.nearestStation || m.nearest_station || 'Local Station nearby',
    zone: m.zone || 'Central Mumbai',
  };
};

const normalizeEvent = (e: FestivalEvent): FestivalEvent => {
  const lat = e.coordinates?.lat ?? e.latitude ?? 18.9912;
  const lng = e.coordinates?.lng ?? e.longitude ?? 72.8361;
  return {
    ...e,
    title: e.title || e.name || 'Festival Event',
    name: e.name || e.title || 'Festival Event',
    latitude: lat,
    longitude: lng,
    coordinates: { lat, lng },
    heroImageUrl: e.heroImageUrl || e.image || '',
    image: e.image || e.heroImageUrl || '',
    locationDescription: e.locationDescription || e.location || '',
    location: e.location || e.locationDescription || '',
    startTime: e.startTime || e.start_at || new Date().toISOString(),
    start_at: e.start_at || e.startTime || new Date().toISOString(),
    endTime: e.endTime || e.end_at || new Date().toISOString(),
    end_at: e.end_at || e.endTime || new Date().toISOString(),
    isVisible: e.isVisible ?? e.is_visible ?? true,
    is_visible: e.is_visible ?? e.isVisible ?? true,
    mandalId: e.mandalId || e.mandal_id,
    mandal_id: e.mandal_id || e.mandalId,
  };
};

// Data accessors defaulting strictly to empty lists []
export const getStoredMandals = (): Mandal[] => {
  const data = getStorageData<Mandal[]>(STORAGE_KEYS.MANDALS, []);
  return data.map(normalizeMandal);
};

export const saveStoredMandals = (mandals: Mandal[]): void => {
  setStorageData(STORAGE_KEYS.MANDALS, mandals.map(normalizeMandal));
};

export const getStoredEvents = (): FestivalEvent[] => {
  const data = getStorageData<FestivalEvent[]>(STORAGE_KEYS.EVENTS, []);
  return data.map(normalizeEvent);
};

export const saveStoredEvents = (events: FestivalEvent[]): void => {
  setStorageData(STORAGE_KEYS.EVENTS, events.map(normalizeEvent));
};

export const getStoredAnnouncements = (): Announcement[] => {
  try {
    const raw = localStorage.getItem('ganpass_announcements_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredAnnouncements = (announcements: Announcement[]): void => {
  try {
    localStorage.setItem('ganpass_announcements_v1', JSON.stringify(announcements));
  } catch (err) {
    console.error('Error writing announcements to storage:', err);
  }
};

export const getStoredSettings = (): SiteSettings => 
  getStorageData<SiteSettings>(STORAGE_KEYS.SETTINGS, {
    festival_name: 'Mumbai Sarvajanik Ganeshotsav 2026',
    current_year: 2026,
    is_darshan_live: true
  });

export const saveStoredSettings = (settings: SiteSettings): void => 
  setStorageData(STORAGE_KEYS.SETTINGS, settings);

export const getStoredUser = (): User | null => 
  getStorageData<User | null>(STORAGE_KEYS.USER, null);

export const saveStoredUser = (user: User | null): void => 
  setStorageData(STORAGE_KEYS.USER, user);

export const getStoredStamps = (): string[] => 
  getStorageData<string[]>(STORAGE_KEYS.STAMPS, []);

export const saveStoredStamps = (stamps: string[]): void => 
  setStorageData(STORAGE_KEYS.STAMPS, stamps);

export const getAdminAuth = (): boolean => 
  getStorageData<boolean>(STORAGE_KEYS.ADMIN_AUTH, false);

export const saveAdminAuth = (isAuth: boolean): void => 
  setStorageData(STORAGE_KEYS.ADMIN_AUTH, isAuth);