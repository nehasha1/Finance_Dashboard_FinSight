export type Category = 
  | 'Salary' 
  | 'Freelance' 
  | 'Food' 
  | 'Rent' 
  | 'Transport' 
  | 'Entertainment' 
  | 'Health' 
  | 'Shopping' 
  | 'Utilities' 
  | 'Other';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: Category;
  type: TransactionType;
  amount: number;
}

export type Role = 'Admin' | 'Viewer';

export interface Budget {
  category: Category;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  color?: string;
}
