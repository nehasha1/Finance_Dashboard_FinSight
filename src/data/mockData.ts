import type { Transaction, Category } from '../types';

export const CATEGORIES: Category[] = [
  'Salary', 'Freelance', 'Food', 'Rent', 'Transport', 
  'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Salary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Freelance: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Rent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Transport: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Entertainment: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Shopping: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Utilities: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400',
};

const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // 30+ pre-filled transactions across 6 months
  for (let i = 0; i < 40; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - Math.floor(i / 7), (i % 28) + 1);
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const isIncome = ['Salary', 'Freelance'].includes(category);
    
    transactions.push({
      id: Math.random().toString(36).substring(2, 9),
      date: date.toISOString().split('T')[0],
      description: `${category} Payment ${i + 1}`,
      category,
      type: isIncome ? 'income' : 'expense',
      amount: isIncome 
        ? Math.floor(Math.random() * 2000) + 1000 
        : Math.floor(Math.random() * 150) + 20,
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_TRANSACTIONS = generateMockTransactions();

export const MOCK_BUDGETS = CATEGORIES
  .filter(cat => !['Salary', 'Freelance'].includes(cat))
  .map(cat => ({
    category: cat,
    limit: Math.floor(Math.random() * 500) + 200,
  }));

export const MOCK_SAVINGS_GOALS = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 50000,
    currentAmount: 12000,
    deadline: '2026-12-31',
    category: 'Safety',
    color: '#00e5a0'
  },
  {
    id: '2',
    name: 'New Car',
    targetAmount: 200000,
    currentAmount: 45000,
    deadline: '2027-06-30',
    category: 'Travel',
    color: '#3b82f6'
  },
  {
    id: '3',
    name: 'Laptop Upgrade',
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: '2026-08-15',
    category: 'Tech',
    color: '#8b5cf6'
  }
];
