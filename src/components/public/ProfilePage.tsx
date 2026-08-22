import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStamp } from '../../contexts/StampContext';
import { initialMandals } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  LogOut,
  Sparkles,
  Calendar,
  CheckCircle2,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { stamps, collectedTotal } = useStamp();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const collectedMandals = initialMandals.filter((m) =>
    stamps.some((s) => s.mandalId === m.id)
  );

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] py-10">
      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        {/* User Identity Card */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#F27D26] text-white flex items-center justify-center text-xl font-bold shadow-md">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">
                    {user.name}
                  </h1>
                  {isAdmin && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F27D26]/15 text-[#F27D26]">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#1A1A1A]/60">{user.email}</p>
                <p className="text-[11px] text-[#1A1A1A]/40 mt-1">
                  Member since Ganesh Chaturthi 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="editorial" size="sm" pill>
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                pill
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Passport Progress Overview */}
        <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="editorial-tag text-[#F27D26] mb-1">
                GanPass 10 Passport Status
              </p>
              <h2 className="text-2xl font-serif-editorial font-bold">
                {collectedTotal === 10
                  ? 'Grand Pilgrimage Completed!'
                  : `${collectedTotal} of 10 Mandals Stamped`}
              </h2>
            </div>

            <Link to="/ganpass">
              <Button variant="editorial" size="sm" pill rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View Stamp Grid
              </Button>
            </Link>
          </div>

          <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[#F27D26] rounded-full transition-all duration-700"
              style={{ width: `${(collectedTotal / 10) * 100}%` }}
            />
          </div>

          {/* Stamped Mandals Summary */}
          {collectedMandals.length > 0 ? (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-xs uppercase tracking-widest text-white/50 font-bold block mb-2">
                Collected Stamps
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {collectedMandals.map((mandal) => (
                  <Link
                    key={mandal.id}
                    to={`/mandals/${mandal.id}`}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#F27D26]" />
                      <span className="text-xs font-bold text-white truncate">
                        {mandal.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/50">{mandal.area}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/60">
              You have not collected any stamps yet. Visit mandals on the GanPass 10 circuit to start your passport!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
