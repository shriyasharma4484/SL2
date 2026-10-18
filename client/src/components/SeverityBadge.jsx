import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export default function SeverityBadge({ severity, className = '' }) {
  const configs = {
    'Critical': {
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: ShieldAlert,
      label: 'Critical'
    },
    'High': {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: AlertTriangle,
      label: 'High Priority'
    },
    'Medium': {
      bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: AlertCircle,
      label: 'Medium'
    },
    'Low': {
      bg: 'bg-slate-50 text-slate-600 border-slate-200',
      icon: Info,
      label: 'Low Priority'
    }
  };

  const config = configs[severity] || configs['Medium'];
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${className}`}
    >
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}
