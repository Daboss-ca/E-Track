import { useEffect, useState } from 'react';

interface GaugeChartProps {
  currentWeight?: number; // e.g. 1420.50 kg
  maxCapacity?: number;   // e.g. 1800 kg
}

const CENTER_X = 100;
const CENTER_Y = 100;
const RADIUS = 80;
const STROKE_WIDTH = 18;

const GAUGE_ZONES = [
  { from: 0, to: 20, color: '#10B981' },   // Optimal — emerald
  { from: 20, to: 50, color: '#22D3EE' },  // Moderate — cyan
  { from: 50, to: 80, color: '#F59E0B' },  // Warning — amber
  { from: 80, to: 100, color: '#EF4444' }, // Critical — red
];
const SCALE_LABELS = [0, 20, 50, 80, 100];
const ALL_TICKS = Array.from({ length: 11 }, (_, i) => i * 10);

function percentToAngle(percent: number): number {
  return 180 - (percent / 100) * 180;
}

function polarToPoint(radius: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(angleRad),
    y: CENTER_Y - radius * Math.sin(angleRad),
  };
}

function describeArc(radius: number, fromPercent: number, toPercent: number): string {
  const start = polarToPoint(radius, percentToAngle(fromPercent));
  const end = polarToPoint(radius, percentToAngle(toPercent));
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export default function GaugeChart({ currentWeight = 1420.5, maxCapacity = 1800 }: GaugeChartProps) {
  const targetPercentage = Math.min(Math.max(Math.round((currentWeight / maxCapacity) * 100), 0), 100);
  
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(targetPercentage);
    }, 80);
    return () => clearTimeout(timer);
  }, [targetPercentage]);

  const rotationAngle = (animatedPercent / 100) * 180 - 90;

  const readoutColor =
    animatedPercent >= 90 ? 'text-red-500 dark:text-red-400' :
    animatedPercent >= 80 ? 'text-amber-500 dark:text-amber-400' :
    animatedPercent >= 50 ? 'text-amber-600 dark:text-amber-300' :
    'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Industrial dashboard gauge */}
      <div className="relative w-full max-w-[280px] mx-auto aspect-[22/13] my-1">
        <svg viewBox="-10 -10 220 130" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="gaugeGlass" cx="50%" cy="15%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            
            {/* Light mode needle gradient */}
            <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#4B5563" />
            </linearGradient>

            {/* Dark mode bright/white needle gradient dark background */}
            <linearGradient id="darkNeedleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D1D5DB" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#D1D5DB" />
            </linearGradient>

            <radialGradient id="pivotGradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#9CA3AF" />
              <stop offset="60%" stopColor="#374151" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
          </defs>

          <path
            d={describeArc(RADIUS, 0, 100)}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH + 4}
            strokeLinecap="round"
            className="text-gray-100 dark:text-gray-800"
          />

          {GAUGE_ZONES.map((zone) => (
            <path
              key={`${zone.from}-${zone.to}`}
              d={describeArc(RADIUS, zone.from, zone.to)}
              fill="none"
              stroke={zone.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="butt"
            />
          ))}

          <path
            d={describeArc(RADIUS, 0, 100)}
            fill="none"
            stroke="url(#gaugeGlass)"
            strokeWidth={STROKE_WIDTH}
            className="opacity-70 dark:opacity-20"
          />

          {ALL_TICKS.map((tick) => {
            const isMajor = SCALE_LABELS.includes(tick);
            const angle = percentToAngle(tick);
            const inner = polarToPoint(RADIUS + STROKE_WIDTH / 2 + 1, angle);
            const outer = polarToPoint(RADIUS + STROKE_WIDTH / 2 + (isMajor ? 9 : 5), angle);
            return (
              <line
                key={tick}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="currentColor"
                strokeWidth={isMajor ? 1.5 : 1}
                strokeLinecap="round"
                className={isMajor ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-700'}
              />
            );
          })}

          {SCALE_LABELS.map((label) => {
            const pos = polarToPoint(RADIUS + STROKE_WIDTH / 2 + 21, percentToAngle(label));
            return (
              <text
                key={label}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] fill-gray-400 dark:fill-gray-500 font-medium select-none"
              >
                {label}
              </text>
            );
          })}

          {/* Animated Needle dark mode */}
          <polygon
            points={`${CENTER_X - 3},${CENTER_Y + 6} ${CENTER_X + 3},${CENTER_Y + 6} ${CENTER_X},${CENTER_Y - 64}`}
            className="fill-[url(#needleGradient)] dark:fill-[url(#darkNeedleGradient)]"
            transform={`rotate(${rotationAngle} ${CENTER_X} ${CENTER_Y})`}
            style={{ transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="7"
            fill="url(#pivotGradient)"
            stroke="#111827"
            strokeWidth="0.5"
            className="dark:stroke-gray-500"
          />
        </svg>
      </div>

      {/* Clean text readout */}
      <div className="w-full flex flex-col items-center my-1">
        <span className={`text-2xl font-extrabold font-mono tracking-tight ${readoutColor}`}>
          {animatedPercent}%
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Storage Capacity Used</span>
      </div>
    </div>
  );
}