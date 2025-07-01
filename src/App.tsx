import { useState } from 'react';
import { Task, ViewMode } from './types';
import { useSupabaseTasks } from './hooks/useSupabaseTasks';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import CalendarView from './components/Calendar/CalendarView';
import TasksList from './components/Tasks/TasksList';
import TaskModal from './components/Tasks/TaskModal';
import { logError } from './utils/errorUtils';

function App() {
  const { 
    tasks, 
    loading, 
    error, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion 
  } = useSupabaseTasks();
  
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

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completedDates'>) => {
    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, taskData);
      } else {
        // Create new task - Supabase will generate the ID automatically
        const newTask = {
          ...taskData,
          id: crypto.randomUUID(), // Generate client-side UUID
          createdAt: new Date().toISOString(),
          completedDates: [],
        };
        await addTask(newTask);
      }
      setIsTaskModalOpen(false);
    } catch (error) {
      logError(error, { operation: 'save-task-ui', metadata: { isEdit: !!editingTask } });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        logError(error, { operation: 'delete-task-ui', taskId });
      }
    }
  };

  const handleToggleTask = async (taskId: string, date: string) => {
    try {
      await toggleTaskCompletion(taskId, date);
    } catch (error) {
      logError(error, { operation: 'toggle-task-ui', taskId, metadata: { date } });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de conexión</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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