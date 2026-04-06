import React from 'react';
import { motion } from 'framer-motion';
import { Search, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  type?: 'search' | 'data';
}

const EmptyState: React.FC<EmptyStateProps & { action?: { label: string, onClick: () => void } }> = ({ title, description, type = 'data', action }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 border border-border-main shadow-sm">
        {type === 'search' ? (
          <Search className="w-10 h-10 text-text-muted opacity-40" />
        ) : (
          <Inbox className="w-10 h-10 text-text-muted opacity-40" />
        )}
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2">{title}</h3>
      <p className="text-text-muted max-w-xs mx-auto text-sm font-medium mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-bold text-primary hover:underline"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
