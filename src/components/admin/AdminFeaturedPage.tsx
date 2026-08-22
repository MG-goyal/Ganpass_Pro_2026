import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { mandalService } from '../../services/mandalService';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/Button';
import { Mandal } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Award, ArrowUp, ArrowDown, Trash2, Plus, Save, Loader2 } from 'lucide-react';

export const AdminFeaturedPage: React.FC = () => {
  const { showToast } = useToast();
  const [allMandals, setAllMandals] = useState<Mandal[]>([]);
  const [featured, setFeatured] = useState<Mandal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mandals, feat] = await Promise.all([
        adminService.getAllMandalsAdmin(),
        mandalService.getFeaturedMandals()
      ]);
      setAllMandals(mandals);
      setFeatured(feat);
    } catch (err) {
      console.error('Failed to load circuit data:', err);
      showToast('Failed to load mandals from backend', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const unassigned = allMandals.filter(
    (m) => !featured.some((f) => (f.id || (f as any)._id) === (m.id || (m as any)._id))
  );

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featured.length) return;

    const updated = [...featured];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({
      ...item,
      featured_order: idx + 1,
      featuredOrder: idx + 1
    }));

    setFeatured(reordered);
  };

  const handleRemoveFromFeatured = (mandalId: string) => {
    const remaining = featured.filter((m) => (m.id || (m as any)._id) !== mandalId);
    const reordered = remaining.map((item, idx) => ({
      ...item,
      featured_order: idx + 1,
      featuredOrder: idx + 1
    }));
    setFeatured(reordered);
  };

  const handleAddToFeatured = (mandal: Mandal) => {
    if (featured.length >= 10) {
      showToast('The GanPass 10 Circuit is strictly limited to 10 mandals.', 'error');
      return;
    }
    const newEntry: Mandal = {
      ...mandal,
      is_featured: true,
      isFeatured10: true,
      featured_order: featured.length + 1,
      featuredOrder: featured.length + 1
    };
    setFeatured([...featured, newEntry]);
  };

  const handleSaveCircuit = async () => {
    setIsSaving(true);
    try {
      const slotsPayload = featured.map((m, idx) => ({
        slotNumber: idx + 1,
        mandalId: m.id || (m as any)._id
      }));

      await adminService.updateFeaturedSlots(slotsPayload);
      showToast('GanPass 10 Circuit saved successfully', 'success');
      await loadData();
    } catch (err: any) {
      console.error('Failed to save featured slots:', err);
      showToast(err?.message || 'Failed to save circuit ordering', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
          Loading GanPass 10 Circuit...
        </p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="GanPass 10 Circuit Management"
        subtitle="Curate and order the official 10 digital stamp mandals across Mumbai"
        action={
          <Button
            variant="editorial"
            size="sm"
            pill
            onClick={handleSaveCircuit}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Circuit Setup
          </Button>
        }
      />

      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Capacity Overview */}
        <div className="bg-[#1A1A1A] text-white rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-md">
          <div>
            <span className="editorial-tag text-[#F27D26] mb-1 block">Circuit Capacity</span>
            <h3 className="text-2xl font-serif-editorial font-bold">
              {featured.length} of 10 Slots Assigned
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Pilgrims collect official passport stamps strictly from these 10 mandals.
            </p>
          </div>
          <div className="text-4xl font-black italic font-serif-editorial text-[#F27D26]">
            {featured.length}/10
          </div>
        </div>

        {/* 10 Assigned Slots */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A] mb-4">
            Official 10 Circuit Order
          </h3>
          {featured.length === 0 ? (
            <p className="text-xs text-[#1A1A1A]/50 py-4">
              No mandals assigned yet. Choose from available mandals below to build the circuit.
            </p>
          ) : (
            <div className="space-y-3">
              {featured.map((mandal, index) => {
                const mId = mandal.id || (mandal as any)._id;
                return (
                  <div
                    key={mId}
                    className="p-4 rounded-2xl bg-[#FDFCF9] border border-[#1A1A1A]/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#F27D26] text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                        0{index + 1}
                      </div>
                      <img
                        src={mandal.heroImageUrl || mandal.image || (mandal as any).hero_image_url}
                        alt={mandal.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[#1A1A1A] truncate">{mandal.name}</h4>
                        <p className="text-xs text-[#1A1A1A]/60">
                          {mandal.area} • {mandal.nearestStation || mandal.nearest_station || mandal.zone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === featured.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromFeatured(mId)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove from Top 10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Mandals */}
        {featured.length < 10 && unassigned.length > 0 && (
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A] mb-4">
              Add Mandal to Featured Circuit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unassigned.map((mandal) => {
                const mId = mandal.id || (mandal as any)._id;
                return (
                  <div
                    key={mId}
                    className="p-3.5 rounded-xl border border-[#1A1A1A]/10 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <h5 className="font-bold text-xs truncate">{mandal.name}</h5>
                      <p className="text-[10px] text-[#1A1A1A]/60">{mandal.area}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      pill
                      onClick={() => handleAddToFeatured(mandal)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Assign
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};