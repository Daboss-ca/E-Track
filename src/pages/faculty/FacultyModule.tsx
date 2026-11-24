import { useState } from 'react';
import { Grid, FileText, List, Truck, History } from 'lucide-react';
import AppLayout from '../../components/layouts/AppLayout';

import SubmitRequestPage from './SubmitRequestPage';
import RequestLedgerPage from './RequestLedgerPage';
import ActivePickupsPage from './ActivePickupsPage';
import DisposalHistoryPage from './DisposalHistoryPage';
import { UserDashboard } from './UserDashboard';

export type FacultyAppView =
  | 'dashboard'
  | 'requests-new'
  | 'requests-ledger'
  | 'tracking-active'
  | 'tracking-history';

const FACULTY_VIEW_STORAGE_KEY = 'faculty_current_view';

export function FacultyModule() {
  const [currentView, setCurrentView] = useState<FacultyAppView>(() => {
    const saved = localStorage.getItem(FACULTY_VIEW_STORAGE_KEY) as FacultyAppView | null;
    return saved || 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (view: string | unknown) => {
    const targetView = (typeof view === 'string' ? view : 'dashboard') as FacultyAppView;
    setCurrentView(targetView);
    localStorage.setItem(FACULTY_VIEW_STORAGE_KEY, targetView);
  };

  const facultyNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Grid className="h-5 w-5" /> },
    { id: 'requests-new', name: 'Submit Request', icon: <FileText className="h-5 w-5" /> },
    { id: 'requests-ledger', name: 'Request Ledger', icon: <List className="h-5 w-5" /> },
    { id: 'tracking-active', name: 'Active Pickups', icon: <Truck className="h-5 w-5" /> },
    { id: 'tracking-history', name: 'Disposal History', icon: <History className="h-5 w-5" /> },
  ];

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
        return <SubmitRequestPage currentNav={currentView} onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppLayout
      activeId={currentView}
      onNavigate={handleNavigate}
      searchValue={searchQuery}
      onSearchChange={(val: string | unknown) => {
        if (typeof val === 'string') {
          setSearchQuery(val);
        } else if (
          val &&
          typeof val === 'object' &&
          'target' in val &&
          val.target &&
          typeof (val.target as HTMLInputElement).value === 'string'
        ) {
          setSearchQuery((val.target as HTMLInputElement).value);
        }
      }}
      navItems={facultyNavItems}
    >
      {renderView()}
    </AppLayout>
  );
}

export default FacultyModule;