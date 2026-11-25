import { useState } from 'react';
import { Boxes } from 'lucide-react';
import AppLayout from '../../components/layouts/AppLayout';
import NavIcon from '../../components/navigation/NavIcon';

import { AdminDashboardView } from './AdminDashboardView';
import { WorkDispatchView } from './WorkDispatchView';
import { InventoryControlView } from './InventoryControlView';
import { AuditLogsReportingView } from './AuditLogsReportingView';

type AdminAppView = 'dashboard' | 'dispatch' | 'inventory' | 'personnel' | 'audit';

export function AdminModule() {
  const [currentView, setCurrentView] = useState<AdminAppView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (view: string | unknown) => {
    const targetView = typeof view === 'string' ? view : 'dashboard';
    setCurrentView(targetView as AdminAppView);
  };

  const adminNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <NavIcon variant="dashboard" /> },
    { id: 'dispatch', name: 'Return Slips', icon: <NavIcon variant="return-slip" /> },
    { id: 'inventory', name: 'Inventory', icon: <Boxes className="h-5 w-5" /> },
    { id: 'audit', name: 'Audit Logs & Reports', icon: <NavIcon variant="status-records" /> },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboardView />;
      case 'dispatch':
        return <WorkDispatchView />;
      case 'inventory':
        return <InventoryControlView />;
      case 'audit':
        return <AuditLogsReportingView />;
      default:
        return <AdminDashboardView />;
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
        } else if (val && typeof val === 'object' && 'target' in val && val.target && typeof (val.target as HTMLInputElement).value === 'string') {
          setSearchQuery((val.target as HTMLInputElement).value);
        }
      }}
      navItems={adminNavItems}
    >
      {renderView()}
    </AppLayout>
  );
}

export default AdminModule;