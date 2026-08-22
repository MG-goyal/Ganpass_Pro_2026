import { Mandal } from '../types';
import { mandalService } from './mandalService';
import { apiRequest } from './apiClient';

export interface PlannerCoordinates {
  lat: number;
  lng: number;
}

export type TravelMode = 'Walking' | 'Train' | 'Bus' | 'Car' | 'Bike' | 'Mixed';
export type VisitPreference = 'Famous' | 'Cultural' | 'Featured 10' | 'All';

export interface PlannerRequestPayload {
  starting_location?: string;
  start_coords?: PlannerCoordinates;
  start_time?: string;
  travel_mode: TravelMode;
  visit_preference: VisitPreference;
  max_stops: number;
}

export interface PlannerStop {
  stop_number: number;
  mandal: Mandal;
  visit_duration_mins: number;
  travel_to_next_mins: number;
  travel_distance_next_km: number;
  arrival_time: string;
  departure_time: string;
  travel_tip?: string;
}

export interface PlannerResult {
  id: string;
  title: string;
  total_time_mins: number;
  total_visit_time_mins: number;
  total_travel_time_mins: number;
  buffer_mins: number;
  stops_count: number;
  stops: PlannerStop[];
  starting_location?: string;
  travel_mode: string;
  created_at: string;
}

// Known coordinates for major Mumbai transit hubs
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  dadar: { lat: 19.0178, lng: 72.8478 },
  lalbaug: { lat: 18.9912, lng: 72.8361 },
  parel: { lat: 18.9982, lng: 72.8415 },
  chinchpokli: { lat: 18.9878, lng: 72.8342 },
  'lower parel': { lat: 18.9953, lng: 72.8302 },
  girgaon: { lat: 18.9538, lng: 72.8198 },
  'grant road': { lat: 18.9592, lng: 72.8159 },
  khetwadi: { lat: 18.9565, lng: 72.8214 },
  'charni road': { lat: 18.9515, lng: 72.8185 },
  csmt: { lat: 18.9401, lng: 72.8353 },
  fort: { lat: 18.9345, lng: 72.8368 },
  matunga: { lat: 19.0270, lng: 72.8550 },
  sion: { lat: 19.0308, lng: 72.8617 },
  andheri: { lat: 19.1197, lng: 72.8464 },
  chembur: { lat: 19.0626, lng: 72.8994 },
  'vile parle': { lat: 19.0984, lng: 72.8488 },
  bandra: { lat: 19.0596, lng: 72.8295 },
};

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

function calculateTransitMins(distanceKm: number, mode: TravelMode): number {
  switch (mode) {
    case 'Walking':
      return Math.max(5, Math.round((distanceKm / 4.0) * 60));
    case 'Train':
      return Math.max(12, Math.round(10 + (distanceKm / 25.0) * 60));
    case 'Bus':
      return Math.max(10, Math.round(5 + (distanceKm / 12.0) * 60));
    case 'Car':
      return Math.max(10, Math.round(8 + (distanceKm / 15.0) * 60));
    case 'Bike':
      return Math.max(6, Math.round(4 + (distanceKm / 20.0) * 60));
    case 'Mixed':
    default:
      if (distanceKm < 1.2) {
        return Math.max(5, Math.round((distanceKm / 4.2) * 60));
      }
      return Math.max(10, Math.round(8 + (distanceKm / 18.0) * 60));
  }
}

