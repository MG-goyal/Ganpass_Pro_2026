import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import { announcementService } from '../../services/announcementService';
import { AlertCircle, Info, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnnouncementBannerProps {
  announcements?: Announcement[];
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcements: propAnnouncements,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(propAnnouncements || []);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    if (!propAnnouncements || propAnnouncements.length === 0) {
      announcementService
        .getActiveAnnouncements()
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setAnnouncements(data);
          }
        })
        .catch(() => {});
    } else {
      setAnnouncements(propAnnouncements);
    }
    return () => {
      isMounted = false;
    };
  }, [propAnnouncements]);

  const activeAnnouncements = announcements.filter((a) => {
    const active = a.is_active ?? a.isActive ?? true;
    return active && !dismissed[a.id];
  });

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {activeAnnouncements.map((item) => {
        const priorityVal = item.priority;
        const isUrgent =
          String(priorityVal) === 'urgent' ||
          String(priorityVal) === 'critical' ||
          Number(priorityVal) >= 3;

        const actionUrl = item.action_url || item.actionUrl;
        const actionLabel = item.action_label || item.actionLabel || 'Details';

        return (
          <div
            key={item.id}
            id={`announcement-${item.id}`}
            className={`px-4 sm:px-6 py-3.5 rounded-2xl flex items-center justify-between gap-4 border transition-all ${
              isUrgent
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#1A1A1A]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-1.5 rounded-lg flex-shrink-0 ${
                  isUrgent ? 'bg-rose-600 text-white' : 'bg-[#F27D26] text-white'
                }`}
              >
                {isUrgent ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider block sm:inline mr-2">
                  {item.title}:
                </span>
                <span className="text-xs font-medium opacity-90">{item.message}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {actionUrl && (
                actionUrl.startsWith('http') ? (
                  <a
                    href={actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline ${
                      isUrgent ? 'text-rose-700' : 'text-[#F27D26]'
                    }`}
                  >
                    <span>{actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to={actionUrl}
                    className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline ${
                      isUrgent ? 'text-rose-700' : 'text-[#F27D26]'
                    }`}
                  >
                    <span>{actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )
              )}
              <button
                type="button"
                onClick={() => setDismissed((prev) => ({ ...prev, [item.id]: true }))}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 transition-opacity cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};