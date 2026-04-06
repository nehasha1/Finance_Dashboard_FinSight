import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
  eachMonthOfInterval,
  format,
  parseISO,
  eachDayOfInterval,
  isWithinInterval,
  min,
  max,
  addMonths,
} from 'date-fns';
import type { Transaction } from '../types';

export type ReportPeriod = 'Month' | 'Quarter' | 'Year';

/** Calendar-based range for the selected period; `anchor` picks month/quarter/year. */
export function getPresetDateRange(period: ReportPeriod, anchor: Date): { start: Date; end: Date } {
  if (period === 'Month') {
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }
  if (period === 'Quarter') {
    return { start: startOfQuarter(anchor), end: endOfQuarter(anchor) };
  }
  return { start: startOfYear(anchor), end: endOfYear(anchor) };
}

export function filterTransactionsByRange(transactions: Transaction[], start: Date, end: Date) {
  return transactions.filter((t) => {
    const d = parseISO(t.date);
    return isWithinInterval(d, { start, end });
  });
}

export function getDashboardSummaryInRange(transactions: Transaction[], start: Date, end: Date) {
  const filtered = filterTransactionsByRange(transactions, start, end);
  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  return { income, expenses, balance, savingsRate };
}

export function getDashboardSummary(transactions: Transaction[], period: ReportPeriod, anchor: Date) {
  const { start, end } = getPresetDateRange(period, anchor);
  return getDashboardSummaryInRange(transactions, start, end);
}

/** Trend series: Month → last 6 calendar months; Quarter → last 4 quarters; Year → 12 months of anchor year. */
export function getChartData(transactions: Transaction[], period: ReportPeriod, anchor: Date) {
  if (period === 'Month') {
    const endM = startOfMonth(anchor);
    const startM = subMonths(endM, 5);
    const months = eachMonthOfInterval({ start: startM, end: endM });
    return months.map((month) => {
      const ms = startOfMonth(month);
      const me = endOfMonth(month);
      const monthTransactions = filterTransactionsByRange(transactions, ms, me);
      const income = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        name: format(month, 'MMM yyyy'),
        income,
        expense,
        balance: income - expense,
      };
    });
  }

  if (period === 'Quarter') {
    const q0 = startOfQuarter(anchor);
    const quarterStarts = [0, 1, 2, 3].map((i) => subMonths(q0, (3 - i) * 3));
    return quarterStarts.map((qStart) => {
      const qs = startOfQuarter(qStart);
      const qe = endOfQuarter(qStart);
      const qTransactions = filterTransactionsByRange(transactions, qs, qe);
      const income = qTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = qTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        name: format(qs, 'QQQ yyyy'),
        income,
        expense,
        balance: income - expense,
      };
    });
  }

  const y = anchor.getFullYear();
  const yearMonths = eachMonthOfInterval({
    start: new Date(y, 0, 1),
    end: new Date(y, 11, 1),
  });
  return yearMonths.map((month) => {
    const ms = startOfMonth(month);
    const me = endOfMonth(month);
    const monthTransactions = filterTransactionsByRange(transactions, ms, me);
    const income = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      name: format(month, 'MMM'),
      income,
      expense,
      balance: income - expense,
    };
  });
}

export function getSpendingByCategory(transactions: Transaction[], period: ReportPeriod, anchor: Date) {
  const { start, end } = getPresetDateRange(period, anchor);
  const expenses = filterTransactionsByRange(transactions, start, end).filter((t) => t.type === 'expense');
  const categories: Record<string, number> = {};
  expenses.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });
  return Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Daily income / expense / balance for one calendar month (for Income vs Expense drill-down). */
export function getDailyIncomeExpenseSeries(transactions: Transaction[], year: number, monthIndex: number) {
  const start = startOfMonth(new Date(year, monthIndex, 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });
  return days.map((day) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayTransactions = transactions.filter((t) => t.date === dayKey);
    const income = dayTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = dayTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      name: format(day, 'd MMM'),
      shortLabel: format(day, 'd'),
      income,
      expense,
      balance: income - expense,
    };
  });
}

export function getSpendingByCategoryForMonth(
  transactions: Transaction[],
  year: number,
  monthIndex: number
) {
  const start = startOfMonth(new Date(year, monthIndex, 1));
  const end = endOfMonth(start);
  const expenses = filterTransactionsByRange(transactions, start, end).filter((t) => t.type === 'expense');
  const categories: Record<string, number> = {};
  expenses.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });
  return Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Build month options from transaction data; always includes the current month in the range. */
