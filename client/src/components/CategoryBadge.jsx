import React from 'react';
import { Trash2, Sparkles, Droplets, Wrench, Trees, HelpCircle } from 'lucide-react';

export default function CategoryBadge({ category, className = '', showIcon = true }) {
  const configs = {
    'Garbage and Waste Management': {
      bg: 'bg-amber-100/70 text-amber-900 border-amber-300',
      icon: Trash2,
      short: 'Waste Mgmt'
    },
    'Public Cleanliness': {
      bg: 'bg-emerald-100/70 text-emerald-900 border-emerald-300',
      icon: Sparkles,
      short: 'Cleanliness'
    },
    'Water Leakage': {
      bg: 'bg-sky-100/70 text-sky-900 border-sky-300',
      icon: Droplets,
      short: 'Water Leak'
    },
    'Damaged Public Facilities': {
      bg: 'bg-purple-100/70 text-purple-900 border-purple-300',
      icon: Wrench,
      short: 'Facilities'
    },
    'Environmental Problems': {
      bg: 'bg-teal-100/70 text-teal-900 border-teal-300',
      icon: Trees,
      short: 'Environment'
    },
    'Other Community Issues': {
      bg: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: HelpCircle,
      short: 'Other'
    }
  };

  const config = configs[category] || configs['Other Community Issues'];
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />}
      <span className="truncate">{category}</span>
    </span>
  );
}
