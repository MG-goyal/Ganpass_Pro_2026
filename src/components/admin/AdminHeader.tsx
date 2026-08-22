import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, ShieldCheck, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, action }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-[#1A1A1A]/10 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#1A1A1A]/60 mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {action}
      </div>
    </header>
  );
};
