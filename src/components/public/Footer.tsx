import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1A1A1A]/10 bg-[#FDFCF9] text-[#1A1A1A] mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1A1A1A]/10">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
                GANPASS <span className="text-[#F27D26]">2026</span>
              </span>
            </Link>
            <p className="text-sm text-[#1A1A1A]/70 max-w-sm leading-relaxed">
              Mumbai's official festival companion for Ganesh Chaturthi. Discover verified mandals, plan curated spiritual routes, and collect your 10 digital stamps.
            </p>
            <p className="editorial-tag text-[#F27D26]">
              Mumbai • Ganesh Chaturthi 2026
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]/60">
              <li>
                <Link to="/explore" className="hover:text-[#F27D26] transition-colors">
                  All Mandals
                </Link>
              </li>
              <li>
                <Link to="/plan" className="hover:text-[#F27D26] transition-colors">
                  Plan Spiritual Visit
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#F27D26] transition-colors">
                  Live Agman & Events
                </Link>
              </li>
              <li>
                <Link to="/ganpass" className="hover:text-[#F27D26] transition-colors">
                  GanPass 10 Passport
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
              Companion
            </h4>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]/60">
              <li>
                <Link to="/about" className="hover:text-[#F27D26] transition-colors">
                  Festival Heritage
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#F27D26] transition-colors">
                  My Stamp Passport
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#F27D26] transition-colors">
                  Mandal Board Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/40">
          <span>© 2026 GanPass Mumbai • Discovering the Sacred City</span>
          <div className="flex items-center gap-6">
            <span>Verified Festival Data</span>
            <Link to="/about" className="hover:text-[#1A1A1A] transition-colors">About</Link>
            <Link to="/admin" className="hover:text-[#1A1A1A] transition-colors">Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
