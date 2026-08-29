import { useState } from 'react';
import { Grid, List, History } from 'lucide-react';
import { SegregatorProvider, useSegregatorContext } from '../../context/segregator/SegregatorContext';

import { DashboardView } from './DashboardView';
import { WorkQueueView } from './WorkQueueView';
import { WorkOrderReviewView } from './WorkOrderReviewView'; 
import { DismantlingWorkspace } from './DismantlingWorkspace';
import { DismantlingSessionWorkspace } from './DismantlingSessionWorkspace';
import { CompletedLogsView } from './CompletedLogsView';

import AppLayout from '../../components/layouts/AppLayout'; 
import type { DismantlingSessionLog, SegregationMode, WorkOrder } from '../../types/segregator/segregator.types';

type SegregatorAppView = 'dashboard' | 'queue' | 'logs' | 'workspace' | 'session-workspace' | 'review';

interface ActiveSession {
  workOrder: WorkOrder;
  mode: SegregationMode;
}

function SegregatorModuleContent() {
  const { workOrders, logs, metrics, setWorkOrderStatus, recordSessionLog } = useSegregatorContext();
  
  const [currentView, setCurrentView] = useState<SegregatorAppView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [reviewTarget, setReviewTarget] = useState<WorkOrder | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [activeItem, setActiveItem] = useState<{ id: string; name: string } | null>(null);

  const handleNavigate = (view: string | unknown) => {
    const targetView = typeof view === 'string' ? view : 'dashboard';
    if (targetView !== 'queue') setReviewTarget(null);
    setActiveItem(null);
    setCurrentView(targetView as SegregatorAppView);
  };

  const handleReview = (workOrder: WorkOrder) => {
    setReviewTarget(workOrder);
    setCurrentView('review');
  };

  const handleStartSession = (mode?: SegregationMode | unknown) => {
    if (!reviewTarget) return;
    
    const safeMode = (typeof mode === 'string' ? mode : 'Manual') as SegregationMode;
    
    setWorkOrderStatus(reviewTarget.id, 'In Progress');
    setActiveSession({ workOrder: reviewTarget, mode: safeMode });
    setReviewTarget(null);
    setActiveItem(null);
    setCurrentView('workspace');
  };

  const handleSelectItem = (itemId: string, itemName: string) => {
    setActiveItem({ id: itemId, name: itemName });
    setCurrentView('session-workspace');
  };

  const handleSessionExit = (log: DismantlingSessionLog) => {
    setWorkOrderStatus(log.workOrderId, log.status === 'completed' ? 'Completed' : 'Pending Quarantine Review');
    recordSessionLog(log);
    setActiveSession(null);
    setActiveItem(null);
    setCurrentView('logs'); 
  };

  const segregatorNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Grid className="h-5 w-5" /> },
    { id: 'queue', name: 'Work Queue', icon: <List className="h-5 w-5" /> },
    { id: 'logs', name: 'Completed Logs', icon: <History className="h-5 w-5" /> },
  ];

  const renderView = () => {
    if (currentView === 'session-workspace' && activeSession && activeItem) {
      return (
        <DismantlingSessionWorkspace
          workOrder={activeSession.workOrder}
          mode={activeSession.mode}
          selectedItemId={activeItem.id}
          selectedItemName={activeItem.name}
          onBack={() => setCurrentView('workspace')} 
          onSubmitSession={handleSessionExit}
        />
      );
    }

    if (currentView === 'workspace' && activeSession) {
      return (
        <DismantlingWorkspace
          workOrder={activeSession.workOrder}
          mode={activeSession.mode}
          onExit={(log) => {
            if (log.status === 'in-progress' && log.durationSeconds === 0) {
              setCurrentView('queue');
              setActiveSession(null);
            }
          }}
          onSelectItem={handleSelectItem}
        />
      );
    }

    if (currentView === 'review' && reviewTarget) {
      return (
        <WorkOrderReviewView
          workOrder={reviewTarget}
          onBack={() => {
            setReviewTarget(null);
            setCurrentView('queue');
          }}
          onStartSession={() => handleStartSession('Manual')}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            metrics={metrics}
            workOrders={workOrders}
            onGoToWorkQueue={() => handleNavigate('queue')}
            onGoToLogs={() => handleNavigate('logs')}
          />
        );
      case 'queue':
        return (
          <WorkQueueView 
            workOrders={workOrders} 
            onReview={handleReview} 
          />
        );
      case 'logs':
        return <CompletedLogsView logs={logs} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      activeId={['workspace', 'session-workspace', 'review'].includes(currentView) ? 'queue' : currentView} 
      onNavigate={handleNavigate}
      searchValue={searchQuery}
      onSearchChange={(val: string | unknown) => {
        if (typeof val === 'string') {
          setSearchQuery(val);
        } else if (val && typeof val === 'object' && 'target' in val && val.target && typeof (val.target as HTMLInputElement).value === 'string') {
          setSearchQuery((val.target as HTMLInputElement).value);
        }
      }}
      navItems={segregatorNavItems}
    >
      {renderView()}
    </AppLayout>
  );
}

export function SegregatorModule() {
  return (
    <SegregatorProvider>
      <SegregatorModuleContent />
    </SegregatorProvider>
  );
}

export default SegregatorModule;