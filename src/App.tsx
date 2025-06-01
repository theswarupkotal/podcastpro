import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './components/auth/LoginPage';
import AuthCallback from './components/auth/AuthCallback';

// Main App Pages
import DashboardPage from './components/dashboard/DashboardPage';
import SessionPage from './components/recording/SessionPage';
import RecordingsPage from './components/pages/RecordingsPage';
import ScheduledPage from './components/pages/ScheduledPage';
import SavedPage from './components/pages/SavedPage';
import ArchivePage from './components/pages/ArchivePage';
import GuestsPage from './components/pages/GuestsPage';
import CalendarPage from './components/pages/CalendarPage';
import GuidesPage from './components/pages/GuidesPage';

function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard\" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="recordings" element={<RecordingsPage />} />
          <Route path="scheduled" element={<ScheduledPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="guides" element={<GuidesPage />} />
        </Route>
        
        {/* Session Page (Full Screen) */}
        <Route path="/session/:id" element={<SessionPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard\" replace />} />
      </Routes>
    </Router>
  );
}

export default App;