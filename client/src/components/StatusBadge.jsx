import React from 'react';
import { Clock, CheckCircle, AlertCircle, RefreshCw, XCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function StatusBadge({ status, className = '' }) {
  const { translateStatus } = useLanguage();

  const configs = {
    'Submitted': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      label: 'Submitted'
    },
    'Under Review': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: RefreshCw,
      label: 'Under Review'
    },
    'Approved': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
      label: 'Approved'
    },
    'In Progress': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: RefreshCw,
      label: 'In Progress'
    },
    'Resolved': {
      bg: 'bg-teal-50 text-teal-800 border-teal-300 font-semibold',
      icon: CheckCircle,
      label: 'Resolved'
    },
    'Needs More Information': {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: HelpCircle,
      label: 'Needs More Info'
    },
    'Needs More Info': {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: HelpCircle,
      label: 'Needs More Info'
    },
    'Rejected': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Rejected'
    }
  };

  const config = configs[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle,
    label: status || 'Unknown'
  };

  const IconComponent = config.icon;
  const translatedLabel = translateStatus(status || config.label);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{translatedLabel}</span>
    </span>
  );
}
