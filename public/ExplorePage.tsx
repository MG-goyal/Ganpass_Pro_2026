import React, { useState, useEffect } from 'react';
import { MandalCard } from './MandalCard';
import { mandalService } from '../../services/mandalService';
import { Mandal, FilterState } from '../../types';
import { Search, MapPin, Filter, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export const ExplorePage: React.FC = () => {
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    area: 'All',
    category: 'All',
    featuredOnly: false,
  });

  const fetchLiveMandals = async () => {
    setIsLoading(true);
    try {
      const [mandalList, areaList] = await Promise.all([
        mandalService.getMandals(filters),
        mandalService.getAllAreas(),
      ]);
      setMandals(mandalList);
      setAreas(areaList);
    } catch (err) {
      console.error('Failed to load mandals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMandals();
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] pb-24">
      {/* Header Banner */}
      <div className="bg-white border-b border-[#1A1A1A]/10 py-10 px-6 sm:px-10 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F27D26] block mb-2">
            Verified Directory • Mumbai 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-[#1A1A1A]">
            Explore Sarvajanik Pandals
          </h1>
          <p className="text-sm text-[#1A1A1A]/70 max-w-2xl mt-2">
            Official live registry of Sarvajanik Ganeshotsav Mandals with live queue timings, transit directions, and verified darshan information.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by pandal name, area, or keywords..."
                className="w-full pl-11 pr-4 py-3 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]/30"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={filters.area}
                onChange={(e) => handleFilterChange('area', e.target.value)}
                className="w-full px-4 py-3 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-2xl text-xs font-bold uppercase cursor-pointer focus:outline-none"
              >
                <option value="All">All Neighborhoods</option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('featuredOnly', !filters.featuredOnly)}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                  filters.featuredOnly
                    ? 'bg-[#F27D26] text-white border-[#F27D26]'
                    : 'bg-[#FDFCF9] border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                GanPass 10 Only
              </button>

              <button
                onClick={fetchLiveMandals}
                className="p-3 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-2xl text-[#1A1A1A] hover:bg-white transition-colors"
                title="Refresh Pandals"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pandals Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
            <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
              Fetching Verified Mandals from Database...
            </p>
          </div>
        ) : mandals.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white border border-[#1A1A1A]/10 rounded-3xl p-8">
            <MapPin className="w-12 h-12 text-[#1A1A1A]/30 mb-3" />
            <h3 className="text-xl font-serif-editorial font-bold text-[#1A1A1A] mb-1">
              No Mandals Found
            </h3>
            <p className="text-xs text-[#1A1A1A]/60 max-w-xs mb-4">
              No registered pandals match your current search or filter criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              pill
              onClick={() => setFilters({ search: '', area: 'All', category: 'All', featuredOnly: false })}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                Showing {mandals.length} Verified {mandals.length === 1 ? 'Pandal' : 'Pandals'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mandals.map((mandal) => (
                <MandalCard key={mandal.id || (mandal as any)._id} mandal={mandal} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};