export function getMonthOptionsFromTransactions(transactions: Transaction[]) {
  const now = new Date();
  const dates = transactions.map((t) => parseISO(t.date));
  if (dates.length === 0) {
    return [
      {
        value: monthKey(now.getFullYear(), now.getMonth()),
        label: format(now, 'MMMM yyyy'),
        year: now.getFullYear(),
        monthIndex: now.getMonth(),
      },
    ];
  }
  const earliest = min(dates);
  const latest = max(dates);
  const start = startOfMonth(min([earliest, now]));
  const end = startOfMonth(max([latest, now]));
  const months = eachMonthOfInterval({ start, end });
  return months
    .map((m) => ({
      value: monthKey(m.getFullYear(), m.getMonth()),
      label: format(m, 'MMMM yyyy'),
      year: m.getFullYear(),
      monthIndex: m.getMonth(),
    }))
    .reverse();
}

export function monthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

export function parseMonthKey(key: string): { year: number; monthIndex: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y, monthIndex: m - 1 };
}

/** e.g. `2025-2` → Q2 2025 */
export function quarterKeyFromDate(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-${q}`;
}

export function formatQuarterLabel(key: string): string {
  const [y, q] = key.split('-').map(Number);
  return `Q${q} ${y}`;
}

/** First day of the quarter encoded by `2025-2` (Q2). */
export function dateFromQuarterKey(key: string): Date {
  const [y, q] = key.split('-').map(Number);
  return startOfQuarter(new Date(y, (q - 1) * 3, 1));
}

export function getQuarterOptionsFromTransactions(transactions: Transaction[]): { value: string; label: string }[] {
  const now = new Date();
  const dates = transactions.map((t) => parseISO(t.date));
  if (dates.length === 0) {
    const k = quarterKeyFromDate(startOfQuarter(now));
    return [{ value: k, label: formatQuarterLabel(k) }];
  }
  const earliest = min(dates);
  const latest = max(dates);
  const start = startOfQuarter(min([earliest, now]));
  const end = startOfQuarter(max([latest, now]));
  const out: { value: string; label: string }[] = [];
  let q = start;
  while (q <= end) {
    const k = quarterKeyFromDate(q);
    out.push({ value: k, label: formatQuarterLabel(k) });
    q = addMonths(q, 3);
  }
  return out.reverse();
}

export function getYearOptionsFromTransactions(transactions: Transaction[]): { value: string; label: string }[] {
  const now = new Date();
  const dates = transactions.map((t) => parseISO(t.date));
  if (dates.length === 0) {
    const y = now.getFullYear();
    return [{ value: String(y), label: String(y) }];
  }
  const minY = min(dates).getFullYear();
  const maxY = max([...dates, now]).getFullYear();
  const years: number[] = [];
  for (let y = minY; y <= maxY; y++) years.push(y);
  return years.reverse().map((y) => ({ value: String(y), label: String(y) }));
}

/** Coerce anchor when switching period type (Month / Quarter / Year). */
export function coerceAnchorForPeriod(anchor: Date, period: ReportPeriod): Date {
  if (period === 'Month') return startOfMonth(anchor);
  if (period === 'Quarter') return startOfQuarter(anchor);
  return startOfYear(anchor);
}

/**
 * Income vs expense chart for the dashboard: daily in Month mode,
 * three months in Quarter mode, twelve months in Year mode — all scoped to the selected anchor.
 */
export function getDashboardIncomeExpenseChartSeries(transactions: Transaction[], period: ReportPeriod, anchor: Date) {
  if (period === 'Month') {
    const series = getDailyIncomeExpenseSeries(transactions, anchor.getFullYear(), anchor.getMonth());
    return {
      data: series,
      xAxisKey: 'shortLabel' as const,
      subtitle: 'Daily breakdown',
    };
  }

  if (period === 'Quarter') {
    const months = eachMonthOfInterval({
      start: startOfQuarter(anchor),
      end: endOfQuarter(anchor),
    });
    const data = months.map((month) => {
      const ms = startOfMonth(month);
      const me = endOfMonth(month);
      const monthTransactions = filterTransactionsByRange(transactions, ms, me);
      const income = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        name: format(month, 'MMM'),
        shortLabel: format(month, 'MMM'),
        income,
        expense,
        balance: income - expense,
      };
    });
    return {
      data,
      xAxisKey: 'name' as const,
      subtitle: 'By month in quarter',
    };
  }

  const y = anchor.getFullYear();
  const yearMonths = eachMonthOfInterval({
    start: new Date(y, 0, 1),
    end: new Date(y, 11, 1),
  });
  const data = yearMonths.map((month) => {
    const ms = startOfMonth(month);
    const me = endOfMonth(month);
    const monthTransactions = filterTransactionsByRange(transactions, ms, me);
    const income = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      name: format(month, 'MMM'),
      shortLabel: format(month, 'MMM'),
      income,
      expense,
      balance: income - expense,
    };
  });
  return {
    data,
    xAxisKey: 'name' as const,
    subtitle: 'Monthly breakdown',
  };
}
