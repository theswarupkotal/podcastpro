import React from 'react';
import { Calendar } from 'lucide-react';

const ScheduledPage: React.FC = () => {
  return (
    <div className="pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Sessions</h1>
        <p className="text-gray-600 mt-1">
          View and manage your upcoming podcast sessions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Scheduled Sessions</h2>
        <p className="text-gray-600 mb-4">
          Plan your next podcast by scheduling a new session
        </p>
      </div>
    </div>
  );
};

export default ScheduledPage;