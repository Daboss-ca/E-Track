// src/pages/DisposalHistoryPage.tsx
import React from 'react';
import { Archive, Search, Download, CheckCircle2 } from 'lucide-react';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { useLifecycleTracking } from '../../hooks/faculty/useLifecycleTracking';

interface DisposalHistoryPageProps {
  onNavigate?: (view: string) => void;
}

const DisposalHistoryPage: React.FC<DisposalHistoryPageProps> = () => {
  const { disposals, searchQuery, setSearchQuery } = useLifecycleTracking();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-800 dark:text-white/90">
            <Archive className="h-6 w-6 text-emerald-600 dark:text-emerald-500" strokeWidth={2} />
            Disposal History
          </h1>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Completed e-waste records, certificates of safe disposal, and recycled item logs.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certificate, tracking..."
            className="w-full rounded-full border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/80 dark:text-white py-2 pl-9 pr-4 text-theme-sm focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Main Table Container Card */}
      <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 sm:p-6 shadow-2xs">
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800/80">
          <table className="w-full border-collapse text-left text-theme-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/40 text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Tracking Code</th>
                <th className="px-4 py-3.5 font-semibold min-w-[200px]">Item Name</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Disposal Method</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Completed Date</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Certificate No.</th>
                <th className="px-4 py-3.5 font-semibold text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-transparent">
              {disposals.map((item) => (
                <tr 
                  key={item.id} 
                  className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    {item.trackingCode}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-800 dark:text-white/90">{item.itemName}</p>
                    <p className="text-theme-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {item.category} · <span className="font-medium text-gray-600 dark:text-gray-400">Qty: {item.quantity}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge color="success" variant="light" size="sm" startIcon={<CheckCircle2 className="h-3 w-3" />}>
                      {item.disposalMethod}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {item.disposalDate}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {item.certificateNo}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      startIcon={<Download className="h-3.5 w-3.5" />}
                      onClick={() => window.alert(`Downloading ${item.certificateNo}...`)}
                    >
                      Cert PDF
                    </Button>
                  </td>
                </tr>
              ))}
              {disposals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-theme-sm text-gray-400 dark:text-gray-500">
                    No historical disposal records match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DisposalHistoryPage;