import React from 'react';
import { Clock, CheckCircle, Loader, XCircle } from 'lucide-react';

const statusConfig = {
  pending: {
    icon: Clock,
    text: 'Pending',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  processing: {
    icon: Loader,
    text: 'Processing',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600'
  },
  completed: {
    icon: CheckCircle,
    text: 'Completed',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    iconColor: 'text-green-600'
  },
  failed: {
    icon: XCircle,
    text: 'Failed',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    iconColor: 'text-red-600'
  }
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
      {config.text}
    </span>
  );
}

export default StatusBadge;
