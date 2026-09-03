import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  plannerService,
  PlannerResult,
  PlannerRequestPayload,
  PlannerStop,
} from '../../services/plannerService';
import { Button } from '../ui/Button';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  Navigation,
  ArrowRight,
  Loader2,
  Train,
  Sliders,
  Car,
  Footprints,
  Bike,
  Bus,
  Layers,
} from 'lucide-react';

export const PlanPage: React.FC = () => {
  const [startingLocation, setStartingLocation] = useState<string>('Dadar Station Hub');
  const [lat, setLat] = useState<number>(18.9912);
  const [lng, setLng] = useState<number>(72.8361);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [maxStops, setMaxStops] = useState<number>(4);
  const [travelMode, setTravelMode] = useState<PlannerRequestPayload['travel_mode']>('Train');
  const [visitPref, setVisitPref] = useState<PlannerRequestPayload['visit_preference']>('Featured 10');

  const [locating, setLocating] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [plan, setPlan] = useState<PlannerResult | null>(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setStartingLocation('Current GPS Location');
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setLocating(false);
        alert('Could not obtain current location. Defaulting to Central Mumbai.');
      }
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const payload: PlannerRequestPayload = {
        starting_location: startingLocation,
        start_coords: { lat, lng },
        start_time: startTime,
        travel_mode: travelMode,
        visit_preference: visitPref,
        max_stops: maxStops,
      };
      const data = await plannerService.generatePlan(payload);
      setPlan(data);
    } catch (err) {
      console.error('Failed to generate route plan:', err);
      alert('Failed to generate pilgrimage itinerary. Verify backend connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getGoogleMapsUrl = () => {
    if (!plan || plan.stops.length === 0) return '#';
    const waypoints = plan.stops
      .map((s: PlannerStop) => {
        let sLat = Number(s.mandal?.coordinates?.lat ?? (s.mandal as any)?.latitude ?? 18.9912);
        let sLng = Number(s.mandal?.coordinates?.lng ?? (s.mandal as any)?.longitude ?? 72.8361);
        if (sLat > 70 && sLng < 40) {
          const temp = sLat;
          sLat = sLng;
          sLng = temp;
        }
        return `${sLat},${sLng}`;
      })
      .join('|');

    const dest = plan.stops[plan.stops.length - 1];
    let destLat = Number(dest.mandal?.coordinates?.lat ?? (dest.mandal as any)?.latitude ?? 18.9912);
    let destLng = Number(dest.mandal?.coordinates?.lng ?? (dest.mandal as any)?.longitude ?? 72.8361);
    if (destLat > 70 && destLng < 40) {
      const temp = destLat;
      destLat = destLng;
      destLng = temp;
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${destLat},${destLng}&waypoints=${waypoints}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] pb-24">
      {/* Header Banner */}
      <div className="bg-white border-b border-[#1A1A1A]/10 py-12 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F27D26]/10 border border-[#F27D26]/30 text-[#F27D26] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Darshan Itinerary Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-[#1A1A1A]">
            Mumbai Darshan Route Planner
          </h1>
          <p className="text-sm text-[#1A1A1A]/70 max-w-2xl leading-relaxed">
            Generate an optimal pilgrimage itinerary complete with transit hop timings, darshan queues, and safety buffers.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Card */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 h-fit">
          <div className="flex items-center gap-2 font-serif-editorial font-bold text-lg text-[#1A1A1A]">
            <Sliders className="w-5 h-5 text-[#F27D26]" />
            <span>Route Parameters</span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5 text-xs">
            {/* Starting Location */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                  Starting Point
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="text-[#F27D26] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{locating ? 'Detecting...' : 'Use My GPS'}</span>
                </button>
              </div>
              <input
                type="text"
                value={startingLocation}
                onChange={(e) => setStartingLocation(e.target.value)}
                placeholder="e.g. Dadar West Station"
                className="w-full px-3.5 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
              />
            </div>

            {/* Start Time & Stops */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Max Pandals: {maxStops}
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={maxStops}
                  onChange={(e) => setMaxStops(parseInt(e.target.value, 10))}
                  className="w-full mt-2 accent-[#F27D26] cursor-pointer"
                />
              </div>
            </div>

            {/* Travel Mode */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-2">
                Travel Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Train', value: 'Train', icon: Train },
                  { label: 'Car/Cab', value: 'Car', icon: Car },
                  { label: 'Walking', value: 'Walking', icon: Footprints },
                  { label: 'Bus', value: 'Bus', icon: Bus },
                  { label: 'Bike', value: 'Bike', icon: Bike },
                  { label: 'Mixed', value: 'Mixed', icon: Layers },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setTravelMode(mode.value as any)}
                      className={`p-2 rounded-xl font-bold uppercase tracking-wider border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        travelMode === mode.value
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-[#FDFCF9] border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:border-[#1A1A1A]/30'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[9px]">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preference */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-2">
                Pilgrimage Filter
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Featured 10', 'Famous', 'Cultural', 'All'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setVisitPref(p as any)}
                    className={`py-2 px-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border text-center transition-all cursor-pointer ${
                      visitPref === p
                        ? 'bg-[#F27D26] text-white border-[#F27D26]'
                        : 'bg-[#FDFCF9] border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:border-[#1A1A1A]/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              pill
              isLoading={isGenerating}
              className="w-full justify-center mt-2"
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Generate Itinerary
            </Button>
          </form>
        </div>

        {/* Results Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {!plan && !isGenerating ? (
            <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-12 text-center max-w-lg mx-auto">
              <Compass className="w-12 h-12 text-[#1A1A1A]/30 mx-auto mb-3" />
              <h3 className="text-xl font-serif-editorial font-bold text-[#1A1A1A] mb-1">
                Ready to Plan Your Pilgrimage
              </h3>
              <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                Choose your start hub and travel mode to compute an optimized darshan schedule with crowd buffers.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-white border border-[#1A1A1A]/10 rounded-3xl">
              <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
              <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
                Optimizing Route with Haversine Sequencing & Crowd Buffers...
              </p>
            </div>
          ) : plan ? (
            <div className="space-y-6">
              {/* Summary Header */}
              <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#1A1A1A]">
                    {plan.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-[#1A1A1A]/70">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#F27D26]" />
                      Total: ~{Math.round(plan.total_time_mins / 60)}h ({plan.total_time_mins} mins)
                    </span>
                    <span>•</span>
                    <span>Darshan: {plan.total_visit_time_mins}m</span>
                    <span>•</span>
                    <span>Travel: {plan.total_travel_time_mins}m</span>
                    <span>•</span>
                    <span className="text-emerald-600">Buffer: +{plan.buffer_mins}m</span>
                  </div>
                </div>

                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button
                    variant="editorial"
                    size="sm"
                    pill
                    leftIcon={<Navigation className="w-4 h-4" />}
                  >
                    Open in Google Maps
                  </Button>
                </a>
              </div>

              {/* Stop Timeline Cards */}
              <div className="space-y-4">
                {plan.stops.map((stop: PlannerStop) => {
                  const m = stop.mandal;
                  const mId = m?.id || (m as any)?._id || (m as any)?.slug;
                  return (
                    <div
                      key={stop.stop_number}
                      className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 hover:border-[#1A1A1A]/30 transition-colors shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-[#F27D26] text-white flex items-center justify-center font-serif-editorial font-bold text-base shrink-0">
                            0{stop.stop_number}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[#F27D26] uppercase tracking-wider block">
                              {m?.area || 'Mumbai'} • {m?.zone || 'Central'}
                            </span>
                            <h4 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
                              {m?.name}
                            </h4>
                            <p className="text-xs text-[#1A1A1A]/70 line-clamp-1 mt-0.5">
                              {m?.address || (m as any)?.why_visit || 'Sarvajanik pandal'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {mId && (
                            <Link to={`/mandals/${mId}`}>
                              <Button variant="outline" size="sm" pill rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                                Pandal Info
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Timetable Badge Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#1A1A1A]/10 text-xs">
                        <div className="bg-[#FDFCF9] p-2.5 rounded-xl border border-[#1A1A1A]/5">
                          <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Arrival</span>
                          <span className="font-mono font-bold text-[#1A1A1A]">{stop.arrival_time}</span>
                        </div>
                        <div className="bg-[#FDFCF9] p-2.5 rounded-xl border border-[#1A1A1A]/5">
                          <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Darshan Time</span>
                          <span className="font-semibold text-[#1A1A1A]">~{stop.visit_duration_mins} mins</span>
                        </div>
                        <div className="bg-[#FDFCF9] p-2.5 rounded-xl border border-[#1A1A1A]/5">
                          <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Departure</span>
                          <span className="font-mono font-bold text-[#1A1A1A]">{stop.departure_time}</span>
                        </div>
                        <div className="bg-[#FDFCF9] p-2.5 rounded-xl border border-[#1A1A1A]/5">
                          <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Next Hop</span>
                          <span className="font-semibold text-[#1A1A1A]">
                            {stop.travel_distance_next_km > 0
                              ? `${stop.travel_distance_next_km} km (~${stop.travel_to_next_mins}m)`
                              : 'Final Stop'}
                          </span>
                        </div>
                      </div>

                      {stop.travel_tip && (
                        <p className="text-[11px] text-[#1A1A1A]/60 italic">
                          💡 {stop.travel_tip}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};