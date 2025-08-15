import { OrderStatus } from '../types';

export const statusWorkflow = {
  pending: {
    nextStatus: 'in-progress' as OrderStatus,
    buttonText: 'Start Preparing',
    buttonColor: 'bg-orange-500 hover:bg-orange-600',
    allowedActions: ['start', 'cancel']
  },
  'in-progress': {
    nextStatus: 'completed' as OrderStatus,
    buttonText: 'Mark Complete',
    buttonColor: 'bg-green-500 hover:bg-green-600',
    allowedActions: ['complete', 'cancel']
  },
  completed: {
    nextStatus: null,
    buttonText: 'Completed',
    buttonColor: 'bg-gray-500',
    allowedActions: ['archive']
  }
};

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'border-red-300 bg-red-50';
    case 'in-progress':
      return 'border-orange-300 bg-orange-50';
    case 'completed':
      return 'border-green-300 bg-green-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

export const getStatusBadgeColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-red-500 text-white';
    case 'in-progress':
      return 'bg-amber-500 text-white';
    case 'completed':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getTimeElapsed = (timestamp: string): string => {
  const now = new Date();
  const orderTime = new Date(timestamp);
  const diffMs = now.getTime() - orderTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}h ${diffMins % 60}m ago`;
};

export const isOrderUrgent = (timestamp: string, status: OrderStatus): boolean => {
  const now = new Date();
  const orderTime = new Date(timestamp);
  const diffMins = Math.floor((now.getTime() - orderTime.getTime()) / 60000);
  
  if (status === 'pending' && diffMins > 10) return true;
  if (status === 'in-progress' && diffMins > 30) return true;
  
  return false;
};