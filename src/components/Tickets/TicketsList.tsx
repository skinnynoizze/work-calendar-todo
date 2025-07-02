import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Ticket } from '../../types';
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_ORDER } from '../../utils/constants';
import TicketCard from './TicketCard';

interface TicketsListProps {
  tickets: Ticket[];
  onCreateTicket: () => void;
  onEditTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
}

export default function TicketsList({ tickets, onCreateTicket, onEditTicket, onDeleteTicket }: TicketsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Get unique values for filters
  const statuses = Array.from(new Set(tickets.map(ticket => ticket.status)));
  const priorities = Array.from(new Set(tickets.map(ticket => ticket.priority)));
  const categories = Array.from(new Set(tickets.map(ticket => ticket.category)));

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.reporter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Sort tickets by priority and date
  const sortedTickets = filteredTickets.sort((a, b) => {
    // Use centralized priority order
    const priorityDiff = TICKET_PRIORITY_ORDER[a.priority] - TICKET_PRIORITY_ORDER[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Gestión de incidencias y soporte técnico</p>
        </div>
        <button
          onClick={onCreateTicket}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Ticket
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {TICKET_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {TICKET_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Count */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredTickets.length} de {tickets.length} tickets
      </div>

      {/* Tickets Grid */}
      <div className="grid gap-4">
        {sortedTickets.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <div className="text-gray-400 mb-2">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tickets</h3>
            <p className="text-gray-600 mb-4">
              {tickets.length === 0 
                ? 'No hay tickets registrados. Crea el primero para comenzar.'
                : 'No hay tickets que coincidan con los filtros seleccionados.'
              }
            </p>
            {tickets.length === 0 && (
              <button
                onClick={onCreateTicket}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Crear Primer Ticket
              </button>
            )}
          </div>
        ) : (
          sortedTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onEdit={() => onEditTicket(ticket)}
              onDelete={() => onDeleteTicket(ticket.id)}
            />
          ))
        )}
      </div>
    </div>
  );
} 