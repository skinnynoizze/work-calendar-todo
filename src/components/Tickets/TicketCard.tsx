import React from 'react';
import { Edit, Trash2, User, Phone, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Ticket } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';
import { getTicketPriorityColorClasses, getTicketStatusColorClasses, getPriorityDisplayText, getStatusDisplayText } from '../../utils/ticketUtils';

interface TicketCardProps {
  ticket: Ticket;
  onEdit: () => void;
  onDelete: () => void;
  onClose?: () => void;
}

export default function TicketCard({ ticket, onEdit, onDelete, onClose }: TicketCardProps) {

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.title}</h3>
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTicketPriorityColorClasses(ticket.priority)}`}>
                {getPriorityDisplayText(ticket.priority)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTicketStatusColorClasses(ticket.status)}`}>
                {getStatusDisplayText(ticket.status)}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">Reporter:</span>
                <span>{ticket.reporter}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span className="font-medium">Teléfono:</span>
                <span>{ticket.phone}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Reportado:</span>
                <span>{formatTimeAgo(ticket.reportedAt)}</span>
              </div>
              
              {ticket.assignedTo && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Asignado a:</span>
                  <span>{ticket.assignedTo}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: ticket.color }}
              />
              <span className="text-sm text-gray-600">{ticket.category}</span>
            </div>
            
            {ticket.resolvedAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Resuelto {formatTimeAgo(ticket.resolvedAt)}</span>
              </div>
            )}
          </div>

          {ticket.notes && (
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">Notas: </span>
              <span className="text-sm text-gray-600">{ticket.notes}</span>
            </div>
          )}

          {ticket.resolution && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <span className="text-sm font-medium text-green-800">Resolución: </span>
              <span className="text-sm text-green-700">{ticket.resolution}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Editar
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Cerrar Ticket
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
} 