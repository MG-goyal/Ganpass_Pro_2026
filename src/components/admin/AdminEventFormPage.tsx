import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/Button';
import { FestivalEvent, Mandal } from '../../types';
import { adminService } from '../../services/adminService';
import { mandalService } from '../../services/mandalService';
import { useToast } from '../../contexts/ToastContext';
import { ArrowLeft, Save, Calendar, Clock, MapPin, Sparkles, Navigation } from 'lucide-react';

export const AdminEventFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id && id !== 'new');

  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<Partial<FestivalEvent>>({
    title: '',
    name: '',
    type: 'Agman',
    description: '',
    mandalId: '',
    mandal_id: '',
    location: '',
    locationDescription: '',
    address: '',
    latitude: 18.9912,
    longitude: 72.8361,
    startTime: '',
    start_at: '',
    endTime: '',
    end_at: '',
    heroImageUrl: 'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=1200&q=80',
    isVisible: true,
    is_visible: true,
  });

  useEffect(() => {
    let isMounted = true;
    mandalService.getMandals().then((data) => {
      if (isMounted) setMandals(data);
    });

    if (isEdit && id) {
      setIsLoading(true);
      adminService.getAllEventsAdmin().then((events) => {
        const found = events.find((e) => (e.id || (e as any)._id || (e as any).slug) === id);
        if (found && isMounted) {
          setFormData({
            ...found,
            title: found.title || found.name || '',
            name: found.title || found.name || '',
            startTime: found.start_at || found.startTime || '',
            start_at: found.start_at || found.startTime || '',
            endTime: found.end_at || found.endTime || '',
            end_at: found.end_at || found.endTime || '',
            mandalId: found.mandal_id || found.mandalId || '',
            mandal_id: found.mandal_id || found.mandalId || '',
            latitude: found.latitude ?? found.coordinates?.lat ?? 18.9912,
            longitude: found.longitude ?? found.coordinates?.lng ?? 72.8361,
          });
          setIsLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isEdit, id]);

  const handleChange = (field: keyof FestivalEvent | string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMandalChange = (mandalId: string) => {
    const selectedMandal = mandals.find((m) => (m.id || (m as any)._id || m.slug) === mandalId);
    
    let mLat = Number(selectedMandal?.latitude ?? selectedMandal?.coordinates?.lat ?? 18.9912);
    let mLng = Number(selectedMandal?.longitude ?? selectedMandal?.coordinates?.lng ?? 72.8361);
    
    // Reverse coordinates fix if detected
    if (mLat > 70 && mLng < 40) {
      const temp = mLat;
      mLat = mLng;
      mLng = temp;
    }

    setFormData((prev) => ({
      ...prev,
      mandalId,
      mandal_id: mandalId,
      location: selectedMandal ? `${selectedMandal.name}, ${selectedMandal.area}` : prev.location,
      address: selectedMandal?.address || prev.address,
      latitude: selectedMandal ? mLat : prev.latitude,
      longitude: selectedMandal ? mLng : prev.longitude,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const startVal = formData.start_at || formData.startTime || new Date().toISOString();
    const endVal = formData.end_at || formData.endTime || startVal;
    const titleVal = formData.title || formData.name || 'Festival Ceremony';
    const latVal = Number(formData.latitude ?? 18.9912);
    const lngVal = Number(formData.longitude ?? 72.8361);

    const payload: Partial<FestivalEvent> = {
      ...formData,
      title: titleVal,
      name: titleVal,
      start_at: startVal,
      startTime: startVal,
      end_at: endVal,
      endTime: endVal,
      latitude: latVal,
      longitude: lngVal,
      coordinates: { lat: latVal, lng: lngVal },
      mandal_id: formData.mandal_id || formData.mandalId || '',
      mandalId: formData.mandal_id || formData.mandalId || '',
      heroImageUrl: formData.heroImageUrl || formData.image,
      image: formData.heroImageUrl || formData.image,
      is_visible: formData.is_visible ?? formData.isVisible ?? true,
      isVisible: formData.is_visible ?? formData.isVisible ?? true,
    };

    try {
      if (isEdit && id) {
        await adminService.updateEvent(id, payload);
        showToast('Event updated successfully', 'success');
      } else {
        await adminService.createEvent(payload);
        showToast('Event scheduled and published successfully', 'success');
      }
      navigate('/admin/events');
    } catch (err: any) {
      console.error('Failed to save event:', err);
      setError(err?.message || 'Failed to save event to database.');
      showToast('Error saving event', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <AdminHeader
        title={isEdit ? `Edit: ${formData.title || 'Event'}` : 'Schedule New Event'}
        subtitle="Configure Agman processions, Maha Aarti timings, exact route coordinates, and public ritual broadcasts"
        action={
          <Link to="/admin/events">
            <Button variant="outline" size="sm" pill leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Events
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
          {/* 1. Identity */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              1. Event & Ritual Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => {
                    handleChange('title', e.target.value);
                    handleChange('name', e.target.value);
                  }}
                  placeholder="e.g. Lalbaugcha Raja Grand Agman Sohla"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Event Type
                </label>
                <select
                  value={formData.type || 'Agman'}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
                >
                  <option value="Agman">Agman</option>
                  <option value="Aarti">Aarti</option>
                  <option value="Festival Event">Festival Event</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Visarjan">Visarjan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Host Mandal (Optional)
              </label>
              <select
                value={formData.mandal_id || formData.mandalId || ''}
                onChange={(e) => handleMandalChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
              >
                <option value="">-- Independent City Event / No Host Mandal --</option>
                {mandals.map((m) => {
                  const mId = m.id || (m as any)._id || m.slug;
                  return (
                    <option key={mId} value={mId}>
                      {m.name} ({m.area})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Location & Route Description
              </label>
              <input
                type="text"
                value={formData.location || formData.locationDescription || ''}
                onChange={(e) => {
                  handleChange('location', e.target.value);
                  handleChange('locationDescription', e.target.value);
                }}
                placeholder="e.g. Lalbaug Flyover to Parel Workshop Route"
                className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Event Description & Schedule Details *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detail procession routes, guest dignitaries, live stream links, and special dhol-tasha pathak performances..."
                className="w-full p-3.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
              />
            </div>
          </div>

          {/* 2. Coordinates & Geo Location */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#F27D26]" />
              <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
                2. Venue Coordinates & Navigation
              </h3>
            </div>
            <p className="text-xs text-[#1A1A1A]/60">
              Provide exact GPS coordinates for the Google Maps direction button on the public page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Latitude (e.g. 18.9912)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude ?? ''}
                  onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                  placeholder="18.9912"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Longitude (e.g. 72.8361)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude ?? ''}
                  onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                  placeholder="72.8361"
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
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
                placeholder="e.g. GD Ambekar Marg, Lalbaug, Parel, Mumbai 400012"
                className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
              />
            </div>
          </div>

          {/* 3. Timetable & Media */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              3. Timetable & Media
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_at || formData.startTime || ''}
                  onChange={(e) => {
                    handleChange('start_at', e.target.value);
                    handleChange('startTime', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_at || formData.endTime || ''}
                  onChange={(e) => {
                    handleChange('end_at', e.target.value);
                    handleChange('endTime', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Hero Image URL
              </label>
              <input
                type="url"
                value={formData.heroImageUrl || formData.image || ''}
                onChange={(e) => {
                  handleChange('heroImageUrl', e.target.value);
                  handleChange('image', e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.is_visible ?? formData.isVisible ?? true)}
                  onChange={(e) => {
                    handleChange('is_visible', e.target.checked);
                    handleChange('isVisible', e.target.checked);
                  }}
                  className="w-4 h-4 text-[#F27D26] rounded focus:ring-[#F27D26]"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Published & Visible to Public Devotees
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link to="/admin/events">
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
              {isEdit ? 'Save Event Changes' : 'Publish Scheduled Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};