import { useState } from 'react';
import { TaskInstance } from '../../types';
import { getTaskStyles, sortTasksByPriority, getTaskStateColor } from '../../utils/taskUtils';
import { formatDate } from '../../utils/dateUtils';
import DayTasksModal from './DayTasksModal';

interface CalendarDayProps {
  date: Date;
  tasks: TaskInstance[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onToggleTask: (taskId: string, date: string) => void;
}

export default function CalendarDay({ 
  date, 
  tasks, 
  isCurrentMonth, 
  isToday, 
  onToggleTask 
}: CalendarDayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dateString = formatDate(date);
  
  // Ordenar tareas por prioridad (alta -> media -> baja)
  const sortedTasks = sortTasksByPriority(tasks);
  
  return (
    <>
      <DayTasksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={date}
        tasks={sortedTasks}
        onToggleTask={onToggleTask}
      />
          <div 
        className={`min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-opacity-70 transition-colors ${
          !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
        } ${isToday ? 'bg-blue-50' : ''}`}
        onClick={() => setIsModalOpen(true)}
        title={`Ver todas las tareas del ${date.getDate()}`}
      >
        <div className={`text-sm font-medium mb-2 ${
          !isCurrentMonth ? 'text-gray-400' : isToday ? 'text-blue-600' : 'text-gray-900'
        }`}>
          {date.getDate()}
        </div>
      
      <div className="space-y-1">
        {sortedTasks.slice(0, 3).map((taskInstance, index) => (
          <div
            key={`${taskInstance.taskId}-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleTask(taskInstance.taskId, dateString);
            }}
            className={`text-xs p-1 rounded cursor-pointer transition-all hover:shadow-sm ${
              taskInstance.completed 
                ? 'bg-green-100 text-green-800 line-through opacity-75' 
                : 'text-white hover:opacity-90'
            }`}
            style={{
              ...getTaskStyles(taskInstance.task),
              backgroundColor: getTaskStateColor(taskInstance.completed, taskInstance.task)
            }}
            title={taskInstance.task.title}
          >
            <div className="truncate">
              {taskInstance.task.title}
            </div>
          </div>
        ))}
        
        {sortedTasks.length > 3 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="w-full text-xs text-blue-600 text-center hover:text-blue-800 hover:bg-gray-100 rounded p-1 transition-colors"
          >
            +{sortedTasks.length - 3} más
          </button>
        )}
      </div>
    </div>
    </>
  );
}