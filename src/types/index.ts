export type EventStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export const EventStatus = {
  UPCOMING: 'UPCOMING' as EventStatus,
  LIVE: 'LIVE' as EventStatus,
  COMPLETED: 'COMPLETED' as EventStatus,
};

export type EventType = 'Agman' | 'Festival Event' | 'Special Event' | 'Aarti' | 'Cultural' | 'Visarjan';

export type MandalCategory = 'Famous' | 'Cultural' | 'Heritage' | 'Eco-Friendly' | 'Grand' | 'Iconic' | 'Historic' | 'Theme-Based' | 'Community' | 'Commercial';

export type TravelMode = 'Walking' | 'Train' | 'Bus' | 'Car' | 'Bike' | 'Mixed';

export type VisitPreference = 'Famous' | 'Cultural' | 'Nearby' | 'Featured 10' | 'Mixed';

export interface MandalCoordinates {
  lat: number;
  lng: number;
}

export interface Mandal {

  id: string;
  name: string;

  marathiName?: string;
  marathi_name?: string;

  slug?: string;

  description?: string;

  area: string;
  zone?: string;

  address?: string;

  nearestStation?: string;
  nearest_station?: string;

  coordinates?: MandalCoordinates;

  latitude?: number;
  longitude?: number;

  heroImageUrl?: string;
  hero_image_url?: string;

  image?: string;

  galleryUrls?: string[];

  whyVisit?: string;
  why_visit?: string;

  history?: string;

  visitingInformation?: string;
  visiting_information?: string;

  howToReach?: string;
  how_to_reach?: string;

  crowdWaitEstimate?: string;
  crowd_wait_estimate?: string;

  avg_darshan_time_mins?: number;

  isFeatured10?: boolean;
  is_featured?: boolean;

  featuredOrder?: number;
  featured_order?: number;

  isActive?: boolean;
  is_active?: boolean;

  establishedYear?: number;
  established_year?: number;

  // NEW
  darshanStartTime?: string;
  darshan_start_time?: string;

  darshanEndTime?: string;
  darshan_end_time?: string;

  idolHeight?: string;
  idol_height?: string;

  stampEnabled?: boolean;
  stamp_enabled?: boolean;

  category?: MandalCategory | string;

  tags?: string[];

  highlights?: string[];

  tagline?: string;

  created_at?: string;
  updated_at?: string;
}
export interface FestivalEvent {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  type: string;
  heroImageUrl?: string;
  hero_image_url?: string;
  image?: string;
  locationDescription?: string;
  location?: string;
  address?: string;
  coordinates?: MandalCoordinates;
  latitude?: number;
  longitude?: number;
  startTime?: string;
  start_at?: string;
  endTime?: string;
  end_at?: string;
  status?: EventStatus;
  isVisible?: boolean;
  is_visible?: boolean;
  mandalId?: string;
  mandal_id?: string;
  organizer?: string;
  created_at?: string;
  updated_at?: string;
}

export type EventItem = FestivalEvent;

export interface Announcement {
  id: string;
  title: string;
  message?: string;
  description?: string;
  image?: string;
  priority?: number | string;
  isActive?: boolean;
  is_active?: boolean;
  is_visible?: boolean;
  isVisible?: boolean;
  start_at?: string;
  startAt?: string;
  end_at?: string;
  endAt?: string;
  actionLabel?: string;
  action_label?: string;
  actionUrl?: string;
  action_url?: string;
  cta_text?: string;
  cta_url?: string;
  badge_text?: string;
  badgeText?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  festival_name?: string;
  festival_edition?: string;
  festival_start_date?: string;
  festival_end_date?: string;
  show_events?: boolean;
  show_announcements?: boolean;
  show_featured?: boolean;
  show_planner?: boolean;
  show_explore?: boolean;
  contact_email?: string;
  instagram?: string;
  website?: string;
  emergency_helpline?: string;
  current_year?: number;
  is_darshan_live?: boolean;
}

export interface AdminStats {
  total_mandals: number;
  featured_mandals: number;
  upcoming_events: number;
  live_events: number;
  active_announcements: number;
  plans_generated: number;
  stamps_collected: number;
  registered_users: number;
}

export interface FilterState {
  search?: string;
  area?: string;
  category?: string;
  featuredOnly?: boolean;
}

export interface PlannerRequest {
  starting_location: string;
  startLocation?: string;
  start_coords?: MandalCoordinates;
  startCoordinates?: MandalCoordinates;
  start_time?: string;
  startTime?: string;
  available_time_mins: number;
  timeAvailableMins?: number;
  travel_mode: TravelMode;
  travelMode?: TravelMode;
  visit_preference: VisitPreference;
  preference?: VisitPreference;
  maxStops?: number;
}

export interface PlannerStop {
  stop_number?: number;
  mandal: Mandal;
  visit_duration_mins?: number;
  darshanDurationMins?: number;
  travel_to_next_mins?: number;
  travelTimeFromPreviousMins?: number;
  travel_distance_next_km?: number;
  distanceFromPreviousKm?: number;
  arrivalTime?: string;
  departureTime?: string;
  travel_tip?: string;
  travelTip?: string;
}

export interface PlanResult {
  id: string;
  title: string;
  total_time_mins?: number;
  totalDurationMins?: number;
  total_visit_time_mins?: number;
  estimatedDarshanTimeMins?: number;
  total_travel_time_mins?: number;
  totalTravelTimeMins?: number;
  buffer_mins?: number;
  stops_count?: number;
  stops: PlannerStop[];
  totalDistanceKm?: number;
  starting_location: string;
  startLocation?: string;
  travel_mode: TravelMode;
  mode?: TravelMode;
  created_at: string;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  role: 'admin' | 'superadmin' | 'user';
  stamps?: string[];
  created_at?: string;
}

export interface StampRecord {
  mandalId: string;
  mandalName?: string;
  stampedAt?: string;
  collectedAt?: string;
  coordinates?: MandalCoordinates;
}