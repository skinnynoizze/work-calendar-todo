// Constantes de tiempo
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_DAY: 24 * 60 * 60 * 1000,
  MILLISECONDS_PER_WEEK: 7 * 24 * 60 * 60 * 1000,
  DAYS_PER_CALENDAR_MONTH: 42, // 6 semanas
  SAFETY_LIMIT_DAYS: 365,
} as const;

// Nombres de días y meses en español
export const LOCALE_NAMES = {
  dayNames: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  dayNamesLong: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  locale: 'es-ES',
} as const;

// Patrones comunes de días de la semana
export const DAY_PATTERNS = {
  WEEKDAYS: [1, 2, 3, 4, 5], // Lunes a Viernes
  WEEKENDS: [0, 6], // Domingo y Sábado
  ALL_DAYS: [0, 1, 2, 3, 4, 5, 6],
} as const;

// Prioridades de tareas
export const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
} as const;

// Colores por prioridad
export const PRIORITY_COLORS = {
  high: '#EF4444', // red-500
  medium: '#F59E0B', // amber-500
  low: '#10B981', // emerald-500
  default: '#6B7280', // gray-500
} as const;

// Etiquetas de prioridad
export const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
} as const;

// Colores de estado de tareas
export const TASK_STATE_COLORS = {
  completed: '#D1FAE5', // Light green for completed tasks
  default: '#F3F4F6', // Default gray background
} as const;

// Etiquetas de recurrencia
export const RECURRENCE_LABELS = {
  none: 'Sin repetición',
  daily: 'Diario',
  weekly: 'Semanal', 
  monthly: 'Mensual',
} as const;

// Límites de UI para mostrar elementos
export const UI_LIMITS = {
  CALENDAR_TASKS_PREVIEW: 3,
  WEEKLY_TASKS_PREVIEW: 3,
  UPCOMING_HIGH_PRIORITY: 5,
  OVERDUE_TASKS_PREVIEW: 3,
  TODAY_TASKS_PREVIEW: 4,
  TASK_TITLE_TRUNCATE: 15,
} as const; 