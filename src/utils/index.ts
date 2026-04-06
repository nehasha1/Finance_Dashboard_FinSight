import type { Transaction } from '../types';
import { format } from 'date-fns';

export {
  type ReportPeriod,
  getPresetDateRange,
  filterTransactionsByRange,
  getDashboardSummaryInRange,
  getDashboardSummary,
  getChartData,
  getSpendingByCategory,
  getDailyIncomeExpenseSeries,
  getSpendingByCategoryForMonth,
  getMonthOptionsFromTransactions,
  getQuarterOptionsFromTransactions,
  getYearOptionsFromTransactions,
  getDashboardIncomeExpenseChartSeries,
  coerceAnchorForPeriod,
  quarterKeyFromDate,
  dateFromQuarterKey,
  formatQuarterLabel,
  monthKey,
  parseMonthKey,
} from './periods';

export const formatCurrency = (amount: number, useLakhs = false) => {
  if (useLakhs) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCompactNumber = (number: number) => {
  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(1)}L`;
  }
  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(0)}k`;
  }
  return `₹${number}`;
};

export const exportToCSV = (transactions: Transaction[]) => {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const rows = transactions.map((t) => [
    t.date,
    t.description,
    t.category,
    t.type,
    t.amount.toString(),
  ]);

  const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.click();
};

export const exportToJSON = (transactions: Transaction[]) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.json`);
  link.click();
};
