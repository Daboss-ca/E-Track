import React, { useMemo, useState } from 'react';
import { ClipboardList, CheckCircle2, ShieldAlert, Cpu, Calendar } from 'lucide-react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { useCapacityGuard } from '../../hooks/admin/useCapacityGuard';
import GaugeChart from '../../components/chart/GaugeChart';
import Card from '../../components/Card/card';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}

function MetricCard({ label, value, icon, accent }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`rounded-lg p-2 ${accent}`}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

type VolumeTier = 'Peak Volume' | 'Moderate' | 'Baseline';

// Fixed monthly hazardous weight thresholds (kg)
const MODERATE_THRESHOLD_KG = 10;
const PEAK_THRESHOLD_KG = 50;
const FIXED_CHART_SCALE_KG = 60;

interface HazardousBarChartProps {
  categories: string[];
  seriesData: number[];
  selectedYear: number;
}

function getFixedVolumeTier(value: number): VolumeTier {
  if (value >= PEAK_THRESHOLD_KG) return 'Peak Volume';
  if (value >= MODERATE_THRESHOLD_KG) return 'Moderate';
  return 'Baseline';
}

const HazardousMonthlyBarChart: React.FC<HazardousBarChartProps> = ({
  categories,
  seriesData,
  selectedYear,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const scaleMaxKg = useMemo(() => {
    const peak = Math.max(...seriesData, 0);
    return Math.max(FIXED_CHART_SCALE_KG, Math.ceil(peak / 10) * 10);
  }, [seriesData]);

  const totalYearKg = useMemo(
    () => Number(seriesData.reduce((sum, val) => sum + (Number(val) || 0), 0).toFixed(2)),
    [seriesData]
  );

  return (
    <div className="w-full pt-1">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Year <strong className="text-gray-800 dark:text-gray-200">{selectedYear}</strong> Hazardous Total:{' '}
          <strong className="font-mono text-emerald-700 dark:text-emerald-400">
            {totalYearKg.toLocaleString()} kg
          </strong>{' '}
          <span className="text-[11px] text-gray-400">
            (Baseline &lt;{MODERATE_THRESHOLD_KG}kg · Moderate {MODERATE_THRESHOLD_KG}–49kg · Peak ≥{PEAK_THRESHOLD_KG}kg)
          </span>
        </span>
        <span className="text-[11px] text-gray-400">Hover a bar to view exact kg &amp; tier</span>
      </div>

      <div className="w-full rounded-xl border border-gray-100 bg-gray-50/40 px-4 pt-6 pb-4 dark:border-gray-800/70 dark:bg-gray-900/30 select-none">
        {/* Plot Area (Top = Peak Volume, Middle = Moderate, Bottom Line = Baseline) */}
        <div className="flex items-stretch gap-3">
          {/* Left Y-Axis Labels aligned strictly to Top, Middle, and Bottom lines */}
          <div className="relative h-52 w-24 shrink-0 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            <span className="absolute top-0 right-0 -translate-y-1/2 leading-none">
              Peak Volume
            </span>
            <span className="absolute top-1/2 right-0 -translate-y-1/2 leading-none">
              Moderate
            </span>
            <span className="absolute bottom-0 right-0 translate-y-1/2 leading-none">
              Baseline
            </span>
          </div>

          {/* Gridlines + Bars */}
          <div className="relative h-52 flex-1">
            {/* 3 Horizontal Reference Lines at 0%, 50%, 100% */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-800" />
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-800" />
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>

            {/* 12 Monthly Bar Columns */}
            <div className="relative z-10 grid h-full grid-cols-12 items-end gap-1.5 sm:gap-2.5">
              {categories.map((month, idx) => {
                const rawVal = Number(seriesData[idx]) || 0;
                const heightPercent =
                  rawVal > 0 ? Math.max(4, Math.min(100, (rawVal / scaleMaxKg) * 100)) : 0;
                const tier = getFixedVolumeTier(rawVal);
                const isHovered = hoveredIdx === idx;
                const alignTooltipRight = idx >= 9;

                return (
                  <div
                    key={month}
                    className="group relative flex h-full flex-col items-center justify-end"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Hover Tooltip showing exact kg & fixed volume tier */}
                    {isHovered && (
                      <div
                        className={`pointer-events-none absolute -top-14 z-30 w-max min-w-[146px] rounded-xl bg-gray-900 px-3 py-2 text-left text-xs text-white shadow-lg dark:bg-gray-800 ${
                          alignTooltipRight ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 font-semibold">
                          <span>
                            {month} {selectedYear}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                              tier === 'Peak Volume'
                                ? 'bg-red-500/20 text-red-300'
                                : tier === 'Moderate'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {tier}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-emerald-300">
                          {rawVal.toFixed(2)} kg
                        </p>
                      </div>
                    )}

                    {/* Bar rising from the Baseline line */}
                    <div className="flex h-full w-full items-end justify-center">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                          rawVal > 0
                            ? 'bg-gradient-to-t from-emerald-500/70 to-emerald-600 shadow-xs group-hover:from-emerald-500 group-hover:to-emerald-700'
                            : 'h-0 bg-transparent'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Separate X-Axis Month Labels Row (below Baseline line) */}
        <div className="mt-3 flex items-center gap-3">
          <div className="w-24 shrink-0" />
          <div className="grid flex-1 grid-cols-12 gap-1.5 sm:gap-2.5 text-center">
            {categories.map((month) => (
              <span
                key={`${month}-label`}
                className="text-[11px] font-medium text-gray-500 dark:text-gray-400"
              >
                {month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export function AdminDashboardView() {
  const {
    metrics,
    selectedYear,
    setSelectedYear,
    availableYears,
    monthlyHazardousData,
    rawCurrentWeight,
    maxCapacity,
  } = useAdminDashboard();

  const capacity = useCapacityGuard(rawCurrentWeight, maxCapacity);

  const gaugeBadgeColor =
    capacity.percentage >= 90
      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-900/50'
      : capacity.percentage >= 80
        ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-900/50'
        : capacity.percentage >= 50
          ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-900/50'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-900/50';

  const dynamicCardStyle =
    capacity.statusLevel === 'critical'
      ? '!bg-red-50/40 !border-red-200 dark:!bg-red-950/20 dark:!border-red-900/50'
      : capacity.statusLevel === 'warning'
        ? '!bg-amber-50/40 !border-amber-200 dark:!bg-amber-950/20 dark:!border-amber-900/50'
        : 'dark:!bg-white/[0.03]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        </div>
      </div>

      {/* Global Alert Banner */}
      {capacity.statusLevel !== 'optimal' && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 shadow-sm ${
            capacity.statusLevel === 'critical'
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300'
              : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300'
          }`}
        >
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <span className="font-bold uppercase tracking-wide mr-2">Alert Indicator:</span>
            {capacity.alertMessage}
          </div>
        </div>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total E-Waste Volume"
          value={metrics.totalEwasteVolume}
          icon={<Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          accent="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <MetricCard
          label="Pending Return Slips"
          value={metrics.pendingReturnSlips}
          icon={<ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          accent="bg-blue-50 dark:bg-blue-500/10"
        />
        <MetricCard
          label="Approved Return Slips"
          value={metrics.arClearedItems}
          icon={<CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          accent="bg-indigo-50 dark:bg-indigo-500/10"
        />
        <MetricCard
          label="System Status"
          value={metrics.systemStatus}
          icon={<ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          accent="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      {/* Grid Section: Monthly Hazardous Parts Analytics & Capacity Guard Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hazardous Parts Per Month Analytics Card */}
        <div className="lg:col-span-2">
          <Card
            className="dark:!bg-white/[0.03]"
            title="Hazardous Parts Monthly Analytics"
            subtitle="Monthly recorded weight (kg) of hazardous e-waste parts across the selected year."
            action={
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <select
                  aria-label="Select year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none dark:text-gray-100 cursor-pointer"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr} className="bg-white dark:bg-gray-900">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            }
          >
            <HazardousMonthlyBarChart
              categories={monthlyHazardousData.categories}
              seriesData={monthlyHazardousData.seriesData}
              selectedYear={selectedYear}
            />
          </Card>
        </div>

        {/* Capacity Guard Monitoring Card */}
        <div className="lg:col-span-1">
          <Card
            className={dynamicCardStyle}
            title="Capacity Guard Monitoring"
            subtitle="Facility storage threshold tracker"
            action={
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${gaugeBadgeColor}`}
              >
                {capacity.statusBadgeText}
              </span>
            }
            footer={
              <div className="w-full flex items-center justify-between text-xs">
                <span>
                  Current Load:{' '}
                  <strong className="text-gray-800 dark:text-gray-200">
                    {capacity.currentWeight} kg
                  </strong>
                </span>
                <span>
                  Max Limit:{' '}
                  <strong className="text-gray-800 dark:text-gray-200">
                    {capacity.maxCapacity} kg
                  </strong>
                </span>
              </div>
            }
          >
            <div className="w-full py-4">
              <GaugeChart
                currentWeight={capacity.currentWeight}
                maxCapacity={capacity.maxCapacity}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardView;