import type { Habit } from "../types/Habit";

export function registrationCount(value: boolean | number): number {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

export function countRegistrations(dates: Habit["dates"], include: (timestamp: string) => boolean = () => true): number {
  return Object.entries(dates || {}).reduce((total, [timestamp, value]) =>
    total + (include(timestamp) ? registrationCount(value) : 0), 0);
}

export function groupRegistrations(dates: Habit["dates"], periodForDate: (timestamp: string) => string): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const [timestamp, value] of Object.entries(dates || {})) {
    const count = registrationCount(value);
    if (!count) continue;
    const period = periodForDate(timestamp);
    totals[period] = (totals[period] || 0) + count;
  }
  return totals;
}
