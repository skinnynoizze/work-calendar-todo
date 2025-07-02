import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { LOCALE_NAMES } from '../../utils/constants';

interface DatePickerProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({ currentDate, onDateChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { monthNames } = LOCALE_NAMES;
  const currentYear = new Date().getFullYear();
  
  // Generar rango de años (5 años atrás, 10 años adelante)
  const yearRange = Array.from(
    { length: 16 }, 
    (_, i) => currentYear - 5 + i
  );

  // Cerrar dropdown al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  // Sincronizar con prop cuando cambia externamente
  useEffect(() => {
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth());
  }, [currentDate]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const newDate = new Date(year, selectedMonth, 1);
    onDateChange(newDate);
    setIsOpen(false);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    const newDate = new Date(selectedYear, month, 1);
    onDateChange(newDate);
    setIsOpen(false);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    const newDate = new Date(newYear, selectedMonth, 1);
    onDateChange(newDate);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <span className="font-medium text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-[280px] sm:min-w-[320px]">
          {/* Year Selection */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Año</h4>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => navigateYear('prev')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  disabled={selectedYear <= yearRange[0]}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-900 min-w-[4rem] text-center">
                  {selectedYear}
                </span>
                <button
                  onClick={() => navigateYear('next')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  disabled={selectedYear >= yearRange[yearRange.length - 1]}
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-1 max-h-24 overflow-y-auto">
              {yearRange.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    year === selectedYear
                      ? 'bg-blue-500 text-white'
                      : year === currentYear
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Month Selection */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Mes</h4>
            <div className="grid grid-cols-3 gap-1">
              {monthNames.map((month, index) => {
                const isCurrentMonth = new Date().getMonth() === index && 
                                     new Date().getFullYear() === selectedYear;
                return (
                  <button
                    key={month}
                    onClick={() => handleMonthChange(index)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      index === selectedMonth
                        ? 'bg-blue-500 text-white'
                        : isCurrentMonth
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {month.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                const today = new Date();
                setSelectedYear(today.getFullYear());
                setSelectedMonth(today.getMonth());
                onDateChange(new Date(today.getFullYear(), today.getMonth(), 1));
                setIsOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Ir a Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 