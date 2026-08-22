import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Award, Compass, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] py-12">
      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        {/* Header */}
        <div className="border-b border-[#1A1A1A]/10 pb-8 mb-10 text-center">
          <p className="editorial-tag text-[#F27D26] mb-2">
            Heritage & Mission
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif-editorial font-bold tracking-tight text-[#1A1A1A] mb-4">
            About GanPass 2026
          </h1>
          <p className="text-base text-[#1A1A1A]/70 max-w-xl mx-auto leading-relaxed">
            The civic digital festival companion uniting Mumbai's historic Sarvajanik mandals with modern pilgrim guidance.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="space-y-10">
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 sm:p-12 shadow-xs">
            <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#1A1A1A] mb-4">
              A 133-Year Cultural Legacy
            </h2>
            <p className="text-sm sm:text-base text-[#1A1A1A]/80 leading-relaxed mb-6">
              In 1893, freedom fighter Lokmanya Bal Gangadhar Tilak transformed Ganesh Chaturthi from a private family ritual into a grand public festival (*Sarvajanik Ganeshotsav*) at Keshavji Naik Chawl in Girgaon, Mumbai. The initiative brought together communities across all backgrounds to foster unity, art, discourse, and social reform.
            </p>
            <p className="text-sm sm:text-base text-[#1A1A1A]/80 leading-relaxed">
              Today, Mumbai hosts thousands of pandals celebrated for their breathtaking murti craftsmanship, dramatic thematic decors, and charitable healthcare drives.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl">
              <Award className="w-8 h-8 text-[#F27D26] mb-3" />
              <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                GanPass 10 Passport
              </h3>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                A digital souvenir honoring the 10 most prominent historic mandals across Girgaon, Lalbaug, Matunga, and Fort.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl">
              <Compass className="w-8 h-8 text-[#F27D26] mb-3" />
              <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                Transit & Route Optimization
              </h3>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                Intelligent itinerary calculation that respects local train networks, walking distances, and darshan waiting queues.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-[#F27D26] mb-3" />
              <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                Verified Civic Info
              </h3>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                Directly vetted information regarding queue times, Aarti schedules, safety advisories, and eco-friendly practices.
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="p-8 sm:p-10 bg-[#1A1A1A] text-white rounded-3xl text-center">
            <p className="editorial-tag text-[#F27D26] mb-2">
              Ready to Begin?
            </p>
            <h2 className="text-3xl font-serif-editorial font-bold text-white mb-4">
              Start Your Spiritual Journey Today
            </h2>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
              Create your itinerary, explore verified mandals, and collect your 2026 digital darshan passport stamps.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/plan">
                <Button variant="editorial" size="md" pill>
                  Plan My Visit
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="editorial-outline" size="md" pill className="text-white border-white hover:bg-white hover:text-black">
                  Explore Mandals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
