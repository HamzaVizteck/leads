import React from 'react';
import { Lead } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  leads: Lead[];
};

export const CalendarView: React.FC<Props> = ({ leads }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const leadsByDate = leads.reduce((acc, lead) => {
    const date = new Date(lead.lastContact);
    const dateKey = date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {previousMonthDays.map((_, index) => (
          <div key={`prev-${index}`} className="bg-white p-2 h-32" />
        ))}
        
        {days.map((day) => {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const dateKey = date.toISOString().split('T')[0];
          const dayLeads = leadsByDate[dateKey] || [];

          return (
            <div key={day} className="bg-white p-2 h-32 overflow-y-auto">
              <div className="text-sm font-medium text-gray-500 mb-1">{day}</div>
              {dayLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="text-xs p-1 mb-1 rounded bg-indigo-50 text-indigo-700"
                >
                  {lead.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};