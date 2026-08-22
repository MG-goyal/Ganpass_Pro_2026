import React, { useState, useEffect } from 'react';
import { announcementService } from '../../services/announcementService';
import { Announcement } from '../../types';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, Megaphone, Loader2, Power } from 'lucide-react';

export const AdminAnnouncementsPage: React.FC = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionLabel, setActionLabel] = useState('View Details');
  const [actionUrl, setActionUrl] = useState('/schedule');
  const [priority, setPriority] = useState<number>(1);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await announcementService.getAllAnnouncementsAdmin();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      showToast('Error loading announcements', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    await announcementService.createAnnouncement({
      title,
      message,
      description: message,
      action_label: actionLabel,
      actionLabel: actionLabel,
      action_url: actionUrl,
      actionUrl: actionUrl,
      priority: Number(priority),
      is_active: true,
      isActive: true,
      is_visible: true,
      isVisible: true,
    });
    showToast('Announcement published live!', 'success');
    setTitle('');
    setMessage('');
    await loadAnnouncements();
  } catch (err: any) {
    showToast(err?.message || 'Failed to create announcement', 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleToggleStatus = async (item: Announcement) => {
    const currentActive = item.is_active ?? item.isActive ?? true;
    const newStatus = !currentActive;
    
    // Optimistic UI update
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, is_active: newStatus, isActive: newStatus } : a))
    );

    try {
      await announcementService.updateAnnouncement(item.id, {
        is_active: newStatus,
        isActive: newStatus,
      });
      showToast(`Announcement ${newStatus ? 'activated' : 'deactivated'}`, 'success');
    } catch (err: any) {
      showToast('Failed to update status', 'error');
      await loadAnnouncements();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    
    // Optimistic UI removal
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    try {
      await announcementService.deleteAnnouncement(id);
      showToast('Announcement removed permanently', 'success');
    } catch (err: any) {
      showToast('Failed to delete announcement', 'error');
      await loadAnnouncements();
    }
  };

  return (
    <div className="pb-16">
      <AdminHeader
        title="Broadcast & Announcements"
        subtitle="Publish emergency crowd advisories, route updates, and live celebration bulletins"
      />
      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-5 bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs h-fit space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#F27D26]" />
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              New Live Broadcast
            </h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Headline / Tag *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VIP Darshan Advisory"
                className="w-full px-3.5 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Message Content *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details of the announcement broadcasted across the header banner..."
                className="w-full p-3 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Button Label
                </label>
                <input
                  type="text"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  placeholder="View Details"
                  className="w-full px-3 py-2 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Link Destination
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="/schedule"
                  className="w-full px-3 py-2 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl font-bold uppercase"
              >
                <option value={1}>Normal Advisory (Priority 1)</option>
                <option value={2}>High Attention (Priority 2)</option>
                <option value={3}>Critical Emergency (Priority 3)</option>
              </select>
            </div>
            <Button
              type="submit"
              variant="editorial"
              size="md"
              pill
              isLoading={isSubmitting}
              className="w-full justify-center mt-2"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Publish Broadcast
            </Button>
          </form>
        </div>

        {/* Existing Announcements List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
            Active & Archived Broadcasts ({announcements.length})
          </h3>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white border border-[#1A1A1A]/10 rounded-3xl">
              <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin mb-2" />
              <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-bold">
                Loading Broadcasts...
              </p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#1A1A1A]/10 rounded-3xl">
              <Megaphone className="w-10 h-10 text-[#1A1A1A]/30 mx-auto mb-3" />
              <p className="text-xs text-[#1A1A1A]/60">
                No announcements published yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => {
                const isActive = ann.is_active ?? ann.isActive ?? true;
                return (
                  <div
                    key={ann.id}
                    className={`bg-white border rounded-3xl p-5 flex items-start justify-between gap-4 transition-all ${
                      isActive
                        ? 'border-[#F27D26]/40 shadow-xs'
                        : 'border-[#1A1A1A]/10 opacity-60'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-[#F27D26] animate-ping' : 'bg-stone-300'
                          }`}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F27D26]">
                          {ann.title}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]/70">
                          Priority {ann.priority}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1A1A1A] leading-relaxed">
                        {ann.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(ann)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                        }`}
                        title={isActive ? 'Deactivate Broadcast' : 'Activate Broadcast'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ann.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Broadcast"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};