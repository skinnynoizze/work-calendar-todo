import { Ticket } from '../types';
import { TICKET_PRIORITY_ORDER, TICKET_PRIORITY_COLORS } from './constants';
import { getUniqueCategories } from './categoryUtils';

// Get unique categories from tickets (similar to tasks)
export const getUniqueTicketCategories = (tickets: Ticket[]): Array<{ name: string; color: string }> => {
  return getUniqueCategories(tickets);
};



// Get priority color for badges
export const getTicketPriorityColor = (priority: string): string => {
  return TICKET_PRIORITY_COLORS[priority as keyof typeof TICKET_PRIORITY_COLORS] || TICKET_PRIORITY_COLORS.default;
};

// Get status color
export const getTicketStatusColor = (status: string): string => {
  switch (status) {
    case 'open': return '#2563EB';      // Blue-600
    case 'in-progress': return '#7C3AED'; // Violet-600
    case 'pending': return '#D97706';   // Amber-600
    case 'resolved': return '#059669';  // Emerald-600
    case 'closed': return '#6B7280';    // Gray-500
    default: return '#6B7280';          // Gray-500
  }
};

// Sort tickets by priority and date
export const sortTicketsByPriority = (tickets: Ticket[]): Ticket[] => {
  return [...tickets].sort((a, b) => {
    // First sort by priority using centralized order
    const priorityDiff = TICKET_PRIORITY_ORDER[a.priority] - TICKET_PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// Get ticket statistics
export const getTicketStats = (tickets: Ticket[]): {
  total: number;
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
  closed: number;
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  activeTickets: number; // open + in-progress + pending
} => {
  const stats = {
    total: tickets.length,
    open: 0,
    inProgress: 0,
    pending: 0,
    resolved: 0,
    closed: 0,
    byPriority: {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    activeTickets: 0
  };

  tickets.forEach(ticket => {
    // Count by status
    switch (ticket.status) {
      case 'open':
        stats.open++;
        break;
      case 'in-progress':
        stats.inProgress++;
        break;
      case 'pending':
        stats.pending++;
        break;
      case 'resolved':
        stats.resolved++;
        break;
      case 'closed':
        stats.closed++;
        break;
    }

    // Count by priority
    stats.byPriority[ticket.priority]++;
  });

  stats.activeTickets = stats.open + stats.inProgress + stats.pending;

  return stats;
};

// Usar formatTimeAgo de dateUtils en su lugar

// Check if ticket is overdue (for future SLA implementation)
export const isTicketOverdue = (ticket: Ticket, slaHours: number = 24): boolean => {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return false;
  
  const reportedDate = new Date(ticket.reportedAt);
  const now = new Date();
  const diffInHours = (now.getTime() - reportedDate.getTime()) / (1000 * 60 * 60);
  
  return diffInHours > slaHours;
};

// Centralized color functions for consistency
export const getTicketPriorityColorClasses = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getTicketStatusColorClasses = (status: string): string => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Get display text for status
export const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case 'open': return 'Abierto';
    case 'in-progress': return 'En Progreso';
    case 'pending': return 'Pendiente';
    case 'resolved': return 'Resuelto';
    case 'closed': return 'Cerrado';
    default: return status;
  }
};

// Get display text for priority
export const getPriorityDisplayText = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'Urgente';
    case 'high': return 'Alta';
    case 'medium': return 'Media';
    case 'low': return 'Baja';
    default: return priority;
  }
}; 