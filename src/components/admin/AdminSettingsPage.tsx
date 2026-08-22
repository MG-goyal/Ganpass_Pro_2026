import React, { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/Button';
import { Save, ShieldCheck, Check } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    festivalYear: '2026',
    startDate: '2026-08-25',
    endDate: '2026-09-05',
    circuitCapacity: 10,
    enableStampPassport: true,
    enablePublicPlanner: true,
    enableLiveAdvisories: true,
    contactEmail: 'helpline@ganpass.in',
    emergencyHelpline: '100 / 112',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="pb-16">
      <AdminHeader
        title="System & Festival Configuration"
        subtitle="Global settings for the 2026 Mumbai Ganeshotsav companion system"
      />

      <div className="max-w-3xl mx-auto p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              1. Festival Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Edition Year
                </label>
                <input
                  type="text"
                  value={settings.festivalYear}
                  onChange={(e) => setSettings({ ...settings, festivalYear: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Chaturthi Start Date
                </label>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                  className="w-full px-4 py-2 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Visarjan End Date
                </label>
                <input
                  type="date"
                  value={settings.endDate}
                  onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                  className="w-full px-4 py-2 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              2. Feature Modules
            </h3>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FDFCF9] border border-[#1A1A1A]/10 cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider">
                GanPass 10 Digital Passport Module
              </span>
              <input
                type="checkbox"
                checked={settings.enableStampPassport}
                onChange={(e) =>
                  setSettings({ ...settings, enableStampPassport: e.target.checked })
                }
                className="w-4 h-4 text-[#F27D26]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FDFCF9] border border-[#1A1A1A]/10 cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider">
                Intelligent Spiritual Route Planner
              </span>
              <input
                type="checkbox"
                checked={settings.enablePublicPlanner}
                onChange={(e) =>
                  setSettings({ ...settings, enablePublicPlanner: e.target.checked })
                }
                className="w-4 h-4 text-[#F27D26]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FDFCF9] border border-[#1A1A1A]/10 cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider">
                Live Crowd & Traffic Broadcast Banners
              </span>
              <input
                type="checkbox"
                checked={settings.enableLiveAdvisories}
                onChange={(e) =>
                  setSettings({ ...settings, enableLiveAdvisories: e.target.checked })
                }
                className="w-4 h-4 text-[#F27D26]"
              />
            </label>
          </div>

          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
              3. Support & Emergency Helplines
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Samiti Helpline Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
                  Emergency Control Room Number
                </label>
                <input
                  type="text"
                  value={settings.emergencyHelpline}
                  onChange={(e) =>
                    setSettings({ ...settings, emergencyHelpline: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Settings Saved Successfully
              </span>
            )}
            <Button
              type="submit"
              variant="editorial"
              size="md"
              pill
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Global Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
