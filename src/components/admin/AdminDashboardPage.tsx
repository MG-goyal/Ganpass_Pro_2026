import React from 'react';
import { initialMandals, initialEvents, initialAnnouncements } from '../../data/mockData';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Bell,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const totalMandals = initialMandals.length;
  const activeMandals = initialMandals.filter((m) => m.isActive).length;
  const featured10Count = initialMandals.filter((m) => m.isFeatured10).length;
  const activeEvents = initialEvents.length;
  const activeAnnouncements = initialAnnouncements.filter((a) => a.isActive).length;

  return (
    <div>
      <AdminHeader
        title="Command Dashboard"
        subtitle="Real-time festival metrics, mandal operations, and pilgrim activity"
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/mandals/new">
              <Button variant="editorial" size="sm" pill leftIcon={<Plus className="w-4 h-4" />}>
                Add Mandal
              </Button>
            </Link>
            <Link to="/admin/events/new">
              <Button variant="primary" size="sm" pill leftIcon={<Plus className="w-4 h-4" />}>
                Add Event
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/60">
                Verified Mandals
              </span>
              <div className="p-2 bg-[#F27D26]/10 rounded-xl text-[#F27D26]">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1A1A1A]">{activeMandals}</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              100% active & published
            </span>
          </div>

          <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/60">
                Featured 10 Board
              </span>
              <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1A1A1A]">
              {featured10Count} <span className="text-lg font-normal text-stone-400">/ 10</span>
            </div>
            <span className="text-[11px] text-[#F27D26] font-semibold mt-1 block">
              All 10 slots filled
            </span>
          </div>

          <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/60">
                Active Events
              </span>
              <div className="p-2 bg-blue-100 rounded-xl text-blue-800">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1A1A1A]">{activeEvents}</div>
            <span className="text-[11px] text-stone-500 font-semibold mt-1 block">
              Agman & Aarti sessions
            </span>
          </div>

          <div className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/60">
                Broadcast Banners
              </span>
              <div className="p-2 bg-rose-100 rounded-xl text-rose-800">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1A1A1A]">{activeAnnouncements}</div>
            <span className="text-[11px] text-stone-500 font-semibold mt-1 block">
              High priority advisories
            </span>
          </div>
        </div>

        {/* 2-Column Split: Mandals & Live Events */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mandals Table */}
          <div className="lg:col-span-7 bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif-editorial font-bold text-[#1A1A1A]">
                  Mandals Directory
                </h3>
                <p className="text-xs text-[#1A1A1A]/60">
                  Recent mandals and their operational status
                </p>
              </div>
              <Link to="/admin/mandals">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Manage All
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-[#1A1A1A]/8">
              {initialMandals.slice(0, 5).map((mandal) => (
                <div key={mandal.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={mandal.heroImageUrl}
                      alt={mandal.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#1A1A1A] truncate">
                        {mandal.name}
                      </h4>
                      <p className="text-[11px] text-[#1A1A1A]/60">
                        {mandal.area} • Est. {mandal.establishedYear}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {mandal.isFeatured10 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#F27D26]/15 text-[#F27D26] text-[10px] font-bold">
                        Top 10
                      </span>
                    )}
                    <Link to={`/admin/mandals/${mandal.id}/edit`}>
                      <span className="text-xs text-[#1A1A1A]/70 hover:text-[#1A1A1A] font-semibold">
                        Edit
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Operations & Active Announcements */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-[#1A1A1A] text-white rounded-3xl p-6 shadow-md">
              <h3 className="text-xl font-serif-editorial font-bold text-white mb-2">
                Operational Shortcuts
              </h3>
              <p className="text-xs text-white/70 mb-6">
                Fast-track tasks during high traffic festival hours.
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <Link
                  to="/admin/featured"
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-[#F27D26]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Reorder Featured 10 Circuit</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/50" />
                </Link>

                <Link
                  to="/admin/announcements"
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-[#F27D26]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Broadcast Traffic Advisory</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/50" />
                </Link>

                <Link
                  to="/admin/settings"
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#F27D26]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Festival Configuration</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/50" />
                </Link>
              </div>
            </div>

            {/* Broadcast preview */}
            <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#1A1A1A] mb-3">
                Live Public Advisories ({activeAnnouncements})
              </h3>
              <div className="space-y-2">
                {initialAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#FDFCF9] border border-[#1A1A1A]/10 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-[#1A1A1A] mb-1">
                      <span>{item.title}</span>
                      <span className="text-[10px] uppercase font-bold text-[#F27D26]">
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#1A1A1A]/70 line-clamp-1">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
