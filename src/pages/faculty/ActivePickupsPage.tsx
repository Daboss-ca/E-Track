// src/pages/ActivePickupsPage.tsx
import React, { useState } from 'react';
import { Truck, Search, Calendar, MapPin, User, FileText } from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';
import TopHeader from '../../components/layouts/TopBar';
import { useLifecycleTracking } from '../../hooks/useLifecycleTracking';
import type { UserRole } from '../../types/app';

interface ActivePickupsPageProps {
  onNavigate: (view: string) => void;
}

const ActivePickupsPage: React.FC<ActivePickupsPageProps> = ({ onNavigate }) => {
  const [role, setRole] = useState<UserRole>('Faculty');
  const [headerSearch, setHeaderSearch] = useState('');
  const { pickups, searchQuery, setSearchQuery } = useLifecycleTracking();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans antialiased">
      <div className="h-full shrink-0">
        <Sidebar
          activeId="tracking-active"
          onNavigate={onNavigate}
          userName="Miguel Santos"
          userRole={`${role} · CCS`}
          onOpenSettings={() => {}}
          onLogout={() => window.alert('Logged out')}
        />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F3F4F6] overflow-hidden">
        <div className="shrink-0">
          <TopHeader
            searchValue={headerSearch}
            onSearchChange={setHeaderSearch}
            notifications={[]}
            onMarkAllRead={() => {}}
            currentRole={role}
            onRoleChange={setRole}
            userName="Miguel Santos"
          />
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900 flex items-center gap-2">
                <Truck className="h-6 w-6 text-emerald-600" strokeWidth={2} />
                Active Pickups
              </h1>
              <p className="mt-0.5 text-[13px] text-gray-500">
                Monitor scheduled pickups, transport statuses, and assigned property custodians.
              </p>
            </div>

            <div className="relative w-full sm:w-72 mt-2 sm:mt-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pickup location, tracking code..."
                className="w-full rounded-full border border-gray-200 bg-white py-2 pl-8 pr-3 text-[12.5px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pickups.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <span className="text-[12px] font-bold tracking-wide text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {item.trackingCode}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11.5px] font-medium text-amber-700 border border-amber-200">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-semibold text-gray-800">{item.itemName}</h3>
                  <p className="text-[12px] text-gray-400 mb-4">{item.category} · Qty: {item.quantity}</p>

                  <div className="space-y-2 text-[12.5px] text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>Scheduled: <strong>{item.scheduledDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>Custodian: {item.assignedCustodian}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-2.5 text-[12px] text-gray-500 italic border border-gray-100">
                      "{item.notes}"
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => window.alert(`Printing pickup tag for ${item.trackingCode}`)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Print Tag Slip
                  </button>
                  <span className="text-[11px] text-gray-400">Phase 1 Workflow</span>
                </div>
              </div>
            ))}

            {pickups.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-400">
                No active pickups found matching your search.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActivePickupsPage;