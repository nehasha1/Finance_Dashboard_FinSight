import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { SavingsGoal } from '../types';
import { toast } from 'react-toastify';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (g: any) => void;
  initialData?: SavingsGoal;
}

const GoalModal: React.FC<GoalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'General'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        targetAmount: initialData.targetAmount.toString(),
        currentAmount: initialData.currentAmount.toString(),
        deadline: initialData.deadline || '',
        category: initialData.category
      });
    } else {
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
        category: 'General'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      toast.error('Please fill all fields with valid data');
      return;
    }

    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      color: initialData?.color || '#00e5a0' // Maintain existing color or use default
    });
    onClose();
  };

  const inputCls = "w-full px-4 py-3 bg-background/50 border border-border-main rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-main placeholder-text-muted transition-all";
  const labelCls = "text-xs font-bold uppercase tracking-wider text-text-muted mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden border border-border-main animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border-main">
          <h3 className="text-xl font-bold text-text-main">{initialData ? 'Edit Goal' : 'Add New Goal'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-xl transition-all text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Goal Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. New Car"
              className={inputCls}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Target Amount (₹)</label>
              <input 
                type="number" 
                required
                placeholder="0"
                className={inputCls}
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Current Saved (₹)</label>
              <input 
                type="number" 
                required
                placeholder="0"
                className={inputCls}
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Deadline</label>
              <input 
                type="date" 
                className={inputCls}
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <input 
                type="text" 
                placeholder="e.g. Travel"
                className={inputCls}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 mt-4 bg-primary text-white hover:opacity-90 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
