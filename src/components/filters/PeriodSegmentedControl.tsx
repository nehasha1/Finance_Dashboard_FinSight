import { cn } from '../../utils/cn';
import type { ReportPeriod } from '../../utils';

const OPTIONS: { value: ReportPeriod; label: string; hint: string }[] = [
  { value: 'Month', label: 'Month', hint: 'Calendar month' },
  { value: 'Quarter', label: 'Quarter', hint: 'Calendar quarter (Q1–Q4)' },
  { value: 'Year', label: 'Year', hint: 'Full calendar year' },
];

type Props = {
  value: ReportPeriod;
  onChange: (p: ReportPeriod) => void;
  className?: string;
  'aria-label'?: string;
};

export function PeriodSegmentedControl({ value, onChange, className, 'aria-label': ariaLabel }: Props) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel ?? 'Report period'}
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-sm dark:border-slate-600 dark:bg-slate-800/60',
        className
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          title={opt.hint}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            value === opt.value
              ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200 dark:bg-slate-700 dark:text-primary dark:ring-slate-500'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
