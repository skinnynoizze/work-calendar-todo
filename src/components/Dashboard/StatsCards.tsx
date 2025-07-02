import { CheckCircle, Target, Headphones, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  taskStats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  ticketStats: {
    total: number;
    activeTickets: number;
    byPriority: {
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
  };
}

export default function StatsCards({ taskStats, ticketStats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Tareas Hoy',
      value: taskStats.total,
      icon: Target,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Tareas Completadas',
      value: taskStats.completed,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Tickets Activos',
      value: ticketStats.activeTickets,
      icon: Headphones,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Tickets Urgentes',
      value: ticketStats.byPriority.urgent,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}