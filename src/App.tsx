// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import { supabase } from './lib/supabase';

// Faculty Views
import SubmitRequestPage from './pages/faculty/SubmitRequestPage';
import RequestLedgerPage from './pages/faculty/RequestLedgerPage';
import ActivePickupsPage from './pages/faculty/ActivePickupsPage';
import DisposalHistoryPage from './pages/faculty/DisposalHistoryPage';
import { UserDashboard } from './pages/faculty/UserDashboard';

// Custodian View
import ValidationHubPage from './pages/custodian/ValidationHubPage';

export type FacultyAppView = 
  | 'dashboard' 
  | 'requests-new' 
  | 'requests-ledger' 
  | 'tracking-active' 
  | 'tracking-history';

// 1. Sub-component para sa Faculty Navigation
function FacultyLayout() {
  const [currentView, setCurrentView] = useState<FacultyAppView>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <UserDashboard currentNav={currentView} onNavigate={(v) => setCurrentView(v as FacultyAppView)} />;
      case 'requests-new':
        return <SubmitRequestPage onNavigate={(v) => setCurrentView(v as FacultyAppView)} />;
      case 'requests-ledger':
        return <RequestLedgerPage onNavigate={(v) => setCurrentView(v as FacultyAppView)} />;
      case 'tracking-active':
        return <ActivePickupsPage onNavigate={(v) => setCurrentView(v as FacultyAppView)} />;
      case 'tracking-history':
        return <DisposalHistoryPage onNavigate={(v) => setCurrentView(v as FacultyAppView)} />;
      default:
        return <SubmitRequestPage currentNav="requests-new" onNavigate={(v) => setCurrentView(v as FacultyAppView)} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] font-sans antialiased flex flex-col">
      <div className="flex-1 w-full h-full flex flex-col overflow-x-hidden">
        {renderView()}
      </div>
    </div>
  );
}

// 2. Auth State at Role Switcher
function AppContent() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3F4F6]">
        <p className="text-[13px] font-medium text-gray-500 animate-pulse">Loading GreenTrack system...</p>
      </div>
    );
  }

  // Kapag walang naka-login, ipakita ang AuthPage
  if (!user) {
    return <AuthPage />;
  }

  // Role Routing
  if (role === 'custodian') {
    return <ValidationHubPage onNavigate={(view) => console.log(view)} />;
  }

  if (role === 'faculty') {
    return <FacultyLayout />;
  }

  // Fallback para sa ibang roles
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-6 text-center">
      <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Welcome, {user.email}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Your role dashboard (<span className="font-semibold text-gray-700">{role || 'Unassigned'}</span>) is ready.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// 3. Root App Wrapped with BrowserRouter & AuthProvider
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;