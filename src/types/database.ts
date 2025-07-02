import type { Task } from './';

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

// Helper type for easy access to Task row
export type DbTask = Database['public']['Tables']['tasks']['Row'];

// Conversion functions between Task and DbTask
export const taskToDbTask = (task: Task): Database['public']['Tables']['tasks']['Insert'] => ({
  id: task.id,
  title: task.title,
  description: task.description || null,
  category: task.category,
  priority: task.priority,
  recurrence: task.recurrence || null,
  start_date: task.startDate,
  end_date: task.endDate || null,
  completed: task.completed || false,
  completed_dates: task.completedDates || [],
  color: task.color,
  backup_rotation: task.backupRotation || null,
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