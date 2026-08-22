import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { Menu, X, ShieldAlert } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
        <div className="w-8 h-8 rounded-full border-4 border-[#F27D26] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Auth gate
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="font-black tracking-tighter text-lg">
            GANPASS <span className="text-[#F27D26]">ADMIN</span>
          </span>
        </Link>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg bg-white/10"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-64 bg-[#1A1A1A] h-full shadow-2xl">
            <AdminSidebar />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#FDFCF9]">
        <Outlet />
      </main>
    </div>
  );
};
