import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Award, Calendar, Sparkles, Home } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const items = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Top 10', path: '/circuit', icon: Sparkles },
    { label: 'Passport', path: '/passport', icon: Award },
    { label: 'Events', path: '/schedule', icon: Calendar },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#1A1A1A]/10 px-4 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-[#F27D26]' : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};