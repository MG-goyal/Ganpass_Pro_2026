import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/Button';
import { Mandal } from '../../types';
import { adminService } from '../../services/adminService';
import { Plus, Edit2, Trash2, MapPin, Award, Loader2 } from 'lucide-react';

export const AdminMandalsPage: React.FC = () => {
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMandals = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllMandalsAdmin();
      setMandals(data);
    } catch (err) {
      console.error('Failed to load admin mandals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMandals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mandal from MongoDB?')) return;
    try {
      await adminService.deleteMandal(id);
      setMandals((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert('Failed to delete mandal.');
    }
  };

  return (
    <div>
      <AdminHeader
        title="Mandals Registry"
        subtitle="Create, edit, and publish Sarvajanik mandals to the live platform"
        action={
          <Link to="/admin/mandals/new">
            <Button variant="editorial" size="sm" pill leftIcon={<Plus className="w-4 h-4" />}>
              Add New Mandal
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-2" />
              <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/50">Loading database...</p>
            </div>
          ) : mandals.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              No mandals found in database. Click "Add New Mandal" above.
            </div>
          ) : (
            <div className="divide-y divide-[#1A1A1A]/8">
              {mandals.map((mandal) => (
                <div key={mandal.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={mandal.heroImageUrl || mandal.image}
                      alt={mandal.name}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#1A1A1A] truncate">{mandal.name}</h4>
                        {(mandal.isFeatured10 || mandal.is_featured) && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F27D26]/15 text-[#F27D26] text-[10px] font-bold">
                            Top 10 (#{mandal.featuredOrder || mandal.featured_order || 1})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#1A1A1A]/60">
                        {mandal.area} • {mandal.zone} • {mandal.nearestStation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/admin/mandals/${mandal.id}/edit`}>
                      <button className="p-2 rounded-xl text-stone-600 hover:bg-[#1A1A1A]/5 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(mandal.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};