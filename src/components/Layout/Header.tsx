import { Calendar, CheckSquare, BarChart3, Headphones, LogOut } from 'lucide-react';
import { ViewMode } from '../../types';
import { supabase } from '../../utils/supabase';
import logoCompact from '../../assets/images/cruz-roja-rectangular.jpg';
import logoMini from '../../assets/images/solocruz.jpg';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar' as ViewMode, label: 'Calendario', icon: Calendar },
    { id: 'tasks' as ViewMode, label: 'Tareas', icon: CheckSquare },
    { id: 'tickets' as ViewMode, label: 'Tickets', icon: Headphones },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            {/* Logo Desktop - Rectangular completo */}
            <div className="hidden lg:flex h-11 rounded-lg items-center justify-center overflow-hidden bg-white border border-gray-200 px-2">
              <img 
                src={logoCompact} 
                alt="Cruz Roja - Centro Comunitario de Sangre y Tejidos de Asturias" 
                className="h-full w-auto object-contain"
              />
            </div>
            
            {/* Logo Tablet & Mobile - Solo cruz */}
            <div className="flex lg:hidden h-10 w-10 rounded-lg items-center justify-center overflow-hidden bg-white border border-gray-200">
              <img 
                src={logoMini} 
                alt="Cruz Roja" 
                className="h-full w-full object-contain"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Texto Desktop */}
              <div className="hidden lg:block">
                <h1 className="text-lg font-bold text-gray-900">Organizador CCSTA</h1>
                <p className="text-xs text-gray-600">Sistema de tareas para informáticos</p>
              </div>
              
              {/* Texto Tablet */}
              <div className="hidden sm:block lg:hidden">
                <h1 className="text-base font-bold text-gray-900">Organizador CCSTA</h1>
                <p className="text-xs text-gray-600">Sistema interno</p>
              </div>
              
              {/* Texto Mobile */}
              <div className="block sm:hidden">
                <h1 className="text-sm font-bold text-gray-900">Organizador CCSTA</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-gray-600 hover:text-red-600 hover:bg-red-50"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}