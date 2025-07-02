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

// === CONSTANTES DE TASKS ===

// Prioridades de tareas
export const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
} as const;

// Colores de prioridad de tasks
export const PRIORITY_COLORS = {
  high: '#EF4444', // red-500
  medium: '#F59E0B', // amber-500
  low: '#10B981', // emerald-500
  default: '#6B7280', // gray-500 (fallback para prioridades inválidas)
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

// === CONSTANTES DE TICKETS ===

// Etiquetas de estado de tickets
export const TICKET_STATUS_LABELS = {
  open: 'Abierto',
  'in-progress': 'En Progreso',
  pending: 'Pendiente',
  resolved: 'Resuelto',
  closed: 'Cerrado',
} as const;

// Etiquetas de prioridad de tickets (incluye 'urgent')
export const TICKET_PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
} as const;

// Orden de prioridad de tickets (para ordenamiento)
export const TICKET_PRIORITY_ORDER = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
} as const;

// Colores de prioridad de tickets (consistentes con tasks donde aplica)
export const TICKET_PRIORITY_COLORS = {
  urgent: '#EF4444',  // Rojo (mismo que task.high)
  high: '#EA580C',    // Naranja (nivel intermedio)
  medium: '#F59E0B',  // Ámbar (mismo que task.medium)
  low: '#10B981',     // Verde (mismo que task.low)
  default: '#6B7280', // Gris (fallback para prioridades inválidas)
} as const;

// Categorías predefinidas de tickets (sistema híbrido: predefinidas + dinámicas como tasks)
export const DEFAULT_TICKET_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: 'Hardware', color: '#EF4444' },     // Red
  { name: 'Software', color: '#3B82F6' },     // Blue
  { name: 'Red', color: '#F59E0B' },          // Amber
  { name: 'Soporte Usuario', color: '#10B981' }, // Green
  { name: 'Sistema', color: '#8B5CF6' },      // Purple
  { name: 'Seguridad', color: '#DC2626' },    // Red-600
  { name: 'Otro', color: '#6B7280' }          // Gray
];

// === MENSAJES DE CONFIRMACIÓN ===

// Mensajes para diálogos de confirmación
export const CONFIRMATION_MESSAGES = {
  deleteTask: '¿Estás seguro de que quieres eliminar esta tarea?',
  deleteTicket: '¿Estás seguro de que quieres eliminar este ticket?',
  deleteCategory: '¿Estás seguro de que quieres eliminar esta categoría?',
  discardChanges: '¿Estás seguro de que quieres descartar los cambios?',
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