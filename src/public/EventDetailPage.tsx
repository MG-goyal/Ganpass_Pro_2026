import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService, computeEventStatus } from '../../services/eventService';
import { mandalService } from '../../services/mandalService';
import { FestivalEvent, Mandal } from '../../types';
import { Button } from '../ui/Button';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  ArrowLeft,
  Loader2,
  Sparkles,
  Share2,
  Building2,
  AlertCircle
} from 'lucide-react';

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=1200&q=80';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<FestivalEvent | null>(null);
  const [hostMandal, setHostMandal] = useState<Mandal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const loadEventDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError('');

      try {
        // Handle both raw data and Axios { data } return types safely
        const res: any = await eventService.getEventById(id);
        const eventData: FestivalEvent = res?.data ? res.data : res;

        if (!eventData || (!eventData.id && !(eventData as any)._id && !(eventData as any).slug)) {
          throw new Error(`Ceremony with ID '${id}' could not be retrieved.`);
        }

        if (isMounted) {
          setEvent(eventData);
        }

        // Fetch host mandal safely without blocking event render if not found
        const mId = eventData.mandal_id || eventData.mandalId;
        if (mId && mId.trim() !== '') {
          try {
            const mandalRes: any = await mandalService.getMandalById(mId);
            const mandalData: Mandal = mandalRes?.data ? mandalRes.data : mandalRes;
            if (isMounted && mandalData) {
              setHostMandal(mandalData);
            }
          } catch (mErr) {
            console.warn('Optional host mandal data could not be fetched:', mErr);
          }
        }
      } catch (err: any) {
        console.error('Failed to load event details:', err);
        if (isMounted) {
          setError(err?.message || 'Ceremony details unavailable.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEventDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFCF9]">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
          Loading Ceremony Details...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-[#FDFCF9]">
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-10 max-w-md w-full shadow-xs space-y-4">
          <AlertCircle className="w-12 h-12 text-[#F27D26] mx-auto" />
          <h2 className="text-xl font-serif-editorial font-bold text-[#1A1A1A]">
            Event Details Not Found
          </h2>
          <p className="text-xs text-[#1A1A1A]/60">
            {error || 'The requested event is unavailable or may have been removed.'}
          </p>
          <div className="pt-2">
            <Link to="/schedule">
              <Button variant="primary" size="sm" pill leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Live Schedule
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startStr = event.start_at || event.startTime;
  const endStr = event.end_at || event.endTime;
  const status = event.status || computeEventStatus(startStr, endStr);
  const img = event.heroImageUrl || event.image || DEFAULT_EVENT_IMAGE;

  // Resolve coordinates: Event coordinates -> Host Mandal coordinates -> Mumbai Center fallback
  let lat = Number(
    event.latitude ??
    event.coordinates?.lat ??
    hostMandal?.coordinates?.lat ??
    hostMandal?.latitude ??
    18.9912
  );
  let lng = Number(
    event.longitude ??
    event.coordinates?.lng ??
    hostMandal?.coordinates?.lng ??
    hostMandal?.longitude ??
    72.8361
  );

  if (lat > 70 && lng < 40) {
    const temp = lat;
    lat = lng;
    lng = temp;
  }

  const locationTitle =
    event.location ||
    event.locationDescription ||
    hostMandal?.name ||
    'Mumbai Pandal Venue';

  const addressText =
    event.address ||
    hostMandal?.address ||
    hostMandal?.area ||
    'Mumbai, Maharashtra';

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'TBD';
    try {
      return new Date(isoString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'TBD';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Festival Day';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Festival Day';
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title || event.name,
          text: `Check out ${event.title || event.name} on GanPass Mumbai 2026!`,
          url: window.location.href,
        });
      } catch (err) {
        console.warn('Share cancelled:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] pb-24">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-[#1A1A1A]/10 py-4 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#F27D26] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Schedules & Rituals</span>
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-xs font-bold tracking-wider transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 pt-8 space-y-8">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[280px] bg-[#1A1A1A] shadow-sm">
          <img
            src={img}
            alt={event.title || event.name || 'Ceremony Banner'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_EVENT_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#F27D26] text-white text-xs font-bold tracking-widest uppercase shadow-sm">
              {event.type || 'Agman'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                status === 'LIVE'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : status === 'UPCOMING'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-700 text-white/90'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Official 2026 Mumbai Celebration</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold leading-tight">
              {event.title || event.name}
            </h1>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-serif-editorial font-bold mb-4">
                Ceremony & Timing Schedule
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-[#1A1A1A]/10 text-xs">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#F27D26] mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-[#1A1A1A]/50 uppercase tracking-wider mb-0.5">
                      Event Date
                    </span>
                    <span className="text-sm font-semibold text-[#1A1A1A]">
                      {formatDate(startStr)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#F27D26] mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-[#1A1A1A]/50 uppercase tracking-wider mb-0.5">
                      Ritual Hours (IST)
                    </span>
                    <span className="text-sm font-semibold text-[#1A1A1A]">
                      {formatTime(startStr)} — {formatTime(endStr)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-2">
                  Event Description & Devotee Guidelines
                </h3>
                <p className="text-sm text-[#1A1A1A]/80 leading-relaxed whitespace-pre-line">
                  {event.description ||
                    'Join the auspicious gathering, devotional Maha Aarti rituals, and cultural celebrations.'}
                </p>
              </div>
            </div>

            {/* Host Mandal Section */}
            {hostMandal && (
              <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F27D26]/10 border border-[#F27D26]/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 text-[#F27D26]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26]">
                      Host Mandal
                    </span>
                    <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
                      {hostMandal.name}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/60">
                      {hostMandal.area} • {hostMandal.zone || 'Mumbai'}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/mandals/${hostMandal.id || (hostMandal as any)._id || hostMandal.slug}`}
                  className="shrink-0"
                >
                  <Button variant="outline" size="sm" pill>
                    View Mandal Page
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Location & Transit Navigation Card */}
          <div className="space-y-6">
            <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-[#F27D26]">
                <MapPin className="w-5 h-5" />
                <h3 className="font-serif-editorial font-bold text-lg text-[#1A1A1A]">
                  Venue & Location
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">
                    Location / Route
                  </span>
                  <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">
                    {locationTitle}
                  </p>
                </div>

                {addressText && (
                  <div>
                    <span className="font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">
                      Full Address
                    </span>
                    <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                      {addressText}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="primary"
                    size="md"
                    pill
                    className="w-full justify-center"
                    leftIcon={<Navigation className="w-4 h-4" />}
                  >
                    Get Live Directions
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};