import type { Task, Ticket } from './';

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          priority: 'low' | 'medium' | 'high';
          recurrence: {
            type: 'none' | 'daily' | 'weekly' | 'monthly';
            interval: number;
            daysOfWeek?: number[];
            endDate?: string;
          } | null;
          start_date: string;
          end_date: string | null;
          completed: boolean;
          completed_dates: string[];
          color: string;
          backup_rotation: {
            enabled: boolean;
            nextFridayTape: 'V1' | 'V2' | 'V3' | 'M1' | 'M2' | 'M3';
            referenceDate: string;
          } | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          priority: 'low' | 'medium' | 'high';
          recurrence?: {
            type: 'none' | 'daily' | 'weekly' | 'monthly';
            interval: number;
            daysOfWeek?: number[];
            endDate?: string;
          } | null;
          start_date: string;
          end_date?: string | null;
          completed?: boolean;
          completed_dates?: string[];
          color: string;
          backup_rotation?: {
            enabled: boolean;
            nextFridayTape: 'V1' | 'V2' | 'V3' | 'M1' | 'M2' | 'M3';
            referenceDate: string;
          } | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          priority?: 'low' | 'medium' | 'high';
          recurrence?: {
            type: 'none' | 'daily' | 'weekly' | 'monthly';
            interval: number;
            daysOfWeek?: number[];
            endDate?: string;
          } | null;
          start_date?: string;
          end_date?: string | null;
          completed?: boolean;
          completed_dates?: string[];
          color?: string;
          backup_rotation?: {
            enabled: boolean;
            nextFridayTape: 'V1' | 'V2' | 'V3' | 'M1' | 'M2' | 'M3';
            referenceDate: string;
          } | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          title: string;
          description: string;
          reporter: string;
          phone: string;
          reported_at: string;
          notes: string | null;
          resolution: string | null;
          resolved_at: string | null;
          category: string;
          status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          reporter: string;
          phone: string;
          reported_at: string;
          notes?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          category: string;
          status?: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          color: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          reporter?: string;
          phone?: string;
          reported_at?: string;
          notes?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          category?: string;
          status?: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easy access
export type DbTask = Database['public']['Tables']['tasks']['Row'];
export type DbTicket = Database['public']['Tables']['tickets']['Row'];

// Task conversion functions (existing)
export const taskToDbTask = (task: Partial<Task>): Database['public']['Tables']['tasks']['Insert'] => ({
  ...(task.id && { id: task.id }),
  title: task.title!,
  description: task.description || null,
  category: task.category!,
  priority: task.priority!,
  recurrence: task.recurrence || null,
  start_date: task.startDate!,
  end_date: task.endDate || null,
  completed: task.completed || false,
  completed_dates: task.completedDates || [],
  color: task.color!,
  backup_rotation: task.backupRotation || null,
  ...(task.createdAt && { created_at: task.createdAt }),
});

export const dbTaskToTask = (dbTask: DbTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || '',
  category: dbTask.category,
  priority: dbTask.priority,
  recurrence: dbTask.recurrence || { type: 'none', interval: 1 },
  startDate: dbTask.start_date,
  endDate: dbTask.end_date || undefined,
  completed: dbTask.completed,
  completedDates: dbTask.completed_dates,
  color: dbTask.color,
  backupRotation: dbTask.backup_rotation || undefined,
  createdAt: dbTask.created_at,
});

// Ticket conversion functions (new - centralized)
export const ticketToDbTicket = (ticket: Partial<Ticket>): Database['public']['Tables']['tickets']['Insert'] => ({
  ...(ticket.id && { id: ticket.id }),
  title: ticket.title!,
  description: ticket.description!,
  reporter: ticket.reporter!,
  phone: ticket.phone!,
  reported_at: ticket.reportedAt!,
  notes: ticket.notes || null,
  resolution: ticket.resolution || null,
  resolved_at: ticket.resolvedAt || null,
  category: ticket.category!,
  status: ticket.status!,
  priority: ticket.priority!,
  assigned_to: ticket.assignedTo || null,
  color: ticket.color!,
  ...(ticket.createdAt && { created_at: ticket.createdAt }),
  ...(ticket.updatedAt && { updated_at: ticket.updatedAt }),
});

export const dbTicketToTicket = (dbTicket: DbTicket): Ticket => ({
  id: dbTicket.id,
  title: dbTicket.title,
  description: dbTicket.description,
  reporter: dbTicket.reporter,
  phone: dbTicket.phone,
  reportedAt: dbTicket.reported_at,
  notes: dbTicket.notes || undefined,
  resolution: dbTicket.resolution || undefined,
  resolvedAt: dbTicket.resolved_at || undefined,
  category: dbTicket.category,
  status: dbTicket.status,
  priority: dbTicket.priority,
  assignedTo: dbTicket.assigned_to || undefined,
  color: dbTicket.color,
  createdAt: dbTicket.created_at,
  updatedAt: dbTicket.updated_at,
}); 