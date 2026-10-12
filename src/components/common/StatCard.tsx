import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accent?: 'electric' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = 'electric'
}) => {
  const accentStyles = {
    electric: {
      bg: 'bg-electric-500/10',
      text: 'text-electric-400',
      border: 'hover:border-electric-500/30',
      glow: 'group-hover:shadow-electric-glow'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'hover:border-emerald-500/30',
      glow: ''
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'hover:border-amber-500/30',
      glow: ''
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'hover:border-rose-500/30',
      glow: ''
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'hover:border-purple-500/30',
      glow: ''
    }
  };

  const style = accentStyles[accent];

  return (
    <div className={`group glass-panel rounded-2xl p-5 border transition-all duration-300 ${style.border} ${style.glow}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${style.bg} ${style.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold tracking-tight text-white font-['JetBrains_Mono',monospace]">{value}</h3>
        {(subtitle || trend) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {trend && (
              <span className={`font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
