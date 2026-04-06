import { CalendarRange } from 'lucide-react';
import { cn } from '../../utils/cn';

export type MonthOption = { value: string; label: string; year: number; monthIndex: number };

type Props = {
  value: string;
  onChange: (monthKey: string) => void;
  options: MonthOption[];
  label?: string;
  /** Hide label row (use placeholder or aria-only for compact filter bars). */
  hideLabel?: boolean;
  className?: string;
  id?: string;
};

export function MonthYearSelect({ value, onChange, options, label, hideLabel, className, id }: Props) {
  const selectId = id ?? 'month-year-select';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && !hideLabel && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <select
          id={selectId}
          value={value}
          aria-label={hideLabel && label ? label : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full min-w-[12rem] appearance-none rounded-xl border py-2.5 pl-10 pr-10 text-sm font-semibold',
            'border-slate-200 bg-white text-slate-900 shadow-sm',
            'transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
            'dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-primary/30'
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
