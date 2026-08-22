import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { StampProvider } from './contexts/StampContext';

// Public components
import { PublicLayout } from './components/public/PublicLayout';
import { HomePage } from './components/public/HomePage';
import { ExplorePage } from './components/public/ExplorePage';
import { MandalDetailPage } from './components/public/MandalDetailPage';
import { PlanPage } from './components/public/PlanPage';
import { GanPassPage } from './components/public/GanPassPage';
import { EventsPage } from './components/public/EventsPage';
import { EventDetailPage } from './components/public/EventDetailPage';
import { AboutPage } from './components/public/AboutPage';
import { LoginPage } from './components/public/LoginPage';
import { RegisterPage } from './components/public/RegisterPage';
import { ProfilePage } from './components/public/ProfilePage';
import { CircuitPage } from './components/public/CircuitPage';

// Admin components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import { AdminMandalsPage } from './components/admin/AdminMandalsPage';
import { AdminMandalFormPage } from './components/admin/AdminMandalFormPage';
import { AdminEventsPage } from './components/admin/AdminEventsPage';
import { AdminEventFormPage } from './components/admin/AdminEventFormPage';
import { AdminAnnouncementsPage } from './components/admin/AdminAnnouncementsPage';
import { AdminFeaturedPage } from './components/admin/AdminFeaturedPage';
import { AdminSettingsPage } from './components/admin/AdminSettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <StampProvider>
          <BrowserRouter>
            <Routes>
              {/* Public App Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />

                {/* Explore Directory */}
                <Route path="explore" element={<ExplorePage />} />
                <Route path="mandals" element={<ExplorePage />} />
                <Route path="mandals/:id" element={<MandalDetailPage />} />

                {/* AI Route Planner */}
                <Route path="plan" element={<PlanPage />} />
                <Route path="planner" element={<PlanPage />} />

                {/* GanPass 10 Circuit (Showcases Top 10 Pandal Rankings) */}
                <Route path="ganpass10" element={<CircuitPage />} />
                <Route path="circuit" element={<CircuitPage />} />

                {/* Digital Passport (Stamp Collection & Devotee Card) */}
                <Route path="passport" element={<GanPassPage />} />
                <Route path="ganpass" element={<GanPassPage />} />

                {/* Events & Agman Schedule */}
                <Route path="events" element={<EventsPage />} />
                <Route path="schedule" element={<EventsPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="schedule/:id" element={<EventDetailPage />} />

                {/* Account & Info */}
                <Route path="about" element={<AboutPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Admin Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="mandals" element={<AdminMandalsPage />} />
                <Route path="mandals/new" element={<AdminMandalFormPage />} />
                <Route path="mandals/:id/edit" element={<AdminMandalFormPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="events/new" element={<AdminEventFormPage />} />
                <Route path="events/:id/edit" element={<AdminEventFormPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
                <Route path="featured" element={<AdminFeaturedPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </StampProvider>
      </AuthProvider>
    </ToastProvider>
  );
}