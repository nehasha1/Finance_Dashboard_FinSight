import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Transaction, Category, TransactionType } from '../types';
import { CATEGORIES } from '../data/mockData';
import { toast } from 'react-toastify';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (t: any) => void;
  initialData?: Transaction;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Other' as Category,
    type: 'expense' as TransactionType,
    amount: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        description: initialData.description,
        category: initialData.category,
        type: initialData.type,
        amount: initialData.amount.toString()
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Other',
        type: 'expense',
        amount: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please fill all fields with valid data');
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden border border-border-main animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border-main">
          <h3 className="text-xl font-bold text-text-main">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-xl transition-all text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Date</label>
            <input 
              type="date" 
              required
              className="w-full px-4 py-3 bg-background/50 border border-border-main rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-main"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Description</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Grocery shopping"
              className="w-full px-4 py-3 bg-background/50 border border-border-main rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-main placeholder-text-muted"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Type</label>
              <select 
                className="w-full px-4 py-3 bg-background/50 border border-border-main rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-main"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="expense" className="bg-surface">Expense</option>
                <option value="income" className="bg-surface">Income</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Category</label>
              <select 
                className="w-full px-4 py-3 bg-background/50 border border-border-main rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-main"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-surface">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Amount (₹)</label>
            <input 
              type="number" 
              step="0.01"
              required
              placeholder="0.00"
              className="w-full px-4 py-3 bg-background/50 border border-border-main rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-text-main placeholder-text-muted"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 mt-4 bg-linear-to-r from-primary to-emerald-500 text-white hover:to-emerald-400 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
