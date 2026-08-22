import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStamp } from '../../contexts/StampContext';
import { mandalService } from '../../services/mandalService';
import { eventService } from '../../services/eventService';
import { MandalCard } from '../../components/public/MandalCard';
import { EventCard } from '../../components/public/EventCard';
import { AnnouncementBanner } from '../../components/public/AnnouncementBanner';
import { StampCelebrationModal } from '../../components/public/StampCelebrationModal';
import { Button } from '../../components/ui/Button';
import { Mandal, FestivalEvent } from '../../types';
import {
  Compass,
  MapPin,
  Calendar,
  Award,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
  Loader2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { collectedTotal, collectStamp } = useStamp();

  const [featuredMandals, setFeaturedMandals] = useState<Mandal[]>([]);
  const [liveEvents, setLiveEvents] = useState<FestivalEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [celebrationMandal, setCelebrationMandal] = useState<Mandal | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLiveHomeData = async () => {
      setIsLoading(true);
      try {
        const [mandalsRes, eventsRes] = await Promise.allSettled([
          mandalService.getFeaturedMandals(),
          eventService.getAllEvents(),
        ]);

        const rawMandals =
          mandalsRes.status === 'fulfilled' && Array.isArray(mandalsRes.value)
            ? mandalsRes.value
            : [];

        const rawEvents =
          eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value)
            ? eventsRes.value
            : [];

        if (isMounted) {
          if (rawMandals.length < 6) {
            try {
              const all = await mandalService.getMandals();
              setFeaturedMandals(Array.isArray(all) ? all.slice(0, 6) : []);
            } catch {
              setFeaturedMandals(rawMandals.slice(0, 6));
            }
          } else {
            setFeaturedMandals(rawMandals.slice(0, 6));
          }

          setLiveEvents(rawEvents.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLiveHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const isCompletedAll = (collectedTotal || 0) >= 10;

  const handleCollectStamp = async (mandal: Mandal) => {
    const mId = mandal.id || (mandal as any)._id;
    if (!mId) return;
    try {
      await collectStamp(mId);
      setCelebrationMandal(mandal);
      setIsCelebrationOpen(true);
    } catch {
      // Handled in context toast
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A]">
      {/* Top Announcements Banner */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-6">
        <AnnouncementBanner />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-8 lg:py-12 border-b border-[#1A1A1A]/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 lg:border lg:border-[#1A1A1A]/10 lg:rounded-3xl overflow-hidden bg-[#FDFCF9]">
          {/* Left Column: Headline & Quick Actions */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 lg:border-r lg:border-[#1A1A1A]/10 flex flex-col justify-between">
            <div>
              <p className="text-[#F27D26] font-bold uppercase tracking-[0.3em] text-xs mb-6">
                Mumbai • Ganesh Chaturthi 2026
              </p>

              <h1 className="text-5xl sm:text-7xl lg:text-[80px] leading-[0.92] font-serif-editorial italic font-light tracking-tighter text-[#1A1A1A] mb-8">
                Explore the <br />
                <span className="font-bold not-italic font-sans">Divine Spirit.</span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-[#1A1A1A]/75 max-w-lg mb-10">
                Discover Mumbai&apos;s most iconic mandals, plan your spiritual darshan route, and collect your official 2026 digital stamps in the definitive festival companion.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <Link to="/plan">
                  <Button variant="primary" size="lg" pill className="px-8">
                    Start My Journey
                  </Button>
                </Link>

                <Link to="/schedule">
                  <Button variant="outline" size="lg" pill className="px-8">
                    View Live Events
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t border-[#1A1A1A]/10">
              <div>
                <span className="block text-3xl sm:text-[40px] font-bold tracking-tighter text-[#1A1A1A]">
                  184+
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
                  Verified Mandals
                </span>
              </div>
              <div>
                <span className="block text-3xl sm:text-[40px] font-bold tracking-tighter text-[#1A1A1A]">
                  10
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
                  Days Celebration
                </span>
              </div>
              <div>
                <span className="block text-3xl sm:text-[40px] font-bold tracking-tighter text-[#F27D26]">
                  10
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
                  Passport Stamps
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Saffron Passport Card & Live Events */}
          <div className="lg:col-span-5 bg-[#1A1A1A] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
            {/* Saffron Passport Card */}
            <div className="p-8 bg-[#F27D26] rounded-[28px] relative overflow-hidden shadow-xl text-white">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-2xl font-bold tracking-tight">GanPass 10</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                    2026 Passport
                  </span>
                </div>
                <p className="text-xs text-white/85 mb-6">
                  Your Digital Darshan Stamp Collection
                </p>

                <div className="flex items-end justify-between mb-3">
                  <span className="text-5xl font-black italic tracking-tighter font-serif-editorial">
                    0{collectedTotal || 0}
                    <span className="text-2xl opacity-60 not-italic font-sans">/10</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    {collectedTotal === 10 ? 'Completed' : 'Progress'}
                  </span>
                </div>

                <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((collectedTotal || 0) / 10) * 100, 100)}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to="/passport"
                    className="text-xs font-bold uppercase tracking-widest text-white hover:underline flex items-center gap-1"
                  >
                    <span>View Stamp Passport</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[10px] opacity-80">
                    {Math.max(0, 10 - (collectedTotal || 0))} remaining
                  </span>
                </div>
              </div>

              <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none transform rotate-12">
                <Award className="w-48 h-48 text-white" />
              </div>
            </div>

            {/* Live Events Feed */}
            <div className="flex-1 flex flex-col gap-5">
              <div className="flex items-center justify-between pt-2">
                <h4 className="text-xs uppercase tracking-widest font-bold text-white/90">
                  Happening Now
                </h4>
                <Link
                  to="/schedule"
                  className="flex items-center gap-2 text-xs font-bold text-[#F27D26] uppercase tracking-widest hover:underline"
                >
                  <span className="w-2 h-2 bg-[#F27D26] rounded-full animate-ping" />
                  <span>Live Feed</span>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {isLoading ? (
                  <div className="py-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#F27D26] animate-spin" />
                  </div>
                ) : liveEvents.length === 0 ? (
                  <p className="text-xs text-stone-400 py-3">No rituals scheduled currently.</p>
                ) : (
                  liveEvents.map((evt) => (
                    <Link
                      key={evt.id || (evt as any)._id}
                      to={`/events/${evt.id || (evt as any)._id}`}
                      className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F27D26] to-[#FF9D5C] flex items-center justify-center text-white flex-shrink-0 font-bold text-sm shadow-sm">
                        {evt.type === 'Agman' ? 'AG' : 'EV'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-sm text-white group-hover:text-[#F27D26] transition-colors truncate">
                          {evt.title || (evt as any).name}
                        </h5>
                        <p className="text-[11px] text-white/60 uppercase tracking-wider truncate mb-1">
                          {evt.location || (evt as any).locationDescription || 'Mumbai Pandal'}
                        </p>
                        <span className="text-[9px] bg-white/10 text-white/80 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                          {evt.status || 'Live Ritual'}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Circuit Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#F27D26] mb-2">
              The Official Circuit
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-[#1A1A1A] tracking-tight">
              GanPass 10 Featured Mandals
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 max-w-lg mt-2">
              The most sacred and historic Sarvajanik Ganeshotsav mandals in Mumbai. Visit each to collect your authentic stamp.
            </p>
          </div>

          <Link to="/explore">
            <Button variant="outline" size="sm" pill rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
              View All Mandals
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-2" />
            <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
              Fetching Pandals from Database...
            </p>
          </div>
        ) : featuredMandals.length === 0 ? (
          <p className="text-xs text-stone-500 py-8 text-center">
            No pandals published yet. Configure pandals in the Admin Panel to display them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMandals.map((mandal) => (
              <MandalCard key={mandal.id || (mandal as any)._id} mandal={mandal} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/passport">
            <Button variant="primary" size="md" pill rightIcon={<Award className="w-4 h-4 text-[#F27D26]" />}>
              Open GanPass 10 Digital Passport
            </Button>
          </Link>
        </div>
      </section>

      {/* Plan Your Visit Teaser */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16">
        <div className="bg-[#1A1A1A] text-white rounded-[32px] p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-[#1A1A1A]">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F27D26] mb-4">
              Smart Darshan Engine
            </p>
            <h2 className="text-4xl sm:text-6xl font-serif-editorial italic font-light tracking-tight text-white mb-6">
              Plan Your Spiritual <br />
              <span className="font-bold not-italic font-sans">Route in Mumbai.</span>
            </h2>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8">
              Select your start location, time budget, and must-visit mandals. Our intelligent optimizer builds a realistic timeline accounting for local train links, darshan queues, and Aarti timings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-xs font-semibold uppercase tracking-wider text-white/80">
              <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl">
                <Clock className="w-4 h-4 text-[#F27D26]" />
                <span>Realistic Queue Buffers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl">
                <MapPin className="w-4 h-4 text-[#F27D26]" />
                <span>Local Train Routes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl">
                <Award className="w-4 h-4 text-[#F27D26]" />
                <span>Stamp Auto-Tracking</span>
              </div>
            </div>

            <Link to="/planner">
              <Button
                variant="editorial"
                size="lg"
                pill
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Route Planner
              </Button>
            </Link>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden lg:flex items-center justify-center pointer-events-none">
            <Compass className="w-96 h-96 text-white" />
          </div>
        </div>
      </section>

      {/* Celebration Modal */}
      {celebrationMandal && (
        <StampCelebrationModal
          isOpen={isCelebrationOpen}
          onClose={() => setIsCelebrationOpen(false)}
          mandal={celebrationMandal}
          collectedCount={collectedTotal || 0}
          isAllCompleted={isCompletedAll}
        />
      )}
    </div>
  );
};