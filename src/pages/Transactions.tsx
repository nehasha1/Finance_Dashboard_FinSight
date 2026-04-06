import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  formatCurrency,
  exportToCSV,
  getMonthOptionsFromTransactions,
  parseMonthKey,
} from '../utils';
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  isWithinInterval,
  isToday,
  isYesterday,
  isThisWeek,
} from 'date-fns';
import { CATEGORIES, CATEGORY_COLORS } from '../data/mockData';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import type { Transaction } from '../types';
import { toast } from 'react-toastify';
import {
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPageTitle from '../components/AnimatedPageTitle';

// ─── helpers ────────────────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const AVATAR_PALETTE = [
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-cyan-500',
];

function avatarColor(str: string) {
  const idx = (str.charCodeAt(0) || 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function groupLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'TODAY';
  if (isYesterday(d)) return 'YESTERDAY';
  if (isThisWeek(d, { weekStartsOn: 1 })) return 'THIS WEEK';
  return 'LAST WEEK';
}

function groupOrder(label: string): number {
  switch (label) {
    case 'TODAY':     return 0;
    case 'YESTERDAY': return 1;
    case 'THIS WEEK': return 2;
    default:          return 3;
  }
}

const ITEMS_PER_PAGE = 8;

// ─── component ──────────────────────────────────────────────────────────────

const Transactions = () => {
  const { transactions, role, deleteTransaction, addTransaction, updateTransaction } =
    useAppContext();

  // ── filter state ─────────────────────────────────────────────────────────
  const [searchTerm,     setSearchTerm]     = useState('');
  const [monthFilter,    setMonthFilter]    = useState('all');
  const [typeFilter,     setTypeFilter]     = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder,      setSortOrder]      = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [currentPage,    setCurrentPage]    = useState(1);

  // ── modal state ───────────────────────────────────────────────────────────
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [pendingDelete,      setPendingDelete]      = useState<Transaction | null>(null);

  const monthOptions = useMemo(
    () => getMonthOptionsFromTransactions(transactions),
    [transactions],
  );

  // ── filtered + sorted ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = transactions.filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType     = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      if (monthFilter !== 'all') {
        const { year, monthIndex } = parseMonthKey(monthFilter);
        const start = startOfMonth(new Date(year, monthIndex, 1));
        const end   = endOfMonth(start);
        if (!isWithinInterval(parseISO(t.date), { start, end })) return false;
      }
      return matchesSearch && matchesType && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortOrder === 'newest')  return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'oldest')  return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'highest') return b.amount - a.amount;
      return a.amount - b.amount;
    });

    return result;
  }, [transactions, searchTerm, monthFilter, typeFilter, categoryFilter, sortOrder]);

  // ── pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── group by day label ────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    for (const t of paginated) {
      const label = groupLabel(t.date);
      if (!map[label]) map[label] = [];
      map[label].push(t);
    }
    return Object.entries(map).sort(([a], [b]) => groupOrder(a) - groupOrder(b));
  }, [paginated]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    monthFilter !== 'all' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setMonthFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setCurrentPage(1);
  };

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleAdd         = () => { setEditingTransaction(undefined); setIsModalOpen(true); };
  const handleEdit        = (t: Transaction) => { setEditingTransaction(t); setIsModalOpen(true); };
  const handleDeleteClick = (t: Transaction) => setPendingDelete(t);

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteTransaction(pendingDelete.id);
      toast.success('Transaction deleted successfully');
    }
  };

  const handleModalSubmit = (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...data, id: editingTransaction.id });
      toast.success('Transaction updated successfully');
    } else {
      addTransaction(data);
      toast.success('Transaction added successfully');
    }
  };

  // ── page numbers (max 5 visible) ─────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  // ── shared class shortcuts ────────────────────────────────────────────────
  const cardCls = 'rounded-2xl border border-border-main bg-surface shadow-sm';
  const inputCls = 'w-full rounded-xl border border-border-main bg-background/50 px-4 py-2.5 text-sm font-medium text-text-main placeholder-text-muted transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10';

  return (
    <div className="animate-in fade-in space-y-8 pb-10 duration-500">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <AnimatedPageTitle
          title="Transactions"
          subtitle="Manage and track your cash flow"
          fromFontSizePx={18}
          toFontSizePx={34}
          durationMs={900}
          initialScale={0.8}
        />
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex rounded-xl border border-border-main bg-surface p-1">
            <button
              onClick={() => exportToCSV(filtered)}
              className="rounded-lg p-2 text-text-muted transition-all hover:bg-background hover:text-primary"
              title="Export CSV"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
          {role === 'Admin' && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span>Add Transaction</span>
            </button>
          )}
        </div>
      </header>

      {/* Filters Card */}
      <section className={cn(cardCls, 'p-5 space-y-4 card-gradient-top')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-main">Filters</p>
              <p className="text-xs text-text-muted">
                {filtered.length} of {transactions.length} shown
              </p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-border-main bg-background px-3 py-1.5 text-xs font-semibold text-text-muted transition-all hover:text-text-main hover:border-primary/50"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search descriptions or categories..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={cn(inputCls, 'pl-10')}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'expense', 'income'] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => { setTypeFilter(val); setCurrentPage(1); }}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
                typeFilter === val
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'border border-border-main text-text-muted hover:border-primary/50 hover:text-primary'
              )}
            >
              {val === 'all' ? 'All' : val === 'expense' ? 'Expenses' : 'Income'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className={inputCls}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Month</label>
            <select
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
              className={inputCls}
            >
              <option value="all">All months</option>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Sort</label>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value as any); setCurrentPage(1); }}
              className={inputCls}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      {paginated.length > 0 ? (
        <div className="space-y-8">
          {grouped.map(([label, items]) => (
            <section key={label} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                  {label}
                </h3>
                <div className="h-px flex-1 bg-border-main" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {items.map((t) => (
                  <motion.div
                    layout
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(cardCls, 'group flex items-center gap-4 p-4 transition-all hover:border-primary/30 hover:shadow-md card-gradient-top')}
                  >
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-inner', avatarColor(t.description))}>
                      {t.description.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-bold text-text-main">{t.description}</h4>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', CATEGORY_COLORS[t.category])}>
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-text-muted">{t.date} • {t.type}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('font-mono text-lg font-bold', t.type === 'income' ? 'text-emerald-500' : 'text-text-main')}>
                        {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                      </p>
                      {role === 'Admin' && (
                        <div className="mt-1 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => handleEdit(t)} className="rounded-lg p-1.5 text-text-muted hover:bg-background hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(t)} className="rounded-lg p-1.5 text-text-muted hover:bg-rose-500/10 hover:text-rose-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="flex items-center gap-1 rounded-xl border border-border-main bg-surface px-3 py-2 text-sm font-semibold text-text-muted transition-all hover:bg-background disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded-xl border border-border-main bg-surface px-3 py-2 text-sm font-semibold text-text-muted transition-all hover:bg-background disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-sm text-text-muted">
                  Page <span className="font-bold text-text-main">{currentPage}</span> / {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={cn(
                      'h-8 w-8 rounded-lg text-sm font-semibold transition-all',
                      n === currentPage
                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                        : 'border border-border-main text-text-muted hover:border-primary/50 hover:text-primary'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-16">
          <EmptyState
            title={hasActiveFilters ? 'No matches found' : 'No transactions yet'}
            description={hasActiveFilters ? 'Try adjusting your filters or search term.' : 'Add your first transaction to get started.'}
            action={hasActiveFilters ? { label: 'Clear all filters', onClick: clearFilters } : undefined}
          />
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTransaction}
      />

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="Delete Transaction?"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      >
        {pendingDelete && (
          <div className="mt-4 rounded-xl border border-border-main bg-background/50 p-4">
            <p className="font-semibold text-text-main">{pendingDelete.description}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-text-muted">{pendingDelete.date} • {pendingDelete.category}</span>
              <span className={cn('font-mono font-bold', pendingDelete.type === 'income' ? 'text-emerald-500' : 'text-text-main')}>
                {pendingDelete.type === 'income' ? '+' : '−'}{formatCurrency(pendingDelete.amount)}
              </span>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default Transactions;
