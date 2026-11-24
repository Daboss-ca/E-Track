import { useState } from 'react';
import { FileText, Monitor } from 'lucide-react';
import AppLayout from '../../components/layouts/AppLayout';
import { ReturnSlipGenerator } from './ReturnSlipGenerator';
import InterOfficeMonitoringPage from './InterOfficeMonitoringPage';

type CustodianAppView = 'return-slip' | 'inter-office-monitoring';

export default function CustodianModule() {
  const [currentView, setCurrentView] = useState<CustodianAppView>(() => {
    const saved = localStorage.getItem('custodian_current_view');
    return saved === 'inter-office-monitoring' ? 'inter-office-monitoring' : 'return-slip';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRequestId, setActiveRequestId] = useState<string | undefined>(() => {
    return localStorage.getItem('custodian_active_request_id') || undefined;
  });

  const handleNavigate = (view: string, payload?: string) => {
    const nextView: CustodianAppView =
      view === 'inter-office-monitoring' ? 'inter-office-monitoring' : 'return-slip';
    setCurrentView(nextView);
    localStorage.setItem('custodian_current_view', nextView);

    if (payload) {
      setActiveRequestId(payload);
      localStorage.setItem('custodian_active_request_id', payload);
    }
  };

  const renderView = () => {
    switch (currentView) {
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
          <ReturnSlipGenerator
            requestId={activeRequestId}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  const custodianNavItems = [
    { id: 'return-slip', name: 'Return Slip', icon: <FileText className="h-5 w-5" /> },
    {
      id: 'inter-office-monitoring',
      name: 'Inter-Office Monitoring',
      icon: <Monitor className="h-5 w-5" />,
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