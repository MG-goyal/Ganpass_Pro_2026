import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Bell,
  Award,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Mandals', path: '/admin/mandals', icon: MapPin },
    { label: 'Events & Agman', path: '/admin/events', icon: Calendar },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    { label: 'Featured 10 Board', path: '/admin/featured', icon: Award },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col justify-between border-r border-white/10 shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter text-white">
              GANPASS <span className="text-[#F27D26]">2026</span>
            </span>
          </Link>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#F27D26] block mt-1">
            Mandal Control Room
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#F27D26] text-white shadow-sm'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 text-xs text-white/80 hover:bg-white/10 transition-colors"
        >
          <span className="font-semibold text-[11px] uppercase tracking-wider">Live Public View</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center justify-between px-2 pt-2 text-xs">
          <div className="min-w-0">
            <span className="font-bold block truncate text-white text-[11px]">{user?.name}</span>
            <span className="text-[10px] text-white/40 truncate block">{user?.email}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            title="Sign out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
