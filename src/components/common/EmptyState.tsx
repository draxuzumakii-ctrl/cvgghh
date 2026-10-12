import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl border border-white/5">
      <div className="p-4 rounded-2xl bg-electric-500/10 text-electric-400 mb-4 ring-1 ring-electric-500/20">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-4 py-2 text-xs font-semibold rounded-xl bg-electric-500 text-dark-950 hover:bg-electric-400 transition-all shadow-electric-glow"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
