import { FestivalEvent, EventStatus } from '../types';
import { apiRequest } from './apiClient';
import { getStoredEvents } from './storage';

export const computeEventStatus = (startAt?: string, endAt?: string): EventStatus => {
  if (!startAt) return 'UPCOMING';
  const now = new Date().getTime();
  const start = new Date(startAt).getTime();
  const end = endAt ? new Date(endAt).getTime() : start + 3 * 3600 * 1000;

  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'LIVE';
  return 'COMPLETED';
};

export const eventService = {
  async getAllEvents(): Promise<FestivalEvent[]> {
    try {
      const events = await apiRequest<FestivalEvent[]>('/events');
      if (Array.isArray(events)) {
        return events.map((e) => ({
          ...e,
          status: computeEventStatus(e.start_at || e.startTime, e.end_at || e.endTime),
        }));
      }
    } catch (err) {
      console.warn('API getAllEvents fallback:', err);
    }
    const events = getStoredEvents();
    return events.map((e) => ({
      ...e,
      status: computeEventStatus(e.start_at || e.startTime, e.end_at || e.endTime),
    }));
  },

  async getEventById(id: string): Promise<FestivalEvent> {
    try {
      const event = await apiRequest<FestivalEvent>(`/events/${id}`);
      if (event && (event.id || (event as any)._id)) {
        return {
          ...event,
          status: computeEventStatus(event.start_at || event.startTime, event.end_at || event.endTime),
        };
      }
    } catch (err) {
      console.warn(`API getEventById fallback for ${id}:`, err);
    }

    const events = getStoredEvents();
    const found = events.find((e) => (e.id || (e as any)._id || (e as any).slug) === id);
    if (found) {
      return {
        ...found,
        status: computeEventStatus(found.start_at || found.startTime, found.end_at || found.endTime),
      };
    }

    throw new Error(`Event with ID '${id}' not found`);
  },

  async getEventsByMandal(mandalId: string): Promise<FestivalEvent[]> {
    try {
      const events = await apiRequest<FestivalEvent[]>(`/events?mandal_id=${mandalId}`);
      if (Array.isArray(events)) {
        return events.map((e) => ({
          ...e,
          status: computeEventStatus(e.start_at || e.startTime, e.end_at || e.endTime),
        }));
      }
    } catch (err) {
      console.warn(`API getEventsByMandal fallback for ${mandalId}:`, err);
    }
    const events = getStoredEvents();
    return events
      .filter((e) => e.mandalId === mandalId || e.mandal_id === mandalId)
      .map((e) => ({
        ...e,
        status: computeEventStatus(e.start_at || e.startTime, e.end_at || e.endTime),
      }));
  }
};