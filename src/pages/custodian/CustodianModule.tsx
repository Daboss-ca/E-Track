import { useState } from 'react';
import AppLayout from '../../components/layouts/AppLayout';
import NavIcon from '../../components/navigation/NavIcon';
import CustodianDashboard from './CustodianDashboard';
import { ReturnSlipGenerator } from './ReturnSlipGenerator';
import InterOfficeMonitoringPage from './InterOfficeMonitoringPage';

type CustodianAppView = 'dashboard' | 'return-slip' | 'inter-office-monitoring';

function normalizeCustodianView(view?: string | null): CustodianAppView {
  if (view === 'return-slip') return 'return-slip';
  if (view === 'inter-office-monitoring' || view === 'status-monitoring') {
    return 'inter-office-monitoring';
  }
  return 'dashboard';
}

export default function CustodianModule() {
  const [currentView, setCurrentView] = useState<CustodianAppView>(() => {
    const saved = localStorage.getItem('custodian_current_view');
    return normalizeCustodianView(saved);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRequestId, setActiveRequestId] = useState<string | undefined>(() => {
    return localStorage.getItem('custodian_active_request_id') || undefined;
  });

  const handleNavigate = (view: string, payload?: string) => {
    const nextView = normalizeCustodianView(view);
    setCurrentView(nextView);
    localStorage.setItem('custodian_current_view', nextView);

    if (payload) {
      setActiveRequestId(payload);
      localStorage.setItem('custodian_active_request_id', payload);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <CustodianDashboard
            currentNav={currentView}
            onNavigate={handleNavigate}
          />
        );
      case 'return-slip':
        return (
          <ReturnSlipGenerator
            requestId={activeRequestId}
            onNavigate={handleNavigate}
          />
        );
      case 'inter-office-monitoring':
        return <InterOfficeMonitoringPage />;
      default:
        return (
          <CustodianDashboard
            currentNav={currentView}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  const custodianNavItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <NavIcon variant="dashboard" />,
    },
    {
      id: 'return-slip',
      name: 'Return Slip',
      icon: <NavIcon variant="return-slip" />,
    },
    {
      id: 'inter-office-monitoring',
      name: 'Slip Status',
      icon: <NavIcon variant="status-records" />,
    },
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