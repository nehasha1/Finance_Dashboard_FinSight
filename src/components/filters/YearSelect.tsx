import { CalendarDays } from 'lucide-react';
import { cn } from '../../utils/cn';

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (year: string) => void;
  options: Option[];
  label?: string;
  className?: string;
  id?: string;
};

export function YearSelect({ value, onChange, options, label, className, id }: Props) {
  const selectId = id ?? 'year-select';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full min-w-[10rem] appearance-none rounded-xl border py-2.5 pl-10 pr-10 text-sm font-semibold',
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
