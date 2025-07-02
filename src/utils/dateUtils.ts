import { TIME_CONSTANTS, LOCALE_NAMES } from './constants';

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days: Date[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < TIME_CONSTANTS.DAYS_PER_CALENDAR_MONTH; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString(LOCALE_NAMES.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_DAY) + 1) / 7);
};

// Función para obtener string de fecha de hoy (evita múltiples instanciaciones)
export const getTodayString = (): string => {
  return formatDate(new Date());
};

// Función para obtener etiqueta de fecha relativa
export const getRelativeDateLabel = (date: Date, referenceDate: Date = new Date()): string => {
  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (formatDate(date) === formatDate(referenceDate)) {
    return 'Hoy';
  } else if (formatDate(date) === formatDate(tomorrow)) {
    return 'Mañana';
  } else {
    return date.toLocaleDateString();
  }
};

// Función para formatear tiempo transcurrido (reemplaza formatDistanceToNow de date-fns)
export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `hace ${diffInDays}d`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `hace ${diffInWeeks} sem`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `hace ${diffInMonths} mes`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
};