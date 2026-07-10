/**
 * Date utility functions to handle timezone-safe local date operations.
 * Avoids UTC shifting and ensures single source of truth for date matching.
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDateStr(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return getLocalDateString();
  
  if (typeof dateStr === 'string') {
    const trimmed = dateStr.trim();
    // If it's already a simple YYYY-MM-DD string, return it directly to avoid parsing shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) {
      // Extract YYYY-MM-DD prefix if possible as fallback
      const match = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (match) {
        const y = match[1];
        const m = match[2].padStart(2, '0');
        const d = match[3].padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return getLocalDateString();
    }
    return getLocalDateString(parsed);
  }
  
  return getLocalDateString(dateStr);
}

export function getRelativeDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateString(d);
}

export function areDatesEqual(dateVal1: string | Date | undefined | null, dateVal2: string | Date | undefined | null): boolean {
  return normalizeDateStr(dateVal1) === normalizeDateStr(dateVal2);
}
