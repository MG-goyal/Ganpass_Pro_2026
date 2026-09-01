import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mandalService } from '../../services/mandalService';
import { eventService } from '../../services/eventService';
import { Mandal, FestivalEvent } from '../../types';
import { useStamp } from '../../contexts/StampContext';
import { Button } from '../ui/Button';
import { StampCelebrationModal } from './StampCelebrationModal';
import { 
  MapPin, 
  Clock, 
  Train, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Navigation, 
  ArrowLeft, 
  Share2, 
  Loader2 
} from 'lucide-react';

const DEFAULT_DETAIL_IMAGE = 'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=1200&q=80';

export const MandalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasStamp, collectStamp, removeStamp, collectedTotal } = useStamp();

  const [mandal, setMandal] = useState<Mandal | null>(null);
  const [nearbyMandals, setNearbyMandals] = useState<Mandal[]>([]);
  const [mandalEvents, setMandalEvents] = useState<FestivalEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMandalData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const fetchedMandal = await mandalService.getMandalById(id);
        if (isMounted && fetchedMandal) {
          setMandal(fetchedMandal);
          const mId = fetchedMandal.id || (fetchedMandal as any)._id || id;

          const [nearby, events] = await Promise.all([
            mandalService.getNearbyMandals(mId),
            eventService.getEventsByMandal ? eventService.getEventsByMandal(mId) : Promise.resolve([])
          ]);

          if (isMounted) {
            setNearbyMandals(nearby || []);
            setMandalEvents(events || []);
          }
        }
      } catch (err) {
        console.error('Failed to load mandal details:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMandalData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
          Loading Mandal Archive...
        </p>
      </div>
    );
  }

  if (!mandal) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif-editorial font-bold mb-2">Mandal Not Found</h2>
        <p className="text-sm text-[#1A1A1A]/70 mb-6">
          The mandal you are looking for does not exist or has been removed.
        </p>
        <Link to="/explore">
          <Button variant="primary" size="sm" pill>
            Back to Explore
          </Button>
        </Link>
      </div>
    );
  }

  // Normalized Identifiers & Media
  const mandalId = mandal.id || (mandal as any).slug || (mandal as any)._id || id || '';
  const isCollected = hasStamp(mandalId);
  const heroImage = mandal.heroImageUrl || mandal.hero_image_url || mandal.image || DEFAULT_DETAIL_IMAGE;

  // Admin-Controlled Dynamic Values
  const establishedYear = mandal.establishedYear ?? mandal.established_year ?? null;
  const darshanStartTime = mandal.darshanStartTime ?? mandal.darshan_start_time ?? null;
  const darshanEndTime = mandal.darshanEndTime ?? mandal.darshan_end_time ?? null;
  const idolHeight = mandal.idolHeight ?? mandal.idol_height ?? null;
  const stampEnabled = mandal.stampEnabled ?? mandal.stamp_enabled ?? true;

  // Formatted Darshan Timings
  const darshanHours = darshanStartTime && darshanEndTime
    ? `${darshanStartTime} – ${darshanEndTime}`
    : darshanStartTime || darshanEndTime || 'Not specified';

  const lat = mandal.coordinates?.lat ?? mandal.latitude ?? 18.9912;
  const lng = mandal.coordinates?.lng ?? mandal.longitude ?? 72.8361;

  const handleCollect = () => {
    if (!stampEnabled) return;
    collectStamp(mandalId);
    setIsCelebrationOpen(true);
  };

  const handleShare = () => {
    const shareData = {
      title: `${mandal.name} - GanPass 2026 Mumbai`,
      text: `Check out ${mandal.name} (${mandal.marathiName || mandal.marathi_name || ''}) on GanPass 2026 Mumbai!`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] pb-16">
      {/* Top Back Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>
      </div>

      {/* Hero Header Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Hero Image */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 shadow-sm">
              <img
                src={heroImage}
                alt={mandal.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_DETAIL_IMAGE;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent" />

              {/* Badges & Share */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                {mandal.isFeatured10 || mandal.is_featured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F27D26] text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    <Award className="w-4 h-4" />
                    GanPass 10 Official Mandal
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A1A1A]/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                    {mandal.category || 'Sarvajanik'}
                  </span>
                )}

                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={handleShare}
                    title={copied ? 'Link Copied!' : 'Share Mandal'}
                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[#1A1A1A] hover:bg-white transition-colors shadow-sm cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Image Overlay Location */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-[#F27D26]" />
                  <span>{mandal.address ? `${mandal.address}, ` : ''}{mandal.area}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 sm:p-8 bg-white border border-[#1A1A1A]/10 rounded-3xl shadow-xs">
              {/* Established Year & Region */}
              <div className="text-xs font-bold uppercase tracking-widest text-[#F27D26] mb-2 flex items-center gap-2">
                <span>{mandal.zone || mandal.area || 'MUMBAI'}</span>
                {establishedYear && (
                  <>
                    <span>•</span>
                    <span>EST. {establishedYear}</span>
                  </>
                )}
              </div>

              {/* Mandal Titles */}
              <h1 className="text-3xl sm:text-4xl font-serif-editorial font-bold text-[#1A1A1A] mb-1 leading-tight">
                {mandal.name}
              </h1>
              {(mandal.marathiName || mandal.marathi_name) && (
                <p className="text-base font-semibold text-[#1A1A1A]/60 mb-4">
                  {mandal.marathiName || mandal.marathi_name}
                </p>
              )}

              {/* Overview Text */}
              <p className="text-sm text-[#1A1A1A]/80 leading-relaxed mb-6 whitespace-pre-line">
                {mandal.description || mandal.whyVisit || mandal.why_visit || 'Verified Sarvajanik Pandal in Mumbai.'}
              </p>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3 py-4 border-y border-[#1A1A1A]/8 text-xs mb-6">
                <div>
                  <span className="block text-[#1A1A1A]/50 font-medium">Nearest Station</span>
                  <span className="font-bold text-[#1A1A1A]">
                    {mandal.nearestStation || mandal.nearest_station || 'Central/Western Line'}
                  </span>
                </div>
                <div>
                  <span className="block text-[#1A1A1A]/50 font-medium">Est. Darshan Queue</span>
                  <span className="font-bold text-[#1A1A1A]">
                    {mandal.crowdWaitEstimate || mandal.crowd_wait_estimate || (mandal.avg_darshan_time_mins ? `${mandal.avg_darshan_time_mins} mins` : 'Not specified')}
                  </span>
                </div>
                <div>
                  <span className="block text-[#1A1A1A]/50 font-medium">Darshan Hours</span>
                  <span className="font-bold text-[#1A1A1A]">{darshanHours}</span>
                </div>
                <div>
                  <span className="block text-[#1A1A1A]/50 font-medium">Idol Height</span>
                  <span className="font-bold text-[#1A1A1A]">{idolHeight || 'Not specified'}</span>
                </div>
              </div>

              {/* Stamp Collection Section (Admin Controllable) */}
              {stampEnabled && (
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isCollected
                      ? 'bg-[#1A1A1A] text-white border-[#F27D26]'
                      : 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#F27D26]" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        GanPass 10 Passport
                      </span>
                    </div>
                    {isCollected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Stamped
                      </span>
                    )}
                  </div>

                  <p className="text-xs opacity-80 mb-4 leading-relaxed">
                    {isCollected
                      ? 'You have collected the verified digital darshan stamp for this mandal!'
                      : 'Mark your presence and collect the official digital darshan stamp into your GanPass passport.'}
                  </p>

                  {isCollected ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Recorded in Passport
                      </span>
                      <button
                        onClick={() => removeStamp(mandalId)}
                        className="text-xs text-rose-300 hover:underline cursor-pointer"
                      >
                        Undo Stamp
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      pill
                      className="w-full"
                      onClick={handleCollect}
                      leftIcon={<Sparkles className="w-4 h-4 text-[#F27D26]" />}
                    >
                      Collect Darshan Stamp
                    </Button>
                  )}
                </div>
              )}

              {/* Google Maps Directions */}
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#1A1A1A] text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Get Google Maps Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Details & Guide Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Body Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* History & Heritage */}
            <div className="p-8 bg-white border border-[#1A1A1A]/10 rounded-3xl">
              <h3 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A] mb-4">
                History & Cultural Significance
              </h3>
              <p className="text-sm text-[#1A1A1A]/80 leading-relaxed whitespace-pre-line mb-6">
                {mandal.history ||
                  (establishedYear
                    ? `${mandal.name} was established in ${establishedYear} during the golden era of the public Ganeshotsav movement. Over the decades, it has become one of Mumbai's most cherished cultural epicenters.`
                    : `${mandal.name} is a cherished cultural center of Mumbai's Ganeshotsav tradition.`)}
              </p>

              {mandal.highlights && mandal.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/70 mb-3">
                    Mandal Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mandal.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 rounded-full text-xs font-medium text-[#1A1A1A]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* How to Reach & Transit */}
            <div className="p-8 bg-white border border-[#1A1A1A]/10 rounded-3xl">
              <h3 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A] mb-4">
                How to Reach & Transit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#FDFCF9] border border-[#1A1A1A]/10 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F27D26] mb-2">
                    <Train className="w-4 h-4" />
                    <span>Local Train</span>
                  </div>
                  <p className="text-xs text-[#1A1A1A]/80 leading-relaxed">
                    Alight at{' '}
                    <strong className="text-[#1A1A1A]">
                      {mandal.nearestStation || mandal.nearest_station || 'Nearest Station'}
                    </strong>{' '}
                    (Central/Western Line). Pandals are accessible via short walking distance or shared auto-rickshaws/taxis.
                  </p>
                </div>

                <div className="p-4 bg-[#FDFCF9] border border-[#1A1A1A]/10 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F27D26] mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Best Time to Visit</span>
                  </div>
                  <p className="text-xs text-[#1A1A1A]/80 leading-relaxed">
                    {darshanStartTime && darshanEndTime ? (
                      <>
                        Darshan is available from{' '}
                        <strong className="text-[#1A1A1A]">{darshanStartTime}</strong> to{' '}
                        <strong className="text-[#1A1A1A]">{darshanEndTime}</strong>.
                      </>
                    ) : (
                      'Darshan timings have not been specified yet.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Events & Rituals */}
            {mandalEvents.length > 0 && (
              <div className="p-8 bg-white border border-[#1A1A1A]/10 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">
                    Events & Rituals
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F27D26]">
                    {mandalEvents.length} Scheduled
                  </span>
                </div>
                <div className="space-y-3">
                  {mandalEvents.map((evt) => (
                    <Link
                      key={evt.id}
                      to={`/events/${evt.id}`}
                      className="block p-4 rounded-2xl border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F27D26]">
                          {evt.type}
                        </span>
                        {evt.startTime && (
                          <span className="text-xs text-[#1A1A1A]/60">
                            {new Date(evt.startTime).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-[#1A1A1A] group-hover:text-[#F27D26] transition-colors">
                        {evt.title}
                      </h4>
                      {evt.description && (
                        <p className="text-xs text-[#1A1A1A]/70 mt-1 line-clamp-1">
                          {evt.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-3xl">
              <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A] mb-4">
                Nearby in {mandal.area || 'Mumbai'}
              </h3>
              <div className="space-y-4">
                {nearbyMandals.slice(0, 4).map((item) => {
                  const itemId = item.id || (item as any).slug || (item as any)._id;
                  const itemImg = item.heroImageUrl || item.hero_image_url || item.image || DEFAULT_DETAIL_IMAGE;

                  return (
                    <Link
                      key={itemId}
                      to={`/mandals/${itemId}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1A1A1A]/5 transition-colors group"
                    >
                      <img
                        src={itemImg}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_DETAIL_IMAGE;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-[#1A1A1A] group-hover:text-[#F27D26] truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-[#1A1A1A]/60 truncate">
                          {item.nearestStation || item.nearest_station || item.area}
                        </p>
                        <span className="text-[10px] text-[#F27D26] font-bold">
                          Wait: {item.crowdWaitEstimate || item.crowd_wait_estimate || '30-45 mins'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-[#1A1A1A]/8">
                <Link to="/plan">
                  <Button variant="editorial" size="sm" pill className="w-full">
                    Add to Route Plan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stamp Celebration Modal */}
      {stampEnabled && (
        <StampCelebrationModal
          isOpen={isCelebrationOpen}
          onClose={() => setIsCelebrationOpen(false)}
          mandal={mandal}
          collectedCount={collectedTotal}
          isAllCompleted={collectedTotal === 10}
        />
      )}
    </div>
  );
};