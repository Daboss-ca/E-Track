// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import { supabase } from './lib/supabase';
import AppLayout from './components/layouts/AppLayout';
import { Grid, FileText, List, Truck, History, CheckCircle, Monitor } from 'lucide-react';

import SubmitRequestPage from './pages/faculty/SubmitRequestPage';
import RequestLedgerPage from './pages/faculty/RequestLedgerPage';
import ActivePickupsPage from './pages/faculty/ActivePickupsPage';
import DisposalHistoryPage from './pages/faculty/DisposalHistoryPage';
import { UserDashboard } from './pages/faculty/UserDashboard';

import ValidationHubPage from './pages/custodian/ValidationHubPage';
import { ReturnSlipGenerator } from './pages/custodian/ReturnSlipGenerator';
import InterOfficeMonitoringPage from './pages/custodian/InterOfficeMonitoringPage';

import SegregatorModule from './pages/segregator/SegregatorModule';
import AdminModule from './pages/admin/AdminModule';


export type FacultyAppView = 
  | 'dashboard' 
  | 'requests-new' 
  | 'requests-ledger' 
  | 'tracking-active' 
  | 'tracking-history';

function FacultyLayout() {
  const [currentView, setCurrentView] = useState<FacultyAppView>(() => {
    return (localStorage.getItem('faculty_current_view') as FacultyAppView) || 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (view: string) => {
    setCurrentView(view as FacultyAppView);
    localStorage.setItem('faculty_current_view', view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <UserDashboard currentNav={currentView} onNavigate={handleNavigate} />;
      case 'requests-new':
        return <SubmitRequestPage currentNav={currentView} onNavigate={handleNavigate} />;
      case 'requests-ledger':
        return <RequestLedgerPage currentNav={currentView} onNavigate={handleNavigate} />;
      case 'tracking-active':
        return <ActivePickupsPage onNavigate={handleNavigate} />;
      case 'tracking-history':
        return <DisposalHistoryPage onNavigate={handleNavigate} />;
      default:
        return <SubmitRequestPage onNavigate={handleNavigate} />;
    }
  };

  const facultyNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Grid className="h-5 w-5" /> },
    { id: 'requests-new', name: 'Submit Request', icon: <FileText className="h-5 w-5" /> },
    { id: 'requests-ledger', name: 'Request Ledger', icon: <List className="h-5 w-5" /> },
    { id: 'tracking-active', name: 'Active Pickups', icon: <Truck className="h-5 w-5" /> },
    { id: 'tracking-history', name: 'Disposal History', icon: <History className="h-5 w-5" /> },
  ];

  return (
    <AppLayout
      activeId={currentView}
      onNavigate={handleNavigate}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      navItems={facultyNavItems}
    >
      {renderView()}
    </AppLayout>
  );
}

type CustodianAppView = 'validationHub' | 'return-slip' | 'inter-office-monitoring';

function CustodianLayout() {
  const [currentView, setCurrentView] = useState<CustodianAppView>(() => {
    return (localStorage.getItem('custodian_current_view') as CustodianAppView) || 'inter-office-monitoring';
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (view: string) => {  
    setCurrentView(view as CustodianAppView);
    localStorage.setItem('custodian_current_view', view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'validationHub':
        return <ValidationHubPage currentNav={currentView} onNavigate={handleNavigate} />;
      case 'return-slip':
        return <ReturnSlipGenerator currentNav={currentView} onNavigate={handleNavigate} />;
      case 'inter-office-monitoring':
        return <InterOfficeMonitoringPage currentNav={currentView} onNavigate={handleNavigate} />;
      default:
        return <ValidationHubPage currentNav={currentView} onNavigate={handleNavigate} />;
    }
  };

  const custodianNavItems = [
    { id: 'validationHub', name: 'Validation Hub', icon: <CheckCircle className="h-5 w-5" /> },
    { id: 'return-slip', name: 'Return Slip', icon: <FileText className="h-5 w-5" /> },
    { id: 'inter-office-monitoring', name: 'Inter-Office Monitoring', icon: <Monitor className="h-5 w-5" /> },
  ];

  return (
    <AppLayout
      activeId={currentView}
      onNavigate={handleNavigate}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      navItems={custodianNavItems}
    >
      {renderView()}
    </AppLayout>
  );
}

function SegregatorLayout() {
  return <SegregatorModule />;
}

function AdminLayout() {
  return <AdminModule />;
}


export function AppContent() {
  const { user, role, status } = useAuth(); 

  if (status === 'INITIALIZING' || (status === 'FETCHING_PROFILE' && !user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3F4F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
          <p className="text-[13px] font-medium text-gray-500 animate-pulse">
            Loading E-Track workspace...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'UNAUTHENTICATED') {
    return <AuthPage />;
  }

  if (status === 'UNASSIGNED') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Unassigned Role</h2>
          <p className="mt-1 text-sm text-gray-500">
            Your account (<span className="font-semibold text-gray-700">{user?.email}</span>) has no assigned active role workspace.
          </p>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const effectiveRole = (role === 'offc_staff') ? 'faculty' : role;

  switch (effectiveRole) {
    case 'faculty':
      return <FacultyLayout />;
    case 'custodian':
      return <CustodianLayout />;
    case 'segregator':
      return <SegregatorLayout />;
    case 'admin': // <-- Idinagdag para i-render ang Admin module kapag ang role ay admin[cite: 12]
      return <AdminLayout />;
    default:
      return <AuthPage />;
  }
}

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