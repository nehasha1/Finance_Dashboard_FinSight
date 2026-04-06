import { useMemo, useState, useCallback } from 'react';
import { startOfMonth, startOfYear } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import {
  formatCurrency,
  getSpendingByCategory,
  getDashboardSummaryInRange,
  getPresetDateRange,
  getDashboardIncomeExpenseChartSeries,
  getMonthOptionsFromTransactions,
  getQuarterOptionsFromTransactions,
  getYearOptionsFromTransactions,
  filterTransactionsByRange,
  coerceAnchorForPeriod,
  monthKey,
  parseMonthKey,
  quarterKeyFromDate,
  dateFromQuarterKey,
} from '../utils';
import type { ReportPeriod } from '../utils';
import {
  TrendingUp,
  BarChart3,
  Activity,
  Layers,
  PieChart as PieChartIcon,
  CalendarCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { PeriodSegmentedControl } from '../components/filters/PeriodSegmentedControl';
import { MonthYearSelect } from '../components/filters/MonthYearSelect';
import { QuarterSelect } from '../components/filters/QuarterSelect';
import { YearSelect } from '../components/filters/YearSelect';
import AnimatedPageTitle from '../components/AnimatedPageTitle';

const COLORS = [
  '#00e5a0',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#06b6d4',
  '#ef4444',
  '#6366f1',
  '#10b981',
];

const Insights = () => {
  const { transactions, isDarkMode } = useAppContext();

  const [period, setPeriod] = useState<ReportPeriod>('Month');
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));

  const handlePeriodChange = useCallback((p: ReportPeriod) => {
    setPeriod(p);
    setAnchor((a) => coerceAnchorForPeriod(a, p));
  }, []);

  const monthOptions = useMemo(() => getMonthOptionsFromTransactions(transactions), [transactions]);
  const quarterOptions = useMemo(() => getQuarterOptionsFromTransactions(transactions), [transactions]);
  const yearOptions = useMemo(() => getYearOptionsFromTransactions(transactions), [transactions]);

  const monthSelectValue = monthKey(anchor.getFullYear(), anchor.getMonth());
  const quarterSelectValue = quarterKeyFromDate(anchor);
  const yearSelectValue = String(anchor.getFullYear());

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getPresetDateRange(period, anchor),
    [period, anchor]
  );

  const chartConfig = useMemo(
    () => getDashboardIncomeExpenseChartSeries(transactions, period, anchor),
    [transactions, period, anchor]
  );

  const trendData = chartConfig.data;

  const categoryData = useMemo(
    () => getSpendingByCategory(transactions, period, anchor),
    [transactions, period, anchor]
  );

  const rangeSummary = useMemo(
    () => getDashboardSummaryInRange(transactions, rangeStart, rangeEnd),
    [transactions, rangeStart, rangeEnd]
  );

  const transactionsInRange = useMemo(
    () => filterTransactionsByRange(transactions, rangeStart, rangeEnd),
    [transactions, rangeStart, rangeEnd]
  );

  const highestSpendingCategory = categoryData[0]?.name || 'N/A';

  const lastBar = trendData[trendData.length - 1];
  const prevBar = trendData[trendData.length - 2];
  const periodExpenseChange =
    prevBar?.expense && lastBar
      ? ((lastBar.expense - prevBar.expense) / prevBar.expense) * 100
      : 0;

  const totalIncome = rangeSummary.income;
  const totalExpense = rangeSummary.expenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const avgPerChartBar = trendData.length ? totalExpense / trendData.length : 0;

  const totalTransactions = transactionsInRange.length;

  const bestSavingsBar = [...trendData].sort((a, b) => b.balance - a.balance)[0]?.name || 'N/A';

  const changeLabel =
    period === 'Month' ? 'Expense vs prior day' : period === 'Quarter' ? 'Expense vs prior month' : 'Expense vs prior month';

  const avgLabel =
    period === 'Month' ? 'Avg daily spend' : period === 'Quarter' ? 'Avg monthly spend' : 'Avg monthly spend';

  const cards = [
    { label: 'Top Category', value: highestSpendingCategory, icon: Layers, color: 'text-primary', bg: 'bg-primary/10' },
    {
      label: changeLabel,
      value: `${periodExpenseChange > 0 ? '+' : ''}${periodExpenseChange.toFixed(1)}%`,
      icon: Activity,
      color: periodExpenseChange > 0 ? 'text-rose-500' : 'text-emerald-500',
      bg: periodExpenseChange > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
    },
    { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    {
      label: avgLabel,
      value: formatCurrency(avgPerChartBar),
      icon: BarChart3,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    { label: 'Transactions', value: totalTransactions.toString(), icon: PieChartIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Best savings', value: bestSavingsBar, icon: CalendarCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <AnimatedPageTitle
          title="Deep Insights"
          subtitle="Discover patterns and trends in your financial data."
          fromFontSizePx={18}
          toFontSizePx={34}
          durationMs={900}
          initialScale={0.8}
        />

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-0 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
          <PeriodSegmentedControl value={period} onChange={handlePeriodChange} aria-label="Insights period" />

          {period === 'Month' && (
            <MonthYearSelect
              label="Month"
              value={monthSelectValue}
              onChange={(key) => {
                const { year, monthIndex } = parseMonthKey(key);
                setAnchor(startOfMonth(new Date(year, monthIndex, 1)));
              }}
              options={monthOptions}
              className="sm:min-w-[200px]"
            />
          )}

          {period === 'Quarter' && (
            <QuarterSelect
              label="Quarter"
              value={quarterSelectValue}
              onChange={(key) => setAnchor(dateFromQuarterKey(key))}
              options={quarterOptions}
              className="sm:min-w-[200px]"
            />
          )}

          {period === 'Year' && (
            <YearSelect
              label="Year"
              value={yearSelectValue}
              onChange={(y) => setAnchor(startOfYear(new Date(Number(y), 0, 1)))}
              options={yearOptions}
              className="sm:min-w-[160px]"
            />
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex items-center gap-4 rounded-3xl border border-border-main bg-surface p-6 shadow-md transition-all duration-300 card-gradient-top"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{card.label}</p>
              <p className="text-2xl font-bold text-text-main">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border-main bg-surface p-8 shadow-lg transition-colors duration-300 lg:col-span-2 card-gradient-top"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-text-main">Income & Expense Trends</h3>
              <p className="text-sm font-medium text-text-muted">Visual comparison across {period.toLowerCase()}ly periods</p>
            </div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2 text-text-muted">
                <div className="h-3 w-3 rounded-full bg-primary" /> Income
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <div className="h-3 w-3 rounded-full bg-rose-500" /> Expense
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                  tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                />
                <Tooltip
                  cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                    border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="income" fill="#00e5a0" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col rounded-3xl border border-border-main bg-surface p-8 shadow-lg transition-colors duration-300 card-gradient-top"
        >
          <div className="mb-8">
            <h3 className="text-xl font-bold text-text-main">Top Categories</h3>
            <p className="text-sm font-medium text-text-muted">Where your money goes</p>
          </div>

          <div className="flex-1 space-y-6">
            {categoryData.length > 0 ? (
              categoryData.slice(0, 6).map((item, index) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-text-main">{item.name}</span>
                    <span className="font-mono font-bold text-text-muted">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / categoryData[0].value) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                No data available
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Insights;
