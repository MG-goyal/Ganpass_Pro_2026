import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStamp } from '../../contexts/StampContext';
import { Button } from '../ui/Button';
import { Menu, X, Award, ShieldCheck, Sparkles, Calendar, Compass, Map } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { collectedTotal } = useStamp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Explore Pandals', path: '/explore', icon: Compass },
    { label: 'GanPass 10', path: '/Ganpass10', icon: Sparkles },
    { label: 'Passport', path: '/passport', icon: Award },
    { label: 'Schedule & Events', path: '/schedule', icon: Calendar },
    { label: 'AI Planner', path: '/planner', icon: Map },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#FDFCF9]/95 backdrop-blur-md border-b border-[#1A1A1A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F27D26] flex items-center justify-center text-white font-serif-editorial font-bold text-lg sm:text-xl shadow-xs group-hover:scale-105 transition-transform">
            ग
          </div>
          <div>
            <span className="font-serif-editorial font-bold text-lg sm:text-xl tracking-tight text-[#1A1A1A] block leading-none">
              GANPASS
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#F27D26] uppercase">
              Mumbai 2026
            </span>
          </div>
        </Link>

        {/* Desktop Navigation (Visible on Large Desktops) */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#1A1A1A]/5 p-1.5 rounded-full border border-[#1A1A1A]/5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                isActive(link.path)
                  ? 'bg-white text-[#1A1A1A] shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls & Stamp Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/passport" className="shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F27D26]" />
              <span>{collectedTotal}/10 <span className="hidden sm:inline">Stamps</span></span>
            </div>
          </Link>

          {isAdmin ? (
            <Link to="/admin" className="hidden sm:block">
              <Button variant="editorial" size="sm" pill leftIcon={<ShieldCheck className="w-4 h-4" />}>
                Admin
              </Button>
            </Link>
          ) : user ? (
            <Button variant="outline" size="sm" pill className="hidden sm:inline-flex text-xs" onClick={logout}>
              Sign Out ({user.name?.split(' ')[0]})
            </Button>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <Button variant="primary" size="sm" pill className="text-xs">
                Sign In
              </Button>
            </Link>
          )}

          {/* Hamburger Menu (Visible on mobile and split screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#1A1A1A]/10 bg-[#FDFCF9] px-6 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#F27D26] text-white'
                    : 'text-[#1A1A1A]/80 hover:bg-[#1A1A1A]/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#1A1A1A]/10 flex flex-col gap-2">
            {isAdmin ? (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="editorial" size="sm" pill className="w-full">
                  Admin Portal
                </Button>
              </Link>
            ) : user ? (
              <Button
                variant="outline"
                size="sm"
                pill
                className="w-full"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                Sign Out
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" pill className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};