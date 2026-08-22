import React from 'react';
import { Mandal } from '../../types';
import { useStamp } from '../../contexts/StampContext';
import { Check, Award, Lock, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StampGridProps {
  onCollectClick?: (mandal: Mandal) => void;
}

export const StampGrid: React.FC<StampGridProps> = ({ onCollectClick }) => {
  const { progress, hasStamp, removeStamp, collectStamp } = useStamp();

  const items = progress?.featured_mandals || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
      {items.map((item, index) => {
        const mandal = item.mandal;
        const mandalId = mandal.id || (mandal as any)._id || `slot-${index + 1}`;
        const collected = hasStamp(mandalId);

        return (
          <div
            key={mandalId}
            id={`stamp-slot-${mandalId}`}
            className={`relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between group overflow-hidden ${
              collected
                ? 'bg-[#1A1A1A] text-white border-[#F27D26]/60 shadow-lg'
                : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 shadow-xs'
            }`}
          >
            {/* Slot Number */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-2xl font-black italic tracking-tighter ${
                  collected ? 'text-[#F27D26]' : 'text-[#1A1A1A]/20'
                }`}
              >
                0{item.collected_order || mandal.featured_order || index + 1}
              </span>
              {collected ? (
                <span className="w-7 h-7 rounded-full bg-[#F27D26] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
              ) : (
                <span className="w-7 h-7 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]/40 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Stamp Circle */}
            <div className="my-2 flex flex-col items-center text-center">
              <div
                className={`w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-2 mb-3 transition-transform group-hover:scale-105 ${
                  collected
                    ? 'border-[#F27D26] bg-[#F27D26]/10 text-white ring-4 ring-[#F27D26]/20'
                    : 'border-[#1A1A1A]/20 bg-[#1A1A1A]/5 text-[#1A1A1A]/40'
                }`}
              >
                {collected ? (
                  <>
                    <Award className="w-6 h-6 text-[#F27D26] mb-0.5" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#F27D26]">
                      DARSHAN
                    </span>
                    <span className="text-[7px] opacity-70">VERIFIED</span>
                  </>
                ) : (
                  <>
                    <Award className="w-6 h-6 opacity-30 mb-0.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">
                      STAMP {index + 1}
                    </span>
                  </>
                )}
              </div>

              <Link
                to={`/mandals/${mandalId}`}
                className={`font-bold text-sm leading-tight hover:underline mb-1 ${
                  collected ? 'text-white' : 'text-[#1A1A1A]'
                }`}
              >
                {mandal.name}
              </Link>
              <div className="flex items-center gap-1 text-[11px] opacity-70">
                <MapPin className="w-3 h-3 text-[#F27D26]" />
                <span>{mandal.area || 'Mumbai'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 mt-2 border-t border-current/10">
              {collected ? (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="opacity-60 text-emerald-400 font-bold">Stamped</span>
                  <button
                    type="button"
                    onClick={() => removeStamp(mandalId)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onCollectClick) {
                      onCollectClick(mandal);
                    } else {
                      collectStamp(mandalId);
                    }
                  }}
                  className="w-full py-1.5 px-3 rounded-full bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#F27D26] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#F27D26]" />
                  Collect Stamp
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};