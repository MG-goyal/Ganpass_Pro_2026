import { Announcement } from '../types';
import { apiRequest } from './apiClient';

export const isAnnouncementActive = (announcement: Announcement): boolean => {
  if (!announcement) return false;
  
  const isVisible = announcement.is_active ?? announcement.isActive ?? announcement.is_visible ?? true;
  if (!isVisible) return false;

  const now = new Date().getTime();
  const start = announcement.start_at ? new Date(announcement.start_at).getTime() : 0;
  const end = announcement.end_at ? new Date(announcement.end_at).getTime() : Infinity;

  return now >= start && now <= end;
};

export const announcementService = {
  /**
   * Retrieves active announcements matching the current timestamp for public banners.
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    try {
      const data = await apiRequest<Announcement[]>('/announcements');
      if (Array.isArray(data)) {
        return data.sort((a, b) => Number(b.priority ?? 1) - Number(a.priority ?? 1));
      }
      return [];
    } catch (err) {
      console.warn('API getActiveAnnouncements fallback:', err);
      return [];
    }
  },

  /**
   * Retrieves all announcements (including hidden/inactive) for the admin control room.
   */
  async getAllAnnouncementsAdmin(): Promise<Announcement[]> {
    try {
      const data = await apiRequest<Announcement[]>('/announcements?include_hidden=true');
      if (Array.isArray(data)) {
        return data.sort((a, b) => Number(b.priority ?? 1) - Number(a.priority ?? 1));
      }
      return [];
    } catch (err) {
      console.warn('API getAllAnnouncementsAdmin fallback:', err);
      return [];
    }
  },

  /**
   * Alias for backwards compatibility.
   */
  async getAllAnnouncements(): Promise<Announcement[]> {
    return this.getAllAnnouncementsAdmin();
  },

  /**
   * Admin: Publishes a new live broadcast alert.
   */
  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    return await apiRequest<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Admin: Updates an existing announcement (e.g. toggling is_active / is_visible).
   */
  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    return await apiRequest<Announcement>(`/announcements/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Admin: Permanently deletes a broadcast announcement.
   */
  async deleteAnnouncement(id: string): Promise<boolean> {
    await apiRequest(`/announcements/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return true;
  },
};