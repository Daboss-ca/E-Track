// src/pages/custodian/CustodianModule.tsx
import { useState } from 'react';
import { CheckCircle, FileText, Monitor } from 'lucide-react';
import AppLayout from '../../components/layouts/AppLayout';
import ValidationHubPage from './ValidationHubPage';
import { ReturnSlipGenerator } from './ReturnSlipGenerator';
import InterOfficeMonitoringPage from './InterOfficeMonitoringPage';

type CustodianAppView = 'validationHub' | 'return-slip' | 'inter-office-monitoring';

export default function CustodianModule() {
  const [currentView, setCurrentView] = useState<CustodianAppView>(() => {
    return (localStorage.getItem('custodian_current_view') as CustodianAppView) || 'validationHub';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRequestId, setActiveRequestId] = useState<string | undefined>(() => {
    return localStorage.getItem('custodian_active_request_id') || undefined;
  });

  const handleNavigate = (view: string, payload?: string) => {  
    setCurrentView(view as CustodianAppView);
    localStorage.setItem('custodian_current_view', view);
    
    if (payload) {
      setActiveRequestId(payload);
      localStorage.setItem('custodian_active_request_id', payload);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'validationHub':
        return <ValidationHubPage onNavigate={handleNavigate} />;
      case 'return-slip':
        return (
          <ReturnSlipGenerator 
            requestId={activeRequestId}
            onNavigate={handleNavigate}
            onSuccess={() => handleNavigate('inter-office-monitoring')} 
          />
        );
      case 'inter-office-monitoring':
        return <InterOfficeMonitoringPage />;
      default:
        return <ValidationHubPage onNavigate={handleNavigate} />;
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