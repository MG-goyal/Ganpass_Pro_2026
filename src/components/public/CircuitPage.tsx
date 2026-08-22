import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mandalService } from '../../services/mandalService';
import { Mandal } from '../../types';
import { useStamp } from '../../contexts/StampContext';
import { Button } from '../ui/Button';
import {
  Award,
  Sparkles,
  MapPin,
  Clock,
  Train,
  Navigation,
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=1200&q=80';

export const CircuitPage: React.FC = () => {
  const [topMandals, setTopMandals] = useState<Mandal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { hasStamp, collectStamp } = useStamp();

  useEffect(() => {
    let isMounted = true;
    const fetchGanPass10 = async () => {
      setIsLoading(true);
      try {
        const data = await mandalService.getFeaturedMandals();
        if (isMounted) {
          setTopMandals(data);
        }
      } catch (err) {
        console.error('Failed to load GanPass 10 mandals:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGanPass10();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] pb-24">
      {/* Header Banner */}
      <div className="bg-white border-b border-[#1A1A1A]/10 py-12 px-6 sm:px-10 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F27D26]/10 border border-[#F27D26]/30 text-[#F27D26] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official 2026 Mumbai Darshan</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-[#1A1A1A] leading-tight">
              GanPass 10
            </h1>
            <p className="text-sm text-[#1A1A1A]/75 leading-relaxed">
              Mumbai's top 10 ranked Sarvajanik Ganpati pandals. Explore idol histories, live queue waiting estimates, and nearest railway transit hubs.
            </p>
          </div>

          <Link to="/passport">
            <Button variant="editorial" size="md" pill leftIcon={<Award className="w-4 h-4" />}>
              Open Stamp Passport
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 10 List */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
            <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
              Loading GanPass 10 Pandals...
            </p>
          </div>
        ) : topMandals.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 max-w-xl mx-auto">
            <Award className="w-12 h-12 text-[#1A1A1A]/30 mx-auto mb-3" />
            <h3 className="text-xl font-serif-editorial font-bold text-[#1A1A1A] mb-1">
              No GanPass 10 Pandals Configured
            </h3>
            <p className="text-xs text-[#1A1A1A]/60 mb-6">
              Configure the top 10 slots in the Admin Panel to display the official list.
            </p>
            <Link to="/explore">
              <Button variant="primary" size="sm" pill>
                Explore All Pandals
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {topMandals.map((mandal, index) => {
              const mId = mandal.id || (mandal as any)._id || mandal.slug || '';
              const isStamped = hasStamp(mId);
              const rank = mandal.featured_order || mandal.featuredOrder || index + 1;
              const img =
                mandal.heroImageUrl || mandal.image || (mandal as any).hero_image_url || DEFAULT_IMAGE;
              
              let lat = Number(mandal.coordinates?.lat ?? mandal.latitude ?? 18.9912);
              let lng = Number(mandal.coordinates?.lng ?? mandal.longitude ?? 72.8361);
              if (lat > 70 && lng < 40) {
                const temp = lat;
                lat = lng;
                lng = temp;
              }

              return (
                <div
                  key={mId}
                  className="bg-white border border-[#1A1A1A]/10 rounded-3xl overflow-hidden hover:border-[#1A1A1A]/30 transition-all duration-300 shadow-xs flex flex-col lg:flex-row"
                >
                  {/* Left: Image & Rank Overlay */}
                  <div className="relative lg:w-96 aspect-[16/10] lg:aspect-auto shrink-0 bg-[#1A1A1A]">
                    <img
                      src={img}
                      alt={mandal.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Rank Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-[#F27D26] text-white flex items-center justify-center font-black font-serif-editorial text-lg shadow-md">
                        0{rank}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                        GanPass 10
                      </span>
                    </div>

                    {isStamped && (
                      <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Stamped
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      {(mandal.marathiName || mandal.marathi_name) && (
                        <p className="text-xs text-amber-200 font-serif-editorial mb-0.5">
                          {mandal.marathiName || mandal.marathi_name}
                        </p>
                      )}
                      <h3 className="text-xl font-serif-editorial font-bold leading-tight">
                        {mandal.name}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Content & Actions */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#F27D26]">
                          {mandal.zone || 'Mumbai'} • Est. {mandal.establishedYear || mandal.established_year || '1934'}
                        </span>
                      </div>
                      <p className="text-sm text-[#1A1A1A]/80 leading-relaxed line-clamp-3">
                        {mandal.whyVisit || mandal.why_visit || mandal.description || 'Prominent Mumbai Sarvajanik Ganeshotsav pandal in GanPass 10.'}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-y border-[#1A1A1A]/10 text-xs">
                      <div className="flex items-center gap-2 text-[#1A1A1A]/80">
                        <MapPin className="w-4 h-4 text-[#F27D26] shrink-0" />
                        <span className="truncate">{mandal.area}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#1A1A1A]/80">
                        <Train className="w-4 h-4 text-[#F27D26] shrink-0" />
                        <span className="truncate">{mandal.nearestStation || mandal.nearest_station || 'Local Station'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#1A1A1A]/80">
                        <Clock className="w-4 h-4 text-[#F27D26] shrink-0" />
                        <span>Wait: {mandal.crowdWaitEstimate || mandal.crowd_wait_estimate || `${mandal.avg_darshan_time_mins || 45} mins`}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Link to={`/mandals/${mId}`}>
                          <Button variant="outline" size="sm" pill rightIcon={<ArrowRight className="w-4 h-4" />}>
                            View Full Pandal Guide
                          </Button>
                        </Link>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" pill leftIcon={<Navigation className="w-4 h-4" />}>
                            Directions
                          </Button>
                        </a>
                      </div>

                      <Button
                        variant={isStamped ? 'outline' : 'primary'}
                        size="sm"
                        pill
                        onClick={() => collectStamp(mId)}
                        leftIcon={isStamped ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Award className="w-4 h-4" />}
                      >
                        {isStamped ? 'Collected in Passport' : 'Collect Stamp'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};