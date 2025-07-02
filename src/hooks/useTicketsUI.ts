import { useState, useCallback } from 'react';
import { useSupabaseTickets } from './useSupabaseTickets';
import { Ticket } from '../types';
import { logError } from '../utils/errorUtils';
import { CONFIRMATION_MESSAGES } from '../utils/constants';

/**
 * Hook UI para tickets - encapsula modal state y CRUD handlers
 * 
 * Separa la lógica de UI (modals, handlers) de la lógica de datos (useSupabaseTickets)
 * Incluye: estado de modal, handlers de create/edit/save/delete, error handling
 * 
 * @example
 * const ticketsUI = useTicketsUI();
 * return (
 *   <>
 *     <TicketsList {...ticketsUI} />
 *     <TicketModal {...ticketsUI} />
 *   </>
 * );
 * 
 * @returns {object} Datos de tickets + estado de modal + handlers UI
 */
export function useTicketsUI() {
  const { 
    tickets, 
    loading, 
    error, 
    addTicket, 
    updateTicket, 
    deleteTicket 
  } = useSupabaseTickets();
  
  // Modal state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | undefined>();

  // UI handlers que usan los hooks de datos existentes
  const handleCreateTicket = useCallback(() => {
    setEditingTicket(undefined);
    setIsTicketModalOpen(true);
  }, []);

  const handleEditTicket = useCallback((ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsTicketModalOpen(true);
  }, []);

  const handleSaveTicket = useCallback(async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTicket) {
        // Update existing ticket
        await updateTicket(editingTicket.id, ticketData);
      } else {
        // Create new ticket - Supabase generates ID, createdAt, and updatedAt
        await addTicket(ticketData);
      }
      setIsTicketModalOpen(false);
    } catch (error) {
      logError(error, { operation: 'save-ticket-ui', metadata: { isEdit: !!editingTicket } });
    }
  }, [editingTicket, updateTicket, addTicket]);

  const handleDeleteTicket = useCallback(async (ticketId: string) => {
    if (confirm(CONFIRMATION_MESSAGES.deleteTicket)) {
      try {
        await deleteTicket(ticketId);
      } catch (error) {
        logError(error, { operation: 'delete-ticket-ui', ticketId });
      }
    }
  }, [deleteTicket]);

  const handleCloseTicket = useCallback(async (ticketId: string) => {
    if (confirm('¿Estás seguro que deseas cerrar este ticket? Esta acción cambiará su estado a cerrado.')) {
      try {
        await updateTicket(ticketId, { status: 'closed' });
      } catch (error) {
        logError(error, { operation: 'close-ticket-ui', ticketId });
      }
    }
  }, [updateTicket]);

  const closeTicketModal = useCallback(() => setIsTicketModalOpen(false), []);

  return {
    // Data from supabase hook
    tickets,
    loading,
    error,
    
    // UI state
    isTicketModalOpen,
    editingTicket,
    
    // UI handlers
    handleCreateTicket,
    handleEditTicket,
    handleSaveTicket,
    handleDeleteTicket,
    handleCloseTicket,
    closeTicketModal
  };
} 