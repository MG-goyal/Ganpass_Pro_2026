import {
  Mandal,
  FestivalEvent,
  Announcement,
  SiteSettings,
  AdminStats,
} from '../types';

import { apiRequest } from './apiClient';

import {
  getStoredMandals,
  saveStoredMandals,
  getStoredEvents,
  saveStoredEvents,
  getStoredAnnouncements,
  saveStoredAnnouncements,
  getStoredSettings,
  saveStoredSettings,
} from './storage';

import { computeEventStatus } from './eventService';
import { isAnnouncementActive } from './announcementService';

/**
 * Normalize Mandal data before sending it to the backend.
 *
 * The project currently supports both camelCase and snake_case
 * field names, so we keep both versions synchronized.
 */
const normalizeMandalPayload = (
  data: Partial<Mandal>
): Record<string, any> => {
  const payload: Record<string, any> = {
    ...data,
  };

  // --------------------------------------------
  // ESTABLISHED YEAR
  // --------------------------------------------

  if (data.establishedYear !== undefined) {
    payload.establishedYear = data.establishedYear;
    payload.established_year = data.establishedYear;
  } else if (data.established_year !== undefined) {
    payload.establishedYear = data.established_year;
    payload.established_year = data.established_year;
  }

  // --------------------------------------------
  // DARSHAN START TIME
  // --------------------------------------------

  if (data.darshanStartTime !== undefined) {
    payload.darshanStartTime = data.darshanStartTime;
    payload.darshan_start_time = data.darshanStartTime;
  } else if (data.darshan_start_time !== undefined) {
    payload.darshanStartTime = data.darshan_start_time;
    payload.darshan_start_time = data.darshan_start_time;
  }

  // --------------------------------------------
  // DARSHAN END TIME
  // --------------------------------------------

  if (data.darshanEndTime !== undefined) {
    payload.darshanEndTime = data.darshanEndTime;
    payload.darshan_end_time = data.darshanEndTime;
  } else if (data.darshan_end_time !== undefined) {
    payload.darshanEndTime = data.darshan_end_time;
    payload.darshan_end_time = data.darshan_end_time;
  }

  // --------------------------------------------
  // IDOL HEIGHT
  // --------------------------------------------

  if (data.idolHeight !== undefined) {
    payload.idolHeight = data.idolHeight;
    payload.idol_height = data.idolHeight;
  } else if (data.idol_height !== undefined) {
    payload.idolHeight = data.idol_height;
    payload.idol_height = data.idol_height;
  }

  // --------------------------------------------
  // DARSHAN STAMP
  // --------------------------------------------

  if (data.stampEnabled !== undefined) {
    payload.stampEnabled = Boolean(data.stampEnabled);
    payload.stamp_enabled = Boolean(data.stampEnabled);
  } else if (data.stamp_enabled !== undefined) {
    payload.stampEnabled = Boolean(data.stamp_enabled);
    payload.stamp_enabled = Boolean(data.stamp_enabled);
  }

  return payload;
};

