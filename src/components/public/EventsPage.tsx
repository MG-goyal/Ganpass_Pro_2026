import React, { useState, useEffect, useMemo } from 'react';
import { eventService } from '../../services/eventService';
import { mandalService } from '../../services/mandalService';
import { EventCard } from './EventCard';
import { FestivalEvent, EventStatus, Mandal } from '../../types';
import { Search, Calendar, Loader2, Sparkles, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | EventStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const eventTypes = [
    'ALL',
    'Agman',
    'Festival Event',
    'Aarti',
    'Cultural',
    'Visarjan',
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, mandalsData] = await Promise.all([
        eventService.getAllEvents(),
        mandalService.getMandals(),
      ]);
      setEvents(eventsData);
      setMandals(mandalsData);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const mandalMap = useMemo(() => {
    const map = new Map<string, string>();
    mandals.forEach((m) => {
      const mId = m.id || (m as any)._id || m.slug;
      if (mId) map.set(mId, m.name);
    });
    return map;
  }, [mandals]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const title = event.title || event.name || '';
      const desc = event.description || '';
      const loc = event.location || event.locationDescription || event.address || '';
      const status = event.status || 'UPCOMING';
      const type = event.type || 'Festival Event';

      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesTitle = title.toLowerCase().includes(query);
        const matchesDesc = desc.toLowerCase().includes(query);
        const matchesLoc = loc.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
      }

      // Status filter
      if (statusTab !== 'ALL' && status !== statusTab) {
        return false;
      }

      // Event type filter
      if (typeFilter !== 'ALL' && type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, statusTab, typeFilter]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="border-b border-[#1A1A1A]/10 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F27D26]/10 border border-[#F27D26]/30 text-[#F27D26] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Schedule & Live Happenings</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif-editorial font-bold tracking-tight text-[#1A1A1A]">
            Events & Agman Sohala
          </h1>
          <p className="text-sm text-[#1A1A1A]/70 max-w-xl mt-2 leading-relaxed">
            Follow live procession updates, historic Agman arrivals, daily Maha Aartis, and musical celebrations across Mumbai.
          </p>
        </div>

        {/* Status Tabs & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { label: 'All Events', value: 'ALL' },
              { label: 'Live Now', value: 'LIVE', live: true },
              { label: 'Upcoming', value: 'UPCOMING' },
              { label: 'Completed', value: 'COMPLETED' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusTab(tab.value as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  statusTab === tab.value
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:border-[#1A1A1A]/30'
                }`}
              >
                {tab.live && <span className="w-2 h-2 bg-[#F27D26] rounded-full animate-ping" />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#1A1A1A]/15 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40"
            />
          </div>
        </div>

        {/* Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/40 mr-1">
            Type:
          </span>
          {eventTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === type
                  ? 'bg-[#F27D26] text-white'
                  : 'bg-[#1A1A1A]/5 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/10'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
            <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
              Fetching Scheduled Rituals & Events from Database...
            </p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eId = event.id || (event as any)._id;
              const hostId = event.mandal_id || event.mandalId;
              return (
                <EventCard
                  key={eId}
                  event={event}
                  mandalName={hostId ? mandalMap.get(hostId) : undefined}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-12 text-center max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-[#1A1A1A]/30 mx-auto mb-3" />
            <h3 className="text-xl font-serif-editorial font-bold text-[#1A1A1A] mb-1">
              No Events Found
            </h3>
            <p className="text-xs text-[#1A1A1A]/60 mb-4">
              There are no events matching your selected filters or search terms.
            </p>
            <Button
              variant="primary"
              size="sm"
              pill
              onClick={() => {
                setSearchQuery('');
                setStatusTab('ALL');
                setTypeFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};