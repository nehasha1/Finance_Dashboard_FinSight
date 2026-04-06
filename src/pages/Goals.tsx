import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  TrendingUp, 
  CheckCircle2,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import GoalModal from '../components/GoalModal';
import ConfirmModal from '../components/ConfirmModal';
import AnimatedPageTitle from '../components/AnimatedPageTitle';
import { toast } from 'react-toastify';
import type { SavingsGoal } from '../types';

const Goals = () => {
  const { savingsGoals, role, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<SavingsGoal | null>(null);

  const stats = useMemo(() => {
    const totalTarget = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalSaved = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
    const completedGoals = savingsGoals.filter(g => g.currentAmount >= g.targetAmount).length;
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    
    return { totalTarget, totalSaved, completedGoals, overallProgress };
  }, [savingsGoals]);

  const handleAdd = () => {
    setEditingGoal(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (g: SavingsGoal) => {
    setPendingDelete(g);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteSavingsGoal(pendingDelete.id);
      toast.success('Goal deleted successfully');
    }
  };

  const handleModalSubmit = (data: Omit<SavingsGoal, 'id'>) => {
    if (editingGoal) {
      updateSavingsGoal({ ...data, id: editingGoal.id });
      toast.success('Goal updated successfully');
    } else {
      addSavingsGoal(data);
      toast.success('Goal created successfully');
    }
  };

  return (
    <div className="animate-in fade-in space-y-8 pb-10 duration-500">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <AnimatedPageTitle
          title="Savings Goals"
          subtitle="Plan and track your future milestones"
          fromFontSizePx={18}
          toFontSizePx={34}
          durationMs={900}
          initialScale={0.8}
        />
        {role === 'Admin' && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>New Goal</span>
          </button>
        )}
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border-main bg-surface p-6 shadow-sm card-gradient-top"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Saved</p>
              <p className="text-2xl font-bold text-text-main">{formatCurrency(stats.totalSaved)}</p>
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-background">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.overallProgress}%` }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border-main bg-surface p-6 shadow-sm card-gradient-top"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Target</p>
              <p className="text-2xl font-bold text-text-main">{formatCurrency(stats.totalTarget)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-border-main bg-surface p-6 shadow-sm card-gradient-top"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Completed</p>
              <p className="text-2xl font-bold text-text-main">{stats.completedGoals} Goals</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savingsGoals.map((goal, index) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative flex flex-col rounded-3xl border border-border-main bg-surface p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md card-gradient-top"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {goal.category}
                  </span>
                  <h4 className="text-lg font-bold text-text-main flex items-center gap-2">
                    {goal.name}
                    {isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  </h4>
                </div>
                <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: goal.color || '#00e5a0' }}
                >
                  <Target className="h-5 w-5" />
                </div>
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-black text-text-main">
                    {formatCurrency(goal.currentAmount)}
                  </p>
                  <p className="text-xs font-bold text-text-muted">
                    of {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-background/50 border border-border-main/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color || '#00e5a0' }}
                  />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-bold text-text-muted">
                    {Math.round(progress)}% complete
                  </span>
                  {goal.deadline && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{goal.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-main/50">
                {role === 'Admin' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="rounded-lg p-2 text-text-muted transition-all hover:bg-background hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(goal)}
                      className="rounded-lg p-2 text-text-muted transition-all hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-8" /> 
                )}
                
                {!isCompleted && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <span>Keep saving</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modals */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingGoal}
      />

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="Delete Savings Goal?"
        description="Are you sure you want to delete this goal? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default Goals;
