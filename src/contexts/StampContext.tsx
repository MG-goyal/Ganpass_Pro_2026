import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { stampService, StampProgress, CheckinResult } from '../services/stampService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface StampContextType {
  progress: StampProgress | null;
  collectedTotal: number;
  hasStamp: (mandalId: string) => boolean;
  collectStamp: (mandalId: string, coords?: { latitude: number; longitude: number }) => Promise<CheckinResult | void>;
  removeStamp: (mandalId: string) => Promise<void>;
  resetStamps: () => Promise<void>;
  refreshStamps: () => Promise<void>;
  isLoading: boolean;
}

const StampContext = createContext<StampContextType | undefined>(undefined);

export const StampProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [progress, setProgress] = useState<StampProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshStamps = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await stampService.getStampProgress();
      setProgress(data);
    } catch (err) {
      console.error('Failed to sync stamp progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStamps();
  }, [user, refreshStamps]);

  const hasStamp = useCallback(
    (mandalId: string): boolean => {
      const cleanId = mandalId?.trim();
      return Boolean(progress?.collected_ids?.includes(cleanId));
    },
    [progress]
  );

  const getBrowserCoords = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 18.9912, longitude: 72.8361 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve({ latitude: 18.9912, longitude: 72.8361 }),
        { timeout: 5000 }
      );
    });
  };

  const collectStamp = useCallback(
    async (mandalId: string, coords?: { latitude: number; longitude: number }) => {
      try {
        const resolvedCoords = coords || (await getBrowserCoords());
        const res = await stampService.collectStamp(mandalId, resolvedCoords);
        await refreshStamps();
        showToast(res.message || 'Stamp recorded in passport!', 'success');
        return res;
      } catch (err: any) {
        showToast(err?.message || 'Check-in validation failed.', 'error');
        throw err;
      }
    },
    [refreshStamps, showToast]
  );

  const removeStamp = useCallback(
    async (mandalId: string) => {
      try {
        await stampService.removeStamp(mandalId);
        await refreshStamps();
        showToast('Stamp removed.', 'info');
      } catch (err: any) {
        showToast(err?.message || 'Failed to remove stamp.', 'error');
      }
    },
    [refreshStamps, showToast]
  );

  const resetStamps = useCallback(async () => {
    try {
      await stampService.resetAllStamps();
      await refreshStamps();
      showToast('All collected stamps have been reset.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to reset stamps.', 'error');
    }
  }, [refreshStamps, showToast]);

  return (
    <StampContext.Provider
      value={{
        progress,
        collectedTotal: progress?.collected_count || 0,
        hasStamp,
        collectStamp,
        removeStamp,
        resetStamps,
        refreshStamps,
        isLoading,
      }}
    >
      {children}
    </StampContext.Provider>
  );
};

export const useStamp = () => {
  const context = useContext(StampContext);
  if (!context) throw new Error('useStamp must be used within a StampProvider');
  return context;
};