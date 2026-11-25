import { useState } from 'react';
import AppLayout from '../../components/layouts/AppLayout';
import NavIcon from '../../components/navigation/NavIcon';

import SubmitRequestPage from './SubmitRequestPage';
import RequestLedgerPage from './RequestLedgerPage';
import { UserDashboard } from './UserDashboard';

export type FacultyAppView =
  | 'dashboard'
  | 'requests-new'
  | 'requests-ledger';

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
    { id: 'dashboard', name: 'Dashboard', icon: <NavIcon variant="dashboard" /> },
    { id: 'requests-new', name: 'Return Slip', icon: <NavIcon variant="return-slip" /> },
    { id: 'requests-ledger', name: 'My Submissions', icon: <NavIcon variant="status-records" /> },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <UserDashboard currentNav={currentView} onNavigate={handleNavigate} />;
      case 'requests-new':
        return <SubmitRequestPage currentNav={currentView} onNavigate={handleNavigate} />;
      case 'requests-ledger':
        return <RequestLedgerPage currentNav={currentView} onNavigate={handleNavigate} />;
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