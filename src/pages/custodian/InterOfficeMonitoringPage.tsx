import { useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  Package, 
  Wrench, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';
import TopHeader from '../../components/layouts/TopBar';
import { useInterOfficeTracking, type TrackingStatus } from '../../hooks/custodian/useInterOfficeTracking';

interface InterOfficeMonitoringPageProps {
  currentNav?: string;
  onNavigate?: (view: string) => void;
}

export default function InterOfficeMonitoringPage({
  currentNav,
  onNavigate,
}: InterOfficeMonitoringPageProps) {
  const activeNav = currentNav || 'monitoring';
  const [headerSearch, setHeaderSearch] = useState('');
  const { trackedItems, loading, isLive, refreshData } = useInterOfficeTracking();

  const getStatusConfig = (status: TrackingStatus) => {
    switch (status) {
      case 'pending_supply':
        return { label: 'Pending at Supply', colors: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Package className="w-4 h-4 mr-1" /> };
      case 'dismantling':
        return { label: 'Dismantling in Progress', colors: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Wrench className="w-4 h-4 mr-1" /> };
      case 'completed':
        return { label: 'Disposal Completed', colors: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      default:
        return { label: 'Unknown', colors: 'bg-gray-100 text-gray-700 border-gray-200', icon: <AlertCircle className="w-4 h-4 mr-1" /> };
    }
  };

  const pendingCount = trackedItems.filter(item => item.status === 'pending_supply').length;
  const dismantlingCount = trackedItems.filter(item => item.status === 'dismantling').length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans antialiased">
      {/* Sidebar Integration */}
      <div className="h-full shrink-0">
        <Sidebar
          activeId={activeNav}
          onNavigate={onNavigate || (() => {})}
          onOpenSettings={() => {}}
        />
      </div>

      {/* Main Content Container */}
      <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F3F4F6] overflow-hidden">
        <div className="shrink-0">
          <TopHeader
            searchValue={headerSearch}
            onSearchChange={setHeaderSearch}
            notifications={[]}
            onMarkAllRead={() => {}}
          />
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          
          {/* Header & Live Indicator */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Status Monitoring</h1>
              <p className="mt-0.5 text-[13px] text-gray-400">
                Track return slips and equipment disposal progress in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Real-time Indicator Tag */}
              <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isLive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                {isLive ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    Live Sync Active
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 mr-1.5" />
                    Connecting...
                  </>
                )}
              </div>
              <button 
                onClick={refreshData}
                disabled={loading}
                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
                title="Manual Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pending at Supply</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : pendingCount}</p>
              </div>
              <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Currently Dismantling</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : dismantlingCount}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-[14px] font-semibold text-gray-800">Active Disposal Workflow Queue</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Property No.</th>
                    <th className="px-6 py-3 font-medium">Item Description</th>
                    <th className="px-6 py-3 font-medium">Originating Office</th>
                    <th className="px-6 py-3 font-medium">Workflow Status</th>
                    <th className="px-6 py-3 font-medium">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                        <td className="px-6 py-5"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                        <td className="px-6 py-5"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                        <td className="px-6 py-5"><div className="h-6 w-28 bg-gray-200 rounded-full"></div></td>
                        <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      </tr>
                    ))
                  ) : trackedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                        <p>No pending or active dismantling tasks.</p>
                      </td>
                    </tr>
                  ) : (
                    trackedItems.map((item) => {
                      const statusConfig = getStatusConfig(item.status);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{item.property_number}</td>
                          <td className="px-6 py-4 text-gray-600">{item.item_name}</td>
                          <td className="px-6 py-4 text-gray-600">{item.office_origin}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold border ${statusConfig.colors}`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400">
                            {new Date(item.updated_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}