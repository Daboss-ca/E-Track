import { useMemo } from 'react';

export function useCapacityGuard(currentWeight: number = 1420.50, maxCapacity: number = 1800) {
  const capacityData = useMemo(() => {
    const percentage = Math.min(Math.round((currentWeight / maxCapacity) * 100), 100);
    
    let statusLevel: 'optimal' | 'warning' | 'critical' = 'optimal';
    let statusBadgeText = 'Optimal';
    let alertMessage = 'Facility storage is within safe operating limits.';

    if (percentage >= 90) {
      statusLevel = 'critical';
      statusBadgeText = 'Critical (90%+)';
      alertMessage = 'Storage capacity has reached critical levels! Immediate dispatch or disposal required.';
    } else if (percentage >= 80) {
      statusLevel = 'warning';
      statusBadgeText = 'Warning (80%+)';
      alertMessage = 'Storage capacity is approaching threshold limits. Monitor incoming items closely.';
    }

    return {
      currentWeight,
      maxCapacity,
      percentage,
      statusLevel,
      statusBadgeText,
      alertMessage,
    };
  }, [currentWeight, maxCapacity]);

  return capacityData;
}