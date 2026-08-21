// src/pages/ActivePickupsPage.tsx
import React from 'react';
import { Truck, Search, Calendar, MapPin, User, FileText, Clock, CheckCircle2 } from 'lucide-react';
import Badge from '../../components/ui/Badge/badge';
import { useLifecycleTracking } from '../../hooks/faculty/useLifecycleTracking';

interface ActivePickupsPageProps {
  onNavigate: (view: string) => void;
}

const ActivePickupsPage: React.FC<ActivePickupsPageProps> = () => {
  const { pickups, searchQuery, setSearchQuery } = useLifecycleTracking();

  const renderStatusBadge = (status: string) => {
    const normalized = String(status).toLowerCase();

    if (normalized.includes('scheduled') || normalized.includes('pending')) {
      return (
        <Badge color="warning" variant="light" size="sm" startIcon={<Clock className="h-3 w-3" />}>
          {status}
        </Badge>
      );
    }

    if (normalized.includes('transit') || normalized.includes('progress')) {
      return (
        <Badge color="info" variant="light" size="sm" startIcon={<Truck className="h-3 w-3" />}>
          {status}
        </Badge>
      );
    }

    if (normalized.includes('completed') || normalized.includes('picked up')) {
      return (
        <Badge color="success" variant="light" size="sm" startIcon={<CheckCircle2 className="h-3 w-3" />}>
          {status}
        </Badge>
      );
    }

    return (
      <Badge color="light" variant="light" size="sm">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-800 dark:text-white/90">
            <Truck className="h-6 w-6 text-emerald-600 dark:text-emerald-500" strokeWidth={2} />
            Active Pickups
          </h1>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Monitor scheduled pickups, transport statuses, and assigned property custodians.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pickup location, tracking..."
            className="w-full rounded-full border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/80 dark:text-white py-2 pl-9 pr-4 text-theme-sm focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Grid of Pickup Cards - Equal Heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pickups.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 sm:p-6 shadow-2xs hover:border-gray-300 dark:hover:border-gray-700 transition-all"
          >
            <div>
              {/* Card Header Tag & Reusable Badge */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3.5 mb-4">
                <span className="font-mono text-xs font-bold tracking-wider text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                  {item.trackingCode}
                </span>
                {renderStatusBadge(item.status)}
              </div>

              {/* Item Info */}
              <h3 className="text-base font-bold text-gray-800 dark:text-white/90">
                {item.itemName}
              </h3>
              <p className="text-theme-xs text-gray-400 dark:text-gray-500 mb-4 mt-0.5">
                {item.category} · <span className="font-semibold text-gray-600 dark:text-gray-300">Qty: {item.quantity}</span>
              </p>

              {/* Details List */}
              <div className="space-y-2.5 text-theme-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>Scheduled: <strong className="text-gray-800 dark:text-gray-200 font-semibold">{item.scheduledDate}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>Custodian: <span className="text-gray-800 dark:text-gray-200 font-medium">{item.assignedCustodian}</span></span>
                </div>
              </div>

              {/* Optional Notes Section */}
              {item.notes && (
                <div className="mt-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 p-3 text-theme-xs text-gray-500 dark:text-gray-400 italic border border-gray-100 dark:border-gray-800">
                  "{item.notes}"
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="mt-6 pt-3.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.alert(`Printing pickup tag for ${item.trackingCode}`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 px-3 py-1.5 text-theme-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-emerald-500/40 hover:bg-emerald-50/50 hover:text-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <FileText className="h-3.5 w-3.5" />
                Print Tag Slip
              </button>
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Phase 1 Workflow
              </span>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {pickups.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02] p-12 text-center text-theme-sm text-gray-400 dark:text-gray-500">
            No active pickups found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivePickupsPage;