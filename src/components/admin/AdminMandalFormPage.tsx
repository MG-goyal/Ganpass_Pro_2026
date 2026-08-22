import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/Button';
import { Mandal, MandalCategory } from '../../types';
import { mandalService } from '../../services/mandalService';
import { adminService } from '../../services/adminService';
import { ArrowLeft, Save } from 'lucide-react';

export const AdminMandalFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Mandal>>({
    name: '',
    marathiName: '',
    slug: '',
    zone: 'South Mumbai',
    area: '',
    address: '',
    nearestStation: '',
    establishedYear: 1934,
    category: 'Famous' as MandalCategory,
    description: '',
    whyVisit: '',
    why_visit: '',
    history: '',
    visitingInformation: '',
    visiting_information: '',
    howToReach: '',
    how_to_reach: '',
    crowdWaitEstimate: '1 - 2 Hours',
    avg_darshan_time_mins: 45,
    heroImageUrl: 'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=1200&q=80',
    isFeatured10: false,
    is_featured: false,
    featuredOrder: 1,
    isActive: true,
    is_active: true,
    latitude: 18.9904,
    longitude: 72.8378,
    coordinates: { lat: 18.9904, lng: 72.8378 },
  });

  useEffect(() => {
    if (isEdit && id) {
      mandalService.getMandalById(id).then((data) => {
        if (data) setFormData(data);
      });
    }
  }, [isEdit, id]);

  const handleChange = (field: keyof Mandal | string, value: any) => {
    setFormData((prev: Partial<Mandal>) => ({ ...prev, [field]: value }));
  };

  const handleCoordinatesChange = (field: 'lat' | 'lng', value: number) => {
    setFormData((prev: Partial<Mandal>) => {
      const currentLat = prev.coordinates?.lat ?? prev.latitude ?? 18.9904;
      const currentLng = prev.coordinates?.lng ?? prev.longitude ?? 72.8378;
      const updated = {
        lat: field === 'lat' ? value : currentLat,
        lng: field === 'lng' ? value : currentLng,
      };
      return {
        ...prev,
        latitude: updated.lat,
        longitude: updated.lng,
        coordinates: updated,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const descText = formData.description || formData.whyVisit || formData.why_visit || formData.history || `${formData.name} Ganpati Pandal Mumbai`;

    const payload: any = {
      ...formData,
      description: descText,
      image: formData.heroImageUrl || formData.image,
      heroImageUrl: formData.heroImageUrl || formData.image,
      why_visit: formData.whyVisit || formData.why_visit || descText,
      whyVisit: formData.whyVisit || formData.why_visit || descText,
      visiting_information: formData.visitingInformation || formData.visiting_information || 'Open for darshan 24 hours during festival days',
      how_to_reach: formData.howToReach || formData.how_to_reach || `Near ${formData.nearestStation || 'Local Station'}`,
      avg_darshan_time_mins: Number(formData.avg_darshan_time_mins) || 45,
      latitude: Number(formData.coordinates?.lat ?? formData.latitude ?? 18.9904),
      longitude: Number(formData.coordinates?.lng ?? formData.longitude ?? 72.8378),
      coordinates: {
        lat: Number(formData.coordinates?.lat ?? formData.latitude ?? 18.9904),
        lng: Number(formData.coordinates?.lng ?? formData.longitude ?? 72.8378),
      },
      is_featured: Boolean(formData.isFeatured10 || formData.is_featured),
      isFeatured10: Boolean(formData.isFeatured10 || formData.is_featured),
      is_active: Boolean(formData.isActive ?? formData.is_active ?? true),
      isActive: Boolean(formData.isActive ?? formData.is_active ?? true),
    };

    try {
      if (isEdit && id) {
        await adminService.updateMandal(id, payload);
      } else {
        await adminService.createMandal(payload);
      }
      navigate('/admin/mandals');
    } catch (err: any) {
      setError(err?.message || 'Failed to save mandal to database.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <AdminHeader
        title={isEdit ? `Edit: ${formData.name || 'Mandal'}` : 'Add New Mandal'}
        subtitle="Configure pandal credentials, coordinates, transit guides, and GanPass 10 status"
        action={
          <Link to="/admin/mandals">
            <Button variant="outline" size="sm" pill leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to List
            </Button>
          </Link>
        }
      />

      <div className="max-w-4xl mx-auto p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              1. Pandal Identity & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Mandal Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Lalbaugcha Raja"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Marathi Name (Devanagari)
                </label>
                <input
                  type="text"
                  value={formData.marathiName || ''}
                  onChange={(e) => handleChange('marathiName', e.target.value)}
                  placeholder="उदा. लालबागचा राजा"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Zone
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => handleChange('zone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  <option value="South Mumbai">South Mumbai</option>
                  <option value="Central">Central</option>
                  <option value="Western Suburbs">Western Suburbs</option>
                  <option value="Harbour">Harbour</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Area / Neighborhood *
                </label>
                <input
                  type="text"
                  required
                  value={formData.area || ''}
                  onChange={(e) => handleChange('area', e.target.value)}
                  placeholder="e.g. Parel, Lalbaug"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Nearest Railway Station *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nearestStation || ''}
                  onChange={(e) => handleChange('nearestStation', e.target.value)}
                  placeholder="e.g. Currey Road / Chinchpokli"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Full Street Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. Lalbaug Market, GD Ambekar Marg, Mumbai 400012"
                className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates?.lat || formData.latitude || 0}
                  onChange={(e) => handleCoordinatesChange('lat', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates?.lng || formData.longitude || 0}
                  onChange={(e) => handleCoordinatesChange('lng', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              2. Pilgrim Guide & History
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Why Visit / Mandal Overview *
              </label>
              <textarea
                rows={3}
                required
                value={formData.whyVisit || formData.description || ''}
                onChange={(e) => {
                  handleChange('whyVisit', e.target.value);
                  handleChange('why_visit', e.target.value);
                  handleChange('description', e.target.value);
                }}
                placeholder="Explain what makes this mandal special..."
                className="w-full p-3.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                History & Heritage
              </label>
              <textarea
                rows={4}
                value={formData.history || ''}
                onChange={(e) => handleChange('history', e.target.value)}
                placeholder="Detail historical founding, rituals, and community legacy..."
                className="w-full p-3.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Est. Darshan Queue Time
                </label>
                <input
                  type="text"
                  value={formData.crowdWaitEstimate || ''}
                  onChange={(e) => handleChange('crowdWaitEstimate', e.target.value)}
                  placeholder="e.g. 2 - 4 Hours"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Hero Photo URL
                </label>
                <input
                  type="url"
                  value={formData.heroImageUrl || ''}
                  onChange={(e) => {
                    handleChange('heroImageUrl', e.target.value);
                    handleChange('image', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              3. GanPass 10 Circuit & Publishing
            </h3>

            <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#FDFCF9] border border-[#1A1A1A]/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isFeatured10 || formData.is_featured)}
                  onChange={(e) => {
                    handleChange('isFeatured10', e.target.checked);
                    handleChange('is_featured', e.target.checked);
                  }}
                  className="w-4 h-4 text-[#F27D26] rounded focus:ring-[#F27D26]"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Include in Official GanPass 10 Circuit
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isActive ?? formData.is_active ?? true)}
                  onChange={(e) => {
                    handleChange('isActive', e.target.checked);
                    handleChange('is_active', e.target.checked);
                  }}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Publicly Published (Visible to Devotees)
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link to="/admin/mandals">
              <Button variant="outline" size="md" pill>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="editorial"
              size="md"
              pill
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isEdit ? 'Save Mandal Changes' : 'Publish Mandal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};