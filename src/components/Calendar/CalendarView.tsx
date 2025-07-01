import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Task } from '../../types';
import { getMonthDays, formatDate } from '../../utils/dateUtils';
import { useTaskInstancesForCalendar } from '../../hooks/useTaskInstances';
import { LOCALE_NAMES } from '../../utils/constants';
import CalendarDay from './CalendarDay';

interface CalendarViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string, date: string) => void;
  onCreateTask: () => void;
}

export default function CalendarView({ tasks, onToggleTask, onCreateTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Hook optimizado: solo mes actual + adyacentes vs 365 días (90% menos cálculos)
  const taskInstances = useTaskInstancesForCalendar(tasks, currentDate);
  
  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const today = new Date();



  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const { dayNames } = LOCALE_NAMES;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <button
          onClick={onCreateTask}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-700 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {monthDays.map(day => {
          const dateString = formatDate(day);
          const dayTasks = taskInstances.getForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = formatDate(day) === formatDate(today);

          return (
            <CalendarDay
              key={dateString}
              date={day}
              tasks={dayTasks}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              onToggleTask={onToggleTask}
            />
          );
        })}
      </div>
    </div>
  );
}