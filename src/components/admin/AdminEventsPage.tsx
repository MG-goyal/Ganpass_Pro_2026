import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { mandalService } from '../../services/mandalService';
import { FestivalEvent, Mandal } from '../../types';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit2, Trash2, Calendar, Clock, Eye, MapPin, Loader2 } from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<FestivalEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsList, mandalsList] = await Promise.all([
        adminService.getAllEventsAdmin(),
        mandalService.getMandals(),
      ]);
      setEvents(eventsList);
      setMandals(mandalsList);
    } catch (err) {
      console.error('Failed to load admin events:', err);
      showToast('Failed to load events from backend', 'error');
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const eventId = deleteTarget.id || (deleteTarget as any)._id;
    setIsDeleting(true);
    try {
      await adminService.deleteEvent(eventId);
      showToast(`Event "${deleteTarget.title || 'Event'}" removed`, 'success');
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      showToast(err?.message || 'Failed to delete event from database', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
          Loading Scheduled Events from Database...
        </p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Events & Agman Schedules"
        subtitle={`Managing ${events.length} processions, Maha Aartis, and cultural ceremonies`}
        action={
          <Link to="/admin/events/new">
            <Button variant="editorial" size="sm" pill leftIcon={<Plus className="w-4 h-4" />}>
              Schedule Event
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl overflow-hidden shadow-xs">
          {events.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-[#1A1A1A]/30 mx-auto mb-3" />
              <h3 className="text-xl font-serif-editorial font-bold text-[#1A1A1A] mb-1">
                No Events Scheduled Yet
              </h3>
              <p className="text-xs text-[#1A1A1A]/60 mb-6">
                Publish ritual schedules, Agman Sohla processions, and daily Aarti timings.
              </p>
              <Link to="/admin/events/new">
                <Button variant="primary" size="sm" pill leftIcon={<Plus className="w-4 h-4" />}>
                  Schedule First Event
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFCF9] border-b border-[#1A1A1A]/10 text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60">
                <tr>
                  <th className="py-4 px-6">Event Title</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Host Mandal / Location</th>
                  <th className="py-4 px-4">Timing</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/8">
                {events.map((event) => {
                  const eventId = event.id || (event as any)._id;
                  const hostId = event.mandal_id || event.mandalId;
                  const startStr = event.start_at || event.startTime;
                  const endStr = event.end_at || event.endTime;
                  const status = event.status || 'UPCOMING';

                  return (
                    <tr key={eventId} className="hover:bg-[#FDFCF9]/60 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-sm text-[#1A1A1A] block">
                          {event.title || event.name}
                        </span>
                        <span className="text-[11px] text-[#1A1A1A]/60 line-clamp-1">
                          {event.description}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A] font-bold text-[10px] uppercase">
                          {event.type || 'Event'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-[#1A1A1A]">
                        {hostId ? mandalMap.get(hostId) : event.location || event.locationDescription || 'Mumbai'}
                      </td>
                      <td className="py-4 px-4 text-[#1A1A1A]">
                        <div className="font-semibold">
                          {formatTime(startStr)} - {formatTime(endStr)}
                        </div>
                        <div className="text-[10px] text-[#1A1A1A]/50">
                          {formatDate(startStr)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            status === 'LIVE'
                              ? 'bg-[#F27D26]/20 text-[#F27D26]'
                              : status === 'UPCOMING'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {status === 'LIVE' && (
                            <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full animate-ping" />
                          )}
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/events/${eventId}`}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/events/${eventId}/edit`}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-[#F27D26]"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(event)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Event Removal"
        
      >
        <div className="p-6 text-center">
          <p className="text-sm text-[#1A1A1A]/80 mb-6">
            Are you sure you want to remove{' '}
            <strong>{deleteTarget?.title || deleteTarget?.name || 'this event'}</strong> permanently from the live database?
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              pill
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              pill
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};