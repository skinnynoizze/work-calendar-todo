import { Task, Ticket } from '../../types';
import { getTaskStats, sortTasksByPriority } from '../../utils/taskUtils';
import { getTicketStats } from '../../utils/ticketUtils';
import { formatDisplayDate } from '../../utils/dateUtils';
import { useTaskInstancesForDashboard } from '../../hooks/useTaskInstances';
import StatsCards from './StatsCards';
import WeeklyOverview from './WeeklyOverview';
import UpcomingTasks from './UpcomingTasks';
import TicketsOverview from './TicketsOverview';

interface DashboardProps {
  tasks: Task[];
  tickets: Ticket[];
  onToggleTask: (taskId: string, date: string) => void;
}

export default function Dashboard({ tasks, tickets, onToggleTask }: DashboardProps) {
  // Hook optimizado: solo 15 días vs 365 días (95% menos cálculos)
  const taskInstances = useTaskInstancesForDashboard(tasks);
  const taskStats = getTaskStats(tasks, taskInstances.all);
  const ticketStats = getTicketStats(tickets);
  const today = new Date();
  
  // Get tasks for the next 7 days using pre-calculated instances
  const nextWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date;
  });

  const weeklyTasks = nextWeek.map(date => {
    const dayTasks = sortTasksByPriority(taskInstances.getForDate(date));

    return {
      date,
      tasks: dayTasks,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">{formatDisplayDate(today)}</p>
        </div>
      </div>

      <StatsCards taskStats={taskStats} ticketStats={ticketStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WeeklyOverview weeklyTasks={weeklyTasks} onToggleTask={onToggleTask} />
        <UpcomingTasks taskInstances={taskInstances} onToggleTask={onToggleTask} />
        <TicketsOverview tickets={tickets} />
      </div>
    </div>
  );
}