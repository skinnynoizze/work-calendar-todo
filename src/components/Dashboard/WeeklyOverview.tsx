import { useState } from 'react';
import { TaskInstance } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getTaskStyles, sortTasksByPriority, getTaskStateColor } from '../../utils/taskUtils';
import DayTasksModal from '../Calendar/DayTasksModal';

interface WeeklyOverviewProps {
  weeklyTasks: Array<{
    date: Date;
    tasks: TaskInstance[];
  }>;
  onToggleTask: (taskId: string, date: string) => void;
}

export default function WeeklyOverview({ weeklyTasks, onToggleTask }: WeeklyOverviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<TaskInstance[]>([]);
  
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date();

  const openModal = (date: Date, tasks: TaskInstance[]) => {
    setSelectedDate(date);
    setSelectedTasks(sortTasksByPriority(tasks));
    setIsModalOpen(true);
  };

  return (
    <>
      <DayTasksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate || new Date()}
        tasks={selectedTasks}
        onToggleTask={onToggleTask}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Semanal</h3>
      
      <div className="space-y-3">
        {weeklyTasks.map(({ date, tasks }, index) => {
          const isToday = formatDate(date) === formatDate(today);
          const completedTasks = tasks.filter(t => t.completed).length;
          const totalTasks = tasks.length;
          const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <div key={index} className={`p-3 rounded-lg border ${
              isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {dayNames[date.getDay()]} {date.getDate()}
                  </span>
                  {isToday && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Hoy
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {completedTasks}/{totalTasks} completadas
                </span>
              </div>
              
              {totalTasks > 0 && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sortTasksByPriority(tasks).slice(0, 3).map((task, taskIndex) => (
                      <button
                        key={taskIndex}
                        onClick={() => onToggleTask(task.taskId, task.date)}
                        className={`text-xs px-2 py-1 rounded transition-all ${
                          task.completed
                            ? 'bg-green-100 text-green-800 line-through'
                            : 'text-white hover:opacity-90'
                        }`}
                        style={{
                          ...getTaskStyles(task.task),
                          backgroundColor: getTaskStateColor(task.completed, task.task)
                        }}
                        title={task.task.title}
                      >
                        {task.task.title.length > 15 
                          ? `${task.task.title.slice(0, 15)}...`
                          : task.task.title
                        }
                      </button>
                    ))}
                    {tasks.length > 3 && (
                      <button
                        onClick={() => openModal(date, tasks)}
                        className="text-xs text-blue-600 px-2 py-1 hover:text-blue-800 hover:bg-gray-100 rounded transition-colors"
                      >
                        +{tasks.length - 3}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {totalTasks === 0 && (
                <p className="text-xs text-gray-500">No hay tareas programadas</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}