import { useEffect, useState, useMemo, useCallback } from 'react';
import { startOfMonth, startOfYear } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import {
  formatCurrency,
  getDashboardSummary,
  getSpendingByCategory,
  getDashboardIncomeExpenseChartSeries,
  getMonthOptionsFromTransactions,
  getQuarterOptionsFromTransactions,
  getYearOptionsFromTransactions,
  filterTransactionsByRange,
  getPresetDateRange,
  coerceAnchorForPeriod,
  monthKey,
  parseMonthKey,
  quarterKeyFromDate,
  dateFromQuarterKey,
} from '../utils';
import type { ReportPeriod } from '../utils';
import AnimatedCounter from '../components/AnimatedCounter';
import { CATEGORY_COLORS, MOCK_BUDGETS } from '../data/mockData';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ShoppingCart,
  Coffee,
  Home,
  Bus,
  Activity,
  Zap,
  Gift,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { PeriodSegmentedControl } from '../components/filters/PeriodSegmentedControl';
import { MonthYearSelect } from '../components/filters/MonthYearSelect';
import { QuarterSelect } from '../components/filters/QuarterSelect';
import { YearSelect } from '../components/filters/YearSelect';
import AnimatedPageTitle from '../components/AnimatedPageTitle';

const COLORS = [
  '#4fd1c5',
  '#3b82f6',
  '#f6ad55',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#06b6d4',
  '#ef4444',
  '#6366f1',
];

const CATEGORY_ICONS: Record<string, typeof Wallet> = {
  Salary: ArrowUpRight,
  Freelance: Zap,
  Food: Coffee,
  Rent: Home,
  Transport: Bus,
  Entertainment: Gift,
  Health: Activity,
  Shopping: ShoppingCart,
  Utilities: Zap,
  Other: Wallet,
};

