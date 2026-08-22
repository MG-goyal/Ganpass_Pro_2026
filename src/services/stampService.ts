import { getStoredStamps, saveStoredStamps } from './storage';
import { mandalService } from './mandalService';
import { Mandal } from '../types';
import { apiRequest } from './apiClient';

export interface CheckinResult {
  success: boolean;
  is_new: boolean;
  message: string;
  mandal: Mandal | null;
  distance_meters?: number;
  stamped_at?: string;
}

export interface FeaturedStampItem {
  mandal: Mandal;
  is_collected: boolean;
  collected_order?: number;
}

export interface StampProgress {
  collected_count: number;
  total_featured: number;
  percentage: number;
  collected_ids: string[];
  featured_mandals: FeaturedStampItem[];
}

export const stampService = {
  async getStampProgress(): Promise<StampProgress> {
    try {
      const response = await apiRequest<StampProgress>('/stamps/progress');
      if (response && Array.isArray(response.featured_mandals)) {
        return response;
      }
    } catch (err) {
      console.warn('API getStampProgress fallback:', err);
    }

    const featured = await mandalService.getFeaturedMandals();
    const collectedIds = getStoredStamps();

    const featuredList: FeaturedStampItem[] = featured.map((mandal) => ({
      mandal,
      is_collected: collectedIds.includes(mandal.id || (mandal as any)._id),
      collected_order: mandal.featured_order || mandal.featuredOrder,
    }));

    const collectedCount = featuredList.filter((f) => f.is_collected).length;
    const totalFeatured = featured.length || 10;
    const percentage = Math.round((collectedCount / totalFeatured) * 100);

    return {
      collected_count: collectedCount,
      total_featured: totalFeatured,
      percentage,
      collected_ids: collectedIds,
      featured_mandals: featuredList,
    };
  },

  async collectStamp(
    mandalId: string,
    coords?: { latitude: number; longitude: number }
  ): Promise<CheckinResult> {
    try {
      const result = await apiRequest<CheckinResult>('/stamps/checkin', {
        method: 'POST',
        body: JSON.stringify({
          mandal_id: mandalId,
          latitude: coords?.latitude ?? 18.9912,
          longitude: coords?.longitude ?? 72.8361,
        }),
      });

      if (result && result.success) {
        const current = getStoredStamps();
        if (!current.includes(mandalId)) {
          saveStoredStamps([...current, mandalId]);
        }
        return result;
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.detail?.message || 'GPS Check-in Failed';
      console.warn('API collectStamp error:', errorMsg);
      throw new Error(errorMsg);
    }

    const mandal = await mandalService.getMandalById(mandalId);
    return {
      success: true,
      is_new: true,
      message: 'Stamp recorded locally!',
      mandal,
      stamped_at: new Date().toISOString(),
    };
  },

  async removeStamp(mandalId: string): Promise<boolean> {
    try {
      await apiRequest(`/stamps/${encodeURIComponent(mandalId.trim())}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API removeStamp fallback:', err);
    }
    const current = getStoredStamps();
    saveStoredStamps(current.filter((id) => id !== mandalId));
    return true;
  },

  async resetAllStamps(): Promise<boolean> {
    try {
      await apiRequest('/stamps/reset', {
        method: 'POST',
      });
    } catch (err) {
      console.warn('API resetAllStamps fallback:', err);
    }
    saveStoredStamps([]);
    return true;
  },
};