export const adminService = {
  // =========================================================
  // STATS
  // =========================================================

  async getDashboardStats(): Promise<AdminStats> {
    try {
      const stats = await apiRequest<AdminStats>(
        '/dashboard/stats'
      );

      if (
        stats &&
        typeof stats.total_mandals === 'number'
      ) {
        return stats;
      }
    } catch (err) {
      console.warn(
        'API getDashboardStats fallback:',
        err
      );
    }

    const mandals = getStoredMandals();
    const events = getStoredEvents();
    const announcements =
      getStoredAnnouncements();

    const computedEvents = events.map((e) => ({
      ...e,
      status: computeEventStatus(
        e.start_at || e.startTime,
        e.end_at || e.endTime
      ),
    }));

    return {
      total_mandals: mandals.length,

      featured_mandals: mandals.filter(
        (m) =>
          (m.is_featured || m.isFeatured10) &&
          (m.is_active ??
            m.isActive ??
            true)
      ).length,

      upcoming_events:
        computedEvents.filter(
          (e) =>
            e.status === 'UPCOMING' &&
            (e.is_visible ??
              e.isVisible ??
              true)
        ).length,

      live_events:
        computedEvents.filter(
          (e) =>
            e.status === 'LIVE' &&
            (e.is_visible ??
              e.isVisible ??
              true)
        ).length,

      active_announcements:
        announcements.filter(
          isAnnouncementActive
        ).length,

      plans_generated: 1420,
      stamps_collected: 8930,
      registered_users: 3240,
    };
  },

  // =========================================================
  // MANDALS CRUD
  // =========================================================

  async getAllMandalsAdmin(): Promise<Mandal[]> {
    try {
      const mandals =
        await apiRequest<Mandal[]>(
          '/mandals?limit=100'
        );

      if (Array.isArray(mandals)) {
        return mandals;
      }
    } catch (err) {
      console.warn(
        'API getAllMandalsAdmin fallback:',
        err
      );
    }

    return getStoredMandals();
  },

  // =========================================================
  // CREATE MANDAL
  // =========================================================

  async createMandal(
    data: Partial<Mandal>
  ): Promise<Mandal> {
    const payload =
      normalizeMandalPayload(data);

    try {
      const mandal =
        await apiRequest<Mandal>(
          '/mandals',
          {
            method: 'POST',

            body: JSON.stringify(
              payload
            ),
          }
        );

      if (mandal) {
        const stored =
          getStoredMandals();

        saveStoredMandals([
          mandal,
          ...stored,
        ]);

        return mandal;
      }
    } catch (err) {
      console.warn(
        'API createMandal fallback:',
        err
      );
    }

    // --------------------------------------------
    // LOCAL STORAGE FALLBACK
    // --------------------------------------------

    const mandals =
      getStoredMandals();

    const rawName =
      data.name || 'mandal';

    const newId =
      rawName
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          '-'
        )
        .replace(
          /(^-|-$)/g,
          ''
        ) ||
      `mandal-${Date.now()}`;

    const finalId =
      mandals.some(
        (m) => m.id === newId
      )
        ? `${newId}-${Date.now()
            .toString()
            .slice(-4)}`
        : newId;

    const newMandal: Mandal = {
      name: 'New Mandal',
      area: 'Mumbai',
      category: 'Famous',

      ...payload,

      id: finalId,

      created_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),
    };

    mandals.unshift(
      newMandal
    );

    saveStoredMandals(
      mandals
    );

    return newMandal;
  },

  // =========================================================
  // UPDATE MANDAL
  // =========================================================

  async updateMandal(
    id: string,
    data: Partial<Mandal>
  ): Promise<Mandal | null> {
    const payload =
      normalizeMandalPayload(data);

    try {
      const mandal =
        await apiRequest<Mandal>(
          `/mandals/${id}`,
          {
            method: 'PUT',

            body: JSON.stringify(
              payload
            ),
          }
        );

      if (mandal) {
        const mandals =
          getStoredMandals();

        const idx =
          mandals.findIndex(
            (m) =>
              m.id === id ||
              (m as any)._id === id
          );

        if (idx !== -1) {
          mandals[idx] =
            mandal;

          saveStoredMandals(
            mandals
          );
        }

        return mandal;
      }
    } catch (err) {
      console.warn(
        'API updateMandal fallback:',
        err
      );
    }

    // --------------------------------------------
    // LOCAL STORAGE FALLBACK
    // --------------------------------------------

    const mandals =
      getStoredMandals();

    const index =
      mandals.findIndex(
        (m) =>
          m.id === id ||
          (m as any)._id === id
      );

    if (index === -1) {
      return null;
    }

    mandals[index] = {
      ...mandals[index],

      ...payload,

      updated_at:
        new Date().toISOString(),
    };

    saveStoredMandals(
      mandals
    );

    return mandals[index];
  },

  // =========================================================
  // DELETE MANDAL
  // =========================================================

  async deleteMandal(
    id: string
  ): Promise<boolean> {
    try {
      await apiRequest(
        `/mandals/${id}?hard_delete=true`,
        {
          method: 'DELETE',
        }
      );
    } catch (err) {
      console.error(
        'API deleteMandal failed on backend:',
        err
      );

      throw err;
    }

    let mandals =
      getStoredMandals();

    mandals =
      mandals.filter(
        (m) =>
          m.id !== id &&
          (m as any)._id !== id &&
          (m as any).slug !== id
      );

    saveStoredMandals(
      mandals
    );

    return true;
  },

  // =========================================================
  // EVENTS CRUD
  // =========================================================

  async getAllEventsAdmin(): Promise<FestivalEvent[]> {
    try {
      const events =
        await apiRequest<
          FestivalEvent[]
        >('/events');

      if (Array.isArray(events)) {
        return events.map((e) => ({
          ...e,

          status:
            computeEventStatus(
              e.start_at ||
                e.startTime,

              e.end_at ||
                e.endTime
            ),
        }));
      }
    } catch (err) {
      console.warn(
        'API getAllEventsAdmin fallback:',
        err
      );
    }

    const events =
      getStoredEvents();

    return events.map((e) => ({
      ...e,

      status:
        computeEventStatus(
          e.start_at ||
            e.startTime,

          e.end_at ||
            e.endTime
        ),
    }));
  },

  async createEvent(
    data: Partial<FestivalEvent>
  ): Promise<FestivalEvent> {
    try {
      const event =
        await apiRequest<FestivalEvent>(
          '/events',
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        );

      if (event) {
        const stored =
          getStoredEvents();

        saveStoredEvents([
          event,
          ...stored,
        ]);

        return {
          ...event,

          status:
            computeEventStatus(
              event.start_at ||
                event.startTime,

              event.end_at ||
                event.endTime
            ),
        };
      }
    } catch (err) {
      console.warn(
        'API createEvent fallback:',
        err
      );
    }

    const events =
      getStoredEvents();

    const rawTitle =
      data.title ||
      data.name ||
      'event';

    const newId =
      rawTitle
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          '-'
        )
        .replace(
          /(^-|-$)/g,
          ''
        ) ||
      `event-${Date.now()}`;

    const finalId =
      events.some(
        (e) => e.id === newId
      )
        ? `${newId}-${Date.now()
            .toString()
            .slice(-4)}`
        : newId;

    const newEvent:
      FestivalEvent = {
      title: rawTitle,
      type: 'Festival Event',

      ...data,

      id: finalId,

      created_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),
    };

    events.unshift(
      newEvent
    );

    saveStoredEvents(
      events
    );

    return {
      ...newEvent,

      status:
        computeEventStatus(
          newEvent.start_at ||
            newEvent.startTime,

          newEvent.end_at ||
            newEvent.endTime
        ),
    };
  },

  async updateEvent(
    id: string,
    data: Partial<FestivalEvent>
  ): Promise<FestivalEvent | null> {
    try {
      const event =
        await apiRequest<FestivalEvent>(
          `/events/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        );

      if (event) {
        const events =
          getStoredEvents();

        const idx =
          events.findIndex(
            (e) => e.id === id
          );

        if (idx !== -1) {
          events[idx] =
            event;

          saveStoredEvents(
            events
          );
        }

        return {
          ...event,

          status:
            computeEventStatus(
              event.start_at ||
                event.startTime,

              event.end_at ||
                event.endTime
            ),
        };
      }
    } catch (err) {
      console.warn(
        'API updateEvent fallback:',
        err
      );
    }

    const events =
      getStoredEvents();

    const index =
      events.findIndex(
        (e) => e.id === id
      );

    if (index === -1) {
      return null;
    }

    events[index] = {
      ...events[index],
      ...data,

      updated_at:
        new Date().toISOString(),
    };

    saveStoredEvents(
      events
    );

    return {
      ...events[index],

      status:
        computeEventStatus(
          events[index].start_at ||
            events[index].startTime,

          events[index].end_at ||
            events[index].endTime
        ),
    };
  },

  async deleteEvent(
    id: string
  ): Promise<boolean> {
    try {
      await apiRequest(
        `/events/${id}`,
        {
          method: 'DELETE',
        }
      );
    } catch (err) {
      console.warn(
        'API deleteEvent fallback:',
        err
      );
    }

    let events =
      getStoredEvents();

    events =
      events.filter(
        (e) => e.id !== id
      );

    saveStoredEvents(
      events
    );

    return true;
  },

  // =========================================================
  // ANNOUNCEMENTS CRUD
  // =========================================================

  async getAllAnnouncementsAdmin(): Promise<Announcement[]> {
    try {
      const announcements =
        await apiRequest<
          Announcement[]
        >('/announcements');

      if (
        Array.isArray(
          announcements
        )
      ) {
        return announcements.sort(
          (a, b) =>
            Number(a.priority ?? 0) -
            Number(b.priority ?? 0)
        );
      }
    } catch (err) {
      console.warn(
        'API getAllAnnouncementsAdmin fallback:',
        err
      );
    }

    return getStoredAnnouncements().sort(
      (a, b) =>
        Number(a.priority ?? 0) -
        Number(b.priority ?? 0)
    );
  },

  async createAnnouncement(
    data: Partial<Announcement>
  ): Promise<Announcement> {
    try {
      const ann =
        await apiRequest<Announcement>(
          '/announcements',
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        );

      if (ann) {
        const list =
          getStoredAnnouncements();

        saveStoredAnnouncements([
          ann,
          ...list,
        ]);

        return ann;
      }
    } catch (err) {
      console.warn(
        'API createAnnouncement fallback:',
        err
      );
    }

    const list =
      getStoredAnnouncements();

    const newAnn:
      Announcement = {
      title: 'Announcement',
      priority: 1,

      ...data,

      id: `announcement-${Date.now()}`,

      created_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),
    };

    list.unshift(
      newAnn
    );

    saveStoredAnnouncements(
      list
    );

    return newAnn;
  },

  async updateAnnouncement(
    id: string,
    data: Partial<Announcement>
  ): Promise<Announcement | null> {
    try {
      const ann =
        await apiRequest<Announcement>(
          `/announcements/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        );

      if (ann) {
        const list =
          getStoredAnnouncements();

        const idx =
          list.findIndex(
            (a) => a.id === id
          );

        if (idx !== -1) {
          list[idx] =
            ann;

          saveStoredAnnouncements(
            list
          );
        }

        return ann;
      }
    } catch (err) {
      console.warn(
        'API updateAnnouncement fallback:',
        err
      );
    }

    const list =
      getStoredAnnouncements();

    const index =
      list.findIndex(
        (a) => a.id === id
      );

    if (index === -1) {
      return null;
    }

    list[index] = {
      ...list[index],
      ...data,

      updated_at:
        new Date().toISOString(),
    };

    saveStoredAnnouncements(
      list
    );

    return list[index];
  },

  async deleteAnnouncement(
    id: string
  ): Promise<boolean> {
    try {
      await apiRequest(
        `/announcements/${id}`,
        {
          method: 'DELETE',
        }
      );
    } catch (err) {
      console.warn(
        'API deleteAnnouncement fallback:',
        err
      );
    }

    let list =
      getStoredAnnouncements();

    list =
      list.filter(
        (a) => a.id !== id
      );

    saveStoredAnnouncements(
      list
    );

    return true;
  },

  // =========================================================
  // FEATURED 10 CIRCUIT SLOTS
  // =========================================================

  async getFeaturedSlots(): Promise<
    Array<{
      slotNumber: number;
      mandal: Mandal | null;
    }>
  > {
    try {
      const response =
        await apiRequest<Mandal[]>(
          '/mandals/featured'
        );

      if (Array.isArray(response)) {
        const slots:
          Array<{
            slotNumber: number;
            mandal: Mandal | null;
          }> = [];

        for (
          let i = 1;
          i <= 10;
          i++
        ) {
          const assigned =
            response.find(
              (m) =>
                (m.featured_order ||
                  m.featuredOrder) === i
            ) ||
            response[i - 1] ||
            null;

          slots.push({
            slotNumber: i,
            mandal: assigned,
          });
        }

        return slots;
      }
    } catch (err) {
      console.warn(
        'API getFeaturedSlots fallback:',
        err
      );
    }

    const mandals =
      getStoredMandals();

    const featured =
      mandals
        .filter(
          (m) =>
            m.is_featured ||
            m.isFeatured10
        )
        .sort(
          (a, b) =>
            (a.featured_order ||
              a.featuredOrder ||
              99) -
            (b.featured_order ||
              b.featuredOrder ||
              99)
        );

    const slots:
      Array<{
        slotNumber: number;
        mandal: Mandal | null;
      }> = [];

    for (
      let i = 1;
      i <= 10;
      i++
    ) {
      const assigned =
        featured.find(
          (m) =>
            (m.featured_order ||
              m.featuredOrder) === i
        ) ||
        featured[i - 1] ||
        null;

      slots.push({
        slotNumber: i,
        mandal: assigned,
      });
    }

    return slots;
  },

  async updateFeaturedSlots(
    slots: Array<{
      slotNumber: number;
      mandalId: string | null;
    }>
  ): Promise<boolean> {
    try {
      await apiRequest(
        '/mandals/featured',
        {
          method: 'PUT',

          body: JSON.stringify({
            slots,
          }),
        }
      );

      return true;
    } catch (err) {
      console.warn(
        'API updateFeaturedSlots fallback:',
        err
      );
    }

    const mandals =
      getStoredMandals();

    mandals.forEach((m) => {
      m.is_featured = false;
      m.isFeatured10 = false;

      m.featured_order =
        undefined;

      m.featuredOrder =
        undefined;
    });

    slots
      .slice(0, 10)
      .forEach((slot) => {
        if (slot.mandalId) {
          const found =
            mandals.find(
              (m) =>
                m.id ===
                  slot.mandalId ||
                (m as any)._id ===
                  slot.mandalId
            );

          if (found) {
            found.is_featured =
              true;

            found.isFeatured10 =
              true;

            found.featured_order =
              slot.slotNumber;

            found.featuredOrder =
              slot.slotNumber;
          }
        }
      });

    saveStoredMandals(
      mandals
    );

    return true;
  },

  // =========================================================
  // SITE SETTINGS
  // =========================================================

  async getSettings(): Promise<SiteSettings> {
    try {
      const settings =
        await apiRequest<SiteSettings>(
          '/settings'
        );

      if (
        settings &&
        settings.festival_name
      ) {
        return settings;
      }
    } catch (err) {
      console.warn(
        'API getSettings fallback:',
        err
      );
    }

    return getStoredSettings();
  },

  async updateSettings(
    data: Partial<SiteSettings>
  ): Promise<SiteSettings> {
    try {
      const updated =
        await apiRequest<SiteSettings>(
          '/settings',
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        );

      if (updated) {
        saveStoredSettings(
          updated
        );

        return updated;
      }
    } catch (err) {
      console.warn(
        'API updateSettings fallback:',
        err
      );
    }

    const current =
      getStoredSettings();

    const updated = {
      ...current,
      ...data,
    };

    saveStoredSettings(
      updated
    );

    return updated;
  },
};