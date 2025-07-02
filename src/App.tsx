import { useState } from 'react';
import { ViewMode } from './types';
import { useTasksUI } from './hooks/useTasksUI';
import { useTicketsUI } from './hooks/useTicketsUI';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import CalendarView from './components/Calendar/CalendarView';
import TasksList from './components/Tasks/TasksList';
import TaskModal from './components/Tasks/TaskModal';
import TicketsList from './components/Tickets/TicketsList';
import TicketModal from './components/Tickets/TicketModal';

/**
 * App principal - solo maneja routing y layout
 * 
 * Arquitectura con hooks UI:
 * - useTasksUI() encapsula toda la lógica CRUD de tasks
 * - useTicketsUI() encapsula toda la lógica CRUD de tickets  
 * - App.tsx se enfoca únicamente en routing y estructura de layout
 * 
 * Patrón: Separación de datos (useSupabase*) vs UI (use*UI)
 */
function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  // UI hooks que encapsulan toda la lógica CRUD
  const tasksUI = useTasksUI();
  const ticketsUI = useTicketsUI();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={tasksUI.tasks} 
            tickets={ticketsUI.tickets} 
            onToggleTask={tasksUI.handleToggleTask} 
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={tasksUI.tasks}
            onToggleTask={tasksUI.handleToggleTask}
            onCreateTask={tasksUI.handleCreateTask}
          />
        );
      case 'tasks':
        return (
          <TasksList
            tasks={tasksUI.tasks}
            onCreateTask={tasksUI.handleCreateTask}
            onEditTask={tasksUI.handleEditTask}
            onDeleteTask={tasksUI.handleDeleteTask}
            onToggleTask={tasksUI.handleToggleTask}
          />
        );
      case 'tickets':
        return (
          <TicketsList
            tickets={ticketsUI.tickets}
            onCreateTicket={ticketsUI.handleCreateTicket}
            onEditTicket={ticketsUI.handleEditTicket}
            onDeleteTicket={ticketsUI.handleDeleteTicket}
          />
        );
      default:
        return (
          <Dashboard 
            tasks={tasksUI.tasks} 
            tickets={ticketsUI.tickets} 
            onToggleTask={tasksUI.handleToggleTask} 
          />
        );
    }
  };

  // Loading state
  if (tasksUI.loading || ticketsUI.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tasksUI.error || ticketsUI.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de conexión</h2>
          <p className="text-gray-600 mb-4">{tasksUI.error || ticketsUI.error}</p>
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

  // Main app layout
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={tasksUI.isTaskModalOpen}
        onClose={tasksUI.closeTaskModal}
        onSave={tasksUI.handleSaveTask}
        editingTask={tasksUI.editingTask}
        existingTasks={tasksUI.tasks}
      />

      <TicketModal
        isOpen={ticketsUI.isTicketModalOpen}
        onClose={ticketsUI.closeTicketModal}
        onSave={ticketsUI.handleSaveTicket}
        editingTicket={ticketsUI.editingTicket}
        existingTickets={ticketsUI.tickets}
      />
    </div>
  );
}

export default App;