import React from 'react';
import { Link } from 'react-router-dom';
import { Mandal } from '../../types';
import { useStamp } from '../../contexts/StampContext';
import { MapPin, Clock, Award, CheckCircle2, Navigation } from 'lucide-react';

interface MandalCardProps {
  mandal: Mandal;
}

const DEFAULT_CARD_IMAGE =
  'https://images.unsplash.com/photo-1567591370504-80cfd69a68a5?auto=format&fit=crop&w=800&q=80';

export const MandalCard: React.FC<MandalCardProps> = ({ mandal }) => {
  const { hasStamp } = useStamp();
  const mandalId = mandal.id || mandal.slug || (mandal as any)._id || 'unknown';
  const collected = hasStamp(mandalId);
  const imageUrl =
    mandal.heroImageUrl || mandal.image || (mandal as any).hero_image_url || DEFAULT_CARD_IMAGE;

  return (
    <div
      id={`mandal-card-${mandalId}`}
      className="group bg-white border border-[#1A1A1A]/10 rounded-2xl overflow-hidden hover:border-[#1A1A1A]/30 transition-all duration-200 flex flex-col h-full shadow-xs"
    >
      {/* Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1A1A]/5">
        <img
          src={imageUrl}
          alt={mandal.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_CARD_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {mandal.isFeatured10 || mandal.is_featured ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F27D26] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <Award className="w-3 h-3" />
              GanPass 10
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1A1A1A]/80 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider">
              {mandal.category || 'Sarvajanik'}
            </span>
          )}

          {collected && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              Stamped
            </span>
          )}
        </div>

        {/* Bottom Area overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1 text-xs font-semibold opacity-90">
            <MapPin className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>
              {mandal.area} • {mandal.zone || 'Mumbai'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#F27D26] transition-colors leading-snug">
              {mandal.name}
            </h3>
          </div>
          {(mandal.marathiName || mandal.marathi_name) && (
            <p className="text-xs text-[#1A1A1A]/60 font-medium mb-3">
              {mandal.marathiName || mandal.marathi_name} • Est.{' '}
              {mandal.establishedYear || mandal.established_year || '1934'}
            </p>
          )}

          <p className="text-xs text-[#1A1A1A]/70 line-clamp-2 leading-relaxed mb-4">
            {mandal.tagline ||
              mandal.whyVisit ||
              mandal.why_visit ||
              mandal.description ||
              'Explore pandal schedule and darshan queue guide.'}
          </p>
        </div>

        <div>
          {/* Metadata chips */}
          <div className="grid grid-cols-2 gap-2 py-2.5 my-2 border-y border-[#1A1A1A]/8 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#1A1A1A]/70">
              <Clock className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="truncate">
                Wait: {mandal.crowdWaitEstimate || mandal.crowd_wait_estimate || `${mandal.avg_darshan_time_mins || 45} mins`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#1A1A1A]/70 justify-end">
              <span className="font-semibold text-[#1A1A1A]">
                {mandal.nearestStation || mandal.nearest_station || mandal.area}
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <Link
              to={`/mandals/${mandalId}`}
              className="flex-1 text-center py-2 px-3 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#F27D26] transition-colors"
            >
              Explore Mandal
            </Link>
            {(() => {
              const lat = mandal.coordinates?.lat ?? mandal.latitude ?? 18.9912;
              const lng = mandal.coordinates?.lng ?? mandal.longitude ?? 72.8361;
              return (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors"
                  title="Get Directions"
                >
                  <Navigation className="w-4 h-4" />
                </a>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};