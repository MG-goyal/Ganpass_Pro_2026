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

    // Mandal Details Defaults
    establishedYear: undefined,
    darshanStartTime: '06:00 AM',
    darshanEndTime: '11:30 PM',
    idolHeight: '',
    stampEnabled: true,

    category: 'Famous' as MandalCategory,
    description: '',
    whyVisit: '',
    history: '',
    visitingInformation: '',
    howToReach: '',
    crowdWaitEstimate: '15 - 30 minutes',
    avg_darshan_time_mins: 45,

    heroImageUrl: '',
    image: '',

    isFeatured10: false,
    isActive: true,

    latitude: 18.9904,
    longitude: 72.8378,
    coordinates: { lat: 18.9904, lng: 72.8378 },
  });

  useEffect(() => {
    if (isEdit && id) {
      mandalService.getMandalById(id).then((data: any) => {
        if (data) {
          setFormData({
            ...data,
            // Fallback bindings for both snake_case and camelCase
            establishedYear: data.establishedYear ?? data.established_year ?? undefined,
            darshanStartTime: data.darshanStartTime ?? data.darshan_start_time ?? '06:00 AM',
            darshanEndTime: data.darshanEndTime ?? data.darshan_end_time ?? '11:30 PM',
            idolHeight: data.idolHeight ?? data.idol_height ?? '',
            stampEnabled: data.stampEnabled ?? data.stamp_enabled ?? true,
            nearestStation: data.nearestStation ?? data.nearest_station ?? '',
            marathiName: data.marathiName ?? data.marathi_name ?? '',
            whyVisit: data.whyVisit ?? data.why_visit ?? data.description ?? '',
            crowdWaitEstimate: data.crowdWaitEstimate ?? data.crowd_wait_estimate ?? '',
            heroImageUrl: data.heroImageUrl ?? data.hero_image_url ?? data.image ?? '',
          });
        }
      });
    }
  }, [isEdit, id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCoordinatesChange = (field: 'lat' | 'lng', value: number) => {
    setFormData((prev) => {
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

    const descText =
      formData.whyVisit ||
      formData.why_visit ||
      formData.description ||
      `${formData.name} Ganpati Pandal Mumbai`;

    const payload: any = {
      name: formData.name,
      marathi_name: formData.marathiName || formData.marathi_name || '',
      marathiName: formData.marathiName || formData.marathi_name || '',
      slug: formData.slug || undefined,
      zone: formData.zone,
      area: formData.area,
      address: formData.address,
      nearest_station: formData.nearestStation || formData.nearest_station || '',
      nearestStation: formData.nearestStation || formData.nearest_station || '',

      // Mandal Custom Specs
      established_year: formData.establishedYear ? Number(formData.establishedYear) : null,
      establishedYear: formData.establishedYear ? Number(formData.establishedYear) : null,

      darshan_start_time: formData.darshanStartTime || '06:00 AM',
      darshanStartTime: formData.darshanStartTime || '06:00 AM',

      darshan_end_time: formData.darshanEndTime || '11:30 PM',
      darshanEndTime: formData.darshanEndTime || '11:30 PM',

      idol_height: formData.idolHeight || '',
      idolHeight: formData.idolHeight || '',

      stamp_enabled: Boolean(formData.stampEnabled ?? formData.stamp_enabled),
      stampEnabled: Boolean(formData.stampEnabled ?? formData.stamp_enabled),

      crowd_wait_estimate: formData.crowdWaitEstimate || '',
      crowdWaitEstimate: formData.crowdWaitEstimate || '',
      avg_darshan_time_mins: Number(formData.avg_darshan_time_mins) || 45,

      category: formData.category || 'Famous',
      description: descText,
      why_visit: descText,
      whyVisit: descText,
      history: formData.history || '',
      visiting_information: formData.visitingInformation || 'Open for darshan during festival days',
      visitingInformation: formData.visitingInformation || 'Open for darshan during festival days',
      how_to_reach: formData.howToReach || `Near ${formData.nearestStation || 'Local Station'}`,
      howToReach: formData.howToReach || `Near ${formData.nearestStation || 'Local Station'}`,

      image: formData.heroImageUrl || formData.image || '',
      heroImageUrl: formData.heroImageUrl || formData.image || '',
      hero_image_url: formData.heroImageUrl || formData.image || '',

      is_featured: Boolean(formData.isFeatured10 || formData.is_featured),
      isFeatured10: Boolean(formData.isFeatured10 || formData.is_featured),
      is_active: Boolean(formData.isActive ?? formData.is_active ?? true),
      isActive: Boolean(formData.isActive ?? formData.is_active ?? true),

      latitude: Number(formData.coordinates?.lat ?? formData.latitude ?? 18.9904),
      longitude: Number(formData.coordinates?.lng ?? formData.longitude ?? 72.8378),
      coordinates: {
        lat: Number(formData.coordinates?.lat ?? formData.latitude ?? 18.9904),
        lng: Number(formData.coordinates?.lng ?? formData.longitude ?? 72.8378),
      },
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
        subtitle="Configure pandal credentials, darshan timings, idol specifications, and GanPass status"
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
          {/* Section 1: Pandal Identity & Location */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-bold text-[#1A1A1A]">1. Pandal Identity & Location</h3>
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
                  placeholder="e.g. Vinayak Nagar Sarvajanik Ganesh Utsav Mandal"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
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
                  placeholder="उदा. विनायक नगरचा महाराजा"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">Zone</label>
                <select
                  value={formData.zone}
                  onChange={(e) => handleChange('zone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-bold uppercase"
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
                  placeholder="e.g. Bhayandar West"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
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
                  placeholder="e.g. Bhayandar Railway Station"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">Full Street Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. Vinayak Nagar, Station Road, Bhayandar West"
                className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates?.lat || formData.latitude || 0}
                  onChange={(e) => handleCoordinatesChange('lat', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">Longitude</label>
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

          {/* Section 2: Mandal Details & Timings */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-bold text-[#1A1A1A]">2. Specifications & Timings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Established Year (EST.)
                </label>
                <input
                  type="number"
                  min="1800"
                  max="2100"
                  value={formData.establishedYear ?? ''}
                  onChange={(e) => handleChange('establishedYear', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 1934"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Idol Height
                </label>
                <input
                  type="text"
                  value={formData.idolHeight || ''}
                  onChange={(e) => handleChange('idolHeight', e.target.value)}
                  placeholder="e.g. 12 to 14 Feet"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Darshan Opening Time
                </label>
                <input
                  type="text"
                  value={formData.darshanStartTime || ''}
                  onChange={(e) => handleChange('darshanStartTime', e.target.value)}
                  placeholder="e.g. 06:00 AM"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Darshan Closing Time
                </label>
                <input
                  type="text"
                  value={formData.darshanEndTime || ''}
                  onChange={(e) => handleChange('darshanEndTime', e.target.value)}
                  placeholder="e.g. 11:30 PM"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>
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
                  placeholder="e.g. 15 - 30 minutes"
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
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Guide & Description */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-bold text-[#1A1A1A]">3. Overview & Highlights</h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Why Visit / Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.whyVisit || formData.description || ''}
                onChange={(e) => {
                  handleChange('whyVisit', e.target.value);
                  handleChange('description', e.target.value);
                }}
                placeholder="Explain what makes this mandal special..."
                className="w-full p-3.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Section 4: GanPass 10 & Stamp Controls */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-bold text-[#1A1A1A]">4. GanPass 10 Circuit & Stamp Options</h3>

            <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#FDFCF9] border border-[#F27D26]/20">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.stampEnabled ?? formData.stamp_enabled)}
                  onChange={(e) => handleChange('stampEnabled', e.target.checked)}
                  className="w-4 h-4 text-[#F27D26] rounded"
                />
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Enable Darshan Stamp
                  </span>
                  <span className="block text-xs text-[#1A1A1A]/50 mt-1">
                    Toggle visibility of the "COLLECT DARSHAN STAMP" section on the public page.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#FDFCF9] border border-[#1A1A1A]/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isFeatured10 || formData.is_featured)}
                  onChange={(e) => handleChange('isFeatured10', e.target.checked)}
                  className="w-4 h-4 text-[#F27D26] rounded"
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
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Publicly Published (Visible to Devotees)
                </span>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link to="/admin/mandals">
              <Button variant="outline" size="md" pill>Cancel</Button>
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