// Lightweight date and range formatters shared across views.

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatShortDate(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function formatRange(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth() && from.getDate() === to.getDate()) {
    return formatShortDate(from);
  }
  if (from.getMonth() === to.getMonth()) {
    return `${MONTHS_SHORT[from.getMonth()]} ${from.getDate()}–${to.getDate()}`;
  }
  return `${formatShortDate(from)} – ${formatShortDate(to)}`;
}

export function monthTicks(year: number): { label: string; date: Date }[] {
  return MONTHS_SHORT.map((label, i) => ({
    label,
    date: new Date(year, i, 1)
  }));
}

export function weekdayDate(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function startOfWeek(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() - out.getDay());
  return out;
}
