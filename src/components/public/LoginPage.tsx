import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await loginUser(email, password);
      navigate('/passport');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FDFCF9]">
      <div className="max-w-md w-full bg-white border border-[#1A1A1A]/10 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F27D26]/10 border border-[#F27D26]/30 text-[#F27D26] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Devotee Passport Portal</span>
          </div>
          <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A]">
            Sign In to GanPass
          </h1>
          <p className="text-xs text-[#1A1A1A]/60">
            Access your stamp collection, live pilgrimage itineraries, and digital badges.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devotee@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDFCF9] border border-[#1A1A1A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            pill
            className="w-full justify-center mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Passport
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/60">
          New to GanPass?{' '}
          <Link to="/register" className="font-bold text-[#F27D26] hover:underline">
            Create Devotee Account
          </Link>
        </div>
      </div>
    </div>
  );
};