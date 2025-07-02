import React from 'react';
import { Headphones, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Ticket } from '../../types';
import { getStatusDisplayText, getTicketStatusColorClasses } from '../../utils/ticketUtils';
import { formatTimeAgo } from '../../utils/dateUtils';

interface TicketsOverviewProps {
  tickets: Ticket[];
}

export default function TicketsOverview({ tickets }: TicketsOverviewProps) {
  // Get recent active tickets (not resolved or closed)
  const activeTickets = tickets
    .filter(ticket => ticket.status !== 'resolved' && ticket.status !== 'closed')
    .sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5); // Show only top 5

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Headphones className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900">Tickets Recientes</h3>
        </div>
        <span className="text-sm text-gray-500">
          {activeTickets.length} activos
        </span>
      </div>

      {activeTickets.length === 0 ? (
        <div className="text-center py-8">
          <Headphones className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No hay tickets activos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  {getPriorityIcon(ticket.priority)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {ticket.reporter} • {ticket.phone}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTicketStatusColorClasses(ticket.status)}`}>
                      {getStatusDisplayText(ticket.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(ticket.reportedAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 ml-2">
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ticket.color }}
                  />
                  <span className="text-xs text-gray-500">{ticket.category}</span>
                </div>
              </div>
            </div>
          ))}
          
          {tickets.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                y {tickets.length - 5} tickets más...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 