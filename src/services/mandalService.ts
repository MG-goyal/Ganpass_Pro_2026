import { Mandal, FilterState } from '../types';
import { apiRequest } from './apiClient';
import { getStoredMandals } from './storage';

export const mandalService = {
  /**
   * Retrieves all mandals from the backend with optional query filters.
   */
  async getMandals(filters?: Partial<FilterState>): Promise<Mandal[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.area && filters.area !== 'All') params.append('area', filters.area);
      if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters?.featuredOnly) params.append('featuredOnly', 'true');

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const mandals = await apiRequest<Mandal[]>(`/mandals${queryStr}`);
      if (Array.isArray(mandals)) {
        return mandals;
      }
    } catch (err) {
      console.warn('API getMandals fallback to storage:', err);
    }

    // Storage fallback
    let list = getStoredMandals().filter(
      (m) => (m.is_active ?? (m as any).isActive) !== false
    );

    if (filters) {
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        list = list.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.area.toLowerCase().includes(query) ||
            (m.marathi_name && m.marathi_name.toLowerCase().includes(query)) ||
            ((m as any).marathiName && (m as any).marathiName.toLowerCase().includes(query)) ||
            (m.tags && m.tags.some((t) => t.toLowerCase().includes(query)))
        );
      }
      if (filters.area && filters.area !== 'All') {
        list = list.filter((m) => m.area.toLowerCase().includes(filters.area!.toLowerCase()));
      }
      if (filters.category && filters.category !== 'All') {
        list = list.filter((m) => m.category === filters.category);
      }
      if (filters.featuredOnly) {
        list = list.filter((m) => m.is_featured || (m as any).isFeatured10);
      }
    }

    return list;
  },

  /**
   * Retrieves the Top 10 Featured Mandals (Circuit Mandals).
   */
  async getFeaturedMandals(): Promise<Mandal[]> {
    try {
      const featured = await apiRequest<Mandal[]>('/mandals/featured');
      if (Array.isArray(featured)) {
        return featured;
      }
    } catch (err) {
      console.warn('API getFeaturedMandals fallback:', err);
    }

    const mandals = getStoredMandals();
    return mandals
      .filter((m) => (m.is_featured || (m as any).isFeatured10) && (m.is_active ?? (m as any).isActive) !== false)
      .sort((a, b) => (a.featured_order || (a as any).featuredOrder || 99) - (b.featured_order || (b as any).featuredOrder || 99))
      .slice(0, 10);
  },

  /**
   * Retrieves a single mandal by its ID, slug, or MongoDB ObjectId.
   */
  async getMandalById(id: string): Promise<Mandal | null> {
    try {
      const mandal = await apiRequest<Mandal>(`/mandals/${id}`);
      if (mandal && (mandal.id || (mandal as any)._id)) {
        return mandal;
      }
    } catch (err) {
      console.warn('API getMandalById fallback:', err);
    }

    const mandals = getStoredMandals();
    return mandals.find((m) => m.id === id || (m as any).slug === id) || null;
  },

  /**
   * Returns nearby mandals based on geographic coordinates.
   */
  async getNearbyMandals(currentMandalId: string, limit = 3): Promise<Mandal[]> {
    const current = await this.getMandalById(currentMandalId);
    if (!current) return [];
    
    const curLat = current.latitude ?? current.coordinates?.lat ?? 18.9912;
    const curLng = current.longitude ?? current.coordinates?.lng ?? 72.8361;
    const all = await this.getMandals();
    
    return all
      .filter((m) => m.id !== currentMandalId)
      .sort((a, b) => {
        const aLat = a.latitude ?? a.coordinates?.lat ?? 18.9912;
        const aLng = a.longitude ?? a.coordinates?.lng ?? 72.8361;
        const bLat = b.latitude ?? b.coordinates?.lat ?? 18.9912;
        const bLng = b.longitude ?? b.coordinates?.lng ?? 72.8361;
        const distA = Math.hypot(aLat - curLat, aLng - curLng);
        const distB = Math.hypot(bLat - curLat, bLng - curLng);
        return distA - distB;
      })
      .slice(0, limit);
  },

  /**
   * Retrieves unique geographic areas for discovery filters.
   */
  async getAllAreas(): Promise<string[]> {
    try {
      const areas = await apiRequest<string[]>('/mandals/areas');
      if (Array.isArray(areas) && areas.length > 0) {
        return areas;
      }
    } catch (err) {
      console.warn('API getAllAreas fallback:', err);
    }

    const mandals = getStoredMandals();
    const areas = new Set<string>();
    mandals.forEach((m) => m.area && areas.add(m.area));
    return Array.from(areas).sort();
  }
};