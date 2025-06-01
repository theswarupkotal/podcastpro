import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const CalendarPage: React.FC = () => {
  return (
    <div className="pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">
          Schedule and manage your podcast sessions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Calendar Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          Calendar integration will be available in the next update
        </p>
      </div>
    </div>
  );
};

export default CalendarPage;