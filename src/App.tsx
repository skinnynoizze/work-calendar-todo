import { useState } from 'react';
import { Task, ViewMode } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateId } from './utils/idUtils';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import CalendarView from './components/Calendar/CalendarView';
import TasksList from './components/Tasks/TasksList';
import TaskModal from './components/Tasks/TaskModal';

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('work-organizer-tasks', []);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completedDates'>) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData }
          : task
      ));
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        completedDates: [],
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const handleToggleTask = (taskId: string, date: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const completedDates = [...task.completedDates];
        const dateIndex = completedDates.indexOf(date);
        
        if (dateIndex > -1) {
          completedDates.splice(dateIndex, 1);
        } else {
          completedDates.push(date);
        }
        
        return { ...task, completedDates };
      }
      return task;
    }));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard tasks={tasks} onToggleTask={handleToggleTask} />;
      case 'calendar':
        return (
          <CalendarView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onCreateTask={handleCreateTask}
          />
        );
      case 'tasks':
        return (
          <TasksList
            tasks={tasks}
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
          />
        );
      default:
        return <Dashboard tasks={tasks} onToggleTask={handleToggleTask} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        existingTasks={tasks}
      />
    </div>
  );
}

export default App;