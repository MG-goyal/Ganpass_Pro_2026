import React, { useState } from 'react';
import { useStamp } from '../../contexts/StampContext';
import { useAuth } from '../../contexts/AuthContext';
import { StampGrid } from './StampGrid';
import { StampCelebrationModal } from './StampCelebrationModal';
import { Mandal } from '../../types';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Share2,
  Compass,
  RotateCcw,
  ShieldCheck,
  Award,
  Calendar,
  Loader2,
} from 'lucide-react';

export const GanPassPage: React.FC = () => {
  const { user } = useAuth();
  const { progress, collectedTotal, resetStamps, collectStamp, isLoading } = useStamp();
  const [celebrationMandal, setCelebrationMandal] = useState<Mandal | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCompletedAll = collectedTotal >= 10;

  const handleCollect = async (mandal: Mandal) => {
    const mId = mandal.id || (mandal as any)._id;
    try {
      await collectStamp(mId);
      setCelebrationMandal(mandal);
      setIsCelebrationOpen(true);
    } catch {
      // Handled via toast
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'GanPass 10 - My 2026 Mumbai Darshan Passport',
          text: `I've collected ${collectedTotal} of 10 stamps on my GanPass 2026 Mumbai festival passport!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading && !progress) {
    return (
      <div className="min-h-[70vh] bg-[#FDFCF9] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
          Loading GanPass Digital Passport...
        </p>
      </div>
    );
  }

  const featuredItems = progress?.featured_mandals || [];

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Header & Passport Identity Card */}
        <div className="border-b border-[#1A1A1A]/10 pb-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F27D26]/10 border border-[#F27D26]/30 text-[#F27D26] text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Festival Passport</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif-editorial font-bold tracking-tight text-[#1A1A1A] mb-4">
                GanPass 10 Passport
              </h1>
              <p className="text-base text-[#1A1A1A]/75 max-w-xl leading-relaxed">
                The certified 10-mandals spiritual pilgrimage across Mumbai. Stamp each mandal as you complete your darshan to earn the 2026 Divine Pilgrim verification.
              </p>
            </div>

            {/* Passport Certificate Widget */}
            <div className="lg:col-span-5 bg-[#1A1A1A] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-[#1A1A1A]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#F27D26] text-white">
                  GANPASS 2026 OFFICIAL
                </span>
                <span className="text-xs text-white/60 font-mono">
                  ID: {user?.id ? user.id.slice(0, 8).toUpperCase() : 'PILGRIM-2026'}
                </span>
              </div>

              <div className="mb-6">
                <span className="text-xs text-white/50 uppercase tracking-wider block">
                  Passport Holder
                </span>
                <h3 className="text-2xl font-bold text-white truncate">
                  {user?.name || 'Devotee Guest'}
                </h3>
              </div>

              {/* Fraction Progress */}
              <div className="flex items-end justify-between mb-2">
                <span className="text-4xl font-black italic tracking-tighter font-serif-editorial text-[#F27D26]">
                  0{collectedTotal}
                  <span className="text-xl opacity-50 not-italic font-sans text-white">/10</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                  {isCompletedAll ? 'Pilgrimage Completed' : `${10 - collectedTotal} Stamps Left`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-[#F27D26] transition-all duration-700 rounded-full"
                  style={{ width: `${Math.min((collectedTotal / 10) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                <button
                  type="button"
                  onClick={handleShare}
                  className="font-bold uppercase tracking-wider text-[#F27D26] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Link Copied!' : 'Share Passport'}</span>
                </button>

                {collectedTotal > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all collected stamps?')) {
                        resetStamps();
                      }
                    }}
                    className="text-white/40 hover:text-rose-400 text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 10 Stamp Grid */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">
                The 10 Sacred Mandals
              </h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Click &quot;Collect Stamp&quot; when arriving within GPS proximity of each pandal.
              </p>
            </div>

            <Link to="/plan">
              <Button variant="outline" size="sm" pill rightIcon={<Compass className="w-3.5 h-3.5" />}>
                Plan Itinerary
              </Button>
            </Link>
          </div>

          {featuredItems.length === 0 ? (
            <div className="py-16 text-center bg-white border border-[#1A1A1A]/10 rounded-3xl p-8">
              <Award className="w-10 h-10 text-[#1A1A1A]/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">
                No Circuit Mandals Configured
              </h3>
              <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto mb-4">
                Assign mandals to the Top 10 slots in the Admin Panel to display the live circuit.
              </p>
              <Link to="/explore">
                <Button variant="primary" size="sm" pill>
                  Explore All Mandals
                </Button>
              </Link>
            </div>
          ) : (
            <StampGrid onCollectClick={handleCollect} />
          )}
        </div>

        {/* Pilgrim Verification & FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-[#F27D26] mb-3" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
              GPS-Verified Stamping
            </h4>
            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
              Every stamp validates your device&apos;s proximity coordinates directly at the pandal.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl">
            <Award className="w-6 h-6 text-[#F27D26] mb-3" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
              Souvenir Badge
            </h4>
            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
              Collecting all 10 stamps awards the golden 2026 Mumbai Pilgrim Certificate.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl">
            <Calendar className="w-6 h-6 text-[#F27D26] mb-3" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
              Festival Window
            </h4>
            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
              Valid throughout the 10 days of Ganesh Chaturthi 2026 until Anant Chaturdashi.
            </p>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {celebrationMandal && (
        <StampCelebrationModal
          isOpen={isCelebrationOpen}
          onClose={() => setIsCelebrationOpen(false)}
          mandal={celebrationMandal}
          collectedCount={collectedTotal}
          isAllCompleted={isCompletedAll}
        />
      )}
    </div>
  );
};