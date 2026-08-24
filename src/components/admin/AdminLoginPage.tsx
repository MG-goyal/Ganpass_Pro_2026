import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await loginAdmin(email, password);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col justify-between p-6">
      <div className="p-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-black tracking-tighter text-white">
          GANPASS <span className="text-[#F27D26]">2026</span>
        </Link>
        <Link to="/" className="text-xs uppercase tracking-widest text-white/60 hover:text-white">
          ← Public Portal
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#F27D26] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#F27D26]/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif-editorial font-bold text-white">
            Mandal Board Portal
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Official Administrative Access for GanPass 2026 Mumbai
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ganpass.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F27D26]/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F27D26]/60"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="editorial"
              size="md"
              pill
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Enter Admin Room
            </Button>
          </form>
        </div>
      </div>

      <div className="text-center text-[10px] uppercase tracking-widest text-white/30 p-4">
        © 2026 Mumbai Sarvajanik Ganeshotsav Samiti • GanPass System
      </div>
    </div>
  );
};