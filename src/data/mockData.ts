import { INITIAL_MANDALS } from './mockMandals';
import { INITIAL_EVENTS } from './mockEvents';
import { INITIAL_ANNOUNCEMENTS } from './mockAnnouncements';
import { INITIAL_SETTINGS } from './mockSettings';

export const initialMandals = INITIAL_MANDALS;
export const initialEvents = INITIAL_EVENTS;
export const initialAnnouncements = INITIAL_ANNOUNCEMENTS;
export const mockSettings = INITIAL_SETTINGS;

export { INITIAL_MANDALS, INITIAL_EVENTS, INITIAL_ANNOUNCEMENTS, INITIAL_SETTINGS };

export function formatTime12h(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatDateDisplay(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