const Dashboard = () => {
  const { transactions, savingsGoals, isDarkMode } = useAppContext();

  const [period, setPeriod] = useState<ReportPeriod>('Month');
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));
  const [activeSummaryCardLabel, setActiveSummaryCardLabel] = useState<string | null>(null);
  const [showSummaryStackIntro, setShowSummaryStackIntro] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setShowSummaryStackIntro(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const handlePeriodChange = useCallback((p: ReportPeriod) => {
    setPeriod(p);
    setAnchor((a) => coerceAnchorForPeriod(a, p));
    setActiveSummaryCardLabel(null);
  }, []);

  const monthOptions = useMemo(() => getMonthOptionsFromTransactions(transactions), [transactions]);
  const quarterOptions = useMemo(() => getQuarterOptionsFromTransactions(transactions), [transactions]);
  const yearOptions = useMemo(() => getYearOptionsFromTransactions(transactions), [transactions]);

  const monthSelectValue = monthKey(anchor.getFullYear(), anchor.getMonth());
  const quarterSelectValue = quarterKeyFromDate(anchor);
  const yearSelectValue = String(anchor.getFullYear());

  const summary = useMemo(
    () => getDashboardSummary(transactions, period, anchor),
    [transactions, period, anchor]
  );

  const categoryDataForBudget = useMemo(
    () => getSpendingByCategory(transactions, period, anchor),
    [transactions, period, anchor]
  );

  const chartConfig = useMemo(
    () => getDashboardIncomeExpenseChartSeries(transactions, period, anchor),
    [transactions, period, anchor]
  );

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getPresetDateRange(period, anchor),
    [period, anchor]
  );

  const transactionsInRange = useMemo(() => {
    return filterTransactionsByRange(transactions, rangeStart, rangeEnd);
  }, [transactions, rangeStart, rangeEnd]);

  const topCategoryByType = useMemo(() => {
    const incomeTotals = new Map<string, number>();
    const expenseTotals = new Map<string, number>();

    for (const t of transactionsInRange) {
      const map = t.type === 'income' ? incomeTotals : expenseTotals;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }

    const topIncome = [...incomeTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const topExpense = [...expenseTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return { topIncome, topExpense };
  }, [transactionsInRange]);

  const recentTransactions = useMemo(() => {
    return filterTransactionsByRange(transactions, rangeStart, rangeEnd)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions, rangeStart, rangeEnd]);

  const budgetVsActual = useMemo(() => {
    return MOCK_BUDGETS.map((budget) => {
      const actual = categoryDataForBudget.find((s) => s.name === budget.category)?.value || 0;
      const percentage = (actual / budget.limit) * 100;
      return {
        category: budget.category,
        budget: budget.limit,
        actual,
        percentage: Math.min(percentage, 100),
        overBudget: actual > budget.limit,
      };
    }).slice(0, 5);
  }, [categoryDataForBudget]);

  const cards = [
    {
      label: 'Total income',
      value: summary.income,
      trend: 12.3,
      trendUp: true,
      color: 'text-emerald-500',
      icon: ArrowUpRight,
      detail: topCategoryByType.topIncome ? `Top income: ${topCategoryByType.topIncome}` : 'Top income: —',
    },
    {
      label: 'Total expenses',
      value: summary.expenses,
      trend: 4.5,
      trendUp: false,
      color: 'text-rose-500',
      icon: ShoppingCart,
      detail: topCategoryByType.topExpense ? `Top expense: ${topCategoryByType.topExpense}` : 'Top expense: —',
    },
    {
      label: 'Net savings',
      value: summary.balance,
      trend: 19.8,
      trendUp: true,
      color: 'text-emerald-500',
      icon: Wallet,
      detail: topCategoryByType.topIncome ? `Mostly from ${topCategoryByType.topIncome}` : 'Mostly from —',
    },
    {
      label: 'Savings rate',
      value: summary.savingsRate,
      trend: 3.2,
      trendUp: true,
      color: 'text-emerald-500',
      icon: Target,
      isPercent: true,
      detail: topCategoryByType.topIncome ? `Driven by ${topCategoryByType.topIncome}` : 'Driven by —',
    },
  ];

  const anchorKey = `${period}-${monthSelectValue}-${quarterSelectValue}-${yearSelectValue}`;
  const activeSummaryCard = activeSummaryCardLabel
    ? cards.find((c) => c.label === activeSummaryCardLabel) ?? null
    : null;

  return (
    <div className="animate-in fade-in space-y-8 pb-10 duration-500">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <AnimatedPageTitle
          title="Finance overview"
          subtitle="Personal budget tracker"
          fromFontSizePx={18}
          toFontSizePx={34}
          durationMs={900}
          initialScale={0.8}
        />

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-0 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
          <PeriodSegmentedControl value={period} onChange={handlePeriodChange} />

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

      <AnimatePresence mode="wait">
        <motion.div
          key={anchorKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="space-y-8"
        >
          <LayoutGroup>
            <AnimatePresence initial={false} mode="wait">
              {showSummaryStackIntro ? (
                <motion.div
                  key="summary-stack"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="relative h-[210px]"
                >
                  {cards.map((card, idx) => {
                    const layoutId = `summary-card-${card.label}`;
                    const Icon = card.icon;
                    return (
                      <motion.button
                        key={card.label}
                        layout
                        layoutId={layoutId}
                        type="button"
                        transition={{ duration: 0.65, ease: 'easeInOut' }}
                        style={{ top: idx * 10, zIndex: cards.length - idx }}
                        onClick={() => setActiveSummaryCardLabel(card.label)}
                        className="absolute left-0 right-0 mx-auto w-full max-w-xl cursor-default rounded-3xl border border-border-main bg-surface p-6 text-left shadow-md card-gradient-top"
                      >
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-col gap-1">
                            <motion.span layout="position" className="text-sm font-medium text-text-muted">
                              {card.label}
                            </motion.span>
                            <div className="text-3xl font-bold tracking-tight text-text-main">
                              <AnimatedCounter
                                value={card.value}
                                format={(val) =>
                                  card.isPercent ? `${val.toFixed(1)}%` : formatCurrency(val, val >= 100000)
                                }
                              />
                            </div>
                          </div>
                          <motion.div
                            layout
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-main bg-background/40 text-text-muted"
                          >
                            <Icon className="h-5 w-5" />
                          </motion.div>
                        </div>
                        <motion.div
                          layout="position"
                          className={`flex items-center gap-1 text-xs font-bold ${card.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}
                        >
                          {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{card.trend}% vs last period</span>
                        </motion.div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="summary-grid"
                  layout
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: { staggerChildren: 0.24, delayChildren: 0.2 },
                    },
                  }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {cards.map((card, idx) => {
                    const layoutId = `summary-card-${card.label}`;
                    const Icon = card.icon;
                    return (
                      <motion.button
                        key={card.label}
                        layout
                        layoutId={layoutId}
                        custom={idx}
                        variants={{
                          hidden: (index: number) => ({
                            opacity: 0,
                            scale: 0.92,
                            y: 10,
                            x: index % 2 === 0 ? -28 : 28,
                          }),
                          show: (index: number) => ({
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            x: 0,
                            transition: {
                              duration: 1.35,
                              ease: [0.22, 1, 0.36, 1],
                              delay: index * 0.08,
                            },
                          }),
                        }}
                        type="button"
                        whileHover={{ y: -5, scale: 1.03 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        onClick={() => setActiveSummaryCardLabel(card.label)}
                        className="cursor-default rounded-3xl border border-border-main bg-surface p-6 text-left shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/15 card-gradient-top focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-col gap-1">
                            <motion.span layout="position" className="text-sm font-medium text-text-muted">
                              {card.label}
                            </motion.span>
                            <div className="text-3xl font-bold tracking-tight text-text-main">
                              <AnimatedCounter
                                value={card.value}
                                format={(val) =>
                                  card.isPercent ? `${val.toFixed(1)}%` : formatCurrency(val, val >= 100000)
                                }
                              />
                            </div>
                          </div>
                          <motion.div
                            layout
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-main bg-background/40 text-text-muted"
                          >
                            <Icon className="h-5 w-5" />
                          </motion.div>
                        </div>
                        <motion.div
                          layout="position"
                          className={`flex items-center gap-1 text-xs font-bold ${card.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}
                        >
                          {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{card.trend}% vs last period</span>
                        </motion.div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {activeSummaryCard && (
                <motion.div
                  key="summary-card-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                  onClick={() => setActiveSummaryCardLabel(null)}
                >
                  <motion.div
                    layoutId={`summary-card-${activeSummaryCard.label}`}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="w-full max-w-xl cursor-default rounded-3xl border border-border-main bg-surface p-6 shadow-2xl card-gradient-top"
                    onClick={(e) => e.stopPropagation()}
                  >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <motion.div layout className="flex items-center gap-2">
                        <motion.div
                          layout
                          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-main bg-background/40 text-text-muted"
                        >
                          <activeSummaryCard.icon className="h-5 w-5" />
                        </motion.div>
                        <div className="min-w-0">
                          <motion.p layout="position" className="truncate text-sm font-medium text-text-muted">
                            {activeSummaryCard.label}
                          </motion.p>
                          <motion.p layout="position" className="truncate text-xs font-semibold text-text-muted/80">
                            {activeSummaryCard.detail}
                          </motion.p>
                        </div>
                      </motion.div>
                      <motion.div layout="position" className="mt-1 text-4xl font-bold tracking-tight text-text-main">
                        <AnimatedCounter
                          value={activeSummaryCard.value}
                          format={(val) =>
                            activeSummaryCard.isPercent ? `${val.toFixed(1)}%` : formatCurrency(val, val >= 100000)
                          }
                        />
                      </motion.div>
                    </div>

                    <motion.button
                      layout="position"
                      type="button"
                      onClick={() => setActiveSummaryCardLabel(null)}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-xl border border-border-main bg-background px-3 py-2 text-xs font-bold text-text-muted transition-all hover:text-text-main hover:border-primary/40"
                    >
                      Close
                    </motion.button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <motion.div
                      layout
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        activeSummaryCard.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {activeSummaryCard.trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      <span>{activeSummaryCard.trend}% vs last period</span>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border-main bg-surface p-6 shadow-lg transition-colors duration-300 lg:col-span-2 card-gradient-top"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text-main">Income vs expenses</h3>
            <p className="text-sm font-medium text-text-muted">{chartConfig.subtitle}</p>
          </div>

          <div className="mb-6 flex gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 text-text-muted">
              <div className="h-3 w-3 rounded bg-[#4fd1c5]" /> Income
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <div className="h-3 w-3 rounded bg-[#f6ad55]" /> Expenses
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <div className="h-3 w-3 rounded bg-[#3b82f6]" /> Net
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartConfig.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis
                  dataKey={chartConfig.xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={period === 'Month' ? 14 : 8}
                  tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                  tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                />
                <Tooltip
                  cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9', opacity: 0.5 }}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="income" fill="#4fd1c5" radius={[4, 4, 0, 0]} barSize={period === 'Month' ? 14 : 20} />
                <Bar dataKey="expense" fill="#f6ad55" radius={[4, 4, 0, 0]} barSize={period === 'Month' ? 14 : 20} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    fill: isDarkMode ? '#0a192f' : '#fff',
                    stroke: '#3b82f6',
                    strokeWidth: 2,
                    r: period === 'Month' ? 3 : 4,
                  }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex h-full flex-col rounded-3xl border border-border-main bg-surface p-6 shadow-lg transition-colors duration-300 card-gradient-top"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text-main">Expense breakdown</h3>
            <p className="text-sm font-medium text-text-muted">By category · same period as above</p>
          </div>

          <div className="flex flex-1 flex-col">
            <div className="relative h-[280px] w-full">
              {categoryDataForBudget.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDataForBudget}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={600}
                      stroke="none"
                    >
                      {categoryDataForBudget.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                        border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-text-muted">
                  No expenses in this period
                </div>
              )}
            </div>

            <div className="custom-scrollbar mt-2 max-h-[220px] space-y-2 overflow-y-auto pr-2">
              {categoryDataForBudget.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between py-1 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-semibold text-text-muted">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-text-main">{formatCurrency(item.value, item.value >= 100000)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-border-main bg-surface p-6 shadow-lg transition-colors duration-300 card-gradient-top">
          <h3 className="mb-6 text-lg font-bold text-text-main">Recent transactions</h3>
          <p className="mb-4 text-xs font-medium text-text-muted">Latest in selected period</p>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((t) => {
                const Icon = CATEGORY_ICONS[t.category] || Wallet;
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-xl p-3 transition-all hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-gray-50 p-2 dark:bg-slate-800">
                        <Icon className="h-5 w-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main">{t.description}</p>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[t.category]}`}>
                            {t.category}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{t.date}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm font-medium text-text-muted">No transactions in this period.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border-main bg-surface p-6 shadow-lg transition-colors duration-300 card-gradient-top">
          <h3 className="mb-6 text-lg font-bold text-text-main">Budget vs Actual</h3>
          <div className="space-y-6">
            {budgetVsActual.map((item, index) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-text-muted">{item.category}</span>
                  <span className="text-text-main">
                    {formatCurrency(item.actual)} / {formatCurrency(item.budget)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                  <motion.div
                    key={anchorKey + item.category}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full ${item.overBudget ? 'bg-rose-500' : 'bg-primary'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

          {/* Savings Goals Summary */}
          <div className="rounded-3xl border border-border-main bg-surface p-6 shadow-lg transition-colors duration-300 card-gradient-top">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-main">Savings Goals</h3>
            <p className="text-xs font-medium text-text-muted">Track your progress towards milestones</p>
          </div>
          <Link to="/goals" className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
            View all goals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.slice(0, 3).map((goal, index) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: goal.color || '#00e5a0' }}
                    >
                      <Target className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-text-main">{goal.name}</span>
                  </div>
                  <span className="text-xs font-bold text-text-muted">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color || '#00e5a0' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>Target: {formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
