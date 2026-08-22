import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { AnnouncementBanner } from './AnnouncementBanner';
import { StampCelebrationModal } from './StampCelebrationModal';
import { AIAssistantModal } from './AIAssistantModal';
import { useStamp } from '../../contexts/StampContext';
import { initialAnnouncements } from '../../data/mockData';

export const PublicLayout: React.FC = () => {
  const { isCelebrating, closeCelebration, celebrationMandal, collectedTotal } = useStamp();
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-[#1A1A1A]">
      <AnnouncementBanner announcements={initialAnnouncements} />
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />

      {/* Floating AI Assistant Button */}
      <button
        id="floating-ai-guide-button"
        onClick={() => setIsAiOpen(true)}
        aria-label="Open AI Darshan Assistant"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-amber-300/40 group active:scale-95"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-100 group-hover:rotate-12 transition-transform" />
        </div>
        <span className="font-semibold tracking-wide">AI Darshan Guide</span>
      </button>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {/* Stamp Celebration Modal */}
      <StampCelebrationModal
        isOpen={isCelebrating}
        onClose={closeCelebration}
        mandal={celebrationMandal}
        collectedCount={collectedTotal}
        isAllCompleted={collectedTotal >= 10}
      />
    </div>
  );
};
