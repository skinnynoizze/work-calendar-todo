export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number; // Every X days/weeks/months
    daysOfWeek?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number; // For monthly: which day of month
  };
  startDate: string; // ISO date string
  endDate?: string; // Optional end date for recurrence
  completed: boolean;
  completedDates: string[]; // Array of completed dates (ISO strings)
  createdAt: string;
  color: string;
  backupRotation?: {
    enabled: boolean;
    nextFridayTape: 'V1' | 'V2' | 'V3' | 'M1' | 'M2' | 'M3';
    referenceDate: string; // Fecha del "próximo viernes" para calcular desde ahí
  };
}

export interface TaskInstance {
  taskId: string;
  date: string; // ISO date string
  completed: boolean;
  task: Task;
}

export interface TaskInstancesResult {
  all: TaskInstance[];
  byDate: Record<string, TaskInstance[]>;
  getForDate: (date: Date) => TaskInstance[];
  getForDateRange: (start: Date, end: Date) => TaskInstance[];
}

export type ViewMode = 'calendar' | 'tasks' | 'dashboard' | 'tickets';

// Ticket system types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  reporter: string; // Usuario que reporta
  phone: string; // Ext/Tlf  
  reportedAt: string; // Fecha notificación (ISO string)
  notes?: string;
  resolution?: string;
  resolvedAt?: string; // Fecha de resolución (ISO string)
  category: string; // Texto libre como las tareas
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string; // Técnico asignado
  createdAt: string;
  updatedAt: string;
  color: string; // Para categorías como en tareas
}