export const plannerService = {
  async generatePlan(request: PlannerRequestPayload): Promise<PlannerResult | null> {
    try {
      const result = await apiRequest<PlannerResult>('/planner/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      if (result && Array.isArray(result.stops) && result.stops.length > 0) {
        return result;
      }
    } catch (err) {
      console.warn('API planner fallback to local solver:', err);
    }

    // Local solver fallback
    await new Promise((res) => setTimeout(res, 300));
    const allMandals = await mandalService.getMandals();
    if (!allMandals.length) return null;

    let startLat = 18.9912;
    let startLng = 72.8361;

    if (request.start_coords) {
      startLat = request.start_coords.lat;
      startLng = request.start_coords.lng;
    } else if (request.starting_location) {
      const cleanLoc = request.starting_location.toLowerCase().trim();
      const match = Object.keys(AREA_COORDINATES).find((k) => cleanLoc.includes(k));
      if (match) {
        startLat = AREA_COORDINATES[match].lat;
        startLng = AREA_COORDINATES[match].lng;
      }
    }

    let candidates = [...allMandals];
    if (request.visit_preference === 'Featured 10') {
      candidates = candidates.filter((m) => m.is_featured || (m as any).isFeatured10);
    } else if (request.visit_preference === 'Famous') {
      candidates = candidates.filter((m) => m.category === 'Grand' || m.category === 'Famous' || m.is_featured);
    } else if (request.visit_preference === 'Cultural') {
      candidates = candidates.filter((m) => m.category === 'Cultural' || m.category === 'Heritage' || m.category === 'Eco-Friendly');
    }

    if (candidates.length < 3) {
      candidates = [...allMandals];
    }

    candidates.sort((a, b) => {
      const aLat = Number(a.latitude ?? a.coordinates?.lat ?? 18.9912);
      const aLng = Number(a.longitude ?? a.coordinates?.lng ?? 72.8361);
      const bLat = Number(b.latitude ?? b.coordinates?.lat ?? 18.9912);
      const bLng = Number(b.longitude ?? b.coordinates?.lng ?? 72.8361);
      return calculateDistanceKm(startLat, startLng, aLat, aLng) - calculateDistanceKm(startLat, startLng, bLat, bLng);
    });

    const maxStops = Math.min(request.max_stops || 4, candidates.length);
    const selected = candidates.slice(0, maxStops);

    const [startH, startM] = (request.start_time || '09:00').split(':').map((v) => parseInt(v, 10) || 0);
    let currentMinutes = startH * 60 + startM;
    let totalVisitTime = 0;
    let totalTravelTime = 0;
    const stops: PlannerStop[] = [];

    for (let i = 0; i < selected.length; i++) {
      const m = selected[i];
      const darshanTime = (m as any).avg_darshan_time_mins || (m as any).avgDarshanTimeMins || 40;
      totalVisitTime += darshanTime;

      let distKm = 0;
      let travelMins = 0;

      if (i < selected.length - 1) {
        const next = selected[i + 1];
        const mLat = Number(m.latitude ?? m.coordinates?.lat ?? 18.9912);
        const mLng = Number(m.longitude ?? m.coordinates?.lng ?? 72.8361);
        const nLat = Number(next.latitude ?? next.coordinates?.lat ?? 18.9912);
        const nLng = Number(next.longitude ?? next.coordinates?.lng ?? 72.8361);
        distKm = calculateDistanceKm(mLat, mLng, nLat, nLng);
        travelMins = calculateTransitMins(distKm, request.travel_mode);
      }

      totalTravelTime += travelMins;

      const arrH = Math.floor(currentMinutes / 60) % 24;
      const arrM = currentMinutes % 60;
      const depMinutes = currentMinutes + darshanTime;
      const depH = Math.floor(depMinutes / 60) % 24;
      const depM = depMinutes % 60;

      stops.push({
        stop_number: i + 1,
        mandal: m,
        visit_duration_mins: darshanTime,
        travel_to_next_mins: travelMins,
        travel_distance_next_km: Number(distKm.toFixed(1)),
        arrival_time: `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`,
        departure_time: `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`,
        travel_tip: `Nearest station: ${m.nearestStation || (m as any).nearest_station || 'Central Station'}. Footwear stand available.`,
      });

      currentMinutes = depMinutes + travelMins;
    }

    const bufferMins = Math.max(15, Math.round((totalVisitTime + totalTravelTime) * 0.15));

    return {
      id: `plan-${Date.now()}`,
      title: `Mumbai ${request.travel_mode} Darshan Circuit (${stops.length} Stops)`,
      total_time_mins: totalVisitTime + totalTravelTime + bufferMins,
      total_visit_time_mins: totalVisitTime,
      total_travel_time_mins: totalTravelTime,
      buffer_mins: bufferMins,
      stops_count: stops.length,
      stops,
      starting_location: request.starting_location,
      travel_mode: request.travel_mode,
      created_at: new Date().toISOString(),
    };
  },
};