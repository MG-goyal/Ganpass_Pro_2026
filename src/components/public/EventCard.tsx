import React from 'react';
import { Link } from 'react-router-dom';
import { FestivalEvent } from '../../types';
import { computeEventStatus } from '../../services/eventService';
import { Clock, MapPin, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: FestivalEvent;
  mandalName?: string;
}

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=800&q=80';

export const EventCard: React.FC<EventCardProps> = ({ event, mandalName }) => {
  const eventId = event.id || (event as any)._id || 'unknown';
  const startStr = event.start_at || event.startTime;
  const endStr = event.end_at || event.endTime;
  const status = event.status || computeEventStatus(startStr, endStr);
  const isLive = status === 'LIVE';
  const isUpcoming = status === 'UPCOMING';

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'TBD';
    try {
      return new Date(isoString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'TBD';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Festival 2026';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Festival 2026';
    }
  };

  return (
    <div
      id={`event-card-${eventId}`}
      className={`border rounded-3xl p-5 transition-all flex flex-col justify-between ${
        isLive
          ? 'bg-white border-[#F27D26] ring-2 ring-[#F27D26]/20 shadow-md'
          : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 shadow-xs'
      }`}
    >
      <div>
        {/* Status header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
            {event.type || 'Festival Event'}
          </span>

          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#F27D26] uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#F27D26] rounded-full animate-ping" />
              <span className="w-2 h-2 bg-[#F27D26] rounded-full -ml-3.5" />
              Live Now
            </span>
          )}

          {isUpcoming && (
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Upcoming
            </span>
          )}

          {!isLive && !isUpcoming && (
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Completed
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/events/${eventId}`} className="group block">
          <h4 className="text-lg font-serif-editorial font-bold text-[#1A1A1A] group-hover:text-[#F27D26] transition-colors leading-snug">
            {event.title || event.name}
          </h4>
        </Link>

        {/* Mandal / Location */}
        <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]/70 mt-1.5 mb-3 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
          <span className="truncate">
            {mandalName || event.location || event.locationDescription || event.address || 'Mumbai'}
          </span>
        </div>

        <p className="text-xs text-[#1A1A1A]/70 line-clamp-2 leading-relaxed mb-4">
          {event.description || 'Celebrate with devotional Maha Aarti rituals and cultural programs.'}
        </p>
      </div>

      <div>
        {/* Timing */}
        <div className="pt-3 border-t border-[#1A1A1A]/8 flex items-center justify-between text-xs">
          <div className="flex flex-col text-[11px] text-[#1A1A1A]/80 font-semibold">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>
                {formatTime(startStr)} - {formatTime(endStr)}
              </span>
            </div>
            <div className="text-[10px] text-[#1A1A1A]/50 mt-0.5 pl-5">
              {formatDate(startStr)}
            </div>
          </div>

          <Link
            to={`/events/${eventId}`}
            className="text-xs font-bold uppercase tracking-wider text-[#F27D26] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};