import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { ticketToDbTicket, dbTicketToTicket, type Database, type DbTicket } from '../types/database';
import type { Ticket } from '../types';
import { logError, createErrorMessage } from '../utils/errorUtils';

interface UseSupabaseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  addTicket: (ticket: Partial<Ticket>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  refreshTickets: () => Promise<void>;
}

export function useSupabaseTickets(): UseSupabaseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper para resetear el flag de manera segura
  const scheduleLocalUpdateReset = useCallback(() => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Programar nuevo timeout
    timeoutRef.current = setTimeout(() => {
      setIsLocalUpdate(false);
      timeoutRef.current = null;
    }, 100);
  }, []);

  // Cleanup timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch all tickets from Supabase
  const refreshTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const mappedTickets = data?.map(dbTicketToTicket) || [];
      setTickets(mappedTickets);
    } catch (err) {
      logError(err, { operation: 'fetch-tickets' });
      setError(createErrorMessage('obtener tickets', err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new ticket
  const addTicket = useCallback(async (ticket: Partial<Ticket>) => {
    try {
      setError(null);
      setIsLocalUpdate(true);
      
      const dbTicket = ticketToDbTicket(ticket);
      
      const { data, error: insertError } = await supabase
        .from('tickets')
        .insert([dbTicket])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Actualización optimista: agregar el ticket al estado local
      if (data) {
        const newTicket = dbTicketToTicket(data);
        setTickets(prev => [newTicket, ...prev]);
      }

      // Resetear flag después de un breve delay
      scheduleLocalUpdateReset();
    } catch (err) {
      logError(err, { operation: 'add-ticket', metadata: { title: ticket.title } });
      setError(createErrorMessage('crear ticket', err));
      setIsLocalUpdate(false);
      throw err;
    }
  }, [scheduleLocalUpdateReset]);

  // Update an existing ticket
  const updateTicket = useCallback(async (id: string, updates: Partial<Ticket>) => {
    try {
      setError(null);
      setIsLocalUpdate(true);
      
      // Actualización optimista: actualizar estado local inmediatamente
      let previousTickets: Ticket[] = [];
      setTickets(prev => {
        previousTickets = prev; // Capturar estado actual
        return prev.map(ticket => 
          ticket.id === id ? { ...ticket, ...updates, updatedAt: new Date().toISOString() } : ticket
        );
      });
      
      // Convert Ticket updates to database format
      const dbUpdates: Partial<Database['public']['Tables']['tickets']['Update']> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.reporter !== undefined) dbUpdates.reporter = updates.reporter;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.reportedAt !== undefined) dbUpdates.reported_at = updates.reportedAt;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
      if (updates.resolution !== undefined) dbUpdates.resolution = updates.resolution || null;
      if (updates.resolvedAt !== undefined) dbUpdates.resolved_at = updates.resolvedAt || null;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo || null;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('tickets')
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) {
        // Revertir si hay error
        setTickets(previousTickets);
        throw updateError;
      }

      // Resetear flag después de un breve delay
      scheduleLocalUpdateReset();
    } catch (err) {
      logError(err, { operation: 'update-ticket', ticketId: id, metadata: { updates } });
      setError(createErrorMessage('actualizar ticket', err));
      setIsLocalUpdate(false);
      throw err;
    }
  }, [scheduleLocalUpdateReset]);

  // Delete a ticket
  const deleteTicket = useCallback(async (id: string) => {
    try {
      setError(null);
      setIsLocalUpdate(true);

      // Actualización optimista: remover de estado local inmediatamente  
      let previousTickets: Ticket[] = [];
      setTickets(prev => {
        previousTickets = prev; // Capturar estado actual
        return prev.filter(t => t.id !== id);
      });
      
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Revertir si hay error
        setTickets(previousTickets);
        throw deleteError;
      }

      // Resetear flag después de un breve delay
      scheduleLocalUpdateReset();
    } catch (err) {
      logError(err, { operation: 'delete-ticket', ticketId: id });
      setError(createErrorMessage('eliminar ticket', err));
      setIsLocalUpdate(false);
      throw err;
    }
  }, [scheduleLocalUpdateReset]);

  // Load tickets on mount
  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  // Set up real-time subscription for tickets
  useEffect(() => {
    if (isLocalUpdate) {
      // Skip real-time updates when we're making local changes
      return;
    }

    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          console.log('Ticket real-time update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                const newTicket = dbTicketToTicket(payload.new as DbTicket);
                setTickets(prev => {
                  // Evitar duplicados
                  const exists = prev.some(t => t.id === newTicket.id);
                  if (exists) return prev;
                  return [newTicket, ...prev];
                });
              }
              break;
            case 'UPDATE':
              if (payload.new) {
                const updatedTicket = dbTicketToTicket(payload.new as DbTicket);
                setTickets(prev => prev.map(t => 
                  t.id === updatedTicket.id ? updatedTicket : t
                ));
              }
              break;
            case 'DELETE':
              if (payload.old) {
                setTickets(prev => prev.filter(t => t.id !== payload.old.id));
              }
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLocalUpdate]);

  return {
    tickets,
    loading,
    error,
    addTicket,
    updateTicket,
    deleteTicket,
    refreshTickets,
  };
} 